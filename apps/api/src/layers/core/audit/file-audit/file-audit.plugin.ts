import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { FileAuditController } from './file-audit.controller';
import { FileAuditService } from './file-audit.service';
import { FileAuditRepository } from './file-audit.repository';
import { fileAuditRoutes } from './file-audit.routes';

/**
 * File Audit Plugin
 *
 * Registers the file audit logging and monitoring system.
 *
 * Features:
 * - Track all file operations (upload, download, delete, etc.)
 * - File access monitoring
 * - Suspicious activity detection
 * - User file activity tracking
 * - File history and statistics
 * - CSV/JSON export
 *
 * Dependencies:
 * - knex-plugin: Database connection
 * - jwt-auth-plugin: JWT authentication
 * - auth-strategies-plugin: RBAC permissions
 *
 * Usage:
 * ```typescript
 * await fastify.register(fileAuditPlugin, {
 *   prefix: '/api/file-audit', // Optional, defaults to '/file-audit'
 * });
 *
 * // Use the service from anywhere in the app
 * await fastify.fileAuditService.logFileOperation({
 *   fileId: file.id,
 *   userId: user.id,
 *   operation: 'upload',
 *   success: true,
 *   fileName: 'document.pdf',
 *   fileSize: 2048000,
 * });
 * ```
 */
export default fp(
  async function fileAuditPlugin(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
  ) {
    // 1. Create service instances with dependency injection
    const fileAuditRepository = new FileAuditRepository(fastify.knex);
    const fileAuditService = new FileAuditService(fastify.knex);
    const fileAuditController = new FileAuditController(fileAuditService);

    // 2. Register routes with controller
    await fastify.register(fileAuditRoutes, {
      prefix: opts.prefix || '/file-audit',
    });

    // 3. Decorate Fastify instance for cross-module access
    fastify.decorate('fileAuditService', fileAuditService);
    fastify.decorate('fileAuditRepository', fileAuditRepository);

    // 4. Lifecycle hooks
    fastify.addHook('onReady', async () => {
      fastify.log.info('File Audit module registered successfully');
    });
  },
  {
    name: 'file-audit-plugin',
    dependencies: ['knex-plugin', 'jwt-auth-plugin', 'auth-strategies-plugin'],
  },
);

// Fastify module declaration for TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    fileAuditService: FileAuditService;
    fileAuditRepository: FileAuditRepository;
  }
}
