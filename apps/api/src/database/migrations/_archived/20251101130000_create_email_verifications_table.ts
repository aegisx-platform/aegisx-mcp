import type { Knex } from 'knex';

/**
 * Migration: Create email_verifications table
 *
 * Purpose: Track email verification tokens and status
 *
 * Features:
 * - Store verification tokens for email confirmation
 * - Track verification status and expiry
 * - Support token regeneration (resend verification email)
 * - Automatic cleanup of expired tokens
 * - Indexes for fast lookups
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('email_verifications', (table) => {
    // Primary key
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique identifier for the verification record');

    // User reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User ID for verification');

    // Verification token
    table
      .string('token', 255)
      .notNullable()
      .unique()
      .comment('Unique verification token sent via email');

    // Email being verified
    table
      .string('email', 255)
      .notNullable()
      .comment('Email address being verified');

    // Status tracking
    table
      .boolean('verified')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the email has been verified');

    table
      .timestamp('verified_at')
      .nullable()
      .comment('When the email was verified');

    // Expiration
    table
      .timestamp('expires_at')
      .notNullable()
      .comment('When the verification token expires (24 hours)');

    // IP tracking
    table
      .string('ip_address', 45)
      .nullable()
      .comment('IP address when token was used');

    // Timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the verification token was created');

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the record was last updated');

    // Indexes for performance
    // Index for token lookup (most common query)
    table.index(['token'], 'idx_email_verifications_token');

    // Index for user lookup
    table.index(['user_id'], 'idx_email_verifications_user');

    // Index for cleanup queries (delete expired tokens)
    table.index(['expires_at'], 'idx_email_verifications_expires');

    // Index for checking verification status
    table.index(['user_id', 'verified'], 'idx_email_verifications_user_status');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE email_verifications IS
    'Tracks email verification tokens and status for user registration';
  `);

  // Add email_verified column to users table if it doesn't exist
  const hasColumn = await knex.schema.hasColumn('users', 'email_verified');
  if (!hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table
        .boolean('email_verified')
        .notNullable()
        .defaultTo(false)
        .comment('Whether the user email has been verified');

      table
        .timestamp('email_verified_at')
        .nullable()
        .comment('When the email was verified');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_verifications');

  // Remove email_verified columns from users table
  const hasColumn = await knex.schema.hasColumn('users', 'email_verified');
  if (hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('email_verified');
      table.dropColumn('email_verified_at');
    });
  }
}
