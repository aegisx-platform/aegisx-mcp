// Import and re-export types from schemas for convenience
import {
  type HospitalPharmaceuticalProducts,
  type CreateHospitalPharmaceuticalProducts,
  type UpdateHospitalPharmaceuticalProducts,
  type HospitalPharmaceuticalProductsIdParam,
  type GetHospitalPharmaceuticalProductsQuery,
  type ListHospitalPharmaceuticalProductsQuery,
} from './hospital-pharmaceutical-products.schemas';

export {
  type HospitalPharmaceuticalProducts,
  type CreateHospitalPharmaceuticalProducts,
  type UpdateHospitalPharmaceuticalProducts,
  type HospitalPharmaceuticalProductsIdParam,
  type GetHospitalPharmaceuticalProductsQuery,
  type ListHospitalPharmaceuticalProductsQuery,
};

// Additional type definitions
export interface HospitalPharmaceuticalProductsRepository {
  create(
    data: CreateHospitalPharmaceuticalProducts,
  ): Promise<HospitalPharmaceuticalProducts>;
  findById(id: number | string): Promise<HospitalPharmaceuticalProducts | null>;
  findMany(query: ListHospitalPharmaceuticalProductsQuery): Promise<{
    data: HospitalPharmaceuticalProducts[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateHospitalPharmaceuticalProducts,
  ): Promise<HospitalPharmaceuticalProducts | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface HospitalPharmaceuticalProductsEntity {
  id: number;
  hpp_code: string;
  hpp_type: any;
  product_name: string;
  generic_id: number | null;
  drug_id: number | null;
  base_product_id: number | null;
  tmt_code: string | null;
  is_outsourced: boolean | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for HospitalPharmaceuticalProducts module
 * Auto-generated based on database constraints and business rules
 */
export enum HospitalPharmaceuticalProductsErrorCode {
  // Standard errors
  NOT_FOUND = 'HOSPITAL_PHARMACEUTICAL_PRODUCTS_NOT_FOUND',
  VALIDATION_ERROR = 'HOSPITAL_PHARMACEUTICAL_PRODUCTS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'HOSPITAL_PHARMACEUTICAL_PRODUCTS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS = 'HOSPITAL_PHARMACEUTICAL_PRODUCTS_CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS',
  CANNOT_DELETE_HAS_HPP_FORMULATIONS = 'HOSPITAL_PHARMACEUTICAL_PRODUCTS_CANNOT_DELETE_HAS_HPP_FORMULATIONS',
}

/**
 * Error messages mapped to error codes
 */
export const HospitalPharmaceuticalProductsErrorMessages: Record<
  HospitalPharmaceuticalProductsErrorCode,
  string
> = {
  [HospitalPharmaceuticalProductsErrorCode.NOT_FOUND]:
    'HospitalPharmaceuticalProducts not found',
  [HospitalPharmaceuticalProductsErrorCode.VALIDATION_ERROR]:
    'HospitalPharmaceuticalProducts validation failed',

  // Delete validation messages
  [HospitalPharmaceuticalProductsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete hospitalPharmaceuticalProducts - has related records',
  [HospitalPharmaceuticalProductsErrorCode.CANNOT_DELETE_HAS_HOSPITAL_PHARMACEUTICAL_PRODUCTS]:
    'Cannot delete hospitalPharmaceuticalProducts - has hospital_pharmaceutical_products references',
  [HospitalPharmaceuticalProductsErrorCode.CANNOT_DELETE_HAS_HPP_FORMULATIONS]:
    'Cannot delete hospitalPharmaceuticalProducts - has hpp_formulations references',
};
