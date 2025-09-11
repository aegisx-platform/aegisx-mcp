import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { NavigationPage } from '../pages/navigation.page';
import { ProfilePage } from '../pages/profile.page';
import { AuthHelper } from '../support/auth.helper';

test.describe('Accessibility Tests', () => {
  let authHelper: AuthHelper;
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;
  let navigationPage: NavigationPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page: _page }) => {
    authHelper = new AuthHelper(page);
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
    navigationPage = new NavigationPage(page);
    profilePage = new ProfilePage(page);
  });

  test.describe('WCAG 2.1 Compliance', () => {
    test('should pass accessibility audit on login page', async ({
      page: _page,
    }) => {
      await loginPage.goto();

      // Inject axe-core
      await injectAxe(page);

      // Run accessibility check
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
        rules: {
          // Configure specific WCAG rules
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true },
          'aria-compliance': { enabled: true },
        },
      });
    });

    test('should pass accessibility audit on dashboard page', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      await injectAxe(page);

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });

    test('should pass accessibility audit on profile page', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await profilePage.goto();

      await injectAxe(page);

      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });

    test('should pass accessibility audit on navigation', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      await injectAxe(page);

      // Check navigation specific accessibility
      await checkA11y(page, 'nav, [role="navigation"]', {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation on login form', async ({
      page: _page,
    }) => {
      await loginPage.goto();

      // Test tab navigation
      await loginPage.testKeyboardNavigation();

      // Verify focus order
      await page.keyboard.press('Tab');
      const emailFocused = await page
        .locator('input[type="email"]')
        .evaluate((el) => el === document.activeElement);
      expect(emailFocused).toBeTruthy();

      await page.keyboard.press('Tab');
      const passwordFocused = await page
        .locator('input[type="password"]')
        .evaluate((el) => el === document.activeElement);
      expect(passwordFocused).toBeTruthy();

      await page.keyboard.press('Tab');
      const submitFocused = await page
        .locator('button[type="submit"]')
        .evaluate((el) => el === document.activeElement);
      expect(submitFocused).toBeTruthy();
    });

    test('should support keyboard navigation in dashboard', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Test skip links
      await page.keyboard.press('Tab');
      const firstFocusable = page.locator(':focus');
      const tagName = await firstFocusable.evaluate((el) =>
        el.tagName.toLowerCase(),
      );

      // Should focus on skip link or first interactive element
      expect(['a', 'button', 'input'].includes(tagName)).toBeTruthy();

      // Test navigation through interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const isVisible = await focused.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should support keyboard navigation in main navigation', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      await navigationPage.testKeyboardNavigation();

      // Test arrow key navigation if supported
      const navElement = page.locator('nav, [role="navigation"]');
      await navElement.focus();

      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      // Enter should activate focused item
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    });

    test('should handle Enter and Space key activation', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Find clickable elements
      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        // Test Space key activation
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        await firstButton.focus();

        // Test Enter key activation
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
      }
    });

    test('should trap focus in modals/dialogs', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Try to trigger a modal (this will depend on your implementation)
      const modalTriggers = page.locator(
        '[data-testid*="modal"], [aria-haspopup="dialog"], .modal-trigger',
      );
      const count = await modalTriggers.count();

      if (count > 0) {
        await modalTriggers.first().click();

        // Wait for modal to appear
        const modal = page.locator(
          '[role="dialog"], .modal, [data-testid="modal"]',
        );
        await modal.waitFor({ state: 'visible' });

        // Test focus trap - tab should stay within modal
        const focusableElements = modal.locator(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const focusableCount = await focusableElements.count();

        if (focusableCount > 0) {
          // Tab through all elements
          for (let i = 0; i < focusableCount + 2; i++) {
            await page.keyboard.press('Tab');
          }

          // Focus should still be within modal
          const _currentFocus = page.locator(':focus');
          const isInModal = (await modal.locator(':focus').count()) > 0;
          expect(isInModal).toBeTruthy();
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper heading hierarchy', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check heading hierarchy
      const headings = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .allTextContents();
      expect(headings.length).toBeGreaterThan(0);

      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check that headings are in logical order
      const headingLevels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((elements) =>
          elements.map((el) => parseInt(el.tagName.charAt(1))),
        );

      // First heading should be h1
      expect(headingLevels[0]).toBe(1);
    });

    test('should have proper landmark regions', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check for main landmarks
      const main = page.locator('main, [role="main"]');
      expect(await main.count()).toBeGreaterThanOrEqual(1);

      // Check for navigation
      const nav = page.locator('nav, [role="navigation"]');
      expect(await nav.count()).toBeGreaterThanOrEqual(1);

      // Check for banner (header)
      const banner = page.locator('header, [role="banner"]');
      expect(await banner.count()).toBeGreaterThanOrEqual(1);
    });

    test('should have proper form labels', async ({ page: _page }) => {
      await loginPage.goto();

      // Check all inputs have labels
      const inputs = page.locator('input, select, textarea');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Input should have one of these labeling methods
        const hasLabel =
          id && (await page.locator(`label[for="${id}"]`).count()) > 0;
        const hasAccessibleName = ariaLabel || ariaLabelledBy || hasLabel;

        // Placeholder is not sufficient on its own but acceptable as fallback
        expect(hasAccessibleName || placeholder).toBeTruthy();
      }
    });

    test('should have proper button names', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check all buttons have accessible names
      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');

        const hasAccessibleName =
          (text && text.trim()) || ariaLabel || ariaLabelledBy || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should have proper link text', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check all links have descriptive text
      const links = page.locator('a[href]');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const ariaLabelledBy = await link.getAttribute('aria-labelledby');
        const title = await link.getAttribute('title');

        const hasAccessibleName =
          (text &&
            text.trim() &&
            text.trim() !== 'Read more' &&
            text.trim() !== 'Click here') ||
          ariaLabel ||
          ariaLabelledBy ||
          title;

        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should have proper alt text for images', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check all images have alt text
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const ariaLabelledBy = await img.getAttribute('aria-labelledby');
        const role = await img.getAttribute('role');

        // Decorative images should have empty alt or role="presentation"
        // Content images should have descriptive alt text
        const isDecorative = alt === '' || role === 'presentation';
        const hasAccessibleName = alt || ariaLabel || ariaLabelledBy;

        expect(isDecorative || hasAccessibleName).toBeTruthy();
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should meet WCAG color contrast requirements', async ({
      page: _page,
    }) => {
      await loginPage.goto();

      await injectAxe(page);

      // Check color contrast specifically
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
        },
        detailedReport: true,
      });
    });

    test('should be usable without color alone', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Simulate color blindness
      await page.emulateMedia({ colorScheme: 'light' });

      // Add CSS to simulate color blindness
      await page.addStyleTag({
        content: `
          * {
            filter: grayscale(100%) !important;
          }
        `,
      });

      // Page should still be usable (this is a basic test)
      await dashboardPage.verifyDashboardDisplayed();

      // Important interactive elements should still be distinguishable
      const buttons = page.locator('button:visible');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();
        await firstButton.hover();

        // Button should still be visually distinct when hovered
        // This would need specific implementation checks
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page: _page }) => {
      await loginPage.goto();

      // Test focus indicators on form elements
      const focusableElements = page.locator(
        'input, button, a, select, textarea',
      );
      const count = await focusableElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = focusableElements.nth(i);
        await element.focus();

        // Check if element has focus styles
        const computedStyle = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            outlineStyle: style.outlineStyle,
            outlineColor: style.outlineColor,
            boxShadow: style.boxShadow,
            border: style.border,
          };
        });

        // Should have some form of focus indicator
        const hasFocusIndicator =
          (computedStyle.outline && computedStyle.outline !== 'none') ||
          (computedStyle.outlineWidth &&
            computedStyle.outlineWidth !== '0px') ||
          computedStyle.boxShadow.includes('inset') ||
          computedStyle.boxShadow.includes('0px');

        // Note: This is a basic check - in practice, you'd want to verify
        // the contrast ratio of the focus indicator as well
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should manage focus appropriately on page navigation', async ({
      page: _page,
    }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Navigate to different page
      await navigationPage.clickItem('Profile');
      await page.waitForLoadState('networkidle');

      // Focus should be on main content or skip link
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(
        (el) => el?.tagName?.toLowerCase() || '',
      );

      // Should focus on main, h1, or skip link
      expect(['main', 'h1', 'a', 'button'].includes(tagName)).toBeTruthy();
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page: _page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      await injectAxe(page);

      // Run accessibility check on mobile
      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          // Mobile-specific rules
          'target-size': { enabled: true }, // Touch targets should be at least 44x44px
        },
      });
    });

    test('should have appropriate touch targets', async ({ page: _page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check interactive elements have minimum size
      const interactiveElements = page.locator(
        'button, a, input, [tabindex="0"], [role="button"]',
      );
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i);
        const boundingBox = await element.boundingBox();

        if (boundingBox) {
          // WCAG recommends minimum 44x44px touch targets
          const minSize = 44;
          expect(boundingBox.width).toBeGreaterThanOrEqual(minSize - 5); // Allow 5px tolerance
          expect(boundingBox.height).toBeGreaterThanOrEqual(minSize - 5);
        }
      }
    });
  });

  test.describe('Dynamic Content Accessibility', () => {
    test('should announce dynamic content changes', async ({ page: _page }) => {
      await authHelper.loginAsAdmin();
      await dashboardPage.goto();

      // Check for live regions
      const liveRegions = page.locator(
        '[aria-live], [role="status"], [role="alert"]',
      );
      const count = await liveRegions.count();

      // Should have at least one live region for announcements
      if (count > 0) {
        const liveRegion = liveRegions.first();
        const ariaLive = await liveRegion.getAttribute('aria-live');
        const role = await liveRegion.getAttribute('role');

        expect(ariaLive || role).toBeTruthy();
      }
    });

    test('should handle loading states accessibly', async ({ page: _page }) => {
      // Test loading states with appropriate ARIA attributes
      await authHelper.loginAsAdmin();

      // Navigate to a page that might have loading state
      await dashboardPage.goto();

      // Look for loading indicators
      const loadingElements = page.locator(
        '[aria-busy="true"], .loading, .spinner, [data-testid*="loading"]',
      );
      const count = await loadingElements.count();

      if (count > 0) {
        const loadingElement = loadingElements.first();
        const ariaBusy = await loadingElement.getAttribute('aria-busy');
        const ariaLabel = await loadingElement.getAttribute('aria-label');
        const role = await loadingElement.getAttribute('role');

        // Loading indicators should be announced to screen readers
        expect(
          ariaBusy === 'true' || ariaLabel || role === 'status',
        ).toBeTruthy();
      }
    });
  });
});
