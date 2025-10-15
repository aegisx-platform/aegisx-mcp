import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { UserPreferences } from '../fixtures/test-data';

/**
 * User Preferences Page Object Model
 * Handles user preferences functionality on the profile page
 */
export class UserPreferencesPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main containers
    preferencesContainer:
      '[data-testid="preferences-container"], .preferences-container',
    loadingSpinner: '[data-testid="loading"], .loading, mat-spinner',
    errorAlert: '[data-testid="error"], .error, ax-alert[type="error"]',
    successMessage: '[data-testid="success"], .success',

    // Form elements
    preferencesForm: 'form',

    // Appearance Section
    appearanceCard: '[data-testid="appearance-card"]',
    themeSelect: '[formcontrolname="theme"], select[name="theme"]',
    schemeSelect: '[formcontrolname="scheme"], select[name="scheme"]',
    layoutSelect: '[formcontrolname="layout"], select[name="layout"]',

    // Localization Section
    localizationCard: '[data-testid="localization-card"]',
    languageSelect: '[formcontrolname="language"], select[name="language"]',
    timezoneSelect: '[formcontrolname="timezone"], select[name="timezone"]',
    dateFormatSelect:
      '[formcontrolname="dateFormat"], select[name="dateFormat"]',
    timeFormatSelect:
      '[formcontrolname="timeFormat"], select[name="timeFormat"]',

    // Notifications Section
    notificationsCard: '[data-testid="notifications-card"]',
    emailNotificationToggle:
      '[formcontrolname="email"] mat-slide-toggle, input[name="notifications.email"]',
    pushNotificationToggle:
      '[formcontrolname="push"] mat-slide-toggle, input[name="notifications.push"]',
    desktopNotificationToggle:
      '[formcontrolname="desktop"] mat-slide-toggle, input[name="notifications.desktop"]',
    soundNotificationToggle:
      '[formcontrolname="sound"] mat-slide-toggle, input[name="notifications.sound"]',

    // Navigation Section
    navigationCard: '[data-testid="navigation-card"]',
    navigationCollapsedToggle:
      '[formcontrolname="collapsed"] mat-slide-toggle, input[name="navigation.collapsed"]',
    navigationTypeSelect:
      '[formcontrolname="type"], select[name="navigation.type"]',
    navigationPositionSelect:
      '[formcontrolname="position"], select[name="navigation.position"]',

    // Action Buttons
    resetButton:
      '[data-testid="reset-btn"], button:has-text("Reset to Defaults")',
    discardButton:
      '[data-testid="discard-btn"], button:has-text("Discard Changes")',
    saveButton:
      '[data-testid="save-btn"], button[type="submit"], button:has-text("Save Preferences")',

    // Tab navigation
    preferencesTab:
      '[data-testid="preferences-tab"], .mat-mdc-tab:has-text("Preferences")',

    // Validation and feedback
    validationError: '.mat-mdc-form-field-error, .validation-error',
    snackbar: '.mat-mdc-snack-bar-container, .snackbar',

    // Material UI specific selectors
    matSelect: 'mat-select',
    matSelectTrigger: '.mat-mdc-select-trigger',
    matOption: 'mat-option',
    matSlideToggle: 'mat-slide-toggle',
    matSlideToggleButton: '.mdc-switch',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to profile page and switch to preferences tab
   */
  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.waitForLoad();
    await this.switchToPreferencesTab();
  }

  /**
   * Wait for preferences page to be loaded
   */
  async waitForLoad(): Promise<void> {
    await this.waitForElement(this.selectors.preferencesContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    const loadingExists = await this.elementExists(
      this.selectors.loadingSpinner,
    );
    if (loadingExists) {
      await this.waitForElementHidden(this.selectors.loadingSpinner);
    }
  }

  /**
   * Switch to preferences tab
   */
  async switchToPreferencesTab(): Promise<void> {
    const tab = this.page.locator(this.selectors.preferencesTab);
    if (await tab.isVisible()) {
      await tab.click();
      await this.page.waitForTimeout(500); // Wait for tab animation
    }
  }

  /**
   * Verify preferences component loads correctly
   */
  async verifyPreferencesComponentLoads(): Promise<void> {
    await this.verifyElementVisible(this.selectors.preferencesContainer);
    await this.verifyElementVisible(this.selectors.preferencesForm);

    // Verify all sections are present
    await this.verifyElementVisible(
      '[data-testid="appearance-card"], ax-card:has-text("Appearance")',
    );
    await this.verifyElementVisible(
      '[data-testid="localization-card"], ax-card:has-text("Localization")',
    );
    await this.verifyElementVisible(
      '[data-testid="notifications-card"], ax-card:has-text("Notifications")',
    );
    await this.verifyElementVisible(
      '[data-testid="navigation-card"], ax-card:has-text("Navigation")',
    );

    // Verify action buttons
    await this.verifyElementVisible(this.selectors.saveButton);
    await this.verifyElementVisible(this.selectors.resetButton);
  }

  /**
   * Change theme setting
   */
  async changeTheme(
    theme: 'default' | 'light' | 'dark' | 'auto',
  ): Promise<void> {
    await this.selectMatOption(this.selectors.themeSelect, theme);
  }

  /**
   * Change language setting
   */
  async changeLanguage(language: string): Promise<void> {
    await this.selectMatOption(this.selectors.languageSelect, language);
  }

  /**
   * Change scheme setting
   */
  async changeScheme(scheme: 'light' | 'dark' | 'auto'): Promise<void> {
    await this.selectMatOption(this.selectors.schemeSelect, scheme);
  }

  /**
   * Change layout setting
   */
  async changeLayout(
    layout: 'classic' | 'compact' | 'enterprise' | 'empty',
  ): Promise<void> {
    await this.selectMatOption(this.selectors.layoutSelect, layout);
  }

  /**
   * Change timezone setting
   */
  async changeTimezone(timezone: string): Promise<void> {
    await this.selectMatOption(this.selectors.timezoneSelect, timezone);
  }

  /**
   * Change date format setting
   */
  async changeDateFormat(
    format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD',
  ): Promise<void> {
    await this.selectMatOption(this.selectors.dateFormatSelect, format);
  }

  /**
   * Change time format setting
   */
  async changeTimeFormat(format: '12h' | '24h'): Promise<void> {
    await this.selectMatOption(this.selectors.timeFormatSelect, format);
  }

  /**
   * Toggle email notifications
   */
  async toggleEmailNotifications(enabled: boolean): Promise<void> {
    await this.toggleMatSlideToggle(
      this.selectors.emailNotificationToggle,
      enabled,
    );
  }

  /**
   * Toggle push notifications
   */
  async togglePushNotifications(enabled: boolean): Promise<void> {
    await this.toggleMatSlideToggle(
      this.selectors.pushNotificationToggle,
      enabled,
    );
  }

  /**
   * Toggle desktop notifications
   */
  async toggleDesktopNotifications(enabled: boolean): Promise<void> {
    await this.toggleMatSlideToggle(
      this.selectors.desktopNotificationToggle,
      enabled,
    );
  }

  /**
   * Toggle sound notifications
   */
  async toggleSoundNotifications(enabled: boolean): Promise<void> {
    await this.toggleMatSlideToggle(
      this.selectors.soundNotificationToggle,
      enabled,
    );
  }

  /**
   * Toggle navigation collapsed
   */
  async toggleNavigationCollapsed(collapsed: boolean): Promise<void> {
    await this.toggleMatSlideToggle(
      this.selectors.navigationCollapsedToggle,
      collapsed,
    );
  }

  /**
   * Change navigation type
   */
  async changeNavigationType(
    type: 'default' | 'compact' | 'horizontal',
  ): Promise<void> {
    await this.selectMatOption(this.selectors.navigationTypeSelect, type);
  }

  /**
   * Change navigation position
   */
  async changeNavigationPosition(
    position: 'left' | 'right' | 'top',
  ): Promise<void> {
    await this.selectMatOption(
      this.selectors.navigationPositionSelect,
      position,
    );
  }

  /**
   * Save preferences
   */
  async savePreferences(): Promise<void> {
    await this.clickElement(this.selectors.saveButton);
    await this.waitForSaveComplete();
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.clickElement(this.selectors.resetButton);
  }

  /**
   * Discard changes
   */
  async discardChanges(): Promise<void> {
    await this.clickElement(this.selectors.discardButton);
  }

  /**
   * Wait for save operation to complete
   */
  async waitForSaveComplete(): Promise<void> {
    await this.waitForLoadingComplete();

    // Wait for success message or check if form is still dirty
    try {
      await this.waitForElement(this.selectors.snackbar, 10000);
    } catch {
      // If no snackbar, check if save button is still disabled (indicating success)
      const saveButton = this.page.locator(this.selectors.saveButton);
      await expect(saveButton).toBeDisabled();
    }
  }

  /**
   * Verify success message appears
   */
  async verifyOperationResult(expectedMessage?: string): Promise<void> {
    await this.verifyElementVisible(this.selectors.snackbar);

    if (expectedMessage) {
      await this.verifyElementContainsText(
        this.selectors.snackbar,
        expectedMessage,
      );
    }
  }

  /**
   * Verify error message appears
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    await this.verifyElementVisible(this.selectors.errorAlert);

    if (expectedMessage) {
      await this.verifyElementContainsText(
        this.selectors.errorAlert,
        expectedMessage,
      );
    }
  }

  /**
   * Fill all preference settings
   */
  async fillAllPreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<void> {
    // Appearance settings
    if (preferences.theme) {
      await this.changeTheme(preferences.theme);
    }
    if (preferences.scheme) {
      await this.changeScheme(preferences.scheme);
    }
    if (preferences.layout) {
      await this.changeLayout(preferences.layout);
    }

    // Localization settings
    if (preferences.language) {
      await this.changeLanguage(preferences.language);
    }
    if (preferences.timezone) {
      await this.changeTimezone(preferences.timezone);
    }
    if (preferences.dateFormat) {
      await this.changeDateFormat(preferences.dateFormat);
    }
    if (preferences.timeFormat) {
      await this.changeTimeFormat(preferences.timeFormat);
    }

    // Notification settings
    if (preferences.notifications) {
      if (preferences.notifications.email !== undefined) {
        await this.toggleEmailNotifications(preferences.notifications.email);
      }
      if (preferences.notifications.push !== undefined) {
        await this.togglePushNotifications(preferences.notifications.push);
      }
      if (preferences.notifications.desktop !== undefined) {
        await this.toggleDesktopNotifications(
          preferences.notifications.desktop,
        );
      }
      if (preferences.notifications.sound !== undefined) {
        await this.toggleSoundNotifications(preferences.notifications.sound);
      }
    }

    // Navigation settings
    if (preferences.navigation) {
      if (preferences.navigation.collapsed !== undefined) {
        await this.toggleNavigationCollapsed(preferences.navigation.collapsed);
      }
      if (preferences.navigation.type) {
        await this.changeNavigationType(preferences.navigation.type);
      }
      if (preferences.navigation.position) {
        await this.changeNavigationPosition(preferences.navigation.position);
      }
    }
  }

  /**
   * Get current preference values from the form
   */
  async getCurrentPreferences(): Promise<UserPreferences> {
    const preferences: UserPreferences = {
      theme: (await this.getMatSelectValue(this.selectors.themeSelect)) as any,
      scheme: (await this.getMatSelectValue(
        this.selectors.schemeSelect,
      )) as any,
      layout: (await this.getMatSelectValue(
        this.selectors.layoutSelect,
      )) as any,
      language: await this.getMatSelectValue(this.selectors.languageSelect),
      timezone: await this.getMatSelectValue(this.selectors.timezoneSelect),
      dateFormat: (await this.getMatSelectValue(
        this.selectors.dateFormatSelect,
      )) as any,
      timeFormat: (await this.getMatSelectValue(
        this.selectors.timeFormatSelect,
      )) as any,
      notifications: {
        email: await this.getMatSlideToggleValue(
          this.selectors.emailNotificationToggle,
        ),
        push: await this.getMatSlideToggleValue(
          this.selectors.pushNotificationToggle,
        ),
        desktop: await this.getMatSlideToggleValue(
          this.selectors.desktopNotificationToggle,
        ),
        sound: await this.getMatSlideToggleValue(
          this.selectors.soundNotificationToggle,
        ),
      },
      navigation: {
        collapsed: await this.getMatSlideToggleValue(
          this.selectors.navigationCollapsedToggle,
        ),
        type: (await this.getMatSelectValue(
          this.selectors.navigationTypeSelect,
        )) as any,
        position: (await this.getMatSelectValue(
          this.selectors.navigationPositionSelect,
        )) as any,
      },
    };

    return preferences;
  }

  /**
   * Verify current preferences match expected values
   */
  async verifyCurrentPreferences(
    expectedPreferences: Partial<UserPreferences>,
  ): Promise<void> {
    const currentPreferences = await this.getCurrentPreferences();

    if (expectedPreferences.theme) {
      expect(currentPreferences.theme).toBe(expectedPreferences.theme);
    }
    if (expectedPreferences.scheme) {
      expect(currentPreferences.scheme).toBe(expectedPreferences.scheme);
    }
    if (expectedPreferences.layout) {
      expect(currentPreferences.layout).toBe(expectedPreferences.layout);
    }
    if (expectedPreferences.language) {
      expect(currentPreferences.language).toBe(expectedPreferences.language);
    }
    if (expectedPreferences.timezone) {
      expect(currentPreferences.timezone).toBe(expectedPreferences.timezone);
    }
    if (expectedPreferences.dateFormat) {
      expect(currentPreferences.dateFormat).toBe(
        expectedPreferences.dateFormat,
      );
    }
    if (expectedPreferences.timeFormat) {
      expect(currentPreferences.timeFormat).toBe(
        expectedPreferences.timeFormat,
      );
    }

    if (expectedPreferences.notifications) {
      if (expectedPreferences.notifications.email !== undefined) {
        expect(currentPreferences.notifications.email).toBe(
          expectedPreferences.notifications.email,
        );
      }
      if (expectedPreferences.notifications.push !== undefined) {
        expect(currentPreferences.notifications.push).toBe(
          expectedPreferences.notifications.push,
        );
      }
      if (expectedPreferences.notifications.desktop !== undefined) {
        expect(currentPreferences.notifications.desktop).toBe(
          expectedPreferences.notifications.desktop,
        );
      }
      if (expectedPreferences.notifications.sound !== undefined) {
        expect(currentPreferences.notifications.sound).toBe(
          expectedPreferences.notifications.sound,
        );
      }
    }

    if (expectedPreferences.navigation) {
      if (expectedPreferences.navigation.collapsed !== undefined) {
        expect(currentPreferences.navigation.collapsed).toBe(
          expectedPreferences.navigation.collapsed,
        );
      }
      if (expectedPreferences.navigation.type) {
        expect(currentPreferences.navigation.type).toBe(
          expectedPreferences.navigation.type,
        );
      }
      if (expectedPreferences.navigation.position) {
        expect(currentPreferences.navigation.position).toBe(
          expectedPreferences.navigation.position,
        );
      }
    }
  }

  /**
   * Take screenshot of preferences page
   */
  async takePreferencesScreenshot(name = 'user-preferences'): Promise<void> {
    await this.screenshot(name, { fullPage: true });
  }

  /**
   * Take screenshot of specific preferences section
   */
  async takeSectionScreenshot(section: string, name?: string): Promise<void> {
    const sectionSelector = `ax-card:has-text("${section}")`;
    await this.page.locator(sectionSelector).screenshot({
      path: `screenshots/${name || section.toLowerCase()}-section.png`,
    });
  }

  // Material UI specific helper methods

  /**
   * Select an option from Material UI select
   */
  private async selectMatOption(
    selectSelector: string,
    value: string,
  ): Promise<void> {
    // Click the select trigger
    await this.page.locator(selectSelector).click();

    // Wait for the options panel to appear
    await this.page.waitForSelector('.mat-mdc-select-panel', {
      state: 'visible',
    });

    // Click the option
    await this.page
      .locator(`mat-option[value="${value}"], mat-option:has-text("${value}")`)
      .click();

    // Wait for the panel to close
    await this.page.waitForSelector('.mat-mdc-select-panel', {
      state: 'hidden',
    });
  }

  /**
   * Get value from Material UI select
   */
  private async getMatSelectValue(selectSelector: string): Promise<string> {
    const trigger = this.page
      .locator(selectSelector)
      .locator('.mat-mdc-select-value-text');
    return (await trigger.textContent()) || '';
  }

  /**
   * Toggle Material UI slide toggle
   */
  private async toggleMatSlideToggle(
    toggleSelector: string,
    enabled: boolean,
  ): Promise<void> {
    const toggle = this.page.locator(toggleSelector);
    const isCurrentlyChecked = await toggle.locator('input').isChecked();

    if (isCurrentlyChecked !== enabled) {
      await toggle.click();
    }
  }

  /**
   * Get value from Material UI slide toggle
   */
  private async getMatSlideToggleValue(
    toggleSelector: string,
  ): Promise<boolean> {
    return await this.page.locator(toggleSelector).locator('input').isChecked();
  }

  /**
   * Verify form validation
   */
  async verifyFormValidation(): Promise<void> {
    // Try saving with invalid data
    await this.changeLanguage(''); // Invalid language
    await this.savePreferences();

    // Should show validation error
    await this.verifyElementVisible(this.selectors.validationError);
  }

  /**
   * Check if save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    const saveButton = this.page.locator(this.selectors.saveButton);
    return await saveButton.isEnabled();
  }

  /**
   * Check if form has unsaved changes
   */
  async hasUnsavedChanges(): Promise<boolean> {
    return await this.isSaveButtonEnabled();
  }
}
