import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DosageForms Schema
export const DosageFormsSchema = Type.Object({
  id: Type.Integer(),
  form_code: Type.String(),
  form_name: Type.String(),
  form_name_en: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDosageFormsSchema = Type.Object({
  form_code: Type.String(),
  form_name: Type.String(),
  form_name_en: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDosageFormsSchema = Type.Partial(
  Type.Object({
    form_code: Type.String(),
    form_name: Type.String(),
    form_name_en: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DosageFormsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDosageFormsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDosageFormsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'form_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "form_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  form_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  form_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  form_name_en: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DosageFormsResponseSchema =
  ApiSuccessResponseSchema(DosageFormsSchema);
export const DosageFormsListResponseSchema =
  PaginatedResponseSchema(DosageFormsSchema);

// Partial Schemas for field selection support
export const PartialDosageFormsSchema = Type.Partial(DosageFormsSchema);
export const FlexibleDosageFormsListResponseSchema =
  PartialPaginatedResponseSchema(DosageFormsSchema);

// Export types
export type DosageForms = Static<typeof DosageFormsSchema>;
export type CreateDosageForms = Static<typeof CreateDosageFormsSchema>;
export type UpdateDosageForms = Static<typeof UpdateDosageFormsSchema>;
export type DosageFormsIdParam = Static<typeof DosageFormsIdParamSchema>;
export type GetDosageFormsQuery = Static<typeof GetDosageFormsQuerySchema>;
export type ListDosageFormsQuery = Static<typeof ListDosageFormsQuerySchema>;

// Partial types for field selection
export type PartialDosageForms = Static<typeof PartialDosageFormsSchema>;
export type FlexibleDosageFormsList = Static<
  typeof FlexibleDosageFormsListResponseSchema
>;
