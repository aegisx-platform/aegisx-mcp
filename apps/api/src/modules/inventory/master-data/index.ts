import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import drugGenericsPlugin from './drugGenerics';

/**
 * Master-data Domain Plugin
 *
 * Aggregates all modules within the Master-data domain.
 * Route prefix: /inventory/master-data
 */
export default fp(
  async function masterDataDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    const prefix = options.prefix || '/inventory/master-data';

    // Register all domain modules
    await fastify.register(drugsPlugin, {
      ...options,
      prefix: `${prefix}/drugs`,
    });
    await fastify.register(drugGenericsPlugin, {
      ...options,
      prefix: `${prefix}/drug-generics`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Master-data domain loaded with 2 modules at ${prefix}`);
    });
  },
  {
    name: 'masterData-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Note: Individual module exports are accessed through their respective index.ts files
// Example: import { DrugsService } from './drugs';
//          import { DrugGenericsService } from './drugGenerics';
