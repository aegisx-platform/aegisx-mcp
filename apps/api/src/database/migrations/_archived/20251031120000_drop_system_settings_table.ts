import type { Knex } from 'knex';

/**
 * Migration: Drop system_settings table
 *
 * Reason: System-wide settings are now handled by app_settings table
 *         with access_level: 'system'. The system_settings table was
 *         created in migration 007 but never used in the application.
 *
 * Impact: This migration drops:
 *         - system_settings table (orphaned, no backend code using it)
 *         - setting_templates table (also unused)
 *
 * Note: Migration 010 introduced app_settings which supersedes the
 *       older system_settings approach.
 */

export async function up(knex: Knex): Promise<void> {
  // Drop system_settings table (created in 007_create_user_settings.ts)
  await knex.schema.dropTableIfExists('system_settings');

  // Drop setting_templates table (also from 007, unused)
  await knex.schema.dropTableIfExists('setting_templates');

  console.log('✅ Dropped system_settings and setting_templates tables');
}

export async function down(knex: Knex): Promise<void> {
  // Recreate system_settings table
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

  // Recreate setting_templates table
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

  console.log(
    '✅ Recreated system_settings and setting_templates tables (rollback)',
  );
}
