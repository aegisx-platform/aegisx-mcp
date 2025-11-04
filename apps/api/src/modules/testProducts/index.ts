import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TestProductsController } from './controllers/test-products.controller';
import { TestProductsService } from './services/test-products.service';
import { TestProductsRepository } from './repositories/test-products.repository';
import { testProductsRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * TestProducts Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function testProductsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'testProducts',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const testProductsRepository = new TestProductsRepository(
      (fastify as any).knex,
    );
    const testProductsService = new TestProductsService(testProductsRepository);

    // Controller instantiation with proper dependencies
    const testProductsController = new TestProductsController(
      testProductsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('testProductsService', testProductsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(testProductsRoutes, {
      controller: testProductsController,
      prefix: options.prefix || '/test-products',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`TestProducts domain module registered successfully`);
    });
  },
  {
    name: 'testProducts-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/test-products.schemas';
export * from './types/test-products.types';
export { TestProductsRepository } from './repositories/test-products.repository';
export { TestProductsService } from './services/test-products.service';
export { TestProductsController } from './controllers/test-products.controller';

// Re-export commonly used types for external use
export type {
  TestProducts,
  CreateTestProducts,
  UpdateTestProducts,
  TestProductsIdParam,
  GetTestProductsQuery,
  ListTestProductsQuery,
} from './schemas/test-products.schemas';

// Module name constant
export const MODULE_NAME = 'testProducts' as const;
