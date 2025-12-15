# Specification: Inventory Frontend Routes Refactoring

**Status:** Draft
**Created:** 2025-12-15
**Priority:** High
**Type:** Refactoring

---

## 1. Executive Summary

Refactor all API routes in the inventory frontend (web app) to use the correct layer-based routing architecture. Currently, some routes incorrectly reference resources that should be in the Platform Layer instead of the Inventory Domain.

**Impact:**

- 27 service files to update
- 1 component with direct API call to fix
- Improved architectural consistency
- Better separation of concerns

---

## 2. Problem Statement

### 2.1 Current Issues

1. **Incorrect Layer Assignment**
   - `departments` service uses `/inventory/master-data/departments`
   - Should use `/v1/platform/departments` (Platform Layer - shared resource)
   - Backend route `/api/inventory/master-data/departments` returns **404 Not Found**

2. **Direct API Calls in Components**
   - `budget-requests-form.component.ts` calls `/api/inventory/master-data/departments` directly
   - Bypasses service layer
   - Uses wrong endpoint

3. **Missing `/api` Prefix**
   - Services use relative URLs without `/api` prefix
   - Relies on Angular proxy configuration
   - Not explicit about API layer

### 2.2 Root Cause

During the migration to layer-based routing, frontend routes were not updated to reflect the new backend architecture where:

- **Platform Layer** (`/api/v1/platform/*`) - shared services (departments, users, rbac)
- **Domains Layer** (`/api/{domain}/*`) - business-specific resources (inventory drugs, budgets)

---

## 3. Solution Design

### 3.1 Routing Rules

| Resource        | Current Route                        | Correct Route                      | Layer    | Reason                                             |
| --------------- | ------------------------------------ | ---------------------------------- | -------- | -------------------------------------------------- |
| **departments** | `/inventory/master-data/departments` | `/v1/platform/departments`         | Platform | Organization structure - shared across all domains |
| **users**       | N/A (not in inventory)               | `/v1/platform/users`               | Platform | User management - shared resource                  |
| **roles**       | N/A (not in inventory)               | `/v1/platform/rbac/roles`          | Platform | RBAC - shared resource                             |
| **drugs**       | `/inventory/master-data/drugs`       | `/inventory/master-data/drugs`     | Domain   | ✅ Correct - inventory-specific                    |
| **budgets**     | `/inventory/master-data/budgets`     | `/inventory/master-data/budgets`   | Domain   | ✅ Correct - inventory-specific                    |
| **hospitals**   | `/inventory/master-data/hospitals`   | `/inventory/master-data/hospitals` | Domain   | ✅ Correct - inventory-specific                    |
| All others      | `/inventory/*`                       | `/inventory/*`                     | Domain   | ✅ Correct - inventory-specific                    |

### 3.2 URL Prefix Strategy

**Current (Implicit):**

```typescript
private baseUrl = '/inventory/master-data/drugs';
// Relies on Angular proxy to prepend /api
```

**Proposed (Explicit):**

```typescript
private baseUrl = '/api/inventory/master-data/drugs';
// Explicit API prefix for clarity
```

**Decision:** Keep current implicit approach for consistency across the codebase. Angular proxy handles `/api` prefix.

---

## 4. Files to Change

### 4.1 Services (27 files)

#### ❌ Platform Resources (Need to Change - 1 file)

```
modules/departments/services/departments.service.ts
  OLD: private baseUrl = '/inventory/master-data/departments';
  NEW: private baseUrl = '/v1/platform/departments';
```

#### ✅ Domain Resources (Correct - 26 files)

These are already correct and should NOT be changed:

**Master-Data:**

- adjustment-reasons.service.ts → `/inventory/master-data/adjustment-reasons`
- bank.service.ts → `/inventory/master-data/bank`
- budget-categories.service.ts → `/inventory/master-data/budget-categories`
- budget-types.service.ts → `/inventory/master-data/budget-types`
- budgets.service.ts → `/inventory/master-data/budgets`
- companies.service.ts → `/inventory/master-data/companies`
- contract-items.service.ts → `/inventory/master-data/contract-items`
- contracts.service.ts → `/inventory/master-data/contracts`
- dosage-forms.service.ts → `/inventory/master-data/dosage-forms`
- drug-components.service.ts → `/inventory/master-data/drug-components`
- drug-focus-lists.service.ts → `/inventory/master-data/drug-focus-lists`
- drug-generics.service.ts → `/inventory/master-data/drug-generics`
- drug-pack-ratios.service.ts → `/inventory/master-data/drug-pack-ratios`
- drug-units.service.ts → `/inventory/master-data/drug-units`
- drugs.service.ts → `/inventory/master-data/drugs`
- hospitals.service.ts → `/inventory/master-data/hospitals`
- locations.service.ts → `/inventory/master-data/locations`
- return-actions.service.ts → `/inventory/master-data/return-actions`

**Operations:**

- budget-allocations.service.ts → `/inventory/operations/budget-allocations`
- budget-plan-items.service.ts → `/inventory/operations/budget-plan-items`
- budget-plans.service.ts → `/inventory/operations/budget-plans`
- budget-reservations.service.ts → `/inventory/operations/budget-reservations`

**Budget (Subdomain):**

- budget-request-comments.service.ts → `/inventory/budget/budget-request-comments`
- budget-request-items.service.ts → `/inventory/budget/budget-request-items`
- budget-requests.service.ts → `/inventory/budget/budget-requests`

### 4.2 Components with Direct API Calls (1 file)

```
modules/budget-requests/components/budget-requests-form.component.ts
  Line: this.http.get<any>('/api/inventory/master-data/departments', {

  FIX: Replace with service call or change to:
       this.http.get<any>('/api/v1/platform/departments', {
```

---

## 5. Implementation Plan

### Phase 1: Analysis & Verification ✅ COMPLETED

- [x] Identify all API routes in inventory frontend
- [x] Categorize by Platform vs Domain layer
- [x] Document current vs correct routes
- [x] List all files requiring changes

### Phase 2: Update Department Service (Critical)

- [ ] Update `departments.service.ts` baseUrl
- [ ] Update `budget-requests-form.component.ts` direct call
- [ ] Test departments endpoints work correctly

### Phase 3: Create Shared Platform Services (Optional - Future)

- [ ] Create shared `platform-departments.service.ts` in core services
- [ ] Update inventory to use shared service instead of local one
- [ ] Remove duplicate departments module from inventory

### Phase 4: Testing & Verification

- [ ] Manual testing: departments CRUD in inventory
- [ ] Manual testing: budget requests form (departments dropdown)
- [ ] Verify no 404 errors in network tab
- [ ] Check all inventory modules still work

### Phase 5: Documentation

- [ ] Update API calling standards
- [ ] Document Platform vs Domain distinction
- [ ] Add examples to developer guide

---

## 6. Technical Details

### 6.1 Expected API Responses

**Before (404 Error):**

```bash
GET /api/inventory/master-data/departments?page=1&limit=25
→ 404 Not Found
```

**After (Success):**

```bash
GET /api/v1/platform/departments?page=1&limit=25
→ 200 OK with department data
```

### 6.2 Code Changes

**File: `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`**

```diff
@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private http = inject(HttpClient);
- private baseUrl = '/inventory/master-data/departments';
+ private baseUrl = '/v1/platform/departments';

  // ... rest of the code
}
```

**File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`**

```diff
  loadDepartments(): void {
    this.loadingDepartments.set(true);
    this.http
-     .get<any>('/api/inventory/master-data/departments', {
+     .get<any>('/api/v1/platform/departments', {
        params: new HttpParams()
          .set('page', '1')
          .set('limit', '1000'),
      })
      .subscribe({
        next: (response) => {
          // ... handle response
        },
      });
  }
```

---

## 7. Testing Strategy

### 7.1 Manual Testing Checklist

**Departments Module:**

- [ ] List departments → verify data loads
- [ ] Create department → verify success
- [ ] Edit department → verify update works
- [ ] Delete department → verify deletion
- [ ] Search/filter → verify results
- [ ] Pagination → verify page navigation

**Budget Requests Form:**

- [ ] Open create budget request
- [ ] Verify departments dropdown loads
- [ ] Select department → verify form updates
- [ ] Submit form → verify department saved correctly

### 7.2 Network Tab Verification

Check browser DevTools Network tab:

- [ ] No 404 errors for departments endpoints
- [ ] All requests to `/api/v1/platform/departments` succeed
- [ ] Response format matches expected schema

### 7.3 Regression Testing

Verify these modules still work:

- [ ] Drugs list and CRUD
- [ ] Budgets list and CRUD
- [ ] Contracts list and CRUD
- [ ] Budget allocations
- [ ] Budget plans

---

## 8. Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback:**

   ```bash
   git revert <commit-hash>
   pnpm run build
   ```

2. **Temporary Fix:**
   - Revert service file changes
   - Keep old `/inventory/master-data/departments` route

3. **Backend Compatibility:**
   - If needed, add temporary alias route in backend
   - Map `/inventory/master-data/departments` → `/v1/platform/departments`
   - Remove after frontend fully migrated

---

## 9. Success Criteria

- ✅ All departments API calls return 200 OK (not 404)
- ✅ Departments CRUD works in inventory module
- ✅ Budget requests form departments dropdown loads
- ✅ No console errors or network 404s
- ✅ All 26 domain routes continue to work
- ✅ Code follows layer-based routing architecture

---

## 10. Future Considerations

### 10.1 Create Shared Platform Services

Instead of each domain having its own departments service, create shared services:

```
apps/web/src/app/core/services/platform/
├── departments.service.ts      → /v1/platform/departments
├── users.service.ts            → /v1/platform/users
├── rbac.service.ts             → /v1/platform/rbac/*
└── settings.service.ts         → /v1/platform/settings
```

**Benefits:**

- Single source of truth for platform resources
- Avoid duplication across domains
- Easier to maintain
- Better type safety

### 10.2 API Prefix Configuration

Consider creating environment-based API prefix:

```typescript
// environment.ts
export const environment = {
  apiPrefix: '/api',
  platformPrefix: '/api/v1/platform',
  inventoryPrefix: '/api/inventory',
};

// service
private baseUrl = `${environment.platformPrefix}/departments`;
```

---

## 11. References

- [Layer-Based Routing Architecture](../architecture/layer-based-routing.md)
- [Backend Architecture](../architecture/backend-architecture.md)
- [API Calling Standard](../guides/development/api-calling-standard.md)
- [Domain Architecture Guide](../architecture/domain-architecture-guide.md)

---

## Appendix A: Complete File List

### Services Requiring Changes (1)

1. `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`

### Components Requiring Changes (1)

1. `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`

### Services Already Correct (26)

All other inventory services listed in Section 4.1 are correct and should NOT be changed.

---

**Specification Version:** 1.0
**Last Updated:** 2025-12-15
**Status:** Ready for Implementation
