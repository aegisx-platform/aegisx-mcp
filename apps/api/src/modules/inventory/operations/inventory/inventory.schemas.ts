import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Inventory Schema
export const InventorySchema = Type.Object({
  id: Type.Number(),
  drug_id: Type.Integer(),
  location_id: Type.Integer(),
  quantity_on_hand: Type.Number(),
  min_level: Type.Optional(Type.Number()),
  max_level: Type.Optional(Type.Number()),
  reorder_point: Type.Optional(Type.Number()),
  average_cost: Type.Optional(Type.Number()),
  last_cost: Type.Optional(Type.Number()),
  last_updated: Type.Optional(Type.String({ format: 'date-time' })),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateInventorySchema = Type.Object({
  drug_id: Type.Integer(),
  location_id: Type.Integer(),
  quantity_on_hand: Type.Number(),
  min_level: Type.Optional(Type.Number()),
  max_level: Type.Optional(Type.Number()),
  reorder_point: Type.Optional(Type.Number()),
  average_cost: Type.Optional(Type.Number()),
  last_cost: Type.Optional(Type.Number()),
  last_updated: Type.Optional(Type.String({ format: 'date-time' })),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateInventorySchema = Type.Partial(
  Type.Object({
    drug_id: Type.Integer(),
    location_id: Type.Integer(),
    quantity_on_hand: Type.Number(),
    min_level: Type.Optional(Type.Number()),
    max_level: Type.Optional(Type.Number()),
    reorder_point: Type.Optional(Type.Number()),
    average_cost: Type.Optional(Type.Number()),
    last_cost: Type.Optional(Type.Number()),
    last_updated: Type.Optional(Type.String({ format: 'date-time' })),
  }),
);

// ID Parameter Schema
export const InventoryIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetInventoryQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListInventoryQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'drug_id:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "drug_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  location_id: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  quantity_on_hand: Type.Optional(Type.Number({})),
  quantity_on_hand_min: Type.Optional(Type.Number({})),
  quantity_on_hand_max: Type.Optional(Type.Number({})),
  min_level: Type.Optional(Type.Number({ minimum: 0 })),
  min_level_min: Type.Optional(Type.Number({ minimum: 0 })),
  min_level_max: Type.Optional(Type.Number({ minimum: 0 })),
  max_level: Type.Optional(Type.Number({ minimum: 0 })),
  max_level_min: Type.Optional(Type.Number({ minimum: 0 })),
  max_level_max: Type.Optional(Type.Number({ minimum: 0 })),
  reorder_point: Type.Optional(Type.Number({ minimum: 0 })),
  reorder_point_min: Type.Optional(Type.Number({ minimum: 0 })),
  reorder_point_max: Type.Optional(Type.Number({ minimum: 0 })),
  average_cost: Type.Optional(Type.Number({})),
  average_cost_min: Type.Optional(Type.Number({})),
  average_cost_max: Type.Optional(Type.Number({})),
  last_cost: Type.Optional(Type.Number({})),
  last_cost_min: Type.Optional(Type.Number({})),
  last_cost_max: Type.Optional(Type.Number({})),
});

// Response Schemas using base wrappers
export const InventoryResponseSchema =
  ApiSuccessResponseSchema(InventorySchema);
export const InventoryListResponseSchema =
  PaginatedResponseSchema(InventorySchema);

// Partial Schemas for field selection support
export const PartialInventorySchema = Type.Partial(InventorySchema);
export const FlexibleInventoryListResponseSchema =
  PartialPaginatedResponseSchema(InventorySchema);

// Export types
export type Inventory = Static<typeof InventorySchema>;
export type CreateInventory = Static<typeof CreateInventorySchema>;
export type UpdateInventory = Static<typeof UpdateInventorySchema>;
export type InventoryIdParam = Static<typeof InventoryIdParamSchema>;
export type GetInventoryQuery = Static<typeof GetInventoryQuerySchema>;
export type ListInventoryQuery = Static<typeof ListInventoryQuerySchema>;

// Partial types for field selection
export type PartialInventory = Static<typeof PartialInventorySchema>;
export type FlexibleInventoryList = Static<
  typeof FlexibleInventoryListResponseSchema
>;
