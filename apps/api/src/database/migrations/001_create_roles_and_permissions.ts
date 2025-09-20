import Knex from 'knex';

export async function up(knex: any): Promise<void> {
  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).unique().notNullable();
    table.string('description', 255);
    table.timestamps(true, true);
  });

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
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    
    // Composite primary key
    table.primary(['role_id', 'permission_id']);
  });

  // Create indexes for better performance
  await knex.schema.alterTable('permissions', (table) => {
    table.index('resource');
    table.index('action');
  });
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}