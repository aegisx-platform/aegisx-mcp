---
title: '[Feature Name] Deployment Guide'
description: 'Deployment instructions, configuration, and production considerations for [Feature Name]'
category: features
tags: [deployment, production, devops]
order: 7
---

# [Feature Name] Deployment Guide

Production deployment guide for the [Feature Name] feature.

## 📋 Prerequisites

Before deploying to production:

- [ ] All tests passing (`pnpm test`)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Database migrations reviewed
- [ ] Environment variables documented
- [ ] Security audit completed

## 🔧 Environment Configuration

### Environment Variables

Create/update `.env.production`:

```bash
# Feature Configuration
FEATURE_ENABLED=true
FEATURE_API_KEY=your_production_api_key
FEATURE_CACHE_TTL=3600

# Database
DATABASE_URL=postgresql://user:pass@host:5432/aegisx_prod

# Redis Cache
REDIS_URL=redis://host:6379
REDIS_PASSWORD=your_redis_password

# Optional Feature Flags
FEATURE_ADVANCED_MODE=false
FEATURE_DEBUG=false
```

### Configuration File

```typescript
// apps/api/src/config/feature.config.ts
export const featureConfig = {
  enabled: process.env.FEATURE_ENABLED === 'true',
  apiKey: process.env.FEATURE_API_KEY,
  cacheTTL: parseInt(process.env.FEATURE_CACHE_TTL || '3600'),
  // ... other settings
};
```

## 🗄️ Database Deployment

### Run Migrations

```bash
# Dry run (verify migrations)
pnpm run db:migrate:dry

# Production migration
DATABASE_URL="postgresql://..." pnpm run db:migrate

# Verify migration status
pnpm run db:migration:status
```

### Rollback Plan

```bash
# If deployment fails, rollback
pnpm run db:migrate:rollback

# Or to specific version
pnpm run db:migrate:to <timestamp>
```

### Seed Initial Data (if needed)

```bash
# Production seed
NODE_ENV=production pnpm run db:seed:feature
```

## 🚀 Deployment Steps

### Step 1: Build Application

```bash
# Build backend
pnpm run build:api

# Build frontend
pnpm run build:admin
```

### Step 2: Docker Deployment

#### Update Docker Compose

```yaml
# docker-compose.prod.yml
services:
  api:
    image: aegisx/api:latest
    environment:
      - FEATURE_ENABLED=true
      - FEATURE_API_KEY=${FEATURE_API_KEY}
    depends_on:
      - postgres
      - redis
```

#### Deploy

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

### Step 3: Verify Deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Feature-specific check
curl https://api.yourdomain.com/api/feature/health

# Check logs
docker logs aegisx-api --tail 100
```

## 🔐 Security Checklist

Before going live:

- [ ] API keys rotated (not using dev/staging keys)
- [ ] HTTPS/TLS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] Authentication required on all endpoints
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging enabled

### Security Configuration

```typescript
// Enable security headers
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // ... other CSP directives
    },
  },
});

// Rate limiting
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

## ⚡ Performance Optimization

### Caching Strategy

```typescript
// Enable production caching
const cacheMiddleware = {
  ttl: 3600, // 1 hour
  staleIfError: 86400, // 24 hours
};
```

### Database Indexing

```sql
-- Production indexes
CREATE INDEX CONCURRENTLY idx_features_name
  ON features(name);

CREATE INDEX CONCURRENTLY idx_features_status_created
  ON features(status, created_at DESC);
```

### CDN Configuration

```nginx
# Nginx cache configuration
location /api/feature {
    proxy_cache feature_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_key "$request_uri";
}
```

## 📊 Monitoring & Alerts

### Metrics to Monitor

```typescript
// Prometheus metrics
const featureMetrics = {
  requestsTotal: new Counter({
    name: 'feature_requests_total',
    help: 'Total feature API requests',
  }),
  requestDuration: new Histogram({
    name: 'feature_request_duration_seconds',
    help: 'Feature API request duration',
  }),
  errorsTotal: new Counter({
    name: 'feature_errors_total',
    help: 'Total feature errors',
  }),
};
```

### Alerting Rules

```yaml
# Prometheus alerts
groups:
  - name: feature_alerts
    rules:
      - alert: FeatureHighErrorRate
        expr: rate(feature_errors_total[5m]) > 0.05
        annotations:
          summary: 'High error rate in feature API'

      - alert: FeatureSlowResponse
        expr: feature_request_duration_seconds > 2
        annotations:
          summary: 'Slow feature API responses'
```

### Log Aggregation

```typescript
// Structured logging for production
logger.info({
  feature: 'feature-name',
  action: 'create',
  userId: user.id,
  duration: performance.now() - start,
  success: true,
});
```

## 🔄 Rollback Procedure

If deployment fails:

### 1. Stop New Version

```bash
docker-compose -f docker-compose.prod.yml down
```

### 2. Rollback Database

```bash
pnpm run db:migrate:rollback
```

### 3. Deploy Previous Version

```bash
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### 4. Verify Rollback

```bash
curl https://api.yourdomain.com/health
```

## 🔧 Post-Deployment

### 1. Smoke Tests

```bash
# Run production smoke tests
npm run test:smoke:prod
```

### 2. Monitor Metrics

- Check error rates
- Monitor response times
- Verify cache hit ratios
- Review logs for warnings

### 3. Update Documentation

- [ ] Update deployment log
- [ ] Document any issues encountered
- [ ] Update runbook with lessons learned

## 📱 Feature Flags

### Gradual Rollout

```typescript
// Enable for percentage of users
const featureEnabled = (userId: string) => {
  const hash = hashUserId(userId);
  return hash % 100 < rolloutPercentage; // 0-100
};
```

### Kill Switch

```typescript
// Emergency disable feature
if (process.env.FEATURE_KILL_SWITCH === 'true') {
  return reply.status(503).send({
    error: 'Feature temporarily unavailable',
  });
}
```

## 🔗 Related Documentation

- [Feature Overview](./README.md)
- [Architecture](./architecture.md)
- [Troubleshooting](./troubleshooting.md)
- [CI/CD Guide](../../guides/infrastructure/ci-cd/README.md)
- [Monitoring Guide](../monitoring/README.md)

---

**Deployment checklist complete?** Monitor production for 24 hours after deployment.
