import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { notificationsRoutes } from './notifications.routes';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Notifications Plugin
 * 
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function notificationsPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'notifications',
        {} // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const notificationsRepository = new NotificationsRepository((fastify as any).knex);
    const notificationsService = new NotificationsService(
      notificationsRepository,
      (fastify as any).eventService
    );
    const notificationsController = new NotificationsController(notificationsService);

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('notificationsService', notificationsService);

    // Register routes with controller dependency
    await fastify.register(notificationsRoutes, {
      controller: notificationsController,
      prefix: options.prefix || '/notifications'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Notifications module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up Notifications module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'notifications-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin']
  }
);