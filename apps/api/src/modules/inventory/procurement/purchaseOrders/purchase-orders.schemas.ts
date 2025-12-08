import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base PurchaseOrders Schema
export const PurchaseOrdersSchema = Type.Object({
  id: Type.Number(),
  po_number: Type.String(),
  pr_id: Type.Number(),
  vendor_id: Type.Integer(),
  contract_id: Type.Optional(Type.Number()),
  po_date: Type.Optional(Type.String({ format: 'date' })),
  delivery_date: Type.String({ format: 'date' }),
  total_amount: Type.Number(),
  vat_amount: Type.Optional(Type.Number()),
  grand_total: Type.Number(),
  status: Type.Optional(Type.Any()),
  payment_terms: Type.Optional(Type.Any()),
  shipping_address: Type.Optional(Type.String()),
  billing_address: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  created_by: Type.String({ format: 'uuid' }),
  approved_by: Type.Optional(Type.String({ format: 'uuid' })),
  approved_at: Type.Optional(Type.String({ format: 'date-time' })),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreatePurchaseOrdersSchema = Type.Object({
  po_number: Type.String(),
  pr_id: Type.Number(),
  vendor_id: Type.Integer(),
  contract_id: Type.Optional(Type.Number()),
  po_date: Type.Optional(Type.String({ format: 'date' })),
  delivery_date: Type.String({ format: 'date' }),
  total_amount: Type.Number(),
  vat_amount: Type.Optional(Type.Number()),
  grand_total: Type.Number(),
  status: Type.Optional(Type.Any()),
  payment_terms: Type.Optional(Type.Any()),
  shipping_address: Type.Optional(Type.String()),
  billing_address: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  approved_by: Type.Optional(Type.String({ format: 'uuid' })),
  approved_at: Type.Optional(Type.String({ format: 'date-time' })),
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
export const UpdatePurchaseOrdersSchema = Type.Partial(
  Type.Object({
    po_number: Type.String(),
    pr_id: Type.Number(),
    vendor_id: Type.Integer(),
    contract_id: Type.Optional(Type.Number()),
    po_date: Type.Optional(Type.String({ format: 'date' })),
    delivery_date: Type.String({ format: 'date' }),
    total_amount: Type.Number(),
    vat_amount: Type.Optional(Type.Number()),
    grand_total: Type.Number(),
    status: Type.Optional(Type.Any()),
    payment_terms: Type.Optional(Type.Any()),
    shipping_address: Type.Optional(Type.String()),
    billing_address: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
    approved_by: Type.Optional(Type.String({ format: 'uuid' })),
    approved_at: Type.Optional(Type.String({ format: 'date-time' })),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const PurchaseOrdersIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetPurchaseOrdersQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListPurchaseOrdersQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'po_number:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "po_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  po_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  pr_id: Type.Optional(Type.Number({ minimum: 0 })),
  pr_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  pr_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  vendor_id: Type.Optional(Type.Number({ minimum: 0 })),
  vendor_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  vendor_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  contract_id: Type.Optional(Type.Number({ minimum: 0 })),
  contract_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  contract_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_amount: Type.Optional(Type.Number({})),
  total_amount_min: Type.Optional(Type.Number({})),
  total_amount_max: Type.Optional(Type.Number({})),
  vat_amount: Type.Optional(Type.Number({})),
  vat_amount_min: Type.Optional(Type.Number({})),
  vat_amount_max: Type.Optional(Type.Number({})),
  grand_total: Type.Optional(Type.Number({ minimum: 0 })),
  grand_total_min: Type.Optional(Type.Number({ minimum: 0 })),
  grand_total_max: Type.Optional(Type.Number({ minimum: 0 })),
  shipping_address: Type.Optional(
    Type.String({ minLength: 1, maxLength: 255 }),
  ),
  billing_address: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  approved_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const PurchaseOrdersResponseSchema =
  ApiSuccessResponseSchema(PurchaseOrdersSchema);
export const PurchaseOrdersListResponseSchema =
  PaginatedResponseSchema(PurchaseOrdersSchema);

// Partial Schemas for field selection support
export const PartialPurchaseOrdersSchema = Type.Partial(PurchaseOrdersSchema);
export const FlexiblePurchaseOrdersListResponseSchema =
  PartialPaginatedResponseSchema(PurchaseOrdersSchema);

// Export types
export type PurchaseOrders = Static<typeof PurchaseOrdersSchema>;
export type CreatePurchaseOrders = Static<typeof CreatePurchaseOrdersSchema>;
export type UpdatePurchaseOrders = Static<typeof UpdatePurchaseOrdersSchema>;
export type PurchaseOrdersIdParam = Static<typeof PurchaseOrdersIdParamSchema>;
export type GetPurchaseOrdersQuery = Static<
  typeof GetPurchaseOrdersQuerySchema
>;
export type ListPurchaseOrdersQuery = Static<
  typeof ListPurchaseOrdersQuerySchema
>;

// Partial types for field selection
export type PartialPurchaseOrders = Static<typeof PartialPurchaseOrdersSchema>;
export type FlexiblePurchaseOrdersList = Static<
  typeof FlexiblePurchaseOrdersListResponseSchema
>;
