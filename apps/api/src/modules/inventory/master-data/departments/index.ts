import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentsRepository } from './departments.repository';
import { departmentsRoutes } from './departments.route';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Departments Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function departmentsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'departments',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const departmentsRepository = new DepartmentsRepository(
      (fastify as any).knex,
    );
    const departmentsService = new DepartmentsService(departmentsRepository);

    // Controller instantiation with proper dependencies
    const departmentsController = new DepartmentsController(departmentsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('departmentsService', departmentsService);

    // Register main CRUD routes (includes dynamic /:id route)
    await fastify.register(departmentsRoutes, {
      controller: departmentsController,
      prefix: options.prefix || '/inventory/master-data/departments',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Departments domain module registered successfully`);
    });
  },
  {
    name: 'departments-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './departments.schemas';
export * from './departments.types';
export { DepartmentsRepository } from './departments.repository';
export { DepartmentsService } from './departments.service';
export { DepartmentsController } from './departments.controller';

// Re-export commonly used types for external use
export type {
  Departments,
  CreateDepartments,
  UpdateDepartments,
  DepartmentsIdParam,
  GetDepartmentsQuery,
  ListDepartmentsQuery,
} from './departments.schemas';

// Module name constant
export const MODULE_NAME = 'departments' as const;
