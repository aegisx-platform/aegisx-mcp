// Import and re-export types from schemas for convenience
import {
  type DosageForms,
  type CreateDosageForms,
  type UpdateDosageForms,
  type DosageFormsIdParam,
  type GetDosageFormsQuery,
  type ListDosageFormsQuery,
} from './dosage-forms.schemas';

export {
  type DosageForms,
  type CreateDosageForms,
  type UpdateDosageForms,
  type DosageFormsIdParam,
  type GetDosageFormsQuery,
  type ListDosageFormsQuery,
};

// Additional type definitions
export interface DosageFormsRepository {
  create(data: CreateDosageForms): Promise<DosageForms>;
  findById(id: number | string): Promise<DosageForms | null>;
  findMany(query: ListDosageFormsQuery): Promise<{
    data: DosageForms[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDosageForms,
  ): Promise<DosageForms | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DosageFormsEntity {
  id: number;
  form_code: string;
  form_name: string;
  form_name_en: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DosageForms module
 * Auto-generated based on database constraints and business rules
 */
export enum DosageFormsErrorCode {
  // Standard errors
  NOT_FOUND = 'DOSAGE_FORMS_NOT_FOUND',
  VALIDATION_ERROR = 'DOSAGE_FORMS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DOSAGE_FORMS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_GENERICS = 'DOSAGE_FORMS_CANNOT_DELETE_HAS_DRUG_GENERICS',
}

/**
 * Error messages mapped to error codes
 */
export const DosageFormsErrorMessages: Record<DosageFormsErrorCode, string> = {
  [DosageFormsErrorCode.NOT_FOUND]: 'DosageForms not found',
  [DosageFormsErrorCode.VALIDATION_ERROR]: 'DosageForms validation failed',

  // Delete validation messages
  [DosageFormsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete dosageForms - has related records',
  [DosageFormsErrorCode.CANNOT_DELETE_HAS_DRUG_GENERICS]:
    'Cannot delete dosageForms - has drug_generics references',
};
