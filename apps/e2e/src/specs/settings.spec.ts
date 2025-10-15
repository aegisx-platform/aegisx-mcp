import { test, expect } from '@playwright/test';
import {
  SettingsPage,
  GeneralSettingsTab,
  SecuritySettingsTab,
  NotificationSettingsTab,
  IntegrationSettingsTab,
  AppearanceSettingsTab,
} from '../pages/settings.page';

test.describe('Settings Management', () => {
  let settingsPage: SettingsPage;
  let generalSettings: GeneralSettingsTab;
  let securitySettings: SecuritySettingsTab;
  let notificationSettings: NotificationSettingsTab;
  let integrationSettings: IntegrationSettingsTab;
  let appearanceSettings: AppearanceSettingsTab;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    generalSettings = new GeneralSettingsTab(page);
    securitySettings = new SecuritySettingsTab(page);
    notificationSettings = new NotificationSettingsTab(page);
    integrationSettings = new IntegrationSettingsTab(page);
    appearanceSettings = new AppearanceSettingsTab(page);

    await settingsPage.goto();
    await page.waitForLoadState('networkidle');
  });

  test('should display all settings tabs', async ({ page }) => {
    // Verify page title
    await expect(settingsPage.pageTitle).toBeVisible();
    await expect(settingsPage.pageTitle).toHaveText('Settings');

    // Verify all tabs are present
    await expect(settingsPage.tabGroup).toBeVisible();

    const tabs = [
      'General',
      'Security',
      'Notifications',
      'Integrations',
      'Appearance',
    ];
    for (const tab of tabs) {
      const tabElement = page.locator(`mat-tab-label:has-text("${tab}")`);
      await expect(tabElement).toBeVisible();
    }

    // Verify General tab is active by default
    await expect(await settingsPage.isTabActive('General')).toBe(true);
  });

  test('should update general settings', async ({ page }) => {
    // Ensure on General tab
    await expect(generalSettings.container).toBeVisible();

    // Update general settings
    const newSettings = {
      siteName: 'AegisX Test Platform',
      siteDescription: 'Updated test description',
      contactEmail: 'test@aegisx.com',
      supportPhone: '+1-555-0123',
      timezone: 'UTC',
      language: 'English',
      dateFormat: 'MM/DD/YYYY',
    };

    await generalSettings.updateGeneralSettings(newSettings);

    // Save changes
    await settingsPage.saveChanges();

    // Verify success message
    await settingsPage.waitForOperationResult();

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify settings were saved
    const savedValues = await generalSettings.getFormValues();
    expect(savedValues.siteName).toBe(newSettings.siteName);
    expect(savedValues.contactEmail).toBe(newSettings.contactEmail);
  });

  test('should validate general settings inputs', async () => {
    // Try invalid email
    await generalSettings.contactEmailInput.clear();
    await generalSettings.contactEmailInput.fill('invalid-email');
    await generalSettings.contactEmailInput.blur();

    // Check for validation error
    const emailError = generalSettings.container.locator(
      'mat-error:has-text("email")',
    );
    await expect(emailError).toBeVisible();

    // Fix email
    await generalSettings.contactEmailInput.clear();
    await generalSettings.contactEmailInput.fill('valid@email.com');

    // Error should disappear
    await expect(emailError).toBeHidden();
  });

  test('should configure security settings', async () => {
    // Navigate to Security tab
    await settingsPage.selectTab('Security');
    await expect(securitySettings.container).toBeVisible();

    // Update security settings
    const newSettings = {
      passwordMinLength: 12,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: true,
      enforceTwoFactor: false,
      allowedDomains: 'aegisx.com\nexample.com',
    };

    await securitySettings.updateSecuritySettings(newSettings);

    // Verify password complexity requirements
    const requirements = await securitySettings.getPasswordComplexityStatus();
    expect(requirements).toContain('uppercase');
    expect(requirements).toContain('numbers');
    expect(requirements).toContain('special');

    // Save changes
    await settingsPage.saveChanges();
    await settingsPage.waitForOperationResult();
  });

  test('should validate security settings constraints', async () => {
    await settingsPage.selectTab('Security');

    // Try invalid password length (too small)
    await securitySettings.passwordMinLengthInput.clear();
    await securitySettings.passwordMinLengthInput.fill('5');
    await securitySettings.passwordMinLengthInput.blur();

    // Should show validation error
    const minLengthError = securitySettings.container.locator(
      'mat-error:has-text("minimum")',
    );
    await expect(minLengthError).toBeVisible();

    // Try invalid session timeout
    await securitySettings.sessionTimeoutInput.clear();
    await securitySettings.sessionTimeoutInput.fill('0');

    // Try to save
    await settingsPage.saveChanges();

    // Should show error
    const errorMessage = await settingsPage.errorMessage;
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should configure notification settings', async ({ page }) => {
    // Navigate to Notifications tab
    await settingsPage.selectTab('Notifications');
    await expect(notificationSettings.container).toBeVisible();

    // Enable all notification types
    await notificationSettings.toggleNotificationType('email', true);
    await notificationSettings.toggleNotificationType('sms', true);
    await notificationSettings.toggleNotificationType('push', true);

    // Verify all are enabled
    const enabledTypes =
      await notificationSettings.getEnabledNotificationTypes();
    expect(enabledTypes).toContain('email');
    expect(enabledTypes).toContain('sms');
    expect(enabledTypes).toContain('push');

    // Toggle specific notification categories
    await notificationSettings.toggleNotificationCategory('security', true);
    await notificationSettings.toggleNotificationCategory('updates', false);

    // Save changes
    await settingsPage.saveChanges();
    await settingsPage.waitForOperationResult();
  });

  test('should manage integrations', async ({ page }) => {
    // Navigate to Integrations tab
    await settingsPage.selectTab('Integrations');
    await expect(integrationSettings.container).toBeVisible();

    // Get initial integration count
    const initialCount = await integrationSettings.getIntegrationCount();

    // Add new integration
    await integrationSettings.addIntegration(
      'Test API Integration',
      'test-api-key-123456',
      'https://webhook.example.com',
    );

    // Verify integration was added
    const newCount = await integrationSettings.getIntegrationCount();
    expect(newCount).toBe(initialCount + 1);

    // Toggle integration status
    await integrationSettings.toggleIntegration('Test API Integration', false);

    // Save changes
    await settingsPage.saveChanges();
    await settingsPage.waitForOperationResult();

    // Remove integration
    await integrationSettings.removeIntegration('Test API Integration');

    // Verify integration was removed
    const finalCount = await integrationSettings.getIntegrationCount();
    expect(finalCount).toBe(initialCount);
  });

  test('should configure appearance settings', async ({ page }) => {
    // Navigate to Appearance tab
    await settingsPage.selectTab('Appearance');
    await expect(appearanceSettings.container).toBeVisible();

    // Get current theme
    const currentTheme = await appearanceSettings.getCurrentTheme();

    // Change theme
    const newTheme = currentTheme === 'Light' ? 'dark' : 'light';
    await appearanceSettings.selectTheme(newTheme as any);

    // Set custom colors
    await appearanceSettings.setColors('#3F51B5', '#FF4081');

    // Add custom CSS
    await appearanceSettings.setCustomCSS(`
      .custom-header {
        background: linear-gradient(45deg, #3F51B5, #FF4081);
      }
    `);

    // Preview changes
    await appearanceSettings.previewChanges();

    // Wait for preview to apply
    await page.waitForTimeout(1000);

    // Save changes
    await settingsPage.saveChanges();
    await settingsPage.waitForOperationResult();

    // Verify theme was applied
    const appliedTheme = await appearanceSettings.getCurrentTheme();
    expect(appliedTheme.toLowerCase()).toContain(newTheme);
  });

  test('should handle file uploads in appearance settings', async ({
    page,
  }) => {
    await settingsPage.selectTab('Appearance');

    // Create test files
    const logoContent = Buffer.from('fake-logo-data');
    const faviconContent = Buffer.from('fake-favicon-data');

    // Upload logo
    await appearanceSettings.logoUpload.setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: logoContent,
    });

    // Upload favicon
    await appearanceSettings.faviconUpload.setInputFiles({
      name: 'favicon.ico',
      mimeType: 'image/x-icon',
      buffer: faviconContent,
    });

    // Save changes
    await settingsPage.saveChanges();

    // Should either succeed or show appropriate error for file validation
    const hasSuccess = await settingsPage.successMessage
      .isVisible()
      .catch(() => false);
    const hasError = await settingsPage.errorMessage
      .isVisible()
      .catch(() => false);

    expect(hasSuccess || hasError).toBe(true);
  });

  test('should reset appearance to defaults', async ({ page }) => {
    await settingsPage.selectTab('Appearance');

    // Make some changes first
    await appearanceSettings.selectTheme('dark');
    await appearanceSettings.setColors('#000000', '#FFFFFF');

    // Reset to defaults
    await appearanceSettings.resetToDefaults();

    // Wait for reset
    await page.waitForTimeout(1000);

    // Verify theme is back to default
    const theme = await appearanceSettings.getCurrentTheme();
    expect(theme.toLowerCase()).toContain('light');

    // Colors should be reset
    const primaryColor =
      await appearanceSettings.primaryColorPicker.inputValue();
    expect(primaryColor).not.toBe('#000000');
  });

  test('should cancel changes without saving', async () => {
    // Make changes to general settings
    const originalValues = await generalSettings.getFormValues();

    await generalSettings.updateGeneralSettings({
      siteName: 'Temporary Change',
      contactEmail: 'temp@example.com',
    });

    // Cancel changes
    await settingsPage.cancelChanges();

    // Check if confirmation dialog appears
    const confirmDialog = settingsPage.page.locator('[role="alertdialog"]');
    if ((await confirmDialog.count()) > 0) {
      await confirmDialog.locator('button:has-text("Confirm")').click();
    }

    // Values should revert
    await settingsPage.page.waitForTimeout(500);
    const currentValues = await generalSettings.getFormValues();
    expect(currentValues.siteName).toBe(originalValues.siteName);
  });

  test('should maintain settings state across tabs', async () => {
    // Make change in General tab
    await generalSettings.updateGeneralSettings({
      siteName: 'Tab Switch Test',
    });

    // Switch to Security tab
    await settingsPage.selectTab('Security');
    await expect(securitySettings.container).toBeVisible();

    // Switch back to General tab
    await settingsPage.selectTab('General');

    // Changes should still be there
    const siteName = await generalSettings.siteNameInput.inputValue();
    expect(siteName).toBe('Tab Switch Test');
  });

  test('should handle concurrent modifications', async ({ page, context }) => {
    // Open settings in two tabs
    const page2 = await context.newPage();
    const settingsPage2 = new SettingsPage(page2);
    await settingsPage2.goto();

    // Make changes in first tab
    await generalSettings.updateGeneralSettings({
      siteName: 'First Tab Change',
    });
    await settingsPage.saveChanges();
    await settingsPage.waitForOperationResult();

    // Try to make conflicting change in second tab
    const generalSettings2 = new GeneralSettingsTab(page2);
    await generalSettings2.updateGeneralSettings({
      siteName: 'Second Tab Change',
    });
    await settingsPage2.saveChanges();

    // Should either handle gracefully or show conflict message
    const hasSuccess = await settingsPage2.successMessage
      .isVisible()
      .catch(() => false);
    const hasError = await settingsPage2.errorMessage
      .isVisible()
      .catch(() => false);

    expect(hasSuccess || hasError).toBe(true);

    await page2.close();
  });
});

test.describe('Settings Accessibility', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Navigate tabs with arrow keys
    await page.keyboard.press('ArrowRight');
    await expect(await settingsPage.isTabActive('Security')).toBe(true);

    await page.keyboard.press('ArrowRight');
    await expect(await settingsPage.isTabActive('Notifications')).toBe(true);

    // Tab to form controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus is on form element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName.toLowerCase();
    });

    expect(['input', 'textarea', 'mat-select', 'mat-slide-toggle']).toContain(
      focusedElement,
    );
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check tab list has proper role
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    // Check form sections have proper structure
    const formSections = page.locator('section[aria-labelledby], fieldset');
    const sectionCount = await formSections.count();
    expect(sectionCount).toBeGreaterThan(0);

    // Check save button has proper label
    const saveButton = settingsPage.saveButton;
    const ariaLabel = await saveButton.getAttribute('aria-label');
    const buttonText = await saveButton.textContent();
    expect(ariaLabel || buttonText).toBeTruthy();
  });

  test('should announce changes to screen readers', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();

    // Make a change and save
    const generalSettings = new GeneralSettingsTab(page);
    await generalSettings.updateGeneralSettings({
      siteName: 'Accessibility Test',
    });
    await settingsPage.saveChanges();

    // If live regions exist, they should update
    if (liveRegionCount > 0) {
      const announcement = await liveRegions.first().textContent();
      expect(announcement).toBeTruthy();
    }
  });
});
