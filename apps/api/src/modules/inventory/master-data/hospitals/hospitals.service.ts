import { BaseService } from '../../../../shared/services/base.service';
import { HospitalsRepository } from './hospitals.repository';
import {
  type Hospitals,
  type CreateHospitals,
  type UpdateHospitals,
  type GetHospitalsQuery,
  type ListHospitalsQuery,
} from './hospitals.types';

/**
 * Hospitals Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class HospitalsService extends BaseService<
  Hospitals,
  CreateHospitals,
  UpdateHospitals
> {
  constructor(private hospitalsRepository: HospitalsRepository) {
    super(hospitalsRepository);
  }

  /**
   * Get hospitals by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetHospitalsQuery = {},
  ): Promise<Hospitals | null> {
    const hospitals = await this.getById(id);

    if (hospitals) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return hospitals;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListHospitalsQuery = {}): Promise<{
    data: Hospitals[];
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
   * Create new hospitals
   */
  async create(data: CreateHospitals): Promise<Hospitals> {
    const hospitals = await super.create(data);

    return hospitals;
  }

  /**
   * Update existing hospitals
   */
  async update(
    id: string | number,
    data: UpdateHospitals,
  ): Promise<Hospitals | null> {
    const hospitals = await super.update(id, data);

    return hospitals;
  }

  /**
   * Delete hospitals
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete hospitals with ID:', id);

      // Check if hospitals exists first
      const existing = await this.hospitalsRepository.findById(id);
      if (!existing) {
        console.log('Hospitals not found for deletion:', id);
        return false;
      }

      console.log('Found hospitals to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.hospitalsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Hospitals deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting hospitals:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating hospitals
   */
  protected async validateCreate(data: CreateHospitals): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateHospitals,
  ): Promise<CreateHospitals> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after hospitals creation
   */
  protected async afterCreate(
    hospitals: Hospitals,
    _originalData: CreateHospitals,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Hospitals created:',
      JSON.stringify(hospitals),
      '(ID: ' + hospitals.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Hospitals,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
