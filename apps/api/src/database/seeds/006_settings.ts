import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('app_settings_history').del();
  await knex('app_user_settings').del();
  await knex('app_settings').del();

  // Insert default system settings
  await knex('app_settings').insert([
    // General Settings
    {
      key: 'app.name',
      namespace: 'default',
      category: 'general',
      value: JSON.stringify('AegisX Platform'),
      default_value: JSON.stringify('AegisX Platform'),
      label: 'Application Name',
      description: 'The name of the application displayed in the UI',
      data_type: 'string',
      access_level: 'public',
      validation_rules: JSON.stringify({
        minLength: 3,
        maxLength: 100
      }),
      ui_schema: JSON.stringify({
        component: 'text-input',
        placeholder: 'Enter application name'
      }),
      sort_order: 1,
      group: 'branding'
    },
    {
      key: 'app.description',
      namespace: 'default',
      category: 'general',
      value: JSON.stringify('Enterprise Application Platform'),
      default_value: JSON.stringify('Enterprise Application Platform'),
      label: 'Application Description',
      description: 'A brief description of the application',
      data_type: 'string',
      access_level: 'public',
      validation_rules: JSON.stringify({
        maxLength: 500
      }),
      ui_schema: JSON.stringify({
        component: 'textarea',
        rows: 3
      }),
      sort_order: 2,
      group: 'branding'
    },
    {
      key: 'app.version',
      namespace: 'default',
      category: 'general',
      value: JSON.stringify('1.0.0'),
      default_value: JSON.stringify('1.0.0'),
      label: 'Application Version',
      description: 'Current version of the application',
      data_type: 'string',
      access_level: 'public',
      is_readonly: true,
      sort_order: 3,
      group: 'system'
    },
    
    // Email Settings
    {
      key: 'email.enabled',
      namespace: 'default',
      category: 'email',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Enable Email',
      description: 'Enable or disable email functionality',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 1,
      group: 'email'
    },
    {
      key: 'email.smtp.host',
      namespace: 'default',
      category: 'email',
      value: JSON.stringify('smtp.gmail.com'),
      default_value: JSON.stringify('smtp.gmail.com'),
      label: 'SMTP Host',
      description: 'SMTP server hostname',
      data_type: 'string',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        required: true,
        pattern: '^[a-zA-Z0-9.-]+$'
      }),
      ui_schema: JSON.stringify({
        component: 'text-input',
        placeholder: 'smtp.example.com'
      }),
      sort_order: 2,
      group: 'email'
    },
    {
      key: 'email.smtp.port',
      namespace: 'default',
      category: 'email',
      value: JSON.stringify(587),
      default_value: JSON.stringify(587),
      label: 'SMTP Port',
      description: 'SMTP server port',
      data_type: 'number',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        min: 1,
        max: 65535
      }),
      ui_schema: JSON.stringify({
        component: 'number-input'
      }),
      sort_order: 3,
      group: 'email'
    },
    {
      key: 'email.from.address',
      namespace: 'default',
      category: 'email',
      value: JSON.stringify('noreply@aegisx.com'),
      default_value: JSON.stringify('noreply@aegisx.com'),
      label: 'From Email Address',
      description: 'Default sender email address',
      data_type: 'email',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        required: true
      }),
      ui_schema: JSON.stringify({
        component: 'email-input'
      }),
      sort_order: 4,
      group: 'email'
    },
    
    // Security Settings
    {
      key: 'security.password.min_length',
      namespace: 'default',
      category: 'security',
      value: JSON.stringify(8),
      default_value: JSON.stringify(8),
      label: 'Minimum Password Length',
      description: 'Minimum number of characters required for passwords',
      data_type: 'number',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        min: 6,
        max: 32
      }),
      ui_schema: JSON.stringify({
        component: 'number-input',
        min: 6,
        max: 32
      }),
      sort_order: 1,
      group: 'password_policy'
    },
    {
      key: 'security.password.require_uppercase',
      namespace: 'default',
      category: 'security',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Require Uppercase Letters',
      description: 'Passwords must contain at least one uppercase letter',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 2,
      group: 'password_policy'
    },
    {
      key: 'security.password.require_numbers',
      namespace: 'default',
      category: 'security',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Require Numbers',
      description: 'Passwords must contain at least one number',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 3,
      group: 'password_policy'
    },
    {
      key: 'security.session.timeout',
      namespace: 'default',
      category: 'security',
      value: JSON.stringify(3600),
      default_value: JSON.stringify(3600),
      label: 'Session Timeout (seconds)',
      description: 'Time in seconds before a session expires',
      data_type: 'number',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        min: 300,
        max: 86400
      }),
      ui_schema: JSON.stringify({
        component: 'number-input',
        suffix: 'seconds'
      }),
      sort_order: 4,
      group: 'session'
    },
    
    // Feature Flags
    {
      key: 'features.registration.enabled',
      namespace: 'default',
      category: 'features',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Enable User Registration',
      description: 'Allow new users to register',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 1,
      group: 'registration'
    },
    {
      key: 'features.registration.require_email_verification',
      namespace: 'default',
      category: 'features',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Require Email Verification',
      description: 'New users must verify their email address',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 2,
      group: 'registration'
    },
    
    // API Settings
    {
      key: 'api.rate_limit.enabled',
      namespace: 'default',
      category: 'api',
      value: JSON.stringify(true),
      default_value: JSON.stringify(true),
      label: 'Enable Rate Limiting',
      description: 'Enable API rate limiting',
      data_type: 'boolean',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 1,
      group: 'rate_limiting'
    },
    {
      key: 'api.rate_limit.requests_per_minute',
      namespace: 'default',
      category: 'api',
      value: JSON.stringify(60),
      default_value: JSON.stringify(60),
      label: 'Requests Per Minute',
      description: 'Maximum number of API requests per minute per IP',
      data_type: 'number',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        min: 10,
        max: 1000
      }),
      ui_schema: JSON.stringify({
        component: 'number-input'
      }),
      sort_order: 2,
      group: 'rate_limiting'
    },
    
    // UI Settings
    {
      key: 'ui.theme.default',
      namespace: 'default',
      category: 'ui',
      value: JSON.stringify('light'),
      default_value: JSON.stringify('light'),
      label: 'Default Theme',
      description: 'Default UI theme for new users',
      data_type: 'string',
      access_level: 'public',
      validation_rules: JSON.stringify({
        enum: ['light', 'dark', 'auto']
      }),
      ui_schema: JSON.stringify({
        component: 'select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto (System)' }
        ]
      }),
      sort_order: 1,
      group: 'theme'
    },
    {
      key: 'ui.sidebar.default_collapsed',
      namespace: 'default',
      category: 'ui',
      value: JSON.stringify(false),
      default_value: JSON.stringify(false),
      label: 'Collapse Sidebar by Default',
      description: 'Start with sidebar collapsed for new users',
      data_type: 'boolean',
      access_level: 'public',
      ui_schema: JSON.stringify({
        component: 'toggle'
      }),
      sort_order: 2,
      group: 'layout'
    },
    
    // Storage Settings
    {
      key: 'storage.max_file_size',
      namespace: 'default',
      category: 'storage',
      value: JSON.stringify(10485760), // 10MB in bytes
      default_value: JSON.stringify(10485760),
      label: 'Maximum File Size (bytes)',
      description: 'Maximum allowed file upload size in bytes',
      data_type: 'number',
      access_level: 'admin',
      validation_rules: JSON.stringify({
        min: 1048576, // 1MB
        max: 104857600 // 100MB
      }),
      ui_schema: JSON.stringify({
        component: 'file-size-input'
      }),
      sort_order: 1,
      group: 'uploads'
    },
    {
      key: 'storage.allowed_file_types',
      namespace: 'default',
      category: 'storage',
      value: JSON.stringify(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
      default_value: JSON.stringify(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
      label: 'Allowed File Types',
      description: 'List of allowed file extensions',
      data_type: 'array',
      access_level: 'admin',
      ui_schema: JSON.stringify({
        component: 'tag-input',
        placeholder: 'Add file extension'
      }),
      sort_order: 2,
      group: 'uploads'
    }
  ]);
}