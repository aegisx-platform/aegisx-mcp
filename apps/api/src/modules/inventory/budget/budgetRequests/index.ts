import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BudgetRequestsController } from './budget-requests.controller';
import { BudgetRequestsService } from './budget-requests.service';
import { BudgetRequestsRepository } from './budget-requests.repository';
import { budgetRequestsRoutes } from './budget-requests.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * BudgetRequests Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function budgetRequestsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'budgetRequests',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const budgetRequestsRepository = new BudgetRequestsRepository(
      (fastify as any).knex,
    );
    const budgetRequestsService = new BudgetRequestsService(
      budgetRequestsRepository,
      (fastify as any).knex,
      fastify.log,
    );

    // Controller instantiation with proper dependencies
    const budgetRequestsController = new BudgetRequestsController(
      budgetRequestsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('budgetRequestsService', budgetRequestsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(budgetRequestsRoutes, {
      controller: budgetRequestsController,
      prefix: options.prefix || '/inventory/budget/budget-requests',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`BudgetRequests domain module registered successfully`);
    });
  },
  {
    name: 'budgetRequests-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './budget-requests.schemas';
export * from './budget-requests.types';
export { BudgetRequestsRepository } from './budget-requests.repository';
export { BudgetRequestsService } from './budget-requests.service';
export { BudgetRequestsController } from './budget-requests.controller';

// Re-export commonly used types for external use
export type {
  BudgetRequests,
  CreateBudgetRequests,
  UpdateBudgetRequests,
  BudgetRequestsIdParam,
  GetBudgetRequestsQuery,
  ListBudgetRequestsQuery,
} from './budget-requests.schemas';

// Module name constant
export const MODULE_NAME = 'budgetRequests' as const;
