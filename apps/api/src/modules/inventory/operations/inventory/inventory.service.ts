import { BaseService } from '../../../../shared/services/base.service';
import { InventoryRepository } from './inventory.repository';
import {
  type Inventory,
  type CreateInventory,
  type UpdateInventory,
  type GetInventoryQuery,
  type ListInventoryQuery,
  InventoryErrorCode,
  InventoryErrorMessages,
} from './inventory.types';

/**
 * Inventory Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class InventoryService extends BaseService<
  Inventory,
  CreateInventory,
  UpdateInventory
> {
  constructor(private inventoryRepository: InventoryRepository) {
    super(inventoryRepository);
  }

  /**
   * Get inventory by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetInventoryQuery = {},
  ): Promise<Inventory | null> {
    const inventory = await this.getById(id);

    if (inventory) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return inventory;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListInventoryQuery = {}): Promise<{
    data: Inventory[];
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
   * Create new inventory
   */
  async create(data: CreateInventory): Promise<Inventory> {
    const inventory = await super.create(data);

    return inventory;
  }

  /**
   * Update existing inventory
   */
  async update(
    id: string | number,
    data: UpdateInventory,
  ): Promise<Inventory | null> {
    const inventory = await super.update(id, data);

    return inventory;
  }

  /**
   * Delete inventory
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete inventory with ID:', id);

      // Check if inventory exists first
      const existing = await this.inventoryRepository.findById(id);
      if (!existing) {
        console.log('Inventory not found for deletion:', id);
        return false;
      }

      console.log('Found inventory to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.inventoryRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Inventory deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting inventory:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating inventory
   */
  protected async validateCreate(data: CreateInventory): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: quantity_on_hand must be positive
    if (data.quantity_on_hand !== undefined && data.quantity_on_hand !== null) {
      if (Number(data.quantity_on_hand) < 0) {
        const error = new Error(
          InventoryErrorMessages[
            InventoryErrorCode.INVALID_VALUE_QUANTITY_ON_HAND
          ],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryErrorCode.INVALID_VALUE_QUANTITY_ON_HAND;
        throw error;
      }
    }

    // Business rule: average_cost must be positive
    if (data.average_cost !== undefined && data.average_cost !== null) {
      if (Number(data.average_cost) < 0) {
        const error = new Error(
          InventoryErrorMessages[InventoryErrorCode.INVALID_VALUE_AVERAGE_COST],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryErrorCode.INVALID_VALUE_AVERAGE_COST;
        throw error;
      }
    }

    // Business rule: last_cost must be positive
    if (data.last_cost !== undefined && data.last_cost !== null) {
      if (Number(data.last_cost) < 0) {
        const error = new Error(
          InventoryErrorMessages[InventoryErrorCode.INVALID_VALUE_LAST_COST],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryErrorCode.INVALID_VALUE_LAST_COST;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateInventory,
  ): Promise<CreateInventory> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after inventory creation
   */
  protected async afterCreate(
    inventory: Inventory,
    _originalData: CreateInventory,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Inventory created:',
      JSON.stringify(inventory),
      '(ID: ' + inventory.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Inventory,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.inventoryRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          InventoryErrorMessages[
            InventoryErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = InventoryErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete inventory - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
