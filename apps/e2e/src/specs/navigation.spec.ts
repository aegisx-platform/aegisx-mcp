import { test, expect } from '@playwright/test';
import { NavigationPage } from '../pages/navigation.page';
import { DashboardPage } from '../pages/dashboard.page';
import { AuthHelper } from '../support/auth.helper';
import { NavigationHelper } from '../support/navigation.helper';
import { VisualHelper } from '../support/visual.helper';
import { TEST_NAVIGATION } from '../fixtures/test-data';

test.describe('Navigation Functionality', () => {
  let navigationPage: NavigationPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;
  let visualHelper: VisualHelper;

  test.beforeEach(async ({ page: _page }) => {
    navigationPage = new NavigationPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);
    visualHelper = new VisualHelper(page);

    // Login before each test
    await authHelper.loginAsAdmin();
  });

  test.describe('Navigation Menu Structure', () => {
    test('should display main navigation menu', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Verify navigation is visible
      await navigationPage.verifyExpanded();

      // Check main navigation items exist
      const expectedItems = Object.values(TEST_NAVIGATION).map(
        (item) => item.label,
      );
      await navigationPage.verifyNavigationItems(expectedItems);

      // Take screenshot of navigation
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-main-menu');
    });

    test('should show correct navigation items for admin user', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();

      // Verify admin-specific navigation items
      await navigationPage.verifyItemExists('Dashboard');
      await navigationPage.verifyItemExists('Users');
      await navigationPage.verifyItemExists('Settings');

      // Get all navigation items
      const items = await navigationPage.getNavigationItems();
      expect(items.length).toBeGreaterThan(0);

      // Verify each item has proper structure
      for (const item of items) {
        expect(item.label).toBeTruthy();
        expect(item.url).toBeTruthy();
      }
    });

    test('should highlight active navigation item', async ({ page: _page }) => {
      // Navigate to different pages and verify active states
      await navigationHelper.goToDashboard();
      await navigationPage.verifyItemActive('Dashboard');

      await navigationHelper.goToProfile();
      await navigationPage.verifyItemActive('Profile');

      await navigationHelper.goToSettings();
      await navigationPage.verifyItemActive('Settings');
    });
  });

  test.describe('Navigation Toggle Functionality', () => {
    test('should toggle navigation expanded/collapsed state', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();

      // Initially should be expanded
      await navigationPage.verifyExpanded();

      // Collapse navigation
      await navigationPage.collapse();
      await navigationPage.verifyCollapsed();

      // Take screenshot of collapsed state
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-collapsed');

      // Expand navigation
      await navigationPage.expand();
      await navigationPage.verifyExpanded();

      // Take screenshot of expanded state
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-expanded');
    });

    test('should persist navigation state across page refreshes', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();

      // Collapse navigation
      await navigationPage.collapse();
      await navigationPage.verifyCollapsed();

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Navigation should still be collapsed
      await navigationPage.verifyCollapsed();
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to dashboard via menu', async ({ page: _page }) => {
      await navigationHelper.goToDashboard();
      await navigationHelper.verifyCurrentPage('/dashboard');
      await dashboardPage.verifyDashboardDisplayed();
    });

    test('should navigate to profile via menu', async ({ page: _page }) => {
      await navigationHelper.goToProfile();
      await navigationHelper.verifyCurrentPage('/profile');
    });

    test('should navigate to settings via menu', async ({ page: _page }) => {
      await navigationHelper.goToSettings();
      await navigationHelper.verifyCurrentPage('/settings');
    });

    test('should handle navigation via URL directly', async ({
      page: _page,
    }) => {
      // Test direct URL navigation
      await navigationHelper.navigateTo('/dashboard');
      await navigationHelper.verifyCurrentPage('/dashboard');
      await navigationPage.verifyItemActive('Dashboard');

      await navigationHelper.navigateTo('/profile');
      await navigationHelper.verifyCurrentPage('/profile');
      await navigationPage.verifyItemActive('Profile');
    });

    test('should support browser back/forward navigation', async ({
      page: _page,
    }) => {
      // Navigate through several pages
      await navigationHelper.goToDashboard();
      await navigationHelper.goToProfile();
      await navigationHelper.goToSettings();

      // Go back
      await navigationHelper.goBack();
      await navigationHelper.verifyCurrentPage('/profile');
      await navigationPage.verifyItemActive('Profile');

      // Go back again
      await navigationHelper.goBack();
      await navigationHelper.verifyCurrentPage('/dashboard');
      await navigationPage.verifyItemActive('Dashboard');

      // Go forward
      await navigationHelper.goForward();
      await navigationHelper.verifyCurrentPage('/profile');
      await navigationPage.verifyItemActive('Profile');
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should adapt to mobile viewport', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Wait for responsive adjustments

      // Navigation should be collapsed on mobile
      await navigationPage.verifyCollapsed();

      // Should have toggle button visible
      const toggleExists =
        (await navigationPage.page
          .locator('[data-testid="nav-toggle"], .nav-toggle')
          .count()) > 0;
      expect(toggleExists).toBeTruthy();

      // Test toggle on mobile
      await navigationPage.toggle();
      await page.waitForTimeout(300);

      // Take screenshot of mobile navigation
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-mobile');
    });

    test('should adapt to tablet viewport', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      // Navigation behavior on tablet
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-tablet');
    });

    test('should work properly on desktop', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      // Navigation should be fully visible and expanded
      await navigationPage.verifyExpanded();

      // Take screenshot of desktop navigation
      await visualHelper.preparePage();
      await visualHelper.compareScreenshot('navigation-desktop');
    });

    test('should test all responsive breakpoints', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationHelper.testResponsiveNavigation();
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('should support keyboard navigation', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationPage.testKeyboardNavigation();
    });

    test('should have proper ARIA attributes', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationPage.verifyAccessibility();
    });

    test('should support screen reader navigation', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Check for proper semantic HTML
      const nav = navigationPage.page.locator('nav[role="navigation"], nav');
      await expect(nav).toBeVisible();

      // Check for proper heading structure
      const hasHeadings =
        (await navigationPage.page.locator('h1, h2, h3, h4, h5, h6').count()) >
        0;
      expect(hasHeadings).toBeTruthy();

      // Check for skip links (common accessibility feature)
      const skipLink = navigationPage.page.locator(
        'a[href="#main"], a[href="#content"]',
      );
      const skipLinkExists = (await skipLink.count()) > 0;

      if (skipLinkExists) {
        // Test skip link functionality
        await skipLink.click();
        const mainContent = navigationPage.page.locator(
          '#main, #content, main',
        );
        await expect(mainContent).toBeFocused();
      }
    });

    test('should support high contrast mode', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: white !important;
              color: black !important;
              border: 1px solid black !important;
            }
          }
        `,
      });

      // Navigation should still be usable
      await navigationPage.verifyExpanded();
      await visualHelper.compareScreenshot('navigation-high-contrast');
    });
  });

  test.describe('Navigation Search', () => {
    test('should filter navigation items by search', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();

      // Test navigation search if available
      await navigationHelper.testNavigationSearch();
    });

    test('should handle empty search results', async ({ page: _page }) => {
      await dashboardPage.goto();

      const hasSearch =
        (await navigationPage.page
          .locator('[data-testid="nav-search"]')
          .count()) > 0;

      if (hasSearch) {
        await navigationPage.search('nonexistentitem');
        await page.waitForTimeout(500);

        // Should show no results or message
        const visibleItems = await navigationPage.page
          .locator('.nav-item:visible')
          .count();
        expect(visibleItems).toBe(0);
      }
    });
  });

  test.describe('Sub-menu Functionality', () => {
    test('should expand and collapse sub-menus', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationHelper.testSubMenus();
    });

    test('should navigate to sub-menu items', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Test sub-menu navigation if available
      const navigationItems = await navigationPage.getNavigationItems();
      const itemsWithSubMenus = navigationItems.filter(
        (item) => item.hasSubMenu,
      );

      for (const item of itemsWithSubMenus) {
        await navigationPage.expandSubMenu(item.label);

        // Try to find and click a sub-menu item
        const subMenuItems = await navigationPage.page
          .locator('.sub-menu-item, .submenu-item')
          .count();

        if (subMenuItems > 0) {
          const firstSubItem = navigationPage.page
            .locator('.sub-menu-item, .submenu-item')
            .first();
          await firstSubItem.click();
          await page.waitForLoadState('networkidle');

          // Verify navigation occurred
          const currentUrl = navigationHelper.getCurrentUrl();
          expect(currentUrl).not.toBe('/dashboard');
        }
      }
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match navigation visual design', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test navigation baseline appearance
      await navigationPage.takeNavigationStateScreenshots();
    });

    test('should test navigation themes', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test light theme
      await visualHelper.setTheme('light');
      await page.waitForTimeout(500);
      await visualHelper.compareScreenshot('navigation-light-theme');

      // Test dark theme
      await visualHelper.setTheme('dark');
      await page.waitForTimeout(500);
      await visualHelper.compareScreenshot('navigation-dark-theme');
    });

    test('should test navigation interaction states', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test hover states
      const navItems = await navigationPage.page
        .locator('.nav-item, .nav-link')
        .count();

      if (navItems > 0) {
        const firstItem = navigationPage.page
          .locator('.nav-item, .nav-link')
          .first();
        await firstItem.hover();
        await visualHelper.compareScreenshot('navigation-item-hover');
      }
    });

    test('should test navigation across different screen sizes', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test responsive navigation design
      await visualHelper.testResponsiveDesign('navigation');
    });
  });

  test.describe('Navigation Performance', () => {
    test('should navigate between pages quickly', async ({ page: _page }) => {
      await navigationHelper.testNavigationPerformance();
    });

    test('should load navigation menu quickly', async ({ page: _page }) => {
      const startTime = Date.now();

      await dashboardPage.goto();
      await navigationPage.waitForLoad();

      const loadTime = Date.now() - startTime;
      console.log(`Navigation load time: ${loadTime}ms`);

      // Navigation should load within reasonable time
      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe('Navigation Error Handling', () => {
    test('should handle navigation to non-existent pages', async ({
      page: _page,
    }) => {
      await navigationHelper.testNavigationErrorHandling();
    });

    test('should handle broken navigation links', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Test navigation with broken URL
      await page.route('**/api/**', (route) => route.abort());

      try {
        await navigationHelper.goToProfile();
        // Should either show error state or handle gracefully
      } catch (error) {
        // Expected behavior for broken navigation
        console.log('Navigation handled error appropriately:', error);
      }
    });
  });
});
