import type { Knex } from 'knex';

/**
 * Migration: Create import_sessions table
 *
 * Temporary storage for file validation data during the import wizard
 * Part of: Auto-Discovery Import System
 *
 * Table purpose:
 * - Stores parsed file data during validation phase
 * - Maintains validation results (errors, warnings, statistics)
 * - Tracks session lifecycle with 30-minute expiration
 * - Enables multi-step import process (upload → validate → confirm → execute)
 * - Auto-cleanup of expired sessions via PostgreSQL function
 */

export async function up(knex: Knex): Promise<void> {
  // ============================================================================
  // CREATE IMPORT_SESSIONS TABLE
  // ============================================================================
  await knex.schema.createTable('import_sessions', (table) => {
    // Primary key
    table
      .uuid('session_id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique session identifier');

    // Module reference
    table
      .string('module_name', 100)
      .notNullable()
      .comment('Which module this session is for (e.g., drug_generics)');

    // File information
    table
      .string('file_name', 255)
      .notNullable()
      .comment('Name of uploaded file');

    table
      .integer('file_size_bytes')
      .nullable()
      .comment('Size of uploaded file in bytes');

    table.string('file_type', 10).nullable().comment('File type: csv or excel');

    // Validation data
    table
      .jsonb('validated_data')
      .notNullable()
      .comment('Parsed rows from file (array of objects)');

    // Validation results
    table
      .jsonb('validation_result')
      .notNullable()
      .comment(
        'Validation output: errors (array), warnings (array), stats (object)',
      );

    // Import decision
    table
      .boolean('can_proceed')
      .notNullable()
      .defaultTo(false)
      .comment('Whether validation passed and import can proceed');

    // Session lifecycle
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When session was created');

    table
      .timestamp('expires_at')
      .notNullable()
      .defaultTo(knex.raw("NOW() + INTERVAL '30 minutes'"))
      .comment(
        'When session expires and can be cleaned up (30 min from creation)',
      );

    // User reference
    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User who created this session (initiated upload)');

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Lookup indexes
    table.index(['session_id'], 'idx_is_session_id');
    table.index(['module_name'], 'idx_is_module');
    table.index(['created_by'], 'idx_is_created_by');

    // Cleanup and expiration
    table.index(['expires_at'], 'idx_is_expires');
    table.index(['expires_at', 'created_at'], 'idx_is_cleanup');

    // Query optimization
    table.index(['module_name', 'created_at'], 'idx_is_module_date');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE import_sessions IS
    'Temporary storage for file validation data during import wizard with automatic 30-minute expiration'
  `);

  // ============================================================================
  // CREATE CLEANUP FUNCTION FOR EXPIRED SESSIONS
  // ============================================================================

  await knex.raw(`
    CREATE OR REPLACE FUNCTION cleanup_expired_import_sessions()
    RETURNS void AS $$
    DECLARE
      deleted_count INTEGER;
    BEGIN
      DELETE FROM import_sessions
      WHERE expires_at < NOW();

      GET DIAGNOSTICS deleted_count = ROW_COUNT;

      IF deleted_count > 0 THEN
        RAISE NOTICE 'Cleaned up % expired import sessions', deleted_count;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Add function comment
  await knex.raw(`
    COMMENT ON FUNCTION cleanup_expired_import_sessions() IS
    'Deletes import sessions that have expired (older than 30 minutes)'
  `);

  // ============================================================================
  // CREATE PERIODIC CLEANUP TRIGGER (Optional but Recommended)
  // ============================================================================
  // Note: PostgreSQL doesn't have built-in job scheduling like MySQL's EVENT
  // This function should be called by an external job scheduler (e.g., Node.js cron, Kubernetes cronjob)
  // Example usage in code:
  //   await knex.raw('SELECT cleanup_expired_import_sessions()')
  //
  // Or use pg_cron extension (if available):
  //   CREATE EXTENSION IF NOT EXISTS pg_cron;
  //   SELECT cron.schedule('cleanup_import_sessions', '*/5 * * * *', 'SELECT cleanup_expired_import_sessions()');
}

export async function down(knex: Knex): Promise<void> {
  // Drop trigger first (if it exists)
  await knex.raw(`
    DROP TRIGGER IF EXISTS cleanup_import_sessions_trigger ON import_sessions CASCADE;
  `);

  // Drop function
  await knex.raw(`
    DROP FUNCTION IF EXISTS cleanup_expired_import_sessions() CASCADE;
  `);

  // Drop table
  await knex.schema.dropTableIfExists('import_sessions');
}
