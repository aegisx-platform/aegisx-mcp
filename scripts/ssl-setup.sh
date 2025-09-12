#!/bin/bash
set -euo pipefail

# AegisX SSL/TLS Setup Script
# Handles SSL certificate generation, renewal, and configuration for production

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly SSL_DIR="$PROJECT_ROOT/ssl"
readonly NGINX_DIR="$PROJECT_ROOT/nginx"
readonly LOG_DIR="$PROJECT_ROOT/logs"

# Default configuration
readonly DEFAULT_DOMAIN="localhost"
readonly DEFAULT_EMAIL="admin@localhost"

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
    mkdir -p "$SSL_DIR" "$NGINX_DIR" "$LOG_DIR"
    mkdir -p "$SSL_DIR/certs" "$SSL_DIR/private" "$SSL_DIR/csr"
}

# Load environment variables
load_environment() {
    if [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        source "$PROJECT_ROOT/.env.production"
    else
        warn "Production environment file not found, using defaults"
    fi
}

# Check if running as root (required for certbot)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        return 0
    else
        return 1
    fi
}

# Install certbot if not present
install_certbot() {
    log "Checking for certbot installation..."
    
    if command -v certbot > /dev/null; then
        success "Certbot is already installed"
        return 0
    fi
    
    log "Installing certbot..."
    
    # Detect OS and install accordingly
    if [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [[ -f /etc/redhat-release ]]; then
        # RHEL/CentOS/Fedora
        if command -v dnf > /dev/null; then
            dnf install -y certbot python3-certbot-nginx
        else
            yum install -y certbot python3-certbot-nginx
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew > /dev/null; then
            brew install certbot
        else
            error "Homebrew not found. Please install certbot manually."
            exit 1
        fi
    else
        error "Unsupported operating system"
        exit 1
    fi
    
    success "Certbot installed successfully"
}

# Generate self-signed certificate for development/testing
generate_self_signed() {
    local domain="${1:-$DEFAULT_DOMAIN}"
    
    log "Generating self-signed certificate for $domain..."
    
    local cert_file="$SSL_DIR/certs/$domain.crt"
    local key_file="$SSL_DIR/private/$domain.key"
    local csr_file="$SSL_DIR/csr/$domain.csr"
    
    # Generate private key
    openssl genrsa -out "$key_file" 2048
    
    # Generate certificate signing request
    openssl req -new -key "$key_file" -out "$csr_file" -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=$domain"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in "$csr_file" -signkey "$key_file" -out "$cert_file"
    
    # Set proper permissions
    chmod 600 "$key_file"
    chmod 644 "$cert_file"
    
    success "Self-signed certificate generated:"
    success "Certificate: $cert_file"
    success "Private Key: $key_file"
}

# Generate Let's Encrypt certificate
generate_letsencrypt() {
    local domain="$1"
    local email="${2:-$DEFAULT_EMAIL}"
    
    if ! check_root; then
        error "Root privileges required for Let's Encrypt certificate generation"
        error "Run with: sudo $0 letsencrypt <domain> <email>"
        exit 1
    fi
    
    log "Generating Let's Encrypt certificate for $domain..."
    
    # Check if nginx is running (required for webroot authentication)
    if ! systemctl is-active --quiet nginx; then
        warn "Nginx is not running. Starting nginx for certificate generation..."
        systemctl start nginx || {
            error "Failed to start nginx. Please start nginx manually."
            exit 1
        }
    fi
    
    # Create webroot directory if it doesn't exist
    local webroot="/var/www/html"
    mkdir -p "$webroot"
    
    # Generate certificate using webroot authentication
    if certbot certonly \
        --webroot \
        --webroot-path="$webroot" \
        --email "$email" \
        --agree-tos \
        --non-interactive \
        --domains "$domain"; then
        
        success "Let's Encrypt certificate generated for $domain"
        
        # Copy certificates to our SSL directory
        cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SSL_DIR/certs/$domain.crt"
        cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SSL_DIR/private/$domain.key"
        
        # Set proper permissions
        chmod 600 "$SSL_DIR/private/$domain.key"
        chmod 644 "$SSL_DIR/certs/$domain.crt"
        
        success "Certificates copied to SSL directory"
    else
        error "Failed to generate Let's Encrypt certificate"
        exit 1
    fi
}

# Configure nginx with SSL
configure_nginx() {
    local domain="${1:-$DEFAULT_DOMAIN}"
    local api_port="${API_PORT:-3333}"
    local web_port="${WEB_PORT:-4200}"
    
    log "Configuring nginx with SSL for $domain..."
    
    local nginx_config="$NGINX_DIR/$domain.conf"
    
    cat > "$nginx_config" << EOF
# AegisX SSL Configuration for $domain
# Generated on $(date)

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/s;

# Upstream servers
upstream api_backend {
    server 127.0.0.1:$api_port;
    # Add more servers for load balancing
    # server 127.0.0.1:3334;
}

upstream web_backend {
    server 127.0.0.1:$web_port;
    # Add more servers for load balancing
    # server 127.0.0.1:4201;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $domain www.$domain;
    
    # Let's Encrypt challenge handling
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $domain www.$domain;
    
    # SSL Configuration
    ssl_certificate $SSL_DIR/certs/$domain.crt;
    ssl_certificate_key $SSL_DIR/private/$domain.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://web_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Web application
    location / {
        proxy_pass http://web_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Handle Angular routing
        try_files \$uri \$uri/ @fallback;
    }
    
    # Angular fallback for client-side routing
    location @fallback {
        proxy_pass http://web_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    success "Nginx configuration created: $nginx_config"
    
    # Test nginx configuration
    if nginx -t; then
        success "Nginx configuration is valid"
        
        # Reload nginx if it's running
        if systemctl is-active --quiet nginx; then
            systemctl reload nginx
            success "Nginx configuration reloaded"
        else
            warn "Nginx is not running. Start it manually to apply configuration."
        fi
    else
        error "Nginx configuration is invalid"
        exit 1
    fi
}

# Setup automatic certificate renewal
setup_renewal() {
    local domain="$1"
    local email="${2:-$DEFAULT_EMAIL}"
    
    if ! check_root; then
        error "Root privileges required for setting up automatic renewal"
        exit 1
    fi
    
    log "Setting up automatic certificate renewal..."
    
    # Create renewal script
    local renewal_script="/usr/local/bin/aegisx-ssl-renew"
    
    cat > "$renewal_script" << EOF
#!/bin/bash
# AegisX SSL Certificate Renewal Script
# Generated on $(date)

set -euo pipefail

DOMAIN="$domain"
SSL_DIR="$SSL_DIR"
LOG_FILE="$LOG_DIR/ssl-renewal.log"

# Renew certificate
certbot renew --quiet --deploy-hook "
    # Copy renewed certificates
    cp /etc/letsencrypt/live/\$DOMAIN/fullchain.pem \$SSL_DIR/certs/\$DOMAIN.crt
    cp /etc/letsencrypt/live/\$DOMAIN/privkey.pem \$SSL_DIR/private/\$DOMAIN.key
    
    # Set proper permissions
    chmod 600 \$SSL_DIR/private/\$DOMAIN.key
    chmod 644 \$SSL_DIR/certs/\$DOMAIN.crt
    
    # Reload nginx
    systemctl reload nginx
    
    echo \"[\\$(date)] Certificate renewed and nginx reloaded\" >> \$LOG_FILE
"

EOF
    
    chmod +x "$renewal_script"
    
    # Create cron job for renewal (runs twice daily)
    local cron_job="0 2,14 * * * root $renewal_script"
    
    if ! crontab -l 2>/dev/null | grep -q "aegisx-ssl-renew"; then
        echo "$cron_job" | crontab -
        success "Automatic renewal cron job created"
    else
        warn "Renewal cron job already exists"
    fi
    
    # Create systemd timer as alternative to cron
    cat > "/etc/systemd/system/aegisx-ssl-renew.service" << EOF
[Unit]
Description=AegisX SSL Certificate Renewal
After=network.target

[Service]
Type=oneshot
ExecStart=$renewal_script
User=root
EOF
    
    cat > "/etc/systemd/system/aegisx-ssl-renew.timer" << EOF
[Unit]
Description=Run AegisX SSL Certificate Renewal twice daily
Requires=aegisx-ssl-renew.service

[Timer]
OnCalendar=*-*-* 02,14:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    systemctl daemon-reload
    systemctl enable aegisx-ssl-renew.timer
    systemctl start aegisx-ssl-renew.timer
    
    success "Systemd timer for SSL renewal created and enabled"
}

# Check certificate status
check_certificate() {
    local domain="${1:-$DEFAULT_DOMAIN}"
    local cert_file="$SSL_DIR/certs/$domain.crt"
    
    log "Checking certificate status for $domain..."
    
    if [[ ! -f "$cert_file" ]]; then
        warn "Certificate file not found: $cert_file"
        return 1
    fi
    
    # Check certificate validity
    local cert_info=$(openssl x509 -in "$cert_file" -text -noout)
    local expiry_date=$(echo "$cert_info" | grep "Not After" | cut -d: -f2- | xargs)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_remaining=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    success "Certificate information:"
    echo "  Domain: $domain"
    echo "  Certificate: $cert_file"
    echo "  Expires: $expiry_date"
    echo "  Days remaining: $days_remaining"
    
    if [[ $days_remaining -lt 30 ]]; then
        warn "Certificate expires in $days_remaining days - consider renewal"
    fi
    
    # Test certificate with domain
    if [[ "$domain" != "localhost" ]]; then
        log "Testing HTTPS connection to $domain..."
        if timeout 10 curl -Is "https://$domain" > /dev/null 2>&1; then
            success "HTTPS connection successful"
        else
            warn "HTTPS connection failed"
        fi
    fi
}

# Generate Diffie-Hellman parameters for enhanced security
generate_dhparam() {
    local dhparam_file="$SSL_DIR/dhparam.pem"
    
    if [[ -f "$dhparam_file" ]]; then
        success "DH parameters already exist: $dhparam_file"
        return 0
    fi
    
    log "Generating Diffie-Hellman parameters (this may take several minutes)..."
    openssl dhparam -out "$dhparam_file" 2048
    
    success "DH parameters generated: $dhparam_file"
}

# Show help
show_help() {
    cat << EOF
AegisX SSL/TLS Setup Script

Usage: $0 <command> [options]

Commands:
    self-signed <domain>           Generate self-signed certificate
    letsencrypt <domain> <email>   Generate Let's Encrypt certificate (requires root)
    nginx <domain>                 Configure nginx with SSL
    renewal <domain> <email>       Setup automatic certificate renewal (requires root)
    check <domain>                 Check certificate status
    dhparam                        Generate DH parameters
    install-certbot                Install certbot (requires root)

Options:
    -h, --help                     Show this help message

Examples:
    $0 self-signed localhost                    # Generate self-signed cert for localhost
    $0 self-signed yourdomain.com               # Generate self-signed cert for domain
    
    sudo $0 letsencrypt yourdomain.com admin@yourdomain.com  # Generate Let's Encrypt cert
    sudo $0 renewal yourdomain.com admin@yourdomain.com     # Setup auto renewal
    
    $0 nginx yourdomain.com                     # Configure nginx with SSL
    $0 check yourdomain.com                     # Check certificate status
    $0 dhparam                                  # Generate DH parameters

Setup Process:
    1. $0 install-certbot                       # Install certbot (if needed)
    2. $0 dhparam                               # Generate DH parameters
    3. $0 letsencrypt yourdomain.com email      # Generate certificate
    4. $0 nginx yourdomain.com                  # Configure nginx
    5. $0 renewal yourdomain.com email          # Setup auto renewal

Development Setup:
    1. $0 self-signed localhost                 # Generate self-signed cert
    2. $0 nginx localhost                       # Configure nginx

EOF
}

# Main function
main() {
    ensure_directories
    load_environment
    
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        self-signed)
            [[ $# -eq 0 ]] && { error "Domain name required"; exit 1; }
            generate_self_signed "$1"
            generate_dhparam
            ;;
        letsencrypt)
            [[ $# -lt 2 ]] && { error "Domain and email required"; exit 1; }
            install_certbot
            generate_letsencrypt "$1" "$2"
            generate_dhparam
            ;;
        nginx)
            [[ $# -eq 0 ]] && { error "Domain name required"; exit 1; }
            configure_nginx "$1"
            ;;
        renewal)
            [[ $# -lt 2 ]] && { error "Domain and email required"; exit 1; }
            setup_renewal "$1" "$2"
            ;;
        check)
            check_certificate "${1:-$DEFAULT_DOMAIN}"
            ;;
        dhparam)
            generate_dhparam
            ;;
        install-certbot)
            if ! check_root; then
                error "Root privileges required to install certbot"
                exit 1
            fi
            install_certbot
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