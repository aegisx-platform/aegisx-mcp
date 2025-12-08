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

    const wildcardPermission = await trx('permissions')
      .where('resource', '*')
      .where('action', '*')
      .first();

    if (!wildcardPermission) {
      throw new Error('Failed to create wildcard permission');
    }

    // Step 3: Remove ALL existing admin permission assignments
    // This cleans up the duplicated permissions from module migrations
    console.log(
      '[Migration] Removing existing admin permission assignments...',
    );
    const deletedCount = await trx('role_permissions')
      .where('role_id', adminRole.id)
      .del();

    console.log(
      `[Migration] Removed ${deletedCount} duplicate admin permissions`,
    );

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
    console.log(
      '[Migration] ✅ Admin now has full system access via *:* wildcard',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] Removing admin wildcard permission...');

  // Remove wildcard permission (cascade will remove role_permissions)
  await knex('permissions').where('resource', '*').where('action', '*').del();

  console.log('[Migration] Wildcard permission removed');
  console.log('[Migration] ⚠️  Admin role no longer has automatic full access');
  console.log(
    '[Migration] ⚠️  You may need to manually restore admin permissions',
  );
}
