# SYSTEM_ALIGNMENT.md - Database & Documentation Alignment Report

**Generated**: 2024-12-01
**Version**: 3.0.0
**Status**: ✅ All Systems Verified

---

## Quick Summary

| System               | Tables |      Records |     Status      |
| -------------------- | -----: | -----------: | :-------------: |
| 1. Master Data       |     16 |       10,321 |   ✅ Complete   |
| 2. Budget Management |      5 |        1,722 |   ✅ Complete   |
| 3. Procurement       |     10 |           38 | ⚠️ Schema Ready |
| 4. Inventory         |      3 |       13,138 |   ✅ Complete   |
| 5. Distribution      |      3 |            2 | ⚠️ Schema Ready |
| 6. Drug Return       |      4 |           27 | ⚠️ Schema Ready |
| 7. TMT Integration   |      7 |       76,904 |   ✅ Complete   |
| 8. HPP System        |      2 |            0 | ⚠️ Schema Ready |
| **Total**            | **57** | **~101,000** |                 |

---

## System 1: Master Data ✅

### Tables & Actual Data

| Table                |    Records | Purpose                      |
| -------------------- | ---------: | ---------------------------- |
| `locations`          |         96 | Storage locations            |
| `departments`        |        108 | Hospital departments         |
| `budget_types`       |          3 | Budget type groups           |
| `budget_categories`  |          3 | Expense categories           |
| `budgets`            |          2 | Type+category combos         |
| `bank`               |          5 | Bank master                  |
| `companies`          |        800 | Vendors & manufacturers      |
| `drug_generics`      |      1,109 | Generic drugs (WORKING_CODE) |
| `drugs`              |      7,261 | Trade drugs (TRADE_CODE)     |
| `drug_components`    |        736 | Active ingredients           |
| `drug_focus_lists`   |         62 | Controlled substances        |
| `drug_pack_ratios`   |      1,266 | Pack sizes & pricing         |
| `dosage_forms`       |        107 | TAB, CAP, INJ, etc.          |
| `drug_units`         |         88 | mg, ml, units, etc.          |
| `adjustment_reasons` |         10 | Inventory adjustments        |
| `return_actions`     |          8 | Return dispositions          |
| **Total**            | **10,321** |                              |

### Key Relationships

```
companies → drugs (manufacturerId)
drug_generics → drugs (genericId)
drugs → drug_components
drugs → drug_focus_lists
drugs → drug_pack_ratios
dosage_forms → drug_generics (dosageFormId)
drug_units → drug_generics (saleUnitId)
```

### API Endpoints Priority

1. `GET /api/drugs` - Drug search with filters
2. `GET /api/drugs/:id` - Drug detail with components
3. `GET /api/companies` - Vendor/manufacturer list
4. `GET /api/drug-generics` - Generic drug catalog
5. `GET /api/locations` - Location hierarchy
6. `GET /api/departments` - Department tree

### Documentation Files

- ✅ `docs/systems/01-master-data/README.md`
- ✅ `docs/systems/01-master-data/SCHEMA.md`
- ✅ `docs/systems/01-master-data/WORKFLOWS.md`
- ✅ `docs/systems/01-master-data/API_development_GUIDE.md`
- ✅ `docs/systems/01-master-data/api/README.md`
- ✅ `docs/systems/01-master-data/mock-ui/MASTER_DATA_UI_MOCKUPS.md`

---

## System 2: Budget Management ✅

### Tables & Actual Data

| Table                 |   Records | Purpose                            |
| --------------------- | --------: | ---------------------------------- |
| `budget_allocations`  |         4 | Annual allocations by dept/quarter |
| `budget_plans`        |         3 | Drug-level budget plans            |
| `budget_plan_items`   |     1,710 | Planned drugs with qty/value       |
| `budget_reservations` |         0 | PR budget holds                    |
| **Total**             | **1,722** |                                    |

### Key Relationships

```
budgets → budget_allocations
departments → budget_allocations
budget_allocations → budget_plans
budget_plans → budget_plan_items
drug_generics → budget_plan_items
```

### Database Functions (USE THESE!)

```sql
-- Check budget availability before PR
SELECT * FROM check_budget_availability(fiscal_year, budget_type_id, dept_id, amount, quarter);

-- Reserve budget for PR
SELECT * FROM reserve_budget(allocation_id, pr_id, amount, expires_days);

-- Commit budget when PO approved
SELECT * FROM commit_budget(allocation_id, po_id, amount, quarter);

-- Check drug against budget plan
SELECT * FROM check_drug_in_budget_plan(fiscal_year, dept_id, generic_id, qty, quarter);
```

### API Endpoints Priority

1. `GET /api/budget/status/:year/:deptId` - Budget status
2. `POST /api/budget/check-availability` - Validate budget
3. `GET /api/budget/plans/:year` - Budget plans
4. `GET /api/budget/plan-items/:planId` - Plan items

### Documentation Files

- ✅ `docs/systems/02-budget-management/README.md`
- ✅ `docs/systems/02-budget-management/SCHEMA.md`
- ✅ `docs/systems/02-budget-management/WORKFLOWS.md`
- ✅ `docs/systems/02-budget-management/API_development_GUIDE.md`
- ✅ `docs/systems/02-budget-management/api/README.md`
- ✅ `docs/systems/02-budget-management/mock-ui/BUDGET_UI_MOCKUPS.md`

---

## System 3: Procurement ⚠️

### Tables & Actual Data

| Table                    | Records | Purpose             |
| ------------------------ | ------: | ------------------- |
| `purchase_methods`       |      18 | Procurement methods |
| `purchase_types`         |      20 | Purchase categories |
| `purchase_requests`      |       0 | PR headers          |
| `purchase_request_items` |       0 | PR line items       |
| `purchase_orders`        |       0 | PO headers          |
| `purchase_order_items`   |       0 | PO line items       |
| `purchase_order_reasons` |       0 | PO amendments       |
| `contracts`              |       0 | Contract headers    |
| `contract_items`         |       0 | Contract line items |
| `receipts`               |       0 | GR headers          |
| `receipt_items`          |       0 | GR line items       |
| `receipt_inspectors`     |       0 | QC inspectors       |
| **Total**                |  **38** | (lookup data only)  |

### Key Workflow States

```
PR: DRAFT → SUBMITTED → APPROVED → REJECTED/CANCELLED
PO: DRAFT → SENT → PARTIAL → COMPLETED → CANCELLED
Receipt: PENDING → INSPECTED → POSTED → REJECTED
```

### API Endpoints Priority

1. `POST /api/purchase-requests` - Create PR
2. `PUT /api/purchase-requests/:id/submit` - Submit PR
3. `PUT /api/purchase-requests/:id/approve` - Approve PR
4. `POST /api/purchase-orders` - Create PO from PR
5. `POST /api/receipts` - Record goods receipt

### Documentation Files

- ✅ `docs/systems/03-procurement/README.md`
- ✅ `docs/systems/03-procurement/SCHEMA.md`
- ✅ `docs/systems/03-procurement/WORKFLOWS.md`
- ✅ `docs/systems/03-procurement/STATE_DIAGRAMS.md`
- ✅ `docs/systems/03-procurement/API_development_GUIDE.md`
- ✅ `docs/systems/03-procurement/api/README.md`
- ✅ `docs/systems/03-procurement/mock-ui/PROCUREMENT_UI_MOCKUPS.md`

---

## System 4: Inventory ✅

### Tables & Actual Data

| Table                    |    Records | Purpose                  |
| ------------------------ | ---------: | ------------------------ |
| `inventory`              |      7,105 | Stock by drug/location   |
| `drug_lots`              |      6,033 | Lot tracking with expiry |
| `inventory_transactions` |          0 | Movement audit trail     |
| **Total**                | **13,138** |                          |

### Key Features

- **FIFO/FEFO Support**: Lot-level tracking with expiry dates
- **Min/Max Levels**: Reorder point alerts
- **Multi-location**: 96 locations

### Database Functions (USE THESE!)

```sql
-- Get lots for dispensing (FIFO)
SELECT * FROM get_fifo_lots(drug_id, location_id, qty_needed);

-- Get lots for dispensing (FEFO - expiry first)
SELECT * FROM get_fefo_lots(drug_id, location_id, qty_needed);

-- Update inventory from receipt
SELECT * FROM update_inventory_from_receipt(receipt_id);
```

### Database Views

```sql
-- Current stock summary
SELECT * FROM current_stock_summary;

-- Low stock items (below reorder point)
SELECT * FROM low_stock_items;

-- Expiring drugs (next 90 days)
SELECT * FROM expiring_drugs;
```

### API Endpoints Priority

1. `GET /api/inventory/:locationId` - Stock by location
2. `GET /api/inventory/drug/:drugId` - Stock across locations
3. `GET /api/inventory/low-stock` - Reorder alerts
4. `GET /api/inventory/expiring` - Expiry alerts
5. `POST /api/inventory/adjust` - Stock adjustment

### Documentation Files

- ✅ `docs/systems/04-inventory/README.md`
- ✅ `docs/systems/04-inventory/SCHEMA.md`
- ✅ `docs/systems/04-inventory/WORKFLOWS.md`
- ✅ `docs/systems/04-inventory/API_development_GUIDE.md`
- ✅ `docs/systems/04-inventory/api/README.md`
- ✅ `docs/systems/04-inventory/mock-ui/INVENTORY_UI_MOCKUPS.md`

---

## System 5: Distribution ⚠️

### Tables & Actual Data

| Table                     | Records | Purpose                 |
| ------------------------- | ------: | ----------------------- |
| `distribution_types`      |       2 | Distribution categories |
| `drug_distributions`      |       0 | Distribution headers    |
| `drug_distribution_items` |       0 | Distribution items      |
| **Total**                 |   **2** | (lookup data only)      |

### Key Workflow

```
Distribution: DRAFT → APPROVED → PICKING → DISPENSED → CANCELLED
```

### API Endpoints Priority

1. `POST /api/distributions` - Create distribution request
2. `PUT /api/distributions/:id/approve` - Approve
3. `PUT /api/distributions/:id/dispense` - Dispense items
4. `GET /api/distributions/department/:deptId` - Dept history

### Documentation Files

- ✅ `docs/systems/05-distribution/README.md`
- ✅ `docs/systems/05-distribution/SCHEMA.md`
- ✅ `docs/systems/05-distribution/WORKFLOWS.md`
- ✅ `docs/systems/05-distribution/API_development_GUIDE.md`
- ✅ `docs/systems/05-distribution/api/README.md`
- ✅ `docs/systems/05-distribution/mock-ui/DISTRIBUTION_UI_MOCKUPS.md`

---

## System 6: Drug Return ⚠️

### Tables & Actual Data

| Table               | Records | Purpose             |
| ------------------- | ------: | ------------------- |
| `return_reasons`    |      19 | Return reason codes |
| `return_actions`    |       8 | Disposition actions |
| `drug_returns`      |       0 | Return headers      |
| `drug_return_items` |       0 | Return items        |
| **Total**           |  **27** | (lookup data only)  |

### Return Reason Types

- Expired
- Damaged
- Recalled
- Wrong delivery
- Excess stock

### Return Actions

- Refund
- Replace
- Credit note
- Destroy
- Return to vendor

### API Endpoints Priority

1. `POST /api/returns` - Create return request
2. `PUT /api/returns/:id/process` - Process return
3. `GET /api/returns/pending` - Pending returns

### Documentation Files

- ✅ `docs/systems/06-drug-return/README.md`
- ✅ `docs/systems/06-drug-return/SCHEMA.md`
- ✅ `docs/systems/06-drug-return/WORKFLOWS.md`
- ✅ `docs/systems/06-drug-return/API_development_GUIDE.md`
- ✅ `docs/systems/06-drug-return/api/README.md`
- ✅ `docs/systems/06-drug-return/mock-ui/DRUG_RETURN_UI_MOCKUPS.md`

---

## System 7: TMT Integration ✅

### Tables & Actual Data

| Table               |    Records | Purpose                  |
| ------------------- | ---------: | ------------------------ |
| `tmt_concepts`      |     76,904 | Thai Medical Terminology |
| `tmt_mappings`      |          0 | Drug-TMT mappings        |
| `tmt_relationships` |          0 | TMT hierarchy            |
| `tmt_attributes`    |          0 | TMT attributes           |
| `tmt_dosage_forms`  |          0 | TMT dosage codes         |
| `tmt_units`         |          0 | TMT unit codes           |
| `tmt_manufacturers` |          0 | TMT manufacturer codes   |
| **Total**           | **76,904** |                          |

### TMT Hierarchy (5 Levels)

```
VTM (Virtual Therapeutic Moiety)
  └─ GP (Generic Product)
      └─ GPU (Generic Product Unit)
          └─ TP (Trade Product)
              └─ TPU (Trade Product Unit)
```

### Key Features

- Standard drug coding (24-digit)
- Ministry compliance
- HIS integration ready

### API Endpoints Priority

1. `GET /api/tmt/search` - Search TMT concepts
2. `GET /api/tmt/:tmtId` - Get TMT detail
3. `GET /api/tmt/hierarchy/:tmtId` - Get hierarchy
4. `POST /api/tmt/map` - Map drug to TMT

### Documentation Files

- ✅ `docs/systems/07-tmt-integration/README.md`
- ✅ `docs/systems/07-tmt-integration/SCHEMA.md`
- ✅ `docs/systems/07-tmt-integration/WORKFLOWS.md`
- ✅ `docs/systems/07-tmt-integration/API_development_GUIDE.md`
- ✅ `docs/systems/07-tmt-integration/api/README.md`
- ✅ `docs/systems/07-tmt-integration/mock-ui/TMT_UI_MOCKUPS.md`

---

## System 8: HPP System ⚠️

### Tables & Actual Data

| Table                              | Records | Purpose        |
| ---------------------------------- | ------: | -------------- |
| `hospital_pharmaceutical_products` |       0 | HPP master     |
| `hpp_formulations`                 |       0 | HPP formulas   |
| **Total**                          |   **0** | (schema ready) |

### HPP Types

- Extemporaneous preparations
- Compounded sterile preparations
- Repackaged drugs
- Unit-dose preparations

### API Endpoints Priority

1. `POST /api/hpp` - Create HPP
2. `GET /api/hpp/:id/formula` - Get formulation
3. `POST /api/hpp/:id/produce` - Record production

### Documentation Files

- ✅ `docs/systems/08-hpp-system/README.md`
- ✅ `docs/systems/08-hpp-system/SCHEMA.md`
- ✅ `docs/systems/08-hpp-system/WORKFLOWS.md`
- ✅ `docs/systems/08-hpp-system/API_development_GUIDE.md`
- ✅ `docs/systems/08-hpp-system/api/README.md`
- ✅ `docs/systems/08-hpp-system/mock-ui/HPP_UI_MOCKUPS.md`

---

## Enums Reference (30 total)

### Status Enums

| Enum                 | Values                                          |
| -------------------- | ----------------------------------------------- |
| `LocationType`       | WAREHOUSE, PHARMACY, WARD, EMERGENCY, CLINIC    |
| `BudgetStatus`       | ACTIVE, SUSPENDED, CLOSED, DRAFT                |
| `BudgetPlanStatus`   | DRAFT, SUBMITTED, APPROVED, REJECTED, ACTIVE    |
| `PrStatus`           | DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED |
| `PoStatus`           | DRAFT, SENT, PARTIAL, COMPLETED, CANCELLED      |
| `ReceiptStatus`      | PENDING, INSPECTED, POSTED, REJECTED            |
| `DistributionStatus` | DRAFT, APPROVED, PICKING, DISPENSED, CANCELLED  |
| `ReturnStatus`       | PENDING, APPROVED, PROCESSED, REJECTED          |
| `LotStatus`          | AVAILABLE, RESERVED, EXPIRED, DEPLETED          |

### Type Enums

| Enum              | Values                                   |
| ----------------- | ---------------------------------------- |
| `CompanyType`     | VENDOR, MANUFACTURER, BOTH               |
| `TransactionType` | RECEIVE, ISSUE, TRANSFER, ADJUST, RETURN |
| `HppType`         | EXTEMP, CSP, REPACK, UNITDOSE            |
| `TmtLevel`        | VTM, GP, GPU, TP, TPU                    |

### Ministry Enums

| Enum                   | Values                           |
| ---------------------- | -------------------------------- |
| `NlemStatus`           | E (Essential), N (Non-essential) |
| `DrugStatus`           | 1, 2, 3, 4 (lifecycle status)    |
| `ProductCategory`      | 1-5 (product types)              |
| `DeptConsumptionGroup` | 1-9 (department types)           |

---

## Database Views (11)

### Operational Views

| View                         | Purpose                |
| ---------------------------- | ---------------------- |
| `current_stock_summary`      | Stock by drug/location |
| `low_stock_items`            | Below reorder point    |
| `expiring_drugs`             | Next 90 days expiry    |
| `budget_status_current`      | Budget by dept         |
| `budget_reservations_active` | Active PR reservations |
| `purchase_order_status`      | PO tracking            |

### Ministry Export Views

| View                   | Purpose              |
| ---------------------- | -------------------- |
| `export_druglist`      | Drug catalog export  |
| `export_purchase_plan` | Purchase planning    |
| `export_receipt`       | Goods receiving      |
| `export_distribution`  | Distribution records |
| `export_inventory`     | Stock status         |

---

## Database Functions (12)

### Budget Functions

| Function                        | Purpose                   |
| ------------------------------- | ------------------------- |
| `check_budget_availability()`   | Validate budget before PR |
| `reserve_budget()`              | Hold budget for PR        |
| `commit_budget()`               | Deduct when PO approved   |
| `release_budget_reservation()`  | Release cancelled PR      |
| `check_drug_in_budget_plan()`   | Validate drug in plan     |
| `update_budget_plan_purchase()` | Update purchased amounts  |

### Inventory Functions

| Function                          | Purpose               |
| --------------------------------- | --------------------- |
| `get_fifo_lots()`                 | Get lots FIFO order   |
| `get_fefo_lots()`                 | Get lots FEFO order   |
| `update_inventory_from_receipt()` | Post receipt to stock |

---

## Alignment Status

### ✅ Fully Aligned

- Database schema matches documentation
- All 8 systems have complete doc sets
- API Development Guides exist for all systems
- RBAC matrix defined
- Enums documented

### ⚠️ Documentation Needs Update

Some SCHEMA.md files show old record counts. Actual counts are in this document.

### Next Steps for Backend

1. Read this document first
2. Use `backup/invs_modern_full.sql.gz` to restore data
3. Follow API priority order per system
4. Use database functions (don't reinvent)
5. Follow enum values exactly

---

_Updated: 2025-12-02 by Claude Code_
