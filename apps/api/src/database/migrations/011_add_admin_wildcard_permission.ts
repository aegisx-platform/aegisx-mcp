import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add wildcard permission for admin role to have access to all resources
  const adminRole = await knex('app_roles').where('name', 'admin').first();

  if (adminRole) {
    // Check if wildcard permission already exists
    const existingPermission = await knex('app_permissions')
      .where('resource', '*')
      .where('action', '*')
      .first();

    if (!existingPermission) {
      // Create wildcard permission
      const [permission] = await knex('app_permissions')
        .insert({
          name: 'admin.wildcard',
          description: 'Full access to all resources and actions',
          resource: '*',
          action: '*',
        })
        .returning('id');

      // Associate with admin role
      await knex('app_role_permissions').insert({
        role_id: adminRole.id,
        permission_id: permission.id,
      });
    } else {
      // Just create the association if permission exists
      const exists = await knex('app_role_permissions')
        .where('role_id', adminRole.id)
        .where('permission_id', existingPermission.id)
        .first();

      if (!exists) {
        await knex('app_role_permissions').insert({
          role_id: adminRole.id,
          permission_id: existingPermission.id,
        });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove wildcard permission
  const permission = await knex('app_permissions')
    .where('resource', '*')
    .where('action', '*')
    .first();

  if (permission) {
    // Remove role associations
    await knex('app_role_permissions')
      .where('permission_id', permission.id)
      .del();

    // Remove the permission
    await knex('app_permissions').where('id', permission.id).del();
  }
}
