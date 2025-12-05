# Phase 1: Database Migrations

**Status**: NOT_STARTED
**Depends on**: Phase 0 Complete
**Total Migrations**: 33 files

---

## Overview

All tables created in `inventory` schema, separate from system tables in `public`.

---

## Migration Files Structure

```
migrations-inventory/
├── 001_create_inventory_schema.ts
├── 002_create_enums.ts
├── 003_create_locations.ts
├── 004_create_departments.ts
├── 005_create_budget_types.ts
├── 006_create_budget_categories.ts
├── 007_create_budgets.ts
├── 008_create_bank.ts
├── 009_create_companies.ts
├── 010_create_dosage_forms.ts
├── 011_create_drug_units.ts
├── 012_create_drug_generics.ts
├── 013_create_drugs.ts
├── 014_create_drug_components.ts
├── 015_create_drug_focus_lists.ts
├── 016_create_drug_pack_ratios.ts
├── 017_create_adjustment_reasons.ts
├── 018_create_hospitals.ts
├── 019_create_return_actions.ts
├── 020_create_purchase_methods.ts
├── 021_create_purchase_types.ts
├── 022_create_budget_allocations.ts
├── 023_create_budget_plans.ts
├── 024_create_budget_reservations.ts
├── 025_create_contracts.ts
├── 026_create_purchase_requests.ts
├── 027_create_purchase_orders.ts
├── 028_create_receipts.ts
├── 029_create_approvals_payments.ts
├── 030_create_inventory_tables.ts
├── 031_create_distribution_tables.ts
├── 032_create_return_tables.ts
├── 033_create_tmt_tables.ts
├── 034_create_hpp_tables.ts
├── 035_create_functions.ts
└── 036_create_views.ts
```

---

## 1.1 Schema & Enums (2 files)

### 001_create_inventory_schema.ts

- [ ] Create schema `inventory`
- [ ] Set search_path

### 002_create_enums.ts

- [ ] `location_type`
- [ ] `company_type`
- [ ] `contract_type`, `contract_status`
- [ ] `budget_status`, `reservation_status`, `budget_plan_status`
- [ ] `urgency`, `request_status`, `item_status`, `po_status`
- [ ] `receipt_status`, `purchase_item_type`, `inspector_role`
- [ ] `approval_type`, `approval_status`, `attachment_type`
- [ ] `payment_status`
- [ ] `transaction_type`
- [ ] `distribution_status`
- [ ] `return_status`, `return_type`
- [ ] `nlem_status`, `drug_status`, `product_category`
- [ ] `dept_consumption_group`
- [ ] `tmt_level`, `tmt_relation_type`, `his_mapping_status`
- [ ] `hpp_type`

---

## 1.2 Master Data (12 files)

### 003-014: Core Tables

| File | Table             | Records | Status |
| ---- | ----------------- | ------- | ------ |
| 003  | locations         | 96      | [ ]    |
| 004  | departments       | 108     | [ ]    |
| 005  | budget_types      | 3       | [ ]    |
| 006  | budget_categories | 3       | [ ]    |
| 007  | budgets           | 2       | [ ]    |
| 008  | bank              | 5       | [ ]    |
| 009  | companies         | 800     | [ ]    |
| 010  | dosage_forms      | 107     | [ ]    |
| 011  | drug_units        | 88      | [ ]    |
| 012  | drug_generics     | 1,109   | [ ]    |
| 013  | drugs             | 7,261   | [ ]    |
| 014  | drug_components   | 736     | [ ]    |

### 015-021: Support Tables

| File | Table              | Records | Status |
| ---- | ------------------ | ------- | ------ |
| 015  | drug_focus_lists   | 62      | [ ]    |
| 016  | drug_pack_ratios   | 1,266   | [ ]    |
| 017  | adjustment_reasons | 10      | [ ]    |
| 018  | hospitals          | 13,176  | [ ]    |
| 019  | return_actions     | 8       | [ ]    |
| 020  | purchase_methods   | 18      | [ ]    |
| 021  | purchase_types     | 20      | [ ]    |

---

## 1.3 Budget Tables (3 files)

| File | Table                           | Status |
| ---- | ------------------------------- | ------ |
| 022  | budget_allocations              | [ ]    |
| 023  | budget_plans, budget_plan_items | [ ]    |
| 024  | budget_reservations             | [ ]    |

---

## 1.4 Procurement Tables (5 files)

| File | Tables                                                     | Status |
| ---- | ---------------------------------------------------------- | ------ |
| 025  | contracts, contract_items                                  | [ ]    |
| 026  | purchase_requests, purchase_request_items                  | [ ]    |
| 027  | purchase_orders, purchase_order_items                      | [ ]    |
| 028  | receipts, receipt_items, receipt_inspectors                | [ ]    |
| 029  | approval_documents, payment_documents, payment_attachments | [ ]    |

---

## 1.5 Inventory Tables (1 file)

| File | Tables                                       | Status |
| ---- | -------------------------------------------- | ------ |
| 030  | inventory, drug_lots, inventory_transactions | [ ]    |

---

## 1.6 Distribution & Return (2 files)

| File | Tables                                                          | Status |
| ---- | --------------------------------------------------------------- | ------ |
| 031  | distribution_types, drug_distributions, drug_distribution_items | [ ]    |
| 032  | return_reasons, drug_returns, drug_return_items                 | [ ]    |

---

## 1.7 TMT & HPP (2 files)

| File | Tables                                                                                                        | Status |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ |
| 033  | tmt_concepts, tmt_relationships, tmt_attributes, tmt_mappings, tmt_manufacturers, tmt_dosage_forms, tmt_units | [ ]    |
| 034  | hospital_pharmaceutical_products, hpp_formulations, his_drug_master, tmt_usage_stats, ministry_reports        | [ ]    |

---

## 1.8 Functions & Views (2 files)

### 035_create_functions.ts

- [ ] `check_budget_availability()`
- [ ] `reserve_budget()`
- [ ] `commit_budget()`
- [ ] `release_budget_reservation()`
- [ ] `check_drug_in_budget_plan()`
- [ ] `update_budget_plan_purchase()`
- [ ] `get_fifo_lots()`
- [ ] `get_fefo_lots()`
- [ ] `update_inventory_from_receipt()`

### 036_create_views.ts

- [ ] `current_stock_summary`
- [ ] `low_stock_items`
- [ ] `expiring_drugs`
- [ ] `budget_status_current`
- [ ] `export_druglist`
- [ ] `export_purchase_plan`
- [ ] `export_receipt`
- [ ] `export_distribution`
- [ ] `export_inventory`

---

## Parallel Development Strategy

เพื่อให้พัฒนาได้พร้อมกัน แบ่งเป็น 3 tracks:

### Track A: Core Infrastructure (Must do first)

```
001 → 002 → 003 → 004 → 008 → 009 → 010 → 011 → 012 → 013
(Schema, Enums, Locations, Departments, Bank, Companies, Dosage, Units, Generics, Drugs)
```

### Track B: Budget & Procurement (Can start after Track A 009)

```
005 → 006 → 007 → 022 → 023 → 024 → 025 → 026 → 027 → 028 → 029
(Budget types → Allocations → PR → PO → Receipt)
```

### Track C: Inventory & Operations (Can start after Track A 013)

```
017 → 030 → 031 → 032
(Adjustment reasons → Inventory → Distribution → Returns)
```

### Track D: TMT & HPP (Can start after Track A 012)

```
033 → 034 → 035 → 036
(TMT → HPP → Functions → Views)
```

---

## Run Migrations

```bash
# Run all inventory migrations
pnpm run db:migrate:inventory

# Rollback last batch
pnpm run db:migrate:inventory:rollback

# Check status
pnpm run db:migrate:inventory:status
```

---

## Completion Criteria

- [ ] All 36 migration files created
- [ ] All migrations run successfully
- [ ] 57 tables exist in `inventory` schema
- [ ] 30 enums created
- [ ] 9 functions created
- [ ] 9 views created
- [ ] Foreign keys verified

---

## Next Phase

After completing Phase 1, proceed to [Phase 2: Data Migration](./PHASE_2_DATA_MIGRATION.md)

---

_Created: 2024-12-05_
