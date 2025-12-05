import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugPackRatiosController } from './drug-pack-ratios.controller';
import { DrugPackRatiosService } from './drug-pack-ratios.service';
import { DrugPackRatiosRepository } from './drug-pack-ratios.repository';
import { drugPackRatiosRoutes } from './drug-pack-ratios.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugPackRatios Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugPackRatiosDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugPackRatios',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugPackRatiosRepository = new DrugPackRatiosRepository(
      (fastify as any).knex,
    );
    const drugPackRatiosService = new DrugPackRatiosService(
      drugPackRatiosRepository,
    );

    // Controller instantiation with proper dependencies
    const drugPackRatiosController = new DrugPackRatiosController(
      drugPackRatiosService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugPackRatiosService', drugPackRatiosService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugPackRatiosRoutes, {
      controller: drugPackRatiosController,
      prefix: options.prefix || '/inventory/master-data/drug-pack-ratios',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugPackRatios domain module registered successfully`);
    });
  },
  {
    name: 'drugPackRatios-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-pack-ratios.schemas';
export * from './drug-pack-ratios.types';
export { DrugPackRatiosRepository } from './drug-pack-ratios.repository';
export { DrugPackRatiosService } from './drug-pack-ratios.service';
export { DrugPackRatiosController } from './drug-pack-ratios.controller';

// Re-export commonly used types for external use
export type {
  DrugPackRatios,
  CreateDrugPackRatios,
  UpdateDrugPackRatios,
  DrugPackRatiosIdParam,
  GetDrugPackRatiosQuery,
  ListDrugPackRatiosQuery,
} from './drug-pack-ratios.schemas';

// Module name constant
export const MODULE_NAME = 'drugPackRatios' as const;
