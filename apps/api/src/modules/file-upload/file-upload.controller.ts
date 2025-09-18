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
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided in request',
            statusCode: 400,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
        success: true,
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

      // Handle specific Fastify multipart errors
      let statusCode = 500;
      let errorCode = 'UPLOAD_FAILED';
      let errorMessage = error.message || 'Failed to upload file';

      if (error.code === 'FST_FILES_LIMIT') {
        statusCode = 413;
        errorCode = 'FILE_LIMIT_EXCEEDED';
        errorMessage = 'Too many files. Only 1 file allowed for single upload.';
      } else if (error.code === 'FST_FILE_TOO_LARGE') {
        statusCode = 413;
        errorCode = 'FILE_TOO_LARGE';
        errorMessage = 'File size exceeds 100MB limit.';
      }

      return reply.code(statusCode).send({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          statusCode: statusCode,
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
          success: false,
          error: {
            code: 'NO_FILES_PROVIDED',
            message: 'No files provided in request',
            statusCode: 400,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      request.log.info(
        `Starting multiple file upload: ${fileArray.length} files`,
      );
      const uploadStartTime = Date.now();

      const result = await this.deps.fileUploadService.uploadMultipleFiles(
        fileArray,
        uploadRequest,
        userId,
      );

      const uploadEndTime = Date.now();
      const uploadDuration = uploadEndTime - uploadStartTime;

      const statusCode =
        result.failed.length === 0
          ? 201
          : result.uploaded.length === 0
            ? 400
            : 207;

      request.log.info(
        `Multiple file upload completed: ${result.uploaded.length}/${result.summary.total} files uploaded (${uploadDuration}ms)`,
      );

      return reply.code(statusCode).send({
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
          duration: uploadDuration,
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to upload multiple files');

      // Handle specific Fastify multipart errors
      let statusCode = 500;
      let errorCode = 'UPLOAD_FAILED';
      let errorMessage = error.message || 'Failed to upload files';

      if (error.code === 'FST_FILES_LIMIT') {
        statusCode = 413;
        errorCode = 'FILE_LIMIT_EXCEEDED';
        errorMessage = 'Too many files. Maximum 10 files allowed.';
      } else if (error.code === 'FST_FILE_TOO_LARGE') {
        statusCode = 413;
        errorCode = 'FILE_TOO_LARGE';
        errorMessage = 'File size exceeds 100MB limit.';
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
        errorCode = 'UPLOAD_TIMEOUT';
        errorMessage =
          'Upload operation timed out. Please try with smaller files or fewer files.';
      } else if (error.message.includes('Buffer read timeout')) {
        statusCode = 408;
        errorCode = 'FILE_READ_TIMEOUT';
        errorMessage =
          'File reading timed out. The file may be corrupted or too large.';
      }

      return reply.code(statusCode).send({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          statusCode: statusCode,
          details:
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
            statusCode: 404,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        success: true,
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
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error.message || 'Failed to get file',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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

      // Map API field names to database column names
      const sortFieldMap: Record<string, string> = {
        uploadedAt: 'created_at',
        uploaded_at: 'created_at',
        created_at: 'created_at',
        updated_at: 'updated_at',
        file_size: 'file_size',
        original_name: 'original_name',
        mime_type: 'mime_type',
      };

      const sortField = request.query.sort || 'created_at';
      const mappedSortField = sortFieldMap[sortField] || 'created_at';

      const pagination = {
        page: request.query.page || 1,
        limit: Math.min(request.query.limit || 20, 100),
        sort: mappedSortField,
        order: request.query.order || ('desc' as 'asc' | 'desc'),
      };

      const result = await this.deps.fileUploadService.listFiles(
        filters,
        pagination,
      );

      return reply.send({
        success: true,
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
        success: false,
        error: {
          code: 'LIST_FAILED',
          message: error.message || 'Failed to list files',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
            statusCode: 404,
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
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'File download not yet implemented',
          statusCode: 501,
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
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error.message || 'Failed to download file',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found or access denied',
            statusCode: 404,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        success: true,
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
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || 'Failed to update file',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found or access denied',
            statusCode: 404,
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      return reply.send({
        success: true,
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
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error.message || 'Failed to delete file',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
        success: true,
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
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: error.message || 'Failed to process image',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
        success: true,
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
        success: false,
        error: {
          code: 'SIGNED_URL_FAILED',
          message: error.message || 'Failed to generate signed URL',
          statusCode: 500,
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
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            statusCode: 401,
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
        success: true,
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
        success: false,
        error: {
          code: 'STATS_FAILED',
          message: error.message || 'Failed to get user statistics',
          statusCode: 500,
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
