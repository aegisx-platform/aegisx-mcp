import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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

export async function down(knex: Knex): Promise<void> {
  // Drop avatar_files table first (foreign key dependency)
  await knex.schema.dropTableIfExists('avatar_files');

  // Check which columns exist before dropping
  const hasAvatarUrl = await knex.schema.hasColumn('users', 'avatar_url');
  const hasName = await knex.schema.hasColumn('users', 'name');
  const hasStatus = await knex.schema.hasColumn('users', 'status');
  const hasEmailVerified = await knex.schema.hasColumn(
    'users',
    'email_verified',
  );
  const hasEmailVerifiedAt = await knex.schema.hasColumn(
    'users',
    'email_verified_at',
  );
  const hasTwoFactorEnabled = await knex.schema.hasColumn(
    'users',
    'two_factor_enabled',
  );
  const hasTwoFactorSecret = await knex.schema.hasColumn(
    'users',
    'two_factor_secret',
  );
  const hasTwoFactorBackupCodes = await knex.schema.hasColumn(
    'users',
    'two_factor_backup_codes',
  );
  const hasDeletedAt = await knex.schema.hasColumn('users', 'deleted_at');
  const hasBio = await knex.schema.hasColumn('users', 'bio');
  const hasTimezone = await knex.schema.hasColumn('users', 'timezone');
  const hasLanguage = await knex.schema.hasColumn('users', 'language');
  const hasDateOfBirth = await knex.schema.hasColumn('users', 'date_of_birth');
  const hasPhone = await knex.schema.hasColumn('users', 'phone');

  // Remove added columns from users table only if they exist
  await knex.schema.alterTable('users', (table) => {
    if (hasAvatarUrl) table.dropColumn('avatar_url');
    if (hasName) table.dropColumn('name');
    if (hasStatus) table.dropColumn('status');
    if (hasEmailVerified) table.dropColumn('email_verified');
    if (hasEmailVerifiedAt) table.dropColumn('email_verified_at');
    if (hasTwoFactorEnabled) table.dropColumn('two_factor_enabled');
    if (hasTwoFactorSecret) table.dropColumn('two_factor_secret');
    if (hasTwoFactorBackupCodes) table.dropColumn('two_factor_backup_codes');
    if (hasDeletedAt) table.dropColumn('deleted_at');
    if (hasBio) table.dropColumn('bio');
    if (hasTimezone) table.dropColumn('timezone');
    if (hasLanguage) table.dropColumn('language');
    if (hasDateOfBirth) table.dropColumn('date_of_birth');
    if (hasPhone) table.dropColumn('phone');
  });
}
