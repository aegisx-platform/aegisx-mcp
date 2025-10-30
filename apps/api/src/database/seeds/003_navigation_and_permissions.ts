import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Helper function to safely insert navigation items
  async function insertNavigationItems(items: any[]) {
    const insertedItems = [];

    for (const item of items) {
      // Check if the navigation item already exists
      const existing = await knex('navigation_items')
        .where({ key: item.key })
        .first();

      if (!existing) {
        const [inserted] = await knex('navigation_items')
          .insert(item)
          .returning('*');
        insertedItems.push(inserted);
      } else {
        insertedItems.push(existing);
      }
    }

    return insertedItems;
  }

  // Clear existing navigation preferences and permissions
  await knex('user_navigation_preferences').del();
  await knex('navigation_permissions').del();

  // Add only necessary permissions that align with actual features
  const permissionsToAdd = [
    // Navigation permissions
    {
      resource: 'navigation',
      action: 'view',
      description: 'View navigation structure',
    },
    {
      resource: 'navigation',
      action: 'manage',
      description: 'Manage navigation items',
    },

    // Dashboard permissions
    { resource: 'dashboard', action: 'view', description: 'View dashboard' },

    // Settings permissions - single page with all settings
    { resource: 'settings', action: 'view', description: 'View settings' },
    { resource: 'settings', action: 'update', description: 'Update settings' },

    // Profile permissions (additional to existing)
    {
      resource: 'profile',
      action: 'avatar',
      description: 'Upload/delete avatar',
    },
    {
      resource: 'profile',
      action: 'preferences',
      description: 'Update user preferences',
    },

    // RBAC Module - Complete Permission Set
    // Dashboard & Navigation
    {
      resource: 'rbac',
      action: 'stats:read',
      description: 'View RBAC statistics and overview',
    },
    {
      resource: 'rbac',
      action: 'roles:list',
      description: 'List and view all roles',
    },
    {
      resource: 'rbac',
      action: 'permissions:list',
      description: 'List and view all permissions',
    },
    {
      resource: 'rbac',
      action: 'user-roles:list',
      description: 'List and view user role assignments',
    },

    // RBAC - Roles Management
    { resource: 'rbac', action: 'roles:read', description: 'View roles' },
    { resource: 'rbac', action: 'roles:create', description: 'Create roles' },
    { resource: 'rbac', action: 'roles:update', description: 'Update roles' },
    { resource: 'rbac', action: 'roles:delete', description: 'Delete roles' },

    // RBAC - Permissions Management
    {
      resource: 'rbac',
      action: 'permissions:read',
      description: 'View permissions',
    },
    {
      resource: 'rbac',
      action: 'permissions:assign',
      description: 'Assign permissions to roles',
    },

    // Roles Management (CRUD operations)
    { resource: 'roles', action: 'read', description: 'View role details' },
    { resource: 'roles', action: 'create', description: 'Create new roles' },
    {
      resource: 'roles',
      action: 'update',
      description: 'Update existing roles',
    },
    { resource: 'roles', action: 'delete', description: 'Delete roles' },

    // Permissions Management (CRUD + assign)
    {
      resource: 'permissions',
      action: 'read',
      description: 'View permission details',
    },
    {
      resource: 'permissions',
      action: 'create',
      description: 'Create new permissions',
    },
    {
      resource: 'permissions',
      action: 'update',
      description: 'Update existing permissions',
    },
    {
      resource: 'permissions',
      action: 'delete',
      description: 'Delete permissions',
    },
    {
      resource: 'permissions',
      action: 'assign',
      description: 'Assign permissions to roles',
    },

    // User Role Assignment
    {
      resource: 'user-roles',
      action: 'read',
      description: 'View user role assignments',
    },
    {
      resource: 'user-roles',
      action: 'assign',
      description: 'Assign roles to users',
    },
    {
      resource: 'user-roles',
      action: 'revoke',
      description: 'Revoke roles from users',
    },
    {
      resource: 'user-roles',
      action: 'bulk-assign',
      description: 'Bulk assign roles to multiple users',
    },
    {
      resource: 'user-roles',
      action: 'set-expiry',
      description: 'Set expiration for role assignments',
    },

    // Navigation Management - CRUD Operations
    {
      resource: 'navigation',
      action: 'read',
      description: 'View navigation items',
    },
    {
      resource: 'navigation',
      action: 'create',
      description: 'Create new navigation items',
    },
    {
      resource: 'navigation',
      action: 'update',
      description: 'Update existing navigation items',
    },
    {
      resource: 'navigation',
      action: 'delete',
      description: 'Delete navigation items',
    },
    {
      resource: 'navigation',
      action: 'assign-permissions',
      description: 'Assign permissions to navigation items',
    },

    // API Keys Management - CRUD Operations
    {
      resource: 'api-keys',
      action: 'read',
      description: 'View API keys',
    },
    {
      resource: 'api-keys',
      action: 'read:own',
      description: 'View own API keys',
    },
    {
      resource: 'api-keys',
      action: 'create',
      description: 'Create API keys',
    },
    {
      resource: 'api-keys',
      action: 'update',
      description: 'Update API keys',
    },
    {
      resource: 'api-keys',
      action: 'delete',
      description: 'Delete API keys',
    },
    {
      resource: 'api-keys',
      action: 'generate',
      description: 'Generate new API keys',
    },
    {
      resource: 'api-keys',
      action: 'validate',
      description: 'Validate API keys',
    },
    {
      resource: 'api-keys',
      action: 'revoke',
      description: 'Revoke API keys',
    },
    {
      resource: 'api-keys',
      action: 'rotate',
      description: 'Rotate API keys',
    },
  ];

  // Insert permissions that don't already exist
  const additionalPermissions = [];
  for (const perm of permissionsToAdd) {
    const existing = await knex('permissions')
      .where({ resource: perm.resource, action: perm.action })
      .first();

    if (!existing) {
      const [inserted] = await knex('permissions')
        .insert(perm)
        .returning(['id', 'resource', 'action']);
      additionalPermissions.push(inserted);
    }
  }

  console.log('✅ Added additional permissions');

  // Get all permissions for role assignment
  const allPermissions = await knex('permissions').select([
    'id',
    'resource',
    'action',
  ]);
  const adminRole = await knex('roles').where({ name: 'admin' }).first();
  const userRole = await knex('roles').where({ name: 'user' }).first();

  // Assign new permissions to admin role (check for duplicates first)
  for (const perm of additionalPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: adminRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: perm.id,
      });
    }
  }

  // Assign all RBAC permissions to admin role
  const adminRbacPermissions = allPermissions.filter((perm) =>
    ['rbac', 'roles', 'permissions', 'user-roles'].includes(perm.resource),
  );

  for (const perm of adminRbacPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: adminRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: perm.id,
      });
    }
  }

  console.log(
    `✅ Assigned ${adminRbacPermissions.length} RBAC permissions to admin role`,
  );

  // Assign limited permissions to user role
  const userPermissionList = [
    'navigation.view',
    'dashboard.view',
    'profile.read',
    'profile.update',
    'profile.avatar',
    'profile.preferences',
    'settings.view',
    'settings.update',
  ];

  // Insert user permissions (check for duplicates first)
  const userPermissions = allPermissions.filter((perm) =>
    userPermissionList.includes(`${perm.resource}.${perm.action}`),
  );

  for (const perm of userPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: userRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: userRole.id,
        permission_id: perm.id,
      });
    }
  }

  console.log('✅ Updated role permissions');

  // Skip creating additional navigation items - only work with existing ones
  // All necessary navigation items are created in seed 002
  console.log(
    '✅ Skipping additional navigation creation - using existing items only',
  );

  // Skip creating unused sub-navigation items
  console.log('✅ Skipped creating unused sub-navigation items');

  // Link navigation items with permissions
  const allNavItems = await knex('navigation_items').select(['id', 'key']);

  const navigationPermissionMappings = [
    // Dashboard
    { nav_key: 'dashboard', permission: 'dashboard.view' },

    // User Management - only items that exist
    { nav_key: 'user-management', permission: 'users.read' },
    { nav_key: 'users-list', permission: 'users.read' },

    // RBAC Management
    { nav_key: 'rbac-management', permission: 'dashboard.view' },

    // Settings - single page, no sub-items
    { nav_key: 'settings', permission: 'settings.view' },
  ];

  // Create navigation-permission links (check for duplicates)
  for (const mapping of navigationPermissionMappings) {
    const navItem = allNavItems.find((item) => item.key === mapping.nav_key);
    const [resource, action] = mapping.permission.split('.');
    const permission = allPermissions.find(
      (perm) => perm.resource === resource && perm.action === action,
    );

    if (navItem && permission) {
      // Check if the link already exists
      const existingLink = await knex('navigation_permissions')
        .where({
          navigation_item_id: navItem.id,
          permission_id: permission.id,
        })
        .first();

      if (!existingLink) {
        await knex('navigation_permissions').insert({
          navigation_item_id: navItem.id,
          permission_id: permission.id,
        });
      }
    }
  }

  console.log('✅ Linked navigation items with permissions');
  console.log('✅ Navigation and permissions seed completed successfully');
}
