#!/bin/bash
set -euo pipefail

# AegisX Backup and Restore Script
# Handles database backups, file backups, and restoration procedures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_BASE_DIR="./backups"
LOG_DIR="./logs/backup"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
BACKUP_TIMESTAMP=$(date +'%Y%m%d-%H%M%S')

# Backup directories
DB_BACKUP_DIR="$BACKUP_BASE_DIR/database"
FILES_BACKUP_DIR="$BACKUP_BASE_DIR/files"
CONFIG_BACKUP_DIR="$BACKUP_BASE_DIR/config"

# Ensure directories exist
mkdir -p "$BACKUP_BASE_DIR" "$DB_BACKUP_DIR" "$FILES_BACKUP_DIR" "$CONFIG_BACKUP_DIR" "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_DIR/backup-$(date +'%Y%m%d').log"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_DIR/backup-$(date +'%Y%m%d').log"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_DIR/backup-$(date +'%Y%m%d').log"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_DIR/backup-$(date +'%Y%m%d').log"
}

# Load environment variables
load_environment() {
    if [[ -f "$ENV_FILE" ]]; then
        source "$ENV_FILE"
        log "Environment loaded from $ENV_FILE"
    else
        error "Environment file $ENV_FILE not found"
        exit 1
    fi
}

# Check if containers are running
check_containers() {
    local required_containers=("aegisx_postgres_prod" "aegisx_redis_prod")
    
    for container in "${required_containers[@]}"; do
        if ! docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
            error "Container $container is not running"
            return 1
        fi
    done
    
    return 0
}

# Create PostgreSQL database backup
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    local backup_file="$DB_BACKUP_DIR/postgres-${BACKUP_TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    # Create database dump
    if docker exec aegisx_postgres_prod pg_dump \
        -U "${POSTGRES_USER:-postgres}" \
        -h localhost \
        -p 5432 \
        --verbose \
        --clean \
        --no-acl \
        --no-owner \
        "${POSTGRES_DB:-aegisx_db}" > "$backup_file" 2>/dev/null; then
        
        # Compress the backup
        if gzip "$backup_file"; then
            local file_size=$(du -h "$compressed_file" | cut -f1)
            success "PostgreSQL backup completed: $compressed_file ($file_size)"
            
            # Verify backup integrity
            if zcat "$compressed_file" | head -20 | grep -q "PostgreSQL database dump"; then
                success "Backup integrity verified"
            else
                warn "Backup integrity check failed"
            fi
        else
            error "Failed to compress backup file"
            return 1
        fi
    else
        error "Failed to create PostgreSQL backup"
        return 1
    fi
}

# Create Redis backup
backup_redis() {
    log "Starting Redis backup..."
    
    local backup_file="$DB_BACKUP_DIR/redis-${BACKUP_TIMESTAMP}.rdb"
    
    # Trigger Redis save
    if docker exec aegisx_redis_prod redis-cli -a "${REDIS_PASSWORD}" BGSAVE; then
        # Wait for background save to complete
        log "Waiting for Redis background save to complete..."
        
        local max_wait=60
        local waited=0
        
        while [[ $waited -lt $max_wait ]]; do
            local last_save=$(docker exec aegisx_redis_prod redis-cli -a "${REDIS_PASSWORD}" --no-auth-warning LASTSAVE)
            sleep 2
            local current_save=$(docker exec aegisx_redis_prod redis-cli -a "${REDIS_PASSWORD}" --no-auth-warning LASTSAVE)
            
            if [[ "$last_save" != "$current_save" ]]; then
                break
            fi
            
            waited=$((waited + 2))
        done
        
        # Copy RDB file from container
        if docker cp aegisx_redis_prod:/data/dump.rdb "$backup_file"; then
            # Compress the backup
            if gzip "$backup_file"; then
                local file_size=$(du -h "${backup_file}.gz" | cut -f1)
                success "Redis backup completed: ${backup_file}.gz ($file_size)"
            else
                warn "Failed to compress Redis backup"
            fi
        else
            error "Failed to copy Redis backup file"
            return 1
        fi
    else
        error "Failed to trigger Redis backup"
        return 1
    fi
}

# Backup uploaded files and logs
backup_files() {
    log "Starting files backup..."
    
    local files_backup="$FILES_BACKUP_DIR/files-${BACKUP_TIMESTAMP}.tar.gz"
    local dirs_to_backup=(
        "./uploads"
        "./logs"
        "./data"
        "./cache"
    )
    
    # Create list of existing directories
    local existing_dirs=()
    for dir in "${dirs_to_backup[@]}"; do
        if [[ -d "$dir" ]]; then
            existing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#existing_dirs[@]} -gt 0 ]]; then
        if tar -czf "$files_backup" "${existing_dirs[@]}" 2>/dev/null; then
            local file_size=$(du -h "$files_backup" | cut -f1)
            success "Files backup completed: $files_backup ($file_size)"
        else
            error "Failed to create files backup"
            return 1
        fi
    else
        warn "No directories found to backup"
    fi
}

# Backup configuration files
backup_config() {
    log "Starting configuration backup..."
    
    local config_backup="$CONFIG_BACKUP_DIR/config-${BACKUP_TIMESTAMP}.tar.gz"
    local config_files=(
        "$COMPOSE_FILE"
        "$ENV_FILE"
        "docker-compose.monitoring.yml"
        "nginx/"
        "monitoring/"
        "scripts/"
        "knexfile.ts"
        "package.json"
        "nx.json"
        "tsconfig.base.json"
    )
    
    # Create list of existing files/directories
    local existing_configs=()
    for config in "${config_files[@]}"; do
        if [[ -e "$config" ]]; then
            existing_configs+=("$config")
        fi
    done
    
    if [[ ${#existing_configs[@]} -gt 0 ]]; then
        if tar -czf "$config_backup" "${existing_configs[@]}" 2>/dev/null; then
            local file_size=$(du -h "$config_backup" | cut -f1)
            success "Configuration backup completed: $config_backup ($file_size)"
        else
            error "Failed to create configuration backup"
            return 1
        fi
    else
        warn "No configuration files found to backup"
    fi
}

# Create full backup
create_full_backup() {
    log "=== Starting Full Backup ==="
    
    local backup_start_time=$(date +%s)
    
    # Check if containers are running
    if ! check_containers; then
        error "Required containers are not running"
        exit 1
    fi
    
    # Create backups
    backup_postgres
    backup_redis
    backup_files
    backup_config
    
    # Create backup manifest
    create_backup_manifest
    
    # Calculate backup duration
    local backup_end_time=$(date +%s)
    local backup_duration=$((backup_end_time - backup_start_time))
    
    success "=== Full Backup Completed in ${backup_duration} seconds ==="
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Display backup summary
    display_backup_summary
}

# Create backup manifest
create_backup_manifest() {
    local manifest_file="$BACKUP_BASE_DIR/backup-manifest-${BACKUP_TIMESTAMP}.json"
    
    cat > "$manifest_file" << EOF
{
    "timestamp": "${BACKUP_TIMESTAMP}",
    "date": "$(date -Iseconds)",
    "version": "1.0",
    "environment": "production",
    "backups": {
        "postgres": {
            "file": "database/postgres-${BACKUP_TIMESTAMP}.sql.gz",
            "size": "$(stat -f%z "$DB_BACKUP_DIR/postgres-${BACKUP_TIMESTAMP}.sql.gz" 2>/dev/null || echo "0")"
        },
        "redis": {
            "file": "database/redis-${BACKUP_TIMESTAMP}.rdb.gz",
            "size": "$(stat -f%z "$DB_BACKUP_DIR/redis-${BACKUP_TIMESTAMP}.rdb.gz" 2>/dev/null || echo "0")"
        },
        "files": {
            "file": "files/files-${BACKUP_TIMESTAMP}.tar.gz",
            "size": "$(stat -f%z "$FILES_BACKUP_DIR/files-${BACKUP_TIMESTAMP}.tar.gz" 2>/dev/null || echo "0")"
        },
        "config": {
            "file": "config/config-${BACKUP_TIMESTAMP}.tar.gz",
            "size": "$(stat -f%z "$CONFIG_BACKUP_DIR/config-${BACKUP_TIMESTAMP}.tar.gz" 2>/dev/null || echo "0")"
        }
    }
}
EOF
    
    success "Backup manifest created: $manifest_file"
}

# Restore PostgreSQL database
restore_postgres() {
    local backup_file=$1
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    log "Restoring PostgreSQL from: $backup_file"
    
    # Stop API service to prevent connections
    log "Stopping API service..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop api
    
    # Drop existing connections
    docker exec aegisx_postgres_prod psql -U "${POSTGRES_USER:-postgres}" -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '${POSTGRES_DB:-aegisx_db}' AND pid <> pg_backend_pid();
    " 2>/dev/null || true
    
    # Restore database
    if zcat "$backup_file" | docker exec -i aegisx_postgres_prod psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-aegisx_db}"; then
        success "PostgreSQL restore completed"
        
        # Restart API service
        log "Restarting API service..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" start api
        
        return 0
    else
        error "Failed to restore PostgreSQL database"
        
        # Restart API service even on failure
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" start api
        return 1
    fi
}

# Restore Redis database
restore_redis() {
    local backup_file=$1
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    log "Restoring Redis from: $backup_file"
    
    # Stop Redis service
    log "Stopping Redis service..."
    docker stop aegisx_redis_prod
    
    # Extract and copy RDB file
    local temp_rdb="/tmp/dump-restore.rdb"
    
    if zcat "$backup_file" > "$temp_rdb"; then
        if docker cp "$temp_rdb" aegisx_redis_prod:/data/dump.rdb; then
            # Start Redis service
            log "Starting Redis service..."
            docker start aegisx_redis_prod
            
            # Wait for Redis to be ready
            sleep 10
            
            if docker exec aegisx_redis_prod redis-cli -a "${REDIS_PASSWORD}" --no-auth-warning ping | grep -q "PONG"; then
                success "Redis restore completed"
                rm -f "$temp_rdb"
                return 0
            else
                error "Redis service failed to start after restore"
            fi
        else
            error "Failed to copy RDB file to container"
        fi
    else
        error "Failed to extract Redis backup file"
    fi
    
    rm -f "$temp_rdb"
    return 1
}

# Restore files
restore_files() {
    local backup_file=$1
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    log "Restoring files from: $backup_file"
    
    # Create backup of current files
    local current_backup="./current-files-backup-$(date +'%Y%m%d-%H%M%S').tar.gz"
    
    if tar -czf "$current_backup" uploads/ logs/ data/ cache/ 2>/dev/null; then
        log "Current files backed up to: $current_backup"
    fi
    
    # Extract backup
    if tar -xzf "$backup_file"; then
        success "Files restore completed"
        return 0
    else
        error "Failed to restore files"
        return 1
    fi
}

# List available backups
list_backups() {
    log "Available backups:"
    echo ""
    
    # Find all manifest files
    local manifests=($(find "$BACKUP_BASE_DIR" -name "backup-manifest-*.json" | sort -r))
    
    if [[ ${#manifests[@]} -eq 0 ]]; then
        warn "No backup manifests found"
        return
    fi
    
    printf "%-20s %-20s %-15s %-15s\n" "TIMESTAMP" "DATE" "POSTGRES" "REDIS"
    echo "------------------------------------------------------------------------"
    
    for manifest in "${manifests[@]}"; do
        local timestamp=$(basename "$manifest" .json | sed 's/backup-manifest-//')
        local date=$(grep '"date"' "$manifest" | cut -d'"' -f4 | cut -d'T' -f1)
        
        # Check if backup files exist
        local postgres_exists="❌"
        local redis_exists="❌"
        
        if [[ -f "$DB_BACKUP_DIR/postgres-${timestamp}.sql.gz" ]]; then
            postgres_exists="✅"
        fi
        
        if [[ -f "$DB_BACKUP_DIR/redis-${timestamp}.rdb.gz" ]]; then
            redis_exists="✅"
        fi
        
        printf "%-20s %-20s %-15s %-15s\n" "$timestamp" "$date" "$postgres_exists" "$redis_exists"
    done
    echo ""
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Clean up database backups
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$DB_BACKUP_DIR" -name "*.gz" -mtime +${RETENTION_DAYS} -print0)
    
    # Clean up file backups
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$FILES_BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -print0)
    
    # Clean up config backups
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$CONFIG_BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -print0)
    
    # Clean up manifests
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_BASE_DIR" -name "backup-manifest-*.json" -mtime +${RETENTION_DAYS} -print0)
    
    if [[ $deleted_count -gt 0 ]]; then
        success "Cleaned up $deleted_count old backup files"
    else
        log "No old backups to clean up"
    fi
}

# Display backup summary
display_backup_summary() {
    log "=== Backup Summary ==="
    
    echo "Backup Location: $BACKUP_BASE_DIR"
    echo ""
    
    # Database backups
    echo "Database Backups:"
    if [[ -f "$DB_BACKUP_DIR/postgres-${BACKUP_TIMESTAMP}.sql.gz" ]]; then
        local pg_size=$(du -h "$DB_BACKUP_DIR/postgres-${BACKUP_TIMESTAMP}.sql.gz" | cut -f1)
        echo "  PostgreSQL: $pg_size"
    fi
    
    if [[ -f "$DB_BACKUP_DIR/redis-${BACKUP_TIMESTAMP}.rdb.gz" ]]; then
        local redis_size=$(du -h "$DB_BACKUP_DIR/redis-${BACKUP_TIMESTAMP}.rdb.gz" | cut -f1)
        echo "  Redis: $redis_size"
    fi
    
    # Files backup
    if [[ -f "$FILES_BACKUP_DIR/files-${BACKUP_TIMESTAMP}.tar.gz" ]]; then
        local files_size=$(du -h "$FILES_BACKUP_DIR/files-${BACKUP_TIMESTAMP}.tar.gz" | cut -f1)
        echo "  Files: $files_size"
    fi
    
    # Config backup
    if [[ -f "$CONFIG_BACKUP_DIR/config-${BACKUP_TIMESTAMP}.tar.gz" ]]; then
        local config_size=$(du -h "$CONFIG_BACKUP_DIR/config-${BACKUP_TIMESTAMP}.tar.gz" | cut -f1)
        echo "  Configuration: $config_size"
    fi
    
    echo ""
    echo "Total backup space used: $(du -sh "$BACKUP_BASE_DIR" | cut -f1)"
    echo ""
}

# Script usage
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup              - Create full backup (default)"
    echo "  backup-db           - Backup databases only"
    echo "  backup-files        - Backup files only"
    echo "  backup-config       - Backup configuration only"
    echo "  restore [timestamp] - Restore from backup"
    echo "  restore-db [file]   - Restore database from specific file"
    echo "  list                - List available backups"
    echo "  cleanup             - Clean up old backups"
    echo ""
    echo "Environment variables:"
    echo "  RETENTION_DAYS      - Days to keep backups (default: 30)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Create full backup"
    echo "  $0 backup-db                # Backup databases only"
    echo "  $0 restore 20241201-143000  # Restore from specific backup"
    echo "  $0 list                     # List available backups"
}

# Main function
main() {
    local command="${1:-backup}"
    
    load_environment
    
    case "$command" in
        "backup")
            create_full_backup
            ;;
        "backup-db")
            log "Creating database backup..."
            check_containers
            backup_postgres
            backup_redis
            success "Database backup completed"
            ;;
        "backup-files")
            log "Creating files backup..."
            backup_files
            success "Files backup completed"
            ;;
        "backup-config")
            log "Creating configuration backup..."
            backup_config
            success "Configuration backup completed"
            ;;
        "restore")
            local timestamp=$2
            if [[ -z "$timestamp" ]]; then
                error "Please specify backup timestamp"
                list_backups
                exit 1
            fi
            
            log "Restoring from backup: $timestamp"
            
            # Restore components
            restore_postgres "$DB_BACKUP_DIR/postgres-${timestamp}.sql.gz"
            restore_redis "$DB_BACKUP_DIR/redis-${timestamp}.rdb.gz"
            restore_files "$FILES_BACKUP_DIR/files-${timestamp}.tar.gz"
            
            success "Restore completed"
            ;;
        "restore-db")
            local backup_file=$2
            if [[ -z "$backup_file" ]]; then
                error "Please specify backup file"
                exit 1
            fi
            
            if [[ "$backup_file" == *.sql.gz ]]; then
                restore_postgres "$backup_file"
            elif [[ "$backup_file" == *.rdb.gz ]]; then
                restore_redis "$backup_file"
            else
                error "Unsupported backup file format"
                exit 1
            fi
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "-h"|"--help")
            usage
            exit 0
            ;;
        *)
            echo "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"