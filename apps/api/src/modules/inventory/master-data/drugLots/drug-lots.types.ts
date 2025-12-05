// Import and re-export types from schemas for convenience
import {
  type DrugLots,
  type CreateDrugLots,
  type UpdateDrugLots,
  type DrugLotsIdParam,
  type GetDrugLotsQuery,
  type ListDrugLotsQuery,
} from './drug-lots.schemas';

export {
  type DrugLots,
  type CreateDrugLots,
  type UpdateDrugLots,
  type DrugLotsIdParam,
  type GetDrugLotsQuery,
  type ListDrugLotsQuery,
};

// Additional type definitions
export interface DrugLotsRepository {
  create(data: CreateDrugLots): Promise<DrugLots>;
  findById(id: number | string): Promise<DrugLots | null>;
  findMany(query: ListDrugLotsQuery): Promise<{
    data: DrugLots[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateDrugLots): Promise<DrugLots | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugLotsEntity {
  id: number;
  drug_id: number;
  location_id: number;
  lot_number: string;
  expiry_date: Date;
  quantity_available: number;
  unit_cost: number;
  received_date: Date;
  receipt_id: number | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugLots module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugLotsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_LOTS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_LOTS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY_AVAILABLE = 'DRUG_LOTS_INVALID_VALUE_QUANTITY_AVAILABLE',
  INVALID_VALUE_UNIT_COST = 'DRUG_LOTS_INVALID_VALUE_UNIT_COST',
}

/**
 * Error messages mapped to error codes
 */
export const DrugLotsErrorMessages: Record<DrugLotsErrorCode, string> = {
  [DrugLotsErrorCode.NOT_FOUND]: 'DrugLots not found',
  [DrugLotsErrorCode.VALIDATION_ERROR]: 'DrugLots validation failed',

  // Business rule messages
  [DrugLotsErrorCode.INVALID_VALUE_QUANTITY_AVAILABLE]:
    'quantity_available must be a positive number',
  [DrugLotsErrorCode.INVALID_VALUE_UNIT_COST]:
    'unit_cost must be a positive number',
};
