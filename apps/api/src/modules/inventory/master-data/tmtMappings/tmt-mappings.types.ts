// Import and re-export types from schemas for convenience
import {
  type TmtMappings,
  type CreateTmtMappings,
  type UpdateTmtMappings,
  type TmtMappingsIdParam,
  type GetTmtMappingsQuery,
  type ListTmtMappingsQuery,
} from './tmt-mappings.schemas';

export {
  type TmtMappings,
  type CreateTmtMappings,
  type UpdateTmtMappings,
  type TmtMappingsIdParam,
  type GetTmtMappingsQuery,
  type ListTmtMappingsQuery,
};

// Additional type definitions
export interface TmtMappingsRepository {
  create(data: CreateTmtMappings): Promise<TmtMappings>;
  findById(id: number | string): Promise<TmtMappings | null>;
  findMany(query: ListTmtMappingsQuery): Promise<{
    data: TmtMappings[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateTmtMappings,
  ): Promise<TmtMappings | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface TmtMappingsEntity {
  id: number;
  working_code: string | null;
  drug_code: string | null;
  generic_id: number | null;
  drug_id: number | null;
  tmt_level: any | null;
  tmt_concept_id: number | null;
  tmt_id: number | null;
  is_verified: boolean | null;
  verified_by: string | null;
  verified_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for TmtMappings module
 * Auto-generated based on database constraints and business rules
 */
export enum TmtMappingsErrorCode {
  // Standard errors
  NOT_FOUND = 'TMT_MAPPINGS_NOT_FOUND',
  VALIDATION_ERROR = 'TMT_MAPPINGS_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const TmtMappingsErrorMessages: Record<TmtMappingsErrorCode, string> = {
  [TmtMappingsErrorCode.NOT_FOUND]: 'TmtMappings not found',
  [TmtMappingsErrorCode.VALIDATION_ERROR]: 'TmtMappings validation failed',
};
