import { Type, Static, TSchema } from '@sinclair/typebox';

/**
 * Base Audit Schemas
 *
 * Common TypeBox schemas for all audit log systems.
 * Provides validation for common fields, query parameters, and responses.
 */

// ==================== COMMON FIELD SCHEMAS ====================

/**
 * UUID Schema
 */
export const UuidSchema = Type.String({
  format: 'uuid',
  description: 'UUID identifier',
});

/**
 * Timestamp Schema
 */
export const TimestampSchema = Type.String({
  format: 'date-time',
  description: 'ISO 8601 timestamp',
});

/**
 * Nullable Timestamp Schema
 */
export const NullableTimestampSchema = Type.Union([
  TimestampSchema,
  Type.Null(),
]);

/**
 * IP Address Schema (IPv4/IPv6)
 */
export const IpAddressSchema = Type.String({
  minLength: 7,
  maxLength: 45,
  description: 'IPv4 or IPv6 address',
});

/**
 * User Agent Schema
 */
export const UserAgentSchema = Type.String({
  minLength: 1,
  maxLength: 1000,
  description: 'Browser user agent string',
});

/**
 * Session ID Schema
 */
export const SessionIdSchema = Type.String({
  minLength: 1,
  maxLength: 128,
  description: 'Session identifier',
});

/**
 * JSONB Metadata Schema
 */
export const MetadataSchema = Type.Record(Type.String(), Type.Any(), {
  description: 'Flexible JSONB metadata object',
});

// ==================== PAGINATION SCHEMAS ====================

/**
 * Page Number Schema
 */
export const PageSchema = Type.Integer({
  minimum: 1,
  default: 1,
  description: 'Page number (1-based)',
});

/**
 * Limit Schema
 */
export const LimitSchema = Type.Integer({
  minimum: 1,
  maximum: 100,
  default: 10,
  description: 'Items per page (1-100)',
});

/**
 * Base Pagination Query Schema
 */
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(PageSchema),
  limit: Type.Optional(LimitSchema),
});

export type PaginationQuery = Static<typeof PaginationQuerySchema>;

/**
 * Pagination Metadata Schema
 */
export const PaginationMetaSchema = Type.Object({
  page: Type.Integer({ minimum: 1 }),
  limit: Type.Integer({ minimum: 1 }),
  total: Type.Integer({ minimum: 0 }),
  totalPages: Type.Integer({ minimum: 0 }),
  hasNext: Type.Boolean(),
  hasPrev: Type.Boolean(),
});

export type PaginationMeta = Static<typeof PaginationMetaSchema>;

/**
 * Paginated Response Schema
 *
 * Generic schema for paginated responses
 */
export const PaginatedResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Array(dataSchema),
    pagination: PaginationMetaSchema,
  });

// ==================== QUERY FILTER SCHEMAS ====================

/**
 * User ID Filter Schema
 */
export const UserIdFilterSchema = Type.Optional(UuidSchema);

/**
 * Date Range Filter Schemas
 */
export const StartDateSchema = Type.Optional(TimestampSchema);
export const EndDateSchema = Type.Optional(TimestampSchema);

/**
 * Search Query Schema
 */
export const SearchSchema = Type.Optional(
  Type.String({
    minLength: 1,
    maxLength: 255,
    description: 'Search term for filtering',
  }),
);

/**
 * Base Audit Query Schema
 *
 * Common query parameters for all audit logs
 */
export const BaseAuditQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  Type.Object({
    userId: UserIdFilterSchema,
    startDate: StartDateSchema,
    endDate: EndDateSchema,
    search: SearchSchema,
  }),
]);

export type BaseAuditQuery = Static<typeof BaseAuditQuerySchema>;

// ==================== STATISTICS SCHEMAS ====================

/**
 * Days Parameter Schema (for statistics)
 */
export const DaysParamSchema = Type.Object({
  days: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 365,
      default: 7,
      description: 'Number of days for statistics (1-365)',
    }),
  ),
});

export type DaysParam = Static<typeof DaysParamSchema>;

/**
 * Base Statistics Schema
 */
export const BaseStatsSchema = Type.Object({
  total: Type.Integer({ minimum: 0, description: 'Total count' }),
  recent24h: Type.Integer({
    minimum: 0,
    description: 'Count in last 24 hours',
  }),
});

export type BaseStats = Static<typeof BaseStatsSchema>;

/**
 * Trend Data Point Schema
 */
export const TrendDataPointSchema = Type.Object({
  date: Type.String({ format: 'date' }),
  count: Type.Integer({ minimum: 0 }),
});

export type TrendDataPoint = Static<typeof TrendDataPointSchema>;

/**
 * Trend Data Schema
 */
export const TrendDataSchema = Type.Array(TrendDataPointSchema);

/**
 * Top Item Schema
 */
export const TopItemSchema = Type.Object({
  value: Type.String(),
  count: Type.Integer({ minimum: 0 }),
});

export type TopItem = Static<typeof TopItemSchema>;

/**
 * Top Items Schema
 */
export const TopItemsSchema = Type.Array(TopItemSchema);

// ==================== CLEANUP SCHEMAS ====================

/**
 * Cleanup Query Schema
 */
export const CleanupQuerySchema = Type.Object({
  olderThan: Type.Integer({
    minimum: 1,
    maximum: 3650, // 10 years
    description: 'Delete records older than this many days',
  }),
});

export type CleanupQuery = Static<typeof CleanupQuerySchema>;

/**
 * Cleanup Result Schema
 */
export const CleanupResultSchema = Type.Object({
  deletedCount: Type.Integer({
    minimum: 0,
    description: 'Number of records deleted',
  }),
});

export type CleanupResult = Static<typeof CleanupResultSchema>;

// ==================== EXPORT SCHEMAS ====================

/**
 * Export Format Schema
 */
export const ExportFormatSchema = Type.Union([
  Type.Literal('csv'),
  Type.Literal('json'),
]);

export type ExportFormat = Static<typeof ExportFormatSchema>;

/**
 * Export Query Schema
 */
export const ExportQuerySchema = Type.Intersect([
  BaseAuditQuerySchema,
  Type.Object({
    format: Type.Optional(ExportFormatSchema),
  }),
]);

export type ExportQuery = Static<typeof ExportQuerySchema>;

// ==================== RESPONSE SCHEMAS ====================

/**
 * Success Response Schema (Generic)
 */
export const ApiSuccessResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: dataSchema,
  });

/**
 * Error Response Schema
 */
export const ApiErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Any()),
  }),
});

export type ApiErrorResponse = Static<typeof ApiErrorResponseSchema>;

/**
 * ID Response Schema
 */
export const IdResponseSchema = Type.Object({
  id: UuidSchema,
  message: Type.Optional(Type.String()),
});

export type IdResponse = Static<typeof IdResponseSchema>;

/**
 * Success ID Response Schema
 */
export const SuccessIdResponseSchema =
  ApiSuccessResponseSchema(IdResponseSchema);

/**
 * Delete Success Response Schema
 */
export const DeleteSuccessSchema = Type.Object({
  message: Type.String(),
});

export const SuccessDeleteResponseSchema =
  ApiSuccessResponseSchema(DeleteSuccessSchema);

/**
 * Count Response Schema
 */
export const CountResponseSchema = Type.Object({
  count: Type.Integer({ minimum: 0 }),
});

export const SuccessCountResponseSchema =
  ApiSuccessResponseSchema(CountResponseSchema);

// ==================== COMMON AUDIT LOG FIELDS ====================

/**
 * Base Audit Log Schema
 *
 * Common fields across all audit log types
 */
export const BaseAuditLogSchema = Type.Object({
  id: UuidSchema,
  userId: Type.Union([UuidSchema, Type.Null()], {
    description: 'User who performed action (null for system/anonymous)',
  }),
  timestamp: TimestampSchema,
  ipAddress: Type.Optional(IpAddressSchema),
  userAgent: Type.Optional(UserAgentSchema),
  sessionId: Type.Optional(SessionIdSchema),
  metadata: Type.Optional(MetadataSchema),
  createdAt: TimestampSchema,
});

export type BaseAuditLog = Static<typeof BaseAuditLogSchema>;

// ==================== ROUTE PARAMETER SCHEMAS ====================

/**
 * ID Parameter Schema
 */
export const IdParamSchema = Type.Object({
  id: UuidSchema,
});

export type IdParam = Static<typeof IdParamSchema>;

/**
 * User ID Parameter Schema
 */
export const UserIdParamSchema = Type.Object({
  userId: UuidSchema,
});

export type UserIdParam = Static<typeof UserIdParamSchema>;

// ==================== VALIDATION HELPERS ====================

/**
 * Create an enum schema from string array
 */
export const createEnumSchema = (values: string[], description?: string) =>
  Type.Union(
    values.map((v) => Type.Literal(v)) as any,
    description ? { description } : undefined,
  );

/**
 * Create an optional enum schema
 */
export const createOptionalEnumSchema = (
  values: string[],
  description?: string,
) => Type.Optional(createEnumSchema(values, description));

/**
 * Create a nullable field schema
 */
export const nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);

/**
 * Create an optional nullable field schema
 */
export const optionalNullable = <T extends TSchema>(schema: T) =>
  Type.Optional(nullable(schema));

// ==================== UTILITY SCHEMAS ====================

/**
 * Boolean Query Parameter Schema
 */
export const BooleanQuerySchema = Type.Optional(
  Type.Union([Type.Boolean(), Type.String()], {
    description: 'Boolean parameter (true/false or "true"/"false")',
  }),
);

/**
 * Integer Query Parameter Schema
 */
export const IntegerQuerySchema = (
  options: { min?: number; max?: number; default?: number } = {},
) =>
  Type.Optional(
    Type.Integer({
      minimum: options.min,
      maximum: options.max,
      default: options.default,
    }),
  );

/**
 * String Query Parameter Schema
 */
export const StringQuerySchema = (
  options: { minLength?: number; maxLength?: number } = {},
) =>
  Type.Optional(
    Type.String({
      minLength: options.minLength || 1,
      maxLength: options.maxLength || 255,
    }),
  );

// ==================== HTTP STATUS SCHEMAS ====================

/**
 * HTTP Status Code Schema
 */
export const HttpStatusSchema = Type.Integer({
  minimum: 100,
  maximum: 599,
  description: 'HTTP status code',
});

/**
 * Success Boolean Schema
 */
export const SuccessBooleanSchema = Type.Boolean({
  description: 'Operation success indicator',
});

/**
 * Access Granted Schema
 */
export const AccessGrantedSchema = Type.Optional(
  Type.Boolean({
    description: 'Authorization result',
  }),
);

// ==================== SECURITY SCHEMAS ====================

/**
 * Authentication Method Schema
 */
export const AuthMethodSchema = Type.Optional(
  createEnumSchema(
    ['bearer', 'session', 'signed_url', 'anonymous', 'api_key'],
    'Authentication method used',
  ),
);

export type AuthMethod =
  | 'bearer'
  | 'session'
  | 'signed_url'
  | 'anonymous'
  | 'api_key';

/**
 * Access Method Schema
 */
export const AccessMethodSchema = Type.Optional(
  createEnumSchema(
    ['web', 'api', 'direct_link', 'signed_url'],
    'How resource was accessed',
  ),
);

export type AccessMethod = 'web' | 'api' | 'direct_link' | 'signed_url';

/**
 * Denial Reason Schema
 */
export const DenialReasonSchema = Type.Optional(
  Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Reason for access denial',
  }),
);

// ==================== EXPORT HELPERS ====================

/**
 * All common schemas for easy import
 */
export const CommonSchemas = {
  // Basic types
  Uuid: UuidSchema,
  Timestamp: TimestampSchema,
  NullableTimestamp: NullableTimestampSchema,
  IpAddress: IpAddressSchema,
  UserAgent: UserAgentSchema,
  SessionId: SessionIdSchema,
  Metadata: MetadataSchema,

  // Pagination
  Page: PageSchema,
  Limit: LimitSchema,
  PaginationQuery: PaginationQuerySchema,
  PaginationMeta: PaginationMetaSchema,

  // Filters
  UserIdFilter: UserIdFilterSchema,
  StartDate: StartDateSchema,
  EndDate: EndDateSchema,
  Search: SearchSchema,

  // Query
  BaseAuditQuery: BaseAuditQuerySchema,
  DaysParam: DaysParamSchema,
  CleanupQuery: CleanupQuerySchema,
  ExportQuery: ExportQuerySchema,

  // Statistics
  BaseStats: BaseStatsSchema,
  TrendDataPoint: TrendDataPointSchema,
  TrendData: TrendDataSchema,
  TopItem: TopItemSchema,
  TopItems: TopItemsSchema,

  // Responses
  CleanupResult: CleanupResultSchema,
  IdResponse: IdResponseSchema,
  DeleteSuccess: DeleteSuccessSchema,
  CountResponse: CountResponseSchema,

  // Audit Log
  BaseAuditLog: BaseAuditLogSchema,

  // Parameters
  IdParam: IdParamSchema,
  UserIdParam: UserIdParamSchema,

  // HTTP
  HttpStatus: HttpStatusSchema,
  SuccessBoolean: SuccessBooleanSchema,
  AccessGranted: AccessGrantedSchema,

  // Security
  AuthMethod: AuthMethodSchema,
  AccessMethod: AccessMethodSchema,
  DenialReason: DenialReasonSchema,

  // Helpers
  BooleanQuery: BooleanQuerySchema,

  // Response Builders
  ApiErrorResponse: ApiErrorResponseSchema,
  ApiSuccessResponse: ApiSuccessResponseSchema,
  PaginatedResponse: PaginatedResponseSchema,

  // Cleanup responses
  SuccessIdResponse: Type.Object({
    success: Type.Literal(true),
    data: Type.Object({ id: UuidSchema }),
  }),
  SuccessDeleteResponse: Type.Object({
    success: Type.Literal(true),
    data: Type.Object({ message: Type.String() }),
  }),
  SuccessCleanupResponse: Type.Object({
    success: Type.Literal(true),
    data: Type.Object({ deletedCount: Type.Integer({ minimum: 0 }) }),
  }),
};
