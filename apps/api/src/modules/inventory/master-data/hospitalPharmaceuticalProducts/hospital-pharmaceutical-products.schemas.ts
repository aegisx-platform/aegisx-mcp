import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base HospitalPharmaceuticalProducts Schema
export const HospitalPharmaceuticalProductsSchema = Type.Object({
  id: Type.Number(),
  hpp_code: Type.String(),
  hpp_type: Type.Any(),
  product_name: Type.String(),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  base_product_id: Type.Optional(Type.Number()),
  tmt_code: Type.Optional(Type.String()),
  is_outsourced: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateHospitalPharmaceuticalProductsSchema = Type.Object({
  hpp_code: Type.String(),
  hpp_type: Type.Any(),
  product_name: Type.String(),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  base_product_id: Type.Optional(Type.Number()),
  tmt_code: Type.Optional(Type.String()),
  is_outsourced: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateHospitalPharmaceuticalProductsSchema = Type.Partial(
  Type.Object({
    hpp_code: Type.String(),
    hpp_type: Type.Any(),
    product_name: Type.String(),
    generic_id: Type.Optional(Type.Integer()),
    drug_id: Type.Optional(Type.Integer()),
    base_product_id: Type.Optional(Type.Number()),
    tmt_code: Type.Optional(Type.String()),
    is_outsourced: Type.Optional(Type.Boolean()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const HospitalPharmaceuticalProductsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetHospitalPharmaceuticalProductsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListHospitalPharmaceuticalProductsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'hpp_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "hpp_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  hpp_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  product_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  base_product_id: Type.Optional(Type.Number({ minimum: 0 })),
  base_product_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  base_product_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_outsourced: Type.Optional(Type.Boolean()),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const HospitalPharmaceuticalProductsResponseSchema =
  ApiSuccessResponseSchema(HospitalPharmaceuticalProductsSchema);
export const HospitalPharmaceuticalProductsListResponseSchema =
  PaginatedResponseSchema(HospitalPharmaceuticalProductsSchema);

// Partial Schemas for field selection support
export const PartialHospitalPharmaceuticalProductsSchema = Type.Partial(
  HospitalPharmaceuticalProductsSchema,
);
export const FlexibleHospitalPharmaceuticalProductsListResponseSchema =
  PartialPaginatedResponseSchema(HospitalPharmaceuticalProductsSchema);

// Export types
export type HospitalPharmaceuticalProducts = Static<
  typeof HospitalPharmaceuticalProductsSchema
>;
export type CreateHospitalPharmaceuticalProducts = Static<
  typeof CreateHospitalPharmaceuticalProductsSchema
>;
export type UpdateHospitalPharmaceuticalProducts = Static<
  typeof UpdateHospitalPharmaceuticalProductsSchema
>;
export type HospitalPharmaceuticalProductsIdParam = Static<
  typeof HospitalPharmaceuticalProductsIdParamSchema
>;
export type GetHospitalPharmaceuticalProductsQuery = Static<
  typeof GetHospitalPharmaceuticalProductsQuerySchema
>;
export type ListHospitalPharmaceuticalProductsQuery = Static<
  typeof ListHospitalPharmaceuticalProductsQuerySchema
>;

// Partial types for field selection
export type PartialHospitalPharmaceuticalProducts = Static<
  typeof PartialHospitalPharmaceuticalProductsSchema
>;
export type FlexibleHospitalPharmaceuticalProductsList = Static<
  typeof FlexibleHospitalPharmaceuticalProductsListResponseSchema
>;
