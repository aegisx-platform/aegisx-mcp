import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { settingsRoutes } from './settings.routes';
import { settingsSchemas } from './settings.schemas';
import { SettingsService } from './settings.service';

async function settingsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  // TODO: Fix schema registry registration - temporarily commented out for testing
  // fastify.schemaRegistry.registerModuleSchemas('settings', settingsSchemas);

  // Initialize settings service
  const settingsService = new SettingsService(fastify.knex, fastify.redis);

  // Decorate fastify instance with settings service
  fastify.decorate('settingsService', settingsService);

  // Register settings routes with /api/settings prefix
  await fastify.register(settingsRoutes, { prefix: '/api/settings' });

  fastify.log.info('Settings plugin registered successfully');
}

export default fp(settingsPlugin, {
  name: 'settings-plugin',
  dependencies: ['knex', 'redis', 'response-handler', 'schemas-plugin', 'auth-strategies-plugin'],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    settingsService: SettingsService;
  }
}
