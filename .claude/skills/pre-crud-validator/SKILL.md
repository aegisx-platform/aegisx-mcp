---
name: pre-crud-validator
description: ตรวจสอบความพร้อมทั้งหมดก่อน generate CRUD เพื่อป้องกันข้อผิดพลาด. ใช้ก่อน generate ทุกครั้ง
invocable: true
---

# Pre-CRUD Validator Skill

ตรวจสอบความพร้อมครบถ้วนก่อนการ generate CRUD module เพื่อป้องกันข้อผิดพลาดและประหยัดเวลา

## When to Use

ใช้ skill นี้เมื่อ:

- จะ generate CRUD module ใหม่ (ใช้ก่อน generate ทุกครั้ง)
- ต้องการตรวจสอบว่าพร้อม generate หรือยัง
- Migration มีปัญหาและต้องการหาสาเหตุ
- ต้องการตรวจสอบ database schema

## Validation Checklist

### 1. Database Table Check

- ✅ Table exists in database
- ✅ Table is in correct schema (public, inventory, etc.)
- ✅ Table has UUID primary key
- ✅ All foreign keys have UUID format
- ✅ Required fields are NOT NULL where appropriate

### 2. Migration File Check

- ✅ Migration file exists and valid
- ✅ Migration has run successfully
- ✅ No pending migrations
- ✅ No migration conflicts

### 3. Domain Classification Check

- ✅ Domain type is correct (master-data vs operations)
- ✅ Section assignment is appropriate
- ✅ Schema selection matches table location

### 4. Prerequisites Check

- ✅ All dependencies are installed (`node_modules`)
- ✅ Database is running
- ✅ Environment variables are set
- ✅ No TypeScript errors in existing code

### 5. Naming Convention Check

- ✅ Table name is in snake_case
- ✅ Table name is plural (items, not item)
- ✅ Column names follow conventions
- ✅ No reserved keywords used

## Instructions

1. **Ask for table name**
   - Get the table name user wants to generate CRUD for

2. **Check database connection**

   ```bash
   psql -U postgres -d aegisx_starter_1 -c "\dt [schema].*"
   ```

3. **Verify table exists**

   ```sql
   SELECT table_schema, table_name
   FROM information_schema.tables
   WHERE table_name = '[table_name]';
   ```

4. **Check table structure**

   ```sql
   SELECT
     column_name,
     data_type,
     is_nullable,
     column_default
   FROM information_schema.columns
   WHERE table_schema = '[schema]'
     AND table_name = '[table_name]'
   ORDER BY ordinal_position;
   ```

5. **Verify primary key is UUID**

   ```sql
   SELECT constraint_name, constraint_type
   FROM information_schema.table_constraints
   WHERE table_schema = '[schema]'
     AND table_name = '[table_name]'
     AND constraint_type = 'PRIMARY KEY';
   ```

6. **Check foreign keys**

   ```sql
   SELECT
     kcu.column_name,
     ccu.table_schema AS foreign_table_schema,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name
   FROM information_schema.key_column_usage AS kcu
   INNER JOIN information_schema.constraint_column_usage AS ccu
     ON kcu.constraint_name = ccu.constraint_name
   WHERE kcu.table_schema = '[schema]'
     AND kcu.table_name = '[table_name]'
     AND kcu.constraint_name LIKE '%_fkey';
   ```

7. **Check migration status**

   ```bash
   # For public schema
   pnpm run db:status

   # For inventory schema
   pnpm run db:status:inventory
   ```

8. **Run domain checker**
   - Use `/domain-checker` skill to verify classification

9. **Verify no TypeScript errors**

   ```bash
   pnpm run build
   ```

10. **Generate validation report**

## Validation Report Format

````markdown
# Pre-CRUD Validation Report: [TABLE_NAME]

## ✅ Database Connection

- [x] PostgreSQL is running
- [x] Database 'aegisx_starter_1' is accessible
- [x] User has necessary permissions

## ✅ Table Verification

- [x] Table exists: `[schema].[table_name]`
- [x] Table schema: `[schema_name]`
- [ ] Table has UUID primary key: `[column_name]`
- [x] Total columns: [count]

## ✅ Column Structure

| Column Name | Data Type    | Nullable | Default           | Notes      |
| ----------- | ------------ | -------- | ----------------- | ---------- |
| id          | uuid         | NO       | gen_random_uuid() | ✅ UUID PK |
| code        | varchar(50)  | NO       |                   | ✅         |
| name        | varchar(255) | NO       |                   | ✅         |
| created_at  | timestamp    | NO       | now()             | ✅         |

## ✅ Foreign Keys

- [x] item_id → inventory.items(id) [UUID] ✅
- [x] category_id → inventory.categories(id) [UUID] ✅
- [x] created_by → public.users(id) [UUID] ✅

## ✅ Migration Status

- [x] All migrations up to date
- [x] No pending migrations
- [x] No conflicts detected

## ✅ Domain Classification

- **Domain Type:** [MASTER-DATA | OPERATIONS]
- **Section:** [section_name]
- **Schema:** [schema_name]
- **Reasoning:** [brief explanation]

## ✅ Prerequisites

- [x] Node modules installed
- [x] Database running
- [x] Environment variables set
- [x] No TypeScript errors

## 🎯 Recommended CRUD Command

```bash
pnpm run crud -- [table_name] --domain [domain/section] [--schema schema] --force
```
````

## ⚠️ Issues Found

[If any issues, list them here]

### Critical Issues

- [ ] Issue 1: Description and fix
- [ ] Issue 2: Description and fix

### Warnings

- [ ] Warning 1: Description
- [ ] Warning 2: Description

## ✅ Ready to Generate?

**Status:** [READY | NOT READY]

**Next Steps:**

1. [Step 1 if ready, or fix issues if not ready]
2. [Step 2]
3. [Step 3]

````

## Example Output

### Example 1: Ready to Generate

```markdown
# Pre-CRUD Validation Report: drug_catalogs

## ✅ Database Connection
- [x] PostgreSQL is running
- [x] Database 'aegisx_starter_1' is accessible
- [x] User has necessary permissions

## ✅ Table Verification
- [x] Table exists: `inventory.drug_catalogs`
- [x] Table schema: `inventory`
- [x] Table has UUID primary key: `id`
- [x] Total columns: 8

## ✅ Column Structure
| Column Name | Data Type | Nullable | Default | Notes |
|------------|-----------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | ✅ UUID PK |
| code | varchar(50) | NO | | ✅ Unique |
| name | varchar(255) | NO | | ✅ |
| generic_name | varchar(255) | YES | | ✅ Optional |
| description | text | YES | | ✅ Optional |
| is_active | boolean | NO | true | ✅ |
| created_at | timestamp | NO | now() | ✅ |
| updated_at | timestamp | NO | now() | ✅ |

## ✅ Foreign Keys
- No foreign keys (Master-Data table)

## ✅ Migration Status
- [x] All inventory migrations up to date
- [x] No pending migrations
- [x] No conflicts detected

## ✅ Domain Classification
- **Domain Type:** MASTER-DATA
- **Section:** inventory
- **Schema:** inventory
- **Reasoning:** Has code/name/is_active pattern, no audit fields, used for reference data

## ✅ Prerequisites
- [x] Node modules installed
- [x] Database running
- [x] Environment variables set
- [x] No TypeScript errors

## 🎯 Recommended CRUD Command

```bash
# Standard CRUD
pnpm run crud -- drug_catalogs --domain inventory/master-data --schema inventory --force

# With import feature
pnpm run crud:import -- drug_catalogs --domain inventory/master-data --schema inventory --force

# Full package (import + events)
pnpm run crud:full -- drug_catalogs --domain inventory/master-data --schema inventory --force
````

## ✅ Ready to Generate?

**Status:** ✅ READY

**Next Steps:**

1. Choose CRUD command from recommendations above
2. Run the command
3. Test generated endpoints at `/api/inventory/drug-catalogs`
4. Verify frontend components work correctly

````

### Example 2: Not Ready (Has Issues)

```markdown
# Pre-CRUD Validation Report: budget_allocations

## ✅ Database Connection
- [x] PostgreSQL is running
- [x] Database 'aegisx_starter_1' is accessible

## ❌ Table Verification
- [x] Table exists: `public.budget_allocations`
- [x] Table schema: `public`
- [ ] Table has UUID primary key: `id` is INTEGER ❌
- [x] Total columns: 12

## ❌ Column Structure Issues
| Column Name | Data Type | Nullable | Default | Notes |
|------------|-----------|----------|---------|-------|
| id | integer | NO | nextval() | ❌ Should be UUID |
| budget_type_id | integer | NO | | ❌ Should be UUID |
| allocated_amount | float | NO | | ⚠️ Should be DECIMAL |

## ❌ Foreign Keys Issues
- [ ] budget_type_id → Uses INTEGER instead of UUID ❌
- [ ] created_by → Uses INTEGER instead of UUID ❌

## ✅ Migration Status
- [x] All migrations up to date

## ⚠️ Issues Found

### Critical Issues
1. **Primary key is not UUID**
   - Current: `id INTEGER`
   - Required: `id UUID DEFAULT gen_random_uuid()`
   - Fix: Create migration to alter table

2. **Foreign keys are not UUID**
   - Current: `budget_type_id INTEGER`
   - Required: `budget_type_id UUID`
   - Fix: Migrate related tables first, then update FKs

3. **Amount field uses FLOAT**
   - Current: `allocated_amount FLOAT`
   - Required: `allocated_amount DECIMAL(15,2)`
   - Fix: Create migration to alter column type

## ❌ Ready to Generate?

**Status:** ❌ NOT READY

**Required Fixes:**

1. Create migration to fix primary key:
```sql
-- File: migrations/YYYYMMDDHHMMSS_fix_budget_allocations_pk.ts
ALTER TABLE public.budget_allocations
  DROP CONSTRAINT budget_allocations_pkey;

ALTER TABLE public.budget_allocations
  ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.budget_allocations
  ADD PRIMARY KEY (id);
````

2. Fix foreign keys:

```sql
-- Update FKs to UUID after related tables are fixed
ALTER TABLE public.budget_allocations
  ALTER COLUMN budget_type_id TYPE UUID;
```

3. Fix decimal precision:

```sql
ALTER TABLE public.budget_allocations
  ALTER COLUMN allocated_amount TYPE DECIMAL(15,2);
```

**Next Steps:**

1. Create and run migration to fix issues
2. Verify changes in database
3. Run validator again
4. Then generate CRUD

````

## Common Issues and Fixes

### Issue 1: Table doesn't exist
```bash
# Check if table exists
psql -U postgres -d aegisx_starter_1 -c "\dt inventory.*"

# If not, create migration first
pnpm run db:migrate:inventory
````

### Issue 2: Primary key is not UUID

```sql
-- Fix in migration
ALTER TABLE [schema].[table] ALTER COLUMN id TYPE UUID;
```

### Issue 3: Missing foreign keys

```sql
-- Add FK constraint
ALTER TABLE [schema].[table]
ADD CONSTRAINT fk_reference
FOREIGN KEY (reference_id) REFERENCES [other_schema].[other_table](id);
```

### Issue 4: Wrong schema

```sql
-- Move table to correct schema
ALTER TABLE public.[table] SET SCHEMA inventory;
```

### Issue 5: Migrations not run

```bash
# Run pending migrations
pnpm run db:migrate:inventory
```

## Integration with Domain Checker

This skill should be used **after** domain-checker:

1. Use `/domain-checker` to classify domain
2. Use `/pre-crud-validator` to verify readiness
3. Generate CRUD with recommended command
4. Test generated code

## Quick Commands

```bash
# Check database connection
psql -U postgres -d aegisx_starter_1 -c "SELECT version();"

# List all tables
psql -U postgres -d aegisx_starter_1 -c "\dt *.*"

# Show table structure
psql -U postgres -d aegisx_starter_1 -c "\d+ inventory.drug_catalogs"

# Check migration status
pnpm run db:status:inventory

# Build to verify no errors
pnpm run build
```
