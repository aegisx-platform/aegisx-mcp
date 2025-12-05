// Import and re-export types from schemas for convenience
import {
  type DrugFocusLists,
  type CreateDrugFocusLists,
  type UpdateDrugFocusLists,
  type DrugFocusListsIdParam,
  type GetDrugFocusListsQuery,
  type ListDrugFocusListsQuery,
} from './drug-focus-lists.schemas';

export {
  type DrugFocusLists,
  type CreateDrugFocusLists,
  type UpdateDrugFocusLists,
  type DrugFocusListsIdParam,
  type GetDrugFocusListsQuery,
  type ListDrugFocusListsQuery,
};

// Additional type definitions
export interface DrugFocusListsRepository {
  create(data: CreateDrugFocusLists): Promise<DrugFocusLists>;
  findById(id: number | string): Promise<DrugFocusLists | null>;
  findMany(query: ListDrugFocusListsQuery): Promise<{
    data: DrugFocusLists[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugFocusLists,
  ): Promise<DrugFocusLists | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugFocusListsEntity {
  id: number;
  list_code: string;
  list_name: string;
  description: string | null;
  generic_id: number | null;
  drug_id: number | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugFocusLists module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugFocusListsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_FOCUS_LISTS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_FOCUS_LISTS_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const DrugFocusListsErrorMessages: Record<
  DrugFocusListsErrorCode,
  string
> = {
  [DrugFocusListsErrorCode.NOT_FOUND]: 'DrugFocusLists not found',
  [DrugFocusListsErrorCode.VALIDATION_ERROR]:
    'DrugFocusLists validation failed',
};
