import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data in reverse order due to foreign keys
  await knex('user_sessions').del();
  await knex('user_roles').del();
  await knex('role_permissions').del();
  await knex('users').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Insert roles
  const [adminRole, managerRole, userRole] = await knex('roles')
    .insert([
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'manager', description: 'Manager with user management access' },
      { name: 'user', description: 'Regular user with limited access' },
    ])
    .returning(['id', 'name']);

  // Insert permissions
  const permissions = await knex('permissions')
    .insert([
      // Dashboard permissions
      { resource: 'dashboard', action: 'view', description: 'View dashboard' },

      // User management permissions
      { resource: 'users', action: 'create', description: 'Create new users' },
      {
        resource: 'users',
        action: 'read',
        description: 'View user information',
      },
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
      {
        resource: 'permissions',
        action: 'read',
        description: 'View permissions',
      },
      {
        resource: 'permissions',
        action: 'assign',
        description: 'Assign permissions to roles',
      },

      // Profile permissions (for regular users)
      { resource: 'profile', action: 'read', description: 'View own profile' },
      {
        resource: 'profile',
        action: 'update',
        description: 'Update own profile',
      },

      // System monitoring permissions
      {
        resource: 'system',
        action: 'monitoring:read',
        description: 'View system monitoring data',
      },

      // Error logs permissions
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
      {
        resource: 'files',
        action: 'upload',
        description: 'Upload files',
      },
      {
        resource: 'files',
        action: 'read',
        description: 'View files',
      },
      {
        resource: 'files',
        action: 'update',
        description: 'Update file metadata',
      },
      {
        resource: 'files',
        action: 'delete',
        description: 'Delete files',
      },
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
      {
        resource: 'settings',
        action: 'read',
        description: 'View settings',
      },
      {
        resource: 'settings',
        action: 'create',
        description: 'Create settings',
      },
      {
        resource: 'settings',
        action: 'update',
        description: 'Update settings',
      },
      {
        resource: 'settings',
        action: 'delete',
        description: 'Delete settings',
      },
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
    ])
    .returning(['id', 'resource', 'action']);

  // Assign all permissions to admin role
  const adminPermissions = permissions.map((perm) => ({
    role_id: adminRole.id,
    permission_id: perm.id,
  }));
  await knex('role_permissions').insert(adminPermissions);

  // Assign dashboard + user management + profile + files permissions to manager role
  const managerPermissions = permissions
    .filter(
      (perm) =>
        perm.resource === 'dashboard' ||
        perm.resource === 'users' ||
        perm.resource === 'profile' ||
        perm.resource === 'files',
    )
    .map((perm) => ({
      role_id: managerRole.id,
      permission_id: perm.id,
    }));
  await knex('role_permissions').insert(managerPermissions);

  // Assign dashboard + profile permissions to user role
  const userPermissions = permissions
    .filter(
      (perm) => perm.resource === 'dashboard' || perm.resource === 'profile',
    )
    .map((perm) => ({
      role_id: userRole.id,
      permission_id: perm.id,
    }));
  await knex('role_permissions').insert(userPermissions);

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@aegisx.local',
      username: 'admin',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true,
    })
    .returning(['id']);

  // Assign admin role to admin user
  await knex('user_roles').insert({
    user_id: adminUser.id,
    role_id: adminRole.id,
  });

  // Create manager user
  const hashedManagerPassword = await bcrypt.hash('Manager123!', 10);
  const [managerUser] = await knex('users')
    .insert({
      email: 'manager@aegisx.local',
      username: 'manager',
      password: hashedManagerPassword,
      first_name: 'Manager',
      last_name: 'User',
      is_active: true,
    })
    .returning(['id']);

  // Assign manager role to manager user
  await knex('user_roles').insert({
    user_id: managerUser.id,
    role_id: managerRole.id,
  });

  // Create demo user
  const hashedDemoPassword = await bcrypt.hash('Demo123!', 10);
  const [demoUser] = await knex('users')
    .insert({
      email: 'demo@aegisx.local',
      username: 'demo',
      password: hashedDemoPassword,
      first_name: 'Demo',
      last_name: 'User',
      is_active: true,
    })
    .returning(['id']);

  // Assign user role to demo user
  await knex('user_roles').insert({
    user_id: demoUser.id,
    role_id: userRole.id,
  });

  console.log('✅ Seed data created successfully');
  console.log('📧 Admin user: admin@aegisx.local');
  console.log('🔑 Password: Admin123!');
  console.log('📧 Manager user: manager@aegisx.local');
  console.log('🔑 Password: Manager123!');
  console.log('📧 Demo user: demo@aegisx.local');
  console.log('🔑 Password: Demo123!');
}
