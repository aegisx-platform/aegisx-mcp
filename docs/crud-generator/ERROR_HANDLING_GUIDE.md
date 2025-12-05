# CRUD Generator - Error Handling Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Automatic Error Detection](#automatic-error-detection)
- [Error Code Conventions](#error-code-conventions)
- [HTTP Status Code Strategy](#http-status-code-strategy)
- [Generated Error Types](#generated-error-types)
- [Error Response Format](#error-response-format)
- [Adding Custom Error Handling](#adding-custom-error-handling)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CRUD Generator includes **automatic error handling** that detects constraints from your PostgreSQL database schema and generates type-safe error handling code. This eliminates the need to manually write validation logic for common scenarios.

### Key Features

✅ **Zero Configuration** - Detects errors from database schema automatically
✅ **Type-Safe** - Generates TypeScript enums for error codes
✅ **Consistent** - Single source of truth for error messages
✅ **OpenAPI Ready** - Error responses documented in Swagger/OpenAPI

---

## Automatic Error Detection

The generator analyzes your database schema and automatically detects:

### 1. UNIQUE Constraints

**Detection:**

```sql
-- Detected from database constraints
ALTER TABLE authors ADD CONSTRAINT authors_email_unique UNIQUE (email);
```

**Generated Code:**

```typescript
// Error Code Enum
export enum AuthorsErrorCode {
  DUPLICATE_EMAIL = 'AUTHORS_DUPLICATE_EMAIL',
}

// Error Messages
export const AuthorsErrorMessages = {
  [AuthorsErrorCode.DUPLICATE_EMAIL]: 'Email already exists',
};

// Service Validation
const existing = await this.authorsRepository.findByEmail(data.email);
if (existing) {
  const error = new Error(AuthorsErrorMessages[AuthorsErrorCode.DUPLICATE_EMAIL]) as any;
  error.statusCode = 409; // Conflict
  error.code = AuthorsErrorCode.DUPLICATE_EMAIL;
  throw error;
}
```

---

### 2. Foreign Key References

**Detection:**

```sql
-- Detected from FK references to this table
ALTER TABLE books ADD CONSTRAINT books_author_id_fk
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT;
```

**Generated Code:**

```typescript
// Error Code Enum
export enum AuthorsErrorCode {
  CANNOT_DELETE_HAS_REFERENCES = 'AUTHORS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BOOKS = 'AUTHORS_CANNOT_DELETE_HAS_BOOKS',
}

// Service Validation
const deleteCheck = await this.authorsRepository.checkDeleteReferences(id);
if (deleteCheck.hasReferences) {
  const error = new Error(AuthorsErrorMessages[AuthorsErrorCode.CANNOT_DELETE_HAS_BOOKS]) as any;
  error.statusCode = 422; // Unprocessable Entity
  error.code = AuthorsErrorCode.CANNOT_DELETE_HAS_BOOKS;
  error.details = {
    references: deleteCheck.blockedBy,
    message: 'Cannot delete authors - has books references',
  };
  throw error;
}
```

---

### 3. Business Rules (Field Name Patterns)

**Detection:**

The generator detects business rules based on field names:

| Field Pattern                   | Validation Rule    | Example                         |
| ------------------------------- | ------------------ | ------------------------------- |
| `*email*`                       | Email format       | `user_email`, `contact_email`   |
| `*birth*`, `*dob*`              | Date not in future | `birth_date`, `date_of_birth`   |
| `*price*`, `*cost*`, `*amount*` | Positive number    | `product_price`, `total_amount` |
| `*url*`, `*website*`, `*link*`  | URL format         | `website_url`, `homepage`       |
| `*phone*`, `*tel*`, `*mobile*`  | Phone format       | `phone_number`, `mobile`        |

**Example - Email Validation:**

```typescript
// Auto-detected for fields containing 'email'
if (data.email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    const error = new Error(AuthorsErrorMessages[AuthorsErrorCode.INVALID_EMAIL_EMAIL]) as any;
    error.statusCode = 422; // Unprocessable Entity
    error.code = AuthorsErrorCode.INVALID_EMAIL_EMAIL;
    throw error;
  }
}
```

**Example - Date Not Future:**

```typescript
// Auto-detected for fields like 'birth_date'
if (data.birth_date) {
  const fieldDate = new Date(data.birth_date);
  const now = new Date();
  if (fieldDate > now) {
    const error = new Error(AuthorsErrorMessages[AuthorsErrorCode.INVALID_DATE_BIRTH_DATE]) as any;
    error.statusCode = 422;
    error.code = AuthorsErrorCode.INVALID_DATE_BIRTH_DATE;
    throw error;
  }
}
```

---

## Error Code Conventions

### Naming Pattern

```
{TABLE_NAME}_{ERROR_TYPE}_{FIELD_NAME}
```

### Examples

| Error Code                        | Description                |
| --------------------------------- | -------------------------- |
| `AUTHORS_DUPLICATE_EMAIL`         | Email already exists (409) |
| `AUTHORS_INVALID_EMAIL_EMAIL`     | Invalid email format (422) |
| `AUTHORS_INVALID_DATE_BIRTH_DATE` | Birth date in future (422) |
| `AUTHORS_CANNOT_DELETE_HAS_BOOKS` | Has book references (422)  |
| `PRODUCTS_DUPLICATE_SKU`          | SKU already exists (409)   |
| `PRODUCTS_INVALID_VALUE_PRICE`    | Negative price (422)       |

### Standard Error Codes

Every generated module includes:

```typescript
export enum {ModuleName}ErrorCode {
  NOT_FOUND = '{TABLE}_NOT_FOUND',                    // 404
  VALIDATION_ERROR = '{TABLE}_VALIDATION_ERROR',      // 400

  // + Auto-detected error codes...
}
```

---

## HTTP Status Code Strategy

### 409 Conflict - Uniqueness Violations

**Use Case:** Duplicate values for UNIQUE constraints

**Example:**

```http
POST /authors
{
  "email": "existing@example.com"  // Already exists
}

HTTP/1.1 409 Conflict
{
  "success": false,
  "error": {
    "code": "AUTHORS_DUPLICATE_EMAIL",
    "message": "Email already exists",
    "statusCode": 409
  }
}
```

---

### 422 Unprocessable Entity - Business Rule Violations

**Use Case:** Data violates business rules or FK constraints

**Examples:**

**1. Invalid Email Format:**

```http
POST /authors
{
  "email": "not-an-email"  // Invalid format
}

HTTP/1.1 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "AUTHORS_INVALID_EMAIL_EMAIL",
    "message": "email must be a valid email address",
    "statusCode": 422
  }
}
```

**2. Cannot Delete - Has References:**

```http
DELETE /authors/123  // Has books

HTTP/1.1 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "AUTHORS_CANNOT_DELETE_HAS_BOOKS",
    "message": "Cannot delete authors - has books references",
    "statusCode": 422,
    "details": {
      "references": [
        { "table": "books", "count": 5 }
      ]
    }
  }
}
```

---

### Decision Matrix

| Scenario                 | Status Code              | Error Code Pattern                  |
| ------------------------ | ------------------------ | ----------------------------------- |
| Duplicate UNIQUE value   | 409 Conflict             | `{TABLE}_DUPLICATE_{FIELD}`         |
| Invalid format/value     | 422 Unprocessable Entity | `{TABLE}_INVALID_{TYPE}_{FIELD}`    |
| FK blocking delete       | 422 Unprocessable Entity | `{TABLE}_CANNOT_DELETE_HAS_{TABLE}` |
| Resource not found       | 404 Not Found            | `{TABLE}_NOT_FOUND`                 |
| Schema validation failed | 400 Bad Request          | `{TABLE}_VALIDATION_ERROR`          |

---

## Generated Error Types

### Error Code Enum

```typescript
// apps/api/src/modules/authors/types/authors.types.ts

export enum AuthorsErrorCode {
  // Standard errors
  NOT_FOUND = 'AUTHORS_NOT_FOUND',
  VALIDATION_ERROR = 'AUTHORS_VALIDATION_ERROR',

  // Duplicate errors (409 Conflict)
  DUPLICATE_EMAIL = 'AUTHORS_DUPLICATE_EMAIL',

  // Delete validation errors (422 Unprocessable Entity)
  CANNOT_DELETE_HAS_REFERENCES = 'AUTHORS_CANNOT_DELETE_HAS_REFERENCES',
  CANNOT_DELETE_HAS_BOOKS = 'AUTHORS_CANNOT_DELETE_HAS_BOOKS',

  // Business rule validation errors (422)
  INVALID_EMAIL_EMAIL = 'AUTHORS_INVALID_EMAIL_EMAIL',
  INVALID_DATE_BIRTH_DATE = 'AUTHORS_INVALID_DATE_BIRTH_DATE',
}
```

### Error Messages Mapping

```typescript
export const AuthorsErrorMessages: Record<AuthorsErrorCode, string> = {
  [AuthorsErrorCode.NOT_FOUND]: 'Authors not found',
  [AuthorsErrorCode.VALIDATION_ERROR]: 'Authors validation failed',
  [AuthorsErrorCode.DUPLICATE_EMAIL]: 'Email already exists',
  [AuthorsErrorCode.CANNOT_DELETE_HAS_REFERENCES]: 'Cannot delete authors - has related records',
  [AuthorsErrorCode.CANNOT_DELETE_HAS_BOOKS]: 'Cannot delete authors - has books references',
  [AuthorsErrorCode.INVALID_EMAIL_EMAIL]: 'email must be a valid email address',
  [AuthorsErrorCode.INVALID_DATE_BIRTH_DATE]: 'birth_date cannot be in the future',
};
```

---

## Error Response Format

### Success Response

```typescript
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2025-01-22T10:30:00Z",
    "version": "v1",
    "requestId": "req_abc123"
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "AUTHORS_DUPLICATE_EMAIL",
    "message": "Email already exists",
    "statusCode": 409,
    "details": { ... }  // Optional additional context
  },
  "meta": {
    "timestamp": "2025-01-22T10:30:00Z",
    "version": "v1",
    "requestId": "req_abc123"
  }
}
```

---

## Adding Custom Error Handling

### Method 1: Extend Error Codes Enum

```typescript
// apps/api/src/modules/authors/types/authors.types.ts

export enum AuthorsErrorCode {
  // Auto-generated codes...

  // Custom codes
  INVALID_BIO_LENGTH = 'AUTHORS_INVALID_BIO_LENGTH',
  AUTHOR_ALREADY_VERIFIED = 'AUTHORS_ALREADY_VERIFIED',
}

export const AuthorsErrorMessages: Record<AuthorsErrorCode, string> = {
  // Auto-generated messages...

  // Custom messages
  [AuthorsErrorCode.INVALID_BIO_LENGTH]: 'Bio must be between 10 and 500 characters',
  [AuthorsErrorCode.AUTHOR_ALREADY_VERIFIED]: 'Author is already verified',
};
```

### Method 2: Add Custom Validation in Service

```typescript
// apps/api/src/modules/authors/services/authors.service.ts

async validateCreate(data: CreateAuthors): Promise<void> {
  // Auto-generated validations...

  // Custom validation
  if (data.bio && (data.bio.length < 10 || data.bio.length > 500)) {
    const error = new Error(
      AuthorsErrorMessages[AuthorsErrorCode.INVALID_BIO_LENGTH]
    ) as any;
    error.statusCode = 422;
    error.code = AuthorsErrorCode.INVALID_BIO_LENGTH;
    throw error;
  }
}
```

---

## Troubleshooting

### Error Code Not Generated

**Problem:** Expected error code not generated for a field.

**Solution:**

1. **Check field name pattern:**

   ```sql
   -- ❌ Won't detect as email
   contact_info VARCHAR(255)

   -- ✅ Will detect as email
   email VARCHAR(255)
   contact_email VARCHAR(255)
   ```

2. **Check database constraints:**

   ```bash
   # Verify constraints exist
   psql -d your_database -c "\d+ authors"
   ```

3. **Regenerate with force flag:**
   ```bash
   node libs/aegisx-cli/bin/cli.js generate authors --force
   ```

---

### Error Not Thrown at Runtime

**Problem:** Error code exists but validation doesn't trigger.

**Solutions:**

1. **Check if validation is in create vs update:**
   - Some validations only run on create
   - Check both `validateCreate()` and `validateUpdate()`

2. **Verify field is being validated:**

   ```typescript
   // Check service.ts for validation logic
   async validateCreate(data: CreateAuthors): Promise<void> {
     // Should contain validation for your field
   }
   ```

3. **Check if field is optional:**
   ```typescript
   // Optional fields might not validate if undefined
   if (data.email) {
     // Only validates if email is provided
     // validation logic
   }
   ```

---

### Wrong Status Code

**Problem:** Getting 500 instead of 409/422.

**Solutions:**

1. **Verify error has statusCode:**

   ```typescript
   const error = new Error(message) as any;
   error.statusCode = 409; // ← Must set this!
   error.code = AuthorsErrorCode.DUPLICATE_EMAIL;
   ```

2. **Check error handling middleware:**
   - Fastify error handler should respect `error.statusCode`

3. **Check for unexpected errors:**
   - Use try/catch to see actual error
   - Check server logs

---

### OpenAPI/Swagger Not Showing Error

**Problem:** Error responses not documented in Swagger UI.

**Solutions:**

1. **Verify route schema includes error responses:**

   ```typescript
   response: {
     201: AuthorsResponseSchema,
     409: SchemaRefs.Conflict,
     422: SchemaRefs.UnprocessableEntity,  // ← Must include
     500: SchemaRefs.ServerError
   }
   ```

2. **Check schema registry:**

   ```typescript
   // Should be registered in registry.ts
   SchemaRefs.UnprocessableEntity;
   ```

3. **Restart API server:**
   - OpenAPI spec is cached, restart to refresh

---

## Best Practices

### ✅ DO

- Use auto-generated error codes when available
- Follow naming conventions for database fields
- Add UNIQUE constraints in database (not just app-level)
- Set proper ON DELETE rules for foreign keys
- Include details in 422 errors (FK references, etc.)

### ❌ DON'T

- Don't hardcode error messages (use enum + messages mapping)
- Don't use 500 for validation errors (use 400/409/422)
- Don't skip error codes (always use the enum)
- Don't forget to set `error.statusCode`
- Don't mix error code conventions

---

## Related Documentation

- [Validation Reference](./VALIDATION_REFERENCE.md) - Field validation patterns
- [Type Mapping Guide](./TYPE_MAPPING_GUIDE.md) - PostgreSQL type support
- [Best Practices](./BEST_PRACTICES.md) - Database schema design

---

## Need Help?

- Check [Troubleshooting](#troubleshooting) section above
- Review generated code in `apps/api/src/modules/{module}/`
- See `authors` module as reference implementation
- Report issues to the team
