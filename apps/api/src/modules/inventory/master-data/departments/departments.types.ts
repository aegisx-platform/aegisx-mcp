// Import and re-export types from schemas for convenience
import {
  type Departments,
  type CreateDepartments,
  type UpdateDepartments,
  type DepartmentsIdParam,
  type GetDepartmentsQuery,
  type ListDepartmentsQuery,
} from './departments.schemas';

export {
  type Departments,
  type CreateDepartments,
  type UpdateDepartments,
  type DepartmentsIdParam,
  type GetDepartmentsQuery,
  type ListDepartmentsQuery,
};

// Additional type definitions
export interface DepartmentsRepository {
  create(data: CreateDepartments): Promise<Departments>;
  findById(id: number | string): Promise<Departments | null>;
  findMany(query: ListDepartmentsQuery): Promise<{
    data: Departments[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDepartments,
  ): Promise<Departments | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DepartmentsEntity {
  id: number;
  dept_code: string;
  dept_name: string;
  his_code: string | null;
  parent_id: number | null;
  consumption_group: any | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Departments module
 * Auto-generated based on database constraints and business rules
 */
export enum DepartmentsErrorCode {
  // Standard errors
  NOT_FOUND = 'DEPARTMENTS_NOT_FOUND',
  VALIDATION_ERROR = 'DEPARTMENTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DEPARTMENTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS = 'DEPARTMENTS_CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS',
  CANNOT_DELETE_HAS_BUDGET_PLANS = 'DEPARTMENTS_CANNOT_DELETE_HAS_BUDGET_PLANS',
  CANNOT_DELETE_HAS_DEPARTMENTS = 'DEPARTMENTS_CANNOT_DELETE_HAS_DEPARTMENTS',
  CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS = 'DEPARTMENTS_CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS',
  CANNOT_DELETE_HAS_DRUG_RETURNS = 'DEPARTMENTS_CANNOT_DELETE_HAS_DRUG_RETURNS',
  CANNOT_DELETE_HAS_PURCHASE_REQUESTS = 'DEPARTMENTS_CANNOT_DELETE_HAS_PURCHASE_REQUESTS',
}

/**
 * Error messages mapped to error codes
 */
export const DepartmentsErrorMessages: Record<DepartmentsErrorCode, string> = {
  [DepartmentsErrorCode.NOT_FOUND]: 'Departments not found',
  [DepartmentsErrorCode.VALIDATION_ERROR]: 'Departments validation failed',

  // Delete validation messages
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete departments - has related records',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_BUDGET_ALLOCATIONS]:
    'Cannot delete departments - has budget_allocations references',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_BUDGET_PLANS]:
    'Cannot delete departments - has budget_plans references',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_DEPARTMENTS]:
    'Cannot delete departments - has departments references',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS]:
    'Cannot delete departments - has drug_distributions references',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURNS]:
    'Cannot delete departments - has drug_returns references',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_PURCHASE_REQUESTS]:
    'Cannot delete departments - has purchase_requests references',
};
