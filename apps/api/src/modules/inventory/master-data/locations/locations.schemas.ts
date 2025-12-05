import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Locations Schema
export const LocationsSchema = Type.Object({
  id: Type.Integer(),
  location_code: Type.String(),
  location_name: Type.String(),
  location_type: Type.Any(),
  parent_id: Type.Optional(Type.Integer()),
  address: Type.Optional(Type.String()),
  responsible_person: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateLocationsSchema = Type.Object({
  location_code: Type.String(),
  location_name: Type.String(),
  location_type: Type.Any(),
  parent_id: Type.Optional(Type.Integer()),
  address: Type.Optional(Type.String()),
  responsible_person: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateLocationsSchema = Type.Partial(
  Type.Object({
    location_code: Type.String(),
    location_name: Type.String(),
    location_type: Type.Any(),
    parent_id: Type.Optional(Type.Integer()),
    address: Type.Optional(Type.String()),
    responsible_person: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const LocationsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetLocationsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListLocationsQuerySchema = Type.Object({
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
      examples: [
        'id:asc',
        'created_at:desc',
        'location_code:asc,created_at:desc',
      ],
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
          'Specific fields to return. Example: ["id", "location_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  location_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  location_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  parent_id: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  parent_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  address: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  responsible_person: Type.Optional(
    Type.String({ minLength: 1, maxLength: 50 }),
  ),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const LocationsResponseSchema =
  ApiSuccessResponseSchema(LocationsSchema);
export const LocationsListResponseSchema =
  PaginatedResponseSchema(LocationsSchema);

// Partial Schemas for field selection support
export const PartialLocationsSchema = Type.Partial(LocationsSchema);
export const FlexibleLocationsListResponseSchema =
  PartialPaginatedResponseSchema(LocationsSchema);

// Export types
export type Locations = Static<typeof LocationsSchema>;
export type CreateLocations = Static<typeof CreateLocationsSchema>;
export type UpdateLocations = Static<typeof UpdateLocationsSchema>;
export type LocationsIdParam = Static<typeof LocationsIdParamSchema>;
export type GetLocationsQuery = Static<typeof GetLocationsQuerySchema>;
export type ListLocationsQuery = Static<typeof ListLocationsQuerySchema>;

// Partial types for field selection
export type PartialLocations = Static<typeof PartialLocationsSchema>;
export type FlexibleLocationsList = Static<
  typeof FlexibleLocationsListResponseSchema
>;
