import { BaseService } from '../../../../shared/services/base.service';
import { PurchaseOrdersRepository } from './purchase-orders.repository';
import {
  type PurchaseOrders,
  type CreatePurchaseOrders,
  type UpdatePurchaseOrders,
  type GetPurchaseOrdersQuery,
  type ListPurchaseOrdersQuery,
  PurchaseOrdersErrorCode,
  PurchaseOrdersErrorMessages,
} from './purchase-orders.types';

/**
 * PurchaseOrders Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class PurchaseOrdersService extends BaseService<
  PurchaseOrders,
  CreatePurchaseOrders,
  UpdatePurchaseOrders
> {
  constructor(private purchaseOrdersRepository: PurchaseOrdersRepository) {
    super(purchaseOrdersRepository);
  }

  /**
   * Get purchaseOrders by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetPurchaseOrdersQuery = {},
  ): Promise<PurchaseOrders | null> {
    const purchaseOrders = await this.getById(id);

    if (purchaseOrders) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return purchaseOrders;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListPurchaseOrdersQuery = {}): Promise<{
    data: PurchaseOrders[];
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
   * Create new purchaseOrders
   */
  async create(data: CreatePurchaseOrders): Promise<PurchaseOrders> {
    const purchaseOrders = await super.create(data);

    return purchaseOrders;
  }

  /**
   * Update existing purchaseOrders
   */
  async update(
    id: string | number,
    data: UpdatePurchaseOrders,
  ): Promise<PurchaseOrders | null> {
    const purchaseOrders = await super.update(id, data);

    return purchaseOrders;
  }

  /**
   * Delete purchaseOrders
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete purchaseOrders with ID:', id);

      // Check if purchaseOrders exists first
      const existing = await this.purchaseOrdersRepository.findById(id);
      if (!existing) {
        console.log('PurchaseOrders not found for deletion:', id);
        return false;
      }

      console.log('Found purchaseOrders to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.purchaseOrdersRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('PurchaseOrders deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting purchaseOrders:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating purchaseOrders
   */
  protected async validateCreate(data: CreatePurchaseOrders): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_amount must be positive
    if (data.total_amount !== undefined && data.total_amount !== null) {
      if (Number(data.total_amount) < 0) {
        const error = new Error(
          PurchaseOrdersErrorMessages[
            PurchaseOrdersErrorCode.INVALID_VALUE_TOTAL_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrdersErrorCode.INVALID_VALUE_TOTAL_AMOUNT;
        throw error;
      }
    }

    // Business rule: vat_amount must be positive
    if (data.vat_amount !== undefined && data.vat_amount !== null) {
      if (Number(data.vat_amount) < 0) {
        const error = new Error(
          PurchaseOrdersErrorMessages[
            PurchaseOrdersErrorCode.INVALID_VALUE_VAT_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrdersErrorCode.INVALID_VALUE_VAT_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreatePurchaseOrders,
  ): Promise<CreatePurchaseOrders> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after purchaseOrders creation
   */
  protected async afterCreate(
    purchaseOrders: PurchaseOrders,
    _originalData: CreatePurchaseOrders,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'PurchaseOrders created:',
      JSON.stringify(purchaseOrders),
      '(ID: ' + purchaseOrders.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: PurchaseOrders,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.purchaseOrdersRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          PurchaseOrdersErrorMessages[
            PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrdersErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete purchaseOrders - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
