import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base PurchaseRequests Schema
export const PurchaseRequestsSchema = Type.Object({
  id: Type.Number(),
  pr_number: Type.String(),
  department_id: Type.Integer(),
  budget_id: Type.Integer(),
  fiscal_year: Type.Integer(),
  request_date: Type.Optional(Type.String({ format: 'date' })),
  required_date: Type.String({ format: 'date' }),
  requested_by: Type.String({ format: 'uuid' }),
  total_amount: Type.Number(),
  status: Type.Optional(Type.Any()),
  priority: Type.Optional(Type.Any()),
  purpose: Type.Optional(Type.String()),
  approved_by: Type.Optional(Type.String({ format: 'uuid' })),
  approved_at: Type.Optional(Type.String({ format: 'date-time' })),
  rejected_by: Type.Optional(Type.String({ format: 'uuid' })),
  rejected_at: Type.Optional(Type.String({ format: 'date-time' })),
  rejection_reason: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreatePurchaseRequestsSchema = Type.Object({
  pr_number: Type.String(),
  department_id: Type.Integer(),
  budget_id: Type.Integer(),
  fiscal_year: Type.Integer(),
  request_date: Type.Optional(Type.String({ format: 'date' })),
  required_date: Type.String({ format: 'date' }),
  requested_by: Type.String({ format: 'uuid' }),
  total_amount: Type.Number(),
  status: Type.Optional(Type.Any()),
  priority: Type.Optional(Type.Any()),
  purpose: Type.Optional(Type.String()),
  approved_by: Type.Optional(Type.String({ format: 'uuid' })),
  approved_at: Type.Optional(Type.String({ format: 'date-time' })),
  rejected_by: Type.Optional(Type.String({ format: 'uuid' })),
  rejected_at: Type.Optional(Type.String({ format: 'date-time' })),
  rejection_reason: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdatePurchaseRequestsSchema = Type.Partial(
  Type.Object({
    pr_number: Type.String(),
    department_id: Type.Integer(),
    budget_id: Type.Integer(),
    fiscal_year: Type.Integer(),
    request_date: Type.Optional(Type.String({ format: 'date' })),
    required_date: Type.String({ format: 'date' }),
    requested_by: Type.String({ format: 'uuid' }),
    total_amount: Type.Number(),
    status: Type.Optional(Type.Any()),
    priority: Type.Optional(Type.Any()),
    purpose: Type.Optional(Type.String()),
    approved_by: Type.Optional(Type.String({ format: 'uuid' })),
    approved_at: Type.Optional(Type.String({ format: 'date-time' })),
    rejected_by: Type.Optional(Type.String({ format: 'uuid' })),
    rejected_at: Type.Optional(Type.String({ format: 'date-time' })),
    rejection_reason: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const PurchaseRequestsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetPurchaseRequestsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListPurchaseRequestsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'pr_number:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "pr_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  pr_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  department_id: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  department_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  budget_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year_min: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year_max: Type.Optional(Type.Number({ minimum: 0 })),
  requested_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  total_amount: Type.Optional(Type.Number({})),
  total_amount_min: Type.Optional(Type.Number({})),
  total_amount_max: Type.Optional(Type.Number({})),
  purpose: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  approved_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  rejected_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  rejection_reason: Type.Optional(
    Type.String({ minLength: 1, maxLength: 255 }),
  ),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const PurchaseRequestsResponseSchema = ApiSuccessResponseSchema(
  PurchaseRequestsSchema,
);
export const PurchaseRequestsListResponseSchema = PaginatedResponseSchema(
  PurchaseRequestsSchema,
);

// Partial Schemas for field selection support
export const PartialPurchaseRequestsSchema = Type.Partial(
  PurchaseRequestsSchema,
);
export const FlexiblePurchaseRequestsListResponseSchema =
  PartialPaginatedResponseSchema(PurchaseRequestsSchema);

// Export types
export type PurchaseRequests = Static<typeof PurchaseRequestsSchema>;
export type CreatePurchaseRequests = Static<
  typeof CreatePurchaseRequestsSchema
>;
export type UpdatePurchaseRequests = Static<
  typeof UpdatePurchaseRequestsSchema
>;
export type PurchaseRequestsIdParam = Static<
  typeof PurchaseRequestsIdParamSchema
>;
export type GetPurchaseRequestsQuery = Static<
  typeof GetPurchaseRequestsQuerySchema
>;
export type ListPurchaseRequestsQuery = Static<
  typeof ListPurchaseRequestsQuerySchema
>;

// Partial types for field selection
export type PartialPurchaseRequests = Static<
  typeof PartialPurchaseRequestsSchema
>;
export type FlexiblePurchaseRequestsList = Static<
  typeof FlexiblePurchaseRequestsListResponseSchema
>;
