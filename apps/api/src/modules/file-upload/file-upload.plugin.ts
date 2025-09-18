import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { LocalStorageAdapter } from '../../shared/storage/adapters/local-storage.adapter';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { fileUploadRoutes } from './file-upload.routes';

/**
 * File Upload Plugin
 * Registers file upload functionality with dependency injection
 */
async function fileUploadPlugin(fastify: FastifyInstance) {
  // Multipart support should already be registered by user-profile plugin
  // We'll configure limits per-route in the route handlers

  // Initialize storage adapter
  const storageAdapter = new LocalStorageAdapter(
    { logger: fastify.log },
    {
      adapterType: 'local',
      basePath: process.env.UPLOAD_PATH || 'uploads',
      publicUrlBase: '/api/files',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        // Images
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        // Documents
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        // Media
        'video/mp4',
        'video/webm',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
      ],
    },
  );

  // Initialize dependencies
  const repository = new FileUploadRepository({
    db: fastify.knex,
    logger: fastify.log,
  });

  const service = new FileUploadService({
    fileRepository: repository,
    storageAdapter,
    logger: fastify.log,
  });

  const controller = new FileUploadController({
    fileUploadService: service,
  });

  // Register routes
  await fastify.register(fileUploadRoutes, {
    controller,
    prefix: '/api/files',
  });

  // Decorate fastify instance with services (optional, for testing or other modules)
  fastify.decorate('fileUploadService', service);

  fastify.log.info('File Upload plugin registered successfully');
}

export default fp(fileUploadPlugin, {
  name: 'file-upload',
  dependencies: ['knex-plugin', 'jwt-auth-plugin', 'schemas-plugin'],
});

export { fileUploadPlugin };
