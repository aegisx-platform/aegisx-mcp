import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import masterDataPlugin from './master-data';
import procurementPlugin from './procurement';
import operationsPlugin from './operations';

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
    await fastify.register(procurementPlugin, {
      ...options,
      prefix: `${prefix}/procurement`,
    });
    await fastify.register(operationsPlugin, {
      ...options,
      prefix: `${prefix}/operations`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Inventory domain loaded with 3 modules at ${prefix}`);
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
