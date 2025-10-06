import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SimpletestController } from './controllers/simpletest.controller';
import { SimpletestService } from './services/simpletest.service';
import { SimpletestRepository } from './repositories/simpletest.repository';
import { simpletestRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Simpletest Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function simpletestDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'simpletest',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const simpletestRepository = new SimpletestRepository(
      (fastify as any).knex,
    );
    const simpletestService = new SimpletestService(simpletestRepository);
    const simpletestController = new SimpletestController(simpletestService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('simpletestService', simpletestService);

    // Register routes with controller dependency
    await fastify.register(simpletestRoutes, {
      controller: simpletestController,
      prefix: options.prefix || '/simpletest',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Simpletest domain module registered successfully`);
    });
  },
  {
    name: 'simpletest-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/simpletest.schemas';
export * from './types/simpletest.types';
export { SimpletestRepository } from './repositories/simpletest.repository';
export { SimpletestService } from './services/simpletest.service';
export { SimpletestController } from './controllers/simpletest.controller';

// Re-export commonly used types for external use
export type {
  Simpletest,
  CreateSimpletest,
  UpdateSimpletest,
  SimpletestIdParam,
  GetSimpletestQuery,
  ListSimpletestQuery,
} from './schemas/simpletest.schemas';

// Module name constant
export const MODULE_NAME = 'simpletest' as const;
