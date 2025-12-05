// Import and re-export types from schemas for convenience
import {
  type Locations,
  type CreateLocations,
  type UpdateLocations,
  type LocationsIdParam,
  type GetLocationsQuery,
  type ListLocationsQuery,
} from './locations.schemas';

export {
  type Locations,
  type CreateLocations,
  type UpdateLocations,
  type LocationsIdParam,
  type GetLocationsQuery,
  type ListLocationsQuery,
};

// Additional type definitions
export interface LocationsRepository {
  create(data: CreateLocations): Promise<Locations>;
  findById(id: number | string): Promise<Locations | null>;
  findMany(query: ListLocationsQuery): Promise<{
    data: Locations[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateLocations): Promise<Locations | null>;
  delete(id: number | string): Promise<boolean>;
}

// Database entity type (matches database table structure exactly)
export interface LocationsEntity {
  id: number;
  location_code: string;
  location_name: string;
  location_type: any;
  parent_id: number | null;
  address: string | null;
  responsible_person: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for Locations module
 * Auto-generated based on database constraints and business rules
 */
export enum LocationsErrorCode {
  // Standard errors
  NOT_FOUND = 'LOCATIONS_NOT_FOUND',
  VALIDATION_ERROR = 'LOCATIONS_VALIDATION_ERROR',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'LOCATIONS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS = 'LOCATIONS_CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS',
  CANNOT_DELETE_HAS_DRUG_LOTS = 'LOCATIONS_CANNOT_DELETE_HAS_DRUG_LOTS',
  CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS = 'LOCATIONS_CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS',
  CANNOT_DELETE_HAS_INVENTORY = 'LOCATIONS_CANNOT_DELETE_HAS_INVENTORY',
  CANNOT_DELETE_HAS_LOCATIONS = 'LOCATIONS_CANNOT_DELETE_HAS_LOCATIONS',
  CANNOT_DELETE_HAS_RECEIPTS = 'LOCATIONS_CANNOT_DELETE_HAS_RECEIPTS',
}

/**
 * Error messages mapped to error codes
 */
export const LocationsErrorMessages: Record<LocationsErrorCode, string> = {
  [LocationsErrorCode.NOT_FOUND]: 'Locations not found',
  [LocationsErrorCode.VALIDATION_ERROR]: 'Locations validation failed',

  // Delete validation messages
  [LocationsErrorCode.CANNOT_DELETE_HAS_REFERENCES]:
    'Cannot delete locations - has related records',
  [LocationsErrorCode.CANNOT_DELETE_HAS_DRUG_DISTRIBUTIONS]:
    'Cannot delete locations - has drug_distributions references',
  [LocationsErrorCode.CANNOT_DELETE_HAS_DRUG_LOTS]:
    'Cannot delete locations - has drug_lots references',
  [LocationsErrorCode.CANNOT_DELETE_HAS_DRUG_RETURN_ITEMS]:
    'Cannot delete locations - has drug_return_items references',
  [LocationsErrorCode.CANNOT_DELETE_HAS_INVENTORY]:
    'Cannot delete locations - has inventory references',
  [LocationsErrorCode.CANNOT_DELETE_HAS_LOCATIONS]:
    'Cannot delete locations - has locations references',
  [LocationsErrorCode.CANNOT_DELETE_HAS_RECEIPTS]:
    'Cannot delete locations - has receipts references',
};
