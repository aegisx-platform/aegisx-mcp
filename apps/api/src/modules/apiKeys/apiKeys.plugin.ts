import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { ApiKeysController } from './apiKeys.controller';
import { ApiKeysService } from './apiKeys.service';
import { apiKeysRoutes } from './apiKeys.routes';
import { EventService } from '../../shared/websocket/event.service';

export interface ApiKeysPluginOptions {
  // Plugin configuration options
}

async function apiKeysPlugin(
  fastify: FastifyInstance,
  opts: ApiKeysPluginOptions
) {
  // Register dependencies
  const apiKeysService = new ApiKeysService();
  
  // Get EventService from DI container or create new instance
  const eventService = fastify.diContainer?.cradle?.eventService || new EventService();
  
  const apiKeysController = new ApiKeysController(
    apiKeysService,
    eventService
  );

  // Register routes
  await fastify.register(apiKeysRoutes, {
    controller: apiKeysController,
    prefix: '/apiKeys'
  });

  // Register WebSocket event listeners if needed
  fastify.addHook('onReady', async () => {
    // Set up any additional event listeners or real-time subscriptions
    fastify.log.info('ApiKeys plugin registered with real-time events');
  });

  fastify.log.info('ApiKeys plugin registered successfully');
}

export default fp(apiKeysPlugin, {
  name: 'apiKeys-plugin',
  dependencies: ['websocket-plugin']
});