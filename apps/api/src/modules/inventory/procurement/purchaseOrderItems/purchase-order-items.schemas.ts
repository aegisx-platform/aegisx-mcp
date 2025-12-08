import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base PurchaseOrderItems Schema
export const PurchaseOrderItemsSchema = Type.Object({
  id: Type.Number(),
  po_id: Type.Number(),
  pr_item_id: Type.Optional(Type.Number()),
  generic_id: Type.Integer(),
  quantity: Type.Number(),
  unit: Type.String(),
  unit_price: Type.Number(),
  discount_percent: Type.Optional(Type.Number()),
  discount_amount: Type.Optional(Type.Number()),
  total_price: Type.Number(),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreatePurchaseOrderItemsSchema = Type.Object({
  po_id: Type.Number(),
  pr_item_id: Type.Optional(Type.Number()),
  generic_id: Type.Integer(),
  quantity: Type.Number(),
  unit: Type.String(),
  unit_price: Type.Number(),
  discount_percent: Type.Optional(Type.Number()),
  discount_amount: Type.Optional(Type.Number()),
  total_price: Type.Number(),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdatePurchaseOrderItemsSchema = Type.Partial(
  Type.Object({
    po_id: Type.Number(),
    pr_item_id: Type.Optional(Type.Number()),
    generic_id: Type.Integer(),
    quantity: Type.Number(),
    unit: Type.String(),
    unit_price: Type.Number(),
    discount_percent: Type.Optional(Type.Number()),
    discount_amount: Type.Optional(Type.Number()),
    total_price: Type.Number(),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const PurchaseOrderItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetPurchaseOrderItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListPurchaseOrderItemsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'po_id:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "po_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  po_id: Type.Optional(Type.Number({ minimum: 0 })),
  po_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  po_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  pr_item_id: Type.Optional(Type.Number({ minimum: 0 })),
  pr_item_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  pr_item_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  quantity: Type.Optional(Type.Number({})),
  quantity_min: Type.Optional(Type.Number({})),
  quantity_max: Type.Optional(Type.Number({})),
  unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  unit_price: Type.Optional(Type.Number({})),
  unit_price_min: Type.Optional(Type.Number({})),
  unit_price_max: Type.Optional(Type.Number({})),
  discount_percent: Type.Optional(Type.Number({})),
  discount_percent_min: Type.Optional(Type.Number({})),
  discount_percent_max: Type.Optional(Type.Number({})),
  discount_amount: Type.Optional(Type.Number({})),
  discount_amount_min: Type.Optional(Type.Number({})),
  discount_amount_max: Type.Optional(Type.Number({})),
  total_price: Type.Optional(Type.Number({})),
  total_price_min: Type.Optional(Type.Number({})),
  total_price_max: Type.Optional(Type.Number({})),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const PurchaseOrderItemsResponseSchema = ApiSuccessResponseSchema(
  PurchaseOrderItemsSchema,
);
export const PurchaseOrderItemsListResponseSchema = PaginatedResponseSchema(
  PurchaseOrderItemsSchema,
);

// Partial Schemas for field selection support
export const PartialPurchaseOrderItemsSchema = Type.Partial(
  PurchaseOrderItemsSchema,
);
export const FlexiblePurchaseOrderItemsListResponseSchema =
  PartialPaginatedResponseSchema(PurchaseOrderItemsSchema);

// Export types
export type PurchaseOrderItems = Static<typeof PurchaseOrderItemsSchema>;
export type CreatePurchaseOrderItems = Static<
  typeof CreatePurchaseOrderItemsSchema
>;
export type UpdatePurchaseOrderItems = Static<
  typeof UpdatePurchaseOrderItemsSchema
>;
export type PurchaseOrderItemsIdParam = Static<
  typeof PurchaseOrderItemsIdParamSchema
>;
export type GetPurchaseOrderItemsQuery = Static<
  typeof GetPurchaseOrderItemsQuerySchema
>;
export type ListPurchaseOrderItemsQuery = Static<
  typeof ListPurchaseOrderItemsQuerySchema
>;

// Partial types for field selection
export type PartialPurchaseOrderItems = Static<
  typeof PartialPurchaseOrderItemsSchema
>;
export type FlexiblePurchaseOrderItemsList = Static<
  typeof FlexiblePurchaseOrderItemsListResponseSchema
>;
