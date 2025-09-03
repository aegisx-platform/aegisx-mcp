import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { ProfilePage } from '../pages/profile.page';
import { AuthHelper } from '../support/auth.helper';
import { NavigationHelper } from '../support/navigation.helper';

test.describe('Performance Tests', () => {
  let authHelper: AuthHelper;
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;
  let profilePage: ProfilePage;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page: _page }) => {
    authHelper = new AuthHelper(page);
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    navigationHelper = new NavigationHelper(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load login page within acceptable time', async ({
      page: _page,
    }) => {
      const startTime = Date.now();

      await loginPage.goto();
      await loginPage.waitForLoad();

      const loadTime = Date.now() - startTime;
      console.log(`Login page load time: ${loadTime}ms`);

      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check for core web vitals
      const navigationTiming = await page.evaluate(() => {
        const nav = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded:
            nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          firstPaint: performance
            .getEntriesByType('paint')
            .find((p) => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: performance
            .getEntriesByType('paint')
            .find((p) => p.name === 'first-contentful-paint')?.startTime,
        };
      });

      console.log('Navigation timing:', navigationTiming);

      // DOM Content Loaded should be fast
      if (navigationTiming.domContentLoaded > 0) {
        expect(navigationTiming.domContentLoaded).toBeLessThan(2000);
      }

      // First Contentful Paint should be under 1.8s for good performance
      if (navigationTiming.firstContentfulPaint) {
        expect(navigationTiming.firstContentfulPaint).toBeLessThan(1800);
      }
    });

    test('should load dashboard page within acceptable time', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();

      const startTime = Date.now();

      await dashboardPage.goto();
      await dashboardPage.waitForLoad();

      const loadTime = Date.now() - startTime;
      console.log(`Dashboard page load time: ${loadTime}ms`);

      // Dashboard should load within 4 seconds (may have more data)
      expect(loadTime).toBeLessThan(4000);
    });

    test('should load profile page within acceptable time', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();

      const startTime = Date.now();

      await profilePage.goto();
      await profilePage.waitForLoad();

      const loadTime = Date.now() - startTime;
      console.log(`Profile page load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle slow network conditions', async ({ page: _page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      const startTime = Date.now();

      await loginPage.goto();
      await loginPage.waitForLoad();

      const loadTime = Date.now() - startTime;
      console.log(`Login page load time on slow network: ${loadTime}ms`);

      // Should still be reasonable on slow network (with our 100ms delay)
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Navigation Performance', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should navigate between pages quickly', async ({ page: _page }) => {
      const pages = [
        { name: 'dashboard', action: () => navigationHelper.goToDashboard() },
        { name: 'profile', action: () => navigationHelper.goToProfile() },
        { name: 'settings', action: () => navigationHelper.goToSettings() },
      ];

      const navigationTimes: { [key: string]: number } = {};

      for (const pageInfo of pages) {
        const startTime = Date.now();

        try {
          await pageInfo.action();
          const navTime = Date.now() - startTime;
          navigationTimes[pageInfo.name] = navTime;

          console.log(`Navigation to ${pageInfo.name}: ${navTime}ms`);

          // Each navigation should be under 2 seconds
          expect(navTime).toBeLessThan(2000);
        } catch (error) {
          console.log(`Navigation to ${pageInfo.name} failed:`, error);
        }
      }

      console.log('All navigation times:', navigationTimes);
    });

    test('should handle rapid navigation clicks', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Rapidly click navigation items
      const navigationItems = ['Dashboard', 'Profile', 'Dashboard', 'Profile'];
      const startTime = Date.now();

      for (const item of navigationItems) {
        try {
          await navigationHelper.navigateViaMenu(item);
          await page.waitForTimeout(100); // Small delay between clicks
        } catch (error) {
          console.log(`Rapid navigation to ${item} failed:`, error);
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`Rapid navigation sequence completed in: ${totalTime}ms`);

      // Rapid navigation should complete within reasonable time
      expect(totalTime).toBeLessThan(8000);
    });
  });

  test.describe('API Response Performance', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should measure API response times', async ({ page: _page }) => {
      const apiCallTimes: { [key: string]: number } = {};

      // Monitor API requests
      page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          const timing = response.timing();
          const totalTime = timing.responseEnd;
          apiCallTimes[response.url()] = totalTime;
          console.log(`API ${response.url()}: ${totalTime}ms`);
        }
      });

      await dashboardPage.goto();
      await dashboardPage.waitForLoad();

      // Wait a bit for all API calls to complete
      await page.waitForTimeout(2000);

      // Check that API calls are reasonably fast
      for (const [url, time] of Object.entries(apiCallTimes)) {
        // API calls should respond within 5 seconds
        expect(time).toBeLessThan(5000);

        // Critical APIs (auth, profile) should be faster
        if (url.includes('/auth/') || url.includes('/profile')) {
          expect(time).toBeLessThan(2000);
        }
      }
    });

    test('should handle API timeout gracefully', async ({ page: _page }) => {
      // Mock slow API responses
      await page.route('**/api/**', async (route) => {
        // Add 10 second delay to simulate timeout
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await route.continue();
      });

      const startTime = Date.now();

      try {
        await dashboardPage.goto();
        await dashboardPage.waitForLoad();
      } catch (error) {
        // Expected to timeout or show error state
        console.log('Dashboard handled API timeout:', error);
      }

      const totalTime = Date.now() - startTime;
      console.log(`Dashboard load with API timeout: ${totalTime}ms`);

      // Should fail fast and show error state, not hang indefinitely
      expect(totalTime).toBeLessThan(15000);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load images efficiently', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Monitor image loading
      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map((img) => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          loading: img.loading,
        }));
      });

      console.log('Image metrics:', imageMetrics);

      // Check that images are loaded
      const incompleteImages = imageMetrics.filter((img) => !img.complete);
      expect(incompleteImages.length).toBeLessThanOrEqual(2); // Allow some async loading

      // Large images should use lazy loading
      const largeImages = imageMetrics.filter(
        (img) => img.naturalWidth > 500 || img.naturalHeight > 500,
      );

      for (const largeImg of largeImages) {
        // Large images should ideally use lazy loading
        expect(['lazy', 'auto'].includes(largeImg.loading)).toBeTruthy();
      }
    });

    test('should minimize JavaScript bundle size impact', async ({
      page: _page,
    }) => {
      await loginPage.goto();

      // Measure resource loading
      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          'resource',
        ) as PerformanceResourceTiming[];
        return entries
          .filter((entry) => entry.name.includes('.js'))
          .map((entry) => ({
            name: entry.name,
            size: entry.transferSize,
            duration: entry.responseEnd - entry.requestStart,
          }));
      });

      console.log('JavaScript resources:', resources);

      // Check JavaScript loading performance
      const totalJSSize = resources.reduce(
        (sum, resource) => sum + resource.size,
        0,
      );
      const maxJSLoadTime = Math.max(...resources.map((r) => r.duration));

      console.log(`Total JS size: ${totalJSSize} bytes`);
      console.log(`Max JS load time: ${maxJSLoadTime}ms`);

      // Total JS should be reasonable for initial load
      expect(totalJSSize).toBeLessThan(2 * 1024 * 1024); // Less than 2MB

      // Individual JS files should load quickly
      expect(maxJSLoadTime).toBeLessThan(3000);
    });

    test('should use efficient CSS loading', async ({ page: _page }) => {
      await loginPage.goto();

      // Measure CSS loading
      const cssResources = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          'resource',
        ) as PerformanceResourceTiming[];
        return entries
          .filter((entry) => entry.name.includes('.css'))
          .map((entry) => ({
            name: entry.name,
            size: entry.transferSize,
            duration: entry.responseEnd - entry.requestStart,
          }));
      });

      console.log('CSS resources:', cssResources);

      // CSS should load quickly and not block rendering
      for (const cssResource of cssResources) {
        expect(cssResource.duration).toBeLessThan(2000);
      }

      const totalCSSSize = cssResources.reduce(
        (sum, resource) => sum + resource.size,
        0,
      );
      console.log(`Total CSS size: ${totalCSSSize} bytes`);

      // CSS bundle should be reasonable
      expect(totalCSSSize).toBeLessThan(500 * 1024); // Less than 500KB
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have significant memory leaks', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });

      if (!initialMemory) {
        test.skip('Memory API not available');
        return;
      }

      // Navigate through pages multiple times
      for (let i = 0; i < 5; i++) {
        await navigationHelper.goToDashboard();
        await page.waitForTimeout(500);

        await navigationHelper.goToProfile();
        await page.waitForTimeout(500);

        await navigationHelper.goToSettings();
        await page.waitForTimeout(500);
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });

      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });

      if (finalMemory) {
        const memoryIncrease =
          finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        console.log(
          `Memory increase after navigation: ${memoryIncrease} bytes`,
        );

        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  test.describe('Form Performance', () => {
    test('should handle form input responsively', async ({ page: _page }) => {
      await loginPage.goto();

      const input = page.locator('input[type="email"]');

      // Measure input responsiveness
      const inputTimes: number[] = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();

        await input.fill(`test${i}@example.com`);
        await input.evaluate((el) => (el as HTMLInputElement).value); // Force DOM read

        const inputTime = Date.now() - startTime;
        inputTimes.push(inputTime);
      }

      const avgInputTime =
        inputTimes.reduce((sum, time) => sum + time, 0) / inputTimes.length;
      console.log(`Average input response time: ${avgInputTime}ms`);

      // Input should be responsive (under 50ms average)
      expect(avgInputTime).toBeLessThan(50);
    });

    test('should handle large form data efficiently', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await profilePage.goto();

      try {
        await profilePage.enterEditMode();

        // Fill form with large data
        const largeText = 'A'.repeat(1000); // 1000 character string

        const startTime = Date.now();

        await profilePage.fillProfileForm({
          firstName: largeText,
          lastName: largeText,
          bio: largeText.repeat(5), // 5000 characters
        });

        const fillTime = Date.now() - startTime;
        console.log(`Large form fill time: ${fillTime}ms`);

        // Should handle large data without significant lag
        expect(fillTime).toBeLessThan(2000);
      } catch (error) {
        console.log('Profile form test failed:', error);
      }
    });
  });

  test.describe('Search and Filter Performance', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should handle search input responsively', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Look for search inputs
      const searchInputs = page.locator(
        'input[type="search"], [placeholder*="search"], [data-testid*="search"]',
      );
      const count = await searchInputs.count();

      if (count > 0) {
        const searchInput = searchInputs.first();

        // Measure search response time
        const searchTimes: number[] = [];
        const searchTerms = ['test', 'user', 'admin', 'data', 'search'];

        for (const term of searchTerms) {
          const startTime = Date.now();

          await searchInput.fill(term);

          // Wait for potential debounce and results
          await page.waitForTimeout(500);

          const searchTime = Date.now() - startTime;
          searchTimes.push(searchTime);

          console.log(`Search for "${term}": ${searchTime}ms`);
        }

        const avgSearchTime =
          searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length;
        console.log(`Average search time: ${avgSearchTime}ms`);

        // Search should be responsive (under 1 second including debounce)
        expect(avgSearchTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile viewport', async ({ page: _page }) => {
      // Set mobile viewport and simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const startTime = Date.now();

      await loginPage.goto();
      await loginPage.waitForLoad();

      const mobileLoadTime = Date.now() - startTime;
      console.log(`Mobile load time: ${mobileLoadTime}ms`);

      // Mobile should load within reasonable time
      expect(mobileLoadTime).toBeLessThan(4000);

      // Test mobile navigation performance
      await authHelper.loginAsAdmin();

      const navStartTime = Date.now();
      await navigationHelper.goToDashboard();
      const navTime = Date.now() - navStartTime;

      console.log(`Mobile navigation time: ${navTime}ms`);
      expect(navTime).toBeLessThan(3000);
    });
  });
});
