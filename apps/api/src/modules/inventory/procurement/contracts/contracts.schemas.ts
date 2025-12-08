import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Contracts Schema
export const ContractsSchema = Type.Object({
  id: Type.Number(),
  contract_number: Type.String(),
  contract_type: Type.Any(),
  vendor_id: Type.Integer(),
  start_date: Type.String({ format: 'date' }),
  end_date: Type.String({ format: 'date' }),
  total_value: Type.Number(),
  remaining_value: Type.Number(),
  fiscal_year: Type.String(),
  status: Type.Optional(Type.Any()),
  egp_number: Type.Optional(Type.String()),
  project_number: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateContractsSchema = Type.Object({
  contract_number: Type.String(),
  contract_type: Type.Any(),
  vendor_id: Type.Integer(),
  start_date: Type.String({ format: 'date' }),
  end_date: Type.String({ format: 'date' }),
  total_value: Type.Number(),
  remaining_value: Type.Number(),
  fiscal_year: Type.String(),
  status: Type.Optional(Type.Any()),
  egp_number: Type.Optional(Type.String()),
  project_number: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateContractsSchema = Type.Partial(
  Type.Object({
    contract_number: Type.String(),
    contract_type: Type.Any(),
    vendor_id: Type.Integer(),
    start_date: Type.String({ format: 'date' }),
    end_date: Type.String({ format: 'date' }),
    total_value: Type.Number(),
    remaining_value: Type.Number(),
    fiscal_year: Type.String(),
    status: Type.Optional(Type.Any()),
    egp_number: Type.Optional(Type.String()),
    project_number: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const ContractsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetContractsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListContractsQuerySchema = Type.Object({
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
        'contract_number:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "contract_number", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  contract_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  vendor_id: Type.Optional(Type.Number({ minimum: 0 })),
  vendor_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  vendor_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  total_value: Type.Optional(Type.Number({ minimum: 0 })),
  total_value_min: Type.Optional(Type.Number({ minimum: 0 })),
  total_value_max: Type.Optional(Type.Number({ minimum: 0 })),
  remaining_value: Type.Optional(Type.Number({ minimum: 0 })),
  remaining_value_min: Type.Optional(Type.Number({ minimum: 0 })),
  remaining_value_max: Type.Optional(Type.Number({ minimum: 0 })),
  fiscal_year: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  egp_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  project_number: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const ContractsResponseSchema =
  ApiSuccessResponseSchema(ContractsSchema);
export const ContractsListResponseSchema =
  PaginatedResponseSchema(ContractsSchema);

// Partial Schemas for field selection support
export const PartialContractsSchema = Type.Partial(ContractsSchema);
export const FlexibleContractsListResponseSchema =
  PartialPaginatedResponseSchema(ContractsSchema);

// Export types
export type Contracts = Static<typeof ContractsSchema>;
export type CreateContracts = Static<typeof CreateContractsSchema>;
export type UpdateContracts = Static<typeof UpdateContractsSchema>;
export type ContractsIdParam = Static<typeof ContractsIdParamSchema>;
export type GetContractsQuery = Static<typeof GetContractsQuerySchema>;
export type ListContractsQuery = Static<typeof ListContractsQuerySchema>;

// Partial types for field selection
export type PartialContracts = Static<typeof PartialContractsSchema>;
export type FlexibleContractsList = Static<
  typeof FlexibleContractsListResponseSchema
>;
