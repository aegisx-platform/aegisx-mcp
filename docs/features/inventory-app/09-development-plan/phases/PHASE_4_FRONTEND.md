# Phase 4: Frontend Development

**Status**: NOT_STARTED
**Depends on**: Phase 3 (APIs) in progress
**App**: `apps/web` (Shell Inventory)

---

## Strategy

1. สร้าง Inventory module ใน apps/web
2. ใช้ lazy loading สำหรับแต่ละ system
3. Parallel development ตาม API tracks

---

## Module Structure

```
apps/web/src/app/
├── inventory/
│   ├── inventory.routes.ts          # Main routing
│   ├── inventory.module.ts           # Feature module
│   │
│   ├── master/                        # Master Data
│   │   ├── locations/
│   │   │   ├── location-list/
│   │   │   ├── location-form/
│   │   │   └── location-tree/
│   │   ├── departments/
│   │   ├── companies/
│   │   ├── drugs/
│   │   │   ├── drug-list/
│   │   │   ├── drug-form/
│   │   │   ├── drug-detail/
│   │   │   └── drug-search/
│   │   └── drug-generics/
│   │
│   ├── budget/                        # Budget Management
│   │   ├── allocations/
│   │   ├── plans/
│   │   │   ├── plan-list/
│   │   │   ├── plan-form/
│   │   │   └── plan-items/
│   │   └── dashboard/
│   │
│   ├── procurement/                   # Procurement
│   │   ├── contracts/
│   │   ├── pr/                        # Purchase Requests
│   │   │   ├── pr-list/
│   │   │   ├── pr-form/
│   │   │   └── pr-approval/
│   │   ├── po/                        # Purchase Orders
│   │   │   ├── po-list/
│   │   │   ├── po-form/
│   │   │   └── po-from-pr/
│   │   └── receipts/
│   │       ├── receipt-list/
│   │       ├── receipt-form/
│   │       └── receipt-verify/
│   │
│   ├── stock/                         # Stock Management
│   │   ├── inventory/
│   │   │   ├── stock-list/
│   │   │   ├── stock-card/
│   │   │   └── stock-adjust/
│   │   ├── lots/
│   │   │   ├── lot-list/
│   │   │   └── lot-expiry/
│   │   └── dashboard/
│   │
│   ├── operations/                    # Operations
│   │   ├── distributions/
│   │   │   ├── dist-list/
│   │   │   ├── dist-form/
│   │   │   └── dist-dispense/
│   │   └── returns/
│   │       ├── return-list/
│   │       ├── return-form/
│   │       └── return-verify/
│   │
│   ├── integration/                   # TMT & HPP
│   │   ├── tmt/
│   │   │   ├── tmt-search/
│   │   │   ├── tmt-mapping/
│   │   │   └── tmt-hierarchy/
│   │   └── hpp/
│   │
│   ├── reports/                       # Reports & Dashboards
│   │   ├── ministry/
│   │   ├── stock-reports/
│   │   └── analytics/
│   │
│   └── shared/                        # Shared Components
│       ├── components/
│       │   ├── drug-selector/
│       │   ├── location-selector/
│       │   ├── department-selector/
│       │   ├── company-selector/
│       │   └── lot-selector/
│       ├── services/
│       └── models/
```

---

## Parallel Development Tracks

### Track A: Master Data Pages (หลัง API Track A)

| Page          | Components                 | Priority | Status |
| ------------- | -------------------------- | -------- | ------ |
| Locations     | list, form, tree           | P1       | [ ]    |
| Departments   | list, form, tree           | P1       | [ ]    |
| Companies     | list, form, import         | P1       | [ ]    |
| Drug Generics | list, form, search         | P1       | [ ]    |
| Drugs         | list, form, detail, search | P1       | [ ]    |
| Dosage Forms  | list, form                 | P2       | [ ]    |
| Drug Units    | list, form                 | P2       | [ ]    |

---

### Track B: Budget Pages (หลัง API Track B)

| Page             | Components            | Priority | Status |
| ---------------- | --------------------- | -------- | ------ |
| Allocations      | list, form, quarterly | P1       | [ ]    |
| Budget Plans     | list, form, items     | P1       | [ ]    |
| Plan Items       | list, add, edit       | P1       | [ ]    |
| Budget Dashboard | summary, charts       | P2       | [ ]    |

---

### Track C: Procurement Pages (หลัง API Track C)

| Page                | Components               | Priority | Status |
| ------------------- | ------------------------ | -------- | ------ |
| Contracts           | list, form, items        | P1       | [ ]    |
| Purchase Requests   | list, form, approve      | P1       | [ ]    |
| PR to PO Conversion | wizard                   | P1       | [ ]    |
| Purchase Orders     | list, form, send         | P1       | [ ]    |
| Receipts            | list, form, verify, post | P1       | [ ]    |
| Payments            | list, tracking           | P2       | [ ]    |

---

### Track D: Stock Pages (หลัง API Track D)

| Page           | Components            | Priority | Status |
| -------------- | --------------------- | -------- | ------ |
| Stock Overview | list, filters         | P1       | [ ]    |
| Stock Card     | history, movements    | P1       | [ ]    |
| Stock Adjust   | form, reason          | P1       | [ ]    |
| Drug Lots      | list, expiry alerts   | P1       | [ ]    |
| Low Stock      | alerts, reorder       | P2       | [ ]    |
| Expiring Drugs | alerts, 90/60/30 days | P2       | [ ]    |

---

### Track E: Operations Pages (หลัง API Track E)

| Page               | Components           | Priority | Status |
| ------------------ | -------------------- | -------- | ------ |
| Distributions      | list, form, dispense | P1       | [ ]    |
| Distribution Items | lot selection        | P1       | [ ]    |
| Drug Returns       | list, form, verify   | P1       | [ ]    |
| Return Items       | action routing       | P1       | [ ]    |

---

### Track F: Reports & Integration (หลัง API Track F)

| Page             | Components        | Priority | Status |
| ---------------- | ----------------- | -------- | ------ |
| Ministry Reports | export, preview   | P2       | [ ]    |
| Stock Reports    | ABC-VEN, turnover | P2       | [ ]    |
| TMT Search       | search, mapping   | P2       | [ ]    |
| HPP Management   | formulas          | P3       | [ ]    |

---

## Shared Components

| Component          | Used By              | Priority | Status |
| ------------------ | -------------------- | -------- | ------ |
| DrugSelector       | PR, PO, Dist, Return | P1       | [ ]    |
| LocationSelector   | Stock, Dist          | P1       | [ ]    |
| DepartmentSelector | PR, Budget, Dist     | P1       | [ ]    |
| CompanySelector    | PO, Contract         | P1       | [ ]    |
| LotSelector        | Dist, Return         | P1       | [ ]    |
| DateRangePicker    | Reports              | P2       | [ ]    |
| StatusBadge        | All lists            | P1       | [ ]    |
| ApprovalFlow       | PR, Receipt          | P1       | [ ]    |

---

## Routing Configuration

**File**: `apps/web/src/app/inventory/inventory.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-shell.component'),
    children: [
      // Master Data
      {
        path: 'master',
        children: [
          { path: 'locations', loadChildren: () => import('./master/locations/locations.routes') },
          { path: 'departments', loadChildren: () => import('./master/departments/departments.routes') },
          { path: 'companies', loadChildren: () => import('./master/companies/companies.routes') },
          { path: 'drugs', loadChildren: () => import('./master/drugs/drugs.routes') },
          { path: 'drug-generics', loadChildren: () => import('./master/drug-generics/drug-generics.routes') },
        ],
      },
      // Budget
      {
        path: 'budget',
        children: [
          { path: 'allocations', loadChildren: () => import('./budget/allocations/allocations.routes') },
          { path: 'plans', loadChildren: () => import('./budget/plans/plans.routes') },
          { path: 'dashboard', loadComponent: () => import('./budget/dashboard/dashboard.component') },
        ],
      },
      // Procurement
      {
        path: 'procurement',
        children: [
          { path: 'contracts', loadChildren: () => import('./procurement/contracts/contracts.routes') },
          { path: 'pr', loadChildren: () => import('./procurement/pr/pr.routes') },
          { path: 'po', loadChildren: () => import('./procurement/po/po.routes') },
          { path: 'receipts', loadChildren: () => import('./procurement/receipts/receipts.routes') },
        ],
      },
      // Stock
      {
        path: 'stock',
        children: [
          { path: '', loadComponent: () => import('./stock/inventory/stock-list.component') },
          { path: 'lots', loadChildren: () => import('./stock/lots/lots.routes') },
          { path: 'adjust', loadComponent: () => import('./stock/inventory/stock-adjust.component') },
        ],
      },
      // Operations
      {
        path: 'operations',
        children: [
          { path: 'distributions', loadChildren: () => import('./operations/distributions/distributions.routes') },
          { path: 'returns', loadChildren: () => import('./operations/returns/returns.routes') },
        ],
      },
      // Reports
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes'),
      },
      // Default redirect
      { path: '', redirectTo: 'stock', pathMatch: 'full' },
    ],
  },
];
```

---

## Navigation Menu

```typescript
export const INVENTORY_NAV = [
  {
    label: 'Stock Overview',
    icon: 'inventory',
    path: '/inventory/stock',
  },
  {
    label: 'Master Data',
    icon: 'database',
    children: [
      { label: 'Drugs', path: '/inventory/master/drugs' },
      { label: 'Generic Drugs', path: '/inventory/master/drug-generics' },
      { label: 'Companies', path: '/inventory/master/companies' },
      { label: 'Locations', path: '/inventory/master/locations' },
      { label: 'Departments', path: '/inventory/master/departments' },
    ],
  },
  {
    label: 'Budget',
    icon: 'payments',
    children: [
      { label: 'Dashboard', path: '/inventory/budget/dashboard' },
      { label: 'Allocations', path: '/inventory/budget/allocations' },
      { label: 'Budget Plans', path: '/inventory/budget/plans' },
    ],
  },
  {
    label: 'Procurement',
    icon: 'shopping_cart',
    children: [
      { label: 'Purchase Requests', path: '/inventory/procurement/pr' },
      { label: 'Purchase Orders', path: '/inventory/procurement/po' },
      { label: 'Receipts', path: '/inventory/procurement/receipts' },
      { label: 'Contracts', path: '/inventory/procurement/contracts' },
    ],
  },
  {
    label: 'Operations',
    icon: 'swap_horiz',
    children: [
      { label: 'Distributions', path: '/inventory/operations/distributions' },
      { label: 'Drug Returns', path: '/inventory/operations/returns' },
    ],
  },
  {
    label: 'Reports',
    icon: 'assessment',
    path: '/inventory/reports',
  },
];
```

---

## Completion Criteria

- [ ] Module structure created
- [ ] All routes configured
- [ ] Master Data pages complete
- [ ] Budget pages complete
- [ ] Procurement pages complete
- [ ] Stock pages complete
- [ ] Operations pages complete
- [ ] Reports pages complete
- [ ] Navigation working
- [ ] Basic tests passing

---

_Created: 2024-12-05_
