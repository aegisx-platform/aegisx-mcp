import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import path from 'path';

const authFile = path.join(__dirname, '../fixtures/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Navigate to login page
  await page.goto('/');
  
  // Perform login with test user
  await loginPage.login('admin@aegisx.local', 'Admin123!');
  
  // Wait for authentication to complete
  await page.waitForURL('/dashboard');
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});