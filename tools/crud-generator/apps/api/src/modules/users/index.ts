// Fastify Plugin
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { usersRoutes } from './users.routes';

// Main Plugin Export
export default fp(
  async function usersPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'users',
        {} // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const usersRepository = new UsersRepository((fastify as any).knex);
    const usersService = new UsersService(
      usersRepository
    );
    const usersController = new UsersController(usersService);

    // Register routes with controller dependency
    await fastify.register(usersRoutes, {
      controller: usersController,
      prefix: options.prefix || '/users'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Users module registered successfully`);
    });

  },
  {
    name: 'users-plugin',
    dependencies: ['knex-plugin']
  }
);

// Export all public interfaces and types
export * from './users.schemas';
export * from './users.types';
export * from './users.repository';
export * from './users.service';
export * from './users.controller';

// Re-export commonly used types for external use
export type {
  Users,
  CreateUsers,
  UpdateUsers,
  UsersIdParam,
  GetUsersQuery,
  ListUsersQuery,

} from './users.schemas';

// Re-export repository and service interfaces
export type { UsersRepository } from './users.repository';
export type { UsersService } from './users.service';


// Module metadata
export const UsersModule = {
  name: 'users',
  version: '1.0.0',
  tableName: 'users',
  hasEvents: false,
  dependencies: [
    'knex-plugin'
  ]
} as const;