// Import and re-export types from schemas for convenience
import {
  type Receipts,
  type CreateReceipts,
  type UpdateReceipts,
  type ReceiptsIdParam,
  type GetReceiptsQuery,
  type ListReceiptsQuery,
} from './receipts.schemas';

export {
  type Receipts,
  type CreateReceipts,
  type UpdateReceipts,
  type ReceiptsIdParam,
  type GetReceiptsQuery,
  type ListReceiptsQuery,
};

// Additional type definitions
export interface ReceiptsRepository {
  create(data: CreateReceipts): Promise<Receipts>;
  findById(id: number | string): Promise<Receipts | null>;
  findMany(query: ListReceiptsQuery): Promise<{
    data: Receipts[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateReceipts): Promise<Receipts | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ReceiptsEntity {
  id: number;
  receipt_number: string;
  po_id: number;
  location_id: number;
  receipt_date: Date | null;
  delivery_note_number: string | null;
  invoice_number: string | null;
  invoice_date: Date | null;
  status: any | null;
  total_amount: number | null;
  notes: string | null;
  received_by: string;
  inspected_by: string | null;
  inspected_at: Date | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Receipts module
 * Auto-generated based on database constraints and business rules
 */
export enum ReceiptsErrorCode {
  // Standard errors
  NOT_FOUND = 'RECEIPTS_NOT_FOUND',
  VALIDATION_ERROR = 'RECEIPTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'RECEIPTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_LOTS = 'RECEIPTS_CANNOT_DELETE_HAS_DRUG_LOTS',
  CANNOT_DELETE_HAS_PAYMENT_DOCUMENTS = 'RECEIPTS_CANNOT_DELETE_HAS_PAYMENT_DOCUMENTS',
  CANNOT_DELETE_HAS_RECEIPT_INSPECTORS = 'RECEIPTS_CANNOT_DELETE_HAS_RECEIPT_INSPECTORS',
  CANNOT_DELETE_HAS_RECEIPT_ITEMS = 'RECEIPTS_CANNOT_DELETE_HAS_RECEIPT_ITEMS',

  // Business rule validation errors (422)
  INVALID_VALUE_TOTAL_AMOUNT = 'RECEIPTS_INVALID_VALUE_TOTAL_AMOUNT',
}

/**
 * Error messages mapped to error codes
 */
export const ReceiptsErrorMessages: Record<ReceiptsErrorCode, string> = {
  [ReceiptsErrorCode.NOT_FOUND]: 'Receipts not found',
  [ReceiptsErrorCode.VALIDATION_ERROR]: 'Receipts validation failed',

  // Delete validation messages
  [ReceiptsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete receipts - has related records',
  [ReceiptsErrorCode.CANNOT_DELETE_HAS_DRUG_LOTS]:
    'Cannot delete receipts - has drug_lots references',
  [ReceiptsErrorCode.CANNOT_DELETE_HAS_PAYMENT_DOCUMENTS]:
    'Cannot delete receipts - has payment_documents references',
  [ReceiptsErrorCode.CANNOT_DELETE_HAS_RECEIPT_INSPECTORS]:
    'Cannot delete receipts - has receipt_inspectors references',
  [ReceiptsErrorCode.CANNOT_DELETE_HAS_RECEIPT_ITEMS]:
    'Cannot delete receipts - has receipt_items references',

  // Business rule messages
  [ReceiptsErrorCode.INVALID_VALUE_TOTAL_AMOUNT]:
    'total_amount must be a positive number',
};
