import type { Knex } from 'knex';

/**
 * Consolidated Migration: Error Logging System
 *
 * Creates unified error logging for frontend and backend with:
 * - Multi-level error tracking (error, warn, info)
 * - Multiple error types (javascript, http, angular, custom, backend, system)
 * - User and session context tracking
 * - Request correlation for distributed tracing
 * - Comprehensive indexes for filtering and analytics
 *
 * This consolidates migrations:
 * - 20251031120000_drop_system_settings_table.ts (cleanup)
 * - 20251031160000_create_error_logs_table.ts
 * - 20251101170000_add_backend_system_error_types.ts
 *
 * Note: This migration also removes the obsolete system_settings and
 * setting_templates tables which were superseded by app_settings.
 */

export async function up(knex: Knex): Promise<void> {
  // ============================================================================
  // CLEANUP: Drop obsolete system_settings tables
  // ============================================================================
  // These tables were created in migration 007 but never used
  // System-wide settings are now handled by app_settings table
  await knex.schema.dropTableIfExists('system_settings');
  await knex.schema.dropTableIfExists('setting_templates');

  console.log(
    '✅ Dropped obsolete system_settings and setting_templates tables',
  );

  // ============================================================================
  // CREATE ERROR_LOGS TABLE
  // ============================================================================
  await knex.schema.createTable('error_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Error details
    table.timestamp('timestamp').notNullable();
    table.text('message').notNullable();
    table.text('url').nullable();
    table.text('stack').nullable();
    table.jsonb('context').nullable();

    // Error level (enum via CHECK constraint)
    table.string('level', 20).notNullable();

    // Error type (enum via CHECK constraint) - includes backend and system types
    table.string('type', 20).notNullable();

    // User context
    table.uuid('user_id').nullable();
    table.string('session_id', 255).nullable();
    table.string('user_agent', 512).nullable();

    // Request context
    table.string('correlation_id', 255).nullable();
    table.string('ip_address', 45).nullable(); // IPv4 (15) or IPv6 (45)
    table.text('referer').nullable();

    // Timestamps
    table.timestamp('server_timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Single-column indexes
    table.index(['level'], 'idx_error_logs_level');
    table.index(['type'], 'idx_error_logs_type');
    table.index(['user_id'], 'idx_error_logs_user_id');
    table.index(['session_id'], 'idx_error_logs_session_id');
    table.index(['correlation_id'], 'idx_error_logs_correlation_id');
    table.index(['created_at'], 'idx_error_logs_created_at');

    // Composite indexes for common queries
    table.index(['timestamp', 'level'], 'idx_error_logs_timestamp_level');
    table.index(['user_id', 'timestamp'], 'idx_error_logs_user_timestamp');
    table.index(['type', 'timestamp'], 'idx_error_logs_type_timestamp');

    // Foreign key (optional, if users table exists)
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });

  // Add CHECK constraints for level and type enums
  await knex.raw(`
    ALTER TABLE error_logs ADD CONSTRAINT error_logs_level_check
    CHECK (level = ANY (ARRAY['error'::text, 'warn'::text, 'info'::text]));
  `);

  await knex.raw(`
    ALTER TABLE error_logs ADD CONSTRAINT error_logs_type_check
    CHECK (type = ANY (ARRAY['javascript'::text, 'http'::text, 'angular'::text, 'custom'::text, 'backend'::text, 'system'::text]));
  `);

  // Add table and column comments
  await knex.raw(`
    COMMENT ON TABLE error_logs IS 'Client and server error logs for monitoring and debugging';
  `);

  await knex.raw(`
    COMMENT ON COLUMN error_logs.type IS 'Error log types: javascript (frontend JS), http (frontend HTTP), angular (framework), custom (app-specific), backend (server route errors), system (process-level errors)';
  `);

  console.log('✅ Created error_logs table');
}

export async function down(knex: Knex): Promise<void> {
  // Drop error_logs table
  await knex.schema.dropTableIfExists('error_logs');
  console.log('✅ Dropped error_logs table');

  // Recreate system_settings table (rollback)
  await knex.schema.createTable('system_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('category', 50).notNullable(); // app, security, features, etc.
    table.string('key', 100).notNullable(); // specific setting key
    table.text('value').notNullable(); // setting value
    table.string('data_type', 20).defaultTo('string'); // string, number, boolean, json
    table.text('description').nullable();
    table.boolean('is_public').defaultTo(false); // Can be exposed to frontend
    table.boolean('requires_restart').defaultTo(false); // App restart needed for changes
    table.timestamps(true, true);

    // Unique constraint on category + key
    table.unique(['category', 'key']);

    // Indexes
    table.index('category');
    table.index('is_public');
    table.index(['category', 'key']);
  });

  // Recreate setting_templates table (rollback)
  await knex.schema.createTable('setting_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('category', 50).notNullable();
    table.string('key', 100).notNullable();
    table.text('default_value').notNullable();
    table.string('data_type', 20).defaultTo('string');
    table.text('description').nullable();
    table.json('validation_rules').nullable(); // JSON schema for validation
    table.boolean('user_configurable').defaultTo(true);
    table.boolean('required').defaultTo(false);
    table.timestamps(true, true);

    // Unique constraint
    table.unique(['category', 'key']);

    // Indexes
    table.index('category');
    table.index('user_configurable');
  });

  console.log(
    '✅ Recreated system_settings and setting_templates tables (rollback)',
  );
}
