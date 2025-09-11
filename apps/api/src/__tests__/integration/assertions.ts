import supertest from 'supertest';
import { expect } from '@jest/globals';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    timestamp: string;
    version: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

/**
 * Response assertion helpers for API testing
 */
export class ResponseAssertions {
  constructor(private response: supertest.Response) {}

  /**
   * Assert response status code
   */
  hasStatus(expectedStatus: number): this {
    expect(this.response.status).toBe(expectedStatus);
    return this;
  }

  /**
   * Assert response has specific header
   */
  hasHeader(headerName: string, expectedValue?: string): this {
    expect(this.response.headers).toHaveProperty(headerName.toLowerCase());
    if (expectedValue !== undefined) {
      expect(this.response.headers[headerName.toLowerCase()]).toBe(
        expectedValue,
      );
    }
    return this;
  }

  /**
   * Assert response content type
   */
  hasContentType(expectedType: string): this {
    expect(this.response.headers['content-type']).toMatch(
      new RegExp(expectedType),
    );
    return this;
  }

  /**
   * Assert response is JSON
   */
  isJson(): this {
    return this.hasContentType('application/json');
  }

  /**
   * Get parsed response body
   */
  getBody<T = any>(): ApiResponse<T> {
    return this.response.body;
  }

  /**
   * Assert success response structure
   */
  isSuccess<T = any>(): ResponseAssertions & { data: T } {
    const body = this.getBody<T>();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.error).toBeUndefined();
    expect(body.meta).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.version).toBeDefined();

    return this as any;
  }

  /**
   * Assert error response structure
   * Uses custom format {success: false, error: {code: "...", message: "..."}}
   */
  isError(expectedCode?: string, expectedMessage?: string): this {
    const body = this.getBody();

    // Custom format: {success: false, error: {code: "...", message: "..."}}
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBeDefined();
    expect(body.error.message).toBeDefined();
    expect(body.data).toBeUndefined();

    if (expectedCode) {
      expect(body.error.code).toBe(expectedCode);
    }

    if (expectedMessage) {
      expect(body.error.message).toBe(expectedMessage);
    }

    return this;
  }

  /**
   * Assert response data matches expected shape
   */
  hasData<T = any>(expectedData: Partial<T> | ((data: T) => void)): this {
    const body = this.getBody<T>();
    expect(body.data).toBeDefined();

    if (typeof expectedData === 'function') {
      expectedData(body.data);
    } else {
      expect(body.data).toMatchObject(expectedData);
    }

    return this;
  }

  /**
   * Assert response data is array
   */
  hasArrayData(expectedLength?: number): this {
    const body = this.getBody();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);

    if (expectedLength !== undefined) {
      expect(body.data).toHaveLength(expectedLength);
    }

    return this;
  }

  /**
   * Assert response is paginated
   */
  isPaginated(): this {
    const body = this.getBody() as PaginatedResponse;
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.pagination).toBeDefined();
    expect(body.meta.pagination.page).toBeDefined();
    expect(body.meta.pagination.limit).toBeDefined();
    expect(body.meta.pagination.total).toBeDefined();
    expect(body.meta.pagination.totalPages).toBeDefined();
    expect(typeof body.meta.pagination.hasNextPage).toBe('boolean');
    expect(typeof body.meta.pagination.hasPreviousPage).toBe('boolean');

    return this;
  }

  /**
   * Assert pagination values
   */
  hasPagination(expected: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  }): this {
    const body = this.getBody() as PaginatedResponse;
    const pagination = body.meta.pagination;

    if (expected.page !== undefined) {
      expect(pagination.page).toBe(expected.page);
    }
    if (expected.limit !== undefined) {
      expect(pagination.limit).toBe(expected.limit);
    }
    if (expected.total !== undefined) {
      expect(pagination.total).toBe(expected.total);
    }
    if (expected.totalPages !== undefined) {
      expect(pagination.totalPages).toBe(expected.totalPages);
    }
    if (expected.hasNextPage !== undefined) {
      expect(pagination.hasNextPage).toBe(expected.hasNextPage);
    }
    if (expected.hasPreviousPage !== undefined) {
      expect(pagination.hasPreviousPage).toBe(expected.hasPreviousPage);
    }

    return this;
  }

  /**
   * Assert meta information
   */
  hasMeta(
    expectedMeta: Partial<{
      timestamp: string;
      version: string;
      [key: string]: any;
    }>,
  ): this {
    const body = this.getBody();
    expect(body.meta).toBeDefined();

    if (expectedMeta.timestamp) {
      expect(body.meta.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
    }

    if (expectedMeta.version) {
      expect(body.meta.version).toBe(expectedMeta.version);
    }

    // Check other meta properties
    Object.keys(expectedMeta).forEach((key) => {
      if (key !== 'timestamp' && key !== 'version') {
        expect(body.meta[key]).toEqual(expectedMeta[key]);
      }
    });

    return this;
  }

  /**
   * Assert response matches OpenAPI schema structure
   */
  matchesOpenApiSchema(schemaValidation: (data: any) => void): this {
    const body = this.getBody();
    schemaValidation(body);
    return this;
  }

  /**
   * Assert response time is within acceptable range
   */
  hasResponseTime(maxMs: number): this {
    const responseTime = this.response.get('X-Response-Time') || '0ms';
    const timeMs = parseInt(responseTime.replace('ms', ''));
    expect(timeMs).toBeLessThanOrEqual(maxMs);
    return this;
  }

  /**
   * Assert specific validation error
   */
  hasValidationError(field: string, expectedMessage?: string): this {
    const body = this.getBody();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');

    if (body.error.field) {
      expect(body.error.field).toBe(field);
    }

    if (expectedMessage) {
      expect(body.error.message).toContain(expectedMessage);
    }

    return this;
  }

  /**
   * Assert unauthorized error
   */
  isUnauthorized(expectedMessage?: string): this {
    this.hasStatus(401);
    const body = this.getBody();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');

    if (expectedMessage) {
      expect(body.error.message).toBe(expectedMessage);
    }

    return this;
  }

  /**
   * Assert forbidden error
   */
  isForbidden(expectedMessage?: string): this {
    this.hasStatus(403);
    const body = this.getBody();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');

    if (expectedMessage) {
      expect(body.error.message).toBe(expectedMessage);
    }

    return this;
  }

  /**
   * Assert not found error
   */
  isNotFound(expectedMessage?: string): this {
    this.hasStatus(404);
    const body = this.getBody();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');

    if (expectedMessage) {
      expect(body.error.message).toBe(expectedMessage);
    }

    return this;
  }

  /**
   * Assert rate limit error
   */
  isRateLimited(): this {
    this.hasStatus(429);
    const body = this.getBody();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
    return this;
  }

  /**
   * Assert specific HTTP status with custom validation
   */
  customAssert(assertion: (response: supertest.Response) => void): this {
    assertion(this.response);
    return this;
  }
}

/**
 * Create response assertions from supertest response
 */
export function expectResponse(
  response: supertest.Response,
): ResponseAssertions {
  return new ResponseAssertions(response);
}

/**
 * Common assertion patterns
 */
export const commonAssertions = {
  /**
   * Assert successful GET response
   */
  successfulGet: (response: supertest.Response) => {
    return expectResponse(response).hasStatus(200).isJson().isSuccess();
  },

  /**
   * Assert successful POST response (created)
   */
  successfulCreate: (response: supertest.Response) => {
    return expectResponse(response).hasStatus(201).isJson().isSuccess();
  },

  /**
   * Assert successful PUT/PATCH response
   */
  successfulUpdate: (response: supertest.Response) => {
    return expectResponse(response).hasStatus(200).isJson().isSuccess();
  },

  /**
   * Assert successful DELETE response
   */
  successfulDelete: (response: supertest.Response) => {
    return expectResponse(response).hasStatus(200).isJson().isSuccess();
  },

  /**
   * Assert validation error response
   */
  validationError: (response: supertest.Response, field?: string) => {
    const assertion = expectResponse(response)
      .hasStatus(400)
      .isJson()
      .isError('VALIDATION_ERROR');

    if (field) {
      assertion.hasValidationError(field);
    }

    return assertion;
  },

  /**
   * Assert authentication required
   */
  authRequired: (response: supertest.Response) => {
    return expectResponse(response).isUnauthorized();
  },

  /**
   * Assert insufficient permissions
   */
  forbidden: (response: supertest.Response) => {
    return expectResponse(response).isForbidden();
  },

  /**
   * Assert resource not found
   */
  notFound: (response: supertest.Response) => {
    return expectResponse(response).isNotFound();
  },
};

// Type guard functions
export function isSuccessResponse<T>(body: any): body is ApiResponse<T> {
  return body && body.success === true && body.data !== undefined;
}

export function isErrorResponse(body: any): body is ApiResponse {
  return body && body.success === false && body.error !== undefined;
}

export function isPaginatedResponse<T>(
  body: any,
): body is PaginatedResponse<T> {
  return (
    isSuccessResponse(body) &&
    Array.isArray(body.data) &&
    body.meta &&
    body.meta.pagination !== undefined
  );
}
