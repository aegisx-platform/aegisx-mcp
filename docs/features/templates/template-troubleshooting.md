---
title: '[Feature Name] Troubleshooting'
description: 'Common issues, error messages, and solutions for [Feature Name]'
category: features
tags: [troubleshooting, debugging, support]
order: 6
---

# [Feature Name] Troubleshooting

Common issues and solutions for the [Feature Name] feature.

## 🔍 Quick Diagnostics

### Check Feature Status

```bash
# Check if feature is enabled
curl http://localhost:3000/api/health/feature

# Check database connection
pnpm run db:check

# Check logs
docker logs aegisx-api | grep feature
```

## ❌ Common Issues

### Issue 1: [Error Message or Symptom]

**Symptom:**

```
Error: Feature initialization failed
```

**Cause:**
Database table not migrated or missing required columns.

**Solution:**

```bash
# Run migrations
pnpm run db:migrate

# Verify table exists
psql -d aegisx -c "\d features"
```

**Prevention:**
Always run migrations after pulling latest code.

---

### Issue 2: [Authentication/Authorization Errors]

**Symptom:**

```json
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid token"
}
```

**Cause:**

- JWT token expired
- Invalid API key
- Missing authentication header

**Solution:**

```typescript
// Ensure token is included
const response = await fetch('/api/feature', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Or use API key
const response = await fetch('/api/feature', {
  headers: {
    'X-API-Key': apiKey,
  },
});
```

**Prevention:**
Implement token refresh logic in frontend.

---

### Issue 3: [Validation Errors]

**Symptom:**

```json
{
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "name",
      "message": "Required field is missing"
    }
  ]
}
```

**Cause:**
Request payload doesn't match schema requirements.

**Solution:**
Check [API Reference](./api-reference.md) for correct request format.

**Correct Request:**

```json
{
  "name": "Valid Name",
  "description": "Optional description"
}
```

---

### Issue 4: [Performance Issues]

**Symptom:**

- Slow response times
- Timeouts
- High CPU usage

**Diagnostics:**

```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM features WHERE name = 'test';

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/feature
```

**Solutions:**

1. **Add Database Indexes:**

```sql
CREATE INDEX idx_features_name ON features(name);
CREATE INDEX idx_features_created_at ON features(created_at DESC);
```

2. **Implement Caching:**

```typescript
// Enable Redis caching
const cached = await redis.get(`feature:${id}`);
if (cached) return JSON.parse(cached);
```

3. **Optimize Queries:**

```typescript
// Use pagination
const features = await repo.findMany({
  limit: 20,
  offset: (page - 1) * 20,
});
```

---

### Issue 5: [WebSocket Connection Issues]

**Symptom:**
Real-time updates not working.

**Diagnostics:**

```typescript
// Check WebSocket connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

**Solutions:**

1. **Verify Authentication:**

```typescript
const socket = io('ws://localhost:3000', {
  auth: { token: jwtToken },
});
```

2. **Check CORS Settings:**

```typescript
// apps/api/src/app.ts
fastify.register(cors, {
  origin: 'http://localhost:4200',
  credentials: true,
});
```

3. **Firewall/Proxy:**
   Ensure WebSocket connections are not blocked by firewall or reverse proxy.

---

## 🐛 Debugging Guide

### Enable Debug Logging

**Backend:**

```bash
# Set log level
LOG_LEVEL=debug pnpm run dev:api
```

**Frontend:**

```typescript
// Enable Angular debug mode
import { isDevMode } from '@angular/core';

if (isDevMode()) {
  console.log('Debug mode enabled');
}
```

### Inspect Database State

```sql
-- Check feature records
SELECT * FROM features ORDER BY created_at DESC LIMIT 10;

-- Check for orphaned records
SELECT * FROM features WHERE deleted_at IS NOT NULL;

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM features WHERE name LIKE '%search%';
```

### Network Debugging

```bash
# Monitor HTTP requests
curl -v http://localhost:3000/api/feature

# Check WebSocket handshake
wscat -c ws://localhost:3000 -H "Authorization: Bearer ${TOKEN}"
```

## 📊 Error Reference

### HTTP Status Codes

| Code | Meaning               | Common Causes                               |
| ---- | --------------------- | ------------------------------------------- |
| 400  | Bad Request           | Invalid request payload, validation errors  |
| 401  | Unauthorized          | Missing or invalid authentication           |
| 403  | Forbidden             | Insufficient permissions                    |
| 404  | Not Found             | Resource doesn't exist                      |
| 409  | Conflict              | Duplicate resource, concurrent modification |
| 422  | Unprocessable Entity  | Business logic validation failed            |
| 500  | Internal Server Error | Unexpected server error, check logs         |
| 503  | Service Unavailable   | Database connection failed, service down    |

### Error Codes

| Code                       | Description                 | Solution                        |
| -------------------------- | --------------------------- | ------------------------------- |
| `FEATURE_NOT_FOUND`        | Feature doesn't exist       | Check ID, ensure not deleted    |
| `DUPLICATE_FEATURE`        | Feature name already exists | Use unique name                 |
| `INVALID_FEATURE_STATE`    | Invalid state transition    | Check feature lifecycle         |
| `FEATURE_DEPENDENCY_ERROR` | Related resource missing    | Ensure dependencies exist first |

## 🆘 Getting Help

If you can't resolve the issue:

1. **Check Logs:**

   ```bash
   # API logs
   docker logs aegisx-api --tail 100

   # Database logs
   docker logs aegisx-db --tail 100
   ```

2. **Search Issues:** [GitHub Issues](https://github.com/aegisx-platform/aegisx-starter-1/issues)

3. **Ask for Help:**
   - Create detailed bug report
   - Include error messages, logs, and steps to reproduce
   - Mention environment (dev/staging/production)

## 📋 Diagnostic Checklist

Before reporting an issue, verify:

- [ ] Latest code pulled (`git pull origin main`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Database migrated (`pnpm run db:migrate`)
- [ ] Environment variables configured
- [ ] Services running (API, database, Redis)
- [ ] No conflicts in console/logs
- [ ] Issue reproducible in clean environment

## 🔗 Related Documentation

- [Feature Overview](./README.md)
- [Developer Guide](./developer-guide.md)
- [Architecture](./architecture.md)
- [API Reference](./api-reference.md)

---

**Still stuck?** Open an [issue](https://github.com/aegisx-platform/aegisx-starter-1/issues/new) with full details.
