// Import and re-export types from schemas for convenience
import {
  type PurchaseRequests,
  type CreatePurchaseRequests,
  type UpdatePurchaseRequests,
  type PurchaseRequestsIdParam,
  type GetPurchaseRequestsQuery,
  type ListPurchaseRequestsQuery,
} from './purchase-requests.schemas';

export {
  type PurchaseRequests,
  type CreatePurchaseRequests,
  type UpdatePurchaseRequests,
  type PurchaseRequestsIdParam,
  type GetPurchaseRequestsQuery,
  type ListPurchaseRequestsQuery,
};

// Additional type definitions
export interface PurchaseRequestsRepository {
  create(data: CreatePurchaseRequests): Promise<PurchaseRequests>;
  findById(id: number | string): Promise<PurchaseRequests | null>;
  findMany(query: ListPurchaseRequestsQuery): Promise<{
    data: PurchaseRequests[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdatePurchaseRequests,
  ): Promise<PurchaseRequests | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface PurchaseRequestsEntity {
  id: number;
  pr_number: string;
  department_id: number;
  budget_id: number;
  fiscal_year: number;
  request_date: Date | null;
  required_date: Date;
  requested_by: string;
  total_amount: number;
  status: any | null;
  priority: any | null;
  purpose: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  rejected_by: string | null;
  rejected_at: Date | null;
  rejection_reason: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for PurchaseRequests module
 * Auto-generated based on database constraints and business rules
 */
export enum PurchaseRequestsErrorCode {
  // Standard errors
  NOT_FOUND = 'PURCHASE_REQUESTS_NOT_FOUND',
  VALIDATION_ERROR = 'PURCHASE_REQUESTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'PURCHASE_REQUESTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_PURCHASE_ORDERS = 'PURCHASE_REQUESTS_CANNOT_DELETE_HAS_PURCHASE_ORDERS',
  CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS = 'PURCHASE_REQUESTS_CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_AMOUNT = 'PURCHASE_REQUESTS_INVALID_VALUE_TOTAL_AMOUNT',
}

/**
 * Error messages mapped to error codes
 */
export const PurchaseRequestsErrorMessages: Record<
  PurchaseRequestsErrorCode,
  string
> = {
  [PurchaseRequestsErrorCode.NOT_FOUND]: 'PurchaseRequests not found',
  [PurchaseRequestsErrorCode.VALIDATION_ERROR]:
    'PurchaseRequests validation failed',

  // Delete validation messages
  [PurchaseRequestsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete purchaseRequests - has related records',
  [PurchaseRequestsErrorCode.CANNOT_DELETE_HAS_PURCHASE_ORDERS]:
    'Cannot delete purchaseRequests - has purchase_orders references',
  [PurchaseRequestsErrorCode.CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS]:
    'Cannot delete purchaseRequests - has purchase_request_items references',

  // Business rule messages
  [PurchaseRequestsErrorCode.INVALID_VALUE_TOTAL_AMOUNT]:
    'total_amount must be a positive number',
};
