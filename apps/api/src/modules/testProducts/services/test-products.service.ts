import { BaseService } from '../../../shared/services/base.service';
import { TestProductsRepository } from '../repositories/test-products.repository';
import { EventService } from '../../../shared/websocket/event.service';
import { CrudEventHelper } from '../../../shared/websocket/crud-event-helper';
import {
  type TestProducts,
  type CreateTestProducts,
  type UpdateTestProducts,
  type GetTestProductsQuery,
  type ListTestProductsQuery,
  TestProductsErrorCode,
  TestProductsErrorMessages,
} from '../types/test-products.types';

/**
 * TestProducts Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class TestProductsService extends BaseService<
  TestProducts,
  CreateTestProducts,
  UpdateTestProducts
> {
  private eventHelper?: CrudEventHelper;

  constructor(
    private testProductsRepository: TestProductsRepository,
    private eventService?: EventService,
  ) {
    super(testProductsRepository);

    // Initialize event helper using Fastify pattern
    if (eventService) {
      this.eventHelper = eventService.for('testProducts', 'testProducts');
    }
  }

  /**
   * Get testProducts by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetTestProductsQuery = {},
  ): Promise<TestProducts | null> {
    const testProducts = await this.getById(id);

    if (testProducts) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }

      // Emit read event for monitoring/analytics
      if (this.eventHelper) {
        await this.eventHelper.emitCustom('read', testProducts);
      }
    }

    return testProducts;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListTestProductsQuery = {}): Promise<{
    data: TestProducts[];
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
   * Create new testProducts
   */
  async create(data: CreateTestProducts): Promise<TestProducts> {
    const testProducts = await super.create(data);

    // Emit created event for real-time updates
    if (this.eventHelper) {
      await this.eventHelper.emitCreated(testProducts);
    }

    return testProducts;
  }

  /**
   * Update existing testProducts
   */
  async update(
    id: string | number,
    data: UpdateTestProducts,
  ): Promise<TestProducts | null> {
    const testProducts = await super.update(id, data);

    if (testProducts && this.eventHelper) {
      await this.eventHelper.emitUpdated(testProducts);
    }

    return testProducts;
  }

  /**
   * Delete testProducts
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete testProducts with ID:', id);

      // Check if testProducts exists first
      const existing = await this.testProductsRepository.findById(id);
      if (!existing) {
        console.log('TestProducts not found for deletion:', id);
        return false;
      }

      console.log('Found testProducts to delete:', existing.id);

      // Get entity before deletion for event emission
      const testProducts = await this.getById(id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.testProductsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted && testProducts && this.eventHelper) {
        await this.eventHelper.emitDeleted(testProducts.id);
      }

      if (deleted) {
        console.log('TestProducts deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting testProducts:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating testProducts
   */
  protected async validateCreate(data: CreateTestProducts): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // Check for duplicate code
    if (data.code) {
      const existing = await this.testProductsRepository.findByCode(data.code);
      if (existing) {
        const error = new Error(
          TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_CODE],
        ) as any;
        error.statusCode = 409;
        error.code = TestProductsErrorCode.DUPLICATE_CODE;
        throw error;
      }
    }

    // Check for duplicate name
    if (data.name) {
      const existing = await this.testProductsRepository.findByName(data.name);
      if (existing) {
        const error = new Error(
          TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_NAME],
        ) as any;
        error.statusCode = 409;
        error.code = TestProductsErrorCode.DUPLICATE_NAME;
        throw error;
      }
    }

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: item_count must be positive
    if (data.item_count !== undefined && data.item_count !== null) {
      if (Number(data.item_count) < 0) {
        const error = new Error(
          TestProductsErrorMessages[
            TestProductsErrorCode.INVALID_VALUE_ITEM_COUNT
          ],
        ) as any;
        error.statusCode = 422;
        error.code = TestProductsErrorCode.INVALID_VALUE_ITEM_COUNT;
        throw error;
      }
    }

    // Business rule: discount_rate must be positive
    if (data.discount_rate !== undefined && data.discount_rate !== null) {
      if (Number(data.discount_rate) < 0) {
        const error = new Error(
          TestProductsErrorMessages[
            TestProductsErrorCode.INVALID_VALUE_DISCOUNT_RATE
          ],
        ) as any;
        error.statusCode = 422;
        error.code = TestProductsErrorCode.INVALID_VALUE_DISCOUNT_RATE;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateTestProducts,
  ): Promise<CreateTestProducts> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after testProducts creation
   */
  protected async afterCreate(
    testProducts: TestProducts,
    _originalData: CreateTestProducts,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'TestProducts created:',
      JSON.stringify(testProducts),
      '(ID: ' + testProducts.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: TestProducts,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    // No status constraints found - manual validation required
    if (existing.status) {
      throw new Error('Cannot delete  - please verify status manually');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====
  }
}
