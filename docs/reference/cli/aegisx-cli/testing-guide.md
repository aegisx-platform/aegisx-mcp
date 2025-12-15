# CRUD Generator - Testing Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Test Setup](#test-setup)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Validation Testing](#validation-testing)
- [Error Handling Testing](#error-handling-testing)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)

---

## Overview

This guide covers testing strategies for CRUD-generated APIs, focusing on:

- ✅ **Schema Validation** - Testing request/response schemas
- ✅ **Error Handling** - Testing all error scenarios (409, 422, 404)
- ✅ **Business Rules** - Testing auto-detected validations
- ✅ **Database Constraints** - Testing UNIQUE and FK constraints
- ✅ **Integration** - Testing full request/response cycle

---

## Test Setup

### Dependencies

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "fastify": "^4.0.0",
    "@sinclair/typebox": "^0.32.0"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.schemas.ts', '!src/**/*.types.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test App Setup

```typescript
// src/__tests__/helpers/test-app.ts

import Fastify, { FastifyInstance } from 'fastify';
import { knex } from '../../config/database';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register plugins
  await app.register(require('@fastify/cors'));
  await app.register(require('@fastify/sensible'));

  // Register schema registry
  await app.register(require('../../schemas/registry'));

  // Register routes
  await app.register(require('../../modules/authors/routes/authors.routes'), {
    prefix: '/api/authors',
  });

  return app;
}

export async function cleanupDatabase() {
  // Clean test data
  await knex('authors').del();
}

export async function seedTestData() {
  // Insert test data
  await knex('authors').insert([
    {
      name: 'Test Author 1',
      email: 'test1@example.com',
      birth_date: '1980-01-01',
    },
    {
      name: 'Test Author 2',
      email: 'test2@example.com',
      birth_date: '1990-01-01',
    },
  ]);
}
```

---

## Unit Testing

### Repository Tests

```typescript
// src/modules/authors/__tests__/authors.repository.test.ts

import { knex } from '../../../config/database';
import { AuthorsRepository } from '../repositories/authors.repository';
import type { CreateAuthors } from '../types/authors.types';

describe('AuthorsRepository', () => {
  let repository: AuthorsRepository;

  beforeAll(async () => {
    repository = new AuthorsRepository(knex);
  });

  beforeEach(async () => {
    await knex('authors').del();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const data: CreateAuthors = {
        name: 'Test Author',
        email: 'test@example.com',
        birth_date: '1980-01-01',
      };

      const result = await repository.create(data);

      expect(result).toMatchObject({
        name: data.name,
        email: data.email,
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('should find author by email', async () => {
      const email = 'unique@example.com';
      await repository.create({
        name: 'Test',
        email,
      });

      const result = await repository.findByEmail(email);

      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
    });

    it('should return null for non-existent email', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('checkDeleteReferences', () => {
    it('should detect foreign key references', async () => {
      // Create author
      const author = await repository.create({
        name: 'Test Author',
        email: 'test@example.com',
      });

      // Create book referencing author
      await knex('books').insert({
        title: 'Test Book',
        author_id: author.id,
      });

      const result = await repository.checkDeleteReferences(author.id);

      expect(result.hasReferences).toBe(true);
      expect(result.blockedBy).toContainEqual({
        table: 'books',
        count: 1,
      });
    });

    it('should allow delete when no references', async () => {
      const author = await repository.create({
        name: 'Test Author',
        email: 'test@example.com',
      });

      const result = await repository.checkDeleteReferences(author.id);

      expect(result.hasReferences).toBe(false);
      expect(result.blockedBy).toEqual([]);
    });
  });
});
```

---

## Integration Testing

### API Route Tests

```typescript
// src/modules/authors/__tests__/authors.routes.test.ts

import { FastifyInstance } from 'fastify';
import { createTestApp, cleanupDatabase } from '../../__tests__/helpers/test-app';

describe('Authors API Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/authors', () => {
    it('should create a new author', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
          birth_date: '1980-01-01',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
    });

    it('should return 400 for invalid schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          // Missing required 'name' field
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().success).toBe(false);
    });
  });

  describe('GET /api/authors/:id', () => {
    it('should get author by id', async () => {
      // Create test author
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      const authorId = createResponse.json().data.id;

      // Get author
      const response = await app.inject({
        method: 'GET',
        url: `/api/authors/${authorId}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.id).toBe(authorId);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/authors/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/authors', () => {
    it('should list authors with pagination', async () => {
      // Create test data
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: { name: 'Author 1', email: 'test1@example.com' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: { name: 'Author 2', email: 'test2@example.com' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/authors?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
      });
    });

    it('should filter by search query', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: { name: 'John Doe', email: 'john@example.com' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: { name: 'Jane Smith', email: 'jane@example.com' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/authors?search=John',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toHaveLength(1);
      expect(response.json().data[0].name).toBe('John Doe');
    });
  });
});
```

---

## Validation Testing

### Email Validation Tests

```typescript
// src/modules/authors/__tests__/validation/email.test.ts

import { FastifyInstance } from 'fastify';
import { createTestApp, cleanupDatabase } from '../../../__tests__/helpers/test-app';
import { AuthorsErrorCode } from '../../types/authors.types';

describe('Email Validation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Email Format Validation', () => {
    const invalidEmails = ['not-an-email', '@example.com', 'user@', 'user@domain', 'user domain@example.com', ''];

    invalidEmails.forEach((email) => {
      it(`should reject invalid email: "${email}"`, async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/authors',
          payload: {
            name: 'Test Author',
            email,
          },
        });

        expect(response.statusCode).toBe(422);
        expect(response.json().error.code).toBe(AuthorsErrorCode.INVALID_EMAIL_EMAIL);
      });
    });

    const validEmails = ['user@example.com', 'john.doe@company.co.uk', 'admin+test@domain.org', 'test_user@example.com'];

    validEmails.forEach((email) => {
      it(`should accept valid email: "${email}"`, async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/authors',
          payload: {
            name: 'Test Author',
            email,
          },
        });

        expect(response.statusCode).toBe(201);
      });
    });
  });

  describe('Email Uniqueness', () => {
    it('should reject duplicate email', async () => {
      const email = 'duplicate@example.com';

      // Create first author
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Author 1',
          email,
        },
      });

      // Try to create duplicate
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Author 2',
          email,
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().error.code).toBe(AuthorsErrorCode.DUPLICATE_EMAIL);
    });
  });
});
```

### Date Validation Tests

```typescript
// src/modules/authors/__tests__/validation/date.test.ts

import { FastifyInstance } from 'fastify';
import { createTestApp, cleanupDatabase } from '../../../__tests__/helpers/test-app';
import { AuthorsErrorCode } from '../../types/authors.types';

describe('Date Validation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Birth Date Not in Future', () => {
    it('should reject future birth date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
          birth_date: futureDate.toISOString().split('T')[0],
        },
      });

      expect(response.statusCode).toBe(422);
      expect(response.json().error.code).toBe(AuthorsErrorCode.INVALID_DATE_BIRTH_DATE);
    });

    it('should accept past birth date', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
          birth_date: '1980-01-01',
        },
      });

      expect(response.statusCode).toBe(201);
    });

    it('should accept today as birth date', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
          birth_date: today,
        },
      });

      expect(response.statusCode).toBe(201);
    });
  });
});
```

---

## Error Handling Testing

### 409 Conflict Tests

```typescript
// src/modules/authors/__tests__/errors/conflict.test.ts

import { FastifyInstance } from 'fastify';
import { createTestApp, cleanupDatabase } from '../../../__tests__/helpers/test-app';
import { AuthorsErrorCode } from '../../types/authors.types';

describe('409 Conflict Errors', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 409 for duplicate email on create', async () => {
    const email = 'duplicate@example.com';

    // Create first
    await app.inject({
      method: 'POST',
      url: '/api/authors',
      payload: {
        name: 'Author 1',
        email,
      },
    });

    // Try duplicate
    const response = await app.inject({
      method: 'POST',
      url: '/api/authors',
      payload: {
        name: 'Author 2',
        email,
      },
    });

    expect(response.statusCode).toBe(409);
    const error = response.json().error;
    expect(error.code).toBe(AuthorsErrorCode.DUPLICATE_EMAIL);
    expect(error.message).toBe('Email already exists');
    expect(error.statusCode).toBe(409);
  });

  it('should return 409 for duplicate email on update', async () => {
    // Create two authors
    const author1 = await app.inject({
      method: 'POST',
      url: '/api/authors',
      payload: {
        name: 'Author 1',
        email: 'email1@example.com',
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/authors',
      payload: {
        name: 'Author 2',
        email: 'email2@example.com',
      },
    });

    // Try to update author1 to have author2's email
    const response = await app.inject({
      method: 'PUT',
      url: `/api/authors/${author1.json().data.id}`,
      payload: {
        email: 'email2@example.com',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe(AuthorsErrorCode.DUPLICATE_EMAIL);
  });
});
```

### 422 Unprocessable Entity Tests

```typescript
// src/modules/authors/__tests__/errors/unprocessable.test.ts

import { FastifyInstance } from 'fastify';
import { createTestApp, cleanupDatabase } from '../../../__tests__/helpers/test-app';
import { AuthorsErrorCode } from '../../types/authors.types';

describe('422 Unprocessable Entity Errors', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Business Rule Violations', () => {
    it('should return 422 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'not-an-email',
        },
      });

      expect(response.statusCode).toBe(422);
      const error = response.json().error;
      expect(error.code).toBe(AuthorsErrorCode.INVALID_EMAIL_EMAIL);
      expect(error.statusCode).toBe(422);
    });

    it('should return 422 for future birth date', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
          birth_date: '2030-01-01',
        },
      });

      expect(response.statusCode).toBe(422);
      expect(response.json().error.code).toBe(AuthorsErrorCode.INVALID_DATE_BIRTH_DATE);
    });
  });

  describe('Foreign Key Blocking', () => {
    it('should return 422 when deleting author with books', async () => {
      // Create author
      const authorResponse = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'test@example.com',
        },
      });
      const authorId = authorResponse.json().data.id;

      // Create book referencing author
      await app.inject({
        method: 'POST',
        url: '/api/books',
        payload: {
          title: 'Test Book',
          author_id: authorId,
        },
      });

      // Try to delete author
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/authors/${authorId}`,
      });

      expect(response.statusCode).toBe(422);
      const error = response.json().error;
      expect(error.code).toBe(AuthorsErrorCode.CANNOT_DELETE_HAS_BOOKS);
      expect(error.statusCode).toBe(422);
      expect(error.details).toBeDefined();
      expect(error.details.references).toContainEqual({
        table: 'books',
        count: 1,
      });
    });
  });
});
```

---

## Test Utilities

### Test Data Factory

```typescript
// src/__tests__/helpers/factories/authors.factory.ts

import type { CreateAuthors } from '../../../modules/authors/types/authors.types';

let emailCounter = 0;

export function createAuthorData(overrides: Partial<CreateAuthors> = {}): CreateAuthors {
  emailCounter++;
  return {
    name: 'Test Author',
    email: `test${emailCounter}@example.com`,
    birth_date: '1980-01-01',
    ...overrides,
  };
}

export function createMultipleAuthors(count: number): CreateAuthors[] {
  return Array.from({ length: count }, (_, i) =>
    createAuthorData({
      name: `Test Author ${i + 1}`,
      email: `test${emailCounter + i + 1}@example.com`,
    }),
  );
}
```

### Assertion Helpers

```typescript
// src/__tests__/helpers/assertions.ts

import { FastifyReply } from 'fastify';

export function expectSuccessResponse(response: any) {
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    success: true,
    data: expect.any(Object),
  });
}

export function expectErrorResponse(response: any, statusCode: number, errorCode: string) {
  expect(response.statusCode).toBe(statusCode);
  const body = response.json();
  expect(body.success).toBe(false);
  expect(body.error).toMatchObject({
    code: errorCode,
    message: expect.any(String),
    statusCode,
  });
}

export function expectPaginatedResponse(response: any) {
  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(body.success).toBe(true);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.pagination).toMatchObject({
    page: expect.any(Number),
    limit: expect.any(Number),
    total: expect.any(Number),
    totalPages: expect.any(Number),
  });
}
```

---

## Best Practices

### ✅ DO

1. **Test All Validation Rules**
   - Test both valid and invalid inputs
   - Test edge cases (empty strings, null, undefined)
   - Test boundary conditions

2. **Test Error Responses**
   - Verify status codes (409, 422, 404)
   - Verify error codes match enum
   - Verify error messages are descriptive

3. **Use Test Factories**
   - Create reusable test data generators
   - Avoid hard-coded test data
   - Use unique values (emails, etc.)

4. **Clean Test Data**
   - Clear database before each test
   - Use transactions for faster tests
   - Avoid test data pollution

5. **Test Database Constraints**
   - Test UNIQUE constraints
   - Test FK constraints
   - Test CASCADE deletes

### ❌ DON'T

1. **Don't Test Implementation Details**
   - Test behavior, not internal code
   - Focus on API contracts
   - Avoid brittle tests

2. **Don't Share State Between Tests**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Avoid test order dependencies

3. **Don't Skip Error Cases**
   - Error paths are critical
   - Test all error codes
   - Verify error message quality

4. **Don't Hardcode IDs**
   - Use created IDs from setup
   - Generate UUIDs dynamically
   - Avoid magic values

5. **Don't Forget Edge Cases**
   - Empty arrays
   - Null/undefined values
   - Maximum/minimum values
   - Special characters

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- authors.routes.test.ts
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

---

## Coverage Goals

| Metric     | Target | Priority |
| ---------- | ------ | -------- |
| Statements | 80%+   | High     |
| Branches   | 80%+   | High     |
| Functions  | 80%+   | High     |
| Lines      | 80%+   | High     |

**Critical Paths (100% coverage required):**

- Error handling logic
- Validation functions
- Database constraint checks
- Authentication/authorization

---

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) - Error code conventions
- [Validation Reference](./VALIDATION_REFERENCE.md) - Validation patterns
- [README](./README.md) - CRUD generator overview

---

**Last Updated:** 2025-01-22
**Generator Version:** 1.0.0
