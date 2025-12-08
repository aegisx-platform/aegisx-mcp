// Import and re-export types from schemas for convenience
import {
  type DrugDistributionItems,
  type CreateDrugDistributionItems,
  type UpdateDrugDistributionItems,
  type DrugDistributionItemsIdParam,
  type GetDrugDistributionItemsQuery,
  type ListDrugDistributionItemsQuery,
} from './drug-distribution-items.schemas';

export {
  type DrugDistributionItems,
  type CreateDrugDistributionItems,
  type UpdateDrugDistributionItems,
  type DrugDistributionItemsIdParam,
  type GetDrugDistributionItemsQuery,
  type ListDrugDistributionItemsQuery,
};

// Additional type definitions
export interface DrugDistributionItemsRepository {
  create(data: CreateDrugDistributionItems): Promise<DrugDistributionItems>;
  findById(id: number | string): Promise<DrugDistributionItems | null>;
  findMany(query: ListDrugDistributionItemsQuery): Promise<{
    data: DrugDistributionItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugDistributionItems,
  ): Promise<DrugDistributionItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugDistributionItemsEntity {
  id: number;
  distribution_id: number;
  item_number: number;
  drug_id: number;
  lot_number: string;
  quantity_dispensed: number;
  unit_cost: number;
  expiry_date: Date;
  created_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugDistributionItems module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugDistributionItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_DISTRIBUTION_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_DISTRIBUTION_ITEMS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY_DISPENSED = 'DRUG_DISTRIBUTION_ITEMS_INVALID_VALUE_QUANTITY_DISPENSED',
  INVALID_VALUE_UNIT_COST = 'DRUG_DISTRIBUTION_ITEMS_INVALID_VALUE_UNIT_COST',
}

/**
 * Error messages mapped to error codes
 */
export const DrugDistributionItemsErrorMessages: Record<
  DrugDistributionItemsErrorCode,
  string
> = {
  [DrugDistributionItemsErrorCode.NOT_FOUND]: 'DrugDistributionItems not found',
  [DrugDistributionItemsErrorCode.VALIDATION_ERROR]:
    'DrugDistributionItems validation failed',

  // Business rule messages
  [DrugDistributionItemsErrorCode.INVALID_VALUE_QUANTITY_DISPENSED]:
    'quantity_dispensed must be a positive number',
  [DrugDistributionItemsErrorCode.INVALID_VALUE_UNIT_COST]:
    'unit_cost must be a positive number',
};
