import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { IMPORT_CONFIG } from '../config/import.config';

export interface MultipartPluginOptions {
  /** File size limit in bytes */
  maxFileSize?: number;
  /** Maximum number of files per request */
  maxFiles?: number;
  /** Maximum size for form fields in bytes */
  maxFieldSize?: number;
  /** Maximum number of non-file fields */
  maxFields?: number;
}

/**
 * Global Multipart Plugin using @aegisx/fastify-multipart
 * Provides clean multipart form support for all modules
 *
 * Enforces file size limits at Fastify level (10MB per file as per IMPORT_CONFIG)
 */
async function multipartPlugin(
  fastify: FastifyInstance,
  opts: MultipartPluginOptions = {},
) {
  const options = {
    maxFileSize: IMPORT_CONFIG.MAX_FILE_SIZE, // 10MB - Import system limit
    maxFiles: 1, // Only 1 file per request
    maxFieldSize: 10 * 1024 * 1024, // 10MB
    maxFields: 10, // Max 10 form fields
    ...opts,
  };
  // Register multipart plugin with autoContentTypeParser: false as per docs
  await fastify.register(require('@aegisx/fastify-multipart'), {
    limits: {
      fileSize: options.maxFileSize, // 10MB per file
      files: options.maxFiles, // 1 file per request
      fieldSize: options.maxFieldSize, // 10MB field size
      fields: options.maxFields, // 10 form fields max
      headerPairs: 2000, // Prevent header overflow
    },
    autoContentTypeParser: false, // Disable auto parser for Swagger integration
  });

  // Add custom content type parser for multipart/form-data
  fastify.addContentTypeParser(
    'multipart/form-data',
    function (_request, payload, done) {
      done(null, payload);
    },
  );

  // Note: TypeBox type provider is set before this plugin, so we need to work with it
  // instead of trying to override the validator compiler completely.
  // The solution is to remove body schema for upload routes since TypeBox will validate
  // against the schema, and multipart data won't match the expected format.

  fastify.log.info(
    'AegisX Multipart plugin registered successfully with Swagger integration',
  );
}

export default fp(multipartPlugin, {
  name: 'multipart-plugin',
  dependencies: [],
});

export { multipartPlugin };
