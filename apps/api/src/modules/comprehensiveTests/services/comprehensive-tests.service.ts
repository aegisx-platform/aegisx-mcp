import { BaseService } from '../../../shared/services/base.service';
import { ComprehensiveTestsRepository } from '../repositories/comprehensive-tests.repository';
import {
  type ComprehensiveTests,
  type CreateComprehensiveTests,
  type UpdateComprehensiveTests,
  type GetComprehensiveTestsQuery,
  type ListComprehensiveTestsQuery,
} from '../types/comprehensive-tests.types';

/**
 * ComprehensiveTests Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ComprehensiveTestsService extends BaseService<
  ComprehensiveTests,
  CreateComprehensiveTests,
  UpdateComprehensiveTests
> {
  constructor(
    private comprehensiveTestsRepository: ComprehensiveTestsRepository,
  ) {
    super(comprehensiveTestsRepository);
  }

  /**
   * Get comprehensiveTests by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetComprehensiveTestsQuery = {},
  ): Promise<ComprehensiveTests | null> {
    const comprehensiveTests = await this.getById(id);

    if (comprehensiveTests) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return comprehensiveTests;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListComprehensiveTestsQuery = {}): Promise<{
    data: ComprehensiveTests[];
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
   * Create new comprehensiveTests
   */
  async create(data: CreateComprehensiveTests): Promise<ComprehensiveTests> {
    const comprehensiveTests = await super.create(data);

    return comprehensiveTests;
  }

  /**
   * Update existing comprehensiveTests
   */
  async update(
    id: string | number,
    data: UpdateComprehensiveTests,
  ): Promise<ComprehensiveTests | null> {
    const comprehensiveTests = await super.update(id, data);

    return comprehensiveTests;
  }

  /**
   * Delete comprehensiveTests
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete comprehensiveTests with ID:', id);

      // Check if comprehensiveTests exists first
      const existing = await this.comprehensiveTestsRepository.findById(id);
      if (!existing) {
        console.log('ComprehensiveTests not found for deletion:', id);
        return false;
      }

      console.log('Found comprehensiveTests to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.comprehensiveTestsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('ComprehensiveTests deleted successfully:', {
          id,
          name: existing.title,
        });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting comprehensiveTests:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating comprehensiveTests
   */
  protected async validateCreate(
    data: CreateComprehensiveTests,
  ): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateComprehensiveTests,
  ): Promise<CreateComprehensiveTests> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after comprehensiveTests creation
   */
  protected async afterCreate(
    comprehensiveTests: ComprehensiveTests,
    _originalData: CreateComprehensiveTests,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'ComprehensiveTests created:',
      JSON.stringify(comprehensiveTests),
      '(ID: ' + comprehensiveTests.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    _id: string | number,
    existing: ComprehensiveTests,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'published') {
      throw new Error('Cannot delete published ');
    }
  }
}
