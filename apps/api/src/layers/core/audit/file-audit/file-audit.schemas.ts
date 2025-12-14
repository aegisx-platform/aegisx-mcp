import { Type, Static } from '@sinclair/typebox';
import {
  CommonSchemas,
  BaseAuditLogSchema,
  createEnumSchema,
  createOptionalEnumSchema,
} from '../base/base.schemas';

/**
 * File Operations Enum
 */
export enum FileOperation {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VIEW = 'view',
  UPDATE = 'update',
  DELETE = 'delete',
  SHARE = 'share',
  REVOKE_SHARE = 'revoke_share',
  PROCESS_IMAGE = 'process_image',
  GENERATE_THUMBNAIL = 'generate_thumbnail',
  GENERATE_SIGNED_URL = 'generate_signed_url',
  CLEANUP = 'cleanup',
  RESTORE = 'restore',
  ACCESS_DENIED = 'access_denied',
  ACCESS_GRANTED = 'access_granted',
}

/**
 * File Operation Schema
 */
export const FileOperationSchema = createEnumSchema(
  Object.values(FileOperation),
  'File operation type',
);

/**
 * File Audit Log Schema
 *
 * Extends base audit log with file-specific fields
 */
export const FileAuditLogSchema = Type.Intersect([
  BaseAuditLogSchema,
  Type.Object({
    // File reference
    fileId: CommonSchemas.Uuid,

    // Operation details
    operation: FileOperationSchema,
    accessMethod: CommonSchemas.AccessMethod,

    // Timing
    durationMs: Type.Optional(
      Type.Integer({
        minimum: 0,
        description: 'Operation duration in milliseconds',
      }),
    ),

    // Success tracking
    success: Type.Boolean({ default: true }),
    errorMessage: Type.Optional(Type.String()),

    // Access control
    accessGranted: Type.Optional(Type.Boolean()),
    denialReason: CommonSchemas.DenialReason,
    httpStatus: Type.Optional(CommonSchemas.HttpStatus),

    // Authentication
    authMethod: CommonSchemas.AuthMethod,

    // Request context
    referer: Type.Optional(
      Type.String({
        maxLength: 1000,
        description: 'HTTP referer header',
      }),
    ),

    // File context
    fileName: Type.Optional(
      Type.String({
        maxLength: 500,
        description: 'Original file name',
      }),
    ),
    fileSize: Type.Optional(
      Type.Integer({
        minimum: 0,
        description: 'File size in bytes',
      }),
    ),
    category: Type.Optional(
      Type.String({
        maxLength: 50,
        description: 'File category',
      }),
    ),
  }),
]);

export type FileAuditLog = Static<typeof FileAuditLogSchema>;

/**
 * File Audit Query Schema
 *
 * Query parameters for filtering file audit logs
 */
export const FileAuditQuerySchema = Type.Intersect([
  CommonSchemas.BaseAuditQuery,
  Type.Object({
    fileId: Type.Optional(CommonSchemas.Uuid),
    operation: createOptionalEnumSchema(
      Object.values(FileOperation),
      'Filter by operation type',
    ),
    success: CommonSchemas.BooleanQuery,
    accessGranted: CommonSchemas.BooleanQuery,
    httpStatus: Type.Optional(CommonSchemas.HttpStatus),
    authMethod: createOptionalEnumSchema(
      ['bearer', 'session', 'signed_url', 'anonymous', 'api_key'],
      'Filter by authentication method',
    ),
    accessMethod: createOptionalEnumSchema(
      ['web', 'api', 'direct_link', 'signed_url'],
      'Filter by access method',
    ),
    category: Type.Optional(Type.String()),
  }),
]);

export type FileAuditQuery = Static<typeof FileAuditQuerySchema>;

/**
 * File Audit Statistics Schema
 */
export const FileAuditStatsSchema = Type.Intersect([
  CommonSchemas.BaseStats,
  Type.Object({
    // By operation
    byOperation: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: 'Count by operation type',
    }),

    // By access method
    byAccessMethod: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: 'Count by access method',
    }),

    // By category
    byCategory: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: 'Count by file category',
    }),

    // Success/failure
    successCount: Type.Integer({ minimum: 0 }),
    failureCount: Type.Integer({ minimum: 0 }),
    successRate: Type.Number({ minimum: 0, maximum: 100 }),

    // Access granted/denied
    accessGrantedCount: Type.Integer({ minimum: 0 }),
    accessDeniedCount: Type.Integer({ minimum: 0 }),

    // Performance
    averageDurationMs: Type.Number({ minimum: 0 }),
    totalBytesTransferred: Type.Integer({ minimum: 0 }),

    // Unique entities
    uniqueFiles: Type.Integer({ minimum: 0 }),
    uniqueUsers: Type.Integer({ minimum: 0 }),

    // Trend data
    trend: CommonSchemas.TrendData,

    // Top items
    topFiles: CommonSchemas.TopItems,
    topUsers: CommonSchemas.TopItems,
  }),
]);

export type FileAuditStats = Static<typeof FileAuditStatsSchema>;

/**
 * Create File Audit Log Request Schema
 */
export const CreateFileAuditLogSchema = Type.Object({
  fileId: CommonSchemas.Uuid,
  userId: Type.Optional(Type.Union([CommonSchemas.Uuid, Type.Null()])),
  operation: FileOperationSchema,
  success: Type.Optional(Type.Boolean({ default: true })),
  errorMessage: Type.Optional(Type.String()),
  accessMethod: Type.Optional(CommonSchemas.AccessMethod),
  accessGranted: Type.Optional(Type.Boolean()),
  denialReason: Type.Optional(CommonSchemas.DenialReason),
  httpStatus: Type.Optional(CommonSchemas.HttpStatus),
  authMethod: Type.Optional(CommonSchemas.AuthMethod),
  durationMs: Type.Optional(Type.Integer({ minimum: 0 })),
  fileName: Type.Optional(Type.String({ maxLength: 500 })),
  fileSize: Type.Optional(Type.Integer({ minimum: 0 })),
  category: Type.Optional(Type.String({ maxLength: 50 })),
  metadata: Type.Optional(CommonSchemas.Metadata),
});

export type CreateFileAuditLog = Static<typeof CreateFileAuditLogSchema>;

/**
 * File History Query Schema
 */
export const FileHistoryQuerySchema = Type.Object({
  limit: Type.Optional(CommonSchemas.Limit),
});

export type FileHistoryQuery = Static<typeof FileHistoryQuerySchema>;

/**
 * User File Activity Query Schema
 */
export const UserFileActivityQuerySchema = Type.Intersect([
  CommonSchemas.PaginationQuery,
  Type.Object({
    startDate: CommonSchemas.StartDate,
    endDate: CommonSchemas.EndDate,
  }),
]);

export type UserFileActivityQuery = Static<typeof UserFileActivityQuerySchema>;

/**
 * File Audit Summary Schema
 */
export const FileAuditSummarySchema = Type.Object({
  fileId: CommonSchemas.Uuid,
  fileName: Type.String(),
  totalOperations: Type.Integer({ minimum: 0 }),
  lastAccessed: CommonSchemas.Timestamp,
  uniqueUsers: Type.Integer({ minimum: 0 }),
  uploads: Type.Integer({ minimum: 0 }),
  downloads: Type.Integer({ minimum: 0 }),
  views: Type.Integer({ minimum: 0 }),
  updates: Type.Integer({ minimum: 0 }),
  deletions: Type.Integer({ minimum: 0 }),
  accessDenied: Type.Integer({ minimum: 0 }),
});

export type FileAuditSummary = Static<typeof FileAuditSummarySchema>;

// ==================== RESPONSE SCHEMAS ====================

/**
 * File Audit Log Response
 */
export const FileAuditLogResponseSchema =
  CommonSchemas.ApiSuccessResponse(FileAuditLogSchema);

/**
 * File Audit Logs List Response
 */
export const FileAuditLogsResponseSchema =
  CommonSchemas.PaginatedResponse(FileAuditLogSchema);

/**
 * File Audit Stats Response
 */
export const FileAuditStatsResponseSchema =
  CommonSchemas.ApiSuccessResponse(FileAuditStatsSchema);

/**
 * File History Response
 */
export const FileHistoryResponseSchema = CommonSchemas.ApiSuccessResponse(
  Type.Array(FileAuditLogSchema),
);

/**
 * File Audit Summary Response
 */
export const FileAuditSummaryResponseSchema = CommonSchemas.ApiSuccessResponse(
  FileAuditSummarySchema,
);

/**
 * User File Activity Response
 */
export const UserFileActivityResponseSchema =
  CommonSchemas.PaginatedResponse(FileAuditLogSchema);

/**
 * Export all schemas for easy import
 */
export const FileAuditSchemas = {
  // Enums
  FileOperation: FileOperationSchema,

  // Main schemas
  FileAuditLog: FileAuditLogSchema,
  FileAuditQuery: FileAuditQuerySchema,
  FileAuditStats: FileAuditStatsSchema,

  // Request schemas
  CreateFileAuditLog: CreateFileAuditLogSchema,
  FileHistoryQuery: FileHistoryQuerySchema,
  UserFileActivityQuery: UserFileActivityQuerySchema,

  // Additional schemas
  FileAuditSummary: FileAuditSummarySchema,

  // Response schemas
  FileAuditLogResponse: FileAuditLogResponseSchema,
  FileAuditLogsResponse: FileAuditLogsResponseSchema,
  FileAuditStatsResponse: FileAuditStatsResponseSchema,
  FileHistoryResponse: FileHistoryResponseSchema,
  FileAuditSummaryResponse: FileAuditSummaryResponseSchema,
  UserFileActivityResponse: UserFileActivityResponseSchema,
};
