/**
 * File Audit System
 *
 * Complete file audit logging system with repository, service, controller, and routes.
 *
 * Usage:
 * ```typescript
 * import { FileAuditService, FileAuditLog, FileOperation } from '@/core/audit-system/file-audit';
 * import { fileAuditRoutes } from '@/core/audit-system/file-audit';
 *
 * // Register routes
 * await fastify.register(fileAuditRoutes, { prefix: '/api/file-audit' });
 *
 * // Use service
 * const service = new FileAuditService(knex);
 * await service.logFileOperation({
 *   fileId: file.id,
 *   userId: user.id,
 *   operation: FileOperation.UPLOAD,
 *   success: true,
 * });
 * ```
 */

// Repository
export { FileAuditRepository } from './file-audit.repository';

// Service
export { FileAuditService } from './file-audit.service';

// Controller
export { FileAuditController } from './file-audit.controller';

// Routes
export { fileAuditRoutes } from './file-audit.routes';

// Plugin
export { default as fileAuditPlugin } from './file-audit.plugin';

// Schemas & Types
export * from './file-audit.schemas';
export { FileAuditSchemas } from './file-audit.schemas';
