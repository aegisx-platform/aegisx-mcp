// Import and re-export types from schemas for convenience
import {
  type Hospitals,
  type CreateHospitals,
  type UpdateHospitals,
  type HospitalsIdParam,
  type GetHospitalsQuery,
  type ListHospitalsQuery,
} from './hospitals.schemas';

export {
  type Hospitals,
  type CreateHospitals,
  type UpdateHospitals,
  type HospitalsIdParam,
  type GetHospitalsQuery,
  type ListHospitalsQuery,
};

// Additional type definitions
export interface HospitalsRepository {
  create(data: CreateHospitals): Promise<Hospitals>;
  findById(id: number | string): Promise<Hospitals | null>;
  findMany(query: ListHospitalsQuery): Promise<{
    data: Hospitals[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateHospitals): Promise<Hospitals | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface HospitalsEntity {
  id: number;
  hospital_code: string;
  hospital_name: string;
  hospital_type: string | null;
  province: string | null;
  region: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Hospitals module
 * Auto-generated based on database constraints and business rules
 */
export enum HospitalsErrorCode {
  // Standard errors
  NOT_FOUND = 'HOSPITALS_NOT_FOUND',
  VALIDATION_ERROR = 'HOSPITALS_VALIDATION_ERROR',
}

/**
 * Error messages mapped to error codes
 */
export const HospitalsErrorMessages: Record<HospitalsErrorCode, string> = {
  [HospitalsErrorCode.NOT_FOUND]: 'Hospitals not found',
  [HospitalsErrorCode.VALIDATION_ERROR]: 'Hospitals validation failed',
};
