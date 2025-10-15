import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
  DropdownOptionSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  StatusToggleSchema,
  StatisticsSchema,
} from '../../../schemas/base.schemas';

// Base Themes Schema
export const ThemesSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  display_name: Type.String(),
  description: Type.Optional(Type.String()),
  preview_image_url: Type.Optional(Type.String()),
  color_palette: Type.Optional(Type.Record(Type.String(), Type.Any())),
  css_variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
  is_active: Type.Optional(Type.Boolean()),
  is_default: Type.Optional(Type.Boolean()),
  sort_order: Type.Optional(Type.Integer()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateThemesSchema = Type.Object({
  name: Type.String(),
  display_name: Type.String(),
  description: Type.Optional(Type.String()),
  preview_image_url: Type.Optional(Type.String()),
  color_palette: Type.Optional(Type.Record(Type.String(), Type.Any())),
  css_variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
  is_active: Type.Optional(Type.Boolean()),
  is_default: Type.Optional(Type.Boolean()),
  sort_order: Type.Optional(Type.Integer()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateThemesSchema = Type.Partial(
  Type.Object({
    name: Type.String(),
    display_name: Type.String(),
    description: Type.Optional(Type.String()),
    preview_image_url: Type.Optional(Type.String()),
    color_palette: Type.Optional(Type.Record(Type.String(), Type.Any())),
    css_variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    is_active: Type.Optional(Type.Boolean()),
    is_default: Type.Optional(Type.Boolean()),
    sort_order: Type.Optional(Type.Integer()),
  }),
);

// ID Parameter Schema
export const ThemesIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetThemesQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListThemesQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'name:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "name", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  is_active: Type.Optional(Type.Boolean()),
  is_default: Type.Optional(Type.Boolean()),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const ThemesResponseSchema = ApiSuccessResponseSchema(ThemesSchema);
export const ThemesListResponseSchema = PaginatedResponseSchema(ThemesSchema);

// Partial Schemas for field selection support
export const PartialThemesSchema = Type.Partial(ThemesSchema);
export const FlexibleThemesListResponseSchema =
  PartialPaginatedResponseSchema(ThemesSchema);

// Export types
export type Themes = Static<typeof ThemesSchema>;
export type CreateThemes = Static<typeof CreateThemesSchema>;
export type UpdateThemes = Static<typeof UpdateThemesSchema>;
export type ThemesIdParam = Static<typeof ThemesIdParamSchema>;
export type GetThemesQuery = Static<typeof GetThemesQuerySchema>;
export type ListThemesQuery = Static<typeof ListThemesQuerySchema>;

// Partial types for field selection
export type PartialThemes = Static<typeof PartialThemesSchema>;
export type FlexibleThemesList = Static<
  typeof FlexibleThemesListResponseSchema
>;
