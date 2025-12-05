import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base TmtMappings Schema
export const TmtMappingsSchema = Type.Object({
  id: Type.Number(),
  working_code: Type.Optional(Type.String()),
  drug_code: Type.Optional(Type.String()),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  tmt_level: Type.Optional(Type.Any()),
  tmt_concept_id: Type.Optional(Type.Number()),
  tmt_id: Type.Optional(Type.Number()),
  is_verified: Type.Optional(Type.Boolean()),
  verified_by: Type.Optional(Type.String({ format: 'uuid' })),
  verified_at: Type.Optional(Type.String({ format: 'date-time' })),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateTmtMappingsSchema = Type.Object({
  working_code: Type.Optional(Type.String()),
  drug_code: Type.Optional(Type.String()),
  generic_id: Type.Optional(Type.Integer()),
  drug_id: Type.Optional(Type.Integer()),
  tmt_level: Type.Optional(Type.Any()),
  tmt_concept_id: Type.Optional(Type.Number()),
  tmt_id: Type.Optional(Type.Number()),
  is_verified: Type.Optional(Type.Boolean()),
  verified_by: Type.Optional(Type.String({ format: 'uuid' })),
  verified_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateTmtMappingsSchema = Type.Partial(
  Type.Object({
    working_code: Type.Optional(Type.String()),
    drug_code: Type.Optional(Type.String()),
    generic_id: Type.Optional(Type.Integer()),
    drug_id: Type.Optional(Type.Integer()),
    tmt_level: Type.Optional(Type.Any()),
    tmt_concept_id: Type.Optional(Type.Number()),
    tmt_id: Type.Optional(Type.Number()),
    is_verified: Type.Optional(Type.Boolean()),
    verified_by: Type.Optional(Type.String({ format: 'uuid' })),
    verified_at: Type.Optional(Type.String({ format: 'date-time' })),
  }),
);

// ID Parameter Schema
export const TmtMappingsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetTmtMappingsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListTmtMappingsQuerySchema = Type.Object({
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
        'working_code:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "working_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  working_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  drug_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  drug_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_concept_id: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_concept_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_concept_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_id: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  tmt_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  is_verified: Type.Optional(Type.Boolean()),
  verified_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
});

// Response Schemas using base wrappers
export const TmtMappingsResponseSchema =
  ApiSuccessResponseSchema(TmtMappingsSchema);
export const TmtMappingsListResponseSchema =
  PaginatedResponseSchema(TmtMappingsSchema);

// Partial Schemas for field selection support
export const PartialTmtMappingsSchema = Type.Partial(TmtMappingsSchema);
export const FlexibleTmtMappingsListResponseSchema =
  PartialPaginatedResponseSchema(TmtMappingsSchema);

// Export types
export type TmtMappings = Static<typeof TmtMappingsSchema>;
export type CreateTmtMappings = Static<typeof CreateTmtMappingsSchema>;
export type UpdateTmtMappings = Static<typeof UpdateTmtMappingsSchema>;
export type TmtMappingsIdParam = Static<typeof TmtMappingsIdParamSchema>;
export type GetTmtMappingsQuery = Static<typeof GetTmtMappingsQuerySchema>;
export type ListTmtMappingsQuery = Static<typeof ListTmtMappingsQuerySchema>;

// Partial types for field selection
export type PartialTmtMappings = Static<typeof PartialTmtMappingsSchema>;
export type FlexibleTmtMappingsList = Static<
  typeof FlexibleTmtMappingsListResponseSchema
>;
