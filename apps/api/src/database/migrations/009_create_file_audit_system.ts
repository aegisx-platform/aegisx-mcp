import type { Knex } from 'knex';

/**
 * Consolidated Migration: File Audit System
 *
 * Creates unified file audit and access logging table with:
 * - Comprehensive operation tracking (upload, download, view, update, delete, share)
 * - HTTP-level access logging with status codes
 * - Security context (authentication method, authorization result)
 * - Performance metrics (duration, file size)
 * - Request context (IP, user agent, referer, session)
 * - Support for anonymous access logging
 *
 * This consolidates migrations:
 * - 20251028140200_create_file_audit_logs_table.ts
 * - 20251102120000_enhance_file_audit_logs.ts
 * - 20251102120100_drop_file_access_logs.ts (file_access_logs superseded)
 *
 * Note: file_access_logs table (from 019_create_file_access_logs_table.ts)
 * is NOT created here as it was superseded by the enhanced file_audit_logs.
 */

export async function up(knex: Knex): Promise<void> {
  // Drop file_access_logs if it exists (superseded by file_audit_logs)
  const fileAccessLogsExists = await knex.schema.hasTable('file_access_logs');
  if (fileAccessLogsExists) {
    // Check if table has any data
    const count = await knex('file_access_logs').count('* as count').first();
    const recordCount = count ? Number(count.count) : 0;

    if (recordCount > 0) {
      console.warn(
        `⚠️  WARNING: file_access_logs contains ${recordCount} records.`,
      );
      console.warn(
        '   These records will be DELETED when this migration runs.',
      );
      console.warn(
        '   If you need to preserve this data, run the migration script in:',
      );
      console.warn(
        '   docs/features/audit-system/FILE_LOGS_ANALYSIS.md (Phase 3)',
      );
      console.warn('');
      console.warn('   Proceeding with table drop in 5 seconds...');

      // Give time to cancel if needed (Ctrl+C)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    await knex.schema.dropTable('file_access_logs');
    console.log('✅ file_access_logs table dropped successfully');
    console.log('   Functionality merged into enhanced file_audit_logs table');
  }

  // ============================================================================
  // CREATE FILE_AUDIT_LOGS TABLE (UNIFIED AUDIT + ACCESS LOGGING)
  // ============================================================================
  await knex.schema.createTable('file_audit_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // File and user references
    table.uuid('file_id').notNullable().comment('File being operated on');

    table
      .uuid('user_id')
      .nullable()
      .comment('User performing operation (NULL for anonymous access)');

    // Operation details
    table
      .string('operation', 30)
      .notNullable()
      .comment(
        'Operation type: upload, download, view, update, delete, share, etc.',
      );

    table
      .timestamp('timestamp')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the operation occurred');

    table
      .boolean('success')
      .notNullable()
      .defaultTo(true)
      .comment('Operation completion success (different from access_granted)');

    table
      .text('error_message')
      .nullable()
      .comment('Error message if operation failed');

    // Request context
    table
      .string('ip_address', 45)
      .nullable()
      .comment('Client IP address (IPv4/IPv6)');

    table
      .string('user_agent', 1000)
      .nullable()
      .comment('Client user agent string');

    table.string('referer', 1000).nullable().comment('HTTP referer header');

    table
      .string('session_id', 128)
      .nullable()
      .comment('Session identifier for tracking');

    // Performance tracking
    table
      .integer('duration_ms')
      .nullable()
      .comment('Operation duration in milliseconds');

    table
      .bigInteger('file_size')
      .nullable()
      .comment('File size for upload/download operations');

    // File context
    table.string('file_name', 500).nullable().comment('Original file name');

    table
      .string('category', 50)
      .nullable()
      .comment('File category at time of operation');

    // HTTP and access context
    table
      .string('access_method', 20)
      .nullable()
      .comment('How file was accessed: web, api, direct_link, signed_url');

    table
      .boolean('access_granted')
      .nullable()
      .comment('Authorization success (different from operation success)');

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

    // Additional metadata
    table
      .jsonb('metadata')
      .nullable()
      .comment('Additional operation-specific metadata');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Basic indexes
    table.index(['file_id'], 'idx_file_audit_logs_file');
    table.index(['user_id'], 'idx_file_audit_logs_user');
    table.index(['operation'], 'idx_file_audit_logs_operation');
    table.index(['timestamp'], 'idx_file_audit_logs_timestamp');
    table.index(['success'], 'idx_file_audit_logs_success');
    table.index(['category'], 'idx_file_audit_logs_category');

    // HTTP and access indexes
    table.index(['access_granted'], 'idx_file_audit_logs_access_granted');
    table.index(['http_status'], 'idx_file_audit_logs_http_status');
    table.index(['session_id'], 'idx_file_audit_logs_session');
    table.index(['auth_method'], 'idx_file_audit_logs_auth_method');
    table.index(['access_method'], 'idx_file_audit_logs_access_method');

    // Composite indexes for common queries
    table.index(['file_id', 'timestamp'], 'idx_file_audit_logs_file_time');
    table.index(['user_id', 'timestamp'], 'idx_file_audit_logs_user_time');
    table.index(
      ['operation', 'timestamp'],
      'idx_file_audit_logs_operation_time',
    );
    table.index(['success', 'timestamp'], 'idx_file_audit_logs_success_time');
    table.index(
      ['access_granted', 'timestamp'],
      'idx_file_audit_logs_security',
    );

    // Performance index for cleanup
    table.index(['timestamp'], 'idx_file_audit_logs_cleanup');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE file_audit_logs IS
    'Unified file audit and access logging - tracks file operations, HTTP access patterns, and security events for compliance and analytics'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('file_audit_logs');

  // Optionally recreate file_access_logs table (structure only, no data)
  const tableExists = await knex.schema.hasTable('file_access_logs');

  if (!tableExists) {
    await knex.schema.createTable('file_access_logs', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // File reference
      table
        .uuid('file_id')
        .notNullable()
        .references('id')
        .inTable('uploaded_files')
        .onDelete('CASCADE');

      // Access information
      table
        .uuid('accessed_by')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .comment('User who accessed (null for anonymous)');
      table
        .string('access_type', 20)
        .notNullable()
        .comment('view, download, upload, delete, update');
      table
        .string('access_method', 20)
        .notNullable()
        .defaultTo('web')
        .comment('web, api, direct_link, signed_url');

      // Request context
      table
        .string('ip_address', 45)
        .nullable()
        .comment('Client IP address (IPv4/IPv6)');
      table.string('user_agent', 1000).nullable().comment('User agent string');
      table.string('referer', 1000).nullable().comment('HTTP referer header');
      table
        .uuid('session_id')
        .nullable()
        .comment('Session identifier if available');

      // Response information
      table
        .integer('http_status')
        .notNullable()
        .comment('HTTP response status code');
      table
        .bigInteger('bytes_transferred')
        .nullable()
        .comment('Number of bytes sent (for downloads)');
      table
        .integer('response_time_ms')
        .nullable()
        .comment('Response time in milliseconds');

      // Security information
      table
        .boolean('access_granted')
        .notNullable()
        .defaultTo(true)
        .comment('Whether access was granted');
      table
        .string('denial_reason', 100)
        .nullable()
        .comment('Reason if access was denied');
      table
        .string('auth_method', 20)
        .nullable()
        .comment('bearer, session, signed_url, anonymous');

      // Additional metadata
      table
        .jsonb('request_headers')
        .nullable()
        .comment('Selected request headers for analysis');
      table.jsonb('metadata').nullable().comment('Additional context data');

      // Audit fields
      table
        .timestamp('accessed_at')
        .notNullable()
        .defaultTo(knex.fn.now())
        .comment('When access occurred');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      // Indexes for performance and analytics
      table.index(['file_id'], 'idx_file_access_logs_file');
      table.index(['accessed_by'], 'idx_file_access_logs_user');
      table.index(['access_type'], 'idx_file_access_logs_type');
      table.index(['accessed_at'], 'idx_file_access_logs_time');
      table.index(['ip_address'], 'idx_file_access_logs_ip');
      table.index(['http_status'], 'idx_file_access_logs_status');
      table.index(['access_granted'], 'idx_file_access_logs_granted');

      // Composite indexes for common queries
      table.index(['file_id', 'accessed_at'], 'idx_file_access_logs_file_time');
      table.index(
        ['accessed_by', 'accessed_at'],
        'idx_file_access_logs_user_time',
      );
      table.index(
        ['access_type', 'accessed_at'],
        'idx_file_access_logs_type_time',
      );
      table.index(
        ['access_granted', 'accessed_at'],
        'idx_file_access_logs_security',
      );

      // Performance index for log cleanup
      table.index(
        ['accessed_at', 'created_at'],
        'idx_file_access_logs_cleanup',
      );
    });

    await knex.raw(`
      COMMENT ON TABLE file_access_logs IS 'Comprehensive logging of all file access attempts for security and analytics'
    `);

    console.log('✅ file_access_logs table recreated (rollback)');
    console.warn(
      '⚠️  Note: Data was not restored. This is just the table structure.',
    );
  }
}
