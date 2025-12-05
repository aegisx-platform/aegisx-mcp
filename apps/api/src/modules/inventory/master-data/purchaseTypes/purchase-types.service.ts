import { BaseService } from '../../../../shared/services/base.service';
import { PurchaseTypesRepository } from './purchase-types.repository';
import {
  type PurchaseTypes,
  type CreatePurchaseTypes,
  type UpdatePurchaseTypes,
  type GetPurchaseTypesQuery,
  type ListPurchaseTypesQuery,
} from './purchase-types.types';

/**
 * PurchaseTypes Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class PurchaseTypesService extends BaseService<
  PurchaseTypes,
  CreatePurchaseTypes,
  UpdatePurchaseTypes
> {
  constructor(private purchaseTypesRepository: PurchaseTypesRepository) {
    super(purchaseTypesRepository);
  }

  /**
   * Get purchaseTypes by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetPurchaseTypesQuery = {},
  ): Promise<PurchaseTypes | null> {
    const purchaseTypes = await this.getById(id);

    if (purchaseTypes) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return purchaseTypes;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListPurchaseTypesQuery = {}): Promise<{
    data: PurchaseTypes[];
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
   * Create new purchaseTypes
   */
  async create(data: CreatePurchaseTypes): Promise<PurchaseTypes> {
    const purchaseTypes = await super.create(data);

    return purchaseTypes;
  }

  /**
   * Update existing purchaseTypes
   */
  async update(
    id: string | number,
    data: UpdatePurchaseTypes,
  ): Promise<PurchaseTypes | null> {
    const purchaseTypes = await super.update(id, data);

    return purchaseTypes;
  }

  /**
   * Delete purchaseTypes
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete purchaseTypes with ID:', id);

      // Check if purchaseTypes exists first
      const existing = await this.purchaseTypesRepository.findById(id);
      if (!existing) {
        console.log('PurchaseTypes not found for deletion:', id);
        return false;
      }

      console.log('Found purchaseTypes to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.purchaseTypesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('PurchaseTypes deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting purchaseTypes:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating purchaseTypes
   */
  protected async validateCreate(data: CreatePurchaseTypes): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreatePurchaseTypes,
  ): Promise<CreatePurchaseTypes> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after purchaseTypes creation
   */
  protected async afterCreate(
    purchaseTypes: PurchaseTypes,
    _originalData: CreatePurchaseTypes,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'PurchaseTypes created:',
      JSON.stringify(purchaseTypes),
      '(ID: ' + purchaseTypes.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: PurchaseTypes,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
