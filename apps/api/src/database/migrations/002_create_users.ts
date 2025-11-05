import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('username', 100).unique().notNullable();
    table.string('password', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.timestamp('last_login_at');

    // Account status and verification (from old 004_extend_users_table)
    table
      .enum('status', ['active', 'inactive', 'suspended', 'pending'])
      .defaultTo('pending');
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();

    // Localization preferences (from old 004_extend_users_table)
    table.string('timezone', 100).defaultTo('UTC');
    table.string('language', 10).defaultTo('en');

    // Soft delete support (for tracking deleted users)
    table.timestamp('deleted_at').nullable();

    table.timestamps(true, true);

    // Indexes for performance
    table.index('email');
    table.index('username');
    table.index('status');
    table.index('email_verified');
  });

  // Create user_roles junction table with RBAC enhancements
  await knex.schema.createTable('user_roles', (table) => {
    table.uuid('user_id').notNullable();
    table.uuid('role_id').notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('assigned_at').defaultTo(knex.fn.now()).notNullable();
    table.uuid('assigned_by');
    table.timestamp('expires_at');
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

    // Composite primary key
    table.primary(['user_id', 'role_id']);

    // Indexes for performance
    table.index('is_active');
    table.index('assigned_at');
    table.index('expires_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('users');
}
