// Fastify Plugin
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiKeysController } from './apiKeys.controller';
import { ApiKeysService } from './apiKeys.service';
import { ApiKeysRepository } from './apiKeys.repository';
import { apiKeysRoutes } from './apiKeys.routes';

// Main Plugin Export
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

// Export all public interfaces and types
export * from './apiKeys.schemas';
export * from './apiKeys.types';
export * from './apiKeys.repository';
export * from './apiKeys.service';
export * from './apiKeys.controller';

// Re-export commonly used types for external use
export type {
  ApiKeys,
  CreateApiKeys,
  UpdateApiKeys,
  ApiKeysIdParam,
  GetApiKeysQuery,
  ListApiKeysQuery,

} from './apiKeys.schemas';

// Re-export repository and service interfaces
export type { ApiKeysRepository } from './apiKeys.repository';
export type { ApiKeysService } from './apiKeys.service';


// Module metadata
export const ApiKeysModule = {
  name: 'apiKeys',
  version: '1.0.0',
  tableName: 'api_keys',
  hasEvents: false,
  dependencies: [
    'knex-plugin'
  ]
} as const;