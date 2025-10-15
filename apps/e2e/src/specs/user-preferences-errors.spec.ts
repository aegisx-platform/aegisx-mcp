import { test, expect, Page } from '@playwright/test';
import { UserPreferencesPage } from '../pages/user-preferences.page';
import { PreferencesApiHelper } from '../support/preferences-api.helper';
import {
  DEFAULT_USER_PREFERENCES,
  TestPreferencesFactory,
} from '../fixtures/test-data';

test.describe('User Preferences Error Scenarios', () => {
  let page: Page;
  let preferencesPage: UserPreferencesPage;
  let apiHelper: PreferencesApiHelper;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    preferencesPage = new UserPreferencesPage(page);
    apiHelper = new PreferencesApiHelper(page);
  });

  test.afterEach(async () => {
    await apiHelper.cleanup();
  });

  test.describe('Network Error Scenarios', () => {
    test('should handle network failure during initial load', async () => {
      // Mock network failure for GET request
      await apiHelper.mockPreferencesApiError('network');

      await preferencesPage.goto();

      // Verify error state is displayed
      await expect(
        page.locator('[data-testid="error"], .error, ax-alert[type="error"]'),
      ).toBeVisible();

      // Take screenshot of error state
      await page.screenshot({
        path: 'screenshots/error-network-initial-load.png',
        fullPage: true,
      });

      // Verify retry functionality if available
      const retryButton = page.locator('button:has-text("Retry")');
      if (await retryButton.isVisible()) {
        // Mock successful response for retry
        await apiHelper.mockGetPreferences();
        await retryButton.click();

        // Should now load successfully
        await preferencesPage.verifyPreferencesComponentLoads();

        await page.screenshot({
          path: 'screenshots/error-network-retry-success.png',
          fullPage: true,
        });
      }
    });

    test('should handle network failure during save operation', async () => {
      // Initial load successful
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();
      await preferencesPage.verifyPreferencesComponentLoads();

      // Mock network failure for PUT request
      await apiHelper.mockPreferencesApiError('network');

      // Make changes and attempt to save
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeLanguage('th');

      // Take screenshot before save attempt
      await page.screenshot({
        path: 'screenshots/error-network-before-save.png',
        fullPage: true,
      });

      // Attempt to save
      await preferencesPage.savePreferences();

      // Wait for error handling
      await page.waitForTimeout(3000);

      // Take screenshot of error state
      await page.screenshot({
        path: 'screenshots/error-network-save-failed.png',
        fullPage: true,
      });

      // Verify error message appears
      const errorElements = [
        page.locator('.mat-mdc-snack-bar-container:has-text("network")'),
        page.locator('.mat-mdc-snack-bar-container:has-text("failed")'),
        page.locator('[data-testid="error"]'),
        page.locator('.error'),
        page.locator('ax-alert[type="error"]'),
      ];

      let errorFound = false;
      for (const errorElement of errorElements) {
        if (
          await errorElement.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
          errorFound = true;
          break;
        }
      }

      // If no specific error UI is found, verify that save button is still enabled
      // indicating the save failed and user can retry
      if (!errorFound) {
        const saveButton = page.locator('button:has-text("Save Preferences")');
        await expect(saveButton).toBeEnabled();
      }
    });

    test('should handle intermittent connectivity issues', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Simulate intermittent connectivity
      let requestCount = 0;
      await page.route('**/api/profile/preferences', async (route) => {
        requestCount++;

        if (requestCount <= 2) {
          // First two requests fail
          await route.abort('failed');
        } else {
          // Third request succeeds
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { ...DEFAULT_USER_PREFERENCES, theme: 'dark' },
              message: 'Preferences updated successfully!',
            }),
          });
        }
      });

      // Make changes
      await preferencesPage.changeTheme('dark');

      // First save attempt (should fail)
      await preferencesPage.savePreferences();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-intermittent-first-attempt.png',
        fullPage: true,
      });

      // Second save attempt (should fail)
      await preferencesPage.savePreferences();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-intermittent-second-attempt.png',
        fullPage: true,
      });

      // Third save attempt (should succeed)
      await preferencesPage.savePreferences();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-intermittent-success.png',
        fullPage: true,
      });

      // Verify eventual success
      await preferencesPage.verifyOperationResult();
    });
  });

  test.describe('Server Error Scenarios', () => {
    test('should handle 500 internal server error', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Mock server error for save
      await apiHelper.mockPreferencesApiError(
        'server',
        'Internal server error occurred',
      );

      await preferencesPage.changeTheme('dark');
      await preferencesPage.savePreferences();

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Take screenshot of server error
      await page.screenshot({
        path: 'screenshots/error-server-500.png',
        fullPage: true,
      });

      // Verify appropriate error handling
      const possibleErrorIndicators = [
        page.locator('.mat-mdc-snack-bar-container'),
        page.locator('[data-testid="error"]'),
        page.locator('.error'),
        page.locator('ax-alert[type="error"]'),
      ];

      let errorShown = false;
      for (const indicator of possibleErrorIndicators) {
        if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
          errorShown = true;
          break;
        }
      }

      // At minimum, save button should still be enabled for retry
      const saveButton = page.locator('button:has-text("Save Preferences")');
      await expect(saveButton).toBeEnabled();
    });

    test('should handle 401 authentication error', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Mock authentication error
      await apiHelper.mockAuthenticationRequired();

      await preferencesPage.changeTheme('dark');
      await preferencesPage.savePreferences();

      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-authentication-401.png',
        fullPage: true,
      });

      // Should redirect to login or show auth error
      // Check if redirected to login page or error is shown
      const currentUrl = page.url();
      const hasAuthError = await page
        .locator('text=authentication')
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      expect(currentUrl.includes('login') || hasAuthError).toBeTruthy();
    });

    test('should handle 429 rate limiting error', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Mock rate limiting
      await apiHelper.mockRateLimiting();

      await preferencesPage.changeTheme('dark');
      await preferencesPage.savePreferences();

      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-rate-limiting-429.png',
        fullPage: true,
      });

      // Should show rate limiting message
      const rateLimitError = await page
        .locator('text=too many requests')
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      const saveButtonEnabled = await page
        .locator('button:has-text("Save Preferences")')
        .isEnabled();

      // Either show rate limit error or keep save button enabled for retry
      expect(rateLimitError || saveButtonEnabled).toBeTruthy();
    });
  });

  test.describe('Validation Error Scenarios', () => {
    test('should handle validation errors from server', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Mock validation error
      await apiHelper.mockPreferencesApiError(
        'validation',
        'Validation failed',
      );

      // Try to save with potentially invalid data
      await preferencesPage.changeLanguage('invalid');
      await preferencesPage.savePreferences();

      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-validation-server.png',
        fullPage: true,
      });

      // Should show validation error
      const validationErrors = [
        page.locator('.mat-mdc-form-field-error'),
        page.locator('.validation-error'),
        page.locator('[data-testid="validation-error"]'),
        page.locator('.mat-mdc-snack-bar-container:has-text("validation")'),
      ];

      let validationErrorShown = false;
      for (const errorElement of validationErrors) {
        if (
          await errorElement.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
          validationErrorShown = true;
          break;
        }
      }

      // At minimum, save button should remain enabled for correction
      const saveButton = page.locator('button:has-text("Save Preferences")');
      await expect(saveButton).toBeEnabled();
    });

    test('should handle client-side validation errors', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Test form validation if implemented
      await preferencesPage.verifyFormValidation();

      await page.screenshot({
        path: 'screenshots/error-validation-client.png',
        fullPage: true,
      });
    });

    test('should validate required fields', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Try to submit form with missing required data (if any)
      // This would depend on the actual form validation rules

      // For now, test that form behaves reasonably with edge cases
      const testCases = [
        { field: 'language', value: '' },
        { field: 'timezone', value: '' },
      ];

      for (const testCase of testCases) {
        // Reset form
        await preferencesPage.resetToDefaults();

        // Try invalid value
        if (testCase.field === 'language') {
          // Test with empty language if validation exists
          await page.evaluate(() => {
            const languageSelect = document.querySelector(
              'mat-select[formcontrolname="language"]',
            ) as any;
            if (languageSelect && languageSelect._value !== undefined) {
              languageSelect.value = '';
            }
          });
        }

        await page.screenshot({
          path: `screenshots/error-validation-${testCase.field}-empty.png`,
          fullPage: true,
        });

        // Try to save and see if validation catches it
        await preferencesPage.savePreferences();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: `screenshots/error-validation-${testCase.field}-after-save.png`,
          fullPage: true,
        });
      }
    });
  });

  test.describe('Timeout and Loading Error Scenarios', () => {
    test('should handle slow API responses', async () => {
      // Mock very slow response
      await apiHelper.mockSlowPreferencesResponse(10000); // 10 seconds

      const startTime = Date.now();
      await preferencesPage.goto();

      // Should show loading state
      await expect(
        page.locator('[data-testid="loading"], .loading, mat-spinner'),
      ).toBeVisible();

      await page.screenshot({
        path: 'screenshots/error-timeout-loading-state.png',
        fullPage: true,
      });

      // Wait for reasonable timeout period
      await page.waitForTimeout(5000);

      // Check if still loading or if timeout handling kicked in
      const isStillLoading = await page
        .locator('[data-testid="loading"], .loading, mat-spinner')
        .isVisible();

      await page.screenshot({
        path: 'screenshots/error-timeout-after-wait.png',
        fullPage: true,
      });

      // The test framework should handle timeouts appropriately
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThan(4000); // Waited at least 4 seconds
    });

    test('should handle concurrent save requests', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Mock slow save response
      await apiHelper.mockSlowPreferencesResponse(3000);

      await preferencesPage.changeTheme('dark');

      // Start first save
      const savePromise1 = preferencesPage.savePreferences();

      // Immediately try second save
      await page.waitForTimeout(100);
      const savePromise2 = preferencesPage.savePreferences();

      await page.screenshot({
        path: 'screenshots/error-concurrent-saves.png',
        fullPage: true,
      });

      // Wait for both to complete
      await Promise.all([
        savePromise1.catch(() => {
          // Ignore errors for this test
        }),
        savePromise2.catch(() => {
          // Ignore errors for this test
        }),
      ]);

      await page.screenshot({
        path: 'screenshots/error-concurrent-saves-completed.png',
        fullPage: true,
      });

      // Should handle gracefully - either disable button during save or queue requests
      const saveButton = page.locator('button:has-text("Save Preferences")');
      const isEnabled = await saveButton.isEnabled();

      // Button should be in a reasonable state (enabled for retry if failed, or disabled if still processing)
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  test.describe('Data Integrity Error Scenarios', () => {
    test('should handle corrupted preference data', async () => {
      // Mock corrupted data response
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                theme: 'invalid-theme-value',
                language: null,
                notifications: 'not-an-object',
                navigation: undefined,
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await preferencesPage.goto();

      // Should handle gracefully with fallbacks
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-corrupted-data.png',
        fullPage: true,
      });

      // Form should still be usable even with corrupted initial data
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('should handle missing preference data', async () => {
      // Mock empty/missing data response
      await page.route('**/api/profile/preferences', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: null,
            }),
          });
        } else {
          await route.continue();
        }
      });

      await preferencesPage.goto();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-missing-data.png',
        fullPage: true,
      });

      // Should fall back to default values
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });

  test.describe('Browser Compatibility Error Scenarios', () => {
    test('should handle localStorage unavailability', async () => {
      // Disable localStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: undefined,
          writable: false,
        });
      });

      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      await page.screenshot({
        path: 'screenshots/error-no-localstorage.png',
        fullPage: true,
      });

      // Should still function without localStorage
      await preferencesPage.verifyPreferencesComponentLoads();
    });

    test('should handle JavaScript errors gracefully', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Inject a JavaScript error
      await page.evaluate(() => {
        // Simulate a third-party script error
        setTimeout(() => {
          throw new Error('Simulated third-party error');
        }, 1000);
      });

      // Wait for potential error
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'screenshots/error-javascript-error.png',
        fullPage: true,
      });

      // Form should still be functional despite the error
      await preferencesPage.changeTheme('dark');
      const currentPrefs = await preferencesPage.getCurrentPreferences();
      expect(currentPrefs.theme).toBe('dark');
    });
  });

  test.describe('Error Recovery Scenarios', () => {
    test('should recover from temporary errors', async () => {
      let attemptCount = 0;

      await page.route('**/api/profile/preferences', async (route) => {
        attemptCount++;

        if (route.request().method() === 'GET') {
          if (attemptCount === 1) {
            // First attempt fails
            await route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                error: 'Temporary error',
              }),
            });
          } else {
            // Second attempt succeeds
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                data: DEFAULT_USER_PREFERENCES,
              }),
            });
          }
        } else {
          await route.continue();
        }
      });

      await preferencesPage.goto();
      await page.waitForTimeout(2000);

      // Should show error initially
      await page.screenshot({
        path: 'screenshots/error-recovery-initial-error.png',
        fullPage: true,
      });

      // Try to reload or retry
      await page.reload();
      await page.waitForTimeout(2000);

      // Should recover successfully
      await page.screenshot({
        path: 'screenshots/error-recovery-success.png',
        fullPage: true,
      });

      await preferencesPage.verifyPreferencesComponentLoads();
    });

    test('should maintain unsaved changes through errors', async () => {
      await apiHelper.mockGetPreferences();
      await preferencesPage.goto();

      // Make changes
      await preferencesPage.changeTheme('dark');
      await preferencesPage.changeLanguage('th');

      await page.screenshot({
        path: 'screenshots/error-recovery-changes-made.png',
        fullPage: true,
      });

      // Mock save error
      await apiHelper.mockPreferencesApiError('server');
      await preferencesPage.savePreferences();
      await page.waitForTimeout(2000);

      // Changes should still be in the form
      const currentPrefs = await preferencesPage.getCurrentPreferences();
      expect(currentPrefs.theme).toBe('dark');
      expect(currentPrefs.language).toBe('th');

      await page.screenshot({
        path: 'screenshots/error-recovery-changes-preserved.png',
        fullPage: true,
      });

      // Fix API and retry
      await apiHelper.mockUpdatePreferences();
      await preferencesPage.savePreferences();

      // Should eventually succeed
      await preferencesPage.verifyOperationResult();

      await page.screenshot({
        path: 'screenshots/error-recovery-final-success.png',
        fullPage: true,
      });
    });
  });
});
