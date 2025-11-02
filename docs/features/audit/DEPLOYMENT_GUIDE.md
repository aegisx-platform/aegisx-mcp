# Audit System Deployment Guide

**Production deployment instructions**

Version: 1.0.0
Last Updated: 2025-11-02

## Overview

This guide covers deploying the Audit System to production environments.

## Prerequisites

- PostgreSQL 15+ database
- Node.js 18+ runtime
- Docker (optional)
- Nginx or similar reverse proxy
- SSL certificates

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE your_production_db;
CREATE USER your_app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_production_db TO your_app_user;
```

### 2. Run Migrations

The audit system migrations are included in the main migration files:

```bash
# Production migration
NODE_ENV=production npm run db:migrate

# Verify tables created
psql -d your_production_db -c "\dt"
# Should show: login_attempts, file_audit_logs
```

### 3. Verify Indexes

```sql
-- Check indexes exist
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('login_attempts', 'file_audit_logs');

-- Expected indexes:
-- login_attempts: idx_login_attempts_created_at, idx_login_attempts_success, etc.
-- file_audit_logs: idx_file_audit_created_at, idx_file_audit_operation, etc.
```

## Backend Deployment

### Environment Variables

```bash
# .env.production
DATABASE_URL=postgresql://user:pass@localhost:5432/prod_db
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
API_PORT=3333

# Audit-specific settings
AUDIT_RETENTION_DAYS=90
AUDIT_EXPORT_MAX_ROWS=100000
AUDIT_RATE_LIMIT_PER_MINUTE=60
```

### Build Backend

```bash
# Build production bundle
pnpm nx build api --configuration=production

# Output: dist/apps/api
```

### Start Backend

```bash
# Using Node.js directly
node dist/apps/api/main.js

# Using PM2 (recommended)
pm2 start dist/apps/api/main.js --name api-server

# Using Docker
docker run -d \
  -p 3333:3333 \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  --name api-server \
  your-registry/api-server:latest
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/your-app
upstream api_backend {
    server localhost:3333;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API endpoints
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting for audit endpoints
    location /api/login-attempts/ {
        limit_req zone=audit_api burst=10 nodelay;
        proxy_pass http://api_backend;
    }

    location /api/file-audit/ {
        limit_req zone=audit_api burst=10 nodelay;
        proxy_pass http://api_backend;
    }
}

# Rate limit zone definition
http {
    limit_req_zone $binary_remote_addr zone=audit_api:10m rate=60r/m;
}
```

## Frontend Deployment

### Build Frontend

```bash
# Build production bundle
pnpm nx build web --configuration=production

# Output: dist/apps/web
```

### Deploy Static Files

```bash
# Copy to web server
scp -r dist/apps/web/* user@server:/var/www/html/

# Or use Docker
docker run -d \
  -p 4200:80 \
  -v dist/apps/web:/usr/share/nginx/html:ro \
  --name web-server \
  nginx:alpine
```

### Nginx Configuration (Frontend)

```nginx
# /etc/nginx/sites-available/your-app-web
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/html;
    index index.html;

    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Docker Deployment

### Backend Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm nx build api --configuration=production

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333
CMD ["node", "main.js"]
```

### Frontend Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm nx build web --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - '80:80'
      - '443:443'
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

## Performance Tuning

### PostgreSQL Configuration

```sql
-- postgresql.conf optimizations
shared_buffers = 256MB              # 25% of RAM
effective_cache_size = 1GB          # 50-75% of RAM
maintenance_work_mem = 64MB         # For index creation
checkpoint_completion_target = 0.9  # Spread out checkpoint I/O
wal_buffers = 16MB                  # WAL buffer size
random_page_cost = 1.1              # For SSD storage

-- Connection pooling
max_connections = 100
```

### Database Maintenance

```bash
# Daily vacuum (cron job)
0 2 * * * psql -d prod_db -c "VACUUM ANALYZE login_attempts;"
0 2 * * * psql -d prod_db -c "VACUUM ANALYZE file_audit_logs;"

# Weekly reindex
0 3 * * 0 psql -d prod_db -c "REINDEX TABLE login_attempts;"
0 3 * * 0 psql -d prod_db -c "REINDEX TABLE file_audit_logs;"
```

## Monitoring

### Health Check Endpoints

```bash
# Add to backend routes
GET /health
GET /health/db
GET /health/audit
```

### Prometheus Metrics

```javascript
// Backend monitoring
const prometheus = require('prom-client');

const auditMetrics = {
  loginAttempts: new prometheus.Counter({
    name: 'audit_login_attempts_total',
    help: 'Total login attempts',
    labelNames: ['success'],
  }),

  fileOperations: new prometheus.Counter({
    name: 'audit_file_operations_total',
    help: 'Total file operations',
    labelNames: ['operation', 'success'],
  }),
};
```

### Logging

```javascript
// Production logging (JSON format)
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Audit-specific logs
logger.info({
  type: 'audit',
  event: 'login_attempt',
  success: true,
  userId: 'xxx',
  ip: '1.2.3.4',
});
```

## Security Hardening

### Environment Security

```bash
# Secure file permissions
chmod 600 .env.production
chown app-user:app-user .env.production

# Use secrets management
# AWS Secrets Manager, HashiCorp Vault, etc.
```

### Database Security

```sql
-- Revoke public access
REVOKE ALL ON DATABASE prod_db FROM PUBLIC;

-- Grant specific permissions
GRANT CONNECT ON DATABASE prod_db TO app_user;
GRANT SELECT, INSERT, DELETE ON login_attempts TO app_user;
GRANT SELECT, INSERT, DELETE ON file_audit_logs TO app_user;

-- No UPDATE permission (immutable audit logs)
```

### SSL/TLS Configuration

```bash
# Let's Encrypt SSL
certbot certonly --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
0 0 1 * * certbot renew --quiet
```

## Backup & Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR=/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -Fc \
  -h localhost \
  -U app_user \
  -d prod_db \
  -t login_attempts \
  -t file_audit_logs \
  > $BACKUP_DIR/audit_backup_$DATE.dump

# Keep last 30 days
find $BACKUP_DIR -name "audit_backup_*.dump" -mtime +30 -delete
```

### Restore Procedure

```bash
# Restore from backup
pg_restore -h localhost -U app_user -d prod_db \
  /backups/postgres/audit_backup_20251102.dump
```

## Data Retention

### Automated Cleanup

```bash
# Cron job for data retention
# Run daily at 3 AM
0 3 * * * curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.yourdomain.com/api/login-attempts/cleanup?days=90"

0 3 * * * curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.yourdomain.com/api/file-audit/cleanup?days=90"
```

## Compliance

### GDPR Compliance

- **Data Retention**: Implement 90-day retention policy
- **Right to Erasure**: Support user data deletion requests
- **Data Export**: CSV export functionality available
- **Audit Logs**: All data access logged

### SOC 2 Compliance

- **Access Controls**: Role-based permissions enforced
- **Encryption**: SSL/TLS for data in transit
- **Monitoring**: Prometheus metrics and logging
- **Backup**: Daily automated backups

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Rollback Procedure

### If Deployment Fails

```bash
# 1. Stop new version
pm2 stop api-server

# 2. Restore database (if migrations applied)
pg_restore -h localhost -U app_user -d prod_db \
  /backups/postgres/audit_backup_before_deploy.dump

# 3. Start previous version
pm2 start api-server-v1.0.0

# 4. Verify health
curl https://api.yourdomain.com/health
```

---

**Related Documentation:**

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Integration guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
