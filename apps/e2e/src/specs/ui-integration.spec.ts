import { test, expect } from '@playwright/test';

test.describe('UI Integration Tests', () => {
  test.beforeEach(async ({ page: _page }) => {
    await page.goto('/');
  });

  test('should load the application with proper styling', async ({
    page: _page,
  }) => {
    // Check if the page loads
    await expect(page).toHaveTitle('AegisX Platform');

    // Check if Angular Material styles are loaded
    const body = await page.locator('body');
    await expect(body).toHaveClass(/mat-typography/);

    // Check if the root component is rendered
    const rootComponent = await page.locator('ax-root');
    await expect(rootComponent).toBeVisible();
  });

  test('should display the dashboard page with proper layout', async ({
    page: _page,
  }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Check if the dashboard title is visible
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();

    // Check if the statistics cards are displayed
    const statsCards = await page.locator('ax-card');
    await expect(statsCards).toHaveCount(4); // 4 stat cards

    // Check if Total Users card has proper styling
    const totalUsersCard = await page.locator(
      'ax-card:has-text("Total Users")',
    );
    await expect(totalUsersCard).toBeVisible();

    // Check if the value is displayed
    const userCount = await page.locator('text=1,234');
    await expect(userCount).toBeVisible();
  });

  test('should have working navigation sidebar', async ({ page: _page }) => {
    // Check if navigation sidebar exists
    const navigation = await page.locator('ax-navigation');
    await expect(navigation).toBeVisible();

    // Check if navigation items are visible
    const dashboardLink = await page.locator('a:has-text("Dashboard")');
    await expect(dashboardLink).toBeVisible();

    // Check if Features group is visible
    const featuresGroup = await page.locator('text=Features');
    await expect(featuresGroup).toBeVisible();
  });

  test('should navigate to component showcase pages', async ({
    page: _page,
  }) => {
    // Navigate to buttons page
    await page.goto('/components/buttons');
    await expect(
      page.locator('h1:has-text("Button Components")'),
    ).toBeVisible();

    // Check if button examples are displayed
    const basicButton = await page.locator('button:has-text("Basic")').first();
    await expect(basicButton).toBeVisible();

    // Navigate to cards page
    await page.goto('/components/cards');
    await expect(page.locator('h1:has-text("Card Components")')).toBeVisible();

    // Navigate to forms page
    await page.goto('/components/forms');
    await expect(page.locator('h1:has-text("Form Components")')).toBeVisible();

    // Navigate to tables page
    await page.goto('/components/tables');
    await expect(page.locator('h1:has-text("Table Components")')).toBeVisible();
  });

  test('should display Material Design components with proper styling', async ({
    page: _page,
  }) => {
    await page.goto('/components/buttons');

    // Check Material button classes
    const matButton = await page.locator('.mat-mdc-button').first();
    await expect(matButton).toBeVisible();

    // Check raised button
    const raisedButton = await page.locator('.mat-mdc-raised-button').first();
    await expect(raisedButton).toBeVisible();

    // Check if Material icons are rendered
    const matIcon = await page.locator('mat-icon').first();
    await expect(matIcon).toBeVisible();
  });

  test('should have responsive layout', async ({ page: _page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');

    // Check if grid layout works on desktop
    const statsGrid = await page.locator('.grid');
    await expect(statsGrid).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if layout adjusts for mobile
    const mobileGrid = await page.locator('.grid-cols-1');
    await expect(mobileGrid).toBeVisible();
  });

  test('should display alerts with proper styling', async ({ page: _page }) => {
    await page.goto('/dashboard');

    // Check if alert component is displayed
    const alert = await page.locator('ax-alert');
    await expect(alert).toBeVisible();

    // Check alert content
    const alertText = await page.locator('text=Welcome to AegisX Platform');
    await expect(alertText).toBeVisible();
  });

  test('should have working form controls', async ({ page: _page }) => {
    await page.goto('/components/forms');

    // Check text input
    const nameInput = await page.locator('input[formControlName="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test User');
    await expect(nameInput).toHaveValue('Test User');

    // Check select dropdown
    const countrySelect = await page.locator(
      'mat-select[formControlName="country"]',
    );
    await expect(countrySelect).toBeVisible();

    // Check checkbox
    const checkbox = await page.locator('mat-checkbox').first();
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });

  test('should display tables with sorting and pagination', async ({
    page: _page,
  }) => {
    await page.goto('/components/tables');

    // Check if table is displayed
    const table = await page.locator('table').first();
    await expect(table).toBeVisible();

    // Check if table headers are displayed
    const tableHeaders = await page.locator('th');
    await expect(tableHeaders.first()).toBeVisible();

    // Check if paginator is displayed
    const paginator = await page.locator('mat-paginator');
    await expect(paginator).toBeVisible();
  });

  test('should capture visual screenshots', async ({ page: _page }) => {
    // Dashboard screenshot
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'apps/e2e/screenshots/dashboard.png',
      fullPage: true,
    });

    // Buttons page screenshot
    await page.goto('/components/buttons');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'apps/e2e/screenshots/buttons.png',
      fullPage: true,
    });

    // Forms page screenshot
    await page.goto('/components/forms');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'apps/e2e/screenshots/forms.png',
      fullPage: true,
    });
  });
});
