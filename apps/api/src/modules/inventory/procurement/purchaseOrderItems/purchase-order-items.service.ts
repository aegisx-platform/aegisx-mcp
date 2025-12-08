import { BaseService } from '../../../../shared/services/base.service';
import { PurchaseOrderItemsRepository } from './purchase-order-items.repository';
import {
  type PurchaseOrderItems,
  type CreatePurchaseOrderItems,
  type UpdatePurchaseOrderItems,
  type GetPurchaseOrderItemsQuery,
  type ListPurchaseOrderItemsQuery,
  PurchaseOrderItemsErrorCode,
  PurchaseOrderItemsErrorMessages,
} from './purchase-order-items.types';

/**
 * PurchaseOrderItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class PurchaseOrderItemsService extends BaseService<
  PurchaseOrderItems,
  CreatePurchaseOrderItems,
  UpdatePurchaseOrderItems
> {
  constructor(
    private purchaseOrderItemsRepository: PurchaseOrderItemsRepository,
  ) {
    super(purchaseOrderItemsRepository);
  }

  /**
   * Get purchaseOrderItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetPurchaseOrderItemsQuery = {},
  ): Promise<PurchaseOrderItems | null> {
    const purchaseOrderItems = await this.getById(id);

    if (purchaseOrderItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return purchaseOrderItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListPurchaseOrderItemsQuery = {}): Promise<{
    data: PurchaseOrderItems[];
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
   * Create new purchaseOrderItems
   */
  async create(data: CreatePurchaseOrderItems): Promise<PurchaseOrderItems> {
    const purchaseOrderItems = await super.create(data);

    return purchaseOrderItems;
  }

  /**
   * Update existing purchaseOrderItems
   */
  async update(
    id: string | number,
    data: UpdatePurchaseOrderItems,
  ): Promise<PurchaseOrderItems | null> {
    const purchaseOrderItems = await super.update(id, data);

    return purchaseOrderItems;
  }

  /**
   * Delete purchaseOrderItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete purchaseOrderItems with ID:', id);

      // Check if purchaseOrderItems exists first
      const existing = await this.purchaseOrderItemsRepository.findById(id);
      if (!existing) {
        console.log('PurchaseOrderItems not found for deletion:', id);
        return false;
      }

      console.log('Found purchaseOrderItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.purchaseOrderItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('PurchaseOrderItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting purchaseOrderItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating purchaseOrderItems
   */
  protected async validateCreate(
    data: CreatePurchaseOrderItems,
  ): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity must be positive
    if (data.quantity !== undefined && data.quantity !== null) {
      if (Number(data.quantity) < 0) {
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.INVALID_VALUE_QUANTITY
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.INVALID_VALUE_QUANTITY;
        throw error;
      }
    }

    // Business rule: unit_price must be positive
    if (data.unit_price !== undefined && data.unit_price !== null) {
      if (Number(data.unit_price) < 0) {
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.INVALID_VALUE_UNIT_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.INVALID_VALUE_UNIT_PRICE;
        throw error;
      }
    }

    // Business rule: discount_percent must be positive
    if (data.discount_percent !== undefined && data.discount_percent !== null) {
      if (Number(data.discount_percent) < 0) {
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_PERCENT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_PERCENT;
        throw error;
      }
    }

    // Business rule: discount_amount must be positive
    if (data.discount_amount !== undefined && data.discount_amount !== null) {
      if (Number(data.discount_amount) < 0) {
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_AMOUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.INVALID_VALUE_DISCOUNT_AMOUNT;
        throw error;
      }
    }

    // Business rule: total_price must be positive
    if (data.total_price !== undefined && data.total_price !== null) {
      if (Number(data.total_price) < 0) {
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.INVALID_VALUE_TOTAL_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.INVALID_VALUE_TOTAL_PRICE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreatePurchaseOrderItems,
  ): Promise<CreatePurchaseOrderItems> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after purchaseOrderItems creation
   */
  protected async afterCreate(
    purchaseOrderItems: PurchaseOrderItems,
    _originalData: CreatePurchaseOrderItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'PurchaseOrderItems created:',
      JSON.stringify(purchaseOrderItems),
      '(ID: ' + purchaseOrderItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: PurchaseOrderItems,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck =
      await this.purchaseOrderItemsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          PurchaseOrderItemsErrorMessages[
            PurchaseOrderItemsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = PurchaseOrderItemsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete purchaseOrderItems - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
