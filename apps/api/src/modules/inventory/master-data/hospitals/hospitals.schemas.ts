import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Hospitals Schema
export const HospitalsSchema = Type.Object({
  id: Type.Integer(),
  hospital_code: Type.String(),
  hospital_name: Type.String(),
  hospital_type: Type.Optional(Type.String()),
  province: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateHospitalsSchema = Type.Object({
  hospital_code: Type.String(),
  hospital_name: Type.String(),
  hospital_type: Type.Optional(Type.String()),
  province: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateHospitalsSchema = Type.Partial(
  Type.Object({
    hospital_code: Type.String(),
    hospital_name: Type.String(),
    hospital_type: Type.Optional(Type.String()),
    province: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const HospitalsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetHospitalsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListHospitalsQuerySchema = Type.Object({
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
        'hospital_code:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "hospital_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)

  // Smart field-based filters
  hospital_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  hospital_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  hospital_type: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  province: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  region: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const HospitalsResponseSchema =
  ApiSuccessResponseSchema(HospitalsSchema);
export const HospitalsListResponseSchema =
  PaginatedResponseSchema(HospitalsSchema);

// Partial Schemas for field selection support
export const PartialHospitalsSchema = Type.Partial(HospitalsSchema);
export const FlexibleHospitalsListResponseSchema =
  PartialPaginatedResponseSchema(HospitalsSchema);

// Export types
export type Hospitals = Static<typeof HospitalsSchema>;
export type CreateHospitals = Static<typeof CreateHospitalsSchema>;
export type UpdateHospitals = Static<typeof UpdateHospitalsSchema>;
export type HospitalsIdParam = Static<typeof HospitalsIdParamSchema>;
export type GetHospitalsQuery = Static<typeof GetHospitalsQuerySchema>;
export type ListHospitalsQuery = Static<typeof ListHospitalsQuerySchema>;

// Partial types for field selection
export type PartialHospitals = Static<typeof PartialHospitalsSchema>;
export type FlexibleHospitalsList = Static<
  typeof FlexibleHospitalsListResponseSchema
>;
