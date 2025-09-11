import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Clone 2 specific E2E configuration
 */
export default defineConfig({
  ...baseConfig,
  
  use: {
    ...baseConfig.use,
    /* Base URL for Clone 2 */
    baseURL: 'http://localhost:4203',
  },

  /* Reuse existing servers since they're already running */
  webServer: undefined,
});