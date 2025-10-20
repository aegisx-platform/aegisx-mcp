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

// Base Authors Schema
export const AuthorsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  email: Type.String(),
  bio: Type.Optional(Type.String()),
  birth_date: Type.Optional(Type.String({ format: 'date' })),
  country: Type.Optional(Type.String()),
  active: Type.Optional(Type.Boolean()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create Schema (without auto-generated fields)
export const CreateAuthorsSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
  bio: Type.Optional(Type.String()),
  birth_date: Type.Optional(Type.String({ format: 'date' })),
  country: Type.Optional(Type.String()),
  active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateAuthorsSchema = Type.Partial(
  Type.Object({
    name: Type.String(),
    email: Type.String(),
    bio: Type.Optional(Type.String()),
    birth_date: Type.Optional(Type.String({ format: 'date' })),
    country: Type.Optional(Type.String()),
    active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const AuthorsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetAuthorsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListAuthorsQuerySchema = Type.Object({
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
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  email: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  birth_date_min: Type.Optional(Type.String({ format: 'date' })),
  birth_date_max: Type.Optional(Type.String({ format: 'date' })),
  country: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  active: Type.Optional(Type.Boolean()),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const AuthorsResponseSchema = ApiSuccessResponseSchema(AuthorsSchema);
export const AuthorsListResponseSchema = PaginatedResponseSchema(AuthorsSchema);

// Partial Schemas for field selection support
export const PartialAuthorsSchema = Type.Partial(AuthorsSchema);
export const FlexibleAuthorsListResponseSchema =
  PartialPaginatedResponseSchema(AuthorsSchema);

// Export types
export type Authors = Static<typeof AuthorsSchema>;
export type CreateAuthors = Static<typeof CreateAuthorsSchema>;
export type UpdateAuthors = Static<typeof UpdateAuthorsSchema>;
export type AuthorsIdParam = Static<typeof AuthorsIdParamSchema>;
export type GetAuthorsQuery = Static<typeof GetAuthorsQuerySchema>;
export type ListAuthorsQuery = Static<typeof ListAuthorsQuerySchema>;

// Partial types for field selection
export type PartialAuthors = Static<typeof PartialAuthorsSchema>;
export type FlexibleAuthorsList = Static<
  typeof FlexibleAuthorsListResponseSchema
>;

// WebSocket Event Schemas
export const AuthorsCreatedEventSchema = Type.Object({
  type: Type.Literal('authors.created'),
  data: AuthorsSchema,
});

export const AuthorsUpdatedEventSchema = Type.Object({
  type: Type.Literal('authors.updated'),
  data: AuthorsSchema,
});

export const AuthorsDeletedEventSchema = Type.Object({
  type: Type.Literal('authors.deleted'),
  data: Type.Object({
    id: Type.Union([Type.String(), Type.Number()]),
  }),
});

export type AuthorsCreatedEvent = Static<typeof AuthorsCreatedEventSchema>;
export type AuthorsUpdatedEvent = Static<typeof AuthorsUpdatedEventSchema>;
export type AuthorsDeletedEvent = Static<typeof AuthorsDeletedEventSchema>;
