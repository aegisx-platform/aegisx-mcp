import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ArticlesController } from './controllers/articles.controller';
import { ArticlesService } from './services/articles.service';
import { ArticlesRepository } from './repositories/articles.repository';
import { articlesRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Articles Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function articlesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'articles',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const articlesRepository = new ArticlesRepository((fastify as any).knex);
    const articlesService = new ArticlesService(articlesRepository);
    const articlesController = new ArticlesController(articlesService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('articlesService', articlesService);

    // Register routes with controller dependency
    await fastify.register(articlesRoutes, {
      controller: articlesController,
      prefix: options.prefix || '/articles',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Articles domain module registered successfully`);
    });
  },
  {
    name: 'articles-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/articles.schemas';
export * from './types/articles.types';
export { ArticlesRepository } from './repositories/articles.repository';
export { ArticlesService } from './services/articles.service';
export { ArticlesController } from './controllers/articles.controller';

// Re-export commonly used types for external use
export type {
  Articles,
  CreateArticles,
  UpdateArticles,
  ArticlesIdParam,
  GetArticlesQuery,
  ListArticlesQuery,
} from './schemas/articles.schemas';

// Module name constant
export const MODULE_NAME = 'articles' as const;
