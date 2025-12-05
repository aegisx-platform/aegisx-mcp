# AegisX CLI Documentation

> Premium CRUD Generator for Angular + Fastify

---

## Documentation Index

### Getting Started

- **[Installation Guide](./INSTALLATION.md)** - Install, activate license, first steps
- **[Quick Reference](./QUICK_REFERENCE.md)** - All commands at a glance
- **[CLI Reference](./CLI_REFERENCE.md)** - Complete command documentation

### Feature Guides

- **[Domain-Based Generation](./DOMAIN_GUIDE.md)** - Organize modules with domain structure (NEW!)
- **[Shell Generation](./SHELL_GUIDE.md)** - Create Angular app shells
- **[WebSocket Events](./EVENTS_GUIDE.md)** - Real-time CRUD with `--with-events`
- **[Bulk Import](./IMPORT_GUIDE.md)** - Excel/CSV import with `--with-import`

### Advanced

- **[Template Development](./TEMPLATE_DEVELOPMENT_GUIDE.md)** - Create custom templates
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Upgrade from previous versions

---

## Quick Start

### 1. Install

```bash
npm install -g @aegisx/cli
```

### 2. Activate License

```bash
# Start 14-day trial
aegisx trial

# Or activate with license key
aegisx activate AEGISX-PRO-XXXXXXXX-XX
```

### 3. Generate Your First Module

```bash
# Backend CRUD
aegisx generate products --force

# Frontend CRUD
aegisx generate products --target frontend --force
```

### 4. Domain-Based Generation (Recommended)

```bash
# Organize modules with domain structure
aegisx generate drugs --domain inventory/master-data --force

# Result structure:
# modules/inventory/master-data/drugs/
# API Route: /api/inventory/master-data/drugs
```

---

## Features

| Feature                 | Description                               |
| ----------------------- | ----------------------------------------- |
| **Backend Generation**  | Fastify routes, services, repositories    |
| **Frontend Generation** | Angular components with Material Design   |
| **Domain Organization** | Organize modules in domain structure      |
| **Shell Generation**    | Complete app layouts (enterprise, simple) |
| **WebSocket Events**    | Real-time updates with `--with-events`    |
| **Bulk Import**         | Excel/CSV import with `--with-import`     |
| **TypeBox Schemas**     | Type-safe validation                      |
| **Multi-Package**       | Standard, Enterprise, Full packages       |
| **PostgreSQL Schema**   | Read from any PostgreSQL schema           |

---

## Command Reference

### Generate Commands

```bash
# Basic CRUD
aegisx generate <table_name>

# Domain-based (recommended)
aegisx generate <table_name> --domain inventory/master-data

# From specific PostgreSQL schema
aegisx generate <table_name> --schema inventory

# Frontend
aegisx generate <table_name> --target frontend

# With events
aegisx generate <table_name> --with-events

# With import
aegisx generate <table_name> --with-import

# Full package (all features)
aegisx generate <table_name> --with-events --with-import
```

### Shell Commands

```bash
# Enterprise shell (default)
aegisx shell <name>

# Simple shell
aegisx shell <name> --type simple

# Multi-app shell
aegisx shell <name> --type multi-app
```

### Database Commands

```bash
# List tables (public schema)
aegisx list-tables

# List tables from specific schema
aegisx list-tables --schema inventory

# Validate module
aegisx validate <module_name>
```

### License Commands

```bash
# Start trial
aegisx trial

# Activate
aegisx activate <key>

# Check status
aegisx license

# Deactivate
aegisx deactivate
```

---

## pnpm Scripts (Monorepo)

For monorepo projects:

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

---

## Feature Packages

| Package        | Features                                                       |
| -------------- | -------------------------------------------------------------- |
| **Standard**   | Basic CRUD, TypeBox schemas, pagination, filtering             |
| **Enterprise** | + Dropdown API, bulk operations, status management, statistics |
| **Full**       | + Data validation, uniqueness checking, export capabilities    |

```bash
# Use enterprise package
aegisx generate orders --package enterprise --force

# Use full package
aegisx generate invoices --package full --force
```

---

## License Tiers

| Tier         | Price     | Developers | Features                  |
| ------------ | --------- | ---------- | ------------------------- |
| Trial        | Free      | 1          | 14 days, limited          |
| Professional | $49       | 1          | All features, 1yr updates |
| Team         | $199/year | Up to 10   | Priority support          |
| Enterprise   | Contact   | Unlimited  | On-premise, SLA           |

---

## Documentation Files

| File                            | Description                      |
| ------------------------------- | -------------------------------- |
| `README.md`                     | This overview document           |
| `INSTALLATION.md`               | Installation and setup guide     |
| `QUICK_REFERENCE.md`            | All commands at a glance         |
| `CLI_REFERENCE.md`              | Complete command documentation   |
| `DOMAIN_GUIDE.md`               | Domain-based module organization |
| `SHELL_GUIDE.md`                | Angular shell generation         |
| `EVENTS_GUIDE.md`               | WebSocket events integration     |
| `IMPORT_GUIDE.md`               | Bulk import (Excel/CSV)          |
| `TEMPLATE_DEVELOPMENT_GUIDE.md` | Custom template creation         |
| `MIGRATION_GUIDE.md`            | Version upgrade guide            |

---

## Support

- **Documentation**: This folder (`docs/`)
- **Community**: GitHub Issues
- **Email**: support@aegisx.dev (Team/Enterprise)

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
