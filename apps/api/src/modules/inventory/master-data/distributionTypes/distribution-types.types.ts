// Import and re-export types from schemas for convenience
import {
  type DistributionTypes,
  type CreateDistributionTypes,
  type UpdateDistributionTypes,
  type DistributionTypesIdParam,
  type GetDistributionTypesQuery,
  type ListDistributionTypesQuery,
} from './distribution-types.schemas';

export {
  type DistributionTypes,
  type CreateDistributionTypes,
  type UpdateDistributionTypes,
  type DistributionTypesIdParam,
  type GetDistributionTypesQuery,
  type ListDistributionTypesQuery,
};

// Additional type definitions
export interface DistributionTypesRepository {
  create(data: CreateDistributionTypes): Promise<DistributionTypes>;
  findById(id: number | string): Promise<DistributionTypes | null>;
  findMany(query: ListDistributionTypesQuery): Promise<{
    data: DistributionTypes[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateDistributionTypes,
  ): Promise<DistributionTypes | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface DistributionTypesEntity {
  id: number;
  type_code: string;
  type_name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for DistributionTypes module
 * Auto-generated based on database constraints and business rules
 */
export enum DistributionTypesErrorCode {
  // Standard errors
  NOT_FOUND = 'DISTRIBUTION_TYPES_NOT_FOUND',
  VALIDATION_ERROR = 'DISTRIBUTION_TYPES_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'DISTRIBUTION_TYPES_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS = 'DISTRIBUTION_TYPES_CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS',
}

/**
 * Error messages mapped to error codes
 */
export const DistributionTypesErrorMessages: Record<
  DistributionTypesErrorCode,
  string
> = {
  [DistributionTypesErrorCode.NOT_FOUND]: 'DistributionTypes not found',
  [DistributionTypesErrorCode.VALIDATION_ERROR]:
    'DistributionTypes validation failed',

  // Delete validation messages
  [DistributionTypesErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete distributionTypes - has related records',
  [DistributionTypesErrorCode.CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS]:
    'Cannot delete distributionTypes - has drug_distributions references',
};
