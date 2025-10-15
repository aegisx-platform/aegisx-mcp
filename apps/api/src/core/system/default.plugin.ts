import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { defaultSchemas } from './default.schemas';
import { defaultRoutes } from './default.routes';
import { DefaultService } from './default.service';
import { DefaultController } from './default.controller';
import testWebSocketRoutes from './test-websocket.routes';

export default fp(
  async function defaultPlugin(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
  ) {
    const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

    // Register module schemas using the schema registry
    typedFastify.schemaRegistry.registerModuleSchemas(
      'default',
      defaultSchemas,
    );

    // Initialize service and controller
    const defaultService = new DefaultService(fastify.knex, fastify);
    const defaultController = new DefaultController(defaultService);

    // Register other routes with controller (these will be under /api prefix)
    await fastify.register(defaultRoutes, {
      controller: defaultController,
    });

    // Register test WebSocket routes
    await fastify.register(testWebSocketRoutes);

    // Decorate fastify instance (optional, for testing)
    fastify.decorate('defaultService', defaultService);

    // Decorate with welcome controller for bootstrap access
    fastify.decorate('defaultController', defaultController);

    fastify.log.info('Default plugin registered successfully');
  },
  {
    name: 'default-plugin',
    dependencies: ['knex-plugin', 'response-handler-plugin', 'schemas-plugin'],
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    defaultService: DefaultService;
    defaultController: DefaultController;
  }
}
