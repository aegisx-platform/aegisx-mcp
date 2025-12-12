import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base BudgetRequests Schema
export const BudgetRequestsSchema = Type.Object({
  id: Type.Number(),
  request_number: Type.String(),
  fiscal_year: Type.Integer(),
  department_id: Type.Integer(),
  status: Type.Any(),
  total_requested_amount: Type.Number(),
  justification: Type.Optional(Type.String()),
  submitted_by: Type.Optional(Type.String({ format: 'uuid' })),
  submitted_at: Type.Optional(Type.String({ format: 'date-time' })),
  dept_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
  dept_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
  dept_comments: Type.Optional(Type.String()),
  finance_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
  finance_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
  finance_comments: Type.Optional(Type.String()),
  rejection_reason: Type.Optional(Type.String()),
  reopened_by: Type.Optional(Type.String({ format: 'uuid' })),
  reopened_at: Type.Optional(Type.String({ format: 'date-time' })),
  created_by: Type.String({ format: 'uuid' }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
});

// Create Schema (without auto-generated fields)
// Note: request_number, status, total_requested_amount, department_id are auto-filled by service
export const CreateBudgetRequestsSchema = Type.Object({
  request_number: Type.Optional(Type.String()),
  fiscal_year: Type.Integer(),
  department_id: Type.Optional(Type.Integer()),
  status: Type.Optional(Type.Any()),
  total_requested_amount: Type.Optional(Type.Number()),
  justification: Type.Optional(Type.String()),
  submitted_by: Type.Optional(Type.String({ format: 'uuid' })),
  submitted_at: Type.Optional(Type.String({ format: 'date-time' })),
  dept_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
  dept_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
  dept_comments: Type.Optional(Type.String()),
  finance_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
  finance_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
  finance_comments: Type.Optional(Type.String()),
  rejection_reason: Type.Optional(Type.String()),
  deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
  // created_by is auto-filled from JWT token
  created_by: Type.Optional(
    Type.String({
      format: 'uuid',
      description: 'User who created this record (auto-filled from JWT)',
    }),
  ),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBudgetRequestsSchema = Type.Partial(
  Type.Object({
    request_number: Type.String(),
    fiscal_year: Type.Integer(),
    department_id: Type.Integer(),
    status: Type.Any(),
    total_requested_amount: Type.Number(),
    justification: Type.Optional(Type.String()),
    submitted_by: Type.Optional(Type.String({ format: 'uuid' })),
    submitted_at: Type.Optional(Type.String({ format: 'date-time' })),
    dept_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
    dept_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
    dept_comments: Type.Optional(Type.String()),
    finance_reviewed_by: Type.Optional(Type.String({ format: 'uuid' })),
    finance_reviewed_at: Type.Optional(Type.String({ format: 'date-time' })),
    finance_comments: Type.Optional(Type.String()),
    rejection_reason: Type.Optional(Type.String()),
    reopened_by: Type.Optional(Type.String({ format: 'uuid' })),
    reopened_at: Type.Optional(Type.String({ format: 'date-time' })),
    deleted_at: Type.Optional(Type.String({ format: 'date-time' })),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const BudgetRequestsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetBudgetRequestsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListBudgetRequestsQuerySchema = Type.Object({
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
        'request_number:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "request_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  request_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  fiscal_year: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year_min: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year_max: Type.Optional(Type.Number({ minimum: 0 })),
  department_id: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_requested_amount: Type.Optional(Type.Number({})),
  total_requested_amount_min: Type.Optional(Type.Number({})),
  total_requested_amount_max: Type.Optional(Type.Number({})),
  justification: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  submitted_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  dept_reviewed_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  dept_comments: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  finance_reviewed_by: Type.Optional(
    Type.String({ minLength: 1, maxLength: 50 }),
  ),
  finance_comments: Type.Optional(
    Type.String({ minLength: 1, maxLength: 100 }),
  ),
  rejection_reason: Type.Optional(
    Type.String({ minLength: 1, maxLength: 255 }),
  ),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const BudgetRequestsResponseSchema =
  ApiSuccessResponseSchema(BudgetRequestsSchema);
export const BudgetRequestsListResponseSchema =
  PaginatedResponseSchema(BudgetRequestsSchema);

// Partial Schemas for field selection support
export const PartialBudgetRequestsSchema = Type.Partial(BudgetRequestsSchema);
export const FlexibleBudgetRequestsListResponseSchema =
  PartialPaginatedResponseSchema(BudgetRequestsSchema);

// Response Schemas for Validation Endpoint
export const ValidationMessageSchema = Type.Object({
  field: Type.Optional(Type.String()),
  message: Type.String(),
  code: Type.Optional(Type.String()),
});

export const BudgetRequestValidationResultSchema = Type.Object({
  valid: Type.Boolean(),
  errors: Type.Array(ValidationMessageSchema),
  warnings: Type.Array(ValidationMessageSchema),
  info: Type.Array(Type.String()),
});

// Schemas for Dashboard Endpoints
export const GetBudgetRequestsStatsQuerySchema = Type.Object({
  fiscal_year: Type.Optional(Type.Number()),
  department_id: Type.Optional(Type.Number()),
});

export const BudgetRequestsStatsSchema = Type.Object({
  total: Type.Number(),
  by_status: Type.Object({
    DRAFT: Type.Number(),
    SUBMITTED: Type.Number(),
    DEPT_APPROVED: Type.Number(),
    FINANCE_APPROVED: Type.Number(),
    REJECTED: Type.Number(),
  }),
});

export const MyPendingActionsResponseSchema = Type.Object({
  pending: Type.Array(BudgetRequestsSchema),
  count: Type.Number(),
});

export const RecentBudgetRequestsQuerySchema = Type.Object({
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 })),
});

export const RecentBudgetRequestsResponseSchema = Type.Object({
  requests: Type.Array(BudgetRequestsSchema),
  count: Type.Number(),
});

// ===== BUDGET INTEGRATION ENDPOINTS SCHEMAS =====

// Endpoint 1: Check Drugs in Plan
export const CheckDrugsInPlanBodySchema = Type.Object({
  drug_ids: Type.Array(Type.String(), {
    minItems: 1,
    maxItems: 500,
    description: 'Array of drug IDs to check',
  }),
});

export const DrugsNotInPlanItemSchema = Type.Object({
  drug_id: Type.String(),
  drug_name: Type.String(),
  generic_name: Type.String(),
});

export const CheckDrugsInPlanResponseSchema = Type.Object({
  total_drugs: Type.Number(),
  in_plan: Type.Number(),
  not_in_plan: Type.Number(),
  drugs_not_in_plan: Type.Array(DrugsNotInPlanItemSchema),
});

// Endpoint 2: Check Budget Availability
export const CheckBudgetAvailabilityResponseSchema = Type.Object({
  budget_type_id: Type.String(),
  budget_type_name: Type.String(),
  allocated: Type.Number(),
  used: Type.Number(),
  reserved: Type.Number(),
  available: Type.Number(),
  request_amount: Type.Number(),
  remaining_after: Type.Number(),
  percentage_used: Type.Number(),
  is_available: Type.Boolean(),
  warnings: Type.Array(Type.String()),
});

// Export types
export type BudgetRequests = Static<typeof BudgetRequestsSchema>;
export type CreateBudgetRequests = Static<typeof CreateBudgetRequestsSchema>;
export type UpdateBudgetRequests = Static<typeof UpdateBudgetRequestsSchema>;
export type BudgetRequestsIdParam = Static<typeof BudgetRequestsIdParamSchema>;
export type GetBudgetRequestsQuery = Static<
  typeof GetBudgetRequestsQuerySchema
>;
export type ListBudgetRequestsQuery = Static<
  typeof ListBudgetRequestsQuerySchema
>;

// Partial types for field selection
export type PartialBudgetRequests = Static<typeof PartialBudgetRequestsSchema>;
export type FlexibleBudgetRequestsList = Static<
  typeof FlexibleBudgetRequestsListResponseSchema
>;
