import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SystemSettingsController } from './systemSettings.controller';
import { SystemSettingsService } from './systemSettings.service';
import { SystemSettingsRepository } from './systemSettings.repository';
import { systemSettingsRoutes } from './systemSettings.routes';

// Note: FastifyInstance eventService type is declared in websocket.plugin.ts

/**
 * SystemSettings Plugin
 * 
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 * - Schema registration through Fastify's schema registry
 */
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

    // Optional: Decorate Fastify instance with service for cross-plugin access
    // fastify.decorate('systemSettingsService', systemSettingsService);

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