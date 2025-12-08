// Import and re-export types from schemas for convenience
import {
  type InventoryTransactions,
  type CreateInventoryTransactions,
  type UpdateInventoryTransactions,
  type InventoryTransactionsIdParam,
  type GetInventoryTransactionsQuery,
  type ListInventoryTransactionsQuery,
} from './inventory-transactions.schemas';

export {
  type InventoryTransactions,
  type CreateInventoryTransactions,
  type UpdateInventoryTransactions,
  type InventoryTransactionsIdParam,
  type GetInventoryTransactionsQuery,
  type ListInventoryTransactionsQuery,
};

// Additional type definitions
export interface InventoryTransactionsRepository {
  create(data: CreateInventoryTransactions): Promise<InventoryTransactions>;
  findById(id: number | string): Promise<InventoryTransactions | null>;
  findMany(query: ListInventoryTransactionsQuery): Promise<{
    data: InventoryTransactions[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateInventoryTransactions,
  ): Promise<InventoryTransactions | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface InventoryTransactionsEntity {
  id: number;
  inventory_id: number;
  transaction_type: any;
  quantity: number;
  unit_cost: number | null;
  reference_id: number | null;
  reference_type: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for InventoryTransactions module
 * Auto-generated based on database constraints and business rules
 */
export enum InventoryTransactionsErrorCode {
  // Standard errors
  NOT_FOUND = 'INVENTORY_TRANSACTIONS_NOT_FOUND',
  VALIDATION_ERROR = 'INVENTORY_TRANSACTIONS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY = 'INVENTORY_TRANSACTIONS_INVALID_VALUE_QUANTITY',
  INVALID_VALUE_UNIT_COST = 'INVENTORY_TRANSACTIONS_INVALID_VALUE_UNIT_COST',
}

/**
 * Error messages mapped to error codes
 */
export const InventoryTransactionsErrorMessages: Record<
  InventoryTransactionsErrorCode,
  string
> = {
  [InventoryTransactionsErrorCode.NOT_FOUND]: 'InventoryTransactions not found',
  [InventoryTransactionsErrorCode.VALIDATION_ERROR]:
    'InventoryTransactions validation failed',

  // Business rule messages
  [InventoryTransactionsErrorCode.INVALID_VALUE_QUANTITY]:
    'quantity must be a positive number',
  [InventoryTransactionsErrorCode.INVALID_VALUE_UNIT_COST]:
    'unit_cost must be a positive number',
};
