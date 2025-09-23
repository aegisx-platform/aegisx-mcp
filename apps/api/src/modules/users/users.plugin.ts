import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { usersRoutes } from './users.routes';
import { usersSchemas } from './users.schemas';

export default fp(
  async function usersPlugin(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
  ) {
    // Register module schemas using the schema registry
    if ((fastify as any).schemaRegistry) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'users',
        usersSchemas,
      );
    }

    // Create service instances manually (avoiding tsyringe for now)
    const usersRepository = new UsersRepository(fastify.knex);
    const usersService = new UsersService(usersRepository);
    const usersController = new UsersController(usersService, fastify.eventService);

    // Register routes
    await fastify.register(usersRoutes, {
      controller: usersController,
    });

    // Decorate fastify instance with service for other plugins
    fastify.decorate('usersService', usersService);
  },
  {
    name: 'users-plugin',
    dependencies: ['knex-plugin', 'jwt-auth-plugin', 'websocket-plugin'],
  },
);
