import type { Knex } from 'knex';

export async function up(knex: any): Promise<void> {
  // Extend users table to match OpenAPI UserProfile schema
  await knex.schema.alterTable('users', (table) => {
    // Avatar and profile fields
    table.string('avatar_url', 500).nullable();
    table.string('name', 200); // Full name computed from first_name + last_name or set directly

    // Account status and verification
    table
      .enum('status', ['active', 'inactive', 'suspended', 'pending'])
      .defaultTo('pending');
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at').nullable();

    // Two-factor authentication
    table.boolean('two_factor_enabled').defaultTo(false);
    table.string('two_factor_secret', 255).nullable();
    table.json('two_factor_backup_codes').nullable();

    // Soft delete support
    table.timestamp('deleted_at').nullable();

    // Additional profile fields
    table.text('bio').nullable();
    table.string('timezone', 100).defaultTo('UTC');
    table.string('language', 10).defaultTo('en');
    table.date('date_of_birth').nullable();
    table.string('phone', 20).nullable();

    // Indexes for performance
    table.index('status');
    table.index('email_verified');
    table.index('two_factor_enabled');
    table.index('deleted_at');
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
}

export async function down(knex: any): Promise<void> {
  // Drop avatar_files table first (foreign key dependency)
  await knex.schema.dropTableIfExists('avatar_files');

  // Remove added columns from users table
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar_url');
    table.dropColumn('name');
    table.dropColumn('status');
    table.dropColumn('email_verified');
    table.dropColumn('email_verified_at');
    table.dropColumn('two_factor_enabled');
    table.dropColumn('two_factor_secret');
    table.dropColumn('two_factor_backup_codes');
    table.dropColumn('deleted_at');
    table.dropColumn('bio');
    table.dropColumn('timezone');
    table.dropColumn('language');
    table.dropColumn('date_of_birth');
    table.dropColumn('phone');
  });
}
