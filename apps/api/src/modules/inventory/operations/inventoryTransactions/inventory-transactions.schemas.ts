import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base InventoryTransactions Schema
export const InventoryTransactionsSchema = Type.Object({
  id: Type.Number(),
  inventory_id: Type.Number(),
  transaction_type: Type.Any(),
  quantity: Type.Number(),
  unit_cost: Type.Optional(Type.Number()),
  reference_id: Type.Optional(Type.Number()),
  reference_type: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  created_by: Type.Optional(Type.String({ format: 'uuid' })),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateInventoryTransactionsSchema = Type.Object({
  inventory_id: Type.Number(),
  transaction_type: Type.Any(),
  quantity: Type.Number(),
  unit_cost: Type.Optional(Type.Number()),
  reference_id: Type.Optional(Type.Number()),
  reference_type: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  // created_by is auto-filled from JWT token
  created_by: Type.Optional(
    Type.String({
      format: 'uuid',
      description: 'User who created this record (auto-filled from JWT)',
    }),
  ),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateInventoryTransactionsSchema = Type.Partial(
  Type.Object({
    inventory_id: Type.Number(),
    transaction_type: Type.Any(),
    quantity: Type.Number(),
    unit_cost: Type.Optional(Type.Number()),
    reference_id: Type.Optional(Type.Number()),
    reference_type: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const InventoryTransactionsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetInventoryTransactionsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListInventoryTransactionsQuerySchema = Type.Object({
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
        'inventory_id:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "inventory_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  inventory_id: Type.Optional(Type.Number({ minimum: 0 })),
  inventory_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  inventory_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  quantity: Type.Optional(Type.Number({})),
  quantity_min: Type.Optional(Type.Number({})),
  quantity_max: Type.Optional(Type.Number({})),
  unit_cost: Type.Optional(Type.Number({})),
  unit_cost_min: Type.Optional(Type.Number({})),
  unit_cost_max: Type.Optional(Type.Number({})),
  reference_id: Type.Optional(Type.Number({ minimum: 0 })),
  reference_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  reference_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  reference_type: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  created_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

// Response Schemas using base wrappers
export const InventoryTransactionsResponseSchema = ApiSuccessResponseSchema(
  InventoryTransactionsSchema,
);
export const InventoryTransactionsListResponseSchema = PaginatedResponseSchema(
  InventoryTransactionsSchema,
);

// Partial Schemas for field selection support
export const PartialInventoryTransactionsSchema = Type.Partial(
  InventoryTransactionsSchema,
);
export const FlexibleInventoryTransactionsListResponseSchema =
  PartialPaginatedResponseSchema(InventoryTransactionsSchema);

// Export types
export type InventoryTransactions = Static<typeof InventoryTransactionsSchema>;
export type CreateInventoryTransactions = Static<
  typeof CreateInventoryTransactionsSchema
>;
export type UpdateInventoryTransactions = Static<
  typeof UpdateInventoryTransactionsSchema
>;
export type InventoryTransactionsIdParam = Static<
  typeof InventoryTransactionsIdParamSchema
>;
export type GetInventoryTransactionsQuery = Static<
  typeof GetInventoryTransactionsQuerySchema
>;
export type ListInventoryTransactionsQuery = Static<
  typeof ListInventoryTransactionsQuerySchema
>;

// Partial types for field selection
export type PartialInventoryTransactions = Static<
  typeof PartialInventoryTransactionsSchema
>;
export type FlexibleInventoryTransactionsList = Static<
  typeof FlexibleInventoryTransactionsListResponseSchema
>;
