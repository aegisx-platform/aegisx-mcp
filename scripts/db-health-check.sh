#!/bin/bash
set -euo pipefail

# AegisX Production Database Health Check Script
# Monitors database health, performance, and migration status

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly LOG_DIR="$PROJECT_ROOT/logs"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Load environment variables
load_environment() {
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        source "$PROJECT_ROOT/.env.production"
    else
        error "Production environment file not found: .env.production"
        exit 1
    fi
}

# Basic connectivity check
check_connectivity() {
    log "Checking database connectivity..."
    
    if timeout 10 PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1; then
        success "Database connection established"
        return 0
    else
        error "Failed to connect to database"
        return 1
    fi
}

# Check database size and usage
check_database_stats() {
    log "Checking database statistics..."
    
    local stats_query="
    SELECT 
        pg_size_pretty(pg_database_size('$POSTGRES_DB')) as database_size,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB') as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections;
    "
    
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$stats_query"
}

# Check table statistics
check_table_stats() {
    log "Checking table statistics..."
    
    local table_stats_query="
    SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_stat_user_tables 
    ORDER BY n_live_tup DESC 
    LIMIT 10;
    "
    
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$table_stats_query"
}

# Check migration status
check_migration_status() {
    log "Checking migration status..."
    
    cd "$PROJECT_ROOT"
    
    # Check if migrations table exists
    local migration_check="
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'knex_migrations'
    );
    "
    
    local table_exists=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "$migration_check" | xargs)
    
    if [[ "$table_exists" == "t" ]]; then
        log "Latest applied migrations:"
        local latest_migrations="
        SELECT id, name, migration_time 
        FROM knex_migrations 
        ORDER BY migration_time DESC 
        LIMIT 5;
        "
        
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$latest_migrations"
        
        # Check for pending migrations
        if command -v npx > /dev/null && [[ -f "$PROJECT_ROOT/knexfile.ts" ]]; then
            log "Checking for pending migrations..."
            NODE_ENV=production npx knex migrate:status
        fi
    else
        warn "Migrations table does not exist - database may not be initialized"
    fi
}

# Check index usage and performance
check_index_performance() {
    log "Checking index usage and performance..."
    
    local index_usage_query="
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes 
    WHERE idx_scan = 0 
    AND pg_relation_size(indexrelid) > 1024*1024  -- Larger than 1MB
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 10;
    "
    
    echo "Unused indexes (larger than 1MB):"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$index_usage_query"
    
    # Most used indexes
    local most_used_indexes="
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
    FROM pg_stat_user_indexes 
    WHERE idx_scan > 0
    ORDER BY idx_scan DESC
    LIMIT 10;
    "
    
    echo
    echo "Most used indexes:"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$most_used_indexes"
}

# Check slow queries
check_slow_queries() {
    log "Checking for slow queries (if pg_stat_statements is enabled)..."
    
    local slow_queries_check="
    SELECT EXISTS (
        SELECT FROM pg_extension 
        WHERE extname = 'pg_stat_statements'
    );
    "
    
    local extension_exists=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "$slow_queries_check" | xargs)
    
    if [[ "$extension_exists" == "t" ]]; then
        local slow_queries="
        SELECT 
            query,
            calls,
            total_time,
            mean_time,
            stddev_time,
            rows
        FROM pg_stat_statements 
        WHERE mean_time > 1000  -- queries taking more than 1 second on average
        ORDER BY mean_time DESC 
        LIMIT 10;
        "
        
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$slow_queries"
    else
        warn "pg_stat_statements extension not enabled - cannot check slow queries"
    fi
}

# Check locks and blocking queries
check_locks() {
    log "Checking for locks and blocking queries..."
    
    local blocking_queries="
    SELECT 
        blocked_locks.pid AS blocked_pid,
        blocked_activity.usename AS blocked_user,
        blocking_locks.pid AS blocking_pid,
        blocking_activity.usename AS blocking_user,
        blocked_activity.query AS blocked_statement,
        blocking_activity.query AS current_statement_in_blocking_process
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks 
        ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
    WHERE NOT blocked_locks.GRANTED;
    "
    
    local lock_result=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "$blocking_queries")
    
    if [[ -n "$lock_result" && "$lock_result" != "" ]]; then
        warn "Blocking queries detected:"
        echo "$lock_result"
    else
        success "No blocking queries detected"
    fi
}

# Check backup status (if backup files exist)
check_backup_status() {
    log "Checking backup status..."
    
    local backup_dir="$PROJECT_ROOT/backups/database"
    
    if [[ -d "$backup_dir" ]]; then
        local latest_backup=$(find "$backup_dir" -name "*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [[ -n "$latest_backup" ]]; then
            local backup_age=$(stat -c %Y "$latest_backup" 2>/dev/null || echo "0")
            local current_time=$(date +%s)
            local hours_old=$(( (current_time - backup_age) / 3600 ))
            
            if [[ $hours_old -lt 24 ]]; then
                success "Latest backup: $(basename "$latest_backup") ($hours_old hours old)"
            else
                warn "Latest backup is $hours_old hours old: $(basename "$latest_backup")"
            fi
        else
            warn "No backups found in $backup_dir"
        fi
    else
        warn "Backup directory does not exist: $backup_dir"
    fi
}

# Check critical tables exist and have data
check_critical_tables() {
    log "Checking critical tables..."
    
    local critical_tables=("users" "roles" "permissions" "sessions" "navigation_items")
    local table_issues=0
    
    for table in "${critical_tables[@]}"; do
        local table_check="
        SELECT 
            EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table') as exists,
            CASE 
                WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table') 
                THEN (SELECT count(*) FROM $table)::text 
                ELSE '0' 
            END as row_count;
        "
        
        local result=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "$table_check" 2>/dev/null)
        
        if [[ -n "$result" ]]; then
            local exists=$(echo "$result" | awk '{print $1}' | xargs)
            local count=$(echo "$result" | awk '{print $2}' | xargs)
            
            if [[ "$exists" == "t" ]]; then
                if [[ "$count" -gt 0 ]]; then
                    success "$table: exists with $count rows"
                else
                    warn "$table: exists but has no data"
                    ((table_issues++))
                fi
            else
                error "$table: table does not exist"
                ((table_issues++))
            fi
        else
            error "$table: unable to check table status"
            ((table_issues++))
        fi
    done
    
    if [[ $table_issues -eq 0 ]]; then
        success "All critical tables are present and have data"
    else
        warn "$table_issues critical table issue(s) detected"
    fi
}

# Generate health report
generate_health_report() {
    local report_file="$LOG_DIR/db_health_$(date +%Y%m%d_%H%M%S).json"
    
    log "Generating health report: $report_file"
    
    # Create basic health report
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "database": "$POSTGRES_DB",
    "host": "$POSTGRES_HOST:$POSTGRES_PORT",
    "health_checks": {
        "connectivity": "$(check_connectivity > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")",
        "migrations": "checked",
        "tables": "checked",
        "backups": "checked"
    },
    "generated_by": "db-health-check.sh"
}
EOF
    
    success "Health report generated: $report_file"
}

# Show help
show_help() {
    cat << EOF
AegisX Production Database Health Check Script

Usage: $0 [command]

Commands:
    full                      Run all health checks
    connectivity              Check database connectivity only
    stats                     Show database statistics
    tables                    Show table statistics
    migrations               Check migration status
    indexes                  Check index performance
    slow-queries             Check for slow queries
    locks                    Check for blocking queries
    backups                  Check backup status
    critical                 Check critical tables
    report                   Generate health report
    -h, --help               Show this help message

Examples:
    $0                       # Run full health check
    $0 full                  # Run full health check
    $0 connectivity          # Check connectivity only
    $0 migrations            # Check migration status only

EOF
}

# Main function
main() {
    mkdir -p "$LOG_DIR"
    load_environment
    
    local command="${1:-full}"
    
    case "$command" in
        full|"")
            log "Starting full database health check..."
            check_connectivity
            check_database_stats
            check_table_stats
            check_migration_status
            check_index_performance
            check_slow_queries
            check_locks
            check_backup_status
            check_critical_tables
            generate_health_report
            success "Health check completed"
            ;;
        connectivity)
            check_connectivity
            ;;
        stats)
            check_connectivity && check_database_stats
            ;;
        tables)
            check_connectivity && check_table_stats
            ;;
        migrations)
            check_connectivity && check_migration_status
            ;;
        indexes)
            check_connectivity && check_index_performance
            ;;
        slow-queries)
            check_connectivity && check_slow_queries
            ;;
        locks)
            check_connectivity && check_locks
            ;;
        backups)
            check_backup_status
            ;;
        critical)
            check_connectivity && check_critical_tables
            ;;
        report)
            check_connectivity && generate_health_report
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"