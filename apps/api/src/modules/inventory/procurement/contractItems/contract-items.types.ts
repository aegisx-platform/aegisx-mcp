// Import and re-export types from schemas for convenience
import {
  type ContractItems,
  type CreateContractItems,
  type UpdateContractItems,
  type ContractItemsIdParam,
  type GetContractItemsQuery,
  type ListContractItemsQuery,
} from './contract-items.schemas';

export {
  type ContractItems,
  type CreateContractItems,
  type UpdateContractItems,
  type ContractItemsIdParam,
  type GetContractItemsQuery,
  type ListContractItemsQuery,
};

// Additional type definitions
export interface ContractItemsRepository {
  create(data: CreateContractItems): Promise<ContractItems>;
  findById(id: number | string): Promise<ContractItems | null>;
  findMany(query: ListContractItemsQuery): Promise<{
    data: ContractItems[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateContractItems,
  ): Promise<ContractItems | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ContractItemsEntity {
  id: number;
  contract_id: number;
  generic_id: number;
  agreed_unit_price: number;
  quantity_limit: number | null;
  quantity_used: number | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for ContractItems module
 * Auto-generated based on database constraints and business rules
 */
export enum ContractItemsErrorCode {
  // Standard errors
  NOT_FOUND = 'CONTRACT_ITEMS_NOT_FOUND',
  VALIDATION_ERROR = 'CONTRACT_ITEMS_VALIDATION_ERROR',

  // Business rule validation errors (422)
  INVALID_VALUE_AGREED_UNIT_PRICE = 'CONTRACT_ITEMS_INVALID_VALUE_AGREED_UNIT_PRICE',
  INVALID_VALUE_QUANTITY_LIMIT = 'CONTRACT_ITEMS_INVALID_VALUE_QUANTITY_LIMIT',
  INVALID_VALUE_QUANTITY_USED = 'CONTRACT_ITEMS_INVALID_VALUE_QUANTITY_USED',
}

/**
 * Error messages mapped to error codes
 */
export const ContractItemsErrorMessages: Record<
  ContractItemsErrorCode,
  string
> = {
  [ContractItemsErrorCode.NOT_FOUND]: 'ContractItems not found',
  [ContractItemsErrorCode.VALIDATION_ERROR]: 'ContractItems validation failed',

  // Business rule messages
  [ContractItemsErrorCode.INVALID_VALUE_AGREED_UNIT_PRICE]:
    'agreed_unit_price must be a positive number',
  [ContractItemsErrorCode.INVALID_VALUE_QUANTITY_LIMIT]:
    'quantity_limit must be a positive number',
  [ContractItemsErrorCode.INVALID_VALUE_QUANTITY_USED]:
    'quantity_used must be a positive number',
};
