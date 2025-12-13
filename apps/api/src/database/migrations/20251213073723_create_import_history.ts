import type { Knex } from 'knex';

/**
 * Migration: Create import_history table
 *
 * Audit trail and status tracking for all data import operations
 * Part of: Auto-Discovery Import System
 *
 * Table purpose:
 * - Tracks every import job with comprehensive metrics
 * - Records success/failure status and error details
 * - Enables import rollback with audit trail
 * - Provides analytics on import performance and data quality
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('import_history', (table) => {
    // Primary key
    table.increments('id').primary();

    // Job identification
    table
      .uuid('job_id')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique identifier for this import job');

    // Session reference
    table
      .uuid('session_id')
      .nullable()
      .references('session_id')
      .inTable('import_sessions')
      .onDelete('SET NULL')
      .comment('Reference to validation session (if applicable)');

    // Module reference
    table
      .string('module_name', 100)
      .notNullable()
      .comment('Which module was imported (e.g., drug_generics)');

    // Import status
    table
      .string('status', 20)
      .notNullable()
      .defaultTo('pending')
      .comment('Job status: pending, running, completed, failed, rolled_back');

    // Metrics - Row counts
    table
      .integer('total_rows')
      .nullable()
      .comment('Total rows attempted to import');

    table
      .integer('imported_rows')
      .notNullable()
      .defaultTo(0)
      .comment('Successfully imported rows');

    table
      .integer('error_rows')
      .notNullable()
      .defaultTo(0)
      .comment('Rows that failed during import');

    table
      .integer('warning_count')
      .notNullable()
      .defaultTo(0)
      .comment('Number of validation warnings');

    // Timing
    table.timestamp('started_at').nullable().comment('When import job started');

    table
      .timestamp('completed_at')
      .nullable()
      .comment('When import job completed (success or failure)');

    table
      .integer('duration_ms')
      .nullable()
      .comment('Total duration in milliseconds');

    // Error tracking
    table
      .text('error_message')
      .nullable()
      .comment('Human-readable error message if import failed');

    table
      .jsonb('error_details')
      .nullable()
      .comment(
        'Detailed error information (stack trace, validation errors, etc.)',
      );

    // Rollback support
    table
      .boolean('can_rollback')
      .notNullable()
      .defaultTo(true)
      .comment('Whether this import can be rolled back');

    table
      .timestamp('rolled_back_at')
      .nullable()
      .comment('When this import was rolled back (if applicable)');

    table
      .uuid('rolled_back_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('User who performed the rollback');

    // Audit trail
    table
      .uuid('imported_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT')
      .comment('User who initiated the import');

    // File information
    table
      .string('file_name', 255)
      .nullable()
      .comment('Name of uploaded file (e.g., drug_generics.csv)');

    table
      .integer('file_size_bytes')
      .nullable()
      .comment('Size of uploaded file in bytes');

    // Audit fields
    table.timestamps(true, true);

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Lookup indexes
    table.index(['job_id'], 'idx_ih_job_id');
    table.index(['session_id'], 'idx_ih_session_id');
    table.index(['module_name'], 'idx_ih_module');
    table.index(['status'], 'idx_ih_status');
    table.index(['imported_by'], 'idx_ih_user');

    // Rollback queries
    table.index(['can_rollback', 'rolled_back_at'], 'idx_ih_rollback');

    // Time-based queries
    table.index(['started_at'], 'idx_ih_started');
    table.index(['completed_at'], 'idx_ih_completed');
    table.index(['created_at'], 'idx_ih_created');

    // Composite indexes for common queries
    table.index(['module_name', 'status'], 'idx_ih_module_status');
    table.index(['imported_by', 'created_at'], 'idx_ih_user_date');
    table.index(['status', 'created_at'], 'idx_ih_status_date');
    table.index(['module_name', 'created_at'], 'idx_ih_module_date');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE import_history IS
    'Comprehensive audit trail of all import operations with metrics, error tracking, and rollback support'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('import_history');
}
