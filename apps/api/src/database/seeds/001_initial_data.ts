import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

/**
 * Link all permissions for a module/resource to the admin role (idempotent)
 * Used for permissions created by migrations (e.g., module roles like testProducts)
 */
async function linkAdminPermissions(
  knex: Knex,
  resource: string,
): Promise<void> {
  console.log(`🔗 Linking ${resource} permissions to admin role...`);

  const adminRole = await knex('roles').where('name', 'admin').first();
  if (!adminRole) {
    throw new Error('Admin role not found - run base migrations first');
  }

  const permissions = await knex('permissions')
    .where('resource', resource)
    .select('id', 'action');

  if (permissions.length === 0) {
    console.log(`⏭️  No permissions found for resource: ${resource}`);
    return;
  }

  // Insert role-permission mappings idempotently
  // This handles permissions created by migrations (like module roles)
  for (const permission of permissions) {
    await knex.raw(
      `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `,
      [adminRole.id, permission.id],
    );
  }

  console.log(
    `✅ Linked ${permissions.length} ${resource} permissions to admin role`,
  );
}

export async function seed(knex: Knex): Promise<void> {
  // Clear only user-related data (idempotent seed design)
  // ❌ Do NOT delete permissions or role_permissions
  // Permissions are managed by migrations, not seeds

  // First, clear inventory tables that reference users (if they exist)
  // This handles FK constraints from inventory schema
  try {
    // Clear budget_request related tables first (child tables)
    await knex.raw('DELETE FROM inventory.budget_request_items WHERE true');
    await knex.raw('DELETE FROM inventory.budget_request_comments WHERE true');
    await knex.raw('DELETE FROM inventory.budget_request_audit WHERE true');
    await knex.raw('DELETE FROM inventory.budget_requests WHERE true');
  } catch {
    // Tables might not exist yet, ignore
  }

  await knex('user_sessions').del();
  await knex('user_roles').del();
  await knex('users').del();

  // Don't delete roles - they're created in migration 001
  // Don't delete permissions - they're created in migrations

  // Get system roles by name (created by migration 001 or 002)
  const adminRole = await knex('roles').where('name', 'admin').first();
  const userRole = await knex('roles').where('name', 'user').first();
  const moderatorRole = await knex('roles').where('name', 'moderator').first();

  if (!adminRole || !userRole || !moderatorRole) {
    throw new Error('System roles not found - run migrations first');
  }

  // Insert additional roles if needed (manager role) - idempotent
  const managerRoles = await knex('roles')
    .insert([
      {
        name: 'manager',
        description: 'Manager with user management access',
      },
    ])
    .onConflict(['name'])
    .ignore()
    .returning(['id', 'name']);

  // If manager role already existed, get it from the database
  let managerRole = managerRoles[0];
  if (!managerRole) {
    managerRole = await knex('roles').where('name', 'manager').first();
  }

  // Get system permissions (now created by migration 002)
  // NOTE: System permissions are created in migrations/002_create_system_permissions.ts
  // This seed no longer creates them, ensuring single source of truth
  const permissions = await knex('permissions')
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
    .select('id', 'resource', 'action');

  if (permissions.length > 0) {
    // Assign existing system permissions to admin role (idempotent)
    for (const perm of permissions) {
      await knex.raw(
        `
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `,
        [adminRole.id, perm.id],
      );
    }
  }

  // Link module permissions to admin role (from CRUD generator migrations)
  // Example: testProducts permissions created by 002_*_add_testProducts_permissions.ts
  await linkAdminPermissions(knex, 'testProducts');

  // Assign dashboard + user management + profile + files permissions to manager role (idempotent)
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

  for (const perm of managerPermissions) {
    await knex.raw(
      `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `,
      [perm.role_id, perm.permission_id],
    );
  }

  // Assign dashboard + profile permissions to user role (idempotent)
  const userPermissions = permissions
    .filter(
      (perm) => perm.resource === 'dashboard' || perm.resource === 'profile',
    )
    .map((perm) => ({
      role_id: userRole.id,
      permission_id: perm.id,
    }));

  for (const perm of userPermissions) {
    await knex.raw(
      `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `,
      [perm.role_id, perm.permission_id],
    );
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@aegisx.local',
      username: 'admin',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      status: 'active',
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
      status: 'active',
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
      status: 'active',
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
