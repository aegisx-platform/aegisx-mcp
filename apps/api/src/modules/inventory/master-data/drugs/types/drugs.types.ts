// Import and re-export types from schemas for convenience
import {
  type Drugs,
  type CreateDrugs,
  type UpdateDrugs,
  type DrugsIdParam,
  type GetDrugsQuery,
  type ListDrugsQuery,
} from '../schemas/drugs.schemas';

export {
  type Drugs,
  type CreateDrugs,
  type UpdateDrugs,
  type DrugsIdParam,
  type GetDrugsQuery,
  type ListDrugsQuery,
};

// Additional type definitions
export interface DrugsRepository {
  create(data: CreateDrugs): Promise<Drugs>;
  findById(id: number | string): Promise<Drugs | null>;
  findMany(query: ListDrugsQuery): Promise<{
    data: Drugs[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateDrugs): Promise<Drugs | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugsEntity {
  id: number;
  drug_code: string;
  trade_name: string;
  generic_id: number;
  manufacturer_id: number;
  tmt_tpu_id: number | null;
  nlem_status: any;
  drug_status: any;
  product_category: any;
  status_changed_date: Date | null;
  unit_price: number | null;
  package_size: number | null;
  package_unit: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Drugs module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUGS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUGS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DRUGS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS = 'DRUGS_CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS',
  CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS = 'DRUGS_CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS',
  CANNOT_DELETE_HAS_DRUG_LOTS = 'DRUGS_CANNOT_DELETE_HAS_DRUG_LOTS',
  CANNOT_DELETE_HAS_DRUG_PACK_RATIOS = 'DRUGS_CANNOT_DELETE_HAS_DRUG_PACK_RATIOS',
  CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS = 'DRUGS_CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS',
  CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS = 'DRUGS_CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS',
  CANNOT_DELETE_HAS_INVENTORY = 'DRUGS_CANNOT_DELETE_HAS_INVENTORY',
  CANNOT_DELETE_HAS_TMT_MAPPINGS = 'DRUGS_CANNOT_DELETE_HAS_TMT_MAPPINGS',

  // Business rule validation errors (422)
  INVALID_VALUE_UNIT_PRICE = 'DRUGS_INVALID_VALUE_UNIT_PRICE',
}

/**
 * Error messages mapped to error codes
 */
export const DrugsErrorMessages: Record<DrugsErrorCode, string> = {
  [DrugsErrorCode.NOT_FOUND]: 'Drugs not found',
  [DrugsErrorCode.VALIDATION_ERROR]: 'Drugs validation failed',

  // Delete validation messages
  [DrugsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete drugs - has related records',
  [DrugsErrorCode.CANNOT_DELETE_HAS_DRUG_DISTRIBUTION_ITEMS]:
    'Cannot delete drugs - has drug_distribution_items references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_DRUG_FOCUS_LISTS]:
    'Cannot delete drugs - has drug_focus_lists references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_DRUG_LOTS]:
    'Cannot delete drugs - has drug_lots references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_DRUG_PACK_RATIOS]:
    'Cannot delete drugs - has drug_pack_ratios references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS]:
    'Cannot delete drugs - has drug_return_items references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS]:
    'Cannot delete drugs - has hospital_pharmaceutical_products references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_INVENTORY]:
    'Cannot delete drugs - has inventory references',
  [DrugsErrorCode.CANNOT_DELETE_HAS_TMT_MAPPINGS]:
    'Cannot delete drugs - has tmt_mappings references',

  // Business rule messages
  [DrugsErrorCode.INVALID_VALUE_UNIT_PRICE]:
    'unit_price must be a positive number',
};
