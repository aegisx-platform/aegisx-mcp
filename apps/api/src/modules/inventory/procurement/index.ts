import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import purchaseOrdersPlugin from './purchaseOrders';
import purchaseOrderItemsPlugin from './purchaseOrderItems';
import purchaseRequestsPlugin from './purchaseRequests';
import receiptsPlugin from './receipts';
import receiptItemsPlugin from './receiptItems';
import receiptInspectorsPlugin from './receiptInspectors';
import contractsPlugin from './contracts';
import contractItemsPlugin from './contractItems';

/**
 * Procurement Domain Plugin
 *
 * Aggregates all modules within the Procurement domain.
 * Route prefix: /inventory/procurement
 */
export default fp(
  async function procurementDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    const prefix = options.prefix || '/inventory/procurement';

    // Register all domain modules
    await fastify.register(purchaseOrdersPlugin, {
      ...options,
      prefix: `${prefix}/purchase-orders`,
    });
    await fastify.register(purchaseOrderItemsPlugin, {
      ...options,
      prefix: `${prefix}/purchase-order-items`,
    });
    await fastify.register(purchaseRequestsPlugin, {
      ...options,
      prefix: `${prefix}/purchase-requests`,
    });
    await fastify.register(receiptsPlugin, {
      ...options,
      prefix: `${prefix}/receipts`,
    });
    await fastify.register(receiptItemsPlugin, {
      ...options,
      prefix: `${prefix}/receipt-items`,
    });
    await fastify.register(receiptInspectorsPlugin, {
      ...options,
      prefix: `${prefix}/receipt-inspectors`,
    });
    await fastify.register(contractsPlugin, {
      ...options,
      prefix: `${prefix}/contracts`,
    });
    await fastify.register(contractItemsPlugin, {
      ...options,
      prefix: `${prefix}/contract-items`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Procurement domain loaded with 8 modules at ${prefix}`);
    });
  },
  {
    name: 'procurement-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Note: Individual module exports are accessed through their respective index.ts files
// Example: import { DrugsService } from './drugs';
//          import { DrugGenericsService } from './drugGenerics';
