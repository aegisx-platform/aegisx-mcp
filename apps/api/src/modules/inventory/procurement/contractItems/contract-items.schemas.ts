import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base ContractItems Schema
export const ContractItemsSchema = Type.Object({
  id: Type.Number(),
  contract_id: Type.Number(),
  generic_id: Type.Integer(),
  agreed_unit_price: Type.Number(),
  quantity_limit: Type.Optional(Type.Number()),
  quantity_used: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateContractItemsSchema = Type.Object({
  contract_id: Type.Number(),
  generic_id: Type.Integer(),
  agreed_unit_price: Type.Number(),
  quantity_limit: Type.Optional(Type.Number()),
  quantity_used: Type.Optional(Type.Number()),
  notes: Type.Optional(Type.String()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateContractItemsSchema = Type.Partial(
  Type.Object({
    contract_id: Type.Number(),
    generic_id: Type.Integer(),
    agreed_unit_price: Type.Number(),
    quantity_limit: Type.Optional(Type.Number()),
    quantity_used: Type.Optional(Type.Number()),
    notes: Type.Optional(Type.String()),
  }),
);

// ID Parameter Schema
export const ContractItemsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetContractItemsQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListContractItemsQuerySchema = Type.Object({
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
        'contract_id:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "contract_id", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  contract_id: Type.Optional(Type.Number({ minimum: 0 })),
  contract_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  contract_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  generic_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  agreed_unit_price: Type.Optional(Type.Number({})),
  agreed_unit_price_min: Type.Optional(Type.Number({})),
  agreed_unit_price_max: Type.Optional(Type.Number({})),
  quantity_limit: Type.Optional(Type.Number({})),
  quantity_limit_min: Type.Optional(Type.Number({})),
  quantity_limit_max: Type.Optional(Type.Number({})),
  quantity_used: Type.Optional(Type.Number({})),
  quantity_used_min: Type.Optional(Type.Number({})),
  quantity_used_max: Type.Optional(Type.Number({})),
  notes: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

// Response Schemas using base wrappers
export const ContractItemsResponseSchema =
  ApiSuccessResponseSchema(ContractItemsSchema);
export const ContractItemsListResponseSchema =
  PaginatedResponseSchema(ContractItemsSchema);

// Partial Schemas for field selection support
export const PartialContractItemsSchema = Type.Partial(ContractItemsSchema);
export const FlexibleContractItemsListResponseSchema =
  PartialPaginatedResponseSchema(ContractItemsSchema);

// Export types
export type ContractItems = Static<typeof ContractItemsSchema>;
export type CreateContractItems = Static<typeof CreateContractItemsSchema>;
export type UpdateContractItems = Static<typeof UpdateContractItemsSchema>;
export type ContractItemsIdParam = Static<typeof ContractItemsIdParamSchema>;
export type GetContractItemsQuery = Static<typeof GetContractItemsQuerySchema>;
export type ListContractItemsQuery = Static<
  typeof ListContractItemsQuerySchema
>;

// Partial types for field selection
export type PartialContractItems = Static<typeof PartialContractItemsSchema>;
export type FlexibleContractItemsList = Static<
  typeof FlexibleContractItemsListResponseSchema
>;
