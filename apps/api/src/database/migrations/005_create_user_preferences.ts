import type { Knex } from 'knex';

export async function up(knex: any): Promise<void> {
  // Create user_preferences table
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
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('user_preferences');
}
