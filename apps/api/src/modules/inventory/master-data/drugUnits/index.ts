import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugUnitsController } from './drug-units.controller';
import { DrugUnitsService } from './drug-units.service';
import { DrugUnitsRepository } from './drug-units.repository';
import { drugUnitsRoutes } from './drug-units.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * DrugUnits Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function drugUnitsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'drugUnits',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const drugUnitsRepository = new DrugUnitsRepository((fastify as any).knex);
    const drugUnitsService = new DrugUnitsService(drugUnitsRepository);

    // Controller instantiation with proper dependencies
    const drugUnitsController = new DrugUnitsController(drugUnitsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('drugUnitsService', drugUnitsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(drugUnitsRoutes, {
      controller: drugUnitsController,
      prefix: options.prefix || '/inventory/master-data/drug-units',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`DrugUnits domain module registered successfully`);
    });
  },
  {
    name: 'drugUnits-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './drug-units.schemas';
export * from './drug-units.types';
export { DrugUnitsRepository } from './drug-units.repository';
export { DrugUnitsService } from './drug-units.service';
export { DrugUnitsController } from './drug-units.controller';

// Re-export commonly used types for external use
export type {
  DrugUnits,
  CreateDrugUnits,
  UpdateDrugUnits,
  DrugUnitsIdParam,
  GetDrugUnitsQuery,
  ListDrugUnitsQuery,
} from './drug-units.schemas';

// Module name constant
export const MODULE_NAME = 'drugUnits' as const;
