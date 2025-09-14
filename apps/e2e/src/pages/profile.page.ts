import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { TestUserProfile } from '../fixtures/test-data';

/**
 * User Profile Page Object Model
 * Handles user profile viewing and editing functionality
 */
export class ProfilePage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main profile container
    profile: '[data-testid="profile"], .profile, .user-profile',
    profileHeader: '[data-testid="profile-header"], .profile-header',
    profileContent: '[data-testid="profile-content"], .profile-content',
    
    // Avatar section (enhanced for actual implementation)
    avatarSection: '[data-testid="avatar-section"], .avatar-section, ax-avatar-upload',
    avatar: '[data-testid="avatar"], .avatar, .profile-avatar, ax-avatar-upload img',
    avatarUpload: '[data-testid="avatar-upload"], input[type="file"]',
    avatarUploadButton: '[data-testid="avatar-upload-btn"], .avatar-upload-btn, ax-avatar-upload button',
    avatarPreview: '[data-testid="avatar-preview"], .avatar-preview',
    avatarComponent: 'ax-avatar-upload',
    avatarImage: 'ax-avatar-upload img, ax-avatar-upload .avatar-image',
    avatarPlaceholder: 'ax-avatar-upload .avatar-placeholder, ax-avatar-upload mat-icon',
    
    // Profile form
    profileForm: '[data-testid="profile-form"], .profile-form, form',
    firstNameInput: '[data-testid="first-name"], input[name="firstName"]',
    lastNameInput: '[data-testid="last-name"], input[name="lastName"]',
    emailInput: '[data-testid="email"], input[name="email"]',
    phoneInput: '[data-testid="phone"], input[name="phone"]',
    bioInput: '[data-testid="bio"], textarea[name="bio"]',
    
    // Settings
    timezoneSelect: '[data-testid="timezone"], select[name="timezone"]',
    languageSelect: '[data-testid="language"], select[name="language"]',
    themeSelect: '[data-testid="theme"], select[name="theme"]',
    
    // Action buttons
    editButton: '[data-testid="edit-btn"], .edit-btn, [aria-label*="edit"]',
    saveButton: '[data-testid="save-btn"], .save-btn, button[type="submit"]',
    cancelButton: '[data-testid="cancel-btn"], .cancel-btn',
    
    // Profile sections
    personalInfoSection: '[data-testid="personal-info"], .personal-info',
    contactInfoSection: '[data-testid="contact-info"], .contact-info',
    preferencesSection: '[data-testid="preferences"], .preferences',
    
    // Display mode (read-only)
    displayName: '[data-testid="display-name"], .display-name',
    displayEmail: '[data-testid="display-email"], .display-email',
    displayPhone: '[data-testid="display-phone"], .display-phone',
    displayBio: '[data-testid="display-bio"], .display-bio',
    displayTimezone: '[data-testid="display-timezone"], .display-timezone',
    displayLanguage: '[data-testid="display-language"], .display-language',
    displayTheme: '[data-testid="display-theme"], .display-theme',
    
    // Loading and success states
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    successMessage: '[data-testid="success"], .success, .alert-success',
    errorMessage: '[data-testid="error"], .error, .alert-error',
    
    // Validation messages
    validationError: '.field-error, .validation-error, .form-error',
    
    // Tab navigation (if profile has tabs)
    tabNavigation: '[data-testid="profile-tabs"], .profile-tabs, .tabs',
    tabButton: '[data-testid="tab-btn"], .tab-btn, .tab',
    tabContent: '[data-testid="tab-content"], .tab-content, .tab-pane',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to profile page
   */
  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.waitForLoad();
  }

  /**
   * Wait for profile page to be loaded
   */
  async waitForLoad(): Promise<void> {
    await this.waitForElement(this.selectors.profile);
    await this.waitForLoadingComplete();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    const loadingExists = await this.elementExists(this.selectors.loadingSpinner);
    if (loadingExists) {
      await this.waitForElementHidden(this.selectors.loadingSpinner);
    }
  }

  /**
   * Enter edit mode
   */
  async enterEditMode(): Promise<void> {
    if (await this.elementExists(this.selectors.editButton)) {
      await this.clickElement(this.selectors.editButton);
      await this.waitForElement(this.selectors.profileForm);
    }
  }

  /**
   * Exit edit mode (cancel)
   */
  async cancelEdit(): Promise<void> {
    if (await this.elementExists(this.selectors.cancelButton)) {
      await this.clickElement(this.selectors.cancelButton);
    }
  }

  /**
   * Save profile changes
   */
  async saveProfile(): Promise<void> {
    await this.clickElement(this.selectors.saveButton);
    await this.waitForSaveComplete();
  }

  /**
   * Wait for save operation to complete
   */
  async waitForSaveComplete(): Promise<void> {
    // Wait for loading to disappear
    await this.waitForLoadingComplete();
    
    // Check for success or error message
    try {
      await this.waitForElement(this.selectors.successMessage, 5000);
    } catch {
      // If no success message, check if we're back in view mode
      const editModeActive = await this.isInEditMode();
      if (editModeActive) {
        // Still in edit mode, might be validation error
        await this.waitForElement(this.selectors.errorMessage, 5000);
      }
    }
  }

  /**
   * Check if currently in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.elementExists(this.selectors.saveButton);
  }

  /**
   * Fill profile form with data
   */
  async fillProfileForm(profileData: Partial<TestUserProfile>): Promise<void> {
    if (profileData.firstName && await this.elementExists(this.selectors.firstNameInput)) {
      await this.fillInput(this.selectors.firstNameInput, profileData.firstName);
    }
    
    if (profileData.lastName && await this.elementExists(this.selectors.lastNameInput)) {
      await this.fillInput(this.selectors.lastNameInput, profileData.lastName);
    }
    
    if (profileData.email && await this.elementExists(this.selectors.emailInput)) {
      await this.fillInput(this.selectors.emailInput, profileData.email);
    }
    
    if (profileData.phone && await this.elementExists(this.selectors.phoneInput)) {
      await this.fillInput(this.selectors.phoneInput, profileData.phone);
    }
    
    if (profileData.bio && await this.elementExists(this.selectors.bioInput)) {
      await this.fillInput(this.selectors.bioInput, profileData.bio);
    }
    
    if (profileData.timezone && await this.elementExists(this.selectors.timezoneSelect)) {
      await this.selectOption(this.selectors.timezoneSelect, profileData.timezone);
    }
    
    if (profileData.language && await this.elementExists(this.selectors.languageSelect)) {
      await this.selectOption(this.selectors.languageSelect, profileData.language);
    }
    
    if (profileData.theme && await this.elementExists(this.selectors.themeSelect)) {
      await this.selectOption(this.selectors.themeSelect, profileData.theme);
    }
  }

  /**
   * Update profile with data
   */
  async updateProfile(profileData: Partial<TestUserProfile>): Promise<void> {
    await this.enterEditMode();
    await this.fillProfileForm(profileData);
    await this.saveProfile();
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(imagePath: string): Promise<void> {
    if (await this.elementExists(this.selectors.avatarUpload)) {
      // Direct file input
      await this.page.setInputFiles(this.selectors.avatarUpload, imagePath);
    } else if (await this.elementExists(this.selectors.avatarUploadButton)) {
      // Click upload button first
      await this.clickElement(this.selectors.avatarUploadButton);
      await this.page.setInputFiles(this.selectors.avatarUpload, imagePath);
    }
    
    // Wait for upload to complete
    await this.waitForLoadingComplete();
  }

  /**
   * Get current profile data
   */
  async getProfileData(): Promise<TestUserProfile> {
    const profileData: TestUserProfile = {
      firstName: '',
      lastName: '',
      email: '',
    };
    
    if (await this.isInEditMode()) {
      // Get data from form inputs
      if (await this.elementExists(this.selectors.firstNameInput)) {
        profileData.firstName = await this.page.locator(this.selectors.firstNameInput).inputValue();
      }
      
      if (await this.elementExists(this.selectors.lastNameInput)) {
        profileData.lastName = await this.page.locator(this.selectors.lastNameInput).inputValue();
      }
      
      if (await this.elementExists(this.selectors.emailInput)) {
        profileData.email = await this.page.locator(this.selectors.emailInput).inputValue();
      }
      
      if (await this.elementExists(this.selectors.phoneInput)) {
        profileData.phone = await this.page.locator(this.selectors.phoneInput).inputValue();
      }
      
      if (await this.elementExists(this.selectors.bioInput)) {
        profileData.bio = await this.page.locator(this.selectors.bioInput).inputValue();
      }
    } else {
      // Get data from display elements
      if (await this.elementExists(this.selectors.displayName)) {
        const fullName = await this.getElementText(this.selectors.displayName);
        const nameParts = fullName.split(' ');
        profileData.firstName = nameParts[0] || '';
        profileData.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      if (await this.elementExists(this.selectors.displayEmail)) {
        profileData.email = await this.getElementText(this.selectors.displayEmail);
      }
      
      if (await this.elementExists(this.selectors.displayPhone)) {
        profileData.phone = await this.getElementText(this.selectors.displayPhone);
      }
      
      if (await this.elementExists(this.selectors.displayBio)) {
        profileData.bio = await this.getElementText(this.selectors.displayBio);
      }
    }
    
    return profileData;
  }

  /**
   * Verify profile data is displayed correctly
   */
  async verifyProfileData(expectedData: Partial<TestUserProfile>): Promise<void> {
    if (expectedData.firstName || expectedData.lastName) {
      const expectedName = `${expectedData.firstName || ''} ${expectedData.lastName || ''}`.trim();
      if (await this.elementExists(this.selectors.displayName)) {
        await this.verifyElementText(this.selectors.displayName, expectedName);
      }
    }
    
    if (expectedData.email && await this.elementExists(this.selectors.displayEmail)) {
      await this.verifyElementText(this.selectors.displayEmail, expectedData.email);
    }
    
    if (expectedData.phone && await this.elementExists(this.selectors.displayPhone)) {
      await this.verifyElementText(this.selectors.displayPhone, expectedData.phone);
    }
    
    if (expectedData.bio && await this.elementExists(this.selectors.displayBio)) {
      await this.verifyElementText(this.selectors.displayBio, expectedData.bio);
    }
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(expectedMessage?: string): Promise<void> {
    await this.verifyElementVisible(this.selectors.successMessage);
    
    if (expectedMessage) {
      await this.verifyElementContainsText(this.selectors.successMessage, expectedMessage);
    }
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    await this.verifyElementVisible(this.selectors.errorMessage);
    
    if (expectedMessage) {
      await this.verifyElementContainsText(this.selectors.errorMessage, expectedMessage);
    }
  }

  /**
   * Verify validation errors
   */
  async verifyValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    if (await this.elementExists(this.selectors.validationError)) {
      const errorElements = this.page.locator(this.selectors.validationError);
      const count = await errorElements.count();
      
      for (let i = 0; i < count; i++) {
        const errorText = await errorElements.nth(i).textContent() ?? '';
        errors.push(errorText.trim());
      }
    }
    
    return errors;
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    const inputs = [
      this.selectors.firstNameInput,
      this.selectors.lastNameInput,
      this.selectors.emailInput,
      this.selectors.phoneInput,
      this.selectors.bioInput,
    ];
    
    for (const selector of inputs) {
      if (await this.elementExists(selector)) {
        await this.fillInput(selector, '', { clear: true });
      }
    }
  }

  /**
   * Switch to profile tab
   */
  async switchToTab(tabName: string): Promise<void> {
    if (await this.elementExists(this.selectors.tabNavigation)) {
      const tab = this.page.locator(this.selectors.tabButton)
        .filter({ hasText: tabName });
      
      await tab.click();
      await this.page.waitForTimeout(300); // Wait for tab animation
    }
  }

  /**
   * Verify profile form is displayed
   */
  async verifyProfileFormDisplayed(): Promise<void> {
    await this.verifyElementVisible(this.selectors.profileForm);
    await this.verifyElementVisible(this.selectors.firstNameInput);
    await this.verifyElementVisible(this.selectors.lastNameInput);
    await this.verifyElementVisible(this.selectors.emailInput);
  }

  /**
   * Verify profile display mode
   */
  async verifyProfileDisplayMode(): Promise<void> {
    const isEditMode = await this.isInEditMode();
    expect(isEditMode).toBeFalsy();
    
    if (await this.elementExists(this.selectors.displayName)) {
      await this.verifyElementVisible(this.selectors.displayName);
    }
  }

  /**
   * Test profile form validation
   */
  async testFormValidation(): Promise<void> {
    await this.enterEditMode();
    
    // Clear required fields
    await this.fillInput(this.selectors.firstNameInput, '');
    await this.fillInput(this.selectors.emailInput, '');
    
    // Try to save
    await this.saveProfile();
    
    // Should show validation errors
    const errors = await this.verifyValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  }

  /**
   * Test email format validation
   */
  async testEmailValidation(): Promise<void> {
    await this.enterEditMode();
    
    // Enter invalid email
    await this.fillInput(this.selectors.emailInput, 'invalid-email');
    await this.saveProfile();
    
    // Should show email validation error
    const errors = await this.verifyValidationErrors();
    const hasEmailError = errors.some(error => 
      error.toLowerCase().includes('email') || 
      error.toLowerCase().includes('valid')
    );
    
    expect(hasEmailError).toBeTruthy();
  }

  /**
   * Take profile screenshot
   */
  async takeProfileScreenshot(name = 'profile'): Promise<void> {
    await this.screenshot(name, { fullPage: true });
  }

  /**
   * Take profile form screenshot
   */
  async takeProfileFormScreenshot(name = 'profile-form'): Promise<void> {
    await this.enterEditMode();
    await this.screenshot(name, { fullPage: true });
  }

  /**
   * Avatar-specific methods
   */

  /**
   * Get avatar component
   */
  async getAvatarComponent() {
    return this.page.locator(this.selectors.avatarComponent);
  }

  /**
   * Check if avatar is displayed
   */
  async isAvatarDisplayed(): Promise<boolean> {
    const avatarComponent = await this.getAvatarComponent();
    if (!(await avatarComponent.isVisible())) {
      return false;
    }

    // Check if image is displayed
    const avatarImage = avatarComponent.locator('img');
    return await avatarImage.isVisible();
  }

  /**
   * Get avatar source URL
   */
  async getAvatarSrc(): Promise<string | null> {
    const avatarComponent = await this.getAvatarComponent();
    const avatarImage = avatarComponent.locator('img');
    
    if (await avatarImage.isVisible()) {
      return await avatarImage.getAttribute('src');
    }
    
    return null;
  }

  /**
   * Verify avatar is circular
   */
  async verifyAvatarIsCircular(): Promise<void> {
    const avatarComponent = await this.getAvatarComponent();
    const avatarImage = avatarComponent.locator('img');
    
    await expect(avatarImage).toBeVisible();
    
    // Check for circular styling
    const borderRadius = await avatarImage.evaluate(el => 
      getComputedStyle(el).borderRadius
    );
    
    // Should be either 50% or a large enough value to make it circular
    const isCircular = borderRadius === '50%' || 
                      borderRadius.includes('9999px') || 
                      borderRadius.includes('999px');
    
    expect(isCircular).toBeTruthy();
  }

  /**
   * Verify avatar has fallback behavior
   */
  async verifyAvatarFallback(): Promise<void> {
    const avatarComponent = await this.getAvatarComponent();
    
    // Should show either image or placeholder
    const hasImage = await avatarComponent.locator('img').isVisible();
    const hasPlaceholder = await avatarComponent.locator(this.selectors.avatarPlaceholder).isVisible();
    
    expect(hasImage || hasPlaceholder).toBeTruthy();
  }

  /**
   * Take avatar screenshot
   */
  async takeAvatarScreenshot(name = 'profile-avatar'): Promise<void> {
    const avatarComponent = await this.getAvatarComponent();
    await expect(avatarComponent).toHaveScreenshot(`${name}.png`);
  }

  /**
   * Verify profile info section
   */
  async verifyProfileInfoSection(): Promise<void> {
    // Check that profile info component exists
    const profileInfo = this.page.locator('ax-profile-info');
    await expect(profileInfo).toBeVisible();

    // Verify avatar component exists within profile info
    const avatarInProfile = profileInfo.locator('ax-avatar-upload');
    await expect(avatarInProfile).toBeVisible();
  }
}