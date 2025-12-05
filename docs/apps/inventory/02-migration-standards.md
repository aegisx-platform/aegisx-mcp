# Migration Standards

> **Enterprise-grade migration patterns for multi-site deployments**

This document defines the standard patterns for database migrations in the AegisX platform. These patterns are designed for 100+ customer site deployments with 10+ year maintainability.

## Core Principles

### 1. Schema Isolation per Module

Each major module uses its own PostgreSQL schema:

```
Database: aegisx_db
├── public schema           <- Core platform
├── inventory schema        <- Drug inventory module
├── lab schema             <- Laboratory module (future)
└── radiology schema       <- Radiology module (future)
```

**Benefits:**

- Independent deployment and upgrades
- No table name conflicts
- Easy backup/restore per module
- Clear ownership boundaries

### 2. Separate Migration Tracking

Each schema has its own migration table:

```
public schema:
  knex_migrations           <- Core platform migrations

inventory schema:
  knex_migrations_inventory <- Inventory module migrations
```

This allows modules to be versioned and upgraded independently.

## Directory Structure

```
apps/api/src/database/
├── migrations/                 # Core platform migrations
│   ├── 001_create_roles.ts
│   └── 002_create_users.ts
├── migrations-inventory/       # Inventory module migrations
│   ├── 20251205000001_create_inventory_schema.ts
│   ├── 20251205000002_create_enums.ts
│   └── ...
├── seeds/                      # Core platform seeds
└── seeds-inventory/            # Inventory module seeds
    └── 001_reference_data.ts
```

## Knexfile Configuration

### Core Platform (knexfile.ts)

```typescript
import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local', override: true });
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'aegisx_db',
      user: process.env.DATABASE_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './apps/api/src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds',
      extension: 'ts',
    },
  },
  // production config...
};

export default config;
```

### Module-Specific (knexfile-inventory.ts)

```typescript
import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local', override: true });
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      // Same connection as core
    },
    migrations: {
      directory: './apps/api/src/database/migrations-inventory',
      tableName: 'knex_migrations_inventory', // Separate tracking table
      schemaName: 'inventory', // Schema for migration table
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds-inventory',
      extension: 'ts',
    },
  },
};

export default config;
```

## Migration Naming Convention

### Format

```
YYYYMMDDHHMMSS_description.ts
```

### Examples

```
20251205000001_create_inventory_schema.ts    # Schema creation
20251205000002_create_enums.ts               # Enum types
20251205000010_create_dosage_forms.ts        # Table creation
20251205000036_create_views.ts               # Views
20251205000037_create_seed_metadata.ts       # Metadata tables
```

### Numbering Strategy

| Range         | Purpose                |
| ------------- | ---------------------- |
| 000001-000009 | Schema & enum creation |
| 000010-000099 | Core entity tables     |
| 000100-000199 | Transaction tables     |
| 000200-000299 | Views                  |
| 000300-000399 | Functions & triggers   |
| 000400-000499 | Indexes (if separate)  |
| 000500+       | Future additions       |

## Migration File Template

```typescript
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Set search path for this migration
  await knex.raw(`SET search_path TO inventory, public`);

  // Create table with all constraints
  await knex.schema.withSchema('inventory').createTable('table_name', (table) => {
    // Primary key
    table.increments('id').primary();

    // Required fields
    table.string('code', 10).notNullable().unique();
    table.string('name', 100).notNullable();

    // Optional fields
    table.text('description');

    // Status field
    table.boolean('is_active').defaultTo(true);

    // Audit timestamps
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    // Foreign keys
    table.integer('related_id').references('id').inTable('inventory.related_table');

    // Indexes
    table.index(['code']);
    table.index(['is_active']);
  });

  // Create update trigger
  await knex.raw(`
    CREATE TRIGGER trg_table_name_updated_at
    BEFORE UPDATE ON inventory.table_name
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_updated_at()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('inventory').dropTableIfExists('table_name');
}
```

## Best Practices

### 1. Always Use Schema Prefix

```typescript
// Good - explicit schema
await knex.schema.withSchema('inventory').createTable('drugs', ...);
await knex.raw(`SELECT * FROM inventory.drugs`);

// Bad - relies on search_path
await knex.schema.createTable('drugs', ...);  // Goes to public!
```

### 2. Idempotent Migrations

```typescript
// Good - checks before creating
await knex.raw(`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'my_enum') THEN
      CREATE TYPE inventory.my_enum AS ENUM ('A', 'B', 'C');
    END IF;
  END $$;
`);

// Bad - fails if already exists
await knex.raw(`CREATE TYPE inventory.my_enum AS ENUM ('A', 'B', 'C')`);
```

### 3. Separate Concerns by Migration

```
20251205000001_create_inventory_schema.ts   # Just schema
20251205000002_create_enums.ts              # Just enums
20251205000010_create_dosage_forms.ts       # Just one table
20251205000011_create_drug_units.ts         # Just one table
```

Don't combine multiple unrelated changes in one migration.

### 4. Add Triggers via Raw SQL

```typescript
// Tables first
await knex.schema.withSchema('inventory').createTable('drugs', ...);

// Then triggers
await knex.raw(`
  CREATE TRIGGER trg_drugs_updated_at
  BEFORE UPDATE ON inventory.drugs
  FOR EACH ROW
  EXECUTE FUNCTION inventory.update_updated_at()
`);
```

### 5. Document Enum Values

```typescript
// Good - enum with comments
await knex.raw(`
  -- Budget classification types
  -- OPERATIONAL: งบดำเนินการ (operating expenses)
  -- INVESTMENT: งบลงทุน (capital expenses)
  -- EMERGENCY: งบฉุกเฉิน (emergency funds)
  -- RESEARCH: งบวิจัย (research funds)
  CREATE TYPE inventory.budget_class AS ENUM (
    'OPERATIONAL',
    'INVESTMENT',
    'EMERGENCY',
    'RESEARCH'
  );
`);
```

## Package.json Scripts

```json
{
  "scripts": {
    // Core platform
    "db:migrate": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:latest",
    "db:rollback": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:rollback",
    "db:status": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:status",
    "db:seed": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js seed:run",

    // Inventory module
    "db:migrate:inventory": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:latest --knexfile knexfile-inventory.ts",
    "db:migrate:inventory:rollback": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:rollback --knexfile knexfile-inventory.ts",
    "db:migrate:inventory:status": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:status --knexfile knexfile-inventory.ts",
    "db:seed:inventory": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js seed:run --knexfile knexfile-inventory.ts",

    // Combined setup
    "inventory:setup": "pnpm run db:migrate:inventory && pnpm run db:seed:inventory"
  }
}
```

## Multi-Site Deployment Flow

### Initial Installation (New Site)

```bash
# 1. Setup core platform
pnpm run db:migrate
pnpm run db:seed

# 2. Setup inventory module
pnpm run inventory:setup

# 3. Import TMT data (when available)
pnpm run inventory:import-tmt -- --path=/path/to/tmt
```

### Upgrades (Existing Site)

```bash
# 1. Upgrade core platform
pnpm run db:migrate  # Only runs pending

# 2. Upgrade inventory module
pnpm run db:migrate:inventory  # Only runs pending
pnpm run db:seed:inventory     # Upserts, preserves custom data
```

### Rollback (If Needed)

```bash
# Rollback inventory (one batch)
pnpm run db:migrate:inventory:rollback

# Check status after rollback
pnpm run db:migrate:inventory:status
```

## Adding New Modules

When adding a new module (e.g., Laboratory):

### 1. Create Knexfile

```typescript
// knexfile-lab.ts
const config = {
  development: {
    client: 'postgresql',
    connection: {
      /* same as others */
    },
    migrations: {
      directory: './apps/api/src/database/migrations-lab',
      tableName: 'knex_migrations_lab',
      schemaName: 'lab',
      extension: 'ts',
    },
    seeds: {
      directory: './apps/api/src/database/seeds-lab',
      extension: 'ts',
    },
  },
};
```

### 2. Create First Migration

```typescript
// migrations-lab/20251206000001_create_lab_schema.ts
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS lab`);
  await knex.raw(`SET search_path TO lab, public`);

  // Create update_updated_at function for this schema
  await knex.raw(`
    CREATE OR REPLACE FUNCTION lab.update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}
```

### 3. Add Package Scripts

```json
{
  "scripts": {
    "db:migrate:lab": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js migrate:latest --knexfile knexfile-lab.ts",
    "db:seed:lab": "node --loader ts-node/esm ./node_modules/knex/bin/cli.js seed:run --knexfile knexfile-lab.ts",
    "lab:setup": "pnpm run db:migrate:lab && pnpm run db:seed:lab"
  }
}
```

## Troubleshooting

### Migration Failed Mid-Way

```bash
# Check status
pnpm run db:migrate:inventory:status

# If stuck, manually fix the database then:
# Mark migration as completed
docker exec -it postgres psql -U postgres -d aegisx_db -c "
  INSERT INTO inventory.knex_migrations_inventory (name, batch, migration_time)
  VALUES ('20251205000015_create_drug_focus_lists.ts', 1, NOW())
"
```

### Wrong Schema

If tables were created in wrong schema:

```sql
-- Move table to correct schema
ALTER TABLE public.drugs SET SCHEMA inventory;
```

### Rollback All

```bash
# Rollback all batches (careful!)
while pnpm run db:migrate:inventory:rollback; do :; done
```
