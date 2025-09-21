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
  ThumbnailQuery,
  ViewQuery,
  FileIdParam,
  isViewableMimeType,
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
      // Optional authentication: if userId is provided, filter by user + public files
      // If no userId, show only public files

      const filters = {
        uploadedBy: userId, // This will be undefined for anonymous users
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

      // Generate signed URLs for all files in the list (industry standard)
      let enhancedFiles = result.data;

      try {
        // Check if the client wants signed URLs included (default: true for convenience)
        const includeSignedUrls =
          (request.query as any)?.includeSignedUrls !== 'false';

        if (includeSignedUrls && result.data.length > 0) {
          const signedUrlsMap =
            await this.deps.fileUploadService.generateSignedUrlsForFiles(
              result.data,
              {
                expiresIn: 3600, // 1 hour default
                thumbnailOptions: {
                  size: '150x150',
                  format: 'webp',
                  quality: 80,
                },
              },
            );

          // Enhance each file with signed URLs
          enhancedFiles = result.data.map((file) => {
            const signedUrls = signedUrlsMap.get(file.id);

            if (signedUrls) {
              return {
                ...file,
                signedUrls: {
                  view: signedUrls.urls.view,
                  download: signedUrls.urls.download,
                  thumbnail: signedUrls.urls.thumbnail,
                  expiresAt: signedUrls.expiresAt.toISOString(),
                },
              };
            }

            return file;
          });
        }
      } catch (error) {
        // If signed URL generation fails, continue without them but log the error
        request.log.warn(error, 'Failed to generate signed URLs for file list');
      }

      return reply.send({
        success: true,
        data: enhancedFiles,
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
      const signedUrlToken = (request as any).signedUrlToken;

      // For private files, validate either user authentication or signed URL token
      const file = await this.deps.fileUploadService.getFile(
        id,
        userId,
        !!signedUrlToken,
      );

      if (!file) {
        return reply.code(404).send({
          success: false,
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

      // Check access permissions
      if (!file.isPublic && !userId && !signedUrlToken) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message:
              'This file requires authentication or a valid signed URL token',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // If signed URL token is provided, validate it
      if (signedUrlToken) {
        const isValidToken =
          await this.deps.fileUploadService.verifySignedUrlToken(
            signedUrlToken,
            'download',
            file.filepath,
          );

        if (!isValidToken) {
          return reply.code(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired signed URL token',
            },
            meta: {
              requestId: request.id,
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          });
        }
      }

      // Download file from storage
      const downloadResult = await this.deps.fileUploadService.downloadFile(
        id,
        {
          variant,
          userId,
          bypassAccessControl: !!signedUrlToken,
        },
      );

      // Set response headers
      reply.type(file.mimeType);
      reply.header('Content-Length', file.fileSize.toString());

      // For download route, default to attachment (force download)
      // Only use inline if explicitly requested via query parameter
      const shouldInline = inline === true;

      if (shouldInline) {
        reply.header(
          'Content-Disposition',
          `inline; filename="${file.originalName}"`,
        );
      } else {
        reply.header(
          'Content-Disposition',
          `attachment; filename="${file.originalName}"`,
        );
      }

      // Log file access
      await this.deps.fileUploadService.logFileAccess({
        fileId: id,
        userId,
        action: 'download',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        requestHeaders: request.headers,
      });

      // Send file buffer
      return reply.send(downloadResult.buffer);
    } catch (error: any) {
      request.log.error(error, 'Failed to download file');

      return reply.code(500).send({
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error.message || 'Failed to download file',
          details:
            process.env.NODE_ENV === 'development'
              ? { stack: error.stack }
              : undefined,
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
   * View file inline
   */
  async viewFile(
    request: FastifyRequest<{
      Params: FileIdParam;
      Querystring: ViewQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const { variant, cache, force = 'auto' } = request.query;
      const userId = request.user?.id;
      const signedUrlToken = (request as any).signedUrlToken;

      const file = await this.deps.fileUploadService.getFile(
        id,
        userId,
        !!signedUrlToken,
      );

      if (!file) {
        return reply.code(404).send({
          success: false,
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

      // Check access permissions
      if (!file.isPublic && !userId && !signedUrlToken) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message:
              'This file requires authentication or a valid signed URL token',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // If signed URL token is provided, validate it
      if (signedUrlToken) {
        const isValidToken =
          await this.deps.fileUploadService.verifySignedUrlToken(
            signedUrlToken,
            'view',
            file.filepath,
          );

        if (!isValidToken) {
          return reply.code(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired signed URL token',
            },
            meta: {
              requestId: request.id,
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          });
        }
      }

      // Download file from storage (same as download but force inline)
      const downloadResult = await this.deps.fileUploadService.downloadFile(
        id,
        {
          variant,
          userId,
          bypassAccessControl: !!signedUrlToken,
        },
      );

      // Set response headers
      reply.type(file.mimeType);
      reply.header('Content-Length', file.fileSize.toString());

      // Smart View Logic: Determine whether to display inline or force download
      let shouldDisplayInline = false;

      switch (force) {
        case 'view':
          // Force inline view regardless of MIME type
          shouldDisplayInline = true;
          break;
        case 'download':
          // Force download regardless of MIME type
          shouldDisplayInline = false;
          break;
        case 'auto':
        default:
          // Auto-detect based on MIME type
          shouldDisplayInline = isViewableMimeType(file.mimeType);
          break;
      }

      // Set Content-Disposition header based on decision
      if (shouldDisplayInline) {
        reply.header(
          'Content-Disposition',
          `inline; filename="${file.originalName}"`,
        );
      } else {
        reply.header(
          'Content-Disposition',
          `attachment; filename="${file.originalName}"`,
        );
      }

      // Set cache headers if requested
      if (cache !== false) {
        reply.header('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      }

      // Log file access
      await this.deps.fileUploadService.logFileAccess({
        fileId: id,
        userId,
        action: 'view',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        requestHeaders: request.headers,
      });

      // Send file buffer
      return reply.send(downloadResult.buffer);
    } catch (error: any) {
      request.log.error(error, 'Failed to view file');

      return reply.code(500).send({
        success: false,
        error: {
          code: 'VIEW_FAILED',
          message: error.message || 'Failed to view file',
          details:
            process.env.NODE_ENV === 'development'
              ? { stack: error.stack }
              : undefined,
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
   * Get custom thumbnail
   */
  async getThumbnail(
    request: FastifyRequest<{
      Params: FileIdParam;
      Querystring: ThumbnailQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const { size = '150x150', quality = 80, format = 'jpg' } = request.query;
      const userId = request.user?.id;
      const signedUrlToken = (request as any).signedUrlToken;

      const file = await this.deps.fileUploadService.getFile(
        id,
        userId,
        !!signedUrlToken,
      );

      if (!file) {
        return reply.code(404).send({
          success: false,
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

      // Check access permissions
      if (!file.isPublic && !userId && !signedUrlToken) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message:
              'This file requires authentication or a valid signed URL token',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // If signed URL token is provided, validate it
      if (signedUrlToken) {
        const isValidToken =
          await this.deps.fileUploadService.verifySignedUrlToken(
            signedUrlToken,
            'thumbnail',
            file.filepath,
          );

        if (!isValidToken) {
          return reply.code(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired signed URL token',
            },
            meta: {
              requestId: request.id,
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          });
        }
      }

      // Check if it's an image file
      if (!file.mimeType.startsWith('image/')) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NOT_AN_IMAGE',
            message: 'Thumbnails can only be generated for image files',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // Parse size (e.g., "150x150" -> [150, 150])
      const [width, height] = size.split('x').map(Number);

      if (!width || !height || width <= 0 || height <= 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_SIZE',
            message: 'Invalid size format. Use format like "150x150"',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      // Generate thumbnail with requested size and format
      const thumbnailResult =
        await this.deps.fileUploadService.generateThumbnail(id, {
          width,
          height,
          quality,
          format,
          userId: signedUrlToken ? undefined : userId, // ไม่ใช้ userId เมื่อมี signed URL token
        });

      // Set thumbnail response headers
      const thumbnailMimeType =
        format === 'png'
          ? 'image/png'
          : format === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

      reply.type(thumbnailMimeType);
      reply.header(
        'Content-Disposition',
        `inline; filename="${file.originalName}_${size}.${format}"`,
      );
      reply.header('Cache-Control', 'public, max-age=86400'); // 24 hours cache for thumbnails

      // Log thumbnail access
      await this.deps.fileUploadService.logFileAccess({
        fileId: id,
        userId,
        action: 'thumbnail',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        requestHeaders: request.headers,
        httpStatus: 200,
      });

      // Send thumbnail stream
      reply.header('Content-Length', thumbnailResult.size.toString());
      return reply.send(thumbnailResult.stream);
    } catch (error: any) {
      request.log.error(error, 'Failed to get thumbnail');

      // Map error codes from service to schema-compliant codes
      let errorCode = 'PROCESSING_FAILED'; // default
      if (error.code === 'FILE_NOT_FOUND') {
        errorCode = 'FILE_NOT_FOUND';
      } else if (error.code === 'INVALID_FILE_TYPE') {
        errorCode = 'INVALID_FILE_TYPE';
      } else if (error.code === 'PROCESSING_FAILED') {
        errorCode = 'PROCESSING_FAILED';
      }

      return reply.code(500).send({
        success: false,
        error: {
          code: errorCode,
          message: error.message || 'Failed to generate thumbnail',
          details:
            process.env.NODE_ENV === 'development'
              ? { stack: error.stack }
              : undefined,
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
   * Generate signed URL (legacy)
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
   * Generate signed URLs (view, download, thumbnail)
   */
  async generateSignedUrls(
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
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const result = await this.deps.fileUploadService.generateSignedUrls(
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
      request.log.error(error, 'Failed to generate signed URLs');

      const statusCode = error.message.includes('not found') ? 404 : 500;

      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'SIGNED_URL_FAILED',
          message: error.message || 'Failed to generate signed URLs',
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
   * Test upload without authentication (for development testing)
   */
  async testUploadFile(
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
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      }

      const uploadRequest: FileUploadRequest = {
        category: request.body?.category || 'test',
        isPublic: true, // Force public for test uploads
        isTemporary: request.body?.isTemporary || true,
        expiresIn: request.body?.expiresIn,
        metadata: request.body?.metadata,
      };

      // Use admin user ID for testing (from seeded data)
      const testUserId = 'dec7e996-28fd-4e68-a32b-b839d9f4150c';

      const result = await this.deps.fileUploadService.uploadFile(
        data,
        uploadRequest,
        testUserId,
      );

      return reply.code(201).send({
        success: true,
        data: result.file,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
          warnings: result.warnings,
          testMode: true,
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to upload test file');

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
          testMode: true,
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
   * Get storage configuration and statistics (admin only)
   */
  async getStorageConfiguration(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const storageStats = await this.deps.fileUploadService.getStorageStats();

      return reply.send({
        success: true,
        data: storageStats,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Failed to get storage configuration');

      return reply.code(500).send({
        success: false,
        error: {
          code: 'STORAGE_CONFIG_FAILED',
          message: error.message || 'Failed to get storage configuration',
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
