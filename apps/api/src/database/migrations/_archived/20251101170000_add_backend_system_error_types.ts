import type { Knex } from 'knex';

/**
 * Add 'backend' and 'system' to error_logs type CHECK constraint
 *
 * Purpose: Extend error logging to capture:
 * - 'backend': Server-side route handler errors
 * - 'system': Process-level errors (uncaughtException, unhandledRejection)
 *
 * This enables unified error monitoring for both frontend and backend errors
 * in a single error_logs table.
 *
 * Note: The error_logs table uses CHECK constraints, not enum types.
 */
export async function up(knex: Knex): Promise<void> {
  // Drop the existing CHECK constraint
  await knex.raw(`
    ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_type_check;
  `);

  // Add new CHECK constraint with additional values
  await knex.raw(`
    ALTER TABLE error_logs ADD CONSTRAINT error_logs_type_check
    CHECK (type = ANY (ARRAY['javascript'::text, 'http'::text, 'angular'::text, 'custom'::text, 'backend'::text, 'system'::text]));
  `);

  // Add comment to table
  await knex.raw(`
    COMMENT ON COLUMN error_logs.type IS 'Error log types: javascript (frontend JS), http (frontend HTTP), angular (framework), custom (app-specific), backend (server route errors), system (process-level errors)';
  `);

  console.log('✅ Added backend and system error types to error_logs table');
}

/**
 * Rollback: Restore original CHECK constraint
 *
 * Note: This will fail if there are existing rows with 'backend' or 'system' type.
 * You must delete those rows first before rolling back.
 */
export async function down(knex: Knex): Promise<void> {
  // Drop the extended CHECK constraint
  await knex.raw(`
    ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_type_check;
  `);

  // Restore original CHECK constraint (without 'backend' and 'system')
  await knex.raw(`
    ALTER TABLE error_logs ADD CONSTRAINT error_logs_type_check
    CHECK (type = ANY (ARRAY['javascript'::text, 'http'::text, 'angular'::text, 'custom'::text]));
  `);

  // Remove comment
  await knex.raw(`
    COMMENT ON COLUMN error_logs.type IS NULL;
  `);

  console.log('✅ Restored original error_logs type constraint');
}
