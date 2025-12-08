// Import and re-export types from schemas for convenience
import {
  type PurchaseOrderItems,
  type CreatePurchaseOrderItems,
  type UpdatePurchaseOrderItems,
  type PurchaseOrderItemsIdParam,
  type GetPurchaseOrderItemsQuery,
  type ListPurchaseOrderItemsQuery,
} from './purchase-order-items.schemas';

export {
  type PurchaseOrderItems,
  type CreatePurchaseOrderItems,
  type UpdatePurchaseOrderItems,
  type PurchaseOrderItemsIdParam,
  type GetPurchaseOrderItemsQuery,
  type ListPurchaseOrderItemsQuery,
};

// Additional type definitions
export interface PurchaseOrderItemsRepository {
  create(data: CreatePurchaseOrderItems): Promise<PurchaseOrderItems>;
  findById(id: number | string): Promise<PurchaseOrderItems | null>;
  findMany(query: ListPurchaseOrderItemsQuery): Promise<{
    data: PurchaseOrderItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdatePurchaseOrderItems,
  ): Promise<PurchaseOrderItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface PurchaseOrderItemsEntity {
  id: number;
  po_id: number;
  pr_item_id: number | null;
  generic_id: number;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number | null;
  discount_amount: number | null;
  total_price: number;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for PurchaseOrderItems module
 * Auto-generated based on database constraints and business rules
 */
export enum PurchaseOrderItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'PURCHASE_ORDER_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'PURCHASE_ORDER_ITEMS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'PURCHASE_ORDER_ITEMS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_RECEIPT_ITEMS = 'PURCHASE_ORDER_ITEMS_CANNOT_DELETE_HAS_RECEIPT_ITEMS',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY = 'PURCHASE_ORDER_ITEMS_INVALID_VALUE_QUANTITY',
  INVALID_VALUE_UNIT_PRICE = 'PURCHASE_ORDER_ITEMS_INVALID_VALUE_UNIT_PRICE',
  INVALID_VALUE_DISCOUNT_PERCENT = 'PURCHASE_ORDER_ITEMS_INVALID_VALUE_DISCOUNT_PERCENT',
  INVALID_VALUE_DISCOUNT_AMOUNT = 'PURCHASE_ORDER_ITEMS_INVALID_VALUE_DISCOUNT_AMOUNT',
  INVALID_VALUE_TOTAL_PRICE = 'PURCHASE_ORDER_ITEMS_INVALID_VALUE_TOTAL_PRICE',
}

/**
 * Error messages mapped to error codes
 */
export const PurchaseOrderItemsErrorMessages: Record<
  PurchaseOrderItemsErrorCode,
  string
> = {
  [PurchaseOrderItemsErrorCode.NOT_FOUND]: 'PurchaseOrderItems not found',
  [PurchaseOrderItemsErrorCode.VALIDATION_ERROR]:
    'PurchaseOrderItems validation failed',

  // Delete validation messages
  [PurchaseOrderItemsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete purchaseOrderItems - has related records',
  [PurchaseOrderItemsErrorCode.CANNOT_DELETE_HAS_RECEIPT_ITEMS]:
    'Cannot delete purchaseOrderItems - has receipt_items references',

  // Business rule messages
  [PurchaseOrderItemsErrorCode.INVALID_VALUE_QUANTITY]:
    'quantity must be a positive number',
  [PurchaseOrderItemsErrorCode.INVALID_VALUE_UNIT_PRICE]:
    'unit_price must be a positive number',
  [PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_PERCENT]:
    'discount_percent must be a positive number',
  [PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_AMOUNT]:
    'discount_amount must be a positive number',
  [PurchaseOrderItemsErrorCode.INVALID_VALUE_TOTAL_PRICE]:
    'total_price must be a positive number',
};
