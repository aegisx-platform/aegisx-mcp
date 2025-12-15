# AegisX CLI Complete Workflow Guide

> **Complete guide from database table to production-ready feature**

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Workflow Diagram](#workflow-diagram)
4. [Step 1: Database Setup](#step-1-database-setup)
5. [Step 2: Backend Generation](#step-2-backend-generation)
6. [Step 3: Frontend Generation](#step-3-frontend-generation)
7. [Step 4: Navigation & Routes](#step-4-navigation--routes)
8. [Advanced: Domain/Schema Workflow](#advanced-domainschema-workflow)
9. [Quick Reference](#quick-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The AegisX CLI generates complete CRUD features from database tables:

```
Database Table → Backend API → Frontend UI → Navigation
```

**What gets generated:**

| Layer    | Components                                              |
| -------- | ------------------------------------------------------- |
| Backend  | Controller, Service, Repository, Routes, Schemas, Types |
| Frontend | List, Create Dialog, Edit Dialog, View Dialog, Service  |

---

## Prerequisites

```bash
# 1. Ensure database is running
pnpm run docker:up

# 2. Run migrations
pnpm run db:migrate

# 3. Check available tables
pnpm run crud:list
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE CRUD WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   Database   │ →  │   Backend    │ →  │   Frontend   │ →  │ Navigation │ │
│  │    Table     │    │     API      │    │      UI      │    │   Config   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────────┘ │
│         │                   │                   │                  │         │
│         ▼                   ▼                   ▼                  ▼         │
│  • Migration         • Controller        • List Component   • Menu Item     │
│  • Schema            • Service           • Create Dialog    • Permissions   │
│  • Indexes           • Repository        • Edit Dialog      • Routes        │
│                      • Routes            • View Dialog                      │
│                      • Schemas           • Service                          │
│                      • Types             • Types                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Database Setup

### Option A: Table Already Exists

```bash
# List available tables
pnpm run crud:list

# Output:
# Available tables in 'public' schema:
# - products
# - categories
# - users
```

### Option B: Create New Table

```bash
# Create migration file
pnpm run db:migrate:make create_products_table

# Edit the migration file
# apps/api/src/database/migrations/YYYYMMDDHHMMSS_create_products_table.ts
```

**Example Migration:**

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.uuid('category_id').references('id').inTable('categories');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products');
}
```

```bash
# Run migration
pnpm run db:migrate
```

---

## Step 2: Backend Generation

### Basic Commands

| Command                                 | Description             |
| --------------------------------------- | ----------------------- |
| `pnpm run crud -- TABLE --force`        | Basic CRUD              |
| `pnpm run crud:import -- TABLE --force` | CRUD + Excel/CSV Import |
| `pnpm run crud:events -- TABLE --force` | CRUD + WebSocket Events |
| `pnpm run crud:full -- TABLE --force`   | CRUD + Import + Events  |

### Examples

```bash
# Basic CRUD for products table
pnpm run crud -- products --force

# With import functionality
pnpm run crud:import -- products --force

# With real-time WebSocket events
pnpm run crud:events -- products --force

# Full package (import + events)
pnpm run crud:full -- products --force
```

### Generated Files

```
apps/api/src/modules/products/
├── controllers/
│   └── products.controller.ts    # HTTP request handlers
├── routes/
│   └── products.routes.ts        # Fastify route definitions
├── services/
│   └── products.service.ts       # Business logic
├── repositories/
│   └── products.repository.ts    # Database operations
├── schemas/
│   └── products.schemas.ts       # TypeBox validation schemas
├── types/
│   └── products.types.ts         # TypeScript interfaces
└── index.ts                      # Module exports
```

### Auto-Registration

Routes are automatically registered in:

```typescript
// apps/api/src/bootstrap/plugin.loader.ts
await fastify.register(import('../modules/products'), { prefix: '/api/products' });
```

### Verify Backend

```bash
# Build and start API
pnpm run build && pnpm run dev:api

# Test endpoints
curl http://localhost:3333/api/products
curl http://localhost:3333/api/products/1
```

---

## Step 3: Frontend Generation

### Basic Commands

```bash
# From libs/aegisx-cli directory or using full path
cd libs/aegisx-cli

# Basic frontend
./bin/cli.js generate products --target frontend --force

# With import dialog
./bin/cli.js generate products --target frontend --with-import --force

# Into specific app (web, admin)
./bin/cli.js generate products --target frontend --app admin --force
```

### Shell Integration (Recommended)

For organized feature grouping:

```bash
# Generate into a shell (e.g., inventory app)
./bin/cli.js generate products --target frontend --shell inventory --force

# Into specific section within shell
./bin/cli.js generate products --target frontend --shell inventory --section master-data --force
```

### Generated Files

```
apps/web/src/app/features/products/
├── components/
│   ├── products-list/
│   │   ├── products-list.component.ts
│   │   ├── products-list.component.html
│   │   └── products-list.component.scss
│   ├── products-create-dialog/
│   │   └── products-create-dialog.component.ts
│   ├── products-edit-dialog/
│   │   └── products-edit-dialog.component.ts
│   └── products-view-dialog/
│       └── products-view-dialog.component.ts
├── services/
│   └── products.service.ts       # HTTP client service
├── types/
│   └── products.types.ts         # TypeScript interfaces
├── products.routes.ts            # Angular routes
└── index.ts                      # Public exports
```

### With Import Dialog

```bash
./bin/cli.js generate products --target frontend --with-import --force
```

Adds:

```
├── components/
│   └── products-import-dialog/
│       └── products-import-dialog.component.ts
```

---

## Step 4: Navigation & Routes

### Register Routes

```typescript
// apps/web/src/app/app.routes.ts
export const appRoutes: Routes = [
  // ... existing routes
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
];
```

### Add Navigation Item

```typescript
// apps/web/src/app/config/navigation.config.ts
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // ... existing items
  {
    label: 'Products',
    icon: 'inventory_2',
    route: '/products',
    permission: 'products:read',
  },
];
```

### Shell Navigation (If using shells)

```typescript
// apps/web/src/app/shells/inventory/inventory.config.ts
export const INVENTORY_NAV_ITEMS = [
  {
    section: 'Master Data',
    items: [{ label: 'Products', icon: 'inventory_2', route: 'master-data/products' }],
  },
];
```

---

## Advanced: Domain/Schema Workflow

For features with dedicated database schemas (e.g., `inventory` schema):

### Step 1: Create Domain Structure

```bash
./bin/cli.js domain inventory --schema inventory
```

**Creates:**

```
apps/api/src/domains/inventory/
├── index.ts
├── routes.ts
└── README.md
```

### Step 2: Generate Backend with Schema

```bash
./bin/cli.js generate drugs --schema inventory --force
```

**Creates in domain:**

```
apps/api/src/domains/inventory/drugs/
├── controllers/
├── routes/
├── services/
├── repositories/
├── schemas/
└── types/
```

### Step 3: Generate Frontend into Shell

```bash
# Create shell first (if not exists)
./bin/cli.js shell inventory --app web --force

# Generate into shell
./bin/cli.js generate drugs --target frontend --shell inventory --section master-data --force
```

**Creates:**

```
apps/web/src/app/shells/inventory/
├── inventory-shell.component.ts
├── inventory.routes.ts
├── inventory.config.ts
├── modules/
│   └── master-data/
│       └── drugs/
│           ├── components/
│           ├── services/
│           └── drugs.routes.ts
```

### Complete Domain Example

```bash
# 1. Create domain
./bin/cli.js domain inventory --schema inventory

# 2. Generate backend for multiple tables
./bin/cli.js generate drugs --schema inventory --force
./bin/cli.js generate suppliers --schema inventory --force
./bin/cli.js generate warehouses --schema inventory --force

# 3. Create shell
./bin/cli.js shell inventory --app web --force

# 4. Generate frontends
./bin/cli.js generate drugs --target frontend --shell inventory --section master-data --force
./bin/cli.js generate suppliers --target frontend --shell inventory --section master-data --force
./bin/cli.js generate warehouses --target frontend --shell inventory --section master-data --force
```

---

## Quick Reference

### One-Liner Commands

```bash
# Complete feature (backend + frontend)
pnpm run crud:full -- products --force && \
cd libs/aegisx-cli && \
./bin/cli.js generate products --target frontend --with-import --force

# Domain feature (schema + backend + frontend)
cd libs/aegisx-cli && \
./bin/cli.js generate drugs --schema inventory --force && \
./bin/cli.js generate drugs --target frontend --shell inventory --section master-data --force
```

### All CLI Options

| Option          | Values                           | Description               |
| --------------- | -------------------------------- | ------------------------- |
| `--target`      | `backend`, `frontend`            | Generation target         |
| `--force`       | -                                | Overwrite existing files  |
| `--dry-run`     | -                                | Preview without creating  |
| `--with-import` | -                                | Include Excel/CSV import  |
| `--with-events` | -                                | Include WebSocket events  |
| `--schema`      | schema name                      | Database schema           |
| `--shell`       | shell name                       | Target shell for frontend |
| `--section`     | section name                     | Section within shell      |
| `--app`         | `web`, `admin`, `api`            | Target application        |
| `--package`     | `standard`, `enterprise`, `full` | Feature package           |

### Package Scripts

```bash
# Backend shortcuts
pnpm run crud -- TABLE --force          # Basic
pnpm run crud:import -- TABLE --force   # + Import
pnpm run crud:events -- TABLE --force   # + Events
pnpm run crud:full -- TABLE --force     # Full

# Utility
pnpm run crud:list                      # List tables
pnpm run crud:validate -- TABLE         # Validate module
```

---

## Troubleshooting

### Common Issues

#### 1. "Table not found"

```bash
# Check if table exists
pnpm run crud:list

# Run migrations if needed
pnpm run db:migrate
```

#### 2. "Module already exists"

```bash
# Use --force to overwrite
pnpm run crud -- products --force
```

#### 3. "Routes not registered"

Check `apps/api/src/bootstrap/plugin.loader.ts`:

```typescript
// Should have this line
await fastify.register(import('../modules/products'), { prefix: '/api/products' });
```

#### 4. "Frontend routes not working"

Check `apps/web/src/app/app.routes.ts`:

```typescript
{
  path: 'products',
  loadChildren: () => import('./features/products/products.routes')
    .then(m => m.PRODUCTS_ROUTES)
}
```

#### 5. "Schema not found"

```bash
# Check available schemas
psql -U postgres -d aegisx -c "\dn"

# List tables in schema
pnpm run crud:list --schema inventory
```

### Build Verification

```bash
# After generation, always verify build
pnpm run build

# Check for TypeScript errors
pnpm nx build api
pnpm nx build web
```

---

## Related Documentation

- [CLI Installation](./INSTALLATION.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Shell Guide](./SHELL_GUIDE.md)
- [Domain Guide](./DOMAIN_GUIDE.md)
- [Import Guide](./IMPORT_GUIDE.md)
- [Events Guide](./EVENTS_GUIDE.md)

---

**Last Updated:** 2025-12-07
