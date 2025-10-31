# PDF Export - Deployment Guide

> **Production deployment instructions for administrators and DevOps engineers**

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Target Environment:** Production

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Configuration](#configuration)
- [Database Migration](#database-migration)
- [Verification](#verification)
- [Rollback Procedure](#rollback-procedure)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### System Requirements

**Server:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Storage: 20GB+ available
- OS: Linux (Ubuntu 22.04 LTS recommended)

**Software:**
- Node.js 20.x LTS
- PostgreSQL 15+
- Redis 7+
- Docker 24+ (if using containers)
- pnpm 9+

### Access Requirements

- [ ] Production server SSH access
- [ ] Database admin credentials
- [ ] Redis access credentials
- [ ] Domain DNS control
- [ ] SSL certificates ready

### Pre-Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Team notified
- [ ] Maintenance window scheduled

---

## 🚀 Deployment Steps

### Option 1: Docker Deployment (Recommended)

#### Step 1: Pull Latest Images

```bash
# Pull latest images
docker pull ghcr.io/aegisx-platform/api:latest
docker pull ghcr.io/aegisx-platform/web:latest

# Verify images
docker images | grep aegisx
```

#### Step 2: Update Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    image: ghcr.io/aegisx-platform/api:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3333:3333"
    restart: unless-stopped

  web:
    image: ghcr.io/aegisx-platform/web:latest
    environment:
      API_URL: https://api.aegisx.example.com
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
```

#### Step 3: Deploy

```bash
# Stop existing containers
docker-compose -f docker-compose.production.yml down

# Start new containers
docker-compose -f docker-compose.production.yml up -d

# Verify containers running
docker-compose ps
```

### Option 2: Manual Deployment

#### Step 1: Build Application

```bash
# Build backend
cd apps/api
pnpm install --prod
pnpm run build

# Build frontend
cd apps/web
pnpm install --prod
pnpm run build:prod
```

#### Step 2: Deploy Files

```bash
# Copy to production server
rsync -avz --progress \
  dist/ \
  user@production:/var/www/aegisx/
```

#### Step 3: Start Services

```bash
# Start backend with PM2
pm2 start dist/apps/api/main.js --name aegisx-api

# Serve frontend with Nginx
# (Configure Nginx - see Configuration section)
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.production`:

```bash
# Application
NODE_ENV=production
API_PORT=3333
API_URL=https://api.aegisx.example.com
WEB_URL=https://aegisx.example.com

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aegisx_prod
DATABASE_USER=aegisx_user
DATABASE_PASSWORD=<strong-password>
DATABASE_SSL=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_TLS=true

# Security
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_SECRET=<generate-strong-secret>

# CORS
CORS_ORIGIN=https://aegisx.example.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=3600

# Feature Flags (if applicable)
FEATURE_[NAME]_ENABLED=true
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/aegisx

server {
    listen 80;
    server_name aegisx.example.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aegisx.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/aegisx.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aegisx.example.com/privkey.pem;

    # Frontend
    root /var/www/aegisx/web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'aegisx-api',
    script: './dist/apps/api/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3333
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_date_format: '2025-10-31 HH:mm:ss',
    max_memory_restart: '1G'
  }]
};
```

---

## 🗄️ Database Migration

### Pre-Migration Backup

```bash
# Create backup
pg_dump -h localhost -U aegisx_user -d aegisx_prod \
  -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Verify backup
ls -lh backup_*.dump
```

### Run Migrations

```bash
# Check migration status
pnpm run knex migrate:status

# Run pending migrations
pnpm run knex migrate:latest

# Verify migrations
pnpm run knex migrate:status
```

### Post-Migration Verification

```bash
# Verify tables exist
psql -h localhost -U aegisx_user -d aegisx_prod \
  -c "\dt"

# Check table structure
psql -h localhost -U aegisx_user -d aegisx_prod \
  -c "\d features"

# Verify data integrity
psql -h localhost -U aegisx_user -d aegisx_prod \
  -c "SELECT COUNT(*) FROM features;"
```

---

## ✅ Verification

### Health Check

```bash
# API health check
curl https://api.aegisx.example.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-31T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### Feature Verification

```bash
# Test feature endpoint
curl -X GET https://api.aegisx.example.com/api/features \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK with feature list
```

### Frontend Verification

1. Open browser: https://aegisx.example.com
2. Verify login works
3. Navigate to feature
4. Test CRUD operations
5. Check console for errors

### Performance Check

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s \
  https://api.aegisx.example.com/api/features

# Expected: < 200ms response time
```

---

## 🔙 Rollback Procedure

### If Deployment Fails

#### Step 1: Stop New Version

```bash
# Docker deployment
docker-compose down

# PM2 deployment
pm2 stop aegisx-api
```

#### Step 2: Restore Database

```bash
# Restore from backup
pg_restore -h localhost -U aegisx_user \
  -d aegisx_prod -c backup_YYYYMMDD_HHMMSS.dump

# Verify restoration
psql -h localhost -U aegisx_user -d aegisx_prod \
  -c "SELECT version FROM knex_migrations ORDER BY id DESC LIMIT 1;"
```

#### Step 3: Rollback Code

```bash
# Docker: Use previous image tag
docker-compose -f docker-compose.production.yml up -d

# Manual: Deploy previous version
git checkout <previous-tag>
pnpm run build
pm2 restart aegisx-api
```

#### Step 4: Verify Rollback

```bash
# Check health
curl https://api.aegisx.example.com/api/health

# Verify functionality
# Test critical user paths
```

---

## 📊 Monitoring

### Application Logs

```bash
# API logs (PM2)
pm2 logs aegisx-api

# Docker logs
docker logs -f aegisx-api

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Performance Metrics

Monitor:
- CPU usage: < 70%
- Memory usage: < 80%
- Response time: < 200ms (p95)
- Error rate: < 0.1%

### Alerts

Set up alerts for:
- API downtime (> 1 minute)
- Database connection failures
- Redis connection issues
- High error rates (> 1%)
- Memory usage > 90%

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** API won't start
```bash
# Check logs
pm2 logs aegisx-api --lines 100

# Common causes:
# - Port already in use
# - Database connection failed
# - Missing environment variables
```

**Problem:** Database connection failed
```bash
# Test connection
psql -h localhost -U aegisx_user -d aegisx_prod

# Check credentials in .env
# Verify PostgreSQL is running
systemctl status postgresql
```

**Problem:** Redis connection failed
```bash
# Test Redis
redis-cli ping

# Check Redis is running
systemctl status redis
```

For detailed troubleshooting, see [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## 📚 Related Documentation

- [Architecture](./ARCHITECTURE.md) - System design
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development setup
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem resolution

---

**Maintained By:** DevOps Team
**Last Updated:** 2025-10-31
**Emergency Contact:** devops@aegisx.example.com
