// Import and re-export types from schemas for convenience
import {
  type DrugUnits,
  type CreateDrugUnits,
  type UpdateDrugUnits,
  type DrugUnitsIdParam,
  type GetDrugUnitsQuery,
  type ListDrugUnitsQuery,
} from './drug-units.schemas';

export {
  type DrugUnits,
  type CreateDrugUnits,
  type UpdateDrugUnits,
  type DrugUnitsIdParam,
  type GetDrugUnitsQuery,
  type ListDrugUnitsQuery,
};

// Additional type definitions
export interface DrugUnitsRepository {
  create(data: CreateDrugUnits): Promise<DrugUnits>;
  findById(id: number | string): Promise<DrugUnits | null>;
  findMany(query: ListDrugUnitsQuery): Promise<{
    data: DrugUnits[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateDrugUnits): Promise<DrugUnits | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DrugUnitsEntity {
  id: number;
  unit_code: string;
  unit_name: string;
  unit_name_en: string | null;
  unit_type: any | null;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DrugUnits module
 * Auto-generated based on database constraints and business rules
 */
export enum DrugUnitsErrorCode {
  // Standard errors
  NOT_FOUND = 'DRUG_UNITS_NOT_FOUND',
  VALIDATION_ERROR = 'DRUG_UNITS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DRUG_UNITS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_GENERICS = 'DRUG_UNITS_CANNOT_DELETE_HAS_DRUG_GENERICS',
}

/**
 * Error messages mapped to error codes
 */
export const DrugUnitsErrorMessages: Record<DrugUnitsErrorCode, string> = {
  [DrugUnitsErrorCode.NOT_FOUND]: 'DrugUnits not found',
  [DrugUnitsErrorCode.VALIDATION_ERROR]: 'DrugUnits validation failed',

  // Delete validation messages
  [DrugUnitsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete drugUnits - has related records',
  [DrugUnitsErrorCode.CANNOT_DELETE_HAS_DRUG_GENERICS]:
    'Cannot delete drugUnits - has drug_generics references',
};
