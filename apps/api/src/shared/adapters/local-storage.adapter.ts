import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import {
  IStorageAdapter,
  StorageType,
  FileMetadata,
  ViewUrlOptions,
  DownloadUrlOptions,
  ThumbnailUrlOptions,
  SignedUrlOptions,
  SignedUrlResult,
  UploadResult,
  ConfigurationError,
  AccessError,
} from '../interfaces/storage-adapter.interface';

export interface LocalStorageConfig {
  jwtSecret: string;
  baseUrl: string;
  defaultExpirySeconds: number;
  maxExpirySeconds: number;
  uploadPath?: string; // Root upload directory

  // Additional storage configuration options
  maxFileSize?: number; // Maximum file size in bytes
  allowedMimeTypes?: string[]; // Allowed MIME types for uploads
  enableCompression?: boolean; // Enable file compression
  enableThumbnails?: boolean; // Enable thumbnail generation
  thumbnailSizes?: number[]; // Thumbnail sizes to generate
  enableEncryption?: boolean; // Enable file encryption at rest
  cleanupTempFiles?: boolean; // Auto-cleanup temporary files
  tempFileExpiryHours?: number; // Hours before temp files are deleted
  enableVersioning?: boolean; // Enable file versioning
  maxVersions?: number; // Maximum versions to keep per file
  enableAuditLog?: boolean; // Enable file access audit logging
  compressionLevel?: number; // Compression level (1-9)
  encryptionAlgorithm?: string; // Encryption algorithm to use
}

/**
 * Local Storage Adapter
 *
 * Implements signed URLs using JWT tokens for local file storage.
 * Files are served through Express routes with token-based authentication.
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private config: LocalStorageConfig;

  constructor(
    config: LocalStorageConfig,
    private fastify?: FastifyInstance,
  ) {
    this.config = {
      // Default basic settings
      defaultExpirySeconds: 3600, // 1 hour
      maxExpirySeconds: 86400, // 24 hours
      uploadPath: 'uploads', // Default upload directory

      // Default advanced settings
      maxFileSize: 100 * 1024 * 1024, // 100MB default
      allowedMimeTypes: [
        'image/*',
        'text/*',
        'application/pdf',
        'application/zip',
        'application/json',
        'application/xml',
      ], // Common safe MIME types
      enableCompression: false, // Disabled by default
      enableThumbnails: true, // Enabled by default for images
      thumbnailSizes: [150, 300, 600], // Small, medium, large thumbnails
      enableEncryption: false, // Disabled by default (performance)
      cleanupTempFiles: true, // Enabled by default
      tempFileExpiryHours: 24, // 24 hours default
      enableVersioning: false, // Disabled by default (storage space)
      maxVersions: 5, // Maximum 5 versions per file
      enableAuditLog: true, // Enabled by default for security
      compressionLevel: 6, // Balanced compression (1-9)
      encryptionAlgorithm: 'aes-256-gcm', // Strong encryption if enabled

      // Override with provided config
      ...config,
    };

    // Validate configuration
    this.validateBasicConfiguration();
  }

  /**
   * Validate storage configuration (private validation used in constructor)
   */
  private validateBasicConfiguration(): void {
    // Validate required fields
    if (!this.config.jwtSecret) {
      throw new ConfigurationError(
        'JWT secret is required for LocalStorageAdapter',
        StorageType.LOCAL,
      );
    }

    if (!this.config.baseUrl) {
      throw new ConfigurationError(
        'Base URL is required for LocalStorageAdapter',
        StorageType.LOCAL,
      );
    }

    // Validate numeric ranges
    if (this.config.maxFileSize && this.config.maxFileSize <= 0) {
      throw new ConfigurationError(
        'Max file size must be positive',
        StorageType.LOCAL,
      );
    }

    if (
      this.config.compressionLevel &&
      (this.config.compressionLevel < 1 || this.config.compressionLevel > 9)
    ) {
      throw new ConfigurationError(
        'Compression level must be between 1-9',
        StorageType.LOCAL,
      );
    }

    if (this.config.maxVersions && this.config.maxVersions <= 0) {
      throw new ConfigurationError(
        'Max versions must be positive',
        StorageType.LOCAL,
      );
    }

    if (
      this.config.tempFileExpiryHours &&
      this.config.tempFileExpiryHours <= 0
    ) {
      throw new ConfigurationError(
        'Temp file expiry hours must be positive',
        StorageType.LOCAL,
      );
    }

    // Validate thumbnail sizes
    if (this.config.thumbnailSizes) {
      for (const size of this.config.thumbnailSizes) {
        if (size <= 0 || size > 2000) {
          throw new ConfigurationError(
            'Thumbnail sizes must be between 1-2000 pixels',
            StorageType.LOCAL,
          );
        }
      }
    }

    // Validate MIME types format
    if (this.config.allowedMimeTypes) {
      for (const mimeType of this.config.allowedMimeTypes) {
        if (!mimeType.includes('/')) {
          throw new ConfigurationError(
            `Invalid MIME type format: ${mimeType}`,
            StorageType.LOCAL,
          );
        }
      }
    }
  }

  async generateViewUrl(
    fileKey: string,
    options: ViewUrlOptions = {},
  ): Promise<string> {
    const token = await this.generateJWTToken(
      fileKey,
      'view',
      options.expiresIn,
    );
    const queryParams = new URLSearchParams({ token });

    if (options.variant) {
      queryParams.set('variant', options.variant);
    }
    if (options.cache !== undefined) {
      queryParams.set('cache', options.cache.toString());
    }

    return `${this.config.baseUrl}/api/files/${this.extractFileId(fileKey)}/view?${queryParams.toString()}`;
  }

  async generateDownloadUrl(
    fileKey: string,
    options: DownloadUrlOptions = {},
  ): Promise<string> {
    const token = await this.generateJWTToken(
      fileKey,
      'download',
      options.expiresIn,
    );
    const queryParams = new URLSearchParams({ token });

    if (options.inline !== undefined) {
      queryParams.set('inline', options.inline.toString());
    }

    return `${this.config.baseUrl}/api/files/${this.extractFileId(fileKey)}/download?${queryParams.toString()}`;
  }

  async generateThumbnailUrl(
    fileKey: string,
    options: ThumbnailUrlOptions = {},
  ): Promise<string> {
    const token = await this.generateJWTToken(
      fileKey,
      'thumbnail',
      options.expiresIn,
    );
    const queryParams = new URLSearchParams({ token });

    if (options.size) {
      queryParams.set('size', options.size);
    }
    if (options.quality !== undefined) {
      queryParams.set('quality', options.quality.toString());
    }
    if (options.format) {
      queryParams.set('format', options.format);
    }

    return `${this.config.baseUrl}/api/files/${this.extractFileId(fileKey)}/thumbnail?${queryParams.toString()}`;
  }

  async generateMultipleUrls(
    fileMetadata: FileMetadata,
    options: SignedUrlOptions = {},
  ): Promise<SignedUrlResult> {
    const expiresIn = this.validateExpiryTime(options.expiresIn);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Generate a single token that works for all actions
    const token = await this.generateJWTToken(
      fileMetadata.storageKey,
      ['view', 'download', 'thumbnail'],
      expiresIn,
      {
        fileId: fileMetadata.id,
        userId: fileMetadata.uploadedBy,
        isPublic: fileMetadata.isPublic,
        mimeType: fileMetadata.mimeType,
      },
    );

    // Generate individual URLs
    const [viewUrl, downloadUrl, thumbnailUrl] = await Promise.all([
      this.generateViewUrl(fileMetadata.storageKey, { expiresIn }),
      this.generateDownloadUrl(fileMetadata.storageKey, { expiresIn }),
      this.generateThumbnailUrl(fileMetadata.storageKey, {
        ...options.thumbnailOptions,
        expiresIn,
      }),
    ]);

    return {
      token,
      urls: {
        view: viewUrl,
        download: downloadUrl,
        thumbnail: thumbnailUrl,
      },
      expiresAt,
      metadata: {
        storageType: StorageType.LOCAL,
        endpoint: this.config.baseUrl,
      },
    };
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    metadata: Record<string, any> = {},
  ): Promise<UploadResult> {
    try {
      // Construct full file path
      const fullPath = path.join(this.config.uploadPath!, key);
      const directory = path.dirname(fullPath);

      // Ensure directory exists
      await fs.promises.mkdir(directory, { recursive: true });

      // Write file to disk
      await fs.promises.writeFile(fullPath, buffer);

      if (this.fastify) {
        this.fastify.log.info(`File uploaded to local storage: ${fullPath}`);
      }

      return {
        storageKey: key,
        metadata: {
          storageType: StorageType.LOCAL,
          uploadPath: fullPath,
          fileSize: buffer.length,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      };
    } catch (error) {
      throw new AccessError(
        `Failed to upload file to local storage: ${error.message}`,
        StorageType.LOCAL,
        error,
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const fullPath = path.join(this.config.uploadPath!, key);

      // Check if file exists before trying to delete
      await fs.promises.access(fullPath);

      // Delete the file
      await fs.promises.unlink(fullPath);

      if (this.fastify) {
        this.fastify.log.info(`File deleted from local storage: ${fullPath}`);
      }
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // File doesn't exist, that's fine
        if (this.fastify) {
          this.fastify.log.warn(`File not found for deletion: ${key}`);
        }
        return;
      }

      throw new AccessError(
        `Failed to delete file from local storage: ${error.message}`,
        StorageType.LOCAL,
        error,
      );
    }
  }

  getStorageType(): StorageType {
    return StorageType.LOCAL;
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.config.jwtSecret || this.config.jwtSecret.length < 32) {
        throw new ConfigurationError(
          'JWT secret must be at least 32 characters long',
          StorageType.LOCAL,
        );
      }

      if (!this.config.baseUrl) {
        throw new ConfigurationError(
          'Base URL is required for local storage adapter',
          StorageType.LOCAL,
        );
      }

      // Test JWT signing
      const testToken = jwt.sign({ test: true }, this.config.jwtSecret, {
        expiresIn: '1m',
      });
      jwt.verify(testToken, this.config.jwtSecret);

      return true;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new ConfigurationError(
        `Configuration validation failed: ${error.message}`,
        StorageType.LOCAL,
        error,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can generate and verify a test token
      const testToken = await this.generateJWTToken('test-key', 'view', 60);
      const decoded = jwt.verify(testToken, this.config.jwtSecret);
      return !!decoded;
    } catch (error) {
      return false;
    }
  }

  getProviderInfo() {
    return {
      type: StorageType.LOCAL,
      version: '1.0.0',
      endpoint: this.config.baseUrl,
    };
  }

  /**
   * Get current storage configuration (safe - no secrets)
   */
  getConfiguration(): Partial<LocalStorageConfig> {
    return {
      baseUrl: this.config.baseUrl,
      defaultExpirySeconds: this.config.defaultExpirySeconds,
      maxExpirySeconds: this.config.maxExpirySeconds,
      uploadPath: this.config.uploadPath,
      maxFileSize: this.config.maxFileSize,
      allowedMimeTypes: this.config.allowedMimeTypes,
      enableCompression: this.config.enableCompression,
      enableThumbnails: this.config.enableThumbnails,
      thumbnailSizes: this.config.thumbnailSizes,
      enableEncryption: this.config.enableEncryption,
      cleanupTempFiles: this.config.cleanupTempFiles,
      tempFileExpiryHours: this.config.tempFileExpiryHours,
      enableVersioning: this.config.enableVersioning,
      maxVersions: this.config.maxVersions,
      enableAuditLog: this.config.enableAuditLog,
      compressionLevel: this.config.compressionLevel,
      encryptionAlgorithm: this.config.encryptionAlgorithm,
      // Exclude sensitive data like jwtSecret
    };
  }

  /**
   * Update configuration (runtime configuration changes)
   */
  updateConfiguration(updates: Partial<LocalStorageConfig>): void {
    // Create new config with updates
    const newConfig = {
      ...this.config,
      ...updates,
    };

    // Validate new configuration
    const oldConfig = this.config;
    this.config = newConfig;

    try {
      this.validateBasicConfiguration();
    } catch (error) {
      // Rollback on validation failure
      this.config = oldConfig;
      throw error;
    }

    if (this.fastify) {
      this.fastify.log.info('Storage configuration updated successfully');
    }
  }

  /**
   * Get storage statistics and health info
   */
  async getStorageStats(): Promise<{
    type: StorageType;
    configuration: Partial<LocalStorageConfig>;
    health: boolean;
    uploadPath: string;
    diskSpace?: {
      total: number;
      used: number;
      available: number;
    };
  }> {
    const health = await this.healthCheck();
    const uploadPath = this.config.uploadPath || 'uploads';

    let diskSpace;
    try {
      // Try to get disk space info (Node.js 19+ has fs.statfs)
      const stats = await fs.promises.statfs?.(uploadPath);
      if (stats) {
        diskSpace = {
          total: stats.bavail * stats.bsize,
          used: (stats.blocks - stats.bavail) * stats.bsize,
          available: stats.bavail * stats.bsize,
        };
      }
    } catch {
      // Ignore errors - disk space info is optional
    }

    return {
      type: this.getStorageType(),
      configuration: this.getConfiguration(),
      health,
      uploadPath: path.resolve(uploadPath),
      diskSpace,
    };
  }

  /**
   * Generate JWT token for file access
   */
  private async generateJWTToken(
    fileKey: string,
    actions: string | string[],
    expiresIn?: number,
    additionalPayload: Record<string, any> = {},
  ): Promise<string> {
    const expiry = this.validateExpiryTime(expiresIn);
    const actionsArray = Array.isArray(actions) ? actions : [actions];

    const payload = {
      fileKey,
      actions: actionsArray,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiry,
      ...additionalPayload,
    };

    try {
      return jwt.sign(payload, this.config.jwtSecret, {
        algorithm: 'HS256',
      });
    } catch (error) {
      throw new AccessError(
        `Failed to generate JWT token: ${error.message}`,
        StorageType.LOCAL,
        error,
      );
    }
  }

  /**
   * Validate and normalize expiry time
   */
  private validateExpiryTime(expiresIn?: number): number {
    if (!expiresIn) {
      return this.config.defaultExpirySeconds;
    }

    if (expiresIn < 300) {
      // Minimum 5 minutes
      return 300;
    }

    if (expiresIn > this.config.maxExpirySeconds) {
      return this.config.maxExpirySeconds;
    }

    return expiresIn;
  }

  /**
   * Extract file ID from storage key
   * Assumes storage key format contains the file ID
   */
  private extractFileId(storageKey: string): string {
    // For local storage, the storage key might be in format:
    // "fileId/type/yyyy/mm/dd/filename"
    // Extract the file ID from the beginning
    const parts = storageKey.split('/');
    return parts[0];
  }

  /**
   * Verify JWT token (utility method for route handlers)
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.config.jwtSecret);
    } catch (error) {
      throw new AccessError(
        `Invalid or expired token: ${error.message}`,
        StorageType.LOCAL,
        error,
      );
    }
  }

  /**
   * Check if token has required action permission
   */
  async hasPermission(
    token: string,
    action: string,
    fileKey: string,
  ): Promise<boolean> {
    try {
      const decoded = await this.verifyToken(token);

      return (
        decoded.fileKey === fileKey &&
        Array.isArray(decoded.actions) &&
        decoded.actions.includes(action)
      );
    } catch (error) {
      return false;
    }
  }
}
