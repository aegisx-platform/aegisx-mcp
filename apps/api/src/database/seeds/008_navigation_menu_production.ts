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
 * 1. Dashboard
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
    // 1. Dashboard
    {
      key: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      icon: 'heroicons_outline:chart-pie',
      link: '/dashboard',
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
      icon: 'heroicons_outline:users',
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
      icon: 'heroicons_outline:shield-check',
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
      icon: 'heroicons_outline:cog-6-tooth',
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
      icon: 'heroicons_outline:folder',
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
      icon: 'heroicons_outline:cube',
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
        icon: 'heroicons_outline:user-group',
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
        icon: 'heroicons_outline:user-circle',
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
        icon: 'heroicons_outline:chart-bar',
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
        icon: 'heroicons_outline:user-group',
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
        icon: 'heroicons_outline:key',
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
        icon: 'heroicons_outline:user-plus',
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
        icon: 'heroicons_outline:bars-3',
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
        icon: 'heroicons_outline:adjustments-horizontal',
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
        icon: 'heroicons_outline:document-text',
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
  // ADD MISSING PERMISSIONS
  // ============================================================================

  console.log('📝 Adding missing permissions...');

  // Add templates permission if it doesn't exist
  const templatesPerm = await knex('permissions')
    .where({ resource: 'templates', action: 'read' })
    .first();

  if (!templatesPerm) {
    await knex('permissions').insert({
      resource: 'templates',
      action: 'read',
      description: 'View PDF templates',
    });
    console.log('✅ Added templates.read permission');

    // Assign to admin role
    const adminRole = await knex('roles').where({ name: 'admin' }).first();
    if (adminRole) {
      const newPerm = await knex('permissions')
        .where({ resource: 'templates', action: 'read' })
        .first();
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: newPerm.id,
      });
      console.log('✅ Assigned templates.read to admin role');
    }
  }

  // ============================================================================
  // LINK NAVIGATION ITEMS WITH PERMISSIONS
  // ============================================================================

  console.log('🔗 Linking navigation items with permissions...');

  // Get all navigation items and permissions
  const allNavItems = await knex('navigation_items').select(['id', 'key']);
  const allPermissions = await knex('permissions').select([
    'id',
    'resource',
    'action',
  ]);

  // Define navigation-permission mappings
  const navigationPermissionMappings = [
    // Dashboard
    { nav_key: 'dashboard', permission: 'dashboard.view' },

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

    // Files - No specific permission required (all authenticated users)
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
