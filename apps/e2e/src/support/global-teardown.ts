import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  try {
    // Clean up auth files
    const authDir = path.join(__dirname, '../fixtures/.auth');
    const authFile = path.join(authDir, 'user.json');

    try {
      await fs.unlink(authFile);
      console.log('🗑️  Cleaned up authentication state');
    } catch (_error) {
      // File might not exist, which is fine
      console.log('ℹ️  No authentication state to clean up');
    }

    // Additional cleanup can go here
    // - Clear test database records
    // - Reset application state
    // - Clean up uploaded files

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
}

export default globalTeardown;
