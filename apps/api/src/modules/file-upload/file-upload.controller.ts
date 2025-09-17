import { FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { FileUploadService } from './file-upload.service';
import {
  FileUploadRequest,
  FileUpdateRequest,
  ImageProcessingRequest,
  SignedUrlRequest,
  FileListQuery,
  DownloadQuery,
  FileIdParam,
} from './file-upload.schemas';

export interface FileUploadControllerDependencies {
  fileUploadService: FileUploadService;
}

/**
 * Controller for file upload operations
 */
export class FileUploadController {
  constructor(private deps: FileUploadControllerDependencies) {}

  /**
   * Upload single file
   */
  async uploadSingleFile(
    request: FastifyRequest<{
      Body: FileUploadRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided in request',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const uploadRequest: FileUploadRequest = {
        category: request.body?.category,
        isPublic: request.body?.isPublic,
        isTemporary: request.body?.isTemporary,
        expiresIn: request.body?.expiresIn,
        metadata: request.body?.metadata,
      };

      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const result = await this.deps.fileUploadService.uploadFile(
        data,
        uploadRequest,
        userId,
      );

      return reply.code(201).send({
        data: result.file,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
          warnings: result.warnings,
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to upload file');

      return reply.code(500).send({
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to upload file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    request: FastifyRequest<{
      Body: FileUploadRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const files = request.files();
      const fileArray: MultipartFile[] = [];

      for await (const file of files) {
        fileArray.push(file);
      }

      if (fileArray.length === 0) {
        return reply.code(400).send({
          error: {
            code: 'NO_FILES_PROVIDED',
            message: 'No files provided in request',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const uploadRequest: FileUploadRequest = {
        category: request.body?.category,
        isPublic: request.body?.isPublic,
        isTemporary: request.body?.isTemporary,
        expiresIn: request.body?.expiresIn,
        metadata: request.body?.metadata,
      };

      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const result = await this.deps.fileUploadService.uploadMultipleFiles(
        fileArray,
        uploadRequest,
        userId,
      );

      const statusCode =
        result.failed.length === 0
          ? 201
          : result.uploaded.length === 0
            ? 400
            : 207;

      return reply.code(statusCode).send({
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to upload multiple files');

      return reply.code(500).send({
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to upload files',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Get file metadata
   */
  async getFile(
    request: FastifyRequest<{
      Params: FileIdParam;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      const file = await this.deps.fileUploadService.getFile(id, userId);

      if (!file) {
        return reply.code(404).send({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        data: file,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to get file');

      return reply.code(500).send({
        error: {
          code: 'FETCH_FAILED',
          message: error.message || 'Failed to get file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * List user files
   */
  async listFiles(
    request: FastifyRequest<{
      Querystring: FileListQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const filters = {
        uploadedBy: userId,
        category: request.query.category,
        type: request.query.type,
        isPublic: request.query.isPublic,
        isTemporary: request.query.isTemporary,
        search: request.query.search,
      };

      const pagination = {
        page: request.query.page || 1,
        limit: Math.min(request.query.limit || 20, 100),
        sort: request.query.sort || 'created_at',
        order: request.query.order || ('desc' as 'asc' | 'desc'),
      };

      const result = await this.deps.fileUploadService.listFiles(
        filters,
        pagination,
      );

      return reply.send({
        data: result.data,
        pagination: result.pagination,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to list files');

      return reply.code(500).send({
        error: {
          code: 'LIST_FAILED',
          message: error.message || 'Failed to list files',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Download file
   */
  async downloadFile(
    request: FastifyRequest<{
      Params: FileIdParam;
      Querystring: DownloadQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const { variant, inline } = request.query;
      const userId = request.user?.id;

      const file = await this.deps.fileUploadService.getFile(id, userId);

      if (!file) {
        return reply.code(404).send({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // TODO: Implement actual file streaming from storage
      // For now, return a redirect or error
      return reply.code(501).send({
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'File download not yet implemented',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to download file');

      return reply.code(500).send({
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error.message || 'Failed to download file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(
    request: FastifyRequest<{
      Params: FileIdParam;
      Body: FileUpdateRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const updatedFile = await this.deps.fileUploadService.updateFile(
        id,
        request.body,
        userId,
      );

      if (!updatedFile) {
        return reply.code(404).send({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found or access denied',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        data: updatedFile,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to update file');

      return reply.code(500).send({
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || 'Failed to update file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(
    request: FastifyRequest<{
      Params: FileIdParam;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const deleted = await this.deps.fileUploadService.deleteFile(id, userId);

      if (!deleted) {
        return reply.code(404).send({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found or access denied',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        data: {
          id,
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to delete file');

      return reply.code(500).send({
        error: {
          code: 'DELETE_FAILED',
          message: error.message || 'Failed to delete file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Process image
   */
  async processImage(
    request: FastifyRequest<{
      Params: FileIdParam;
      Body: ImageProcessingRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const result = await this.deps.fileUploadService.processImage(
        id,
        request.body,
        userId,
      );

      return reply.send({
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to process image');

      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('not an image')
          ? 400
          : 500;

      return reply.code(statusCode).send({
        error: {
          code: 'PROCESSING_FAILED',
          message: error.message || 'Failed to process image',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Generate signed URL
   */
  async generateSignedUrl(
    request: FastifyRequest<{
      Params: FileIdParam;
      Body: SignedUrlRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const result = await this.deps.fileUploadService.generateSignedUrl(
        id,
        request.body,
        userId,
      );

      return reply.send({
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to generate signed URL');

      const statusCode = error.message.includes('not found') ? 404 : 500;

      return reply.code(statusCode).send({
        error: {
          code: 'SIGNED_URL_FAILED',
          message: error.message || 'Failed to generate signed URL',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const stats = await this.deps.fileUploadService.getUserStats(userId);

      return reply.send({
        data: stats,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to get user stats');

      return reply.code(500).send({
        error: {
          code: 'STATS_FAILED',
          message: error.message || 'Failed to get user statistics',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  }
}
