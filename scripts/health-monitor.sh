#!/bin/bash
set -euo pipefail

# AegisX Production Health Monitoring Script
# Monitors service health and sends alerts when issues are detected

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
LOG_DIR="./logs/monitoring"
ALERT_LOG="$LOG_DIR/health-alerts.log"
STATUS_LOG="$LOG_DIR/health-status.log"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"
ALERT_THRESHOLD="${ALERT_THRESHOLD:-3}"
WEBHOOK_URL="${WEBHOOK_URL:-}"

# Service configurations
declare -A SERVICES=(
    ["api"]="http://localhost:3000/health"
    ["web"]="http://localhost:80/health"
    ["admin"]="http://localhost:8080/health"
    ["postgres"]="container:aegisx_postgres_prod"
    ["redis"]="container:aegisx_redis_prod"
)

# Alert counters
declare -A FAILURE_COUNTS
declare -A LAST_ALERT_TIME

# Ensure directories exist
mkdir -p "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$STATUS_LOG"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$ALERT_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$STATUS_LOG"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$ALERT_LOG"
}

# Initialize failure counts
init_counters() {
    for service in "${!SERVICES[@]}"; do
        FAILURE_COUNTS[$service]=0
        LAST_ALERT_TIME[$service]=0
    done
}

# Check HTTP endpoint health
check_http_health() {
    local service_name=$1
    local url=$2
    local timeout=10
    
    if curl -f -s --max-time $timeout "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check Docker container health
check_container_health() {
    local service_name=$1
    local container_name=$2
    
    local health_status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
    
    if [[ "$health_status" == "healthy" ]] || [[ "$health_status" == "unknown" ]]; then
        # If no health check defined, check if container is running
        if [[ "$health_status" == "unknown" ]]; then
            local container_status
            container_status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "not_found")
            if [[ "$container_status" == "running" ]]; then
                return 0
            else
                return 1
            fi
        fi
        return 0
    else
        return 1
    fi
}

# Check individual service health
check_service_health() {
    local service_name=$1
    local endpoint=${SERVICES[$service_name]}
    local is_healthy=false
    
    if [[ $endpoint == http* ]]; then
        if check_http_health "$service_name" "$endpoint"; then
            is_healthy=true
        fi
    elif [[ $endpoint == container:* ]]; then
        local container_name=${endpoint#container:}
        if check_container_health "$service_name" "$container_name"; then
            is_healthy=true
        fi
    fi
    
    if $is_healthy; then
        # Reset failure count on success
        FAILURE_COUNTS[$service_name]=0
        return 0
    else
        # Increment failure count
        ((FAILURE_COUNTS[$service_name]++))
        return 1
    fi
}

# Send webhook alert
send_webhook_alert() {
    local message=$1
    
    if [[ -n "$WEBHOOK_URL" ]]; then
        local payload="{\"text\":\"🚨 AegisX Alert: $message\", \"timestamp\":\"$(date -Iseconds)\"}"
        
        if curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$WEBHOOK_URL" > /dev/null; then
            log "Webhook alert sent successfully"
        else
            warn "Failed to send webhook alert"
        fi
    fi
}

# Send email alert (requires mailx)
send_email_alert() {
    local subject=$1
    local message=$2
    local recipient="${ALERT_EMAIL:-}"
    
    if [[ -n "$recipient" ]] && command -v mailx >/dev/null 2>&1; then
        echo "$message" | mailx -s "$subject" "$recipient"
        log "Email alert sent to $recipient"
    fi
}

# Handle service failure
handle_service_failure() {
    local service_name=$1
    local failure_count=${FAILURE_COUNTS[$service_name]}
    local current_time=$(date +%s)
    local last_alert=${LAST_ALERT_TIME[$service_name]}
    local alert_cooldown=900  # 15 minutes
    
    error "$service_name health check failed (failure count: $failure_count)"
    
    # Send alert if threshold reached and not in cooldown period
    if [[ $failure_count -ge $ALERT_THRESHOLD ]] && [[ $((current_time - last_alert)) -gt $alert_cooldown ]]; then
        local alert_message="Service '$service_name' has failed $failure_count consecutive health checks"
        
        error "ALERT: $alert_message"
        
        # Send notifications
        send_webhook_alert "$alert_message"
        send_email_alert "AegisX Service Alert" "$alert_message"
        
        # Update last alert time
        LAST_ALERT_TIME[$service_name]=$current_time
        
        # Attempt automatic recovery
        attempt_service_recovery "$service_name"
    fi
}

# Attempt automatic service recovery
attempt_service_recovery() {
    local service_name=$1
    
    log "Attempting automatic recovery for $service_name..."
    
    case "$service_name" in
        "api"|"web"|"admin")
            # Restart application service
            if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart "$service_name"; then
                success "Successfully restarted $service_name"
                sleep 30  # Wait for service to stabilize
            else
                error "Failed to restart $service_name"
            fi
            ;;
        "postgres"|"redis")
            # Restart database/cache service
            if docker restart "aegisx_${service_name}_prod"; then
                success "Successfully restarted $service_name"
                sleep 60  # Wait longer for database services
            else
                error "Failed to restart $service_name"
            fi
            ;;
    esac
}

# Generate health report
generate_health_report() {
    local report_file="$LOG_DIR/health-report-$(date +'%Y%m%d-%H%M%S').txt"
    
    {
        echo "=== AegisX Health Monitoring Report ==="
        echo "Generated: $(date)"
        echo ""
        
        echo "=== Service Health Status ==="
        for service in "${!SERVICES[@]}"; do
            local status="UNKNOWN"
            local failure_count=${FAILURE_COUNTS[$service]}
            
            if check_service_health "$service"; then
                status="HEALTHY"
            else
                status="UNHEALTHY"
            fi
            
            printf "%-10s: %-10s (Failures: %d)\n" "$service" "$status" "$failure_count"
        done
        echo ""
        
        echo "=== Container Status ==="
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        echo ""
        
        echo "=== System Resources ==="
        echo "Memory Usage:"
        free -h
        echo ""
        echo "Disk Usage:"
        df -h
        echo ""
        echo "CPU Usage:"
        top -bn1 | grep "Cpu(s)" || echo "CPU info unavailable"
        echo ""
        
        echo "=== Docker Stats ==="
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        echo ""
        
        echo "=== Recent Alerts ==="
        if [[ -f "$ALERT_LOG" ]]; then
            tail -20 "$ALERT_LOG" 2>/dev/null || echo "No recent alerts"
        else
            echo "No alerts file found"
        fi
        
    } > "$report_file"
    
    log "Health report generated: $report_file"
}

# Main monitoring loop
run_monitoring() {
    log "Starting AegisX health monitoring (interval: ${CHECK_INTERVAL}s)"
    
    init_counters
    
    while true; do
        local all_healthy=true
        
        # Check each service
        for service in "${!SERVICES[@]}"; do
            if check_service_health "$service"; then
                success "$service is healthy"
            else
                all_healthy=false
                handle_service_failure "$service"
            fi
        done
        
        # Log overall status
        if $all_healthy; then
            log "All services are healthy"
        else
            warn "Some services are experiencing issues"
        fi
        
        # Generate periodic reports (every hour)
        local current_minute=$(date +%M)
        if [[ "$current_minute" == "00" ]]; then
            generate_health_report
        fi
        
        # Clean old logs (keep last 7 days)
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        find "$LOG_DIR" -name "health-report-*.txt" -mtime +7 -delete 2>/dev/null || true
        
        sleep "$CHECK_INTERVAL"
    done
}

# Quick health check (one-time)
quick_health_check() {
    log "Running quick health check..."
    
    init_counters
    local all_healthy=true
    
    for service in "${!SERVICES[@]}"; do
        if check_service_health "$service"; then
            success "$service: HEALTHY"
        else
            error "$service: UNHEALTHY"
            all_healthy=false
        fi
    done
    
    if $all_healthy; then
        success "All services are healthy"
        exit 0
    else
        error "Some services are unhealthy"
        exit 1
    fi
}

# Display service status
show_status() {
    log "Current service status:"
    echo ""
    
    init_counters
    
    printf "%-15s %-12s %-15s %-20s\n" "SERVICE" "STATUS" "ENDPOINT/CONTAINER" "RESPONSE TIME"
    echo "--------------------------------------------------------------------"
    
    for service in "${!SERVICES[@]}"; do
        local endpoint=${SERVICES[$service]}
        local status="UNKNOWN"
        local response_time="N/A"
        
        if [[ $endpoint == http* ]]; then
            local start_time=$(date +%s%N)
            if check_http_health "$service" "$endpoint"; then
                local end_time=$(date +%s%N)
                response_time="$((($end_time - $start_time) / 1000000))ms"
                status="HEALTHY"
            else
                status="UNHEALTHY"
            fi
        elif [[ $endpoint == container:* ]]; then
            local container_name=${endpoint#container:}
            if check_container_health "$service" "$container_name"; then
                status="HEALTHY"
                response_time="Container running"
            else
                status="UNHEALTHY"
                response_time="Container issue"
            fi
        fi
        
        printf "%-15s %-12s %-15s %-20s\n" "$service" "$status" "${endpoint#container:}" "$response_time"
    done
    echo ""
}

# Script usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  monitor    - Start continuous health monitoring (default)"
    echo "  check      - Run a quick one-time health check"
    echo "  status     - Show current status of all services"
    echo "  report     - Generate and display health report"
    echo ""
    echo "Environment variables:"
    echo "  CHECK_INTERVAL     - Monitoring interval in seconds (default: 30)"
    echo "  ALERT_THRESHOLD    - Number of failures before alert (default: 3)"
    echo "  WEBHOOK_URL        - Webhook URL for alerts"
    echo "  ALERT_EMAIL        - Email address for alerts"
    echo ""
    echo "Examples:"
    echo "  $0                      # Start continuous monitoring"
    echo "  $0 check                # Quick health check"
    echo "  $0 status               # Show current status"
    echo "  CHECK_INTERVAL=60 $0    # Monitor every 60 seconds"
}

# Main function
main() {
    local command="${1:-monitor}"
    
    # Load environment if exists
    if [[ -f "$ENV_FILE" ]]; then
        source "$ENV_FILE"
    fi
    
    case "$command" in
        "monitor")
            run_monitoring
            ;;
        "check")
            quick_health_check
            ;;
        "status")
            show_status
            ;;
        "report")
            generate_health_report
            cat "$LOG_DIR/health-report-$(date +'%Y%m%d')-"*.txt | tail -1
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

# Handle script interruption
trap 'log "Health monitoring stopped"; exit 0' SIGINT SIGTERM

# Run main function
main "$@"