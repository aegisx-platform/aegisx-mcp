import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BooksController } from './controllers/books.controller';
import { BooksService } from './services/books.service';
import { BooksRepository } from './repositories/books.repository';
import { booksRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Books Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function booksDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'books',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const booksRepository = new BooksRepository((fastify as any).knex);
    const booksService = new BooksService(booksRepository);
    const booksController = new BooksController(booksService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('booksService', booksService);

    // Register routes with controller dependency
    await fastify.register(booksRoutes, {
      controller: booksController,
      prefix: options.prefix || '/books',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Books domain module registered successfully`);
    });
  },
  {
    name: 'books-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/books.schemas';
export * from './types/books.types';
export { BooksRepository } from './repositories/books.repository';
export { BooksService } from './services/books.service';
export { BooksController } from './controllers/books.controller';

// Re-export commonly used types for external use
export type {
  Books,
  CreateBooks,
  UpdateBooks,
  BooksIdParam,
  GetBooksQuery,
  ListBooksQuery,
} from './schemas/books.schemas';

// Module name constant
export const MODULE_NAME = 'books' as const;
