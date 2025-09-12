import { Knex } from 'knex';

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

  // Create default notification preferences for existing users
  const allUsers = await knex('users').select(['id']);
  const notificationTypes = [
    'security',
    'updates',
    'marketing',
    'reminders',
    'system',
  ];

  for (const user of allUsers) {
    // Check if user already has notification preferences
    const existingPrefs = await knex('notification_preferences')
      .where({ user_id: user.id })
      .first();

    if (!existingPrefs) {
      const preferences = notificationTypes.map((type) => ({
        user_id: user.id,
        notification_type: type,
        email_enabled: type === 'security' || type === 'system',
        push_enabled: false,
        desktop_enabled: type !== 'marketing',
        sound_enabled: type === 'security' || type === 'system',
        frequency: type === 'marketing' ? 'weekly' : 'immediate',
      }));

      await knex('notification_preferences').insert(preferences);
    }
  }

  console.log('✅ Created default notification preferences');
  console.log('✅ Navigation and permissions seed completed successfully');
}
