import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReceiptInspectorsController } from './receipt-inspectors.controller';
import { ReceiptInspectorsService } from './receipt-inspectors.service';
import { ReceiptInspectorsRepository } from './receipt-inspectors.repository';
import { receiptInspectorsRoutes } from './receipt-inspectors.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ReceiptInspectors Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function receiptInspectorsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'receiptInspectors',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const receiptInspectorsRepository = new ReceiptInspectorsRepository(
      (fastify as any).knex,
    );
    const receiptInspectorsService = new ReceiptInspectorsService(
      receiptInspectorsRepository,
    );

    // Controller instantiation with proper dependencies
    const receiptInspectorsController = new ReceiptInspectorsController(
      receiptInspectorsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('receiptInspectorsService', receiptInspectorsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(receiptInspectorsRoutes, {
      controller: receiptInspectorsController,
      prefix: options.prefix || '/inventory/procurement/receipt-inspectors',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `ReceiptInspectors domain module registered successfully`,
      );
    });
  },
  {
    name: 'receiptInspectors-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './receipt-inspectors.schemas';
export * from './receipt-inspectors.types';
export { ReceiptInspectorsRepository } from './receipt-inspectors.repository';
export { ReceiptInspectorsService } from './receipt-inspectors.service';
export { ReceiptInspectorsController } from './receipt-inspectors.controller';

// Re-export commonly used types for external use
export type {
  ReceiptInspectors,
  CreateReceiptInspectors,
  UpdateReceiptInspectors,
  ReceiptInspectorsIdParam,
  GetReceiptInspectorsQuery,
  ListReceiptInspectorsQuery,
} from './receipt-inspectors.schemas';

// Module name constant
export const MODULE_NAME = 'receiptInspectors' as const;
