import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProfilePage } from '../pages/profile.page';
import { NavigationPage } from '../pages/navigation.page';

test.describe('Avatar Display Tests', () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;
  let navigationPage: NavigationPage;

  const testCredentials = {
    email: 'admin@aegisx.local',
    password: 'Admin123!',
  };

  const expectedAvatarUrl = 'http://localhost:4200/api/uploads/avatars/2c9fe167-a9e0-4709-8e12-39e699d97754_95113282-dd26-4392-8cb1-1f9aa945d549.png';

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    navigationPage = new NavigationPage(page);
  });

  test.describe('Navigation Bar Avatar', () => {
    test('should display user avatar in navigation bar after login', async ({ page }) => {
      // Login with admin credentials
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      
      // Wait for dashboard to load
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000); // Allow time for user profile to load

      // Check that navigation bar contains user menu button
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      await expect(userMenuButton).toBeVisible();

      // Check for avatar image in the navigation bar
      const navigationAvatar = userMenuButton.locator('img');
      await expect(navigationAvatar).toBeVisible();

      // Verify avatar has correct styling (circular)
      await expect(navigationAvatar).toHaveCSS('border-radius', '50%');
      await expect(navigationAvatar).toHaveCSS('width', '32px');
      await expect(navigationAvatar).toHaveCSS('height', '32px');

      // Check if avatar URL is loaded (either actual avatar or default)
      const avatarSrc = await navigationAvatar.getAttribute('src');
      expect(avatarSrc).toBeTruthy();
      
      // Verify it's either the expected avatar or a fallback
      const isExpectedAvatar = avatarSrc === expectedAvatarUrl;
      const isDefaultAvatar = avatarSrc?.includes('/assets/images/avatars/default.png');
      
      expect(isExpectedAvatar || isDefaultAvatar).toBeTruthy();
    });

    test('should show avatar in user dropdown menu', async ({ page }) => {
      // Login and navigate to dashboard
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Click on user menu button
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      await userMenuButton.click();

      // Wait for menu to appear
      const userMenu = page.locator('mat-menu');
      await expect(userMenu).toBeVisible();

      // Check for avatar in the dropdown menu
      const dropdownAvatar = userMenu.locator('img');
      await expect(dropdownAvatar).toBeVisible();

      // Verify dropdown avatar styling
      await expect(dropdownAvatar).toHaveCSS('border-radius', '9999px'); // rounded-full class
      await expect(dropdownAvatar).toHaveCSS('width', '48px'); // w-12
      await expect(dropdownAvatar).toHaveCSS('height', '48px'); // h-12

      // Verify avatar source
      const dropdownAvatarSrc = await dropdownAvatar.getAttribute('src');
      expect(dropdownAvatarSrc).toBeTruthy();

      // Close menu
      await page.keyboard.press('Escape');
    });

    test('should handle avatar loading errors with fallback', async ({ page }) => {
      // Login first
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      
      // Intercept avatar requests and simulate 404 error
      await page.route('**/uploads/avatars/**', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'text/plain',
          body: 'Avatar not found',
        });
      });

      // Reload page to trigger avatar load error
      await page.reload();
      await page.waitForTimeout(2000);

      // Check that fallback is used
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navigationAvatar = userMenuButton.locator('img');
      
      await expect(navigationAvatar).toBeVisible();
      
      // Should fallback to default avatar
      const avatarSrc = await navigationAvatar.getAttribute('src');
      expect(avatarSrc).toContain('/assets/images/avatars/default.png');
    });
  });

  test.describe('Profile Page Avatar', () => {
    test('should display avatar on profile page', async ({ page }) => {
      // Login and navigate to profile
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');

      // Navigate to profile page
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Look for avatar upload component
      const avatarUploadComponent = page.locator('ax-avatar-upload');
      await expect(avatarUploadComponent).toBeVisible();

      // Check for avatar image within the component
      const profileAvatar = avatarUploadComponent.locator('img, .avatar, [data-testid="avatar"]');
      
      // The avatar should be visible (either actual image or placeholder)
      const avatarExists = await profileAvatar.count() > 0;
      expect(avatarExists).toBeTruthy();

      if (avatarExists) {
        const avatar = profileAvatar.first();
        await expect(avatar).toBeVisible();
        
        // Check avatar source
        const avatarSrc = await avatar.getAttribute('src');
        expect(avatarSrc).toBeTruthy();
      }
    });

    test('should show same avatar in both navigation and profile page', async ({ page }) => {
      // Login
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Get navigation avatar src
      const navUserMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navAvatar = navUserMenuButton.locator('img');
      const navAvatarSrc = await navAvatar.getAttribute('src');

      // Navigate to profile page
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Get profile avatar src
      const avatarUploadComponent = page.locator('ax-avatar-upload');
      const profileAvatarImg = avatarUploadComponent.locator('img').first();
      
      // Wait for profile avatar to load
      if (await profileAvatarImg.count() > 0) {
        const profileAvatarSrc = await profileAvatarImg.getAttribute('src');
        
        // Both should show the same image
        expect(navAvatarSrc).toEqual(profileAvatarSrc);
      }
    });
  });

  test.describe('Avatar Visual Testing', () => {
    test('should take visual snapshots of avatar display', async ({ page }) => {
      // Login
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Take screenshot of navigation bar with avatar
      const navBar = page.locator('.toolbar, .mat-toolbar, .navigation-header').first();
      await expect(navBar).toHaveScreenshot('navigation-avatar.png');

      // Open user menu and take screenshot
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      await userMenuButton.click();
      
      const userMenu = page.locator('mat-menu');
      await expect(userMenu).toBeVisible();
      await expect(userMenu).toHaveScreenshot('user-menu-avatar.png');

      // Close menu and go to profile page
      await page.keyboard.press('Escape');
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Take screenshot of profile avatar section
      const avatarSection = page.locator('ax-avatar-upload, .avatar-section, [data-testid="avatar-section"]').first();
      if (await avatarSection.count() > 0) {
        await expect(avatarSection).toHaveScreenshot('profile-avatar.png');
      }
    });
  });

  test.describe('Avatar Network Behavior', () => {
    test('should handle slow network loading gracefully', async ({ page }) => {
      // Slow down network requests for avatars
      await page.route('**/uploads/avatars/**', async (route) => {
        // Delay response by 3 seconds
        await page.waitForTimeout(3000);
        await route.continue();
      });

      // Login
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');

      // Navigation avatar should still be visible (even if loading)
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navigationAvatar = userMenuButton.locator('img');
      
      await expect(navigationAvatar).toBeVisible();
      
      // Should have some src (either loading or fallback)
      const avatarSrc = await navigationAvatar.getAttribute('src');
      expect(avatarSrc).toBeTruthy();
    });

    test('should verify avatar accessibility', async ({ page }) => {
      // Login
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Check navigation avatar accessibility
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navigationAvatar = userMenuButton.locator('img');
      
      // Should have alt text
      const altText = await navigationAvatar.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).toContain('User'); // Should contain "User" text

      // Check button has proper role
      await expect(userMenuButton).toHaveAttribute('role', 'button');
    });
  });

  test.describe('Avatar Error Handling', () => {
    test('should handle API errors gracefully when loading profile', async ({ page }) => {
      // Intercept profile API and return error
      await page.route('**/api/profile', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      // Login should still work
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Avatar should still be visible (fallback to token data or default)
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navigationAvatar = userMenuButton.locator('img');
      
      await expect(navigationAvatar).toBeVisible();
    });

    test('should handle missing avatar URL in profile data', async ({ page }) => {
      // Intercept profile API and return data without avatar
      await page.route('**/api/profile', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: '1',
              email: 'admin@aegisx.local',
              firstName: 'Admin',
              lastName: 'User',
              role: { name: 'admin', permissions: ['*.*'] },
              // No avatar field
            },
          }),
        });
      });

      // Login
      await loginPage.goto();
      await loginPage.login(testCredentials.email, testCredentials.password);
      await page.waitForURL('**/dashboard');
      await page.waitForTimeout(2000);

      // Should show default avatar
      const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]').first();
      const navigationAvatar = userMenuButton.locator('img');
      
      await expect(navigationAvatar).toBeVisible();
      
      const avatarSrc = await navigationAvatar.getAttribute('src');
      expect(avatarSrc).toContain('/assets/images/avatars/default.png');
    });
  });
});