# Tasks Document

## Phase 1: Backend User API Enhancement

- [x] 1. Add department_id to Backend User Types
  - File: `apps/api/src/layers/platform/users/users.types.ts`
  - Add `department_id?: number | null` to User, CreateUserRequest, UpdateUserRequest interfaces
  - Purpose: Enable department context in backend user data structures
  - _Leverage: `apps/api/src/layers/platform/users/users.types.ts` (existing User interface)_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend TypeScript Developer specializing in type systems and data models | Task: Add department_id field (nullable number) to User, CreateUserRequest, and UpdateUserRequest interfaces in users.types.ts following REQ-2, ensuring backward compatibility with existing code | Restrictions: Do not modify existing fields, maintain nullable type for backward compatibility, do not change interface names | Success: All user type interfaces include department_id field, TypeScript compiles without errors, existing code continues to work | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Implement the code changes, (3) Run log-implementation tool with detailed artifacts (interfaces modified, location, purpose), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 2. Add department_id to Backend User Schemas
  - File: `apps/api/src/layers/platform/users/users.schemas.ts`
  - Add `department_id: Type.Optional(Type.Union([Type.Number(), Type.Null()]))` to TypeBox schemas
  - Purpose: Enable TypeBox validation for department_id field
  - _Leverage: `apps/api/src/layers/platform/users/users.schemas.ts` (existing CreateUserSchema, UpdateUserSchema)_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with expertise in TypeBox schema validation | Task: Add department_id field to CreateUserSchema and UpdateUserSchema in users.schemas.ts following REQ-2, using Type.Optional with Union of Number and Null for nullable validation | Restrictions: Must use TypeBox Type.Optional and Type.Union, maintain existing schema structure, ensure schema validation passes | Success: Schemas include department_id with proper nullable validation, schema compilation succeeds, API validation works correctly | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Implement the schema changes, (3) Run log-implementation tool with detailed artifacts (schemas modified, validation rules, location), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 3. Update Auth Login to Include department_id
  - File: `apps/api/src/layers/core/auth/auth.service.ts`
  - Modify login response to include department_id from user profile
  - Ensure JWT payload or response includes department_id
  - Purpose: Make department context available during authentication
  - _Leverage: `apps/api/src/layers/core/auth/auth.service.ts` (existing login method), `apps/api/src/layers/platform/users/users.repository.ts` (user queries)_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Security Engineer specializing in authentication and JWT | Task: Modify auth login service to include department_id in user response following REQ-1, ensuring department context is available after authentication without breaking existing auth flow | Restrictions: Do not modify JWT structure if not necessary, maintain existing authentication logic, ensure backward compatibility with clients not using department | Success: Login response includes department_id field, existing auth flow continues to work, department_id is null for users without assignment | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Implement auth service changes, (3) Run log-implementation tool with detailed artifacts (auth methods modified, response format changes, location), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 4. Add Department Validation on User Update
  - File: `apps/api/src/layers/platform/users/users.service.ts`
  - Add validation logic to check if department exists when department_id is provided
  - Query departments table to validate department_id
  - Purpose: Ensure data integrity when assigning departments to users
  - _Leverage: `apps/api/src/layers/platform/users/users.service.ts` (existing update method), Department repository or service for validation_
  - _Requirements: REQ-5_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with expertise in data validation and database integrity | Task: Add department_id validation in user update service following REQ-5, querying departments table to ensure valid assignment while allowing null values | Restrictions: Must validate only when department_id is provided (not null), do not block updates if department is inactive (just warn), maintain existing update logic | Success: Invalid department_id throws clear error, null department_id allowed, inactive departments trigger warning but allow assignment | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Implement validation logic, (3) Run log-implementation tool with detailed artifacts (validation functions added, error handling, integration points), (4) Edit tasks.md and change status from [-] to [x]_

## Phase 2: Frontend Auth Service Enhancement

- [x] 5. Add department_id to Frontend Auth User Interface
  - File: `apps/web/src/app/core/auth/services/auth.service.ts`
  - Add `department_id?: number | null` to User interface (lines 5-15)
  - Purpose: Store department context in frontend authentication state
  - _Leverage: `apps/web/src/app/core/auth/services/auth.service.ts` (existing User interface and auth state management)_
  - _Requirements: REQ-1, REQ-3_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend TypeScript Developer specializing in Angular and state management | Task: Add department_id field to User interface in auth.service.ts following REQ-1 and REQ-3, ensuring department context is stored in authentication state using Angular signals | Restrictions: Do not modify existing User fields, maintain nullable type, ensure currentUser signal includes department_id | Success: User interface includes department_id, auth state stores department after login, existing auth functionality unchanged | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Add field to interface, (3) Run log-implementation tool with detailed artifacts (interface modified, signal state changes, location), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 6. Test Auth Integration with Department
  - File: `apps/web/src/app/core/auth/services/auth.service.spec.ts`
  - Add unit tests for department_id in login and profile flows
  - Test null department_id handling
  - Purpose: Ensure authentication correctly handles department context
  - _Leverage: `apps/web/src/app/core/auth/services/auth.service.spec.ts` (existing test structure and mocks)_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in Angular testing and Jasmine/Karma | Task: Create comprehensive unit tests for auth service department integration following REQ-1, testing login with/without department_id and signal state updates | Restrictions: Must test both success scenarios (with department) and edge cases (null department), use existing test utilities, maintain test isolation | Success: Tests verify department_id in currentUser signal, null handling works correctly, all tests pass | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write test cases, (3) Run log-implementation tool with detailed artifacts (test cases added, coverage areas, location), (4) Edit tasks.md and change status from [-] to [x]_

## Phase 3: Budget Request Form Auto-Population

- [x] 7. Inject AuthService in Budget Request Form
  - File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`
  - Add `private authService = inject(AuthService)` (around line 288)
  - Import AuthService from core/auth
  - Purpose: Access logged-in user's department context in budget form
  - _Leverage: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts` (existing form structure), `apps/web/src/app/core/auth/services/auth.service.ts`_
  - _Requirements: REQ-4_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with expertise in dependency injection and form management | Task: Inject AuthService into budget request form component following REQ-4, preparing to access user's department context for form auto-population | Restrictions: Use Angular inject() function, maintain existing dependencies, do not modify form structure yet | Success: AuthService successfully injected, no compilation errors, existing form functionality unchanged | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Add import and inject AuthService, (3) Run log-implementation tool with detailed artifacts (service injected, imports added, location), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 8. Auto-Fill Department in Budget Form ngOnInit
  - File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts`
  - In ngOnInit method, add logic to pre-fill department_id from authService.currentUser()
  - Use patchValue to set form value without triggering validation
  - Purpose: Automatically populate department field from logged-in user
  - _Leverage: Existing ngOnInit method (line 311-318), reactive form patchValue, AuthService currentUser signal_
  - _Requirements: REQ-4_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Forms Developer with expertise in reactive forms and state management | Task: Implement department auto-fill logic in ngOnInit following REQ-4, reading from authService.currentUser() signal and using patchValue to pre-fill department_id field | Restrictions: Only pre-fill if user has department_id, maintain create/edit mode logic, allow manual override, use patchValue not setValue | Success: Department field auto-fills for users with department, null department shows empty field, manual selection still works | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Implement auto-fill logic in ngOnInit, (3) Run log-implementation tool with detailed artifacts (methods modified, integration with AuthService, data flow), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 9. Add User Guidance for Missing Department
  - File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.ts` (template section)
  - Add conditional warning message when user has no department_id
  - Display helpful message: "You are not assigned to a department. Please select one manually or contact your administrator."
  - Purpose: Guide users who don't have department assignments
  - _Leverage: Existing template structure (lines 58-149), Angular @if directive, AuthService currentUser signal_
  - _Requirements: REQ-4_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend UX Developer specializing in user guidance and Angular templates | Task: Add conditional warning message for users without department assignment following REQ-4, using Angular @if to check currentUser signal and display helpful guidance | Restrictions: Use Angular control flow (@if), match existing template styling, do not block form submission, provide actionable guidance | Success: Warning appears for users with null department_id, message is clear and helpful, does not appear when department exists | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Add warning template, (3) Run log-implementation tool with detailed artifacts (UI components added, conditional logic, styling), (4) Edit tasks.md and change status from [-] to [x]_

## Phase 4: Backend Budget Service Enhancement

- [x] 10. Add UserRepository Dependency to BudgetRequestsService
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts`
  - Add UserRepository as constructor parameter
  - Import UserRepository from platform/users layer
  - Purpose: Enable querying user's department during budget request creation
  - _Leverage: `apps/api/src/layers/platform/users/users.repository.ts`, existing service constructor pattern_
  - _Requirements: REQ-4_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with expertise in dependency injection and service architecture | Task: Add UserRepository dependency to BudgetRequestsService constructor following REQ-4, enabling user department queries for auto-population logic | Restrictions: Follow existing constructor dependency pattern, maintain service initialization, do not break existing dependencies | Success: UserRepository successfully injected, service initializes correctly, no circular dependencies | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Add UserRepository to constructor, (3) Run log-implementation tool with detailed artifacts (dependencies added, imports, constructor changes), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 11. Re-enable Department Auto-Population Logic
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts`
  - Uncomment lines 102-139 (auto-population logic)
  - Replace userDepartmentsRepository with direct user.department_id access
  - Update error messages to match current architecture
  - Purpose: Enable automatic department assignment for budget requests
  - _Leverage: Commented-out code (lines 102-139), UserRepository.findById method_
  - _Requirements: REQ-4, REQ-5_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Business Logic Developer with expertise in data validation and error handling | Task: Re-enable and refactor auto-population logic in BudgetRequestsService.create method following REQ-4 and REQ-5, replacing user-departments lookup with direct user.department_id access and improving error messages | Restrictions: Must query user.department_id instead of user-departments table, maintain existing validation logic, throw clear errors with proper codes (USER_NO_DEPARTMENT) | Success: Auto-population works when department_id not provided, proper error when user has no department, manual department_id still allowed | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Uncomment and refactor logic, (3) Run log-implementation tool with detailed artifacts (business logic re-enabled, error handling, integration with UserRepository), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 12. Update Budget Request Approval Validation
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts`
  - Ensure approveFinance method properly validates department_id exists (already implemented at lines 625-634)
  - Verify error message is clear and actionable
  - Purpose: Prevent budget allocation creation without department context
  - _Leverage: Existing validation logic (lines 625-634)_
  - _Requirements: REQ-4, REQ-5_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer specializing in workflow validation and error handling | Task: Review and enhance budget request approval validation following REQ-4 and REQ-5, ensuring clear error when department_id is missing during allocation creation | Restrictions: Do not modify existing allocation creation logic, maintain transaction integrity, ensure error codes are consistent | Success: Approval fails with clear error when department_id is null, error message guides user to fix, transaction rolls back properly | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Review validation (may already be complete), enhance error messages if needed, (3) Run log-implementation tool with detailed artifacts (validation logic reviewed, error handling enhancements), (4) Edit tasks.md and change status from [-] to [x]_

## Phase 5: Testing and Validation

- [x] 13. Write Backend Integration Tests
  - File: `apps/api/src/layers/platform/users/__tests__/users.integration.test.ts`
  - Test user creation/update with department_id
  - Test department validation
  - Test auth login includes department_id
  - Purpose: Ensure backend department integration works end-to-end
  - _Leverage: Existing test structure in **tests** directory, test utilities_
  - _Requirements: REQ-1, REQ-2, REQ-5_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in backend integration testing and Jest | Task: Create comprehensive integration tests for user-department integration following REQ-1, REQ-2, and REQ-5, testing auth flow, user CRUD with department, and validation | Restrictions: Test real database interactions, use transactions for cleanup, maintain test isolation, follow existing test patterns | Success: Tests cover auth with department, user update validation, null handling, all tests pass | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write integration tests, (3) Run log-implementation tool with detailed artifacts (test cases created, coverage areas, test utilities used), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 14. Write Budget Request Integration Tests
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/__tests__/budget-requests.integration.test.ts`
  - Test budget creation with user's department auto-population
  - Test error when user has no department
  - Test manual department override
  - Test approval validation requires department
  - Purpose: Ensure budget workflow properly handles department context
  - _Leverage: Existing budget request test structure_
  - _Requirements: REQ-4, REQ-5_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer specializing in workflow testing and business logic validation | Task: Create integration tests for budget request department workflow following REQ-4 and REQ-5, testing auto-population, validation, and error scenarios | Restrictions: Test complete workflow from creation to approval, use real user and department data, maintain test data isolation | Success: Tests verify auto-population works, error handling correct, approval validation enforced, all scenarios covered | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write workflow tests, (3) Run log-implementation tool with detailed artifacts (workflow tests created, scenarios covered, assertions), (4) Edit tasks.md and change status from [-] to [x]_

- [ ] 15. Write Frontend Component Tests
  - File: `apps/web/src/app/features/inventory/modules/budget-requests/components/budget-requests-form.component.spec.ts`
  - Test department auto-fill from authService.currentUser
  - Test warning message for users without department
  - Test manual department selection still works
  - Purpose: Ensure frontend correctly integrates with auth service
  - _Leverage: Existing component test structure, Angular testing utilities_
  - _Requirements: REQ-3, REQ-4_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend QA Engineer with expertise in Angular component testing | Task: Create component tests for budget form department integration following REQ-3 and REQ-4, testing auto-fill, warning display, and user interactions | Restrictions: Mock AuthService with different user states, test template rendering, verify form behavior, use Angular testing utilities | Success: Tests verify auto-fill works, warning appears correctly, manual selection functional, all edge cases covered | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write component tests, (3) Run log-implementation tool with detailed artifacts (test cases added, mock configurations, assertions), (4) Edit tasks.md and change status from [-] to [x]_

- [ ] 16. Create E2E Test Scenarios
  - File: `apps/web-e2e/src/e2e/budget-request-department-flow.cy.ts` (or Playwright equivalent)
  - Test complete user journey: Login → Create Budget Request → Department Auto-filled
  - Test user without department sees warning and selects manually
  - Test budget approval validates department
  - Purpose: Validate complete user experience end-to-end
  - _Leverage: Existing E2E test structure and utilities_
  - _Requirements: All (REQ-1 through REQ-6)_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Automation Engineer with expertise in E2E testing and Cypress/Playwright | Task: Create end-to-end tests for complete user-department-budget workflow covering all requirements, simulating real user interactions from login to budget approval | Restrictions: Test real user workflows, use test database with fixtures, ensure tests are reliable and maintainable, clean up test data | Success: E2E tests validate complete workflow, cover both happy path and error scenarios, tests pass reliably | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write E2E test scenarios, (3) Run log-implementation tool with detailed artifacts (E2E scenarios created, user journeys covered, test data setup), (4) Edit tasks.md and change status from [-] to [x]_

## Phase 6: Documentation and Migration Support

- [x] 17. Update API Documentation
  - File: `docs/reference/api/users-api.md` (create if doesn't exist)
  - Document department_id field in User endpoints
  - Add examples of creating users with department
  - Document validation errors and responses
  - Purpose: Help developers understand department integration API
  - _Leverage: Existing API documentation structure in docs/reference/api/_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with expertise in API documentation | Task: Create comprehensive API documentation for user-department integration following REQ-2, documenting endpoints, request/response formats, and error scenarios | Restrictions: Follow existing documentation style, include code examples, document all error codes, maintain consistency with other API docs | Success: Documentation is clear and complete, includes examples, covers all endpoints and errors, follows project documentation standards | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write API documentation, (3) Run log-implementation tool with detailed artifacts (documentation files created, sections added, examples provided), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 18. Create Migration Guide
  - File: `docs/guides/migrations/user-department-integration.md`
  - Document backward compatibility approach
  - Explain how existing users are handled (null department)
  - Provide steps for admins to assign departments
  - Purpose: Guide administrators through feature adoption
  - _Leverage: Existing migration guide structure in docs/guides/migrations/_
  - _Requirements: REQ-6_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer specializing in migration documentation and user guides | Task: Create migration guide for user-department integration following REQ-6, explaining backward compatibility, data handling, and adoption steps for administrators | Restrictions: Use clear, actionable language, include screenshots or examples, address common concerns, follow existing guide format | Success: Guide is comprehensive and easy to follow, addresses migration concerns, provides clear action steps, helpful for administrators | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Write migration guide, (3) Run log-implementation tool with detailed artifacts (guide created, sections covered, user scenarios addressed), (4) Edit tasks.md and change status from [-] to [x]_

- [x] 19. Final Integration Testing and Cleanup
  - Files: All modified files
  - Run full test suite (unit, integration, E2E)
  - Verify no regressions in existing features
  - Clean up any commented code or debug logs
  - Update CHANGELOG with feature summary
  - Purpose: Ensure production readiness and code quality
  - _Leverage: Project test scripts, linting tools, build verification_
  - _Requirements: All_
  - _Prompt: Implement the task for spec user-department-integration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Senior Developer with expertise in code quality, testing, and release management | Task: Perform final integration validation covering all requirements, running complete test suite, fixing any issues, and preparing for release | Restrictions: Must pass all tests, no linting errors, maintain code quality standards, ensure backward compatibility | Success: All tests pass, no regressions detected, code is clean and production-ready, CHANGELOG updated | Instructions: (1) Edit tasks.md and change this task status from [ ] to [-], (2) Run test suite and fix issues, clean up code, update CHANGELOG, (3) Run log-implementation tool with detailed artifacts (test results, cleanup actions, release preparation), (4) Edit tasks.md and change status from [-] to [x]_
