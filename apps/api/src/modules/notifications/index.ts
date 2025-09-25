// Fastify Plugin
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { notificationsRoutes } from './notifications.routes';

// Main Plugin Export
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

// Export all public interfaces and types
export * from './notifications.schemas';
export * from './notifications.types';
export * from './notifications.repository';
export * from './notifications.service';
export * from './notifications.controller';

// Re-export commonly used types for external use
export type {
  Notifications,
  CreateNotifications,
  UpdateNotifications,
  NotificationsIdParam,
  GetNotificationsQuery,
  ListNotificationsQuery,
  NotificationsCreatedEvent,
  NotificationsUpdatedEvent,
  NotificationsDeletedEvent
} from './notifications.schemas';

// Re-export repository and service interfaces
export type { NotificationsRepository } from './notifications.repository';
export type { NotificationsService } from './notifications.service';

// Event type definitions for external consumers (import Notifications from schemas)
import { Notifications } from './notifications.schemas';

export interface NotificationsEventHandlers {
  onCreated?: (data: Notifications) => void | Promise<void>;
  onUpdated?: (data: Notifications) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface NotificationsWebSocketSubscription {
  subscribe(handlers: NotificationsEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'notifications' as const;