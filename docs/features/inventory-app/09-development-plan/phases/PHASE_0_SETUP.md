# Phase 0: Environment Setup

**Status**: COMPLETED
**Priority**: CRITICAL - Must complete before any development

---

## Objectives

1. Create PostgreSQL schema `inventory` (separate from `public`)
2. Setup temporary database for backup import
3. Configure Knex for separate migration folder
4. Verify schema isolation works correctly

---

## Tasks

### 0.1 Create PostgreSQL Schema

```sql
-- Run in aegisx_db
CREATE SCHEMA IF NOT EXISTS inventory;

-- Grant permissions
GRANT ALL ON SCHEMA inventory TO postgres;
GRANT USAGE ON SCHEMA inventory TO postgres;
```

**Checklist**:

- [ ] Connect to aegisx_db (port from .env.local)
- [ ] Execute CREATE SCHEMA
- [ ] Verify schema exists: `\dn` in psql

---

### 0.2 Setup Temp Database for Backup Import

```bash
# Create temp database
createdb -p 5482 inventory_temp

# Import backup
gunzip -c docs/features/inventory-app/invs_modern_full.sql.gz | psql -p 5482 inventory_temp
```

**Checklist**:

- [ ] Create inventory_temp database
- [ ] Import SQL backup
- [ ] Verify tables exist: `\dt` in psql
- [ ] Count records in key tables

---

### 0.3 Configure Knex for Inventory Migrations

**File**: `apps/api/knexfile-inventory.ts`

```typescript
import type { Knex } from 'knex';
import { config } from 'dotenv';

config({ path: '.env.local' });

const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  migrations: {
    directory: './src/database/migrations-inventory',
    tableName: 'knex_migrations_inventory',
    schemaName: 'inventory',
  },
  seeds: {
    directory: './src/database/seeds-inventory',
  },
};

export default knexConfig;
```

**Folder Structure**:

```
apps/api/src/database/
├── migrations/              # System migrations (existing)
├── migrations-inventory/    # Inventory migrations (NEW)
├── seeds/                   # System seeds (existing)
└── seeds-inventory/         # Inventory seeds (NEW)
```

**Package.json Scripts**:

```json
{
  "db:migrate:inventory": "knex migrate:latest --knexfile apps/api/knexfile-inventory.ts",
  "db:migrate:inventory:rollback": "knex migrate:rollback --knexfile apps/api/knexfile-inventory.ts",
  "db:seed:inventory": "knex seed:run --knexfile apps/api/knexfile-inventory.ts"
}
```

**Checklist**:

- [ ] Create `knexfile-inventory.ts`
- [ ] Create `migrations-inventory/` folder
- [ ] Create `seeds-inventory/` folder
- [ ] Add npm scripts to package.json
- [ ] Test: `pnpm run db:migrate:inventory` (should run with no migrations)

---

### 0.4 Test Schema Isolation

**Verification Query**:

```sql
-- Should show inventory schema tables (after migrations)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'inventory';

-- Should show public schema tables (system)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Checklist**:

- [ ] Run test migration in inventory schema
- [ ] Verify table created in `inventory` schema
- [ ] Verify `public` schema not affected
- [ ] Test cross-schema query (inventory.\* can reference public.users)

---

## Dependencies

| Dependency         | Status   | Notes                     |
| ------------------ | -------- | ------------------------- |
| PostgreSQL running | Required | Check .env.local for port |
| aegisx_db exists   | Required | From pnpm run setup       |
| Knex installed     | Required | Already in project        |

---

## Completion Criteria

- [ ] Schema `inventory` exists in aegisx_db
- [ ] Temp database `inventory_temp` has imported data
- [ ] Knex can run migrations to `inventory` schema
- [ ] npm scripts work correctly
- [ ] Schema isolation verified

---

## Next Phase

After completing Phase 0, proceed to [Phase 1: Database Migrations](./PHASE_1_DATABASE.md)

---

_Created: 2024-12-05_
