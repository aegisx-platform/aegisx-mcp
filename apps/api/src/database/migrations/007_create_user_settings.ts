import type { Knex } from 'knex';

export async function up(knex: any): Promise<void> {
  // Create user_settings table for granular settings management
  await knex.schema.createTable('user_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('category', 50).notNullable(); // theme, layout, notifications, etc.
    table.string('key', 100).notNullable(); // specific setting key
    table.text('value').notNullable(); // setting value (can be JSON string)
    table.string('data_type', 20).defaultTo('string'); // string, number, boolean, json, array
    table.text('description').nullable();
    table.boolean('is_system').defaultTo(false); // System settings vs user settings
    table.timestamps(true, true);

    // Foreign key
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Unique constraint on user_id + category + key
    table.unique(['user_id', 'category', 'key']);

    // Indexes
    table.index('user_id');
    table.index('category');
    table.index(['user_id', 'category']);
    table.index('is_system');
  });

  // Create themes table for available theme configurations
  await knex.schema.createTable('themes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).unique().notNullable(); // 'default', 'dark', 'minimal'
    table.string('display_name', 100).notNullable(); // 'Default', 'Dark Mode'
    table.text('description').nullable();
    table.string('preview_image_url', 500).nullable();
    table.json('color_palette').nullable(); // Store theme colors
    table.json('css_variables').nullable(); // CSS custom properties
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_default').defaultTo(false);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);

    // Indexes
    table.index('name');
    table.index('is_active');
    table.index('is_default');
    table.index('sort_order');
  });

  // Create system_settings for application-wide settings
  await knex.schema.createTable('system_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('category', 50).notNullable(); // app, security, features, etc.
    table.string('key', 100).notNullable(); // specific setting key
    table.text('value').notNullable(); // setting value
    table.string('data_type', 20).defaultTo('string'); // string, number, boolean, json
    table.text('description').nullable();
    table.boolean('is_public').defaultTo(false); // Can be exposed to frontend
    table.boolean('requires_restart').defaultTo(false); // App restart needed for changes
    table.timestamps(true, true);

    // Unique constraint on category + key
    table.unique(['category', 'key']);

    // Indexes
    table.index('category');
    table.index('is_public');
    table.index(['category', 'key']);
  });

  // Create setting_templates for default setting structures
  await knex.schema.createTable('setting_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('category', 50).notNullable();
    table.string('key', 100).notNullable();
    table.text('default_value').notNullable();
    table.string('data_type', 20).defaultTo('string');
    table.text('description').nullable();
    table.json('validation_rules').nullable(); // JSON schema for validation
    table.boolean('user_configurable').defaultTo(true);
    table.boolean('required').defaultTo(false);
    table.timestamps(true, true);

    // Unique constraint
    table.unique(['category', 'key']);

    // Indexes
    table.index('category');
    table.index('user_configurable');
  });
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('setting_templates');
  await knex.schema.dropTableIfExists('system_settings');
  await knex.schema.dropTableIfExists('themes');
  await knex.schema.dropTableIfExists('user_settings');
}
