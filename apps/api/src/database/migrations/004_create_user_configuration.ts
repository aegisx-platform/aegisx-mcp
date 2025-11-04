import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create user_preferences table (from 005_create_user_preferences)
  await knex.schema.createTable('user_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique();

    // Theme preferences
    table
      .enum('theme', ['default', 'dark', 'light', 'auto'])
      .defaultTo('default');
    table.enum('scheme', ['light', 'dark', 'auto']).defaultTo('light');
    table
      .enum('layout', ['classic', 'compact', 'enterprise', 'empty'])
      .defaultTo('classic');

    // Localization preferences
    table.string('language', 10).defaultTo('en');
    table.string('timezone', 100).defaultTo('UTC');
    table
      .enum('date_format', ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
      .defaultTo('MM/DD/YYYY');
    table.enum('time_format', ['12h', '24h']).defaultTo('12h');

    // Navigation preferences
    table.boolean('navigation_collapsed').defaultTo(false);
    table
      .enum('navigation_type', ['default', 'compact', 'horizontal'])
      .defaultTo('default');
    table
      .enum('navigation_position', ['left', 'right', 'top'])
      .defaultTo('left');

    // Notification preferences
    table.boolean('notifications_email').defaultTo(true);
    table.boolean('notifications_push').defaultTo(false);
    table.boolean('notifications_desktop').defaultTo(true);
    table.boolean('notifications_sound').defaultTo(true);

    // Notification type preferences
    table.boolean('notifications_security').defaultTo(true);
    table.boolean('notifications_updates').defaultTo(true);
    table.boolean('notifications_marketing').defaultTo(false);
    table.boolean('notifications_reminders').defaultTo(true);

    // Privacy preferences
    table
      .enum('profile_visibility', ['public', 'private', 'friends'])
      .defaultTo('public');
    table.boolean('activity_tracking').defaultTo(true);
    table.boolean('analytics_opt_out').defaultTo(false);
    table.boolean('data_sharing').defaultTo(false);

    // Accessibility preferences
    table.boolean('high_contrast').defaultTo(false);
    table
      .enum('font_size', ['small', 'medium', 'large', 'x-large'])
      .defaultTo('medium');
    table.boolean('reduced_motion').defaultTo(false);
    table.boolean('screen_reader').defaultTo(false);

    // Performance preferences
    table.boolean('animations').defaultTo(true);
    table.boolean('lazy_loading').defaultTo(true);
    table.boolean('caching').defaultTo(true);
    table.boolean('compression').defaultTo(true);

    table.timestamps(true, true);

    // Foreign key
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes for commonly queried fields
    table.index('user_id');
    table.index('theme');
    table.index('language');
  });

  // Create user_settings table (from 007_create_user_settings)
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

  // Create themes table (from 007_create_user_settings)
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

  // Create app_settings table (from 010_create_settings_table)
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
    table
      .enum('data_type', [
        'string',
        'number',
        'boolean',
        'json',
        'array',
        'date',
        'email',
        'url',
      ])
      .notNullable()
      .defaultTo('string');

    // Access control
    table
      .enum('access_level', ['public', 'user', 'admin', 'system'])
      .notNullable()
      .defaultTo('admin');
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
    table
      .uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .uuid('updated_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Create app_user_settings table
  await knex.schema.createTable('app_user_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Relations
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('setting_id')
      .notNullable()
      .references('id')
      .inTable('app_settings')
      .onDelete('CASCADE');

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

  // Create app_settings_history table
  await knex.schema.createTable('app_settings_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Reference to setting
    table
      .uuid('setting_id')
      .notNullable()
      .references('id')
      .inTable('app_settings')
      .onDelete('CASCADE');

    // Change details
    table.jsonb('old_value');
    table.jsonb('new_value');
    table.string('action', 50).notNullable(); // create, update, delete
    table.text('reason'); // Optional reason for change

    // Who made the change
    table
      .uuid('changed_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());

    // Additional context
    table.string('ip_address', 45);
    table.string('user_agent', 500);

    // Index for querying history
    table.index('setting_id');
    table.index('changed_at');
    table.index('changed_by');
  });

  // Create indexes for better query performance (from 012_add_settings_performance_indexes)
  await knex.raw(
    'CREATE INDEX idx_app_settings_namespace_category ON app_settings(namespace, category)',
  );
  await knex.raw(
    'CREATE INDEX idx_app_settings_namespace_key ON app_settings(namespace, key)',
  );
  await knex.raw(
    'CREATE INDEX idx_app_user_settings_user_id ON app_user_settings(user_id)',
  );
  await knex.raw(
    'CREATE INDEX idx_app_user_settings_setting_id ON app_user_settings(setting_id)',
  );
  await knex.raw(
    'CREATE INDEX idx_app_settings_history_setting_id ON app_settings_history(setting_id)',
  );
  await knex.raw(
    'CREATE INDEX idx_app_settings_history_changed_at ON app_settings_history(changed_at)',
  );
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_history_changed_at');
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_history_setting_id');
  await knex.raw('DROP INDEX IF EXISTS idx_app_user_settings_setting_id');
  await knex.raw('DROP INDEX IF EXISTS idx_app_user_settings_user_id');
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_namespace_key');
  await knex.raw('DROP INDEX IF EXISTS idx_app_settings_namespace_category');

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('app_settings_history');
  await knex.schema.dropTableIfExists('app_user_settings');
  await knex.schema.dropTableIfExists('app_settings');
  await knex.schema.dropTableIfExists('themes');
  await knex.schema.dropTableIfExists('user_settings');
  await knex.schema.dropTableIfExists('user_preferences');
}
