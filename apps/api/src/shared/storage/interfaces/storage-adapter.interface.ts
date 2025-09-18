import { Readable } from 'stream';

/**
 * Storage adapter interface for handling file operations
 * Supports different storage backends (Local, MinIO, S3, etc.)
 */
export interface IStorageAdapter {
  /**
   * Upload a file to storage
   */
  upload(params: UploadParams): Promise<UploadResult>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<DownloadResult>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<DeleteResult>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata without downloading
   */
  getMetadata(key: string): Promise<FileMetadata>;

  /**
   * Generate a signed URL for secure access (if supported)
   */
  generateSignedUrl(params: SignedUrlParams): Promise<SignedUrlResult>;

  /**
   * Copy a file within storage
   */
  copy(sourceKey: string, destinationKey: string): Promise<CopyResult>;

  /**
   * Move/rename a file within storage
   */
  move(sourceKey: string, destinationKey: string): Promise<MoveResult>;

  /**
   * List files in a directory (if supported)
   */
  listFiles(prefix?: string, limit?: number): Promise<FileListResult>;

  /**
   * Get storage adapter name
   */
  getAdapterName(): string;

  /**
   * Get storage configuration info
   */
  getConfig(): StorageConfig;
}

/**
 * Parameters for file upload
 */
export interface UploadParams {
  key: string; // Storage key/path
  buffer: Buffer; // File content
  mimeType: string; // File MIME type
  originalName: string; // Original filename
  metadata?: Record<string, any>; // Additional metadata
  bucket?: string; // Bucket/container (for cloud storage)
  isPublic?: boolean; // Public access flag
  expires?: Date; // Expiration date
}

/**
 * Result of file upload operation
 */
export interface UploadResult {
  key: string; // Storage key used
  url?: string; // Public URL (if available)
  size: number; // File size in bytes
  etag?: string; // Entity tag/hash
  metadata?: Record<string, any>; // Returned metadata
}

/**
 * Parameters for downloading files
 */
export interface DownloadParams {
  key: string; // Storage key
  bucket?: string; // Bucket/container
  range?: string; // Byte range (for partial downloads)
}

/**
 * Result of file download operation
 */
export interface DownloadResult {
  stream: Readable; // File content stream
  metadata: FileMetadata; // File metadata
  contentType: string; // MIME type
  contentLength: number; // File size
  etag?: string; // Entity tag
  lastModified?: Date; // Last modification date
}

/**
 * Result of file delete operation
 */
export interface DeleteResult {
  success: boolean; // Operation success
  key: string; // Deleted key
  deletedAt: Date; // Deletion timestamp
}

/**
 * File metadata information
 */
export interface FileMetadata {
  key: string; // Storage key
  size: number; // File size in bytes
  contentType: string; // MIME type
  etag?: string; // Entity tag
  lastModified?: Date; // Last modification date
  metadata?: Record<string, any>; // Custom metadata
}

/**
 * Parameters for generating signed URLs
 */
export interface SignedUrlParams {
  key: string; // Storage key
  bucket?: string; // Bucket/container
  operation: 'GET' | 'PUT' | 'DELETE'; // Allowed operation
  expiresIn: number; // Expiration in seconds
  contentType?: string; // Content type (for PUT operations)
}

/**
 * Result of signed URL generation
 */
export interface SignedUrlResult {
  url: string; // Signed URL
  expiresAt: Date; // Expiration date
  operation: string; // Allowed operation
}

/**
 * Result of file copy operation
 */
export interface CopyResult {
  success: boolean; // Operation success
  sourceKey: string; // Source key
  destinationKey: string; // Destination key
  copiedAt: Date; // Copy timestamp
}

/**
 * Result of file move operation
 */
export interface MoveResult {
  success: boolean; // Operation success
  sourceKey: string; // Original key
  destinationKey: string; // New key
  movedAt: Date; // Move timestamp
}

/**
 * Result of file listing operation
 */
export interface FileListResult {
  files: FileMetadata[]; // List of files
  hasMore: boolean; // More files available
  nextToken?: string; // Token for pagination
  totalCount?: number; // Total file count (if available)
}

/**
 * Storage adapter configuration
 */
export interface StorageConfig {
  adapterType: 'local' | 'minio' | 's3' | 'gcs' | 'azure';
  basePath?: string; // Base path for local storage
  bucket?: string; // Default bucket/container
  region?: string; // Cloud region
  endpoint?: string; // Custom endpoint
  maxFileSize?: number; // Maximum file size limit
  allowedMimeTypes?: string[]; // Allowed MIME types
  publicUrlBase?: string; // Base URL for public access
}

/**
 * Storage adapter factory interface
 */
export interface IStorageAdapterFactory {
  createAdapter(config: StorageConfig): IStorageAdapter;
  getAdapter(name: string): IStorageAdapter | null;
  registerAdapter(name: string, adapter: IStorageAdapter): void;
}
