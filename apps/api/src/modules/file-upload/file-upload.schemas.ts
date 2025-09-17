import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginationMetaSchema,
  StandardRouteResponses,
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
  metadata: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Additional metadata for the file',
    }),
  ),
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

export const SignedUrlRequestSchema = Type.Object({
  expiresIn: Type.Number({
    minimum: 1,
    maximum: 3600, // Max 1 hour
    description: 'Expiration time in seconds',
  }),
  permissions: Type.Array(
    Type.Union([Type.Literal('read'), Type.Literal('download')]),
    {
      minItems: 1,
      description: 'Granted permissions for the signed URL',
    },
  ),
});

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
        Type.Literal('file_size'),
        Type.Literal('original_name'),
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
  downloadUrl: Type.String({
    description: 'URL to download the file',
  }),
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
  uploadedAt: Type.String({
    format: 'date-time',
    description: 'When the file was uploaded',
  }),
  updatedAt: Type.String({
    format: 'date-time',
    description: 'When the file was last updated',
  }),
});

// ✅ FIXED: Using base schema standards
export const FileUploadResponseSchema =
  ApiSuccessResponseSchema(UploadedFileSchema);

export const MultipleFileUploadResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
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
);

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

// ✅ FIXED: Using standard pagination with base schema
export const FileListResponseSchema = ApiSuccessResponseSchema(
  Type.Array(UploadedFileSchema),
);

export const SignedUrlResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    url: Type.String({
      description: 'Signed URL for secure access',
    }),
    expiresAt: Type.String({
      format: 'date-time',
      description: 'When the URL expires',
    }),
    permissions: Type.Array(Type.String(), {
      description: 'Granted permissions',
    }),
  }),
);

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
// Path Parameter Schemas
// =============================================

export const FileIdParamSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
    description: 'File UUID',
  }),
});

// =============================================
// Type Exports
// =============================================

export type FileUploadRequest = Static<typeof FileUploadSchema>;
export type FileUpdateRequest = Static<typeof FileUpdateSchema>;
export type ImageProcessingRequest = Static<typeof ImageProcessingSchema>;
export type SignedUrlRequest = Static<typeof SignedUrlRequestSchema>;
export type FileListQuery = Static<typeof FileListQuerySchema>;
export type DownloadQuery = Static<typeof DownloadQuerySchema>;
export type UploadedFile = Static<typeof UploadedFileSchema>;
export type FileIdParam = Static<typeof FileIdParamSchema>;

// =============================================
// File Upload Specific Error Schemas
// =============================================

export const FileUploadErrorSchema = Type.Object({
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
    ]),
    message: Type.String(),
    details: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }),
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
