import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugDistributionItems Schema
export const DrugDistributionItemsSchema = Type.Object({
  id: Type.Number(),
  distribution_id: Type.Number(),
  item_number: Type.Integer(),
  drug_id: Type.Integer(),
  lot_number: Type.String(),
  quantity_dispensed: Type.Number(),
  unit_cost: Type.Number(),
  expiry_date: Type.String({ format: 'date' }),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugDistributionItemsSchema = Type.Object({
  distribution_id: Type.Number(),
  item_number: Type.Integer(),
  drug_id: Type.Integer(),
  lot_number: Type.String(),
  quantity_dispensed: Type.Number(),
  unit_cost: Type.Number(),
  expiry_date: Type.String({ format: 'date' }),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugDistributionItemsSchema = Type.Partial(
  Type.Object({
    distribution_id: Type.Number(),
    item_number: Type.Integer(),
    drug_id: Type.Integer(),
    lot_number: Type.String(),
    quantity_dispensed: Type.Number(),
    unit_cost: Type.Number(),
    expiry_date: Type.String({ format: 'date' }),
  }),
);

// ID Parameter Schema
export const DrugDistributionItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugDistributionItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugDistributionItemsQuerySchema = Type.Object({
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
        'distribution_id:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "distribution_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  distribution_id: Type.Optional(Type.Number({ minimum: 0 })),
  distribution_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  distribution_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  item_number: Type.Optional(Type.Number({ minimum: 0 })),
  item_number_min: Type.Optional(Type.Number({ minimum: 0 })),
  item_number_max: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  lot_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  quantity_dispensed: Type.Optional(Type.Number({})),
  quantity_dispensed_min: Type.Optional(Type.Number({})),
  quantity_dispensed_max: Type.Optional(Type.Number({})),
  unit_cost: Type.Optional(Type.Number({})),
  unit_cost_min: Type.Optional(Type.Number({})),
  unit_cost_max: Type.Optional(Type.Number({})),
});

// Response Schemas using base wrappers
export const DrugDistributionItemsResponseSchema = ApiSuccessResponseSchema(
  DrugDistributionItemsSchema,
);
export const DrugDistributionItemsListResponseSchema = PaginatedResponseSchema(
  DrugDistributionItemsSchema,
);

// Partial Schemas for field selection support
export const PartialDrugDistributionItemsSchema = Type.Partial(
  DrugDistributionItemsSchema,
);
export const FlexibleDrugDistributionItemsListResponseSchema =
  PartialPaginatedResponseSchema(DrugDistributionItemsSchema);

// Export types
export type DrugDistributionItems = Static<typeof DrugDistributionItemsSchema>;
export type CreateDrugDistributionItems = Static<
  typeof CreateDrugDistributionItemsSchema
>;
export type UpdateDrugDistributionItems = Static<
  typeof UpdateDrugDistributionItemsSchema
>;
export type DrugDistributionItemsIdParam = Static<
  typeof DrugDistributionItemsIdParamSchema
>;
export type GetDrugDistributionItemsQuery = Static<
  typeof GetDrugDistributionItemsQuerySchema
>;
export type ListDrugDistributionItemsQuery = Static<
  typeof ListDrugDistributionItemsQuerySchema
>;

// Partial types for field selection
export type PartialDrugDistributionItems = Static<
  typeof PartialDrugDistributionItemsSchema
>;
export type FlexibleDrugDistributionItemsList = Static<
  typeof FlexibleDrugDistributionItemsListResponseSchema
>;
