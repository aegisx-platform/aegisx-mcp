import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsRepository } from './purchase-requests.repository';
import { purchaseRequestsRoutes } from './purchase-requests.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * PurchaseRequests Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function purchaseRequestsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'purchaseRequests',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const purchaseRequestsRepository = new PurchaseRequestsRepository(
      (fastify as any).knex,
    );
    const purchaseRequestsService = new PurchaseRequestsService(
      purchaseRequestsRepository,
    );

    // Controller instantiation with proper dependencies
    const purchaseRequestsController = new PurchaseRequestsController(
      purchaseRequestsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('purchaseRequestsService', purchaseRequestsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(purchaseRequestsRoutes, {
      controller: purchaseRequestsController,
      prefix: options.prefix || '/inventory/procurement/purchase-requests',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `PurchaseRequests domain module registered successfully`,
      );
    });
  },
  {
    name: 'purchaseRequests-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './purchase-requests.schemas';
export * from './purchase-requests.types';
export { PurchaseRequestsRepository } from './purchase-requests.repository';
export { PurchaseRequestsService } from './purchase-requests.service';
export { PurchaseRequestsController } from './purchase-requests.controller';

// Re-export commonly used types for external use
export type {
  PurchaseRequests,
  CreatePurchaseRequests,
  UpdatePurchaseRequests,
  PurchaseRequestsIdParam,
  GetPurchaseRequestsQuery,
  ListPurchaseRequestsQuery,
} from './purchase-requests.schemas';

// Module name constant
export const MODULE_NAME = 'purchaseRequests' as const;
