# HANDOFF.md - Claude Code Handoff Document

**Date**: 2024-12-01
**Version**: 3.0.0
**Status**: Database + Full Data Migration Complete

---

## Quick Start (5 minutes)

```bash
# 1. Start containers
docker-compose up -d

# 2. Restore database (if needed)
gunzip -c backup/invs_modern_full.sql.gz | docker exec -i invs-modern-db psql -U invs_user -d invs_modern

# 3. Verify
npm run dev
# Expected: ✅ Database connected successfully!
```

---

## Project Overview

**INVS Modern** = Hospital Drug Inventory Management System

### What This Repo Contains

- ✅ PostgreSQL Database Schema (57 tables, 30 enums)
- ✅ Full Data Migration (~103,000 records)
- ✅ Database Functions (12) & Views (11)
- ✅ Comprehensive Documentation (50+ files)
- ✅ Migration Scripts (Phase 1-15)

### What This Repo Does NOT Contain

- ❌ Backend API (Express/Fastify) - **TO BE BUILT**
- ❌ Frontend (React) - **TO BE BUILT**
- ❌ Authentication - **TO BE BUILT**

---

## Database Summary

### Connection

```
Host: localhost
Port: 5434
Database: invs_modern
User: invs_user
Password: invs123
```

### Data Counts

| Category        | Table             | Records |
| --------------- | ----------------- | ------: |
| **Master Data** | drugs             |   7,261 |
|                 | drug_generics     |   1,109 |
|                 | companies         |     800 |
|                 | departments       |     108 |
|                 | locations         |      96 |
| **Budget**      | budget_plans      |       3 |
|                 | budget_plan_items |   1,710 |
| **Inventory**   | inventory         |   7,105 |
|                 | drug_lots         |   6,033 |
| **TMT**         | tmt_concepts      |  76,904 |
| **Lookups**     | dosage_forms      |     107 |
|                 | drug_units        |      88 |
|                 | purchase_methods  |      18 |
|                 | purchase_types    |      20 |

---

## 8 Core Systems

### 1. Master Data (ข้อมูลหลัก)

- Companies, Drugs, Generics, Departments, Locations
- **Status**: ✅ Complete (100%)
- **Doc**: `docs/systems/01-master-data/`

### 2. Budget Management (งบประมาณ)

- Budget Plans, Allocations, Quarterly tracking
- **Status**: ✅ Complete (100%)
- **Doc**: `docs/systems/02-budget-management/`

### 3. Procurement (จัดซื้อ)

- Purchase Requests, Purchase Orders, Receipts
- **Status**: ✅ Schema ready, minimal transaction data
- **Doc**: `docs/systems/03-procurement/`

### 4. Inventory (คลังยา)

- Stock levels, Lot tracking (FIFO/FEFO), Min/Max
- **Status**: ✅ Complete (7,105 records)
- **Doc**: `docs/systems/04-inventory/`

### 5. Distribution (เบิกจ่าย)

- Department requisitions, Drug distribution
- **Status**: ✅ Schema ready
- **Doc**: `docs/systems/05-distribution/`

### 6. Drug Return (คืนยา)

- Return reasons, Return actions
- **Status**: ✅ Schema ready
- **Doc**: `docs/systems/06-drug-return/`

### 7. TMT Integration (รหัสยามาตรฐาน)

- Thai Medical Terminology (76,904 concepts)
- **Status**: ✅ Complete
- **Doc**: `docs/systems/07-tmt-integration/`

### 8. HPP System (ยาเตรียมพิเศษ)

- Hospital Prepared Products
- **Status**: ✅ Schema ready
- **Doc**: `docs/systems/08-hpp-system/`

---

## Key Files

### Must Read First

1. `CLAUDE.md` - Full instructions for Claude Code
2. `PROJECT_STATUS.md` - Current project status
3. `prisma/schema.prisma` - Database schema (57 tables)

### Database

- `prisma/schema.prisma` - Main schema
- `prisma/functions.sql` - 12 business logic functions
- `prisma/views.sql` - 11 reporting views
- `backup/invs_modern_full.sql.gz` - Full database backup

### Documentation

- `docs/systems/` - 8 system guides with API specs
- `docs/flows/` - Business flow documentation
- `docs/api/` - API Development Guides

---

## API Development Priority

When building the backend, follow this order:

### Phase 1: Foundation

1. Authentication (JWT)
2. User Management
3. Master Data CRUD (Drugs, Companies, Departments)

### Phase 2: Core Operations

4. Inventory Management
5. Purchase Requests
6. Purchase Orders
7. Goods Receiving

### Phase 3: Advanced

8. Distribution
9. Drug Returns
10. Budget Control
11. Reporting

### API Specs Location

- `docs/systems/01-master-data/API_development_GUIDE.md`
- `docs/systems/02-budget-management/API_development_GUIDE.md`
- ... (all 8 systems have API guides)

---

## RBAC (Role-Based Access Control)

| Role              | Description                 |
| ----------------- | --------------------------- |
| `ADMIN`           | Full system access          |
| `PHARMACIST`      | Drug management, dispensing |
| `INVENTORY_STAFF` | Stock management, receiving |
| `DEPARTMENT_USER` | Request drugs, view stock   |
| `VIEWER`          | Read-only access            |

---

## Database Functions (Use These!)

```sql
-- Budget
SELECT * FROM check_budget_availability(2024, 1, 1, 50000, 1);
SELECT * FROM reserve_budget(allocation_id, pr_id, amount, 7);
SELECT * FROM commit_budget(allocation_id, po_id, amount, quarter);

-- Inventory
SELECT * FROM get_fifo_lots(drug_id, location_id, qty_needed);
SELECT * FROM get_fefo_lots(drug_id, location_id, qty_needed);

-- Budget Planning
SELECT * FROM check_drug_in_budget_plan(2024, dept_id, generic_id, qty, quarter);
```

---

## Common Queries

```sql
-- Current stock by location
SELECT * FROM current_stock_summary;

-- Low stock items
SELECT * FROM low_stock_items;

-- Expiring drugs (next 90 days)
SELECT * FROM expiring_drugs;

-- Budget status
SELECT * FROM budget_status_current WHERE fiscal_year = 2024;
```

---

## Ministry Compliance

This system is **100% compliant** with DMSIC Standards 2568:

- DRUGLIST: 11/11 fields ✅
- PURCHASEPLAN: 20/20 fields ✅
- RECEIPT: 22/22 fields ✅
- DISTRIBUTION: 11/11 fields ✅
- INVENTORY: 15/15 fields ✅

Export views ready: `export_druglist`, `export_purchase_plan`, etc.

---

## Do's and Don'ts

### DO

- ✅ Use Prisma client for all database operations
- ✅ Use the existing database functions
- ✅ Follow the 8-system architecture
- ✅ Check `docs/systems/` for API specs
- ✅ Use enums from schema (30 enums defined)

### DON'T

- ❌ Modify the schema without understanding impact
- ❌ Create duplicate tables
- ❌ Ignore the budget control flow
- ❌ Skip lot tracking (FIFO/FEFO is required)
- ❌ Hardcode values that exist in lookup tables

---

## Next Steps for Backend Development

1. **Create new repo** for backend API
2. **Copy Prisma schema** from this repo
3. **Implement auth** (JWT recommended)
4. **Build APIs** following priority order above
5. **Use database backup** for testing

---

## Questions?

If confused, read these files:

1. `CLAUDE.md` - Detailed instructions
2. `docs/flows/data-flow-complete-guide.md` - All business flows
3. `docs/systems/*/API_development_GUIDE.md` - API specs per system

---

_Last Updated: 2025-12-02 by Claude Code_
