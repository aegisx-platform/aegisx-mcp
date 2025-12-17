# Auth & RBAC Improvements - Tasks

## Task Breakdown

### Phase 1: Logging Improvements (High Priority)

#### Task 1.1: Remove Debug Console Logs from auth.strategies.ts

**Estimated Time:** 30 minutes
**Dependencies:** None

**Steps:**

1. [ ] Open `apps/api/src/layers/core/auth/strategies/auth.strategies.ts`
2. [ ] Replace all `console.log('[DEBUG]` with `request.log.debug()`
3. [ ] Add environment check for debug logs
4. [ ] Remove unnecessary debug statements
5. [ ] Test auth flow still works

**Acceptance Criteria:**

- [ ] Zero console.log statements in file
- [ ] Structured logging with context objects
- [ ] Auth flow unchanged

---

### Phase 2: Database Indexes (High Priority)

#### Task 2.1: Create Migration for RBAC Indexes

**Estimated Time:** 30 minutes
**Dependencies:** None

**Steps:**

1. [ ] Create new migration file
2. [ ] Add index on `user_roles(user_id, is_active)`
3. [ ] Add index on `role_permissions(role_id)`
4. [ ] Add index on `permissions(resource, action)`
5. [ ] Use CONCURRENTLY to avoid locking
6. [ ] Test migration up and down

**Acceptance Criteria:**

- [ ] Migration creates 3 indexes
- [ ] Migration is reversible
- [ ] No table locking during creation

#### Task 2.2: Run Migration and Verify

**Estimated Time:** 15 minutes
**Dependencies:** Task 2.1

**Steps:**

1. [ ] Run migration: `pnpm run db:migrate`
2. [ ] Verify indexes created: `\d+ user_roles`
3. [ ] Check index usage with EXPLAIN
4. [ ] Measure query performance improvement

**Acceptance Criteria:**

- [ ] All 3 indexes exist
- [ ] Query planner uses indexes
- [ ] Performance improved 30-50%

---

### Phase 3: Permission Cache Invalidation (High Priority)

#### Task 3.1: Create Permission Cache Invalidation Service

**Estimated Time:** 1 hour
**Dependencies:** None

**Steps:**

1. [ ] Create `permission-cache-invalidation.service.ts`
2. [ ] Implement `invalidateUser(userId)` method
3. [ ] Implement `invalidateUsers(userIds[])` method
4. [ ] Implement `invalidateUsersWithRole(roleId)` method
5. [ ] Implement `invalidateAll()` method
6. [ ] Add error handling
7. [ ] Add logging

**Acceptance Criteria:**

- [ ] All methods implemented
- [ ] Error handling doesn't block operations
- [ ] Structured logging added

#### Task 3.2: Integrate with RBAC Service - Role Assignment

**Estimated Time:** 45 minutes
**Dependencies:** Task 3.1

**Steps:**

1. [ ] Inject cache invalidation service into RbacService
2. [ ] Add invalidation to `assignRoleToUser()`
3. [ ] Add invalidation to `removeRoleFromUser()`
4. [ ] Add invalidation to `updateRoleExpiry()`
5. [ ] Test role assignment invalidates cache

**Acceptance Criteria:**

- [ ] Cache invalidated on role changes
- [ ] Tests verify invalidation called
- [ ] No breaking changes

#### Task 3.3: Integrate with RBAC Service - Permissions

**Estimated Time:** 45 minutes
**Dependencies:** Task 3.1

**Steps:**

1. [ ] Add invalidation to `updateRolePermissions()`
2. [ ] Add invalidation to `createPermission()`
3. [ ] Add invalidation to `updatePermission()`
4. [ ] Add invalidation to `deletePermission()`
5. [ ] Handle permission→role→users cascade

**Acceptance Criteria:**

- [ ] Cache invalidated on permission changes
- [ ] All affected users invalidated
- [ ] Tests verify correct users invalidated

#### Task 3.4: Integrate with RBAC Service - Bulk Operations

**Estimated Time:** 30 minutes
**Dependencies:** Task 3.1

**Steps:**

1. [ ] Add invalidation to `bulkAssignRoles()`
2. [ ] Add invalidation to `bulkRemoveRoles()`
3. [ ] Add invalidation to `bulkUpdatePermissions()`
4. [ ] Use parallel invalidation with Promise.all
5. [ ] Test bulk invalidation performance

**Acceptance Criteria:**

- [ ] Bulk operations invalidate all affected users
- [ ] Invalidation completes in <100ms for 100 users
- [ ] No N+1 invalidation calls

---

### Phase 4: Testing & Verification (Medium Priority)

#### Task 4.1: Write Unit Tests

**Estimated Time:** 1 hour
**Dependencies:** Tasks 3.1-3.4

**Steps:**

1. [ ] Test cache invalidation service methods
2. [ ] Test error handling
3. [ ] Test logging doesn't use console.log
4. [ ] Mock Redis for testing

**Acceptance Criteria:**

- [ ] 100% code coverage for invalidation service
- [ ] All error paths tested
- [ ] Tests pass

#### Task 4.2: Write Integration Tests

**Estimated Time:** 1 hour
**Dependencies:** Tasks 3.1-3.4

**Steps:**

1. [ ] Test assign role → cache invalidated
2. [ ] Test update permissions → users invalidated
3. [ ] Test bulk operations → parallel invalidation
4. [ ] Test cache miss after invalidation

**Acceptance Criteria:**

- [ ] End-to-end invalidation tested
- [ ] Real Redis used in integration tests
- [ ] Tests verify fresh permissions loaded

#### Task 4.3: Performance Testing

**Estimated Time:** 30 minutes
**Dependencies:** Task 2.2, 3.4

**Steps:**

1. [ ] Measure query time before/after indexes
2. [ ] Measure cache invalidation time
3. [ ] Load test with 1000 users
4. [ ] Verify no regression

**Acceptance Criteria:**

- [ ] Query time reduced 30-50%
- [ ] Cache invalidation <10ms per user
- [ ] Load test passes

---

### Phase 5: Documentation & Deployment (Low Priority)

#### Task 5.1: Update Documentation

**Estimated Time:** 30 minutes
**Dependencies:** All previous tasks

**Steps:**

1. [ ] Update `auth-rbac-review.md` with changes
2. [ ] Update architecture docs
3. [ ] Add cache invalidation diagram
4. [ ] Document new env variables

**Acceptance Criteria:**

- [ ] Docs reflect new implementation
- [ ] Diagrams updated
- [ ] Env vars documented

#### Task 5.2: Create Deployment Checklist

**Estimated Time:** 15 minutes
**Dependencies:** All previous tasks

**Steps:**

1. [ ] List pre-deployment checks
2. [ ] List post-deployment verification
3. [ ] Document rollback procedure
4. [ ] Create monitoring alerts

**Acceptance Criteria:**

- [ ] Deployment checklist complete
- [ ] Rollback plan documented
- [ ] Monitoring configured

---

## Summary

**Total Tasks:** 13
**Estimated Total Time:** 6-7 hours
**High Priority Tasks:** 8 (4-5 hours)
**Medium Priority Tasks:** 3 (2 hours)
**Low Priority Tasks:** 2 (45 minutes)

## Task Dependencies Graph

```
Phase 1: Logging
└─ Task 1.1 (Independent)

Phase 2: Indexes
├─ Task 2.1 (Independent)
└─ Task 2.2 (Depends on 2.1)

Phase 3: Cache Invalidation
├─ Task 3.1 (Independent)
├─ Task 3.2 (Depends on 3.1)
├─ Task 3.3 (Depends on 3.1)
└─ Task 3.4 (Depends on 3.1)

Phase 4: Testing
├─ Task 4.1 (Depends on 3.1-3.4)
├─ Task 4.2 (Depends on 3.1-3.4)
└─ Task 4.3 (Depends on 2.2, 3.4)

Phase 5: Documentation
├─ Task 5.1 (Depends on all)
└─ Task 5.2 (Depends on all)
```

## Parallel Execution Strategy

**Can be done in parallel:**

- Phase 1 + Phase 2.1
- Tasks 3.2, 3.3, 3.4 (after 3.1 done)
- Tasks 4.1, 4.2 (after Phase 3 done)

**Must be sequential:**

- Phase 2: 2.1 → 2.2
- Phase 3: 3.1 → (3.2 + 3.3 + 3.4)
- Phase 4: Wait for Phase 3
- Phase 5: Wait for all

## Risk Assessment

| Task    | Risk Level | Mitigation                      |
| ------- | ---------- | ------------------------------- |
| 1.1     | Low        | Easy to revert logging changes  |
| 2.1-2.2 | Medium     | Use CONCURRENTLY, test rollback |
| 3.1-3.4 | Medium     | Feature flag, error handling    |
| 4.1-4.3 | Low        | Tests can be fixed iteratively  |
| 5.1-5.2 | Low        | Documentation only              |

## Success Criteria

**Phase 1 Success:**

- ✅ No console.log in auth code
- ✅ Structured logging works

**Phase 2 Success:**

- ✅ 3 indexes created
- ✅ 30-50% query improvement

**Phase 3 Success:**

- ✅ Cache invalidated on changes
- ✅ No stale permissions

**Phase 4 Success:**

- ✅ All tests pass
- ✅ Performance meets targets

**Phase 5 Success:**

- ✅ Documentation complete
- ✅ Deployment ready
