import { test, expect, Page } from '@playwright/test';
import { ProfilePage } from '../pages/profile.page';
import { UserPreferencesPage } from '../pages/user-preferences.page';
import { LoginPage } from '../pages/login.page';
import {
  TEST_CREDENTIALS,
  TEST_PREFERENCES,
  DEFAULT_USER_PREFERENCES,
  TestPreferencesFactory,
  UserPreferences,
  TEST_API_ENDPOINTS,
} from '../fixtures/test-data';

test.describe('User Preferences E2E Tests', () => {
  let page: Page;
  let profilePage: ProfilePage;
  let preferencesPage: UserPreferencesPage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    profilePage = new ProfilePage(page);
    preferencesPage = new UserPreferencesPage(page);
  });

  test.describe('Navigation and Initial Load', () => {
    test('should navigate to profile page and load preferences tab', async () => {
      // Navigate to profile page
      await preferencesPage.goto();

      // Verify profile page loads
      await profilePage.waitForLoad();

      // Take screenshot of profile page
      await page.screenshot({
        path: 'screenshots/01-profile-page-loaded.png',
        fullPage: true,
      });

      // Verify preferences component loads correctly
      await preferencesPage.verifyPreferencesComponentLoads();

      // Take screenshot of preferences tab
      await preferencesPage.takePreferencesScreenshot(
        '02-preferences-tab-loaded',
      );
    });

    test('should display all preference sections', async () => {
      await preferencesPage.goto();

      // Verify all sections are visible
      await expect(
        page.locator('ax-card:has-text("Appearance")'),
      ).toBeVisible();
      await expect(
        page.locator('ax-card:has-text("Localization")'),
      ).toBeVisible();
      await expect(
        page.locator('ax-card:has-text("Notifications")'),
      ).toBeVisible();
      await expect(
        page.locator('ax-card:has-text("Navigation")'),
      ).toBeVisible();

      // Take screenshots of each section
      await preferencesPage.takeSectionScreenshot(
        'Appearance',
        '03-appearance-section',
      );
      await preferencesPage.takeSectionScreenshot(
        'Localization',
        '04-localization-section',
      );
      await preferencesPage.takeSectionScreenshot(
        'Notifications',
        '05-notifications-section',
      );
      await preferencesPage.takeSectionScreenshot(
        'Navigation',
        '06-navigation-section',
      );
    });
  });

  test.describe('Theme Settings', () => {
    test('should change theme from default to dark', async () => {
      await preferencesPage.goto();

      // Mock API responses
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: DEFAULT_USER_PREFERENCES,
            }),
          });
        } else if (route.request().method() === 'PUT') {
          const requestData = JSON.parse(route.request().postData() || '{}');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { ...DEFAULT_USER_PREFERENCES, ...requestData },
            }),
          });
        }
      });

      // Change theme to dark
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeScheme('dark');

      // Take screenshot before saving
      await page.screenshot({
        path: 'screenshots/07-theme-changed-before-save.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify success message
      await preferencesPage.verifyOperationResult();

      // Take screenshot after saving
      await page.screenshot({
        path: 'screenshots/08-theme-changed-after-save.png',
        fullPage: true,
      });

      // Verify the changes persist
      await preferencesPage.verifyCurrentPreferences({
        theme: 'dark',
        scheme: 'dark',
      });
    });

    test('should test all theme options', async () => {
      await preferencesPage.goto();

      const themes: Array<UserPreferences['theme']> = [
        'default',
        'light',
        'dark',
        'auto',
      ];

      for (const theme of themes) {
        await preferencesPage.changeTheme(theme);

        // Take screenshot for each theme
        await page.screenshot({
          path: `screenshots/09-theme-${theme}.png`,
          fullPage: true,
        });

        // Verify the selection
        const currentPrefs = await preferencesPage.getCurrentPreferences();
        expect(currentPrefs.theme).toBe(theme);
      }
    });
  });

  test.describe('Language and Localization', () => {
    test('should change language settings', async () => {
      await preferencesPage.goto();

      // Mock API responses
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: TEST_PREFERENCES.internationalUser,
            }),
          });
        }
      });

      // Change to Thai language and Bangkok timezone
      await preferencesPage.changeLanguage('th');
      await preferencesPage.changeTimezone('Asia/Bangkok');
      await preferencesPage.changeDateFormat('DD/MM/YYYY');
      await preferencesPage.changeTimeFormat('24h');

      // Take screenshot before saving
      await page.screenshot({
        path: 'screenshots/10-language-changed-before-save.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify success message
      await preferencesPage.verifyOperationResult();

      // Take screenshot after saving
      await page.screenshot({
        path: 'screenshots/11-language-changed-after-save.png',
        fullPage: true,
      });

      // Verify the changes
      await preferencesPage.verifyCurrentPreferences({
        language: 'th',
        timezone: 'Asia/Bangkok',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      });
    });

    test('should test multiple language options', async () => {
      await preferencesPage.goto();

      const languages = [
        { code: 'en', name: 'English' },
        { code: 'th', name: 'Thai' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese' },
      ];

      for (const language of languages) {
        await preferencesPage.changeLanguage(language.code);

        // Take screenshot for each language
        await page.screenshot({
          path: `screenshots/12-language-${language.code}.png`,
          fullPage: true,
        });

        // Verify the selection
        const currentPrefs = await preferencesPage.getCurrentPreferences();
        expect(currentPrefs.language).toBe(language.code);
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should toggle notification preferences', async () => {
      await preferencesPage.goto();

      // Mock API responses
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: TEST_PREFERENCES.allNotificationsEnabled,
            }),
          });
        }
      });

      // Enable all notifications
      await preferencesPage.toggleEmailNotifications(true);
      await preferencesPage.togglePushNotifications(true);
      await preferencesPage.toggleDesktopNotifications(true);
      await preferencesPage.toggleSoundNotifications(true);

      // Take screenshot with all notifications enabled
      await page.screenshot({
        path: 'screenshots/13-all-notifications-enabled.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify success message
      await preferencesPage.verifyOperationResult();

      // Verify all notifications are enabled
      await preferencesPage.verifyCurrentPreferences({
        notifications: {
          email: true,
          push: true,
          desktop: true,
          sound: true,
        },
      });

      // Now disable all notifications
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: TEST_PREFERENCES.minimalNotifications,
            }),
          });
        }
      });

      await preferencesPage.toggleEmailNotifications(false);
      await preferencesPage.togglePushNotifications(false);
      await preferencesPage.toggleDesktopNotifications(false);
      await preferencesPage.toggleSoundNotifications(false);

      // Take screenshot with all notifications disabled
      await page.screenshot({
        path: 'screenshots/14-all-notifications-disabled.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify all notifications are disabled
      await preferencesPage.verifyCurrentPreferences({
        notifications: {
          email: false,
          push: false,
          desktop: false,
          sound: false,
        },
      });
    });

    test('should test individual notification toggles', async () => {
      await preferencesPage.goto();

      const notificationTypes = [
        {
          name: 'email',
          toggle:
            preferencesPage.toggleEmailNotifications.bind(preferencesPage),
        },
        {
          name: 'push',
          toggle: preferencesPage.togglePushNotifications.bind(preferencesPage),
        },
        {
          name: 'desktop',
          toggle:
            preferencesPage.toggleDesktopNotifications.bind(preferencesPage),
        },
        {
          name: 'sound',
          toggle:
            preferencesPage.toggleSoundNotifications.bind(preferencesPage),
        },
      ];

      for (const notification of notificationTypes) {
        // Enable the notification
        await notification.toggle(true);

        // Take screenshot
        await page.screenshot({
          path: `screenshots/15-notification-${notification.name}-enabled.png`,
          fullPage: true,
        });

        // Disable the notification
        await notification.toggle(false);

        // Take screenshot
        await page.screenshot({
          path: `screenshots/16-notification-${notification.name}-disabled.png`,
          fullPage: true,
        });
      }
    });
  });

  test.describe('Navigation Settings', () => {
    test('should change navigation preferences', async () => {
      await preferencesPage.goto();

      // Mock API responses
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: TEST_PREFERENCES.horizontalNavigation,
            }),
          });
        }
      });

      // Change to horizontal navigation at top
      await preferencesPage.toggleNavigationCollapsed(false);
      await preferencesPage.changeNavigationType('horizontal');
      await preferencesPage.changeNavigationPosition('top');

      // Take screenshot before saving
      await page.screenshot({
        path: 'screenshots/17-navigation-horizontal-before-save.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify success message
      await preferencesPage.verifyOperationResult();

      // Take screenshot after saving
      await page.screenshot({
        path: 'screenshots/18-navigation-horizontal-after-save.png',
        fullPage: true,
      });

      // Verify the changes
      await preferencesPage.verifyCurrentPreferences({
        navigation: {
          collapsed: false,
          type: 'horizontal',
          position: 'top',
        },
      });
    });

    test('should test different navigation configurations', async () => {
      await preferencesPage.goto();

      const configurations = [
        { type: 'default', position: 'left', collapsed: false },
        { type: 'compact', position: 'left', collapsed: true },
        { type: 'horizontal', position: 'top', collapsed: false },
        { type: 'default', position: 'right', collapsed: false },
      ];

      for (const config of configurations) {
        await preferencesPage.changeNavigationType(config.type as any);
        await preferencesPage.changeNavigationPosition(config.position as any);
        await preferencesPage.toggleNavigationCollapsed(config.collapsed);

        // Take screenshot for each configuration
        await page.screenshot({
          path: `screenshots/19-nav-${config.type}-${config.position}-${config.collapsed ? 'collapsed' : 'expanded'}.png`,
          fullPage: true,
        });
      }
    });
  });

  test.describe('Form Actions', () => {
    test('should save all preferences successfully', async () => {
      await preferencesPage.goto();

      // Mock successful API response
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          const requestData = JSON.parse(route.request().postData() || '{}');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { ...DEFAULT_USER_PREFERENCES, ...requestData },
              message: 'Preferences updated successfully!',
            }),
          });
        }
      });

      // Fill comprehensive preferences
      const testPreferences = TestPreferencesFactory.create({
        theme: 'dark',
        scheme: 'dark',
        layout: 'compact',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        notifications: {
          email: true,
          push: true,
          desktop: false,
          sound: true,
        },
        navigation: {
          collapsed: true,
          type: 'compact',
          position: 'left',
        },
      });

      await preferencesPage.fillAllPreferences(testPreferences);

      // Take screenshot before saving
      await page.screenshot({
        path: 'screenshots/20-all-preferences-filled.png',
        fullPage: true,
      });

      // Save preferences
      await preferencesPage.savePreferences();

      // Verify success message appears
      await preferencesPage.verifyOperationResult(
        'Preferences updated successfully!',
      );

      // Take screenshot after successful save
      await page.screenshot({
        path: 'screenshots/21-preferences-saved-successfully.png',
        fullPage: true,
      });

      // Verify all changes are applied
      await preferencesPage.verifyCurrentPreferences(testPreferences);
    });

    test('should reset preferences to defaults', async () => {
      await preferencesPage.goto();

      // First, change some preferences
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeLanguage('th');
      await preferencesPage.toggleEmailNotifications(false);

      // Take screenshot with changed preferences
      await page.screenshot({
        path: 'screenshots/22-preferences-changed.png',
        fullPage: true,
      });

      // Reset to defaults
      await preferencesPage.resetToDefaults();

      // Take screenshot after reset
      await page.screenshot({
        path: 'screenshots/23-preferences-reset-to-defaults.png',
        fullPage: true,
      });

      // Verify preferences are back to defaults
      await preferencesPage.verifyCurrentPreferences(DEFAULT_USER_PREFERENCES);
    });

    test('should discard changes', async () => {
      await preferencesPage.goto();

      // Change some preferences
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeLanguage('th');

      // Take screenshot with unsaved changes
      await page.screenshot({
        path: 'screenshots/24-unsaved-changes.png',
        fullPage: true,
      });

      // Discard changes
      await preferencesPage.discardChanges();

      // Take screenshot after discarding
      await page.screenshot({
        path: 'screenshots/25-changes-discarded.png',
        fullPage: true,
      });

      // Verify changes were discarded (should be back to original values)
      const currentPrefs = await preferencesPage.getCurrentPreferences();
      expect(currentPrefs.theme).not.toBe('dark');
      expect(currentPrefs.language).not.toBe('th');
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle API errors gracefully', async () => {
      await preferencesPage.goto();

      // Mock API error response
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Internal server error',
            }),
          });
        }
      });

      // Try to save preferences
      await preferencesPage.changeTheme('dark');
      await preferencesPage.savePreferences();

      // Verify error message appears
      await preferencesPage.verifyErrorMessage();

      // Take screenshot of error state
      await page.screenshot({
        path: 'screenshots/26-api-error-handling.png',
        fullPage: true,
      });
    });

    test('should handle network failures', async () => {
      await preferencesPage.goto();

      // Mock network failure
      await page.route('**/api/profile/preferences', async (route) => {
        await route.abort('failed');
      });

      // Try to save preferences
      await preferencesPage.changeTheme('dark');
      await preferencesPage.savePreferences();

      // Verify error handling
      await page.waitForTimeout(2000); // Wait for error to appear

      // Take screenshot of network error state
      await page.screenshot({
        path: 'screenshots/27-network-error-handling.png',
        fullPage: true,
      });
    });

    test('should validate form inputs', async () => {
      await preferencesPage.goto();

      // Test form validation (this would depend on actual validation rules)
      await preferencesPage.verifyFormValidation();

      // Take screenshot of validation state
      await page.screenshot({
        path: 'screenshots/28-form-validation.png',
        fullPage: true,
      });
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should capture visual snapshots of all preference states', async () => {
      await preferencesPage.goto();

      // Test different visual states
      const states = [
        { name: 'default-state', prefs: DEFAULT_USER_PREFERENCES },
        { name: 'dark-theme', prefs: TEST_PREFERENCES.darkMode },
        { name: 'compact-layout', prefs: TEST_PREFERENCES.compactLayout },
        {
          name: 'international-settings',
          prefs: TEST_PREFERENCES.internationalUser,
        },
        {
          name: 'minimal-notifications',
          prefs: TEST_PREFERENCES.minimalNotifications,
        },
        { name: 'enterprise-layout', prefs: TEST_PREFERENCES.enterpriseLayout },
      ];

      for (const state of states) {
        // Apply preferences
        await preferencesPage.fillAllPreferences(state.prefs);

        // Take visual snapshot
        await page.screenshot({
          path: `screenshots/visual-${state.name}.png`,
          fullPage: true,
        });

        // Reset for next test
        await preferencesPage.resetToDefaults();
      }
    });

    test('should test responsive design on different screen sizes', async () => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await preferencesPage.goto();

        // Take screenshot for each viewport
        await page.screenshot({
          path: `screenshots/responsive-${viewport.name}.png`,
          fullPage: true,
        });
      }
    });
  });

  test.describe('API Integration', () => {
    test('should verify correct API calls are made', async () => {
      await preferencesPage.goto();

      // Track API calls
      const apiCalls: { method: string; url: string; data?: any }[] = [];

      await page.route('**/api/profile/preferences', async (route) => {
        const request = route.request();
        apiCalls.push({
          method: request.method(),
          url: request.url(),
          data:
            request.method() === 'PUT'
              ? JSON.parse(request.postData() || '{}')
              : undefined,
        });

        if (request.method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: DEFAULT_USER_PREFERENCES,
            }),
          });
        } else if (request.method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                ...DEFAULT_USER_PREFERENCES,
                ...JSON.parse(request.postData() || '{}'),
              },
            }),
          });
        }
      });

      // Make changes and save
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeLanguage('th');
      await preferencesPage.savePreferences();

      // Verify correct API calls were made
      expect(apiCalls).toHaveLength(2); // One GET for loading, one PUT for saving
      expect(apiCalls[0].method).toBe('GET');
      expect(apiCalls[1].method).toBe('PUT');
      expect(apiCalls[1].data).toMatchObject({
        theme: 'dark',
        language: 'th',
      });

      // Take final screenshot
      await page.screenshot({
        path: 'screenshots/29-api-integration-complete.png',
        fullPage: true,
      });
    });
  });
});
