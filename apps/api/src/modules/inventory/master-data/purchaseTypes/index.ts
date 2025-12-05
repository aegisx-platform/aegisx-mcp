import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PurchaseTypesController } from './purchase-types.controller';
import { PurchaseTypesService } from './purchase-types.service';
import { PurchaseTypesRepository } from './purchase-types.repository';
import { purchaseTypesRoutes } from './purchase-types.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * PurchaseTypes Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function purchaseTypesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'purchaseTypes',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const purchaseTypesRepository = new PurchaseTypesRepository(
      (fastify as any).knex,
    );
    const purchaseTypesService = new PurchaseTypesService(
      purchaseTypesRepository,
    );

    // Controller instantiation with proper dependencies
    const purchaseTypesController = new PurchaseTypesController(
      purchaseTypesService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('purchaseTypesService', purchaseTypesService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(purchaseTypesRoutes, {
      controller: purchaseTypesController,
      prefix: options.prefix || '/inventory/master-data/purchase-types',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`PurchaseTypes domain module registered successfully`);
    });
  },
  {
    name: 'purchaseTypes-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './purchase-types.schemas';
export * from './purchase-types.types';
export { PurchaseTypesRepository } from './purchase-types.repository';
export { PurchaseTypesService } from './purchase-types.service';
export { PurchaseTypesController } from './purchase-types.controller';

// Re-export commonly used types for external use
export type {
  PurchaseTypes,
  CreatePurchaseTypes,
  UpdatePurchaseTypes,
  PurchaseTypesIdParam,
  GetPurchaseTypesQuery,
  ListPurchaseTypesQuery,
} from './purchase-types.schemas';

// Module name constant
export const MODULE_NAME = 'purchaseTypes' as const;
