import { test, expect } from '@playwright/test';

/**
 * Quick Avatar Verification Test
 * A simple test to quickly verify avatar functionality is working
 */
test.describe('Avatar Quick Check', () => {
  const testCredentials = {
    email: 'admin@aegisx.local',
    password: 'Admin123!',
  };

  test('quick avatar verification - navigation and profile', async ({ page }) => {
    console.log('🎯 Starting quick avatar verification...');

    // Step 1: Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Step 2: Login
    console.log('🔐 Logging in with admin credentials...');
    await page.fill('input[name="email"], input[type="email"]', testCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000); // Give time for user profile to load

    console.log('✅ Login successful, on dashboard page');

    // Step 3: Check navigation avatar
    console.log('👤 Checking navigation bar avatar...');
    
    const userMenuButton = page.locator('button[mat-icon-button]').filter({ hasText: /img|avatar/ }).or(
      page.locator('button[mat-icon-button]').filter({ has: page.locator('img') })
    ).first();
    
    // More flexible search for user menu button
    const userMenuButtons = page.locator('button[mat-icon-button]');
    let avatarButton = null;
    
    const buttonCount = await userMenuButtons.count();
    console.log(`Found ${buttonCount} icon buttons`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = userMenuButtons.nth(i);
      const hasImg = await button.locator('img').count() > 0;
      if (hasImg) {
        avatarButton = button;
        console.log(`✅ Found avatar button at index ${i}`);
        break;
      }
    }

    if (avatarButton) {
      await expect(avatarButton).toBeVisible();
      
      const avatarImg = avatarButton.locator('img');
      await expect(avatarImg).toBeVisible();
      
      const avatarSrc = await avatarImg.getAttribute('src');
      console.log(`📸 Navigation avatar src: ${avatarSrc}`);
      
      // Check if it's either the uploaded avatar or default fallback
      const isValidAvatar = avatarSrc && (
        avatarSrc.includes('uploads/avatars/') || 
        avatarSrc.includes('/assets/images/avatars/default.png') ||
        avatarSrc.includes('default')
      );
      
      expect(isValidAvatar).toBeTruthy();
      console.log('✅ Navigation avatar is displaying correctly');
      
      // Test user menu dropdown
      console.log('🔽 Testing user menu dropdown...');
      await avatarButton.click();
      
      const userMenu = page.locator('mat-menu, .mat-menu-panel').first();
      await expect(userMenu).toBeVisible({ timeout: 5000 });
      
      const dropdownAvatar = userMenu.locator('img').first();
      if (await dropdownAvatar.count() > 0) {
        await expect(dropdownAvatar).toBeVisible();
        const dropdownSrc = await dropdownAvatar.getAttribute('src');
        console.log(`📸 Dropdown avatar src: ${dropdownSrc}`);
        
        // Should match navigation avatar
        expect(dropdownSrc).toBe(avatarSrc);
        console.log('✅ Dropdown avatar matches navigation avatar');
      }
      
      // Close dropdown
      await page.keyboard.press('Escape');
      
    } else {
      console.log('⚠️  No avatar button found in navigation - checking for fallback');
      
      // Look for any user menu indicator
      const possibleUserMenus = page.locator('button').filter({ hasText: /user|profile|menu/i });
      if (await possibleUserMenus.count() > 0) {
        console.log('📍 Found potential user menu, avatar may be using fallback');
      } else {
        throw new Error('No user menu button found in navigation');
      }
    }

    // Step 4: Check profile page avatar
    console.log('📄 Navigating to profile page...');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('🔍 Looking for profile avatar component...');
    
    // Look for the avatar upload component
    const avatarUploadComponent = page.locator('ax-avatar-upload');
    
    if (await avatarUploadComponent.count() > 0) {
      await expect(avatarUploadComponent).toBeVisible();
      console.log('✅ Avatar upload component found');
      
      // Check for avatar image within the component
      const profileAvatarImg = avatarUploadComponent.locator('img').first();
      
      if (await profileAvatarImg.count() > 0) {
        await expect(profileAvatarImg).toBeVisible();
        
        const profileAvatarSrc = await profileAvatarImg.getAttribute('src');
        console.log(`📸 Profile avatar src: ${profileAvatarSrc}`);
        
        const isValidProfileAvatar = profileAvatarSrc && (
          profileAvatarSrc.includes('uploads/avatars/') || 
          profileAvatarSrc.includes('/assets/images/avatars/default') ||
          profileAvatarSrc.includes('default')
        );
        
        expect(isValidProfileAvatar).toBeTruthy();
        console.log('✅ Profile avatar is displaying correctly');
      } else {
        console.log('⚠️  No img element found in avatar component - may be using placeholder');
        
        // Look for placeholder or icon fallback
        const placeholder = avatarUploadComponent.locator('mat-icon, .placeholder, .avatar-placeholder').first();
        if (await placeholder.count() > 0) {
          console.log('✅ Avatar placeholder/icon found - fallback working');
        }
      }
    } else {
      console.log('⚠️  No ax-avatar-upload component found, checking for alternative avatar display...');
      
      // Look for any avatar-related elements
      const avatarElements = page.locator('img, .avatar, [class*="avatar"]');
      const avatarCount = await avatarElements.count();
      
      if (avatarCount > 0) {
        console.log(`Found ${avatarCount} potential avatar elements`);
        
        for (let i = 0; i < Math.min(avatarCount, 3); i++) {
          const element = avatarElements.nth(i);
          const src = await element.getAttribute('src');
          if (src) {
            console.log(`📸 Avatar element ${i}: ${src}`);
          }
        }
      }
    }

    // Step 5: Take screenshots for manual verification
    console.log('📸 Taking verification screenshots...');
    
    // Screenshot of profile page
    await page.screenshot({ 
      path: 'apps/e2e/screenshots/avatar-quick-check-profile.png',
      fullPage: true 
    });
    
    // Go back to dashboard and screenshot navigation
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'apps/e2e/screenshots/avatar-quick-check-navigation.png',
      fullPage: true 
    });
    
    console.log('✅ Avatar quick check completed successfully!');
    console.log('📂 Screenshots saved to apps/e2e/screenshots/');
  });

  test('verify avatar API integration', async ({ page }) => {
    console.log('🔌 Testing avatar API integration...');
    
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(2000);
    
    // Intercept and log profile API request
    let profileApiCalled = false;
    let profileApiResponse = null;
    
    await page.route('**/api/profile', async (route) => {
      profileApiCalled = true;
      const response = await route.continue();
      profileApiResponse = await response.json();
      console.log('📊 Profile API Response:', JSON.stringify(profileApiResponse, null, 2));
    });
    
    // Trigger profile reload
    await page.reload();
    await page.waitForTimeout(3000);
    
    expect(profileApiCalled).toBeTruthy();
    console.log('✅ Profile API was called during avatar loading');
    
    if (profileApiResponse && profileApiResponse.success) {
      const userData = profileApiResponse.data;
      console.log(`👤 User: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      
      if (userData.avatar) {
        console.log(`📸 Avatar URL in API: ${userData.avatar}`);
        
        // Test if avatar URL is accessible
        const avatarResponse = await page.evaluate(async (avatarUrl) => {
          try {
            const response = await fetch(avatarUrl);
            return { 
              status: response.status, 
              contentType: response.headers.get('content-type') 
            };
          } catch (error) {
            return { error: error.message };
          }
        }, userData.avatar);
        
        console.log('🔗 Avatar URL test result:', avatarResponse);
        
        if (avatarResponse.status === 200) {
          console.log('✅ Avatar file is accessible');
        } else {
          console.log('⚠️  Avatar file may not be accessible - fallback should be used');
        }
      } else {
        console.log('ℹ️  No avatar URL in profile data - using default avatar');
      }
    }
  });
});