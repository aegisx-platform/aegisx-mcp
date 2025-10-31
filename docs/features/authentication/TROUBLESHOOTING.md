# Authentication - Troubleshooting Guide

> **Quick reference for resolving common issues and debugging**

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Support Level:** Production

---

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Integration Issues](#integration-issues)
- [Debug Procedures](#debug-procedures)
- [Getting Help](#getting-help)

---

## 🚨 Quick Diagnostics

### Health Check Commands

```bash
# API health check
curl http://localhost:3333/api/health

# Check feature endpoint
curl -X GET http://localhost:3333/api/authentication \
  -H "Authorization: Bearer <token>"

# Check database connection
psql -h localhost -U postgres -d aegisx_dev \
  -c "SELECT 1 FROM [table_name] LIMIT 1;"

# Check Redis connection
redis-cli ping

# Check logs
pm2 logs aegisx-api --lines 100
# OR
docker logs -f aegisx-api
```

### Quick Fixes

| Symptom | Quick Fix | Details |
|---------|-----------|---------|
| API not responding | Restart service | `pm2 restart aegisx-api` or `docker restart aegisx-api` |
| Database errors | Check migrations | `pnpm run knex migrate:status` |
| Cache issues | Clear Redis | `redis-cli FLUSHDB` |
| Port conflicts | Check port usage | `lsof -i :3333` (kill conflicting process) |
| Build errors | Clean & rebuild | `pnpm nx reset && pnpm install` |

---

## 🐛 Common Issues

### Issue 1: Feature Not Loading

**Symptoms:**
- Blank page or loading spinner
- Console errors: "Failed to fetch"
- Network errors in DevTools

**Possible Causes:**
1. Backend API not running
2. Incorrect API URL configuration
3. CORS issues
4. Missing permissions

**Solutions:**

**Step 1: Verify Backend is Running**
```bash
# Check API server status
curl http://localhost:3333/api/health

# Expected response:
# {"status":"healthy","timestamp":"..."}

# If not running:
pnpm run dev:api
```

**Step 2: Check API Configuration**
```bash
# Frontend environment
cat apps/web/src/environments/environment.ts

# Should have:
# apiUrl: 'http://localhost:3333/api'

# Backend environment
cat .env.local | grep API_PORT
# Should match frontend URL port
```

**Step 3: Verify CORS Settings**
```typescript
// apps/api/src/main.ts
fastify.register(cors, {
  origin: ['http://localhost:4200'], // Frontend URL
  credentials: true,
});
```

**Step 4: Check User Permissions**
```bash
# Query user permissions
psql -h localhost -U postgres -d aegisx_dev \
  -c "SELECT p.resource, p.action
      FROM permissions p
      JOIN user_role_permissions urp ON p.id = urp.permission_id
      JOIN user_roles ur ON ur.id = urp.user_role_id
      WHERE ur.user_id = '<user-uuid>';"
```

---

### Issue 2: Create/Update Operations Failing

**Symptoms:**
- Form submission returns 400/422 errors
- Validation error messages
- Data not saved to database

**Possible Causes:**
1. Schema validation failures
2. Missing required fields
3. Unique constraint violations
4. Foreign key constraint errors

**Solutions:**

**Step 1: Check Request Payload**
```bash
# Open browser DevTools → Network tab
# Find failed request → View request payload
# Compare with schema definition

# Check schema:
cat apps/api/src/core/[feature]/schemas/[feature].schemas.ts
```

**Step 2: Test API Directly**
```bash
# Test with curl
curl -X POST http://localhost:3333/api/[feature] \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "isActive": true
  }'

# Check response for detailed error
```

**Step 3: Check Database Constraints**
```sql
-- List table constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = '[table_name]';

-- Check unique constraint violations
SELECT * FROM [table_name]
WHERE name = 'duplicate-name';
```

**Step 4: Review Backend Logs**
```bash
# PM2 logs
pm2 logs aegisx-api --lines 50 --err

# Docker logs
docker logs aegisx-api --tail 50

# Look for validation errors or database errors
```

---

### Issue 3: Permission Denied (403 Errors)

**Symptoms:**
- "Access denied" or "Forbidden" errors
- HTTP 403 responses
- Features hidden or disabled in UI

**Possible Causes:**
1. User lacks required permissions
2. Permission not seeded in database
3. Wrong permission check in code
4. Cache not invalidated after permission change

**Solutions:**

**Step 1: Verify Required Permission**
```typescript
// Check route permission requirement
// apps/api/src/core/[feature]/routes/index.ts
preValidation: [
  fastify.authenticate,
  fastify.verifyPermission('[feature]', 'read'), // Required permission
]
```

**Step 2: Check User Has Permission**
```sql
-- Check if permission exists
SELECT * FROM permissions
WHERE resource = '[feature]' AND action = 'read';

-- Check if user has permission
SELECT u.email, r.name as role, p.resource, p.action
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN user_role_permissions urp ON ur.id = urp.user_role_id
JOIN permissions p ON urp.permission_id = p.id
WHERE u.id = '<user-uuid>'
  AND p.resource = '[feature]'
  AND p.action = 'read';
```

**Step 3: Grant Permission if Missing**
```sql
-- Find permission ID
SELECT id FROM permissions
WHERE resource = '[feature]' AND action = 'read';

-- Find user role ID
SELECT id FROM user_roles
WHERE user_id = '<user-uuid>' AND role_id = (
  SELECT id FROM roles WHERE name = 'Admin'
);

-- Grant permission
INSERT INTO user_role_permissions (user_role_id, permission_id)
VALUES ('<user-role-id>', '<permission-id>');
```

**Step 4: Clear Permission Cache**
```bash
# Clear Redis permission cache
redis-cli KEYS "permissions:*" | xargs redis-cli DEL

# OR flush entire cache
redis-cli FLUSHDB
```

---

### Issue 4: Slow Performance

**Symptoms:**
- Long loading times (>3 seconds)
- High memory usage
- Database timeouts

**Possible Causes:**
1. Missing database indexes
2. N+1 query problems
3. Large result sets without pagination
4. Cache not being used

**Solutions:**

**Step 1: Identify Slow Queries**
```sql
-- Enable query logging
ALTER DATABASE aegisx_dev SET log_min_duration_statement = 100;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Step 2: Add Missing Indexes**
```sql
-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = '[table_name]';

-- Add indexes for common queries
CREATE INDEX idx_[table]_[field] ON [table_name]([field]);
CREATE INDEX idx_[table]_created_at ON [table_name](created_at);
CREATE INDEX idx_[table]_user_id ON [table_name](user_id);
```

**Step 3: Implement Pagination**
```typescript
// Backend: Always use pagination
const { items, total } = await repository.findAll({
  page: request.query.page || 1,
  limit: Math.min(request.query.limit || 10, 100), // Max 100
});

// Frontend: Implement pagination
<mat-paginator
  [length]="total()"
  [pageSize]="10"
  [pageSizeOptions]="[10, 25, 50]"
  (page)="onPageChange($event)">
</mat-paginator>
```

**Step 4: Enable Caching**
```typescript
// Backend service
async findAll(): Promise<Feature[]> {
  const cacheKey = 'features:all';

  // Check cache first
  let cached = await this.cacheService.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query database
  const features = await this.repository.findAll();

  // Store in cache (1 hour)
  await this.cacheService.setex(cacheKey, 3600, JSON.stringify(features));

  return features;
}
```

---

### Issue 5: WebSocket Events Not Working

**Symptoms:**
- Real-time updates not appearing
- Events not received in frontend
- Console errors about WebSocket

**Possible Causes:**
1. Not subscribed to correct channel
2. Event emission not implemented
3. WebSocket connection dropped
4. Incorrect event name

**Solutions:**

**Step 1: Verify WebSocket Connection**
```typescript
// Check connection status in frontend
this.wsService.connectionStatus$.subscribe(status => {
  console.log('WebSocket status:', status); // Should be 'connected'
});

// Check socket instance
console.log(this.wsService.socket?.connected); // Should be true
```

**Step 2: Check Event Subscription**
```typescript
// Verify subscription
this.wsService.subscribeToEvent('features', 'features', 'created')
  .pipe(takeUntil(this.destroy$))
  .subscribe((event) => {
    console.log('Event received:', event);
  });

// Log all events for debugging
this.wsService.socket?.onAny((eventName, ...args) => {
  console.log('Event:', eventName, args);
});
```

**Step 3: Verify Backend Event Emission**
```typescript
// Check controller emits events
await this.eventService
  .for('features', 'features')
  .emitCustom('created', feature, 'normal');

// Add debug logging
this.logger.info(`Event emitted: features:created`, { id: feature.id });
```

**Step 4: Check Network Tab**
```bash
# Open browser DevTools → Network → WS (WebSocket)
# Should see messages with:
# Type: message
# Data: {"event":"features:created","data":{...}}
```

---

## ⚠️ Error Messages

### Backend Errors

#### `ERROR: invalid input syntax for type uuid`

**Meaning:** Invalid UUID format passed to PostgreSQL

**Solution:**
```typescript
// Validate UUID before query
import { validate as isValidUUID } from 'uuid';

if (!isValidUUID(id)) {
  throw new BadRequestError('Invalid ID format');
}
```

#### `ERROR: duplicate key value violates unique constraint`

**Meaning:** Trying to insert duplicate value in unique column

**Solution:**
```typescript
// Handle gracefully
try {
  await repository.create(data);
} catch (error) {
  if (error.code === '23505') { // PostgreSQL unique violation
    throw new ConflictError('Item with this name already exists');
  }
  throw error;
}
```

#### `ERROR: relation "[table_name]" does not exist`

**Meaning:** Database table not created (missing migration)

**Solution:**
```bash
# Check migration status
pnpm run knex migrate:status

# Run pending migrations
pnpm run knex migrate:latest

# Verify table exists
psql -h localhost -U postgres -d aegisx_dev -c "\dt"
```

#### `UnauthorizedError: No token provided`

**Meaning:** Missing Authorization header

**Solution:**
```typescript
// Ensure token is sent
this.httpClient.get<Feature[]>(url, {
  headers: {
    Authorization: `Bearer ${this.authService.getToken()}`
  }
});
```

---

### Frontend Errors

#### `NullInjectorError: No provider for FeatureService`

**Meaning:** Service not provided in module

**Solution:**
```typescript
// Add to providers
@Component({
  providers: [FeatureService] // Provide at component level
})
// OR add providedIn: 'root' in service
@Injectable({ providedIn: 'root' })
```

#### `ExpressionChangedAfterItHasBeenCheckedError`

**Meaning:** Signal/state changed during change detection

**Solution:**
```typescript
// Use setTimeout to defer update
setTimeout(() => {
  this.signal.set(newValue);
}, 0);

// OR use ChangeDetectorRef
constructor(private cdr: ChangeDetectorRef) {}

this.signal.set(newValue);
this.cdr.detectChanges();
```

#### `Cannot read property 'subscribe' of undefined`

**Meaning:** Trying to subscribe to undefined observable

**Solution:**
```typescript
// Add null check
this.wsService.subscribeToEvent('features', 'features', 'created')
  ?.pipe(takeUntil(this.destroy$))
  .subscribe((event) => {
    // Handle event
  });

// OR check connection first
if (this.wsService.socket?.connected) {
  this.wsService.subscribeToEvent(...).subscribe(...);
}
```

---

## 🔍 Debug Procedures

### Backend Debugging

**Step 1: Enable Debug Logging**
```typescript
// apps/api/src/main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

**Step 2: Add Debug Breakpoints**
```typescript
// Use debugger statement
async create(data: CreateFeature): Promise<Feature> {
  debugger; // Will pause here if debugging
  return this.repository.create(data);
}
```

**Step 3: Check Database Queries**
```typescript
// Enable Knex debug mode
const knex = Knex({
  client: 'postgresql',
  debug: true, // Log all SQL queries
  connection: { /* config */ }
});
```

### Frontend Debugging

**Step 1: Check Signal Values**
```typescript
// Use effect to log signal changes
effect(() => {
  console.log('Features:', this.featuresSignal());
  console.log('Loading:', this.loadingSignal());
  console.log('Error:', this.errorSignal());
});
```

**Step 2: Network Inspection**
```bash
# Open Chrome DevTools → Network tab
# Filter by XHR/Fetch
# Check request/response for each API call
```

**Step 3: Angular DevTools**
```bash
# Install Angular DevTools extension
# Open DevTools → Angular tab
# Inspect component state and signals
```

---

## 📞 Getting Help

### Self-Service Resources

1. **Feature Documentation**: [README.md](./README.md)
2. **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
3. **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
4. **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

### Contact Support

- **Email**: support@aegisx.example.com
- **Slack**: #feature-support
- **GitHub Issues**: Create issue with logs and steps to reproduce

### Reporting Bugs

**Please include:**
1. **Environment**: Development/Staging/Production
2. **Steps to reproduce**: Exact steps that cause the issue
3. **Expected result**: What should happen
4. **Actual result**: What actually happened
5. **Error logs**: Backend logs, frontend console errors
6. **Screenshots**: If UI-related
7. **Database state**: Relevant table data if applicable

**Bug Report Template:**
```markdown
## Environment
- Environment: Development
- Node Version: 20.x
- Browser: Chrome 120
- OS: macOS Sonoma

## Steps to Reproduce
1. Navigate to Features page
2. Click "Create New"
3. Fill form and submit
4. Error appears

## Expected Result
Feature should be created successfully

## Actual Result
500 Internal Server Error

## Error Logs
[Paste backend logs here]

## Screenshots
[Attach screenshots here]

## Additional Context
This started happening after [recent change]
```

---

## 🔧 Advanced Debugging

### Database Query Analysis

```sql
-- Check table statistics
SELECT * FROM pg_stat_user_tables
WHERE schemaname = 'public' AND relname = '[table_name]';

-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM [table_name]
WHERE user_id = '<uuid>'
ORDER BY created_at DESC
LIMIT 10;

-- Check table size
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Memory Profiling

```bash
# Node.js heap dump
node --inspect apps/api/src/main.ts

# Open Chrome → chrome://inspect
# Click "Open dedicated DevTools for Node"
# Take heap snapshot

# PM2 memory monitoring
pm2 monit
```

### Performance Profiling

```bash
# Backend profiling with clinic
pnpm add -D clinic
clinic doctor -- node apps/api/src/main.ts

# Frontend profiling
# Chrome DevTools → Performance tab
# Record → Perform actions → Stop → Analyze
```

---

## 📚 Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation details
- [API Reference](./API_REFERENCE.md) - API documentation
- [Architecture](./ARCHITECTURE.md) - System design
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup

---

**Last Updated:** 2025-10-31
**Maintainer:** DevOps Team
**Support Level:** Production
