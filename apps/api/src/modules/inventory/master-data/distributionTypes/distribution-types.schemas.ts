import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DistributionTypes Schema
export const DistributionTypesSchema = Type.Object({
  id: Type.Integer(),
  type_code: Type.String(),
  type_name: Type.String(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDistributionTypesSchema = Type.Object({
  type_code: Type.String(),
  type_name: Type.String(),
  description: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDistributionTypesSchema = Type.Partial(
  Type.Object({
    type_code: Type.String(),
    type_name: Type.String(),
    description: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const DistributionTypesIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDistributionTypesQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDistributionTypesQuerySchema = Type.Object({
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
      examples: ['id:asc', 'created_at:desc', 'type_code:asc,created_at:desc'],
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
          'Specific fields to return. Example: ["id", "type_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  type_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  type_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const DistributionTypesResponseSchema = ApiSuccessResponseSchema(
  DistributionTypesSchema,
);
export const DistributionTypesListResponseSchema = PaginatedResponseSchema(
  DistributionTypesSchema,
);

// Partial Schemas for field selection support
export const PartialDistributionTypesSchema = Type.Partial(
  DistributionTypesSchema,
);
export const FlexibleDistributionTypesListResponseSchema =
  PartialPaginatedResponseSchema(DistributionTypesSchema);

// Export types
export type DistributionTypes = Static<typeof DistributionTypesSchema>;
export type CreateDistributionTypes = Static<
  typeof CreateDistributionTypesSchema
>;
export type UpdateDistributionTypes = Static<
  typeof UpdateDistributionTypesSchema
>;
export type DistributionTypesIdParam = Static<
  typeof DistributionTypesIdParamSchema
>;
export type GetDistributionTypesQuery = Static<
  typeof GetDistributionTypesQuerySchema
>;
export type ListDistributionTypesQuery = Static<
  typeof ListDistributionTypesQuerySchema
>;

// Partial types for field selection
export type PartialDistributionTypes = Static<
  typeof PartialDistributionTypesSchema
>;
export type FlexibleDistributionTypesList = Static<
  typeof FlexibleDistributionTypesListResponseSchema
>;
