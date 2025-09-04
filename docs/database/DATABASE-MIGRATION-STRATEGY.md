# Database Migration Strategy for Production

This document outlines the comprehensive strategy for managing database migrations in production environments for the AegisX platform.

## Overview

The AegisX platform uses Knex.js for database migrations with PostgreSQL as the primary database. This strategy ensures safe, reliable, and rollback-capable database deployments in production.

## Migration Architecture

### Current Setup

- **Database**: PostgreSQL 15+
- **Migration Tool**: Knex.js
- **Location**: `apps/api/src/database/migrations/`
- **Naming Convention**: `001_descriptive_name.ts`
- **Configuration**: `knexfile.ts`

### Migration Files Structure

```
apps/api/src/database/migrations/
├── 001_create_roles_and_permissions.ts
├── 002_create_users.ts
├── 003_create_sessions.ts
├── 004_extend_users_table.ts
├── 005_create_user_preferences.ts
├── 006_create_navigation_items.ts
├── 007_create_user_settings.ts
├── 008_enhance_user_sessions.ts
├── 009_create_notifications_and_audit.ts
├── 010_create_settings_table.ts
└── 011_add_admin_wildcard_permission.ts
```

## Production Migration Strategy

### 1. Pre-Migration Safety Checks

#### Environment Validation

```bash
# Verify production environment is loaded
./scripts/env-manager.sh validate production

# Check database connectivity
./scripts/db-migrate-production.sh verify
```

#### Migration Validation

- **Syntax Check**: TypeScript compilation validation
- **Naming Convention**: Ensure proper sequential naming
- **Rollback Support**: Verify all migrations have `down()` functions
- **Dependency Check**: Validate foreign key relationships

### 2. Migration Execution Process

#### Step-by-Step Process

1. **Backup Creation**

   ```bash
   # Create full backup before migration
   ./scripts/db-migrate-production.sh backup full
   ```

2. **Dry Run Validation**

   ```bash
   # Show what migrations will be applied
   ./scripts/db-migrate-production.sh migrate --dry-run
   ```

3. **Apply Migrations**

   ```bash
   # Apply all pending migrations
   ./scripts/db-migrate-production.sh migrate
   ```

4. **Integrity Verification**
   ```bash
   # Verify database integrity after migration
   ./scripts/db-migrate-production.sh verify
   ```

### 3. Rollback Strategy

#### Automatic Rollback Triggers

- Migration failure
- Integrity check failure
- Application startup failure post-migration

#### Manual Rollback Options

```bash
# Rollback last migration
./scripts/db-migrate-production.sh rollback 1

# Rollback multiple migrations
./scripts/db-migrate-production.sh rollback 3

# Restore from backup
./scripts/db-migrate-production.sh restore /path/to/backup.sql
```

## Migration Best Practices

### 1. Writing Migrations

#### DO:

- ✅ Always include both `up()` and `down()` functions
- ✅ Use transactions for complex operations
- ✅ Add proper indexes for performance
- ✅ Include data validation constraints
- ✅ Test migrations in staging first

#### DON'T:

- ❌ Never delete columns directly (mark as deprecated first)
- ❌ Avoid renaming columns in production (create new, migrate data, drop old)
- ❌ Don't include seed data in migrations
- ❌ Avoid complex data transformations in migrations

#### Example Migration Structure:

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    // Create table
    await trx.schema.createTable('example_table', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.timestamps(true, true);
    });

    // Add indexes
    await trx.schema.raw('CREATE INDEX CONCURRENTLY idx_example_name ON example_table(name)');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('example_table');
}
```

### 2. Zero-Downtime Migrations

#### Safe Operation Types:

- Adding new tables
- Adding new columns (nullable)
- Adding indexes (using CONCURRENTLY)
- Creating new constraints on new columns

#### Risky Operations (Require Careful Planning):

- Dropping columns
- Renaming columns/tables
- Adding NOT NULL constraints
- Changing column types

#### Multi-Step Migration Process:

For risky operations, break into multiple deployments:

**Step 1 - Preparation:**

```sql
-- Add new column
ALTER TABLE users ADD COLUMN new_email VARCHAR(255);
```

**Step 2 - Data Migration:**

```sql
-- Migrate data (can be done gradually)
UPDATE users SET new_email = email WHERE new_email IS NULL;
```

**Step 3 - Validation & Constraints:**

```sql
-- Add constraints after data migration
ALTER TABLE users ALTER COLUMN new_email SET NOT NULL;
CREATE UNIQUE INDEX CONCURRENTLY idx_users_new_email ON users(new_email);
```

**Step 4 - Cleanup:**

```sql
-- Drop old column (in separate deployment)
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN new_email TO email;
```

## Backup Strategy

### Backup Types

#### 1. Full Backup (Default)

```bash
./scripts/db-migrate-production.sh backup full
```

- Complete database dump
- Includes structure and data
- Used before major migrations

#### 2. Schema Backup

```bash
./scripts/db-migrate-production.sh backup schema
```

- Structure only
- Fast backup for structural changes
- Used for quick rollback verification

#### 3. Data Backup

```bash
./scripts/db-migrate-production.sh backup data
```

- Data only
- Used for data-only migrations
- Smaller file size

### Backup Retention Policy

- **Pre-migration backups**: Keep for 30 days
- **Daily automated backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months

### Backup Storage

```
/backups/database/
├── prod_backup_full_20250903_151230.sql
├── prod_backup_schema_20250903_151245.sql
└── prod_backup_data_20250903_151300.sql
```

## Monitoring and Alerts

### Migration Monitoring

- **Duration Tracking**: Monitor migration execution time
- **Error Alerting**: Immediate alerts on migration failures
- **Performance Impact**: Monitor database performance during migrations
- **Lock Monitoring**: Track long-running locks during migrations

### Health Checks Post-Migration

1. **Application Connectivity**: Ensure app can connect to database
2. **Query Performance**: Verify key queries still perform well
3. **Data Integrity**: Check critical business data consistency
4. **Index Usage**: Ensure new indexes are being used

## Emergency Procedures

### Migration Failure Response

1. **Immediate Actions**:
   - Stop application deployments
   - Assess impact scope
   - Check backup availability

2. **Recovery Options**:

   ```bash
   # Option 1: Automatic rollback (if supported)
   ./scripts/db-migrate-production.sh rollback 1

   # Option 2: Restore from backup
   ./scripts/db-migrate-production.sh restore backup_file.sql

   # Option 3: Manual fix (if minor issue)
   # Apply hotfix migration
   ```

3. **Post-Recovery**:
   - Verify application functionality
   - Update monitoring dashboards
   - Conduct post-mortem analysis

### Data Corruption Response

1. **Immediate Containment**:
   - Stop writes to affected tables
   - Prevent further data corruption
   - Assess corruption scope

2. **Recovery Actions**:
   - Restore from most recent clean backup
   - Replay transaction logs if available
   - Validate data integrity

## Integration with CI/CD

### Migration in Deployment Pipeline

```yaml
# .github/workflows/deploy-production.yml
- name: Database Migration
  run: |
    # Load production environment
    ./scripts/env-manager.sh switch production

    # Validate migrations
    ./scripts/db-migrate-production.sh validate

    # Create backup
    ./scripts/db-migrate-production.sh backup full

    # Apply migrations
    ./scripts/db-migrate-production.sh migrate

    # Verify integrity
    ./scripts/db-migrate-production.sh verify
```

### Migration Gates

- **Staging Validation**: Migrations must pass in staging
- **Performance Testing**: Migration duration must be acceptable
- **Rollback Testing**: Rollback procedures must be tested
- **Data Integrity**: All checks must pass

## Tools and Scripts

### Available Scripts

- `./scripts/db-migrate-production.sh` - Main migration management script
- `./scripts/env-manager.sh` - Environment management
- Database backup automation (in monitoring stack)

### Knex Commands (Development)

```bash
# Create new migration
npx knex migrate:make migration_name

# Check migration status
npx knex migrate:status

# Run migrations
npx knex migrate:latest

# Rollback migrations
npx knex migrate:rollback
```

## Performance Considerations

### Migration Performance

- **Index Creation**: Use `CONCURRENTLY` for production
- **Large Data Updates**: Process in batches
- **Connection Pooling**: Ensure adequate connection limits
- **Lock Management**: Minimize lock duration

### Monitoring During Migrations

- **Active Connections**: Monitor connection usage
- **Lock Waits**: Track blocking queries
- **CPU/Memory**: Monitor resource usage
- **Application Response**: Check app performance

## Security Considerations

### Access Control

- **Migration User**: Separate database user for migrations
- **Backup Access**: Restricted access to backup files
- **Log Security**: Secure migration logs
- **Environment Isolation**: Production credentials isolation

### Audit Trail

- **Migration Logs**: All migrations logged with timestamps
- **User Tracking**: Track who initiated migrations
- **Change Documentation**: Link migrations to tickets/PRs
- **Backup Verification**: Ensure backup integrity

## Testing Strategy

### Pre-Production Testing

1. **Unit Tests**: Test migration logic
2. **Integration Tests**: Test with real database
3. **Performance Tests**: Measure migration duration
4. **Rollback Tests**: Verify rollback procedures

### Staging Environment

- Mirror production structure
- Test full deployment pipeline
- Validate performance impact
- Test monitoring and alerts

## Documentation Requirements

### Migration Documentation

Each migration should include:

- **Purpose**: What the migration accomplishes
- **Dependencies**: Required previous migrations
- **Rollback Plan**: How to safely rollback
- **Performance Impact**: Expected duration and resource usage
- **Testing Notes**: How the migration was tested

### Change Log

- Migration number and description
- Deployment date and time
- Database version before/after
- Any issues encountered
- Performance metrics

---

## Quick Reference Commands

```bash
# Environment Setup
./scripts/env-manager.sh switch production
./scripts/env-manager.sh validate production

# Migration Management
./scripts/db-migrate-production.sh status
./scripts/db-migrate-production.sh migrate --dry-run
./scripts/db-migrate-production.sh migrate
./scripts/db-migrate-production.sh verify

# Backup Management
./scripts/db-migrate-production.sh backup full
./scripts/db-migrate-production.sh restore backup_file.sql

# Emergency Rollback
./scripts/db-migrate-production.sh rollback 1
```

This strategy ensures safe, reliable, and monitored database migrations in production while maintaining the ability to quickly rollback if issues arise.
