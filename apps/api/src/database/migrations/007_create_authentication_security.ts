import type { Knex } from 'knex';

/**
 * Consolidated Migration: Authentication & Security Tables
 *
 * Creates comprehensive authentication and security infrastructure including:
 * - api_keys: API key management with scope-based permissions
 * - login_attempts: Brute force protection and security monitoring
 * - email_verifications: Email confirmation tokens and tracking
 * - password_reset_tokens: Secure password recovery system
 *
 * This consolidates migrations:
 * - 020_create_api_keys_table.ts
 * - 20251101120000_create_login_attempts_table.ts
 * - 20251101130000_create_email_verifications_table.ts
 * - 20251101140000_create_password_reset_tokens_table.ts
 * - 20251102040000_add_timestamp_to_login_attempts.ts
 */

export async function up(knex: Knex): Promise<void> {
  // ============================================================================
  // 1. API KEYS TABLE
  // ============================================================================
  await knex.schema.createTable('api_keys', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('Owner of the API key');

    // API Key identification
    table
      .string('name', 100)
      .notNullable()
      .comment('Human-readable name for the API key');
    table
      .string('key_hash', 255)
      .notNullable()
      .comment('bcrypt hash of the full API key');
    table
      .string('key_prefix', 11)
      .notNullable()
      .comment('API key prefix (ak_xxxxxxxx) for fast lookup');

    // Permissions and scopes
    table
      .jsonb('scopes')
      .nullable()
      .comment(
        'Array of permission scopes {resource: string, actions: string[]}',
      );

    // Usage tracking
    table
      .timestamp('last_used_at')
      .nullable()
      .comment('Last time this API key was used');
    table
      .string('last_used_ip', 45)
      .nullable()
      .comment('Last IP address that used this key (IPv4/IPv6)');

    // Expiration and status
    table
      .timestamp('expires_at')
      .nullable()
      .comment('When this API key expires (null = never expires)');
    table
      .boolean('is_active')
      .notNullable()
      .defaultTo(true)
      .comment('Whether this API key is active');

    // Audit timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this API key was created');
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this API key was last updated');

    // Primary indexes for performance
    table.index(['user_id'], 'idx_api_keys_user');
    table.index(['key_prefix'], 'idx_api_keys_prefix');
    table.index(['is_active'], 'idx_api_keys_active');
    table.index(['expires_at'], 'idx_api_keys_expiry');

    // Composite indexes for common queries
    table.index(['user_id', 'is_active'], 'idx_api_keys_user_active');
    table.index(['key_prefix', 'is_active'], 'idx_api_keys_prefix_active');
    table.index(['expires_at', 'is_active'], 'idx_api_keys_expiry_active');

    // Index for usage tracking queries
    table.index(['last_used_at'], 'idx_api_keys_last_used');
  });

  await knex.raw(`
    COMMENT ON TABLE api_keys IS 'API keys for programmatic access with scope-based permissions and usage tracking'
  `);

  // ============================================================================
  // 2. LOGIN ATTEMPTS TABLE
  // ============================================================================
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
      .timestamp('timestamp')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Timestamp when the login attempt occurred (for filtering)');

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the login attempt occurred');

    // Indexes for performance
    table.index(['email', 'created_at'], 'idx_login_attempts_email_created');
    table.index(
      ['username', 'created_at'],
      'idx_login_attempts_username_created',
    );
    table.index(['ip_address', 'created_at'], 'idx_login_attempts_ip_created');
    table.index(['user_id', 'created_at'], 'idx_login_attempts_user_created');
    table.index(['created_at'], 'idx_login_attempts_created');
    table.index(
      ['success', 'created_at'],
      'idx_login_attempts_success_created',
    );
    table.index(['timestamp'], 'idx_login_attempts_timestamp');
  });

  await knex.raw(`
    COMMENT ON TABLE login_attempts IS
    'Records all login attempts for security monitoring and account lockout';
  `);

  // ============================================================================
  // 3. EMAIL VERIFICATIONS TABLE
  // ============================================================================
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
    table.index(['token'], 'idx_email_verifications_token');
    table.index(['user_id'], 'idx_email_verifications_user');
    table.index(['expires_at'], 'idx_email_verifications_expires');
    table.index(['user_id', 'verified'], 'idx_email_verifications_user_status');
  });

  await knex.raw(`
    COMMENT ON TABLE email_verifications IS
    'Tracks email verification tokens and status for user registration';
  `);

  // Add email_verified columns to users table if they don't exist
  const hasEmailVerifiedColumn = await knex.schema.hasColumn(
    'users',
    'email_verified',
  );
  if (!hasEmailVerifiedColumn) {
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

  // ============================================================================
  // 4. PASSWORD RESET TOKENS TABLE
  // ============================================================================
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
    table.index(['token'], 'idx_password_reset_tokens_token');
    table.index(['user_id'], 'idx_password_reset_tokens_user');
    table.index(['expires_at'], 'idx_password_reset_tokens_expires');
    table.index(['user_id', 'used'], 'idx_password_reset_tokens_user_status');
  });

  await knex.raw(`
    COMMENT ON TABLE password_reset_tokens IS
    'Tracks password reset tokens and status for secure password recovery';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop email_verified columns from users table
  const hasEmailVerifiedColumn = await knex.schema.hasColumn(
    'users',
    'email_verified',
  );
  if (hasEmailVerifiedColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('email_verified');
      table.dropColumn('email_verified_at');
    });
  }

  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('email_verifications');
  await knex.schema.dropTableIfExists('login_attempts');
  await knex.schema.dropTableIfExists('api_keys');
}
