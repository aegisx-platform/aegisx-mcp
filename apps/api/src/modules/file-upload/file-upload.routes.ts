import { FastifyInstance } from 'fastify';
import {
  FileUpdateSchema,
  ImageProcessingSchema,
  SignedUrlRequestSchema,
  FileListQuerySchema,
  DownloadQuerySchema,
  FileIdParamSchema,
  FileUploadResponseSchema,
  MultipleFileUploadResponseSchema,
  FileListResponseSchema,
  SignedUrlResponseSchema,
  ImageProcessingResponseSchema,
  DeleteFileResponseSchema,
  FileUploadErrorSchema,
  FileStatsResponseSchema,
} from './file-upload.schemas';
import { StandardRouteResponses } from '../../schemas/base.schemas';
import { FileUploadController } from './file-upload.controller';

export interface FileUploadRoutesOptions {
  controller: FileUploadController;
  prefix?: string;
}

/**
 * Register file upload routes
 */
export async function fileUploadRoutes(
  fastify: FastifyInstance,
  options: FileUploadRoutesOptions,
) {
  const { controller } = options;

  // Upload single file
  fastify.post('/upload', {
    schema: {
      tags: ['File Upload'],
      summary: 'Upload a single file',
      description:
        'Upload a single file with optional metadata and processing options',
      consumes: ['multipart/form-data'],
      // Don't validate body for multipart uploads - handled by @fastify/multipart
      response: {
        201: FileUploadResponseSchema,
        400: StandardRouteResponses[400],
        401: StandardRouteResponses[401],
        403: StandardRouteResponses[403],
        404: StandardRouteResponses[404],
        413: FileUploadErrorSchema,
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.uploadSingleFile.bind(controller),
  });

  // Upload multiple files
  fastify.post('/upload/multiple', {
    schema: {
      tags: ['File Upload'],
      summary: 'Upload multiple files',
      description:
        'Upload multiple files in a single request with shared metadata',
      consumes: ['multipart/form-data'],
      // Don't validate body for multipart uploads - handled by @fastify/multipart
      response: {
        201: MultipleFileUploadResponseSchema,
        207: MultipleFileUploadResponseSchema, // Multi-status
        400: StandardRouteResponses[400],
        401: StandardRouteResponses[401],
        413: FileUploadErrorSchema,
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.uploadMultipleFiles.bind(controller),
  });

  // Get user file statistics (simple /stats route)
  fastify.get('/stats', {
    schema: {
      tags: ['File Statistics'],
      summary: 'Get user file statistics',
      description: 'Get comprehensive statistics about user uploaded files',
      response: {
        200: FileStatsResponseSchema,
        401: StandardRouteResponses[401],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.getUserStats.bind(controller),
  });

  // Get user file statistics (alternative /stats/user route)
  fastify.get('/stats/user', {
    schema: {
      tags: ['File Statistics'],
      summary: 'Get user file statistics (alternative endpoint)',
      description: 'Get comprehensive statistics about user uploaded files',
      response: {
        200: FileStatsResponseSchema,
        401: StandardRouteResponses[401],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.getUserStats.bind(controller),
  });

  // List user files
  fastify.get('/', {
    schema: {
      tags: ['File Management'],
      summary: 'List user files',
      description: 'Get paginated list of user files with filtering options',
      querystring: FileListQuerySchema,
      response: {
        200: FileListResponseSchema,
        401: StandardRouteResponses[401],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.listFiles.bind(controller),
  });

  // Get file metadata
  fastify.get('/:id', {
    schema: {
      tags: ['File Management'],
      summary: 'Get file metadata',
      description: 'Get detailed metadata for a specific file',
      params: FileIdParamSchema,
      response: {
        200: FileUploadResponseSchema,
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.getFile.bind(controller),
  });

  // Download file
  fastify.get('/:id/download', {
    schema: {
      tags: ['File Access'],
      summary: 'Download file',
      description: 'Download file content or specific variant',
      params: FileIdParamSchema,
      querystring: DownloadQuerySchema,
      response: {
        200: {
          description: 'File content',
          type: 'string',
          format: 'binary',
        },
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.downloadFile.bind(controller),
  });

  // Update file metadata
  fastify.put('/:id', {
    schema: {
      tags: ['File Management'],
      summary: 'Update file metadata',
      description: 'Update file metadata and settings',
      params: FileIdParamSchema,
      body: FileUpdateSchema,
      response: {
        200: FileUploadResponseSchema,
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.updateFile.bind(controller),
  });

  // Delete file
  fastify.delete('/:id', {
    schema: {
      tags: ['File Management'],
      summary: 'Delete file',
      description: 'Delete file and all its variants',
      params: FileIdParamSchema,
      response: {
        200: DeleteFileResponseSchema,
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.deleteFile.bind(controller),
  });

  // Process image
  fastify.post('/:id/process', {
    schema: {
      tags: ['Image Processing'],
      summary: 'Process image',
      description:
        'Apply image processing operations (resize, format conversion, filters)',
      params: FileIdParamSchema,
      body: ImageProcessingSchema,
      response: {
        200: ImageProcessingResponseSchema,
        400: FileUploadErrorSchema,
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.processImage.bind(controller),
  });

  // Generate signed URL
  fastify.post('/:id/signed-url', {
    schema: {
      tags: ['File Access'],
      summary: 'Generate signed URL',
      description: 'Generate a time-limited signed URL for secure file access',
      params: FileIdParamSchema,
      body: SignedUrlRequestSchema,
      response: {
        200: SignedUrlResponseSchema,
        401: FileUploadErrorSchema,
        404: StandardRouteResponses[404],
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.generateSignedUrl.bind(controller),
  });

  // TODO: Add chunked upload endpoints
  // TODO: Add public file access endpoints
  // TODO: Add admin file management endpoints
}
