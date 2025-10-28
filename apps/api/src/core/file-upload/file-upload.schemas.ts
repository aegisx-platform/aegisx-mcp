import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginationMetaSchema,
  StandardRouteResponses,
  ApiMetaSchema,
} from '../../schemas/base.schemas';

// =============================================
// File Upload Request Schemas
// =============================================

export const FileUploadSchema = Type.Object({
  category: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 50,
      description: 'File category (image, document, avatar, etc.)',
    }),
  ),
  isPublic: Type.Optional(
    Type.Boolean({
      description: 'Whether file should be publicly accessible',
    }),
  ),
  isTemporary: Type.Optional(
    Type.Boolean({
      description: 'Whether file is temporary and should be cleaned up',
    }),
  ),
  expiresIn: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: 8760, // Max 1 year
      description: 'Expiration time in hours (for temporary files)',
    }),
  ),
  allowDuplicates: Type.Optional(
    Type.Boolean({
      description: 'Allow uploading duplicate files (same content)',
      default: false,
    }),
  ),
  metadata: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Additional metadata for the file',
    }),
  ),
  // Note: Thumbnails are generated dynamically via /thumbnail endpoint
  // No need for pre-generation options
});

export const FileUpdateSchema = Type.Object({
  originalName: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 500,
      description: 'Update original filename',
    }),
  ),
  isPublic: Type.Optional(
    Type.Boolean({
      description: 'Update public access status',
    }),
  ),
  isTemporary: Type.Optional(
    Type.Boolean({
      description: 'Update temporary status',
    }),
  ),
  expiresAt: Type.Optional(
    Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
      description: 'Update expiration date',
    }),
  ),
  metadata: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Update file metadata',
    }),
  ),
});

export const ImageProcessingSchema = Type.Object({
  operations: Type.Object(
    {
      resize: Type.Optional(
        Type.Object(
          {
            width: Type.Optional(
              Type.Number({
                minimum: 1,
                maximum: 4000,
                description: 'Target width in pixels',
              }),
            ),
            height: Type.Optional(
              Type.Number({
                minimum: 1,
                maximum: 4000,
                description: 'Target height in pixels',
              }),
            ),
            fit: Type.Optional(
              Type.Union(
                [
                  Type.Literal('cover'),
                  Type.Literal('contain'),
                  Type.Literal('fill'),
                  Type.Literal('inside'),
                  Type.Literal('outside'),
                ],
                {
                  description: 'How to fit the image to target dimensions',
                },
              ),
            ),
          },
          {
            description: 'Resize operation parameters',
          },
        ),
      ),
      format: Type.Optional(
        Type.Union(
          [Type.Literal('jpeg'), Type.Literal('png'), Type.Literal('webp')],
          {
            description: 'Convert to specific format',
          },
        ),
      ),
      quality: Type.Optional(
        Type.Number({
          minimum: 1,
          maximum: 100,
          description: 'Quality setting for JPEG/WebP (1-100)',
        }),
      ),
      blur: Type.Optional(
        Type.Number({
          minimum: 0,
          maximum: 100,
          description: 'Blur radius',
        }),
      ),
      sharpen: Type.Optional(
        Type.Boolean({
          description: 'Apply sharpening filter',
        }),
      ),
      grayscale: Type.Optional(
        Type.Boolean({
          description: 'Convert to grayscale',
        }),
      ),
    },
    {
      description: 'Image processing operations to apply',
    },
  ),
  createVariant: Type.Optional(
    Type.Boolean({
      description: 'Whether to create a new variant or replace original',
    }),
  ),
  variantName: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 50,
      description: 'Name for the variant',
    }),
  ),
});

// ⚠️ REMOVED: Conflicting SignedUrlRequestSchema - see updated version below at line 715

// =============================================
// Query Parameter Schemas
// =============================================

export const FileListQuerySchema = Type.Object({
  page: Type.Optional(
    Type.Number({
      minimum: 1,
      description: 'Page number',
    }),
  ),
  limit: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: 100,
      description: 'Items per page',
    }),
  ),
  category: Type.Optional(
    Type.String({
      description: 'Filter by file category',
    }),
  ),
  type: Type.Optional(
    Type.String({
      description: 'Filter by file type',
    }),
  ),
  isPublic: Type.Optional(
    Type.Boolean({
      description: 'Filter by public status',
    }),
  ),
  isTemporary: Type.Optional(
    Type.Boolean({
      description: 'Filter by temporary status',
    }),
  ),
  sort: Type.Optional(
    Type.Union(
      [
        Type.Literal('created_at'),
        Type.Literal('updated_at'),
        Type.Literal('uploaded_at'),
        Type.Literal('uploadedAt'),
        Type.Literal('file_size'),
        Type.Literal('original_name'),
        Type.Literal('mime_type'),
      ],
      {
        description: 'Sort field',
      },
    ),
  ),
  order: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], {
      description: 'Sort order',
    }),
  ),
  search: Type.Optional(
    Type.String({
      description: 'Search in filename',
    }),
  ),
  includeSignedUrls: Type.Optional(
    Type.Boolean({
      default: true,
      description:
        'Include pre-generated signed URLs for each file (default: true)',
    }),
  ),
});

export const DownloadQuerySchema = Type.Object({
  variant: Type.Optional(
    Type.String({
      description:
        'Download specific variant (thumbnail, small, medium, large)',
    }),
  ),
  inline: Type.Optional(
    Type.Boolean({
      description: 'Whether to display inline or force download',
    }),
  ),
});

export const ThumbnailQuerySchema = Type.Object({
  size: Type.Optional(
    Type.String({
      pattern: '^\\d+x\\d+$',
      description: 'Thumbnail size in format "150x150"',
      default: '150x150',
    }),
  ),
  quality: Type.Optional(
    Type.Number({
      minimum: 1,
      maximum: 100,
      description: 'Image quality (1-100)',
      default: 80,
    }),
  ),
  format: Type.Optional(
    Type.Union(
      [Type.Literal('jpg'), Type.Literal('png'), Type.Literal('webp')],
      {
        description: 'Image format for thumbnail',
        default: 'jpg',
      },
    ),
  ),
});

export const ViewQuerySchema = Type.Object({
  variant: Type.Optional(
    Type.String({
      description: 'View specific variant (thumbnail, small, medium, large)',
    }),
  ),
  cache: Type.Optional(
    Type.Boolean({
      description: 'Whether to use cached version',
      default: true,
    }),
  ),
  force: Type.Optional(
    Type.Union(
      [Type.Literal('view'), Type.Literal('download'), Type.Literal('auto')],
      {
        description:
          'Force behavior: "view" = force inline, "download" = force download, "auto" = smart detection based on MIME type',
        default: 'auto',
      },
    ),
  ),
});

// =============================================
// Signed URLs Schema (defined here to resolve dependency)
// =============================================

/**
 * Signed URL collection
 */
export const SignedUrlsSchema = Type.Object({
  view: Type.String({
    format: 'uri',
    description: 'Signed URL for viewing the file inline',
  }),
  download: Type.String({
    format: 'uri',
    description: 'Signed URL for downloading the file',
  }),
  thumbnail: Type.String({
    format: 'uri',
    description: 'Signed URL for accessing the thumbnail',
  }),
});

// =============================================
// Response Schemas
// =============================================

export const UploadedFileSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'Unique file identifier',
  }),
  originalName: Type.String({
    description: 'Original filename as uploaded',
  }),
  filename: Type.String({
    description: 'Sanitized filename stored on disk',
  }),
  filepath: Type.String({
    description: 'Full storage path for internal use',
  }),
  mimeType: Type.String({
    description: 'MIME type of the file',
  }),
  fileSize: Type.Number({
    description: 'File size in bytes',
  }),
  fileCategory: Type.String({
    description: 'File category classification',
  }),
  fileType: Type.String({
    description: 'File type classification',
  }),
  isPublic: Type.Boolean({
    description: 'Whether file is publicly accessible',
  }),
  isTemporary: Type.Boolean({
    description: 'Whether file is temporary',
  }),
  expiresAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
    description: 'File expiration date (for temporary files)',
  }),
  // Note: downloadUrl removed - use signedUrls.download instead for authenticated access
  metadata: Type.Union([Type.Record(Type.String(), Type.Any()), Type.Null()], {
    description: 'Additional file metadata',
  }),
  variants: Type.Union([Type.Record(Type.String(), Type.Any()), Type.Null()], {
    description: 'Generated variants (thumbnails, processed images)',
  }),
  processingStatus: Type.Union(
    [
      Type.Literal('uploaded'),
      Type.Literal('processing'),
      Type.Literal('completed'),
      Type.Literal('failed'),
    ],
    {
      description: 'File processing status',
    },
  ),
  uploadedBy: Type.String({
    format: 'uuid',
    description: 'ID of the user who uploaded the file',
  }),
  uploadedAt: Type.String({
    format: 'date-time',
    description: 'When the file was uploaded',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'When the file was last updated',
  }),
  signedUrls: Type.Optional(SignedUrlsSchema),
});

// ✅ FIXED: Using base schema standards
export const DuplicateSuggestionSchema = Type.Object({
  file: UploadedFileSchema,
  similarity: Type.Number({
    minimum: 0,
    maximum: 1,
    description: 'Similarity score (1.0 = identical)',
  }),
  reason: Type.String({
    description: 'Why this file is considered similar (hash, size+name, etc.)',
  }),
});

export const FileUploadResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: UploadedFileSchema,
  meta: Type.Optional(
    Type.Object({
      requestId: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      version: Type.String(),
      warnings: Type.Optional(Type.Array(Type.String())),
      duplicates: Type.Optional(
        Type.Array(DuplicateSuggestionSchema, {
          description: 'Similar files found (for user reference)',
        }),
      ),
    }),
  ),
});

export const MultipleFileUploadResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Object({
    uploaded: Type.Array(UploadedFileSchema, {
      description: 'Successfully uploaded files',
    }),
    failed: Type.Array(
      Type.Object({
        filename: Type.String({
          description: 'Name of the file that failed',
        }),
        error: Type.String({
          description: 'Error message',
        }),
        code: Type.String({
          description: 'Error code',
        }),
      }),
      {
        description: 'Files that failed to upload',
      },
    ),
    summary: Type.Object(
      {
        total: Type.Number({
          description: 'Total number of files attempted',
        }),
        uploaded: Type.Number({
          description: 'Number of files successfully uploaded',
        }),
        failed: Type.Number({
          description: 'Number of files that failed',
        }),
        totalSize: Type.Number({
          description: 'Total size of all uploaded files',
        }),
      },
      {
        description: 'Upload summary statistics',
      },
    ),
  }),
  meta: Type.Optional(
    Type.Object({
      requestId: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      version: Type.String(),
    }),
  ),
});

export const ChunkedUploadResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    uploadId: Type.String({
      description: 'Unique upload session ID',
    }),
    chunkIndex: Type.Number({
      description: 'Current chunk index',
    }),
    totalChunks: Type.Number({
      description: 'Total number of chunks',
    }),
    uploadedChunks: Type.Array(Type.Number(), {
      description: 'List of completed chunk indexes',
    }),
    isComplete: Type.Boolean({
      description: 'Whether all chunks are uploaded',
    }),
    fileId: Type.Optional(
      Type.String({
        description: 'File ID (available when upload is complete)',
      }),
    ),
  }),
);

// ✅ FIXED: Using standard pagination with base schema (will reference EnhancedFileResponseSchema after its definition)

export const ImageProcessingResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    originalFileId: Type.String({
      description: 'ID of the original file',
    }),
    variantId: Type.Optional(
      Type.String({
        description: 'ID of the created variant (if createVariant = true)',
      }),
    ),
    processedUrl: Type.String({
      description: 'URL to access the processed image',
    }),
    operations: Type.Record(Type.String(), Type.Any(), {
      description: 'Applied processing operations',
    }),
    processedAt: Type.String({
      format: 'date-time',
      description: 'When processing was completed',
    }),
  }),
);

export const DeleteFileResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    id: Type.String({
      description: 'ID of the deleted file',
    }),
    deleted: Type.Boolean({
      description: 'Whether deletion was successful',
    }),
    deletedAt: Type.String({
      format: 'date-time',
      description: 'When the file was deleted',
    }),
  }),
);

// =============================================
// File Statistics Schemas
// =============================================

export const FileStatsDataSchema = Type.Object({
  totalFiles: Type.Number({
    description: 'Total number of files uploaded by user',
  }),
  totalSize: Type.Number({
    description: 'Total size of all files in bytes',
  }),
  publicFiles: Type.Number({
    description: 'Number of public files',
  }),
  temporaryFiles: Type.Number({
    description: 'Number of temporary files',
  }),
  categories: Type.Record(Type.String(), Type.Number(), {
    description: 'File count by category',
  }),
});

export const FileStatsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: FileStatsDataSchema,
  meta: Type.Optional(
    Type.Object({
      requestId: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      version: Type.String(),
    }),
  ),
});

// =============================================
// Path Parameter Schemas
// =============================================

export const FileIdParamSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'File UUID',
  }),
});

export const DeleteQuerySchema = Type.Object({
  force: Type.Optional(
    Type.Boolean({
      description:
        'Force delete (permanently remove from storage and database)',
    }),
  ),
});

// =============================================
// Type Exports
// =============================================

export type FileUploadRequest = Static<typeof FileUploadSchema>;
export type FileUpdateRequest = Static<typeof FileUpdateSchema>;
export type ImageProcessingRequest = Static<typeof ImageProcessingSchema>;
export type FileListQuery = Static<typeof FileListQuerySchema>;
export type DownloadQuery = Static<typeof DownloadQuerySchema>;
export type ThumbnailQuery = Static<typeof ThumbnailQuerySchema>;
export type ViewQuery = Static<typeof ViewQuerySchema>;
export type UploadedFile = Static<typeof UploadedFileSchema>;
export type FileIdParam = Static<typeof FileIdParamSchema>;
export type DeleteQuery = Static<typeof DeleteQuerySchema>;
export type FileStatsData = Static<typeof FileStatsDataSchema>;
export type FileStatsResponse = Static<typeof FileStatsResponseSchema>;

// =============================================
// File Upload Specific Error Schemas
// =============================================

export const FileUploadErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Union([
      Type.Literal('FILE_TOO_LARGE'),
      Type.Literal('INVALID_FILE_TYPE'),
      Type.Literal('VIRUS_DETECTED'),
      Type.Literal('STORAGE_FULL'),
      Type.Literal('UPLOAD_INCOMPLETE'),
      Type.Literal('FILE_CORRUPTED'),
      Type.Literal('PROCESSING_FAILED'),
      Type.Literal('FILE_NOT_FOUND'),
      Type.Literal('ACCESS_DENIED'),
      Type.Literal('QUOTA_EXCEEDED'),
      Type.Literal('DOWNLOAD_FAILED'),
      Type.Literal('NO_FILE_PROVIDED'),
      Type.Literal('NO_FILES_PROVIDED'),
      Type.Literal('UNAUTHORIZED'),
      Type.Literal('FETCH_FAILED'),
      Type.Literal('LIST_FAILED'),
      Type.Literal('UPDATE_FAILED'),
      Type.Literal('DELETE_FAILED'),
      Type.Literal('SIGNED_URL_FAILED'),
      Type.Literal('STATS_FAILED'),
      Type.Literal('UPLOAD_FAILED'),
      Type.Literal('FILE_LIMIT_EXCEEDED'),
      Type.Literal('UPLOAD_TIMEOUT'),
      Type.Literal('FILE_READ_TIMEOUT'),
      Type.Literal('INVALID_TOKEN'),
    ]),
    message: Type.String(),
    details: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }),
  meta: Type.Optional(
    Type.Object({
      requestId: Type.String(),
      timestamp: Type.String({ format: 'date-time' }),
      version: Type.String(),
    }),
  ),
});

export type FileUploadError = Static<typeof FileUploadErrorSchema>;

// =============================================
// Validation Constants
// =============================================

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

// File viewing constants for Smart View functionality
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

// =============================================================================
// SIGNED URL SCHEMAS
// =============================================================================

/**
 * Thumbnail options for signed URL generation
 */
export const ThumbnailOptionsSchema = Type.Object({
  size: Type.Optional(
    Type.String({
      pattern: '^\\d+x\\d+$',
      default: '150x150',
      description: 'Thumbnail size in format "WIDTHxHEIGHT"',
      examples: ['64x64', '150x150', '300x300', '512x512'],
    }),
  ),
  format: Type.Optional(
    Type.Union(
      [Type.Literal('jpg'), Type.Literal('png'), Type.Literal('webp')],
      {
        default: 'webp',
        description: 'Output image format',
      },
    ),
  ),
  quality: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      default: 80,
      description: 'Image quality (1-100, higher is better quality)',
    }),
  ),
});

/**
 * Request schema for generating signed URLs
 */
export const SignedUrlRequestSchema = Type.Object(
  {
    expiresIn: Type.Optional(
      Type.Integer({
        minimum: 300, // 5 minutes minimum
        maximum: 86400, // 24 hours maximum
        default: 3600, // 1 hour default
        description: 'Expiry time in seconds (300-86400)',
      }),
    ),
    thumbnailOptions: Type.Optional(ThumbnailOptionsSchema),
  },
  {
    title: 'SignedUrlRequest',
    description: 'Request payload for generating signed URLs',
  },
);

// SignedUrlsSchema moved above to resolve dependency

/**
 * Storage metadata for signed URLs
 */
export const StorageMetadataSchema = Type.Object({
  storageType: Type.Union(
    [
      Type.Literal('local'),
      Type.Literal('s3'),
      Type.Literal('minio'),
      Type.Literal('gcs'),
      Type.Literal('azure'),
    ],
    {
      description: 'Storage provider type',
    },
  ),
  region: Type.Optional(
    Type.String({
      description: 'Storage region (for cloud providers)',
    }),
  ),
  bucket: Type.Optional(
    Type.String({
      description: 'Storage bucket name (for cloud providers)',
    }),
  ),
  endpoint: Type.Optional(
    Type.String({
      format: 'uri',
      description: 'Storage endpoint URL',
    }),
  ),
});

/**
 * Response schema for signed URL generation
 */
export const SignedUrlResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    data: Type.Object({
      token: Type.Optional(
        Type.String({
          description:
            'JWT token for local storage authentication (not present for cloud presigned URLs)',
        }),
      ),
      expiresAt: Type.String({
        format: 'date-time',
        description: 'When the signed URLs expire',
      }),
      urls: SignedUrlsSchema,
      metadata: StorageMetadataSchema,
    }),
    meta: ApiMetaSchema,
  },
  {
    title: 'SignedUrlResponse',
    description: 'Response containing signed URLs for file access',
  },
);

/**
 * Enhanced file response with signed URLs
 */
export const EnhancedFileResponseSchema = Type.Object(
  {
    ...FileUploadResponseSchema.properties.data.properties,
    signedUrls: Type.Optional(
      Type.Object(
        {
          view: Type.String({ format: 'uri' }),
          download: Type.String({ format: 'uri' }),
          thumbnail: Type.String({ format: 'uri' }),
          expiresAt: Type.String({ format: 'date-time' }),
        },
        {
          description: 'Pre-generated signed URLs for immediate use',
        },
      ),
    ),
  },
  {
    title: 'EnhancedFileResponse',
    description: 'File metadata with optional signed URLs',
  },
);

/**
 * Enhanced file list response with signed URLs
 */
export const EnhancedFileListResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    data: Type.Array(EnhancedFileResponseSchema),
    pagination: PaginationMetaSchema,
    meta: ApiMetaSchema,
  },
  {
    title: 'EnhancedFileListResponse',
    description: 'File list with pre-generated signed URLs',
  },
);

/**
 * File list response schema (uses EnhancedFileResponseSchema)
 */
export const FileListResponseSchema = ApiSuccessResponseSchema(
  Type.Array(EnhancedFileResponseSchema),
);

// =============================================================================
// TYPE EXPORTS FOR SIGNED URLS
// =============================================================================

export type ThumbnailOptions = Static<typeof ThumbnailOptionsSchema>;
export type SignedUrlRequest = Static<typeof SignedUrlRequestSchema>;
export type SignedUrls = Static<typeof SignedUrlsSchema>;
export type StorageMetadata = Static<typeof StorageMetadataSchema>;
export type SignedUrlResponse = Static<typeof SignedUrlResponseSchema>;
export type EnhancedFileResponse = Static<typeof EnhancedFileResponseSchema>;
export type EnhancedFileListResponse = Static<
  typeof EnhancedFileListResponseSchema
>;
