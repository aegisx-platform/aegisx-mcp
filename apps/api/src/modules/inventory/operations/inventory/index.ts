import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { inventoryRoutes } from './inventory.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Inventory Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function inventoryDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'inventory',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const inventoryRepository = new InventoryRepository((fastify as any).knex);
    const inventoryService = new InventoryService(inventoryRepository);

    // Controller instantiation with proper dependencies
    const inventoryController = new InventoryController(inventoryService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('inventoryService', inventoryService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(inventoryRoutes, {
      controller: inventoryController,
      prefix: options.prefix || '/inventory/operations/inventory',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Inventory domain module registered successfully`);
    });
  },
  {
    name: 'inventory-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './inventory.schemas';
export * from './inventory.types';
export { InventoryRepository } from './inventory.repository';
export { InventoryService } from './inventory.service';
export { InventoryController } from './inventory.controller';

// Re-export commonly used types for external use
export type {
  Inventory,
  CreateInventory,
  UpdateInventory,
  InventoryIdParam,
  GetInventoryQuery,
  ListInventoryQuery,
} from './inventory.schemas';

// Module name constant
export const MODULE_NAME = 'inventory' as const;
