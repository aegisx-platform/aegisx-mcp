// Import and re-export types from schemas for convenience
import {
  type DrugPackRatios,
  type CreateDrugPackRatios,
  type UpdateDrugPackRatios,
  type DrugPackRatiosIdParam,
  type GetDrugPackRatiosQuery,
  type ListDrugPackRatiosQuery,
} from './drug-pack-ratios.schemas';

export {
  type DrugPackRatios,
  type CreateDrugPackRatios,
  type UpdateDrugPackRatios,
  type DrugPackRatiosIdParam,
  type GetDrugPackRatiosQuery,
  type ListDrugPackRatiosQuery,
};

// Additional type definitions
export interface DrugPackRatiosRepository {
  create(data: CreateDrugPackRatios): Promise<DrugPackRatios>;
  findById(id: number | string): Promise<DrugPackRatios | null>;
  findMany(query: ListDrugPackRatiosQuery): Promise<{
    data: DrugPackRatios[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugPackRatios,
  ): Promise<DrugPackRatios | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugPackRatiosEntity {
  id: number;
  drug_id: number;
  company_id: number | null;
  pack_size: number;
  pack_unit: string;
  unit_per_pack: number;
  pack_price: number | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugPackRatios module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugPackRatiosErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_PACK_RATIOS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_PACK_RATIOS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_PACK_PRICE = 'DRUG_PACK_RATIOS_INVALID_VALUE_PACK_PRICE',
}

/**
 * Error messages mapped to error codes
 */
export const DrugPackRatiosErrorMessages: Record<
  DrugPackRatiosErrorCode,
  string
> = {
  [DrugPackRatiosErrorCode.NOT_FOUND]: 'DrugPackRatios not found',
  [DrugPackRatiosErrorCode.VALIDATION_ERROR]:
    'DrugPackRatios validation failed',

  // Business rule messages
  [DrugPackRatiosErrorCode.INVALID_VALUE_PACK_PRICE]:
    'pack_price must be a positive number',
};
