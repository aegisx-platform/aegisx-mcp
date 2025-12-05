import { BaseService } from '../../../../shared/services/base.service';
import { HospitalPharmaceuticalProductsRepository } from './hospital-pharmaceutical-products.repository';
import {
  type HospitalPharmaceuticalProducts,
  type CreateHospitalPharmaceuticalProducts,
  type UpdateHospitalPharmaceuticalProducts,
  type GetHospitalPharmaceuticalProductsQuery,
  type ListHospitalPharmaceuticalProductsQuery,
  HospitalPharmaceuticalProductsErrorCode,
  HospitalPharmaceuticalProductsErrorMessages,
} from './hospital-pharmaceutical-products.types';

/**
 * HospitalPharmaceuticalProducts Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class HospitalPharmaceuticalProductsService extends BaseService<
  HospitalPharmaceuticalProducts,
  CreateHospitalPharmaceuticalProducts,
  UpdateHospitalPharmaceuticalProducts
> {
  constructor(
    private hospitalPharmaceuticalProductsRepository: HospitalPharmaceuticalProductsRepository,
  ) {
    super(hospitalPharmaceuticalProductsRepository);
  }

  /**
   * Get hospitalPharmaceuticalProducts by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetHospitalPharmaceuticalProductsQuery = {},
  ): Promise<HospitalPharmaceuticalProducts | null> {
    const hospitalPharmaceuticalProducts = await this.getById(id);

    if (hospitalPharmaceuticalProducts) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return hospitalPharmaceuticalProducts;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(
    options: ListHospitalPharmaceuticalProductsQuery = {},
  ): Promise<{
    data: HospitalPharmaceuticalProducts[];
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
   * Create new hospitalPharmaceuticalProducts
   */
  async create(
    data: CreateHospitalPharmaceuticalProducts,
  ): Promise<HospitalPharmaceuticalProducts> {
    const hospitalPharmaceuticalProducts = await super.create(data);

    return hospitalPharmaceuticalProducts;
  }

  /**
   * Update existing hospitalPharmaceuticalProducts
   */
  async update(
    id: string | number,
    data: UpdateHospitalPharmaceuticalProducts,
  ): Promise<HospitalPharmaceuticalProducts | null> {
    const hospitalPharmaceuticalProducts = await super.update(id, data);

    return hospitalPharmaceuticalProducts;
  }

  /**
   * Delete hospitalPharmaceuticalProducts
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log(
        'Attempting to delete hospitalPharmaceuticalProducts with ID:',
        id,
      );

      // Check if hospitalPharmaceuticalProducts exists first
      const existing =
        await this.hospitalPharmaceuticalProductsRepository.findById(id);
      if (!existing) {
        console.log(
          'HospitalPharmaceuticalProducts not found for deletion:',
          id,
        );
        return false;
      }

      console.log(
        'Found hospitalPharmaceuticalProducts to delete:',
        existing.id,
      );

      // Direct repository call to avoid base service complexity
      const deleted =
        await this.hospitalPharmaceuticalProductsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('HospitalPharmaceuticalProducts deleted successfully:', {
          id,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting hospitalPharmaceuticalProducts:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating hospitalPharmaceuticalProducts
   */
  protected async validateCreate(
    data: CreateHospitalPharmaceuticalProducts,
  ): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateHospitalPharmaceuticalProducts,
  ): Promise<CreateHospitalPharmaceuticalProducts> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after hospitalPharmaceuticalProducts creation
   */
  protected async afterCreate(
    hospitalPharmaceuticalProducts: HospitalPharmaceuticalProducts,
    _originalData: CreateHospitalPharmaceuticalProducts,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'HospitalPharmaceuticalProducts created:',
      JSON.stringify(hospitalPharmaceuticalProducts),
      '(ID: ' + hospitalPharmaceuticalProducts.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: HospitalPharmaceuticalProducts,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck =
      await this.hospitalPharmaceuticalProductsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          HospitalPharmaceuticalProductsErrorMessages[
            HospitalPharmaceuticalProductsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code =
          HospitalPharmaceuticalProductsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete hospitalPharmaceuticalProducts - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
