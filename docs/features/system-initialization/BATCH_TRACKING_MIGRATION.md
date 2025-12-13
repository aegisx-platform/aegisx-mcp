# Database Migration: Batch Tracking for Time-based Rollback (Fix #4)

**Date**: 2025-12-13
**Status**: Completed
**Component**: Import System - Time-based Rollback
**Related Fix**: [Fix #4: Time-based Rollback](./FIXES_SPECIFICATION.md#fix-4-time-based-rollback-high-priority)

## Overview

Two database migrations were created to implement batch ID tracking for precise import rollback functionality. These migrations enable the import system to rollback imported records by unique batch ID instead of relying on imprecise time windows.

## Problem Solved

The previous implementation used a time window approach to rollback records:

```typescript
// OLD - RISKY: Time-based rollback
await trx(this.tableName).where('created_at', '>=', job.started_at).where('created_at', '<=', job.completed_at).delete();
```

This approach has critical issues:

- **Imprecision**: Records created around the same time from other imports could be accidentally deleted
- **Clock Skew**: Server clock differences could cause missed or extra records
- **Concurrency**: Multiple simultaneous imports could interfere with each other

## Solution Architecture

The solution uses a unique batch ID to precisely track all records created by a specific import job:

```
┌─────────────────────────────────────────────────┐
│ Import Job                                      │
│ job_id: uuid                                    │
│ batch_id: string (100)   ← NEW                 │
│ status: 'completed'                             │
└─────────────────────────────────────────────────┘
         │
         │ references via batch_id
         ├─────────────────────────────────────────┐
         │                                         │
    ┌────▼─────────────────┐  ┌──────────────────┐▼──┐
    │ departments table    │  │ users table      │   │
    │ import_batch_id: str │  │ import_batch_id: │   │
    ├─────────────────────┤  ├──────────────────┤   │
    │ id: 1               │  │ id: uuid-1       │   │
    │ import_batch_id: X  │  │ import_batch_id: X   │
    │ dept_name: ...      │  │ email: ...       │   │
    │                     │  │                  │   │
    │ id: 2               │  │ id: uuid-2       │   │
    │ import_batch_id: X  │  │ import_batch_id: X   │
    │ dept_name: ...      │  │ email: ...       │   │
    └─────────────────────┘  └──────────────────┘   │
                                                     │
    Rollback: DELETE WHERE import_batch_id = 'X'◄───┘
```

## Migrations Created

### 1. Migration: `20251213100001_add_batch_tracking.ts`

**Location**: `apps/api/src/database/migrations/20251213100001_add_batch_tracking.ts`

**Purpose**: Add batch ID tracking to the import_history table

**Changes**:

1. **Add `batch_id` column** (string, 100 chars, unique, indexed)
   - Stores unique identifier linking imported records to this job
   - Enables precise rollback queries
   - Unique constraint prevents batch ID reuse

2. **Data Migration**
   - Backfills existing records: `batch_id = job_id::text`
   - Ensures historical imports can still be rolled back

3. **Make `batch_id` NOT NULL**
   - After backfill, enforces all records have a batch ID

**Indexes Created**:

- Primary: `idx_batch_id` (unique)
- Supporting: Index on `batch_id` for rollback queries

**Rollback Support**:

- Properly drops unique constraint before column
- Safe reversal to original state

```typescript
// Up: Add batch_id column to track import jobs
table.string('batch_id', 100).nullable().unique().index();

// Backfill existing records
await knex('import_history')
  .whereNull('batch_id')
  .update({
    batch_id: knex.raw('job_id::text'),
  });

// Make NOT NULL
table.string('batch_id', 100).notNullable().alter();

// Down: Remove batch_id
table.dropUnique(['batch_id']);
table.dropIndex(['batch_id']);
table.dropColumn('batch_id');
```

### 2. Migration: `20251213100002_add_batch_to_departments.ts`

**Location**: `apps/api/src/database/migrations-inventory/20251213100002_add_batch_to_departments.ts`

**Purpose**: Add batch ID tracking to tables that receive imported data

**Changes**:

1. **Add `import_batch_id` to `inventory.departments`** (nullable, indexed)
   - Tracks which import batch created each department record
   - Enables precise rollback of department imports

2. **Add `import_batch_id` to `users`** (nullable, indexed)
   - Tracks which import batch created each user record
   - Enables precise rollback of user imports

**Column Specifications**:

- Type: String (100 chars, matching import_history.batch_id)
- Nullable: Yes (supports manually created records)
- Indexed: Yes (for rollback queries)
- Comments: Descriptive text for documentation

**Indexes Created**:

- `idx_departments_import_batch` on `inventory.departments(import_batch_id)`
- `idx_users_import_batch` on `users(import_batch_id)`

**Rationale for Nullable**:

- Manually created records (non-import) have NULL batch_id
- Historical records before batch tracking have NULL batch_id
- Records can only be rolled back if they have a batch_id value

```typescript
// Add to departments
table.string('import_batch_id', 100).nullable().index();

// Add to users
table.string('import_batch_id', 100).nullable().index();

// Down: Remove from both tables
table.dropIndex(['import_batch_id']);
table.dropColumn('import_batch_id');
```

## Database Schema Changes

### import_history Table

**Before**:

```sql
CREATE TABLE import_history (
  id SERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  -- ... other columns ...
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**After**:

```sql
CREATE TABLE import_history (
  id SERIAL PRIMARY KEY,
  job_id UUID UNIQUE NOT NULL,
  batch_id VARCHAR(100) UNIQUE NOT NULL,  ← NEW
  module_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  -- ... other columns ...
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_batch_id ON import_history(batch_id);
```

### inventory.departments Table

**Before**:

```sql
CREATE TABLE inventory.departments (
  id SERIAL PRIMARY KEY,
  dept_code VARCHAR(10) UNIQUE NOT NULL,
  dept_name VARCHAR(100) NOT NULL,
  -- ... other columns ...
);
```

**After**:

```sql
CREATE TABLE inventory.departments (
  id SERIAL PRIMARY KEY,
  dept_code VARCHAR(10) UNIQUE NOT NULL,
  dept_name VARCHAR(100) NOT NULL,
  import_batch_id VARCHAR(100),  ← NEW
  -- ... other columns ...
);

CREATE INDEX idx_departments_import_batch ON inventory.departments(import_batch_id);
```

### users Table

**Before**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  -- ... other columns ...
);
```

**After**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  import_batch_id VARCHAR(100),  ← NEW
  -- ... other columns ...
);

CREATE INDEX idx_users_import_batch ON users(import_batch_id);
```

## Implementation Flow

### 1. During Import

```typescript
async importData(sessionId: string, options: ImportOptions, context: ImportContext) {
  const jobId = crypto.randomUUID();
  const batchId = crypto.randomUUID();  // Generate unique batch ID

  // Store in import_history
  await importHistoryRepository.create({
    job_id: jobId,
    batch_id: batchId,  // Track the batch ID
    status: 'processing',
    // ... other fields ...
  });

  // Import data with batch tracking
  const batchWithId = rows.map(record => ({
    ...record,
    import_batch_id: batchId  // Add batch ID to each record
  }));

  await insertBatch(batchWithId);
}
```

### 2. During Rollback

```typescript
async rollback(jobId: string, context: ImportContext) {
  const job = await importHistoryRepository.findById(jobId);

  if (!job.batch_id) {
    throw new Error('Import job does not have batch ID. Cannot rollback safely.');
  }

  // Precise rollback by batch ID
  await trx('inventory.departments')
    .where({ import_batch_id: job.batch_id })
    .delete();

  // Mark as rolled back
  await importHistoryRepository.update(jobId, {
    status: 'rolled_back',
    rolled_back_at: new Date(),
    rolled_back_by: context.userId
  });
}
```

## Migration Execution

### Prerequisites

- PostgreSQL database must be accessible
- Existing `import_history` table must exist
- Both `inventory.departments` and `users` tables must exist

### Execution Order

1. Run main migration (creates main schema):

   ```bash
   pnpm run db:migrate
   ```

   This runs: `20251213100001_add_batch_tracking.ts`

2. Run inventory schema migrations:
   ```bash
   pnpm run db:migrate --schema inventory
   ```
   This runs: `20251213100002_add_batch_to_departments.ts`

### Rollback Procedure

If you need to rollback these migrations:

```bash
# Rollback one step
pnpm run db:rollback

# Verify schema is restored
pnpm run db:list
```

The down() functions in both migrations will:

1. Drop the unique constraints
2. Drop the indexes
3. Drop the columns

## Performance Considerations

### Indexes

Three new indexes improve rollback performance:

1. **import_history.batch_id (UNIQUE)**
   - Enables fast lookup of all records for a batch
   - Supports: `WHERE batch_id = 'X'`
   - Size: Small (100-char string)

2. **inventory.departments.import_batch_id**
   - Enables fast deletion: `DELETE FROM departments WHERE import_batch_id = 'X'`
   - Used during rollback operations
   - Selective: Only indexes non-NULL values

3. **users.import_batch_id**
   - Enables fast deletion: `DELETE FROM users WHERE import_batch_id = 'X'`
   - Used during user rollback operations
   - Selective: Only indexes non-NULL values

### Query Plans

**Rollback Query**:

```sql
DELETE FROM inventory.departments
WHERE import_batch_id = 'batch-uuid';

-- Uses index: idx_departments_import_batch
-- Expected: Index Scan -> Delete
-- Performance: O(n) where n = records in batch
```

**Import Job Lookup**:

```sql
SELECT * FROM import_history
WHERE batch_id = 'batch-uuid';

-- Uses index: unique constraint on batch_id
-- Expected: Unique Index Scan
-- Performance: O(1)
```

## Data Consistency

### Constraint Enforcement

- **import_history.batch_id**: UNIQUE constraint ensures no batch ID reuse
- **import_batch_id columns**: No foreign key (allows flexibility for future changes)
- **Nullable**: Allows manual records without batch association

### Backfill Strategy

Existing import records are backfilled with `batch_id = job_id::text`:

- Preserves historical audit trail
- Enables rollback of existing imports
- Ensures data migration is complete before NOT NULL constraint

### Multi-Module Support

Design supports current and future import modules:

- **Current**: departments, users
- **Future**: Any table receiving imports just needs `import_batch_id` column

## Testing Recommendations

### 1. Unit Tests

```typescript
describe('Batch Tracking Migration', () => {
  it('should backfill batch_id for existing records', async () => {
    const records = await knex('import_history');
    records.forEach((record) => {
      expect(record.batch_id).toBeDefined();
      expect(record.batch_id).toBeTruthy();
    });
  });

  it('should enforce unique batch_id', async () => {
    // Should fail if inserting duplicate batch_id
    expect(() => {
      knex('import_history').insert({
        batch_id: 'duplicate-id',
        // ... other required fields
      });
    }).rejects.toThrow('duplicate key');
  });
});
```

### 2. Integration Tests

```typescript
describe('Rollback with Batch ID', () => {
  it('should delete only records with matching batch_id', async () => {
    // Create two imports
    const batch1 = 'batch-1';
    const batch2 = 'batch-2';

    // Import departments
    await knex('inventory.departments').insert([
      { dept_code: 'D1', import_batch_id: batch1 },
      { dept_code: 'D2', import_batch_id: batch2 },
    ]);

    // Rollback batch 1
    await knex('inventory.departments').where({ import_batch_id: batch1 }).delete();

    // Verify only batch 1 deleted
    const remaining = await knex('inventory.departments');
    expect(remaining.length).toBe(1);
    expect(remaining[0].import_batch_id).toBe(batch2);
  });
});
```

### 3. Manual Testing

```sql
-- Verify batch_id column exists and is NOT NULL
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'import_history'
AND column_name = 'batch_id';

-- Verify unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'import_history'
AND constraint_name LIKE '%batch_id%';

-- Verify indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('import_history', 'departments', 'users')
AND indexname LIKE '%batch%';

-- Verify data integrity
SELECT COUNT(DISTINCT batch_id) FROM import_history
WHERE batch_id IS NOT NULL;
```

## Deployment Checklist

- [ ] Review migration files for correctness
- [ ] Test migrations on development database
- [ ] Verify backfill completes successfully
- [ ] Check no TypeScript errors: `pnpm run build`
- [ ] Run test suite: `pnpm run test`
- [ ] Review query performance: `EXPLAIN ANALYZE`
- [ ] Prepare rollback procedure documentation
- [ ] Schedule maintenance window if needed
- [ ] Execute migrations on staging
- [ ] Execute migrations on production
- [ ] Verify data integrity post-migration
- [ ] Update API documentation
- [ ] Update BaseImportService to use batch_id

## Related Files

### Application Code Changes (Separate PR)

These migrations enable the following code changes:

1. **BaseImportService** (`apps/api/src/core/import/base/base-import.service.ts`)
   - Update `processImport()` to generate and track batch ID
   - Update `rollback()` to use batch ID instead of time window

2. **Import Services** (departments, users)
   - Implement `performRollback()` method
   - Use batch ID in rollback queries

3. **Types** (`apps/api/src/core/import/types/import-service.types.ts`)
   - Update `ImportHistory` interface
   - Add `batch_id` field
   - Update status enum to include `'rolled_back'`

4. **Tests**
   - Add unit tests for batch tracking
   - Add integration tests for rollback by batch ID

## References

- [Fix #4: Time-based Rollback Specification](./FIXES_SPECIFICATION.md#fix-4-time-based-rollback-high-priority)
- [Domain Architecture Guide](../architecture/DOMAIN_ARCHITECTURE_GUIDE.md)
- [Knex Migration Documentation](https://knexjs.org/guide/migrations.html)

## Notes

- Batch ID format: UUID (stored as VARCHAR for flexibility)
- Migration is reversible (down() function implemented)
- No data loss on rollback
- Supports concurrent imports
- Future-proof for additional modules
