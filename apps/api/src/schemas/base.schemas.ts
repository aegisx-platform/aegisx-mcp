import { Type, Static } from '@sinclair/typebox';

/**
 * Base Schema Definitions
 * Core schemas used across all API modules for consistency
 */

// API Meta information
export const ApiMetaSchema = Type.Object({
  timestamp: Type.String({ format: 'date-time' }),
  version: Type.String(),
  requestId: Type.String(),
  environment: Type.Optional(
    Type.Union([
      Type.Literal('development'),
      Type.Literal('staging'),
      Type.Literal('production'),
    ]),
  ),
});

// Pagination schema for list endpoints
export const PaginationMetaSchema = Type.Object({
  page: Type.Number({ minimum: 1 }),
  limit: Type.Number({ minimum: 1, maximum: 1000 }),
  total: Type.Number({ minimum: 0 }),
  totalPages: Type.Number({ minimum: 0 }),
});

// Standard API Success Response
export const ApiSuccessResponseSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  dataSchema: T,
) =>
  Type.Object({
    success: Type.Literal(true),
    data: dataSchema,
    message: Type.Optional(Type.String()),
    pagination: Type.Optional(PaginationMetaSchema),
    meta: Type.Optional(ApiMetaSchema),
  });

// Paginated Response Schema (with full pagination meta)
export const PaginatedResponseSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  itemSchema: T,
) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Array(itemSchema),
    pagination: Type.Object({
      page: Type.Number({ minimum: 1 }),
      limit: Type.Number({ minimum: 1, maximum: 1000 }),
      total: Type.Number({ minimum: 0 }),
      totalPages: Type.Number({ minimum: 0 }),
      hasNext: Type.Boolean(),
      hasPrev: Type.Boolean(),
    }),
    meta: Type.Optional(ApiMetaSchema),
  });

// Partial Paginated Response Schema (for field selection support)
export const PartialPaginatedResponseSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  itemSchema: T,
) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Array(Type.Partial(itemSchema)),
    pagination: Type.Object({
      page: Type.Number({ minimum: 1 }),
      limit: Type.Number({ minimum: 1, maximum: 1000 }),
      total: Type.Number({ minimum: 0 }),
      totalPages: Type.Number({ minimum: 0 }),
      hasNext: Type.Boolean(),
      hasPrev: Type.Boolean(),
    }),
    meta: Type.Optional(ApiMetaSchema),
  });

// Operation Result Response Schema (for operations like delete, update status)
export const OperationResultResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Optional(
    Type.Object({
      id: Type.Optional(Type.String()),
      deleted: Type.Optional(Type.Boolean()),
      updated: Type.Optional(Type.Boolean()),
    }),
  ),
  meta: Type.Optional(ApiMetaSchema),
});

// Standard API Error Response
export const ApiErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Any()),
    field: Type.Optional(Type.String()),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Validation Error Response (for 400 errors)
export const ValidationErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('VALIDATION_ERROR'),
    message: Type.String(),
    details: Type.Array(
      Type.Object({
        field: Type.String(),
        message: Type.String(),
        code: Type.String(),
        value: Type.Optional(Type.Any()),
      }),
    ),
    statusCode: Type.Literal(400),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Common HTTP Error Responses
export const UnauthorizedResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('UNAUTHORIZED'),
    message: Type.String({ default: 'Authentication required' }),
    statusCode: Type.Literal(401),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const ForbiddenResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('FORBIDDEN'),
    message: Type.String({ default: 'Insufficient permissions' }),
    statusCode: Type.Literal(403),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const NotFoundResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('NOT_FOUND'),
    message: Type.String(),
    statusCode: Type.Literal(404),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Flexible conflict response that allows custom error codes
export const ConflictResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Union([
      Type.Literal('CONFLICT'),
      Type.Literal('EMAIL_ALREADY_EXISTS'),
      Type.Literal('USERNAME_ALREADY_EXISTS'),
      Type.Literal('RESOURCE_ALREADY_EXISTS'),
      Type.Literal('SETTING_ALREADY_EXISTS'),
    ]),
    message: Type.String(),
    statusCode: Type.Literal(409),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const ServerErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('INTERNAL_SERVER_ERROR'),
    message: Type.String({ default: 'An unexpected error occurred' }),
    statusCode: Type.Literal(500),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Base entity schemas
export const BaseIdSchema = Type.Object({
  id: Type.String({ format: 'uuid', description: 'Unique identifier' }),
});

export const TimestampSchema = Type.Object({
  created_at: Type.String({
    format: 'date-time',
    description: 'Creation timestamp',
  }),
  updated_at: Type.String({
    format: 'date-time',
    description: 'Last update timestamp',
  }),
});

// Common query parameters
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'asc' }),
  ),
});

export const SearchQuerySchema = Type.Object({
  q: Type.Optional(Type.String({ minLength: 1 })),
  fields: Type.Optional(Type.Array(Type.String())),
});

// ID parameter schemas
export const UuidParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export const NumericIdParamSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

// Standard route response schemas helper
export const StandardRouteResponses = {
  200: <T extends import('@sinclair/typebox').TSchema>(dataSchema: T) =>
    ApiSuccessResponseSchema(dataSchema),
  400: ValidationErrorResponseSchema,
  401: UnauthorizedResponseSchema,
  403: ForbiddenResponseSchema,
  404: NotFoundResponseSchema,
  409: ConflictResponseSchema,
  500: ServerErrorResponseSchema,
};

// ==== ENHANCED CRUD SCHEMAS ====

// Dropdown/Options Schemas
export const DropdownOptionSchema = Type.Object({
  value: Type.Union([Type.String(), Type.Number()]),
  label: Type.String(),
  disabled: Type.Optional(Type.Boolean()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export const DropdownResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Object({
    options: Type.Array(DropdownOptionSchema),
    total: Type.Number({ minimum: 0 }),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

export const DropdownQuerySchema = Type.Object({
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 50 })),
  active: Type.Optional(Type.Boolean()),
  exclude: Type.Optional(
    Type.Array(Type.Union([Type.String(), Type.Number()])),
  ),
  include_disabled: Type.Optional(Type.Boolean()),
});

// Bulk Operations Schemas
export const BulkCreateSchema = <T extends import('@sinclair/typebox').TSchema>(
  itemSchema: T,
) =>
  Type.Object({
    items: Type.Array(itemSchema, { minItems: 1, maxItems: 1000 }),
    options: Type.Optional(
      Type.Object({
        skipDuplicates: Type.Optional(Type.Boolean()),
        continueOnError: Type.Optional(Type.Boolean()),
      }),
    ),
  });

export const BulkUpdateSchema = <T extends import('@sinclair/typebox').TSchema>(
  itemSchema: T,
) =>
  Type.Object({
    items: Type.Array(
      Type.Object({
        id: Type.Union([Type.String(), Type.Number()]),
        data: itemSchema,
      }),
      { minItems: 1, maxItems: 1000 },
    ),
    options: Type.Optional(
      Type.Object({
        continueOnError: Type.Optional(Type.Boolean()),
      }),
    ),
  });

export const BulkDeleteSchema = Type.Object({
  ids: Type.Array(Type.Union([Type.String(), Type.Number()]), {
    minItems: 1,
    maxItems: 1000,
  }),
  options: Type.Optional(
    Type.Object({
      force: Type.Optional(Type.Boolean()),
      continueOnError: Type.Optional(Type.Boolean()),
    }),
  ),
});

export const BulkStatusSchema = Type.Object({
  ids: Type.Array(Type.Union([Type.String(), Type.Number()]), {
    minItems: 1,
    maxItems: 1000,
  }),
  status: Type.Union([Type.Boolean(), Type.String()]),
  options: Type.Optional(
    Type.Object({
      continueOnError: Type.Optional(Type.Boolean()),
    }),
  ),
});

export const BulkResponseSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  itemSchema: T,
) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Object({
      created: Type.Optional(Type.Array(itemSchema)),
      updated: Type.Optional(Type.Array(itemSchema)),
      deleted: Type.Optional(
        Type.Array(Type.Union([Type.String(), Type.Number()])),
      ),
      summary: Type.Object({
        successful: Type.Number({ minimum: 0 }),
        failed: Type.Number({ minimum: 0 }),
        errors: Type.Array(
          Type.Object({
            item: Type.Object({}, { additionalProperties: true }), // Allow any properties in original data
            error: Type.String(),
          }),
        ),
      }),
    }),
    message: Type.Optional(Type.String()),
    meta: Type.Optional(ApiMetaSchema),
  });

// Status Management Schemas
export const StatusToggleSchema = Type.Object({
  force: Type.Optional(Type.Boolean()),
});

export const StatusUpdateResponseSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  entitySchema: T,
) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Object({
      entity: entitySchema,
      previousStatus: Type.Union([Type.Boolean(), Type.String()]),
      newStatus: Type.Union([Type.Boolean(), Type.String()]),
    }),
    message: Type.String(),
    meta: Type.Optional(ApiMetaSchema),
  });

// Statistics Schemas
export const StatisticsSchema = Type.Object({
  total: Type.Number({ minimum: 0 }),
  active: Type.Optional(Type.Number({ minimum: 0 })),
  inactive: Type.Optional(Type.Number({ minimum: 0 })),
  percentages: Type.Optional(
    Type.Object({
      active: Type.Number({ minimum: 0, maximum: 100 }),
      inactive: Type.Number({ minimum: 0, maximum: 100 }),
    }),
  ),
  growth: Type.Optional(
    Type.Object({
      daily: Type.Number(),
      weekly: Type.Number(),
      monthly: Type.Number(),
    }),
  ),
  // Smart statistics fields
  recentlyCreated: Type.Optional(Type.Number({ minimum: 0 })),
  recentlyUpdated: Type.Optional(Type.Number({ minimum: 0 })),
  custom: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export const StatisticsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: StatisticsSchema,
  meta: Type.Optional(ApiMetaSchema),
});

// Advanced Search & Filter Schemas
export const AdvancedSearchSchema = Type.Object({
  query: Type.Optional(Type.String({ minLength: 1 })),
  filters: Type.Optional(Type.Record(Type.String(), Type.Any())),
  dateRange: Type.Optional(
    Type.Object({
      field: Type.String(),
      from: Type.Optional(Type.String({ format: 'date-time' })),
      to: Type.Optional(Type.String({ format: 'date-time' })),
    }),
  ),
  sorting: Type.Optional(
    Type.Array(
      Type.Object({
        field: Type.String(),
        direction: Type.Union([Type.Literal('asc'), Type.Literal('desc')]),
      }),
    ),
  ),
  pagination: Type.Optional(PaginationQuerySchema),
});

// Validation Schemas
export const ValidationRequestSchema = <
  T extends import('@sinclair/typebox').TSchema,
>(
  itemSchema: T,
) =>
  Type.Object({
    data: itemSchema,
    options: Type.Optional(
      Type.Object({
        skipBusinessRules: Type.Optional(Type.Boolean()),
        context: Type.Optional(Type.Record(Type.String(), Type.Any())),
      }),
    ),
  });

export const ValidationResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Object({
    valid: Type.Boolean(),
    errors: Type.Array(
      Type.Object({
        field: Type.String(),
        message: Type.String(),
        code: Type.String(),
        severity: Type.Union([
          Type.Literal('error'),
          Type.Literal('warning'),
          Type.Literal('info'),
        ]),
      }),
    ),
    warnings: Type.Optional(
      Type.Array(
        Type.Object({
          field: Type.String(),
          message: Type.String(),
        }),
      ),
    ),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// Field Uniqueness Check Schema
// Uniqueness Check Schemas
export const UniquenessParamSchema = Type.Object({
  field: Type.String({
    description: 'Field name to check for uniqueness',
  }),
});

export const UniquenessQuerySchema = Type.Object({
  value: Type.Union([Type.String(), Type.Number()], {
    description: 'Value to check for uniqueness',
  }),
  excludeId: Type.Optional(
    Type.Union([Type.String(), Type.Number()], {
      description: 'ID to exclude from uniqueness check (for updates)',
    }),
  ),
});

export const UniquenessCheckSchema = Type.Object({
  field: Type.String(),
  value: Type.Union([Type.String(), Type.Number()]),
  excludeId: Type.Optional(Type.Union([Type.String(), Type.Number()])),
});

export const UniquenessResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Object({
    unique: Type.Boolean(),
    exists: Type.Optional(Type.Any()),
  }),
  meta: Type.Optional(ApiMetaSchema),
});

// TypeScript types
export type ApiMeta = Static<typeof ApiMetaSchema>;
export type PaginationMeta = Static<typeof PaginationMetaSchema>;
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
  meta?: ApiMeta;
};
export type ApiErrorResponse = Static<typeof ApiErrorResponseSchema>;
export type ValidationErrorResponse = Static<
  typeof ValidationErrorResponseSchema
>;
export type PaginationQuery = Static<typeof PaginationQuerySchema>;
export type SearchQuery = Static<typeof SearchQuerySchema>;
export type UuidParam = Static<typeof UuidParamSchema>;
export type NumericIdParam = Static<typeof NumericIdParamSchema>;

// Enhanced CRUD Types
export type DropdownOption = Static<typeof DropdownOptionSchema>;
export type DropdownResponse = Static<typeof DropdownResponseSchema>;
export type DropdownQuery = Static<typeof DropdownQuerySchema>;
export type BulkDelete = Static<typeof BulkDeleteSchema>;
export type BulkStatus = Static<typeof BulkStatusSchema>;
export type StatusToggle = Static<typeof StatusToggleSchema>;
export type Statistics = Static<typeof StatisticsSchema>;
export type AdvancedSearch = Static<typeof AdvancedSearchSchema>;
export type UniquenessCheck = Static<typeof UniquenessCheckSchema>;
