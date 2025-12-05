import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugLotsController } from './drug-lots.controller';
import { DrugLotsService } from './drug-lots.service';
import { DrugLotsRepository } from './drug-lots.repository';
import { drugLotsRoutes } from './drug-lots.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugLots Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugLotsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugLots',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugLotsRepository = new DrugLotsRepository((fastify as any).knex);
    const drugLotsService = new DrugLotsService(drugLotsRepository);

    // Controller instantiation with proper dependencies
    const drugLotsController = new DrugLotsController(drugLotsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugLotsService', drugLotsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugLotsRoutes, {
      controller: drugLotsController,
      prefix: options.prefix || '/inventory/master-data/drug-lots',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugLots domain module registered successfully`);
    });
  },
  {
    name: 'drugLots-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-lots.schemas';
export * from './drug-lots.types';
export { DrugLotsRepository } from './drug-lots.repository';
export { DrugLotsService } from './drug-lots.service';
export { DrugLotsController } from './drug-lots.controller';

// Re-export commonly used types for external use
export type {
  DrugLots,
  CreateDrugLots,
  UpdateDrugLots,
  DrugLotsIdParam,
  GetDrugLotsQuery,
  ListDrugLotsQuery,
} from './drug-lots.schemas';

// Module name constant
export const MODULE_NAME = 'drugLots' as const;
