import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { StorageAdapterFactory } from '../../../shared/factories/storage-adapter.factory';
import { StorageType } from '../../../shared/interfaces/storage-adapter.interface';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { fileUploadRoutes } from './file-upload.routes';
import * as fileUploadSchemas from './file-upload.schemas';

/**
 * Platform File Upload Plugin
 *
 * Provides file upload and storage management functionality.
 * Supports multiple storage adapters (local, S3, etc.) and file processing.
 *
 * Features:
 * - Single file upload with multipart support
 * - File metadata management
 * - Image thumbnail generation
 * - Signed URLs for secure access
 * - File access logging and audit trails
 * - Storage adapter abstraction
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping (plain async function, no fp wrapper)
 * - Lifecycle management with hooks
 *
 * Note: This is a leaf module plugin (routes + controllers only), so it uses
 * a plain async function without fp() wrapper, following the plugin pattern specification.
 */
export default async function platformFileUploadPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Register module schemas using the schema registry
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('file-upload', fileUploadSchemas);
  }

  // Multipart support is provided by user-profile plugin
  // We can use the existing multipart configuration

  // Initialize storage adapter using factory
  const storageAdapterFactory = StorageAdapterFactory.getInstance(fastify);
  const storageAdapter = await storageAdapterFactory.create({
    type: StorageType.LOCAL,
    options: {
      jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development',
      baseUrl:
        process.env.API_BASE_URL ||
        process.env.WEB_URL ||
        'http://localhost:4200',
      uploadPath: process.env.UPLOAD_PATH || 'uploads',
      defaultExpirySeconds: 3600,
      maxExpirySeconds: 86400,
    },
  });

  // Initialize repository with Knex connection
  const repository = new FileUploadRepository({
    db: (fastify as any).knex,
    logger: fastify.log,
  });

  // Initialize service with dependencies
  const service = new FileUploadService({
    fileRepository: repository,
    storageAdapter,
    logger: fastify.log,
  });

  // Initialize controller
  const controller = new FileUploadController({
    fileUploadService: service,
  });

  // Register routes under the specified prefix or /api/v1/platform/files
  await fastify.register(fileUploadRoutes, {
    controller,
    prefix: options.prefix || '/v1/platform/files',
  });

  // Decorate fastify instance with file upload service
  // (Enabled after old core/file-upload module was removed)
  if (!fastify.hasDecorator('fileUploadService')) {
    fastify.decorate('fileUploadService', service);
  }

  // Lifecycle hooks for monitoring
  fastify.addHook('onReady', async () => {
    fastify.log.info('Platform file-upload module registered successfully');
  });
}
