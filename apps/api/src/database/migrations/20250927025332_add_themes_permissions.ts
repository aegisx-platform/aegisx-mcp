import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔐 Adding Themes permissions and roles...');

  // Insert permissions for themes
  const permissions = [
    {
      name: 'themes.create',
      description: 'Create themes',
      resource: 'themes',
      action: 'create',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'themes.read',
      description: 'Read themes',
      resource: 'themes',
      action: 'read',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'themes.update',
      description: 'Update themes',
      resource: 'themes',
      action: 'update',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'themes.delete',
      description: 'Delete themes',
      resource: 'themes',
      action: 'delete',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('permissions').insert(permissions).onConflict('name').ignore();

  // Insert roles for themes
  const roles = [
    {
      name: 'themes_admin',
      description: 'Full access to themes',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'themes_editor',
      description: 'Create, read, and update themes',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'themes_viewer',
      description: 'Read-only access to themes',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('roles').insert(roles).onConflict('name').ignore();

  console.log('✅ Themes permissions and roles added successfully');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️ Removing Themes permissions and roles...');

  const roleIds = await knex('roles')
    .whereIn('name', ['themes_admin', 'themes_editor', 'themes_viewer'])
    .pluck('id');
  if (roleIds.length > 0) {
    await knex('role_permissions').whereIn('role_id', roleIds).del();
  }

  await knex('roles')
    .whereIn('name', ['themes_admin', 'themes_editor', 'themes_viewer'])
    .del();
  await knex('permissions').where('resource', 'themes').del();

  console.log('✅ Themes permissions and roles removed');
}
