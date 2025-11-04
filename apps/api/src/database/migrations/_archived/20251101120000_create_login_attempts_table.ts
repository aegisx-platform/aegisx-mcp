import type { Knex } from 'knex';

/**
 * Migration: Create login_attempts table
 *
 * Purpose: Track failed login attempts for account lockout and brute force protection
 *
 * Features:
 * - Track all login attempts (success and failure)
 * - Store IP address and user agent for security analysis
 * - Support email and username login methods
 * - Automatic cleanup of old records
 * - Indexes for fast lookups
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('login_attempts', (table) => {
    // Primary key
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique identifier for the login attempt');

    // User identification (may not exist if email/username is invalid)
    table
      .uuid('user_id')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User ID if user exists, null for invalid email/username');

    // Login credentials attempted
    table
      .string('email', 255)
      .nullable()
      .comment('Email address used for login attempt');

    table
      .string('username', 100)
      .nullable()
      .comment('Username used for login attempt');

    // Request metadata
    table
      .string('ip_address', 45)
      .notNullable()
      .comment('IP address of the request (supports IPv4 and IPv6)');

    table
      .text('user_agent')
      .nullable()
      .comment('User agent string from the request');

    // Attempt result
    table
      .boolean('success')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the login attempt was successful');

    table
      .string('failure_reason', 100)
      .nullable()
      .comment(
        'Reason for failure: invalid_credentials, account_locked, account_inactive, etc.',
      );

    // Timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the login attempt occurred');

    // Indexes for performance
    // Index for checking recent attempts by email
    table.index(['email', 'created_at'], 'idx_login_attempts_email_created');

    // Index for checking recent attempts by username
    table.index(
      ['username', 'created_at'],
      'idx_login_attempts_username_created',
    );

    // Index for checking recent attempts by IP
    table.index(['ip_address', 'created_at'], 'idx_login_attempts_ip_created');

    // Index for checking user's login history
    table.index(['user_id', 'created_at'], 'idx_login_attempts_user_created');

    // Index for cleanup queries (delete old records)
    table.index(['created_at'], 'idx_login_attempts_created');

    // Index for security analysis (failed attempts)
    table.index(
      ['success', 'created_at'],
      'idx_login_attempts_success_created',
    );
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE login_attempts IS
    'Records all login attempts for security monitoring and account lockout';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('login_attempts');
}
