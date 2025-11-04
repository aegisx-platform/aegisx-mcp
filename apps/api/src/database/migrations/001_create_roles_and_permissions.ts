import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create roles table with RBAC enhancements
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).unique().notNullable();
    table.string('description', 255);
    table.boolean('is_active').defaultTo(true).notNullable();
    table.boolean('is_system_role').defaultTo(false).notNullable();
    table.string('category', 50);
    table.integer('hierarchy_level').defaultTo(0).notNullable();
    table.timestamps(true, true);

    // Indexes for performance
    table.index('is_active');
    table.index('is_system_role');
    table.index('category');
    table.index('hierarchy_level');
  });

  // Insert system roles - UUID will be auto-generated
  await knex('roles').insert([
    {
      name: 'admin',
      description: 'Administrator with full system access',
    },
    {
      name: 'user',
      description: 'Regular user with limited access',
    },
    {
      name: 'moderator',
      description: 'Moderator with elevated permissions',
    },
  ]);

  // Log created roles
  console.log('✅ Created roles and permissions tables');
  console.log('✅ Inserted system roles: admin, user, moderator');

  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('resource', 100).notNullable();
    table.string('action', 50).notNullable();
    table.string('description', 255);
    table.timestamps(true, true);

    // Create unique constraint on resource + action
    table.unique(['resource', 'action']);
  });

  // Create role_permissions junction table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('role_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('role_id')
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');
    table
      .foreign('permission_id')
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');

    // Composite primary key
    table.primary(['role_id', 'permission_id']);
  });

  // Create indexes for better performance
  await knex.schema.alterTable('permissions', (table) => {
    table.index('resource');
    table.index('action');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}
