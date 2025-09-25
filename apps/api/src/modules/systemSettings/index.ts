// Fastify Plugin
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SystemSettingsController } from './systemSettings.controller';
import { SystemSettingsService } from './systemSettings.service';
import { SystemSettingsRepository } from './systemSettings.repository';
import { systemSettingsRoutes } from './systemSettings.routes';

// Main Plugin Export
export default fp(
  async function systemSettingsPlugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
  ) {
    // Register schemas using Fastify's built-in schema registry
    if (fastify.hasDecorator('schemaRegistry')) {
      (fastify as any).schemaRegistry.registerModuleSchemas(
        'systemSettings',
        {} // schemas will be imported automatically
      );
    }

    // Service instantiation following Fastify DI pattern
    // Dependencies are accessed from Fastify instance decorators
    const systemSettingsRepository = new SystemSettingsRepository((fastify as any).knex);
    const systemSettingsService = new SystemSettingsService(
      systemSettingsRepository,
      (fastify as any).eventService
    );
    const systemSettingsController = new SystemSettingsController(systemSettingsService);

    // Register routes with controller dependency
    await fastify.register(systemSettingsRoutes, {
      controller: systemSettingsController,
      prefix: options.prefix || '/systemSettings'
    });

    // Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info(`SystemSettings module registered successfully`);
    });

    // Cleanup event listeners on close
    fastify.addHook('onClose', async () => {
      fastify.log.info(`Cleaning up SystemSettings module resources`);
      // Add any cleanup logic here
    });
  },
  {
    name: 'systemSettings-plugin',
    dependencies: ['knex-plugin', 'websocket-plugin']
  }
);

// Export all public interfaces and types
export * from './systemSettings.schemas';
export * from './systemSettings.types';
export * from './systemSettings.repository';
export * from './systemSettings.service';
export * from './systemSettings.controller';

// Re-export commonly used types for external use
export type {
  SystemSettings,
  CreateSystemSettings,
  UpdateSystemSettings,
  SystemSettingsIdParam,
  GetSystemSettingsQuery,
  ListSystemSettingsQuery,
  SystemSettingsCreatedEvent,
  SystemSettingsUpdatedEvent,
  SystemSettingsDeletedEvent
} from './systemSettings.schemas';

// Re-export repository and service interfaces
export type { SystemSettingsRepository } from './systemSettings.repository';
export type { SystemSettingsService } from './systemSettings.service';

// Event type definitions for external consumers (import SystemSettings from schemas)
import { SystemSettings } from './systemSettings.schemas';

export interface SystemSettingsEventHandlers {
  onCreated?: (data: SystemSettings) => void | Promise<void>;
  onUpdated?: (data: SystemSettings) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface SystemSettingsWebSocketSubscription {
  subscribe(handlers: SystemSettingsEventHandlers): void;
  unsubscribe(): void;
}

// Module name constant
export const MODULE_NAME = 'systemSettings' as const;