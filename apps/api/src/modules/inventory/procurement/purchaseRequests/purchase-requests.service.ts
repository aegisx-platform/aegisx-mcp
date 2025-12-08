import { BaseService } from '../../../../shared/services/base.service';
import { PurchaseRequestsRepository } from './purchase-requests.repository';
import {
  type PurchaseRequests,
  type CreatePurchaseRequests,
  type UpdatePurchaseRequests,
  type GetPurchaseRequestsQuery,
  type ListPurchaseRequestsQuery,
  PurchaseRequestsErrorCode,
  PurchaseRequestsErrorMessages,
} from './purchase-requests.types';

/**
 * PurchaseRequests Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class PurchaseRequestsService extends BaseService<
  PurchaseRequests,
  CreatePurchaseRequests,
  UpdatePurchaseRequests
> {
  constructor(private purchaseRequestsRepository: PurchaseRequestsRepository) {
    super(purchaseRequestsRepository);
  }

  /**
   * Get purchaseRequests by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetPurchaseRequestsQuery = {},
  ): Promise<PurchaseRequests | null> {
    const purchaseRequests = await this.getById(id);

    if (purchaseRequests) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return purchaseRequests;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListPurchaseRequestsQuery = {}): Promise<{
    data: PurchaseRequests[];
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
   * Create new purchaseRequests
   */
  async create(data: CreatePurchaseRequests): Promise<PurchaseRequests> {
    const purchaseRequests = await super.create(data);

    return purchaseRequests;
  }

  /**
   * Update existing purchaseRequests
   */
  async update(
    id: string | number,
    data: UpdatePurchaseRequests,
  ): Promise<PurchaseRequests | null> {
    const purchaseRequests = await super.update(id, data);

    return purchaseRequests;
  }

  /**
   * Delete purchaseRequests
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete purchaseRequests with ID:', id);

      // Check if purchaseRequests exists first
      const existing = await this.purchaseRequestsRepository.findById(id);
      if (!existing) {
        console.log('PurchaseRequests not found for deletion:', id);
        return false;
      }

      console.log('Found purchaseRequests to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.purchaseRequestsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('PurchaseRequests deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting purchaseRequests:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating purchaseRequests
   */
  protected async validateCreate(data: CreatePurchaseRequests): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_amount must be positive
    if (data.total_amount !== undefined && data.total_amount !== null) {
      if (Number(data.total_amount) < 0) {
        const error = new Error(
          PurchaseRequestsErrorMessages[
            PurchaseRequestsErrorCode.INVALID_VALUE_TOTAL_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseRequestsErrorCode.INVALID_VALUE_TOTAL_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreatePurchaseRequests,
  ): Promise<CreatePurchaseRequests> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after purchaseRequests creation
   */
  protected async afterCreate(
    purchaseRequests: PurchaseRequests,
    _originalData: CreatePurchaseRequests,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'PurchaseRequests created:',
      JSON.stringify(purchaseRequests),
      '(ID: ' + purchaseRequests.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: PurchaseRequests,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.purchaseRequestsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          PurchaseRequestsErrorMessages[
            PurchaseRequestsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseRequestsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete purchaseRequests - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
