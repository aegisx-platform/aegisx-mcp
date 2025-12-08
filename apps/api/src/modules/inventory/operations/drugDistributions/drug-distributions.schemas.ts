import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base DrugDistributions Schema
export const DrugDistributionsSchema = Type.Object({
  id: Type.Number(),
  distribution_number: Type.String(),
  distribution_date: Type.String({ format: 'date' }),
  distribution_type_id: Type.Optional(Type.Integer()),
  from_location_id: Type.Integer(),
  to_location_id: Type.Optional(Type.Integer()),
  requesting_dept_id: Type.Integer(),
  requested_by: Type.Optional(Type.String()),
  approved_by: Type.Optional(Type.String()),
  dispensed_by: Type.Optional(Type.String()),
  status: Type.Optional(Type.Any()),
  total_items: Type.Optional(Type.Integer()),
  total_amount: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugDistributionsSchema = Type.Object({
  distribution_number: Type.String(),
  distribution_date: Type.String({ format: 'date' }),
  distribution_type_id: Type.Optional(Type.Integer()),
  from_location_id: Type.Integer(),
  to_location_id: Type.Optional(Type.Integer()),
  requesting_dept_id: Type.Integer(),
  requested_by: Type.Optional(Type.String()),
  approved_by: Type.Optional(Type.String()),
  dispensed_by: Type.Optional(Type.String()),
  status: Type.Optional(Type.Any()),
  total_items: Type.Optional(Type.Integer()),
  total_amount: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateDrugDistributionsSchema = Type.Partial(
  Type.Object({
    distribution_number: Type.String(),
    distribution_date: Type.String({ format: 'date' }),
    distribution_type_id: Type.Optional(Type.Integer()),
    from_location_id: Type.Integer(),
    to_location_id: Type.Optional(Type.Integer()),
    requesting_dept_id: Type.Integer(),
    requested_by: Type.Optional(Type.String()),
    approved_by: Type.Optional(Type.String()),
    dispensed_by: Type.Optional(Type.String()),
    status: Type.Optional(Type.Any()),
    total_items: Type.Optional(Type.Integer()),
    total_amount: Type.Optional(Type.Number()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const DrugDistributionsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetDrugDistributionsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListDrugDistributionsQuerySchema = Type.Object({
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
        'distribution_number:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "distribution_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  distribution_number: Type.Optional(
    Type.String({ minLength: 1, maxLength: 50 }),
  ),
  distribution_type_id: Type.Optional(Type.Number({ minimum: 0 })),
  distribution_type_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  distribution_type_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  from_location_id: Type.Optional(Type.Number({ minimum: 0 })),
  from_location_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  from_location_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  to_location_id: Type.Optional(Type.Number({ minimum: 0 })),
  to_location_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  to_location_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  requesting_dept_id: Type.Optional(Type.Number({ minimum: 0 })),
  requesting_dept_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  requesting_dept_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  requested_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  approved_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  dispensed_by: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  total_items: Type.Optional(Type.Number({ minimum: 0 })),
  total_items_min: Type.Optional(Type.Number({ minimum: 0 })),
  total_items_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_amount: Type.Optional(Type.Number({})),
  total_amount_min: Type.Optional(Type.Number({})),
  total_amount_max: Type.Optional(Type.Number({})),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const DrugDistributionsResponseSchema = ApiSuccessResponseSchema(
  DrugDistributionsSchema,
);
export const DrugDistributionsListResponseSchema = PaginatedResponseSchema(
  DrugDistributionsSchema,
);

// Partial Schemas for field selection support
export const PartialDrugDistributionsSchema = Type.Partial(
  DrugDistributionsSchema,
);
export const FlexibleDrugDistributionsListResponseSchema =
  PartialPaginatedResponseSchema(DrugDistributionsSchema);

// Export types
export type DrugDistributions = Static<typeof DrugDistributionsSchema>;
export type CreateDrugDistributions = Static<
  typeof CreateDrugDistributionsSchema
>;
export type UpdateDrugDistributions = Static<
  typeof UpdateDrugDistributionsSchema
>;
export type DrugDistributionsIdParam = Static<
  typeof DrugDistributionsIdParamSchema
>;
export type GetDrugDistributionsQuery = Static<
  typeof GetDrugDistributionsQuerySchema
>;
export type ListDrugDistributionsQuery = Static<
  typeof ListDrugDistributionsQuerySchema
>;

// Partial types for field selection
export type PartialDrugDistributions = Static<
  typeof PartialDrugDistributionsSchema
>;
export type FlexibleDrugDistributionsList = Static<
  typeof FlexibleDrugDistributionsListResponseSchema
>;
