import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractsRepository } from './contracts.repository';
import { contractsRoutes } from './contracts.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Contracts Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function contractsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'contracts',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const contractsRepository = new ContractsRepository((fastify as any).knex);
    const contractsService = new ContractsService(contractsRepository);

    // Controller instantiation with proper dependencies
    const contractsController = new ContractsController(contractsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('contractsService', contractsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(contractsRoutes, {
      controller: contractsController,
      prefix: options.prefix || '/inventory/procurement/contracts',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Contracts domain module registered successfully`);
    });
  },
  {
    name: 'contracts-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './contracts.schemas';
export * from './contracts.types';
export { ContractsRepository } from './contracts.repository';
export { ContractsService } from './contracts.service';
export { ContractsController } from './contracts.controller';

// Re-export commonly used types for external use
export type {
  Contracts,
  CreateContracts,
  UpdateContracts,
  ContractsIdParam,
  GetContractsQuery,
  ListContractsQuery,
} from './contracts.schemas';

// Module name constant
export const MODULE_NAME = 'contracts' as const;
