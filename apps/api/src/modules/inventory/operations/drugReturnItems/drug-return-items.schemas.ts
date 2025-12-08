import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugReturnItems Schema
export const DrugReturnItemsSchema = Type.Object({
  id: Type.Number(),
  return_id: Type.Number(),
  drug_id: Type.Integer(),
  total_quantity: Type.Number(),
  good_quantity: Type.Number(),
  damaged_quantity: Type.Number(),
  lot_number: Type.String(),
  expiry_date: Type.String({ format: 'date' }),
  return_type: Type.Any(),
  location_id: Type.Integer(),
  action_id: Type.Optional(Type.Integer()),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugReturnItemsSchema = Type.Object({
  return_id: Type.Number(),
  drug_id: Type.Integer(),
  total_quantity: Type.Number(),
  good_quantity: Type.Number(),
  damaged_quantity: Type.Number(),
  lot_number: Type.String(),
  expiry_date: Type.String({ format: 'date' }),
  return_type: Type.Any(),
  location_id: Type.Integer(),
  action_id: Type.Optional(Type.Integer()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugReturnItemsSchema = Type.Partial(
  Type.Object({
    return_id: Type.Number(),
    drug_id: Type.Integer(),
    total_quantity: Type.Number(),
    good_quantity: Type.Number(),
    damaged_quantity: Type.Number(),
    lot_number: Type.String(),
    expiry_date: Type.String({ format: 'date' }),
    return_type: Type.Any(),
    location_id: Type.Integer(),
    action_id: Type.Optional(Type.Integer()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const DrugReturnItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugReturnItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugReturnItemsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'return_id:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "return_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  return_id: Type.Optional(Type.Number({ minimum: 0 })),
  return_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  return_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_quantity: Type.Optional(Type.Number({})),
  total_quantity_min: Type.Optional(Type.Number({})),
  total_quantity_max: Type.Optional(Type.Number({})),
  good_quantity: Type.Optional(Type.Number({})),
  good_quantity_min: Type.Optional(Type.Number({})),
  good_quantity_max: Type.Optional(Type.Number({})),
  damaged_quantity: Type.Optional(Type.Number({})),
  damaged_quantity_min: Type.Optional(Type.Number({})),
  damaged_quantity_max: Type.Optional(Type.Number({})),
  lot_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  location_id: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  location_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  action_id: Type.Optional(Type.Number({ minimum: 0 })),
  action_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  action_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const DrugReturnItemsResponseSchema = ApiSuccessResponseSchema(
  DrugReturnItemsSchema,
);
export const DrugReturnItemsListResponseSchema = PaginatedResponseSchema(
  DrugReturnItemsSchema,
);

// Partial Schemas for field selection support
export const PartialDrugReturnItemsSchema = Type.Partial(DrugReturnItemsSchema);
export const FlexibleDrugReturnItemsListResponseSchema =
  PartialPaginatedResponseSchema(DrugReturnItemsSchema);

// Export types
export type DrugReturnItems = Static<typeof DrugReturnItemsSchema>;
export type CreateDrugReturnItems = Static<typeof CreateDrugReturnItemsSchema>;
export type UpdateDrugReturnItems = Static<typeof UpdateDrugReturnItemsSchema>;
export type DrugReturnItemsIdParam = Static<
  typeof DrugReturnItemsIdParamSchema
>;
export type GetDrugReturnItemsQuery = Static<
  typeof GetDrugReturnItemsQuerySchema
>;
export type ListDrugReturnItemsQuery = Static<
  typeof ListDrugReturnItemsQuerySchema
>;

// Partial types for field selection
export type PartialDrugReturnItems = Static<
  typeof PartialDrugReturnItemsSchema
>;
export type FlexibleDrugReturnItemsList = Static<
  typeof FlexibleDrugReturnItemsListResponseSchema
>;
