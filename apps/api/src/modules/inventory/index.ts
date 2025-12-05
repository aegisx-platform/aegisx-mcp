import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import masterDataPlugin from './master-data';

/**
 * Inventory Domain Plugin
 *
 * Aggregates all modules within the Inventory domain.
 * Route prefix: /inventory
 */
export default fp(
  async function inventoryDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    const prefix = options.prefix || '/inventory';

    // Register all domain modules
    await fastify.register(masterDataPlugin, {
      ...options,
      prefix: `${prefix}/master-data`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Inventory domain loaded with 1 modules at ${prefix}`);
    });
  },
  {
    name: 'inventory-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Note: Individual module exports are accessed through their respective index.ts files
// Example: import { DrugsService } from './drugs';
//          import { DrugGenericsService } from './drugGenerics';
