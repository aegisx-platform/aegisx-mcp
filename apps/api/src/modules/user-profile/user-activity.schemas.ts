import { Type, Static } from '@sinclair/typebox';

// Base activity log entry schema
export const ActivityLogSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  user_id: Type.String({ format: 'uuid' }),
  action: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.String({ minLength: 1 }),
  severity: Type.Union(
    [
      Type.Literal('info'),
      Type.Literal('warning'),
      Type.Literal('error'),
      Type.Literal('critical'),
    ],
    { default: 'info' },
  ),
  ip_address: Type.Optional(Type.String({ maxLength: 45 })),
  user_agent: Type.Optional(Type.String()),
  session_id: Type.Optional(Type.String({ maxLength: 128 })),
  request_id: Type.Optional(Type.String({ maxLength: 64 })),
  device_info: Type.Optional(
    Type.Object({
      browser: Type.Optional(Type.String()),
      os: Type.Optional(Type.String()),
      device: Type.Optional(Type.String()),
      isMobile: Type.Optional(Type.Boolean()),
      isDesktop: Type.Optional(Type.Boolean()),
      isTablet: Type.Optional(Type.Boolean()),
    }),
  ),
  location_info: Type.Optional(
    Type.Object({
      country: Type.Optional(Type.String()),
      city: Type.Optional(Type.String()),
      timezone: Type.Optional(Type.String()),
    }),
  ),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  created_at: Type.String({ format: 'date-time' }),
});

// Create activity log request schema
export const CreateActivityLogSchema = Type.Object({
  action: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Action type (e.g., login, logout, profile_update)',
  }),
  description: Type.String({
    minLength: 1,
    description: 'Human readable description of the action',
  }),
  severity: Type.Optional(
    Type.Union(
      [
        Type.Literal('info'),
        Type.Literal('warning'),
        Type.Literal('error'),
        Type.Literal('critical'),
      ],
      { default: 'info' },
    ),
  ),
  metadata: Type.Optional(
    Type.Record(Type.String(), Type.Any(), {
      description: 'Additional action-specific data',
    }),
  ),
});

// Get activity logs query parameters
export const GetActivityLogsQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(
    Type.Integer({ minimum: 1, maximum: 1000, default: 20 }),
  ),
  action: Type.Optional(
    Type.String({
      description: 'Filter by action type',
    }),
  ),
  severity: Type.Optional(
    Type.Union([
      Type.Literal('info'),
      Type.Literal('warning'),
      Type.Literal('error'),
      Type.Literal('critical'),
    ]),
  ),
  from_date: Type.Optional(
    Type.String({
      format: 'date',
      description: 'Start date for filtering (YYYY-MM-DD)',
    }),
  ),
  to_date: Type.Optional(
    Type.String({
      format: 'date',
      description: 'End date for filtering (YYYY-MM-DD)',
    }),
  ),
  search: Type.Optional(
    Type.String({
      minLength: 1,
      description: 'Search in description',
    }),
  ),
});

// Activity logs response with pagination
export const ActivityLogsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    activities: Type.Array(ActivityLogSchema),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      pages: Type.Integer(),
      hasNext: Type.Boolean(),
      hasPrev: Type.Boolean(),
    }),
  }),
});

// Activity sessions schema (grouped by session)
export const ActivitySessionSchema = Type.Object({
  session_id: Type.String(),
  start_time: Type.String({ format: 'date-time' }),
  end_time: Type.Optional(Type.String({ format: 'date-time' })),
  ip_address: Type.Optional(Type.String()),
  device_info: Type.Optional(
    Type.Object({
      browser: Type.Optional(Type.String()),
      os: Type.Optional(Type.String()),
      device: Type.Optional(Type.String()),
    }),
  ),
  location_info: Type.Optional(
    Type.Object({
      country: Type.Optional(Type.String()),
      city: Type.Optional(Type.String()),
    }),
  ),
  activities_count: Type.Integer(),
  is_active: Type.Boolean(),
});

// Get activity sessions response
export const ActivitySessionsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    sessions: Type.Array(ActivitySessionSchema),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      pages: Type.Integer(),
      hasNext: Type.Boolean(),
      hasPrev: Type.Boolean(),
    }),
  }),
});

// Activity statistics schema
export const ActivityStatsSchema = Type.Object({
  total_activities: Type.Integer(),
  activities_by_action: Type.Record(Type.String(), Type.Integer()),
  activities_by_severity: Type.Object({
    info: Type.Integer(),
    warning: Type.Integer(),
    error: Type.Integer(),
    critical: Type.Integer(),
  }),
  recent_activities_count: Type.Object({
    today: Type.Integer(),
    this_week: Type.Integer(),
    this_month: Type.Integer(),
  }),
  unique_devices: Type.Integer(),
  unique_locations: Type.Integer(),
  last_activity: Type.Optional(Type.String({ format: 'date-time' })),
});

// Get activity statistics response
export const ActivityStatsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: ActivityStatsSchema,
});

// Common activity action constants
export const ACTIVITY_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_COMPLETE: 'password_reset_complete',

  // Profile Management
  PROFILE_VIEW: 'profile_view',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  AVATAR_UPLOAD: 'avatar_upload',
  AVATAR_DELETE: 'avatar_delete',

  // Preferences
  PREFERENCES_VIEW: 'preferences_view',
  PREFERENCES_UPDATE: 'preferences_update',
  THEME_CHANGE: 'theme_change',
  LANGUAGE_CHANGE: 'language_change',

  // Security
  SESSION_CREATED: 'session_created',
  SESSION_DESTROYED: 'session_destroyed',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',

  // Account Management
  ACCOUNT_DELETE: 'account_delete',
  ACCOUNT_DELETE_FAILED: 'account_delete_failed',
  ACCOUNT_RECOVERY: 'account_recovery',

  // System
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
} as const;

// Type exports
export type ActivityLog = Static<typeof ActivityLogSchema>;
export type CreateActivityLog = Static<typeof CreateActivityLogSchema>;
export type GetActivityLogsQuery = Static<typeof GetActivityLogsQuerySchema>;
export type ActivityLogsResponse = Static<typeof ActivityLogsResponseSchema>;
export type ActivitySession = Static<typeof ActivitySessionSchema>;
export type ActivitySessionsResponse = Static<
  typeof ActivitySessionsResponseSchema
>;
export type ActivityStats = Static<typeof ActivityStatsSchema>;
export type ActivityStatsResponse = Static<typeof ActivityStatsResponseSchema>;
export type ActivityAction =
  (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
