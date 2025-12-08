import { BaseService } from '../../../../shared/services/base.service';
import { ReceiptInspectorsRepository } from './receipt-inspectors.repository';
import {
  type ReceiptInspectors,
  type CreateReceiptInspectors,
  type UpdateReceiptInspectors,
  type GetReceiptInspectorsQuery,
  type ListReceiptInspectorsQuery,
} from './receipt-inspectors.types';

/**
 * ReceiptInspectors Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ReceiptInspectorsService extends BaseService<
  ReceiptInspectors,
  CreateReceiptInspectors,
  UpdateReceiptInspectors
> {
  constructor(
    private receiptInspectorsRepository: ReceiptInspectorsRepository,
  ) {
    super(receiptInspectorsRepository);
  }

  /**
   * Get receiptInspectors by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetReceiptInspectorsQuery = {},
  ): Promise<ReceiptInspectors | null> {
    const receiptInspectors = await this.getById(id);

    if (receiptInspectors) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return receiptInspectors;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListReceiptInspectorsQuery = {}): Promise<{
    data: ReceiptInspectors[];
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
   * Create new receiptInspectors
   */
  async create(data: CreateReceiptInspectors): Promise<ReceiptInspectors> {
    const receiptInspectors = await super.create(data);

    return receiptInspectors;
  }

  /**
   * Update existing receiptInspectors
   */
  async update(
    id: string | number,
    data: UpdateReceiptInspectors,
  ): Promise<ReceiptInspectors | null> {
    const receiptInspectors = await super.update(id, data);

    return receiptInspectors;
  }

  /**
   * Delete receiptInspectors
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete receiptInspectors with ID:', id);

      // Check if receiptInspectors exists first
      const existing = await this.receiptInspectorsRepository.findById(id);
      if (!existing) {
        console.log('ReceiptInspectors not found for deletion:', id);
        return false;
      }

      console.log('Found receiptInspectors to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.receiptInspectorsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ReceiptInspectors deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting receiptInspectors:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating receiptInspectors
   */
  protected async validateCreate(data: CreateReceiptInspectors): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateReceiptInspectors,
  ): Promise<CreateReceiptInspectors> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after receiptInspectors creation
   */
  protected async afterCreate(
    receiptInspectors: ReceiptInspectors,
    _originalData: CreateReceiptInspectors,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ReceiptInspectors created:',
      JSON.stringify(receiptInspectors),
      '(ID: ' + receiptInspectors.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: ReceiptInspectors,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
