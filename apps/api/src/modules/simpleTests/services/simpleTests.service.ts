import { BaseService } from '../../../shared/services/base.service';
import { SimpleTestsRepository } from '../repositories/simpleTests.repository';
import {
  type SimpleTests,
  type CreateSimpleTests,
  type UpdateSimpleTests,
  type GetSimpleTestsQuery,
  type ListSimpleTestsQuery,
} from '../types/simpleTests.types';

/**
 * SimpleTests Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class SimpleTestsService extends BaseService<
  SimpleTests,
  CreateSimpleTests,
  UpdateSimpleTests
> {
  constructor(private simpleTestsRepository: SimpleTestsRepository) {
    super(simpleTestsRepository);
  }

  /**
   * Get simpleTests by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetSimpleTestsQuery = {},
  ): Promise<SimpleTests | null> {
    const simpleTests = await this.getById(id);

    if (simpleTests) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return simpleTests;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListSimpleTestsQuery = {}): Promise<{
    data: SimpleTests[];
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
   * Create new simpleTests
   */
  async create(data: CreateSimpleTests): Promise<SimpleTests> {
    const simpleTests = await super.create(data);

    return simpleTests;
  }

  /**
   * Update existing simpleTests
   */
  async update(
    id: string | number,
    data: UpdateSimpleTests,
  ): Promise<SimpleTests | null> {
    const simpleTests = await super.update(id, data);

    return simpleTests;
  }

  /**
   * Delete simpleTests
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete simpleTests with ID:', id);

      // Check if simpleTests exists first
      const existing = await this.simpleTestsRepository.findById(id);
      if (!existing) {
        console.log('SimpleTests not found for deletion:', id);
        return false;
      }

      console.log('Found simpleTests to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.simpleTestsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('SimpleTests deleted successfully:', {
          id,
          name: existing.name,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting simpleTests:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating simpleTests
   */
  protected async validateCreate(data: CreateSimpleTests): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateSimpleTests,
  ): Promise<CreateSimpleTests> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after simpleTests creation
   */
  protected async afterCreate(
    simpleTests: SimpleTests,
    _originalData: CreateSimpleTests,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'SimpleTests created:',
      JSON.stringify(simpleTests),
      '(ID: ' + simpleTests.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: SimpleTests,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
  }
}
