import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base ReceiptItems Schema
export const ReceiptItemsSchema = Type.Object({
  id: Type.Number(),
  receipt_id: Type.Number(),
  po_item_id: Type.Number(),
  generic_id: Type.Integer(),
  quantity_ordered: Type.Number(),
  quantity_received: Type.Number(),
  quantity_accepted: Type.Number(),
  quantity_rejected: Type.Optional(Type.Number()),
  rejection_reason: Type.Optional(Type.String()),
  unit_price: Type.Number(),
  total_price: Type.Number(),
  lot_number: Type.String(),
  manufacture_date: Type.Optional(Type.String({ format: 'date' })),
  expiry_date: Type.String({ format: 'date' }),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateReceiptItemsSchema = Type.Object({
  receipt_id: Type.Number(),
  po_item_id: Type.Number(),
  generic_id: Type.Integer(),
  quantity_ordered: Type.Number(),
  quantity_received: Type.Number(),
  quantity_accepted: Type.Number(),
  quantity_rejected: Type.Optional(Type.Number()),
  rejection_reason: Type.Optional(Type.String()),
  unit_price: Type.Number(),
  total_price: Type.Number(),
  lot_number: Type.String(),
  manufacture_date: Type.Optional(Type.String({ format: 'date' })),
  expiry_date: Type.String({ format: 'date' }),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateReceiptItemsSchema = Type.Partial(
  Type.Object({
    receipt_id: Type.Number(),
    po_item_id: Type.Number(),
    generic_id: Type.Integer(),
    quantity_ordered: Type.Number(),
    quantity_received: Type.Number(),
    quantity_accepted: Type.Number(),
    quantity_rejected: Type.Optional(Type.Number()),
    rejection_reason: Type.Optional(Type.String()),
    unit_price: Type.Number(),
    total_price: Type.Number(),
    lot_number: Type.String(),
    manufacture_date: Type.Optional(Type.String({ format: 'date' })),
    expiry_date: Type.String({ format: 'date' }),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const ReceiptItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetReceiptItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListReceiptItemsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'receipt_id:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "receipt_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  receipt_id: Type.Optional(Type.Number({ minimum: 0 })),
  receipt_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  receipt_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  po_item_id: Type.Optional(Type.Number({ minimum: 0 })),
  po_item_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  po_item_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  quantity_ordered: Type.Optional(Type.Number({})),
  quantity_ordered_min: Type.Optional(Type.Number({})),
  quantity_ordered_max: Type.Optional(Type.Number({})),
  quantity_received: Type.Optional(Type.Number({})),
  quantity_received_min: Type.Optional(Type.Number({})),
  quantity_received_max: Type.Optional(Type.Number({})),
  quantity_accepted: Type.Optional(Type.Number({})),
  quantity_accepted_min: Type.Optional(Type.Number({})),
  quantity_accepted_max: Type.Optional(Type.Number({})),
  quantity_rejected: Type.Optional(Type.Number({})),
  quantity_rejected_min: Type.Optional(Type.Number({})),
  quantity_rejected_max: Type.Optional(Type.Number({})),
  rejection_reason: Type.Optional(
    Type.String({ minLength: 1, maxLength: 255 }),
  ),
  unit_price: Type.Optional(Type.Number({})),
  unit_price_min: Type.Optional(Type.Number({})),
  unit_price_max: Type.Optional(Type.Number({})),
  total_price: Type.Optional(Type.Number({})),
  total_price_min: Type.Optional(Type.Number({})),
  total_price_max: Type.Optional(Type.Number({})),
  lot_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const ReceiptItemsResponseSchema =
  ApiSuccessResponseSchema(ReceiptItemsSchema);
export const ReceiptItemsListResponseSchema =
  PaginatedResponseSchema(ReceiptItemsSchema);

// Partial Schemas for field selection support
export const PartialReceiptItemsSchema = Type.Partial(ReceiptItemsSchema);
export const FlexibleReceiptItemsListResponseSchema =
  PartialPaginatedResponseSchema(ReceiptItemsSchema);

// Export types
export type ReceiptItems = Static<typeof ReceiptItemsSchema>;
export type CreateReceiptItems = Static<typeof CreateReceiptItemsSchema>;
export type UpdateReceiptItems = Static<typeof UpdateReceiptItemsSchema>;
export type ReceiptItemsIdParam = Static<typeof ReceiptItemsIdParamSchema>;
export type GetReceiptItemsQuery = Static<typeof GetReceiptItemsQuerySchema>;
export type ListReceiptItemsQuery = Static<typeof ListReceiptItemsQuerySchema>;

// Partial types for field selection
export type PartialReceiptItems = Static<typeof PartialReceiptItemsSchema>;
export type FlexibleReceiptItemsList = Static<
  typeof FlexibleReceiptItemsListResponseSchema
>;
