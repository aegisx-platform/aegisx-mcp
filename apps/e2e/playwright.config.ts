import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/specs',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4200',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for each action */
    actionTimeout: 30000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs before other tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Chrome Desktop
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Firefox Desktop
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Safari Desktop
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Test without authentication (for login tests)
    {
      name: 'unauthenticated',
      use: { ...devices['Desktop Chrome'] },
    },

    // Visual regression tests
    {
      name: 'visual-regression',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*visual\.spec\.ts/,
    },

    // Accessibility tests
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*a11y\.spec\.ts/,
    },

    // Performance tests
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*performance\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'nx serve api',
      url: 'http://localhost:3333/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'nx serve web',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  /* Global test timeout */
  timeout: 30 * 1000,

  /* Maximum time one test can run */
  testTimeout: 60 * 1000,

  /* Expect timeout for assertions */
  expect: {
    /* Maximum time to wait for expect() assertions */
    timeout: 10 * 1000,

    /* Threshold for visual comparisons */
    threshold: 0.2,

    /* Maximum allowed pixel difference for screenshots */
    maxDiffPixels: 100,
  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Global setup files */
  globalSetup: './src/support/global-setup.ts',
  globalTeardown: './src/support/global-teardown.ts',
});