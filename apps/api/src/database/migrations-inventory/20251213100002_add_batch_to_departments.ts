import type { Knex } from 'knex';

/**
 * Migration: Add import_batch_id to departments and users tables
 *
 * Supports Fix #4: Time-based Rollback
 * Adds import_batch_id column to track which import batch created each record.
 *
 * This enables:
 * - Precise rollback by batch ID (not time window)
 * - Tracking source of imported data
 * - Complete audit trail for imported records
 *
 * Tables affected:
 * - inventory.departments: Add import_batch_id (nullable, indexed)
 * - users: Add import_batch_id (nullable, indexed)
 *
 * The column is nullable to support:
 * - Manually created records (without import)
 * - Historical records before batch tracking was implemented
 */

export async function up(knex: Knex): Promise<void> {
  // Add import_batch_id to inventory.departments table
  await knex.schema.alterTable('inventory.departments', (table) => {
    table
      .string('import_batch_id', 100)
      .nullable()
      .index('idx_departments_import_batch')
      .comment(
        'Batch ID from import_history table for precise rollback tracking',
      );
  });

  // Add import_batch_id to users table (in public schema)
  await knex.schema.alterTable('users', (table) => {
    table
      .string('import_batch_id', 100)
      .nullable()
      .index('idx_users_import_batch')
      .comment(
        'Batch ID from import_history table for precise rollback tracking',
      );
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop import_batch_id from users table first (to avoid foreign key issues)
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex([], 'idx_users_import_batch');
    table.dropColumn('import_batch_id');
  });

  // Drop import_batch_id from inventory.departments table
  await knex.schema.alterTable('inventory.departments', (table) => {
    table.dropIndex([], 'idx_departments_import_batch');
    table.dropColumn('import_batch_id');
  });
}
