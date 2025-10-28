# CRUD Generator - Validation Reference

## 📋 Table of Contents

- [Overview](#overview)
- [Auto-Detected Validations](#auto-detected-validations)
- [Field Name Patterns](#field-name-patterns)
- [Validation Rules](#validation-rules)
- [PostgreSQL Type Validations](#postgresql-type-validations)
- [Custom Validations](#custom-validations)
- [Testing Validations](#testing-validations)
- [Examples](#examples)

---

## Overview

The CRUD Generator provides **automatic validation** based on:

1. **Field Names** - Pattern matching on column names
2. **Data Types** - PostgreSQL type constraints
3. **Database Constraints** - UNIQUE, FK, CHECK constraints
4. **Business Logic** - Common patterns (email, dates, etc.)

All validations generate:

- ✅ TypeScript error code enums
- ✅ Error message mappings
- ✅ Service layer validation logic
- ✅ OpenAPI/Swagger documentation

---

## Auto-Detected Validations

### 1. Email Format Validation

**Triggers:** Field names containing `email`, `e_mail`, or `mail`

**Examples:**

```sql
email VARCHAR(255)           → Email validation
user_email VARCHAR(255)      → Email validation
contact_email VARCHAR(255)   → Email validation
e_mail VARCHAR(255)          → Email validation
mail VARCHAR(255)            → Email validation
```

**Generated Code:**

```typescript
// Error Code
INVALID_EMAIL_EMAIL = 'AUTHORS_INVALID_EMAIL_EMAIL';

// Validation Logic
if (data.email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw validationError(422, 'INVALID_EMAIL_EMAIL');
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "AUTHORS_INVALID_EMAIL_EMAIL",
    "message": "email must be a valid email address",
    "statusCode": 422
  }
}
```

---

### 2. Date Not in Future Validation

**Triggers:** Field names containing `birth`, `dob`, or `born` + Date type

**Examples:**

```sql
birth_date DATE              → Date validation
date_of_birth DATE           → Date validation
dob DATE                     → Date validation
born_date TIMESTAMP          → Date validation
user_birth_date DATE         → Date validation
```

**Generated Code:**

```typescript
// Error Code
INVALID_DATE_BIRTH_DATE = 'AUTHORS_INVALID_DATE_BIRTH_DATE';

// Validation Logic
if (data.birth_date) {
  const fieldDate = new Date(data.birth_date);
  const now = new Date();
  if (fieldDate > now) {
    throw validationError(422, 'INVALID_DATE_BIRTH_DATE');
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "AUTHORS_INVALID_DATE_BIRTH_DATE",
    "message": "birth_date cannot be in the future",
    "statusCode": 422
  }
}
```

---

### 3. Positive Number Validation

**Triggers:** Numeric fields containing `price`, `cost`, `amount`, `quantity`, or `count`

**Examples:**

```sql
price DECIMAL(10,2)          → Positive number validation
product_price NUMERIC        → Positive number validation
unit_cost DECIMAL            → Positive number validation
total_amount NUMERIC         → Positive number validation
quantity INTEGER             → Positive number validation
item_count INTEGER           → Positive number validation
```

**Generated Code:**

```typescript
// Error Code
INVALID_VALUE_PRICE = 'PRODUCTS_INVALID_VALUE_PRICE';

// Validation Logic
if (data.price !== undefined && data.price !== null) {
  if (data.price <= 0) {
    throw validationError(422, 'INVALID_VALUE_PRICE');
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCTS_INVALID_VALUE_PRICE",
    "message": "price must be a positive number",
    "statusCode": 422
  }
}
```

---

### 4. URL Format Validation

**Triggers:** Field names containing `url`, `website`, or `link`

**Examples:**

```sql
url VARCHAR(255)             → URL validation
website_url VARCHAR(255)     → URL validation
homepage VARCHAR(255)        → URL validation (contains 'home')
blog_link VARCHAR(255)       → URL validation
```

**Generated Code:**

```typescript
// Error Code
INVALID_URL_WEBSITE = 'COMPANIES_INVALID_URL_WEBSITE';

// Validation Logic
if (data.website) {
  try {
    new URL(data.website);
    if (!['http:', 'https:'].includes(new URL(data.website).protocol)) {
      throw new Error();
    }
  } catch {
    throw validationError(422, 'INVALID_URL_WEBSITE');
  }
}
```

---

### 5. Phone Number Format Validation

**Triggers:** Field names containing `phone`, `tel`, `telephone`, or `mobile`

**Examples:**

```sql
phone VARCHAR(20)            → Phone validation
phone_number VARCHAR(20)     → Phone validation
tel VARCHAR(20)              → Phone validation
telephone VARCHAR(20)        → Phone validation
mobile VARCHAR(20)           → Phone validation
cell_phone VARCHAR(20)       → Phone validation
```

**Generated Code:**

```typescript
// Error Code
INVALID_PHONE_PHONE = 'USERS_INVALID_PHONE_PHONE';

// Validation Logic
if (data.phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    throw validationError(422, 'INVALID_PHONE_PHONE');
  }
}
```

---

## Field Name Patterns

### Complete Pattern Reference

| Field Pattern                   | Validation Type | Example Fields                         | Status Code |
| ------------------------------- | --------------- | -------------------------------------- | ----------- |
| `*email*`, `*e_mail*`, `mail`   | Email format    | `email`, `user_email`, `contact_email` | 422         |
| `*birth*`, `*dob*`, `*born*`    | Date not future | `birth_date`, `dob`, `born_date`       | 422         |
| `*price*`, `*cost*`, `*amount*` | Positive number | `price`, `unit_cost`, `total_amount`   | 422         |
| `*quantity*`, `*count*`         | Positive number | `quantity`, `item_count`               | 422         |
| `*url*`, `*website*`, `*link*`  | URL format      | `url`, `website`, `blog_link`          | 422         |
| `*phone*`, `*tel*`, `*mobile*`  | Phone format    | `phone`, `telephone`, `mobile`         | 422         |

### Case Sensitivity

All pattern matching is **case-insensitive**:

```sql
Email VARCHAR(255)      ← Matches
EMAIL VARCHAR(255)      ← Matches
user_Email VARCHAR(255) ← Matches
```

---

## Validation Rules

### Email Format

**Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Valid Examples:**

```
user@example.com
john.doe@company.co.uk
admin+test@domain.org
```

**Invalid Examples:**

```
not-an-email
@example.com
user@
user@domain
```

---

### Date Not in Future

**Rule:** `fieldDate <= now`

**Valid Examples:**

```
2024-01-15 (past date)
2025-01-22 (today)
```

**Invalid Examples:**

```
2026-12-31 (future date)
2030-01-01 (future date)
```

---

### Positive Number

**Rule:** `value > 0`

**Valid Examples:**

```
0.01
1
99.99
1000000
```

**Invalid Examples:**

```
0
-1
-99.99
```

---

### URL Format

**Rule:** Valid URL with http/https protocol

**Valid Examples:**

```
https://example.com
http://www.company.org
https://blog.domain.com/page
```

**Invalid Examples:**

```
example.com (no protocol)
ftp://files.com (wrong protocol)
not a url
```

---

### Phone Number

**Rule:** E.164 format (optional +, 1-15 digits)

**Valid Examples:**

```
+1234567890
+66812345678
1234567890
(123) 456-7890 (cleaned before validation)
```

**Invalid Examples:**

```
123 (too short)
abc123 (contains letters)
++123 (invalid format)
```

---

## PostgreSQL Type Validations

### Numeric Types

Automatically enforced by PostgreSQL:

```sql
INTEGER           → -2147483648 to 2147483647
BIGINT            → -9223372036854775808 to 9223372036854775807
SMALLINT          → -32768 to 32767
DECIMAL(10,2)     → Precision and scale enforced
NUMERIC(10,2)     → Precision and scale enforced
```

### String Types

```sql
VARCHAR(255)      → Max length 255
CHAR(10)          → Fixed length 10
TEXT              → Unlimited length
```

### Date/Time Types

```sql
DATE              → YYYY-MM-DD format
TIMESTAMP         → Full date-time with timezone
TIME              → HH:MM:SS format
```

### Boolean

```sql
BOOLEAN           → true/false only
```

### UUID

```sql
UUID              → Valid UUID v4 format
                    → Example: 550e8400-e29b-41d4-a716-446655440000
```

---

## Custom Validations

### Adding Custom Rules

**Step 1: Add Error Code**

```typescript
// apps/api/src/modules/authors/types/authors.types.ts

export enum AuthorsErrorCode {
  // Auto-generated codes...

  // Custom validation
  INVALID_BIO_LENGTH = 'AUTHORS_INVALID_BIO_LENGTH',
  AUTHOR_UNDER_AGE = 'AUTHORS_AUTHOR_UNDER_AGE',
}
```

**Step 2: Add Error Message**

```typescript
export const AuthorsErrorMessages: Record<AuthorsErrorCode, string> = {
  // Auto-generated messages...

  // Custom messages
  [AuthorsErrorCode.INVALID_BIO_LENGTH]: 'Bio must be between 10 and 500 characters',
  [AuthorsErrorCode.AUTHOR_UNDER_AGE]: 'Author must be at least 18 years old',
};
```

**Step 3: Implement Validation**

```typescript
// apps/api/src/modules/authors/services/authors.service.ts

async validateCreate(data: CreateAuthors): Promise<void> {
  // Auto-generated validations run first...

  // Custom bio length validation
  if (data.bio) {
    if (data.bio.length < 10 || data.bio.length > 500) {
      const error = new Error(
        AuthorsErrorMessages[AuthorsErrorCode.INVALID_BIO_LENGTH]
      ) as any;
      error.statusCode = 422;
      error.code = AuthorsErrorCode.INVALID_BIO_LENGTH;
      throw error;
    }
  }

  // Custom age validation
  if (data.birth_date) {
    const age = calculateAge(data.birth_date);
    if (age < 18) {
      const error = new Error(
        AuthorsErrorMessages[AuthorsErrorCode.AUTHOR_UNDER_AGE]
      ) as any;
      error.statusCode = 422;
      error.code = AuthorsErrorCode.AUTHOR_UNDER_AGE;
      error.details = { age, minimumAge: 18 };
      throw error;
    }
  }
}
```

---

## Testing Validations

### Manual Testing with cURL

**Test Email Validation:**

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "email": "invalid-email"
  }'

# Expected: 422 with INVALID_EMAIL_EMAIL
```

**Test Date Validation:**

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "email": "test@example.com",
    "birth_date": "2030-01-01"
  }'

# Expected: 422 with INVALID_DATE_BIRTH_DATE
```

**Test Duplicate Email:**

```bash
# Create first author
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com"}'

# Try duplicate
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test2", "email": "test@example.com"}'

# Expected: 409 with DUPLICATE_EMAIL
```

---

### Automated Testing

```typescript
// apps/api/src/modules/authors/__tests__/authors-validation.test.ts

describe('Authors Validation', () => {
  describe('Email Validation', () => {
    it('should reject invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'not-an-email',
        },
      });

      expect(response.statusCode).toBe(422);
      expect(response.json().error.code).toBe('AUTHORS_INVALID_EMAIL_EMAIL');
    });

    it('should accept valid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Test Author',
          email: 'valid@example.com',
        },
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Date Validation', () => {
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
      expect(response.json().error.code).toBe('AUTHORS_INVALID_DATE_BIRTH_DATE');
    });
  });

  describe('Uniqueness Validation', () => {
    it('should reject duplicate email', async () => {
      // Create first
      await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Author 1',
          email: 'unique@example.com',
        },
      });

      // Try duplicate
      const response = await app.inject({
        method: 'POST',
        url: '/api/authors',
        payload: {
          name: 'Author 2',
          email: 'unique@example.com',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().error.code).toBe('AUTHORS_DUPLICATE_EMAIL');
    });
  });
});
```

---

## Examples

### Example 1: Products Table

**Database Schema:**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  quantity INTEGER NOT NULL,
  product_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Auto-Detected Validations:**

1. ✅ `DUPLICATE_SKU` - SKU uniqueness (409)
2. ✅ `INVALID_VALUE_PRICE` - Price must be positive (422)
3. ✅ `INVALID_VALUE_COST` - Cost must be positive (422)
4. ✅ `INVALID_VALUE_QUANTITY` - Quantity must be positive (422)
5. ✅ `INVALID_URL_PRODUCT_URL` - URL format validation (422)

---

### Example 2: Users Table

**Database Schema:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Auto-Detected Validations:**

1. ✅ `DUPLICATE_USERNAME` - Username uniqueness (409)
2. ✅ `DUPLICATE_EMAIL` - Email uniqueness (409)
3. ✅ `INVALID_EMAIL_EMAIL` - Email format (422)
4. ✅ `INVALID_PHONE_PHONE` - Phone format (422)
5. ✅ `INVALID_DATE_BIRTH_DATE` - Birth date not in future (422)
6. ✅ `INVALID_URL_WEBSITE` - Website URL format (422)

---

## Best Practices

### ✅ DO

1. **Use descriptive field names** that match validation patterns
2. **Add database constraints** (UNIQUE, NOT NULL, CHECK)
3. **Test all validations** with both valid and invalid data
4. **Document custom validations** in code comments
5. **Use error codes** instead of hard-coded messages

### ❌ DON'T

1. **Don't use ambiguous field names** (e.g., `field1`, `data`)
2. **Don't skip database constraints** (app-level only is not enough)
3. **Don't hardcode validation logic** without error codes
4. **Don't forget to test edge cases**
5. **Don't mix validation responsibilities** (keep in service layer)

---

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) - Error code conventions
- [Type Mapping Guide](./TYPE_MAPPING_GUIDE.md) - PostgreSQL types
- [Best Practices](./BEST_PRACTICES.md) - Database design patterns

---

## Need Help?

- Check auto-detection by reviewing generation output
- Test with `curl` or Postman to verify validations
- Review generated `service.ts` for validation logic
- See `authors` module as reference
