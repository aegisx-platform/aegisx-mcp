import { BaseService } from '../../../../shared/services/base.service';
import { DrugFocusListsRepository } from './drug-focus-lists.repository';
import {
  type DrugFocusLists,
  type CreateDrugFocusLists,
  type UpdateDrugFocusLists,
  type GetDrugFocusListsQuery,
  type ListDrugFocusListsQuery,
} from './drug-focus-lists.types';

/**
 * DrugFocusLists Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DrugFocusListsService extends BaseService<
  DrugFocusLists,
  CreateDrugFocusLists,
  UpdateDrugFocusLists
> {
  constructor(private drugFocusListsRepository: DrugFocusListsRepository) {
    super(drugFocusListsRepository);
  }

  /**
   * Get drugFocusLists by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDrugFocusListsQuery = {},
  ): Promise<DrugFocusLists | null> {
    const drugFocusLists = await this.getById(id);

    if (drugFocusLists) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return drugFocusLists;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDrugFocusListsQuery = {}): Promise<{
    data: DrugFocusLists[];
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
   * Create new drugFocusLists
   */
  async create(data: CreateDrugFocusLists): Promise<DrugFocusLists> {
    const drugFocusLists = await super.create(data);

    return drugFocusLists;
  }

  /**
   * Update existing drugFocusLists
   */
  async update(
    id: string | number,
    data: UpdateDrugFocusLists,
  ): Promise<DrugFocusLists | null> {
    const drugFocusLists = await super.update(id, data);

    return drugFocusLists;
  }

  /**
   * Delete drugFocusLists
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete drugFocusLists with ID:', id);

      // Check if drugFocusLists exists first
      const existing = await this.drugFocusListsRepository.findById(id);
      if (!existing) {
        console.log('DrugFocusLists not found for deletion:', id);
        return false;
      }

      console.log('Found drugFocusLists to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.drugFocusListsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('DrugFocusLists deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting drugFocusLists:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating drugFocusLists
   */
  protected async validateCreate(data: CreateDrugFocusLists): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDrugFocusLists,
  ): Promise<CreateDrugFocusLists> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after drugFocusLists creation
   */
  protected async afterCreate(
    drugFocusLists: DrugFocusLists,
    _originalData: CreateDrugFocusLists,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'DrugFocusLists created:',
      JSON.stringify(drugFocusLists),
      '(ID: ' + drugFocusLists.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: DrugFocusLists,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
