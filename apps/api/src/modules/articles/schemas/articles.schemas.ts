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

// Base Articles Schema
export const ArticlesSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  content: Type.Optional(Type.String()),
  author_id: Type.String({ format: 'uuid' }),
  published: Type.Optional(Type.Boolean()),
  published_at: Type.Optional(Type.String({ format: 'date-time' })),
  view_count: Type.Optional(Type.Integer()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateArticlesSchema = Type.Object({
  title: Type.String(),
  content: Type.Optional(Type.String()),
  author_id: Type.String({ format: 'uuid' }),
  published: Type.Optional(Type.Boolean()),
  published_at: Type.Optional(Type.String({ format: 'date-time' })),
  view_count: Type.Optional(Type.Integer()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateArticlesSchema = Type.Partial(
  Type.Object({
    title: Type.String(),
    content: Type.Optional(Type.String()),
    author_id: Type.String({ format: 'uuid' }),
    published: Type.Optional(Type.Boolean()),
    published_at: Type.Optional(Type.String({ format: 'date-time' })),
    view_count: Type.Optional(Type.Integer()),
  }),
);

// ID Parameter Schema
export const ArticlesIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetArticlesQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListArticlesQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'title:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "title", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  published: Type.Optional(Type.Boolean()),
  published_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  published_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  view_count_min: Type.Optional(Type.Number({})),
  view_count_max: Type.Optional(Type.Number({})),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const ArticlesResponseSchema = ApiSuccessResponseSchema(ArticlesSchema);
export const ArticlesListResponseSchema =
  PaginatedResponseSchema(ArticlesSchema);

// Partial Schemas for field selection support
export const PartialArticlesSchema = Type.Partial(ArticlesSchema);
export const FlexibleArticlesListResponseSchema =
  PartialPaginatedResponseSchema(ArticlesSchema);

// Export types
export type Articles = Static<typeof ArticlesSchema>;
export type CreateArticles = Static<typeof CreateArticlesSchema>;
export type UpdateArticles = Static<typeof UpdateArticlesSchema>;
export type ArticlesIdParam = Static<typeof ArticlesIdParamSchema>;
export type GetArticlesQuery = Static<typeof GetArticlesQuerySchema>;
export type ListArticlesQuery = Static<typeof ListArticlesQuerySchema>;

// Partial types for field selection
export type PartialArticles = Static<typeof PartialArticlesSchema>;
export type FlexibleArticlesList = Static<
  typeof FlexibleArticlesListResponseSchema
>;
