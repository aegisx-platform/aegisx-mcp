// Import and re-export types from schemas for convenience
import {
  type Inventory,
  type CreateInventory,
  type UpdateInventory,
  type InventoryIdParam,
  type GetInventoryQuery,
  type ListInventoryQuery,
} from './inventory.schemas';

export {
  type Inventory,
  type CreateInventory,
  type UpdateInventory,
  type InventoryIdParam,
  type GetInventoryQuery,
  type ListInventoryQuery,
};

// Additional type definitions
export interface InventoryRepository {
  create(data: CreateInventory): Promise<Inventory>;
  findById(id: number | string): Promise<Inventory | null>;
  findMany(query: ListInventoryQuery): Promise<{
    data: Inventory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateInventory): Promise<Inventory | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface InventoryEntity {
  id: number;
  drug_id: number;
  location_id: number;
  quantity_on_hand: number;
  min_level: number | null;
  max_level: number | null;
  reorder_point: number | null;
  average_cost: number | null;
  last_cost: number | null;
  last_updated: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Inventory module
 * Auto-generated based on database constraints and business rules
 */
export enum InventoryErrorCode {
  // Standard errors
  NOT_FOUND = 'INVENTORY_NOT_FOUND',
  VALIDATION_ERROR = 'INVENTORY_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'INVENTORY_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_INVENTORY_TRANSACTIONS = 'INVENTORY_CANNOT_DELETE_HAS_INVENTORY_TRANSACTIONS',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY_ON_HAND = 'INVENTORY_INVALID_VALUE_QUANTITY_ON_HAND',
  INVALID_VALUE_AVERAGE_COST = 'INVENTORY_INVALID_VALUE_AVERAGE_COST',
  INVALID_VALUE_LAST_COST = 'INVENTORY_INVALID_VALUE_LAST_COST',
}

/**
 * Error messages mapped to error codes
 */
export const InventoryErrorMessages: Record<InventoryErrorCode, string> = {
  [InventoryErrorCode.NOT_FOUND]: 'Inventory not found',
  [InventoryErrorCode.VALIDATION_ERROR]: 'Inventory validation failed',

  // Delete validation messages
  [InventoryErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete inventory - has related records',
  [InventoryErrorCode.CANNOT_DELETE_HAS_INVENTORY_TRANSACTIONS]:
    'Cannot delete inventory - has inventory_transactions references',

  // Business rule messages
  [InventoryErrorCode.INVALID_VALUE_QUANTITY_ON_HAND]:
    'quantity_on_hand must be a positive number',
  [InventoryErrorCode.INVALID_VALUE_AVERAGE_COST]:
    'average_cost must be a positive number',
  [InventoryErrorCode.INVALID_VALUE_LAST_COST]:
    'last_cost must be a positive number',
};
