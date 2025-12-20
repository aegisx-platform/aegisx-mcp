# RBAC Permission Migration Audit Report

**Date:** 2025-10-28
**Phase:** A.1 - Current Authorization Audit
**Status:** Complete ✅

---

## 📊 Executive Summary

- **Total Authorization Usages:** 42 instances
- **Modules Affected:** 4 core modules
- **Migration Strategy:** Role-based → Permission-based
- **Estimated Effort:** 3-4 days

---

## 🔍 Detailed Findings

### Module 1: RBAC Routes (`rbac.routes.ts`)

**Location:** `apps/api/src/core/rbac/rbac.routes.ts`
**Total Routes:** 20+ endpoints
**Current Auth Pattern:** `fastify.authorize(['admin', 'manager'])` or `['admin']`

| Line | HTTP Method | Endpoint                                   | Current Auth   | Proposed Permission                 |
| ---- | ----------- | ------------------------------------------ | -------------- | ----------------------------------- |
| 48   | GET         | `/rbac/roles`                              | admin, manager | `rbac:roles:list`                   |
| 76   | GET         | `/rbac/roles/:id`                          | admin, manager | `rbac:roles:read`                   |
| 103  | POST        | `/rbac/roles`                              | admin          | `rbac:roles:create`                 |
| 127  | PUT         | `/rbac/roles/:id`                          | admin          | `rbac:roles:update`                 |
| 153  | DELETE      | `/rbac/roles/:id`                          | admin          | `rbac:roles:delete`                 |
| 181  | GET         | `/rbac/permissions`                        | admin, manager | `rbac:permissions:list`             |
| 206  | GET         | `/rbac/permissions/:id`                    | admin, manager | `rbac:permissions:read`             |
| 230  | POST        | `/rbac/permissions`                        | admin          | `rbac:permissions:create`           |
| 254  | PUT         | `/rbac/permissions/:id`                    | admin          | `rbac:permissions:update`           |
| 279  | DELETE      | `/rbac/permissions/:id`                    | admin          | `rbac:permissions:delete`           |
| 306  | GET         | `/rbac/user-roles`                         | admin, manager | `rbac:user-roles:list`              |
| 329  | POST        | `/rbac/users/:id/roles`                    | admin          | `rbac:user-roles:assign`            |
| 355  | DELETE      | `/rbac/users/:userId/roles/:roleId`        | admin          | `rbac:user-roles:remove`            |
| 381  | PUT         | `/rbac/users/:userId/roles/:roleId/expiry` | admin          | `rbac:user-roles:update-expiry`     |
| 411  | POST        | `/rbac/bulk/assign-roles`                  | admin          | `rbac:bulk:assign-roles`            |
| 435  | POST        | `/rbac/bulk/update-roles`                  | admin          | `rbac:bulk:update-roles`            |
| 459  | POST        | `/rbac/bulk/update-permissions`            | admin          | `rbac:bulk:update-permissions`      |
| 486  | GET         | `/rbac/stats`                              | admin, manager | `rbac:stats:read`                   |
| 510  | GET         | `/rbac/roles/hierarchy`                    | admin, manager | `rbac:roles:read-hierarchy`         |
| 542  | GET         | `/rbac/permissions/by-category`            | admin, manager | `rbac:permissions:read-by-category` |

**Additional Endpoints:**

- Line 570: GET `/rbac/users/:id/effective-permissions` → `rbac:user-permissions:read`

**Total:** 21 routes to migrate

---

### Module 2: Settings Routes (`settings.routes.ts`)

**Location:** `apps/api/src/core/settings/settings.routes.ts`
**Total Routes:** 7 endpoints
**Current Auth Pattern:** `fastify.authorize(['admin'])` or `['admin', 'manager']`

| Line | HTTP Method | Endpoint                | Current Auth   | Proposed Permission           |
| ---- | ----------- | ----------------------- | -------------- | ----------------------------- |
| 23   | GET         | `/settings/system`      | admin, manager | `settings:system:read`        |
| 51   | GET         | `/settings/system/:key` | admin, manager | `settings:system:read`        |
| 75   | POST        | `/settings/system`      | admin          | `settings:system:create`      |
| 100  | PUT         | `/settings/system/:key` | admin          | `settings:system:update`      |
| 127  | DELETE      | `/settings/system/:key` | admin          | `settings:system:delete`      |
| 153  | POST        | `/settings/system/bulk` | admin          | `settings:system:bulk-update` |
| 179  | GET         | `/settings/cache/stats` | admin, manager | `settings:cache:read-stats`   |

**Additional Endpoints:**

- Line 229: POST `/settings/cache/clear` → admin → `settings:cache:clear`
- Line 271: POST `/settings/cache/clear/:key` → admin → `settings:cache:clear-key`
- Line 313: GET `/settings/categories` → admin → `settings:categories:list`
- Line 355: GET `/settings/categories/:category` → admin → `settings:categories:read`
- Line 399: GET `/settings/validation/:key` → admin, manager, user → `settings:validation:check`

**Total:** 12 routes to migrate

---

### Module 3: Users Routes (`users.routes.ts`)

**Location:** `apps/api/src/core/users/users.routes.ts`
**Total Routes:** 12+ endpoints
**Current Auth Pattern:** `fastify.authorize(['admin', 'manager'])`

| Line | HTTP Method | Endpoint                    | Current Auth         | Proposed Permission    |
| ---- | ----------- | --------------------------- | -------------------- | ---------------------- |
| 23   | GET         | `/users`                    | admin, manager       | `users:list`           |
| 51   | GET         | `/users/:id`                | admin, manager       | `users:read`           |
| 75   | POST        | `/users`                    | admin                | `users:create`         |
| 100  | PUT         | `/users/:id`                | admin                | `users:update`         |
| 127  | DELETE      | `/users/:id`                | admin                | `users:delete`         |
| 153  | PATCH       | `/users/:id/status`         | admin                | `users:update-status`  |
| 179  | GET         | `/users/search`             | admin, manager       | `users:search`         |
| 229  | POST        | `/users/bulk/create`        | admin                | `users:bulk-create`    |
| 271  | PUT         | `/users/bulk/update`        | admin                | `users:bulk-update`    |
| 313  | DELETE      | `/users/bulk/delete`        | admin                | `users:bulk-delete`    |
| 355  | POST        | `/users/:id/password-reset` | admin                | `users:reset-password` |
| 399  | GET         | `/users/:id/activity-log`   | admin, manager, user | `users:read-activity`  |

**Total:** 12 routes to migrate

---

### Module 4: File Upload Routes (`file-upload.routes.ts`)

**Location:** `apps/api/src/core/file-upload/file-upload.routes.ts`
**Total Routes:** 2 endpoints
**Current Auth Pattern:** `fastify.authorize(['admin'])`

| Line | HTTP Method | Endpoint                   | Current Auth | Proposed Permission       |
| ---- | ----------- | -------------------------- | ------------ | ------------------------- |
| 239  | POST        | `/files/configure-storage` | admin        | `files:storage:configure` |
| 431  | POST        | `/files/cleanup`           | admin        | `files:cleanup:execute`   |

**Total:** 2 routes to migrate

---

## 📋 Migration Summary

### By Module

| Module      | Routes | Complexity | Priority    |
| ----------- | ------ | ---------- | ----------- |
| RBAC        | 21     | High       | 🔴 Critical |
| Settings    | 12     | Medium     | 🟠 High     |
| Users       | 12     | Medium     | 🟠 High     |
| File Upload | 2      | Low        | 🟡 Medium   |
| **Total**   | **47** | -          | -           |

### By Permission Pattern

| Resource Category   | Actions                                                          | Count | Example                   |
| ------------------- | ---------------------------------------------------------------- | ----- | ------------------------- |
| RBAC Management     | list, read, create, update, delete, assign, remove, bulk         | 21    | `rbac:roles:create`       |
| Settings Management | read, create, update, delete, bulk, clear                        | 12    | `settings:system:update`  |
| User Management     | list, read, create, update, delete, search, bulk, reset-password | 12    | `users:create`            |
| File Management     | configure, cleanup                                               | 2     | `files:storage:configure` |

---

## 🎯 Proposed Permission Structure

### Naming Convention

```
{resource}:{sub-resource}:{action}
or
{resource}:{action}
```

### Examples

```typescript
// RBAC Permissions
'rbac:roles:list';
'rbac:roles:read';
'rbac:roles:create';
'rbac:roles:update';
'rbac:roles:delete';
'rbac:permissions:list';
'rbac:user-roles:assign';

// Settings Permissions
'settings:system:read';
'settings:system:update';
'settings:cache:clear';

// User Permissions
'users:list';
'users:create';
'users:update';
'users:delete';
'users:bulk-create';

// File Permissions
'files:storage:configure';
'files:cleanup:execute';
```

---

## 🚀 Migration Plan

### Phase A.3: RBAC Routes (Day 1)

- **Routes:** 21 endpoints
- **Effort:** 4-6 hours
- **Files:** 1 file (`rbac.routes.ts`)
- **Approach:**
  1. Define all RBAC permissions
  2. Add to permission seeds
  3. Update each route one by one
  4. Test with Postman/API client

### Phase A.4: Settings Routes (Day 1-2)

- **Routes:** 12 endpoints
- **Effort:** 3-4 hours
- **Files:** 1 file (`settings.routes.ts`)
- **Approach:** Same as RBAC

### Phase A.5: Users & File Upload Routes (Day 2)

- **Routes:** 14 endpoints (12 + 2)
- **Effort:** 3-4 hours
- **Files:** 2 files
- **Approach:** Same as above

### Phase A.6: Testing (Day 2-3)

- **Effort:** 4-6 hours
- **Scope:** Test all 47 migrated routes
- **Method:**
  1. Create test user with specific permissions
  2. Test each endpoint
  3. Verify permission checks work
  4. Document any issues

---

## ⚠️ Migration Risks

### High Risk

1. **Breaking existing functionality** - All routes currently use role-based auth
2. **Permission seeding** - Must ensure all permissions exist in database
3. **Admin wildcard** - Must preserve admin's full access (_._)

### Medium Risk

1. **Testing coverage** - 47 routes to test manually
2. **Documentation updates** - API docs need permission info
3. **Frontend impact** - Need to update API calls expectations

### Low Risk

1. **Performance** - verifyPermission does more DB queries
2. **Migration rollback** - Can revert if issues found

---

## ✅ Readiness Checklist

- [x] Audit completed
- [x] Permission structure designed
- [x] Migration plan created
- [ ] Permission seeds created (Next: Phase A.2)
- [ ] Backend routes migrated (Next: Phase A.3-A.5)
- [ ] Testing completed (Next: Phase A.6)
- [ ] Documentation updated
- [ ] Frontend guards created (Phase A.7-A.10)

---

## 📝 Notes

1. **verifyPermission already exists** - auth.strategies.ts lines 68-137
2. **Wildcard support** - `*:*`, `resource:*`, `*:action` already implemented
3. **Admin role** - Should have `*:*` permission for backward compatibility
4. **Manager role** - Should have read permissions for most resources

---

**Next Step:** Phase A.2 - Create Permission Seeds
