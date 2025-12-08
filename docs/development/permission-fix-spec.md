# Permission System Fix - Implementation Spec

**Created:** 2024-12-08
**Status:** Ready for Implementation
**Approach:** Wildcard Permission (Approach 3)

---

## 📋 Table of Contents

1. [Problem Summary](#problem-summary)
2. [Solution Overview](#solution-overview)
3. [Implementation Plan](#implementation-plan)
4. [Files to Modify](#files-to-modify)
5. [Migration Scripts](#migration-scripts)
6. [Testing Checklist](#testing-checklist)
7. [Rollback Plan](#rollback-plan)

---

## 🔴 Problem Summary

### Current State

**Issue:** Admin users get 403 Forbidden when accessing new inventory modules

**Root Cause:**

- ✅ Backend and Frontend already support wildcard `*:*` permission
- ❌ Wildcard permission is **NOT created** in database
- ❌ Current fix duplicates permissions to admin role in every migration
- ❌ Unsustainable and violates RBAC best practices

**Impact:**

- 17 permission migrations with duplicated admin assignments
- Every new module requires manual admin permission assignment
- Database bloat with 100+ duplicate permission assignments
- Performance degradation from complex permission queries

---

## ✅ Solution Overview

### Approach 3: Wildcard Permission System

**Concept:**

- Create ONE wildcard permission: `resource='*', action='*'`
- Assign wildcard to admin role ONCE
- Remove admin from all module migrations
- Admin automatically has access to ALL current and future modules

**Benefits:**

- ✅ Clean RBAC architecture
- ✅ Auto-access for new modules
- ✅ No permission duplication
- ✅ Best performance (single wildcard check)
- ✅ Maintainable and scalable

**Architecture:**

```
Admin User → Admin Role → Wildcard Permission (*:*)
                              ↓
                    ✅ Access to EVERYTHING

Module User → Module Role → Module Permissions (inventory:drugs:read, etc.)
                                ↓
                      ✅ Access to specific modules only
```

---

## 🛠 Implementation Plan

### Phase 1: Create Wildcard Permission (NEW)

**Step 1.1:** Create migration `011_add_admin_wildcard_permission.ts`

- Create wildcard permission `*:*`
- Assign wildcard to admin role
- Remove ALL existing admin permission assignments

**Step 1.2:** Verify wildcard permission in database

```sql
SELECT * FROM permissions WHERE resource = '*' AND action = '*';
SELECT * FROM role_permissions WHERE role_id = 'admin';
```

---

### Phase 2: Clean Up Module Migrations (REVERT)

**Step 2.1:** Update all 17 inventory permission migrations

- Remove admin from roleAssignments array
- Keep only module role assignment

**Files to update:**

```
apps/api/src/database/migrations-inventory/
├── 20251207073443_add_locations_permissions.ts
├── 20251207073502_add_departments_permissions.ts
├── 20251207073511_add_companies_permissions.ts
├── 20251207073532_add_drugGenerics_permissions.ts
├── 20251207073543_add_dosageForms_permissions.ts
├── 20251207073553_add_drugUnits_permissions.ts
├── 20251207073615_add_budgetTypes_permissions.ts
├── 20251207073626_add_budgetCategories_permissions.ts
├── 20251207073636_add_contracts_permissions.ts
├── 20251207073659_add_contractItems_permissions.ts
├── 20251207073709_add_bank_permissions.ts
├── 20251207073719_add_hospitals_permissions.ts
├── 20251207073843_add_returnActions_permissions.ts
├── 20251207074320_add_budgets_permissions.ts
├── 20251207074424_add_drugComponents_permissions.ts
├── 20251207074439_add_drugFocusLists_permissions.ts
├── 20251207074455_add_drugPackRatios_permissions.ts
├── 20251207074512_add_adjustmentReasons_permissions.ts
└── 20251207082328_add_drugs_permissions.ts
```

**Change pattern:**

```typescript
// BEFORE (Current - Wrong)
roleAssignments: [
  { roleId: 'drugs', permissions: DRUGS_PERMISSIONS },
  { roleId: 'admin', permissions: DRUGS_PERMISSIONS }, // ❌ Remove this
];

// AFTER (Correct)
roleAssignments: [
  { roleId: 'drugs', permissions: DRUGS_PERMISSIONS },
  // Admin gets access via wildcard - no need to add here
];
```

---

### Phase 3: Update CRUD Generator Template (PREVENT FUTURE ISSUES)

**Step 3.1:** Update backend route template
**File:** `libs/aegisx-cli/templates/backend/domain/route.hbs`

**Current code:** (Lines with admin roleAssignment)

```handlebars
roleAssignments: [ { roleId: '{{camelCase tableName}}', permissions: {{constantCase tableName}}_PERMISSIONS }, { roleId: 'admin', permissions: {{constantCase tableName}}_PERMISSIONS }, // ❌ Remove ]
```

**New code:**

```handlebars
roleAssignments: [ { roleId: '{{camelCase tableName}}', permissions: {{constantCase tableName}}_PERMISSIONS }, // Admin role has wildcard permission (*:*) - no explicit assignment needed ]
```

**Step 3.2:** Update permission migration template
**File:** Check if there's a separate migration template that needs updating

---

### Phase 4: Database Migration & Cache Clear

**Step 4.1:** Reset database to apply changes

```bash
# Option 1: Full reset (recommended for dev)
pnpm run db:reset

# Option 2: Manual SQL cleanup (for production)
# See "Manual SQL Cleanup Script" below
```

**Step 4.2:** Clear Redis permission cache

```bash
# Connect to Redis
docker exec -it aegisx-redis redis-cli

# Clear permission cache
KEYS permission:*
# For each key, run:
DEL permission:{user_id}

# Or clear all cache (nuclear option)
FLUSHALL
```

**Step 4.3:** Restart API server

```bash
pnpm run dev:api
```

---

## 📁 Files to Modify

### 1. NEW Migration: Create Wildcard Permission

**File:** `apps/api/src/database/migrations/011_add_admin_wildcard_permission.ts`
**Action:** CREATE NEW
**Priority:** HIGH
**Details:** See [Migration Scripts](#migration-scripts) section

---

### 2. Update 17 Inventory Permission Migrations

**Directory:** `apps/api/src/database/migrations-inventory/`
**Action:** REMOVE admin roleAssignment from all files
**Priority:** HIGH

**Script to update all files:**

```python
# See automated script in Migration Scripts section
```

---

### 3. Update CRUD Generator Template

**File:** `libs/aegisx-cli/templates/backend/domain/route.hbs`
**Action:** REMOVE admin from roleAssignments
**Priority:** MEDIUM
**Lines:** Find roleAssignments section (around line 80-90)

**Change:**

```diff
roleAssignments: [
  { roleId: '{{camelCase tableName}}', permissions: {{constantCase tableName}}_PERMISSIONS },
- { roleId: 'admin', permissions: {{constantCase tableName}}_PERMISSIONS },
]
```

---

### 4. Update Migration Import Template (if exists)

**File:** `libs/aegisx-cli/templates/backend/import-routes.hbs`
**Action:** Check if this template also generates roleAssignments
**Priority:** LOW

---

## 🔧 Migration Scripts

### Script 1: Create Wildcard Permission Migration

**File:** `apps/api/src/database/migrations/011_add_admin_wildcard_permission.ts`

```typescript
/**
 * Migration: Add Admin Wildcard Permission
 *
 * Creates wildcard permission (*:*) for admin role to provide full system access.
 * This replaces the need to assign permissions to admin role in every module migration.
 *
 * Features:
 * - Creates wildcard permission (*:*)
 * - Assigns wildcard to admin role
 * - Removes all existing admin role permission assignments (cleanup)
 * - Idempotent and safe to run multiple times
 *
 * Architecture:
 * - Admin role → *:* permission → Full access to everything
 * - Module roles → Specific permissions → Limited access
 *
 * Generated: 2024-12-08
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('[Migration] Creating admin wildcard permission...');

  return knex.transaction(async (trx) => {
    // Step 1: Create wildcard permission (idempotent)
    await trx.raw(
      `
      INSERT INTO permissions (resource, action, description, category, is_system_permission, is_active, created_at, updated_at)
      VALUES ('*', '*', 'Full system access (wildcard)', 'system', true, true, NOW(), NOW())
      ON CONFLICT (resource, action) DO UPDATE
      SET
        description = 'Full system access (wildcard)',
        category = 'system',
        is_system_permission = true,
        is_active = true,
        updated_at = NOW()
    `,
    );

    console.log('[Migration] Wildcard permission created');

    // Step 2: Get admin role and wildcard permission
    const adminRole = await trx('roles').where('name', 'admin').first();
    if (!adminRole) {
      throw new Error('Admin role not found - run base migrations first');
    }

    const wildcardPermission = await trx('permissions').where('resource', '*').where('action', '*').first();

    if (!wildcardPermission) {
      throw new Error('Failed to create wildcard permission');
    }

    // Step 3: Remove ALL existing admin permission assignments
    // This cleans up the duplicated permissions from module migrations
    console.log('[Migration] Removing existing admin permission assignments...');
    const deletedCount = await trx('role_permissions').where('role_id', adminRole.id).del();

    console.log(`[Migration] Removed ${deletedCount} duplicate admin permissions`);

    // Step 4: Assign wildcard permission to admin role
    await trx.raw(
      `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `,
      [adminRole.id, wildcardPermission.id],
    );

    console.log('[Migration] Wildcard permission assigned to admin role');
    console.log('[Migration] ✅ Admin now has full system access via *:* wildcard');
  });
}

export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] Removing admin wildcard permission...');

  // Remove wildcard permission (cascade will remove role_permissions)
  await knex('permissions').where('resource', '*').where('action', '*').del();

  console.log('[Migration] Wildcard permission removed');
  console.log('[Migration] ⚠️  Admin role no longer has automatic full access');
  console.log('[Migration] ⚠️  You may need to manually restore admin permissions');
}
```

---

### Script 2: Clean Module Migrations (Python)

**File:** `/tmp/clean_module_migrations.py`

```python
#!/usr/bin/env python3
"""
Clean admin roleAssignment from all inventory permission migrations.
This script removes the duplicate admin permission assignments, as admin
now gets full access via wildcard permission (*:*).
"""

import os
import re

migrations_dir = "/Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1/apps/api/src/database/migrations-inventory"

# All inventory permission migration files
files_to_clean = [
    "20251207073443_add_locations_permissions.ts",
    "20251207073502_add_departments_permissions.ts",
    "20251207073511_add_companies_permissions.ts",
    "20251207073532_add_drugGenerics_permissions.ts",
    "20251207073543_add_dosageForms_permissions.ts",
    "20251207073553_add_drugUnits_permissions.ts",
    "20251207073615_add_budgetTypes_permissions.ts",
    "20251207073626_add_budgetCategories_permissions.ts",
    "20251207073636_add_contracts_permissions.ts",
    "20251207073659_add_contractItems_permissions.ts",
    "20251207073709_add_bank_permissions.ts",
    "20251207073719_add_hospitals_permissions.ts",
    "20251207073843_add_returnActions_permissions.ts",
    "20251207074320_add_budgets_permissions.ts",
    "20251207074424_add_drugComponents_permissions.ts",
    "20251207074439_add_drugFocusLists_permissions.ts",
    "20251207074455_add_drugPackRatios_permissions.ts",
    "20251207074512_add_adjustmentReasons_permissions.ts",
    "20251207082328_add_drugs_permissions.ts",
]

for filename in files_to_clean:
    filepath = os.path.join(migrations_dir, filename)
    if not os.path.exists(filepath):
        print(f"⏭️  {filename} - NOT FOUND")
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern: Remove the admin roleAssignment block
    # Match: },\n      {\n        roleId: 'admin',\n        permissions: XXX_PERMISSIONS,\n      },
    pattern = r',\n(\s+)\{\n\s+roleId: [\'"]admin[\'"]\s*,\n\s+permissions: [A-Z_]+_PERMISSIONS\s*,\n\s+\}'

    new_content = re.sub(pattern, '', content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"✅ {filename} - CLEANED")
    else:
        print(f"⏭️  {filename} - NO ADMIN FOUND (already clean)")

print("\n=== Migration cleanup complete ===")
print("✅ All module migrations now use wildcard permission for admin")
```

**Usage:**

```bash
python /tmp/clean_module_migrations.py
```

---

### Script 3: Manual SQL Cleanup (Production)

**For production environments where db:reset is not an option:**

```sql
-- Step 1: Create wildcard permission
INSERT INTO permissions (resource, action, description, category, is_system_permission, is_active, created_at, updated_at)
VALUES ('*', '*', 'Full system access (wildcard)', 'system', true, true, NOW(), NOW())
ON CONFLICT (resource, action) DO NOTHING;

-- Step 2: Get admin role ID
SELECT id FROM roles WHERE name = 'admin';
-- Copy the admin role ID (e.g., 'admin-uuid-here')

-- Step 3: Remove all existing admin permission assignments
DELETE FROM role_permissions
WHERE role_id = 'admin-uuid-here';

-- Step 4: Get wildcard permission ID
SELECT id FROM permissions WHERE resource = '*' AND action = '*';
-- Copy the wildcard permission ID (e.g., 'wildcard-uuid-here')

-- Step 5: Assign wildcard to admin role
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
VALUES ('admin-uuid-here', 'wildcard-uuid-here', NOW(), NOW())
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 6: Verify admin permissions
SELECT p.resource, p.action, p.description
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = 'admin-uuid-here';

-- Expected result: Only ONE row with resource='*', action='*'
```

---

## ✅ Testing Checklist

### Pre-Implementation Tests

- [ ] Backup database

  ```bash
  pg_dump -U postgres -d aegisx > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Document current permission count

  ```sql
  SELECT COUNT(*) FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'admin');
  ```

- [ ] Test current admin access (should fail on inventory modules)

---

### Post-Migration Tests

#### 1. Database Verification

- [ ] Wildcard permission exists

  ```sql
  SELECT * FROM permissions WHERE resource = '*' AND action = '*';
  ```

- [ ] Admin role has ONLY wildcard permission

  ```sql
  SELECT p.resource, p.action
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_id = (SELECT id FROM roles WHERE name = 'admin');
  -- Expected: 1 row with *:*
  ```

- [ ] Module roles still have their permissions
  ```sql
  SELECT p.resource, p.action
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_id = (SELECT id FROM roles WHERE name = 'drugs');
  -- Expected: 5 rows (create, read, update, delete, export)
  ```

---

#### 2. Backend API Tests

- [ ] Admin user login successful

  ```bash
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@aegisx.local","password":"Admin123!"}'
  ```

- [ ] Admin can access all 17 inventory modules

  ```bash
  # Test each module
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/inventory/drugs
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/inventory/hospitals
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/inventory/locations
  # ... test all 17 modules
  ```

- [ ] Regular user (non-admin) still restricted

  ```bash
  # Login as regular user
  # Should get 403 on modules they don't have permission for
  ```

- [ ] Check permission cache is working
  ```bash
  # Check Redis
  docker exec -it aegisx-redis redis-cli
  KEYS permission:*
  GET permission:<admin-user-id>
  # Should contain ["*:*"]
  ```

---

#### 3. Frontend Tests

- [ ] Admin login works
- [ ] Admin can navigate to all inventory modules
- [ ] No 403 errors in browser console
- [ ] Permission-based UI elements show correctly
  - Create buttons visible
  - Edit actions enabled
  - Delete actions enabled
  - Export options available

---

#### 4. New Module Test (Future-Proof)

- [ ] Generate new CRUD module

  ```bash
  pnpm run crud -- test_suppliers --domain inventory/master-data --schema inventory --force
  ```

- [ ] Run migration

  ```bash
  pnpm run db:migrate
  ```

- [ ] Verify admin can access immediately (without any additional permission assignment)

  ```bash
  curl -H "Authorization: Bearer <admin-token>" http://localhost:3000/api/inventory/test-suppliers
  # Expected: 200 OK
  ```

- [ ] Check generated migration does NOT have admin in roleAssignments
  ```typescript
  // In the generated migration file
  roleAssignments: [
    { roleId: 'testSuppliers', permissions: TEST_SUPPLIERS_PERMISSIONS },
    // Should NOT have admin here
  ];
  ```

---

## 🔄 Rollback Plan

### If Something Goes Wrong

#### Quick Rollback (Development)

```bash
# 1. Restore database from backup
psql -U postgres -d aegisx < backup_YYYYMMDD_HHMMSS.sql

# 2. Restart API server
pnpm run dev:api

# 3. Clear Redis cache
docker exec -it aegisx-redis redis-cli FLUSHALL
```

---

#### Rollback Migration Only

```bash
# Rollback the wildcard migration
pnpm run db:rollback

# This will:
# - Remove wildcard permission
# - You'll need to restore admin permissions manually
```

---

#### Manual Rollback SQL

```sql
-- 1. Remove wildcard permission assignment
DELETE FROM role_permissions
WHERE permission_id = (SELECT id FROM permissions WHERE resource = '*' AND action = '*');

-- 2. Delete wildcard permission
DELETE FROM permissions WHERE resource = '*' AND action = '*';

-- 3. Restore admin permissions (if needed)
-- You'll need to run the old migrations again to restore admin access
```

---

## 📊 Success Criteria

### Must Have (Blocking)

- ✅ Wildcard permission created in database
- ✅ Admin role has ONLY wildcard permission
- ✅ Admin user can access all 17 inventory modules
- ✅ No 403 errors for admin users
- ✅ Permission cache cleared and working

### Should Have (Important)

- ✅ All 17 module migrations cleaned (admin removed)
- ✅ CRUD generator updated (no future admin duplication)
- ✅ Regular users still properly restricted
- ✅ Performance improved (fewer permission checks)

### Nice to Have (Optional)

- ✅ Documentation updated (README, ARCHITECTURE docs)
- ✅ Migration script automated
- ✅ Test suite updated

---

## 📝 Implementation Order

1. ✅ **CREATE** wildcard migration (`011_add_admin_wildcard_permission.ts`)
2. ✅ **TEST** migration in isolation (create → verify → rollback → recreate)
3. ✅ **CLEAN** all 17 module migrations (remove admin roleAssignments)
4. ✅ **UPDATE** CRUD generator template
5. ✅ **RESET** database (`pnpm run db:reset`)
6. ✅ **CLEAR** Redis cache
7. ✅ **TEST** admin access to all modules
8. ✅ **VERIFY** new module generation works
9. ✅ **COMMIT** all changes

---

## 🚀 Ready to Implement?

**Estimated Time:** 30-45 minutes
**Risk Level:** Low (easily reversible)
**Impact:** High (fixes 403 errors + improves architecture)

**Next Steps:**

1. Review this spec
2. Create backup
3. Execute Phase 1 (create wildcard migration)
4. Test thoroughly
5. Execute Phase 2-4 if Phase 1 succeeds

---

**Questions or concerns? Discuss before implementation!**
