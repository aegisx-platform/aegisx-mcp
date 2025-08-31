import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('tenant_role_permissions').del();
  await knex('tenant_roles').del();
  await knex('tenant_invitations').del();
  await knex('tenant_users').del();
  await knex('audit_logs').del();
  await knex('sessions').del();
  await knex('users').del();
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('tenants').del();

  // Insert system roles
  const roles = await knex('roles')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        is_system: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'admin',
        description: 'Administrator with full tenant access',
        is_system: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'manager',
        description: 'Manager with limited administrative access',
        is_system: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'user',
        description: 'Regular user with basic access',
        is_system: true,
      },
    ])
    .returning('*');

  // Insert permissions
  const permissions = await knex('permissions')
    .insert([
      // User permissions
      { name: 'users:create', resource: 'users', action: 'create', description: 'Create users' },
      { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
      { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
      
      // Role permissions
      { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create roles' },
      { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles' },
      { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update roles' },
      { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
      
      // Permission management
      { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permissions' },
      { name: 'permissions:assign', resource: 'permissions', action: 'assign', description: 'Assign permissions' },
      
      // Tenant permissions
      { name: 'tenants:create', resource: 'tenants', action: 'create', description: 'Create tenants' },
      { name: 'tenants:read', resource: 'tenants', action: 'read', description: 'View tenants' },
      { name: 'tenants:update', resource: 'tenants', action: 'update', description: 'Update tenants' },
      { name: 'tenants:delete', resource: 'tenants', action: 'delete', description: 'Delete tenants' },
      
      // Audit logs
      { name: 'audit:read', resource: 'audit', action: 'read', description: 'View audit logs' },
      
      // Settings
      { name: 'settings:read', resource: 'settings', action: 'read', description: 'View settings' },
      { name: 'settings:update', resource: 'settings', action: 'update', description: 'Update settings' },
    ])
    .returning('*');

  // Create permission map for easier assignment
  const permissionMap = permissions.reduce((acc, perm) => {
    acc[perm.name] = perm.id;
    return acc;
  }, {} as Record<string, string>);

  // Assign permissions to roles
  const rolePermissions = [];

  // Super Admin - all permissions
  Object.values(permissionMap).forEach((permissionId) => {
    rolePermissions.push({
      role_id: '00000000-0000-0000-0000-000000000001',
      permission_id: permissionId,
    });
  });

  // Admin - all except tenant management
  const adminPermissions = Object.entries(permissionMap)
    .filter(([name]) => !name.startsWith('tenants:'))
    .map(([, id]) => ({
      role_id: '00000000-0000-0000-0000-000000000002',
      permission_id: id,
    }));
  rolePermissions.push(...adminPermissions);

  // Manager - users and roles read, settings
  const managerPermissions = [
    'users:read',
    'users:create',
    'users:update',
    'roles:read',
    'permissions:read',
    'audit:read',
    'settings:read',
  ].map((name) => ({
    role_id: '00000000-0000-0000-0000-000000000003',
    permission_id: permissionMap[name],
  }));
  rolePermissions.push(...managerPermissions);

  // User - basic read permissions
  const userPermissions = [
    'users:read',
    'settings:read',
  ].map((name) => ({
    role_id: '00000000-0000-0000-0000-000000000004',
    permission_id: permissionMap[name],
  }));
  rolePermissions.push(...userPermissions);

  await knex('role_permissions').insert(rolePermissions);

  // Create default tenant
  const [defaultTenant] = await knex('tenants')
    .insert({
      id: '00000000-0000-0000-0000-000000000100',
      name: 'Default Organization',
      slug: 'default',
      domain: 'localhost',
      settings: JSON.stringify({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
      }),
      is_active: true,
      subscription_status: 'active',
      subscription_plan: 'enterprise',
      max_users: 1000,
    })
    .returning('*');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await knex('users').insert({
    id: '00000000-0000-0000-0000-000000000200',
    tenant_id: defaultTenant.id,
    email: 'admin@aegisx.com',
    username: 'admin',
    password_hash: hashedPassword,
    first_name: 'Super',
    last_name: 'Admin',
    is_active: true,
    is_email_verified: true,
    role_id: '00000000-0000-0000-0000-000000000001', // super_admin role
    metadata: JSON.stringify({
      theme_preference: 'system',
      language: 'en',
    }),
  });

  // Create demo users for each role
  const demoUsers = [
    {
      email: 'admin@demo.com',
      username: 'demo_admin',
      first_name: 'Demo',
      last_name: 'Admin',
      role_id: '00000000-0000-0000-0000-000000000002', // admin
    },
    {
      email: 'manager@demo.com',
      username: 'demo_manager',
      first_name: 'Demo',
      last_name: 'Manager',
      role_id: '00000000-0000-0000-0000-000000000003', // manager
    },
    {
      email: 'user@demo.com',
      username: 'demo_user',
      first_name: 'Demo',
      last_name: 'User',
      role_id: '00000000-0000-0000-0000-000000000004', // user
    },
  ];

  for (const userData of demoUsers) {
    await knex('users').insert({
      tenant_id: defaultTenant.id,
      ...userData,
      password_hash: hashedPassword, // Same password for demo
      is_active: true,
      is_email_verified: true,
      metadata: JSON.stringify({
        theme_preference: 'system',
        language: 'en',
      }),
    });
  }

  console.log('✅ Initial seed data created successfully');
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('Super Admin: admin@aegisx.com / Admin123!');
  console.log('Demo Admin: admin@demo.com / Admin123!');
  console.log('Demo Manager: manager@demo.com / Admin123!');
  console.log('Demo User: user@demo.com / Admin123!');
}