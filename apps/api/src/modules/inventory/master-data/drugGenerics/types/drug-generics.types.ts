// Import and re-export types from schemas for convenience
import {
  type DrugGenerics,
  type CreateDrugGenerics,
  type UpdateDrugGenerics,
  type DrugGenericsIdParam,
  type GetDrugGenericsQuery,
  type ListDrugGenericsQuery,
} from '../schemas/drug-generics.schemas';

export {
  type DrugGenerics,
  type CreateDrugGenerics,
  type UpdateDrugGenerics,
  type DrugGenericsIdParam,
  type GetDrugGenericsQuery,
  type ListDrugGenericsQuery,
};

// Additional type definitions
export interface DrugGenericsRepository {
  create(data: CreateDrugGenerics): Promise<DrugGenerics>;
  findById(id: number | string): Promise<DrugGenerics | null>;
  findMany(query: ListDrugGenericsQuery): Promise<{
    data: DrugGenerics[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDrugGenerics,
  ): Promise<DrugGenerics | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugGenericsEntity {
  id: number;
  working_code: string;
  generic_name: string;
  dosage_form: string | null;
  strength_unit: string | null;
  dosage_form_id: number | null;
  strength_unit_id: number | null;
  strength_value: number | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugGenerics module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugGenericsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_GENERICS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_GENERICS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DRUG_GENERICS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BUDGET_PLAN_ITEMS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_BUDGET_PLAN_ITEMS',
  CANNOT_DELETE_HAS_CONTRACT_ITEMS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_CONTRACT_ITEMS',
  CANNOT_DELETE_HAS_DRUG_COMPONENTS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_DRUG_COMPONENTS',
  CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS',
  CANNOT_DELETE_HAS_DRUGS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_DRUGS',
  CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS',
  CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS',
  CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS',
  CANNOT_DELETE_HAS_RECEIPT_ITEMS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_RECEIPT_ITEMS',
  CANNOT_DELETE_HAS_TMT_MAPPINGS = 'DRUG_GENERICS_CANNOT_DELETE_HAS_TMT_MAPPINGS',
}

/**
 * Error messages mapped to error codes
 */
export const DrugGenericsErrorMessages: Record<DrugGenericsErrorCode, string> =
  {
    [DrugGenericsErrorCode.NOT_FOUND]: 'DrugGenerics not found',
    [DrugGenericsErrorCode.VALIDATION_ERROR]: 'DrugGenerics validation failed',

    // Delete validation messages
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
      'Cannot delete drugGenerics - has related records',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_BUDGET_PLAN_ITEMS]:
      'Cannot delete drugGenerics - has budget_plan_items references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_CONTRACT_ITEMS]:
      'Cannot delete drugGenerics - has contract_items references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_DRUG_COMPONENTS]:
      'Cannot delete drugGenerics - has drug_components references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS]:
      'Cannot delete drugGenerics - has drug_focus_lists references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_DRUGS]:
      'Cannot delete drugGenerics - has drugs references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS]:
      'Cannot delete drugGenerics - has hospital_pharmaceutical_products references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_PURCHASE_ORDER_ITEMS]:
      'Cannot delete drugGenerics - has purchase_order_items references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_PURCHASE_REQUEST_ITEMS]:
      'Cannot delete drugGenerics - has purchase_request_items references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_RECEIPT_ITEMS]:
      'Cannot delete drugGenerics - has receipt_items references',
    [DrugGenericsErrorCode.CANNOT_DELETE_HAS_TMT_MAPPINGS]:
      'Cannot delete drugGenerics - has tmt_mappings references',
  };
