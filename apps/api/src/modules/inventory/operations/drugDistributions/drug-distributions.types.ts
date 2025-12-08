// Import and re-export types from schemas for convenience
import {
  type DrugDistributions,
  type CreateDrugDistributions,
  type UpdateDrugDistributions,
  type DrugDistributionsIdParam,
  type GetDrugDistributionsQuery,
  type ListDrugDistributionsQuery,
} from './drug-distributions.schemas';

export {
  type DrugDistributions,
  type CreateDrugDistributions,
  type UpdateDrugDistributions,
  type DrugDistributionsIdParam,
  type GetDrugDistributionsQuery,
  type ListDrugDistributionsQuery,
};

// Additional type definitions
export interface DrugDistributionsRepository {
  create(data: CreateDrugDistributions): Promise<DrugDistributions>;
  findById(id: number | string): Promise<DrugDistributions | null>;
  findMany(query: ListDrugDistributionsQuery): Promise<{
    data: DrugDistributions[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugDistributions,
  ): Promise<DrugDistributions | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugDistributionsEntity {
  id: number;
  distribution_number: string;
  distribution_date: Date;
  distribution_type_id: number | null;
  from_location_id: number;
  to_location_id: number | null;
  requesting_dept_id: number;
  requested_by: string | null;
  approved_by: string | null;
  dispensed_by: string | null;
  status: any | null;
  total_items: number | null;
  total_amount: number | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugDistributions module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugDistributionsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_DISTRIBUTIONS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_DISTRIBUTIONS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DRUG_DISTRIBUTIONS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS = 'DRUG_DISTRIBUTIONS_CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_AMOUNT = 'DRUG_DISTRIBUTIONS_INVALID_VALUE_TOTAL_AMOUNT',
}

/**
 * Error messages mapped to error codes
 */
export const DrugDistributionsErrorMessages: Record<
  DrugDistributionsErrorCode,
  string
> = {
  [DrugDistributionsErrorCode.NOT_FOUND]: 'DrugDistributions not found',
  [DrugDistributionsErrorCode.VALIDATION_ERROR]:
    'DrugDistributions validation failed',

  // Delete validation messages
  [DrugDistributionsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete drugDistributions - has related records',
  [DrugDistributionsErrorCode.CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS]:
    'Cannot delete drugDistributions - has drug_distribution_items references',

  // Business rule messages
  [DrugDistributionsErrorCode.INVALID_VALUE_TOTAL_AMOUNT]:
    'total_amount must be a positive number',
};
