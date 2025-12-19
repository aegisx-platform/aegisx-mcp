# Tasks Document - Item-Level Budget Control

## Phase 1: Database Schema and Functions

- [ ] 1.1 Create schema migration for budget control fields
  - File: `apps/api/src/database/migrations-inventory/20251219000002_add_item_budget_control.ts`
  - Add four new columns to budget_request_items: quantity_control_type, price_control_type, quantity_variance_percent, price_variance_percent
  - Add CHECK constraints for valid values and ranges
  - Add COMMENT statements for documentation
  - Purpose: Store control settings per budget request item
  - _Leverage: Existing migration patterns from apps/api/src/database/migrations-inventory/_
  - _Requirements: Requirement 1_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Engineer specializing in PostgreSQL schema design and migrations | Task: Create migration file adding four control fields (quantity_control_type, price_control_type, quantity_variance_percent, price_variance_percent) to budget_request_items table following Requirement 1, using existing migration patterns and ensuring data integrity with CHECK constraints | Restrictions: Must use Knex migration format, ensure rollback works correctly, do not modify existing columns, follow naming conventions from existing inventory migrations | \_Leverage: apps/api/src/database/migrations-inventory/ for migration patterns | \_Requirements: Requirement 1 (Configure Item-Level Budget Control) | Success: Migration runs successfully with up/down, CHECK constraints enforce valid values (NONE/SOFT/HARD for types, 0-100 for percentages), comments are added, rollback works without errors | Instructions: After implementing, update tasks.md to mark this task as in-progress [-], then use log-implementation tool to record what was created (migration file, columns added, constraints), and finally mark as complete [x] in tasks.md_

- [ ] 1.2 Create PostgreSQL validation function
  - File: `apps/api/src/database/migrations-inventory/20251219000003_create_item_budget_control_function.ts`
  - Implement check_item_budget_control() function that validates PR item against budget controls
  - Calculate variance percentages for quantity and price
  - Return allowed flag, quantity_status, price_status, and detailed JSONB message
  - Purpose: Encapsulate budget validation logic in database layer
  - _Leverage: Existing PostgreSQL functions in apps/api/src/database/migrations-inventory/20251218000001_create_budget_functions.ts_
  - _Requirements: Requirement 2_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: PostgreSQL Developer specializing in PL/pgSQL functions and JSONB data structures | Task: Create check_item_budget_control() function following Requirement 2 that validates PR items against configured controls, calculates variance percentages, and returns structured results including allowed flag and detailed JSONB message | Restrictions: Must use PL/pgSQL, return type must match design specification (allowed BOOLEAN, quantity_status VARCHAR, price_status VARCHAR, message JSONB), handle edge cases (zero quantity, null values), follow patterns from existing budget functions | \_Leverage: apps/api/src/database/migrations-inventory/20251218000001_create_budget_functions.ts for function patterns and JSONB usage | \_Requirements: Requirement 2 (Validate PR Against Budget Control) | Success: Function compiles and runs correctly, handles all control types (NONE/SOFT/HARD), calculates percentages accurately, returns detailed validation results in JSONB format, edge cases handled (division by zero, null values) | Instructions: After implementing, update tasks.md [-], log implementation with function signature and logic details, mark complete [x]_

- [ ] 1.3 Test database functions with sample data
  - File: Manual testing / SQL scripts
  - Create test data with different control types and scenarios
  - Verify function returns correct results for NONE/SOFT/HARD controls
  - Test edge cases: zero quantities, exact tolerance boundaries, price fluctuations
  - Purpose: Validate database layer before backend integration
  - _Leverage: Existing test data patterns from database seeds_
  - _Requirements: Requirement 2_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with PostgreSQL testing expertise | Task: Create comprehensive test scenarios for check_item_budget_control() function covering Requirement 2, testing all control types, variance calculations, and edge cases using SQL scripts | Restrictions: Must test all three control types, verify JSONB structure matches specification, test boundary conditions (exactly at tolerance, ±1% variance), do not modify function implementation | \_Leverage: Existing seed data patterns for creating realistic test cases | \_Requirements: Requirement 2 (Validate PR Against Budget Control) | Success: All control types tested (NONE returns OK, SOFT returns WARNING when exceeded, HARD returns BLOCKED), variance calculations verified accurate, edge cases pass (zero quantity handled, negative percentages), JSONB message structure validated | Instructions: Update tasks.md [-], log test results with sample inputs/outputs, mark complete [x]_

## Phase 2: Backend Integration

- [ ] 2.1 Update TypeBox schemas for control types
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.schemas.ts`
  - Add schemas for control type fields: QuantityControlTypeSchema, PriceControlTypeSchema
  - Update CreateBudgetRequestItemSchema and UpdateBudgetRequestItemSchema to include control fields
  - Add validation for variance percentages (0-100 range)
  - Purpose: Enable type-safe validation of control settings in API requests
  - _Leverage: Existing TypeBox schemas in budget-requests.schemas.ts_
  - _Requirements: Requirement 1_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend TypeScript Developer specializing in TypeBox validation schemas | Task: Add TypeBox schemas for control type fields following Requirement 1, updating budget request item schemas to include quantity_control_type, price_control_type, and variance percentages with proper validation | Restrictions: Must use TypeBox Type constructors, follow existing schema patterns in file, ensure Union types for NONE/SOFT/HARD, add Optional wrappers where needed, validate variance as Integer with minimum 0 and maximum 100 | \_Leverage: apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.schemas.ts for existing schema patterns | \_Requirements: Requirement 1 (Configure Item-Level Budget Control) | Success: Schemas compile without TypeScript errors, control types validated as Union of literals, variance percentages constrained to 0-100, schemas integrate with existing budget request validation, API endpoints accept and validate control settings | Instructions: Update tasks.md [-], log schema additions with TypeBox patterns used, mark complete [x]_

- [ ] 2.2 Integrate budget validation in PR service
  - File: `apps/api/src/layers/domains/inventory/procurement/purchaseRequests/purchase-requests.service.ts`
  - Add budget control validation to validateCreate() method
  - Call check_item_budget_control() for each PR item using Promise.all
  - Separate HARD blocks from SOFT warnings
  - Throw BUDGET_CONTROL_BLOCKED error if HARD blocks exist
  - Throw BUDGET_EXCEED_REASON_REQUIRED if SOFT warnings exist without reason
  - Purpose: Enforce budget controls during PR creation
  - _Leverage: Existing validation patterns in purchase-requests.service.ts, apps/api/src/database/migrations-inventory/20251219000003_create_item_budget_control_function.ts_
  - _Requirements: Requirement 2, Requirement 3_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with Fastify and Node.js expertise | Task: Integrate budget validation into PR creation service following Requirements 2 and 3, calling check_item_budget_control() for each item, separating HARD blocks from SOFT warnings, and throwing appropriate errors with detailed validation results | Restrictions: Must use Promise.all for parallel validation, follow existing error handling patterns in service, do not block PR creation if all validations pass, ensure error details include all validation results for frontend display, use this.knex.raw for function calls | \_Leverage: apps/api/src/layers/domains/inventory/procurement/purchaseRequests/purchase-requests.service.ts for service patterns, database function from migration 20251219000003 | \_Requirements: Requirement 2 (Validate PR Against Budget Control), Requirement 3 (Display Budget Validation Results in UI) | Success: Validation runs for all PR items in parallel, HARD blocks prevent PR creation with BUDGET_CONTROL_BLOCKED error, SOFT warnings require reason with BUDGET_EXCEED_REASON_REQUIRED error, error details include all validation results, logging added for audit trail | Instructions: Update tasks.md [-], log implementation with error codes and validation flow, mark complete [x]_

- [ ] 2.3 Add getCurrentQuarter() helper method
  - File: `apps/api/src/layers/domains/inventory/procurement/purchaseRequests/purchase-requests.service.ts`
  - Implement method that returns current quarter (1-4) based on Thai fiscal year
  - Thai fiscal year starts October 1: Q1 (Oct-Dec), Q2 (Jan-Mar), Q3 (Apr-Jun), Q4 (Jul-Sep)
  - Purpose: Determine which quarter's budget to validate against
  - _Leverage: Existing date utilities in codebase_
  - _Requirements: Requirement 2_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with date/time handling expertise | Task: Create getCurrentQuarter() helper method following Requirement 2 that returns correct quarter (1-4) based on Thai fiscal year calendar starting October 1 | Restrictions: Must handle Thai fiscal year correctly (October 1 start date), return integer 1-4, handle edge cases (leap years, year boundaries), use date-fns or similar library if available in project, add unit tests for all months | \_Leverage: Existing date utilities and patterns in codebase | \_Requirements: Requirement 2 (Validate PR Against Budget Control) | Success: Method returns correct quarter for all months (Oct/Nov/Dec=1, Jan/Feb/Mar=2, Apr/May/Jun=3, Jul/Aug/Sep=4), handles year boundaries correctly, unit tests pass for all 12 months, edge cases covered | Instructions: Update tasks.md [-], log method implementation with test cases, mark complete [x]_

- [ ] 2.4 Write unit tests for PR validation
  - File: `apps/api/src/layers/domains/inventory/procurement/purchaseRequests/purchase-requests.service.spec.ts`
  - Test validateCreate() with HARD blocks (should throw BUDGET_CONTROL_BLOCKED)
  - Test validateCreate() with SOFT warnings without reason (should throw BUDGET_EXCEED_REASON_REQUIRED)
  - Test validateCreate() with SOFT warnings with reason (should pass)
  - Test validateCreate() with all items OK (should pass)
  - Purpose: Ensure validation logic works correctly
  - _Leverage: Existing test patterns in purchase-requests.service.spec.ts_
  - _Requirements: Requirement 2_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with Jest/Node.js testing expertise | Task: Write comprehensive unit tests for PR validation logic covering Requirement 2, testing all scenarios (HARD blocks, SOFT warnings with/without reason, all OK) using mocked database functions | Restrictions: Must mock check_item_budget_control() database function, test each error scenario separately, verify error codes and details are correct, follow existing test structure in spec file, use Jest matchers (toThrow, rejects.toThrow) | \_Leverage: apps/api/src/layers/domains/inventory/procurement/purchaseRequests/purchase-requests.service.spec.ts for test patterns | \_Requirements: Requirement 2 (Validate PR Against Budget Control) | Success: All test scenarios pass (HARD blocks throw correct error, SOFT without reason throws error, SOFT with reason passes, all OK passes), mocks properly isolate database layer, error details verified in assertions, code coverage includes validation logic | Instructions: Update tasks.md [-], log test coverage and scenarios tested, mark complete [x]_

## Phase 3: Frontend - Item Settings Modal

- [ ] 3.1 Create item settings modal component
  - File: `apps/admin/src/app/modules/inventory/budget/components/item-settings-modal/item-settings-modal.component.ts`
  - Create standalone Angular component using AxDrawerComponent
  - Add reactive form for control settings (quantity_control_type, price_control_type, variance percentages)
  - Implement real-time impact preview using computed signals
  - Add recommended settings table with auto-fill button
  - Purpose: Provide UI for configuring budget controls per item
  - _Leverage: Existing AegisX UI components (ax-drawer, ax-select, ax-badge), ReactiveFormsModule patterns_
  - _Requirements: Requirement 1, Requirement 4, Requirement 6_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Frontend Developer with reactive forms and signals expertise | Task: Create item settings modal component following Requirements 1, 4, and 6, implementing control type dropdowns, variance inputs, real-time preview, and recommended settings using Angular standalone components and signals | Restrictions: Must use Angular 17+ standalone component API, use signals for reactive state (control settings, impact preview), follow AegisX UI component patterns (ax-drawer for modal, ax-select for dropdowns, ax-badge for control type indicators), validate variance percentages (0-100), implement reactive forms with FormBuilder | \_Leverage: AegisX UI components from libs/aegisx-ui, existing modal patterns in budget module, ReactiveFormsModule | \_Requirements: Requirement 1 (Configure Item-Level Budget Control), Requirement 4 (Provide Real-Time Impact Preview), Requirement 6 (Recommended Control Settings) | Success: Modal opens with drawer component, form displays current settings, control type dropdowns show NONE/SOFT/HARD with icons (🔴🟡⚪), variance inputs appear when SOFT/HARD selected, impact preview updates on form change, recommended settings table displays with auto-fill button, save button calls API to update settings | Instructions: Update tasks.md [-], log component creation with signals and form structure, mark complete [x]_

- [ ] 3.2 Add control type indicator badges
  - File: `apps/admin/src/app/modules/inventory/budget/components/budget-request-items-table/budget-request-items-table.component.ts`
  - Display control type badges (🔴 HARD, 🟡 SOFT, ⚪ NONE) in item table
  - Add click handler to open item settings modal
  - Show variance percentages in tooltip on badge hover
  - Purpose: Provide visual indication of control settings in item list
  - _Leverage: AxBadgeComponent, existing item table component_
  - _Requirements: Requirement 1_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular UI Developer with component composition expertise | Task: Add control type badges to item table following Requirement 1, displaying visual indicators (🔴🟡⚪) with click-to-edit functionality and tooltips showing variance percentages | Restrictions: Must use AxBadgeComponent from AegisX UI, add badges to existing table without breaking current functionality, implement click handler to emit event for opening modal, use AxTooltipDirective for variance display, color code badges (red for HARD, yellow for SOFT, gray for NONE) | \_Leverage: AxBadgeComponent, AxTooltipDirective, existing budget-request-items-table.component.ts | \_Requirements: Requirement 1 (Configure Item-Level Budget Control) | Success: Badges appear in item table rows, colors match control type, click opens item settings modal with correct item data, tooltip shows "±10% qty, ±15% price" format, badges update when settings saved | Instructions: Update tasks.md [-], log badge integration and event handling, mark complete [x]_

## Phase 4: Frontend - PR Validation Alerts

- [ ] 4.1 Create PR validation alerts component
  - File: `apps/admin/src/app/modules/inventory/budget/components/pr-validation-alerts/pr-validation-alerts.component.ts`
  - Create standalone component with expandable red alert for HARD blocks
  - Add expandable yellow alert for SOFT warnings with reason textarea
  - Display per-item breakdown showing planned, purchased, remaining, requested amounts
  - Show variance percentages and exceeded amounts
  - Purpose: Display budget validation results with clear error/warning distinction
  - _Leverage: AxAlertComponent, AxAccordionComponent from AegisX UI_
  - _Requirements: Requirement 3_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Frontend Developer with error handling and accessibility expertise | Task: Create PR validation alerts component following Requirement 3, implementing expandable red/yellow alerts with per-item validation details and reason textarea for SOFT warnings | Restrictions: Must use AxAlertComponent with 'error' variant for HARD blocks and 'warning' variant for SOFT warnings, use AxAccordionComponent for expandable item details, ensure textarea for reason is required and emits to parent, maintain accessibility (ARIA labels, keyboard navigation), color code appropriately (red #ef4444 for HARD, yellow #f59e0b for SOFT) | \_Leverage: AxAlertComponent, AxAccordionComponent, existing alert patterns in admin app | \_Requirements: Requirement 3 (Display Budget Validation Results in UI) | Success: Red alert displays for HARD blocks with list of blocked items, yellow alert displays for SOFT warnings with reason textarea, accordion expands/collapses item details, validation details show all amounts (planned/purchased/remaining/requested), variance percentages displayed with +/- indicators, reason textarea emits value to parent component | Instructions: Update tasks.md [-], log component with alert types and accordion implementation, mark complete [x]_

- [ ] 4.2 Integrate validation alerts into PR creation form
  - File: `apps/admin/src/app/modules/inventory/procurement/purchase-requests-form/purchase-requests-form.component.ts`
  - Add validation alerts component to form template
  - Disable submit button when HARD blocks exist (add lock icon 🔒)
  - Collect reason from alerts component and include in PR submission
  - Handle validation errors from API (BUDGET_CONTROL_BLOCKED, BUDGET_EXCEED_REASON_REQUIRED)
  - Purpose: Integrate budget validation into PR creation workflow
  - _Leverage: Existing PR form component, form validation patterns_
  - _Requirements: Requirement 3_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Forms Developer with reactive forms and error handling expertise | Task: Integrate validation alerts into PR creation form following Requirement 3, adding alerts component, disabling submit on HARD blocks, collecting reason for SOFT warnings, and handling API validation errors | Restrictions: Must call budget validation before allowing submit, disable submit button with [disabled] binding when hardBlocks.length > 0, add lock icon (🔒) to disabled button, bind reason from alerts component to form data, handle both BUDGET_CONTROL_BLOCKED and BUDGET_EXCEED_REASON_REQUIRED errors with appropriate UI feedback, follow existing form patterns | \_Leverage: apps/admin/src/app/modules/inventory/procurement/purchase-requests-form component, existing validation patterns | \_Requirements: Requirement 3 (Display Budget Validation Results in UI) | Success: Alerts component appears above form when validation errors exist, submit button disabled when HARD blocks present, lock icon visible on disabled button, reason textarea value included in PR submission payload, API errors displayed in alerts, form re-validates on data change | Instructions: Update tasks.md [-], log form integration and error handling, mark complete [x]_

## Phase 5: Frontend - Budget Dashboard

- [ ] 5.1 Create budget dashboard component
  - File: `apps/admin/src/app/modules/inventory/budget/components/budget-dashboard/budget-dashboard.component.ts`
  - Create standalone component with summary cards (total, used, remaining)
  - Add control type breakdown cards (HARD/SOFT/NONE counts)
  - Implement filterable item table with dual progress bars
  - Show color-coded status badges (🔴 Exceeded, 🟡 Warning, ✅ Normal)
  - Add filter dropdowns for control type and status
  - Purpose: Provide overview of budget status across all items
  - _Leverage: AxTableComponent, AxProgressComponent, AxBadgeComponent, AxCardComponent_
  - _Requirements: Requirement 5_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Dashboard Developer with data visualization expertise | Task: Create budget dashboard component following Requirement 5, implementing summary cards, control type breakdown, filterable item table with dual progress bars, and color-coded status indicators | Restrictions: Must use AxTableComponent with virtual scrolling for performance (1000+ items), use AxProgressComponent for dual bars (quantity + amount), use computed signals for filtering and summary calculations, implement color transitions (green less than 80%, yellow 80-99%, red 100% or more), use AxCardComponent for summary cards, ensure responsive layout | \_Leverage: AxTableComponent, AxProgressComponent, AxBadgeComponent, AxCardComponent from AegisX UI, existing dashboard patterns | \_Requirements: Requirement 5 (Budget Dashboard with Item Status) | Success: Summary cards display correct totals (budget/used/remaining), control type breakdown shows item counts, item table shows all items with filterable columns, dual progress bars display both quantity and amount usage, colors change based on usage percentage, status badges show exceeded/warning/normal, filters work (control type dropdown, status dropdown), table performance good with 1000+ items | Instructions: Update tasks.md [-], log dashboard component with signals and filtering logic, mark complete [x]_

- [ ] 5.2 Add API endpoint for dashboard data
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.controller.ts` and `budget-requests.service.ts`
  - Add GET endpoint: `/api/inventory/budget/budget-requests/:id/items-status`
  - Return aggregated data: item details, usage percentages, status, related PR IDs
  - Calculate usage percentages for current quarter
  - Determine status based on usage (normal less than 80%, warning 80-99%, exceeded 100% or more)
  - Purpose: Provide dashboard with aggregated budget status data
  - _Leverage: Existing budget requests controller and service patterns_
  - _Requirements: Requirement 5_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend API Developer with SQL aggregation expertise | Task: Create dashboard data endpoint following Requirement 5, implementing aggregated query that calculates usage percentages, determines status, and returns item details with related PR IDs | Restrictions: Must use efficient SQL query with JOINs and aggregations, calculate usage as (purchased_qty / planned_qty \* 100), determine status with CASE WHEN (normal/warning/exceeded), include related PR IDs using array aggregation, add TypeBox schema for response validation, follow existing controller/service patterns | \_Leverage: apps/api/src/layers/domains/inventory/budget/budgetRequests/ for controller and service patterns | \_Requirements: Requirement 5 (Budget Dashboard with Item Status) | Success: GET endpoint responds with correct data structure, usage percentages calculated accurately, status correctly categorized (normal/warning/exceeded), related PR IDs included as array, query performance acceptable (under 500ms for 1000 items), response schema validated with TypeBox | Instructions: Update tasks.md [-], log endpoint implementation with SQL query and response schema, mark complete [x]_

## Phase 6: Testing and Documentation

- [ ] 6.1 Write integration tests for full workflow
  - File: `apps/api/tests/integration/budget-control.integration.spec.ts`
  - Test complete workflow: Configure control → Create PR → Validation
  - Test scenario: HARD control blocks PR submission
  - Test scenario: SOFT warning requires reason
  - Test scenario: All items pass validation
  - Test concurrent PR creation with budget checking
  - Purpose: Validate end-to-end budget control functionality
  - _Leverage: Existing integration test patterns_
  - _Requirements: All_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Automation Engineer with integration testing expertise | Task: Create comprehensive integration tests covering all requirements, testing complete workflow from control configuration through PR validation with all scenarios (HARD blocks, SOFT warnings, concurrent creation) | Restrictions: Must use actual database (test database), test real HTTP endpoints, create complete test data (budget requests with items, control settings), clean up test data after each test, use supertest or similar for HTTP requests, test concurrency with Promise.all, verify database state after operations | \_Leverage: Existing integration test patterns in apps/api/tests/integration/ | \_Requirements: All requirements (end-to-end validation) | Success: Integration tests cover full workflow, HARD block scenario prevents PR creation, SOFT warning scenario requires reason, all-OK scenario creates PR successfully, concurrent tests verify race conditions handled, tests are reliable and repeatable, cleanup ensures no test data pollution | Instructions: Update tasks.md [-], log integration test scenarios and coverage, mark complete [x]_

- [ ] 6.2 Write frontend component tests
  - File: Multiple spec files for each component
  - Test item settings modal: form validation, impact preview updates, save functionality
  - Test validation alerts: alert display, accordion expand/collapse, reason textarea
  - Test dashboard: filtering, progress bar rendering, summary calculations
  - Purpose: Ensure frontend components work correctly
  - _Leverage: Existing Angular component test patterns with TestBed_
  - _Requirements: All_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend QA Engineer with Angular testing and Jasmine/Jest expertise | Task: Create comprehensive component tests covering all frontend components and requirements, testing form interactions, computed signals, event emissions, and UI rendering | Restrictions: Must use Angular TestBed for component setup, mock all HTTP services with spy objects, test component inputs/outputs, verify signal updates trigger re-renders, test form validation (variance 0-100), use fixture.debugElement for DOM queries, follow AAA pattern (Arrange-Act-Assert) | \_Leverage: Existing Angular component test patterns in apps/admin/src/app/, Angular testing utilities (TestBed, ComponentFixture) | \_Requirements: All requirements (UI components validation) | Success: Item settings modal tests cover form validation and preview updates, validation alerts tests cover conditional rendering and reason textarea, dashboard tests cover filtering and summary calculations, all computed signals tested, event emissions verified, code coverage >80% for components | Instructions: Update tasks.md [-], log component test coverage, mark complete [x]_

- [ ] 6.3 Update API documentation
  - File: `docs/features/budget-management/API_CONTRACTS.md`
  - Document new control type fields in budget request items schema
  - Document validation error codes: BUDGET_CONTROL_BLOCKED, BUDGET_EXCEED_REASON_REQUIRED
  - Document dashboard endpoint with response schema
  - Add examples showing HARD blocks, SOFT warnings with reason
  - Purpose: Provide clear API documentation for developers
  - _Leverage: Existing API documentation format_
  - _Requirements: All_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer with API documentation expertise | Task: Update API documentation covering all new endpoints, schemas, and error codes for budget control feature following all requirements, providing clear examples and use cases | Restrictions: Must follow existing documentation structure and format, use markdown tables for schemas, include JSON examples for requests/responses, document all new TypeBox schemas, explain error codes with causes and resolutions, maintain consistency with existing docs | \_Leverage: docs/features/budget-management/API_CONTRACTS.md for documentation format | \_Requirements: All requirements (complete feature documentation) | Success: All new fields documented with types and descriptions, validation errors explained with examples, dashboard endpoint fully documented, request/response examples provided for all scenarios, error handling guide included, documentation integrated with existing budget management docs | Instructions: Update tasks.md [-], log documentation sections added, mark complete [x]_

- [ ] 6.4 Create user guide with UI mockups
  - File: `docs/features/budget-management/ITEM_BUDGET_CONTROL_GUIDE.md`
  - Document how to configure control types per item
  - Explain NONE/SOFT/HARD differences with examples
  - Document PR validation workflow and error handling
  - Include screenshots or ASCII mockups of UI components
  - Add troubleshooting section for common issues
  - Purpose: Help users understand and use budget control feature
  - _Leverage: UI mockups from design phase_
  - _Requirements: All_
  - _Prompt: Implement the task for spec item-level-budget-control, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Documentation Specialist with user guide expertise | Task: Create comprehensive user guide covering all requirements, explaining feature usage from user perspective with examples, mockups, and troubleshooting tips | Restrictions: Must use clear non-technical language for user audience, include visual aids (ASCII mockups or screenshots), provide step-by-step instructions for common tasks, explain concepts with real-world hospital scenarios (expensive drugs, controlled substances, vitamins), organize with clear sections and TOC, follow markdown best practices | \_Leverage: UI mockups from design document, existing user guides in docs/ | \_Requirements: All requirements (user-facing documentation) | Success: User guide explains NONE/SOFT/HARD control types clearly with examples, step-by-step instructions for configuring controls provided, PR validation workflow documented with screenshots/mockups, troubleshooting section covers common issues (how to handle HARD blocks, when to use SOFT vs HARD), real-world scenarios included (e.g., configuring controls for Paracetamol vs expensive imported drugs) | Instructions: Update tasks.md [-], log user guide sections and examples, mark complete [x]_

## Summary

**Total Tasks:** 19
**Estimated Effort:** ~12-15 hours

**Phase Breakdown:**

- Phase 1 (Database): 3 tasks (~2 hours)
- Phase 2 (Backend): 4 tasks (~3 hours)
- Phase 3 (Item Settings Modal): 2 tasks (~2 hours)
- Phase 4 (PR Validation Alerts): 2 tasks (~2 hours)
- Phase 5 (Dashboard): 2 tasks (~2 hours)
- Phase 6 (Testing & Docs): 4 tasks (~2 hours)

**Dependencies:**

- Phase 2 depends on Phase 1 (database schema must exist)
- Phase 3, 4, 5 depend on Phase 2 (backend API must work)
- Phase 6 depends on all previous phases (integration tests need complete feature)

**Critical Path:**
1.1 → 1.2 → 2.1 → 2.2 → 4.1 → 4.2 (PR validation is highest priority)
