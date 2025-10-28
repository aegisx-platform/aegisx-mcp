import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { GroupedSettings, Setting } from '../../core/settings/models/settings.types';

/**
 * Demo service with mock data for testing the Settings UI
 * Replace this with the real SettingsService when backend is ready
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsDemoService {
  private mockSettings: GroupedSettings[] = [
    {
      category: 'general',
      groups: [
        {
          name: 'Organization Information',
          settings: [
            {
              id: '1',
              key: 'org.name',
              namespace: 'default',
              category: 'general',
              value: 'AegisX Platform',
              defaultValue: 'My Organization',
              label: 'Organization Name',
              description: 'The name of your organization',
              dataType: 'string',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              validationRules: {
                required: true,
                minLength: 2,
                maxLength: 100,
              },
              uiSchema: {
                component: 'input',
                placeholder: 'Enter organization name',
                suffix: 'business',
              },
              sortOrder: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '2',
              key: 'org.email',
              namespace: 'default',
              category: 'general',
              value: 'contact@aegisx.com',
              defaultValue: '',
              label: 'Contact Email',
              description: 'Primary contact email for your organization',
              dataType: 'email',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              validationRules: {
                required: true,
              },
              uiSchema: {
                component: 'input',
                placeholder: 'contact@example.com',
                suffix: 'email',
              },
              sortOrder: 2,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
        {
          name: 'System Settings',
          settings: [
            {
              id: '3',
              key: 'system.maintenance_mode',
              namespace: 'default',
              category: 'general',
              value: false,
              defaultValue: false,
              label: 'Maintenance Mode',
              description:
                'Enable maintenance mode to prevent users from accessing the system',
              dataType: 'boolean',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              uiSchema: {
                component: 'toggle',
              },
              sortOrder: 10,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '4',
              key: 'system.debug_mode',
              namespace: 'default',
              category: 'general',
              value: false,
              defaultValue: false,
              label: 'Debug Mode',
              description: 'Enable debug mode for detailed error messages',
              dataType: 'boolean',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              uiSchema: {
                component: 'toggle',
              },
              sortOrder: 11,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      ],
    },
    {
      category: 'security',
      groups: [
        {
          name: 'Authentication Settings',
          settings: [
            {
              id: '5',
              key: 'auth.session_timeout',
              namespace: 'default',
              category: 'security',
              value: 30,
              defaultValue: 30,
              label: 'Session Timeout (minutes)',
              description: 'How long user sessions remain active',
              dataType: 'number',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              validationRules: {
                required: true,
                min: 5,
                max: 1440,
              },
              uiSchema: {
                component: 'input',
                suffix: 'schedule',
                hint: 'Session timeout in minutes (5-1440)',
              },
              sortOrder: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '6',
              key: 'auth.require_2fa',
              namespace: 'default',
              category: 'security',
              value: true,
              defaultValue: false,
              label: 'Require Two-Factor Authentication',
              description: 'Require all users to enable 2FA',
              dataType: 'boolean',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              uiSchema: {
                component: 'toggle',
              },
              sortOrder: 2,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      ],
    },
    {
      category: 'notifications',
      groups: [
        {
          name: 'Email Notifications',
          settings: [
            {
              id: '7',
              key: 'notifications.email_enabled',
              namespace: 'default',
              category: 'notifications',
              value: true,
              defaultValue: true,
              label: 'Enable Email Notifications',
              description: 'Send email notifications to users',
              dataType: 'boolean',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              uiSchema: {
                component: 'toggle',
              },
              sortOrder: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: '8',
              key: 'notifications.email_frequency',
              namespace: 'default',
              category: 'notifications',
              value: 'immediate',
              defaultValue: 'immediate',
              label: 'Email Frequency',
              description: 'How often to send email notifications',
              dataType: 'string',
              accessLevel: 'admin',
              isEncrypted: false,
              isReadonly: false,
              isHidden: false,
              uiSchema: {
                component: 'select',
                options: [
                  { value: 'immediate', label: 'Immediate' },
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ],
              },
              sortOrder: 2,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      ],
    },
  ];

  getGroupedSettings(): Observable<GroupedSettings[]> {
    // Simulate API delay
    return of(this.mockSettings).pipe(delay(1000));
  }

  updateSetting(settingId: string, value: any): Observable<Setting> {
    // Find and update the setting in mock data
    for (const category of this.mockSettings) {
      for (const group of category.groups) {
        const setting = group.settings.find((s) => s.id === settingId);
        if (setting) {
          setting.value = value;
          setting.updatedAt = new Date().toISOString();
          return of(setting).pipe(delay(500));
        }
      }
    }
    throw new Error('Setting not found');
  }

  bulkUpdateSettings(updates: Array<{ key: string; value: any }>): Observable<{
    updated: number;
    failed: number;
    errors?: Array<{ key: string; error: string }>;
  }> {
    // Simulate bulk update with some artificial delay and success/failure
    const result = {
      updated: updates.length,
      failed: 0,
      errors: [],
    };

    // Apply updates to mock data
    updates.forEach((update) => {
      for (const category of this.mockSettings) {
        for (const group of category.groups) {
          const setting = group.settings.find((s) => s.key === update.key);
          if (setting) {
            setting.value = update.value;
            setting.updatedAt = new Date().toISOString();
          }
        }
      }
    });

    return of(result).pipe(delay(1500));
  }
}
