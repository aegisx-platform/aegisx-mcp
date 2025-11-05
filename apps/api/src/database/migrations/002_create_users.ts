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

    // Profile and avatar fields (from old 004_extend_users_table)
    table.string('avatar_url', 500).nullable();
    table.string('name', 200).nullable(); // Full name computed from first_name + last_name or set directly
    table.text('bio').nullable();
    table.date('date_of_birth').nullable();
    table.string('phone', 20).nullable();

    // Two-factor authentication (from old 004_extend_users_table)
    table.boolean('two_factor_enabled').defaultTo(false);
    table.string('two_factor_secret', 255).nullable();
    table.json('two_factor_backup_codes').nullable();

    // Soft delete support with tracking (for tracking deleted users)
    table.timestamp('deleted_at').nullable();
    table.text('deletion_reason').nullable(); // From old 015_add_user_deletion_fields
    table.timestamp('recovery_deadline').nullable(); // From old 015_add_user_deletion_fields
    table.string('deleted_by_ip', 45).nullable(); // Track IP that initiated deletion
    table.text('deleted_by_user_agent').nullable(); // Track user agent

    table.timestamps(true, true);

    // Indexes for performance
    table.index('email');
    table.index('username');
    table.index('status');
    table.index('email_verified');
    table.index('two_factor_enabled');
    table.index('deleted_at');
    table.index('recovery_deadline'); // For cleanup jobs
  });

  // Create avatar_files table for storing avatar metadata and thumbnails
  await knex.schema.createTable('avatar_files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('original_filename', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.integer('file_size').notNullable();
    table.string('storage_path', 500).notNullable();
    table.json('thumbnails').nullable(); // Store thumbnail URLs and metadata
    table.timestamps(true, true);

    // Foreign key
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('mime_type');
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
  await knex.schema.dropTableIfExists('avatar_files');
  await knex.schema.dropTableIfExists('users');
}
