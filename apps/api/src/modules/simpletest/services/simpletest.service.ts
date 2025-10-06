import { BaseService } from '../../../shared/services/base.service';
import { SimpletestRepository } from '../repositories/simpletest.repository';
import {
  type Simpletest,
  type CreateSimpletest,
  type UpdateSimpletest,
  type GetSimpletestQuery,
  type ListSimpletestQuery,
} from '../types/simpletest.types';

/**
 * Simpletest Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class SimpletestService extends BaseService<
  Simpletest,
  CreateSimpletest,
  UpdateSimpletest
> {
  constructor(private simpletestRepository: SimpletestRepository) {
    super(simpletestRepository);
  }

  /**
   * Get simpletest by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetSimpletestQuery = {},
  ): Promise<Simpletest | null> {
    const simpletest = await this.getById(id);

    if (simpletest) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return simpletest;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListSimpletestQuery = {}): Promise<{
    data: Simpletest[];
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
   * Create new simpletest
   */
  async create(data: CreateSimpletest): Promise<Simpletest> {
    const simpletest = await super.create(data);

    return simpletest;
  }

  /**
   * Update existing simpletest
   */
  async update(
    id: string | number,
    data: UpdateSimpletest,
  ): Promise<Simpletest | null> {
    const simpletest = await super.update(id, data);

    return simpletest;
  }

  /**
   * Delete simpletest
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete simpletest with ID:', id);

      // Check if simpletest exists first
      const existing = await this.simpletestRepository.findById(id);
      if (!existing) {
        console.log('Simpletest not found for deletion:', id);
        return false;
      }

      console.log('Found simpletest to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.simpletestRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Simpletest deleted successfully:', {
          id,
          name: existing.name,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting simpletest:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating simpletest
   */
  protected async validateCreate(data: CreateSimpletest): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateSimpletest,
  ): Promise<CreateSimpletest> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after simpletest creation
   */
  protected async afterCreate(
    simpletest: Simpletest,
    _originalData: CreateSimpletest,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Simpletest created:',
      JSON.stringify(simpletest),
      '(ID: ' + simpletest.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: Simpletest,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === true) {
      throw new Error('Cannot delete active ');
    }
  }
}
