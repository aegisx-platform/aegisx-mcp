# TypeBox Schema Generator Skill

Automatically generates TypeBox validation schemas from PostgreSQL database table structures.

## What This Skill Does

Claude will **automatically use this skill** when you:

- Ask to "generate TypeBox schemas" or "create schemas from database"
- Say "I have a table but no schemas"
- Request "sync schemas with database"
- Mention "create schemas for [table_name]"

## How It Works

1. **Reads Database Structure** - Connects to PostgreSQL or reads migration files
2. **Maps Types** - Converts PostgreSQL types to TypeBox types
3. **Handles Constraints** - Applies NOT NULL, maxLength, patterns, etc.
4. **Generates Multiple Schemas**:
   - Base schema (full database representation)
   - Create schema (for POST requests)
   - Update schema (for PUT/PATCH requests)
   - Query schema (for filtering/pagination)
   - Response schemas (API responses)
5. **Saves to Correct Location** - `apps/api/src/.../schemas/[feature].schemas.ts`

## Quick Start

### Example 1: Generate from Database Table

```
You: "Generate TypeBox schemas for departments table"
```

**Database Table:**

```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL UNIQUE,
  dept_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Claude Generates:**

```typescript
// DepartmentSchema, DepartmentCreateSchema, DepartmentUpdateSchema,
// DepartmentQuerySchema, DepartmentResponseSchema, etc.
```

### Example 2: After Migration

```
You: "I just ran migrations for the employees table, generate schemas"
```

Claude will:

- Read migration file
- Extract all columns and types
- Generate complete schema file
- Handle foreign keys and constraints

### Example 3: Update Existing Schemas

```
You: "Update user schemas, I added a birthdate column"
```

Claude will:

- Read existing schema file
- Check database for new column
- Add to all relevant schemas
- Preserve existing code

## Generated Schemas

For a `departments` table, generates:

### 1. Base Schema (Full DB Representation)

```typescript
export const DepartmentSchema = Type.Object({
  id: Type.Integer(),
  dept_code: Type.String({ maxLength: 10 }),
  dept_name: Type.String({ maxLength: 100 }),
  is_active: Type.Boolean({ default: true }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});
```

### 2. Create Schema (POST Requests)

```typescript
export const DepartmentCreateSchema = Type.Object({
  dept_code: Type.String({
    maxLength: 10,
    minLength: 1,
    description: 'Unique department code',
  }),
  dept_name: Type.String({
    maxLength: 100,
    minLength: 1,
    description: 'Department name',
  }),
  is_active: Type.Optional(
    Type.Boolean({
      default: true,
      description: 'Active status',
    }),
  ),
});
// Excludes: id, created_at, updated_at (auto-generated)
```

### 3. Update Schema (PUT/PATCH Requests)

```typescript
export const DepartmentUpdateSchema = Type.Partial(
  Type.Object({
    dept_code: Type.String({ maxLength: 10 }),
    dept_name: Type.String({ maxLength: 100 }),
    is_active: Type.Boolean(),
  }),
);
// All fields optional for partial updates
```

### 4. Query Schema (GET with Filters)

```typescript
export const DepartmentQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  sort_by: Type.Optional(Type.String()),
  sort_order: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
});
```

### 5. Params Schema (Path Parameters)

```typescript
export const DepartmentParamsSchema = Type.Object({
  id: Type.Integer({ description: 'Department ID' }),
});
```

### 6. Response Schemas

```typescript
// Single item response
export const DepartmentResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: DepartmentSchema,
  message: Type.String(),
});

// List with pagination
export const DepartmentListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    items: Type.Array(DepartmentSchema),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      total_pages: Type.Integer(),
    }),
  }),
  message: Type.String(),
});
```

## Type Mapping

| PostgreSQL      | TypeBox                                | Example                                |
| --------------- | -------------------------------------- | -------------------------------------- |
| `VARCHAR(N)`    | `Type.String({ maxLength: N })`        | `Type.String({ maxLength: 100 })`      |
| `TEXT`          | `Type.String()`                        | `Type.String()`                        |
| `INTEGER`       | `Type.Integer()`                       | `Type.Integer()`                       |
| `BOOLEAN`       | `Type.Boolean()`                       | `Type.Boolean()`                       |
| `DECIMAL(10,2)` | `Type.Number()`                        | `Type.Number({ multipleOf: 0.01 })`    |
| `DATE`          | `Type.String({ format: 'date' })`      | `Type.String({ format: 'date' })`      |
| `TIMESTAMP`     | `Type.String({ format: 'date-time' })` | `Type.String({ format: 'date-time' })` |
| `UUID`          | `Type.String({ format: 'uuid' })`      | `Type.String({ format: 'uuid' })`      |
| `JSONB`         | `Type.Object({...})` or `Type.Any()`   | `Type.Object({ key: Type.String() })`  |

## Advanced Validations

### Email Validation

```typescript
email: Type.String({
  format: 'email',
  maxLength: 100,
});
```

### Phone Number (Thai Format)

```typescript
phone: Type.String({
  pattern: '^0[0-9]{9}$',
  description: '10 digits starting with 0',
});
```

### Enum/Status Fields

```typescript
status: Type.Union([Type.Literal('pending'), Type.Literal('approved'), Type.Literal('rejected')], { default: 'pending' });
```

### Positive Numbers

```typescript
department_id: Type.Integer({
  minimum: 1,
  description: 'Reference to departments.id',
});
```

### Currency (2 Decimal Places)

```typescript
salary: Type.Number({
  minimum: 0,
  multipleOf: 0.01,
  description: 'Monthly salary in THB',
});
```

### URL Validation

```typescript
website: Type.Optional(
  Type.String({
    format: 'uri',
    description: 'Website URL',
  }),
);
```

## Benefits

### ⚡ Speed

- Generate complete schema file in seconds
- No manual type mapping needed
- Consistent structure across all features

### ✅ Accuracy

- Direct from database structure
- No human error in type mapping
- Constraints automatically applied

### 📚 Completeness

- All CRUD schemas generated
- Query and response schemas included
- TypeScript types exported

### 🔄 Easy Updates

- Regenerate after schema changes
- Keep schemas in sync with database
- Version control friendly

## Integration with Workflow

### API-First Development Flow

```
1. Design database schema
   ↓
2. Create migration file
   ↓
3. Run migration: pnpm run db:migrate
   ↓
4. Generate schemas: "Claude, generate schemas for [table]"
   ↓
5. Create routes using schemas
   ↓
6. Generate API contract: "Claude, generate API contract"
   ↓
7. Implement frontend
```

### After Database Changes

```bash
# 1. Create and run migration
pnpm run db:migrate

# 2. Update schemas
"Claude, update schemas for users, I added birthdate column"

# 3. Update API contract if needed
"Claude, update users API contract"

# 4. Validate everything matches
"Claude, validate users API"
```

## Real-World Examples

### Example: Employee Management

**Migration:**

```typescript
await knex.schema.createTable('employees', (table) => {
  table.increments('id').primary();
  table.string('employee_code', 20).notNullable().unique();
  table.string('first_name', 50).notNullable();
  table.string('last_name', 50).notNullable();
  table.string('email', 100).unique();
  table.string('phone', 10);
  table.integer('department_id').references('departments.id');
  table.decimal('salary', 10, 2);
  table.date('hire_date').notNullable();
  table.boolean('is_active').defaultTo(true);
  table.timestamps(true, true);
});
```

**Command:**

```
"Generate TypeBox schemas for employees table"
```

**Result:**
Complete schema file with:

- ✅ Employee code with pattern validation
- ✅ Email with format validation
- ✅ Phone with Thai format pattern
- ✅ Foreign key to departments
- ✅ Salary with decimal precision
- ✅ Date format for hire_date
- ✅ All CRUD schemas
- ✅ TypeScript types

### Example: Product Catalog

**Migration:**

```typescript
await knex.schema.createTable('products', (table) => {
  table.increments('id').primary();
  table.string('sku', 50).notNullable().unique();
  table.string('name', 200).notNullable();
  table.text('description');
  table.decimal('price', 10, 2).notNullable();
  table.integer('stock').defaultTo(0);
  table.integer('category_id').references('categories.id');
  table.jsonb('specifications');
  table.enum('status', ['draft', 'active', 'discontinued']).defaultTo('draft');
  table.timestamps(true, true);
});
```

**Generated Schemas Include:**

- ✅ SKU uniqueness validation
- ✅ Price with 2 decimal precision
- ✅ Stock non-negative constraint
- ✅ Status enum with literals
- ✅ Structured JSONB schema
- ✅ Category foreign key

## Troubleshooting

### Can't Connect to Database?

No problem! Claude will read migration files instead:

```
"Generate schemas from the employees migration file"
```

### Complex JSON Field?

Specify structure or keep flexible:

```typescript
// Structured
metadata: Type.Object({
  preferences: Type.Object({
    theme: Type.String(),
    language: Type.String(),
  }),
});

// Flexible
metadata: Type.Any();
```

### Custom Validation Needed?

Just ask:

```
"Generate schemas for products, and add pattern validation
for SKU: uppercase letters and numbers only"
```

## Helper Script

Quick schema generation from command line:

```bash
# Generate schemas for table
./.claude/skills/typebox-schema-generator/scripts/generate.sh departments

# Preview without creating file
./.claude/skills/typebox-schema-generator/scripts/generate.sh departments --dry-run

# From migration file
./.claude/skills/typebox-schema-generator/scripts/generate.sh departments --from-migration
```

**Note:** For best results, ask Claude directly.

## Related Skills

Perfect workflow with:

1. **typebox-schema-generator** ← Generate schemas from database
2. **api-contract-generator** ← Document APIs using schemas
3. **api-contract-validator** ← Verify routes use schemas correctly

## Project Standards

Follows these standards:

- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)

## Questions?

Ask Claude:

- "How do I generate TypeBox schemas?"
- "Can you create schemas for my new table?"
- "Update schemas after I changed the database"
- "What schemas will be generated?"

---

**Ready to use!** Just ask Claude to generate schemas for your tables.
