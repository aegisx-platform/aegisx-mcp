import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersRepository } from './purchase-orders.repository';
import { purchaseOrdersRoutes } from './purchase-orders.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * PurchaseOrders Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function purchaseOrdersDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'purchaseOrders',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const purchaseOrdersRepository = new PurchaseOrdersRepository(
      (fastify as any).knex,
    );
    const purchaseOrdersService = new PurchaseOrdersService(
      purchaseOrdersRepository,
    );

    // Controller instantiation with proper dependencies
    const purchaseOrdersController = new PurchaseOrdersController(
      purchaseOrdersService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('purchaseOrdersService', purchaseOrdersService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(purchaseOrdersRoutes, {
      controller: purchaseOrdersController,
      prefix: options.prefix || '/inventory/procurement/purchase-orders',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`PurchaseOrders domain module registered successfully`);
    });
  },
  {
    name: 'purchaseOrders-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './purchase-orders.schemas';
export * from './purchase-orders.types';
export { PurchaseOrdersRepository } from './purchase-orders.repository';
export { PurchaseOrdersService } from './purchase-orders.service';
export { PurchaseOrdersController } from './purchase-orders.controller';

// Re-export commonly used types for external use
export type {
  PurchaseOrders,
  CreatePurchaseOrders,
  UpdatePurchaseOrders,
  PurchaseOrdersIdParam,
  GetPurchaseOrdersQuery,
  ListPurchaseOrdersQuery,
} from './purchase-orders.schemas';

// Module name constant
export const MODULE_NAME = 'purchaseOrders' as const;
