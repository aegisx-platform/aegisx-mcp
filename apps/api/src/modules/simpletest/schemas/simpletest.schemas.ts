import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../schemas/base.schemas';

// Base Simpletest Schema
export const SimpletestSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.Optional(Type.String()),
  status: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateSimpletestSchema = Type.Object({
  name: Type.Optional(Type.String()),
  status: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateSimpletestSchema = Type.Partial(
  Type.Object({
    name: Type.Optional(Type.String()),
    status: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const SimpletestIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetSimpletestQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListSimpletestQuerySchema = Type.Object({
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
  status: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const SimpletestResponseSchema =
  ApiSuccessResponseSchema(SimpletestSchema);
export const SimpletestListResponseSchema =
  PaginatedResponseSchema(SimpletestSchema);

// Partial Schemas for field selection support
export const PartialSimpletestSchema = Type.Partial(SimpletestSchema);
export const FlexibleSimpletestListResponseSchema =
  PartialPaginatedResponseSchema(SimpletestSchema);

// Export types
export type Simpletest = Static<typeof SimpletestSchema>;
export type CreateSimpletest = Static<typeof CreateSimpletestSchema>;
export type UpdateSimpletest = Static<typeof UpdateSimpletestSchema>;
export type SimpletestIdParam = Static<typeof SimpletestIdParamSchema>;
export type GetSimpletestQuery = Static<typeof GetSimpletestQuerySchema>;
export type ListSimpletestQuery = Static<typeof ListSimpletestQuerySchema>;

// Partial types for field selection
export type PartialSimpletest = Static<typeof PartialSimpletestSchema>;
export type FlexibleSimpletestList = Static<
  typeof FlexibleSimpletestListResponseSchema
>;
