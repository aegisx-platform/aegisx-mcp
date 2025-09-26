/**
 * AegisX Platform API - Main Entry Point
 *
 * Enterprise-grade Fastify application with modular architecture,
 * comprehensive error handling, and production-ready features.
 *
 * Features:
 * - Environment validation
 * - Modular configuration management
 * - Plugin-based architecture
 * - Comprehensive error handling
 * - Performance monitoring
 * - Graceful shutdown handling
 */

import { bootstrap } from './bootstrap';

/**
 * Application entry point
 */
async function main() {
  try {
    await bootstrap();
  } catch (error) {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
  }
}

// Start the application
main();
