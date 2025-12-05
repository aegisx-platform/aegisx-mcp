// Import and re-export types from schemas for convenience
import {
  type ReturnReasons,
  type CreateReturnReasons,
  type UpdateReturnReasons,
  type ReturnReasonsIdParam,
  type GetReturnReasonsQuery,
  type ListReturnReasonsQuery,
} from './return-reasons.schemas';

export {
  type ReturnReasons,
  type CreateReturnReasons,
  type UpdateReturnReasons,
  type ReturnReasonsIdParam,
  type GetReturnReasonsQuery,
  type ListReturnReasonsQuery,
};

// Additional type definitions
export interface ReturnReasonsRepository {
  create(data: CreateReturnReasons): Promise<ReturnReasons>;
  findById(id: number | string): Promise<ReturnReasons | null>;
  findMany(query: ListReturnReasonsQuery): Promise<{
    data: ReturnReasons[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateReturnReasons,
  ): Promise<ReturnReasons | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ReturnReasonsEntity {
  id: number;
  reason_code: string;
  reason_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for ReturnReasons module
 * Auto-generated based on database constraints and business rules
 */
export enum ReturnReasonsErrorCode {
  // Standard errors
  NOT_FOUND = 'RETURN_REASONS_NOT_FOUND',
  VALIDATION_ERROR = 'RETURN_REASONS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'RETURN_REASONS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_RETURNS = 'RETURN_REASONS_CANNOT_DELETE_HAS_DRUG_RETURNS',
}

/**
 * Error messages mapped to error codes
 */
export const ReturnReasonsErrorMessages: Record<
  ReturnReasonsErrorCode,
  string
> = {
  [ReturnReasonsErrorCode.NOT_FOUND]: 'ReturnReasons not found',
  [ReturnReasonsErrorCode.VALIDATION_ERROR]: 'ReturnReasons validation failed',

  // Delete validation messages
  [ReturnReasonsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete returnReasons - has related records',
  [ReturnReasonsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURNS]:
    'Cannot delete returnReasons - has drug_returns references',
};
