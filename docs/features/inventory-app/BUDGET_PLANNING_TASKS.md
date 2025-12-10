# Budget Planning System - Task Tracker

**Version:** 1.0.0
**Created:** 2025-12-10
**Last Updated:** 2025-12-10
**Status:** Active

---

## Quick Reference

- **Spec File:** `docs/features/inventory-app/BUDGET_PLANNING_SYSTEM_SPEC_V2.md`
- **Backend Service:** `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.service.ts`
- **Backend Route:** `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.route.ts`
- **Frontend Detail Page:** `apps/web/src/app/features/inventory/modules/budget-requests/pages/budget-request-detail.component.ts`

---

## Current Status Summary

| Category    | Done | Partial | Todo | Total |
| ----------- | :--: | :-----: | :--: | :---: |
| Backend API |  13  |    2    |  2   |  17   |
| Frontend UI |  9   |    3    |  3   |  15   |
| Database    |  3   |    0    |  2   |   5   |

---

## Sprint 1: Critical Fixes (Priority: HIGH)

### Task 1.1: Fix Initialize - Get Real unit_price

**Status:** ✅ DONE (2025-12-10)
**Effort:** 2 hours
**File:** `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.service.ts`

**Problem:**

```typescript
// Line 556-557 - CURRENT (WRONG)
const unitPrice = 0; // Placeholder - always 0!
```

**Solution Implemented:**

```typescript
// Get drug info with unit_price from drugs table (linked by generic_id)
const drugRecord = await knex('inventory.drugs').where({ generic_id: generic.id, is_active: true }).orderBy('updated_at', 'desc').first();

// Get unit_price from drugs table (0 if not found)
const unitPrice = parseFloat(drugRecord?.unit_price || 0);
```

**Acceptance Criteria:**

- [x] Initialize ดึง unit_price จาก drugs table
- [x] ถ้าไม่มี drugs ให้ใส่ 0
- [x] requested_amount คำนวณถูกต้อง (qty × price)

---

### Task 1.2: Fix Initialize - Get Real currentStock

**Status:** ✅ DONE (2025-12-10)
**Effort:** 2 hours
**File:** `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.service.ts`

**Problem:**

```typescript
// Line 548 - CURRENT (WRONG)
const currentStock = 0; // Placeholder - always 0!
```

**Solution Implemented:**

```typescript
// Get current stock from drug_lots table (linked via drugRecord.id)
// drug_lots.drug_id → drugs.id → drugs.generic_id = generic.id
let currentStock = 0;
if (drugRecord?.id) {
  const stockResult = await knex('inventory.drug_lots').where({ drug_id: drugRecord.id, is_active: true }).sum('quantity_available as total').first();
  currentStock = Math.max(0, parseFloat(stockResult?.total || 0));
}
```

**Note:** Column name is `quantity_available` (not `quantity_remaining` as originally documented)

**Acceptance Criteria:**

- [x] Initialize ดึง stock จาก drug_lots หรือ inventory
- [x] estimated_purchase = estimated_usage - currentStock
- [x] ถ้า stock เป็นลบให้แสดง 0

---

### Task 1.3: Add Historical Data Columns to Detail Page

**Status:** ✅ DONE (2025-12-10)
**Effort:** 3 hours
**File:** `apps/web/src/app/features/inventory/modules/budget-requests/pages/budget-request-detail.component.ts`

**Problem:**
ปัจจุบัน table ไม่มีคอลัมน์ historical data (ปี66, ปี67, ปี68, เฉลี่ย)

**Current displayedColumns:**

```typescript
displayedColumns = ['line_number', 'generic_code', 'generic_name', 'unit', 'unit_price', 'requested_qty', 'q1_qty', 'q2_qty', 'q3_qty', 'q4_qty', 'requested_amount', 'actions'];
```

**Solution - Add columns:**

```typescript
displayedColumns = [
  'line_number',
  'generic_code',
  'generic_name',
  'unit',
  'usage_2566',
  'usage_2567',
  'usage_2568',
  'avg_usage', // NEW
  'estimated_usage_2569',
  'current_stock', // NEW
  'unit_price',
  'requested_qty',
  'q1_qty',
  'q2_qty',
  'q3_qty',
  'q4_qty',
  'requested_amount',
  'actions',
];
```

**Template changes needed:**

```html
<!-- Historical Usage columns -->
<ng-container matColumnDef="usage_2566">
  <th mat-header-cell *matHeaderCellDef class="!text-right">ปี66</th>
  <td mat-cell *matCellDef="let item" class="!text-right">{{ getHistoricalUsage(item, '2566') | number }}</td>
</ng-container>
<!-- Repeat for 2567, 2568 -->

<!-- Average Usage -->
<ng-container matColumnDef="avg_usage">
  <th mat-header-cell *matHeaderCellDef class="!text-right">เฉลี่ย</th>
  <td mat-cell *matCellDef="let item" class="!text-right">{{ item.avg_usage | number:'1.0-0' }}</td>
</ng-container>
```

**Component method:**

```typescript
getHistoricalUsage(item: BudgetRequestItem, year: string): number {
  if (item.historical_usage && typeof item.historical_usage === 'object') {
    return (item.historical_usage as any)[year] || 0;
  }
  return 0;
}
```

**Acceptance Criteria:**

- [x] Table แสดงคอลัมน์ ปี66, ปี67, ปี68, เฉลี่ย
- [x] Parse JSONB historical_usage ถูกต้อง
- [x] Format ตัวเลขด้วย number pipe

---

### Task 1.4: Fix Export SSCJ - Parse JSONB Historical Usage

**Status:** ✅ DONE (2025-12-10)
**Effort:** 2 hours
**File:** `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.service.ts`

**Problem:**

```typescript
// Line 1157-1159 - CURRENT (WRONG)
row.getCell(6).value = item.usage_year_2566 || 0; // Field doesn't exist!
row.getCell(7).value = item.usage_year_2567 || 0; // Field doesn't exist!
row.getCell(8).value = item.usage_year_2568 || 0; // Field doesn't exist!
```

**Solution Implemented (Dynamic Years based on fiscal_year):**

```typescript
// Calculate dynamic years based on fiscal_year from budget request
const fiscalYear = request.fiscal_year || 2569;
const histYear1 = fiscalYear - 3; // e.g., 2566
const histYear2 = fiscalYear - 2; // e.g., 2567
const histYear3 = fiscalYear - 1; // e.g., 2568
const q1StartYear = fiscalYear - 1; // Q1 starts in October of previous year

// Parse JSONB historical_usage
const historicalUsage = typeof item.historical_usage === 'string' ? JSON.parse(item.historical_usage) : item.historical_usage || {};

row.getCell(6).value = historicalUsage[String(histYear1)] || 0;
row.getCell(7).value = historicalUsage[String(histYear2)] || 0;
row.getCell(8).value = historicalUsage[String(histYear3)] || 0;
```

**Additional fixes:**

- Title: `แผนงบประมาณจัดซื้อยา ปีงบประมาณ ${fiscalYear}` (dynamic)
- Headers: `ปีงบฯ${histYear1}`, `ปีงบฯ${histYear2}`, `ปีงบฯ${histYear3}` (dynamic)
- Quarter labels: `งวดที่ 1 ต.ค.${q1StartYear}`, `งวดที่ 2 ม.ค.${fiscalYear}`, etc.
- Fixed `working_code` → `generic_code`

**Acceptance Criteria:**

- [x] Export แสดง historical usage ถูกต้อง
- [x] ไม่มี cell ว่างในคอลัมน์ ปี66-68
- [x] รหัสยาแสดงถูกต้อง
- [x] ปีต่างๆ คำนวณอัตโนมัติจาก fiscal_year

---

### Task 1.5: Separate "Initialize from Drug Master" API

**Status:** ✅ DONE (2025-12-10)
**Effort:** 4 hours
**Files:**

- `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.service.ts`
- `apps/api/src/modules/inventory/budget/budgetRequests/budget-requests.route.ts`
- `apps/web/src/app/features/inventory/modules/budget-requests/pages/budget-request-detail.component.ts`

**Solution Implemented:**

**Backend:**

- Added new route `POST /:id/initialize-from-master`
- Added controller method `initializeFromMaster`
- Added service method `initializeFromMaster` that:
  - Pulls all active drug generics from `inventory.drug_generics`
  - Creates budget_request_items with default values (all zeros)
  - Does NOT calculate historical usage, stock, or prices

**Frontend:**

- Added "From Master" button next to "Initialize" button
- Button has tooltip explaining the difference
- Calls new API endpoint `/initialize-from-master`
- Shows confirmation dialog with bullet points explaining the behavior

**Difference between the two buttons:**
| Feature | Initialize | From Master |
|---------|------------|-------------|
| Historical Usage | Calculated from drug_distributions | Empty ({}) |
| Unit Price | From drugs table | 0 |
| Current Stock | From drug_lots | 0 |
| Quarterly Distribution | 25% each | 0 |

**Acceptance Criteria:**

- [x] มี 2 ปุ่มแยกกัน: "Initialize" และ "From Master"
- [x] Initialize = คำนวณ historical + stock + price
- [x] Initialize from Drug Master = ดึงยามาเฉยๆ values = 0

---

## Sprint 2: Performance & UX (Priority: MEDIUM)

### Task 2.1: Backend Pagination for Items

**Status:** 🟡 TODO
**Effort:** 3 hours

**Problem:** Frontend loads ALL items (5000) then filters client-side

**Solution:** Add proper server-side pagination to budget-request-items endpoint

---

### Task 2.2: Batch Save Optimization

**Status:** 🟡 TODO
**Effort:** 2 hours

**Problem:**

```typescript
// CURRENT - Loops PATCH one by one
for (const item of modifiedItems) {
  await firstValueFrom(this.http.patch(`/.../${item.id}`, {...}));
}
```

**Solution:** Use existing batch API properly with chunking

---

### Task 2.3: Quarterly Validation

**Status:** 🟡 TODO
**Effort:** 2 hours

**Problem:** No validation that Q1+Q2+Q3+Q4 = requested_qty

**Solution:**

- Backend: Add validation in batchUpdateItems
- Frontend: Show error badge if mismatch

---

### Task 2.4: Reopen Button in UI

**Status:** 🟡 TODO
**Effort:** 2 hours

**Problem:** Reopen API exists but no button in UI for REJECTED status

---

## Sprint 3: Future Features (Priority: LOW)

### Task 3.1: Comments Feature

**Status:** ⚪ TODO
**Effort:** 8 hours

- Create budget_request_comments table
- Generate CRUD
- Add comments UI section

### Task 3.2: Audit Log Display

**Status:** ⚪ TODO
**Effort:** 4 hours

- Show workflow history in UI

### Task 3.3: Version History

**Status:** ⚪ TODO
**Effort:** 8 hours

---

## Known Issues (Bugs)

### Bug 1: department_id=0 causes FK violation

**Status:** ✅ FIXED
**Fix:** Service now converts 0 → null

### Bug 2: Initialize overwrites existing items

**Status:** ⚠️ OPEN
**Workaround:** Confirm dialog warns user

---

## Database Schema Notes

### budget_request_items - Key Fields

```
historical_usage: JSONB  -- {"2566": 4200, "2567": 4400, "2568": 4527}
avg_usage: numeric
estimated_usage_2569: integer
current_stock: integer
unit_price: numeric
requested_qty: integer
q1_qty, q2_qty, q3_qty, q4_qty: integer
requested_amount: numeric (calculated)
```

### Related Tables

- `inventory.drug_generics` - Source of drug list
- `inventory.drugs` - Drug details + unit_price
- `inventory.drug_lots` - Stock quantities
- `inventory.drug_distributions` - Historical usage data

---

## Testing Checklist

### Initialize Flow

- [ ] Create new budget request (DRAFT)
- [ ] Click Initialize
- [ ] Verify items created with:
  - [ ] Historical usage populated (if data exists)
  - [ ] Unit price from drugs table
  - [ ] Current stock from drug_lots
  - [ ] Quarterly distribution (25% each)

### Workflow Flow

- [ ] Edit items (DRAFT only)
- [ ] Save All
- [ ] Submit → SUBMITTED
- [ ] Approve Dept → DEPT_APPROVED
- [ ] Approve Finance → FINANCE_APPROVED
- [ ] Verify budget_allocations created

### Export Flow

- [ ] Export SSCJ
- [ ] Open Excel
- [ ] Verify all columns populated
- [ ] Verify totals correct

---

## Change Log

### 2025-12-10

- Created task tracker
- Documented all gaps and issues
- Prioritized Sprint 1 tasks
