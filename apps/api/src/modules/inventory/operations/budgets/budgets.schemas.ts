import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Budgets Schema
export const BudgetsSchema = Type.Object({
  id: Type.Integer(),
  budget_type_id: Type.Integer(),
  budget_category_id: Type.Integer(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateBudgetsSchema = Type.Object({
  budget_type_id: Type.Integer(),
  budget_category_id: Type.Integer(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBudgetsSchema = Type.Partial(
  Type.Object({
    budget_type_id: Type.Integer(),
    budget_category_id: Type.Integer(),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
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
        'budget_type_id:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "budget_type_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  budget_type_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_type_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_type_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
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
