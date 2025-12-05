# AegisX CLI - Quick Reference

> All commands at a glance

---

## Installation

```bash
npm install -g @aegisx/cli
```

---

## License Commands

```bash
# Start 14-day free trial
aegisx trial

# Activate license
aegisx activate AEGISX-PRO-XXXXXXXX-XX

# Check license status
aegisx license

# Remove license
aegisx deactivate
```

**License Key Format:** `AEGISX-[TIER]-[SERIAL]-[CHECKSUM]`

| Tier         | Example                   |
| ------------ | ------------------------- |
| Professional | `AEGISX-PRO-A7X9K2M4-5C`  |
| Team         | `AEGISX-TEAM-B8Y0L3N5-9D` |
| Enterprise   | `AEGISX-ENT-C9Z1M4P6-3E`  |

---

## Generate Commands

### Backend Generation

```bash
# Basic CRUD module
aegisx generate <table_name>

# With domain organization (NEW!)
aegisx generate <table_name> --domain inventory/master-data

# From specific PostgreSQL schema
aegisx generate <table_name> --schema inventory

# With WebSocket events
aegisx generate <table_name> --with-events

# With bulk import (Excel/CSV)
aegisx generate <table_name> --with-import

# Full package (all features)
aegisx generate <table_name> --with-events --with-import

# Preview without creating files
aegisx generate <table_name> --dry-run

# Force overwrite existing files
aegisx generate <table_name> --force
```

### Domain-Based Generation (NEW!)

```bash
# Generate module in domain structure
aegisx generate drugs --domain inventory/master-data --force

# Result:
# modules/
# └── inventory/
#     ├── index.ts                 # Domain aggregator
#     └── master-data/
#         ├── index.ts             # Subdomain aggregator
#         └── drugs/               # CRUD module
#             ├── controllers/
#             ├── repositories/
#             ├── routes/
#             ├── schemas/
#             ├── services/
#             ├── types/
#             └── index.ts

# API Route: /api/inventory/master-data/drugs
```

### Frontend Generation

```bash
# Basic frontend component
aegisx generate <table_name> --target frontend

# Frontend with import dialog
aegisx generate <table_name> --target frontend --with-import

# Frontend with event handling
aegisx generate <table_name> --target frontend --with-events

# Generate into specific shell
aegisx generate <table_name> --target frontend --shell <shell_name>

# Target specific app (web, admin)
aegisx generate <table_name> --target frontend --app admin
```

### Generate Options

| Option                   | Default    | Description                                 |
| ------------------------ | ---------- | ------------------------------------------- |
| `-t, --target`           | `backend`  | Generation target (`backend` or `frontend`) |
| `--domain <path>`        | -          | Domain path (e.g., `inventory/master-data`) |
| `-s, --schema <schema>`  | `public`   | PostgreSQL schema to read table from        |
| `-f, --force`            | `false`    | Overwrite existing files                    |
| `-d, --dry-run`          | `false`    | Preview files without creating              |
| `-e, --with-events`      | `false`    | Include WebSocket events                    |
| `--with-import`          | `false`    | Include bulk import (Excel/CSV)             |
| `-a, --app`              | `api`      | Target app: `api`, `web`, `admin`           |
| `--shell`                | -          | Target shell for route registration         |
| `--package`              | `standard` | Package: `standard`, `enterprise`, `full`   |
| `--no-register`          | `false`    | Skip auto-registration                      |
| `--include-audit-fields` | `false`    | Include audit fields in forms               |
| `--direct-db`            | `false`    | Write roles directly to database (dev only) |
| `--migration-only`       | `false`    | Generate migration file only                |
| `--multiple-roles`       | `false`    | Generate admin, editor, viewer roles        |
| `--smart-stats`          | `false`    | Enable smart statistics detection           |
| `--no-format`            | `false`    | Skip auto-formatting generated files        |

---

## Domain Commands

### Generate Domain Module

```bash
# Generate domain with specific routes
aegisx domain <domain_name> --routes core,profiles,preferences

# Example: User domain
aegisx domain users --routes core,profiles,preferences --force

# With events
aegisx domain notifications --routes alerts,inbox --with-events --force
```

### Domain Options

| Option              | Default   | Description                          |
| ------------------- | --------- | ------------------------------------ |
| `-r, --routes`      | -         | Comma-separated list of routes       |
| `-e, --with-events` | `false`   | Include real-time events integration |
| `-t, --target`      | `backend` | Generation target                    |
| `-a, --app`         | `api`     | Target app                           |
| `-f, --force`       | `false`   | Force overwrite                      |
| `-d, --dry-run`     | `false`   | Preview without creating             |

---

## Shell Commands

### Generate App Shell

```bash
# Enterprise shell (default)
aegisx shell <shell_name>

# Simple shell (minimal, no navigation)
aegisx shell <shell_name> --type simple

# Multi-app shell (with sub-app tabs)
aegisx shell <shell_name> --type multi-app

# With additional options
aegisx shell <shell_name> --with-settings --with-theme-switcher

# Target admin app instead of web
aegisx shell <shell_name> --app admin
```

### Shell Options

| Option                  | Default      | Description                                       |
| ----------------------- | ------------ | ------------------------------------------------- |
| `-t, --type`            | `enterprise` | Shell type: `simple`, `enterprise`, `multi-app`   |
| `-a, --app`             | `web`        | Target app: `web`, `admin`                        |
| `-n, --name`            | -            | Display name for the shell                        |
| `--theme`               | `default`    | Theme preset: `default`, `indigo`, `teal`, `rose` |
| `--order`               | `0`          | App order in launcher                             |
| `--with-dashboard`      | `true`       | Include dashboard page                            |
| `--with-settings`       | `false`      | Include settings page                             |
| `--with-auth`           | `true`       | Include AuthGuard                                 |
| `--with-theme-switcher` | `false`      | Include theme switcher                            |
| `-f, --force`           | `false`      | Overwrite existing files                          |
| `-d, --dry-run`         | `false`      | Preview without creating                          |

### Show Shell Types

```bash
aegisx shell-types
```

**Available Shell Types:**

| Type         | Layout Component                   | Use Case                         |
| ------------ | ---------------------------------- | -------------------------------- |
| `simple`     | AxEmptyLayoutComponent             | Auth pages, landing pages        |
| `enterprise` | AxEnterpriseLayoutComponent        | Admin panels, management systems |
| `multi-app`  | AxEnterpriseLayoutComponent + tabs | Complex modules with sections    |

---

## Database Commands

```bash
# List available tables (public schema)
aegisx list-tables
aegisx ls

# List tables from specific schema
aegisx list-tables --schema inventory

# Validate generated module
aegisx validate <module_name>
```

---

## Template Commands

```bash
# List all templates
aegisx templates list

# List backend templates only
aegisx templates list backend

# List frontend templates only
aegisx templates list frontend

# Set default template
aegisx templates set-default

# Add custom template
aegisx templates add

# Remove custom template
aegisx templates remove
```

---

## Configuration Commands

```bash
# Initialize config file (.crudgen.json)
aegisx config init

# Show current configuration
aegisx config show
```

---

## Package Types

```bash
# Show package details
aegisx packages
```

| Package        | Features                                                       |
| -------------- | -------------------------------------------------------------- |
| **standard**   | Basic CRUD, TypeBox schemas, pagination, filtering             |
| **enterprise** | + Dropdown API, bulk operations, status management, statistics |
| **full**       | + Data validation, uniqueness checking, export capabilities    |

---

## Interactive Mode

```bash
# Launch interactive wizard (no arguments)
aegisx generate

# Guides you through:
# 1. Table selection
# 2. Generation type
# 3. Template selection
# 4. Feature selection
# 5. Confirmation
```

---

## Common Workflows

### 1. Full-Stack CRUD Module

```bash
# Step 1: Generate backend
aegisx generate products --force

# Step 2: Generate frontend
aegisx generate products --target frontend --force
```

### 2. Domain-Based Module (Recommended)

```bash
# Generate backend with domain organization
aegisx generate drugs --domain inventory/master-data --force

# Generate multiple modules in same domain
aegisx generate generics --domain inventory/master-data --force
aegisx generate suppliers --domain inventory/master-data --force

# Result structure:
# modules/inventory/master-data/
# ├── drugs/
# ├── generics/
# └── suppliers/

# API Routes:
# /api/inventory/master-data/drugs
# /api/inventory/master-data/generics
# /api/inventory/master-data/suppliers
```

### 3. Module with Import Feature

```bash
# Backend with import service
aegisx generate budgets --with-import --force

# Frontend with import dialog
aegisx generate budgets --target frontend --with-import --force
```

### 4. Real-Time Module

```bash
# Backend with WebSocket events
aegisx generate notifications --with-events --force

# Frontend with event handling
aegisx generate notifications --target frontend --with-events --force
```

### 5. New App Shell + Module

```bash
# Create shell
aegisx shell inventory --type enterprise --force

# Generate module into shell
aegisx generate products --target frontend --shell inventory --force
```

### 6. Multi-Schema Support

```bash
# Read from inventory schema, output to modules
aegisx generate drug_lots --schema inventory --force

# Combine with domain
aegisx generate drug_lots --schema inventory --domain inventory/transactions --force
```

---

## pnpm Scripts (Monorepo)

For monorepo projects, use pnpm scripts:

```bash
# Basic generation
pnpm run crud -- <table_name> --force

# With import
pnpm run crud:import -- <table_name> --force

# With events
pnpm run crud:events -- <table_name> --force

# Full package
pnpm run crud:full -- <table_name> --force

# List tables
pnpm run crud:list

# Validate module
pnpm run crud:validate -- <module_name>
```

**Important:** Always use `--` separator before table name with pnpm!

---

## Help

```bash
# General help
aegisx --help

# Command-specific help
aegisx generate --help
aegisx shell --help
aegisx domain --help
aegisx templates --help
aegisx config --help
```

---

## Version

```bash
aegisx --version
```

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
