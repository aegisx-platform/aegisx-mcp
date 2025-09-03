import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { AuthHelper } from '../support/auth.helper';
import { VisualHelper } from '../support/visual.helper';
import { TEST_CREDENTIALS } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let visualHelper: VisualHelper;

  test.beforeEach(async ({ page: _page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    visualHelper = new VisualHelper(page);
  });

  test.describe('Login Functionality', () => {
    test('should display login form correctly', async ({ page: _page }) => {
      await loginPage.goto();

      // Verify form elements are present
      await loginPage.verifyLoginFormDisplayed();

      // Take visual snapshot
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('login-form-initial');

      // Verify accessibility
      await loginPage.verifyAccessibility();
    });

    test('should successfully login with valid credentials', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForSuccess(TEST_CREDENTIALS.admin);

      // Verify successful login
      await expect(page).toHaveURL(/\/(dashboard|home)/);
      await dashboardPage.verifyDashboardDisplayed();

      // Take screenshot of successful login
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('login-success-dashboard');
    });

    test('should show error for invalid credentials', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await loginPage.loginAndExpectError(TEST_CREDENTIALS.invalid);

      // Verify error message
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.toLowerCase()).toContain('invalid');

      // Take screenshot of error state
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('login-error-invalid-credentials');
    });

    test('should validate required fields', async ({ page: _page }) => {
      await loginPage.goto();

      // Try to submit empty form
      await loginPage.clickLogin();

      // Should show validation errors
      await loginPage.verifyErrorMessage();

      // Fill only email, leave password empty
      await loginPage.fillEmail('test@example.com');
      await loginPage.clickLogin();

      // Should still show error
      await loginPage.verifyErrorMessage();

      // Take screenshot of validation errors
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('login-validation-errors');
    });

    test('should validate email format', async ({ page: _page }) => {
      await loginPage.goto();

      // Enter invalid email format
      await loginPage.fillEmail('invalid-email');
      await loginPage.fillPassword('password123');
      await loginPage.clickLogin();

      // Should show email validation error
      await loginPage.verifyErrorMessage();

      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/email|valid/);
    });

    test('should handle remember me functionality', async ({ page: _page }) => {
      await loginPage.goto();

      // Login with remember me checked
      await loginPage.fillEmail(TEST_CREDENTIALS.admin.email);
      await loginPage.fillPassword(TEST_CREDENTIALS.admin.password);
      await loginPage.checkRememberMe(true);
      await loginPage.clickLogin();

      // Wait for successful login
      await expect(page).toHaveURL(/\/(dashboard|home)/);

      // Verify remember me was processed (this would depend on implementation)
      await loginPage.verifyRememberMeChecked(true);
    });

    test('should support keyboard navigation', async ({ page: _page }) => {
      await loginPage.goto();

      // Test tab navigation
      await loginPage.testKeyboardNavigation();

      // Test form submission with Enter key
      await loginPage.fillEmail(TEST_CREDENTIALS.admin.email);
      await loginPage.fillPassword(TEST_CREDENTIALS.admin.password);
      await loginPage.submitWithEnterKey();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(dashboard|home)/, { timeout: 10000 });
    });

    test.skip('should handle forgot password flow', async ({ page: _page }) => {
      await loginPage.goto();
      await loginPage.clickForgotPassword();

      // Should navigate to password reset page
      await expect(page).toHaveURL(/\/(forgot-password|reset-password)/);
    });
  });

  test.describe('Logout Functionality', () => {
    test.beforeEach(async ({ page: _page }) => {
      // Login before each logout test
      await authHelper.loginAsAdmin();
    });

    test('should successfully logout user', async ({ page: _page }) => {
      await dashboardPage.logout();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);

      // Verify user is no longer authenticated
      const isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBeFalsy();
    });

    test('should clear user session on logout', async ({ page: _page }) => {
      await dashboardPage.logout();

      // Try to access protected page directly
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Session Management', () => {
    test('should persist session across page refresh', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();

      // Refresh the page
      await page.reload();

      // Should still be authenticated
      const isAuth = await authHelper.isAuthenticated();
      expect(isAuth).toBeTruthy();

      // Should still be on dashboard
      await expect(page).toHaveURL(/\/(dashboard|home)/);
    });

    test('should handle session expiration', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();

      // Simulate session expiration by clearing tokens
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to access protected resource
      await page.goto('/profile');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect to intended page after login', async ({
      page: _page,
    }) => {
      // Try to access protected page while not authenticated
      await page.goto('/profile');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);

      // Login
      await loginPage.loginAndWaitForSuccess(TEST_CREDENTIALS.admin);

      // Should be redirected to originally requested page
      await expect(page).toHaveURL(/\/profile/, { timeout: 10000 });
    });
  });

  test.describe('Authentication Security', () => {
    test('should not expose sensitive information in URLs', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await loginPage.fillEmail(TEST_CREDENTIALS.admin.email);
      await loginPage.fillPassword(TEST_CREDENTIALS.admin.password);
      await loginPage.clickLogin();

      await expect(page).toHaveURL(/\/(dashboard|home)/);

      // URL should not contain sensitive data
      const url = page.url();
      expect(url).not.toContain('password');
      expect(url).not.toContain('token');
      expect(url).not.toContain(TEST_CREDENTIALS.admin.password);
    });

    test('should handle multiple failed login attempts', async ({
      page: _page,
    }) => {
      await loginPage.goto();

      // Attempt multiple failed logins
      for (let i = 0; i < 3; i++) {
        await loginPage.loginAndExpectError(TEST_CREDENTIALS.invalid);
        await page.waitForTimeout(1000); // Wait between attempts
      }

      // After multiple failures, should still show login form
      // (Rate limiting would be handled server-side)
      await loginPage.verifyLoginFormDisplayed();
    });

    test('should not store credentials in browser storage', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForSuccess(TEST_CREDENTIALS.admin);

      // Check that password is not stored in localStorage or sessionStorage
      const storageData = await page.evaluate(() => {
        const local = JSON.stringify(localStorage);
        const session = JSON.stringify(sessionStorage);
        return { local, session };
      });

      expect(storageData.local).not.toContain(TEST_CREDENTIALS.admin.password);
      expect(storageData.session).not.toContain(
        TEST_CREDENTIALS.admin.password,
      );
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match login page visual design', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test baseline appearance
      await visualHelper.compareScreenshot('login-page-baseline');
    });

    test('should test login page across different viewports', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test responsive design
      await visualHelper.testResponsiveDesign('login-page');
    });

    test('should test login page with different themes', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test theme variations
      await visualHelper.testThemeVariations('login-page', ['light', 'dark']);
    });

    test('should test form interaction states', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test various interaction states
      const interactions = [
        {
          name: 'email-focus',
          selector: 'input[type="email"]',
          action: 'focus' as const,
        },
        {
          name: 'password-focus',
          selector: 'input[type="password"]',
          action: 'focus' as const,
        },
        {
          name: 'submit-hover',
          selector: 'button[type="submit"]',
          action: 'hover' as const,
        },
      ];

      await visualHelper.testInteractionStates('login-form', interactions);
    });
  });

  test.describe('User Role Authentication', () => {
    test('should login admin user successfully', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();

      // Verify admin access
      const currentUser = await authHelper.getCurrentUser();
      expect(currentUser?.role).toBe('admin');
    });

    test('should login manager user successfully', async ({ page: _page }) => {
      await authHelper.loginAsManager();

      // Verify manager access
      const currentUser = await authHelper.getCurrentUser();
      expect(currentUser?.role).toBe('manager');
    });

    test('should login regular user successfully', async ({ page: _page }) => {
      await authHelper.loginAsUser();

      // Verify user access
      const currentUser = await authHelper.getCurrentUser();
      expect(currentUser?.role).toBe('user');
    });
  });
});
