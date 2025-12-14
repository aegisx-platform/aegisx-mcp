import { Type, Static } from '@sinclair/typebox';
import { CommonSchemas, BaseAuditLogSchema } from '../base/base.schemas';

/**
 * Login Attempt Schema
 *
 * Records all login attempts for security monitoring
 * Extends base audit log with login-specific fields
 */
export const LoginAttemptSchema = Type.Intersect([
  BaseAuditLogSchema,
  Type.Object({
    // Login credentials attempted
    email: Type.Optional(
      Type.String({
        maxLength: 255,
        format: 'email',
        description: 'Email address used for login',
      }),
    ),
    username: Type.Optional(
      Type.String({
        maxLength: 100,
        description: 'Username used for login',
      }),
    ),

    // Attempt result
    success: Type.Boolean({ default: false }),
    failureReason: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Reason for login failure',
      }),
    ),
  }),
]);

export type LoginAttempt = Static<typeof LoginAttemptSchema>;

/**
 * Login Attempts Query Schema
 */
export const LoginAttemptsQuerySchema = Type.Intersect([
  CommonSchemas.PaginationQuery,
  Type.Object({
    userId: Type.Optional(CommonSchemas.Uuid),
    email: Type.Optional(Type.String({ maxLength: 255 })),
    username: Type.Optional(Type.String({ maxLength: 100 })),
    ipAddress: Type.Optional(CommonSchemas.IpAddress),
    success: CommonSchemas.BooleanQuery,
    failureReason: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Filter by failure reason',
      }),
    ),
    startDate: CommonSchemas.StartDate,
    endDate: CommonSchemas.EndDate,
  }),
]);

export type LoginAttemptsQuery = Static<typeof LoginAttemptsQuerySchema>;

/**
 * Login Attempts Statistics Schema
 */
export const LoginAttemptsStatsSchema = Type.Object({
  total: Type.Integer({ minimum: 0 }),
  recent24h: Type.Integer({ minimum: 0 }),

  // Success/failure
  successCount: Type.Integer({ minimum: 0 }),
  failureCount: Type.Integer({ minimum: 0 }),
  successRate: Type.Number({ minimum: 0, maximum: 100 }),

  // By failure reason
  byFailureReason: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
    description: 'Count by failure reason',
  }),

  // Trend data
  trend: CommonSchemas.TrendData,

  // Top items
  topIPs: CommonSchemas.TopItems,
  topEmails: CommonSchemas.TopItems,
  topUsers: CommonSchemas.TopItems,

  // Security metrics
  uniqueIPs: Type.Integer({ minimum: 0 }),
  uniqueUsers: Type.Integer({ minimum: 0 }),
  blockedAccountsCount: Type.Integer({ minimum: 0 }),
  rateLimitExceededCount: Type.Integer({ minimum: 0 }),
});

export type LoginAttemptsStats = Static<typeof LoginAttemptsStatsSchema>;

/**
 * Create Login Attempt Request Schema
 */
export const CreateLoginAttemptSchema = Type.Object({
  userId: Type.Optional(Type.Union([CommonSchemas.Uuid, Type.Null()])),
  email: Type.Optional(Type.String({ maxLength: 255 })),
  username: Type.Optional(Type.String({ maxLength: 100 })),
  ipAddress: CommonSchemas.IpAddress,
  userAgent: Type.Optional(Type.String({ maxLength: 1000 })),
  success: Type.Boolean({ default: false }),
  failureReason: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 100,
      description: 'Reason for login failure',
    }),
  ),
});

export type CreateLoginAttempt = Static<typeof CreateLoginAttemptSchema>;

/**
 * Account Lockout Check Schema
 */
export const AccountLockoutCheckSchema = Type.Object({
  identifier: Type.String({
    description: 'Email, username, or IP address to check',
  }),
  timeWindowMinutes: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 1440,
      default: 15,
      description: 'Time window in minutes',
    }),
  ),
  maxAttempts: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      default: 5,
      description: 'Maximum allowed attempts',
    }),
  ),
});

export type AccountLockoutCheck = Static<typeof AccountLockoutCheckSchema>;

/**
 * Account Lockout Status Schema
 */
export const AccountLockoutStatusSchema = Type.Object({
  isLocked: Type.Boolean(),
  attemptCount: Type.Integer({ minimum: 0 }),
  maxAttempts: Type.Integer({ minimum: 0 }),
  remainingAttempts: Type.Integer({ minimum: 0 }),
  lockoutTimeRemaining: Type.Optional(Type.Integer({ minimum: 0 })),
  lastAttemptAt: Type.Optional(CommonSchemas.Timestamp),
});

export type AccountLockoutStatus = Static<typeof AccountLockoutStatusSchema>;

/**
 * Brute Force Detection Schema
 */
export const BruteForceDetectionSchema = Type.Object({
  ipAddress: CommonSchemas.IpAddress,
  timeWindowMinutes: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 1440,
      default: 60,
    }),
  ),
  threshold: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 1000,
      default: 20,
    }),
  ),
});

export type BruteForceDetection = Static<typeof BruteForceDetectionSchema>;

/**
 * Brute Force Result Schema
 */
export const BruteForceResultSchema = Type.Object({
  isSuspicious: Type.Boolean(),
  attemptCount: Type.Integer({ minimum: 0 }),
  threshold: Type.Integer({ minimum: 0 }),
  uniqueAccounts: Type.Integer({ minimum: 0 }),
  failureRate: Type.Number({ minimum: 0, maximum: 100 }),
  reasons: Type.Array(Type.String()),
});

export type BruteForceResult = Static<typeof BruteForceResultSchema>;

// ==================== RESPONSE SCHEMAS ====================

/**
 * Login Attempt Response
 */
export const LoginAttemptResponseSchema =
  CommonSchemas.ApiSuccessResponse(LoginAttemptSchema);

/**
 * Login Attempts List Response
 */
export const LoginAttemptsResponseSchema =
  CommonSchemas.PaginatedResponse(LoginAttemptSchema);

/**
 * Login Attempts Stats Response
 */
export const LoginAttemptsStatsResponseSchema =
  CommonSchemas.ApiSuccessResponse(LoginAttemptsStatsSchema);

/**
 * Account Lockout Status Response
 */
export const AccountLockoutStatusResponseSchema =
  CommonSchemas.ApiSuccessResponse(AccountLockoutStatusSchema);

/**
 * Brute Force Result Response
 */
export const BruteForceResultResponseSchema = CommonSchemas.ApiSuccessResponse(
  BruteForceResultSchema,
);

/**
 * Export all schemas for easy import
 */
export const LoginAttemptsSchemas = {
  // Main schemas
  LoginAttempt: LoginAttemptSchema,
  LoginAttemptsQuery: LoginAttemptsQuerySchema,
  LoginAttemptsStats: LoginAttemptsStatsSchema,

  // Request schemas
  CreateLoginAttempt: CreateLoginAttemptSchema,
  AccountLockoutCheck: AccountLockoutCheckSchema,
  BruteForceDetection: BruteForceDetectionSchema,

  // Additional schemas
  AccountLockoutStatus: AccountLockoutStatusSchema,
  BruteForceResult: BruteForceResultSchema,

  // Response schemas
  LoginAttemptResponse: LoginAttemptResponseSchema,
  LoginAttemptsResponse: LoginAttemptsResponseSchema,
  LoginAttemptsStatsResponse: LoginAttemptsStatsResponseSchema,
  AccountLockoutStatusResponse: AccountLockoutStatusResponseSchema,
  BruteForceResultResponse: BruteForceResultResponseSchema,
};
