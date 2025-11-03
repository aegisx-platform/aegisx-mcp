import type { Knex } from 'knex';

/**
 * Audit System Seed
 *
 * Adds permissions and navigation for audit system modules:
 * - Login Attempts (security audit)
 * - File Audit (file activity tracking)
 */

interface Permission {
  resource: string;
  action: string;
  description: string;
  category?: string;
}

export async function seed(knex: Knex): Promise<void> {
  console.log('🚀 Starting audit system seed...');

  // ==================== PERMISSIONS ====================

  console.log('📝 Adding audit system permissions...');

  const permissions: Permission[] = [
    // Login Attempts Permissions
    {
      resource: 'login-attempts',
      action: 'read',
      description: 'View login attempts and security logs',
      category: 'audit',
    },
    {
      resource: 'login-attempts',
      action: 'export',
      description: 'Export login attempts data',
      category: 'audit',
    },
    {
      resource: 'login-attempts',
      action: 'delete',
      description: 'Delete login attempt records',
      category: 'audit',
    },
    {
      resource: 'login-attempts',
      action: 'cleanup',
      description: 'Cleanup old login attempts',
      category: 'audit',
    },

    // File Audit Permissions
    {
      resource: 'file-audit',
      action: 'read',
      description: 'View file audit logs and activity',
      category: 'audit',
    },
    {
      resource: 'file-audit',
      action: 'export',
      description: 'Export file audit data',
      category: 'audit',
    },
    {
      resource: 'file-audit',
      action: 'delete',
      description: 'Delete file audit records',
      category: 'audit',
    },
    {
      resource: 'file-audit',
      action: 'cleanup',
      description: 'Cleanup old file audit logs',
      category: 'audit',
    },
  ];

  let addedCount = 0;
  let skippedCount = 0;

  for (const perm of permissions) {
    const exists = await knex('permissions')
      .where({ resource: perm.resource, action: perm.action })
      .first();

    if (!exists) {
      await knex('permissions').insert({
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        category: perm.category,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
      addedCount++;
    } else {
      console.log(
        `  ⏭️  Permission already exists: ${perm.resource}:${perm.action}`,
      );
      skippedCount++;
    }
  }

  console.log(`✅ Added ${addedCount} new permissions`);
  if (skippedCount > 0) {
    console.log(`  ⏭️  Skipped ${skippedCount} existing permissions`);
  }

  // ==================== ASSIGN TO ADMIN ROLE ====================

  console.log('🔗 Assigning permissions to admin role...');

  const adminRole = await knex('roles').where({ name: 'admin' }).first();

  if (!adminRole) {
    console.log('⚠️  Admin role not found, skipping permission assignment');
    return;
  }

  const permissionIds = await knex('permissions')
    .whereIn(
      'resource',
      permissions.map((p) => p.resource),
    )
    .select('id');

  let assignedCount = 0;

  for (const { id } of permissionIds) {
    const exists = await knex('role_permissions')
      .where({ role_id: adminRole.id, permission_id: id })
      .first();

    if (!exists) {
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: id,
        created_at: knex.fn.now(),
      });
      assignedCount++;
    }
  }

  console.log(
    `✅ Assigned ${assignedCount} permissions to admin role (total: ${permissionIds.length})`,
  );

  // ==================== NAVIGATION ====================

  console.log('📋 Creating audit system navigation items...');

  // 1. Create Audit parent menu item
  const auditParentExists = await knex('navigation_items')
    .where({ key: 'audit-logs' })
    .first();

  let auditParentId;

  if (!auditParentExists) {
    const [result] = await knex('navigation_items')
      .insert({
        key: 'audit-logs',
        type: 'collapsible',
        title: 'Audit Logs',
        icon: 'security',
        sort_order: 70,
        hidden: false,
        disabled: false,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .returning('id');

    auditParentId = result.id;
    console.log('✅ Created Audit Logs parent menu');
  } else {
    auditParentId = auditParentExists.id;
    console.log('  ⏭️  Audit Logs parent menu already exists');
  }

  // 2. Create child navigation items
  const childItems = [
    {
      key: 'audit.login-attempts',
      type: 'item',
      title: 'Login Attempts',
      link: '/audit/login-attempts',
      icon: 'login',
      parent_id: auditParentId,
      sort_order: 1,
      hidden: false,
      disabled: false,
    },
    {
      key: 'audit.file-activity',
      type: 'item',
      title: 'File Activity',
      link: '/audit/file-audit',
      icon: 'folder_open',
      parent_id: auditParentId,
      sort_order: 2,
      hidden: false,
      disabled: false,
    },
  ];

  let navAddedCount = 0;

  for (const item of childItems) {
    const exists = await knex('navigation_items')
      .where({ key: item.key })
      .first();

    if (!exists) {
      await knex('navigation_items').insert({
        ...item,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
      navAddedCount++;
    } else {
      console.log(`  ⏭️  Navigation item already exists: ${item.title}`);
    }
  }

  console.log(
    `✅ Created Audit child items (${navAddedCount}/${childItems.length} new)`,
  );

  // ==================== LINK NAVIGATION WITH PERMISSIONS ====================

  console.log('🔗 Linking navigation items with permissions...');

  const linkItems = [
    {
      key: 'audit-logs', // Parent menu
      resource: 'login-attempts',
      action: 'read',
    },
    {
      key: 'audit.login-attempts',
      resource: 'login-attempts',
      action: 'read',
    },
    {
      key: 'audit.file-activity',
      resource: 'file-audit',
      action: 'read',
    },
  ];

  let linkedCount = 0;

  for (const link of linkItems) {
    // Get navigation item
    const navItem = await knex('navigation_items')
      .where({ key: link.key })
      .first();

    if (!navItem) {
      console.log(`  ⚠️  Navigation item not found: ${link.key}`);
      continue;
    }

    // Get permission
    const permission = await knex('permissions')
      .where({ resource: link.resource, action: link.action })
      .first();

    if (!permission) {
      console.log(
        `  ⚠️  Permission not found: ${link.resource}.${link.action}`,
      );
      continue;
    }

    // Check if already linked
    const exists = await knex('navigation_permissions')
      .where({ navigation_item_id: navItem.id, permission_id: permission.id })
      .first();

    if (!exists) {
      await knex('navigation_permissions').insert({
        navigation_item_id: navItem.id,
        permission_id: permission.id,
        created_at: knex.fn.now(),
      });
      linkedCount++;
      console.log(
        `  ✅ Linked ${navItem.title} → ${link.resource}.${link.action}`,
      );
    } else {
      console.log(
        `  ⏭️  Already linked ${navItem.title} → ${link.resource}.${link.action}`,
      );
    }
  }

  console.log(`✅ Linked ${linkedCount} navigation items with permissions`);

  console.log('🎉 Audit system seed completed successfully!');
}
