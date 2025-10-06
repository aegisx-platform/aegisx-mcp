import { Type, Static } from '@sinclair/typebox';
import {
  UuidParamSchema,
  PaginationQuerySchema,
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../schemas/base.schemas';

// Base SimpleTests Schema
export const SimpleTestsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  is_active: Type.Optional(Type.Boolean()),
  small_number: Type.Optional(Type.Integer()),
  regular_number: Type.Optional(Type.Integer()),
  big_number: Type.Optional(Type.Number()),
  decimal_field: Type.Optional(Type.Number()),
  float_field: Type.Optional(Type.Number()),
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  date_field: Type.Optional(Type.String({ format: 'date' })),
  datetime_field: Type.Optional(Type.String({ format: 'date-time' })),
  json_field: Type.Optional(Type.Record(Type.String(), Type.Any())),
  uuid_field: Type.Optional(Type.String({ format: 'uuid' })),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateSimpleTestsSchema = Type.Object({
  is_active: Type.Optional(Type.Boolean()),
  small_number: Type.Optional(Type.Integer()),
  regular_number: Type.Optional(Type.Integer()),
  big_number: Type.Optional(Type.Number()),
  decimal_field: Type.Optional(Type.Number()),
  float_field: Type.Optional(Type.Number()),
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  date_field: Type.Optional(Type.String({ format: 'date' })),
  datetime_field: Type.Optional(Type.String({ format: 'date-time' })),
  json_field: Type.Optional(Type.Record(Type.String(), Type.Any())),
  uuid_field: Type.Optional(Type.String({ format: 'uuid' })),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateSimpleTestsSchema = Type.Partial(
  Type.Object({
    is_active: Type.Optional(Type.Boolean()),
    small_number: Type.Optional(Type.Integer()),
    regular_number: Type.Optional(Type.Integer()),
    big_number: Type.Optional(Type.Number()),
    decimal_field: Type.Optional(Type.Number()),
    float_field: Type.Optional(Type.Number()),
    name: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    date_field: Type.Optional(Type.String({ format: 'date' })),
    datetime_field: Type.Optional(Type.String({ format: 'date-time' })),
    json_field: Type.Optional(Type.Record(Type.String(), Type.Any())),
    uuid_field: Type.Optional(Type.String({ format: 'uuid' })),
  }),
);

// ID Parameter Schema
export const SimpleTestsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetSimpleTestsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListSimpleTestsQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'is_active:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "is_active", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  is_active: Type.Optional(Type.Boolean()),
  date_field_min: Type.Optional(Type.String({ format: 'date-time' })),
  date_field_max: Type.Optional(Type.String({ format: 'date-time' })),
  datetime_field_min: Type.Optional(Type.String({ format: 'date-time' })),
  datetime_field_max: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
});

// Response Schemas using base wrappers
export const SimpleTestsResponseSchema =
  ApiSuccessResponseSchema(SimpleTestsSchema);
export const SimpleTestsListResponseSchema =
  PaginatedResponseSchema(SimpleTestsSchema);

// Partial Schemas for field selection support
export const PartialSimpleTestsSchema = Type.Partial(SimpleTestsSchema);
export const FlexibleSimpleTestsListResponseSchema =
  PartialPaginatedResponseSchema(SimpleTestsSchema);

// Export types
export type SimpleTests = Static<typeof SimpleTestsSchema>;
export type CreateSimpleTests = Static<typeof CreateSimpleTestsSchema>;
export type UpdateSimpleTests = Static<typeof UpdateSimpleTestsSchema>;
export type SimpleTestsIdParam = Static<typeof SimpleTestsIdParamSchema>;
export type GetSimpleTestsQuery = Static<typeof GetSimpleTestsQuerySchema>;
export type ListSimpleTestsQuery = Static<typeof ListSimpleTestsQuerySchema>;

// Partial types for field selection
export type PartialSimpleTests = Static<typeof PartialSimpleTestsSchema>;
export type FlexibleSimpleTestsList = Static<
  typeof FlexibleSimpleTestsListResponseSchema
>;
