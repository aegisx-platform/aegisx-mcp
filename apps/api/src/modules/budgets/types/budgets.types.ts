// Import and re-export types from schemas for convenience
import {
  type Budgets,
  type CreateBudgets,
  type UpdateBudgets,
  type BudgetsIdParam,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
} from '../schemas/budgets.schemas';

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
  budget_code: string;
  budget_type: string;
  budget_category: string;
  budget_description: string | null;
  is_active: boolean;
  created_at: Date;
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

  // Duplicate errors (409 Conflict)
  DUPLICATE_BUDGET_CODE = 'BUDGETS_DUPLICATE_BUDGET_CODE',
}

/**
 * Error messages mapped to error codes
 */
export const BudgetsErrorMessages: Record<BudgetsErrorCode, string> = {
  [BudgetsErrorCode.NOT_FOUND]: 'Budgets not found',
  [BudgetsErrorCode.VALIDATION_ERROR]: 'Budgets validation failed',

  // Duplicate error messages
  [BudgetsErrorCode.DUPLICATE_BUDGET_CODE]: 'Budget code already exists',
};
