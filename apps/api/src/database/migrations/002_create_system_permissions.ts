/**
 * Migration: Create System Permissions
 *
 * Creates base system permissions for core features.
 * These permissions are essential for the application and are created
 * as part of the schema setup via migrations (not seeds).
 *
 * Features:
 * - Idempotent: Safe to run multiple times
 * - Atomic: All operations in transaction
 * - Assigned to admin role: Admin users inherit all system permissions
 *
 * Resources covered:
 * - Dashboard, User Management, Role Management
 * - Permission Management, User Profile
 * - System Monitoring, Error Logs, Activity Logs
 * - Navigation, File Management, Settings
 * - User Role Assignment
 *
 * Generated: 2025-11-05
 */

import { Knex } from 'knex';

/**
 * System permissions definition
 */
const SYSTEM_PERMISSIONS = [
  // Dashboard permissions
  { resource: 'dashboard', action: 'view', description: 'View dashboard' },

  // User management permissions
  { resource: 'users', action: 'create', description: 'Create new users' },
  { resource: 'users', action: 'read', description: 'View user information' },
  {
    resource: 'users',
    action: 'update',
    description: 'Update user information',
  },
  { resource: 'users', action: 'delete', description: 'Delete users' },

  // Role management permissions
  { resource: 'roles', action: 'create', description: 'Create new roles' },
  { resource: 'roles', action: 'read', description: 'View roles' },
  { resource: 'roles', action: 'update', description: 'Update roles' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },

  // Permission management permissions
  { resource: 'permissions', action: 'read', description: 'View permissions' },
  {
    resource: 'permissions',
    action: 'assign',
    description: 'Assign permissions to roles',
  },

  // Profile permissions (for regular users)
  { resource: 'profile', action: 'read', description: 'View own profile' },
  { resource: 'profile', action: 'update', description: 'Update own profile' },

  // System monitoring permissions
  {
    resource: 'system',
    action: 'monitoring:read',
    description: 'View system monitoring data',
  },

  // Error logs permissions
  { resource: 'error-logs', action: 'read', description: 'View error logs' },
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

  // Activity logs permissions
  {
    resource: 'activity-logs',
    action: 'read',
    description: 'View activity logs',
  },
  {
    resource: 'activity-logs',
    action: 'delete',
    description: 'Delete activity logs',
  },
  {
    resource: 'activity-logs',
    action: 'export',
    description: 'Export activity logs',
  },

  // Navigation management permissions
  {
    resource: 'navigation',
    action: 'read',
    description: 'View navigation items',
  },
  {
    resource: 'navigation',
    action: 'create',
    description: 'Create navigation items',
  },
  {
    resource: 'navigation',
    action: 'update',
    description: 'Update navigation items',
  },
  {
    resource: 'navigation',
    action: 'delete',
    description: 'Delete navigation items',
  },
  {
    resource: 'navigation',
    action: 'view',
    description: 'View user navigation menu',
  },
  {
    resource: 'navigation',
    action: 'assign-permissions',
    description: 'Assign permissions to navigation items',
  },

  // File upload permissions
  { resource: 'files', action: 'upload', description: 'Upload files' },
  { resource: 'files', action: 'read', description: 'View files' },
  { resource: 'files', action: 'update', description: 'Update file metadata' },
  { resource: 'files', action: 'delete', description: 'Delete files' },
  {
    resource: 'files',
    action: 'read-config',
    description: 'View storage configuration',
  },
  {
    resource: 'files',
    action: 'cleanup',
    description: 'Cleanup deleted files',
  },

  // Settings permissions
  { resource: 'settings', action: 'read', description: 'View settings' },
  { resource: 'settings', action: 'create', description: 'Create settings' },
  { resource: 'settings', action: 'update', description: 'Update settings' },
  { resource: 'settings', action: 'delete', description: 'Delete settings' },
  {
    resource: 'settings',
    action: 'update-value',
    description: 'Update setting values',
  },
  {
    resource: 'settings',
    action: 'bulk-update',
    description: 'Bulk update settings',
  },
  {
    resource: 'settings',
    action: 'read-history',
    description: 'View settings history',
  },
  {
    resource: 'settings',
    action: 'user:read',
    description: 'View user settings',
  },
  {
    resource: 'settings',
    action: 'user:update',
    description: 'Update user settings',
  },
  {
    resource: 'settings',
    action: 'user:delete',
    description: 'Delete user settings',
  },

  // User role assignment permissions
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
    description: 'Bulk assign roles',
  },
  {
    resource: 'user-roles',
    action: 'set-expiry',
    description: 'Set role expiration',
  },
];

/**
 * Apply migration
 */
export async function up(knex: Knex): Promise<void> {
  console.log('[Migration] Creating system permissions...');

  return knex.transaction(async (trx) => {
    // Step 1: Create permissions (idempotent)
    for (const permission of SYSTEM_PERMISSIONS) {
      await trx.raw(
        `
        INSERT INTO permissions (resource, action, description, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON CONFLICT (resource, action) DO UPDATE
        SET
          description = EXCLUDED.description,
          updated_at = NOW()
      `,
        [permission.resource, permission.action, permission.description],
      );
    }

    // Step 2: Assign all system permissions to admin role
    const adminRole = await trx('roles').where('name', 'admin').first();

    if (adminRole) {
      // Get all system permission IDs
      const permissions = await trx('permissions')
        .whereIn('resource', [
          'dashboard',
          'users',
          'roles',
          'permissions',
          'profile',
          'system',
          'error-logs',
          'activity-logs',
          'navigation',
          'files',
          'settings',
          'user-roles',
        ])
        .select('id');

      // Assign to admin role
      for (const permission of permissions) {
        await trx.raw(
          `
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `,
          [adminRole.id, permission.id],
        );
      }
    }

    console.log(
      `[Migration] Created ${SYSTEM_PERMISSIONS.length} system permissions`,
    );
  });
}

/**
 * Rollback migration
 */
export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] Removing system permissions...');

  const systemResources = [
    'dashboard',
    'users',
    'roles',
    'permissions',
    'profile',
    'system',
    'error-logs',
    'activity-logs',
    'navigation',
    'files',
    'settings',
    'user-roles',
  ];

  await knex('permissions').whereIn('resource', systemResources).del();

  console.log('[Migration] System permissions removed');
}
