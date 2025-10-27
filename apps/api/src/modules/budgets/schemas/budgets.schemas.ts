import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
  DropdownOptionSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  StatusToggleSchema,
  StatisticsSchema,
} from '../../../schemas/base.schemas';

// Base Budgets Schema
export const BudgetsSchema = Type.Object({
  id: Type.Number(),
  budget_code: Type.String(),
  budget_type: Type.String(),
  budget_category: Type.String(),
  budget_description: Type.Optional(Type.String()),
  is_active: Type.Boolean(),
  created_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateBudgetsSchema = Type.Object({
  budget_code: Type.String(),
  budget_type: Type.String(),
  budget_category: Type.String(),
  budget_description: Type.Optional(Type.String()),
  is_active: Type.Boolean(),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBudgetsSchema = Type.Partial(
  Type.Object({
    budget_code: Type.String(),
    budget_type: Type.String(),
    budget_category: Type.String(),
    budget_description: Type.Optional(Type.String()),
    is_active: Type.Boolean(),
  }),
);

// ID Parameter Schema
export const BudgetsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetBudgetsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListBudgetsQuerySchema = Type.Object({
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
      examples: [
        'id:asc',
        'created_at:desc',
        'budget_code:asc,created_at:desc',
      ],
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
          'Specific fields to return. Example: ["id", "budget_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  budget_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  budget_type: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  budget_category: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  budget_description: Type.Optional(
    Type.String({ minLength: 1, maxLength: 100 }),
  ),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const BudgetsResponseSchema = ApiSuccessResponseSchema(BudgetsSchema);
export const BudgetsListResponseSchema = PaginatedResponseSchema(BudgetsSchema);

// Partial Schemas for field selection support
export const PartialBudgetsSchema = Type.Partial(BudgetsSchema);
export const FlexibleBudgetsListResponseSchema =
  PartialPaginatedResponseSchema(BudgetsSchema);

// Export types
export type Budgets = Static<typeof BudgetsSchema>;
export type CreateBudgets = Static<typeof CreateBudgetsSchema>;
export type UpdateBudgets = Static<typeof UpdateBudgetsSchema>;
export type BudgetsIdParam = Static<typeof BudgetsIdParamSchema>;
export type GetBudgetsQuery = Static<typeof GetBudgetsQuerySchema>;
export type ListBudgetsQuery = Static<typeof ListBudgetsQuerySchema>;

// Partial types for field selection
export type PartialBudgets = Static<typeof PartialBudgetsSchema>;
export type FlexibleBudgetsList = Static<
  typeof FlexibleBudgetsListResponseSchema
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
