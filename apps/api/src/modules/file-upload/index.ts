// File Upload Module Exports

// Core classes
export { FileUploadRepository } from './file-upload.repository';
export { FileUploadService } from './file-upload.service';
export { FileUploadController } from './file-upload.controller';

// Plugin
export { default as fileUploadPlugin } from './file-upload.plugin';

// Schemas and types
export * from './file-upload.schemas';

// Storage adapters
export { LocalStorageAdapter } from '../../shared/storage/adapters/local-storage.adapter';
export * from '../../shared/storage/interfaces/storage-adapter.interface';

// Route registration
export { fileUploadRoutes } from './file-upload.routes';
