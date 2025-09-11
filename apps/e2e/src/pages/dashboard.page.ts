import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly tabGroup: Locator;
  readonly chartWidgets: Locator;
  readonly activityTimeline: Locator;
  readonly quickActions: Locator;
  readonly notificationCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    this.statsCards = page.locator('ax-stats-card');
    this.tabGroup = page.locator('mat-tab-group');
    this.chartWidgets = page.locator('ax-chart-widget');
    this.activityTimeline = page.locator('ax-activity-timeline');
    this.quickActions = page.locator('ax-quick-actions');
    this.notificationCard = page.locator('ax-card[title="Notifications"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getStatsCardByTitle(title: string): Promise<Locator> {
    return this.statsCards.filter({ hasText: title });
  }

  async getStatsValue(title: string): Promise<string> {
    const card = await this.getStatsCardByTitle(title);
    const valueElement = card.locator('.stats-value');
    return await valueElement.textContent() || '';
  }

  async selectTab(tabName: string) {
    const tab = this.page.locator(`mat-tab-label:has-text("${tabName}")`);
    await tab.click();
  }

  async isTabActive(tabName: string): Promise<boolean> {
    const tab = this.page.locator(`mat-tab-label:has-text("${tabName}")`);
    const ariaSelected = await tab.getAttribute('aria-selected');
    return ariaSelected === 'true';
  }

  async getChartByTitle(title: string): Promise<Locator> {
    return this.chartWidgets.filter({ hasText: title });
  }

  async getActivityItems(): Promise<number> {
    const items = this.activityTimeline.locator('.activity-item');
    return await items.count();
  }

  async filterActivities(filterText: string) {
    const filterInput = this.activityTimeline.locator('input[placeholder*="Filter"]');
    await filterInput.fill(filterText);
  }

  async getQuickActionButtons(): Promise<string[]> {
    const buttons = this.quickActions.locator('.action-button');
    const titles: string[] = [];
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const title = await buttons.nth(i).textContent();
      if (title) titles.push(title.trim());
    }
    
    return titles;
  }

  async clickQuickAction(actionTitle: string) {
    const button = this.quickActions.locator(`.action-button:has-text("${actionTitle}")`);
    await button.click();
  }

  async getNotificationCount(): Promise<number> {
    const notifications = this.notificationCard.locator('.notification-item');
    return await notifications.count();
  }

  async waitForDataToLoad() {
    // Wait for stats cards to load
    await this.page.waitForSelector('ax-stats-card', { state: 'visible' });
    
    // Wait for at least one chart to be visible
    await this.page.waitForSelector('ax-chart-widget', { state: 'visible' });
    
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('mat-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {
      // Ignore timeout - spinners may not appear
    });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/dashboard-${name}.png`,
      fullPage: true 
    });
  }
}