import type { Knex } from 'knex';

/**
 * Production Navigation Menu Seed Data
 *
 * This seed creates a comprehensive navigation menu structure for production use.
 * It includes all features discovered in the system audit:
 * - 14 backend modules
 * - 10 frontend features
 * - Complete permission mappings
 *
 * Navigation Structure:
 * 1. Home
 * 2. User Management (collapsible)
 *    ├─ Users List
 *    └─ My Profile
 * 3. RBAC Management (collapsible)
 *    ├─ Overview
 *    ├─ Roles
 *    ├─ Permissions
 *    ├─ User Assignments
 *    └─ Navigation
 * 4. System (collapsible)
 *    ├─ Settings
 *    └─ PDF Templates
 * 5. Files
 * 6. [Divider]
 * 7. Components (optional - for demo/development)
 *
 * Total: 17 production items + 5 optional items = 22 items
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Starting production navigation menu seed...');

  // Clear existing navigation data in dependency order
  await knex('user_navigation_preferences').del();
  await knex('navigation_permissions').del();
  await knex('navigation_items').del();

  console.log('✅ Cleared existing navigation data');

  // Helper to insert navigation items and return them
  async function insertNavItems(items: any[]) {
    return await knex('navigation_items')
      .insert(items)
      .returning(['id', 'key']);
  }

  // ============================================================================
  // PRIMARY NAVIGATION ITEMS
  // ============================================================================

  const primaryNavItems = await insertNavItems([
    // 1. Home
    {
      key: 'home',
      title: 'Home',
      type: 'item',
      icon: 'home',
      link: '/',
      sort_order: 1,
      show_in_default: true,
      show_in_compact: true,
      show_in_horizontal: true,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 2. User Management (Parent)
    {
      key: 'user-management',
      title: 'User Management',
      type: 'collapsible',
      icon: 'people',
      sort_order: 2,
      show_in_default: true,
      show_in_compact: true,
      show_in_horizontal: false,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 3. RBAC Management (Parent)
    {
      key: 'rbac-management',
      title: 'RBAC Management',
      type: 'collapsible',
      icon: 'security',
      sort_order: 3,
      show_in_default: true,
      show_in_compact: true,
      show_in_horizontal: true,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 4. System (Parent)
    {
      key: 'system-config',
      title: 'System',
      type: 'collapsible',
      icon: 'settings',
      sort_order: 4,
      show_in_default: true,
      show_in_compact: false,
      show_in_horizontal: true,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 5. Files
    {
      key: 'file-management',
      title: 'Files',
      type: 'item',
      icon: 'folder',
      link: '/file-upload',
      sort_order: 5,
      show_in_default: true,
      show_in_compact: true,
      show_in_horizontal: true,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 6. Divider
    {
      key: 'divider-main',
      title: '',
      type: 'divider',
      sort_order: 6,
      show_in_default: true,
      show_in_compact: false,
      show_in_horizontal: false,
      show_in_mobile: false,
      disabled: false,
      hidden: false,
      exact_match: false,
    },

    // 7. Components (Optional - for demo/development)
    {
      key: 'components',
      title: 'Components',
      type: 'collapsible',
      icon: 'widgets',
      sort_order: 7,
      show_in_default: false, // Hidden by default
      show_in_compact: false,
      show_in_horizontal: false,
      show_in_mobile: false,
      disabled: false,
      hidden: false,
      exact_match: false,
    },
  ]);

  console.log(`✅ Created ${primaryNavItems.length} primary navigation items`);

  // ============================================================================
  // CHILD NAVIGATION ITEMS - User Management
  // ============================================================================

  const userManagementParent = primaryNavItems.find(
    (item) => item.key === 'user-management',
  );

  if (userManagementParent) {
    await insertNavItems([
      {
        parent_id: userManagementParent.id,
        key: 'users-list',
        title: 'Users',
        type: 'item',
        icon: 'group',
        link: '/users',
        sort_order: 1,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: userManagementParent.id,
        key: 'user-profile',
        title: 'My Profile',
        type: 'item',
        icon: 'account_circle',
        link: '/profile',
        sort_order: 2,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
    ]);

    console.log('✅ Created User Management child items');
  }

  // ============================================================================
  // CHILD NAVIGATION ITEMS - RBAC Management
  // ============================================================================

  const rbacManagementParent = primaryNavItems.find(
    (item) => item.key === 'rbac-management',
  );

  if (rbacManagementParent) {
    await insertNavItems([
      {
        parent_id: rbacManagementParent.id,
        key: 'rbac-dashboard',
        title: 'Overview',
        type: 'item',
        icon: 'bar_chart',
        link: '/rbac/dashboard',
        sort_order: 1,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: rbacManagementParent.id,
        key: 'rbac-roles',
        title: 'Roles',
        type: 'item',
        icon: 'badge',
        link: '/rbac/roles',
        sort_order: 2,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: rbacManagementParent.id,
        key: 'rbac-permissions',
        title: 'Permissions',
        type: 'item',
        icon: 'vpn_key',
        link: '/rbac/permissions',
        sort_order: 3,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: rbacManagementParent.id,
        key: 'rbac-user-roles',
        title: 'User Assignments',
        type: 'item',
        icon: 'person_add',
        link: '/rbac/user-roles',
        sort_order: 4,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: rbacManagementParent.id,
        key: 'rbac-navigation',
        title: 'Navigation',
        type: 'item',
        icon: 'menu',
        link: '/rbac/navigation',
        sort_order: 5,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
    ]);

    console.log('✅ Created RBAC Management child items (5 items)');
  }

  // ============================================================================
  // CHILD NAVIGATION ITEMS - System
  // ============================================================================

  const systemConfigParent = primaryNavItems.find(
    (item) => item.key === 'system-config',
  );

  if (systemConfigParent) {
    await insertNavItems([
      {
        parent_id: systemConfigParent.id,
        key: 'settings',
        title: 'Settings',
        type: 'item',
        icon: 'tune',
        link: '/settings',
        sort_order: 1,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: systemConfigParent.id,
        key: 'pdf-templates',
        title: 'PDF Templates',
        type: 'item',
        icon: 'description',
        link: '/pdf-templates',
        sort_order: 2,
        show_in_default: true,
        show_in_compact: true,
        show_in_horizontal: true,
        show_in_mobile: true,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
    ]);

    console.log('✅ Created System child items');
  }

  // ============================================================================
  // CHILD NAVIGATION ITEMS - Components (Optional)
  // ============================================================================

  const componentsParent = primaryNavItems.find(
    (item) => item.key === 'components',
  );

  if (componentsParent) {
    await insertNavItems([
      {
        parent_id: componentsParent.id,
        key: 'components-buttons',
        title: 'Buttons',
        type: 'item',
        link: '/components/buttons',
        sort_order: 1,
        show_in_default: false,
        show_in_compact: false,
        show_in_horizontal: false,
        show_in_mobile: false,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: componentsParent.id,
        key: 'components-cards',
        title: 'Cards',
        type: 'item',
        link: '/components/cards',
        sort_order: 2,
        show_in_default: false,
        show_in_compact: false,
        show_in_horizontal: false,
        show_in_mobile: false,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: componentsParent.id,
        key: 'components-forms',
        title: 'Forms',
        type: 'item',
        link: '/components/forms',
        sort_order: 3,
        show_in_default: false,
        show_in_compact: false,
        show_in_horizontal: false,
        show_in_mobile: false,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
      {
        parent_id: componentsParent.id,
        key: 'components-tables',
        title: 'Tables',
        type: 'item',
        link: '/components/tables',
        sort_order: 4,
        show_in_default: false,
        show_in_compact: false,
        show_in_horizontal: false,
        show_in_mobile: false,
        disabled: false,
        hidden: false,
        exact_match: false,
      },
    ]);

    console.log('✅ Created Components child items (optional)');
  }

  // ============================================================================
  // ADD COMPREHENSIVE PERMISSIONS
  // ============================================================================

  console.log('📝 Adding comprehensive permissions...');

  // Define all necessary permissions
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

    // Settings permissions
    { resource: 'settings', action: 'view', description: 'View settings' },
    { resource: 'settings', action: 'update', description: 'Update settings' },

    // Profile permissions
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
    { resource: 'rbac', action: 'roles:read', description: 'View roles' },
    { resource: 'rbac', action: 'roles:create', description: 'Create roles' },
    { resource: 'rbac', action: 'roles:update', description: 'Update roles' },
    { resource: 'rbac', action: 'roles:delete', description: 'Delete roles' },
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

    // Roles Management
    { resource: 'roles', action: 'read', description: 'View role details' },
    { resource: 'roles', action: 'create', description: 'Create new roles' },
    {
      resource: 'roles',
      action: 'update',
      description: 'Update existing roles',
    },
    { resource: 'roles', action: 'delete', description: 'Delete roles' },

    // Permissions Management
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

    // Navigation Management
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

    // API Keys Management
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

    // PDF Templates Permissions
    {
      resource: 'pdf-templates',
      action: 'read',
      description: 'View PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'create',
      description: 'Create PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'update',
      description: 'Update PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'delete',
      description: 'Delete PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'render',
      description: 'Render PDFs from templates',
    },
    {
      resource: 'pdf-templates',
      action: 'preview',
      description: 'Preview PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'validate',
      description: 'Validate PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'duplicate',
      description: 'Duplicate PDF templates',
    },
    {
      resource: 'pdf-templates',
      action: 'manage',
      description: 'Manage PDF templates (admin)',
    },

    // PDF Fonts Permissions
    {
      resource: 'pdf-fonts',
      action: 'read',
      description: 'View PDF font information',
    },
    {
      resource: 'pdf-fonts',
      action: 'test',
      description: 'Test PDF font rendering',
    },
    {
      resource: 'pdf-fonts',
      action: 'manage',
      description: 'Manage PDF fonts (admin)',
    },

    // PDF Preview Permissions
    {
      resource: 'pdf-preview',
      action: 'generate',
      description: 'Generate PDF previews',
    },
    {
      resource: 'pdf-preview',
      action: 'read',
      description: 'View PDF previews',
    },
    {
      resource: 'pdf-preview',
      action: 'manage',
      description: 'Manage PDF preview system (admin)',
    },
  ];

  // Insert permissions that don't already exist
  const addedPermissions = [];
  for (const perm of permissionsToAdd) {
    const existing = await knex('permissions')
      .where({ resource: perm.resource, action: perm.action })
      .first();

    if (!existing) {
      const [inserted] = await knex('permissions')
        .insert(perm)
        .returning(['id', 'resource', 'action']);
      addedPermissions.push(inserted);
    }
  }

  console.log(`✅ Added ${addedPermissions.length} new permissions`);

  // ============================================================================
  // ASSIGN PERMISSIONS TO ROLES
  // ============================================================================

  console.log('🔗 Assigning permissions to roles...');

  // Get all permissions and roles
  const allPermissions = await knex('permissions').select([
    'id',
    'resource',
    'action',
  ]);
  const adminRole = await knex('roles').where({ name: 'admin' }).first();
  const managerRole = await knex('roles').where({ name: 'manager' }).first();
  const userRole = await knex('roles').where({ name: 'user' }).first();

  if (!adminRole || !managerRole || !userRole) {
    console.error('❌ Admin, Manager, or User role not found!');
    return;
  }

  // Assign all RBAC, roles, permissions, user-roles, navigation, api-keys, PDF, settings, files permissions to admin
  const adminResources = [
    'rbac',
    'roles',
    'permissions',
    'user-roles',
    'navigation',
    'api-keys',
    'pdf-templates',
    'pdf-fonts',
    'pdf-preview',
    'settings',
    'files',
  ];
  const adminPermissions = allPermissions.filter((perm) =>
    adminResources.includes(perm.resource),
  );

  let adminAssigned = 0;
  for (const perm of adminPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: adminRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: perm.id,
      });
      adminAssigned++;
    }
  }

  console.log(
    `✅ Assigned ${adminAssigned} permissions to admin role (total: ${adminPermissions.length})`,
  );

  // Assign dashboard + users + profile permissions to manager role
  const managerPermissionList = [
    'navigation.view',
    'dashboard.view',
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'profile.read',
    'profile.update',
    'profile.avatar',
    'profile.preferences',
  ];

  const managerPermissions = allPermissions.filter((perm) =>
    managerPermissionList.includes(`${perm.resource}.${perm.action}`),
  );

  let managerAssigned = 0;
  for (const perm of managerPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: managerRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: managerRole.id,
        permission_id: perm.id,
      });
      managerAssigned++;
    }
  }

  console.log(
    `✅ Assigned ${managerAssigned} permissions to manager role (total: ${managerPermissions.length})`,
  );

  // Assign dashboard + profile permissions to user role
  const userPermissionList = [
    'navigation.view',
    'dashboard.view',
    'profile.read',
    'profile.update',
    'profile.avatar',
    'profile.preferences',
  ];

  const userPermissions = allPermissions.filter((perm) =>
    userPermissionList.includes(`${perm.resource}.${perm.action}`),
  );

  let userAssigned = 0;
  for (const perm of userPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: userRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: userRole.id,
        permission_id: perm.id,
      });
      userAssigned++;
    }
  }

  console.log(
    `✅ Assigned ${userAssigned} permissions to user role (total: ${userPermissions.length})`,
  );

  // ============================================================================
  // LINK NAVIGATION ITEMS WITH PERMISSIONS
  // ============================================================================

  console.log('🔗 Linking navigation items with permissions...');

  // Get all navigation items (reuse allPermissions from above)
  const allNavItems = await knex('navigation_items').select(['id', 'key']);

  // Define navigation-permission mappings
  const navigationPermissionMappings = [
    // Home - No permission required (accessible to all authenticated users)

    // User Management
    { nav_key: 'user-management', permission: 'users.read' },
    { nav_key: 'users-list', permission: 'users.read' },
    { nav_key: 'user-profile', permission: 'profile.read' },

    // RBAC Management (all require admin or specific RBAC permissions)
    { nav_key: 'rbac-management', permission: 'rbac.stats:read' },
    { nav_key: 'rbac-dashboard', permission: 'dashboard.view' },
    { nav_key: 'rbac-roles', permission: 'roles.read' },
    { nav_key: 'rbac-permissions', permission: 'permissions.read' },
    { nav_key: 'rbac-user-roles', permission: 'user-roles.read' },
    { nav_key: 'rbac-navigation', permission: 'navigation.read' },

    // System
    { nav_key: 'system-config', permission: 'settings.view' },
    { nav_key: 'settings', permission: 'settings.view' },
    { nav_key: 'pdf-templates', permission: 'templates.read' },

    // Files - Require files:upload permission (admin and manager only)
    { nav_key: 'file-management', permission: 'files.upload' },

    // Components - No permissions required (optional demo section)
  ];

  // Create navigation-permission links
  let linkedCount = 0;
  for (const mapping of navigationPermissionMappings) {
    const navItem = allNavItems.find((item) => item.key === mapping.nav_key);
    const [resource, action] = mapping.permission.split('.');
    const permission = allPermissions.find(
      (perm) => perm.resource === resource && perm.action === action,
    );

    if (navItem && permission) {
      // Check if link already exists
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
        linkedCount++;
      }
    } else {
      if (!navItem) {
        console.warn(`⚠️  Navigation item not found: ${mapping.nav_key}`);
      }
      if (!permission) {
        console.warn(`⚠️  Permission not found: ${mapping.permission}`);
      }
    }
  }

  console.log(`✅ Linked ${linkedCount} navigation items with permissions`);

  // ============================================================================
  // SUMMARY
  // ============================================================================

  const totalNavItems = await knex('navigation_items').count('* as count');
  const totalLinks = await knex('navigation_permissions').count('* as count');

  console.log('');
  console.log('📊 Production Navigation Menu Summary:');
  console.log(`   Total navigation items: ${totalNavItems[0].count}`);
  console.log(`   Permission links: ${totalLinks[0].count}`);
  console.log('');
  console.log('✅ Production navigation menu seed completed successfully!');
  console.log('');
  console.log('📋 Navigation Structure:');
  console.log('   1. Dashboard');
  console.log('   2. User Management (2 children)');
  console.log('   3. RBAC Management (5 children)');
  console.log('   4. System (2 children)');
  console.log('   5. Files');
  console.log('   6. [Divider]');
  console.log('   7. Components (4 children - optional)');
  console.log('');
}
