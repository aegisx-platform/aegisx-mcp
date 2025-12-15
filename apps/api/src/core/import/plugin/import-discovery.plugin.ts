/**
 * Import Discovery Plugin
 *
 * Fastify plugin for auto-discovering and registering import services.
 * Scans for *-import.service.ts files, instantiates services, builds dependency graph,
 * validates dependencies, and persists registry to database.
 *
 * Registration: fastify.decorate('importDiscovery', service)
 * Provides: ImportDiscoveryService singleton with full service registry
 *
 * Dependencies:
 * - knex-plugin (database access)
 * - logging-plugin (performance monitoring)
 *
 * Performance:
 * - Sub-100ms discovery for 30+ modules (target requirement)
 * - Async file scanning with Promise.all()
 * - Minimal overhead after initial discovery
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import {
  ImportDiscoveryService,
  createImportDiscoveryService,
} from '../discovery/import-discovery.service';

/**
 * Import Discovery Plugin Factory
 *
 * Lifecycle:
 * 1. Validate plugin dependencies (fastify.knex, fastify.log)
 * 2. Create ImportDiscoveryService instance
 * 3. Call discoverServices() - triggers:
 *    - File scanning for *-import.service.ts
 *    - Dynamic imports (decorator registration)
 *    - Registry building with service instances
 *    - Dependency graph construction
 *    - Circular dependency detection
 *    - Import order calculation (topological sort)
 *    - Database persistence
 * 4. Log discovery results with timing
 * 5. Decorate fastify instance with 'importDiscovery'
 * 6. Handle startup errors gracefully
 */
async function importDiscoveryPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Validate required dependencies
  if (!fastify.knex) {
    throw new Error(
      '[ImportDiscovery] Required dependency missing: fastify.knex. ' +
        'Make sure knex-plugin is registered before import-discovery-plugin',
    );
  }

  try {
    fastify.log.info(
      '[ImportDiscovery] Initializing auto-discovery service...',
    );

    // Create and initialize discovery service
    const discoveryService = await createImportDiscoveryService(
      fastify,
      fastify.knex,
    );

    // Log discovery results
    const allServices = discoveryService.getAllServices();
    const validationErrors = discoveryService.getValidationErrors();
    const circularDependencies = discoveryService.getCircularDependencies();

    // Summary log
    fastify.log.info(
      `[ImportDiscovery] Service discovery completed: ${allServices.length} services found`,
    );

    // Log validation errors if any
    if (validationErrors.length > 0) {
      fastify.log.error(
        `[ImportDiscovery] ${validationErrors.length} validation errors detected during discovery`,
      );
      validationErrors.forEach((error) => {
        fastify.log.error(`  - ${error}`);
      });
    }

    // Log circular dependencies if any
    if (circularDependencies.length > 0) {
      fastify.log.error(
        `[ImportDiscovery] ${circularDependencies.length} circular dependencies detected`,
      );
      circularDependencies.forEach((cd) => {
        fastify.log.error(`  - ${cd.path.join(' -> ')}`);
      });
    }

    // Log import order for UI guidance
    const importOrder = discoveryService.getImportOrderWithReasons();
    fastify.log.info(
      `[ImportDiscovery] Recommended import order calculated (${importOrder.length} modules)`,
    );

    // Decorate fastify instance with the discovery service singleton
    fastify.decorate('importDiscovery', discoveryService);

    // Add hook for graceful shutdown
    fastify.addHook('onClose', async () => {
      fastify.log.info(
        '[ImportDiscovery] Import discovery service shutting down',
      );
    });

    fastify.log.info('[ImportDiscovery] Plugin registered successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    fastify.log.error(
      `[ImportDiscovery] Failed to initialize discovery service: ${errorMessage}`,
    );

    // Log full stack trace for debugging
    if (error instanceof Error && error.stack) {
      fastify.log.debug(`[ImportDiscovery] Stack trace: ${error.stack}`);
    }

    // Gracefully degrade - log the error but allow server to start
    // This prevents server startup failure if imports aren't critical
    fastify.log.warn(
      '[ImportDiscovery] Starting server without import discovery. Check logs above for details.',
    );
  }
}

export default fp(importDiscoveryPlugin, {
  name: 'import-discovery-plugin',
  dependencies: [
    'knex-plugin',
    'logging-plugin', // For performance monitoring
  ],
});
