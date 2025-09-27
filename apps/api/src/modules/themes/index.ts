import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ThemesController } from './controllers/themes.controller';
import { ThemesService } from './services/themes.service';
import { ThemesRepository } from './repositories/themes.repository';
import { themesRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Themes Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function themesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'themes',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const themesRepository = new ThemesRepository((fastify as any).knex);
    const themesService = new ThemesService(themesRepository);
    const themesController = new ThemesController(themesService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('themesService', themesService);

    // Register routes with controller dependency
    await fastify.register(themesRoutes, {
      controller: themesController,
      prefix: options.prefix || '/themes',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Themes domain module registered successfully`);
    });
  },
  {
    name: 'themes-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/themes.schemas';
export * from './types/themes.types';
export { ThemesRepository } from './repositories/themes.repository';
export { ThemesService } from './services/themes.service';
export { ThemesController } from './controllers/themes.controller';

// Re-export commonly used types for external use
export type {
  Themes,
  CreateThemes,
  UpdateThemes,
  ThemesIdParam,
  GetThemesQuery,
  ListThemesQuery,
} from './schemas/themes.schemas';

// Module name constant
export const MODULE_NAME = 'themes' as const;
