// Import and re-export types from schemas for convenience
import {
  type DrugReturnItems,
  type CreateDrugReturnItems,
  type UpdateDrugReturnItems,
  type DrugReturnItemsIdParam,
  type GetDrugReturnItemsQuery,
  type ListDrugReturnItemsQuery,
} from './drug-return-items.schemas';

export {
  type DrugReturnItems,
  type CreateDrugReturnItems,
  type UpdateDrugReturnItems,
  type DrugReturnItemsIdParam,
  type GetDrugReturnItemsQuery,
  type ListDrugReturnItemsQuery,
};

// Additional type definitions
export interface DrugReturnItemsRepository {
  create(data: CreateDrugReturnItems): Promise<DrugReturnItems>;
  findById(id: number | string): Promise<DrugReturnItems | null>;
  findMany(query: ListDrugReturnItemsQuery): Promise<{
    data: DrugReturnItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugReturnItems,
  ): Promise<DrugReturnItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugReturnItemsEntity {
  id: number;
  return_id: number;
  drug_id: number;
  total_quantity: number;
  good_quantity: number;
  damaged_quantity: number;
  lot_number: string;
  expiry_date: Date;
  return_type: any;
  location_id: number;
  action_id: number | null;
  notes: string | null;
  created_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugReturnItems module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugReturnItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_RETURN_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_RETURN_ITEMS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_QUANTITY = 'DRUG_RETURN_ITEMS_INVALID_VALUE_TOTAL_QUANTITY',
  INVALID_VALUE_GOOD_QUANTITY = 'DRUG_RETURN_ITEMS_INVALID_VALUE_GOOD_QUANTITY',
  INVALID_VALUE_DAMAGED_QUANTITY = 'DRUG_RETURN_ITEMS_INVALID_VALUE_DAMAGED_QUANTITY',
}

/**
 * Error messages mapped to error codes
 */
export const DrugReturnItemsErrorMessages: Record<
  DrugReturnItemsErrorCode,
  string
> = {
  [DrugReturnItemsErrorCode.NOT_FOUND]: 'DrugReturnItems not found',
  [DrugReturnItemsErrorCode.VALIDATION_ERROR]:
    'DrugReturnItems validation failed',

  // Business rule messages
  [DrugReturnItemsErrorCode.INVALID_VALUE_TOTAL_QUANTITY]:
    'total_quantity must be a positive number',
  [DrugReturnItemsErrorCode.INVALID_VALUE_GOOD_QUANTITY]:
    'good_quantity must be a positive number',
  [DrugReturnItemsErrorCode.INVALID_VALUE_DAMAGED_QUANTITY]:
    'damaged_quantity must be a positive number',
};
