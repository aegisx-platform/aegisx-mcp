import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BudgetsController } from './controllers/budgets.controller';
import { BudgetsService } from './services/budgets.service';
import { BudgetsRepository } from './repositories/budgets.repository';
import { budgetsRoutes } from './routes/index';
import { budgetsImportRoutes } from './routes/budgets-import.routes';
import { BudgetsImportService } from './services/budgets-import.service';

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
    const budgetsService = new BudgetsService(
      budgetsRepository,
      (fastify as any).eventService,
    );
    const budgetsImportService = new BudgetsImportService(
      (fastify as any).knex,
      budgetsRepository,
    );

    // Controller instantiation with proper dependencies
    const budgetsController = new BudgetsController(
      budgetsService,
      budgetsImportService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('budgetsService', budgetsService);

    // Register routes with controller dependency
    await fastify.register(budgetsRoutes, {
      controller: budgetsController,
      prefix: options.prefix || '/budgets',
    });

    // Register import routes
    await fastify.register(budgetsImportRoutes, {
      controller: budgetsController,
      prefix: options.prefix || '/budgets',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Budgets domain module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up Budgets domain module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'budgets-domain-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/budgets.schemas';
export * from './types/budgets.types';
export { BudgetsRepository } from './repositories/budgets.repository';
export { BudgetsService } from './services/budgets.service';
export { BudgetsController } from './controllers/budgets.controller';

// Re-export commonly used types for external use
export type {
  Budgets,
  CreateBudgets,
  UpdateBudgets,
  BudgetsIdParam,
  GetBudgetsQuery,
  ListBudgetsQuery,
  BudgetsCreatedEvent,
  BudgetsUpdatedEvent,
  BudgetsDeletedEvent,
} from './schemas/budgets.schemas';

// Event type definitions for external consumers
import { Budgets } from './schemas/budgets.schemas';

export interface BudgetsEventHandlers {
  onCreated?: (data: Budgets) => void | Promise<void>;
  onUpdated?: (data: Budgets) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface BudgetsWebSocketSubscription {
  subscribe(handlers: BudgetsEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'budgets' as const;
