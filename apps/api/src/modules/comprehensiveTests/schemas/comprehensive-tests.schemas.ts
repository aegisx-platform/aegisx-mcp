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

// Base ComprehensiveTests Schema
export const ComprehensiveTestsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  slug: Type.Optional(Type.String()),
  short_code: Type.Optional(Type.String()),
  price: Type.Optional(Type.Number()),
  quantity: Type.Optional(Type.Integer()),
  weight: Type.Optional(Type.Number()),
  rating: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  is_available: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
  published_at: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at: Type.Optional(Type.String({ format: 'date' })),
  start_time: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  tags: Type.Optional(Type.Array(Type.String())),
  ip_address: Type.Optional(Type.Any()),
  website_url: Type.Optional(Type.String()),
  email_address: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  priority: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
});

// Create Schema (without auto-generated fields)
export const CreateComprehensiveTestsSchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
  slug: Type.Optional(Type.String()),
  short_code: Type.Optional(Type.String()),
  price: Type.Optional(Type.Number()),
  quantity: Type.Optional(Type.Integer()),
  weight: Type.Optional(Type.Number()),
  rating: Type.Optional(Type.Number()),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  is_available: Type.Optional(Type.Boolean()),
  published_at: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at: Type.Optional(Type.String({ format: 'date' })),
  start_time: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
  tags: Type.Optional(Type.Array(Type.String())),
  ip_address: Type.Optional(Type.Any()),
  website_url: Type.Optional(Type.String()),
  email_address: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  priority: Type.Optional(Type.String()),
  content: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateComprehensiveTestsSchema = Type.Partial(
  Type.Object({
    title: Type.String(),
    description: Type.Optional(Type.String()),
    slug: Type.Optional(Type.String()),
    short_code: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number()),
    quantity: Type.Optional(Type.Integer()),
    weight: Type.Optional(Type.Number()),
    rating: Type.Optional(Type.Number()),
    is_active: Type.Optional(Type.Boolean()),
    is_featured: Type.Optional(Type.Boolean()),
    is_available: Type.Optional(Type.Boolean()),
    published_at: Type.Optional(Type.String({ format: 'date-time' })),
    expires_at: Type.Optional(Type.String({ format: 'date' })),
    start_time: Type.Optional(Type.String()),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
    tags: Type.Optional(Type.Array(Type.String())),
    ip_address: Type.Optional(Type.Any()),
    website_url: Type.Optional(Type.String()),
    email_address: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    priority: Type.Optional(Type.String()),
    content: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const ComprehensiveTestsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetComprehensiveTestsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListComprehensiveTestsQuerySchema = Type.Object({
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

  // Smart field-based filters
  short_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  price_min: Type.Optional(Type.Number({})),
  price_max: Type.Optional(Type.Number({})),
  quantity_min: Type.Optional(Type.Number({})),
  quantity_max: Type.Optional(Type.Number({})),
  weight_min: Type.Optional(Type.Number({})),
  weight_max: Type.Optional(Type.Number({})),
  rating_min: Type.Optional(Type.Number({})),
  rating_max: Type.Optional(Type.Number({})),
  is_active: Type.Optional(Type.Boolean()),
  is_featured: Type.Optional(Type.Boolean()),
  is_available: Type.Optional(Type.Boolean()),
  updated_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  published_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  published_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at_min: Type.Optional(Type.String({ format: 'date-time' })),
  expires_at_max: Type.Optional(Type.String({ format: 'date-time' })),
  status: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

// Response Schemas using base wrappers
export const ComprehensiveTestsResponseSchema = ApiSuccessResponseSchema(
  ComprehensiveTestsSchema,
);
export const ComprehensiveTestsListResponseSchema = PaginatedResponseSchema(
  ComprehensiveTestsSchema,
);

// Partial Schemas for field selection support
export const PartialComprehensiveTestsSchema = Type.Partial(
  ComprehensiveTestsSchema,
);
export const FlexibleComprehensiveTestsListResponseSchema =
  PartialPaginatedResponseSchema(ComprehensiveTestsSchema);

// Export types
export type ComprehensiveTests = Static<typeof ComprehensiveTestsSchema>;
export type CreateComprehensiveTests = Static<
  typeof CreateComprehensiveTestsSchema
>;
export type UpdateComprehensiveTests = Static<
  typeof UpdateComprehensiveTestsSchema
>;
export type ComprehensiveTestsIdParam = Static<
  typeof ComprehensiveTestsIdParamSchema
>;
export type GetComprehensiveTestsQuery = Static<
  typeof GetComprehensiveTestsQuerySchema
>;
export type ListComprehensiveTestsQuery = Static<
  typeof ListComprehensiveTestsQuerySchema
>;

// Partial types for field selection
export type PartialComprehensiveTests = Static<
  typeof PartialComprehensiveTestsSchema
>;
export type FlexibleComprehensiveTestsList = Static<
  typeof FlexibleComprehensiveTestsListResponseSchema
>;
