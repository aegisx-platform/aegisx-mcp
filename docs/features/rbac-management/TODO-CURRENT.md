# RBAC Management - Current TODO List

**Last Updated**: 2025-10-29 (Session 47)
**Overall Status**: 🟡 60% Complete (Code Complete, Testing Incomplete)
**Critical Issues**: 3 blocking issues preventing functionality

---

## 🚨 CRITICAL - Must Fix Before Testing (Priority 1)

### Issue 1: Navigation Management Permission Mismatch

**Status**: ❌ Blocking
**Impact**: Navigation Management UI buttons won't show, API calls will fail 403

**Problem**:

```typescript
// Frontend uses (navigation-management.component.ts):
*hasPermission="'navigation:create'"  // ❌ Not in database
*hasPermission="'navigation:update'"  // ❌ Not in database
*hasPermission="'navigation:delete'"  // ❌ Not in database

// Backend API requires (navigation-items.routes.ts):
fastify.verifyPermission('navigation', 'read')  // Needs: navigation:read

// Database has:
- navigation:view    ✅ Exists
- navigation:manage  ✅ Exists
```

**Fix Required**:

- [ ] **Task 1.1**: Update Frontend UI permissions
  - File: `apps/web/src/app/core/rbac/pages/navigation-management/navigation-management.component.ts`
  - Change: `navigation:create` → `navigation:manage`
  - Change: `navigation:update` → `navigation:manage`
  - Change: `navigation:delete` → `navigation:manage`
  - Lines: 91, 102, 108, 142, 168, 178, 196

- [ ] **Task 1.2**: Update Backend API permissions
  - File: `apps/api/src/core/navigation/navigation-items.routes.ts`
  - Verify all routes use correct permission format
  - Add `navigation:manage` permission checks for POST/PUT/DELETE

- [ ] **Task 1.3**: Add missing permissions to database seed
  - File: `apps/api/src/database/seeds/003_navigation_and_permissions.ts`
  - Add: `{ resource: 'navigation', action: 'read', description: 'View navigation items' }`
  - Add: `{ resource: 'navigation', action: 'create', description: 'Create navigation items' }`
  - Add: `{ resource: 'navigation', action: 'update', description: 'Update navigation items' }`
  - Add: `{ resource: 'navigation', action: 'delete', description: 'Delete navigation items' }`

---

### Issue 2: RBAC Routes Permission Mismatch

**Status**: ❌ Blocking
**Impact**: RBAC dashboard and pages will return 403 even for admins

**Problem**:

```typescript
// rbac.routes.ts uses (NOT FIXED YET):
permissions: ['rbac:roles:list', '*:*']; // ❌ Should be 'roles:read'
permissions: ['rbac:permissions:list', '*:*']; // ❌ Should be 'permissions:read'
permissions: ['rbac:user-roles:list', '*:*']; // ❌ Should be 'roles:read'
permissions: ['rbac:stats:read', '*:*']; // ❌ Should be 'dashboard:view'
```

**Fix Required**:

- [ ] **Task 2.1**: Fix RBAC route permissions
  - File: `apps/web/src/app/core/rbac/rbac.routes.ts`
  - Line 21: Change `'rbac:stats:read'` → `'dashboard:view'`
  - Line 34: Change `'rbac:roles:list'` → `'roles:read'`
  - Line 47: Change `'rbac:permissions:list'` → `'permissions:read'`
  - Line 60: Change `'rbac:user-roles:list'` → `'roles:read'`

---

### Issue 3: Database Not Running

**Status**: ❌ Blocking
**Impact**: Cannot test anything, API won't start

**Error**:

```
Error: Required plugin knex failed to load
→ Docker/Orbstack not running
→ PostgreSQL containers not started
```

**Fix Required**:

- [ ] **Task 3.1**: User must start Docker/Orbstack (macOS GUI app)
- [ ] **Task 3.2**: Start database containers: `pnpm run docker:up`
- [ ] **Task 3.3**: Run migrations: `pnpm run db:migrate`
- [ ] **Task 3.4**: Seed database: `pnpm run db:seed`
- [ ] **Task 3.5**: Verify containers: `pnpm run docker:ps`

---

## ✅ COMPLETE - Session 47 Achievements

### Navigation Management UI (100% Code Complete)

- [x] **Backend API** - NavigationItemsController with 8 methods
- [x] **Backend Routes** - 8 endpoints registered in navigation.plugin.ts
- [x] **Backend Service** - 9 wrapper methods in NavigationService
- [x] **Frontend Service** - NavigationItemsService with 8 API methods
- [x] **Frontend Component** - NavigationManagementComponent (838 lines)
- [x] **Frontend Dialog** - NavigationItemDialogComponent (700 lines, 3 tabs)
- [x] **Route Registration** - Added to rbac.routes.ts
- [x] **TypeScript Build** - Both API and Web builds passing
- [x] **Git Commit** - Committed (2688610) and pushed to remote

### RBAC Permission System (100% Code Complete)

- [x] **Permission Directive** - HasPermissionDirective for UI visibility
- [x] **Permission Guards** - PermissionGuard for route protection
- [x] **Role Guards** - RoleGuard for role-based routing
- [x] **Permission Mapping** - Fixed 35 instances across 6 files
- [x] **Navigation Filtering** - Permission-based menu filtering
- [x] **Documentation** - 3 comprehensive docs created

### System Cleanup (100% Complete)

- [x] **System Settings Removed** - 9 deprecated files deleted
- [x] **Documentation Updated** - PROJECT_STATUS.md, CLAUDE.md updated
- [x] **Seed File Fixed** - Syntax error in 003_navigation_and_permissions.ts

---

## 🧪 TESTING - Must Complete (Priority 2)

### Backend API Testing (0% Complete)

- [ ] **Task 4.1**: Start API server successfully
  - Command: `pnpm run dev:api`
  - Expected: Server starts on port from .env.local (3383)
  - Verify: `curl http://localhost:3383/api/health`

- [ ] **Task 4.2**: Test Navigation Items Endpoints
  - [ ] GET /api/navigation-items (list all)
  - [ ] GET /api/navigation-items/:id (get single)
  - [ ] POST /api/navigation-items (create)
  - [ ] PUT /api/navigation-items/:id (update)
  - [ ] DELETE /api/navigation-items/:id (delete)
  - [ ] POST /api/navigation-items/reorder (reorder)
  - [ ] GET /api/navigation-items/:id/permissions (get permissions)
  - [ ] POST /api/navigation-items/:id/permissions (assign permissions)

- [ ] **Task 4.3**: Test Permission Checks
  - [ ] Verify 403 without authentication
  - [ ] Verify 403 without proper permissions
  - [ ] Verify 200 with admin user (_:_ permission)
  - [ ] Verify 200 with navigation:manage permission

- [ ] **Task 4.4**: Test Error Handling
  - [ ] Invalid UUID returns 400
  - [ ] Non-existent ID returns 404
  - [ ] Duplicate key returns 409
  - [ ] Invalid body returns 422

### Frontend UI Testing (0% Complete)

- [ ] **Task 5.1**: Start Web server
  - Command: `pnpm run dev:web`
  - Expected: Server starts on port 4200
  - Verify: Open http://localhost:4200

- [ ] **Task 5.2**: Test Admin Login
  - [ ] Navigate to login page
  - [ ] Login with admin@aegisx.local / Admin123!
  - [ ] Verify redirect to dashboard
  - [ ] Verify navigation menu shows RBAC Management

- [ ] **Task 5.3**: Test Navigation Management UI
  - [ ] Navigate to /rbac/navigation
  - [ ] Verify table loads with navigation items
  - [ ] Verify all action buttons visible (Create, Edit, Delete, etc.)
  - [ ] Test Create dialog opens
  - [ ] Test Edit dialog opens with data
  - [ ] Test View dialog opens (read-only)
  - [ ] Test Delete confirmation dialog
  - [ ] Test Bulk operations (if any)

- [ ] **Task 5.4**: Test CRUD Operations
  - [ ] **Create**: Add new navigation item
  - [ ] **Read**: View item in table and detail dialog
  - [ ] **Update**: Edit item and save changes
  - [ ] **Delete**: Remove item and verify removed
  - [ ] **Reorder**: Change sort_order and verify

- [ ] **Task 5.5**: Test Permission System
  - [ ] Verify all 35 UI elements respond to permissions
  - [ ] Test with admin user (should see everything)
  - [ ] Create test user with limited permissions
  - [ ] Verify buttons hide correctly

### Integration Testing (0% Complete)

- [ ] **Task 6.1**: Frontend-Backend Integration
  - [ ] Verify API URLs match (/navigation-items)
  - [ ] Verify request body formats match backend schemas
  - [ ] Verify response formats match frontend interfaces
  - [ ] Test error handling shows proper messages

- [ ] **Task 6.2**: Permission Flow Integration
  - [ ] User login → Token → API calls with auth header
  - [ ] Backend verifyPermission checks work
  - [ ] Frontend permission directive hides/shows elements
  - [ ] Route guards prevent unauthorized access

- [ ] **Task 6.3**: Data Flow Testing
  - [ ] Create item in UI → POST to API → Database insert → GET returns new item
  - [ ] Update item → PUT to API → Database update → GET returns updated item
  - [ ] Delete item → DELETE to API → Database delete → GET returns 404

---

## 📝 DOCUMENTATION - Updates Needed (Priority 3)

### API Documentation

- [ ] **Task 7.1**: Update API_CONTRACTS.md
  - [ ] Add Navigation Items endpoints section
  - [ ] Document all 8 endpoints with request/response schemas
  - [ ] Add permission requirements for each endpoint
  - [ ] Add error response examples

- [ ] **Task 7.2**: Update OpenAPI/Swagger
  - [ ] Verify Swagger UI shows navigation-items endpoints
  - [ ] Test "Try it out" feature works
  - [ ] Update descriptions and tags

### Progress Documentation

- [ ] **Task 7.3**: Update PROGRESS.md
  - [ ] Add Session 47 to session log
  - [ ] Update overall progress percentage
  - [ ] Document Navigation Management completion
  - [ ] Document remaining testing tasks

- [ ] **Task 7.4**: Update FEATURE.md
  - [ ] Mark Navigation Management as complete
  - [ ] Update success criteria checklist
  - [ ] Document known issues and fixes

---

## 🔄 REMAINING RBAC FEATURES (Priority 4)

### Role Management (From old TODO)

**Status**: 🟡 UI exists, needs testing and fixes

- [ ] **Task 8.1**: Review existing Role Management component
  - File: `apps/web/src/app/core/rbac/pages/role-management/role-management.component.ts`
  - Verify permission names match database
  - Test CRUD operations work

- [ ] **Task 8.2**: Fix any permission mismatches found
- [ ] **Task 8.3**: Test role hierarchy functionality
- [ ] **Task 8.4**: Test bulk operations

### Permission Management (From old TODO)

**Status**: 🟡 UI exists, needs testing and fixes

- [ ] **Task 9.1**: Review existing Permission Management component
  - File: `apps/web/src/app/core/rbac/pages/permission-management/permission-management.component.ts`
  - Verify permission names match database
  - Test CRUD operations work

- [ ] **Task 9.2**: Fix any permission mismatches found
- [ ] **Task 9.3**: Test category filtering
- [ ] **Task 9.4**: Test permission assignment

### User Role Assignment (From old TODO)

**Status**: 🟡 UI exists, needs testing and fixes

- [ ] **Task 10.1**: Review existing User Role Assignment component
  - File: `apps/web/src/app/core/rbac/pages/user-role-assignment/user-role-assignment.component.ts`
  - Verify permission names match database
  - Test role assignment works

- [ ] **Task 10.2**: Fix any permission mismatches found
- [ ] **Task 10.3**: Test bulk assignment operations
- [ ] **Task 10.4**: Test expiration date functionality

### RBAC Dashboard (From old TODO)

**Status**: 🟡 UI exists, needs testing and fixes

- [ ] **Task 11.1**: Review existing RBAC Dashboard component
  - File: `apps/web/src/app/core/rbac/pages/rbac-dashboard/rbac-dashboard.component.ts`
  - Verify permission names match database
  - Test statistics display

- [ ] **Task 11.2**: Fix any permission mismatches found
- [ ] **Task 11.3**: Test quick action buttons
- [ ] **Task 11.4**: Test navigation to other pages

---

## 🎯 QUALITY ASSURANCE (Priority 5)

### Code Quality Checks

- [ ] **Task 12.1**: Run linter
  - Command: `nx lint api`
  - Command: `nx lint web`
  - Fix any linting errors found

- [ ] **Task 12.2**: TypeScript strict checks
  - Verify no `any` types used
  - Verify all types properly defined
  - Run: `nx build api --skip-nx-cache`
  - Run: `nx build web --skip-nx-cache`

- [ ] **Task 12.3**: Code review checklist
  - [ ] No console.log statements in production code
  - [ ] No commented-out code
  - [ ] Proper error handling everywhere
  - [ ] Consistent naming conventions
  - [ ] Proper TypeScript types (no `any`)

### Security Checks

- [ ] **Task 13.1**: Permission system audit
  - [ ] Verify all routes have permission checks
  - [ ] Verify no permission bypass possible
  - [ ] Test privilege escalation scenarios
  - [ ] Verify wildcard (_:_) only for admins

- [ ] **Task 13.2**: Input validation audit
  - [ ] All API endpoints validate inputs
  - [ ] TypeBox schemas prevent invalid data
  - [ ] SQL injection not possible (using Knex)
  - [ ] XSS protection in place

### Performance Checks

- [ ] **Task 14.1**: API response times
  - [ ] GET endpoints < 100ms
  - [ ] POST/PUT endpoints < 200ms
  - [ ] Bulk operations < 2s for 100 items

- [ ] **Task 14.2**: Frontend performance
  - [ ] Initial page load < 2s
  - [ ] Table rendering < 500ms
  - [ ] Dialog open < 100ms

---

## 🚀 DEPLOYMENT PREPARATION (Priority 6)

### Pre-deployment Checklist

- [ ] **Task 15.1**: All tests passing
  - [ ] Unit tests: >90% coverage
  - [ ] Integration tests: All scenarios covered
  - [ ] E2E tests: Happy path working

- [ ] **Task 15.2**: Database migrations ready
  - [ ] Migration files created (if needed)
  - [ ] Rollback tested
  - [ ] Seed data updated

- [ ] **Task 15.3**: Environment configuration
  - [ ] .env.example updated
  - [ ] Required environment variables documented
  - [ ] Production settings reviewed

- [ ] **Task 15.4**: Documentation complete
  - [ ] API docs updated
  - [ ] User guide created
  - [ ] Developer guide updated
  - [ ] CHANGELOG.md updated

---

## 📊 PROGRESS TRACKING

### Session 47 Summary (2025-10-29)

**Completed**:

- ✅ Navigation Management UI (100% code complete)
- ✅ RBAC Permission System infrastructure
- ✅ Permission mapping fixes (35 instances)
- ✅ System Settings cleanup
- ✅ Git commit and push

**Issues Found**:

- ❌ Permission naming mismatches (3 areas)
- ❌ Database not running (Docker issue)
- ❌ Zero testing performed

**Next Session Must Do**:

1. Fix all permission mismatches (Tasks 1.1-2.1)
2. Start Docker and database (Tasks 3.1-3.5)
3. Complete API testing (Tasks 4.1-4.4)
4. Complete UI testing (Tasks 5.1-5.5)

### Overall RBAC Module Status

```
Navigation Management: ████████░░ 80% (Code: 100%, Testing: 0%)
Role Management:       ████░░░░░░ 40% (Code: 80%, Testing: 0%)
Permission Management: ████░░░░░░ 40% (Code: 80%, Testing: 0%)
User Role Assignment:  ████░░░░░░ 40% (Code: 80%, Testing: 0%)
RBAC Dashboard:        ████░░░░░░ 40% (Code: 80%, Testing: 0%)
Permission System:     ███████░░░ 70% (Infrastructure: 100%, Integration: 40%)

Overall RBAC Module:   ████░░░░░░ 50% Complete
```

### Blocking Issues Count

- **Critical (P1)**: 3 issues
- **High (P2)**: 0 issues
- **Medium (P3)**: 4 tasks
- **Low (P4-P6)**: 25 tasks

### Estimated Time to Complete

- **Fix Critical Issues**: 1-2 hours
- **Complete Testing**: 3-4 hours
- **Fix Found Issues**: 2-3 hours
- **Complete Documentation**: 1-2 hours
- **Quality Assurance**: 2-3 hours
- **Total**: 9-14 hours (~2 days)

---

## 🎯 SUCCESS CRITERIA

### Definition of Done for Navigation Management

- [ ] All permission mismatches fixed
- [ ] API endpoints tested and working
- [ ] UI tested with real data
- [ ] CRUD operations working end-to-end
- [ ] Permission system verified
- [ ] Documentation updated
- [ ] No critical bugs found
- [ ] Code reviewed and approved

### Definition of Done for RBAC Module

- [ ] All 5 pages working (Dashboard, Roles, Permissions, User-Roles, Navigation)
- [ ] All permission checks working correctly
- [ ] All CRUD operations tested
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Ready for production deployment

---

**Last Updated**: 2025-10-29 23:45
**Next Review**: After fixing critical issues
**Responsible**: Development Team
**Reviewer**: Technical Lead
