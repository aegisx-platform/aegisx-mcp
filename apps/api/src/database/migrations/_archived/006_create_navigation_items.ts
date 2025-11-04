import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create navigation_items table for dynamic navigation structure
  await knex.schema.createTable('navigation_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('parent_id').nullable(); // For hierarchical structure
    table.string('key', 100).unique().notNullable(); // Unique identifier like 'dashboard', 'users.list'
    table.string('title', 200).notNullable(); // Display title
    table
      .enum('type', ['item', 'group', 'collapsible', 'divider', 'spacer'])
      .notNullable();
    table.string('icon', 100).nullable(); // Icon identifier
    table.string('link', 500).nullable(); // Route/URL
    table
      .enum('target', ['_self', '_blank', '_parent', '_top'])
      .defaultTo('_self');
    table.integer('sort_order').defaultTo(0); // For ordering items

    // Visibility and state
    table.boolean('disabled').defaultTo(false);
    table.boolean('hidden').defaultTo(false);
    table.boolean('exact_match').defaultTo(false); // For route matching

    // Badge configuration
    table.string('badge_title', 50).nullable();
    table.string('badge_classes', 200).nullable();
    table
      .enum('badge_variant', [
        'default',
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
      ])
      .nullable();

    // Navigation type visibility
    table.boolean('show_in_default').defaultTo(true);
    table.boolean('show_in_compact').defaultTo(true);
    table.boolean('show_in_horizontal').defaultTo(true);
    table.boolean('show_in_mobile').defaultTo(true);

    // Additional metadata as JSON
    table.json('meta').nullable();

    table.timestamps(true, true);

    // Self-referencing foreign key for parent-child relationships
    table
      .foreign('parent_id')
      .references('id')
      .inTable('navigation_items')
      .onDelete('CASCADE');

    // Indexes
    table.index('parent_id');
    table.index('key');
    table.index('type');
    table.index('sort_order');
    table.index('disabled');
    table.index('hidden');
  });

  // Create navigation_permissions junction table to link navigation items with permissions
  await knex.schema.createTable('navigation_permissions', (table) => {
    table.uuid('navigation_item_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('navigation_item_id')
      .references('id')
      .inTable('navigation_items')
      .onDelete('CASCADE');
    table
      .foreign('permission_id')
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');

    // Composite primary key
    table.primary(['navigation_item_id', 'permission_id']);
  });

  // Create user_navigation_preferences for user-specific navigation customization
  await knex.schema.createTable('user_navigation_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('navigation_item_id').notNullable();

    // User-specific overrides
    table.boolean('hidden').nullable(); // User can hide items they have access to
    table.integer('custom_sort_order').nullable(); // User can reorder items
    table.boolean('pinned').defaultTo(false); // User can pin frequently used items

    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('navigation_item_id')
      .references('id')
      .inTable('navigation_items')
      .onDelete('CASCADE');

    // Unique constraint to prevent duplicate preferences
    table.unique(['user_id', 'navigation_item_id']);

    // Indexes
    table.index('user_id');
    table.index('navigation_item_id');
    table.index('pinned');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_navigation_preferences');
  await knex.schema.dropTableIfExists('navigation_permissions');
  await knex.schema.dropTableIfExists('navigation_items');
}
