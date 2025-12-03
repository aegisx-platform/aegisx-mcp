import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../schemas/base.schemas';

// Base TestProducts Schema
export const TestProductsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  code: Type.String(),
  name: Type.String(),
  slug: Type.String(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  display_order: Type.Optional(Type.Integer()),
  item_count: Type.Optional(Type.Integer()),
  discount_rate: Type.Optional(Type.Number()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
  status: Type.Optional(Type.String()),
  created_by: Type.Optional(Type.String({ format: 'uuid' })),
  updated_by: Type.Optional(Type.String({ format: 'uuid' })),
  deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateTestProductsSchema = Type.Object({
  code: Type.String(),
  name: Type.String(),
  slug: Type.String(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  display_order: Type.Optional(Type.Integer()),
  item_count: Type.Optional(Type.Integer()),
  discount_rate: Type.Optional(Type.Number()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
  status: Type.Optional(Type.String()),
  deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
  // created_by is auto-filled from JWT token
  created_by: Type.Optional(
    Type.String({
      format: 'uuid',
      description: 'User who created this record (auto-filled from JWT)',
    }),
  ),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateTestProductsSchema = Type.Partial(
  Type.Object({
    code: Type.String(),
    name: Type.String(),
    slug: Type.String(),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
    is_featured: Type.Optional(Type.Boolean()),
    display_order: Type.Optional(Type.Integer()),
    item_count: Type.Optional(Type.Integer()),
    discount_rate: Type.Optional(Type.Number()),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
    settings: Type.Optional(Type.Record(Type.String(), Type.Any())),
    status: Type.Optional(Type.String()),
    deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
    // updated_by is auto-filled from JWT token
    updated_by: Type.String({
      format: 'uuid',
      description: 'User who updated this record (auto-filled from JWT)',
    }),
  }),
);

// ID Parameter Schema
export const TestProductsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetTestProductsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListTestProductsQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  // Modern multiple sort support
  sort: Type.Optional(
    Type.String({
      pattern:
        '^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?(,[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?)*$',
      description:
        'Multiple sort: field1:desc,field2:asc,field3:desc. Example: id:asc,created_at:desc',
      examples: ['id:asc', 'created_at:desc', 'code:asc,created_at:desc'],
    }),
  ),

  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),

  // 🛡️ Secure field selection with validation
  fields: Type.Optional(
    Type.Array(
      Type.String({
        pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', // Only alphanumeric + underscore
        minLength: 1,
        maxLength: 50,
      }),
      {
        minItems: 1,
        maxItems: 20, // Prevent excessive field requests
        description:
          'Specific fields to return. Example: ["id", "code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  slug: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  display_order: Type.Optional(Type.Number({ minimum: 0 })),
  display_order_min: Type.Optional(Type.Number({ minimum: 0 })),
  display_order_max: Type.Optional(Type.Number({ minimum: 0 })),
  item_count: Type.Optional(Type.Number({})),
  item_count_min: Type.Optional(Type.Number({})),
  item_count_max: Type.Optional(Type.Number({})),
  discount_rate: Type.Optional(Type.Number({})),
  discount_rate_min: Type.Optional(Type.Number({})),
  discount_rate_max: Type.Optional(Type.Number({})),
  status: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  updated_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

// Response Schemas using base wrappers
export const TestProductsResponseSchema =
  ApiSuccessResponseSchema(TestProductsSchema);
export const TestProductsListResponseSchema =
  PaginatedResponseSchema(TestProductsSchema);

// Partial Schemas for field selection support
export const PartialTestProductsSchema = Type.Partial(TestProductsSchema);
export const FlexibleTestProductsListResponseSchema =
  PartialPaginatedResponseSchema(TestProductsSchema);

// Export types
export type TestProducts = Static<typeof TestProductsSchema>;
export type CreateTestProducts = Static<typeof CreateTestProductsSchema>;
export type UpdateTestProducts = Static<typeof UpdateTestProductsSchema>;
export type TestProductsIdParam = Static<typeof TestProductsIdParamSchema>;
export type GetTestProductsQuery = Static<typeof GetTestProductsQuerySchema>;
export type ListTestProductsQuery = Static<typeof ListTestProductsQuerySchema>;

// Partial types for field selection
export type PartialTestProducts = Static<typeof PartialTestProductsSchema>;
export type FlexibleTestProductsList = Static<
  typeof FlexibleTestProductsListResponseSchema
>;

// WebSocket Event Schemas
export const TestProductsCreatedEventSchema = Type.Object({
  type: Type.Literal('testProducts.created'),
  data: TestProductsSchema,
});

export const TestProductsUpdatedEventSchema = Type.Object({
  type: Type.Literal('testProducts.updated'),
  data: TestProductsSchema,
});

export const TestProductsDeletedEventSchema = Type.Object({
  type: Type.Literal('testProducts.deleted'),
  data: Type.Object({
    id: Type.Union([Type.String(), Type.Number()]),
  }),
});

export type TestProductsCreatedEvent = Static<
  typeof TestProductsCreatedEventSchema
>;
export type TestProductsUpdatedEvent = Static<
  typeof TestProductsUpdatedEventSchema
>;
export type TestProductsDeletedEvent = Static<
  typeof TestProductsDeletedEventSchema
>;

// ===== IMPORT SCHEMAS =====

// Execute Import Request Schema
export const ExecuteImportRequestSchema = Type.Object({
  sessionId: Type.String({
    format: 'uuid',
    description: 'Session ID from validate response',
  }),
  options: Type.Optional(
    Type.Object({
      skipErrors: Type.Optional(
        Type.Boolean({
          description: 'Skip rows with errors and import only valid rows',
        }),
      ),
      updateExisting: Type.Optional(
        Type.Boolean({ description: 'Update existing records if found' }),
      ),
    }),
  ),
});

// Validate Import API Response Schema
export const ValidateImportApiResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    sessionId: Type.String({ format: 'uuid' }),
    summary: Type.Object({
      totalRows: Type.Number(),
      validRows: Type.Number(),
      invalidRows: Type.Number(),
      warnings: Type.Number(),
    }),
    errors: Type.Array(
      Type.Object({
        row: Type.Number(),
        field: Type.Optional(Type.String()),
        message: Type.String(),
        value: Type.Optional(Type.Any()),
      }),
    ),
    warnings: Type.Array(
      Type.Object({
        row: Type.Number(),
        field: Type.Optional(Type.String()),
        message: Type.String(),
        value: Type.Optional(Type.Any()),
      }),
    ),
    preview: Type.Array(Type.Any()),
  }),
);

// Execute Import API Response Schema
export const ExecuteImportApiResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    status: Type.String({ enum: ['processing', 'completed', 'failed'] }),
    message: Type.String(),
  }),
);

// Import Status API Response Schema
export const ImportStatusApiResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    jobId: Type.String({ format: 'uuid' }),
    status: Type.String({
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    }),
    progress: Type.Number({ description: 'Progress percentage (0-100)' }),
    totalRecords: Type.Number(),
    processedRecords: Type.Number(),
    successCount: Type.Number(),
    failedCount: Type.Number(),
    startedAt: Type.String({ format: 'date-time' }),
    completedAt: Type.Optional(Type.String({ format: 'date-time' })),
    error: Type.Optional(Type.String()),
  }),
);

// Export Import Types
export type ExecuteImportRequest = Static<typeof ExecuteImportRequestSchema>;
export type ValidateImportApiResponse = Static<
  typeof ValidateImportApiResponseSchema
>;
export type ExecuteImportApiResponse = Static<
  typeof ExecuteImportApiResponseSchema
>;
export type ImportStatusApiResponse = Static<
  typeof ImportStatusApiResponseSchema
>;
