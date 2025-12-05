import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DistributionTypesController } from './distribution-types.controller';
import { DistributionTypesService } from './distribution-types.service';
import { DistributionTypesRepository } from './distribution-types.repository';
import { distributionTypesRoutes } from './distribution-types.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DistributionTypes Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function distributionTypesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'distributionTypes',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const distributionTypesRepository = new DistributionTypesRepository(
      (fastify as any).knex,
    );
    const distributionTypesService = new DistributionTypesService(
      distributionTypesRepository,
    );

    // Controller instantiation with proper dependencies
    const distributionTypesController = new DistributionTypesController(
      distributionTypesService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('distributionTypesService', distributionTypesService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(distributionTypesRoutes, {
      controller: distributionTypesController,
      prefix: options.prefix || '/inventory/master-data/distribution-types',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `DistributionTypes domain module registered successfully`,
      );
    });
  },
  {
    name: 'distributionTypes-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './distribution-types.schemas';
export * from './distribution-types.types';
export { DistributionTypesRepository } from './distribution-types.repository';
export { DistributionTypesService } from './distribution-types.service';
export { DistributionTypesController } from './distribution-types.controller';

// Re-export commonly used types for external use
export type {
  DistributionTypes,
  CreateDistributionTypes,
  UpdateDistributionTypes,
  DistributionTypesIdParam,
  GetDistributionTypesQuery,
  ListDistributionTypesQuery,
} from './distribution-types.schemas';

// Module name constant
export const MODULE_NAME = 'distributionTypes' as const;
