import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { usersRoutes } from './users.routes';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Users Plugin
 * 
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
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

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('usersService', usersService);

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