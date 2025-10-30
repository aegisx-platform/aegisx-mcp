# Database Migrations

This directory contains all database migrations for the AegisX platform.

## Migration Structure

### Sequential Migrations (001-020)

These migrations use simple sequential numbering for core database tables.

**Core Tables (001-015):**
- `001_create_roles_and_permissions.ts` - RBAC foundation
- `002_create_users.ts` - User management
- `003_create_sessions.ts` - Authentication sessions
- `004_extend_users_table.ts` - Additional user fields
- `005_create_user_preferences.ts` - User preferences
- `006_create_navigation_items.ts` - Dynamic navigation
- `007_create_user_settings.ts` - User settings
- `008_enhance_user_sessions.ts` - Session enhancements
- `010_create_settings_table.ts` - Application settings
- `011_add_admin_wildcard_permission.ts` - Admin permissions
- `012_add_settings_performance_indexes.ts` - Performance optimization
- `013_create_user_activity_logs.ts` - Activity tracking
- `014_add_user_roles_table.ts` - User-role relationships
- `015_add_user_deletion_fields.ts` - Soft delete support

**File System Tables (018-020):**
- `018_create_uploaded_files_table.ts` - File upload system
- `019_create_file_access_logs_table.ts` - File access auditing
- `020_create_api_keys_table.ts` - API key management

### Timestamped Migrations (YYYYMMDDHHMMSS_)

These migrations use timestamp prefixes for feature-specific updates.

**RBAC Fixes:**
- `20250915173427_fix_user_roles_table_structure.ts`

**PDF Templates System:**
- `20251008080000_create_pdf_templates_table.ts`
- `20251012090000_add_template_starter_field.ts`
- `20251013010000_add_logo_to_pdf_templates.ts`
- `20251013030000_change_template_data_to_text.ts`
- `20251014093000_add_asset_file_ids_to_pdf_templates.ts`

**File Upload Enhancements (HIS-ready):**
- `20251028135000_make_uploaded_by_nullable.ts`
- `20251028140000_add_encryption_fields_to_uploaded_files.ts`
- `20251028140100_add_his_fields_to_uploaded_files.ts`
- `20251028140200_create_file_audit_logs_table.ts`
- `20251028140300_create_file_access_control_table.ts`
- `20251028150000_create_attachments_table.ts`

## Migration Naming Convention

### For Core Tables (Sequential)
Use simple sequential numbering:
```
NNN_descriptive_name.ts
```
Example: `018_create_uploaded_files_table.ts`

### For Feature Updates (Timestamped)
Use timestamp prefix:
```
YYYYMMDDHHMMSS_descriptive_name.ts
```
Example: `20251028140000_add_encryption_fields_to_uploaded_files.ts`

## Important Notes

### Migration Ordering
- Knex sorts migrations alphanumerically
- Sequential migrations (001-020) run first
- Timestamped migrations run in chronological order
- **Gaps in sequential numbering are intentional and safe** (e.g., 009, 016-017 missing)

### Duplicate Prefixes
**NEVER create migrations with duplicate prefixes!**

❌ Wrong:
```
015_add_user_deletion_fields.ts
015_create_uploaded_files_table.ts  // DUPLICATE!
```

✅ Correct:
```
015_add_user_deletion_fields.ts
018_create_uploaded_files_table.ts  // Next available number
```

### When Creating New Migrations

**For Core Tables:**
1. Find the highest sequential number (currently 020)
2. Use next available number (021, 022, etc.)
3. Use descriptive name: `{number}_create_{table_name}_table.ts`

**For Feature Updates:**
1. Use timestamp: `YYYYMMDDHHMMSS_descriptive_name.ts`
2. Generate with: `pnpm run knex migrate:make descriptive_name`
3. This auto-generates timestamp prefix

## Running Migrations

```bash
# Run all pending migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:rollback

# Check migration status
pnpm run knex migrate:status
```

## Migration Best Practices

### 1. Always Include Both up() and down()
```typescript
export async function up(knex: Knex): Promise<void> {
  // Create/modify schema
}

export async function down(knex: Knex): Promise<void> {
  // Revert changes
}
```

### 2. Use Transactions for Data Migrations
```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // Multiple operations
  });
}
```

### 3. Add Indexes for Foreign Keys
```typescript
table.uuid('user_id').notNullable();
table.foreign('user_id').references('users.id').onDelete('CASCADE');
table.index('user_id'); // Important for performance!
```

### 4. Include Timestamps
```typescript
table.timestamp('created_at').defaultTo(knex.fn.now());
table.timestamp('updated_at').defaultTo(knex.fn.now());
```

### 5. Use Descriptive Comments
```typescript
/**
 * Migration: Create PDF Templates Table
 * Purpose: Store dynamic PDF templates with asset management
 * Dependencies: uploaded_files table must exist
 */
```

## CRUD Generator Integration

When using the CRUD generator with `--package` flag, migrations are automatically created:

```bash
pnpm aegisx-crud patients --package --with-import --with-events
```

This generates:
- Table creation migration (timestamped)
- Permissions insertion migration (timestamped)
- Both placed in this migrations directory

## Troubleshooting

### Migration Lock Issues
```bash
# If migration gets stuck
pnpm run knex migrate:unlock
```

### Migration Failed Mid-Run
```bash
# Rollback and fix the migration file
pnpm run db:rollback

# Edit the migration file
# Then run again
pnpm run db:migrate
```

### Check Current Migration State
```bash
# See which migrations have run
pnpm run knex migrate:list
```

## Clean Slate Setup

For a fresh database setup:

```bash
# Complete setup (recommended)
pnpm run setup

# Or manual steps:
pnpm run docker:up      # Start containers
pnpm run db:migrate     # Run migrations
pnpm run db:seed        # Seed test data
```

## Session 50 Cleanup Summary

**What Was Fixed (2025-10-31):**
- ✅ Fixed duplicate prefix 015 (2 files)
- ✅ Renamed 3 migrations to proper sequential order
- ✅ Deleted 2 old comprehensiveTests migrations
- ✅ Total: 29 migrations, all properly ordered

**Migration Count by Module:**
- RBAC: 4 migrations
- Users: 6 migrations
- Sessions: 2 migrations
- Settings: 3 migrations
- Navigation: 1 migration
- File Upload: 7 migrations
- PDF Templates: 5 migrations
- API Keys: 1 migration

---

**Total Migrations:** 29
**Last Cleanup:** 2025-10-31 (Session 50)
**Status:** ✅ Clean and organized
