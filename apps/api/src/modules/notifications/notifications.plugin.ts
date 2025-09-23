import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { notificationsRoutes } from './notifications.routes';

export interface NotificationsPluginOptions {
  // Plugin configuration options
}

async function notificationsPlugin(
  fastify: FastifyInstance,
  opts: NotificationsPluginOptions
) {
  // Register dependencies
  const notificationsService = new NotificationsService();
  const notificationsController = new NotificationsController(notificationsService);

  // Register routes
  await fastify.register(notificationsRoutes, {
    controller: notificationsController,
    prefix: '/notifications'
  });


  fastify.log.info('Notifications plugin registered successfully');
}

export default fp(notificationsPlugin, {
  name: 'notifications-plugin',
  dependencies: []
});