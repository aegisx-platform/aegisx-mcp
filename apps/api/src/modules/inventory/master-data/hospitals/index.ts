import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { HospitalsRepository } from './hospitals.repository';
import { hospitalsRoutes } from './hospitals.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Hospitals Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function hospitalsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'hospitals',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const hospitalsRepository = new HospitalsRepository((fastify as any).knex);
    const hospitalsService = new HospitalsService(hospitalsRepository);

    // Controller instantiation with proper dependencies
    const hospitalsController = new HospitalsController(hospitalsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('hospitalsService', hospitalsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(hospitalsRoutes, {
      controller: hospitalsController,
      prefix: options.prefix || '/inventory/master-data/hospitals',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Hospitals domain module registered successfully`);
    });
  },
  {
    name: 'hospitals-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './hospitals.schemas';
export * from './hospitals.types';
export { HospitalsRepository } from './hospitals.repository';
export { HospitalsService } from './hospitals.service';
export { HospitalsController } from './hospitals.controller';

// Re-export commonly used types for external use
export type {
  Hospitals,
  CreateHospitals,
  UpdateHospitals,
  HospitalsIdParam,
  GetHospitalsQuery,
  ListHospitalsQuery,
} from './hospitals.schemas';

// Module name constant
export const MODULE_NAME = 'hospitals' as const;
