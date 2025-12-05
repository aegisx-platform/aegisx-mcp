// Import and re-export types from schemas for convenience
import {
  type Companies,
  type CreateCompanies,
  type UpdateCompanies,
  type CompaniesIdParam,
  type GetCompaniesQuery,
  type ListCompaniesQuery,
} from './companies.schemas';

export {
  type Companies,
  type CreateCompanies,
  type UpdateCompanies,
  type CompaniesIdParam,
  type GetCompaniesQuery,
  type ListCompaniesQuery,
};

// Additional type definitions
export interface CompaniesRepository {
  create(data: CreateCompanies): Promise<Companies>;
  findById(id: number | string): Promise<Companies | null>;
  findMany(query: ListCompaniesQuery): Promise<{
    data: Companies[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateCompanies): Promise<Companies | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface CompaniesEntity {
  id: number;
  company_code: string;
  company_name: string;
  tax_id: string | null;
  bank_id: number | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  is_vendor: boolean | null;
  is_manufacturer: boolean | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Companies module
 * Auto-generated based on database constraints and business rules
 */
export enum CompaniesErrorCode {
  // Standard errors
  NOT_FOUND = 'COMPANIES_NOT_FOUND',
  VALIDATION_ERROR = 'COMPANIES_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'COMPANIES_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_CONTRACTS = 'COMPANIES_CANNOT_DELETE_HAS_CONTRACTS',
  CANNOT_DELETE_HAS_DRUG_PACK_RATIOS = 'COMPANIES_CANNOT_DELETE_HAS_DRUG_PACK_RATIOS',
  CANNOT_DELETE_HAS_DRUGS = 'COMPANIES_CANNOT_DELETE_HAS_DRUGS',
  CANNOT_DELETE_HAS_PURCHASE_ORDERS = 'COMPANIES_CANNOT_DELETE_HAS_PURCHASE_ORDERS',

  // Business rule validation errors (422)
  INVALID_PHONE_PHONE = 'COMPANIES_INVALID_PHONE_PHONE',
  INVALID_EMAIL_EMAIL = 'COMPANIES_INVALID_EMAIL_EMAIL',
}

/**
 * Error messages mapped to error codes
 */
export const CompaniesErrorMessages: Record<CompaniesErrorCode, string> = {
  [CompaniesErrorCode.NOT_FOUND]: 'Companies not found',
  [CompaniesErrorCode.VALIDATION_ERROR]: 'Companies validation failed',

  // Delete validation messages
  [CompaniesErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete companies - has related records',
  [CompaniesErrorCode.CANNOT_DELETE_HAS_CONTRACTS]:
    'Cannot delete companies - has contracts references',
  [CompaniesErrorCode.CANNOT_DELETE_HAS_DRUG_PACK_RATIOS]:
    'Cannot delete companies - has drug_pack_ratios references',
  [CompaniesErrorCode.CANNOT_DELETE_HAS_DRUGS]:
    'Cannot delete companies - has drugs references',
  [CompaniesErrorCode.CANNOT_DELETE_HAS_PURCHASE_ORDERS]:
    'Cannot delete companies - has purchase_orders references',

  // Business rule messages
  [CompaniesErrorCode.INVALID_PHONE_PHONE]:
    'phone must be a valid phone number',
  [CompaniesErrorCode.INVALID_EMAIL_EMAIL]:
    'email must be a valid email address',
};
