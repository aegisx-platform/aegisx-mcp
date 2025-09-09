import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

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
    ])
    .returning(['id', 'resource', 'action']);

  // Assign all permissions to admin role
  const adminPermissions = permissions.map((perm) => ({
    role_id: adminRole.id,
    permission_id: perm.id,
  }));
  await knex('role_permissions').insert(adminPermissions);

  // Assign user management permissions to manager role
  const managerPermissions = permissions
    .filter((perm) => perm.resource === 'users' || perm.resource === 'profile')
    .map((perm) => ({
      role_id: managerRole.id,
      permission_id: perm.id,
    }));
  await knex('role_permissions').insert(managerPermissions);

  // Assign limited permissions to user role
  const userPermissions = permissions
    .filter((perm) => perm.resource === 'profile')
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

  console.log('✅ Seed data created successfully');
  console.log('📧 Admin user: admin@aegisx.local');
  console.log('🔑 Password: Admin123!');
}
