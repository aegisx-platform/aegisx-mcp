import { test, expect } from '@playwright/test';

test('UI basic check', async ({ page, baseURL }) => {
  // Go to the web app
  await page.goto(baseURL || 'http://localhost:4203');

  // Take a screenshot
  await page.screenshot({ path: 'apps/e2e/screenshots/homepage.png' });

  // Check if page loads
  await expect(page).toHaveTitle(/AegisX/);
});
