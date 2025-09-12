import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data in dependency order
  await knex('session_security_events').del();
  await knex('session_activity').del();
  await knex('user_navigation_preferences').del();
  await knex('navigation_permissions').del();
  await knex('navigation_items').del();
  await knex('user_settings').del();
  await knex('setting_templates').del();
  await knex('system_settings').del();
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

  // Insert system settings
  await knex('system_settings').insert([
    {
      category: 'app',
      key: 'name',
      value: 'AegisX Platform',
      data_type: 'string',
      description: 'Application name',
      is_public: true,
    },
    {
      category: 'app',
      key: 'version',
      value: '1.0.0',
      data_type: 'string',
      description: 'Application version',
      is_public: true,
    },
    {
      category: 'app',
      key: 'description',
      value: 'Enterprise-grade platform for modern applications',
      data_type: 'string',
      description: 'Application description',
      is_public: true,
    },
    {
      category: 'security',
      key: 'jwt_expiry',
      value: '3600',
      data_type: 'number',
      description: 'JWT token expiry in seconds',
      is_public: false,
    },
    {
      category: 'security',
      key: 'refresh_token_expiry',
      value: '86400',
      data_type: 'number',
      description: 'Refresh token expiry in seconds',
      is_public: false,
    },
    {
      category: 'security',
      key: 'max_login_attempts',
      value: '5',
      data_type: 'number',
      description: 'Maximum login attempts before lockout',
      is_public: false,
    },
    {
      category: 'features',
      key: 'registration_enabled',
      value: 'true',
      data_type: 'boolean',
      description: 'Enable user registration',
      is_public: true,
    },
    {
      category: 'features',
      key: 'two_factor_required',
      value: 'false',
      data_type: 'boolean',
      description: 'Require two-factor authentication',
      is_public: true,
    },
  ]);

  // Insert setting templates for user preferences
  await knex('setting_templates').insert([
    {
      category: 'theme',
      key: 'name',
      default_value: 'default',
      data_type: 'string',
      description: 'Default theme name',
    },
    {
      category: 'theme',
      key: 'scheme',
      default_value: 'light',
      data_type: 'string',
      description: 'Color scheme preference',
    },
    {
      category: 'layout',
      key: 'type',
      default_value: 'classic',
      data_type: 'string',
      description: 'Layout type',
    },
    {
      category: 'notifications',
      key: 'email',
      default_value: 'true',
      data_type: 'boolean',
      description: 'Enable email notifications',
    },
    {
      category: 'notifications',
      key: 'desktop',
      default_value: 'true',
      data_type: 'boolean',
      description: 'Enable desktop notifications',
    },
    {
      category: 'localization',
      key: 'language',
      default_value: 'en',
      data_type: 'string',
      description: 'Interface language',
    },
    {
      category: 'localization',
      key: 'timezone',
      default_value: 'UTC',
      data_type: 'string',
      description: 'User timezone',
    },
  ]);

  console.log('✅ Created system settings and templates');

  // Get existing permissions for navigation
  const dashboardPerm = await knex('permissions')
    .where({ resource: 'profile', action: 'read' })
    .first();
  const _usersPerm = await knex('permissions')
    .where({ resource: 'users', action: 'read' })
    .first();
  const _rolesPerm = await knex('permissions')
    .where({ resource: 'roles', action: 'read' })
    .first();

  // Create navigation structure
  const navItems = await knex('navigation_items')
    .insert([
      {
        key: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard',
        sort_order: 1,
      },
      {
        key: 'user-management',
        title: 'User Management',
        type: 'collapsible',
        icon: 'heroicons_outline:users',
        sort_order: 2,
      },
      {
        key: 'settings',
        title: 'Settings',
        type: 'collapsible',
        icon: 'heroicons_outline:cog-6-tooth',
        sort_order: 3,
        show_in_compact: false,
      },
      {
        key: 'divider-1',
        title: '',
        type: 'divider',
        sort_order: 4,
        show_in_horizontal: false,
      },
    ])
    .returning(['id', 'key']);

  // Create only necessary child navigation items
  const parentUserMgmt = navItems.find(
    (item) => item.key === 'user-management',
  );

  if (parentUserMgmt) {
    await knex('navigation_items').insert([
      {
        parent_id: parentUserMgmt.id,
        key: 'users-list',
        title: 'Users',
        type: 'item',
        icon: 'heroicons_outline:user-group',
        link: '/users',
        sort_order: 1,
      },
    ]);
  }

  // Settings is a single page component, no child items needed

  // Link navigation items with permissions
  const dashboardNav = navItems.find((item) => item.key === 'dashboard');
  if (dashboardNav && dashboardPerm) {
    await knex('navigation_permissions').insert({
      navigation_item_id: dashboardNav.id,
      permission_id: dashboardPerm.id,
    });
  }

  console.log('✅ Created navigation structure');

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

  // Create a demo regular user
  const demoUserPassword = await bcrypt.hash('Demo123!', 10);
  const [demoUser] = await knex('users')
    .insert({
      email: 'demo@aegisx.local',
      username: 'demo',
      password: demoUserPassword,
      first_name: 'Demo',
      last_name: 'User',
      name: 'Demo User',
      status: 'active',
      email_verified: true,
      email_verified_at: knex.fn.now(),
      is_active: true,
      timezone: 'America/New_York',
      language: 'en',
    })
    .returning(['id']);

  // Assign user role to demo user
  const userRole = await knex('roles').where({ name: 'user' }).first();
  if (userRole && demoUser) {
    await knex('user_roles').insert({
      user_id: demoUser.id,
      role_id: userRole.id,
    });

    // Create preferences for demo user
    await knex('user_preferences').insert({
      user_id: demoUser.id,
      theme: 'dark',
      scheme: 'dark',
      layout: 'compact',
      language: 'en',
      timezone: 'America/New_York',
      notifications_email: false,
      notifications_desktop: true,
    });
  }

  console.log('✅ Created demo user');
  console.log('📧 Demo user: demo@aegisx.local');
  console.log('🔑 Password: Demo123!');
  console.log('');
  console.log('✅ Enhanced seed data created successfully');
}
