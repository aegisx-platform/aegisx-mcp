import type { Knex } from 'knex';

/**
 * Migration: Add authentication context columns to import_history table
 *
 * Adds fields to track user context during import operations for complete audit trails:
 * - imported_by_name: Display name of user who performed the import
 * - ip_address: Client IP address where import was initiated
 * - user_agent: User-Agent header from request
 *
 * These columns support Fix #1: Authentication Context in the import system
 */

export async function up(knex: Knex): Promise<void> {
  // Add context columns to import_history table
  await knex.schema.alterTable('import_history', (table) => {
    // User display name (optional)
    table
      .string('imported_by_name', 255)
      .nullable()
      .after('imported_by')
      .comment('Display name of user who initiated the import');

    // IP address (optional)
    table
      .string('ip_address', 50)
      .nullable()
      .after('imported_by_name')
      .comment('Client IP address where import was initiated');

    // User-Agent (optional)
    table
      .text('user_agent')
      .nullable()
      .after('ip_address')
      .comment('User-Agent header from request');
  });

  // Add index for user queries (already has imported_by index, but improve it)
  await knex.schema.alterTable('import_history', (table) => {
    table.index(['imported_by_name'], 'idx_ih_user_name');
    table.index(['ip_address'], 'idx_ih_ip');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the new columns in reverse order
  await knex.schema.alterTable('import_history', (table) => {
    table.dropIndex([], 'idx_ih_user_name');
    table.dropIndex([], 'idx_ih_ip');
    table.dropColumn('user_agent');
    table.dropColumn('ip_address');
    table.dropColumn('imported_by_name');
  });
}
