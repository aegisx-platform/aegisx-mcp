import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TestProductsController } from './controllers/test-products.controller';
import { TestProductsService } from './services/test-products.service';
import { TestProductsRepository } from './repositories/test-products.repository';
import { testProductsRoutes } from './routes/index';
import { testProductsImportRoutes } from './routes/test-products-import.routes';
import { TestProductsImportService } from './services/test-products-import.service';

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
    const testProductsService = new TestProductsService(
      testProductsRepository,
      (fastify as any).eventService,
    );
    const testProductsImportService = new TestProductsImportService(
      (fastify as any).knex,
      testProductsRepository,
      (fastify as any).eventService, // Pass eventService for import progress events
    );

    // Controller instantiation with proper dependencies
    const testProductsController = new TestProductsController(
      testProductsService,
      testProductsImportService,
      (fastify as any).eventService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('testProductsService', testProductsService);

    // ⚠️ IMPORTANT: Register import routes FIRST (before main routes)
    // Import routes have static paths like /export, /import/template
    // They must be registered before dynamic routes like /:id
    // Otherwise /:id will match everything including /export
    await fastify.register(testProductsImportRoutes, {
      controller: testProductsController,
      prefix: options.prefix || '/test-products',
    });

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(testProductsRoutes, {
      controller: testProductsController,
      prefix: options.prefix || '/test-products',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`TestProducts domain module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up TestProducts domain module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'testProducts-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin'],
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
  TestProductsCreatedEvent,
  TestProductsUpdatedEvent,
  TestProductsDeletedEvent,
} from './schemas/test-products.schemas';

// Event type definitions for external consumers
import { TestProducts } from './schemas/test-products.schemas';

export interface TestProductsEventHandlers {
  onCreated?: (data: TestProducts) => void | Promise<void>;
  onUpdated?: (data: TestProducts) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface TestProductsWebSocketSubscription {
  subscribe(handlers: TestProductsEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'testProducts' as const;
