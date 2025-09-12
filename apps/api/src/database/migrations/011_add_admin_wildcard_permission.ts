import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if roles table exists first
  const hasRolesTable = await knex.schema.hasTable('roles');
  if (!hasRolesTable) {
    console.log('roles table does not exist, skipping migration');
    return;
  }

  // Add wildcard permission for admin role to have access to all resources
  const adminRole = await knex('roles').where('name', 'admin').first();

  if (adminRole) {
    // Check if wildcard permission already exists
    const existingPermission = await knex('permissions')
      .where('resource', '*')
      .where('action', '*')
      .first();

    if (!existingPermission) {
      // Create wildcard permission
      const [permission] = await knex('permissions')
        .insert({
          description: 'Full access to all resources and actions',
          resource: '*',
          action: '*',
        })
        .returning('id');

      // Associate with admin role
      await knex('role_permissions').insert({
        role_id: adminRole.id,
        permission_id: permission.id,
      });
    } else {
      // Just create the association if permission exists
      const exists = await knex('role_permissions')
        .where('role_id', adminRole.id)
        .where('permission_id', existingPermission.id)
        .first();

      if (!exists) {
        await knex('role_permissions').insert({
          role_id: adminRole.id,
          permission_id: existingPermission.id,
        });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove wildcard permission
  const permission = await knex('permissions')
    .where('resource', '*')
    .where('action', '*')
    .first();

  if (permission) {
    // Remove role associations
    await knex('role_permissions').where('permission_id', permission.id).del();

    // Remove the permission
    await knex('permissions').where('id', permission.id).del();
  }
}
