# Batch Tracking Migrations - Quick Reference

**Created**: 2025-12-13
**Status**: Ready to deploy
**Part of**: Fix #4 - Time-based Rollback

## Files Created

### 1. Main Schema Migration

```
apps/api/src/database/migrations/20251213100001_add_batch_tracking.ts
```

**What it does**:

- Adds `batch_id` column to `import_history` table
- Backfills existing records with `batch_id = job_id`
- Makes `batch_id` NOT NULL and UNIQUE

**Key lines**:

```typescript
table.string('batch_id', 100).nullable().unique().index();
await knex('import_history')
  .whereNull('batch_id')
  .update({
    batch_id: knex.raw('job_id::text'),
  });
table.string('batch_id', 100).notNullable().alter();
```

### 2. Inventory Schema Migration

```
apps/api/src/database/migrations-inventory/20251213100002_add_batch_to_departments.ts
```

**What it does**:

- Adds `import_batch_id` to `inventory.departments`
- Adds `import_batch_id` to `users`
- Both columns are nullable and indexed

**Key lines**:

```typescript
table.string('import_batch_id', 100).nullable().index();
```

### 3. Documentation

```
docs/features/system-initialization/BATCH_TRACKING_MIGRATION.md
docs/features/system-initialization/BATCH_TRACKING_QUICK_REFERENCE.md (this file)
```

## Column Specifications

### batch_id (import_history)

- **Type**: VARCHAR(100)
- **Nullable**: NO (after backfill)
- **Unique**: YES
- **Indexed**: YES
- **Purpose**: Track which batch this import job belongs to
- **Example**: `'550e8400-e29b-41d4-a716-446655440000'`

### import_batch_id (departments & users)

- **Type**: VARCHAR(100)
- **Nullable**: YES
- **Indexed**: YES (implicit via index definition)
- **Purpose**: Track which batch created this record
- **Example**: `'550e8400-e29b-41d4-a716-446655440000'` or NULL

## How It Works

### Before (Time-based Rollback - RISKY)

```typescript
// Delete all records created between job start and end times
await trx('departments').where('created_at', '>=', job.started_at).where('created_at', '<=', job.completed_at).delete();
// PROBLEM: Could delete records from OTHER concurrent imports!
```

### After (Batch-based Rollback - SAFE)

```typescript
// Delete only records from THIS batch
const job = await importHistory.findById(jobId);
await trx('departments')
  .where('import_batch_id', job.batch_id) // NEW
  .delete();
// SAFE: Only deletes records marked with this batch's ID
```

## SQL Examples

### Verify Migration

```sql
-- Check batch_id column exists
\d import_history
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'import_history'
AND column_name = 'batch_id';

-- Check unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'import_history'
AND constraint_name LIKE '%batch_id%';

-- Check indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('import_history', 'departments', 'users')
ORDER BY tablename;
```

### Query Examples

```sql
-- Find all imports in a batch
SELECT * FROM import_history WHERE batch_id = 'YOUR_BATCH_ID';

-- Find all departments from a batch
SELECT * FROM inventory.departments WHERE import_batch_id = 'YOUR_BATCH_ID';

-- Count records per batch
SELECT batch_id, COUNT(*) as record_count
FROM import_history
GROUP BY batch_id;

-- Find unused batch IDs
SELECT batch_id FROM import_history
WHERE rolled_back_at IS NOT NULL;

-- Rollback simulation
DELETE FROM inventory.departments WHERE import_batch_id = 'YOUR_BATCH_ID';
DELETE FROM users WHERE import_batch_id = 'YOUR_BATCH_ID';
```

## Migration Execution

### Run Migrations

```bash
# Run all pending migrations (executes both)
pnpm run db:migrate

# Check migration status
pnpm run db:status

# Rollback last migration
pnpm run db:rollback

# Rollback to specific version
pnpm run db:rollback --target=20251213073723
```

### Verify Success

```bash
# Check database schema
psql YOUR_DATABASE -c "\d import_history"

# Verify batch_id column
psql YOUR_DATABASE -c "
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'import_history'
  AND column_name IN ('batch_id', 'job_id');"

# Check data integrity
psql YOUR_DATABASE -c "
  SELECT batch_id, COUNT(*) as cnt
  FROM import_history
  WHERE batch_id IS NOT NULL
  GROUP BY batch_id;"
```

## Key Design Decisions

### 1. NOT NULL batch_id

**Why**: Every import must have a batch ID to enable rollback
**Backfill**: Existing records use job_id as batch_id
**Result**: No data loss, all records rollbackable

### 2. UNIQUE batch_id

**Why**: Prevents batch ID reuse, ensures 1:1 mapping
**Index**: Unique index for fast lookup
**Result**: O(1) job lookups, prevents bugs

### 3. NULLABLE import_batch_id

**Why**: Supports manual records (not from import)
**Flexibility**: Records can exist without import source
**Result**: Supports mixed manual and imported data

### 4. INDEX on import_batch_id

**Why**: Fast deletion during rollback
**Performance**: O(n) deletion instead of O(table size)
**Result**: Fast rollback even for large datasets

## Integration Points

### In BaseImportService

```typescript
// During import
const batchId = crypto.randomUUID();
await importHistoryRepository.update(jobId, { batch_id: batchId });

// During rollback
async rollback(jobId: string, context: ImportContext) {
  const job = await importHistoryRepository.findById(jobId);
  if (!job.batch_id) throw new Error('No batch ID');

  await trx('inventory.departments')
    .where('import_batch_id', job.batch_id)
    .delete();
}
```

### In Import Services

```typescript
// DepartmentsImportService
protected async performRollback(
  batchId: string,
  trx: Knex.Transaction
): Promise<number> {
  return trx('inventory.departments')
    .where('import_batch_id', batchId)
    .delete();
}

// UsersImportService
protected async performRollback(
  batchId: string,
  trx: Knex.Transaction
): Promise<number> {
  // Handle foreign key: delete user_departments first
  await trx('user_departments')
    .whereIn('user_id', function() {
      this.select('id').from('users')
        .where('import_batch_id', batchId);
    })
    .delete();

  return trx('users')
    .where('import_batch_id', batchId)
    .delete();
}
```

## Troubleshooting

### Migration fails with "column already exists"

**Cause**: Migration already run
**Solution**: Check migration status with `pnpm run db:status`

### Backfill hangs or slow

**Cause**: Large import_history table
**Solution**: Run backfill outside transaction, add WHERE clause

### Unique constraint violation on batch_id

**Cause**: Duplicate job_ids exist (shouldn't happen)
**Solution**: Investigate import_history data integrity

### Index bloats disk space

**Cause**: Three new indexes take space
**Solution**: Normal - minimal overhead for significant performance gain

## Deployment Checklist

- [ ] Test on development database
- [ ] Verify `pnpm run build` passes
- [ ] Run migrations: `pnpm run db:migrate`
- [ ] Verify columns exist: `\d import_history`
- [ ] Verify backfill completed: `SELECT COUNT(*) FROM import_history WHERE batch_id IS NULL`
- [ ] Test rollback: `pnpm run db:rollback`
- [ ] Re-run migrations: `pnpm run db:migrate`
- [ ] Deploy to staging
- [ ] Run integration tests
- [ ] Deploy to production
- [ ] Monitor error logs for issues

## Performance Impact

| Operation            | Before         | After        | Change     |
| -------------------- | -------------- | ------------ | ---------- |
| Lookup import        | O(1)           | O(1)         | None       |
| Lookup batch records | O(scan)        | O(1)         | Better     |
| Rollback             | O(time window) | O(n) records | Better     |
| Storage              | -              | +1 index     | Minimal    |
| Insert overhead      | None           | +1 column    | Negligible |

## Related Fixes

- **Fix #1**: Authentication Context (provides user tracking for rollback)
- **Fix #3**: In-Memory Storage (persists sessions to database)
- **Fix #4**: Time-based Rollback (THIS FIX - batch tracking)

## References

- [Full Documentation](./BATCH_TRACKING_MIGRATION.md)
- [Specification](./FIXES_SPECIFICATION.md#fix-4-time-based-rollback-high-priority)
- [Knex.js Schema API](https://knexjs.org/guide/schema-builder.html)
