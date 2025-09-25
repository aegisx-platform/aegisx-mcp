import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiKeysController } from './apiKeys.controller';
import { ApiKeysService } from './apiKeys.service';
import { ApiKeysRepository } from './apiKeys.repository';
import { apiKeysRoutes } from './apiKeys.routes';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ApiKeys Plugin
 * 
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function apiKeysPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'apiKeys',
        {} // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const apiKeysRepository = new ApiKeysRepository((fastify as any).knex);
    const apiKeysService = new ApiKeysService(
      apiKeysRepository
    );
    const apiKeysController = new ApiKeysController(apiKeysService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('apiKeysService', apiKeysService);

    // Register routes with controller dependency
    await fastify.register(apiKeysRoutes, {
      controller: apiKeysController,
      prefix: options.prefix || '/apiKeys'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ApiKeys module registered successfully`);
    });

  },
  {
    name: 'apiKeys-plugin',
    dependencies: ['knex-plugin']
  }
);