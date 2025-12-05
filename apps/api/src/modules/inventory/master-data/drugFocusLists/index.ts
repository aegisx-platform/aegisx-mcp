import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugFocusListsController } from './drug-focus-lists.controller';
import { DrugFocusListsService } from './drug-focus-lists.service';
import { DrugFocusListsRepository } from './drug-focus-lists.repository';
import { drugFocusListsRoutes } from './drug-focus-lists.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugFocusLists Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugFocusListsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugFocusLists',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugFocusListsRepository = new DrugFocusListsRepository(
      (fastify as any).knex,
    );
    const drugFocusListsService = new DrugFocusListsService(
      drugFocusListsRepository,
    );

    // Controller instantiation with proper dependencies
    const drugFocusListsController = new DrugFocusListsController(
      drugFocusListsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugFocusListsService', drugFocusListsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugFocusListsRoutes, {
      controller: drugFocusListsController,
      prefix: options.prefix || '/inventory/master-data/drug-focus-lists',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugFocusLists domain module registered successfully`);
    });
  },
  {
    name: 'drugFocusLists-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-focus-lists.schemas';
export * from './drug-focus-lists.types';
export { DrugFocusListsRepository } from './drug-focus-lists.repository';
export { DrugFocusListsService } from './drug-focus-lists.service';
export { DrugFocusListsController } from './drug-focus-lists.controller';

// Re-export commonly used types for external use
export type {
  DrugFocusLists,
  CreateDrugFocusLists,
  UpdateDrugFocusLists,
  DrugFocusListsIdParam,
  GetDrugFocusListsQuery,
  ListDrugFocusListsQuery,
} from './drug-focus-lists.schemas';

// Module name constant
export const MODULE_NAME = 'drugFocusLists' as const;
