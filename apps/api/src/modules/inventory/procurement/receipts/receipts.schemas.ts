import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Receipts Schema
export const ReceiptsSchema = Type.Object({
  id: Type.Number(),
  receipt_number: Type.String(),
  po_id: Type.Number(),
  location_id: Type.Integer(),
  receipt_date: Type.Optional(Type.String({ format: 'date' })),
  delivery_note_number: Type.Optional(Type.String()),
  invoice_number: Type.Optional(Type.String()),
  invoice_date: Type.Optional(Type.String({ format: 'date' })),
  status: Type.Optional(Type.Any()),
  total_amount: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
  received_by: Type.String({ format: 'uuid' }),
  inspected_by: Type.Optional(Type.String({ format: 'uuid' })),
  inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateReceiptsSchema = Type.Object({
  receipt_number: Type.String(),
  po_id: Type.Number(),
  location_id: Type.Integer(),
  receipt_date: Type.Optional(Type.String({ format: 'date' })),
  delivery_note_number: Type.Optional(Type.String()),
  invoice_number: Type.Optional(Type.String()),
  invoice_date: Type.Optional(Type.String({ format: 'date' })),
  status: Type.Optional(Type.Any()),
  total_amount: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
  received_by: Type.String({ format: 'uuid' }),
  inspected_by: Type.Optional(Type.String({ format: 'uuid' })),
  inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateReceiptsSchema = Type.Partial(
  Type.Object({
    receipt_number: Type.String(),
    po_id: Type.Number(),
    location_id: Type.Integer(),
    receipt_date: Type.Optional(Type.String({ format: 'date' })),
    delivery_note_number: Type.Optional(Type.String()),
    invoice_number: Type.Optional(Type.String()),
    invoice_date: Type.Optional(Type.String({ format: 'date' })),
    status: Type.Optional(Type.Any()),
    total_amount: Type.Optional(Type.Number()),
    notes: Type.Optional(Type.String()),
    received_by: Type.String({ format: 'uuid' }),
    inspected_by: Type.Optional(Type.String({ format: 'uuid' })),
    inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const ReceiptsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetReceiptsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListReceiptsQuerySchema = Type.Object({
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
        'receipt_number:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "receipt_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  receipt_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  po_id: Type.Optional(Type.Number({ minimum: 0 })),
  po_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  po_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  location_id: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  delivery_note_number: Type.Optional(
    Type.String({ minLength: 1, maxLength: 100 }),
  ),
  invoice_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  total_amount: Type.Optional(Type.Number({})),
  total_amount_min: Type.Optional(Type.Number({})),
  total_amount_max: Type.Optional(Type.Number({})),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  received_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  inspected_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const ReceiptsResponseSchema = ApiSuccessResponseSchema(ReceiptsSchema);
export const ReceiptsListResponseSchema =
  PaginatedResponseSchema(ReceiptsSchema);

// Partial Schemas for field selection support
export const PartialReceiptsSchema = Type.Partial(ReceiptsSchema);
export const FlexibleReceiptsListResponseSchema =
  PartialPaginatedResponseSchema(ReceiptsSchema);

// Export types
export type Receipts = Static<typeof ReceiptsSchema>;
export type CreateReceipts = Static<typeof CreateReceiptsSchema>;
export type UpdateReceipts = Static<typeof UpdateReceiptsSchema>;
export type ReceiptsIdParam = Static<typeof ReceiptsIdParamSchema>;
export type GetReceiptsQuery = Static<typeof GetReceiptsQuerySchema>;
export type ListReceiptsQuery = Static<typeof ListReceiptsQuerySchema>;

// Partial types for field selection
export type PartialReceipts = Static<typeof PartialReceiptsSchema>;
export type FlexibleReceiptsList = Static<
  typeof FlexibleReceiptsListResponseSchema
>;
