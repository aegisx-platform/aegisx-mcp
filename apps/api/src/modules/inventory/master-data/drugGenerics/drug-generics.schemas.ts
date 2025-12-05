import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugGenerics Schema
export const DrugGenericsSchema = Type.Object({
  id: Type.Integer(),
  working_code: Type.String(),
  generic_name: Type.String(),
  dosage_form: Type.Optional(Type.String()),
  strength_unit: Type.Optional(Type.String()),
  dosage_form_id: Type.Optional(Type.Integer()),
  strength_unit_id: Type.Optional(Type.Integer()),
  strength_value: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugGenericsSchema = Type.Object({
  working_code: Type.String(),
  generic_name: Type.String(),
  dosage_form: Type.Optional(Type.String()),
  strength_unit: Type.Optional(Type.String()),
  dosage_form_id: Type.Optional(Type.Integer()),
  strength_unit_id: Type.Optional(Type.Integer()),
  strength_value: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugGenericsSchema = Type.Partial(
  Type.Object({
    working_code: Type.String(),
    generic_name: Type.String(),
    dosage_form: Type.Optional(Type.String()),
    strength_unit: Type.Optional(Type.String()),
    dosage_form_id: Type.Optional(Type.Integer()),
    strength_unit_id: Type.Optional(Type.Integer()),
    strength_value: Type.Optional(Type.Number()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DrugGenericsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugGenericsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugGenericsQuerySchema = Type.Object({
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
        'working_code:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "working_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  working_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  generic_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  dosage_form: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  strength_unit: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  dosage_form_id: Type.Optional(Type.Number({ minimum: 0 })),
  dosage_form_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  dosage_form_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  strength_unit_id: Type.Optional(Type.Number({ minimum: 0 })),
  strength_unit_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  strength_unit_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  strength_value: Type.Optional(Type.Number({ minimum: 0 })),
  strength_value_min: Type.Optional(Type.Number({ minimum: 0 })),
  strength_value_max: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DrugGenericsResponseSchema =
  ApiSuccessResponseSchema(DrugGenericsSchema);
export const DrugGenericsListResponseSchema =
  PaginatedResponseSchema(DrugGenericsSchema);

// Partial Schemas for field selection support
export const PartialDrugGenericsSchema = Type.Partial(DrugGenericsSchema);
export const FlexibleDrugGenericsListResponseSchema =
  PartialPaginatedResponseSchema(DrugGenericsSchema);

// Export types
export type DrugGenerics = Static<typeof DrugGenericsSchema>;
export type CreateDrugGenerics = Static<typeof CreateDrugGenericsSchema>;
export type UpdateDrugGenerics = Static<typeof UpdateDrugGenericsSchema>;
export type DrugGenericsIdParam = Static<typeof DrugGenericsIdParamSchema>;
export type GetDrugGenericsQuery = Static<typeof GetDrugGenericsQuerySchema>;
export type ListDrugGenericsQuery = Static<typeof ListDrugGenericsQuerySchema>;

// Partial types for field selection
export type PartialDrugGenerics = Static<typeof PartialDrugGenericsSchema>;
export type FlexibleDrugGenericsList = Static<
  typeof FlexibleDrugGenericsListResponseSchema
>;
