# Budget Request Detail Page - UI Improvements Spec

**Version:** 1.0.0
**Created:** 2025-12-10
**Status:** Planning

---

## Quick Reference

| File                                                                                                               | Purpose                       |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `apps/web/src/app/features/inventory/modules/budget-requests/pages/budget-request-detail.component.ts`             | Main detail page              |
| `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-request-import-dialog.component.ts` | New import dialog (to create) |

---

## Issues to Fix

### Issue 1: Total Amount Not Updating in Header

**Problem:**

- Header shows `0.00 บาท` even when items exist with prices
- `total_requested_amount` from backend not syncing properly

**Root Cause:**

- Header displays `budgetRequest()?.total_requested_amount` from the parent record
- This value is only updated when items are saved to backend
- Frontend edits don't reflect immediately

**Solution:**

- Use computed `totalAmount()` signal instead of `budgetRequest()?.total_requested_amount`
- Add live calculation from items

---

## UI Improvements

### Improvement 1: Move Total Amount to Right Side (More Visible)

**Current:**

```
[Back] แผนงบประมาณจัดซื้อยา ปี 2568
       [BR-2568-001] [Draft] [0.00 บาท] [1,104 รายการ]
```

**Proposed:**

```
[Back] แผนงบประมาณจัดซื้อยา ปี 2568                    [1,104 รายการ]  [฿ 1,234,567.00]
       [BR-2568-001] [Draft]                                           ↑ Large, Bold
```

**Implementation:**

- Move item count and total to right side of header
- Use larger font size for total amount
- Add Thai Baht symbol
- Use success/primary color for total

---

### Improvement 2: Add Reset Button

**Purpose:** Clear all items in the budget request

**Location:** Action bar, after "Add Drug" button

**UI:**

```
[Initialize] [From Master] [Import Excel] [Add Drug] [Reset All]  ...  [Save All] [Submit]
```

**Behavior:**

1. Click "Reset All"
2. Show confirmation dialog (isDangerous: true)
3. Call API: `DELETE /budget-requests/:id/items` (delete all items)
4. Reload items

**Backend:** Need new endpoint or use existing bulk delete

---

### Improvement 3: Add Checkboxes for Bulk Operations

**Features:**

- Checkbox in header row for "Select All"
- Checkbox in each item row
- Floating action bar when items selected

**UI When Selected:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☑ 15 items selected      [Delete Selected] [Distribute Qty]  [×]  │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

1. Add `selectedItems` signal: `Set<number>` (item IDs)
2. Add checkbox column at start of table
3. Add selection bar component
4. Add bulk delete action
5. Future: bulk distribute qty, bulk set price

**Table Columns (Updated):**

```typescript
displayedColumns = [
  'select', // NEW: checkbox column
  'line_number',
  'generic_code',
  'generic_name',
  // ... rest
];
```

---

### Improvement 4: Import as Stepper Dialog (Like CRUD Import)

**Reference:** `AxImportWizardComponent` from aegisx-ui

**Current Import:** Simple file input → direct API call

**Proposed Import:** 4-step wizard dialog

#### Step 1: Upload

- Drag & drop zone
- Download template buttons (Excel, CSV)
- File validation (type, size)

#### Step 2: Review

- Preview parsed data in table
- Show validation errors per row
- Allow editing values
- Column mapping (if needed)

#### Step 3: Options

- Import mode: Replace All / Append / Update Only
- Skip errors option
- Field mappings

#### Step 4: Import

- Progress bar
- Row-by-row status
- Success/Error summary
- Download error report

**Component Structure:**

```
budget-request-import-dialog.component.ts
├── Step 1: AxImportUploadStep (reuse)
├── Step 2: AxImportReviewStep (reuse)
├── Step 3: AxImportOptionsStep (reuse)
└── Step 4: AxImportProgressStep (reuse)
```

**Or use:** `AxImportWizardComponent` directly if it supports custom schemas

---

## Implementation Plan

### Phase 1: Quick Fixes (1-2 hours)

- [ ] Fix total amount display (use computed signal)
- [ ] Move totals to right side, larger font
- [ ] Add Reset All button

### Phase 2: Bulk Selection (2-3 hours)

- [ ] Add checkbox column
- [ ] Implement select all / deselect
- [ ] Add selection floating bar
- [ ] Implement bulk delete

### Phase 3: Import Wizard (4-6 hours)

- [ ] Create BudgetRequestImportDialogComponent
- [ ] Integrate with AxImportWizard or build custom stepper
- [ ] Define column mapping for budget items
- [ ] Add validation rules
- [ ] Backend: bulk import endpoint with validation response

---

## API Requirements

### New/Updated Endpoints

#### 1. Reset All Items

```
DELETE /inventory/budget/budget-requests/:id/items
```

Response: `{ success: true, deletedCount: 1104 }`

#### 2. Bulk Delete Selected

```
POST /inventory/budget/budget-requests/:id/items/bulk-delete
Body: { itemIds: [1, 2, 3, ...] }
```

Response: `{ success: true, deletedCount: 3 }`

#### 3. Import with Validation

```
POST /inventory/budget/budget-requests/:id/import
Content-Type: multipart/form-data
Body: { file, mode: 'replace' | 'append' | 'update' }
```

Response:

```json
{
  "success": true,
  "imported": 1000,
  "skipped": 50,
  "errors": [{ "row": 15, "field": "unit_price", "message": "Invalid number" }]
}
```

---

## UI Mockups

### Header (Improved)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← แผนงบประมาณจัดซื้อยา ปี 2568                                               │
│   📄 BR-2568-001  [Draft]                     📦 1,104 รายการ  💰 ฿1,234,567 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Action Bar (with Reset)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [✨ Initialize] [📋 From Master] [📥 Import] [➕ Add Drug] [🗑️ Reset]   ...  │
│                                                     [💾 Save] [📤 Submit]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Table with Checkboxes

```
┌────┬─────┬──────────┬─────────────────────────┬───────┬─────────────┐
│ ☐  │ #   │ รหัสยา   │ ชื่อยา                  │ หน่วย │ ...         │
├────┼─────┼──────────┼─────────────────────────┼───────┼─────────────┤
│ ☑  │ 1   │ 7400012  │ RIFAPENTINE 150MG...    │ TAB   │ ...         │
│ ☐  │ 2   │ 7400011  │ ISONIAZID 300MG...      │ TAB   │ ...         │
│ ☑  │ 3   │ 7400010  │ PROTIONAMIDE...         │ TAB   │ ...         │
└────┴─────┴──────────┴─────────────────────────┴───────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ ☑ 2 รายการถูกเลือก                              [🗑️ ลบที่เลือก]       [×]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Import Wizard Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│ 📥 Import รายการยา                                         [×] │
│ Upload your file to get started                                 │
├─────────────────────────────────────────────────────────────────┤
│  (1)───────(2)───────(3)───────(4)                              │
│ Upload   Review   Options   Import                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │                    📤                                │     │
│    │     Choose a file or drag it here                   │     │
│    │     Excel (.xlsx, .xls) or CSV files only           │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
│    Need a template?                                            │
│    [📥 Download Excel Template] [📥 Download CSV Template]     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [✓ Validate File]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priority

| Feature                  | Priority | Effort  | Impact    |
| ------------------------ | -------- | ------- | --------- |
| Fix total amount display | HIGH     | 30 min  | High      |
| Move totals to right     | MEDIUM   | 30 min  | Medium    |
| Reset All button         | MEDIUM   | 1 hour  | Medium    |
| Checkboxes + Bulk delete | HIGH     | 3 hours | High      |
| Import Wizard            | HIGH     | 6 hours | Very High |

---

## Notes

- Import Wizard should reuse `AxImportWizardComponent` from aegisx-ui if possible
- Consider using `MatSelectionList` or `SelectionModel` from CDK for checkbox management
- Backend bulk operations should be transactional
