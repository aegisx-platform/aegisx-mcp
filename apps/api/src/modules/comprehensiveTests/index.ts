import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ComprehensiveTestsController } from './controllers/comprehensive-tests.controller';
import { ComprehensiveTestsService } from './services/comprehensive-tests.service';
import { ComprehensiveTestsRepository } from './repositories/comprehensive-tests.repository';
import { comprehensiveTestsRoutes } from './routes/index';
import { ExportService } from '../../services/export.service';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ComprehensiveTests Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function comprehensiveTestsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'comprehensiveTests',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const comprehensiveTestsRepository = new ComprehensiveTestsRepository(
      (fastify as any).knex,
    );
    const comprehensiveTestsService = new ComprehensiveTestsService(
      comprehensiveTestsRepository,
    );
    const exportService = new ExportService();
    const comprehensiveTestsController = new ComprehensiveTestsController(
      comprehensiveTestsService,
      exportService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('comprehensiveTestsService', comprehensiveTestsService);

    // Register routes with controller dependency
    await fastify.register(comprehensiveTestsRoutes, {
      controller: comprehensiveTestsController,
      prefix: options.prefix || '/comprehensive-tests',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `ComprehensiveTests domain module registered successfully`,
      );
    });
  },
  {
    name: 'comprehensiveTests-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/comprehensive-tests.schemas';
export * from './types/comprehensive-tests.types';
export { ComprehensiveTestsRepository } from './repositories/comprehensive-tests.repository';
export { ComprehensiveTestsService } from './services/comprehensive-tests.service';
export { ComprehensiveTestsController } from './controllers/comprehensive-tests.controller';

// Re-export commonly used types for external use
export type {
  ComprehensiveTests,
  CreateComprehensiveTests,
  UpdateComprehensiveTests,
  ComprehensiveTestsIdParam,
  GetComprehensiveTestsQuery,
  ListComprehensiveTestsQuery,
} from './schemas/comprehensive-tests.schemas';

// Module name constant
export const MODULE_NAME = 'comprehensiveTests' as const;
