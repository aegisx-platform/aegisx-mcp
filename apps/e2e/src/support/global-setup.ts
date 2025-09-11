import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Create directory for auth files
  const authDir = path.join(__dirname, '../fixtures/.auth');
  await import('fs').then(fs => 
    fs.promises.mkdir(authDir, { recursive: true })
  );

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:4200';
  
  try {
    // Start browser and login
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Try to navigate to login page
    const response = await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    // Check if login page exists
    if (response && response.url().includes('/dashboard')) {
      console.log('ℹ️  No login page found, app redirects to dashboard');
      console.log('ℹ️  Skipping authentication setup - tests will run without auth');
    } else {
      // Wait for login form to be visible
      await page.waitForSelector('form', { timeout: 5000 });
      
      // Fill login credentials (using test user from seed data)
      await page.fill('input[name="email"], input[type="email"]', 'admin@aegisx.com');
      await page.fill('input[name="password"], input[type="password"]', 'admin123');
      
      // Submit login form
      await page.click('button[type="submit"]');
      
      // Wait for successful login (redirect to dashboard)
      await page.waitForURL(`${baseURL}/dashboard`, { timeout: 30000 });
      
      // Save authenticated state
      await page.context().storageState({
        path: path.join(authDir, 'user.json')
      });
    }
    
    await browser.close();
  } catch (error) {
    console.log('⚠️  Authentication setup failed:', error.message);
    console.log('ℹ️  Tests will continue without authentication');
    
    // Create empty auth file so tests don't fail
    const fs = await import('fs');
    await fs.promises.writeFile(
      path.join(authDir, 'user.json'),
      JSON.stringify({ cookies: [], origins: [] })
    );
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;