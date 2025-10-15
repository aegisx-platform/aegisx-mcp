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
  ValidationRequestSchema,
  UniquenessCheckSchema,
} from '../../../schemas/base.schemas';

// Base Books Schema
export const BooksSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author_id: Type.String({ format: 'uuid' }),
  isbn: Type.Optional(Type.String()),
  pages: Type.Optional(Type.Integer()),
  published_date: Type.Optional(Type.String({ format: 'date' })),
  price: Type.Optional(Type.Number()),
  genre: Type.Optional(Type.String()),
  available: Type.Optional(Type.Boolean()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateBooksSchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author_id: Type.String({ format: 'uuid' }),
  isbn: Type.Optional(Type.String()),
  pages: Type.Optional(Type.Integer()),
  published_date: Type.Optional(Type.String({ format: 'date' })),
  price: Type.Optional(Type.Number()),
  genre: Type.Optional(Type.String()),
  available: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateBooksSchema = Type.Partial(
  Type.Object({
    title: Type.String(),
    description: Type.Optional(Type.String()),
    author_id: Type.String({ format: 'uuid' }),
    isbn: Type.Optional(Type.String()),
    pages: Type.Optional(Type.Integer()),
    published_date: Type.Optional(Type.String({ format: 'date' })),
    price: Type.Optional(Type.Number()),
    genre: Type.Optional(Type.String()),
    available: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const BooksIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetBooksQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListBooksQuerySchema = Type.Object({
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
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  author_id: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  isbn: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  published_date_min: Type.Optional(Type.String({ format: 'date' })),
  published_date_max: Type.Optional(Type.String({ format: 'date' })),
  price_min: Type.Optional(Type.Number({})),
  price_max: Type.Optional(Type.Number({})),
  genre: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  available: Type.Optional(Type.Boolean()),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const BooksResponseSchema = ApiSuccessResponseSchema(BooksSchema);
export const BooksListResponseSchema = PaginatedResponseSchema(BooksSchema);

// Partial Schemas for field selection support
export const PartialBooksSchema = Type.Partial(BooksSchema);
export const FlexibleBooksListResponseSchema =
  PartialPaginatedResponseSchema(BooksSchema);

// Export types
export type Books = Static<typeof BooksSchema>;
export type CreateBooks = Static<typeof CreateBooksSchema>;
export type UpdateBooks = Static<typeof UpdateBooksSchema>;
export type BooksIdParam = Static<typeof BooksIdParamSchema>;
export type GetBooksQuery = Static<typeof GetBooksQuerySchema>;
export type ListBooksQuery = Static<typeof ListBooksQuerySchema>;

// Partial types for field selection
export type PartialBooks = Static<typeof PartialBooksSchema>;
export type FlexibleBooksList = Static<typeof FlexibleBooksListResponseSchema>;
