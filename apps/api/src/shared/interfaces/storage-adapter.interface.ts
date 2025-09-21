/**
 * Storage Adapter Interface
 *
 * Defines the contract for different storage providers (Local, S3, MinIO, etc.)
 * This allows the system to be storage-agnostic and easily switch between providers.
 */

export enum StorageType {
  LOCAL = 'local',
  AWS_S3 = 's3',
  MINIO = 'minio',
  GOOGLE_CLOUD = 'gcs',
  AZURE_BLOB = 'azure',
}

export interface FileMetadata {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  isPublic: boolean;
  isTemporary: boolean;
  uploadedBy: string;
  expiresAt?: Date;
}

export interface ViewUrlOptions {
  variant?: string;
  cache?: boolean;
  expiresIn?: number;
}

export interface DownloadUrlOptions {
  inline?: boolean;
  expiresIn?: number;
}

export interface ThumbnailUrlOptions {
  size?: string;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  expiresIn?: number;
}

export interface SignedUrlOptions {
  expiresIn?: number;
  thumbnailOptions?: ThumbnailUrlOptions;
}

export interface SignedUrlResult {
  token?: string; // JWT token for local storage, undefined for presigned URLs
  urls: {
    view: string;
    download: string;
    thumbnail: string;
  };
  expiresAt: Date;
  metadata: {
    storageType: StorageType;
    region?: string;
    bucket?: string;
    endpoint?: string;
  };
}

export interface UploadResult {
  storageKey: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface StorageConfiguration {
  type: StorageType;
  options: Record<string, any>;
}

/**
 * Main Storage Adapter Interface
 *
 * All storage providers must implement this interface to ensure
 * consistent behavior across different storage backends.
 */
export interface IStorageAdapter {
  /**
   * Generate a signed URL for viewing a file inline
   */
  generateViewUrl(fileKey: string, options?: ViewUrlOptions): Promise<string>;

  /**
   * Generate a signed URL for downloading a file
   */
  generateDownloadUrl(
    fileKey: string,
    options?: DownloadUrlOptions,
  ): Promise<string>;

  /**
   * Generate a signed URL for accessing a thumbnail
   */
  generateThumbnailUrl(
    fileKey: string,
    options?: ThumbnailUrlOptions,
  ): Promise<string>;

  /**
   * Generate multiple signed URLs at once (view, download, thumbnail)
   * This is more efficient than calling individual methods
   */
  generateMultipleUrls(
    fileMetadata: FileMetadata,
    options?: SignedUrlOptions,
  ): Promise<SignedUrlResult>;

  /**
   * Upload a file to the storage provider
   */
  uploadFile(
    buffer: Buffer,
    key: string,
    metadata?: Record<string, any>,
  ): Promise<UploadResult>;

  /**
   * Delete a file from the storage provider
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Get the storage type identifier
   */
  getStorageType(): StorageType;

  /**
   * Validate the adapter configuration
   */
  validateConfiguration(): Promise<boolean>;

  /**
   * Check if the storage provider is healthy/accessible
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get storage provider specific metadata
   */
  getProviderInfo(): {
    type: StorageType;
    version?: string;
    region?: string;
    endpoint?: string;
  };
}

/**
 * Factory interface for creating storage adapters
 */
export interface IStorageAdapterFactory {
  create(config: StorageConfiguration): Promise<IStorageAdapter>;
  getSupportedTypes(): StorageType[];
}

/**
 * Storage adapter error types
 */
export class StorageAdapterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly storageType: StorageType,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'StorageAdapterError';
  }
}

export class ConfigurationError extends StorageAdapterError {
  constructor(message: string, storageType: StorageType, cause?: Error) {
    super(message, 'CONFIGURATION_ERROR', storageType, cause);
    this.name = 'ConfigurationError';
  }
}

export class UploadError extends StorageAdapterError {
  constructor(message: string, storageType: StorageType, cause?: Error) {
    super(message, 'UPLOAD_ERROR', storageType, cause);
    this.name = 'UploadError';
  }
}

export class AccessError extends StorageAdapterError {
  constructor(message: string, storageType: StorageType, cause?: Error) {
    super(message, 'ACCESS_ERROR', storageType, cause);
    this.name = 'AccessError';
  }
}
