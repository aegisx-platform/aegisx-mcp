# Inventory Module (INVS Modern) Documentation

> **Hospital Drug Inventory Management System for Thai Healthcare**

ระบบบริหารจัดการคลังยาสำหรับโรงพยาบาล รองรับมาตรฐานกระทรวงสาธารณสุขไทย

## Quick Navigation

| Phase   | Document                                               | Status      |
| ------- | ------------------------------------------------------ | ----------- |
| Phase 1 | [Database Architecture](./01-database-architecture.md) | ✅ Complete |
| Phase 1 | [Migration Standards](./02-migration-standards.md)     | ✅ Complete |
| Phase 1 | [Seed System Design](./03-seed-system.md)              | ✅ Complete |
| Phase 2 | [API Development](./04-api-development.md)             | 🔄 Pending  |
| Phase 3 | [Frontend Implementation](./05-frontend.md)            | 🔄 Pending  |

## Project Overview

### Business Requirements

- **100+ customer sites** - Must support multi-site deployments
- **10+ year lifespan** - Enterprise-grade maintainability
- **Thai healthcare compliance** - FDA, NHSO, TMT integration
- **Real-time inventory** - Accurate stock levels at all times

### Technical Stack

| Component   | Technology                                       |
| ----------- | ------------------------------------------------ |
| Database    | PostgreSQL 15+ with dedicated `inventory` schema |
| Migrations  | Knex.js with TypeScript                          |
| Backend API | Fastify with TypeBox schemas                     |
| Frontend    | Angular 19+ with Signals                         |

## Quick Start

```bash
# 1. Run inventory migrations
pnpm run db:migrate:inventory

# 2. Seed reference data (Thai drug forms, units, etc.)
pnpm run db:seed:inventory

# Or combine both:
pnpm run inventory:setup

# Check migration status
pnpm run db:migrate:inventory:status
```

## Project Phases

### Phase 1: Database Foundation (Current)

**Status: ✅ Complete**

- [x] Schema isolation (`inventory` schema)
- [x] 37 migrations for complete data model
- [x] Seed system with version tracking
- [x] Thai reference data (budget types, dosage forms, etc.)
- [x] TMT table structure ready

**Key Deliverables:**

- 69 database objects (tables, views, functions)
- Enterprise seed system for multi-site deployments
- Ministry-compliant data export views

### Phase 2: Backend API

**Status: 🔄 Pending**

- [ ] CRUD APIs for all entities
- [ ] Business logic services
- [ ] TMT data import
- [ ] Report generation

### Phase 3: Frontend

**Status: 🔄 Pending**

- [ ] Dashboard components
- [ ] Inventory management UI
- [ ] Procurement workflows
- [ ] Distribution tracking

## Key Documents

### For New Developers

1. **Start here:** [Migration Standards](./02-migration-standards.md)
2. **Understand the data:** [Database Architecture](./01-database-architecture.md)
3. **Setup dev environment:** Quick Start above

### For Architects

1. **Design decisions:** [Database Architecture](./01-database-architecture.md)
2. **Deployment patterns:** [Seed System Design](./03-seed-system.md)
3. **Scalability considerations:** Migration Standards

## Commands Reference

```bash
# Migrations
pnpm run db:migrate:inventory           # Run pending migrations
pnpm run db:migrate:inventory:status    # Check migration status
pnpm run db:migrate:inventory:rollback  # Rollback last batch

# Seeds
pnpm run db:seed:inventory              # Seed reference data

# Combined
pnpm run inventory:setup                # Migrations + Seeds

# TMT Import (when data available)
pnpm run inventory:import-tmt -- --path=/path/to/tmt
```

## Related Documentation

- [Main Project README](../../../README.md)
- [CRUD Generator](../../crud-generator/README.md)
- [Multi-Instance Setup](../../infrastructure/multi-instance-setup.md)
