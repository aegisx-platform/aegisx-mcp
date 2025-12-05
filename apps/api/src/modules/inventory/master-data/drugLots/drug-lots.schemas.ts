import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugLots Schema
export const DrugLotsSchema = Type.Object({
  id: Type.Number(),
  drug_id: Type.Integer(),
  location_id: Type.Integer(),
  lot_number: Type.String(),
  expiry_date: Type.String({ format: 'date' }),
  quantity_available: Type.Number(),
  unit_cost: Type.Number(),
  received_date: Type.String({ format: 'date' }),
  receipt_id: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugLotsSchema = Type.Object({
  drug_id: Type.Integer(),
  location_id: Type.Integer(),
  lot_number: Type.String(),
  expiry_date: Type.String({ format: 'date' }),
  quantity_available: Type.Number(),
  unit_cost: Type.Number(),
  received_date: Type.String({ format: 'date' }),
  receipt_id: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugLotsSchema = Type.Partial(
  Type.Object({
    drug_id: Type.Integer(),
    location_id: Type.Integer(),
    lot_number: Type.String(),
    expiry_date: Type.String({ format: 'date' }),
    quantity_available: Type.Number(),
    unit_cost: Type.Number(),
    received_date: Type.String({ format: 'date' }),
    receipt_id: Type.Optional(Type.Number()),
    is_active: Type.Optional(Type.Boolean()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const DrugLotsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugLotsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugLotsQuerySchema = Type.Object({
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
  lot_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  quantity_available: Type.Optional(Type.Number({})),
  quantity_available_min: Type.Optional(Type.Number({})),
  quantity_available_max: Type.Optional(Type.Number({})),
  unit_cost: Type.Optional(Type.Number({})),
  unit_cost_min: Type.Optional(Type.Number({})),
  unit_cost_max: Type.Optional(Type.Number({})),
  receipt_id: Type.Optional(Type.Number({ minimum: 0 })),
  receipt_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  receipt_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const DrugLotsResponseSchema = ApiSuccessResponseSchema(DrugLotsSchema);
export const DrugLotsListResponseSchema =
  PaginatedResponseSchema(DrugLotsSchema);

// Partial Schemas for field selection support
export const PartialDrugLotsSchema = Type.Partial(DrugLotsSchema);
export const FlexibleDrugLotsListResponseSchema =
  PartialPaginatedResponseSchema(DrugLotsSchema);

// Export types
export type DrugLots = Static<typeof DrugLotsSchema>;
export type CreateDrugLots = Static<typeof CreateDrugLotsSchema>;
export type UpdateDrugLots = Static<typeof UpdateDrugLotsSchema>;
export type DrugLotsIdParam = Static<typeof DrugLotsIdParamSchema>;
export type GetDrugLotsQuery = Static<typeof GetDrugLotsQuerySchema>;
export type ListDrugLotsQuery = Static<typeof ListDrugLotsQuerySchema>;

// Partial types for field selection
export type PartialDrugLots = Static<typeof PartialDrugLotsSchema>;
export type FlexibleDrugLotsList = Static<
  typeof FlexibleDrugLotsListResponseSchema
>;
