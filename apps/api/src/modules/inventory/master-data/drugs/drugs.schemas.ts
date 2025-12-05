import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Drugs Schema
export const DrugsSchema = Type.Object({
  id: Type.Integer(),
  drug_code: Type.String(),
  trade_name: Type.String(),
  generic_id: Type.Integer(),
  manufacturer_id: Type.Integer(),
  tmt_tpu_id: Type.Optional(Type.Integer()),
  nlem_status: Type.Any(),
  drug_status: Type.Any(),
  product_category: Type.Any(),
  status_changed_date: Type.Optional(Type.String({ format: 'date' })),
  unit_price: Type.Optional(Type.Number()),
  package_size: Type.Optional(Type.Integer()),
  package_unit: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugsSchema = Type.Object({
  drug_code: Type.String(),
  trade_name: Type.String(),
  generic_id: Type.Integer(),
  manufacturer_id: Type.Integer(),
  tmt_tpu_id: Type.Optional(Type.Integer()),
  nlem_status: Type.Any(),
  drug_status: Type.Any(),
  product_category: Type.Any(),
  status_changed_date: Type.Optional(Type.String({ format: 'date' })),
  unit_price: Type.Optional(Type.Number()),
  package_size: Type.Optional(Type.Integer()),
  package_unit: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugsSchema = Type.Partial(
  Type.Object({
    drug_code: Type.String(),
    trade_name: Type.String(),
    generic_id: Type.Integer(),
    manufacturer_id: Type.Integer(),
    tmt_tpu_id: Type.Optional(Type.Integer()),
    nlem_status: Type.Any(),
    drug_status: Type.Any(),
    product_category: Type.Any(),
    status_changed_date: Type.Optional(Type.String({ format: 'date' })),
    unit_price: Type.Optional(Type.Number()),
    package_size: Type.Optional(Type.Integer()),
    package_unit: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DrugsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'drug_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "drug_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  drug_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  trade_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  manufacturer_id: Type.Optional(Type.Number({ minimum: 0 })),
  manufacturer_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  manufacturer_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_tpu_id: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_tpu_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_tpu_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  unit_price: Type.Optional(Type.Number({})),
  unit_price_min: Type.Optional(Type.Number({})),
  unit_price_max: Type.Optional(Type.Number({})),
  package_size: Type.Optional(Type.Number({})),
  package_size_min: Type.Optional(Type.Number({})),
  package_size_max: Type.Optional(Type.Number({})),
  package_unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DrugsResponseSchema = ApiSuccessResponseSchema(DrugsSchema);
export const DrugsListResponseSchema = PaginatedResponseSchema(DrugsSchema);

// Partial Schemas for field selection support
export const PartialDrugsSchema = Type.Partial(DrugsSchema);
export const FlexibleDrugsListResponseSchema =
  PartialPaginatedResponseSchema(DrugsSchema);

// Export types
export type Drugs = Static<typeof DrugsSchema>;
export type CreateDrugs = Static<typeof CreateDrugsSchema>;
export type UpdateDrugs = Static<typeof UpdateDrugsSchema>;
export type DrugsIdParam = Static<typeof DrugsIdParamSchema>;
export type GetDrugsQuery = Static<typeof GetDrugsQuerySchema>;
export type ListDrugsQuery = Static<typeof ListDrugsQuerySchema>;

// Partial types for field selection
export type PartialDrugs = Static<typeof PartialDrugsSchema>;
export type FlexibleDrugsList = Static<typeof FlexibleDrugsListResponseSchema>;
