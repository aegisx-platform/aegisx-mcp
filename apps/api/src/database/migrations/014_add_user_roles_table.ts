import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create user_roles junction table if not exists
  const hasUserRoles = await knex.schema.hasTable('user_roles');
  if (!hasUserRoles) {
    await knex.schema.createTable('user_roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable();
      table.uuid('role_id').notNullable();
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.uuid('assigned_by').nullable(); // Who assigned this role
      table.timestamp('expires_at').nullable(); // Optional role expiration
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);

      // Foreign keys
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .foreign('role_id')
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE');
      table
        .foreign('assigned_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');

      // Ensure unique user-role combination per active assignment
      table.unique(['user_id', 'role_id'], 'unique_active_user_role');
    });
  }

  // Create indexes for better performance if table was created
  if (!hasUserRoles) {
    await knex.schema.alterTable('user_roles', (table) => {
      table.index('user_id');
      table.index('role_id');
      table.index('is_active');
      table.index('expires_at');
      table.index(['user_id', 'is_active']);
    });
  }

  // Add role hierarchy support to roles table if columns don't exist
  const hasParentRoleColumn = await knex.schema.hasColumn(
    'roles',
    'parent_role_id',
  );
  if (!hasParentRoleColumn) {
    await knex.schema.alterTable('roles', (table) => {
      table.uuid('parent_role_id').nullable();
      table.integer('hierarchy_level').defaultTo(0);
      table.string('category', 50).nullable(); // e.g., 'system', 'custom', 'department'
      table.boolean('is_system_role').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
    });
  }

  // Add foreign key and indexes for role hierarchy if columns were added
  if (!hasParentRoleColumn) {
    await knex.schema.alterTable('roles', (table) => {
      table
        .foreign('parent_role_id')
        .references('id')
        .inTable('roles')
        .onDelete('SET NULL');
      table.index('parent_role_id');
      table.index('hierarchy_level');
      table.index('category');
      table.index('is_system_role');
      table.index('is_active');
    });
  }

  // Enhance permissions table with additional metadata if columns don't exist
  const hasPermissionCategory = await knex.schema.hasColumn(
    'permissions',
    'category',
  );
  if (!hasPermissionCategory) {
    await knex.schema.alterTable('permissions', (table) => {
      table.string('category', 50).nullable(); // e.g., 'user', 'admin', 'content'
      table.boolean('is_system_permission').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.text('conditions').nullable(); // JSON conditions for context-based permissions
    });
  }

  // Add indexes for enhanced permissions if columns were added
  if (!hasPermissionCategory) {
    await knex.schema.alterTable('permissions', (table) => {
      table.index('category');
      table.index('is_system_permission');
      table.index('is_active');
    });
  }

  // Insert default system roles using upsert to avoid conflicts
  const systemRoles = [
    {
      name: 'super_admin',
      description: 'System administrator with full access',
      category: 'system',
      is_system_role: true,
      hierarchy_level: 0,
    },
    {
      name: 'admin',
      description: 'Administrator with management access',
      category: 'system',
      is_system_role: true,
      hierarchy_level: 1,
    },
    {
      name: 'user',
      description: 'Standard user with basic access',
      category: 'system',
      is_system_role: true,
      hierarchy_level: 2,
    },
  ];

  // Update existing roles to add new columns
  for (const role of systemRoles) {
    await knex('roles').where('name', role.name).update({
      category: role.category,
      is_system_role: role.is_system_role,
      hierarchy_level: role.hierarchy_level,
      is_active: true,
    });
  }

  // Update existing permissions to add new columns
  const systemPermissions = [
    {
      resource: '*',
      action: '*',
      category: 'system',
      is_system_permission: true,
    },
    {
      resource: 'users',
      action: 'read',
      category: 'user',
      is_system_permission: true,
    },
    {
      resource: 'users',
      action: 'update',
      category: 'user',
      is_system_permission: true,
    },
    {
      resource: 'profile',
      action: 'read',
      category: 'user',
      is_system_permission: true,
    },
    {
      resource: 'profile',
      action: 'update',
      category: 'user',
      is_system_permission: true,
    },
  ];

  for (const permission of systemPermissions) {
    await knex('permissions')
      .where({ resource: permission.resource, action: permission.action })
      .update({
        category: permission.category,
        is_system_permission: permission.is_system_permission,
        is_active: true,
      });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove enhanced columns from permissions table
  await knex.schema.alterTable('permissions', (table) => {
    table.dropColumn('conditions');
    table.dropColumn('is_active');
    table.dropColumn('is_system_permission');
    table.dropColumn('category');
  });

  // Remove enhanced columns from roles table
  await knex.schema.alterTable('roles', (table) => {
    table.dropForeign(['parent_role_id']);
    table.dropColumn('is_active');
    table.dropColumn('is_system_role');
    table.dropColumn('category');
    table.dropColumn('hierarchy_level');
    table.dropColumn('parent_role_id');
  });

  // Drop user_roles table
  await knex.schema.dropTableIfExists('user_roles');
}
