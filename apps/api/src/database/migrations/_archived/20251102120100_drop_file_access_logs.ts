import type { Knex } from 'knex';

/**
 * Drop file_access_logs table
 *
 * This table is being replaced by the enhanced file_audit_logs table.
 * The file_access_logs table was never integrated into the codebase
 * (no service layer, no API endpoints, no usage).
 *
 * All functionality has been merged into file_audit_logs which now provides:
 * - File operation audit logging
 * - HTTP access tracking
 * - Security event logging
 *
 * If this table contains data that needs to be preserved, run the migration
 * script in docs/features/audit-system/FILE_LOGS_ANALYSIS.md first to migrate
 * data to file_audit_logs.
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('file_access_logs');

  if (tableExists) {
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

    // Drop the table
    await knex.schema.dropTable('file_access_logs');

    console.log('✅ file_access_logs table dropped successfully');
    console.log('   Functionality merged into enhanced file_audit_logs table');
  } else {
    console.log('ℹ️  file_access_logs table does not exist, skipping drop');
  }
}

export async function down(knex: Knex): Promise<void> {
  // Recreate the table from original migration
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

    // Add table comment
    await knex.raw(`
      COMMENT ON TABLE file_access_logs IS 'Comprehensive logging of all file access attempts for security and analytics'
    `);

    console.log('✅ file_access_logs table recreated (rollback)');
    console.warn(
      '⚠️  Note: Data was not restored. This is just the table structure.',
    );
  }
}
