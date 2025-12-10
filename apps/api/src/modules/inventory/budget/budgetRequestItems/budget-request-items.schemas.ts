import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base BudgetRequestItems Schema
export const BudgetRequestItemsSchema = Type.Object({
  id: Type.Number(),
  budget_request_id: Type.Number(),
  budget_id: Type.Integer(),
  requested_amount: Type.Optional(Type.Number()),
  q1_qty: Type.Number(),
  q2_qty: Type.Number(),
  q3_qty: Type.Number(),
  q4_qty: Type.Number(),
  item_justification: Type.Optional(Type.String()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  drug_id: Type.Optional(Type.Integer()),
  generic_id: Type.Optional(Type.Integer()),
  generic_code: Type.Optional(Type.String()),
  generic_name: Type.Optional(Type.String()),
  package_size: Type.Optional(Type.String()),
  unit: Type.Optional(Type.String()),
  line_number: Type.Optional(Type.Integer()),
  avg_usage: Type.Optional(Type.Number()),
  estimated_usage_2569: Type.Optional(Type.Number()),
  current_stock: Type.Optional(Type.Number()),
  estimated_purchase: Type.Optional(Type.Number()),
  unit_price: Type.Optional(Type.Number()),
  requested_qty: Type.Optional(Type.Number()),
  budget_type_id: Type.Optional(Type.Integer()),
  budget_category_id: Type.Optional(Type.Integer()),
  historical_usage: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

// Create Schema (without auto-generated fields)
export const CreateBudgetRequestItemsSchema = Type.Object({
  budget_request_id: Type.Number(),
  budget_id: Type.Integer(),
  requested_amount: Type.Optional(Type.Number()),
  q1_qty: Type.Number(),
  q2_qty: Type.Number(),
  q3_qty: Type.Number(),
  q4_qty: Type.Number(),
  item_justification: Type.Optional(Type.String()),
  drug_id: Type.Optional(Type.Integer()),
  generic_id: Type.Optional(Type.Integer()),
  generic_code: Type.Optional(Type.String()),
  generic_name: Type.Optional(Type.String()),
  package_size: Type.Optional(Type.String()),
  unit: Type.Optional(Type.String()),
  line_number: Type.Optional(Type.Integer()),
  avg_usage: Type.Optional(Type.Number()),
  estimated_usage_2569: Type.Optional(Type.Number()),
  current_stock: Type.Optional(Type.Number()),
  estimated_purchase: Type.Optional(Type.Number()),
  unit_price: Type.Optional(Type.Number()),
  requested_qty: Type.Optional(Type.Number()),
  budget_type_id: Type.Optional(Type.Integer()),
  budget_category_id: Type.Optional(Type.Integer()),
  historical_usage: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBudgetRequestItemsSchema = Type.Partial(
  Type.Object({
    budget_request_id: Type.Number(),
    budget_id: Type.Integer(),
    requested_amount: Type.Optional(Type.Number()),
    q1_qty: Type.Number(),
    q2_qty: Type.Number(),
    q3_qty: Type.Number(),
    q4_qty: Type.Number(),
    item_justification: Type.Optional(Type.String()),
    drug_id: Type.Optional(Type.Integer()),
    generic_id: Type.Optional(Type.Integer()),
    generic_code: Type.Optional(Type.String()),
    generic_name: Type.Optional(Type.String()),
    package_size: Type.Optional(Type.String()),
    unit: Type.Optional(Type.String()),
    line_number: Type.Optional(Type.Integer()),
    avg_usage: Type.Optional(Type.Number()),
    estimated_usage_2569: Type.Optional(Type.Number()),
    current_stock: Type.Optional(Type.Number()),
    estimated_purchase: Type.Optional(Type.Number()),
    unit_price: Type.Optional(Type.Number()),
    requested_qty: Type.Optional(Type.Number()),
    budget_type_id: Type.Optional(Type.Integer()),
    budget_category_id: Type.Optional(Type.Integer()),
    historical_usage: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }),
);

// ID Parameter Schema
export const BudgetRequestItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetBudgetRequestItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListBudgetRequestItemsQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 5000, default: 20 })),
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
  budget_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  requested_amount: Type.Optional(Type.Number({})),
  requested_amount_min: Type.Optional(Type.Number({})),
  requested_amount_max: Type.Optional(Type.Number({})),
  q1_qty: Type.Optional(Type.Number({ minimum: 0 })),
  q1_qty_min: Type.Optional(Type.Number({ minimum: 0 })),
  q1_qty_max: Type.Optional(Type.Number({ minimum: 0 })),
  q2_qty: Type.Optional(Type.Number({ minimum: 0 })),
  q2_qty_min: Type.Optional(Type.Number({ minimum: 0 })),
  q2_qty_max: Type.Optional(Type.Number({ minimum: 0 })),
  q3_qty: Type.Optional(Type.Number({ minimum: 0 })),
  q3_qty_min: Type.Optional(Type.Number({ minimum: 0 })),
  q3_qty_max: Type.Optional(Type.Number({ minimum: 0 })),
  q4_qty: Type.Optional(Type.Number({ minimum: 0 })),
  q4_qty_min: Type.Optional(Type.Number({ minimum: 0 })),
  q4_qty_max: Type.Optional(Type.Number({ minimum: 0 })),
  item_justification: Type.Optional(
    Type.String({ minLength: 1, maxLength: 255 }),
  ),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  generic_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  generic_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  package_size: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  line_number: Type.Optional(Type.Number({ minimum: 0 })),
  line_number_min: Type.Optional(Type.Number({ minimum: 0 })),
  line_number_max: Type.Optional(Type.Number({ minimum: 0 })),
  avg_usage: Type.Optional(Type.Number({ minimum: 0 })),
  avg_usage_min: Type.Optional(Type.Number({ minimum: 0 })),
  avg_usage_max: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_usage_2569: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_usage_2569_min: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_usage_2569_max: Type.Optional(Type.Number({ minimum: 0 })),
  current_stock: Type.Optional(Type.Number({ minimum: 0 })),
  current_stock_min: Type.Optional(Type.Number({ minimum: 0 })),
  current_stock_max: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_purchase: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_purchase_min: Type.Optional(Type.Number({ minimum: 0 })),
  estimated_purchase_max: Type.Optional(Type.Number({ minimum: 0 })),
  unit_price: Type.Optional(Type.Number({})),
  unit_price_min: Type.Optional(Type.Number({})),
  unit_price_max: Type.Optional(Type.Number({})),
  requested_qty: Type.Optional(Type.Number({ minimum: 0 })),
  requested_qty_min: Type.Optional(Type.Number({ minimum: 0 })),
  requested_qty_max: Type.Optional(Type.Number({ minimum: 0 })),
  budget_type_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_type_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_type_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  budget_category_id_max: Type.Optional(Type.Number({ minimum: 0 })),
});

// Response Schemas using base wrappers
export const BudgetRequestItemsResponseSchema = ApiSuccessResponseSchema(
  BudgetRequestItemsSchema,
);
export const BudgetRequestItemsListResponseSchema = PaginatedResponseSchema(
  BudgetRequestItemsSchema,
);

// Partial Schemas for field selection support
export const PartialBudgetRequestItemsSchema = Type.Partial(
  BudgetRequestItemsSchema,
);
export const FlexibleBudgetRequestItemsListResponseSchema =
  PartialPaginatedResponseSchema(BudgetRequestItemsSchema);

// Batch Update Schema (for updating multiple items at once)
export const BatchUpdateItemSchema = Type.Object({
  id: Type.Number(),
  estimated_usage_2569: Type.Optional(Type.Number()),
  unit_price: Type.Optional(Type.Number()),
  requested_qty: Type.Optional(Type.Number()),
  q1_qty: Type.Optional(Type.Number()),
  q2_qty: Type.Optional(Type.Number()),
  q3_qty: Type.Optional(Type.Number()),
  q4_qty: Type.Optional(Type.Number()),
});

export const BatchUpdateBudgetRequestItemsSchema = Type.Object({
  items: Type.Array(BatchUpdateItemSchema, { minItems: 1, maxItems: 100 }),
});

export const BatchUpdateResponseSchema = Type.Object({
  updated: Type.Number(),
  failed: Type.Number(),
  errors: Type.Optional(
    Type.Array(
      Type.Object({
        id: Type.Number(),
        error: Type.String(),
      }),
    ),
  ),
});

// Export types
export type BudgetRequestItems = Static<typeof BudgetRequestItemsSchema>;
export type CreateBudgetRequestItems = Static<
  typeof CreateBudgetRequestItemsSchema
>;
export type UpdateBudgetRequestItems = Static<
  typeof UpdateBudgetRequestItemsSchema
>;
export type BudgetRequestItemsIdParam = Static<
  typeof BudgetRequestItemsIdParamSchema
>;
export type GetBudgetRequestItemsQuery = Static<
  typeof GetBudgetRequestItemsQuerySchema
>;
export type ListBudgetRequestItemsQuery = Static<
  typeof ListBudgetRequestItemsQuerySchema
>;

// Partial types for field selection
export type PartialBudgetRequestItems = Static<
  typeof PartialBudgetRequestItemsSchema
>;
export type FlexibleBudgetRequestItemsList = Static<
  typeof FlexibleBudgetRequestItemsListResponseSchema
>;

// Batch Update types
export type BatchUpdateItem = Static<typeof BatchUpdateItemSchema>;
export type BatchUpdateBudgetRequestItems = Static<
  typeof BatchUpdateBudgetRequestItemsSchema
>;
export type BatchUpdateResponse = Static<typeof BatchUpdateResponseSchema>;
