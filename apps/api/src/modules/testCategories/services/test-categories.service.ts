import { BaseService } from '../../../shared/services/base.service';
import { TestCategoriesRepository } from '../repositories/test-categories.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import {
  type TestCategories,
  type CreateTestCategories,
  type UpdateTestCategories,
  type GetTestCategoriesQuery,
  type ListTestCategoriesQuery,
  TestCategoriesErrorCode,
  TestCategoriesErrorMessages,
} from '../types/test-categories.types';

/**
 * TestCategories Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class TestCategoriesService extends BaseService<
  TestCategories,
  CreateTestCategories,
  UpdateTestCategories
> {
  private eventHelper?: CrudEventHelper;

  constructor(
    private testCategoriesRepository: TestCategoriesRepository,
    private eventService?: EventService,
  ) {
    super(testCategoriesRepository);

    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('testCategories', 'testCategories');
    }
  }

  /**
   * Get testCategories by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetTestCategoriesQuery = {},
  ): Promise<TestCategories | null> {
    const testCategories = await this.getById(id);

    if (testCategories) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }

      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', testCategories);
      }
    }

    return testCategories;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListTestCategoriesQuery = {}): Promise<{
    data: TestCategories[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);

    // Emit bulk read event
    if (this.eventHelper) {
      await this.eventHelper.emitCustom('bulk_read', {
        count: result.data.length,
        filters: options,
      });
    }

    return result;
  }

  /**
   * Create new testCategories
   */
  async create(data: CreateTestCategories): Promise<TestCategories> {
    const testCategories = await super.create(data);

    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(testCategories);
    }

    return testCategories;
  }

  /**
   * Update existing testCategories
   */
  async update(
    id: string | number,
    data: UpdateTestCategories,
  ): Promise<TestCategories | null> {
    const testCategories = await super.update(id, data);

    if (testCategories && this.eventHelper) {
      await this.eventHelper.emitUpdated(testCategories);
    }

    return testCategories;
  }

  /**
   * Delete testCategories
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete testCategories with ID:', id);

      // Check if testCategories exists first
      const existing = await this.testCategoriesRepository.findById(id);
      if (!existing) {
        console.log('TestCategories not found for deletion:', id);
        return false;
      }

      console.log('Found testCategories to delete:', existing.id);

      // Get entity before deletion for event emission
      const testCategories = await this.getById(id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.testCategoriesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted && testCategories && this.eventHelper) {
        await this.eventHelper.emitDeleted(testCategories.id);
      }

      if (deleted) {
        console.log('TestCategories deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting testCategories:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating testCategories
   */
  protected async validateCreate(data: CreateTestCategories): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // Check for duplicate code
    if (data.code) {
      const existing = await this.testCategoriesRepository.findByCode(
        data.code,
      );
      if (existing) {
        const error = new Error(
          TestCategoriesErrorMessages[TestCategoriesErrorCode.DUPLICATE_CODE],
        ) as any;
        error.statusCode = 409;
        error.code = TestCategoriesErrorCode.DUPLICATE_CODE;
        throw error;
      }
    }

    // Check for duplicate name
    if (data.name) {
      const existing = await this.testCategoriesRepository.findByName(
        data.name,
      );
      if (existing) {
        const error = new Error(
          TestCategoriesErrorMessages[TestCategoriesErrorCode.DUPLICATE_NAME],
        ) as any;
        error.statusCode = 409;
        error.code = TestCategoriesErrorCode.DUPLICATE_NAME;
        throw error;
      }
    }

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: item_count must be positive
    if (data.item_count !== undefined && data.item_count !== null) {
      if (Number(data.item_count) < 0) {
        const error = new Error(
          TestCategoriesErrorMessages[
            TestCategoriesErrorCode.INVALID_VALUE_ITEM_COUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = TestCategoriesErrorCode.INVALID_VALUE_ITEM_COUNT;
        throw error;
      }
    }

    // Business rule: discount_rate must be positive
    if (data.discount_rate !== undefined && data.discount_rate !== null) {
      if (Number(data.discount_rate) < 0) {
        const error = new Error(
          TestCategoriesErrorMessages[
            TestCategoriesErrorCode.INVALID_VALUE_DISCOUNT_RATE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = TestCategoriesErrorCode.INVALID_VALUE_DISCOUNT_RATE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateTestCategories,
  ): Promise<CreateTestCategories> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after testCategories creation
   */
  protected async afterCreate(
    testCategories: TestCategories,
    _originalData: CreateTestCategories,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'TestCategories created:',
      JSON.stringify(testCategories),
      '(ID: ' + testCategories.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: TestCategories,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'active&#x27;') {
      throw new Error('Cannot delete active&#x27; ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
