import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import systemInitPlugin from './system-init';

/**
 * Admin Module Plugin
 * Aggregates all admin features
 * Route prefix: /admin
 */
export default fp(
  async function adminPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    const prefix = options.prefix || '/admin';

    // Register all admin modules
    await fastify.register(systemInitPlugin, {
      ...options,
      prefix: `${prefix}/system-init`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Admin domain loaded with 1 module at ${prefix}`);
    });
  },
  {
    name: 'admin-plugin',
    dependencies: ['knex-plugin'],
  },
);
