import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { notificationsRoutes } from './routes/index';
import { ExportService } from '../../services/export.service';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * Notifications Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
export default fp(
  async function notificationsDomainPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'notifications',
        {}, // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const notificationsRepository = new NotificationsRepository(
      (fastify as any).knex,
    );
    const notificationsService = new NotificationsService(
      notificationsRepository,
    );
    const exportService = new ExportService();
    const notificationsController = new NotificationsController(
      notificationsService,
      exportService,
    );

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('notificationsService', notificationsService);

    // Register routes with controller dependency
    await fastify.register(notificationsRoutes, {
      controller: notificationsController,
      prefix: options.prefix || '/notifications',
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`Notifications domain module registered successfully`);
    });
  },
  {
    name: 'notifications-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports for external consumers
export * from './schemas/notifications.schemas';
export * from './types/notifications.types';
export { NotificationsRepository } from './repositories/notifications.repository';
export { NotificationsService } from './services/notifications.service';
export { NotificationsController } from './controllers/notifications.controller';

// Re-export commonly used types for external use
export type {
  Notifications,
  CreateNotifications,
  UpdateNotifications,
  NotificationsIdParam,
  GetNotificationsQuery,
  ListNotificationsQuery,
} from './schemas/notifications.schemas';

// Module name constant
export const MODULE_NAME = 'notifications' as const;
