// Import and re-export types from schemas for convenience
import {
  type ReceiptItems,
  type CreateReceiptItems,
  type UpdateReceiptItems,
  type ReceiptItemsIdParam,
  type GetReceiptItemsQuery,
  type ListReceiptItemsQuery,
} from './receipt-items.schemas';

export {
  type ReceiptItems,
  type CreateReceiptItems,
  type UpdateReceiptItems,
  type ReceiptItemsIdParam,
  type GetReceiptItemsQuery,
  type ListReceiptItemsQuery,
};

// Additional type definitions
export interface ReceiptItemsRepository {
  create(data: CreateReceiptItems): Promise<ReceiptItems>;
  findById(id: number | string): Promise<ReceiptItems | null>;
  findMany(query: ListReceiptItemsQuery): Promise<{
    data: ReceiptItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateReceiptItems,
  ): Promise<ReceiptItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ReceiptItemsEntity {
  id: number;
  receipt_id: number;
  po_item_id: number;
  generic_id: number;
  quantity_ordered: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number | null;
  rejection_reason: string | null;
  unit_price: number;
  total_price: number;
  lot_number: string;
  manufacture_date: Date | null;
  expiry_date: Date;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for ReceiptItems module
 * Auto-generated based on database constraints and business rules
 */
export enum ReceiptItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'RECEIPT_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'RECEIPT_ITEMS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_QUANTITY_ORDERED = 'RECEIPT_ITEMS_INVALID_VALUE_QUANTITY_ORDERED',
  INVALID_VALUE_QUANTITY_RECEIVED = 'RECEIPT_ITEMS_INVALID_VALUE_QUANTITY_RECEIVED',
  INVALID_VALUE_QUANTITY_ACCEPTED = 'RECEIPT_ITEMS_INVALID_VALUE_QUANTITY_ACCEPTED',
  INVALID_VALUE_QUANTITY_REJECTED = 'RECEIPT_ITEMS_INVALID_VALUE_QUANTITY_REJECTED',
  INVALID_VALUE_UNIT_PRICE = 'RECEIPT_ITEMS_INVALID_VALUE_UNIT_PRICE',
  INVALID_VALUE_TOTAL_PRICE = 'RECEIPT_ITEMS_INVALID_VALUE_TOTAL_PRICE',
}

/**
 * Error messages mapped to error codes
 */
export const ReceiptItemsErrorMessages: Record<ReceiptItemsErrorCode, string> =
  {
    [ReceiptItemsErrorCode.NOT_FOUND]: 'ReceiptItems not found',
    [ReceiptItemsErrorCode.VALIDATION_ERROR]: 'ReceiptItems validation failed',

    // Business rule messages
    [ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ORDERED]:
      'quantity_ordered must be a positive number',
    [ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_RECEIVED]:
      'quantity_received must be a positive number',
    [ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ACCEPTED]:
      'quantity_accepted must be a positive number',
    [ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_REJECTED]:
      'quantity_rejected must be a positive number',
    [ReceiptItemsErrorCode.INVALID_VALUE_UNIT_PRICE]:
      'unit_price must be a positive number',
    [ReceiptItemsErrorCode.INVALID_VALUE_TOTAL_PRICE]:
      'total_price must be a positive number',
  };
