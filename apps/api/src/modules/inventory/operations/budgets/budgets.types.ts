// Import and re-export types from schemas for convenience
import {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type BudgetsIdParam,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
} from './budgets.schemas';

export {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type BudgetsIdParam,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
};

// Additional type definitions
export interface BudgetsRepository {
  create(data: CreateBudgets): Promise<Budgets>;
  findById(id: number | string): Promise<Budgets | null>;
  findMany(query: ListBudgetsQuery): Promise<{
    data: Budgets[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateBudgets): Promise<Budgets | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface BudgetsEntity {
  id: number;
  budget_type_id: number;
  budget_category_id: number;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Budgets module
 * Auto-generated based on database constraints and business rules
 */
export enum BudgetsErrorCode {
  // Standard errors
  NOT_FOUND = 'BUDGETS_NOT_FOUND',
  VALIDATION_ERROR = 'BUDGETS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'BUDGETS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS = 'BUDGETS_CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS',
  CANNOT_DELETE_HAS_PURCHASE_REQUESTS = 'BUDGETS_CANNOT_DELETE_HAS_PURCHASE_REQUESTS',
}

/**
 * Error messages mapped to error codes
 */
export const BudgetsErrorMessages: Record<BudgetsErrorCode, string> = {
  [BudgetsErrorCode.NOT_FOUND]: 'Budgets not found',
  [BudgetsErrorCode.VALIDATION_ERROR]: 'Budgets validation failed',

  // Delete validation messages
  [BudgetsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete budgets - has related records',
  [BudgetsErrorCode.CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS]:
    'Cannot delete budgets - has budget_allocations references',
  [BudgetsErrorCode.CANNOT_DELETE_HAS_PURCHASE_REQUESTS]:
    'Cannot delete budgets - has purchase_requests references',
};
