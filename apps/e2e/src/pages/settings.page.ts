import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly tabGroup: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Settings")');
    this.tabGroup = page.locator('mat-tab-group');
    this.saveButton = page.locator('button:has-text("Save")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.successMessage = page.locator('.mat-snack-bar:has-text("saved successfully")');
    this.errorMessage = page.locator('.mat-snack-bar:has-text("error"), .error-message');
  }

  async goto() {
    await this.page.goto('/settings');
  }

  async selectTab(tabName: string) {
    const tab = this.page.locator(`mat-tab-label:has-text("${tabName}")`);
    await tab.click();
    await this.page.waitForTimeout(300); // Wait for tab transition
  }

  async isTabActive(tabName: string): Promise<boolean> {
    const tab = this.page.locator(`mat-tab-label:has-text("${tabName}")`);
    const ariaSelected = await tab.getAttribute('aria-selected');
    return ariaSelected === 'true';
  }

  async saveChanges() {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancelChanges() {
    await this.cancelButton.click();
  }

  async waitForSuccessMessage() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }
}

export class GeneralSettingsTab {
  readonly page: Page;
  readonly container: Locator;
  readonly siteNameInput: Locator;
  readonly siteDescriptionInput: Locator;
  readonly contactEmailInput: Locator;
  readonly supportPhoneInput: Locator;
  readonly timezoneSelect: Locator;
  readonly languageSelect: Locator;
  readonly dateFormatSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('ax-general-settings');
    this.siteNameInput = this.container.locator('input[formControlName="siteName"]');
    this.siteDescriptionInput = this.container.locator('textarea[formControlName="siteDescription"]');
    this.contactEmailInput = this.container.locator('input[formControlName="contactEmail"]');
    this.supportPhoneInput = this.container.locator('input[formControlName="supportPhone"]');
    this.timezoneSelect = this.container.locator('mat-select[formControlName="timezone"]');
    this.languageSelect = this.container.locator('mat-select[formControlName="language"]');
    this.dateFormatSelect = this.container.locator('mat-select[formControlName="dateFormat"]');
  }

  async updateGeneralSettings(settings: {
    siteName?: string;
    siteDescription?: string;
    contactEmail?: string;
    supportPhone?: string;
    timezone?: string;
    language?: string;
    dateFormat?: string;
  }) {
    if (settings.siteName) {
      await this.siteNameInput.clear();
      await this.siteNameInput.fill(settings.siteName);
    }

    if (settings.siteDescription) {
      await this.siteDescriptionInput.clear();
      await this.siteDescriptionInput.fill(settings.siteDescription);
    }

    if (settings.contactEmail) {
      await this.contactEmailInput.clear();
      await this.contactEmailInput.fill(settings.contactEmail);
    }

    if (settings.supportPhone) {
      await this.supportPhoneInput.clear();
      await this.supportPhoneInput.fill(settings.supportPhone);
    }

    if (settings.timezone) {
      await this.timezoneSelect.click();
      await this.page.locator(`mat-option:has-text("${settings.timezone}")`).click();
    }

    if (settings.language) {
      await this.languageSelect.click();
      await this.page.locator(`mat-option:has-text("${settings.language}")`).click();
    }

    if (settings.dateFormat) {
      await this.dateFormatSelect.click();
      await this.page.locator(`mat-option:has-text("${settings.dateFormat}")`).click();
    }
  }

  async getFormValues() {
    return {
      siteName: await this.siteNameInput.inputValue(),
      siteDescription: await this.siteDescriptionInput.inputValue(),
      contactEmail: await this.contactEmailInput.inputValue(),
      supportPhone: await this.supportPhoneInput.inputValue(),
      timezone: await this.timezoneSelect.locator('.mat-select-value-text').textContent(),
      language: await this.languageSelect.locator('.mat-select-value-text').textContent(),
      dateFormat: await this.dateFormatSelect.locator('.mat-select-value-text').textContent(),
    };
  }
}

export class SecuritySettingsTab {
  readonly page: Page;
  readonly container: Locator;
  readonly passwordMinLengthInput: Locator;
  readonly passwordRequireUppercase: Locator;
  readonly passwordRequireNumbers: Locator;
  readonly passwordRequireSpecialChars: Locator;
  readonly sessionTimeoutInput: Locator;
  readonly maxLoginAttemptsInput: Locator;
  readonly enableTwoFactor: Locator;
  readonly enforceTwoFactor: Locator;
  readonly allowedDomainsInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('ax-security-settings');
    this.passwordMinLengthInput = this.container.locator('input[formControlName="passwordMinLength"]');
    this.passwordRequireUppercase = this.container.locator('mat-checkbox[formControlName="passwordRequireUppercase"]');
    this.passwordRequireNumbers = this.container.locator('mat-checkbox[formControlName="passwordRequireNumbers"]');
    this.passwordRequireSpecialChars = this.container.locator('mat-checkbox[formControlName="passwordRequireSpecialChars"]');
    this.sessionTimeoutInput = this.container.locator('input[formControlName="sessionTimeout"]');
    this.maxLoginAttemptsInput = this.container.locator('input[formControlName="maxLoginAttempts"]');
    this.enableTwoFactor = this.container.locator('mat-slide-toggle[formControlName="enableTwoFactor"]');
    this.enforceTwoFactor = this.container.locator('mat-slide-toggle[formControlName="enforceTwoFactor"]');
    this.allowedDomainsInput = this.container.locator('textarea[formControlName="allowedDomains"]');
  }

  async updateSecuritySettings(settings: {
    passwordMinLength?: number;
    passwordRequireUppercase?: boolean;
    passwordRequireNumbers?: boolean;
    passwordRequireSpecialChars?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
    enableTwoFactor?: boolean;
    enforceTwoFactor?: boolean;
    allowedDomains?: string;
  }) {
    if (settings.passwordMinLength !== undefined) {
      await this.passwordMinLengthInput.clear();
      await this.passwordMinLengthInput.fill(settings.passwordMinLength.toString());
    }

    if (settings.passwordRequireUppercase !== undefined) {
      const isChecked = await this.passwordRequireUppercase.isChecked();
      if (isChecked !== settings.passwordRequireUppercase) {
        await this.passwordRequireUppercase.click();
      }
    }

    if (settings.passwordRequireNumbers !== undefined) {
      const isChecked = await this.passwordRequireNumbers.isChecked();
      if (isChecked !== settings.passwordRequireNumbers) {
        await this.passwordRequireNumbers.click();
      }
    }

    if (settings.passwordRequireSpecialChars !== undefined) {
      const isChecked = await this.passwordRequireSpecialChars.isChecked();
      if (isChecked !== settings.passwordRequireSpecialChars) {
        await this.passwordRequireSpecialChars.click();
      }
    }

    if (settings.sessionTimeout !== undefined) {
      await this.sessionTimeoutInput.clear();
      await this.sessionTimeoutInput.fill(settings.sessionTimeout.toString());
    }

    if (settings.maxLoginAttempts !== undefined) {
      await this.maxLoginAttemptsInput.clear();
      await this.maxLoginAttemptsInput.fill(settings.maxLoginAttempts.toString());
    }

    if (settings.enableTwoFactor !== undefined) {
      const isChecked = await this.enableTwoFactor.isChecked();
      if (isChecked !== settings.enableTwoFactor) {
        await this.enableTwoFactor.click();
      }
    }

    if (settings.enforceTwoFactor !== undefined) {
      const isChecked = await this.enforceTwoFactor.isChecked();
      if (isChecked !== settings.enforceTwoFactor) {
        await this.enforceTwoFactor.click();
      }
    }

    if (settings.allowedDomains) {
      await this.allowedDomainsInput.clear();
      await this.allowedDomainsInput.fill(settings.allowedDomains);
    }
  }

  async getPasswordComplexityStatus(): Promise<string[]> {
    const requirements: string[] = [];
    
    if (await this.passwordRequireUppercase.isChecked()) {
      requirements.push('uppercase');
    }
    
    if (await this.passwordRequireNumbers.isChecked()) {
      requirements.push('numbers');
    }
    
    if (await this.passwordRequireSpecialChars.isChecked()) {
      requirements.push('special');
    }
    
    return requirements;
  }
}

export class NotificationSettingsTab {
  readonly page: Page;
  readonly container: Locator;
  readonly emailNotifications: Locator;
  readonly smsNotifications: Locator;
  readonly pushNotifications: Locator;
  readonly notificationToggles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('ax-notification-settings');
    this.emailNotifications = this.container.locator('mat-slide-toggle[formControlName="emailNotifications"]');
    this.smsNotifications = this.container.locator('mat-slide-toggle[formControlName="smsNotifications"]');
    this.pushNotifications = this.container.locator('mat-slide-toggle[formControlName="pushNotifications"]');
    this.notificationToggles = this.container.locator('mat-slide-toggle');
  }

  async toggleNotificationType(type: 'email' | 'sms' | 'push', enabled: boolean) {
    let toggle: Locator;
    
    switch (type) {
      case 'email':
        toggle = this.emailNotifications;
        break;
      case 'sms':
        toggle = this.smsNotifications;
        break;
      case 'push':
        toggle = this.pushNotifications;
        break;
    }

    const isChecked = await toggle.isChecked();
    if (isChecked !== enabled) {
      await toggle.click();
    }
  }

  async toggleNotificationCategory(category: string, enabled: boolean) {
    const categoryToggle = this.container.locator(`mat-slide-toggle[ng-reflect-name*="${category}"]`);
    const isChecked = await categoryToggle.isChecked();
    
    if (isChecked !== enabled) {
      await categoryToggle.click();
    }
  }

  async getEnabledNotificationTypes(): Promise<string[]> {
    const types: string[] = [];
    
    if (await this.emailNotifications.isChecked()) types.push('email');
    if (await this.smsNotifications.isChecked()) types.push('sms');
    if (await this.pushNotifications.isChecked()) types.push('push');
    
    return types;
  }
}

export class IntegrationSettingsTab {
  readonly page: Page;
  readonly container: Locator;
  readonly addIntegrationButton: Locator;
  readonly integrationCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('ax-integration-settings');
    this.addIntegrationButton = this.container.locator('button:has-text("Add Integration")');
    this.integrationCards = this.container.locator('.integration-card');
  }

  async addIntegration(name: string, apiKey: string, webhook?: string) {
    await this.addIntegrationButton.click();
    
    // Wait for dialog
    const dialog = this.page.locator('mat-dialog-container');
    await dialog.waitFor({ state: 'visible' });

    // Fill integration form
    await dialog.locator('input[formControlName="name"]').fill(name);
    await dialog.locator('input[formControlName="apiKey"]').fill(apiKey);
    
    if (webhook) {
      await dialog.locator('input[formControlName="webhookUrl"]').fill(webhook);
    }

    // Save
    await dialog.locator('button:has-text("Save")').click();
    await dialog.waitFor({ state: 'hidden' });
  }

  async removeIntegration(name: string) {
    const card = this.integrationCards.filter({ hasText: name });
    const removeButton = card.locator('button:has-text("Remove")');
    await removeButton.click();

    // Confirm removal
    const confirmDialog = this.page.locator('[role="alertdialog"]');
    await confirmDialog.locator('button:has-text("Confirm")').click();
  }

  async toggleIntegration(name: string, enabled: boolean) {
    const card = this.integrationCards.filter({ hasText: name });
    const toggle = card.locator('mat-slide-toggle');
    
    const isChecked = await toggle.isChecked();
    if (isChecked !== enabled) {
      await toggle.click();
    }
  }

  async getIntegrationCount(): Promise<number> {
    return await this.integrationCards.count();
  }
}

export class AppearanceSettingsTab {
  readonly page: Page;
  readonly container: Locator;
  readonly themeSelect: Locator;
  readonly primaryColorPicker: Locator;
  readonly accentColorPicker: Locator;
  readonly logoUpload: Locator;
  readonly faviconUpload: Locator;
  readonly customCssTextarea: Locator;
  readonly previewButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('ax-appearance-settings');
    this.themeSelect = this.container.locator('mat-select[formControlName="theme"]');
    this.primaryColorPicker = this.container.locator('input[formControlName="primaryColor"]');
    this.accentColorPicker = this.container.locator('input[formControlName="accentColor"]');
    this.logoUpload = this.container.locator('input[type="file"]#logo-upload');
    this.faviconUpload = this.container.locator('input[type="file"]#favicon-upload');
    this.customCssTextarea = this.container.locator('textarea[formControlName="customCss"]');
    this.previewButton = this.container.locator('button:has-text("Preview")');
    this.resetButton = this.container.locator('button:has-text("Reset")');
  }

  async selectTheme(theme: 'light' | 'dark' | 'auto') {
    await this.themeSelect.click();
    await this.page.locator(`mat-option:has-text("${theme}")`).click();
  }

  async setColors(primary: string, accent: string) {
    await this.primaryColorPicker.clear();
    await this.primaryColorPicker.fill(primary);
    
    await this.accentColorPicker.clear();
    await this.accentColorPicker.fill(accent);
  }

  async uploadLogo(filePath: string) {
    await this.logoUpload.setInputFiles(filePath);
  }

  async uploadFavicon(filePath: string) {
    await this.faviconUpload.setInputFiles(filePath);
  }

  async setCustomCSS(css: string) {
    await this.customCssTextarea.clear();
    await this.customCssTextarea.fill(css);
  }

  async previewChanges() {
    await this.previewButton.click();
  }

  async resetToDefaults() {
    await this.resetButton.click();
    
    // Confirm reset
    const confirmDialog = this.page.locator('[role="alertdialog"]');
    await confirmDialog.locator('button:has-text("Confirm")').click();
  }

  async getCurrentTheme(): Promise<string> {
    return await this.themeSelect.locator('.mat-select-value-text').textContent() || '';
  }
}