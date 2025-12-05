// Import and re-export types from schemas for convenience
import {
  type PurchaseTypes,
  type CreatePurchaseTypes,
  type UpdatePurchaseTypes,
  type PurchaseTypesIdParam,
  type GetPurchaseTypesQuery,
  type ListPurchaseTypesQuery,
} from './purchase-types.schemas';

export {
  type PurchaseTypes,
  type CreatePurchaseTypes,
  type UpdatePurchaseTypes,
  type PurchaseTypesIdParam,
  type GetPurchaseTypesQuery,
  type ListPurchaseTypesQuery,
};

// Additional type definitions
export interface PurchaseTypesRepository {
  create(data: CreatePurchaseTypes): Promise<PurchaseTypes>;
  findById(id: number | string): Promise<PurchaseTypes | null>;
  findMany(query: ListPurchaseTypesQuery): Promise<{
    data: PurchaseTypes[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdatePurchaseTypes,
  ): Promise<PurchaseTypes | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface PurchaseTypesEntity {
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
 * Error codes for PurchaseTypes module
 * Auto-generated based on database constraints and business rules
 */
export enum PurchaseTypesErrorCode {
  // Standard errors
  NOT_FOUND = 'PURCHASE_TYPES_NOT_FOUND',
  VALIDATION_ERROR = 'PURCHASE_TYPES_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const PurchaseTypesErrorMessages: Record<
  PurchaseTypesErrorCode,
  string
> = {
  [PurchaseTypesErrorCode.NOT_FOUND]: 'PurchaseTypes not found',
  [PurchaseTypesErrorCode.VALIDATION_ERROR]: 'PurchaseTypes validation failed',
};
