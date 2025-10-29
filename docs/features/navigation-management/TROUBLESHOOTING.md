# Navigation Management Troubleshooting Guide

> **Quick solutions to common issues and problems**

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
  - [Menu Items Not Appearing](#menu-items-not-appearing)
  - [Permission Issues](#permission-issues)
  - [Cache Problems](#cache-problems)
  - [Database Errors](#database-errors)
  - [Frontend Display Issues](#frontend-display-issues)
- [API Errors](#api-errors)
- [Performance Issues](#performance-issues)
- [Development Issues](#development-issues)
- [Debug Techniques](#debug-techniques)
- [FAQ](#faq)

---

## Quick Diagnostics

### Health Check Checklist

Run through this checklist when experiencing issues:

```bash
# 1. Check backend is running
curl http://localhost:3333/health

# 2. Check authentication token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/auth/me

# 3. Check navigation API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user

# 4. Check database connection
psql -h localhost -U aegisx -d aegisx_dev -c "SELECT COUNT(*) FROM navigation_items;"

# 5. Check Redis connection (if using cache)
redis-cli ping
```

### Quick Fixes

| Problem           | Quick Fix                              |
| ----------------- | -------------------------------------- |
| Menu not updating | Clear browser cache + localStorage     |
| Permission denied | Check user has required permission     |
| Items not visible | Check `disabled` and `show_in_*` flags |
| 500 errors        | Check backend logs for stack trace     |
| Blank screen      | Check browser console for errors       |

---

## Common Issues

### Menu Items Not Appearing

#### Problem: Created menu item but it doesn't show up

**Possible Causes:**

1. **Permission not assigned**

   ```sql
   -- Check if item has permissions assigned
   SELECT ni.id, ni.key, ni.title,
          ARRAY_AGG(p.resource || '.' || p.action) as permissions
   FROM navigation_items ni
   LEFT JOIN navigation_permissions np ON ni.id = np.navigation_item_id
   LEFT JOIN permissions p ON np.permission_id = p.id
   WHERE ni.key = 'your-item-key'
   GROUP BY ni.id;
   ```

   **Solution:**
   - Assign permissions via UI: RBAC → Navigations → Edit → Permissions tab
   - Or make item public by not assigning any permissions

2. **Item is disabled**

   ```sql
   -- Check if item is disabled
   SELECT id, key, title, disabled
   FROM navigation_items
   WHERE key = 'your-item-key';
   ```

   **Solution:**

   ```sql
   UPDATE navigation_items SET disabled = false WHERE key = 'your-item-key';
   ```

3. **Layout visibility flag is false**

   ```sql
   -- Check layout flags
   SELECT id, key, show_in_default, show_in_compact,
          show_in_horizontal, show_in_mobile
   FROM navigation_items
   WHERE key = 'your-item-key';
   ```

   **Solution:**

   ```sql
   UPDATE navigation_items
   SET show_in_default = true
   WHERE key = 'your-item-key';
   ```

4. **User doesn't have required permission**

   ```sql
   -- Check user permissions
   SELECT u.username, r.name as role, p.resource, p.action
   FROM users u
   JOIN user_roles ur ON u.id = ur.user_id
   JOIN roles r ON ur.role_id = r.id
   JOIN role_permissions rp ON r.id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE u.id = 'user-uuid';
   ```

   **Solution:**
   - Assign user to role with required permission
   - Or make menu item public (no permissions required)

5. **Cache not cleared**
   **Solution:**

   ```bash
   # Clear Redis cache
   redis-cli KEYS "nav:*" | xargs redis-cli DEL

   # Or restart backend to clear in-memory cache
   ```

#### Problem: Child items not appearing under parent

**Possible Causes:**

1. **Incorrect parent_id**

   ```sql
   -- Check parent-child relationship
   SELECT
     c.id as child_id,
     c.key as child_key,
     c.parent_id,
     p.key as parent_key
   FROM navigation_items c
   LEFT JOIN navigation_items p ON c.parent_id = p.id
   WHERE c.key = 'your-child-item';
   ```

   **Solution:**
   - Update child item with correct parent_id
   - Ensure parent exists and is not disabled

2. **Parent is disabled**

   ```sql
   -- Check if parent is disabled
   SELECT p.key, p.disabled, c.key as child_key
   FROM navigation_items p
   JOIN navigation_items c ON p.id = c.parent_id
   WHERE p.disabled = true;
   ```

   **Solution:**

   ```sql
   UPDATE navigation_items SET disabled = false WHERE id = 'parent-uuid';
   ```

3. **Sort order issues**

   ```sql
   -- Check sort order
   SELECT key, sort_order, parent_id
   FROM navigation_items
   WHERE parent_id = 'parent-uuid'
   ORDER BY sort_order;
   ```

   **Solution:**
   - Reorder items using UI drag-and-drop
   - Or update sort_order manually

---

### Permission Issues

#### Problem: "Permission Denied" error when accessing navigation

**Error Message:**

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "You don't have permission to perform this action"
}
```

**Diagnosis:**

```sql
-- Check user's permissions
SELECT
  u.username,
  r.name as role,
  p.resource,
  p.action,
  CONCAT(p.resource, '.', p.action) as permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = 'user-uuid'
AND (p.resource = 'navigation' OR p.resource = '*');
```

**Required Permissions:**

| Action                 | Required Permission          |
| ---------------------- | ---------------------------- |
| View navigation list   | `navigation:read` or `*:*`   |
| Create navigation item | `navigation:create` or `*:*` |
| Update navigation item | `navigation:update` or `*:*` |
| Delete navigation item | `navigation:delete` or `*:*` |
| Assign permissions     | `navigation:update` or `*:*` |

**Solution:**

```sql
-- Grant navigation permissions to role
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  'role-uuid',
  p.id
FROM permissions p
WHERE p.resource = 'navigation' AND p.action IN ('read', 'create', 'update', 'delete');
```

#### Problem: User sees menu item but gets 403 when clicking

**This is expected behavior** - Two-layer security model:

1. **Menu Visibility (UI Layer)**: User has permission to SEE the menu item
2. **Route Access (Backend Layer)**: User does NOT have permission to ACCESS the route

**Diagnosis:**

```sql
-- Check menu item permissions (what they can see)
SELECT ni.key, ni.link,
       ARRAY_AGG(CONCAT(p.resource, '.', p.action)) as menu_permissions
FROM navigation_items ni
LEFT JOIN navigation_permissions np ON ni.id = np.navigation_item_id
LEFT JOIN permissions p ON np.permission_id = p.id
WHERE ni.link = '/your-route'
GROUP BY ni.id;

-- Check route permissions (what they can access)
-- This depends on your route configuration
```

**Solution:**

- Ensure user has BOTH menu permission AND route permission
- Or remove menu item permission so they don't see it at all

---

### Cache Problems

#### Problem: Changes not reflecting after update

**Symptoms:**

- Updated item title but old title still shows
- Deleted item still appears in menu
- Permission changes not applied

**Diagnosis:**

```bash
# Check Redis cache keys
redis-cli KEYS "nav:*"

# Check specific cache entry
redis-cli GET "nav:global"
redis-cli GET "nav:user:user-uuid:default"
```

**Solution 1: Clear All Navigation Cache**

```bash
# Using Redis CLI
redis-cli KEYS "nav:*" | xargs redis-cli DEL

# Or using Redis SCAN (safer for production)
redis-cli --scan --pattern "nav:*" | xargs redis-cli DEL
```

**Solution 2: Trigger Cache Invalidation via API**

```bash
# Any mutation endpoint automatically clears cache
# So create/update/delete will trigger cache invalidation

# Example: Update any item to force cache clear
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sort_order": 10}' \
  http://localhost:3333/api/navigation-items/item-uuid
```

**Solution 3: Restart Backend**

```bash
# This clears in-memory cache
npm run dev:api  # Restart development server
```

**Prevention:**

- Cache invalidation is automatic on mutations
- If still seeing stale data, check Redis connection
- Verify `REDIS_URL` in `.env` is correct

#### Problem: Cache TTL too short/long

**Symptoms:**

- Cache expires too quickly (frequent database queries)
- Cache expires too slowly (stale data for too long)

**Configuration:**

```typescript
// apps/api/src/core/navigation/services/navigation.service.ts

private readonly CACHE_TTL = {
  GLOBAL_NAV: 3600,        // 1 hour - adjust as needed
  USER_NAV: 1800,          // 30 minutes - adjust as needed
  ITEM_DETAILS: 1800,      // 30 minutes
};
```

**Recommendations:**

- **High traffic, rarely changes**: Increase TTL (e.g., 7200 = 2 hours)
- **Low traffic, changes often**: Decrease TTL (e.g., 600 = 10 minutes)
- **Development**: Use short TTL (e.g., 60 = 1 minute)

---

### Database Errors

#### Problem: Foreign key constraint violation

**Error Message:**

```
ERROR: insert or update on table "navigation_permissions" violates foreign key constraint
```

**Cause:** Trying to assign non-existent permission ID

**Solution:**

```sql
-- Verify permission exists
SELECT id, resource, action
FROM permissions
WHERE id = 'permission-uuid';

-- If doesn't exist, create it first
INSERT INTO permissions (resource, action, description)
VALUES ('your-resource', 'read', 'Description');
```

#### Problem: Cannot delete navigation item with children

**Error Message:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Cannot delete navigation item that has children"
}
```

**Solution:**

```sql
-- Option 1: Delete children first
DELETE FROM navigation_items WHERE parent_id = 'parent-uuid';
DELETE FROM navigation_items WHERE id = 'parent-uuid';

-- Option 2: Reassign children to different parent
UPDATE navigation_items
SET parent_id = 'new-parent-uuid'
WHERE parent_id = 'old-parent-uuid';

-- Option 3: Make children top-level items
UPDATE navigation_items
SET parent_id = NULL
WHERE parent_id = 'parent-uuid';
```

#### Problem: Duplicate key error

**Error Message:**

```
ERROR: duplicate key value violates unique constraint "navigation_items_key_unique"
```

**Solution:**

```sql
-- Check if key already exists
SELECT id, key, title FROM navigation_items WHERE key = 'duplicate-key';

-- Option 1: Use different key
-- (Fix in your code/API call)

-- Option 2: Delete existing item (if safe)
DELETE FROM navigation_items WHERE key = 'duplicate-key';

-- Option 3: Update existing item instead of creating new one
UPDATE navigation_items
SET title = 'New Title', link = '/new-link'
WHERE key = 'duplicate-key';
```

#### Problem: Migration failed

**Error Message:**

```
Error: Migration "20240115000000_create_navigation_tables.ts" failed
```

**Solution:**

```bash
# 1. Check migration status
npm run db:migrate:status

# 2. Rollback failed migration
npm run db:migrate:rollback

# 3. Fix migration file if needed
# Edit: apps/api/src/database/migrations/20240115000000_create_navigation_tables.ts

# 4. Run migration again
npm run db:migrate:latest

# 5. Verify tables exist
psql -h localhost -U aegisx -d aegisx_dev \
  -c "\dt navigation*"
```

---

### Frontend Display Issues

#### Problem: Icons not showing

**Symptoms:**

- See text instead of icon
- Blank space where icon should be

**Cause:** Invalid Material Icon name

**Solution:**

```typescript
// Check valid icon names at: https://fonts.google.com/icons

// Common icon names:
'dashboard', 'person', 'settings', 'home', 'menu',
'folder', 'description', 'analytics', 'people'

// NOT valid:
'user' (use 'person' instead)
'file' (use 'description' instead)
'chart' (use 'analytics' instead)
```

**Verification:**

```html
<!-- Test icon in Angular Material documentation -->
<mat-icon>dashboard</mat-icon>
```

#### Problem: Menu not expanding/collapsing

**Symptoms:**

- Click on collapsible item but nothing happens
- Children not showing

**Diagnosis:**

```typescript
// Check item type in browser console
console.log(navigationItem.type); // Should be 'collapsible'

// Check if children exist
console.log(navigationItem.children); // Should be array with items
```

**Solution:**

```sql
-- Verify parent item type is 'collapsible'
UPDATE navigation_items
SET type = 'collapsible'
WHERE id = 'parent-uuid';

-- Verify children have correct parent_id
SELECT id, key, parent_id
FROM navigation_items
WHERE parent_id = 'parent-uuid';
```

#### Problem: Badge not displaying

**Symptoms:**

- Badge title set but not visible
- Badge shows but wrong color

**Solution:**

```typescript
// Check badge configuration
const item = {
  badge_title: 'New', // Must have value
  badge_variant: 'primary', // 'primary' | 'accent' | 'warn'
  badge_classes: 'custom-class', // Optional CSS classes
};

// Verify badge_title is not null/empty
console.log(item.badge_title); // Should not be null or ''
```

**CSS Classes:**

```css
/* Default badge styles in theme */
.badge-primary {
  background: blue;
}
.badge-accent {
  background: teal;
}
.badge-warn {
  background: red;
}

/* Custom badge classes */
.badge-classes {
  background: #custom-color;
  color: white;
}
```

#### Problem: Navigation not updating after route change

**Symptoms:**

- Active item highlight doesn't update
- Selected item stays selected after navigating away

**Solution:**

```typescript
// Ensure exact_match flag is set correctly
// exact_match: true -> Only highlight if URL matches exactly
// exact_match: false -> Highlight if URL starts with link

// Example:
{
  link: '/rbac',
  exact_match: false,  // Highlights for /rbac, /rbac/roles, /rbac/permissions
}

{
  link: '/dashboard',
  exact_match: true,   // Only highlights for /dashboard, not /dashboard/reports
}
```

---

## API Errors

### 400 Bad Request

**Error Message:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request body"
}
```

**Common Causes:**

1. **Missing required fields**

   ```typescript
   // Required fields for creation:
   {
     key: string,        // ✅ Required
     title: string,      // ✅ Required
     type: string,       // ✅ Required
     sort_order: number  // ✅ Required
   }
   ```

2. **Invalid field types**

   ```typescript
   // Correct types:
   {
     key: "dashboard",              // string, not number
     sort_order: 10,                // number, not string
     show_in_default: true,         // boolean, not string
     permission_ids: ["uuid1"]      // array of strings, not string
   }
   ```

3. **Invalid enum values**

   ```typescript
   // Valid types:
   'item' | 'group' | 'collapsible' | 'divider' | 'spacer';

   // Valid badge variants:
   'primary' | 'accent' | 'warn';
   ```

**Solution:** Check request body against schema in `navigation.schemas.ts`

---

### 401 Unauthorized

**Error Message:**

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**Solution:**

```bash
# 1. Check token is present
echo $TOKEN

# 2. Verify token is valid
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/auth/me

# 3. If invalid, login again
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  http://localhost:3333/api/auth/login

# 4. Extract new token from response
TOKEN="new-token-here"
```

---

### 403 Forbidden

See [Permission Issues](#permission-issues) section above.

---

### 404 Not Found

**Error Message:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Navigation item not found"
}
```

**Solution:**

```sql
-- Verify item exists
SELECT id, key, title FROM navigation_items WHERE id = 'item-uuid';

-- If not found, check if it was deleted
-- (No soft delete in this system, so it's permanently gone)

-- Create new item if needed
```

---

### 500 Internal Server Error

**Error Message:**

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Diagnosis:**

```bash
# Check backend logs
npm run dev:api  # Look for stack trace in console

# Check database connection
psql -h localhost -U aegisx -d aegisx_dev -c "SELECT 1;"

# Check Redis connection
redis-cli ping
```

**Common Causes:**

1. **Database connection lost**
   - Solution: Restart PostgreSQL or check `DATABASE_URL`

2. **Redis connection failed**
   - Solution: Start Redis or disable cache

3. **Invalid SQL query**
   - Solution: Check backend logs for query, fix in code

4. **Unhandled exception**
   - Solution: Check stack trace, add error handling

---

## Performance Issues

### Slow Menu Loading

**Symptoms:**

- Menu takes 2-3 seconds to load
- Database queries taking too long

**Diagnosis:**

```sql
-- Enable query logging
EXPLAIN ANALYZE
SELECT ni.*,
       ARRAY_AGG(DISTINCT CONCAT(p.resource, '.', p.action))
       FILTER (WHERE p.id IS NOT NULL) as permissions
FROM navigation_items ni
LEFT JOIN navigation_permissions np ON ni.id = np.navigation_item_id
LEFT JOIN permissions p ON np.permission_id = p.id
GROUP BY ni.id
ORDER BY ni.sort_order;
```

**Solutions:**

1. **Enable Redis caching**

   ```bash
   # Start Redis
   docker-compose up -d redis

   # Configure in .env
   REDIS_URL=redis://localhost:6379
   ```

2. **Optimize database indexes**

   ```sql
   -- Ensure indexes exist (should be in migration)
   CREATE INDEX IF NOT EXISTS idx_navigation_items_parent
     ON navigation_items(parent_id);

   CREATE INDEX IF NOT EXISTS idx_navigation_items_sort
     ON navigation_items(sort_order);

   CREATE INDEX IF NOT EXISTS idx_navigation_permissions_item
     ON navigation_permissions(navigation_item_id);

   CREATE INDEX IF NOT EXISTS idx_navigation_permissions_perm
     ON navigation_permissions(permission_id);
   ```

3. **Reduce menu depth**
   - Keep hierarchy to 2-3 levels maximum
   - Flatten deeply nested structures

4. **Paginate in management UI**
   - If 100+ items, implement pagination
   - Default: Load only visible items

---

### High Memory Usage

**Symptoms:**

- Backend using too much RAM
- In-memory cache growing too large

**Solution:**

```typescript
// Reduce cache TTL
private readonly CACHE_TTL = {
  GLOBAL_NAV: 1800,   // Reduce from 3600
  USER_NAV: 900,      // Reduce from 1800
};

// Or force Redis usage (disable in-memory fallback)
// Edit: apps/api/src/core/navigation/services/navigation.service.ts
```

---

## Development Issues

### TypeScript Errors After Generating

**Error:**

```
Property 'navigationItems' does not exist on type 'NavigationService'
```

**Solution:**

```bash
# 1. Restart TypeScript server in VS Code
# Command Palette: "TypeScript: Restart TS Server"

# 2. Rebuild
npm run build

# 3. Check import path
import { NavigationService } from '@core/navigation/services/navigation.service';
```

---

### Migration Already Run Error

**Error:**

```
Migration "20240115000000_create_navigation_tables.ts" has already been run
```

**Solution:**

```bash
# Skip if already run (safe)
npm run db:migrate:latest

# Or rollback and re-run
npm run db:migrate:rollback
npm run db:migrate:latest
```

---

### Seed Data Already Exists

**Error:**

```
ERROR: duplicate key value violates unique constraint
```

**Solution:**

```bash
# Option 1: Reset database
npm run db:reset  # Drops, migrates, seeds

# Option 2: Skip existing items in seed
# (Already handled in seed file with ON CONFLICT DO NOTHING)

# Option 3: Manual cleanup
psql -h localhost -U aegisx -d aegisx_dev -c "
  DELETE FROM navigation_permissions;
  DELETE FROM navigation_items;
"
npm run db:seed
```

---

## Debug Techniques

### Enable Debug Logging

```typescript
// apps/api/src/core/navigation/services/navigation.service.ts

// Add console.log statements
async getUserNavigation(userId: string, options: NavigationFilters) {
  console.log('🔍 getUserNavigation called:', { userId, options });

  // Check cache
  const cached = await this.cacheService.get(cacheKey);
  console.log('💾 Cache result:', cached ? 'HIT' : 'MISS');

  // Build navigation
  const items = await this.repository.getNavigationItems();
  console.log('📊 Items from DB:', items.length);

  return filtered;
}
```

### Check Database State

```sql
-- Full navigation structure
SELECT
  ni.id,
  ni.key,
  ni.title,
  ni.type,
  ni.parent_id,
  ni.sort_order,
  ni.disabled,
  ni.show_in_default,
  p_parent.key as parent_key,
  ARRAY_AGG(CONCAT(p.resource, '.', p.action)) as permissions
FROM navigation_items ni
LEFT JOIN navigation_items p_parent ON ni.parent_id = p_parent.id
LEFT JOIN navigation_permissions np ON ni.id = np.navigation_item_id
LEFT JOIN permissions p ON np.permission_id = p.id
GROUP BY ni.id, p_parent.key
ORDER BY ni.sort_order;
```

### Test API Endpoints

```bash
# Test with verbose output
curl -v -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user?type=default

# Save response to file for inspection
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user \
  > navigation-response.json

# Pretty print JSON
cat navigation-response.json | jq '.'
```

### Frontend Debugging

```typescript
// Add to NavigationService
constructor() {
  // Log all navigation changes
  effect(() => {
    console.log('🔄 Navigation updated:', this.navigationSignal());
  });
}

// Add to component
ngOnInit() {
  console.log('📱 Component init, navigation:',
    this.navigationService.navigationSignal());

  this.navigationService.loadUserNavigation().subscribe({
    next: (nav) => console.log('✅ Navigation loaded:', nav),
    error: (err) => console.error('❌ Navigation error:', err)
  });
}
```

---

## FAQ

### Q: How do I make a menu item public (accessible to everyone)?

**A:** Don't assign any permissions to the item. Items without permissions are accessible to all authenticated users.

```typescript
// Create public item (no permission_ids)
await navigationService.createNavigationItem({
  key: 'public-page',
  title: 'Public Page',
  type: 'item',
  link: '/public',
  sort_order: 100,
  // No permission_ids - available to everyone
});
```

---

### Q: Can I have multiple top-level groups?

**A:** Yes, just set `parent_id: null` for each top-level item.

```typescript
// Top-level group 1
{ key: 'admin', parent_id: null, type: 'collapsible' }

// Top-level group 2
{ key: 'reports', parent_id: null, type: 'collapsible' }

// Top-level item
{ key: 'dashboard', parent_id: null, type: 'item' }
```

---

### Q: How deep can the menu hierarchy go?

**A:** Technically unlimited, but **recommended maximum is 3 levels** for UX:

```
Level 1: Main Menu (e.g., "Admin")
├── Level 2: Section (e.g., "User Management")
│   ├── Level 3: Page (e.g., "User List")
│   └── Level 3: Page (e.g., "User Roles")
```

---

### Q: Can I use custom icons (not Material Icons)?

**A:** Not currently supported. The system uses Material Icons. For custom icons, you would need to:

1. Extend `AxNavigationComponent` to support custom icon sets
2. Modify icon rendering logic
3. Add custom icon CDN/assets

---

### Q: How do I change the menu order?

**A:** Two ways:

1. **UI (Recommended):**
   - Go to RBAC → Navigations
   - Drag and drop items to reorder
   - System automatically updates `sort_order`

2. **SQL:**
   ```sql
   UPDATE navigation_items
   SET sort_order = 5
   WHERE key = 'my-item';
   ```

---

### Q: Can I have the same item appear in multiple layouts?

**A:** Yes, use the `show_in_*` flags:

```typescript
{
  show_in_default: true,     // Desktop sidebar
  show_in_compact: true,     // Compact sidebar
  show_in_horizontal: true,  // Top navigation bar
  show_in_mobile: true       // Mobile menu
}
```

---

### Q: How do I handle multi-language menu items?

**A:** Not built-in. Options:

1. **Database approach:**

   ```sql
   -- Add i18n_key column
   ALTER TABLE navigation_items ADD COLUMN i18n_key VARCHAR(100);

   -- Use translation key instead of hardcoded title
   UPDATE navigation_items SET i18n_key = 'menu.dashboard' WHERE key = 'dashboard';
   ```

2. **Frontend approach:**

   ```typescript
   // Use translation pipe in template
   <ax-navigation [items]="translatedItems()">

   // Translate items in component
   translatedItems = computed(() => {
     return this.navigationItems().map(item => ({
       ...item,
       title: this.translate.instant(item.i18n_key)
     }));
   });
   ```

---

### Q: Why do I see a menu item but get 403 when clicking?

**A:** This is the **two-layer security model** working correctly:

- **Layer 1 (Menu Visibility)**: You have permission to SEE the menu item
- **Layer 2 (Route Access)**: You DON'T have permission to ACCESS the route

**Solution:** Grant the route permission or remove the menu permission.

---

### Q: How do I backup navigation configuration?

**A:** Export from database:

```bash
# Export all navigation items
pg_dump -h localhost -U aegisx -d aegisx_dev \
  -t navigation_items \
  -t navigation_permissions \
  --data-only \
  > navigation-backup.sql

# Restore
psql -h localhost -U aegisx -d aegisx_dev < navigation-backup.sql
```

---

### Q: Can I programmatically hide/show items based on feature flags?

**A:** Yes, use the `disabled` field with feature flag service:

```typescript
// Update item when feature flag changes
featureFlagService.onFlagChange('new-feature').subscribe((enabled) => {
  navigationService.updateNavigationItem(itemId, {
    disabled: !enabled,
  });
});
```

---

## Getting Help

If issues persist after trying these solutions:

1. **Check Logs:**
   - Backend: `npm run dev:api` console output
   - Frontend: Browser developer console (F12)
   - Database: PostgreSQL logs

2. **Enable Verbose Logging:**

   ```typescript
   // apps/api/src/app.ts
   const app = await bootstrap({
     logger: {
       level: 'debug', // Change from 'info' to 'debug'
     },
   });
   ```

3. **Review Documentation:**
   - [Architecture](./ARCHITECTURE.md) - Understand system design
   - [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation details
   - [API Reference](./API_REFERENCE.md) - API usage examples

4. **Community Support:**
   - GitHub Issues: Report bugs
   - Team Chat: Ask questions
   - Documentation: Suggest improvements

---

**Last Updated:** 2025-10-29
