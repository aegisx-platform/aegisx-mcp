import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { StorageAdapterFactory } from '../../shared/factories/storage-adapter.factory';
import { StorageType } from '../../shared/interfaces/storage-adapter.interface';
import { FileUploadRepository } from './file-upload.repository';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { fileUploadRoutes } from './file-upload.routes';

/**
 * File Upload Plugin
 * Registers file upload functionality with dependency injection
 */
async function fileUploadPlugin(fastify: FastifyInstance) {
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

  // Register routes (prefix handled by main.ts)
  await fastify.register(fileUploadRoutes, {
    controller,
    prefix: '/files',
  });

  // Decorate fastify instance with services (optional, for testing or other modules)
  fastify.decorate('fileUploadService', service);

  fastify.log.info('File Upload plugin registered successfully');
}

export default fp(fileUploadPlugin, {
  name: 'file-upload',
  dependencies: [
    'knex-plugin',
    'jwt-auth-plugin',
    'schemas-plugin',
    'multipart-plugin',
  ],
});

export { fileUploadPlugin };

declare module 'fastify' {
  interface FastifyInstance {
    fileUploadService: FileUploadService;
  }
}
