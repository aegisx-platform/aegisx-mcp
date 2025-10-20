import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthorsController } from './controllers/authors.controller';
import { AuthorsService } from './services/authors.service';
import { AuthorsRepository } from './repositories/authors.repository';
import { authorsRoutes } from './routes/index';
import { ExportService } from '../../services/export.service';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Authors Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function authorsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'authors',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const authorsRepository = new AuthorsRepository((fastify as any).knex);
    const authorsService = new AuthorsService(
      authorsRepository,
      (fastify as any).eventService,
    );
    const exportService = new ExportService();
    const authorsController = new AuthorsController(
      authorsService,
      exportService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('authorsService', authorsService);

    // Register routes with controller dependency
    await fastify.register(authorsRoutes, {
      controller: authorsController,
      prefix: options.prefix || '/authors',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Authors domain module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up Authors domain module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'authors-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/authors.schemas';
export * from './types/authors.types';
export { AuthorsRepository } from './repositories/authors.repository';
export { AuthorsService } from './services/authors.service';
export { AuthorsController } from './controllers/authors.controller';

// Re-export commonly used types for external use
export type {
  Authors,
  CreateAuthors,
  UpdateAuthors,
  AuthorsIdParam,
  GetAuthorsQuery,
  ListAuthorsQuery,
  AuthorsCreatedEvent,
  AuthorsUpdatedEvent,
  AuthorsDeletedEvent,
} from './schemas/authors.schemas';

// Event type definitions for external consumers
import { Authors } from './schemas/authors.schemas';

export interface AuthorsEventHandlers {
  onCreated?: (data: Authors) => void | Promise<void>;
  onUpdated?: (data: Authors) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface AuthorsWebSocketSubscription {
  subscribe(handlers: AuthorsEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'authors' as const;
