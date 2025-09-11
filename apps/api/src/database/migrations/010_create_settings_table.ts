import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create app_settings table (renamed to avoid conflict with existing tables)
  await knex.schema.createTable('app_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Setting identification
    table.string('key', 255).notNullable().unique().index();
    table.string('namespace', 100).notNullable().defaultTo('default').index();
    table.string('category', 100).notNullable().index();
    
    // Setting value (stored as JSONB for flexibility)
    table.jsonb('value').notNullable();
    table.jsonb('default_value').notNullable();
    
    // Setting metadata
    table.string('label', 255).notNullable();
    table.text('description');
    table.enum('data_type', [
      'string',
      'number',
      'boolean',
      'json',
      'array',
      'date',
      'email',
      'url'
    ]).notNullable().defaultTo('string');
    
    // Access control
    table.enum('access_level', ['public', 'user', 'admin', 'system']).notNullable().defaultTo('admin');
    table.boolean('is_encrypted').defaultTo(false);
    table.boolean('is_readonly').defaultTo(false);
    table.boolean('is_hidden').defaultTo(false);
    
    // Validation rules (stored as JSON)
    table.jsonb('validation_rules');
    
    // UI hints (for frontend forms)
    table.jsonb('ui_schema');
    
    // Grouping and ordering
    table.integer('sort_order').defaultTo(0);
    table.string('group', 100);
    
    // Audit fields
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Create app user settings overrides table
  await knex.schema.createTable('app_user_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Relations
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('setting_id').notNullable().references('id').inTable('app_settings').onDelete('CASCADE');
    
    // Override value
    table.jsonb('value').notNullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Unique constraint - one override per user per setting
    table.unique(['user_id', 'setting_id']);
    
    // Indexes
    table.index('user_id');
    table.index('setting_id');
  });

  // Create app settings history table for audit trail
  await knex.schema.createTable('app_settings_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Reference to setting
    table.uuid('setting_id').notNullable().references('id').inTable('app_settings').onDelete('CASCADE');
    
    // Change details
    table.jsonb('old_value');
    table.jsonb('new_value');
    table.string('action', 50).notNullable(); // create, update, delete
    table.text('reason'); // Optional reason for change
    
    // Who made the change
    table.uuid('changed_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());
    
    // Additional context
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    
    // Index for querying history
    table.index('setting_id');
    table.index('changed_at');
    table.index('changed_by');
  });

  // Create indexes for better query performance
  await knex.raw('CREATE INDEX idx_app_settings_namespace_category ON app_settings(namespace, category)');
  await knex.raw('CREATE INDEX idx_app_settings_namespace_key ON app_settings(namespace, key)');
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_namespace_key');
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_namespace_category');
  
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('app_settings_history');
  await knex.schema.dropTableIfExists('app_user_settings');
  await knex.schema.dropTableIfExists('app_settings');
}