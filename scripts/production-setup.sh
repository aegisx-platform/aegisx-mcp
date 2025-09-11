#!/bin/bash
set -euo pipefail

# AegisX Production Setup Script
# One-time setup script for production deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
BASE_DIR="/opt/aegisx"
LOG_DIR="./logs/setup"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_DIR/setup-$(date +'%Y%m%d').log"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_DIR/setup-$(date +'%Y%m%d').log"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_DIR/setup-$(date +'%Y%m%d').log"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_DIR/setup-$(date +'%Y%m%d').log"
}

# Check if running as root for system-level changes
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "Running as root - system-level configuration will be applied"
        return 0
    else
        warn "Not running as root - some system configurations will be skipped"
        return 1
    fi
}

# Install required system packages
install_system_packages() {
    log "Installing required system packages..."
    
    if command -v apt-get >/dev/null 2>&1; then
        # Ubuntu/Debian
        apt-get update
        apt-get install -y \
            docker.io \
            docker-compose \
            wget \
            curl \
            htop \
            fail2ban \
            ufw \
            logrotate \
            cron \
            mailutils \
            gpg \
            openssl
        
        # Start and enable services
        systemctl start docker
        systemctl enable docker
        systemctl start fail2ban
        systemctl enable fail2ban
        
    elif command -v yum >/dev/null 2>&1; then
        # CentOS/RHEL
        yum update -y
        yum install -y \
            docker \
            docker-compose \
            wget \
            curl \
            htop \
            fail2ban \
            firewalld \
            logrotate \
            cronie \
            mailx \
            gnupg2 \
            openssl
            
        systemctl start docker
        systemctl enable docker
        systemctl start fail2ban
        systemctl enable fail2ban
        
    else
        warn "Unknown package manager - please install Docker, Docker Compose, and other dependencies manually"
    fi
    
    success "System packages installed"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        # Ubuntu UFW
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        
        # Allow SSH
        ufw allow ssh
        
        # Allow HTTP/HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Allow application ports (adjust as needed)
        ufw allow 3000/tcp  # API
        ufw allow 3030/tcp  # Grafana
        
        ufw --force enable
        
    elif command -v firewall-cmd >/dev/null 2>&1; then
        # CentOS firewalld
        systemctl start firewalld
        systemctl enable firewalld
        
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --permanent --add-port=3030/tcp
        
        firewall-cmd --reload
        
    else
        warn "No supported firewall found - please configure manually"
    fi
    
    success "Firewall configured"
}

# Create directory structure
create_directories() {
    log "Creating production directory structure..."
    
    # Create base directories
    local dirs=(
        "$BASE_DIR"
        "$BASE_DIR/data"
        "$BASE_DIR/logs"
        "$BASE_DIR/backups"
        "$BASE_DIR/cache"
        "$BASE_DIR/ssl"
        "$BASE_DIR/uploads"
        "./data/postgres"
        "./data/redis"
        "./data/prometheus"
        "./data/grafana"
        "./data/alertmanager"
        "./data/loki"
        "./logs/api"
        "./logs/web" 
        "./logs/admin"
        "./logs/nginx"
        "./logs/redis"
        "./backups/postgres"
        "./backups/secrets"
        "./cache/nginx"
    )
    
    for dir in "${dirs[@]}"; do
        if mkdir -p "$dir"; then
            log "Created directory: $dir"
        else
            error "Failed to create directory: $dir"
        fi
    done
    
    # Set proper permissions
    chmod 755 ./data ./logs ./backups ./cache
    chmod 700 ./backups/secrets
    
    success "Directory structure created"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    local ssl_dir="./nginx/ssl"
    mkdir -p "$ssl_dir"
    
    # Generate self-signed certificates for development/testing
    if [[ ! -f "$ssl_dir/aegisx.crt" ]]; then
        log "Generating self-signed SSL certificate..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$ssl_dir/aegisx.key" \
            -out "$ssl_dir/aegisx.crt" \
            -config <(
                echo '[dn]'
                echo 'CN=localhost'
                echo '[req]'
                echo 'distinguished_name = dn'
                echo '[extensions]'
                echo 'subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1'
                echo '[v3_req]'
                echo 'subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1'
            ) -extensions v3_req
        
        # Set proper permissions
        chmod 600 "$ssl_dir/aegisx.key"
        chmod 644 "$ssl_dir/aegisx.crt"
        
        success "Self-signed SSL certificate generated"
        warn "Replace with proper SSL certificates from a CA before production use"
    else
        log "SSL certificates already exist"
    fi
    
    # Create default certificate for nginx
    if [[ ! -f "$ssl_dir/default.crt" ]]; then
        cp "$ssl_dir/aegisx.crt" "$ssl_dir/default.crt"
        cp "$ssl_dir/aegisx.key" "$ssl_dir/default.key"
    fi
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    local logrotate_config="/etc/logrotate.d/aegisx"
    
    if check_root; then
        cat > "$logrotate_config" << 'EOF'
/opt/aegisx/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        /usr/bin/docker kill -s USR1 $(docker ps -q --filter name=aegisx) 2>/dev/null || true
    endscript
}

/opt/aegisx/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
}
EOF
        
        success "Log rotation configured"
    else
        warn "Skipping system log rotation setup (requires root)"
    fi
}

# Setup cron jobs
setup_cron_jobs() {
    log "Setting up cron jobs..."
    
    # Create cron job for backups
    local cron_file="/tmp/aegisx-cron"
    
    cat > "$cron_file" << EOF
# AegisX Production Cron Jobs
# Daily backup at 2:00 AM
0 2 * * * $(pwd)/scripts/backup-restore.sh backup >> $(pwd)/logs/backup/cron.log 2>&1

# Health check every 5 minutes
*/5 * * * * $(pwd)/scripts/health-monitor.sh check >> $(pwd)/logs/monitoring/cron.log 2>&1

# Weekly cleanup at 3:00 AM on Sunday
0 3 * * 0 $(pwd)/scripts/backup-restore.sh cleanup >> $(pwd)/logs/backup/cron.log 2>&1
EOF
    
    # Install cron jobs
    if crontab "$cron_file"; then
        success "Cron jobs installed"
        rm "$cron_file"
    else
        error "Failed to install cron jobs"
    fi
}

# Generate production secrets
generate_secrets() {
    log "Generating production secrets..."
    
    if [[ -f "$ENV_FILE" ]]; then
        warn "Environment file already exists. Use './scripts/secrets-manager.sh' to regenerate specific secrets."
    else
        if ./scripts/secrets-manager.sh generate; then
            success "Production secrets generated"
        else
            error "Failed to generate secrets"
            exit 1
        fi
    fi
}

# Configure Docker
configure_docker() {
    log "Configuring Docker for production..."
    
    local docker_config="/etc/docker/daemon.json"
    
    if check_root; then
        # Create Docker daemon configuration
        cat > "$docker_config" << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "50m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "userland-proxy": false,
    "live-restore": true,
    "default-ulimits": {
        "nofile": {
            "Hard": 64000,
            "Name": "nofile",
            "Soft": 64000
        }
    },
    "dns": ["8.8.8.8", "1.1.1.1"]
}
EOF
        
        # Restart Docker to apply configuration
        systemctl restart docker
        
        success "Docker configured for production"
    else
        warn "Skipping Docker system configuration (requires root)"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring configuration..."
    
    # Create monitoring rules directory
    mkdir -p ./monitoring/rules
    
    # Create basic alert rules
    cat > ./monitoring/rules/alerts.yml << 'EOF'
groups:
  - name: aegisx.alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 2 minutes."
      
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 80% for more than 5 minutes."
      
      - alert: HighDiskUsage
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High disk usage detected"
          description: "Disk usage is above 85% for more than 5 minutes."
EOF
    
    # Create blackbox exporter configuration
    cat > ./monitoring/blackbox.yml << 'EOF'
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: []
      method: GET
      headers:
        Host: localhost
      no_follow_redirects: false
      fail_if_ssl: false
      fail_if_not_ssl: false
      
  http_post_2xx:
    prober: http
    timeout: 5s
    http:
      method: POST
      headers:
        Content-Type: application/json
      body: '{}'
      
  tcp_connect:
    prober: tcp
    timeout: 5s
    
  ping:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: ip4
EOF
    
    # Create postgres queries for monitoring
    cat > ./monitoring/postgres_queries.yaml << 'EOF'
pg_database:
  query: "SELECT pg_database.datname, pg_database_size(pg_database.datname) as size_bytes FROM pg_database"
  master: true
  cache_seconds: 30
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of the database"
    - size_bytes:
        usage: "GAUGE"
        description: "Disk space used by the database"

pg_stat_user_tables:
  query: "SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables"
  master: true
  cache_seconds: 30
  metrics:
    - schemaname:
        usage: "LABEL"
        description: "Name of the schema"
    - tablename:
        usage: "LABEL"
        description: "Name of the table"
    - seq_scan:
        usage: "COUNTER"
        description: "Number of sequential scans initiated on this table"
    - seq_tup_read:
        usage: "COUNTER"
        description: "Number of live rows fetched by sequential scans"
    - idx_scan:
        usage: "COUNTER"
        description: "Number of index scans initiated on this table"
    - idx_tup_fetch:
        usage: "COUNTER"
        description: "Number of live rows fetched by index scans"
    - n_tup_ins:
        usage: "COUNTER"
        description: "Number of rows inserted"
    - n_tup_upd:
        usage: "COUNTER"
        description: "Number of rows updated"
    - n_tup_del:
        usage: "COUNTER"
        description: "Number of rows deleted"
EOF
    
    success "Monitoring configuration created"
}

# Display final instructions
display_final_instructions() {
    log "=== Production Setup Complete ==="
    echo ""
    success "AegisX production environment has been set up successfully!"
    echo ""
    log "Next steps:"
    echo "1. Review and update .env.production with your domain and settings"
    echo "2. Replace self-signed SSL certificates with proper CA certificates"
    echo "3. Configure your DNS to point to this server"
    echo "4. Run: './scripts/deploy-production.sh' to start the application"
    echo "5. Run: 'docker-compose -f docker-compose.monitoring.yml up -d' to start monitoring"
    echo ""
    log "Important files:"
    echo "- Environment: $ENV_FILE"
    echo "- SSL Certificates: ./nginx/ssl/"
    echo "- Logs: ./logs/"
    echo "- Backups: ./backups/"
    echo ""
    log "Management scripts:"
    echo "- Deploy: ./scripts/deploy-production.sh"
    echo "- Monitor: ./scripts/health-monitor.sh"
    echo "- Backup: ./scripts/backup-restore.sh"
    echo "- Secrets: ./scripts/secrets-manager.sh"
    echo ""
    warn "Remember to:"
    echo "- Secure your server with proper SSH keys"
    echo "- Configure monitoring alerts"
    echo "- Test backup and restore procedures"
    echo "- Set up proper SSL certificates"
    echo "- Review firewall rules"
    echo ""
}

# Main setup function
main() {
    log "=== Starting AegisX Production Setup ==="
    
    # Check if running as root for optional system configurations
    local is_root=false
    if check_root; then
        is_root=true
    fi
    
    # Create directories first
    create_directories
    
    # Install system packages if root
    if $is_root; then
        install_system_packages
        configure_firewall
        configure_docker
        setup_log_rotation
    else
        warn "Some system-level configurations skipped (run as root for full setup)"
    fi
    
    # Setup SSL certificates
    setup_ssl
    
    # Generate secrets
    generate_secrets
    
    # Setup monitoring
    setup_monitoring
    
    # Setup cron jobs
    setup_cron_jobs
    
    # Display final instructions
    display_final_instructions
    
    success "=== Production setup completed successfully ==="
}

# Script usage
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "This script sets up the AegisX production environment including:"
    echo "- Directory structure"
    echo "- SSL certificates (self-signed)"
    echo "- Production secrets"
    echo "- Monitoring configuration"
    echo "- Cron jobs"
    echo "- System packages (if run as root)"
    echo "- Firewall configuration (if run as root)"
    echo ""
    echo "Run as root for complete system setup, or as regular user for application setup only."
}

# Handle script arguments
case "${1:-}" in
    "-h"|"--help")
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac