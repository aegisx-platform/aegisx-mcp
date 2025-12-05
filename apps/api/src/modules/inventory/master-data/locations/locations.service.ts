import { BaseService } from '../../../../shared/services/base.service';
import { LocationsRepository } from './locations.repository';
import {
  type Locations,
  type CreateLocations,
  type UpdateLocations,
  type GetLocationsQuery,
  type ListLocationsQuery,
  LocationsErrorCode,
  LocationsErrorMessages,
} from './locations.types';

/**
 * Locations Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class LocationsService extends BaseService<
  Locations,
  CreateLocations,
  UpdateLocations
> {
  constructor(private locationsRepository: LocationsRepository) {
    super(locationsRepository);
  }

  /**
   * Get locations by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetLocationsQuery = {},
  ): Promise<Locations | null> {
    const locations = await this.getById(id);

    if (locations) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return locations;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListLocationsQuery = {}): Promise<{
    data: Locations[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);

    return result;
  }

  /**
   * Create new locations
   */
  async create(data: CreateLocations): Promise<Locations> {
    const locations = await super.create(data);

    return locations;
  }

  /**
   * Update existing locations
   */
  async update(
    id: string | number,
    data: UpdateLocations,
  ): Promise<Locations | null> {
    const locations = await super.update(id, data);

    return locations;
  }

  /**
   * Delete locations
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete locations with ID:', id);

      // Check if locations exists first
      const existing = await this.locationsRepository.findById(id);
      if (!existing) {
        console.log('Locations not found for deletion:', id);
        return false;
      }

      console.log('Found locations to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.locationsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Locations deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting locations:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating locations
   */
  protected async validateCreate(data: CreateLocations): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateLocations,
  ): Promise<CreateLocations> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after locations creation
   */
  protected async afterCreate(
    locations: Locations,
    _originalData: CreateLocations,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Locations created:',
      JSON.stringify(locations),
      '(ID: ' + locations.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Locations,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.locationsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          LocationsErrorMessages[
            LocationsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = LocationsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete locations - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
