// Import and re-export types from schemas for convenience
import {
  type BudgetRequestComments,
  type CreateBudgetRequestComments,
  type UpdateBudgetRequestComments,
  type BudgetRequestCommentsIdParam,
  type GetBudgetRequestCommentsQuery,
  type ListBudgetRequestCommentsQuery,
} from './budget-request-comments.schemas';

export {
  type BudgetRequestComments,
  type CreateBudgetRequestComments,
  type UpdateBudgetRequestComments,
  type BudgetRequestCommentsIdParam,
  type GetBudgetRequestCommentsQuery,
  type ListBudgetRequestCommentsQuery,
};

// Additional type definitions
export interface BudgetRequestCommentsRepository {
  create(data: CreateBudgetRequestComments): Promise<BudgetRequestComments>;
  findById(id: number | string): Promise<BudgetRequestComments | null>;
  findMany(query: ListBudgetRequestCommentsQuery): Promise<{
    data: BudgetRequestComments[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateBudgetRequestComments,
  ): Promise<BudgetRequestComments | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface BudgetRequestCommentsEntity {
  id: number;
  budget_request_id: number;
  parent_id: number | null;
  comment: string;
  created_by: string;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for BudgetRequestComments module
 * Auto-generated based on database constraints and business rules
 */
export enum BudgetRequestCommentsErrorCode {
  // Standard errors
  NOT_FOUND = 'BUDGET_REQUEST_COMMENTS_NOT_FOUND',
  VALIDATION_ERROR = 'BUDGET_REQUEST_COMMENTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'BUDGET_REQUEST_COMMENTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BUDGET_REQUEST_COMMENTS = 'BUDGET_REQUEST_COMMENTS_CANNOT_DELETE_HAS_BUDGET_REQUEST_COMMENTS',
}

/**
 * Error messages mapped to error codes
 */
export const BudgetRequestCommentsErrorMessages: Record<
  BudgetRequestCommentsErrorCode,
  string
> = {
  [BudgetRequestCommentsErrorCode.NOT_FOUND]: 'BudgetRequestComments not found',
  [BudgetRequestCommentsErrorCode.VALIDATION_ERROR]:
    'BudgetRequestComments validation failed',

  // Delete validation messages
  [BudgetRequestCommentsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete budgetRequestComments - has related records',
  [BudgetRequestCommentsErrorCode.CANNOT_DELETE_HAS_BUDGET_REQUEST_COMMENTS]:
    'Cannot delete budgetRequestComments - has budget_request_comments references',
};
