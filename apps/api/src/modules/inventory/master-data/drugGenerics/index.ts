import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugGenericsController } from './controllers/drug-generics.controller';
import { DrugGenericsService } from './services/drug-generics.service';
import { DrugGenericsRepository } from './repositories/drug-generics.repository';
import { drugGenericsRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugGenerics Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugGenericsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugGenerics',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugGenericsRepository = new DrugGenericsRepository(
      (fastify as any).knex,
    );
    const drugGenericsService = new DrugGenericsService(drugGenericsRepository);

    // Controller instantiation with proper dependencies
    const drugGenericsController = new DrugGenericsController(
      drugGenericsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugGenericsService', drugGenericsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugGenericsRoutes, {
      controller: drugGenericsController,
      prefix: options.prefix || '/inventory/master-data/drug-generics',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugGenerics domain module registered successfully`);
    });
  },
  {
    name: 'drugGenerics-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/drug-generics.schemas';
export * from './types/drug-generics.types';
export { DrugGenericsRepository } from './repositories/drug-generics.repository';
export { DrugGenericsService } from './services/drug-generics.service';
export { DrugGenericsController } from './controllers/drug-generics.controller';

// Re-export commonly used types for external use
export type {
  DrugGenerics,
  CreateDrugGenerics,
  UpdateDrugGenerics,
  DrugGenericsIdParam,
  GetDrugGenericsQuery,
  ListDrugGenericsQuery,
} from './schemas/drug-generics.schemas';

// Module name constant
export const MODULE_NAME = 'drugGenerics' as const;
