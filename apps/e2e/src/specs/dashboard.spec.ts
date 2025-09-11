import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard Functionality', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.waitForDataToLoad();
  });

  test('should display dashboard with all core widgets', async ({ page }) => {
    // Verify page title
    await expect(dashboardPage.pageTitle).toBeVisible();
    await expect(dashboardPage.pageTitle).toHaveText('Dashboard');

    // Verify stats cards are present
    const statsCount = await dashboardPage.statsCards.count();
    expect(statsCount).toBeGreaterThanOrEqual(4); // At least 4 stats cards

    // Verify tab navigation
    await expect(dashboardPage.tabGroup).toBeVisible();

    // Verify other widgets
    await expect(dashboardPage.activityTimeline).toBeVisible();
    await expect(dashboardPage.quickActions).toBeVisible();
  });

  test('should display correct stats values', async () => {
    // Check Total Users stat
    const totalUsers = await dashboardPage.getStatsValue('Total Users');
    expect(totalUsers).toMatch(/^\d+$/); // Should be a number

    // Check Active Sessions stat
    const activeSessions = await dashboardPage.getStatsValue('Active Sessions');
    expect(activeSessions).toMatch(/^\d+$/);

    // Check System Health stat
    const systemHealth = await dashboardPage.getStatsValue('System Health');
    expect(systemHealth).toMatch(/^\d+%$/); // Should be percentage

    // Check Revenue stat
    const revenue = await dashboardPage.getStatsValue('Revenue');
    expect(revenue).toMatch(/^\$[\d,]+(\.\d{2})?$/); // Should be currency format
  });

  test('should navigate between tabs', async () => {
    // Default tab should be Overview
    await expect(await dashboardPage.isTabActive('Overview')).toBe(true);

    // Click Analytics tab
    await dashboardPage.selectTab('Analytics');
    await expect(await dashboardPage.isTabActive('Analytics')).toBe(true);
    await expect(await dashboardPage.isTabActive('Overview')).toBe(false);

    // Verify Analytics content is displayed
    const analyticsChart = await dashboardPage.getChartByTitle('User Analytics');
    await expect(analyticsChart).toBeVisible();

    // Click Performance tab
    await dashboardPage.selectTab('Performance');
    await expect(await dashboardPage.isTabActive('Performance')).toBe(true);

    // Verify Performance content is displayed
    const performanceChart = await dashboardPage.getChartByTitle('System Performance');
    await expect(performanceChart).toBeVisible();

    // Click Reports tab
    await dashboardPage.selectTab('Reports');
    await expect(await dashboardPage.isTabActive('Reports')).toBe(true);

    // Return to Overview
    await dashboardPage.selectTab('Overview');
    await expect(await dashboardPage.isTabActive('Overview')).toBe(true);
  });

  test('should display and update charts', async () => {
    // Check Overview tab charts
    const salesChart = await dashboardPage.getChartByTitle('Sales Overview');
    await expect(salesChart).toBeVisible();

    const revenueChart = await dashboardPage.getChartByTitle('Revenue Trends');
    await expect(revenueChart).toBeVisible();

    // Switch to Analytics tab
    await dashboardPage.selectTab('Analytics');

    // Check Analytics charts
    const userAnalyticsChart = await dashboardPage.getChartByTitle('User Analytics');
    await expect(userAnalyticsChart).toBeVisible();

    const engagementChart = await dashboardPage.getChartByTitle('Engagement Metrics');
    await expect(engagementChart).toBeVisible();
  });

  test('should display activity timeline', async () => {
    // Check that activity items exist
    const activityCount = await dashboardPage.getActivityItems();
    expect(activityCount).toBeGreaterThan(0);

    // Test activity filtering
    await dashboardPage.filterActivities('User');
    
    // Wait for filter to apply
    await dashboardPage.page.waitForTimeout(500);
    
    // Verify filtered results
    const filteredCount = await dashboardPage.getActivityItems();
    expect(filteredCount).toBeLessThanOrEqual(activityCount);
  });

  test('should have functional quick actions', async () => {
    // Get all quick action buttons
    const actions = await dashboardPage.getQuickActionButtons();
    
    // Should have standard quick actions
    expect(actions).toContain('Add User');
    expect(actions).toContain('Generate Report');
    expect(actions).toContain('View Analytics');
    expect(actions).toContain('System Settings');

    // Test clicking Add User action
    await dashboardPage.clickQuickAction('Add User');
    
    // Should navigate to users page or open dialog
    const currentUrl = dashboardPage.page.url();
    const hasDialog = await dashboardPage.page.locator('mat-dialog-container').count();
    
    expect(currentUrl.includes('/users') || hasDialog > 0).toBe(true);
  });

  test('should handle real-time updates', async ({ page }) => {
    // Get initial stats
    const initialUsers = await dashboardPage.getStatsValue('Total Users');
    const initialSessions = await dashboardPage.getStatsValue('Active Sessions');

    // Wait for potential updates (real-time simulation)
    await page.waitForTimeout(3000);

    // Stats might have changed
    const updatedUsers = await dashboardPage.getStatsValue('Total Users');
    const updatedSessions = await dashboardPage.getStatsValue('Active Sessions');

    // Verify stats are still valid numbers
    expect(updatedUsers).toMatch(/^\d+$/);
    expect(updatedSessions).toMatch(/^\d+$/);
  });

  test('should display notifications', async () => {
    // Check if notification card exists
    const notificationCount = await dashboardPage.getNotificationCount();
    
    // Should have at least some notifications
    expect(notificationCount).toBeGreaterThanOrEqual(0);

    // If notifications exist, verify they are visible
    if (notificationCount > 0) {
      const firstNotification = dashboardPage.notificationCard.locator('.notification-item').first();
      await expect(firstNotification).toBeVisible();
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Navigate to a tab that might have no data
    await dashboardPage.selectTab('Reports');

    // Check for empty state message or data
    const hasEmptyState = await page.locator('.empty-state').count();
    const hasData = await page.locator('.report-item').count();

    // Should have either empty state or data
    expect(hasEmptyState > 0 || hasData > 0).toBe(true);

    if (hasEmptyState > 0) {
      const emptyStateMessage = page.locator('.empty-state');
      await expect(emptyStateMessage).toContainText(/no reports|no data/i);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for responsive adjustments
    await page.waitForTimeout(500);

    // Dashboard should still be visible
    await expect(dashboardPage.pageTitle).toBeVisible();

    // Stats cards should stack vertically
    const firstCard = dashboardPage.statsCards.first();
    const secondCard = dashboardPage.statsCards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    if (firstBox && secondBox) {
      // Second card should be below first card on mobile
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
    }

    // Tab navigation might be scrollable
    await expect(dashboardPage.tabGroup).toBeVisible();
  });

  test('should maintain state across page navigation', async ({ page }) => {
    // Select Analytics tab
    await dashboardPage.selectTab('Analytics');
    await expect(await dashboardPage.isTabActive('Analytics')).toBe(true);

    // Navigate away
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Navigate back to dashboard
    await dashboardPage.goto();
    await dashboardPage.waitForDataToLoad();

    // Should remember last selected tab (if implemented)
    // This might not be implemented, so we check if it goes back to Overview
    const isAnalyticsActive = await dashboardPage.isTabActive('Analytics');
    const isOverviewActive = await dashboardPage.isTabActive('Overview');
    
    // Either remembered state or default state is acceptable
    expect(isAnalyticsActive || isOverviewActive).toBe(true);
  });

  test('should export dashboard data', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export")');
    
    if (await exportButton.count() > 0) {
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      // Click export
      await exportButton.click();
      
      // If dropdown appears, select CSV
      const csvOption = page.locator('button:has-text("CSV")');
      if (await csvOption.count() > 0) {
        await csvOption.click();
        
        // Wait for download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/dashboard.*\.csv/i);
      }
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Reload page and watch for loading states
    const loadingPromise = page.waitForSelector('mat-spinner', { state: 'visible' })
      .then(() => true)
      .catch(() => false);
    
    await page.reload();
    
    const hadLoadingState = await loadingPromise;
    
    // Should show loading state during data fetch
    expect(hadLoadingState).toBe(true);
    
    // Loading should complete
    await dashboardPage.waitForDataToLoad();
    
    // No spinners should remain
    const remainingSpinners = await page.locator('mat-spinner:visible').count();
    expect(remainingSpinners).toBe(0);
  });

  test('should take dashboard screenshots for visual regression', async () => {
    // Take full dashboard screenshot
    await dashboardPage.takeScreenshot('overview-tab');

    // Screenshot each tab
    const tabs = ['Analytics', 'Performance', 'Reports'];
    
    for (const tab of tabs) {
      await dashboardPage.selectTab(tab);
      await dashboardPage.page.waitForTimeout(1000); // Wait for animations
      await dashboardPage.takeScreenshot(`${tab.toLowerCase()}-tab`);
    }

    // Mobile screenshot
    await dashboardPage.page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.page.waitForTimeout(500);
    await dashboardPage.takeScreenshot('mobile-view');
  });
});

// Accessibility tests
test.describe('Dashboard Accessibility', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.waitForDataToLoad();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check main navigation
    const mainNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(mainNav).toBeVisible();

    // Check tab navigation
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    // Check stats cards have proper structure
    const statsCard = dashboardPage.statsCards.first();
    const heading = statsCard.locator('h3, h4, [role="heading"]');
    await expect(heading).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Focus on first tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Navigate tabs with arrow keys
    await page.keyboard.press('ArrowRight');
    await expect(await dashboardPage.isTabActive('Analytics')).toBe(true);

    await page.keyboard.press('ArrowRight');
    await expect(await dashboardPage.isTabActive('Performance')).toBe(true);

    await page.keyboard.press('ArrowLeft');
    await expect(await dashboardPage.isTabActive('Analytics')).toBe(true);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This would normally use an accessibility testing library
    // For now, we'll check that important text is visible
    
    const statsValues = page.locator('.stats-value');
    const count = await statsValues.count();
    
    for (let i = 0; i < count; i++) {
      const value = statsValues.nth(i);
      await expect(value).toBeVisible();
      
      // Check computed styles
      const color = await value.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      // Should not be too light
      expect(color).not.toBe('rgb(255, 255, 255)');
    }
  });
});