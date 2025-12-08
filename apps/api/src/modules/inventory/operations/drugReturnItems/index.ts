import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugReturnItemsController } from './drug-return-items.controller';
import { DrugReturnItemsService } from './drug-return-items.service';
import { DrugReturnItemsRepository } from './drug-return-items.repository';
import { drugReturnItemsRoutes } from './drug-return-items.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugReturnItems Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugReturnItemsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugReturnItems',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugReturnItemsRepository = new DrugReturnItemsRepository(
      (fastify as any).knex,
    );
    const drugReturnItemsService = new DrugReturnItemsService(
      drugReturnItemsRepository,
    );

    // Controller instantiation with proper dependencies
    const drugReturnItemsController = new DrugReturnItemsController(
      drugReturnItemsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugReturnItemsService', drugReturnItemsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugReturnItemsRoutes, {
      controller: drugReturnItemsController,
      prefix: options.prefix || '/inventory/operations/drug-return-items',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugReturnItems domain module registered successfully`);
    });
  },
  {
    name: 'drugReturnItems-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-return-items.schemas';
export * from './drug-return-items.types';
export { DrugReturnItemsRepository } from './drug-return-items.repository';
export { DrugReturnItemsService } from './drug-return-items.service';
export { DrugReturnItemsController } from './drug-return-items.controller';

// Re-export commonly used types for external use
export type {
  DrugReturnItems,
  CreateDrugReturnItems,
  UpdateDrugReturnItems,
  DrugReturnItemsIdParam,
  GetDrugReturnItemsQuery,
  ListDrugReturnItemsQuery,
} from './drug-return-items.schemas';

// Module name constant
export const MODULE_NAME = 'drugReturnItems' as const;
