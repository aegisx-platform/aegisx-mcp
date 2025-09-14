const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('🖥️  BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('🚨 PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('🔴 REQUEST FAILED:', request.url(), request.failure().errorText));
  
  try {
    console.log('🔍 Starting Avatar Debug Test');
    
    // Go to the web app
    console.log('📍 Navigating to http://localhost:4200');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
    
    // Wait for login form
    console.log('👀 Waiting for login form');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Login
    console.log('🔐 Logging in');
    await page.fill('input[type="email"]', 'admin@aegisx.local');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    console.log('⏳ Waiting for dashboard');
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Wait a bit for profile to load
    console.log('⏳ Waiting for profile to load');
    await page.waitForTimeout(3000);
    
    // Check for avatar button
    console.log('🔍 Looking for avatar button');
    const avatarButtons = await page.locator('button[mat-icon-button]').all();
    console.log('📊 Found', avatarButtons.length, 'icon buttons');
    
    for (let i = 0; i < avatarButtons.length; i++) {
      const button = avatarButtons[i];
      const img = button.locator('img').first();
      const hasImg = await img.count() > 0;
      
      if (hasImg) {
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        console.log(`🖼️  Avatar button ${i}: src="${src}", alt="${alt}"`);
        
        // This is likely our avatar button
        if (src && (src.includes('avatar') || src.includes('default'))) {
          console.log('🎯 Found avatar button at index', i);
          
          // Click to open menu
          await button.click();
          await page.waitForTimeout(1000);
          
          // Check menu avatar
          const menuImg = page.locator('.mat-mdc-menu-content img').first();
          if (await menuImg.count() > 0) {
            const menuSrc = await menuImg.getAttribute('src');
            const menuAlt = await menuImg.getAttribute('alt');
            console.log(`🍔 Menu avatar: src="${menuSrc}", alt="${menuAlt}"`);
          }
          
          break;
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('✋ Keeping browser open for manual inspection...');
  console.log('Press Ctrl+C when done');
  
  // Keep browser open
  await new Promise(() => {});
})();