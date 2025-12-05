// Import and re-export types from schemas for convenience
import {
  type AdjustmentReasons,
  type CreateAdjustmentReasons,
  type UpdateAdjustmentReasons,
  type AdjustmentReasonsIdParam,
  type GetAdjustmentReasonsQuery,
  type ListAdjustmentReasonsQuery,
} from './adjustment-reasons.schemas';

export {
  type AdjustmentReasons,
  type CreateAdjustmentReasons,
  type UpdateAdjustmentReasons,
  type AdjustmentReasonsIdParam,
  type GetAdjustmentReasonsQuery,
  type ListAdjustmentReasonsQuery,
};

// Additional type definitions
export interface AdjustmentReasonsRepository {
  create(data: CreateAdjustmentReasons): Promise<AdjustmentReasons>;
  findById(id: number | string): Promise<AdjustmentReasons | null>;
  findMany(query: ListAdjustmentReasonsQuery): Promise<{
    data: AdjustmentReasons[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateAdjustmentReasons,
  ): Promise<AdjustmentReasons | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface AdjustmentReasonsEntity {
  id: number;
  reason_code: string;
  reason_name: string;
  adjustment_type: any | null;
  requires_approval: boolean | null;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for AdjustmentReasons module
 * Auto-generated based on database constraints and business rules
 */
export enum AdjustmentReasonsErrorCode {
  // Standard errors
  NOT_FOUND = 'ADJUSTMENT_REASONS_NOT_FOUND',
  VALIDATION_ERROR = 'ADJUSTMENT_REASONS_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const AdjustmentReasonsErrorMessages: Record<
  AdjustmentReasonsErrorCode,
  string
> = {
  [AdjustmentReasonsErrorCode.NOT_FOUND]: 'AdjustmentReasons not found',
  [AdjustmentReasonsErrorCode.VALIDATION_ERROR]:
    'AdjustmentReasons validation failed',
};
