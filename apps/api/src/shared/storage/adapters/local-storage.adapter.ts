import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { FastifyInstance } from 'fastify';
import {
  IStorageAdapter,
  UploadParams,
  UploadResult,
  DownloadResult,
  DeleteResult,
  FileMetadata,
  SignedUrlParams,
  SignedUrlResult,
  CopyResult,
  MoveResult,
  FileListResult,
  StorageConfig,
} from '../interfaces/storage-adapter.interface';

export interface LocalStorageAdapterDependencies {
  logger: FastifyInstance['log'];
}

/**
 * Local filesystem storage adapter
 * Stores files on the local filesystem with organization and security
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly basePath: string;
  private readonly publicUrlBase: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private deps: LocalStorageAdapterDependencies,
    private config: StorageConfig,
  ) {
    this.basePath = config.basePath || path.join(process.cwd(), 'uploads');
    this.publicUrlBase = config.publicUrlBase || '/api/files';
    this.maxFileSize = config.maxFileSize || 100 * 1024 * 1024; // 100MB default
    this.allowedMimeTypes = config.allowedMimeTypes || ['*/*'];

    // Ensure base directory exists
    this.ensureBaseDirectory();
  }

  /**
   * Upload file to local storage
   */
  async upload(params: UploadParams): Promise<UploadResult> {
    try {
      // Validate file size
      if (params.buffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds limit: ${this.maxFileSize} bytes`);
      }

      // Validate MIME type
      if (!this.isAllowedMimeType(params.mimeType)) {
        throw new Error(`MIME type not allowed: ${params.mimeType}`);
      }

      // Sanitize and prepare file path
      const sanitizedKey = this.sanitizeKey(params.key);
      const fullPath = path.join(this.basePath, sanitizedKey);

      // Ensure directory exists
      await this.ensureDirectory(path.dirname(fullPath));

      // Generate file hash for integrity
      const hash = createHash('sha256').update(params.buffer).digest('hex');

      // Write file to disk
      await fs.writeFile(fullPath, params.buffer);

      // Create metadata file
      const metadataPath = `${fullPath}.meta`;
      const metadata = {
        originalName: params.originalName,
        mimeType: params.mimeType,
        size: params.buffer.length,
        hash,
        uploadedAt: new Date().toISOString(),
        isPublic: params.isPublic || false,
        expires: params.expires?.toISOString(),
        customMetadata: params.metadata,
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      this.deps.logger.info(`File uploaded successfully: ${sanitizedKey}`);

      return {
        key: sanitizedKey,
        url: params.isPublic
          ? `${this.publicUrlBase}/${sanitizedKey}`
          : undefined,
        size: params.buffer.length,
        etag: hash,
        metadata: metadata.customMetadata,
      };
    } catch (error) {
      this.deps.logger.error({ error }, `Failed to upload file: ${params.key}`);
      throw error;
    }
  }

  /**
   * Download file from local storage
   */
  async download(key: string): Promise<DownloadResult> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);
      const metadataPath = `${fullPath}.meta`;

      // Check if file exists
      if (!(await this.fileExists(fullPath))) {
        throw new Error(`File not found: ${key}`);
      }

      // Read metadata
      const metadata = await this.readMetadata(metadataPath);

      // Check if file has expired
      if (metadata.expires && new Date() > new Date(metadata.expires)) {
        throw new Error(`File has expired: ${key}`);
      }

      // Get file stats
      const stats = await fs.stat(fullPath);

      // Create readable stream
      const stream = createReadStream(fullPath);

      this.deps.logger.info(`File downloaded: ${sanitizedKey}`);

      return {
        stream,
        metadata: {
          key: sanitizedKey,
          size: stats.size,
          contentType: metadata.mimeType,
          etag: metadata.hash,
          lastModified: stats.mtime,
          metadata: metadata.customMetadata,
        },
        contentType: metadata.mimeType,
        contentLength: stats.size,
        etag: metadata.hash,
        lastModified: stats.mtime,
      };
    } catch (error) {
      this.deps.logger.error({ error }, `Failed to download file: ${key}`);
      throw error;
    }
  }

  /**
   * Delete file from local storage
   */
  async delete(key: string): Promise<DeleteResult> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);
      const metadataPath = `${fullPath}.meta`;

      let success = true;
      const deletedAt = new Date();

      // Delete main file
      try {
        await fs.unlink(fullPath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          success = false;
          throw error;
        }
      }

      // Delete metadata file
      try {
        await fs.unlink(metadataPath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          // Don't fail if metadata file doesn't exist
          this.deps.logger.warn(`Metadata file not found: ${metadataPath}`);
        }
      }

      this.deps.logger.info(`File deleted: ${sanitizedKey}`);

      return {
        success,
        key: sanitizedKey,
        deletedAt,
      };
    } catch (error) {
      this.deps.logger.error({ error }, `Failed to delete file: ${key}`);
      return {
        success: false,
        key,
        deletedAt: new Date(),
      };
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);
      return await this.fileExists(fullPath);
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);
      const metadataPath = `${fullPath}.meta`;

      if (!(await this.fileExists(fullPath))) {
        throw new Error(`File not found: ${key}`);
      }

      const metadata = await this.readMetadata(metadataPath);
      const stats = await fs.stat(fullPath);

      return {
        key: sanitizedKey,
        size: stats.size,
        contentType: metadata.mimeType,
        etag: metadata.hash,
        lastModified: stats.mtime,
        metadata: metadata.customMetadata,
      };
    } catch (error) {
      this.deps.logger.error({ error }, `Failed to get metadata: ${key}`);
      throw error;
    }
  }

  /**
   * Generate signed URL (simplified for local storage)
   */
  async generateSignedUrl(params: SignedUrlParams): Promise<SignedUrlResult> {
    // For local storage, we'll generate a JWT-like token
    const payload = {
      key: params.key,
      operation: params.operation,
      exp: Math.floor(Date.now() / 1000) + params.expiresIn,
    };

    // Simple base64 encoding (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const url = `${this.publicUrlBase}/${params.key}?token=${token}`;
    const expiresAt = new Date(Date.now() + params.expiresIn * 1000);

    return {
      url,
      expiresAt,
      operation: params.operation,
    };
  }

  /**
   * Copy file within local storage
   */
  async copy(sourceKey: string, destinationKey: string): Promise<CopyResult> {
    try {
      const sanitizedSource = this.sanitizeKey(sourceKey);
      const sanitizedDest = this.sanitizeKey(destinationKey);

      const sourcePath = path.join(this.basePath, sanitizedSource);
      const destPath = path.join(this.basePath, sanitizedDest);

      const sourceMetaPath = `${sourcePath}.meta`;
      const destMetaPath = `${destPath}.meta`;

      // Ensure source exists
      if (!(await this.fileExists(sourcePath))) {
        throw new Error(`Source file not found: ${sourceKey}`);
      }

      // Ensure destination directory exists
      await this.ensureDirectory(path.dirname(destPath));

      // Copy main file
      await fs.copyFile(sourcePath, destPath);

      // Copy metadata file if exists
      if (await this.fileExists(sourceMetaPath)) {
        await fs.copyFile(sourceMetaPath, destMetaPath);
      }

      this.deps.logger.info(
        `File copied: ${sanitizedSource} -> ${sanitizedDest}`,
      );

      return {
        success: true,
        sourceKey: sanitizedSource,
        destinationKey: sanitizedDest,
        copiedAt: new Date(),
      };
    } catch (error) {
      this.deps.logger.error(
        { error },
        `Failed to copy file: ${sourceKey} -> ${destinationKey}`,
      );
      return {
        success: false,
        sourceKey,
        destinationKey,
        copiedAt: new Date(),
      };
    }
  }

  /**
   * Move/rename file within local storage
   */
  async move(sourceKey: string, destinationKey: string): Promise<MoveResult> {
    try {
      const copyResult = await this.copy(sourceKey, destinationKey);

      if (copyResult.success) {
        const deleteResult = await this.delete(sourceKey);
        return {
          success: deleteResult.success,
          sourceKey,
          destinationKey,
          movedAt: new Date(),
        };
      }

      return {
        success: false,
        sourceKey,
        destinationKey,
        movedAt: new Date(),
      };
    } catch (error) {
      this.deps.logger.error(
        { error },
        `Failed to move file: ${sourceKey} -> ${destinationKey}`,
      );
      return {
        success: false,
        sourceKey,
        destinationKey,
        movedAt: new Date(),
      };
    }
  }

  /**
   * List files in directory
   */
  async listFiles(prefix?: string, limit?: number): Promise<FileListResult> {
    try {
      const searchPath = prefix
        ? path.join(this.basePath, this.sanitizeKey(prefix))
        : this.basePath;

      const files: FileMetadata[] = [];
      const entries = await fs.readdir(searchPath, { withFileTypes: true });

      let count = 0;
      for (const entry of entries) {
        if (limit && count >= limit) break;

        if (entry.isFile() && !entry.name.endsWith('.meta')) {
          try {
            const filePath = path.join(searchPath, entry.name);
            const relativePath = path.relative(this.basePath, filePath);
            const metadata = await this.getMetadata(relativePath);
            files.push(metadata);
            count++;
          } catch (error) {
            // Skip files that can't be read
            this.deps.logger.warn({ error }, `Skipping file: ${entry.name}`);
          }
        }
      }

      return {
        files,
        hasMore: limit ? entries.length > limit : false,
        totalCount: files.length,
      };
    } catch (error) {
      this.deps.logger.error({ error }, `Failed to list files: ${prefix}`);
      return {
        files: [],
        hasMore: false,
        totalCount: 0,
      };
    }
  }

  /**
   * Get adapter name
   */
  getAdapterName(): string {
    return 'local';
  }

  /**
   * Get storage configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  // Private helper methods

  private async ensureBaseDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      this.deps.logger.error({ error }, 'Failed to create base directory');
      throw error;
    }
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      this.deps.logger.error(
        { error },
        `Failed to create directory: ${dirPath}`,
      );
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private sanitizeKey(key: string): string {
    // Remove any path traversal attempts and normalize
    const sanitized = key
      .replace(/\.\./g, '') // Remove ..
      .replace(/\/+/g, '/') // Normalize slashes
      .replace(/^\//, ''); // Remove leading slash

    return sanitized;
  }

  private isAllowedMimeType(mimeType: string): boolean {
    if (this.allowedMimeTypes.includes('*/*')) {
      return true;
    }

    return this.allowedMimeTypes.some((allowed) => {
      if (allowed.endsWith('/*')) {
        const prefix = allowed.slice(0, -2);
        return mimeType.startsWith(prefix);
      }
      return allowed === mimeType;
    });
  }

  private async readMetadata(metadataPath: string): Promise<any> {
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Return minimal metadata if file doesn't exist
      return {
        originalName: 'unknown',
        mimeType: 'application/octet-stream',
        size: 0,
        uploadedAt: new Date().toISOString(),
        isPublic: false,
      };
    }
  }
}
