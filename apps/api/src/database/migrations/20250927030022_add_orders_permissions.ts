import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔐 Adding Orders permissions and roles...');

  // Insert permissions for orders
  const permissions = [
    {
      name: 'orders.create',
      description: 'Create orders',
      resource: 'orders',
      action: 'create',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'orders.read',
      description: 'Read orders',
      resource: 'orders',
      action: 'read',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'orders.update',
      description: 'Update orders',
      resource: 'orders',
      action: 'update',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'orders.delete',
      description: 'Delete orders',
      resource: 'orders',
      action: 'delete',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  console.log(`📝 Inserting ${permissions.length} permissions for orders...`);
  await knex('permissions').insert(permissions).onConflict('name').ignore();

  // Insert single role for orders
  const roles = [
    {
      name: 'orders',
      description: 'Access to orders',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  console.log(`🏷️  Inserting ${roles.length} role for orders...`);
  await knex('roles').insert(roles).onConflict('name').ignore();

  // Link role permissions
  const mainRole = await knex('roles').where('name', 'orders').first();
  if (mainRole) {
    const mainPermissions = await knex('permissions')
      .whereIn('name', [
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
      ])
      .select('id');

    if (mainPermissions.length > 0) {
      const rolePermissions = mainPermissions.map((p) => ({
        role_id: mainRole.id,
        permission_id: p.id,
        created_at: new Date(),
      }));

      console.log(
        `🔗 Linking ${mainPermissions.length} permissions to orders role...`,
      );
      await knex('role_permissions')
        .insert(rolePermissions)
        .onConflict(['role_id', 'permission_id'])
        .ignore();
    }
  }

  console.log('✅ Orders permissions and roles added successfully');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️ Removing Orders permissions and roles...');

  const roleIds = await knex('roles').whereIn('name', ['orders']).pluck('id');
  if (roleIds.length > 0) {
    await knex('role_permissions').whereIn('role_id', roleIds).del();
  }

  await knex('roles').whereIn('name', ['orders']).del();
  await knex('permissions').where('resource', 'orders').del();

  console.log('✅ Orders permissions and roles removed');
}
