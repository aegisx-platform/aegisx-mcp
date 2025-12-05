import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationsRepository } from './locations.repository';
import { locationsRoutes } from './locations.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Locations Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function locationsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'locations',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const locationsRepository = new LocationsRepository((fastify as any).knex);
    const locationsService = new LocationsService(locationsRepository);

    // Controller instantiation with proper dependencies
    const locationsController = new LocationsController(locationsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('locationsService', locationsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(locationsRoutes, {
      controller: locationsController,
      prefix: options.prefix || '/inventory/master-data/locations',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Locations domain module registered successfully`);
    });
  },
  {
    name: 'locations-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './locations.schemas';
export * from './locations.types';
export { LocationsRepository } from './locations.repository';
export { LocationsService } from './locations.service';
export { LocationsController } from './locations.controller';

// Re-export commonly used types for external use
export type {
  Locations,
  CreateLocations,
  UpdateLocations,
  LocationsIdParam,
  GetLocationsQuery,
  ListLocationsQuery,
} from './locations.schemas';

// Module name constant
export const MODULE_NAME = 'locations' as const;
