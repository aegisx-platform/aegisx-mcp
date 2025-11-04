import type { Knex } from 'knex';

/**
 * Migration: Add timestamp column to login_attempts table
 *
 * Purpose: Fix missing timestamp column required by BaseAuditRepository
 *
 * The base repository expects all audit tables to have a 'timestamp' column
 * for date range filtering, but login_attempts table only had 'created_at'.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('login_attempts', (table) => {
    table
      .timestamp('timestamp')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Timestamp when the login attempt occurred (for filtering)');
  });

  // Copy created_at values to timestamp for existing records
  await knex.raw(`
    UPDATE login_attempts
    SET timestamp = created_at
    WHERE timestamp IS NULL
  `);

  // Add index for performance (matches error_logs pattern)
  await knex.schema.alterTable('login_attempts', (table) => {
    table.index(['timestamp'], 'idx_login_attempts_timestamp');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('login_attempts', (table) => {
    table.dropIndex([], 'idx_login_attempts_timestamp');
    table.dropColumn('timestamp');
  });
}
