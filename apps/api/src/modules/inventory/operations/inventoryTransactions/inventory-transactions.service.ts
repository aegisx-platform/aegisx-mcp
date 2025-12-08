import { BaseService } from '../../../../shared/services/base.service';
import { InventoryTransactionsRepository } from './inventory-transactions.repository';
import {
  type InventoryTransactions,
  type CreateInventoryTransactions,
  type UpdateInventoryTransactions,
  type GetInventoryTransactionsQuery,
  type ListInventoryTransactionsQuery,
  InventoryTransactionsErrorCode,
  InventoryTransactionsErrorMessages,
} from './inventory-transactions.types';

/**
 * InventoryTransactions Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class InventoryTransactionsService extends BaseService<
  InventoryTransactions,
  CreateInventoryTransactions,
  UpdateInventoryTransactions
> {
  constructor(
    private inventoryTransactionsRepository: InventoryTransactionsRepository,
  ) {
    super(inventoryTransactionsRepository);
  }

  /**
   * Get inventoryTransactions by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetInventoryTransactionsQuery = {},
  ): Promise<InventoryTransactions | null> {
    const inventoryTransactions = await this.getById(id);

    if (inventoryTransactions) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return inventoryTransactions;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListInventoryTransactionsQuery = {}): Promise<{
    data: InventoryTransactions[];
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
   * Create new inventoryTransactions
   */
  async create(
    data: CreateInventoryTransactions,
  ): Promise<InventoryTransactions> {
    const inventoryTransactions = await super.create(data);

    return inventoryTransactions;
  }

  /**
   * Update existing inventoryTransactions
   */
  async update(
    id: string | number,
    data: UpdateInventoryTransactions,
  ): Promise<InventoryTransactions | null> {
    const inventoryTransactions = await super.update(id, data);

    return inventoryTransactions;
  }

  /**
   * Delete inventoryTransactions
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete inventoryTransactions with ID:', id);

      // Check if inventoryTransactions exists first
      const existing = await this.inventoryTransactionsRepository.findById(id);
      if (!existing) {
        console.log('InventoryTransactions not found for deletion:', id);
        return false;
      }

      console.log('Found inventoryTransactions to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.inventoryTransactionsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('InventoryTransactions deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting inventoryTransactions:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating inventoryTransactions
   */
  protected async validateCreate(
    data: CreateInventoryTransactions,
  ): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity must be positive
    if (data.quantity !== undefined && data.quantity !== null) {
      if (Number(data.quantity) < 0) {
        const error = new Error(
          InventoryTransactionsErrorMessages[
            InventoryTransactionsErrorCode.INVALID_VALUE_QUANTITY
          ],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryTransactionsErrorCode.INVALID_VALUE_QUANTITY;
        throw error;
      }
    }

    // Business rule: unit_cost must be positive
    if (data.unit_cost !== undefined && data.unit_cost !== null) {
      if (Number(data.unit_cost) < 0) {
        const error = new Error(
          InventoryTransactionsErrorMessages[
            InventoryTransactionsErrorCode.INVALID_VALUE_UNIT_COST
          ],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryTransactionsErrorCode.INVALID_VALUE_UNIT_COST;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateInventoryTransactions,
  ): Promise<CreateInventoryTransactions> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after inventoryTransactions creation
   */
  protected async afterCreate(
    inventoryTransactions: InventoryTransactions,
    _originalData: CreateInventoryTransactions,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'InventoryTransactions created:',
      JSON.stringify(inventoryTransactions),
      '(ID: ' + inventoryTransactions.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: InventoryTransactions,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
