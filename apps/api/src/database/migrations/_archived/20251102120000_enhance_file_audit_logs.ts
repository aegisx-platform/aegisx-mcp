import type { Knex } from 'knex';

/**
 * Enhance file_audit_logs table
 *
 * Adds HTTP-level and security context fields from file_access_logs
 * to create a unified file audit and access logging table.
 *
 * New fields:
 * - access_method: How file was accessed (web, api, direct_link, signed_url)
 * - access_granted: Authorization result (different from operation success)
 * - denial_reason: Why access was denied
 * - http_status: HTTP response status code
 * - auth_method: Authentication method used
 * - referer: HTTP referer header
 * - session_id: Session identifier
 *
 * Also renames 'duration' to 'duration_ms' for clarity.
 */
export async function up(knex: Knex): Promise<void> {
  // Check if table exists
  const tableExists = await knex.schema.hasTable('file_audit_logs');
  if (!tableExists) {
    throw new Error(
      'file_audit_logs table does not exist. Run migration 20251028140200 first.',
    );
  }

  await knex.schema.alterTable('file_audit_logs', (table) => {
    // HTTP and access context
    table
      .string('access_method', 20)
      .nullable()
      .comment('How file was accessed: web, api, direct_link, signed_url');

    table
      .boolean('access_granted')
      .nullable()
      .comment(
        'Authorization result - different from success (operation completion)',
      );

    table
      .string('denial_reason', 100)
      .nullable()
      .comment('Reason why access was denied');

    table
      .integer('http_status')
      .nullable()
      .comment('HTTP response status code');

    // Authentication context
    table
      .string('auth_method', 20)
      .nullable()
      .comment('Authentication method: bearer, session, signed_url, anonymous');

    // Request context
    table.string('referer', 1000).nullable().comment('HTTP referer header');

    table
      .string('session_id', 128)
      .nullable()
      .comment('Session identifier for tracking');

    // Add new indexes
    table.index(['access_granted'], 'idx_file_audit_logs_access_granted');
    table.index(['http_status'], 'idx_file_audit_logs_http_status');
    table.index(['session_id'], 'idx_file_audit_logs_session');
    table.index(['auth_method'], 'idx_file_audit_logs_auth_method');
    table.index(['access_method'], 'idx_file_audit_logs_access_method');

    // Composite index for security queries
    table.index(
      ['access_granted', 'timestamp'],
      'idx_file_audit_logs_security',
    );
  });

  // Rename duration to duration_ms for clarity
  await knex.raw(`
    ALTER TABLE file_audit_logs
    RENAME COLUMN duration TO duration_ms
  `);

  // Make user_id nullable to support anonymous access
  await knex.raw(`
    ALTER TABLE file_audit_logs
    ALTER COLUMN user_id DROP NOT NULL
  `);

  // Update table comment
  await knex.raw(`
    COMMENT ON TABLE file_audit_logs IS
    'Unified file audit and access logging - tracks file operations, HTTP access patterns, and security events for compliance and analytics'
  `);

  // Add column comments
  await knex.raw(`
    COMMENT ON COLUMN file_audit_logs.user_id IS 'User performing operation (NULL for anonymous access)';
    COMMENT ON COLUMN file_audit_logs.duration_ms IS 'Operation duration in milliseconds';
    COMMENT ON COLUMN file_audit_logs.success IS 'Operation completion success (different from access_granted)';
    COMMENT ON COLUMN file_audit_logs.access_granted IS 'Authorization success (different from operation success)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('file_audit_logs', (table) => {
    // Drop new indexes
    table.dropIndex(['access_granted'], 'idx_file_audit_logs_access_granted');
    table.dropIndex(['http_status'], 'idx_file_audit_logs_http_status');
    table.dropIndex(['session_id'], 'idx_file_audit_logs_session');
    table.dropIndex(['auth_method'], 'idx_file_audit_logs_auth_method');
    table.dropIndex(['access_method'], 'idx_file_audit_logs_access_method');
    table.dropIndex(
      ['access_granted', 'timestamp'],
      'idx_file_audit_logs_security',
    );

    // Drop new columns
    table.dropColumn('access_method');
    table.dropColumn('access_granted');
    table.dropColumn('denial_reason');
    table.dropColumn('http_status');
    table.dropColumn('auth_method');
    table.dropColumn('referer');
    table.dropColumn('session_id');
  });

  // Rename duration_ms back to duration
  await knex.raw(`
    ALTER TABLE file_audit_logs
    RENAME COLUMN duration_ms TO duration
  `);

  // Make user_id NOT NULL again
  await knex.raw(`
    ALTER TABLE file_audit_logs
    ALTER COLUMN user_id SET NOT NULL
  `);

  // Restore original table comment
  await knex.raw(`
    COMMENT ON TABLE file_audit_logs IS
    'Comprehensive audit logging for all file operations - supports compliance, security monitoring, and analytics'
  `);
}
