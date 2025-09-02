import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { settingsRoutes } from './settings.routes';
import { settingsSchemas } from './settings.schemas';

async function settingsPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // Register module schemas using the schema registry
  fastify.schemaRegistry.registerModuleSchemas('settings', settingsSchemas);

  // Register settings routes with /api/settings prefix
  await fastify.register(settingsRoutes, { prefix: '/api/settings' });

  fastify.log.info('Settings plugin registered successfully');
}

export default fp(settingsPlugin, {
  name: 'settings-plugin',
  dependencies: ['knex', 'redis', 'response-handler', 'auth-strategies-plugin']
});