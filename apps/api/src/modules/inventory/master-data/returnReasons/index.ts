import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReturnReasonsController } from './return-reasons.controller';
import { ReturnReasonsService } from './return-reasons.service';
import { ReturnReasonsRepository } from './return-reasons.repository';
import { returnReasonsRoutes } from './return-reasons.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ReturnReasons Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function returnReasonsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'returnReasons',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const returnReasonsRepository = new ReturnReasonsRepository(
      (fastify as any).knex,
    );
    const returnReasonsService = new ReturnReasonsService(
      returnReasonsRepository,
    );

    // Controller instantiation with proper dependencies
    const returnReasonsController = new ReturnReasonsController(
      returnReasonsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('returnReasonsService', returnReasonsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(returnReasonsRoutes, {
      controller: returnReasonsController,
      prefix: options.prefix || '/inventory/master-data/return-reasons',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ReturnReasons domain module registered successfully`);
    });
  },
  {
    name: 'returnReasons-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './return-reasons.schemas';
export * from './return-reasons.types';
export { ReturnReasonsRepository } from './return-reasons.repository';
export { ReturnReasonsService } from './return-reasons.service';
export { ReturnReasonsController } from './return-reasons.controller';

// Re-export commonly used types for external use
export type {
  ReturnReasons,
  CreateReturnReasons,
  UpdateReturnReasons,
  ReturnReasonsIdParam,
  GetReturnReasonsQuery,
  ListReturnReasonsQuery,
} from './return-reasons.schemas';

// Module name constant
export const MODULE_NAME = 'returnReasons' as const;
