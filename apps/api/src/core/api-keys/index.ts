import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiKeysController } from './controllers/apiKeys.controller';
import { ApiKeysService } from './services/apiKeys.service';
import { ApiKeysRepository } from './repositories/apiKeys.repository';
import { apiKeysRoutes } from './routes/index';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ApiKeys Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function apiKeysDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'apiKeys',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const apiKeysRepository = new ApiKeysRepository((fastify as any).knex);
    const apiKeysService = new ApiKeysService(
      apiKeysRepository,
      (fastify as any).eventService,
      fastify, // Pass Fastify instance for cache service initialization
    );
    const apiKeysController = new ApiKeysController(apiKeysService);

    // Decorate Fastify instance with service for cross-plugin access
    fastify.decorate('apiKeysService', apiKeysService);

    // Register routes with controller dependency
    await fastify.register(apiKeysRoutes, {
      controller: apiKeysController,
      prefix: options.prefix || '/api-keys',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ApiKeys domain module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up ApiKeys domain module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'apiKeys-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/apiKeys.schemas';
export * from './types/apiKeys.types';
export { ApiKeysRepository } from './repositories/apiKeys.repository';
export { ApiKeysService } from './services/apiKeys.service';
export { ApiKeysController } from './controllers/apiKeys.controller';

// Re-export commonly used types for external use
export type {
  ApiKeys,
  CreateApiKeys,
  UpdateApiKeys,
  ApiKeysIdParam,
  GetApiKeysQuery,
  ListApiKeysQuery,
  ApiKeysCreatedEvent,
  ApiKeysUpdatedEvent,
  ApiKeysDeletedEvent,
  // New API key management types
  ApiKeyScope,
  GenerateApiKey,
  GeneratedApiKey,
  ValidateApiKey,
  ApiKeyValidationResponse,
  RevokeApiKey,
  RotateApiKey,
  UserApiKeysQuery,
  ApiKeyPreview,
} from './schemas/apiKeys.schemas';

// Re-export middleware
export {
  createApiKeyAuth,
  createHybridAuth,
  createApiKeyRateLimit,
  createApiKeyAuditLog,
  requireScope,
} from './middleware/apiKeys.middleware';
export type {
  ApiKeyAuthOptions,
  AuthenticatedRequest,
} from './middleware/apiKeys.middleware';

// Re-export crypto utilities
export {
  generateApiKey,
  generateScopedApiKey,
  validateApiKey,
  validateApiKeyFormat,
  validateScope,
  generatePreview,
  isKeyExpired,
  calculateExpiration,
  createAuditHash,
  API_KEY_CONSTANTS,
} from './utils/apiKeys.crypto';
export type {
  ApiKeyComponents,
  ApiKeyValidationResult,
} from './utils/apiKeys.crypto';

// Event type definitions for external consumers
import { ApiKeys } from './schemas/apiKeys.schemas';

export interface ApiKeysEventHandlers {
  onCreated?: (data: ApiKeys) => void | Promise<void>;
  onUpdated?: (data: ApiKeys) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface ApiKeysWebSocketSubscription {
  subscribe(handlers: ApiKeysEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'apiKeys' as const;

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    apiKeysService: ApiKeysService;
  }
}
