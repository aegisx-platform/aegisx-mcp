import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create user_sessions table with full features (consolidated from 003 + 008)
  await knex.schema.createTable('user_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('refresh_token', 500).unique().notNullable();
    table.string('user_agent', 500);
    table.string('ip_address', 45);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Device information fields
    table.string('device_type', 20).nullable(); // Desktop, Mobile, Tablet, Unknown
    table.string('device_os', 50).nullable(); // macOS, Windows, iOS, Android, etc.
    table.string('device_browser', 50).nullable(); // Chrome, Safari, Firefox, etc.
    table.string('device_name', 100).nullable(); // User-defined device name

    // Location information
    table.string('location_country', 100).nullable();
    table.string('location_region', 100).nullable();
    table.string('location_city', 100).nullable();
    table.string('location_timezone', 100).nullable();
    table.decimal('location_latitude', 10, 8).nullable();
    table.decimal('location_longitude', 11, 8).nullable();

    // Session tracking
    table.timestamp('last_activity_at').nullable();
    table.string('access_token_hash', 255).nullable(); // For token validation
    table.boolean('is_current_session').defaultTo(false);
    table.integer('activity_count').defaultTo(0); // Track session activity

    // Security flags
    table.boolean('is_suspicious').defaultTo(false);
    table.string('security_flags', 500).nullable(); // JSON array of security flags

    // Additional session metadata
    table.json('session_data').nullable(); // Store additional session information

    // Foreign key
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('refresh_token');
    table.index('expires_at');
    table.index('device_type');
    table.index('device_os');
    table.index('location_country');
    table.index('last_activity_at');
    table.index('is_current_session');
    table.index('is_suspicious');
  });

  // Create session_activity table for tracking user activity within sessions
  await knex.schema.createTable('session_activity', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').notNullable();
    table.string('activity_type', 50).notNullable(); // login, logout, api_call, page_view
    table.string('resource', 200).nullable(); // API endpoint or page URL
    table.string('method', 10).nullable(); // HTTP method
    table.integer('status_code').nullable(); // HTTP status code
    table.string('ip_address', 45).nullable(); // Allow for IPv6
    table.text('user_agent').nullable();
    table.json('request_data').nullable(); // Store request metadata
    table.json('response_data').nullable(); // Store response metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign key
    table
      .foreign('session_id')
      .references('id')
      .inTable('user_sessions')
      .onDelete('CASCADE');

    // Indexes
    table.index('session_id');
    table.index('activity_type');
    table.index('resource');
    table.index('created_at');
    table.index(['session_id', 'activity_type']);
  });

  // Create session_security_events for tracking security-related events
  await knex.schema.createTable('session_security_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').nullable(); // Nullable for events without session
    table.uuid('user_id').nullable(); // Nullable for events without user context
    table.string('event_type', 50).notNullable(); // failed_login, suspicious_activity, etc.
    table.string('severity', 20).notNullable(); // low, medium, high, critical
    table.text('description').notNullable();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.json('event_data').nullable(); // Additional event metadata
    table.boolean('resolved').defaultTo(false);
    table.timestamp('resolved_at').nullable();
    table.uuid('resolved_by').nullable(); // User who resolved the event
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('session_id')
      .references('id')
      .inTable('user_sessions')
      .onDelete('SET NULL');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('resolved_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Indexes
    table.index('session_id');
    table.index('user_id');
    table.index('event_type');
    table.index('severity');
    table.index('resolved');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('session_security_events');
  await knex.schema.dropTableIfExists('session_activity');
  await knex.schema.dropTableIfExists('user_sessions');
}
