#!/bin/bash
set -euo pipefail

# AegisX Production Database Migration Script
# Handles safe database migrations in production environment

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly BACKUP_DIR="$PROJECT_ROOT/backups/database"
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

# Ensure required directories exist
ensure_directories() {
    mkdir -p "$BACKUP_DIR" "$LOG_DIR"
}

# Check database connectivity
check_database_connection() {
    log "Checking database connection..."
    
    # Load production environment variables
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        source "$PROJECT_ROOT/.env.production"
    else
        error "Production environment file not found: .env.production"
        error "Run: ./scripts/env-manager.sh switch production"
        exit 1
    fi
    
    # Test database connection
    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null 2>&1; then
        error "Failed to connect to production database"
        error "Host: $POSTGRES_HOST:$POSTGRES_PORT"
        error "Database: $POSTGRES_DB"
        error "User: $POSTGRES_USER"
        exit 1
    fi
    
    success "Database connection verified"
}

# Create database backup
create_backup() {
    local backup_type="${1:-full}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/prod_backup_${backup_type}_${timestamp}.sql"
    
    log "Creating $backup_type database backup..."
    
    # Create backup based on type
    case "$backup_type" in
        full)
            PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
                -h "$POSTGRES_HOST" \
                -p "$POSTGRES_PORT" \
                -U "$POSTGRES_USER" \
                -d "$POSTGRES_DB" \
                --verbose \
                --no-owner \
                --no-privileges \
                --create \
                --clean \
                --if-exists \
                > "$backup_file"
            ;;
        schema)
            PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
                -h "$POSTGRES_HOST" \
                -p "$POSTGRES_PORT" \
                -U "$POSTGRES_USER" \
                -d "$POSTGRES_DB" \
                --schema-only \
                --verbose \
                --no-owner \
                --no-privileges \
                > "$backup_file"
            ;;
        data)
            PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
                -h "$POSTGRES_HOST" \
                -p "$POSTGRES_PORT" \
                -U "$POSTGRES_USER" \
                -d "$POSTGRES_DB" \
                --data-only \
                --verbose \
                --no-owner \
                --no-privileges \
                > "$backup_file"
            ;;
        *)
            error "Invalid backup type: $backup_type"
            exit 1
            ;;
    esac
    
    if [[ -f "$backup_file" && -s "$backup_file" ]]; then
        success "Backup created: $backup_file"
        echo "$backup_file"
    else
        error "Failed to create backup"
        exit 1
    fi
}

# Check pending migrations
check_pending_migrations() {
    log "Checking for pending migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Get current migration status
    local current_batch=$(NODE_ENV=production npx knex migrate:currentVersion 2>/dev/null || echo "0")
    local migration_list=$(NODE_ENV=production npx knex migrate:status 2>/dev/null || echo "")
    
    if echo "$migration_list" | grep -q "Not run"; then
        log "Pending migrations found:"
        echo "$migration_list" | grep "Not run" | while read -r line; do
            warn "  $line"
        done
        return 0
    else
        log "No pending migrations"
        return 1
    fi
}

# Validate migrations before applying
validate_migrations() {
    log "Validating migration files..."
    
    local validation_errors=0
    
    # Check for TypeScript compilation errors
    if ! cd "$PROJECT_ROOT" && npx tsc --noEmit --skipLibCheck; then
        error "TypeScript compilation errors in migration files"
        ((validation_errors++))
    fi
    
    # Check migration file naming convention
    for migration_file in "$PROJECT_ROOT/apps/api/src/database/migrations"/*.ts; do
        if [[ -f "$migration_file" ]]; then
            local filename=$(basename "$migration_file")
            if [[ ! "$filename" =~ ^[0-9]{3}_[a-z_]+\.ts$ ]]; then
                error "Invalid migration filename: $filename"
                error "Expected format: 001_description.ts"
                ((validation_errors++))
            fi
        fi
    done
    
    # Check for rollback functions
    for migration_file in "$PROJECT_ROOT/apps/api/src/database/migrations"/*.ts; do
        if [[ -f "$migration_file" ]]; then
            if ! grep -q "export.*down" "$migration_file"; then
                warn "Migration may not have rollback function: $(basename "$migration_file")"
            fi
        fi
    done
    
    if [[ $validation_errors -eq 0 ]]; then
        success "Migration validation passed"
        return 0
    else
        error "Migration validation failed with $validation_errors error(s)"
        return 1
    fi
}

# Apply migrations with safety checks
apply_migrations() {
    local dry_run="${1:-false}"
    
    if [[ "$dry_run" == "true" ]]; then
        log "DRY RUN: Simulating migration application..."
        # In a real scenario, this would show what migrations would be applied
        NODE_ENV=production npx knex migrate:status
        return 0
    fi
    
    log "Applying database migrations..."
    
    # Create backup before migration
    local backup_file=$(create_backup "full")
    
    # Apply migrations with logging
    local log_file="$LOG_DIR/migration_$(date +%Y%m%d_%H%M%S).log"
    
    if NODE_ENV=production npx knex migrate:latest 2>&1 | tee "$log_file"; then
        success "Migrations applied successfully"
        log "Migration log: $log_file"
        
        # Verify database integrity after migration
        verify_database_integrity
        
        return 0
    else
        error "Migration failed! Check log: $log_file"
        error "Database backup available at: $backup_file"
        
        # Prompt for rollback
        read -p "Do you want to rollback to the backup? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            restore_backup "$backup_file"
        fi
        
        return 1
    fi
}

# Verify database integrity after migration
verify_database_integrity() {
    log "Verifying database integrity..."
    
    local integrity_errors=0
    
    # Check for foreign key constraint violations
    if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
        DO \$\$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN (
                SELECT conname, conrelid::regclass, confrelid::regclass
                FROM pg_constraint
                WHERE contype = 'f'
            ) LOOP
                BEGIN
                    EXECUTE 'ALTER TABLE ' || r.conrelid || ' VALIDATE CONSTRAINT ' || r.conname;
                EXCEPTION
                    WHEN others THEN
                        RAISE WARNING 'Foreign key constraint violation: %', r.conname;
                END;
            END LOOP;
        END \$\$;
    " > /dev/null 2>&1; then
        error "Foreign key constraint violations found"
        ((integrity_errors++))
    fi
    
    # Check table existence and basic structure
    local required_tables=("users" "roles" "permissions" "sessions" "navigation_items")
    for table in "${required_tables[@]}"; do
        if ! PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
            error "Required table missing or inaccessible: $table"
            ((integrity_errors++))
        fi
    done
    
    if [[ $integrity_errors -eq 0 ]]; then
        success "Database integrity verification passed"
        return 0
    else
        error "Database integrity verification failed with $integrity_errors error(s)"
        return 1
    fi
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    warn "Restoring database from backup: $backup_file"
    warn "This will overwrite the current database!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled"
        return 0
    fi
    
    log "Restoring database..."
    
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$backup_file"; then
        success "Database restored successfully"
    else
        error "Database restore failed"
        exit 1
    fi
}

# Rollback migrations
rollback_migrations() {
    local steps="${1:-1}"
    
    warn "Rolling back $steps migration(s)"
    warn "This operation cannot be undone!"
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rollback cancelled"
        return 0
    fi
    
    # Create backup before rollback
    local backup_file=$(create_backup "full")
    
    log "Rolling back migrations..."
    
    if NODE_ENV=production npx knex migrate:rollback --all="$steps"; then
        success "Rollback completed successfully"
        log "Backup created before rollback: $backup_file"
    else
        error "Rollback failed"
        error "Database backup available at: $backup_file"
        exit 1
    fi
}

# Show migration status
show_status() {
    log "Current migration status:"
    
    cd "$PROJECT_ROOT"
    
    echo "Current batch:"
    NODE_ENV=production npx knex migrate:currentVersion || echo "No migrations applied"
    
    echo
    echo "Migration status:"
    NODE_ENV=production npx knex migrate:status || echo "Unable to get migration status"
    
    echo
    echo "Available backups:"
    if [[ -d "$BACKUP_DIR" ]] && [[ $(ls -A "$BACKUP_DIR" 2>/dev/null) ]]; then
        ls -la "$BACKUP_DIR"/*.sql 2>/dev/null | tail -5
    else
        echo "No backups found"
    fi
}

# Show help
show_help() {
    cat << EOF
AegisX Production Database Migration Script

Usage: $0 <command> [options]

Commands:
    migrate [--dry-run]        Apply pending migrations (with optional dry run)
    rollback [steps]           Rollback migrations (default: 1 step)
    backup [type]              Create database backup (full|schema|data, default: full)
    restore <backup_file>      Restore from backup file
    status                     Show current migration status
    validate                   Validate migration files
    verify                     Verify database integrity

Options:
    --dry-run                  Show what would be done without executing
    -h, --help                 Show this help message

Examples:
    $0 migrate --dry-run       # Show pending migrations
    $0 migrate                 # Apply all pending migrations
    $0 backup full             # Create full database backup
    $0 rollback 2              # Rollback last 2 migrations
    $0 restore backup.sql      # Restore from specific backup

Safety Features:
- Automatic backups before migrations
- Database integrity checks
- Confirmation prompts for destructive operations
- Detailed logging
- Rollback capabilities

EOF
}

# Main function
main() {
    ensure_directories
    
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        migrate)
            check_database_connection
            if ! validate_migrations; then
                error "Migration validation failed. Aborting."
                exit 1
            fi
            
            local dry_run="false"
            if [[ "${1:-}" == "--dry-run" ]]; then
                dry_run="true"
            fi
            
            if check_pending_migrations; then
                apply_migrations "$dry_run"
            else
                success "Database is up to date"
            fi
            ;;
        rollback)
            check_database_connection
            rollback_migrations "${1:-1}"
            ;;
        backup)
            check_database_connection
            create_backup "${1:-full}"
            ;;
        restore)
            [[ $# -eq 0 ]] && { error "Backup file required"; exit 1; }
            check_database_connection
            restore_backup "$1"
            ;;
        status)
            check_database_connection
            show_status
            ;;
        validate)
            validate_migrations
            ;;
        verify)
            check_database_connection
            verify_database_integrity
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