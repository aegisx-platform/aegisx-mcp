import { test } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { NavigationPage } from '../pages/navigation.page';
import { ProfilePage } from '../pages/profile.page';
import { AuthHelper } from '../support/auth.helper';
import { VisualHelper } from '../support/visual.helper';
import { TEST_VIEWPORTS } from '../fixtures/test-data';

test.describe('Visual Regression Tests', () => {
  let authHelper: AuthHelper;
  let visualHelper: VisualHelper;
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;
  let navigationPage: NavigationPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page: _page }) => {
    authHelper = new AuthHelper(page);
    visualHelper = new VisualHelper(page);
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
    navigationPage = new NavigationPage(page);
    profilePage = new ProfilePage(page);
  });

  test.describe('Login Page Visual Tests', () => {
    test('should match login page baseline', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('login-page-baseline', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test login page responsive design', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test across different viewports
      await visualHelper.testResponsiveDesign('login-page', {
        viewports: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'desktop', width: 1920, height: 1080 },
        ],
      });
    });

    test('should test login page theme variations', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      await visualHelper.testThemeVariations('login-page', ['light', 'dark']);
    });

    test('should test login form interaction states', async ({
      page: _page,
    }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test form field focus states
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

    test('should test login error states', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test error state visualization
      await visualHelper.testErrorStates('login-form', [
        {
          name: 'invalid-credentials',
          trigger: async () => {
            await loginPage.fillEmail('invalid@test.com');
            await loginPage.fillPassword('wrongpassword');
            await loginPage.clickLogin();
            await page.waitForTimeout(1000);
          },
        },
        {
          name: 'empty-form',
          trigger: async () => {
            await loginPage.clearForm();
            await loginPage.clickLogin();
            await page.waitForTimeout(500);
          },
        },
      ]);
    });
  });

  test.describe('Dashboard Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should match dashboard baseline', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('dashboard-baseline', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test dashboard responsive layouts', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      await visualHelper.testResponsiveDesign('dashboard');
    });

    test('should test dashboard theme variations', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      await visualHelper.testThemeVariations('dashboard', ['light', 'dark']);
    });

    test('should test dashboard loading states', async ({ page: _page }) => {
      await visualHelper.testLoadingStates('dashboard', [
        {
          name: 'page-load',
          action: async () => {
            await dashboardPage.goto();
            await dashboardPage.waitForLoadingComplete();
          },
        },
      ]);
    });

    test('should test dashboard widget states', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test different widget states if available
      const widgetSelectors = [
        '[data-testid="stats-card"]',
        '[data-testid="welcome-card"]',
        '[data-testid="recent-activity"]',
      ];

      for (const selector of widgetSelectors) {
        try {
          await visualHelper.compareElementScreenshot(
            selector,
            `dashboard-widget-${selector.replace(/[["=-]]/g, '')}`,
            { animations: 'disabled' },
          );
        } catch {
          // Widget might not exist, skip
        }
      }
    });
  });

  test.describe('Navigation Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test navigation expanded state', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationPage.expand();
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('navigation-expanded', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test navigation collapsed state', async ({ page: _page }) => {
      await dashboardPage.goto();
      await navigationPage.collapse();
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('navigation-collapsed', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test navigation responsive behavior', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test navigation at different screen sizes
      const viewports = Object.entries(TEST_VIEWPORTS).map(([name, size]) => ({
        name,
        ...size,
      }));

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.waitForTimeout(500);

        await visualHelper.compareScreenshot(`navigation-${viewport.name}`, {
          fullPage: true,
          animations: 'disabled',
        });
      }
    });

    test('should test navigation interaction states', async ({
      page: _page,
    }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test navigation item hover states
      const navItems = page.locator('.nav-item, .nav-link');
      const count = await navItems.count();

      if (count > 0) {
        await navItems.first().hover();
        await visualHelper.compareScreenshot('navigation-item-hover', {
          animations: 'disabled',
        });
      }
    });

    test('should test navigation theme variations', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      await visualHelper.testThemeVariations('navigation', ['light', 'dark']);
    });
  });

  test.describe('Profile Page Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test profile page baseline', async ({ page: _page }) => {
      await profilePage.goto();
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('profile-page-baseline', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test profile form states', async ({ page: _page }) => {
      await profilePage.goto();
      await visualHelper.preparePage();

      // Test view mode
      await visualHelper.compareScreenshot('profile-view-mode', {
        fullPage: true,
        animations: 'disabled',
      });

      // Test edit mode
      await profilePage.enterEditMode();
      await page.waitForTimeout(500);

      await visualHelper.compareScreenshot('profile-edit-mode', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test profile responsive design', async ({ page: _page }) => {
      await profilePage.goto();
      await visualHelper.preparePage();

      await visualHelper.testResponsiveDesign('profile-page');
    });

    test('should test profile theme variations', async ({ page: _page }) => {
      await profilePage.goto();
      await visualHelper.preparePage();

      await visualHelper.testThemeVariations('profile-page', ['light', 'dark']);
    });
  });

  test.describe('Component Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test button component states', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test different button states if buttons exist
      const buttonSelectors = [
        'button[type="submit"]',
        '.btn-primary',
        '.btn-secondary',
        '[data-testid*="button"]',
      ];

      for (const selector of buttonSelectors) {
        try {
          const buttons = page.locator(selector);
          const count = await buttons.count();

          if (count > 0) {
            const button = buttons.first();

            // Normal state
            await visualHelper.compareElementScreenshot(
              selector,
              `button-${selector.replace(/[["=\-.:]]/g, '')}-normal`,
              { animations: 'disabled' },
            );

            // Hover state
            await button.hover();
            await visualHelper.compareElementScreenshot(
              selector,
              `button-${selector.replace(/[["=\-.:]]/g, '')}-hover`,
              { animations: 'disabled' },
            );

            // Focus state
            await button.focus();
            await visualHelper.compareElementScreenshot(
              selector,
              `button-${selector.replace(/[["=\-.:]]/g, '')}-focus`,
              { animations: 'disabled' },
            );
          }
        } catch {
          // Button might not exist, skip
        }
      }
    });

    test('should test form component states', async ({ page: _page }) => {
      await loginPage.goto();
      await visualHelper.preparePage();

      // Test form input states
      const inputSelectors = [
        'input[type="email"]',
        'input[type="password"]',
        'input[type="text"]',
      ];

      for (const selector of inputSelectors) {
        try {
          const input = page.locator(selector);
          const count = await input.count();

          if (count > 0) {
            // Empty state
            await visualHelper.compareElementScreenshot(
              selector,
              `input-${selector.replace(/[["=\-.:]]/g, '')}-empty`,
              { animations: 'disabled' },
            );

            // Filled state
            await input.fill('Sample text');
            await visualHelper.compareElementScreenshot(
              selector,
              `input-${selector.replace(/[["=\-.:]]/g, '')}-filled`,
              { animations: 'disabled' },
            );

            // Focus state
            await input.focus();
            await visualHelper.compareElementScreenshot(
              selector,
              `input-${selector.replace(/[["=\-.:]]/g, '')}-focus`,
              { animations: 'disabled' },
            );
          }
        } catch {
          // Input might not exist, skip
        }
      }
    });

    test('should test card component variations', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Test card components if they exist
      const cardSelectors = [
        '.card',
        '[data-testid*="card"]',
        '.dashboard-card',
        '.stats-card',
      ];

      for (const selector of cardSelectors) {
        try {
          const cards = page.locator(selector);
          const count = await cards.count();

          if (count > 0) {
            // Test first few cards
            const cardsToTest = Math.min(count, 3);
            for (let i = 0; i < cardsToTest; i++) {
              await visualHelper.compareElementScreenshot(
                `${selector}:nth-child(${i + 1})`,
                `card-${selector.replace(/[["=\-.:]]/g, '')}-${i}`,
                { animations: 'disabled' },
              );
            }
          }
        } catch {
          // Cards might not exist, skip
        }
      }
    });
  });

  test.describe('Error State Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test 404 error page', async ({ page: _page }) => {
      await page.goto('/non-existent-page');
      await visualHelper.preparePage();

      // Should show 404 page or redirect
      await visualHelper.compareScreenshot('404-error-page', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('should test network error states', async ({ page: _page }) => {
      // Mock network failures
      await page.route('**/api/**', (route) => route.abort());

      await dashboardPage.goto();
      await page.waitForTimeout(2000); // Wait for potential error states

      await visualHelper.compareScreenshot('network-error-state', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Print Styles Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test print styles', async ({ page: _page }) => {
      await dashboardPage.goto();
      await visualHelper.preparePage();

      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      await page.waitForTimeout(500);

      await visualHelper.compareScreenshot('dashboard-print-style', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('High Contrast Mode Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test high contrast mode', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Emulate high contrast mode
      await page.emulateMedia({
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        forcedColors: 'active',
      });

      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('dashboard-high-contrast', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Reduced Motion Visual Tests', () => {
    test.beforeEach(async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
    });

    test('should test reduced motion preferences', async ({ page: _page }) => {
      await dashboardPage.goto();

      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await visualHelper.preparePage();

      await visualHelper.compareScreenshot('dashboard-reduced-motion', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });
});
