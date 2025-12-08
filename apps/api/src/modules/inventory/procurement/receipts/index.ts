import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptsRepository } from './receipts.repository';
import { receiptsRoutes } from './receipts.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Receipts Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function receiptsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'receipts',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const receiptsRepository = new ReceiptsRepository((fastify as any).knex);
    const receiptsService = new ReceiptsService(receiptsRepository);

    // Controller instantiation with proper dependencies
    const receiptsController = new ReceiptsController(receiptsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('receiptsService', receiptsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(receiptsRoutes, {
      controller: receiptsController,
      prefix: options.prefix || '/inventory/procurement/receipts',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Receipts domain module registered successfully`);
    });
  },
  {
    name: 'receipts-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './receipts.schemas';
export * from './receipts.types';
export { ReceiptsRepository } from './receipts.repository';
export { ReceiptsService } from './receipts.service';
export { ReceiptsController } from './receipts.controller';

// Re-export commonly used types for external use
export type {
  Receipts,
  CreateReceipts,
  UpdateReceipts,
  ReceiptsIdParam,
  GetReceiptsQuery,
  ListReceiptsQuery,
} from './receipts.schemas';

// Module name constant
export const MODULE_NAME = 'receipts' as const;
