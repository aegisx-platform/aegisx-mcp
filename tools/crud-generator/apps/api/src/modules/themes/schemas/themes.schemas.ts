import { Type, Static } from '@sinclair/typebox';
import { 
  UuidParamSchema, 
  PaginationQuerySchema, 
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema 
} from '../../../schemas/base.schemas';

// Base Themes Schema
export const ThemesSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  display_name: Type.String(),
  description: Type.Optional(Type.String()),
  preview_image_url: Type.Optional(Type.String()),
  color_palette: Type.Optional(Type.Record(Type.String(), Type.Any())),
  css_variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
  is_active: Type.Optional(Type.Boolean()),
  is_default: Type.Optional(Type.Boolean()),
  sort_order: Type.Optional(Type.Integer()),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" })
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
  })
);

// ID Parameter Schema
export const ThemesIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()])
});

// Query Schemas
export const GetThemesQuerySchema = Type.Object({
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ]))
});

export const ListThemesQuerySchema = Type.Object({
  // Pagination parameters
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  order: Type.Optional(Type.Union([
    Type.Literal('asc'), 
    Type.Literal('desc')
  ], { default: 'asc' })),
  
  // Search and filtering
  search: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  
  // Include related data
  include: Type.Optional(Type.Union([
    Type.String(),
    Type.Array(Type.String())
  ])),
  
  // Add column-specific filters dynamically
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  display_name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  preview_image_url: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  is_active: Type.Optional(Type.Boolean()),
  is_default: Type.Optional(Type.Boolean()),
  sort_order: Type.Optional(Type.Number({ minimum: 0 })),
});

// Response Schemas using base wrappers
export const ThemesResponseSchema = ApiSuccessResponseSchema(ThemesSchema);
export const ThemesListResponseSchema = PaginatedResponseSchema(ThemesSchema);

// Export types
export type Themes = Static<typeof ThemesSchema>;
export type CreateThemes = Static<typeof CreateThemesSchema>;
export type UpdateThemes = Static<typeof UpdateThemesSchema>;
export type ThemesIdParam = Static<typeof ThemesIdParamSchema>;
export type GetThemesQuery = Static<typeof GetThemesQuerySchema>;
export type ListThemesQuery = Static<typeof ListThemesQuerySchema>;

