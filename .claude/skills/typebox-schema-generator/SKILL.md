---
name: typebox-schema-generator
description: Generate TypeBox validation schemas from PostgreSQL database table structures. Use when creating new features, after running migrations, or when schemas need to sync with database. Creates properly typed and validated TypeBox schemas following project standards.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# TypeBox Schema Generator

Generates TypeBox validation schemas from PostgreSQL database table structures.

## When Claude Should Use This Skill

- User asks to "generate TypeBox schemas", "create schemas from database", or "sync schemas with DB"
- After running database migrations but before implementing routes
- When creating a new CRUD feature
- User mentions "I have a table but no schemas"
- When database schema changes and TypeBox schemas need updating

## Generation Process

### Step 1: Get Database Table Structure

#### Method 1: Query PostgreSQL Directly

```bash
# Connect to database and get table structure
psql $DATABASE_URL -c "\d+ table_name"
```

Expected output shows:

- Column names
- Data types
- Nullable/Not null
- Default values
- Constraints (primary key, foreign key, unique, check)

#### Method 2: Read Migration Files

```bash
# Find migration for the table
find apps/api/migrations -name "*.ts" | xargs grep -l "createTable.*table_name"
```

Read the migration file to extract:

```typescript
await knex.schema.createTable('departments', (table) => {
  table.increments('id').primary();
  table.string('dept_code', 10).notNullable().unique();
  table.string('dept_name', 100).notNullable();
  table.boolean('is_active').defaultTo(true);
  table.timestamps(true, true);
});
```

### Step 2: Map PostgreSQL Types to TypeBox

Use this mapping:

| PostgreSQL Type           | TypeBox Type                           | Example                                                          |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `integer`, `increments`   | `Type.Integer()`                       | `Type.Integer()`                                                 |
| `bigInteger`              | `Type.Integer()`                       | `Type.Integer()`                                                 |
| `string(N)`, `varchar(N)` | `Type.String({ maxLength: N })`        | `Type.String({ maxLength: 100 })`                                |
| `text`                    | `Type.String()`                        | `Type.String()`                                                  |
| `boolean`                 | `Type.Boolean()`                       | `Type.Boolean()`                                                 |
| `decimal(P,S)`, `numeric` | `Type.Number()`                        | `Type.Number()`                                                  |
| `float`, `double`         | `Type.Number()`                        | `Type.Number()`                                                  |
| `date`                    | `Type.String({ format: 'date' })`      | `Type.String({ format: 'date' })`                                |
| `datetime`, `timestamp`   | `Type.String({ format: 'date-time' })` | `Type.String({ format: 'date-time' })`                           |
| `uuid`                    | `Type.String({ format: 'uuid' })`      | `Type.String({ format: 'uuid' })`                                |
| `json`, `jsonb`           | `Type.Any()` or specific object        | `Type.Object({...})`                                             |
| `enum`                    | `Type.Union([Type.Literal(...)])`      | `Type.Union([Type.Literal('active'), Type.Literal('inactive')])` |

### Step 3: Handle Nullable and Optional Fields

```typescript
// NOT NULL columns → Required
table.string('dept_code').notNullable()
→ dept_code: Type.String({ maxLength: 255 })

// Nullable columns → Optional
table.string('description').nullable()
→ description: Type.Optional(Type.String())

// Columns with defaults → Optional in create, not in update
table.boolean('is_active').defaultTo(true)
→ In CreateSchema: is_active: Type.Optional(Type.Boolean({ default: true }))
→ In UpdateSchema: is_active: Type.Boolean()
```

### Step 4: Generate Schema Files

Create schema file at: `apps/api/src/layers/[layer]/[feature]/schemas/[feature].schemas.ts`

#### Template Structure:

```typescript
import { Type, Static } from '@sinclair/typebox';

// ============================================================================
// [Feature Name] Schemas
// ============================================================================

/**
 * Base schema with all database fields
 */
export const [Feature]Schema = Type.Object({
  id: Type.Integer(),
  field_name: Type.String({ maxLength: 100 }),
  another_field: Type.Optional(Type.String({ maxLength: 255 })),
  is_active: Type.Boolean({ default: true }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export type [Feature] = Static<typeof [Feature]Schema>;

/**
 * Schema for creating new [feature]
 * Excludes: id, created_at, updated_at (auto-generated)
 */
export const [Feature]CreateSchema = Type.Object({
  field_name: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Field description'
  }),
  another_field: Type.Optional(Type.String({
    maxLength: 255,
    description: 'Optional field description'
  })),
  is_active: Type.Optional(Type.Boolean({
    default: true,
    description: 'Active status (default: true)'
  })),
});

export type [Feature]Create = Static<typeof [Feature]CreateSchema>;

/**
 * Schema for updating existing [feature]
 * All fields optional (partial update)
 */
export const [Feature]UpdateSchema = Type.Partial(
  Type.Object({
    field_name: Type.String({ maxLength: 100 }),
    another_field: Type.String({ maxLength: 255 }),
    is_active: Type.Boolean(),
  })
);

export type [Feature]Update = Static<typeof [Feature]UpdateSchema>;

/**
 * Schema for query parameters (list endpoint)
 */
export const [Feature]QuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String()),
  sort_by: Type.Optional(Type.String()),
  sort_order: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ], { default: 'asc' })),
  is_active: Type.Optional(Type.Boolean()),
});

export type [Feature]Query = Static<typeof [Feature]QuerySchema>;

/**
 * Schema for path parameters (detail endpoints)
 */
export const [Feature]ParamsSchema = Type.Object({
  id: Type.Integer({ description: '[Feature] ID' }),
});

export type [Feature]Params = Static<typeof [Feature]ParamsSchema>;

/**
 * Schema for API response (single item)
 */
export const [Feature]ResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: [Feature]Schema,
  message: Type.String(),
});

export type [Feature]Response = Static<typeof [Feature]ResponseSchema>;

/**
 * Schema for API response (list with pagination)
 */
export const [Feature]ListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    items: Type.Array([Feature]Schema),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      total_pages: Type.Integer(),
    }),
  }),
  message: Type.String(),
});

export type [Feature]ListResponse = Static<typeof [Feature]ListResponseSchema>;

/**
 * Schema for dropdown/select options
 */
export const [Feature]DropdownSchema = Type.Object({
  value: Type.Integer(),
  label: Type.String(),
});

export type [Feature]Dropdown = Static<typeof [Feature]DropdownSchema>;
```

### Step 5: Add Advanced Validations

#### String Patterns

```typescript
// Email
Type.String({ format: 'email' });

// URL
Type.String({ format: 'uri' });

// Phone (Thai format)
Type.String({ pattern: '^0[0-9]{9}$' });

// Alphanumeric only
Type.String({ pattern: '^[A-Z0-9]+$' });

// Date (YYYY-MM-DD)
Type.String({ format: 'date' });
```

#### Number Constraints

```typescript
// Positive integer
Type.Integer({ minimum: 1 });

// Percentage (0-100)
Type.Number({ minimum: 0, maximum: 100 });

// Currency (2 decimal places)
Type.Number({ multipleOf: 0.01 });
```

#### Array Validations

```typescript
// Array of strings, min 1 item
Type.Array(Type.String(), { minItems: 1 });

// Array of IDs
Type.Array(Type.Integer({ minimum: 1 }));
```

#### Enum Types

```typescript
// Status enum
Type.Union([Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected')], { default: 'pending' });
```

### Step 6: Handle Special Cases

#### UUID Primary Keys

```typescript
// If table uses UUID instead of integer ID
export const [Feature]Schema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  // ... other fields
});

export const [Feature]ParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
```

#### Foreign Key Relationships

```typescript
// Reference to another table
department_id: Type.Integer({
  minimum: 1,
  description: 'Reference to departments.id',
});
```

#### JSON/JSONB Columns

```typescript
// Structured JSON
metadata: Type.Object({
  key1: Type.String(),
  key2: Type.Number(),
});

// Flexible JSON
metadata: Type.Any();
```

#### Composite Unique Constraints

```typescript
// Document in JSDoc
/**
 * Note: dept_code must be unique across the table
 */
dept_code: Type.String({ maxLength: 10 });
```

### Step 7: Verify Generated Schemas

After generation, check:

1. **All database columns mapped** - No missing fields
2. **Correct nullable handling** - Optional vs required matches DB
3. **Proper constraints** - maxLength, minimum, maximum set correctly
4. **Timestamps excluded from create** - id, created_at, updated_at not in CreateSchema
5. **Update schema is partial** - All fields optional for PATCH behavior
6. **Query schema has filters** - Common filter fields included
7. **Response schemas complete** - Single and list response formats

## Examples

### Example 1: Simple Table

**Database:**

```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL UNIQUE,
  dept_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**User Request:**

```
"Generate TypeBox schemas for departments table"
```

**Claude Action:**

1. Read table structure (via psql or migration)
2. Map types: id→Integer, dept_code→String(10), etc.
3. Generate schemas file with:
   - DepartmentSchema (full)
   - DepartmentCreateSchema (excludes id, timestamps)
   - DepartmentUpdateSchema (partial)
   - Query, Params, Response schemas
4. Save to: `apps/api/src/layers/platform/departments/schemas/departments.schemas.ts`

### Example 2: Complex Table with Relations

**Database:**

```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(10),
  department_id INTEGER REFERENCES departments(id),
  position_id INTEGER REFERENCES positions(id),
  salary DECIMAL(10,2),
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Generated Schema Highlights:**

```typescript
export const EmployeeCreateSchema = Type.Object({
  employee_code: Type.String({
    maxLength: 20,
    pattern: '^[A-Z0-9]+$',
    description: 'Unique employee code (alphanumeric)',
  }),
  first_name: Type.String({ maxLength: 50, minLength: 1 }),
  last_name: Type.String({ maxLength: 50, minLength: 1 }),
  email: Type.Optional(
    Type.String({
      format: 'email',
      maxLength: 100,
    }),
  ),
  phone: Type.Optional(
    Type.String({
      pattern: '^0[0-9]{9}$',
      description: 'Thai phone format (10 digits starting with 0)',
    }),
  ),
  department_id: Type.Integer({
    minimum: 1,
    description: 'Reference to departments.id',
  }),
  position_id: Type.Integer({
    minimum: 1,
    description: 'Reference to positions.id',
  }),
  salary: Type.Number({
    minimum: 0,
    multipleOf: 0.01,
    description: 'Monthly salary',
  }),
  hire_date: Type.String({
    format: 'date',
    description: 'Hire date (YYYY-MM-DD)',
  }),
  is_active: Type.Optional(Type.Boolean({ default: true })),
  metadata: Type.Optional(Type.Any()),
});
```

### Example 3: Update Existing Schemas

**User Request:**

```
"Update user schemas, I added a birthdate column"
```

**Claude Action:**

1. Read existing: `apps/api/src/.../users/schemas/users.schemas.ts`
2. Check database for new column
3. Add to all relevant schemas:
   ```typescript
   birthdate: Type.Optional(Type.String({ format: 'date' }));
   ```
4. Update file

## Best Practices

### 1. Always Include Descriptions

```typescript
// Good - with description
dept_code: Type.String({
  maxLength: 10,
  description: 'Unique department code (uppercase letters and numbers only)',
});

// Less helpful - no description
dept_code: Type.String({ maxLength: 10 });
```

### 2. Use Proper Defaults

```typescript
// Database has default → Include in schema
table.boolean('is_active').defaultTo(true)
→ is_active: Type.Optional(Type.Boolean({ default: true }))

// No database default → Don't add default in schema
table.string('name').notNullable()
→ name: Type.String({ maxLength: 100 }) // No default
```

### 3. Exclude Auto-Generated Fields from Create Schema

```typescript
// Never in CreateSchema:
// - id (auto-increment)
// - created_at (auto-generated)
// - updated_at (auto-generated)

// Only in base schema:
export const DepartmentSchema = Type.Object({
  id: Type.Integer(),
  // ... other fields
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});
```

### 4. Make Update Schema Partial

```typescript
// All fields optional for PATCH behavior
export const DepartmentUpdateSchema = Type.Partial(
  Type.Object({
    dept_code: Type.String({ maxLength: 10 }),
    dept_name: Type.String({ maxLength: 100 }),
    is_active: Type.Boolean(),
  }),
);
```

### 5. Add Query Filters for Common Searches

```typescript
export const EmployeeQuerySchema = Type.Object({
  // Standard pagination
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),

  // Common filters
  search: Type.Optional(Type.String()),
  department_id: Type.Optional(Type.Integer()),
  position_id: Type.Optional(Type.Integer()),
  is_active: Type.Optional(Type.Boolean()),

  // Sorting
  sort_by: Type.Optional(Type.String({ default: 'created_at' })),
  sort_order: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')], { default: 'desc' })),
});
```

## Output Format

Always provide a summary after generation:

```markdown
## TypeBox Schema Generation Complete

**Feature:** [feature-name]
**Table:** [table_name]
**Schema File:** apps/api/src/.../[feature].schemas.ts

**Database Columns Mapped:**

- id (integer) → Type.Integer()
- field_name (varchar(100)) → Type.String({ maxLength: 100 })
- is_active (boolean) → Type.Boolean({ default: true })
- created_at (timestamp) → Type.String({ format: 'date-time' })

**Schemas Generated:**

1. [Feature]Schema - Complete database representation (X fields)
2. [Feature]CreateSchema - For POST requests (Y fields)
3. [Feature]UpdateSchema - For PUT/PATCH requests (partial)
4. [Feature]QuerySchema - For GET list query parameters
5. [Feature]ParamsSchema - For path parameters (:id)
6. [Feature]ResponseSchema - Single item response
7. [Feature]ListResponseSchema - Paginated list response
8. [Feature]DropdownSchema - For dropdown options

**Special Validations Added:**

- Email format validation on `email` field
- Phone pattern validation (Thai format)
- Positive integer constraint on foreign keys
- Currency precision (2 decimals) on `salary`

**Next Steps:**

1. Review generated schemas for accuracy
2. Use in route definitions: `{ schema: { body: [Feature]CreateSchema } }`
3. Test with actual API requests
4. Generate API contract: "Claude, generate API contract for [feature]"
```

## Troubleshooting

### Issue: Can't connect to database

**Solution:** Use migration files instead:

```bash
find apps/api/migrations -name "*.ts" | xargs grep -l "createTable"
```

### Issue: Complex JSON structure

**Solution:** Create specific TypeBox object instead of Type.Any():

```typescript
metadata: Type.Object({
  preferences: Type.Object({
    theme: Type.String(),
    language: Type.String(),
  }),
  settings: Type.Any(), // Keep flexible for future additions
});
```

### Issue: Enum from CHECK constraint

**Solution:** Extract values from migration:

```typescript
// From: table.check('status IN (\'pending\', \'approved\', \'rejected\')')
status: Type.Union([Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected')]);
```

## Related Skills

- Use `api-contract-generator` after creating schemas to document APIs
- Use `api-contract-validator` to verify schemas are used in routes
- Use `database-schema-sync-checker` to verify schemas stay in sync

## Related Documentation

- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
