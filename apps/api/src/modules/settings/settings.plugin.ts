import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { settingsRoutes } from './settings.routes';
import { SettingsService } from './settings.service';
import { SettingsCacheService } from './settings-cache.service';
import { settingsSchemas } from './settings.schemas';

async function settingsPlugin(
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

  // Decorate fastify instance with services
  fastify.decorate('settingsService', settingsService);
  fastify.decorate('settingsCacheService', cacheService);

  // Gracefully stop cache warming on shutdown
  fastify.addHook('onClose', async () => {
    cacheService.stopCacheWarming();
  });

  // Register settings routes (prefix handled by main.ts)
  await fastify.register(settingsRoutes, { prefix: '/settings' });

  fastify.log.info('Settings plugin registered successfully');
}

export default fp(settingsPlugin, {
  name: 'settings-plugin',
  dependencies: [
    'knex-plugin',
    'redis-plugin',
    'response-handler-plugin',
    'schemas-plugin',
    'auth-strategies-plugin',
  ],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    settingsService: SettingsService;
    settingsCacheService: SettingsCacheService;
  }
}
