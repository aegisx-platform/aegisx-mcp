import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './controllers/drugs.controller';
import { DrugsService } from './services/drugs.service';
import { DrugsRepository } from './repositories/drugs.repository';
import { drugsRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Drugs Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugs',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugsRepository = new DrugsRepository((fastify as any).knex);
    const drugsService = new DrugsService(drugsRepository);

    // Controller instantiation with proper dependencies
    const drugsController = new DrugsController(drugsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugsService', drugsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugsRoutes, {
      controller: drugsController,
      prefix: options.prefix || '/inventory/master-data/drugs',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Drugs domain module registered successfully`);
    });
  },
  {
    name: 'drugs-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/drugs.schemas';
export * from './types/drugs.types';
export { DrugsRepository } from './repositories/drugs.repository';
export { DrugsService } from './services/drugs.service';
export { DrugsController } from './controllers/drugs.controller';

// Re-export commonly used types for external use
export type {
  Drugs,
  CreateDrugs,
  UpdateDrugs,
  DrugsIdParam,
  GetDrugsQuery,
  ListDrugsQuery,
} from './schemas/drugs.schemas';

// Module name constant
export const MODULE_NAME = 'drugs' as const;
