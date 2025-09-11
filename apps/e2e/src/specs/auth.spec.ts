import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test.use({ storageState: { cookies: [], origins: [] } }); // Use clean state for auth tests

  test('should display login form with all elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if redirected to login
    await expect(page).toHaveURL(/login/);
    
    // Verify all form elements are present
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toHaveText(/log in/i);
  });

  test('should show validation errors for empty fields', async () => {
    await loginPage.goto();
    
    // Click submit without filling fields
    await loginPage.submitButton.click();
    
    // Check for validation messages
    await expect(loginPage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(loginPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should show error for invalid email format', async () => {
    await loginPage.goto();
    
    // Enter invalid email
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('password123');
    await loginPage.emailInput.blur();
    
    // Check for email validation error
    const emailError = loginPage.page.locator('mat-error:has-text("valid email")');
    await expect(emailError).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.goto();
    
    // Try login with invalid credentials
    await loginPage.login('wrong@email.com', 'wrongpassword');
    
    // Wait for error message
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid credentials');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.goto();
    
    // Login with valid credentials
    await loginPage.login('admin@aegisx.local', 'Admin123!');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify user is logged in - check for user menu
    const userMenu = page.locator('button[aria-label*="user menu"]');
    await expect(userMenu).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page, context }) => {
    await loginPage.goto();
    
    // Login
    await loginPage.login('admin@aegisx.local', 'Admin123!');
    await expect(page).toHaveURL(/dashboard/);
    
    // Save cookies
    const cookies = await context.cookies();
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify cookies are present
    const newCookies = await context.cookies();
    const authCookie = newCookies.find(c => c.name === 'refreshToken');
    expect(authCookie).toBeDefined();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await loginPage.goto();
    await loginPage.login('admin@aegisx.local', 'Admin123!');
    await expect(page).toHaveURL(/dashboard/);
    
    // Click user menu
    const userMenuButton = page.locator('button[matMenuTriggerFor="userMenu"]');
    await userMenuButton.click();
    
    // Click logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect back to login
    await expect(page).toHaveURL(/login/);
  });

  test('should handle session timeout', async ({ page, context }) => {
    await loginPage.goto();
    await loginPage.login('admin@aegisx.local', 'Admin123!');
    await expect(page).toHaveURL(/dashboard/);
    
    // Clear auth cookies to simulate session timeout
    await context.clearCookies();
    
    // Try to navigate to another page
    await page.goto('/users');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should remember user after checking "Remember me"', async ({ page }) => {
    await loginPage.goto();
    
    // Check if remember me checkbox exists
    const rememberMe = page.locator('mat-checkbox[formControlName="rememberMe"]');
    if (await rememberMe.count() > 0) {
      await rememberMe.check();
    }
    
    // Login
    await loginPage.login('admin@aegisx.local', 'Admin123!');
    await expect(page).toHaveURL(/dashboard/);
    
    // Check localStorage for remembered user
    const rememberedEmail = await page.evaluate(() => {
      return localStorage.getItem('rememberedEmail');
    });
    
    if (await rememberMe.count() > 0) {
      expect(rememberedEmail).toBe('admin@aegisx.local');
    }
  });

  test('should handle concurrent login attempts', async ({ page, context }) => {
    // Open two pages
    const page1 = page;
    const page2 = await context.newPage();
    
    const loginPage1 = new LoginPage(page1);
    const loginPage2 = new LoginPage(page2);
    
    // Navigate both to login
    await loginPage1.goto();
    await loginPage2.goto();
    
    // Login on first page
    await loginPage1.login('admin@aegisx.local', 'Admin123!');
    await expect(page1).toHaveURL(/dashboard/);
    
    // Second page should also be able to access protected routes
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL(/dashboard/);
    
    await page2.close();
  });
});