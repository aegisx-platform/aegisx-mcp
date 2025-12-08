import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base BudgetRequestComments Schema
export const BudgetRequestCommentsSchema = Type.Object({
  id: Type.Number(),
  budget_request_id: Type.Number(),
  parent_id: Type.Optional(Type.Number()),
  comment: Type.String(),
  created_by: Type.String({ format: 'uuid' }),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateBudgetRequestCommentsSchema = Type.Object({
  budget_request_id: Type.Number(),
  parent_id: Type.Optional(Type.Number()),
  comment: Type.String(),
  // created_by is auto-filled from JWT token
  created_by: Type.Optional(
    Type.String({
      format: 'uuid',
      description: 'User who created this record (auto-filled from JWT)',
    }),
  ),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBudgetRequestCommentsSchema = Type.Partial(
  Type.Object({
    budget_request_id: Type.Number(),
    parent_id: Type.Optional(Type.Number()),
    comment: Type.String(),
  }),
);

// ID Parameter Schema
export const BudgetRequestCommentsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetBudgetRequestCommentsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListBudgetRequestCommentsQuerySchema = Type.Object({
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
        'budget_request_id:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "budget_request_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  budget_request_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_request_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_request_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  comment: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

// Response Schemas using base wrappers
export const BudgetRequestCommentsResponseSchema = ApiSuccessResponseSchema(
  BudgetRequestCommentsSchema,
);
export const BudgetRequestCommentsListResponseSchema = PaginatedResponseSchema(
  BudgetRequestCommentsSchema,
);

// Partial Schemas for field selection support
export const PartialBudgetRequestCommentsSchema = Type.Partial(
  BudgetRequestCommentsSchema,
);
export const FlexibleBudgetRequestCommentsListResponseSchema =
  PartialPaginatedResponseSchema(BudgetRequestCommentsSchema);

// Export types
export type BudgetRequestComments = Static<typeof BudgetRequestCommentsSchema>;
export type CreateBudgetRequestComments = Static<
  typeof CreateBudgetRequestCommentsSchema
>;
export type UpdateBudgetRequestComments = Static<
  typeof UpdateBudgetRequestCommentsSchema
>;
export type BudgetRequestCommentsIdParam = Static<
  typeof BudgetRequestCommentsIdParamSchema
>;
export type GetBudgetRequestCommentsQuery = Static<
  typeof GetBudgetRequestCommentsQuerySchema
>;
export type ListBudgetRequestCommentsQuery = Static<
  typeof ListBudgetRequestCommentsQuerySchema
>;

// Partial types for field selection
export type PartialBudgetRequestComments = Static<
  typeof PartialBudgetRequestCommentsSchema
>;
export type FlexibleBudgetRequestCommentsList = Static<
  typeof FlexibleBudgetRequestCommentsListResponseSchema
>;
