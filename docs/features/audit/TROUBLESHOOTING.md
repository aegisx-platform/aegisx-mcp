# Audit System Troubleshooting

**Common issues and solutions**

Version: 1.0.0
Last Updated: 2025-11-02

## Table of Contents

- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)
- [Data Issues](#data-issues)

## Frontend Issues

### Issue: Audit pages not loading

**Symptoms:**

- Browser shows "Page not found" or loading spinner
- Console error: "Cannot match any routes"

**Causes:**

- Routes not registered correctly
- Lazy loading module not found
- Auth guard blocking access

**Solutions:**

```typescript
// 1. Verify routes registered in app.routes.ts
{
  path: 'audit',
  loadChildren: () => import('./core/audit/audit.routes')
    .then((m) => m.auditRoutes),
  canActivate: [AuthGuard],  // Make sure using correct guard
}

// 2. Check audit.routes.ts imports
import { AuthGuard } from '../auth/guards/auth.guard';  // Not authGuard!

// 3. Clear browser cache and rebuild
pnpm nx build web --configuration=development
```

### Issue: Data not displaying in table

**Symptoms:**

- Table shows "No data found"
- Loading spinner never stops
- Console errors about undefined data

**Causes:**

- API endpoint returning errors
- State not updating correctly
- Service subscription not called

**Solutions:**

```typescript
// 1. Check browser console for API errors
// Network tab should show successful responses

// 2. Verify service subscription
ngOnInit() {
  this.loginAttemptsService.getLoginAttempts({
    page: 1,
    limit: 25,
  }).subscribe(); // Don't forget .subscribe()!
}

// 3. Check signals are bound correctly
loginAttempts = this.loginAttemptsService.loginAttempts; // Not loginAttempts()

// 4. Verify backend is running
curl http://localhost:3333/api/login-attempts
```

### Issue: Filters not working

**Symptoms:**

- Changing filters doesn't update table
- Search returns all results

**Causes:**

- Query parameters not passed correctly
- Debouncing issues
- State not updating

**Solutions:**

```typescript
// 1. Check filter change handler
onFilterChange(): void {
  this.loadLoginAttempts(); // Should reload data
}

// 2. Verify query building
const query: LoginAttemptsQuery = {
  page: this.currentPage(),
  limit: this.pageSize,
  search: this.searchQuery || undefined,  // Undefined if empty
  success: this.statusFilter !== null ? this.statusFilter : undefined,
};

// 3. Check API receives correct parameters
// Network tab → Query String Parameters should show filters
```

### Issue: Export not downloading

**Symptoms:**

- Click export button, nothing happens
- Console error about blob or download

**Causes:**

- CORS headers missing Content-Disposition
- Blob creation failing
- Download link not triggered

**Solutions:**

```typescript
// 1. Check backend sends Content-Disposition header
response.header('Content-Disposition', 'attachment; filename="login-attempts.csv"');

// 2. Verify service creates download link
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
window.URL.revokeObjectURL(url);

// 3. Test direct API call
curl -o test.csv http://localhost:3333/api/login-attempts/export
```

## Backend Issues

### Issue: 401 Unauthorized errors

**Symptoms:**

- API returns "Unauthorized"
- Status code 401

**Causes:**

- Missing JWT token
- Expired JWT token
- Invalid token format

**Solutions:**

```bash
# 1. Verify token in request headers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3333/api/login-attempts

# 2. Check token expiration
# Decode JWT at jwt.io and verify 'exp' claim

# 3. Refresh token
# Login again to get new token
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Issue: 403 Forbidden errors

**Symptoms:**

- API returns "Insufficient permissions"
- Status code 403

**Causes:**

- User missing required permission
- Wrong permission check in code

**Solutions:**

```sql
-- 1. Check user permissions
SELECT p.name
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN users u ON u.role_id = r.id
WHERE u.email = 'user@example.com';

-- Should include: audit:read, audit:delete, etc.

-- 2. Grant missing permission
INSERT INTO role_permissions (role_id, permission_id)
VALUES (
  (SELECT id FROM roles WHERE name = 'user'),
  (SELECT id FROM permissions WHERE name = 'audit:read')
);

-- 3. Verify permission in backend code
async verifyPermission(request, reply) {
  if (!request.user.permissions.includes('audit:read')) {
    return reply.forbidden('Insufficient permissions');
  }
}
```

### Issue: Rate limit exceeded

**Symptoms:**

- API returns "Too many requests"
- Status code 429

**Causes:**

- Too many requests in short period
- Rate limit too restrictive

**Solutions:**

```javascript
// 1. Check rate limit headers in response
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1730548800

// 2. Wait until reset time
// Or implement exponential backoff

// 3. Adjust rate limits if too restrictive
// apps/api/src/core/audit/routes/login-attempts.routes.ts
rateLimit: {
  max: 100,  // Increase from 60
  timeWindow: '1 minute'
}
```

### Issue: 500 Internal Server Error

**Symptoms:**

- API returns generic error
- Status code 500

**Causes:**

- Database connection failed
- Unhandled exception in code
- Missing environment variables

**Solutions:**

```bash
# 1. Check API logs
tail -f /var/log/api-server.log

# 2. Verify database connection
psql -h localhost -U app_user -d prod_db -c "SELECT 1"

# 3. Check environment variables
echo $DATABASE_URL
echo $JWT_SECRET

# 4. Test query directly
psql -d prod_db -c "SELECT * FROM login_attempts LIMIT 1"
```

## Database Issues

### Issue: Slow query performance

**Symptoms:**

- API responses taking >5 seconds
- Database high CPU usage

**Causes:**

- Missing indexes
- Large dataset without pagination
- Inefficient query

**Solutions:**

```sql
-- 1. Check if indexes exist
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename = 'login_attempts';

-- 2. Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM login_attempts
WHERE created_at > '2025-11-01'
ORDER BY created_at DESC
LIMIT 25;

-- Should use index scan, not sequential scan

-- 3. Recreate missing indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at
  ON login_attempts(created_at DESC);

-- 4. Vacuum and analyze tables
VACUUM ANALYZE login_attempts;
VACUUM ANALYZE file_audit_logs;
```

### Issue: "Relation does not exist" errors

**Symptoms:**

- API error: "relation "login_attempts" does not exist"

**Causes:**

- Migrations not run
- Wrong database connection
- Wrong schema

**Solutions:**

```bash
# 1. Check current migrations
pnpm run db:migrations:list

# 2. Run pending migrations
pnpm run db:migrate

# 3. Verify tables exist
psql -d your_db -c "\dt"

# Should show: login_attempts, file_audit_logs

# 4. Check database connection
echo $DATABASE_URL
# Should point to correct database
```

### Issue: Foreign key constraint violations

**Symptoms:**

- Error: "violates foreign key constraint"
- Cannot insert audit record

**Causes:**

- Referenced user doesn't exist
- User was deleted

**Solutions:**

```sql
-- 1. Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname LIKE '%login_attempts%';

-- 2. Verify user exists before inserting
SELECT id FROM users WHERE id = 'user-uuid';

-- 3. If user deleted, use NULL for user_id
INSERT INTO login_attempts (user_id, email, ...)
VALUES (NULL, 'deleted-user@example.com', ...);
-- ON DELETE SET NULL handles this automatically
```

## Performance Issues

### Issue: Large CSV exports timeout

**Symptoms:**

- Export button shows loading forever
- Request times out after 60 seconds

**Causes:**

- Too many records to export
- No pagination on export endpoint
- Server timeout too short

**Solutions:**

```javascript
// 1. Limit export size
const MAX_EXPORT_ROWS = 100000;

async exportAttempts(query) {
  const countResult = await this.repository.count(query);

  if (countResult > MAX_EXPORT_ROWS) {
    throw new Error(`Export limited to ${MAX_EXPORT_ROWS} rows`);
  }

  // Continue with export
}

// 2. Stream CSV instead of building in memory
const { Transform } = require('stream');
const csvStream = new Transform({
  transform(chunk, encoding, callback) {
    // Convert to CSV row
    callback(null, csvRow);
  }
});

// 3. Increase server timeout
fastify.server.timeout = 300000; // 5 minutes
```

### Issue: Frontend memory leaks

**Symptoms:**

- Browser becomes slow after using audit pages
- Memory usage keeps increasing

**Causes:**

- RxJS subscriptions not cleaned up
- Event listeners not removed

**Solutions:**

```typescript
// 1. Use takeUntil pattern
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getLoginAttempts()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// 2. Or use async pipe (automatic cleanup)
loginAttempts$ = this.service.getLoginAttempts();

// Template:
<div *ngFor="let attempt of loginAttempts$ | async">
  {{ attempt.email }}
</div>
```

## Security Issues

### Issue: Sensitive data in logs

**Symptoms:**

- Passwords or tokens in application logs

**Causes:**

- Logging entire request/response objects
- Debug mode in production

**Solutions:**

```javascript
// 1. Sanitize logs
function sanitizeLog(data) {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
}

logger.info(sanitizeLog(request.body));

// 2. Use log levels
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Full request:', request.body);
} else {
  logger.info('Login attempt:', { email: request.body.email });
}

// 3. Configure pino redaction
const logger = pino({
  redact: ['password', 'token', 'secret', '*.password'],
});
```

### Issue: SQL injection vulnerability

**Symptoms:**

- Audit logs contain unusual SQL syntax
- Unexpected database behavior

**Causes:**

- String concatenation in queries
- Not using parameterized queries

**Solutions:**

```javascript
// ❌ WRONG - SQL injection vulnerable
const email = request.query.search;
const query = `SELECT * FROM login_attempts WHERE email = '${email}'`;

// ✅ CORRECT - Use parameterized queries
const query = knex('login_attempts').where('email', request.query.search);

// Knex automatically parameterizes queries
```

## Data Issues

### Issue: Duplicate audit logs

**Symptoms:**

- Same event logged multiple times

**Causes:**

- Multiple event listeners
- Retry logic creating duplicates

**Solutions:**

```javascript
// 1. Use idempotency keys
async createLoginAttempt(data) {
  const idempotencyKey = `${data.email}_${data.ip}_${Date.now()}`;

  // Check if already exists
  const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return existing;
  }

  return this.repository.create({ ...data, idempotencyKey });
}

// 2. Debounce audit logging
let auditTimer;
function logAudit(data) {
  clearTimeout(auditTimer);
  auditTimer = setTimeout(() => {
    // Actually log to database
    createAuditLog(data);
  }, 100);
}
```

### Issue: Missing audit logs

**Symptoms:**

- Events not being logged
- Gaps in audit trail

**Causes:**

- Try-catch swallowing errors
- Audit logging not awaited
- Transaction rollback

**Solutions:**

```javascript
// 1. Always await audit logging
await this.auditService.create({...});

// 2. Log audit outside of transaction
async uploadFile(request, reply) {
  let fileResult;

  try {
    fileResult = await db.transaction(async (trx) => {
      // File upload logic
      return uploadedFile;
    });

    // ✅ Log success AFTER transaction commits
    await this.auditService.logSuccess(fileResult);

  } catch (error) {
    // ✅ Log failure OUTSIDE transaction
    await this.auditService.logFailure(error);
    throw error;
  }
}

// 3. Never silently catch audit errors
try {
  await this.auditService.create({...});
} catch (error) {
  logger.error('Failed to create audit log:', error);
  // Don't throw - audit failure shouldn't break main flow
  // But DO log the error for investigation
}
```

### Issue: Incorrect timestamps

**Symptoms:**

- Audit timestamps don't match actual event time
- Timezone issues

**Causes:**

- Using local time instead of UTC
- Server timezone misconfigured

**Solutions:**

```javascript
// 1. Always use UTC for timestamps
const now = new Date().toISOString(); // UTC ISO 8601

// 2. PostgreSQL should store as TIMESTAMPTZ
CREATE TABLE login_attempts (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

// 3. Verify server timezone
SELECT current_setting('TIMEZONE'); -- Should be UTC

// 4. Convert to user timezone in frontend
formatDate(date: string): string {
  return new Date(date).toLocaleString(); // Browser's timezone
}
```

## Getting Help

If none of these solutions work:

1. **Check Logs**
   - Backend: `tail -f /var/log/api-server.log`
   - Frontend: Browser console (F12)
   - Database: `tail -f /var/log/postgresql/postgresql.log`

2. **Enable Debug Mode**

   ```bash
   DEBUG=* pnpm run dev:api
   ```

3. **Review Documentation**
   - [API_REFERENCE.md](./API_REFERENCE.md)
   - [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
   - [ARCHITECTURE.md](./ARCHITECTURE.md)

4. **Contact Support**
   - Create issue on GitHub
   - Contact development team
   - Check project documentation

---

**Related Documentation:**

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Integration guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production setup
