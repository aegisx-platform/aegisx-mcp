// Global test setup for API tests

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Ensure proper cleanup of resources
if (typeof afterAll !== 'undefined') {
  afterAll(async () => {
    // Give any pending operations time to complete
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Suppress console logs during tests unless debugging
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}
