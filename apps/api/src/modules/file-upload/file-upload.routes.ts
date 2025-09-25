import { FastifyInstance } from 'fastify';
import {
  FileUpdateSchema,
  ImageProcessingSchema,
  SignedUrlRequestSchema,
  FileListQuerySchema,
  DownloadQuerySchema,
  ThumbnailQuerySchema,
  ViewQuerySchema,
  FileIdParamSchema,
  DeleteQuerySchema,
  FileUploadResponseSchema,
  MultipleFileUploadResponseSchema,
  FileListResponseSchema,
  SignedUrlResponseSchema,
  ImageProcessingResponseSchema,
  DeleteFileResponseSchema,
  FileUploadErrorSchema,
  FileStatsResponseSchema,
} from './file-upload.schemas';
import {
  StandardRouteResponses,
  ApiMetaSchema,
} from '../../schemas/base.schemas';
import { Type } from '@sinclair/typebox';
import { FileUploadController } from './file-upload.controller';
import { createOptionalAuthHandler } from '../../shared/helpers/optional-auth.helper';

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
        'Upload a single file with optional metadata and processing options. Send as multipart/form-data with file and optional fields.',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload (required)',
          },
          category: {
            type: 'string',
            description: 'File category (avatar, document, image, media)',
          },
          isPublic: {
            type: 'string',
            enum: ['true', 'false'],
            description: 'Whether the file should be publicly accessible',
          },
          isTemporary: {
            type: 'string',
            enum: ['true', 'false'],
            description:
              'Whether the file is temporary and should be auto-deleted',
          },
          expiresIn: {
            type: 'string',
            description: 'Expiration time in seconds for temporary files',
          },
          allowDuplicates: {
            type: 'string',
            enum: ['true', 'false'],
            description: 'Whether to allow duplicate files based on hash',
          },
          metadata: {
            type: 'string',
            description: 'JSON string containing additional metadata',
          },
        },
        required: ['file'],
      },
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
    attachValidation: true, // Skip validation errors
    preHandler: [fastify.authenticate],
    handler: controller.uploadSingleFile.bind(controller),
  });

  // Upload multiple files
  fastify.post('/upload/multiple', {
    schema: {
      tags: ['File Upload'],
      summary: 'Upload multiple files',
      description:
        'Upload multiple files in a single request with shared metadata. Send as multipart/form-data with multiple files and optional fields.',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'Files to upload (required, multiple files allowed)',
          },
          category: {
            type: 'string',
            description:
              'File category applied to all files (avatar, document, image, media)',
          },
          isPublic: {
            type: 'string',
            enum: ['true', 'false'],
            description: 'Whether the files should be publicly accessible',
          },
          isTemporary: {
            type: 'string',
            enum: ['true', 'false'],
            description:
              'Whether the files are temporary and should be auto-deleted',
          },
          expiresIn: {
            type: 'string',
            description: 'Expiration time in seconds for temporary files',
          },
          allowDuplicates: {
            type: 'string',
            enum: ['true', 'false'],
            description: 'Whether to allow duplicate files based on hash',
          },
          metadata: {
            type: 'string',
            description:
              'JSON string containing additional metadata applied to all files',
          },
        },
        required: ['file'],
      },
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
    attachValidation: true, // Skip validation errors
    bodyLimit: 1024 * 1024 * 1024, // 1GB body limit for multiple file uploads
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

  // Get storage configuration and stats (admin only)
  fastify.get('/storage/config', {
    schema: {
      tags: ['Storage Management'],
      summary: 'Get storage configuration',
      description:
        'Get current storage adapter configuration and statistics (admin access required)',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            type: Type.String(),
            configuration: Type.Any(),
            health: Type.Boolean(),
            uploadPath: Type.String(),
            diskSpace: Type.Optional(
              Type.Object({
                total: Type.Number(),
                used: Type.Number(),
                available: Type.Number(),
              }),
            ),
          }),
          meta: Type.Any(),
        }),
        401: StandardRouteResponses[401],
        403: StandardRouteResponses[403],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])], // Admin access required for storage configuration
    handler: controller.getStorageConfiguration.bind(controller),
  });

  // List user files (optional authentication - public files visible to all, private files require auth)
  fastify.get('/', {
    schema: {
      tags: ['File Management'],
      summary: 'List files',
      description:
        'Get paginated list of files with filtering options. Public files are visible to all users, private files require authentication.',
      querystring: FileListQuerySchema,
      response: {
        200: FileListResponseSchema,
        401: StandardRouteResponses[401],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: createOptionalAuthHandler(fastify),
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

  // Download file (optional authentication - public files accessible without auth, private files require token)
  fastify.get('/:id/download', {
    schema: {
      tags: ['File Access'],
      summary: 'Download file',
      description:
        'Download file content or specific variant. Public files can be accessed without authentication, private files require valid token.',
      params: FileIdParamSchema,
      querystring: DownloadQuerySchema,
      response: {
        200: {
          description: 'File content',
          type: 'string',
          format: 'binary',
        },
        401: FileUploadErrorSchema,
        404: FileUploadErrorSchema,
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    // Optional authentication - try to authenticate but don't fail if no token
    preHandler: createOptionalAuthHandler(fastify),
    handler: controller.downloadFile.bind(controller),
  });

  // View file inline (optional authentication - public files accessible without auth, private files require token)
  fastify.get('/:id/view', {
    // schema: {
    //   tags: ['File Access'],
    //   summary: 'View file inline',
    //   description: 'View file content inline in browser. Public files can be accessed without authentication, private files require valid token.',
    //   params: FileIdParamSchema,
    //   querystring: ViewQuerySchema,
    //   response: {
    //     200: {
    //       description: 'File content displayed inline',
    //       type: 'string',
    //       format: 'binary',
    //     },
    //     401: FileUploadErrorSchema,
    //     404: FileUploadErrorSchema,
    //     500: FileUploadErrorSchema,
    //   },
    //   security: [{ bearerAuth: [] }],
    // },
    // Optional authentication - try to authenticate but don't fail if no token
    preHandler: createOptionalAuthHandler(fastify),
    handler: controller.viewFile.bind(controller),
  });

  // Get custom thumbnail (optional authentication - public files accessible without auth, private files require token)
  fastify.get('/:id/thumbnail', {
    schema: {
      tags: ['File Access'],
      summary: 'Get custom thumbnail',
      description:
        'Generate or retrieve cached thumbnail with custom size and quality. Public files can be accessed without authentication, private files require valid token.',
      params: FileIdParamSchema,
      querystring: ThumbnailQuerySchema,
      response: {
        200: {
          description: 'Thumbnail image',
          type: 'string',
          format: 'binary',
        },
        401: FileUploadErrorSchema,
        404: FileUploadErrorSchema,
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    // Optional authentication - try to authenticate but don't fail if no token
    preHandler: createOptionalAuthHandler(fastify),
    handler: controller.getThumbnail.bind(controller),
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
      description:
        'Delete file (soft delete by default, force=true for hard delete)',
      params: FileIdParamSchema,
      querystring: DeleteQuerySchema,
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

  // Admin: Cleanup soft-deleted files
  fastify.post('/admin/cleanup-deleted', {
    schema: {
      tags: ['Admin'],
      summary: 'Cleanup soft-deleted files',
      description:
        'Permanently delete files that have been soft-deleted for longer than retention period',
      querystring: Type.Object({
        retentionDays: Type.Optional(
          Type.Number({
            minimum: 1,
            maximum: 365,
            default: 30,
            description: 'Number of days to retain soft-deleted files',
          }),
        ),
      }),
      response: {
        200: Type.Object({
          success: Type.Literal(true),
          data: Type.Object({
            cleaned: Type.Number(),
            errors: Type.Number(),
            retentionDays: Type.Number(),
          }),
          meta: ApiMetaSchema,
        }),
        500: FileUploadErrorSchema,
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])], // Admin-only cleanup operation
    handler: controller.cleanupSoftDeletedFiles.bind(controller),
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

  // Generate signed URLs (view, download, thumbnail)
  fastify.post('/:id/signed-urls', {
    schema: {
      tags: ['File Access'],
      summary: 'Generate signed URLs',
      description:
        'Generate time-limited signed URLs for view, download, and thumbnail access',
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
    handler: controller.generateSignedUrls.bind(controller),
  });

  // TODO: Add chunked upload endpoints
  // TODO: Add public file access endpoints
  // TODO: Add admin file management endpoints
}
