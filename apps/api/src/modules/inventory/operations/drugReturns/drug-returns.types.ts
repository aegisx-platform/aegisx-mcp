// Import and re-export types from schemas for convenience
import {
  type DrugReturns,
  type CreateDrugReturns,
  type UpdateDrugReturns,
  type DrugReturnsIdParam,
  type GetDrugReturnsQuery,
  type ListDrugReturnsQuery,
} from './drug-returns.schemas';

export {
  type DrugReturns,
  type CreateDrugReturns,
  type UpdateDrugReturns,
  type DrugReturnsIdParam,
  type GetDrugReturnsQuery,
  type ListDrugReturnsQuery,
};

// Additional type definitions
export interface DrugReturnsRepository {
  create(data: CreateDrugReturns): Promise<DrugReturns>;
  findById(id: number | string): Promise<DrugReturns | null>;
  findMany(query: ListDrugReturnsQuery): Promise<{
    data: DrugReturns[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugReturns,
  ): Promise<DrugReturns | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugReturnsEntity {
  id: number;
  return_number: string;
  department_id: number;
  return_date: Date;
  return_reason_id: number | null;
  return_reason: string | null;
  action_taken: string | null;
  status: any | null;
  total_items: number | null;
  total_amount: number | null;
  received_by: string | null;
  verified_by: string | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugReturns module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugReturnsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_RETURNS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_RETURNS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DRUG_RETURNS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS = 'DRUG_RETURNS_CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_AMOUNT = 'DRUG_RETURNS_INVALID_VALUE_TOTAL_AMOUNT',
}

/**
 * Error messages mapped to error codes
 */
export const DrugReturnsErrorMessages: Record<DrugReturnsErrorCode, string> = {
  [DrugReturnsErrorCode.NOT_FOUND]: 'DrugReturns not found',
  [DrugReturnsErrorCode.VALIDATION_ERROR]: 'DrugReturns validation failed',

  // Delete validation messages
  [DrugReturnsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete drugReturns - has related records',
  [DrugReturnsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS]:
    'Cannot delete drugReturns - has drug_return_items references',

  // Business rule messages
  [DrugReturnsErrorCode.INVALID_VALUE_TOTAL_AMOUNT]:
    'total_amount must be a positive number',
};
