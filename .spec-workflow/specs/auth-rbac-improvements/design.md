# Auth & RBAC Improvements - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                Auth Flow (Improved)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Request → verifyJWT                            │
│     ├─ JWT verification                             │
│     ├─ Soft delete check                            │
│     └─ Structured logging (no console.log)          │
│                                                     │
│  2. verifyPermission                                │
│     ├─ Check Redis cache                            │
│     ├─ Query DB (optimized with indexes) ✨         │
│     ├─ Cache result                                  │
│     └─ Validate wildcards                           │
│                                                     │
│  3. Cache Invalidation (NEW) ✨                     │
│     ├─ On role assignment/removal                   │
│     ├─ On permission changes                        │
│     └─ Pattern-based invalidation                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Component Design

### 1. Logging Improvement

#### File: `auth.strategies.ts`

**Before:**

```typescript
console.log('[DEBUG] verifyJWT - START');
console.log('[DEBUG] verifyJWT - Calling jwtVerify');
console.log('[DEBUG] verifyJWT - JWT verified successfully');
```

**After:**

```typescript
request.log.debug({ userId: user.id }, 'JWT verification started');
request.log.debug({ userId: user.id }, 'JWT verified successfully');
```

**Pattern:**

```typescript
// Development-only debug logging
if (process.env.NODE_ENV !== 'production') {
  request.log.debug({ context }, 'Debug message');
}

// Or use log level configuration
request.log.debug({ context }, 'This only shows in dev/staging');
```

### 2. Cache Invalidation Design

#### 2.1 Cache Invalidation Service

**New File:** `apps/api/src/layers/core/auth/services/permission-cache-invalidation.service.ts`

```typescript
export class PermissionCacheInvalidationService {
  constructor(
    private permissionCache: PermissionCacheService,
    private logger: FastifyLoggerInstance,
  ) {}

  /**
   * Invalidate cache for a single user
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.permissionCache.delete(userId);
    this.logger.info({ userId }, 'Permission cache invalidated for user');
  }

  /**
   * Invalidate cache for multiple users
   */
  async invalidateUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((id) => this.permissionCache.delete(id)));
    this.logger.info({ count: userIds.length }, 'Permission cache invalidated for multiple users');
  }

  /**
   * Invalidate all users who have a specific role
   */
  async invalidateUsersWithRole(roleId: string): Promise<void> {
    const userIds = await this.getUserIdsWithRole(roleId);
    await this.invalidateUsers(userIds);
  }

  /**
   * Clear all permission caches (use sparingly)
   */
  async invalidateAll(): Promise<void> {
    await this.permissionCache.clear();
    this.logger.warn('All permission caches invalidated');
  }

  private async getUserIdsWithRole(roleId: string): Promise<string[]> {
    // Query user_roles table for active assignments
    const results = await this.knex('user_roles').where('role_id', roleId).where('is_active', true).select('user_id');

    return results.map((r) => r.user_id);
  }
}
```

#### 2.2 Integration Points

**Trigger cache invalidation in RBAC service:**

```typescript
// apps/api/src/layers/platform/rbac/rbac.service.ts

class RbacService {
  constructor(
    private repository: RbacRepository,
    private cacheInvalidation: PermissionCacheInvalidationService,
  ) {}

  async assignRoleToUser(userId: string, roleId: string) {
    // Assign role
    await this.repository.assignRole(userId, roleId);

    // Invalidate user's permission cache
    await this.cacheInvalidation.invalidateUser(userId);

    return { success: true };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    // Remove role
    await this.repository.removeRole(userId, roleId);

    // Invalidate user's permission cache
    await this.cacheInvalidation.invalidateUser(userId);

    return { success: true };
  }

  async updateRolePermissions(roleId: string, permissions: string[]) {
    // Update permissions
    await this.repository.updatePermissions(roleId, permissions);

    // Invalidate all users with this role
    await this.cacheInvalidation.invalidateUsersWithRole(roleId);

    return { success: true };
  }

  async bulkAssignRoles(userIds: string[], roleIds: string[]) {
    // Bulk assign
    await this.repository.bulkAssign(userIds, roleIds);

    // Invalidate all affected users
    await this.cacheInvalidation.invalidateUsers(userIds);

    return { success: true };
  }
}
```

### 3. Database Indexes Design

#### Migration File

**New File:** `apps/api/src/database/migrations/YYYYMMDDHHMMSS_add_rbac_performance_indexes.ts`

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Index 1: user_roles(user_id, is_active)
  // Used by: Permission query filtering active role assignments
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_active
    ON user_roles(user_id, is_active)
  `);

  // Index 2: role_permissions(role_id)
  // Used by: Permission query joining role → permissions
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_permissions_role
    ON role_permissions(role_id)
  `);

  // Index 3: permissions(resource, action)
  // Used by: Permission query distinct resource:action
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permissions_resource_action
    ON permissions(resource, action)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_user_roles_user_active`);
  await knex.raw(`DROP INDEX IF EXISTS idx_role_permissions_role`);
  await knex.raw(`DROP INDEX IF EXISTS idx_permissions_resource_action`);
}
```

**Note:** Uses `CREATE INDEX CONCURRENTLY` to avoid locking tables during index creation.

## Query Performance Impact

### Before Optimization:

```sql
-- No indexes on join columns
SELECT DISTINCT permissions.resource, permissions.action
FROM user_roles
JOIN roles ON user_roles.role_id = roles.id
JOIN role_permissions ON roles.id = role_permissions.role_id
JOIN permissions ON role_permissions.permission_id = permissions.id
WHERE user_roles.user_id = ?
  AND user_roles.is_active = true;

-- Estimated cost: 500-1000 (Sequential scans)
```

### After Optimization:

```sql
-- Same query with indexes
-- idx_user_roles_user_active: Filters user_roles efficiently
-- idx_role_permissions_role: Fast join on role_id
-- idx_permissions_resource_action: Fast distinct lookup

-- Estimated cost: 50-100 (Index scans)
-- Expected improvement: 5-10x faster
```

## Cache Invalidation Scenarios

### Scenario 1: Single User Role Assignment

```
User A assigned "Manager" role
→ Invalidate cache for User A only
→ Next request: Query DB, cache new permissions
```

### Scenario 2: Role Permission Update

```
"Manager" role gains "reports:delete" permission
→ Find all users with "Manager" role
→ Invalidate cache for all affected users
→ Next requests: Query DB, cache new permissions
```

### Scenario 3: Bulk Role Assignment

```
100 users assigned "Viewer" role
→ Invalidate cache for all 100 users
→ Use Promise.all for parallel invalidation
→ Complete in <100ms
```

### Scenario 4: Emergency Cache Clear

```
Admin triggers "Clear all caches"
→ Redis FLUSHDB or pattern-based delete
→ All users re-query permissions on next request
```

## Error Handling

### Cache Invalidation Failures

```typescript
try {
  await cacheInvalidation.invalidateUser(userId);
} catch (error) {
  // Log error but don't fail the operation
  logger.error({ error, userId }, 'Cache invalidation failed - cache may be stale');
  // Continue with success response
  // User will get fresh permissions on next request
}
```

**Rationale:** Cache invalidation failures shouldn't block RBAC operations. Stale cache is better than failed operation.

## Configuration

### Environment Variables

```bash
# Logging
LOG_LEVEL=debug|info|warn|error  # Default: info

# Cache
REDIS_ENABLED=true|false          # Default: true
PERMISSION_CACHE_TTL=3600         # Default: 1 hour
CACHE_INVALIDATION_ENABLED=true   # Default: true

# Performance
DB_INDEX_CONCURRENCY=true         # Use CONCURRENTLY for indexes
```

## Testing Strategy

### Unit Tests

1. Test cache invalidation service methods
2. Test logging doesn't use console.log
3. Test cache invalidation error handling

### Integration Tests

1. Assign role → verify cache invalidated
2. Update permissions → verify all affected users invalidated
3. Bulk operations → verify parallel invalidation

### Performance Tests

1. Measure query time before/after indexes
2. Measure cache invalidation time
3. Verify no regression in auth flow

## Rollback Plan

### If Issues Occur:

1. **Logging Issues:** Revert to console.log temporarily
2. **Cache Issues:** Disable cache invalidation via env var
3. **Index Issues:** Drop indexes with migration rollback

## Security Considerations

1. **Log Sanitization:** No sensitive data (passwords, tokens) in logs
2. **Cache Timing:** Invalidation shouldn't leak user existence
3. **Index Security:** Indexes don't expose data, only improve performance

## Monitoring

### Metrics to Track:

- Cache hit/miss ratio
- Cache invalidation frequency
- Query execution time
- Failed cache invalidations

### Alerts:

- Cache invalidation failure rate > 1%
- Query time > 100ms after indexes
- Cache hit rate < 80%

## Documentation Updates

Files to update:

1. `docs/architecture/backend-architecture.md` - Add cache invalidation
2. `docs/guides/development/claude-detailed-rules.md` - No console.log rule
3. `README.md` - Updated auth flow diagram

## Migration Path

### Phase 1: Logging (Immediate)

1. Remove console.log statements
2. Add structured logging
3. Test in development

### Phase 2: Indexes (Same deployment)

1. Run migration
2. Verify indexes created
3. Monitor query performance

### Phase 3: Cache Invalidation (Same deployment)

1. Create invalidation service
2. Integrate with RBAC service
3. Deploy with feature flag

### Phase 4: Verification (Post-deployment)

1. Monitor cache metrics
2. Verify no stale permissions
3. Check performance improvements
