import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base ReceiptInspectors Schema
export const ReceiptInspectorsSchema = Type.Object({
  id: Type.Number(),
  receipt_id: Type.Number(),
  inspector_id: Type.String({ format: 'uuid' }),
  inspector_role: Type.Optional(Type.Any()),
  inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateReceiptInspectorsSchema = Type.Object({
  receipt_id: Type.Number(),
  inspector_id: Type.String({ format: 'uuid' }),
  inspector_role: Type.Optional(Type.Any()),
  inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateReceiptInspectorsSchema = Type.Partial(
  Type.Object({
    receipt_id: Type.Number(),
    inspector_id: Type.String({ format: 'uuid' }),
    inspector_role: Type.Optional(Type.Any()),
    inspected_at: Type.Optional(Type.String({ format: 'date-time' })),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const ReceiptInspectorsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetReceiptInspectorsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListReceiptInspectorsQuerySchema = Type.Object({
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
  inspector_id: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const ReceiptInspectorsResponseSchema = ApiSuccessResponseSchema(
  ReceiptInspectorsSchema,
);
export const ReceiptInspectorsListResponseSchema = PaginatedResponseSchema(
  ReceiptInspectorsSchema,
);

// Partial Schemas for field selection support
export const PartialReceiptInspectorsSchema = Type.Partial(
  ReceiptInspectorsSchema,
);
export const FlexibleReceiptInspectorsListResponseSchema =
  PartialPaginatedResponseSchema(ReceiptInspectorsSchema);

// Export types
export type ReceiptInspectors = Static<typeof ReceiptInspectorsSchema>;
export type CreateReceiptInspectors = Static<
  typeof CreateReceiptInspectorsSchema
>;
export type UpdateReceiptInspectors = Static<
  typeof UpdateReceiptInspectorsSchema
>;
export type ReceiptInspectorsIdParam = Static<
  typeof ReceiptInspectorsIdParamSchema
>;
export type GetReceiptInspectorsQuery = Static<
  typeof GetReceiptInspectorsQuerySchema
>;
export type ListReceiptInspectorsQuery = Static<
  typeof ListReceiptInspectorsQuerySchema
>;

// Partial types for field selection
export type PartialReceiptInspectors = Static<
  typeof PartialReceiptInspectorsSchema
>;
export type FlexibleReceiptInspectorsList = Static<
  typeof FlexibleReceiptInspectorsListResponseSchema
>;
