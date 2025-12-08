import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ContractItemsController } from './contract-items.controller';
import { ContractItemsService } from './contract-items.service';
import { ContractItemsRepository } from './contract-items.repository';
import { contractItemsRoutes } from './contract-items.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * ContractItems Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function contractItemsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'contractItems',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const contractItemsRepository = new ContractItemsRepository(
      (fastify as any).knex,
    );
    const contractItemsService = new ContractItemsService(
      contractItemsRepository,
    );

    // Controller instantiation with proper dependencies
    const contractItemsController = new ContractItemsController(
      contractItemsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('contractItemsService', contractItemsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(contractItemsRoutes, {
      controller: contractItemsController,
      prefix: options.prefix || '/inventory/procurement/contract-items',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`ContractItems domain module registered successfully`);
    });
  },
  {
    name: 'contractItems-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './contract-items.schemas';
export * from './contract-items.types';
export { ContractItemsRepository } from './contract-items.repository';
export { ContractItemsService } from './contract-items.service';
export { ContractItemsController } from './contract-items.controller';

// Re-export commonly used types for external use
export type {
  ContractItems,
  CreateContractItems,
  UpdateContractItems,
  ContractItemsIdParam,
  GetContractItemsQuery,
  ListContractItemsQuery,
} from './contract-items.schemas';

// Module name constant
export const MODULE_NAME = 'contractItems' as const;
