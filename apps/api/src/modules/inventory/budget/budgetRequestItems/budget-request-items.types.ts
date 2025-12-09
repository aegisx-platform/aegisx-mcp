// Import and re-export types from schemas for convenience
import {
  type BudgetRequestItems,
  type CreateBudgetRequestItems,
  type UpdateBudgetRequestItems,
  type BudgetRequestItemsIdParam,
  type GetBudgetRequestItemsQuery,
  type ListBudgetRequestItemsQuery,
  type BatchUpdateItem,
  type BatchUpdateBudgetRequestItems,
  type BatchUpdateResponse,
} from './budget-request-items.schemas';

export {
  type BudgetRequestItems,
  type CreateBudgetRequestItems,
  type UpdateBudgetRequestItems,
  type BudgetRequestItemsIdParam,
  type GetBudgetRequestItemsQuery,
  type ListBudgetRequestItemsQuery,
  type BatchUpdateItem,
  type BatchUpdateBudgetRequestItems,
  type BatchUpdateResponse,
};

// Additional type definitions
export interface BudgetRequestItemsRepository {
  create(data: CreateBudgetRequestItems): Promise<BudgetRequestItems>;
  findById(id: number | string): Promise<BudgetRequestItems | null>;
  findMany(query: ListBudgetRequestItemsQuery): Promise<{
    data: BudgetRequestItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateBudgetRequestItems,
  ): Promise<BudgetRequestItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface BudgetRequestItemsEntity {
  id: number;
  budget_request_id: number;
  budget_id: number;
  requested_amount: number | null;
  q1_qty: number;
  q2_qty: number;
  q3_qty: number;
  q4_qty: number;
  item_justification: string | null;
  created_at: Date;
  updated_at: Date;
  drug_id: number | null;
  generic_id: number | null;
  generic_code: string | null;
  generic_name: string | null;
  package_size: string | null;
  unit: string | null;
  line_number: number | null;
  avg_usage: number | null;
  estimated_usage_2569: number | null;
  current_stock: number | null;
  estimated_purchase: number | null;
  unit_price: number | null;
  requested_qty: number | null;
  budget_type_id: number | null;
  budget_category_id: number | null;
  historical_usage: Record<string, any> | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for BudgetRequestItems module
 * Auto-generated based on database constraints and business rules
 */
export enum BudgetRequestItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'BUDGET_REQUEST_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'BUDGET_REQUEST_ITEMS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_REQUESTED_AMOUNT = 'BUDGET_REQUEST_ITEMS_INVALID_VALUE_REQUESTED_AMOUNT',
  INVALID_VALUE_UNIT_PRICE = 'BUDGET_REQUEST_ITEMS_INVALID_VALUE_UNIT_PRICE',
}

/**
 * Error messages mapped to error codes
 */
export const BudgetRequestItemsErrorMessages: Record<
  BudgetRequestItemsErrorCode,
  string
> = {
  [BudgetRequestItemsErrorCode.NOT_FOUND]: 'BudgetRequestItems not found',
  [BudgetRequestItemsErrorCode.VALIDATION_ERROR]:
    'BudgetRequestItems validation failed',

  // Business rule messages
  [BudgetRequestItemsErrorCode.INVALID_VALUE_REQUESTED_AMOUNT]:
    'requested_amount must be a positive number',
  [BudgetRequestItemsErrorCode.INVALID_VALUE_UNIT_PRICE]:
    'unit_price must be a positive number',
};
