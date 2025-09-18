import * as path from 'path';
import { createHash } from 'crypto';
import { MultipartFile } from '@fastify/multipart';
import sharp from 'sharp';
import { FastifyInstance } from 'fastify';
import { IStorageAdapter } from '../../shared/storage/interfaces/storage-adapter.interface';
import {
  FileUploadRepository,
  CreateFileData,
  UpdateFileData,
  FileFilters,
  PaginationOptions,
} from './file-upload.repository';
import {
  UploadedFile,
  FileUploadRequest,
  FileUpdateRequest,
  ImageProcessingRequest,
  SignedUrlRequest,
  FILE_UPLOAD_LIMITS,
} from './file-upload.schemas';

export interface FileUploadServiceDependencies {
  logger: FastifyInstance['log'];
  storageAdapter: IStorageAdapter;
  fileRepository: FileUploadRepository;
}

export interface ProcessedUploadResult {
  file: UploadedFile;
  warnings?: string[];
}

export interface MultipleUploadResult {
  uploaded: UploadedFile[];
  failed: Array<{
    filename: string;
    error: string;
    code: string;
  }>;
  summary: {
    total: number;
    uploaded: number;
    failed: number;
    totalSize: number;
  };
}

/**
 * Service for handling file upload operations
 */
export class FileUploadService {
  constructor(private deps: FileUploadServiceDependencies) {}

  /**
   * Upload a single file with image variant generation
   */
  async uploadFile(
    file: MultipartFile,
    uploadRequest: FileUploadRequest,
    userId: string,
  ): Promise<ProcessedUploadResult> {
    const result = await this.uploadFileWithoutVariants(
      file,
      uploadRequest,
      userId,
    );

    // Generate thumbnails for images synchronously for single uploads
    if (this.isImageFile(file.mimetype)) {
      await this.generateImageVariants(result.file, await file.toBuffer());
    }

    return result;
  }

  /**
   * Upload a single file without generating image variants (used by multiple upload)
   */
  private async uploadFileWithoutVariants(
    file: MultipartFile,
    uploadRequest: FileUploadRequest,
    userId: string,
  ): Promise<ProcessedUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Read file buffer with timeout protection
      const BUFFER_READ_TIMEOUT = 30000; // 30 seconds
      const bufferPromise = file.toBuffer();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Buffer read timeout: ${file.filename} took longer than ${BUFFER_READ_TIMEOUT}ms`,
            ),
          );
        }, BUFFER_READ_TIMEOUT);
      });

      const buffer = await Promise.race([bufferPromise, timeoutPromise]);

      // Generate file hash for duplicate detection
      const fileHash = this.generateFileHash(buffer);

      // Check for duplicates if not temporary
      if (!uploadRequest.isTemporary) {
        const existingFiles = await this.deps.fileRepository.findByHash(
          fileHash,
          userId,
        );
        if (existingFiles.length > 0) {
          const warnings = [
            `Duplicate file detected. Similar files: ${existingFiles.map((f) => f.originalName).join(', ')}`,
          ];
          return { file: existingFiles[0], warnings };
        }
      }

      // Process and classify file with timeout protection
      const FILE_PROCESSING_TIMEOUT = 30000; // 30 seconds
      const processPromise = this.processFileInfo(file, buffer);
      const processTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `File processing timeout: ${file.filename} took longer than ${FILE_PROCESSING_TIMEOUT}ms`,
            ),
          );
        }, FILE_PROCESSING_TIMEOUT);
      });

      const fileInfo = await Promise.race([
        processPromise,
        processTimeoutPromise,
      ]);

      // Generate storage key
      const storageKey = this.generateStorageKey(
        userId,
        fileInfo.fileType,
        file.filename,
      );

      // Upload to storage with timeout protection
      const STORAGE_UPLOAD_TIMEOUT = 60000; // 60 seconds
      const uploadPromise = this.deps.storageAdapter.upload({
        key: storageKey,
        buffer,
        mimeType: file.mimetype,
        originalName: file.filename,
        metadata: uploadRequest.metadata,
        isPublic: uploadRequest.isPublic || false,
        expires: uploadRequest.expiresIn
          ? new Date(Date.now() + uploadRequest.expiresIn * 60 * 60 * 1000)
          : undefined,
      });

      const storageTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Storage upload timeout: ${file.filename} took longer than ${STORAGE_UPLOAD_TIMEOUT}ms`,
            ),
          );
        }, STORAGE_UPLOAD_TIMEOUT);
      });

      const uploadResult = await Promise.race([
        uploadPromise,
        storageTimeoutPromise,
      ]);

      // Prepare database record
      const fileData: CreateFileData = {
        originalName: file.filename,
        filename: path.basename(storageKey),
        filepath: storageKey,
        mimeType: file.mimetype,
        fileSize: buffer.length,
        fileHash,
        storageAdapter: this.deps.storageAdapter.getAdapterName(),
        storageKey,
        fileCategory:
          uploadRequest.category || this.determineCategory(file.mimetype),
        fileType: fileInfo.fileType,
        metadata: {
          ...fileInfo.metadata,
          ...uploadRequest.metadata,
        },
        uploadedBy: userId,
        isPublic: uploadRequest.isPublic || false,
        isTemporary: uploadRequest.isTemporary || false,
        expiresAt: uploadRequest.expiresIn
          ? new Date(Date.now() + uploadRequest.expiresIn * 60 * 60 * 1000)
          : undefined,
        processingStatus: 'completed',
        variants: fileInfo.variants,
      };

      // Save to database with timeout protection
      const DB_SAVE_TIMEOUT = 10000; // 10 seconds
      const savePromise = this.deps.fileRepository.createFile(fileData);
      const saveTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Database save timeout: ${file.filename} took longer than ${DB_SAVE_TIMEOUT}ms`,
            ),
          );
        }, DB_SAVE_TIMEOUT);
      });

      const savedFile = await Promise.race([savePromise, saveTimeoutPromise]);

      this.deps.logger.info(`File uploaded successfully: ${savedFile.id}`);

      return { file: savedFile };
    } catch (error) {
      this.deps.logger.error(error, `Failed to upload file: ${file.filename}`);
      throw error;
    }
  }

  /**
   * Upload multiple files with concurrent processing and timeout protection
   */
  async uploadMultipleFiles(
    files: MultipartFile[],
    uploadRequest: FileUploadRequest,
    userId: string,
  ): Promise<MultipleUploadResult> {
    const startTime = Date.now();
    this.deps.logger.info(
      `Starting multiple file upload: ${files.length} files for user ${userId}`,
    );

    const uploaded: UploadedFile[] = [];
    const failed: Array<{ filename: string; error: string; code: string }> = [];
    let totalSize = 0;

    // Validate total number of files
    if (files.length > FILE_UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD) {
      throw new Error(
        `Too many files. Maximum ${FILE_UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} files allowed per upload.`,
      );
    }

    // Process files with controlled concurrency and timeout protection
    const CONCURRENCY_LIMIT = 3; // Process max 3 files simultaneously
    const UPLOAD_TIMEOUT = 120000; // 2 minutes per file

    const processFile = async (file: MultipartFile, index: number) => {
      const fileStartTime = Date.now();
      this.deps.logger.info(
        `Processing file ${index + 1}/${files.length}: ${file.filename}`,
      );

      try {
        // Add timeout wrapper for individual file upload
        const uploadPromise = this.uploadFileWithoutVariants(
          file,
          uploadRequest,
          userId,
        );
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Upload timeout: ${file.filename} took longer than ${UPLOAD_TIMEOUT}ms`,
              ),
            );
          }, UPLOAD_TIMEOUT);
        });

        const result = await Promise.race([uploadPromise, timeoutPromise]);

        const fileEndTime = Date.now();
        this.deps.logger.info(
          `File processed successfully: ${file.filename} (${fileEndTime - fileStartTime}ms)`,
        );

        uploaded.push(result.file);
        totalSize += result.file.fileSize;

        // Generate image variants asynchronously without blocking response
        if (this.isImageFile(file.mimetype)) {
          this.generateImageVariantsAsync(result.file, file).catch((error) => {
            this.deps.logger.error(
              error,
              `Failed to generate variants for ${result.file.id}`,
            );
          });
        }
      } catch (error: any) {
        const fileEndTime = Date.now();
        this.deps.logger.error(
          error,
          `File upload failed: ${file.filename} (${fileEndTime - fileStartTime}ms)`,
        );

        failed.push({
          filename: file.filename,
          error: error.message,
          code: this.getErrorCode(error),
        });
      }
    };

    // Process files in batches with concurrency control
    for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
      const batch = files.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map((file, batchIndex) =>
        processFile(file, i + batchIndex),
      );

      await Promise.allSettled(batchPromises);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    this.deps.logger.info(
      `Multiple file upload completed: ${uploaded.length} uploaded, ${failed.length} failed (${totalTime}ms total)`,
    );

    return {
      uploaded,
      failed,
      summary: {
        total: files.length,
        uploaded: uploaded.length,
        failed: failed.length,
        totalSize,
      },
    };
  }

  /**
   * Get file by ID
   */
  async getFile(id: string, userId?: string): Promise<UploadedFile | null> {
    return await this.deps.fileRepository.findById(id, userId);
  }

  /**
   * List files with pagination
   */
  async listFiles(filters: FileFilters, pagination: PaginationOptions) {
    return await this.deps.fileRepository.findFiles(filters, pagination);
  }

  /**
   * Update file metadata
   */
  async updateFile(
    id: string,
    updateRequest: FileUpdateRequest,
    userId: string,
  ): Promise<UploadedFile | null> {
    const updateData: UpdateFileData = {
      originalName: updateRequest.originalName,
      isPublic: updateRequest.isPublic,
      isTemporary: updateRequest.isTemporary,
      expiresAt: updateRequest.expiresAt
        ? new Date(updateRequest.expiresAt)
        : undefined,
      metadata: updateRequest.metadata,
    };

    return await this.deps.fileRepository.updateFile(id, updateData, userId);
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string): Promise<boolean> {
    try {
      // Get file info first
      const file = await this.deps.fileRepository.findById(id, userId);
      if (!file) {
        return false;
      }

      // Delete from storage
      await this.deps.storageAdapter.delete(file.filename);

      // Soft delete from database
      const deleted = await this.deps.fileRepository.deleteFile(id, userId);

      if (deleted) {
        this.deps.logger.info(`File deleted: ${id}`);
      }

      return deleted;
    } catch (error) {
      this.deps.logger.error(error, `Failed to delete file: ${id}`);
      throw error;
    }
  }

  /**
   * Process image
   */
  async processImage(
    id: string,
    processingRequest: ImageProcessingRequest,
    userId: string,
  ): Promise<{
    originalFileId: string;
    variantId?: string;
    processedUrl: string;
    operations: Record<string, any>;
    processedAt: string;
  }> {
    try {
      // Get original file
      const file = await this.deps.fileRepository.findById(id, userId);
      if (!file) {
        throw new Error('File not found');
      }

      if (!this.isImageFile(file.mimeType)) {
        throw new Error('File is not an image');
      }

      // Download original file
      const downloadResult = await this.deps.storageAdapter.download(
        file.filename,
      );
      const buffer = await this.streamToBuffer(downloadResult.stream);

      // Process image
      const processedBuffer = await this.applyImageOperations(
        buffer,
        processingRequest.operations,
      );

      // Generate new filename
      const variantName = processingRequest.variantName || 'processed';
      const originalExt = path.extname(file.filename);
      const newExt = processingRequest.operations.format
        ? `.${processingRequest.operations.format}`
        : originalExt;
      const newFilename = `${path.parse(file.filename).name}_${variantName}${newExt}`;

      // Upload processed image
      const storageKey = this.generateStorageKey(userId, 'image', newFilename);
      await this.deps.storageAdapter.upload({
        key: storageKey,
        buffer: processedBuffer,
        mimeType: processingRequest.operations.format
          ? `image/${processingRequest.operations.format}`
          : file.mimeType,
        originalName: newFilename,
        isPublic: file.isPublic,
      });

      let variantId: string | undefined;

      if (processingRequest.createVariant) {
        // Create new file record for variant
        const variantData: CreateFileData = {
          originalName: newFilename,
          filename: path.basename(storageKey),
          filepath: storageKey,
          mimeType: processingRequest.operations.format
            ? `image/${processingRequest.operations.format}`
            : file.mimeType,
          fileSize: processedBuffer.length,
          storageAdapter: this.deps.storageAdapter.getAdapterName(),
          storageKey,
          fileCategory: file.fileCategory,
          fileType: 'image',
          metadata: {
            parentFileId: file.id,
            processingOperations: processingRequest.operations,
          },
          uploadedBy: userId,
          isPublic: file.isPublic,
          isTemporary: file.isTemporary,
          processingStatus: 'completed',
        };

        const variantFile =
          await this.deps.fileRepository.createFile(variantData);
        variantId = variantFile.id;
      } else {
        // Update original file
        await this.deps.storageAdapter.delete(file.filename);
        await this.deps.storageAdapter.upload({
          key: file.filename,
          buffer: processedBuffer,
          mimeType: file.mimeType,
          originalName: file.originalName,
          isPublic: file.isPublic,
        });
      }

      return {
        originalFileId: id,
        variantId,
        processedUrl: `/api/files/${variantId || id}/download`,
        operations: processingRequest.operations,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.deps.logger.error(error, `Failed to process image: ${id}`);
      throw error;
    }
  }

  /**
   * Generate signed URL for secure access
   */
  async generateSignedUrl(
    id: string,
    request: SignedUrlRequest,
    userId?: string,
  ): Promise<{ url: string; expiresAt: string; permissions: string[] }> {
    try {
      const file = await this.deps.fileRepository.findById(id, userId);
      if (!file) {
        throw new Error('File not found');
      }

      const signedUrlResult = await this.deps.storageAdapter.generateSignedUrl({
        key: file.filename,
        operation: 'GET', // For now, only support GET operations
        expiresIn: request.expiresIn,
      });

      return {
        url: signedUrlResult.url,
        expiresAt: signedUrlResult.expiresAt.toISOString(),
        permissions: request.permissions,
      };
    } catch (error) {
      this.deps.logger.error(error, `Failed to generate signed URL: ${id}`);
      throw error;
    }
  }

  /**
   * Get user file statistics
   */
  async getUserStats(userId: string) {
    return await this.deps.fileRepository.getUserFileStats(userId);
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<{ cleaned: number; errors: number }> {
    try {
      const expiredFiles = await this.deps.fileRepository.findExpiredFiles(100);
      let cleaned = 0;
      let errors = 0;

      for (const file of expiredFiles) {
        try {
          await this.deleteFile(file.id, ''); // System cleanup, no user check
          cleaned++;
        } catch (error) {
          errors++;
          this.deps.logger.error(
            error,
            `Failed to cleanup expired file: ${file.id}`,
          );
        }
      }

      this.deps.logger.info(
        `Cleanup completed: ${cleaned} cleaned, ${errors} errors`,
      );
      return { cleaned, errors };
    } catch (error) {
      this.deps.logger.error(error, 'Failed to cleanup expired files');
      throw error;
    }
  }

  // Private helper methods

  private validateFile(file: MultipartFile): void {
    // Check file size
    if (file.file && file.file.bytesRead > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      throw new Error(
        `File too large. Maximum size: ${FILE_UPLOAD_LIMITS.MAX_FILE_SIZE} bytes`,
      );
    }

    // Check filename
    if (!file.filename || file.filename.trim() === '') {
      throw new Error('Filename is required');
    }

    // Check for potentially dangerous files
    if (this.isDangerousFile(file.filename, file.mimetype)) {
      throw new Error('File type not allowed for security reasons');
    }
  }

  private async processFileInfo(
    file: MultipartFile,
    buffer: Buffer,
  ): Promise<{
    fileType: string;
    metadata: Record<string, any>;
    variants?: Record<string, any>;
  }> {
    const fileType = this.determineFileType(file.mimetype);
    const metadata: Record<string, any> = {
      originalSize: buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    // Add image-specific metadata
    if (this.isImageFile(file.mimetype)) {
      try {
        const imageInfo = await sharp(buffer).metadata();
        metadata.width = imageInfo.width;
        metadata.height = imageInfo.height;
        metadata.format = imageInfo.format;
        metadata.hasAlpha = imageInfo.hasAlpha;
        metadata.density = imageInfo.density;
      } catch (error) {
        this.deps.logger.warn(error, 'Failed to read image metadata');
      }
    }

    return {
      fileType,
      metadata,
    };
  }

  /**
   * Generate image variants asynchronously (fire-and-forget)
   */
  private async generateImageVariantsAsync(
    file: UploadedFile,
    multipartFile: MultipartFile,
  ): Promise<void> {
    try {
      // Re-read buffer for async processing to avoid memory issues
      const buffer = await multipartFile.toBuffer();
      await this.generateImageVariants(file, buffer);
    } catch (error) {
      this.deps.logger.error(
        error,
        `Failed to generate image variants asynchronously for ${file.id}`,
      );
    }
  }

  /**
   * Generate image variants with timeout protection
   */
  private async generateImageVariants(
    file: UploadedFile,
    buffer: Buffer,
  ): Promise<void> {
    if (!this.isImageFile(file.mimeType)) return;

    const VARIANT_TIMEOUT = 30000; // 30 seconds timeout for variant generation

    try {
      const variantPromise = this.processImageVariants(file, buffer);
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Image variant generation timeout for ${file.id}`));
        }, VARIANT_TIMEOUT);
      });

      await Promise.race([variantPromise, timeoutPromise]);
    } catch (error) {
      this.deps.logger.error(
        error,
        `Failed to generate image variants for ${file.id}`,
      );
    }
  }

  /**
   * Process image variants with controlled concurrency
   */
  private async processImageVariants(
    file: UploadedFile,
    buffer: Buffer,
  ): Promise<void> {
    const variants: Record<string, any> = {};
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
    ];

    // Process variants concurrently
    const variantPromises = sizes.map(async (size) => {
      try {
        const resizedBuffer = await sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const variantKey = `${path.parse(file.filename).name}_${size.name}.jpg`;
        const storageKey = this.generateStorageKey(
          file.id,
          'image',
          variantKey,
        );

        await this.deps.storageAdapter.upload({
          key: storageKey,
          buffer: resizedBuffer,
          mimeType: 'image/jpeg',
          originalName: variantKey,
          isPublic: file.isPublic,
        });

        variants[size.name] = {
          url: `/api/files/${file.id}/download?variant=${size.name}`,
          width: size.width,
          height: size.height,
          size: resizedBuffer.length,
        };

        this.deps.logger.debug(`Generated ${size.name} variant for ${file.id}`);
      } catch (error) {
        this.deps.logger.warn(
          error,
          `Failed to generate ${size.name} variant for ${file.id}`,
        );
      }
    });

    await Promise.allSettled(variantPromises);

    // Update file with variants
    if (Object.keys(variants).length > 0) {
      await this.deps.fileRepository.updateFile(file.id, { variants });
      this.deps.logger.info(
        `Updated ${Object.keys(variants).length} variants for ${file.id}`,
      );
    }
  }

  private async applyImageOperations(
    buffer: Buffer,
    operations: any,
  ): Promise<Buffer> {
    let pipeline = sharp(buffer);

    // Apply resize
    if (operations.resize) {
      const { width, height, fit = 'inside' } = operations.resize;
      pipeline = pipeline.resize(width, height, { fit });
    }

    // Apply format conversion
    if (operations.format) {
      switch (operations.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality: operations.quality || 80 });
          break;
        case 'png':
          pipeline = pipeline.png();
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality: operations.quality || 80 });
          break;
      }
    }

    // Apply filters
    if (operations.blur) {
      pipeline = pipeline.blur(operations.blur);
    }

    if (operations.sharpen) {
      pipeline = pipeline.sharpen();
    }

    if (operations.grayscale) {
      pipeline = pipeline.grayscale();
    }

    return await pipeline.toBuffer();
  }

  private generateStorageKey(
    userId: string,
    fileType: string,
    filename: string,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    return `${userId}/${fileType}/${year}/${month}/${day}/${Date.now()}_${sanitizedFilename}`;
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private determineCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'media';
    if (mimeType.startsWith('audio/')) return 'media';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('document') || mimeType.includes('text'))
      return 'document';
    return 'general';
  }

  private determineFileType(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/webp': 'image',
      'image/gif': 'image',
      'application/pdf': 'pdf',
      'text/plain': 'text',
      'video/mp4': 'video',
      'audio/mp3': 'audio',
    };

    return typeMap[mimeType] || 'file';
  }

  private isImageFile(mimeType: string): boolean {
    return FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(mimeType as any);
  }

  private isDangerousFile(filename: string, mimeType: string): boolean {
    const dangerousExtensions = [
      '.exe',
      '.bat',
      '.com',
      '.cmd',
      '.scr',
      '.pif',
      '.js',
      '.jar',
    ];
    const dangerousMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msdos-program',
    ];

    const ext = path.extname(filename).toLowerCase();
    return (
      dangerousExtensions.includes(ext) || dangerousMimeTypes.includes(mimeType)
    );
  }

  private getErrorCode(error: any): string {
    if (error.message.includes('too large')) return 'FILE_TOO_LARGE';
    if (error.message.includes('not allowed')) return 'INVALID_FILE_TYPE';
    if (error.message.includes('virus')) return 'VIRUS_DETECTED';
    if (error.message.includes('storage')) return 'STORAGE_ERROR';
    return 'UPLOAD_ERROR';
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string),
      );
    }

    return Buffer.concat(chunks);
  }
}
