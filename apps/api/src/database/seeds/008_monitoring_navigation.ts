import type { Knex } from 'knex';

/**
 * Monitoring & Error Logs Navigation Seed Data
 *
 * This seed adds navigation menu items and permissions for:
 * 1. System Monitoring Dashboard
 * 2. Error Log Viewer
 *
 * Navigation Structure:
 * - Monitoring (collapsible parent)
 *   ├─ System Monitoring
 *   └─ Error Logs
 *
 * Permissions:
 * - monitoring:view - View monitoring dashboard
 * - monitoring:export - Export monitoring data
 * - error-logs:read - View error logs
 * - error-logs:delete - Delete error logs
 * - error-logs:export - Export error logs
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Starting monitoring & error-logs navigation seed...');

  // ============================================================================
  // ADD PERMISSIONS
  // ============================================================================

  console.log('📝 Adding monitoring & error-logs permissions...');

  const permissionsToAdd = [
    // System Monitoring permissions (matches backend routes)
    {
      resource: 'system',
      action: 'monitoring:read',
      description: 'View system monitoring data',
    },

    // Error Logs permissions (already added in 001_initial_data.ts)
    // Kept here for reference, but will be skipped if already exists
    {
      resource: 'error-logs',
      action: 'read',
      description: 'View error logs',
    },
    {
      resource: 'error-logs',
      action: 'delete',
      description: 'Delete error logs',
    },
    {
      resource: 'error-logs',
      action: 'export',
      description: 'Export error logs',
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
      console.log(`  ✅ Added permission: ${perm.resource}:${perm.action}`);
    } else {
      console.log(
        `  ⏭️  Permission already exists: ${perm.resource}:${perm.action}`,
      );
    }
  }

  console.log(`✅ Added ${addedPermissions.length} new permissions`);

  // ============================================================================
  // ASSIGN PERMISSIONS TO ADMIN ROLE
  // ============================================================================

  console.log('🔗 Assigning permissions to admin role...');

  // Get all system and error-logs permissions
  const allPermissions = await knex('permissions')
    .where(function () {
      this.where({ resource: 'system', action: 'monitoring:read' }).orWhere(
        'resource',
        'error-logs',
      );
    })
    .select(['id', 'resource', 'action']);

  const adminRole = await knex('roles').where({ name: 'admin' }).first();

  if (!adminRole) {
    console.error('❌ Admin role not found!');
    return;
  }

  let adminAssigned = 0;
  for (const perm of allPermissions) {
    const existing = await knex('role_permissions')
      .where({ role_id: adminRole.id, permission_id: perm.id })
      .first();

    if (!existing) {
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: perm.id,
      });
      adminAssigned++;
      console.log(
        `  ✅ Assigned ${perm.resource}:${perm.action} to admin role`,
      );
    }
  }

  console.log(
    `✅ Assigned ${adminAssigned} permissions to admin role (total: ${allPermissions.length})`,
  );

  // ============================================================================
  // CREATE NAVIGATION ITEMS
  // ============================================================================

  console.log('📋 Creating monitoring navigation items...');

  // Get the highest sort_order from existing navigation items
  const maxSortOrder = await knex('navigation_items')
    .max('sort_order as max')
    .whereNull('parent_id')
    .first();

  const nextSortOrder = (maxSortOrder?.max || 0) + 1;

  // Create Monitoring parent menu
  const [monitoringParent] = await knex('navigation_items')
    .insert({
      key: 'monitoring',
      title: 'Monitoring',
      type: 'collapsible',
      icon: 'bar_chart',
      sort_order: nextSortOrder,
      show_in_default: true,
      show_in_compact: true,
      show_in_horizontal: true,
      show_in_mobile: true,
      disabled: false,
      hidden: false,
      exact_match: false,
    })
    .returning(['id', 'key']);

  console.log('✅ Created Monitoring parent menu');

  // Create child navigation items
  if (monitoringParent) {
    await knex('navigation_items').insert([
      {
        parent_id: monitoringParent.id,
        key: 'system-monitoring',
        title: 'System Monitoring',
        type: 'item',
        icon: 'speed',
        link: '/monitoring/system',
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
        parent_id: monitoringParent.id,
        key: 'error-logs',
        title: 'Error Logs',
        type: 'item',
        icon: 'bug_report',
        link: '/monitoring/error-logs',
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

    console.log('✅ Created Monitoring child items (2 items)');
  }

  // ============================================================================
  // LINK NAVIGATION ITEMS WITH PERMISSIONS
  // ============================================================================

  console.log('🔗 Linking navigation items with permissions...');

  // Get all navigation items
  const allNavItems = await knex('navigation_items').select(['id', 'key']);

  // Define navigation-permission mappings
  const navigationPermissionMappings = [
    { nav_key: 'monitoring', permission: 'system.monitoring:read' },
    { nav_key: 'system-monitoring', permission: 'system.monitoring:read' },
    { nav_key: 'error-logs', permission: 'error-logs.read' },
  ];

  // Create navigation-permission links
  let linkedCount = 0;
  for (const mapping of navigationPermissionMappings) {
    const [resource, action] = mapping.permission.split('.');
    const navItem = allNavItems.find((item) => item.key === mapping.nav_key);
    const permission = allPermissions.find(
      (perm) => perm.resource === resource && perm.action === action,
    );

    if (navItem && permission) {
      const existing = await knex('navigation_permissions')
        .where({
          navigation_item_id: navItem.id,
          permission_id: permission.id,
        })
        .first();

      if (!existing) {
        await knex('navigation_permissions').insert({
          navigation_item_id: navItem.id,
          permission_id: permission.id,
        });
        linkedCount++;
        console.log(`  ✅ Linked ${mapping.nav_key} → ${mapping.permission}`);
      }
    } else {
      if (!navItem) {
        console.warn(`  ⚠️  Navigation item not found: ${mapping.nav_key}`);
      }
      if (!permission) {
        console.warn(`  ⚠️  Permission not found: ${mapping.permission}`);
      }
    }
  }

  console.log(`✅ Linked ${linkedCount} navigation items with permissions`);

  console.log(
    '🎉 Monitoring & error-logs navigation seed completed successfully!',
  );
}
