# Testing Strategy & Playwright E2E

## Testing Strategy

### Unit Tests (80% coverage)

- All business logic
- Services and repositories
- Components and directives

### Integration Tests

- API endpoints
- Database operations
- Authentication flow

### E2E Tests (Critical paths + Visual Testing)

- User login/logout with screenshots
- CRUD operations with visual verification
- Permission checks with UI validation
- User journeys with visual regression
- Responsive design testing
- Dark mode testing
- Accessibility compliance

## 🎭 E2E Testing with Playwright MCP

### Playwright MCP Integration

Claude can use Playwright MCP to:

- **See the UI** - Take screenshots and analyze visual elements
- **Interact with UI** - Click, type, navigate through the app
- **Visual Testing** - Compare screenshots for visual regression
- **Debug Issues** - See exactly what's happening in the browser

### Setup Playwright MCP

#### 1. Install Playwright MCP Server

```bash
# Install globally
npm install -g @modelcontextprotocol/server-playwright

# Or add to project
yarn add -D @modelcontextprotocol/server-playwright
```

#### 2. Configure MCP in Claude Desktop

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "playwright": {
      "command": "mcp-server-playwright",
      "args": ["--headed"], // Show browser window
      "env": {
        "DEBUG": "playwright:*"
      }
    }
  }
}
```

#### 3. E2E Test Structure

```
e2e/
├── web-e2e/
│   ├── src/
│   │   ├── fixtures/
│   │   │   ├── test-base.ts      # Base test setup
│   │   │   └── users.fixture.ts  # Test data
│   │   ├── pages/                # Page Object Model
│   │   │   ├── login.page.ts
│   │   │   ├── user-list.page.ts
│   │   │   └── user-form.page.ts
│   │   ├── specs/                # Test specs
│   │   │   ├── auth.spec.ts
│   │   │   ├── user-crud.spec.ts
│   │   │   └── visual.spec.ts
│   │   └── support/
│   │       ├── helpers.ts
│   │       └── commands.ts
│   ├── playwright.config.ts
│   └── .env.e2e
├── admin-e2e/
└── api-e2e/
```

### Playwright Test Examples

#### Page Object Model

```typescript
// pages/user-list.page.ts
import { Page, Locator } from '@playwright/test';

export class UserListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly addButton: Locator;
  readonly userTable: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByLabel('Search users');
    this.addButton = page.getByRole('button', { name: /add user/i });
    this.userTable = page.getByRole('table');
    this.pagination = page.getByTestId('pagination');
  }

  async goto() {
    await this.page.goto('/users');
    await this.page.waitForLoadState('networkidle');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500); // Debounce
  }

  async clickAddUser() {
    await this.addButton.click();
  }

  async getUserRows() {
    return this.userTable.locator('tbody tr');
  }

  async selectUser(index: number) {
    const rows = await this.getUserRows();
    await rows.nth(index).click();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
```

#### E2E Test Spec

```typescript
// specs/user-crud.spec.ts
import { test, expect } from '@playwright/test';
import { UserListPage } from '../pages/user-list.page';
import { UserFormPage } from '../pages/user-form.page';

test.describe('User Management', () => {
  let listPage: UserListPage;
  let formPage: UserFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new UserListPage(page);
    formPage = new UserFormPage(page);

    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new user', async ({ page }) => {
    await listPage.goto();

    // Take screenshot of initial state
    await listPage.takeScreenshot('user-list-initial');

    // Navigate to form
    await listPage.clickAddUser();
    await expect(page).toHaveURL('/users/new');

    // Fill form
    await formPage.fillForm({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'User',
    });

    // Take screenshot of filled form
    await formPage.takeScreenshot('user-form-filled');

    // Submit
    await formPage.submit();

    // Verify redirect and new user appears
    await expect(page).toHaveURL('/users');
    const rows = await listPage.getUserRows();
    await expect(rows).toHaveCount((await rows.count()) + 1);

    // Visual assertion
    await expect(page).toHaveScreenshot('user-list-after-create.png');
  });

  test('should search users', async ({ page }) => {
    await listPage.goto();

    // Search
    await listPage.search('john');

    // Wait for results
    await page.waitForTimeout(1000);

    // Verify filtered results
    const rows = await listPage.getUserRows();
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('john');
    }

    // Visual regression test
    await expect(page).toHaveScreenshot('user-search-results.png', {
      maxDiffPixels: 100,
    });
  });
});
```

#### Visual Regression Testing

```typescript
// specs/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('user list page', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Full page screenshot
    await expect(page).toHaveScreenshot('user-list-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('responsive design', async ({ page }) => {
    await page.goto('/users');

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('user-list-desktop.png');

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('user-list-tablet.png');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('user-list-mobile.png');
  });

  test('dark mode', async ({ page }) => {
    await page.goto('/users');

    // Toggle dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for transition

    await expect(page).toHaveScreenshot('user-list-dark.png');
  });
});
```

### Playwright MCP Commands for Claude

#### **`/test visual [page]`** - Run visual test

```bash
# Example: /test visual user-list
# Claude will:
1. Navigate to page
2. Take screenshot
3. Compare with baseline
4. Report differences
```

#### **`/test e2e [feature]`** - Run E2E tests

```bash
# Example: /test e2e user-management
# Runs all E2E tests for the feature
```

#### **`/test interact [action]`** - Interactive testing

```bash
# Example: /test interact "click add button"
# Claude controls browser interactively
```

#### **`/test screenshot [name]`** - Capture screenshot

```bash
# Example: /test screenshot current-state
# Takes screenshot of current browser state
```

#### **`/test debug [issue]`** - Debug with visual

```bash
# Example: /test debug "button not clickable"
# Claude analyzes the UI to find issue
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }], ['junit', { outputFile: 'junit.xml' }]],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'nx serve web',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Visual Testing Workflow

1. **Baseline Creation**

   ```bash
   # Create baseline screenshots
   npx playwright test --update-snapshots
   ```

2. **Run Visual Tests**

   ```bash
   # Compare against baseline
   npx playwright test specs/visual.spec.ts
   ```

3. **Review Differences**
   ```bash
   # Open HTML report
   npx playwright show-report
   ```

### Accessibility Testing

```typescript
// specs/a11y.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('user list page', async ({ page }) => {
    await page.goto('/users');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
});
```

### Integration with CI/CD

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: yarn install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: yarn e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
```

### Best Practices for E2E with MCP

1. **Use Page Object Model** - Maintainable test structure
2. **Data Test IDs** - Add `data-testid` attributes for reliable selectors
3. **Wait Strategies** - Use proper wait conditions, not fixed timeouts
4. **Parallel Execution** - Run tests in parallel for speed
5. **Visual Baselines** - Keep baseline images in version control
6. **Flaky Test Handling** - Implement retry logic
7. **Test Data Management** - Use fixtures and factories
8. **Clean State** - Reset database between tests
