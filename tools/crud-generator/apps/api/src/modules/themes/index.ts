// Fastify Plugin
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { ThemesRepository } from './themes.repository';
import { themesRoutes } from './themes.routes';

// Main Plugin Export
export default fp(
  async function themesPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'themes',
        {} // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const themesRepository = new ThemesRepository((fastify as any).knex);
    const themesService = new ThemesService(
      themesRepository
    );
    const themesController = new ThemesController(themesService);

    // Register routes with controller dependency
    await fastify.register(themesRoutes, {
      controller: themesController,
      prefix: options.prefix || '/themes'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Themes module registered successfully`);
    });

  },
  {
    name: 'themes-plugin',
    dependencies: ['knex-plugin']
  }
);

// Export all public interfaces and types
export * from './themes.schemas';
export * from './themes.types';
export * from './themes.repository';
export * from './themes.service';
export * from './themes.controller';

// Re-export commonly used types for external use
export type {
  Themes,
  CreateThemes,
  UpdateThemes,
  ThemesIdParam,
  GetThemesQuery,
  ListThemesQuery,

} from './themes.schemas';

// Re-export repository and service interfaces
export type { ThemesRepository } from './themes.repository';
export type { ThemesService } from './themes.service';


// Module metadata
export const ThemesModule = {
  name: 'themes',
  version: '1.0.0',
  tableName: 'themes',
  hasEvents: false,
  dependencies: [
    'knex-plugin'
  ]
} as const;