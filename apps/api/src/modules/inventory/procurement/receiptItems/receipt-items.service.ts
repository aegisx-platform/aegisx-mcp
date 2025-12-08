import { BaseService } from '../../../../shared/services/base.service';
import { ReceiptItemsRepository } from './receipt-items.repository';
import {
  type ReceiptItems,
  type CreateReceiptItems,
  type UpdateReceiptItems,
  type GetReceiptItemsQuery,
  type ListReceiptItemsQuery,
  ReceiptItemsErrorCode,
  ReceiptItemsErrorMessages,
} from './receipt-items.types';

/**
 * ReceiptItems Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ReceiptItemsService extends BaseService<
  ReceiptItems,
  CreateReceiptItems,
  UpdateReceiptItems
> {
  constructor(private receiptItemsRepository: ReceiptItemsRepository) {
    super(receiptItemsRepository);
  }

  /**
   * Get receiptItems by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetReceiptItemsQuery = {},
  ): Promise<ReceiptItems | null> {
    const receiptItems = await this.getById(id);

    if (receiptItems) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return receiptItems;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListReceiptItemsQuery = {}): Promise<{
    data: ReceiptItems[];
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
   * Create new receiptItems
   */
  async create(data: CreateReceiptItems): Promise<ReceiptItems> {
    const receiptItems = await super.create(data);

    return receiptItems;
  }

  /**
   * Update existing receiptItems
   */
  async update(
    id: string | number,
    data: UpdateReceiptItems,
  ): Promise<ReceiptItems | null> {
    const receiptItems = await super.update(id, data);

    return receiptItems;
  }

  /**
   * Delete receiptItems
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete receiptItems with ID:', id);

      // Check if receiptItems exists first
      const existing = await this.receiptItemsRepository.findById(id);
      if (!existing) {
        console.log('ReceiptItems not found for deletion:', id);
        return false;
      }

      console.log('Found receiptItems to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.receiptItemsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ReceiptItems deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting receiptItems:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating receiptItems
   */
  protected async validateCreate(data: CreateReceiptItems): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity_ordered must be positive
    if (data.quantity_ordered !== undefined && data.quantity_ordered !== null) {
      if (Number(data.quantity_ordered) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ORDERED
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ORDERED;
        throw error;
      }
    }

    // Business rule: quantity_received must be positive
    if (
      data.quantity_received !== undefined &&
      data.quantity_received !== null
    ) {
      if (Number(data.quantity_received) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_RECEIVED
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_RECEIVED;
        throw error;
      }
    }

    // Business rule: quantity_accepted must be positive
    if (
      data.quantity_accepted !== undefined &&
      data.quantity_accepted !== null
    ) {
      if (Number(data.quantity_accepted) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ACCEPTED
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_ACCEPTED;
        throw error;
      }
    }

    // Business rule: quantity_rejected must be positive
    if (
      data.quantity_rejected !== undefined &&
      data.quantity_rejected !== null
    ) {
      if (Number(data.quantity_rejected) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_REJECTED
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_QUANTITY_REJECTED;
        throw error;
      }
    }

    // Business rule: unit_price must be positive
    if (data.unit_price !== undefined && data.unit_price !== null) {
      if (Number(data.unit_price) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_UNIT_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_UNIT_PRICE;
        throw error;
      }
    }

    // Business rule: total_price must be positive
    if (data.total_price !== undefined && data.total_price !== null) {
      if (Number(data.total_price) < 0) {
        const error = new Error(
          ReceiptItemsErrorMessages[
            ReceiptItemsErrorCode.INVALID_VALUE_TOTAL_PRICE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptItemsErrorCode.INVALID_VALUE_TOTAL_PRICE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateReceiptItems,
  ): Promise<CreateReceiptItems> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after receiptItems creation
   */
  protected async afterCreate(
    receiptItems: ReceiptItems,
    _originalData: CreateReceiptItems,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ReceiptItems created:',
      JSON.stringify(receiptItems),
      '(ID: ' + receiptItems.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: ReceiptItems,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
