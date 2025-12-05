// Import and re-export types from schemas for convenience
import {
  type ReturnActions,
  type CreateReturnActions,
  type UpdateReturnActions,
  type ReturnActionsIdParam,
  type GetReturnActionsQuery,
  type ListReturnActionsQuery,
} from './return-actions.schemas';

export {
  type ReturnActions,
  type CreateReturnActions,
  type UpdateReturnActions,
  type ReturnActionsIdParam,
  type GetReturnActionsQuery,
  type ListReturnActionsQuery,
};

// Additional type definitions
export interface ReturnActionsRepository {
  create(data: CreateReturnActions): Promise<ReturnActions>;
  findById(id: number | string): Promise<ReturnActions | null>;
  findMany(query: ListReturnActionsQuery): Promise<{
    data: ReturnActions[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateReturnActions,
  ): Promise<ReturnActions | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ReturnActionsEntity {
  id: number;
  action_code: string;
  action_name: string;
  action_type: any | null;
  requires_vendor_approval: boolean | null;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for ReturnActions module
 * Auto-generated based on database constraints and business rules
 */
export enum ReturnActionsErrorCode {
  // Standard errors
  NOT_FOUND = 'RETURN_ACTIONS_NOT_FOUND',
  VALIDATION_ERROR = 'RETURN_ACTIONS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'RETURN_ACTIONS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS = 'RETURN_ACTIONS_CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS',
}

/**
 * Error messages mapped to error codes
 */
export const ReturnActionsErrorMessages: Record<
  ReturnActionsErrorCode,
  string
> = {
  [ReturnActionsErrorCode.NOT_FOUND]: 'ReturnActions not found',
  [ReturnActionsErrorCode.VALIDATION_ERROR]: 'ReturnActions validation failed',

  // Delete validation messages
  [ReturnActionsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete returnActions - has related records',
  [ReturnActionsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS]:
    'Cannot delete returnActions - has drug_return_items references',
};
