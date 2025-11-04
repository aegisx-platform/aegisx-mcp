import type { Knex } from 'knex';

/**
 * Create file_audit_logs table
 *
 * Comprehensive audit logging for all file operations.
 * Replaces file_access_logs with more detailed operation tracking.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('file_audit_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // File and user references
    table.uuid('file_id').notNullable().comment('File being operated on');

    table
      .uuid('user_id')
      .notNullable()
      .comment('User performing the operation');

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
      .comment('Whether the operation succeeded');

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

    // Performance tracking
    table
      .integer('duration')
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

    // Additional metadata
    table
      .jsonb('metadata')
      .nullable()
      .comment('Additional operation-specific metadata');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for querying and analytics
    table.index(['file_id'], 'idx_file_audit_logs_file');
    table.index(['user_id'], 'idx_file_audit_logs_user');
    table.index(['operation'], 'idx_file_audit_logs_operation');
    table.index(['timestamp'], 'idx_file_audit_logs_timestamp');
    table.index(['success'], 'idx_file_audit_logs_success');
    table.index(['category'], 'idx_file_audit_logs_category');

    // Composite indexes for common queries
    table.index(['file_id', 'timestamp'], 'idx_file_audit_logs_file_time');
    table.index(['user_id', 'timestamp'], 'idx_file_audit_logs_user_time');
    table.index(
      ['operation', 'timestamp'],
      'idx_file_audit_logs_operation_time',
    );
    table.index(['success', 'timestamp'], 'idx_file_audit_logs_success_time');

    // Performance index for cleanup
    table.index(['timestamp'], 'idx_file_audit_logs_cleanup');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE file_audit_logs IS 'Comprehensive audit logging for all file operations - supports compliance, security monitoring, and analytics'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('file_audit_logs');
}
