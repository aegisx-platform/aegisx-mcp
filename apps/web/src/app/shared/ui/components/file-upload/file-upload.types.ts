// File Upload Types and Interfaces
// Aligned with backend API schemas in apps/api/src/modules/file-upload/file-upload.schemas.ts

export interface FileUploadOptions {
  category?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  expiresIn?: number;
  allowDuplicates?: boolean;
  metadata?: Record<string, unknown>;
  // Note: Thumbnails are generated dynamically via API endpoints
  // No need for pre-generation options
}

export interface FileUpdateRequest {
  originalName?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ImageProcessingOptions {
  operations: {
    resize?: {
      width?: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    };
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
  };
  createVariant?: boolean;
  variantName?: string;
}

export interface SignedUrlRequest {
  expiresIn?: number;
  thumbnailOptions?: {
    size?: string;
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  };
}

export interface FileListQuery {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  sort?: 'created_at' | 'updated_at' | 'file_size' | 'original_name';
  order?: 'asc' | 'desc';
  search?: string;
}

export interface DownloadQuery {
  variant?: string;
  inline?: boolean;
}

export interface ThumbnailQuery {
  size?: string; // Format: '150x150'
  quality?: number; // 1-100
  format?: 'jpg' | 'png' | 'webp';
}

export interface ViewQuery {
  variant?: string;
  cache?: boolean;
  force?: 'view' | 'download' | 'auto';
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  fileCategory: string;
  fileType: string;
  isPublic: boolean;
  isTemporary: boolean;
  expiresAt: string | null;
  // Note: downloadUrl removed - use signedUrls.download instead for authenticated access
  metadata: Record<string, unknown> | null;
  variants: Record<string, unknown> | null;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  updatedAt: string;
  // Signed URLs (included when requested from API)
  signedUrls?: {
    view: string;
    download: string;
    thumbnail: string;
    expiresAt: string;
  };
}

// ✅ FIXED: Aligned with base schema standards
export interface DuplicateSuggestion {
  file: UploadedFile;
  similarity: number;
  reason: string;
}

export interface FileUploadResponse {
  success: true;
  data: UploadedFile;
  meta?: {
    requestId: string;
    timestamp: string;
    version: string;
    warnings?: string[];
    duplicates?: DuplicateSuggestion[];
  };
  message?: string;
}

export interface MultipleFileUploadResponse {
  success: true;
  data: {
    uploaded: UploadedFile[];
    failed: {
      filename: string;
      error: string;
      code: string;
    }[];
    summary: {
      total: number;
      uploaded: number;
      failed: number;
      totalSize: number;
    };
  };
  message?: string;
}

export interface ChunkedUploadResponse {
  success: true;
  data: {
    uploadId: string;
    chunkIndex: number;
    totalChunks: number;
    uploadedChunks: number[];
    isComplete: boolean;
    fileId?: string;
  };
  message?: string;
}

// ✅ FIXED: Aligned pagination field names with backend
export interface FileListResponse {
  success: true;
  data: UploadedFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number; // Changed from 'pages' to 'totalPages'
  };
  message?: string;
}

export interface SignedUrlResponse {
  success: true;
  data: {
    token: string;
    urls: {
      view: string;
      download: string;
      thumbnail: string;
    };
    expiresAt: string;
    metadata: {
      storageType: string;
      endpoint: string;
    };
  };
  message?: string;
}

export interface ImageProcessingResponse {
  success: true;
  data: {
    originalFileId: string;
    variantId?: string;
    processedUrl: string;
    operations: Record<string, unknown>;
    processedAt: string;
  };
  message?: string;
}

export interface DeleteFileResponse {
  success: true;
  data: {
    id: string;
    deleted: boolean;
    deletedAt: string;
  };
  message?: string;
}

export interface FileUploadError {
  error: {
    code:
      | 'FILE_TOO_LARGE'
      | 'INVALID_FILE_TYPE'
      | 'VIRUS_DETECTED'
      | 'STORAGE_FULL'
      | 'UPLOAD_INCOMPLETE'
      | 'FILE_CORRUPTED'
      | 'PROCESSING_FAILED'
      | 'FILE_NOT_FOUND'
      | 'ACCESS_DENIED'
      | 'QUOTA_EXCEEDED';
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  filesByCategory: Record<string, number>;
  filesByType: Record<string, number>;
  quotaUsed: number;
  quotaLimit: number;
  quotaPercentage: number;
}

// File viewing constants for Smart View functionality (aligned with backend)
export const VIEWABLE_MIME_TYPES = {
  // Images - can be displayed inline in browsers
  IMAGES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ],
  // Text files - can be displayed as text
  TEXT: [
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'text/csv',
    'text/xml',
    'application/json',
    'application/xml',
  ],
  // Documents - can be displayed in browser
  DOCUMENTS: ['application/pdf'],
  // Audio files - can be played in browser
  AUDIO: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
  ],
  // Video files - can be played in browser
  VIDEO: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/quicktime',
  ],
} as const;

// Flattened list of all viewable MIME types
export const ALL_VIEWABLE_MIME_TYPES = [
  ...VIEWABLE_MIME_TYPES.IMAGES,
  ...VIEWABLE_MIME_TYPES.TEXT,
  ...VIEWABLE_MIME_TYPES.DOCUMENTS,
  ...VIEWABLE_MIME_TYPES.AUDIO,
  ...VIEWABLE_MIME_TYPES.VIDEO,
] as const;

/**
 * Check if a MIME type can be viewed inline in browser
 */
export function isViewableMimeType(mimeType: string): boolean {
  return (
    ALL_VIEWABLE_MIME_TYPES.includes(mimeType as any) ||
    mimeType.startsWith('text/') ||
    mimeType.startsWith('image/')
  );
}

// Constants from backend validation
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES_PER_UPLOAD: 10,
  MAX_CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_CATEGORIES: [
    'image',
    'document',
    'avatar',
    'attachment',
    'media',
    'backup',
    'temporary',
    'general',
  ],
} as const;

// File upload progress interface
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedFile?: UploadedFile;
  error?: string;
  preview?: string;
}

// File validation result
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  file: File;
}

// File picker configuration
export interface FilePickerConfig {
  multiple: boolean;
  accept: string[];
  maxFileSize: number;
  maxFiles: number;
  allowedCategories?: string[];
}
