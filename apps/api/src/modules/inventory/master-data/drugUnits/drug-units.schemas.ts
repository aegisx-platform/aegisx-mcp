import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugUnits Schema
export const DrugUnitsSchema = Type.Object({
  id: Type.Integer(),
  unit_code: Type.String(),
  unit_name: Type.String(),
  unit_name_en: Type.Optional(Type.String()),
  unit_type: Type.Optional(Type.Any()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugUnitsSchema = Type.Object({
  unit_code: Type.String(),
  unit_name: Type.String(),
  unit_name_en: Type.Optional(Type.String()),
  unit_type: Type.Optional(Type.Any()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugUnitsSchema = Type.Partial(
  Type.Object({
    unit_code: Type.String(),
    unit_name: Type.String(),
    unit_name_en: Type.Optional(Type.String()),
    unit_type: Type.Optional(Type.Any()),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DrugUnitsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugUnitsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugUnitsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'unit_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "unit_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  unit_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  unit_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  unit_name_en: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DrugUnitsResponseSchema =
  ApiSuccessResponseSchema(DrugUnitsSchema);
export const DrugUnitsListResponseSchema =
  PaginatedResponseSchema(DrugUnitsSchema);

// Partial Schemas for field selection support
export const PartialDrugUnitsSchema = Type.Partial(DrugUnitsSchema);
export const FlexibleDrugUnitsListResponseSchema =
  PartialPaginatedResponseSchema(DrugUnitsSchema);

// Export types
export type DrugUnits = Static<typeof DrugUnitsSchema>;
export type CreateDrugUnits = Static<typeof CreateDrugUnitsSchema>;
export type UpdateDrugUnits = Static<typeof UpdateDrugUnitsSchema>;
export type DrugUnitsIdParam = Static<typeof DrugUnitsIdParamSchema>;
export type GetDrugUnitsQuery = Static<typeof GetDrugUnitsQuerySchema>;
export type ListDrugUnitsQuery = Static<typeof ListDrugUnitsQuerySchema>;

// Partial types for field selection
export type PartialDrugUnits = Static<typeof PartialDrugUnitsSchema>;
export type FlexibleDrugUnitsList = Static<
  typeof FlexibleDrugUnitsListResponseSchema
>;
