import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { systemInitRoutes } from './system-init.routes';

/**
 * System Initialization Plugin
 * Routes: /admin/system-init
 *
 * Note: NOT using fastify-plugin (fp) because we need:
 * 1. Route encapsulation (prefix from parent)
 * 2. Proper route prefix inheritance
 *
 * Dependencies are accessed via parent fastify instance decorators:
 * - fastify.knex (from knex-plugin)
 * - fastify.importDiscovery (from import-discovery-plugin)
 */
export default async function systemInitPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // Register routes - they will inherit the prefix from parent registration
  await systemInitRoutes(fastify);
}
