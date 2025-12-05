import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ReturnActionsController } from './return-actions.controller';
import { ReturnActionsService } from './return-actions.service';
import { ReturnActionsRepository } from './return-actions.repository';
import { returnActionsRoutes } from './return-actions.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ReturnActions Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function returnActionsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'returnActions',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const returnActionsRepository = new ReturnActionsRepository(
      (fastify as any).knex,
    );
    const returnActionsService = new ReturnActionsService(
      returnActionsRepository,
    );

    // Controller instantiation with proper dependencies
    const returnActionsController = new ReturnActionsController(
      returnActionsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('returnActionsService', returnActionsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(returnActionsRoutes, {
      controller: returnActionsController,
      prefix: options.prefix || '/inventory/master-data/return-actions',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ReturnActions domain module registered successfully`);
    });
  },
  {
    name: 'returnActions-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './return-actions.schemas';
export * from './return-actions.types';
export { ReturnActionsRepository } from './return-actions.repository';
export { ReturnActionsService } from './return-actions.service';
export { ReturnActionsController } from './return-actions.controller';

// Re-export commonly used types for external use
export type {
  ReturnActions,
  CreateReturnActions,
  UpdateReturnActions,
  ReturnActionsIdParam,
  GetReturnActionsQuery,
  ListReturnActionsQuery,
} from './return-actions.schemas';

// Module name constant
export const MODULE_NAME = 'returnActions' as const;
