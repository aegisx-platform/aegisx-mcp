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

// Success Message Schema (for simple operations like delete)
export const SuccessMessageSchema = Type.Object({
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
  id: Type.String({ format: 'uuid', description: 'Unique identifier' })
});

export const TimestampSchema = Type.Object({
  created_at: Type.String({ format: 'date-time', description: 'Creation timestamp' }),
  updated_at: Type.String({ format: 'date-time', description: 'Last update timestamp' })
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
