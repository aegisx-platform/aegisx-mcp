# Breadcrumb Enhancement Specification

**Version:** 1.0
**Date:** 2024-12-08
**Status:** Draft
**Priority:** High

---

## 1. Problem Analysis

### 1.1 Current Behavior

**Observed Issue:**

```
Current: Home / BudgetReservations
Expected: Home / Inventory / Budget / Budget Reservations
```

**Affected URL:**

```
/inventory/budget/budget-reservations
```

### 1.2 Root Cause

**Location:** `budget-reservations-list.component.ts` (line 126-134)

```typescript
// CURRENT IMPLEMENTATION (INCORRECT)
breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Home',
    url: '/',
  },
  {
    label: 'BudgetReservations',  // ❌ Missing intermediate levels
  },
];
```

**Issues:**

1. ❌ Missing "Inventory" breadcrumb item (`/inventory`)
2. ❌ Missing "Budget" breadcrumb item (`/inventory/budget`)
3. ❌ Module name not properly formatted ("Budget Reservations" vs "BudgetReservations")
4. ❌ Pattern affects ALL generated CRUD modules (19 master-data + 7 budget modules)

---

## 2. Scope of Impact

### 2.1 Affected Modules

**Budget Section (7 modules):**

- `/inventory/budget/budget-allocations`
- `/inventory/budget/budget-plans`
- `/inventory/budget/budget-plan-items`
- `/inventory/budget/budget-reservations`
- `/inventory/budget/budgets`
- `/inventory/budget/budget-categories`
- `/inventory/budget/budget-types`

**Master-Data Section (19 modules):**

- `/inventory/master-data/drugs`
- `/inventory/master-data/locations`
- `/inventory/master-data/hospitals`
- `/inventory/master-data/companies`
- `/inventory/master-data/departments`
- ...and 14 more modules

**Total:** 26 modules affected

### 2.2 Component Files

Each module has breadcrumb in:

- `{module-name}-list.component.ts`

---

## 3. Solution Design

### 3.1 Breadcrumb Structure Pattern

#### **Shell → Section → Module Pattern**

```
Home → {Shell} → {Section} → {Module}
```

**Example for Budget Modules:**

```typescript
breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Home',
    url: '/',
  },
  {
    label: 'Inventory',          // Shell level
    url: '/inventory',
  },
  {
    label: 'Budget',              // Section level
    url: '/inventory/budget',
  },
  {
    label: 'Budget Reservations', // Module level (current page)
  },
];
```

**Example for Master-Data Modules:**

```typescript
breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Home',
    url: '/',
  },
  {
    label: 'Inventory',
    url: '/inventory',
  },
  {
    label: 'Master Data',
    url: '/inventory/master-data',
  },
  {
    label: 'Drugs',
  },
];
```

### 3.2 Dynamic Breadcrumb Rules

| Route Pattern                 | Breadcrumb Structure            |
| ----------------------------- | ------------------------------- |
| `/{shell}/{section}/{module}` | Home → Shell → Section → Module |
| `/{shell}/{module}`           | Home → Shell → Module           |
| `/{module}`                   | Home → Module                   |

### 3.3 Label Formatting Rules

**Module Name Transformation:**

```javascript
// Input: budget-reservations
// Output: Budget Reservations

function formatModuleName(kebabCase) {
  return kebabCase
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

**Section Name Mapping:**

```javascript
const sectionLabels = {
  'master-data': 'Master Data',
  budget: 'Budget',
  operations: 'Operations',
  procurement: 'Procurement',
  distribution: 'Distribution',
};
```

**Shell Name Mapping:**

```javascript
const shellLabels = {
  inventory: 'Inventory',
  hr: 'Human Resources',
  finance: 'Finance',
};
```

---

## 4. Implementation Approach

### 4.1 Option A: Manual Fix (Current Files)

**Pros:**

- ✅ Quick fix for existing modules
- ✅ No generator changes needed

**Cons:**

- ❌ Doesn't fix future generated modules
- ❌ Requires updating 26 files manually
- ❌ Inconsistent with CLI workflow

**Verdict:** ❌ **NOT RECOMMENDED**

### 4.2 Option B: Update CRUD Generator (Recommended)

**Pros:**

- ✅ Fixes all future generations automatically
- ✅ Consistent across all modules
- ✅ Follows CLI-first approach
- ✅ Can regenerate existing modules

**Cons:**

- ⚠️ Requires generator template changes
- ⚠️ Need to regenerate all 26 modules

**Verdict:** ✅ **RECOMMENDED**

### 4.3 Option C: Hybrid Approach

**Phase 1:** Fix generator template
**Phase 2:** Regenerate modules one-by-one as needed

**Verdict:** ⚠️ **Alternative** (if regeneration has risks)

---

## 5. Implementation Steps

### 5.1 Generator Template Update

#### **Step 1:** Locate List Component Template

```bash
# Find the template
ls libs/aegisx-cli/templates/frontend/components/
```

**Files to modify:**

- `list.component.ts` template
- OR inline code generation in `frontend-generator.js`

#### **Step 2:** Add Breadcrumb Generation Logic

**Location:** `libs/aegisx-cli/lib/generators/frontend-generator.js`

```javascript
// Add to context generation
function generateBreadcrumbItems(options) {
  const { shell, section, moduleName } = options;
  const breadcrumbs = [
    {
      label: 'Home',
      url: '/',
    },
  ];

  // Add shell level
  if (shell) {
    const shellLabel = getShellLabel(shell);
    breadcrumbs.push({
      label: shellLabel,
      url: `/${shell}`,
    });
  }

  // Add section level
  if (section) {
    const sectionLabel = getSectionLabel(section);
    breadcrumbs.push({
      label: sectionLabel,
      url: `/${shell}/${section}`,
    });
  }

  // Add module level (current page)
  const moduleLabel = formatModuleName(moduleName);
  breadcrumbs.push({
    label: moduleLabel,
  });

  return breadcrumbs;
}

function formatModuleName(kebabCase) {
  return kebabCase
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getShellLabel(shell) {
  const labels = {
    inventory: 'Inventory',
    hr: 'Human Resources',
    finance: 'Finance',
  };
  return labels[shell] || capitalize(shell);
}

function getSectionLabel(section) {
  const labels = {
    'master-data': 'Master Data',
    budget: 'Budget',
    operations: 'Operations',
  };
  return labels[section] || formatModuleName(section);
}
```

#### **Step 3:** Update Template Context

```javascript
// In generateFrontendFiles function
const templateContext = {
  ...existingContext,
  breadcrumbItems: generateBreadcrumbItems({
    shell: options.shell,
    section: options.section,
    moduleName: tableName,
  }),
};
```

#### **Step 4:** Update List Component Template

**If using Handlebars template:**

```handlebars
// Breadcrumb configuration breadcrumbItems: BreadcrumbItem[] = [
{{#each breadcrumbItems}}
  { label: '{{label}}',
  {{#if url}}url: '{{url}}',{{/if}}
  },
{{/each}}
];
```

**If using inline string generation:**

```javascript
const breadcrumbCode = `
  breadcrumbItems: BreadcrumbItem[] = ${JSON.stringify(breadcrumbItems, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;
```

### 5.2 Regenerate Existing Modules

#### **Budget Modules (7 files)**

```bash
# Budget section modules
for module in budget-allocations budget-plans budget-plan-items budget-reservations budgets budget-categories budget-types; do
  echo "Regenerating $module..."
  node libs/aegisx-cli/bin/cli.js generate ${module//-/_} \
    --target frontend \
    --shell inventory \
    --section budget \
    --package full \
    --with-import --with-export \
    --force \
    --domain inventory/operations \
    --schema inventory
done
```

#### **Master-Data Modules (19 files)**

```bash
# Master-data section modules
for module in drugs locations hospitals companies departments drug-generics dosage-forms drug-units adjustment-reasons return-actions drug-components drug-focus-lists drug-pack-ratios bank contracts contract-items; do
  echo "Regenerating $module..."
  node libs/aegisx-cli/bin/cli.js generate ${module//-/_} \
    --target frontend \
    --shell inventory \
    --section master-data \
    --package full \
    --with-import --with-export \
    --force \
    --domain inventory/master-data \
    --schema inventory
done
```

---

## 6. Testing & Validation

### 6.1 Test Cases

| Test Case | URL                                     | Expected Breadcrumb                             |
| --------- | --------------------------------------- | ----------------------------------------------- |
| TC-01     | `/inventory/budget/budget-reservations` | Home > Inventory > Budget > Budget Reservations |
| TC-02     | `/inventory/budget/budgets`             | Home > Inventory > Budget > Budgets             |
| TC-03     | `/inventory/master-data/drugs`          | Home > Inventory > Master Data > Drugs          |
| TC-04     | `/inventory/master-data/locations`      | Home > Inventory > Master Data > Locations      |

### 6.2 Validation Checklist

- [ ] All breadcrumb items have correct labels
- [ ] All intermediate items have clickable URLs
- [ ] Current page item has NO URL (not clickable)
- [ ] Breadcrumb styling matches AegisX UI design
- [ ] Mobile responsive breadcrumb display
- [ ] Breadcrumb truncation for long names

---

## 7. Rollback Plan

### 7.1 If Generator Update Fails

```bash
# Revert generator changes
git checkout HEAD -- libs/aegisx-cli/lib/generators/frontend-generator.js
```

### 7.2 If Module Regeneration Fails

```bash
# Restore from commit before regeneration
git reset --hard {commit-hash-before-regeneration}
```

### 7.3 Keep Backup

```bash
# Before regeneration
git checkout -b backup/before-breadcrumb-fix
git commit -am "Backup before breadcrumb enhancement"
```

---

## 8. Risks & Mitigation

| Risk                      | Impact | Mitigation                                                   |
| ------------------------- | ------ | ------------------------------------------------------------ |
| Breaking existing modules | HIGH   | Test on 1 module first, backup before mass regeneration      |
| Route changes             | MEDIUM | Ensure routes.ts files are NOT regenerated                   |
| Custom modifications lost | MEDIUM | Review git diff before regeneration, document customizations |
| Generator bugs            | LOW    | Test generator with dry-run flag first                       |

---

## 9. Success Criteria

### 9.1 Functional Requirements

✅ All 26 modules show correct 4-level breadcrumb
✅ Breadcrumb items are clickable (except current page)
✅ URLs navigate correctly
✅ Labels are properly formatted

### 9.2 Non-Functional Requirements

✅ Generator change is backward compatible
✅ Future modules automatically get correct breadcrumb
✅ No performance degradation
✅ Consistent with AegisX UI design system

---

## 10. Next Steps

### 10.1 Immediate Actions (Phase 1)

1. ✅ Document current problem (this spec)
2. ⏳ Update CRUD generator breadcrumb logic
3. ⏳ Test generator on 1 module (budget-reservations)
4. ⏳ Review generated code
5. ⏳ Get user approval

### 10.2 Implementation (Phase 2)

6. ⏳ Regenerate Budget section (7 modules)
7. ⏳ Test all Budget modules
8. ⏳ Regenerate Master-Data section (19 modules)
9. ⏳ Full regression testing
10. ⏳ Commit and push changes

### 10.3 Validation (Phase 3)

11. ⏳ Manual testing on dev server
12. ⏳ Screenshot validation
13. ⏳ User acceptance testing
14. ⏳ Mark as complete

---

## 11. Alternative Solutions (Future Enhancements)

### 11.1 Dynamic Breadcrumb Component

Create a smart breadcrumb component that auto-generates breadcrumb from route:

```typescript
@Component({
  selector: 'app-smart-breadcrumb',
  template: `<ax-breadcrumb [items]="breadcrumbItems()" />`,
})
export class SmartBreadcrumbComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);

  breadcrumbItems = computed(() => {
    const url = this.router.url;
    return generateBreadcrumbFromUrl(url);
  });
}
```

**Pros:**

- ✅ Zero configuration in components
- ✅ Always correct breadcrumb
- ✅ Single source of truth

**Cons:**

- ⚠️ Requires route data configuration
- ⚠️ More complex initial setup

### 11.2 Breadcrumb Service

```typescript
@Injectable()
export class BreadcrumbService {
  private breadcrumbs$ = new BehaviorSubject<BreadcrumbItem[]>([]);

  setBreadcrumbs(items: BreadcrumbItem[]) {
    this.breadcrumbs$.next(items);
  }

  getBreadcrumbs() {
    return this.breadcrumbs$.asObservable();
  }
}
```

---

## Appendix A: File Locations

### Generator Files

```
libs/aegisx-cli/
├── lib/
│   └── generators/
│       └── frontend-generator.js    # MODIFY HERE
└── templates/
    └── frontend/
        └── components/
            └── list.component.ts    # Template (if exists)
```

### Generated Module Files

```
apps/web/src/app/features/inventory/
├── modules/
│   ├── budget-reservations/
│   │   └── components/
│   │       └── budget-reservations-list.component.ts  # Line 126-134
│   └── drugs/
│       └── components/
│           └── drugs-list.component.ts                 # Line 126-134
└── pages/
    ├── budget/
    │   └── budget.config.ts
    └── master-data/
        └── master-data.config.ts
```

---

## Appendix B: Code Examples

### Before (Current - Incorrect)

```typescript
breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', url: '/' },
  { label: 'BudgetReservations' },
];
```

### After (Expected - Correct)

```typescript
breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Inventory', url: '/inventory' },
  { label: 'Budget', url: '/inventory/budget' },
  { label: 'Budget Reservations' },
];
```

---

**Document Control:**

- **Created:** 2024-12-08
- **Last Updated:** 2024-12-08
- **Author:** Claude Code
- **Approved By:** [Pending]
