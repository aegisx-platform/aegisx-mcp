import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TestCategoriesController } from './controllers/test-categories.controller';
import { TestCategoriesService } from './services/test-categories.service';
import { TestCategoriesRepository } from './repositories/test-categories.repository';
import { testCategoriesRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * TestCategories Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function testCategoriesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'testCategories',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const testCategoriesRepository = new TestCategoriesRepository(
      (fastify as any).knex,
    );
    const testCategoriesService = new TestCategoriesService(
      testCategoriesRepository,
    );

    // Controller instantiation with proper dependencies
    const testCategoriesController = new TestCategoriesController(
      testCategoriesService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('testCategoriesService', testCategoriesService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(testCategoriesRoutes, {
      controller: testCategoriesController,
      prefix: options.prefix || '/test-categories',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`TestCategories domain module registered successfully`);
    });
  },
  {
    name: 'testCategories-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/test-categories.schemas';
export * from './types/test-categories.types';
export { TestCategoriesRepository } from './repositories/test-categories.repository';
export { TestCategoriesService } from './services/test-categories.service';
export { TestCategoriesController } from './controllers/test-categories.controller';

// Re-export commonly used types for external use
export type {
  TestCategories,
  CreateTestCategories,
  UpdateTestCategories,
  TestCategoriesIdParam,
  GetTestCategoriesQuery,
  ListTestCategoriesQuery,
} from './schemas/test-categories.schemas';

// Module name constant
export const MODULE_NAME = 'testCategories' as const;
