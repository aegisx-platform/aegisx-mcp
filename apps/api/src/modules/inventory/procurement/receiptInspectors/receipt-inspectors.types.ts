// Import and re-export types from schemas for convenience
import {
  type ReceiptInspectors,
  type CreateReceiptInspectors,
  type UpdateReceiptInspectors,
  type ReceiptInspectorsIdParam,
  type GetReceiptInspectorsQuery,
  type ListReceiptInspectorsQuery,
} from './receipt-inspectors.schemas';

export {
  type ReceiptInspectors,
  type CreateReceiptInspectors,
  type UpdateReceiptInspectors,
  type ReceiptInspectorsIdParam,
  type GetReceiptInspectorsQuery,
  type ListReceiptInspectorsQuery,
};

// Additional type definitions
export interface ReceiptInspectorsRepository {
  create(data: CreateReceiptInspectors): Promise<ReceiptInspectors>;
  findById(id: number | string): Promise<ReceiptInspectors | null>;
  findMany(query: ListReceiptInspectorsQuery): Promise<{
    data: ReceiptInspectors[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateReceiptInspectors,
  ): Promise<ReceiptInspectors | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ReceiptInspectorsEntity {
  id: number;
  receipt_id: number;
  inspector_id: string;
  inspector_role: any | null;
  inspected_at: Date | null;
  notes: string | null;
  created_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for ReceiptInspectors module
 * Auto-generated based on database constraints and business rules
 */
export enum ReceiptInspectorsErrorCode {
  // Standard errors
  NOT_FOUND = 'RECEIPT_INSPECTORS_NOT_FOUND',
  VALIDATION_ERROR = 'RECEIPT_INSPECTORS_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const ReceiptInspectorsErrorMessages: Record<
  ReceiptInspectorsErrorCode,
  string
> = {
  [ReceiptInspectorsErrorCode.NOT_FOUND]: 'ReceiptInspectors not found',
  [ReceiptInspectorsErrorCode.VALIDATION_ERROR]:
    'ReceiptInspectors validation failed',
};
