// Import and re-export types from schemas for convenience
import {
  type TestProducts,
  type CreateTestProducts,
  type UpdateTestProducts,
  type TestProductsIdParam,
  type GetTestProductsQuery,
  type ListTestProductsQuery,
  type TestProductsCreatedEvent,
  type TestProductsUpdatedEvent,
  type TestProductsDeletedEvent,
} from '../schemas/test-products.schemas';

export {
  type TestProducts,
  type CreateTestProducts,
  type UpdateTestProducts,
  type TestProductsIdParam,
  type GetTestProductsQuery,
  type ListTestProductsQuery,
  type TestProductsCreatedEvent,
  type TestProductsUpdatedEvent,
  type TestProductsDeletedEvent,
};

// Additional type definitions
export interface TestProductsRepository {
  create(data: CreateTestProducts): Promise<TestProducts>;
  findById(id: number | string): Promise<TestProducts | null>;
  findMany(query: ListTestProductsQuery): Promise<{
    data: TestProducts[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(
    id: number | string,
    data: UpdateTestProducts,
  ): Promise<TestProducts | null>;
  delete(id: number | string): Promise<boolean>;
}

// Real-time event type definitions
export interface TestProductsEventHandlers {
  onCreated?: (data: TestProducts) => void | Promise<void>;
  onUpdated?: (data: TestProducts) => void | Promise<void>;
  onDeleted?: (data: { id: number | string }) => void | Promise<void>;
}

export interface TestProductsWebSocketSubscription {
  subscribe(handlers: TestProductsEventHandlers): void;
  unsubscribe(): void;
}

// Database entity type (matches database table structure exactly)
export interface TestProductsEntity {
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
 * Error codes for TestProducts module
 * Auto-generated based on database constraints and business rules
 */
export enum TestProductsErrorCode {
  // Standard errors
  NOT_FOUND = 'TEST_PRODUCTS_NOT_FOUND',
  VALIDATION_ERROR = 'TEST_PRODUCTS_VALIDATION_ERROR',

  // Duplicate errors (409 Conflict)
  DUPLICATE_CODE = 'TEST_PRODUCTS_DUPLICATE_CODE',
  DUPLICATE_NAME = 'TEST_PRODUCTS_DUPLICATE_NAME',

  // Business rule validation errors (422)
  INVALID_VALUE_ITEM_COUNT = 'TEST_PRODUCTS_INVALID_VALUE_ITEM_COUNT',
  INVALID_VALUE_DISCOUNT_RATE = 'TEST_PRODUCTS_INVALID_VALUE_DISCOUNT_RATE',
}

/**
 * Error messages mapped to error codes
 */
export const TestProductsErrorMessages: Record<TestProductsErrorCode, string> =
  {
    [TestProductsErrorCode.NOT_FOUND]: 'TestProducts not found',
    [TestProductsErrorCode.VALIDATION_ERROR]: 'TestProducts validation failed',

    // Duplicate error messages
    [TestProductsErrorCode.DUPLICATE_CODE]: 'Code already exists',
    [TestProductsErrorCode.DUPLICATE_NAME]: 'Name already exists',

    // Business rule messages
    [TestProductsErrorCode.INVALID_VALUE_ITEM_COUNT]:
      'item_count must be a positive number',
    [TestProductsErrorCode.INVALID_VALUE_DISCOUNT_RATE]:
      'discount_rate must be a positive number',
  };
