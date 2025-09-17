import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
    table.index(['accessed_at', 'created_at'], 'idx_file_access_logs_cleanup');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE file_access_logs IS 'Comprehensive logging of all file access attempts for security and analytics'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('file_access_logs');
}
