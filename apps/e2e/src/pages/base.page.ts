import { Page, Locator, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from '../fixtures/test-data';

/**
 * Base Page Object Model
 * Contains common functionality shared across all pages
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be loaded
   */
  abstract waitForLoad(): Promise<void>;

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   */
  async screenshot(
    name: string,
    options?: { fullPage?: boolean },
  ): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: options?.fullPage ?? false,
    });
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(
    selector: string,
    timeout = TEST_TIMEOUTS.medium,
  ): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForElementHidden(
    selector: string,
    timeout = TEST_TIMEOUTS.medium,
  ): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({
        state: 'attached',
        timeout: 2000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click element with retry logic
   */
  async clickElement(
    selector: string,
    options?: { force?: boolean; timeout?: number },
  ): Promise<void> {
    const element = this.page.locator(selector);
    await element.click({
      force: options?.force ?? false,
      timeout: options?.timeout ?? TEST_TIMEOUTS.action,
    });
  }

  /**
   * Fill input field
   */
  async fillInput(
    selector: string,
    value: string,
    options?: { clear?: boolean },
  ): Promise<void> {
    const element = this.page.locator(selector);

    if (options?.clear !== false) {
      await element.clear();
    }

    await element.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(selector: string, checked = true): Promise<void> {
    const checkbox = this.page.locator(selector);
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  /**
   * Get text content of element
   */
  async getElementText(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    return (await element.textContent()) ?? '';
  }

  /**
   * Get element attribute value
   */
  async getElementAttribute(
    selector: string,
    attribute: string,
  ): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.getAttribute(attribute);
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.hover();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: TEST_TIMEOUTS.navigation,
    });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern);
  }

  /**
   * Verify current URL
   */
  async verifyUrl(expectedUrl: string | RegExp): Promise<void> {
    if (typeof expectedUrl === 'string') {
      await expect(this.page).toHaveURL(expectedUrl);
    } else {
      await expect(this.page).toHaveURL(expectedUrl);
    }
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verify element is hidden
   */
  async verifyElementHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Verify element text
   */
  async verifyElementText(
    selector: string,
    expectedText: string | RegExp,
  ): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  /**
   * Verify element contains text
   */
  async verifyElementContainsText(
    selector: string,
    expectedText: string,
  ): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Wait for element to have specific text
   */
  async waitForElementText(
    selector: string,
    expectedText: string,
    timeout = TEST_TIMEOUTS.medium,
  ): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText, {
      timeout,
    });
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text with keyboard
   */
  async typeText(text: string, delay = 100): Promise<void> {
    await this.page.keyboard.type(text, { delay });
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'networkidle' });
  }

  /**
   * Set viewport size for responsive testing
   */
  async setViewportSize(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Evaluate JavaScript in page context
   */
  async evaluateJs<T>(script: string | (() => T), arg?: any): Promise<T> {
    return await this.page.evaluate(script, arg);
  }

  /**
   * Add custom CSS to page
   */
  async addStyle(css: string): Promise<void> {
    await this.page.addStyleTag({ content: css });
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string | RegExp, response: any): Promise<void> {
    await this.page.route(url, (route) => {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Intercept network request
   */
  async interceptRequest(
    url: string | RegExp,
    handler: (request: any) => void,
  ): Promise<void> {
    await this.page.route(url, handler);
  }
}
