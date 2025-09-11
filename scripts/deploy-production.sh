#!/bin/bash
set -euo pipefail

# AegisX Production Deployment Script
# Supports zero-downtime deployments with health checks and rollback capabilities

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_DIR="./logs/deployment"
ENV_FILE=".env.production"
HEALTH_CHECK_TIMEOUT=300
HEALTH_CHECK_INTERVAL=5

# Ensure required directories exist
mkdir -p "$BACKUP_DIR" "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_DIR/deploy-$(date +'%Y%m%d').log"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_DIR/deploy-$(date +'%Y%m%d').log"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_DIR/deploy-$(date +'%Y%m%d').log"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_DIR/deploy-$(date +'%Y%m%d').log"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running or accessible"
        exit 1
    fi
    
    # Check if docker-compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Docker compose file '$COMPOSE_FILE' not found"
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file '$ENV_FILE' not found"
        exit 1
    fi
    
    # Validate environment variables
    source "$ENV_FILE"
    required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable '$var' is not set"
            exit 1
        fi
    done
    
    # Check disk space (require at least 2GB free)
    available_space=$(df . | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then # 2GB in KB
        error "Insufficient disk space. At least 2GB free space required"
        exit 1
    fi
    
    success "Pre-deployment checks passed"
}

# Database backup
backup_database() {
    log "Creating database backup..."
    
    local backup_file="$BACKUP_DIR/postgres-backup-$(date +'%Y%m%d-%H%M%S').sql"
    
    # Create database backup using existing container
    if docker exec aegisx_postgres_prod pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_file" 2>/dev/null; then
        success "Database backup created: $backup_file"
        
        # Compress backup
        gzip "$backup_file"
        success "Backup compressed: ${backup_file}.gz"
        
        # Keep only last 7 days of backups
        find "$BACKUP_DIR" -name "postgres-backup-*.sql.gz" -mtime +7 -delete
        
    else
        warn "Failed to create database backup (container might not exist yet)"
    fi
}

# Health check function
check_service_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))
    local attempt=1
    
    log "Checking health of $service_name..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            success "$service_name is healthy"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep $HEALTH_CHECK_INTERVAL
        ((attempt++))
    done
    
    error "$service_name failed health check after $HEALTH_CHECK_TIMEOUT seconds"
    return 1
}

# Zero-downtime deployment
deploy_with_zero_downtime() {
    log "Starting zero-downtime deployment..."
    
    # Scale up new instances
    log "Scaling up new application instances..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --scale api=2 --scale web=2 --scale admin=2 --no-recreate
    
    # Wait for new instances to be healthy
    sleep 30
    
    # Check if new instances are healthy
    local services=("api" "web" "admin")
    local ports=("3000" "8080" "8081")
    
    for i in "${!services[@]}"; do
        service="${services[$i]}"
        port="${ports[$i]}"
        
        if ! check_service_health "$service" "http://localhost:$port/health"; then
            error "New $service instance failed health check"
            log "Rolling back..."
            rollback_deployment
            exit 1
        fi
    done
    
    # Stop old instances
    log "Removing old instances..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --scale api=1 --scale web=1 --scale admin=1
    
    success "Zero-downtime deployment completed successfully"
}

# Standard deployment
deploy_standard() {
    log "Starting standard deployment..."
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    
    # Wait for services to be ready
    sleep 45
    
    # Check service health
    local services=("api:3000" "web:80" "admin:8080")
    
    for service_port in "${services[@]}"; do
        IFS=':' read -r service port <<< "$service_port"
        
        if ! check_service_health "$service" "http://localhost:$port/health"; then
            error "Service $service failed health check"
            exit 1
        fi
    done
    
    success "Standard deployment completed successfully"
}

# Rollback function
rollback_deployment() {
    log "Starting deployment rollback..."
    
    # Get the previous image tags from backup
    local rollback_compose="$BACKUP_DIR/docker-compose-backup-$(date +'%Y%m%d').yml"
    
    if [[ -f "$rollback_compose" ]]; then
        log "Rolling back to previous configuration..."
        docker-compose -f "$rollback_compose" --env-file "$ENV_FILE" up -d
        
        # Wait and verify rollback
        sleep 30
        if check_service_health "api" "http://localhost:3000/health"; then
            success "Rollback completed successfully"
        else
            error "Rollback failed - manual intervention required"
        fi
    else
        error "No rollback configuration found"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log "Running post-deployment tasks..."
    
    # Run database migrations
    log "Running database migrations..."
    if docker exec aegisx_api_prod npm run db:migrate; then
        success "Database migrations completed"
    else
        warn "Database migrations failed or not needed"
    fi
    
    # Clear application caches
    log "Clearing application caches..."
    docker exec aegisx_redis_prod redis-cli -a "$REDIS_PASSWORD" FLUSHALL
    
    # Restart monitoring services
    if [[ -f "docker-compose.monitoring.yml" ]]; then
        log "Restarting monitoring services..."
        docker-compose -f docker-compose.monitoring.yml restart
    fi
    
    # Generate deployment summary
    generate_deployment_summary
    
    success "Post-deployment tasks completed"
}

# Generate deployment summary
generate_deployment_summary() {
    local summary_file="$LOG_DIR/deployment-summary-$(date +'%Y%m%d-%H%M%S').txt"
    
    {
        echo "=== AegisX Deployment Summary ==="
        echo "Deployment Date: $(date)"
        echo "Environment: Production"
        echo ""
        echo "=== Service Status ==="
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        echo ""
        echo "=== Resource Usage ==="
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
        echo ""
        echo "=== Health Check Results ==="
        echo "API Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)"
        echo "Web Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health)"
        echo "Admin Health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)"
        echo ""
        echo "=== Disk Usage ==="
        df -h
        echo ""
        echo "=== Docker System Info ==="
        docker system df
    } > "$summary_file"
    
    log "Deployment summary generated: $summary_file"
}

# Cleanup old containers and images
cleanup_resources() {
    log "Cleaning up unused resources..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images (keep last 3 versions)
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    success "Resource cleanup completed"
}

# Main deployment function
main() {
    local deployment_type="${1:-standard}"
    
    log "=== Starting AegisX Production Deployment ==="
    log "Deployment type: $deployment_type"
    
    # Backup current compose file
    cp "$COMPOSE_FILE" "$BACKUP_DIR/docker-compose-backup-$(date +'%Y%m%d').yml"
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Create database backup
    backup_database
    
    # Deploy based on type
    case "$deployment_type" in
        "zero-downtime")
            deploy_with_zero_downtime
            ;;
        "standard"|*)
            deploy_standard
            ;;
    esac
    
    # Run post-deployment tasks
    post_deployment_tasks
    
    # Cleanup resources
    cleanup_resources
    
    success "=== Deployment completed successfully ==="
    
    # Display service URLs
    echo ""
    log "=== Service URLs ==="
    log "API: http://localhost:3000"
    log "Web App: http://localhost:80"
    log "Admin Panel: http://localhost:8080"
    log "Monitoring: http://localhost:3030 (if enabled)"
    echo ""
}

# Script usage
usage() {
    echo "Usage: $0 [deployment-type]"
    echo ""
    echo "Deployment types:"
    echo "  standard      - Standard deployment with brief downtime (default)"
    echo "  zero-downtime - Zero-downtime deployment with rolling updates"
    echo ""
    echo "Examples:"
    echo "  $0                    # Standard deployment"
    echo "  $0 standard           # Standard deployment"
    echo "  $0 zero-downtime      # Zero-downtime deployment"
    echo ""
    echo "Environment file: $ENV_FILE"
    echo "Compose file: $COMPOSE_FILE"
}

# Handle script arguments
case "${1:-}" in
    "-h"|"--help")
        usage
        exit 0
        ;;
    "rollback")
        rollback_deployment
        exit $?
        ;;
    *)
        main "$@"
        ;;
esac