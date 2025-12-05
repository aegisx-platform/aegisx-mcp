import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugPackRatios Schema
export const DrugPackRatiosSchema = Type.Object({
  id: Type.Integer(),
  drug_id: Type.Integer(),
  company_id: Type.Optional(Type.Integer()),
  pack_size: Type.Integer(),
  pack_unit: Type.String(),
  unit_per_pack: Type.Number(),
  pack_price: Type.Optional(Type.Number()),
  is_default: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugPackRatiosSchema = Type.Object({
  drug_id: Type.Integer(),
  company_id: Type.Optional(Type.Integer()),
  pack_size: Type.Integer(),
  pack_unit: Type.String(),
  unit_per_pack: Type.Number(),
  pack_price: Type.Optional(Type.Number()),
  is_default: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugPackRatiosSchema = Type.Partial(
  Type.Object({
    drug_id: Type.Integer(),
    company_id: Type.Optional(Type.Integer()),
    pack_size: Type.Integer(),
    pack_unit: Type.String(),
    unit_per_pack: Type.Number(),
    pack_price: Type.Optional(Type.Number()),
    is_default: Type.Optional(Type.Boolean()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DrugPackRatiosIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugPackRatiosQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugPackRatiosQuerySchema = Type.Object({
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
  company_id: Type.Optional(Type.Number({ minimum: 0 })),
  company_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  company_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  pack_size: Type.Optional(Type.Number({})),
  pack_size_min: Type.Optional(Type.Number({})),
  pack_size_max: Type.Optional(Type.Number({})),
  pack_unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  unit_per_pack: Type.Optional(Type.Number({ minimum: 0 })),
  unit_per_pack_min: Type.Optional(Type.Number({ minimum: 0 })),
  unit_per_pack_max: Type.Optional(Type.Number({ minimum: 0 })),
  pack_price: Type.Optional(Type.Number({})),
  pack_price_min: Type.Optional(Type.Number({})),
  pack_price_max: Type.Optional(Type.Number({})),
  is_default: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DrugPackRatiosResponseSchema =
  ApiSuccessResponseSchema(DrugPackRatiosSchema);
export const DrugPackRatiosListResponseSchema =
  PaginatedResponseSchema(DrugPackRatiosSchema);

// Partial Schemas for field selection support
export const PartialDrugPackRatiosSchema = Type.Partial(DrugPackRatiosSchema);
export const FlexibleDrugPackRatiosListResponseSchema =
  PartialPaginatedResponseSchema(DrugPackRatiosSchema);

// Export types
export type DrugPackRatios = Static<typeof DrugPackRatiosSchema>;
export type CreateDrugPackRatios = Static<typeof CreateDrugPackRatiosSchema>;
export type UpdateDrugPackRatios = Static<typeof UpdateDrugPackRatiosSchema>;
export type DrugPackRatiosIdParam = Static<typeof DrugPackRatiosIdParamSchema>;
export type GetDrugPackRatiosQuery = Static<
  typeof GetDrugPackRatiosQuerySchema
>;
export type ListDrugPackRatiosQuery = Static<
  typeof ListDrugPackRatiosQuerySchema
>;

// Partial types for field selection
export type PartialDrugPackRatios = Static<typeof PartialDrugPackRatiosSchema>;
export type FlexibleDrugPackRatiosList = Static<
  typeof FlexibleDrugPackRatiosListResponseSchema
>;
