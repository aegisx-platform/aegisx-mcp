# Permission Middleware Update

## Summary

Updated the `verifyPermission` middleware in the auth strategies to query the database for actual user permissions instead of using hardcoded values.

## Changes Made

### 1. Updated `verifyPermission` Function

**File**: `/src/modules/auth/strategies/auth.strategies.ts`

**Before**: Used hardcoded role-based permissions

```typescript
const rolePermissions: Record<string, string[]> = {
  admin: ['*:*'],
  user: ['profile:read', 'profile:update', 'navigation:view'],
  manager: ['navigation:view', 'users:read', 'reports:read'],
};
```

**After**: Queries database for actual permissions

```typescript
// Get user's permissions from database based on their role(s)
const permissions = await fastify.knex('user_roles').join('roles', 'user_roles.role_id', 'roles.id').join('role_permissions', 'roles.id', 'role_permissions.role_id').join('permissions', 'role_permissions.permission_id', 'permissions.id').where('user_roles.user_id', user.id).select('permissions.resource', 'permissions.action').distinct();
```

### 2. Permission Checking Logic

The updated middleware now checks for permissions in the following order:

1. **Admin wildcard permission** (`*:*`) - grants access to everything
2. **Specific permission** (exact `resource:action` match)
3. **Resource wildcard** (e.g., `users:*`)
4. **Action wildcard** (e.g., `*:read`)

### 3. Error Handling

- Database errors are logged and result in permission denied
- Permission denied errors are properly re-thrown
- All database access failures are handled gracefully

### 4. Added Admin Wildcard Permission

**File**: `/src/database/migrations/011_add_admin_wildcard_permission.ts`

- Added `*:*` permission to the permissions table
- Assigned this permission to the admin role
- Ensures admin users have access to all resources and actions

### 5. Fixed Dependencies

- Updated plugin dependencies to reference correct knex plugin name ('knex' instead of 'knex-plugin')
- Added proper TypeScript imports for type safety

## Database Schema Used

The implementation relies on the following database schema:

```
users -> user_roles -> roles -> role_permissions -> permissions
```

Where:

- `users` has `id` (referenced in JWT token)
- `user_roles` links users to their roles
- `roles` defines role names (admin, user, etc.)
- `role_permissions` links roles to their permissions
- `permissions` contains `resource` and `action` fields

## Usage Example

The middleware is used in routes like this:

```typescript
typedFastify.get('/navigation', {
  preHandler: [
    fastify.authenticate, // JWT authentication
    fastify.verifyPermission('navigation', 'view'), // Permission check
  ],
  handler: controller.getNavigation,
});
```

## Benefits

1. **Dynamic Permissions**: Permissions are stored in database and can be changed without code updates
2. **Role-based Access**: Supports multiple roles per user
3. **Granular Control**: Supports wildcard permissions for flexible access patterns
4. **Error Resilience**: Handles database errors gracefully
5. **Type Safety**: Full TypeScript support with proper type declarations

## Testing

The system has been tested with:

- ✅ API compilation (TypeScript)
- ✅ Database migration (wildcard permission added)
- ✅ Build process (Nx build successful)
- ✅ Existing navigation routes using the middleware

## Future Enhancements

Potential future improvements:

1. **Permission Caching**: Cache user permissions for better performance
2. **Permission Inheritance**: Support hierarchical permission structures
3. **Time-based Permissions**: Add expiration dates to permissions
4. **Audit Logging**: Log permission checks for security auditing
5. **Dynamic Permission Loading**: Support hot-reloading of permissions without server restart
