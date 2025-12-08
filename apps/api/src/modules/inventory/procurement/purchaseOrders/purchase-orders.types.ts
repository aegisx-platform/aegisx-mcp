// Import and re-export types from schemas for convenience
import {
  type PurchaseOrders,
  type CreatePurchaseOrders,
  type UpdatePurchaseOrders,
  type PurchaseOrdersIdParam,
  type GetPurchaseOrdersQuery,
  type ListPurchaseOrdersQuery,
} from './purchase-orders.schemas';

export {
  type PurchaseOrders,
  type CreatePurchaseOrders,
  type UpdatePurchaseOrders,
  type PurchaseOrdersIdParam,
  type GetPurchaseOrdersQuery,
  type ListPurchaseOrdersQuery,
};

// Additional type definitions
export interface PurchaseOrdersRepository {
  create(data: CreatePurchaseOrders): Promise<PurchaseOrders>;
  findById(id: number | string): Promise<PurchaseOrders | null>;
  findMany(query: ListPurchaseOrdersQuery): Promise<{
    data: PurchaseOrders[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdatePurchaseOrders,
  ): Promise<PurchaseOrders | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface PurchaseOrdersEntity {
  id: number;
  po_number: string;
  pr_id: number;
  vendor_id: number;
  contract_id: number | null;
  po_date: Date | null;
  delivery_date: Date;
  total_amount: number;
  vat_amount: number | null;
  grand_total: number;
  status: any | null;
  payment_terms: any | null;
  shipping_address: string | null;
  billing_address: string | null;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: Date | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for PurchaseOrders module
 * Auto-generated based on database constraints and business rules
 */
export enum PurchaseOrdersErrorCode {
  // Standard errors
  NOT_FOUND = 'PURCHASE_ORDERS_NOT_FOUND',
  VALIDATION_ERROR = 'PURCHASE_ORDERS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'PURCHASE_ORDERS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_APPROVAL_DOCUMENTS = 'PURCHASE_ORDERS_CANNOT_DELETE_HAS_APPROVAL_DOCUMENTS',
  CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS = 'PURCHASE_ORDERS_CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS',
  CANNOT_DELETE_HAS_RECEIPTS = 'PURCHASE_ORDERS_CANNOT_DELETE_HAS_RECEIPTS',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_AMOUNT = 'PURCHASE_ORDERS_INVALID_VALUE_TOTAL_AMOUNT',
  INVALID_VALUE_VAT_AMOUNT = 'PURCHASE_ORDERS_INVALID_VALUE_VAT_AMOUNT',
}

/**
 * Error messages mapped to error codes
 */
export const PurchaseOrdersErrorMessages: Record<
  PurchaseOrdersErrorCode,
  string
> = {
  [PurchaseOrdersErrorCode.NOT_FOUND]: 'PurchaseOrders not found',
  [PurchaseOrdersErrorCode.VALIDATION_ERROR]:
    'PurchaseOrders validation failed',

  // Delete validation messages
  [PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete purchaseOrders - has related records',
  [PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_APPROVAL_DOCUMENTS]:
    'Cannot delete purchaseOrders - has approval_documents references',
  [PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS]:
    'Cannot delete purchaseOrders - has purchase_order_items references',
  [PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_RECEIPTS]:
    'Cannot delete purchaseOrders - has receipts references',

  // Business rule messages
  [PurchaseOrdersErrorCode.INVALID_VALUE_TOTAL_AMOUNT]:
    'total_amount must be a positive number',
  [PurchaseOrdersErrorCode.INVALID_VALUE_VAT_AMOUNT]:
    'vat_amount must be a positive number',
};
