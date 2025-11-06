// Import and re-export types from schemas for convenience
import {
  type TestCategories,
  type CreateTestCategories,
  type UpdateTestCategories,
  type TestCategoriesIdParam,
  type GetTestCategoriesQuery,
  type ListTestCategoriesQuery,
  type TestCategoriesCreatedEvent,
  type TestCategoriesUpdatedEvent,
  type TestCategoriesDeletedEvent,
} from '../schemas/test-categories.schemas';

export {
  type TestCategories,
  type CreateTestCategories,
  type UpdateTestCategories,
  type TestCategoriesIdParam,
  type GetTestCategoriesQuery,
  type ListTestCategoriesQuery,
  type TestCategoriesCreatedEvent,
  type TestCategoriesUpdatedEvent,
  type TestCategoriesDeletedEvent,
};

// Additional type definitions
export interface TestCategoriesRepository {
  create(data: CreateTestCategories): Promise<TestCategories>;
  findById(id: number | string): Promise<TestCategories | null>;
  findMany(query: ListTestCategoriesQuery): Promise<{
    data: TestCategories[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateTestCategories,
  ): Promise<TestCategories | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface TestCategoriesEventHandlers {
  onCreated?: (data: TestCategories) => void | Promise<void>;
  onUpdated?: (data: TestCategories) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface TestCategoriesWebSocketSubscription {
  subscribe(handlers: TestCategoriesEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface TestCategoriesEntity {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  item_count: number | null;
  discount_rate: number | null;
  metadata: Record<string, any> | null;
  settings: Record<string, any> | null;
  status: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// ===== ERROR HANDLING: ERROR CODES =====
/**
 * Error codes for TestCategories module
 * Auto-generated based on database constraints and business rules
 */
export enum TestCategoriesErrorCode {
  // Standard errors
  NOT_FOUND = 'TEST_CATEGORIES_NOT_FOUND',
  VALIDATION_ERROR = 'TEST_CATEGORIES_VALIDATION_ERROR',

  // Duplicate errors (409 Conflict)
  DUPLICATE_CODE = 'TEST_CATEGORIES_DUPLICATE_CODE',
  DUPLICATE_NAME = 'TEST_CATEGORIES_DUPLICATE_NAME',

  // Business rule validation errors (422)
  INVALID_VALUE_ITEM_COUNT = 'TEST_CATEGORIES_INVALID_VALUE_ITEM_COUNT',
  INVALID_VALUE_DISCOUNT_RATE = 'TEST_CATEGORIES_INVALID_VALUE_DISCOUNT_RATE',
}

/**
 * Error messages mapped to error codes
 */
export const TestCategoriesErrorMessages: Record<
  TestCategoriesErrorCode,
  string
> = {
  [TestCategoriesErrorCode.NOT_FOUND]: 'TestCategories not found',
  [TestCategoriesErrorCode.VALIDATION_ERROR]:
    'TestCategories validation failed',

  // Duplicate error messages
  [TestCategoriesErrorCode.DUPLICATE_CODE]: 'Code already exists',
  [TestCategoriesErrorCode.DUPLICATE_NAME]: 'Name already exists',

  // Business rule messages
  [TestCategoriesErrorCode.INVALID_VALUE_ITEM_COUNT]:
    'item_count must be a positive number',
  [TestCategoriesErrorCode.INVALID_VALUE_DISCOUNT_RATE]:
    'discount_rate must be a positive number',
};
