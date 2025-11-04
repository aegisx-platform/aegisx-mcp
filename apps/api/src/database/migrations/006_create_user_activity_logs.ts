import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_activity_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key to users table
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Activity information
    table.string('action', 100).notNullable(); // 'login', 'logout', 'profile_update', etc.
    table.text('description').notNullable(); // Human readable description
    table
      .enum('severity', ['info', 'warning', 'error', 'critical'])
      .defaultTo('info');

    // Request/session information
    table.string('ip_address', 45); // IPv4 (15) or IPv6 (45) address
    table.text('user_agent');
    table.string('session_id', 128);
    table.string('request_id', 64); // For correlation with logs

    // Device and location information (JSON)
    table.jsonb('device_info'); // Parsed user agent info
    table.jsonb('location_info'); // Geographic location (if available)
    table.jsonb('metadata'); // Additional action-specific data

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for performance
    table.index('user_id'); // Most common query
    table.index(['user_id', 'created_at']); // Timeline queries
    table.index(['user_id', 'action']); // Filter by action
    table.index('action'); // Global action analysis
    table.index('session_id'); // Session tracking
    table.index('created_at'); // Chronological queries
    table.index(['severity', 'created_at']); // Security monitoring
    table.index('ip_address'); // Security analysis
  });

  // Create a function to automatically clean old activity logs
  await knex.raw(`
    CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
    RETURNS void AS $$
    BEGIN
      -- Keep only last 2 years of activity logs
      DELETE FROM user_activity_logs
      WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    END;
    $$ LANGUAGE plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the cleanup function
  await knex.raw('DROP FUNCTION IF EXISTS cleanup_old_activity_logs()');

  // Drop the table (indexes will be dropped automatically)
  await knex.schema.dropTableIfExists('user_activity_logs');
}
