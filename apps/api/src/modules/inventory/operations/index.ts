import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import inventoryPlugin from './inventory';
import inventoryTransactionsPlugin from './inventoryTransactions';
import drugDistributionsPlugin from './drugDistributions';
import drugDistributionItemsPlugin from './drugDistributionItems';
import drugReturnsPlugin from './drugReturns';
import drugReturnItemsPlugin from './drugReturnItems';
import budgetAllocationsPlugin from './budgetAllocations';
import budgetPlansPlugin from './budgetPlans';
import budgetPlanItemsPlugin from './budgetPlanItems';
import budgetReservationsPlugin from './budgetReservations';

/**
 * Operations Domain Plugin
 *
 * Aggregates all modules within the Operations domain.
 * Route prefix: /inventory/operations
 */
export default fp(
  async function operationsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    const prefix = options.prefix || '/inventory/operations';

    // Register all domain modules
    await fastify.register(inventoryPlugin, {
      ...options,
      prefix: `${prefix}/inventory`,
    });
    await fastify.register(inventoryTransactionsPlugin, {
      ...options,
      prefix: `${prefix}/inventory-transactions`,
    });
    await fastify.register(drugDistributionsPlugin, {
      ...options,
      prefix: `${prefix}/drug-distributions`,
    });
    await fastify.register(drugDistributionItemsPlugin, {
      ...options,
      prefix: `${prefix}/drug-distribution-items`,
    });
    await fastify.register(drugReturnsPlugin, {
      ...options,
      prefix: `${prefix}/drug-returns`,
    });
    await fastify.register(drugReturnItemsPlugin, {
      ...options,
      prefix: `${prefix}/drug-return-items`,
    });
    await fastify.register(budgetAllocationsPlugin, {
      ...options,
      prefix: `${prefix}/budget-allocations`,
    });
    await fastify.register(budgetPlansPlugin, {
      ...options,
      prefix: `${prefix}/budget-plans`,
    });
    await fastify.register(budgetPlanItemsPlugin, {
      ...options,
      prefix: `${prefix}/budget-plan-items`,
    });
    await fastify.register(budgetReservationsPlugin, {
      ...options,
      prefix: `${prefix}/budget-reservations`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Operations domain loaded with 10 modules at ${prefix}`);
    });
  },
  {
    name: 'operations-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Note: Individual module exports are accessed through their respective index.ts files
// Example: import { DrugsService } from './drugs';
//          import { DrugGenericsService } from './drugGenerics';
