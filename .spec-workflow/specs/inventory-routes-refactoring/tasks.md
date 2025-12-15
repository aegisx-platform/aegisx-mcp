# Tasks Document

## Implementation Tasks

- [x] 1. Update departments service to use Platform Layer endpoint
  - File: `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
  - Change baseUrl from `/inventory/master-data/departments` to `/v1/platform/departments`
  - Verify service interface remains unchanged
  - Purpose: Fix 404 errors by routing to correct platform endpoint
  - _Leverage: Existing service pattern, HttpClient_
  - _Requirements: 1.1, 1.2_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: Frontend Developer with expertise in Angular services and HTTP communication

    Task: Update the DepartmentService to use the correct Platform Layer endpoint following requirements 1.1 and 1.2. Change the baseUrl property from `/inventory/master-data/departments` to `/v1/platform/departments`. This is a single-line change that corrects the routing layer assignment.

    Restrictions:
    - ONLY change the baseUrl property value
    - Do NOT modify any method implementations
    - Do NOT change service interfaces or method signatures
    - Do NOT add new dependencies or imports
    - Maintain exact same functionality, only endpoint URL changes

    \_Leverage:
    - File: `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
    - Existing HttpClient and CRUD pattern

    \_Requirements:
    - 1.1: departments service must use `/v1/platform/departments` endpoint
    - 1.2: departments list page must return 200 OK with data

    Success:
    - baseUrl property changed to `/v1/platform/departments`
    - TypeScript compiles without errors
    - Service interface unchanged
    - Ready for testing with platform endpoint

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Make the code change
    3. Use log-implementation tool to record:
       - artifacts.functions: Document the service methods (getAll, getById, create, update, delete) with their purposes and signatures
       - filesModified: List the departments.service.ts file
       - statistics: Count lines changed (should be 1 line modified)
    4. Mark this task as complete [x] in tasks.md

- [x] 2. Refactor budget requests form to use service layer
  - Files:
    - `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`
  - Inject DepartmentService using Angular inject() function
  - Replace direct HTTP call in loadDepartments() with service call
  - Update error handling to match service response format
  - Purpose: Follow service layer architecture pattern
  - _Leverage: DepartmentService from task 1, Angular inject() function, existing form component patterns_
  - _Requirements: 2.1, 2.2_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: Frontend Developer with expertise in Angular components and dependency injection

    Task: Refactor the BudgetRequestsFormComponent to use DepartmentService instead of direct HTTP calls following requirements 2.1 and 2.2. Replace the direct HttpClient.get() call with proper service injection and method call.

    Restrictions:
    - MUST use Angular inject() function for dependency injection
    - Do NOT modify the overall component logic or form behavior
    - Do NOT change the departments dropdown UI
    - Maintain existing error handling patterns
    - Follow existing component patterns in the codebase

    \_Leverage:
    - File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`
    - DepartmentService from task 1 (inject it)
    - Existing component service injection patterns
    - Angular signals for state management (loadingDepartments, departments)

    \_Requirements:
    - 2.1: Component must use service layer instead of direct HTTP
    - 2.2: Departments dropdown must load using platform endpoint

    Success:
    - DepartmentService injected using inject() function
    - loadDepartments() method uses departmentService.getAll()
    - Direct HttpClient call removed from component
    - Departments dropdown still populates correctly
    - Error handling maintained
    - TypeScript compiles without errors

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Make the code changes (inject service, update loadDepartments method)
    3. Use log-implementation tool to record:
       - artifacts.components: Document the BudgetRequestsFormComponent with its purpose, location, and updated dependencies
       - artifacts.integrations: Document how the component now integrates with DepartmentService
       - filesModified: List the budget-requests-form.component.ts file
       - statistics: Count lines added/removed
    4. Mark this task as complete [x] in tasks.md

- [ ] 3. Test departments service with platform endpoint
  - File: Manual testing in browser
  - Navigate to inventory → master-data → departments
  - Verify list loads without 404 errors
  - Test all CRUD operations (create, read, update, delete)
  - Check Network tab for correct endpoint calls
  - Purpose: Verify platform endpoint integration works correctly
  - _Leverage: Browser DevTools, Network tab_
  - _Requirements: 1.3, 1.4, 3.1_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: QA Engineer with expertise in manual testing and browser DevTools

    Task: Perform comprehensive manual testing of the departments module following requirements 1.3, 1.4, and 3.1. Verify that all CRUD operations work correctly with the new platform endpoint and that no 404 errors occur.

    Restrictions:
    - This is manual testing only, no code changes
    - Do NOT proceed if any critical functionality is broken
    - Do NOT ignore 404 errors or console warnings
    - Must test ALL CRUD operations, not just list view

    \_Leverage:
    - Browser: Chrome/Firefox DevTools
    - Network tab for monitoring API calls
    - Console for checking errors

    \_Requirements:
    - 1.3: Departments CRUD operations must work successfully
    - 1.4: Departments module must load without errors
    - 3.1: All requests to departments must return 200 OK

    Success:
    - Departments list page loads with data (200 OK)
    - Create department works successfully
    - Edit department updates correctly
    - Delete department removes record
    - Network tab shows all requests to `/api/v1/platform/departments` return 200 OK
    - No 404 errors in Network tab
    - No console errors or warnings
    - Search, filter, and pagination work correctly

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Perform all manual tests listed above
    3. Use log-implementation tool to record:
       - summary: "Completed manual testing of departments CRUD with platform endpoint"
       - artifacts: {} (empty, as this is testing only)
       - filesModified: []
       - filesCreated: []
       - statistics: { linesAdded: 0, linesRemoved: 0 }
    4. Mark this task as complete [x] in tasks.md

- [ ] 4. Test budget requests form departments dropdown
  - File: Manual testing in browser
  - Navigate to inventory → budget → budget-requests
  - Click "Create New" button
  - Verify departments dropdown loads successfully
  - Select a department and verify form updates
  - Submit form and verify department is saved
  - Purpose: Verify service layer integration in form component
  - _Leverage: Browser DevTools, Network tab_
  - _Requirements: 2.3, 2.4_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: QA Engineer with expertise in form testing and user workflows

    Task: Test the budget requests form to verify the departments dropdown works correctly after refactoring to use DepartmentService following requirements 2.3 and 2.4.

    Restrictions:
    - This is manual testing only, no code changes
    - Do NOT proceed if dropdown fails to load
    - Must test complete form submission workflow
    - Verify department is actually saved in the request

    \_Leverage:
    - Browser: Chrome/Firefox DevTools
    - Network tab for monitoring API calls
    - Form UI in budget requests module

    \_Requirements:
    - 2.3: Form must call service layer, not direct HTTP
    - 2.4: Departments dropdown must populate successfully

    Success:
    - Budget requests form opens successfully
    - Departments dropdown loads with data
    - Network tab shows call to `/api/v1/platform/departments` returns 200 OK
    - Selecting a department updates form state
    - Form submission includes selected department ID
    - No console errors during form interaction
    - Service layer integration verified (no direct HTTP calls in Network tab from component)

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Perform all manual tests listed above
    3. Use log-implementation tool to record:
       - summary: "Completed manual testing of budget requests form departments dropdown"
       - artifacts: {} (empty, as this is testing only)
       - filesModified: []
       - filesCreated: []
       - statistics: { linesAdded: 0, linesRemoved: 0 }
    4. Mark this task as complete [x] in tasks.md

- [ ] 5. Verify domain services remain functional (regression testing)
  - Files: All 26 inventory domain services (no modifications)
  - Spot check 5 key modules: drugs, budgets, contracts, budget-allocations, budget-plans
  - Verify list pages load successfully
  - Test one CRUD operation per module
  - Check Network tab for correct domain endpoints
  - Purpose: Ensure refactoring didn't break existing functionality
  - _Leverage: Browser DevTools, existing inventory modules_
  - _Requirements: 3.1, 3.2, 3.3_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: QA Engineer with expertise in regression testing

    Task: Perform regression testing on inventory domain services following requirements 3.1, 3.2, and 3.3. Verify that all inventory-specific routes continue to work correctly after the platform layer refactoring.

    Restrictions:
    - This is regression testing only, no code changes
    - Must test at least 5 different modules
    - Do NOT skip testing if one module fails
    - Document any failures found

    \_Leverage:
    - Browser: Chrome/Firefox DevTools
    - Network tab for monitoring API calls
    - Existing inventory modules (drugs, budgets, contracts, etc.)

    \_Requirements:
    - 3.1: Domain resources must use `/inventory/{section}/{resource}` pattern
    - 3.2: All 26 domain services must continue to work
    - 3.3: No unintended side effects from refactoring

    Modules to Test:
    1. Drugs (master-data)
    2. Budgets (master-data)
    3. Contracts (master-data)
    4. Budget Allocations (operations)
    5. Budget Plans (operations)

    Success:
    - All 5 tested modules load list pages successfully
    - Each module's CRUD operation tested works correctly
    - Network tab shows all requests to `/api/inventory/*` endpoints return 200 OK
    - No 404 errors in Network tab
    - No console errors or warnings
    - Pagination, search, and filtering work in tested modules
    - No unexpected changes in module behavior

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Perform regression tests on all 5 modules
    3. Use log-implementation tool to record:
       - summary: "Completed regression testing of 5 inventory domain modules"
       - artifacts: {} (empty, as this is testing only)
       - filesModified: []
       - filesCreated: []
       - statistics: { linesAdded: 0, linesRemoved: 0 }
    4. Mark this task as complete [x] in tasks.md

- [x] 6. Run build and verify no errors
  - Command: `pnpm run build`
  - Verify TypeScript compilation succeeds
  - Check for any new ESLint warnings
  - Ensure no build errors introduced
  - Purpose: Confirm code quality and build stability
  - _Leverage: pnpm build command, TypeScript compiler_
  - _Requirements: All (general quality assurance)_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: DevOps Engineer with expertise in build systems and CI/CD

    Task: Run the production build to verify that all code changes compile correctly and no build errors were introduced by the refactoring.

    Restrictions:
    - Must run `pnpm run build`, not just `pnpm run dev`
    - Do NOT proceed to next tasks if build fails
    - Address any TypeScript errors immediately
    - Check for and investigate any new ESLint warnings

    \_Leverage:
    - Command: `pnpm run build`
    - TypeScript compiler output
    - ESLint output

    \_Requirements:
    - All requirements (ensuring code quality)

    Success:
    - `pnpm run build` completes successfully
    - Exit code 0 (no errors)
    - No TypeScript compilation errors
    - No new ESLint errors (warnings acceptable if minor)
    - Build artifacts generated in dist/ directory
    - Ready for deployment

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Run `pnpm run build` command
    3. Use log-implementation tool to record:
       - summary: "Successfully ran production build - all checks passed"
       - artifacts: {} (empty, as this is build verification)
       - filesModified: []
       - filesCreated: []
       - statistics: { linesAdded: 0, linesRemoved: 0 }
    4. Mark this task as complete [x] in tasks.md

- [x] 7. Update documentation (optional but recommended)
  - Files: Update relevant documentation if needed
  - Document the Platform vs Domain layer distinction
  - Add examples of correct routing patterns
  - Update any developer guides mentioning departments
  - Purpose: Help future developers understand the architecture
  - _Leverage: Existing documentation in docs/ directory_
  - _Requirements: General maintainability_
  - \_Prompt: |
    Implement the task for spec inventory-routes-refactoring, first run spec-workflow-guide to get the workflow guide then implement the task:

    Role: Technical Writer with expertise in developer documentation

    Task: Update project documentation to reflect the Platform vs Domain layer routing patterns, ensuring future developers understand when to use each layer.

    Restrictions:
    - This task is OPTIONAL - only do if time permits
    - Do NOT create new documentation files unless necessary
    - Update existing docs rather than creating new ones
    - Keep documentation concise and example-driven

    \_Leverage:
    - Existing documentation in docs/ directory
    - docs/guides/development/api-calling-standard.md
    - docs/architecture/backend-architecture.md

    \_Requirements:
    - General maintainability and knowledge sharing

    Success:
    - Platform vs Domain routing distinction documented clearly
    - Examples added showing correct endpoint patterns
    - Decision matrix for choosing Platform vs Domain layer
    - Developer guide updated if it mentions departments
    - Documentation is clear and easy to understand

    After completing this task:
    1. Mark this task as in-progress [-] in tasks.md before starting
    2. Update relevant documentation files
    3. Use log-implementation tool to record:
       - summary: "Updated documentation for Platform vs Domain routing patterns"
       - artifacts: {} (or document any new documentation sections added)
       - filesModified: List any .md files updated
       - filesCreated: List any new documentation files (if created)
       - statistics: Count lines added/removed in documentation
    4. Mark this task as complete [x] in tasks.md

## Task Summary

**Total Tasks:** 7

- **Code Changes:** 2 tasks (tasks 1-2)
- **Testing:** 4 tasks (tasks 3-6)
- **Documentation:** 1 task (task 7, optional)

**Estimated Effort:**

- Code changes: ~15 minutes
- Testing: ~30 minutes
- Documentation: ~15 minutes (optional)
- **Total: ~45-60 minutes**

**Critical Path:**

1. Task 1 (update service) → MUST complete first
2. Task 2 (refactor component) → Depends on task 1
3. Task 3-6 (testing) → Can be done in parallel after task 2
4. Task 7 (documentation) → Optional, can be done last

**Risk Level:** Low

- Only 2 files modified
- Changes are isolated and well-defined
- Comprehensive testing plan
- Clear rollback strategy available
