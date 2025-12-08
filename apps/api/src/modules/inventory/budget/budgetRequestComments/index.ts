import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BudgetRequestCommentsController } from './budget-request-comments.controller';
import { BudgetRequestCommentsService } from './budget-request-comments.service';
import { BudgetRequestCommentsRepository } from './budget-request-comments.repository';
import { budgetRequestCommentsRoutes } from './budget-request-comments.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * BudgetRequestComments Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function budgetRequestCommentsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'budgetRequestComments',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const budgetRequestCommentsRepository = new BudgetRequestCommentsRepository(
      (fastify as any).knex,
    );
    const budgetRequestCommentsService = new BudgetRequestCommentsService(
      budgetRequestCommentsRepository,
    );

    // Controller instantiation with proper dependencies
    const budgetRequestCommentsController = new BudgetRequestCommentsController(
      budgetRequestCommentsService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('budgetRequestCommentsService', budgetRequestCommentsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(budgetRequestCommentsRoutes, {
      controller: budgetRequestCommentsController,
      prefix: options.prefix || '/inventory/budget/budget-request-comments',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(
        `BudgetRequestComments domain module registered successfully`,
      );
    });
  },
  {
    name: 'budgetRequestComments-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './budget-request-comments.schemas';
export * from './budget-request-comments.types';
export { BudgetRequestCommentsRepository } from './budget-request-comments.repository';
export { BudgetRequestCommentsService } from './budget-request-comments.service';
export { BudgetRequestCommentsController } from './budget-request-comments.controller';

// Re-export commonly used types for external use
export type {
  BudgetRequestComments,
  CreateBudgetRequestComments,
  UpdateBudgetRequestComments,
  BudgetRequestCommentsIdParam,
  GetBudgetRequestCommentsQuery,
  ListBudgetRequestCommentsQuery,
} from './budget-request-comments.schemas';

// Module name constant
export const MODULE_NAME = 'budgetRequestComments' as const;
