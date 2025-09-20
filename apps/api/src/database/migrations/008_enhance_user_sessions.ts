import Knex from 'knex';

export async function up(knex: any): Promise<void> {
  // Enhance user_sessions table with device info and location tracking
  await knex.schema.alterTable('user_sessions', (table) => {
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
    
    // Add indexes
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
    table.foreign('session_id').references('id').inTable('user_sessions').onDelete('CASCADE');
    
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
    table.foreign('session_id').references('id').inTable('user_sessions').onDelete('SET NULL');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('resolved_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index('session_id');
    table.index('user_id');
    table.index('event_type');
    table.index('severity');
    table.index('resolved');
    table.index('created_at');
  });
}

export async function down(knex: any): Promise<void> {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('session_security_events');
  await knex.schema.dropTableIfExists('session_activity');
  
  // Remove added columns from user_sessions
  await knex.schema.alterTable('user_sessions', (table) => {
    table.dropColumn('device_type');
    table.dropColumn('device_os');
    table.dropColumn('device_browser');
    table.dropColumn('device_name');
    table.dropColumn('location_country');
    table.dropColumn('location_region');
    table.dropColumn('location_city');
    table.dropColumn('location_timezone');
    table.dropColumn('location_latitude');
    table.dropColumn('location_longitude');
    table.dropColumn('last_activity_at');
    table.dropColumn('access_token_hash');
    table.dropColumn('is_current_session');
    table.dropColumn('activity_count');
    table.dropColumn('is_suspicious');
    table.dropColumn('security_flags');
    table.dropColumn('session_data');
  });
}