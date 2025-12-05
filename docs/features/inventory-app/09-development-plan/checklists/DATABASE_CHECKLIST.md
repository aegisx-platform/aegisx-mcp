# Database Migrations Checklist

**Total**: 36 migration files
**Schema**: `inventory`

---

## Quick Status

| Group                 | Files  | Done  | %      |
| --------------------- | ------ | ----- | ------ |
| Schema & Enums        | 2      | 0     | 0%     |
| Master Data           | 19     | 0     | 0%     |
| Budget                | 3      | 0     | 0%     |
| Procurement           | 5      | 0     | 0%     |
| Inventory             | 1      | 0     | 0%     |
| Distribution & Return | 2      | 0     | 0%     |
| TMT & HPP             | 2      | 0     | 0%     |
| Functions & Views     | 2      | 0     | 0%     |
| **Total**             | **36** | **0** | **0%** |

---

## Schema & Enums

- [ ] `001_create_inventory_schema.ts`
- [ ] `002_create_enums.ts` (30 enums)

---

## Master Data Tables

- [ ] `003_create_locations.ts`
- [ ] `004_create_departments.ts`
- [ ] `005_create_budget_types.ts`
- [ ] `006_create_budget_categories.ts`
- [ ] `007_create_budgets.ts`
- [ ] `008_create_bank.ts`
- [ ] `009_create_companies.ts`
- [ ] `010_create_dosage_forms.ts`
- [ ] `011_create_drug_units.ts`
- [ ] `012_create_drug_generics.ts`
- [ ] `013_create_drugs.ts`
- [ ] `014_create_drug_components.ts`
- [ ] `015_create_drug_focus_lists.ts`
- [ ] `016_create_drug_pack_ratios.ts`
- [ ] `017_create_adjustment_reasons.ts`
- [ ] `018_create_hospitals.ts`
- [ ] `019_create_return_actions.ts`
- [ ] `020_create_purchase_methods.ts`
- [ ] `021_create_purchase_types.ts`

---

## Budget Tables

- [ ] `022_create_budget_allocations.ts`
- [ ] `023_create_budget_plans.ts`
- [ ] `024_create_budget_reservations.ts`

---

## Procurement Tables

- [ ] `025_create_contracts.ts`
- [ ] `026_create_purchase_requests.ts`
- [ ] `027_create_purchase_orders.ts`
- [ ] `028_create_receipts.ts`
- [ ] `029_create_approvals_payments.ts`

---

## Inventory Tables

- [ ] `030_create_inventory_tables.ts`

---

## Distribution & Return Tables

- [ ] `031_create_distribution_tables.ts`
- [ ] `032_create_return_tables.ts`

---

## TMT & HPP Tables

- [ ] `033_create_tmt_tables.ts`
- [ ] `034_create_hpp_tables.ts`

---

## Functions & Views

- [ ] `035_create_functions.ts`
- [ ] `036_create_views.ts`

---

## Commands

```bash
# Run migrations
pnpm run db:migrate:inventory

# Rollback
pnpm run db:migrate:inventory:rollback

# Status
pnpm run db:migrate:inventory:status
```

---

_Updated: 2024-12-05_
