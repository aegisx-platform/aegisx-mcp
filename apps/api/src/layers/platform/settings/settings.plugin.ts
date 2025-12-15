import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { settingsRoutes } from './settings.routes';
import { SettingsService } from './settings.service';
import { SettingsCacheService } from './settings-cache.service';
import { settingsSchemas } from './settings.schemas';

/**
 * Platform Settings Plugin
 *
 * Platform layer plugin for managing application settings.
 * Provides CRUD operations for settings with caching and performance monitoring.
 *
 * Features:
 * - Standard CRUD operations (Create, Read, Update, Delete)
 * - Redis caching with cache warming
 * - Performance monitoring and metrics
 * - Schema registry integration
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 *
 * Note: This is a Platform layer plugin (no fp() wrapper)
 * - Does NOT decorate fastify instance
 * - Does NOT modify parent scope
 * - Self-contained service instantiation
 */
export default async function platformSettingsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  fastify.schemaRegistry.registerModuleSchemas('settings', settingsSchemas);

  // Initialize settings service with performance monitoring logger and cache
  const settingsService = new SettingsService(
    fastify.knex,
    fastify.redis,
    fastify.log,
    fastify,
  );

  // Initialize cache service and start cache warming
  const cacheService = new SettingsCacheService(fastify);

  // Register cache service with monitoring if available
  if ((fastify as any).registerCacheService && settingsService['cache']) {
    (fastify as any).registerCacheService('settings', settingsService['cache']);
  }

  // Start cache warming every 30 minutes
  if (process.env.NODE_ENV === 'production') {
    cacheService.startCacheWarming(30);
  }

  // Decorate local fastify instance with services
  // Note: Without fp() wrapper, this only decorates the local scope
  // This allows the controller to access services via request.server
  // Using 'as any' to avoid type conflicts during migration (old and new modules coexist)
  if (!fastify.hasDecorator('settingsService')) {
    fastify.decorate('settingsService', settingsService as any);
  }
  if (!fastify.hasDecorator('settingsCacheService')) {
    fastify.decorate('settingsCacheService', cacheService as any);
  }

  // Gracefully stop cache warming on shutdown
  fastify.addHook('onClose', async () => {
    cacheService.stopCacheWarming();
  });

  // Register settings routes with platform layer prefix
  await fastify.register(settingsRoutes, {
    prefix: '/v1/platform/settings',
  });

  fastify.log.info('Platform settings module registered successfully');
}

// Note: TypeScript declarations are in the old core/settings module
// to avoid conflicts during migration. Once old module is removed,
// declarations can be moved here.
