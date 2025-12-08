// Import and re-export types from schemas for convenience
import {
  type Contracts,
  type CreateContracts,
  type UpdateContracts,
  type ContractsIdParam,
  type GetContractsQuery,
  type ListContractsQuery,
} from './contracts.schemas';

export {
  type Contracts,
  type CreateContracts,
  type UpdateContracts,
  type ContractsIdParam,
  type GetContractsQuery,
  type ListContractsQuery,
};

// Additional type definitions
export interface ContractsRepository {
  create(data: CreateContracts): Promise<Contracts>;
  findById(id: number | string): Promise<Contracts | null>;
  findMany(query: ListContractsQuery): Promise<{
    data: Contracts[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateContracts): Promise<Contracts | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface ContractsEntity {
  id: number;
  contract_number: string;
  contract_type: any;
  vendor_id: number;
  start_date: Date;
  end_date: Date;
  total_value: number;
  remaining_value: number;
  fiscal_year: string;
  status: any | null;
  egp_number: string | null;
  project_number: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Contracts module
 * Auto-generated based on database constraints and business rules
 */
export enum ContractsErrorCode {
  // Standard errors
  NOT_FOUND = 'CONTRACTS_NOT_FOUND',
  VALIDATION_ERROR = 'CONTRACTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'CONTRACTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_CONTRACT_ITEMS = 'CONTRACTS_CANNOT_DELETE_HAS_CONTRACT_ITEMS',
  CANNOT_DELETE_HAS_PURCHASE_ORDERS = 'CONTRACTS_CANNOT_DELETE_HAS_PURCHASE_ORDERS',
}

/**
 * Error messages mapped to error codes
 */
export const ContractsErrorMessages: Record<ContractsErrorCode, string> = {
  [ContractsErrorCode.NOT_FOUND]: 'Contracts not found',
  [ContractsErrorCode.VALIDATION_ERROR]: 'Contracts validation failed',

  // Delete validation messages
  [ContractsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete contracts - has related records',
  [ContractsErrorCode.CANNOT_DELETE_HAS_CONTRACT_ITEMS]:
    'Cannot delete contracts - has contract_items references',
  [ContractsErrorCode.CANNOT_DELETE_HAS_PURCHASE_ORDERS]:
    'Cannot delete contracts - has purchase_orders references',
};
