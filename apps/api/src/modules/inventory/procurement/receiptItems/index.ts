import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReceiptItemsController } from './receipt-items.controller';
import { ReceiptItemsService } from './receipt-items.service';
import { ReceiptItemsRepository } from './receipt-items.repository';
import { receiptItemsRoutes } from './receipt-items.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ReceiptItems Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function receiptItemsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'receiptItems',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const receiptItemsRepository = new ReceiptItemsRepository(
      (fastify as any).knex,
    );
    const receiptItemsService = new ReceiptItemsService(receiptItemsRepository);

    // Controller instantiation with proper dependencies
    const receiptItemsController = new ReceiptItemsController(
      receiptItemsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('receiptItemsService', receiptItemsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(receiptItemsRoutes, {
      controller: receiptItemsController,
      prefix: options.prefix || '/inventory/procurement/receipt-items',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ReceiptItems domain module registered successfully`);
    });
  },
  {
    name: 'receiptItems-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './receipt-items.schemas';
export * from './receipt-items.types';
export { ReceiptItemsRepository } from './receipt-items.repository';
export { ReceiptItemsService } from './receipt-items.service';
export { ReceiptItemsController } from './receipt-items.controller';

// Re-export commonly used types for external use
export type {
  ReceiptItems,
  CreateReceiptItems,
  UpdateReceiptItems,
  ReceiptItemsIdParam,
  GetReceiptItemsQuery,
  ListReceiptItemsQuery,
} from './receipt-items.schemas';

// Module name constant
export const MODULE_NAME = 'receiptItems' as const;
