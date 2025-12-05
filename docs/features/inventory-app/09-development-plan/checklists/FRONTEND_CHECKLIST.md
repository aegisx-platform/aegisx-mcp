# Frontend Development Checklist

**App**: `apps/web`
**Total Pages**: ~40 pages across 8 systems

---

## Quick Status

| System       | Pages   | Done  | %      |
| ------------ | ------- | ----- | ------ |
| Setup        | 3       | 0     | 0%     |
| Master Data  | 10      | 0     | 0%     |
| Budget       | 5       | 0     | 0%     |
| Procurement  | 10      | 0     | 0%     |
| Inventory    | 6       | 0     | 0%     |
| Distribution | 3       | 0     | 0%     |
| Return       | 3       | 0     | 0%     |
| Reports      | 4       | 0     | 0%     |
| **Total**    | **~44** | **0** | **0%** |

---

## Setup & Structure

- [ ] Create `inventory/` module folder
- [ ] Create `inventory.routes.ts`
- [ ] Create `inventory-shell.component.ts`
- [ ] Add to app routes

---

## Shared Components (Priority 1)

| Component          | Description           | Status |
| ------------------ | --------------------- | ------ |
| DrugSelector       | Search & select drugs | [ ]    |
| LocationSelector   | Select location       | [ ]    |
| DepartmentSelector | Select department     | [ ]    |
| CompanySelector    | Search vendors        | [ ]    |
| LotSelector        | Select drug lot       | [ ]    |
| StatusBadge        | Display status        | [ ]    |
| ApprovalFlow       | Workflow steps        | [ ]    |

---

## Master Data Pages

### Locations

- [ ] `location-list.component.ts`
- [ ] `location-form.component.ts`
- [ ] `location-tree.component.ts` (hierarchy view)

### Departments

- [ ] `department-list.component.ts`
- [ ] `department-form.component.ts`

### Companies

- [ ] `company-list.component.ts`
- [ ] `company-form.component.ts`
- [ ] `company-import.component.ts`

### Drugs

- [ ] `drug-list.component.ts`
- [ ] `drug-form.component.ts`
- [ ] `drug-detail.component.ts`
- [ ] `drug-search.component.ts`
- [ ] `drug-import.component.ts`

### Drug Generics

- [ ] `generic-list.component.ts`
- [ ] `generic-form.component.ts`

---

## Budget Pages

### Allocations

- [ ] `allocation-list.component.ts`
- [ ] `allocation-form.component.ts`
- [ ] `allocation-quarterly.component.ts`

### Budget Plans

- [ ] `plan-list.component.ts`
- [ ] `plan-form.component.ts`
- [ ] `plan-items.component.ts`
- [ ] `plan-approval.component.ts`

### Dashboard

- [ ] `budget-dashboard.component.ts`

---

## Procurement Pages

### Contracts

- [ ] `contract-list.component.ts`
- [ ] `contract-form.component.ts`
- [ ] `contract-items.component.ts`

### Purchase Requests

- [ ] `pr-list.component.ts`
- [ ] `pr-form.component.ts`
- [ ] `pr-items.component.ts`
- [ ] `pr-approval.component.ts`

### Purchase Orders

- [ ] `po-list.component.ts`
- [ ] `po-form.component.ts`
- [ ] `po-from-pr.component.ts` (convert wizard)
- [ ] `po-items.component.ts`

### Receipts

- [ ] `receipt-list.component.ts`
- [ ] `receipt-form.component.ts`
- [ ] `receipt-items.component.ts`
- [ ] `receipt-verify.component.ts`
- [ ] `receipt-inspectors.component.ts`

---

## Inventory Pages

### Stock Management

- [ ] `stock-list.component.ts`
- [ ] `stock-card.component.ts`
- [ ] `stock-adjust.component.ts`

### Drug Lots

- [ ] `lot-list.component.ts`
- [ ] `lot-expiry.component.ts`

### Dashboard

- [ ] `stock-dashboard.component.ts`

---

## Distribution Pages

- [ ] `dist-list.component.ts`
- [ ] `dist-form.component.ts`
- [ ] `dist-dispense.component.ts`
- [ ] `dist-items.component.ts`

---

## Return Pages

- [ ] `return-list.component.ts`
- [ ] `return-form.component.ts`
- [ ] `return-verify.component.ts`
- [ ] `return-items.component.ts`

---

## Report Pages

- [ ] `ministry-reports.component.ts`
- [ ] `stock-reports.component.ts`
- [ ] `analytics-dashboard.component.ts`
- [ ] `expiry-report.component.ts`

---

## Navigation

- [ ] Create sidebar navigation config
- [ ] Create breadcrumb config
- [ ] Integrate with shell app

---

## Services

| Service                | Purpose            | Status |
| ---------------------- | ------------------ | ------ |
| LocationService        | Location CRUD      | [ ]    |
| DepartmentService      | Department CRUD    | [ ]    |
| CompanyService         | Company CRUD       | [ ]    |
| DrugService            | Drug CRUD          | [ ]    |
| DrugGenericService     | Generic CRUD       | [ ]    |
| BudgetService          | Budget operations  | [ ]    |
| PurchaseRequestService | PR operations      | [ ]    |
| PurchaseOrderService   | PO operations      | [ ]    |
| ReceiptService         | Receipt operations | [ ]    |
| InventoryService       | Stock operations   | [ ]    |
| DistributionService    | Distribution ops   | [ ]    |
| ReturnService          | Return operations  | [ ]    |
| TmtService             | TMT integration    | [ ]    |

---

_Updated: 2024-12-05_
