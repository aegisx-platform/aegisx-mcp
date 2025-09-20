import Knex from 'knex';

export async function up(knex: any): Promise<void> {
  // Create notifications table for in-app notifications
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('type', 50).notNullable(); // security, update, reminder, marketing, etc.
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.json('data').nullable(); // Additional notification data
    table.string('action_url', 500).nullable(); // URL to navigate when clicked
    table.boolean('read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.boolean('archived').defaultTo(false);
    table.timestamp('archived_at').nullable();
    table.enum('priority', ['low', 'normal', 'high', 'urgent']).defaultTo('normal');
    table.timestamp('expires_at').nullable(); // For time-sensitive notifications
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('type');
    table.index('read');
    table.index('archived');
    table.index('priority');
    table.index('expires_at');
    table.index(['user_id', 'read']);
    table.index(['user_id', 'type']);
  });

  // Create notification_preferences table for granular notification settings
  await knex.schema.createTable('notification_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('notification_type', 50).notNullable(); // security, updates, marketing, etc.
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('push_enabled').defaultTo(false);
    table.boolean('desktop_enabled').defaultTo(true);
    table.boolean('sound_enabled').defaultTo(true);
    table.enum('frequency', ['immediate', 'daily', 'weekly', 'never']).defaultTo('immediate');
    table.time('quiet_hours_start').nullable(); // Start of quiet hours
    table.time('quiet_hours_end').nullable(); // End of quiet hours
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Unique constraint
    table.unique(['user_id', 'notification_type']);
    
    // Indexes
    table.index('user_id');
    table.index('notification_type');
  });

  // Create audit_logs table for tracking all system changes
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable(); // Nullable for system actions
    table.uuid('session_id').nullable();
    table.string('entity_type', 100).notNullable(); // users, roles, settings, etc.
    table.string('entity_id', 255).nullable(); // ID of the affected entity
    table.enum('action', ['create', 'read', 'update', 'delete', 'login', 'logout']).notNullable();
    table.text('description').nullable();
    table.json('old_values').nullable(); // Previous values for updates
    table.json('new_values').nullable(); // New values for creates/updates
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.string('source', 50).defaultTo('web'); // web, api, mobile, system
    table.json('metadata').nullable(); // Additional context
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('session_id').references('id').inTable('user_sessions').onDelete('SET NULL');
    
    // Indexes for audit queries
    table.index('user_id');
    table.index('session_id');
    table.index('entity_type');
    table.index('entity_id');
    table.index('action');
    table.index('created_at');
    table.index(['entity_type', 'entity_id']);
    table.index(['user_id', 'created_at']);
  });

  // Create email_verification_tokens table
  await knex.schema.createTable('email_verification_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('token', 255).unique().notNullable();
    table.string('email', 255).notNullable(); // Email being verified (may be different from current)
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('used_at').nullable();
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('token');
    table.index('email');
    table.index('expires_at');
    table.index('used');
  });

  // Create password_reset_tokens table
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('token', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('used_at').nullable();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('token');
    table.index('expires_at');
    table.index('used');
  });

  // Create api_keys table for API access
  await knex.schema.createTable('api_keys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('name', 100).notNullable(); // Human-readable name for the key
    table.string('key_hash', 255).notNullable(); // Hashed API key
    table.string('key_prefix', 20).notNullable(); // First few characters for identification
    table.json('scopes').nullable(); // Permissions/scopes for this key
    table.timestamp('last_used_at').nullable();
    table.string('last_used_ip', 45).nullable();
    table.timestamp('expires_at').nullable(); // Optional expiration
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('user_id');
    table.index('key_hash');
    table.index('key_prefix');
    table.index('is_active');
    table.index('expires_at');
    table.index('last_used_at');
  });
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('api_keys');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('email_verification_tokens');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('notification_preferences');
  await knex.schema.dropTableIfExists('notifications');
}