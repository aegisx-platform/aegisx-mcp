import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { attachmentRoutes } from './attachment.routes';
import * as attachmentSchemas from './attachment.schemas';

/**
 * Platform Attachment Plugin
 *
 * Generic file attachment system that works with ANY entity type.
 * Just add entity configuration to attachment-config.ts - no code changes needed!
 *
 * Features:
 * - Polymorphic file attachments (one table for all entities)
 * - Config-driven (add new entity types via config)
 * - RESTful API
 * - TypeBox validation
 * - OpenAPI documentation
 * - Works with any client (Angular, React, mobile, external systems)
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping (plain async function, no fp wrapper)
 * - Lifecycle management with hooks
 *
 * Note: This is a leaf module plugin (routes + controllers only), so it uses
 * a plain async function without fp() wrapper, following the plugin pattern specification.
 */
export default async function platformAttachmentPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('attachments', attachmentSchemas);
  }

  // Register routes under the specified prefix or /api/v1/platform/attachments
  await fastify.register(attachmentRoutes, {
    prefix: options.prefix || '/v1/platform/attachments',
  });

  // Lifecycle hooks for monitoring
  fastify.addHook('onReady', async () => {
    fastify.log.info('Platform attachments module registered successfully');
  });
}
