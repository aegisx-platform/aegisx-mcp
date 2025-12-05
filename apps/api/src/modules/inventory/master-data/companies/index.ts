import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './companies.repository';
import { companiesRoutes } from './companies.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Companies Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function companiesDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'companies',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const companiesRepository = new CompaniesRepository((fastify as any).knex);
    const companiesService = new CompaniesService(companiesRepository);

    // Controller instantiation with proper dependencies
    const companiesController = new CompaniesController(companiesService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('companiesService', companiesService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(companiesRoutes, {
      controller: companiesController,
      prefix: options.prefix || '/inventory/master-data/companies',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Companies domain module registered successfully`);
    });
  },
  {
    name: 'companies-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './companies.schemas';
export * from './companies.types';
export { CompaniesRepository } from './companies.repository';
export { CompaniesService } from './companies.service';
export { CompaniesController } from './companies.controller';

// Re-export commonly used types for external use
export type {
  Companies,
  CreateCompanies,
  UpdateCompanies,
  CompaniesIdParam,
  GetCompaniesQuery,
  ListCompaniesQuery,
} from './companies.schemas';

// Module name constant
export const MODULE_NAME = 'companies' as const;
