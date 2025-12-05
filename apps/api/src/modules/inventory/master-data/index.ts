import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import drugGenericsPlugin from './drugGenerics';
import companiesPlugin from './companies';
import departmentsPlugin from './departments';
import locationsPlugin from './locations';
import dosageFormsPlugin from './dosageForms';
import drugUnitsPlugin from './drugUnits';
import hospitalsPlugin from './hospitals';
import adjustmentReasonsPlugin from './adjustmentReasons';
import returnActionsPlugin from './returnActions';
import returnReasonsPlugin from './returnReasons';
import distributionTypesPlugin from './distributionTypes';
import purchaseTypesPlugin from './purchaseTypes';
import drugLotsPlugin from './drugLots';
import drugPackRatiosPlugin from './drugPackRatios';
import drugFocusListsPlugin from './drugFocusLists';
import hospitalPharmaceuticalProductsPlugin from './hospitalPharmaceuticalProducts';
import inventoryPlugin from './inventory';
import tmtMappingsPlugin from './tmtMappings';

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
    await fastify.register(companiesPlugin, {
      ...options,
      prefix: `${prefix}/companies`,
    });
    await fastify.register(departmentsPlugin, {
      ...options,
      prefix: `${prefix}/departments`,
    });
    await fastify.register(locationsPlugin, {
      ...options,
      prefix: `${prefix}/locations`,
    });
    await fastify.register(dosageFormsPlugin, {
      ...options,
      prefix: `${prefix}/dosage-forms`,
    });
    await fastify.register(drugUnitsPlugin, {
      ...options,
      prefix: `${prefix}/drug-units`,
    });
    await fastify.register(hospitalsPlugin, {
      ...options,
      prefix: `${prefix}/hospitals`,
    });
    await fastify.register(adjustmentReasonsPlugin, {
      ...options,
      prefix: `${prefix}/adjustment-reasons`,
    });
    await fastify.register(returnActionsPlugin, {
      ...options,
      prefix: `${prefix}/return-actions`,
    });
    await fastify.register(returnReasonsPlugin, {
      ...options,
      prefix: `${prefix}/return-reasons`,
    });
    await fastify.register(distributionTypesPlugin, {
      ...options,
      prefix: `${prefix}/distribution-types`,
    });
    await fastify.register(purchaseTypesPlugin, {
      ...options,
      prefix: `${prefix}/purchase-types`,
    });
    await fastify.register(drugLotsPlugin, {
      ...options,
      prefix: `${prefix}/drug-lots`,
    });
    await fastify.register(drugPackRatiosPlugin, {
      ...options,
      prefix: `${prefix}/drug-pack-ratios`,
    });
    await fastify.register(drugFocusListsPlugin, {
      ...options,
      prefix: `${prefix}/drug-focus-lists`,
    });
    await fastify.register(hospitalPharmaceuticalProductsPlugin, {
      ...options,
      prefix: `${prefix}/hospital-pharmaceutical-products`,
    });
    await fastify.register(inventoryPlugin, {
      ...options,
      prefix: `${prefix}/inventory`,
    });
    await fastify.register(tmtMappingsPlugin, {
      ...options,
      prefix: `${prefix}/tmt-mappings`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `Master-data domain loaded with 19 modules at ${prefix}`,
      );
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
