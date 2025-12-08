import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PurchaseOrderItemsController } from './purchase-order-items.controller';
import { PurchaseOrderItemsService } from './purchase-order-items.service';
import { PurchaseOrderItemsRepository } from './purchase-order-items.repository';
import { purchaseOrderItemsRoutes } from './purchase-order-items.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * PurchaseOrderItems Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function purchaseOrderItemsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'purchaseOrderItems',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const purchaseOrderItemsRepository = new PurchaseOrderItemsRepository(
      (fastify as any).knex,
    );
    const purchaseOrderItemsService = new PurchaseOrderItemsService(
      purchaseOrderItemsRepository,
    );

    // Controller instantiation with proper dependencies
    const purchaseOrderItemsController = new PurchaseOrderItemsController(
      purchaseOrderItemsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('purchaseOrderItemsService', purchaseOrderItemsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(purchaseOrderItemsRoutes, {
      controller: purchaseOrderItemsController,
      prefix: options.prefix || '/inventory/procurement/purchase-order-items',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `PurchaseOrderItems domain module registered successfully`,
      );
    });
  },
  {
    name: 'purchaseOrderItems-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './purchase-order-items.schemas';
export * from './purchase-order-items.types';
export { PurchaseOrderItemsRepository } from './purchase-order-items.repository';
export { PurchaseOrderItemsService } from './purchase-order-items.service';
export { PurchaseOrderItemsController } from './purchase-order-items.controller';

// Re-export commonly used types for external use
export type {
  PurchaseOrderItems,
  CreatePurchaseOrderItems,
  UpdatePurchaseOrderItems,
  PurchaseOrderItemsIdParam,
  GetPurchaseOrderItemsQuery,
  ListPurchaseOrderItemsQuery,
} from './purchase-order-items.schemas';

// Module name constant
export const MODULE_NAME = 'purchaseOrderItems' as const;
