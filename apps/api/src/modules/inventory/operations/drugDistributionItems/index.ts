import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugDistributionItemsController } from './drug-distribution-items.controller';
import { DrugDistributionItemsService } from './drug-distribution-items.service';
import { DrugDistributionItemsRepository } from './drug-distribution-items.repository';
import { drugDistributionItemsRoutes } from './drug-distribution-items.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugDistributionItems Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugDistributionItemsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugDistributionItems',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugDistributionItemsRepository = new DrugDistributionItemsRepository(
      (fastify as any).knex,
    );
    const drugDistributionItemsService = new DrugDistributionItemsService(
      drugDistributionItemsRepository,
    );

    // Controller instantiation with proper dependencies
    const drugDistributionItemsController = new DrugDistributionItemsController(
      drugDistributionItemsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugDistributionItemsService', drugDistributionItemsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugDistributionItemsRoutes, {
      controller: drugDistributionItemsController,
      prefix: options.prefix || '/inventory/operations/drug-distribution-items',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `DrugDistributionItems domain module registered successfully`,
      );
    });
  },
  {
    name: 'drugDistributionItems-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-distribution-items.schemas';
export * from './drug-distribution-items.types';
export { DrugDistributionItemsRepository } from './drug-distribution-items.repository';
export { DrugDistributionItemsService } from './drug-distribution-items.service';
export { DrugDistributionItemsController } from './drug-distribution-items.controller';

// Re-export commonly used types for external use
export type {
  DrugDistributionItems,
  CreateDrugDistributionItems,
  UpdateDrugDistributionItems,
  DrugDistributionItemsIdParam,
  GetDrugDistributionItemsQuery,
  ListDrugDistributionItemsQuery,
} from './drug-distribution-items.schemas';

// Module name constant
export const MODULE_NAME = 'drugDistributionItems' as const;
