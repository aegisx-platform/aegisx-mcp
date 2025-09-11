# SSL/TLS Setup for AegisX Production

This document provides comprehensive guidance for setting up SSL/TLS certificates for the AegisX platform in production environments.

## Overview

AegisX supports both self-signed certificates (for development) and Let's Encrypt certificates (for production) with automated renewal and nginx reverse proxy configuration.

## Architecture

```
Internet → Nginx (SSL Termination) → API/Web Services
           ↓
    Let's Encrypt/Self-signed Certificates
```

### Components

- **Nginx**: Reverse proxy with SSL termination
- **Certbot**: Let's Encrypt certificate management
- **SSL Scripts**: Automated certificate generation and renewal
- **Docker Compose**: Production deployment with SSL support

## Quick Start

### Development Setup (Self-signed)

```bash
# Generate self-signed certificate for localhost
make ssl-dev

# Configure nginx
make ssl-nginx
# Enter "localhost" when prompted
```

### Production Setup (Let's Encrypt)

```bash
# Complete production SSL setup (interactive)
make ssl-full-setup
```

## Detailed Setup Instructions

### 1. Development Environment

For local development, use self-signed certificates:

```bash
# Generate self-signed certificate
./scripts/ssl-setup.sh self-signed localhost

# Generate DH parameters for security
./scripts/ssl-setup.sh dhparam

# Configure nginx
./scripts/ssl-setup.sh nginx localhost
```

The certificates will be created in:

- Certificate: `ssl/certs/localhost.crt`
- Private Key: `ssl/private/localhost.key`
- DH Parameters: `ssl/dhparam.pem`

### 2. Production Environment

#### Prerequisites

- Domain name pointing to your server
- Port 80 and 443 open in firewall
- Nginx installed and running
- Root access for certbot installation

#### Step-by-Step Production Setup

1. **Install Certbot** (requires root):

   ```bash
   sudo ./scripts/ssl-setup.sh install-certbot
   ```

2. **Generate DH Parameters**:

   ```bash
   ./scripts/ssl-setup.sh dhparam
   ```

3. **Generate Let's Encrypt Certificate** (requires root):

   ```bash
   sudo ./scripts/ssl-setup.sh letsencrypt yourdomain.com admin@yourdomain.com
   ```

4. **Configure Nginx**:

   ```bash
   ./scripts/ssl-setup.sh nginx yourdomain.com
   ```

5. **Setup Automatic Renewal** (requires root):
   ```bash
   sudo ./scripts/ssl-setup.sh renewal yourdomain.com admin@yourdomain.com
   ```

## SSL Configuration Details

### Nginx SSL Configuration

The generated nginx configuration includes:

#### Security Features

- **TLS 1.2/1.3 only**: Modern protocol support
- **Strong cipher suites**: ECDHE and AES-GCM preferred
- **HSTS**: HTTP Strict Transport Security
- **Security headers**: XSS, CSRF, content-type protection
- **Perfect Forward Secrecy**: DH parameters for key exchange

#### Performance Features

- **HTTP/2 support**: Multiplexed connections
- **Gzip compression**: Reduced bandwidth usage
- **Static asset caching**: Long-term caching for assets
- **Rate limiting**: Protection against abuse

#### Example Configuration Snippet

```nginx
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
```

### Docker Production Configuration

The `docker-compose.production.yml` includes:

#### SSL Volume Mounts

```yaml
nginx:
  volumes:
    - ./ssl:/etc/ssl/aegisx:ro
    - ./ssl/dhparam.pem:/etc/ssl/certs/dhparam.pem:ro
    - /var/www/html:/var/www/html # For Let's Encrypt challenges
```

#### Certificate Paths

- Certificates: `/etc/ssl/aegisx/certs/`
- Private keys: `/etc/ssl/aegisx/private/`
- DH parameters: `/etc/ssl/certs/dhparam.pem`

## Certificate Management

### Checking Certificate Status

```bash
# Check certificate expiration and validity
./scripts/ssl-setup.sh check yourdomain.com

# Using make command
make ssl-check
```

### Manual Certificate Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Renew specific domain
sudo certbot renew --cert-name yourdomain.com
```

### Automatic Renewal

The setup creates two renewal mechanisms:

#### 1. Cron Job

Runs twice daily at 2 AM and 2 PM:

```bash
0 2,14 * * * root /usr/local/bin/aegisx-ssl-renew
```

#### 2. Systemd Timer

More reliable alternative to cron:

```bash
# Check timer status
systemctl status aegisx-ssl-renew.timer

# View timer logs
journalctl -u aegisx-ssl-renew.timer
```

### Renewal Script Features

- **Pre-renewal backup**: Automatic certificate backup
- **Post-renewal hooks**: Automatic nginx reload
- **Logging**: Detailed renewal logs in `/logs/ssl-renewal.log`
- **Error handling**: Email notifications on failure (if configured)

## Security Best Practices

### Certificate Security

- **Private key protection**: 600 permissions on private keys
- **Certificate validation**: Regular expiration monitoring
- **Key rotation**: Regenerate certificates periodically
- **Backup strategy**: Secure certificate backups

### Nginx Security

- **Rate limiting**: API and login endpoint protection
- **Header security**: Comprehensive security headers
- **CSRF protection**: Cross-site request forgery prevention
- **Content security**: Strict content security policies

### SSL/TLS Best Practices

- **Protocol versions**: TLS 1.2+ only
- **Cipher suites**: Modern, secure ciphers only
- **Perfect forward secrecy**: ECDHE key exchange
- **OCSP stapling**: Certificate status checking
- **Certificate transparency**: Public certificate logs

## Troubleshooting

### Common Issues

#### 1. Certificate Generation Fails

```bash
# Check DNS resolution
dig yourdomain.com

# Check firewall
sudo ufw status
sudo iptables -L

# Check nginx configuration
nginx -t

# Check certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

#### 2. Nginx SSL Errors

```bash
# Test nginx configuration
nginx -t

# Check certificate files exist
ls -la ssl/certs/yourdomain.com.crt
ls -la ssl/private/yourdomain.com.key

# Check certificate validity
openssl x509 -in ssl/certs/yourdomain.com.crt -text -noout
```

#### 3. Browser SSL Warnings

- **Self-signed certificates**: Browser warnings are expected
- **Let's Encrypt certificates**: Check domain name matches
- **Mixed content**: Ensure all resources load over HTTPS
- **Certificate chain**: Verify full certificate chain

#### 4. Renewal Failures

```bash
# Check renewal timer
systemctl status aegisx-ssl-renew.timer

# Manual renewal test
sudo certbot renew --dry-run

# Check renewal logs
tail -f /var/log/aegisx/ssl-renewal.log
```

### Debugging Commands

```bash
# Test HTTPS connection
curl -I https://yourdomain.com

# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Test SSL configuration
./scripts/ssl-setup.sh check yourdomain.com
```

## Monitoring and Alerts

### Certificate Expiration Monitoring

- **Automated checks**: Daily certificate expiration checks
- **Early warnings**: 30-day expiration alerts
- **Grafana dashboard**: Visual certificate status monitoring
- **Prometheus metrics**: Certificate validity metrics

### SSL/TLS Monitoring

- **Connection quality**: TLS version and cipher monitoring
- **Performance metrics**: SSL handshake duration
- **Error tracking**: SSL/TLS error rates
- **Security scoring**: SSL Labs integration

### Alert Conditions

- Certificate expires in < 30 days
- SSL/TLS handshake failures increase
- Mixed content warnings detected
- Cipher suite downgrades observed

## Environment Variables

### SSL Configuration Variables

```bash
# HTTPS Configuration
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/ssl/aegisx/certs/yourdomain.com.crt
SSL_KEY_PATH=/etc/ssl/aegisx/private/yourdomain.com.key
FORCE_HTTPS=true

# Security Configuration
SECURE_COOKIES=true
SAME_SITE_COOKIES=strict
CSRF_PROTECTION=true
```

### URL Configuration

```bash
# Public URLs
API_BASE_URL=https://yourdomain.com/api
WEB_BASE_URL=https://yourdomain.com
ADMIN_BASE_URL=https://admin.yourdomain.com

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

## Deployment Integration

### CI/CD Pipeline SSL Steps

```yaml
- name: Setup SSL Certificates
  run: |
    # Load production environment
    ./scripts/env-manager.sh switch production

    # Check certificate status
    ./scripts/ssl-setup.sh check ${{ vars.DOMAIN_NAME }}

    # Renew if needed (in CI environment, use API mode)
    # Note: Requires DNS API integration for CI/CD
```

### Docker Deployment with SSL

```bash
# Deploy with SSL support
docker-compose -f docker-compose.production.yml up -d

# Check SSL container health
docker-compose -f docker-compose.production.yml ps
```

### Health Checks with SSL

```bash
# HTTPS health check endpoint
curl -f https://yourdomain.com/health

# SSL certificate validation
./scripts/ssl-setup.sh check yourdomain.com
```

## Multi-Domain Setup

For multiple domains or subdomains:

```bash
# Generate certificate for multiple domains
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email admin@yourdomain.com \
    --agree-tos \
    --non-interactive \
    --domains yourdomain.com,www.yourdomain.com,api.yourdomain.com,admin.yourdomain.com
```

### Wildcard Certificates

For wildcard certificates (requires DNS API):

```bash
# Requires DNS plugin (example for Cloudflare)
sudo certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
    --email admin@yourdomain.com \
    --agree-tos \
    --non-interactive \
    --domains "*.yourdomain.com,yourdomain.com"
```

## Performance Optimization

### SSL/TLS Performance

- **Session resumption**: Reduce handshake overhead
- **OCSP stapling**: Faster certificate validation
- **HTTP/2**: Multiplexed connections over single SSL
- **Certificate chain optimization**: Minimize chain length

### Caching Strategy

- **Static assets**: Long-term caching with SSL
- **API responses**: Appropriate cache headers
- **Certificate caching**: Browser certificate caching
- **Session caching**: SSL session reuse

## Backup and Recovery

### Certificate Backup

```bash
# Create certificate backup
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz ssl/

# Backup to remote location
rsync -av ssl/ backup-server:/backups/ssl/
```

### Recovery Procedures

1. **Certificate corruption**: Restore from backup
2. **Key compromise**: Generate new certificate immediately
3. **CA issues**: Switch to backup certificate authority
4. **Domain changes**: Generate new certificate for new domain

## Cost Optimization

### Let's Encrypt Advantages

- **Free certificates**: No certificate purchase costs
- **Automated renewal**: Reduced management overhead
- **Wide browser support**: Trusted by all major browsers
- **API integration**: Programmatic certificate management

### Certificate Management Costs

- **Development time**: Initial setup investment
- **Monitoring costs**: Certificate monitoring tools
- **Renewal maintenance**: Automated renewal setup
- **Support costs**: SSL/TLS expertise requirements

---

## Quick Reference Commands

```bash
# Development SSL setup
make ssl-dev              # Generate self-signed certificate
make ssl-nginx            # Configure nginx for SSL

# Production SSL setup
make ssl-full-setup       # Complete production SSL setup
make ssl-prod            # Generate Let's Encrypt certificate
make ssl-renewal         # Setup automatic renewal

# Management commands
make ssl-check           # Check certificate status
make ssl-dhparam         # Generate DH parameters

# Direct script usage
./scripts/ssl-setup.sh self-signed localhost
./scripts/ssl-setup.sh letsencrypt yourdomain.com email@domain.com
./scripts/ssl-setup.sh nginx yourdomain.com
./scripts/ssl-setup.sh check yourdomain.com
```

This SSL/TLS setup provides enterprise-grade security with automated certificate management, ensuring your AegisX deployment maintains secure HTTPS connections with minimal maintenance overhead.
