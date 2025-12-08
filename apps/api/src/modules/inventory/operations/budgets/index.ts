import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetsRepository } from './budgets.repository';
import { budgetsRoutes } from './budgets.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Budgets Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function budgetsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'budgets',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const budgetsRepository = new BudgetsRepository((fastify as any).knex);
    const budgetsService = new BudgetsService(budgetsRepository);

    // Controller instantiation with proper dependencies
    const budgetsController = new BudgetsController(budgetsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('budgetsService', budgetsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(budgetsRoutes, {
      controller: budgetsController,
      prefix: options.prefix || '/inventory/operations/budgets',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Budgets domain module registered successfully`);
    });
  },
  {
    name: 'budgets-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './budgets.schemas';
export * from './budgets.types';
export { BudgetsRepository } from './budgets.repository';
export { BudgetsService } from './budgets.service';
export { BudgetsController } from './budgets.controller';

// Re-export commonly used types for external use
export type {
  Budgets,
  CreateBudgets,
  UpdateBudgets,
  BudgetsIdParam,
  GetBudgetsQuery,
  ListBudgetsQuery,
} from './budgets.schemas';

// Module name constant
export const MODULE_NAME = 'budgets' as const;
