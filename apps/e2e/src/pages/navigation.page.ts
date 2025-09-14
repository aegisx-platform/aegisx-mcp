import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface NavigationItem {
  label: string;
  url: string;
  icon?: string;
  hasSubMenu?: boolean;
}

/**
 * Navigation Component Page Object Model
 * Handles main navigation sidebar and menu interactions
 */
export class NavigationPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main navigation
    navigation: '[data-testid="navigation"], .navigation, nav',
    navigationList: '[data-testid="nav-list"], .nav-list, ul',
    navigationItem: '[data-testid="nav-item"], .nav-item, li',
    navigationLink: '[data-testid="nav-link"], .nav-link, a',
    
    // Navigation toggle
    toggleButton: '[data-testid="nav-toggle"], .nav-toggle, .menu-toggle',
    
    // Navigation states
    expanded: '.navigation-expanded, .nav-expanded',
    collapsed: '.navigation-collapsed, .nav-collapsed',
    
    // Icons
    navigationIcon: '[data-testid="nav-icon"], .nav-icon, .icon',
    expandIcon: '[data-testid="expand-icon"], .expand-icon, .chevron',
    
    // Sub menus
    subMenu: '[data-testid="sub-menu"], .sub-menu, .submenu',
    subMenuItem: '[data-testid="sub-menu-item"], .sub-menu-item',
    
    // Active states
    activeItem: '.active, .current, .selected',
    
    // Search in navigation
    navSearch: '[data-testid="nav-search"], .nav-search, input[placeholder*="search"]',
    
    // Navigation sections
    navigationSection: '[data-testid="nav-section"], .nav-section, .nav-group',
    sectionTitle: '[data-testid="section-title"], .section-title, .nav-group-title',
    
    // User navigation
    userNav: '[data-testid="user-nav"], .user-nav, .profile-nav',
    userMenuButton: 'button[mat-icon-button][matMenuTriggerFor="userMenu"]',
    userMenu: 'mat-menu',
    userAvatar: 'button[mat-icon-button] img',
    userMenuAvatar: 'mat-menu img',
    navigationBar: '.toolbar, .mat-toolbar, .navigation-header, .app-header',
    userInfo: '[data-testid="user-info"], .user-info, .profile-info',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to any page to access navigation
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  /**
   * Wait for navigation to be loaded
   */
  async waitForLoad(): Promise<void> {
    await this.waitForElement(this.selectors.navigation);
    await this.waitForElement(this.selectors.navigationList);
  }

  /**
   * Toggle navigation expanded/collapsed state
   */
  async toggle(): Promise<void> {
    if (await this.elementExists(this.selectors.toggleButton)) {
      await this.clickElement(this.selectors.toggleButton);
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Expand navigation if collapsed
   */
  async expand(): Promise<void> {
    const isCollapsed = await this.isCollapsed();
    if (isCollapsed) {
      await this.toggle();
    }
  }

  /**
   * Collapse navigation if expanded
   */
  async collapse(): Promise<void> {
    const isExpanded = await this.isExpanded();
    if (isExpanded) {
      await this.toggle();
    }
  }

  /**
   * Check if navigation is expanded
   */
  async isExpanded(): Promise<boolean> {
    const navigation = this.page.locator(this.selectors.navigation);
    
    // Check for expanded class
    const classes = await navigation.getAttribute('class') ?? '';
    if (classes.includes('expanded') || classes.includes('open')) {
      return true;
    }
    
    // Check for collapsed class absence
    if (!classes.includes('collapsed') && !classes.includes('closed')) {
      return true;
    }
    
    // Check computed width (expanded navigation is typically wider)
    const boundingBox = await navigation.boundingBox();
    if (boundingBox && boundingBox.width > 200) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if navigation is collapsed
   */
  async isCollapsed(): Promise<boolean> {
    return !(await this.isExpanded());
  }

  /**
   * Click navigation item by label
   */
  async clickItem(label: string): Promise<void> {
    const item = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: label });
    
    await item.click();
    await this.waitForNavigation();
  }

  /**
   * Click navigation item by URL
   */
  async clickItemByUrl(url: string): Promise<void> {
    const link = this.page.locator(`${this.selectors.navigationLink}[href*="${url}"]`);
    await link.click();
    await this.waitForNavigation();
  }

  /**
   * Hover over navigation item
   */
  async hoverItem(label: string): Promise<void> {
    const item = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: label });
    
    await item.hover();
    await this.page.waitForTimeout(200); // Wait for hover effects
  }

  /**
   * Get all navigation items
   */
  async getNavigationItems(): Promise<NavigationItem[]> {
    const items = this.page.locator(this.selectors.navigationItem);
    const count = await items.count();
    const navigationItems: NavigationItem[] = [];
    
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const link = item.locator(this.selectors.navigationLink);
      
      const label = await link.textContent() ?? '';
      const url = await link.getAttribute('href') ?? '';
      const hasSubMenu = await item.locator(this.selectors.subMenu).count() > 0;
      
      navigationItems.push({
        label: label.trim(),
        url,
        hasSubMenu,
      });
    }
    
    return navigationItems;
  }

  /**
   * Get active navigation item
   */
  async getActiveItem(): Promise<string> {
    const activeItem = this.page.locator(`${this.selectors.navigationItem}${this.selectors.activeItem}`);
    
    if (await activeItem.count() > 0) {
      const link = activeItem.locator(this.selectors.navigationLink);
      return await link.textContent() ?? '';
    }
    
    return '';
  }

  /**
   * Verify navigation item is active
   */
  async verifyItemActive(label: string): Promise<void> {
    const item = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: label });
    
    await expect(item).toHaveClass(/active|current|selected/);
  }

  /**
   * Verify navigation item exists
   */
  async verifyItemExists(label: string): Promise<void> {
    const item = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: label });
    
    await expect(item).toBeVisible();
  }

  /**
   * Search in navigation
   */
  async search(query: string): Promise<void> {
    if (await this.elementExists(this.selectors.navSearch)) {
      await this.fillInput(this.selectors.navSearch, query);
      await this.page.waitForTimeout(500); // Wait for search results
    }
  }

  /**
   * Clear navigation search
   */
  async clearSearch(): Promise<void> {
    if (await this.elementExists(this.selectors.navSearch)) {
      await this.fillInput(this.selectors.navSearch, '');
    }
  }

  /**
   * Expand sub menu
   */
  async expandSubMenu(parentLabel: string): Promise<void> {
    const parentItem = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: parentLabel });
    
    const expandIcon = parentItem.locator(this.selectors.expandIcon);
    
    if (await expandIcon.count() > 0) {
      await expandIcon.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Collapse sub menu
   */
  async collapseSubMenu(parentLabel: string): Promise<void> {
    // Same action as expand - it toggles
    await this.expandSubMenu(parentLabel);
  }

  /**
   * Click sub menu item
   */
  async clickSubMenuItem(parentLabel: string, subItemLabel: string): Promise<void> {
    await this.expandSubMenu(parentLabel);
    
    const parentItem = this.page.locator(this.selectors.navigationItem)
      .filter({ hasText: parentLabel });
    
    const subItem = parentItem.locator(this.selectors.subMenuItem)
      .filter({ hasText: subItemLabel });
    
    await subItem.click();
    await this.waitForNavigation();
  }

  /**
   * Verify navigation is expanded
   */
  async verifyExpanded(): Promise<void> {
    const isExpanded = await this.isExpanded();
    expect(isExpanded).toBeTruthy();
  }

  /**
   * Verify navigation is collapsed
   */
  async verifyCollapsed(): Promise<void> {
    const isCollapsed = await this.isCollapsed();
    expect(isCollapsed).toBeTruthy();
  }

  /**
   * Verify navigation contains expected items
   */
  async verifyNavigationItems(expectedItems: string[]): Promise<void> {
    for (const item of expectedItems) {
      await this.verifyItemExists(item);
    }
  }

  /**
   * Get navigation sections
   */
  async getNavigationSections(): Promise<Array<{ title: string; items: string[] }>> {
    const sections = this.page.locator(this.selectors.navigationSection);
    const count = await sections.count();
    const navigationSections = [];
    
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const titleElement = section.locator(this.selectors.sectionTitle);
      const title = await titleElement.textContent() ?? '';
      
      const items = section.locator(this.selectors.navigationItem);
      const itemCount = await items.count();
      const sectionItems = [];
      
      for (let j = 0; j < itemCount; j++) {
        const item = items.nth(j);
        const itemText = await item.textContent() ?? '';
        sectionItems.push(itemText.trim());
      }
      
      navigationSections.push({
        title: title.trim(),
        items: sectionItems,
      });
    }
    
    return navigationSections;
  }

  /**
   * Verify user information in navigation
   */
  async verifyUserInfo(expectedName: string): Promise<void> {
    if (await this.elementExists(this.selectors.userInfo)) {
      await this.verifyElementContainsText(this.selectors.userInfo, expectedName);
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Focus on navigation
    await this.page.locator(this.selectors.navigation).focus();
    
    // Navigate through items with arrow keys
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(100);
    
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(100);
    
    // Enter to activate
    await this.page.keyboard.press('Enter');
    await this.waitForNavigation();
  }

  /**
   * Verify accessibility attributes
   */
  async verifyAccessibility(): Promise<void> {
    const navigation = this.page.locator(this.selectors.navigation);
    
    // Verify navigation has proper role
    await expect(navigation).toHaveAttribute('role', 'navigation');
    
    // Verify navigation items have proper attributes
    const navItems = this.page.locator(this.selectors.navigationLink);
    const count = await navItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      
      // Should have href or role
      const href = await item.getAttribute('href');
      const role = await item.getAttribute('role');
      
      expect(href || role).toBeTruthy();
    }
  }

  /**
   * Take navigation screenshot
   */
  async takeNavigationScreenshot(name = 'navigation'): Promise<void> {
    await this.screenshot(name);
  }

  /**
   * Take navigation screenshot in different states
   */
  async takeNavigationStateScreenshots(): Promise<void> {
    // Expanded state
    await this.expand();
    await this.screenshot('navigation-expanded');
    
    // Collapsed state
    await this.collapse();
    await this.screenshot('navigation-collapsed');
  }

  /**
   * Avatar-specific methods for navigation bar
   */

  /**
   * Get user menu button
   */
  async getUserMenuButton() {
    return this.page.locator(this.selectors.userMenuButton).first();
  }

  /**
   * Get navigation bar avatar
   */
  async getNavigationAvatar() {
    const userMenuButton = await this.getUserMenuButton();
    return userMenuButton.locator('img');
  }

  /**
   * Click user menu to open dropdown
   */
  async openUserMenu(): Promise<void> {
    const userMenuButton = await this.getUserMenuButton();
    await userMenuButton.click();
    
    // Wait for menu to appear
    const userMenu = this.page.locator(this.selectors.userMenu);
    await expect(userMenu).toBeVisible();
  }

  /**
   * Close user menu
   */
  async closeUserMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    
    // Wait for menu to disappear
    const userMenu = this.page.locator(this.selectors.userMenu);
    await expect(userMenu).toBeHidden();
  }

  /**
   * Get user menu dropdown avatar
   */
  async getUserMenuAvatar() {
    const userMenu = this.page.locator(this.selectors.userMenu);
    return userMenu.locator('img');
  }

  /**
   * Verify navigation avatar is displayed
   */
  async verifyNavigationAvatarDisplayed(): Promise<void> {
    const userMenuButton = await this.getUserMenuButton();
    await expect(userMenuButton).toBeVisible();

    const avatar = await this.getNavigationAvatar();
    await expect(avatar).toBeVisible();
  }

  /**
   * Verify navigation avatar styling
   */
  async verifyNavigationAvatarStyling(): Promise<void> {
    const avatar = await this.getNavigationAvatar();
    
    // Should be circular
    await expect(avatar).toHaveCSS('border-radius', '50%');
    
    // Should have correct dimensions
    await expect(avatar).toHaveCSS('width', '32px');
    await expect(avatar).toHaveCSS('height', '32px');
    
    // Should have object-fit cover
    await expect(avatar).toHaveCSS('object-fit', 'cover');
  }

  /**
   * Get navigation avatar src
   */
  async getNavigationAvatarSrc(): Promise<string | null> {
    const avatar = await this.getNavigationAvatar();
    return await avatar.getAttribute('src');
  }

  /**
   * Verify user menu avatar matches navigation avatar
   */
  async verifyUserMenuAvatarMatches(): Promise<void> {
    // Get navigation avatar src
    const navAvatarSrc = await this.getNavigationAvatarSrc();
    
    // Open user menu
    await this.openUserMenu();
    
    // Get user menu avatar src
    const menuAvatar = await this.getUserMenuAvatar();
    const menuAvatarSrc = await menuAvatar.getAttribute('src');
    
    // Should match
    expect(navAvatarSrc).toEqual(menuAvatarSrc);
    
    // Close menu
    await this.closeUserMenu();
  }

  /**
   * Verify avatar accessibility
   */
  async verifyAvatarAccessibility(): Promise<void> {
    const userMenuButton = await this.getUserMenuButton();
    const avatar = await this.getNavigationAvatar();
    
    // Button should have proper attributes
    await expect(userMenuButton).toHaveAttribute('role', 'button');
    
    // Avatar should have alt text
    const altText = await avatar.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText).toContain('User'); // Should contain descriptive text
  }

  /**
   * Test avatar fallback behavior
   */
  async testAvatarFallback(): Promise<void> {
    const avatar = await this.getNavigationAvatar();
    const avatarSrc = await avatar.getAttribute('src');
    
    // Should have a src attribute
    expect(avatarSrc).toBeTruthy();
    
    // If not the expected avatar, should be fallback
    const isExpectedAvatar = avatarSrc?.includes('uploads/avatars/');
    const isDefaultAvatar = avatarSrc?.includes('/assets/images/avatars/default.png');
    
    expect(isExpectedAvatar || isDefaultAvatar).toBeTruthy();
  }

  /**
   * Take avatar screenshot in navigation
   */
  async takeNavigationAvatarScreenshot(name = 'navigation-avatar'): Promise<void> {
    const navigationBar = this.page.locator(this.selectors.navigationBar);
    await expect(navigationBar).toHaveScreenshot(`${name}.png`);
  }

  /**
   * Take user menu avatar screenshot
   */
  async takeUserMenuAvatarScreenshot(name = 'user-menu-avatar'): Promise<void> {
    await this.openUserMenu();
    
    const userMenu = this.page.locator(this.selectors.userMenu);
    await expect(userMenu).toHaveScreenshot(`${name}.png`);
    
    await this.closeUserMenu();
  }
}