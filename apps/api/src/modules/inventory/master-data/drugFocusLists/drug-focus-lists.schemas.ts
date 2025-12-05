import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugFocusLists Schema
export const DrugFocusListsSchema = Type.Object({
  id: Type.Integer(),
  list_code: Type.String(),
  list_name: Type.String(),
  description: Type.Optional(Type.String()),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugFocusListsSchema = Type.Object({
  list_code: Type.String(),
  list_name: Type.String(),
  description: Type.Optional(Type.String()),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugFocusListsSchema = Type.Partial(
  Type.Object({
    list_code: Type.String(),
    list_name: Type.String(),
    description: Type.Optional(Type.String()),
    generic_id: Type.Optional(Type.Integer()),
    drug_id: Type.Optional(Type.Integer()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DrugFocusListsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugFocusListsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugFocusListsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'list_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "list_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  list_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  list_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DrugFocusListsResponseSchema =
  ApiSuccessResponseSchema(DrugFocusListsSchema);
export const DrugFocusListsListResponseSchema =
  PaginatedResponseSchema(DrugFocusListsSchema);

// Partial Schemas for field selection support
export const PartialDrugFocusListsSchema = Type.Partial(DrugFocusListsSchema);
export const FlexibleDrugFocusListsListResponseSchema =
  PartialPaginatedResponseSchema(DrugFocusListsSchema);

// Export types
export type DrugFocusLists = Static<typeof DrugFocusListsSchema>;
export type CreateDrugFocusLists = Static<typeof CreateDrugFocusListsSchema>;
export type UpdateDrugFocusLists = Static<typeof UpdateDrugFocusListsSchema>;
export type DrugFocusListsIdParam = Static<typeof DrugFocusListsIdParamSchema>;
export type GetDrugFocusListsQuery = Static<
  typeof GetDrugFocusListsQuerySchema
>;
export type ListDrugFocusListsQuery = Static<
  typeof ListDrugFocusListsQuerySchema
>;

// Partial types for field selection
export type PartialDrugFocusLists = Static<typeof PartialDrugFocusListsSchema>;
export type FlexibleDrugFocusListsList = Static<
  typeof FlexibleDrugFocusListsListResponseSchema
>;
