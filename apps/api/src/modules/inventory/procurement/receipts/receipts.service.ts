import { BaseService } from '../../../../shared/services/base.service';
import { ReceiptsRepository } from './receipts.repository';
import {
  type Receipts,
  type CreateReceipts,
  type UpdateReceipts,
  type GetReceiptsQuery,
  type ListReceiptsQuery,
  ReceiptsErrorCode,
  ReceiptsErrorMessages,
} from './receipts.types';

/**
 * Receipts Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ReceiptsService extends BaseService<
  Receipts,
  CreateReceipts,
  UpdateReceipts
> {
  constructor(private receiptsRepository: ReceiptsRepository) {
    super(receiptsRepository);
  }

  /**
   * Get receipts by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetReceiptsQuery = {},
  ): Promise<Receipts | null> {
    const receipts = await this.getById(id);

    if (receipts) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return receipts;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListReceiptsQuery = {}): Promise<{
    data: Receipts[];
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
   * Create new receipts
   */
  async create(data: CreateReceipts): Promise<Receipts> {
    const receipts = await super.create(data);

    return receipts;
  }

  /**
   * Update existing receipts
   */
  async update(
    id: string | number,
    data: UpdateReceipts,
  ): Promise<Receipts | null> {
    const receipts = await super.update(id, data);

    return receipts;
  }

  /**
   * Delete receipts
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete receipts with ID:', id);

      // Check if receipts exists first
      const existing = await this.receiptsRepository.findById(id);
      if (!existing) {
        console.log('Receipts not found for deletion:', id);
        return false;
      }

      console.log('Found receipts to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.receiptsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Receipts deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting receipts:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating receipts
   */
  protected async validateCreate(data: CreateReceipts): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: total_amount must be positive
    if (data.total_amount !== undefined && data.total_amount !== null) {
      if (Number(data.total_amount) < 0) {
        const error = new Error(
          ReceiptsErrorMessages[ReceiptsErrorCode.INVALID_VALUE_TOTAL_AMOUNT],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptsErrorCode.INVALID_VALUE_TOTAL_AMOUNT;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateReceipts): Promise<CreateReceipts> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after receipts creation
   */
  protected async afterCreate(
    receipts: Receipts,
    _originalData: CreateReceipts,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Receipts created:',
      JSON.stringify(receipts),
      '(ID: ' + receipts.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Receipts,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.receiptsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          ReceiptsErrorMessages[ReceiptsErrorCode.CANNOT_DELETE_HAS_REFERENCES],
        ) as any;
        error.statusCode = 422;
        error.code = ReceiptsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete receipts - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
