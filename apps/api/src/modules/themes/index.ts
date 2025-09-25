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
      themesRepository,
      (fastify as any).eventService
    );
    const themesController = new ThemesController(themesService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('themesService', themesService);

    // Register routes with controller dependency
    await fastify.register(themesRoutes, {
      controller: themesController,
      prefix: options.prefix || '/api/themes'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Themes domain module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up Themes domain module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'themes-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin']
  }
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
  ThemesCreatedEvent,
  ThemesUpdatedEvent,
  ThemesDeletedEvent
} from './schemas/themes.schemas';

// Event type definitions for external consumers
import { Themes } from './schemas/themes.schemas';

export interface ThemesEventHandlers {
  onCreated?: (data: Themes) => void | Promise<void>;
  onUpdated?: (data: Themes) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface ThemesWebSocketSubscription {
  subscribe(handlers: ThemesEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'themes' as const;