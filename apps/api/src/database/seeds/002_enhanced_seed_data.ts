import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data in dependency order
  // Note: Navigation is managed by seed 003, don't delete it here
  await knex('session_security_events').del();
  await knex('session_activity').del();
  await knex('user_settings').del();
  await knex('themes').del();
  await knex('user_preferences').del();
  await knex('avatar_files').del();

  console.log('✅ Cleared existing enhanced data');

  // Insert default themes
  const _themes = await knex('themes')
    .insert([
      {
        name: 'default',
        display_name: 'Default',
        description: 'Default AegisX theme with balanced colors',
        color_palette: JSON.stringify({
          primary: '#1976d2',
          accent: '#ff4081',
          warn: '#f44336',
          background: '#ffffff',
          surface: '#f5f5f5',
        }),
        is_default: true,
        sort_order: 1,
      },
      {
        name: 'dark',
        display_name: 'Dark Mode',
        description: 'Dark theme for low-light environments',
        color_palette: JSON.stringify({
          primary: '#90caf9',
          accent: '#f48fb1',
          warn: '#ef5350',
          background: '#121212',
          surface: '#1e1e1e',
        }),
        sort_order: 2,
      },
      {
        name: 'minimal',
        display_name: 'Minimal',
        description: 'Clean, minimal design with reduced visual elements',
        color_palette: JSON.stringify({
          primary: '#2196f3',
          accent: '#009688',
          warn: '#ff9800',
          background: '#fafafa',
          surface: '#ffffff',
        }),
        sort_order: 3,
      },
      {
        name: 'enterprise',
        display_name: 'Enterprise',
        description: 'Professional theme suitable for corporate environments',
        color_palette: JSON.stringify({
          primary: '#1565c0',
          accent: '#0277bd',
          warn: '#e65100',
          background: '#f8f9fa',
          surface: '#ffffff',
        }),
        sort_order: 4,
      },
    ])
    .returning(['id', 'name']);

  console.log('✅ Created default themes');

  // Note: System-wide settings are now managed via app_settings table
  // (migration 010_create_settings_table.ts) with access_level: 'system'

  // Note: Navigation structure is managed by seed 003_navigation_menu.ts

  // Update existing admin user with enhanced profile
  const adminUser = await knex('users')
    .where({ email: 'admin@aegisx.local' })
    .first();
  if (adminUser) {
    await knex('users').where({ id: adminUser.id }).update({
      name: 'System Administrator',
      status: 'active',
      email_verified: true,
      email_verified_at: knex.fn.now(),
      timezone: 'UTC',
      language: 'en',
    });

    // Create default preferences for admin user
    await knex('user_preferences').insert({
      user_id: adminUser.id,
      theme: 'default',
      scheme: 'light',
      layout: 'classic',
      language: 'en',
      timezone: 'UTC',
    });

    // Create some user settings
    await knex('user_settings').insert([
      {
        user_id: adminUser.id,
        category: 'theme',
        key: 'name',
        value: 'default',
        data_type: 'string',
      },
      {
        user_id: adminUser.id,
        category: 'notifications',
        key: 'email',
        value: 'true',
        data_type: 'boolean',
      },
      {
        user_id: adminUser.id,
        category: 'layout',
        key: 'navigation_collapsed',
        value: 'false',
        data_type: 'boolean',
      },
    ]);

    console.log('✅ Enhanced admin user profile');
  }

  // Note: Users (admin, manager, demo) are created by seed 001_initial_data.ts

  console.log('✅ Enhanced seed data created successfully');
}
