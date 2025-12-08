import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { InventoryTransactionsController } from './inventory-transactions.controller';
import { InventoryTransactionsService } from './inventory-transactions.service';
import { InventoryTransactionsRepository } from './inventory-transactions.repository';
import { inventoryTransactionsRoutes } from './inventory-transactions.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * InventoryTransactions Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function inventoryTransactionsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'inventoryTransactions',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const inventoryTransactionsRepository = new InventoryTransactionsRepository(
      (fastify as any).knex,
    );
    const inventoryTransactionsService = new InventoryTransactionsService(
      inventoryTransactionsRepository,
    );

    // Controller instantiation with proper dependencies
    const inventoryTransactionsController = new InventoryTransactionsController(
      inventoryTransactionsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('inventoryTransactionsService', inventoryTransactionsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(inventoryTransactionsRoutes, {
      controller: inventoryTransactionsController,
      prefix: options.prefix || '/inventory/operations/inventory-transactions',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `InventoryTransactions domain module registered successfully`,
      );
    });
  },
  {
    name: 'inventoryTransactions-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './inventory-transactions.schemas';
export * from './inventory-transactions.types';
export { InventoryTransactionsRepository } from './inventory-transactions.repository';
export { InventoryTransactionsService } from './inventory-transactions.service';
export { InventoryTransactionsController } from './inventory-transactions.controller';

// Re-export commonly used types for external use
export type {
  InventoryTransactions,
  CreateInventoryTransactions,
  UpdateInventoryTransactions,
  InventoryTransactionsIdParam,
  GetInventoryTransactionsQuery,
  ListInventoryTransactionsQuery,
} from './inventory-transactions.schemas';

// Module name constant
export const MODULE_NAME = 'inventoryTransactions' as const;
