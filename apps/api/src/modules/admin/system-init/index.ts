import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { systemInitRoutes } from './system-init.routes';

/**
 * System Initialization Plugin
 * Routes: /admin/system-init
 * Dependencies: import-discovery-plugin
 */
export default fp(
  async function systemInitPlugin(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    // Register routes directly (systemInitRoutes is a route handler function, not a plugin)
    await systemInitRoutes(fastify);
  },
  {
    name: 'system-init-plugin',
    dependencies: ['knex-plugin', 'import-discovery-plugin'],
  },
);
