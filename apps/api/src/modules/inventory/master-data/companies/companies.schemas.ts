import { Type, Static } from '@sinclair/typebox';
import {
  ApiSuccessResponseSchema,
  PaginatedResponseSchema,
  PartialPaginatedResponseSchema,
} from '../../../../schemas/base.schemas';

// Base Companies Schema
export const CompaniesSchema = Type.Object({
  id: Type.Integer(),
  company_code: Type.String(),
  company_name: Type.String(),
  tax_id: Type.Optional(Type.String()),
  bank_id: Type.Optional(Type.Integer()),
  bank_account_number: Type.Optional(Type.String()),
  bank_account_name: Type.Optional(Type.String()),
  is_vendor: Type.Optional(Type.Boolean()),
  is_manufacturer: Type.Optional(Type.Boolean()),
  contact_person: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateCompaniesSchema = Type.Object({
  company_code: Type.String(),
  company_name: Type.String(),
  tax_id: Type.Optional(Type.String()),
  bank_id: Type.Optional(Type.Integer()),
  bank_account_number: Type.Optional(Type.String()),
  bank_account_name: Type.Optional(Type.String()),
  is_vendor: Type.Optional(Type.Boolean()),
  is_manufacturer: Type.Optional(Type.Boolean()),
  contact_person: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial, without auto-generated fields)
export const UpdateCompaniesSchema = Type.Partial(
  Type.Object({
    company_code: Type.String(),
    company_name: Type.String(),
    tax_id: Type.Optional(Type.String()),
    bank_id: Type.Optional(Type.Integer()),
    bank_account_number: Type.Optional(Type.String()),
    bank_account_name: Type.Optional(Type.String()),
    is_vendor: Type.Optional(Type.Boolean()),
    is_manufacturer: Type.Optional(Type.Boolean()),
    contact_person: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
);

// ID Parameter Schema
export const CompaniesIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schemas
export const GetCompaniesQuerySchema = Type.Object({
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),
});

export const ListCompaniesQuerySchema = Type.Object({
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
        'company_code:asc,created_at:desc',
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
          'Specific fields to return. Example: ["id", "company_code", "created_at"]. Field access is role-based for security.',
      },
    ),
  ),

  // Include related data (only if table has foreign keys)
  include: Type.Optional(
    Type.Union([Type.String(), Type.Array(Type.String())]),
  ),

  // Smart field-based filters
  company_code: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  company_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  tax_id: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  bank_id: Type.Optional(Type.Number({ minimum: 0 })),
  bank_id_min: Type.Optional(Type.Number({ minimum: 0 })),
  bank_id_max: Type.Optional(Type.Number({ minimum: 0 })),
  bank_account_number: Type.Optional(
    Type.String({ minLength: 1, maxLength: 50 }),
  ),
  bank_account_name: Type.Optional(
    Type.String({ minLength: 1, maxLength: 100 }),
  ),
  is_vendor: Type.Optional(Type.Boolean()),
  is_manufacturer: Type.Optional(Type.Boolean()),
  contact_person: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  phone: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  email: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  address: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas using base wrappers
export const CompaniesResponseSchema =
  ApiSuccessResponseSchema(CompaniesSchema);
export const CompaniesListResponseSchema =
  PaginatedResponseSchema(CompaniesSchema);

// Partial Schemas for field selection support
export const PartialCompaniesSchema = Type.Partial(CompaniesSchema);
export const FlexibleCompaniesListResponseSchema =
  PartialPaginatedResponseSchema(CompaniesSchema);

// Export types
export type Companies = Static<typeof CompaniesSchema>;
export type CreateCompanies = Static<typeof CreateCompaniesSchema>;
export type UpdateCompanies = Static<typeof UpdateCompaniesSchema>;
export type CompaniesIdParam = Static<typeof CompaniesIdParamSchema>;
export type GetCompaniesQuery = Static<typeof GetCompaniesQuerySchema>;
export type ListCompaniesQuery = Static<typeof ListCompaniesQuerySchema>;

// Partial types for field selection
export type PartialCompanies = Static<typeof PartialCompaniesSchema>;
export type FlexibleCompaniesList = Static<
  typeof FlexibleCompaniesListResponseSchema
>;
