import type { Knex } from 'knex';

/**
 * Migration: Create password_reset_tokens table
 *
 * Purpose: Track password reset tokens and status
 *
 * Features:
 * - Store password reset tokens sent via email
 * - Track token usage status and expiry
 * - Support one-time use tokens
 * - Automatic cleanup of expired tokens
 * - Indexes for fast lookups
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('password_reset_tokens', (table) => {
    // Primary key
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique identifier for the reset token record');

    // User reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User ID requesting password reset');

    // Reset token
    table
      .string('token', 255)
      .notNullable()
      .unique()
      .comment('Unique password reset token sent via email');

    // Email for tracking
    table
      .string('email', 255)
      .notNullable()
      .comment('Email address for password reset');

    // Status tracking
    table
      .boolean('used')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the token has been used');

    table
      .timestamp('used_at')
      .nullable()
      .comment('When the token was used to reset password');

    // Expiration
    table
      .timestamp('expires_at')
      .notNullable()
      .comment('When the reset token expires (1 hour)');

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
      .comment('When the reset token was created');

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the record was last updated');

    // Indexes for performance
    // Index for token lookup (most common query)
    table.index(['token'], 'idx_password_reset_tokens_token');

    // Index for user lookup
    table.index(['user_id'], 'idx_password_reset_tokens_user');

    // Index for cleanup queries (delete expired tokens)
    table.index(['expires_at'], 'idx_password_reset_tokens_expires');

    // Index for checking token status
    table.index(['user_id', 'used'], 'idx_password_reset_tokens_user_status');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE password_reset_tokens IS
    'Tracks password reset tokens and status for secure password recovery';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('password_reset_tokens');
}
