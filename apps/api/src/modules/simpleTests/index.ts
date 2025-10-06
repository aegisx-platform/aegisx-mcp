import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SimpleTestsController } from './controllers/simpleTests.controller';
import { SimpleTestsService } from './services/simpleTests.service';
import { SimpleTestsRepository } from './repositories/simpleTests.repository';
import { simpleTestsRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * SimpleTests Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function simpleTestsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'simpleTests',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const simpleTestsRepository = new SimpleTestsRepository(
      (fastify as any).knex,
    );
    const simpleTestsService = new SimpleTestsService(simpleTestsRepository);
    const simpleTestsController = new SimpleTestsController(simpleTestsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('simpleTestsService', simpleTestsService);

    // Register routes with controller dependency
    await fastify.register(simpleTestsRoutes, {
      controller: simpleTestsController,
      prefix: options.prefix || '/simple-tests',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`SimpleTests domain module registered successfully`);
    });
  },
  {
    name: 'simpleTests-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/simpleTests.schemas';
export * from './types/simpleTests.types';
export { SimpleTestsRepository } from './repositories/simpleTests.repository';
export { SimpleTestsService } from './services/simpleTests.service';
export { SimpleTestsController } from './controllers/simpleTests.controller';

// Re-export commonly used types for external use
export type {
  SimpleTests,
  CreateSimpleTests,
  UpdateSimpleTests,
  SimpleTestsIdParam,
  GetSimpleTestsQuery,
  ListSimpleTestsQuery,
} from './schemas/simpleTests.schemas';

// Module name constant
export const MODULE_NAME = 'simpleTests' as const;
