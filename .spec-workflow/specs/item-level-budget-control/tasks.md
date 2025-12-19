# Tasks Document - Item-Level Budget Control

## Phase 1: Database Schema and Functions

- [x] 1.1 Create schema migration for budget control fields ✅ (Completed 2025-12-19)
  - File: `apps/api/src/database/migrations-inventory/20251219000002_add_item_budget_control.ts`
  - Add four new columns to budget_request_items: quantity_control_type, price_control_type, quantity_variance_percent, price_variance_percent
  - Add CHECK constraints for valid values and ranges
  - Add COMMENT statements for documentation
  - Purpose: Store control settings per budget request item
  - _Leverage: Existing migration patterns from apps/api/src/database/migrations-inventory/_
  - _Requirements: Requirement 1_
  - _Implementation: Migration created with 4 fields, CHECK constraints, and Thai comments. Applied successfully (Batch 4). See logs: task-1.1_

- [x] 1.2 Create PostgreSQL validation function ✅ (Completed 2025-12-19)
  - File: `apps/api/src/database/migrations-inventory/20251219000003_create_item_budget_control_function.ts`
  - Implement check_item_budget_control() function that validates PR item against budget controls
  - Calculate variance percentages for quantity and price
  - Return allowed flag, quantity_status, price_status, and detailed JSONB message
  - Purpose: Encapsulate budget validation logic in database layer
  - _Leverage: Existing PostgreSQL functions in apps/api/src/database/migrations-inventory/20251218000001_create_budget_functions.ts_
  - _Requirements: Requirement 2_
  - _Implementation: PL/pgSQL function with 180 lines, handles NONE/SOFT/HARD, calculates variances, returns structured JSONB. See logs: task-1.2_

- [x] 1.3 Test database functions with sample data ✅ (Completed 2025-12-19)
  - File: Manual testing / SQL scripts
  - Create test data with different control types and scenarios
  - Verify function returns correct results for NONE/SOFT/HARD controls
  - Test edge cases: zero quantities, exact tolerance boundaries, price fluctuations
  - Purpose: Validate database layer before backend integration
  - _Leverage: Existing test data patterns from database seeds_
  - _Requirements: Requirement 2_
  - _Implementation: Migration applied successfully, function verified working. Test script created in /tmp/test_budget_control.sql_

## Phase 2: Backend Integration

- [x] 2.1 Update TypeBox schemas for control types ✅ (Completed 2025-12-19)
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequestItems/budget-request-items.schemas.ts`
  - Add schemas for control type fields: QuantityControlTypeSchema, PriceControlTypeSchema
  - Update CreateBudgetRequestItemSchema and UpdateBudgetRequestItemSchema to include control fields
  - Add validation for variance percentages (0-100 range)
  - Purpose: Enable type-safe validation of control settings in API requests
  - _Leverage: Existing TypeBox schemas in budget-requests.schemas.ts_
  - _Requirements: Requirement 1_
  - _Implementation: Added ControlTypeEnum, VariancePercentSchema. Updated 4 schemas (Base, Create, Update, BatchUpdate). TypeScript compilation passed. See logs: task-2.1_

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

- [x] 2.3 Add getCurrentQuarter() helper method ✅ (Completed 2025-12-20)
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts` (lines 2583-2614)
  - Implemented method that returns current quarter (1-4) based on Thai fiscal year
  - Thai fiscal year starts October 1: Q1 (Oct-Dec), Q2 (Jan-Mar), Q3 (Apr-Jun), Q4 (Jul-Sep)
  - Purpose: Determine which quarter's budget to validate against
  - _Leverage: Native Date API (no external dependencies needed)_
  - _Requirements: Requirement 2_
  - _Implementation: Created getCurrentQuarter(date?: Date) method with comprehensive JSDoc documentation. Handles all 12 months correctly with if-else chain checking month ranges. Includes 4 usage examples in JSDoc. Added 14 unit tests covering all months, boundaries, and default parameter behavior. All tests passing._

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

- [x] 3.1 Create item settings modal component ✅ (Completed 2025-12-19)
  - File: `apps/admin/src/app/pages/inventory-demo/components/item-settings-modal.component.ts`
  - Created standalone Angular component using AxDrawerComponent
  - Added reactive form for control settings (quantity_control_type, price_control_type, variance percentages)
  - Implemented real-time impact preview using computed signals
  - Added recommended settings table with auto-fill button
  - Purpose: Provide UI for configuring budget controls per item
  - _Leverage: Existing AegisX UI components (ax-drawer, ax-select, ax-badge), ReactiveFormsModule patterns_
  - _Requirements: Requirement 1, Requirement 4, Requirement 6_
  - _Implementation: Standalone component with reactive forms, FormBuilder, validators, computed signals for real-time preview, 5 recommended settings table with inline apply buttons. 650+ lines of code with full styling, responsive layout, accessibility support. See files: item-settings-modal.component.ts, item-settings-modal.component.example.ts_

- [x] 3.3 Real-time Impact Preview (ผลกระทบจากการตั้งค่า) ✅ (Completed 2025-12-19)
  - File: `apps/admin/src/app/pages/inventory-demo/components/item-settings-modal.component.ts` (lines ~420-500)
  - Implemented real-time calculation preview using computed signals
  - Shows example scenarios: Allowed (✅), Warning (⚠️), Blocked (🔴)
  - Display examples for both Quantity and Price control impact
  - Updates automatically when form values change
  - Purpose: Help Finance Manager understand budget control impact before saving
  - _Implementation: computed signals (quantityImpactPreview, priceImpactPreview) calculate 3 example scenarios based on current form settings, display with color-coded UI, summary text explains control type effect_

- [x] 3.4 Recommended Settings Table (แนะนำ) ✅ (Completed 2025-12-19)
  - File: `apps/admin/src/app/pages/inventory-demo/components/item-settings-modal.component.ts` (lines ~620-700)
  - Implemented 5 drug category recommendations:
    1. ED (Essential) - HARD ±5% qty, SOFT ±10% price (ควบคุมเข้มงวด)
    2. NED (Non-Essential) - SOFT ±15% qty, SOFT ±20% price (ยืดหยุ่นได้)
    3. NDMS (Controlled) - HARD ±0% qty, HARD ±0% price (ตามสัญญา)
    4. Vitamins - NONE, NONE (ไม่จำเป็น)
    5. High-Value - HARD ±5% qty, SOFT ±10% price (ควบคุมต้นทุน)
  - Auto-fill button on each row applies recommended settings to form
  - Includes English and Thai descriptions
  - Purpose: Enable quick configuration based on drug type
  - _Implementation: Static recommendedSettings array with 5 items, table UI with AxBadge components, click handler (applyRecommendedSettings) populates form with values_

- [x] 3.2 Add control type indicator badges ✅ (Completed 2025-12-19)
  - File: `apps/web/src/app/features/inventory/modules/budget-request-items/components/budget-request-items-list.component.ts`
  - Display control type badges (🔴 HARD, 🟡 SOFT, ⚪ NONE) in item table
  - Add click handler to open item settings modal
  - Show variance percentages in tooltip on badge hover
  - Purpose: Provide visual indication of control settings in item list
  - _Leverage: AxBadgeComponent, existing item table component_
  - _Requirements: Requirement 1_
  - _Implementation: Added 'control' column to displayedColumns array. Implemented @Output() editControlSettings event emitter for item ID. Added getControlTypeBadgeColor() method maps HARD→error, SOFT→warn, NONE→info. Added getControlTypeTooltip() method formats tooltip with "±X% qty, ±Y% price" variance details. Added onEditControlSettings() method emits item ID and stops propagation. Updated HTML template with Control column containing 3 sections: (1) Quantity control badge if set, (2) Price control badge if set, (3) "None" badge if neither set. Each badge is clickable button with matTooltip showing variance. Updated budget-request-items.types.ts with ControlType='NONE'|'SOFT'|'HARD' and added quantity_control_type, price_control_type, quantity_variance_percent, price_variance_percent fields to BudgetRequestItem interface. See logs: task-3.2_

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

- [x] 5.1 Create budget dashboard component ✅ (Completed 2025-12-20)
  - Files: `apps/admin/src/app/pages/inventory-demo/components/budget-dashboard.component.ts` (TypeScript), `budget-dashboard.component.html` (Template), `budget-dashboard.component.scss` (Styles), `budget-dashboard.component.example.ts` (Usage Example)
  - Created standalone Angular component (417 lines TypeScript)
  - Implemented 4 summary cards: Total Budget (💰), Used (📊), Remaining (💵), Overall Usage (📈)
  - Added control type breakdown: HARD (🔴), SOFT (🟡), NONE (⚪) item counts with color-coded cards
  - Added status breakdown: Normal (✅), Warning (⚠️), Exceeded (🔴) item counts
  - Implemented filterable item table with three filters:
    1. Control Type dropdown (HARD/SOFT/NONE)
    2. Status dropdown (normal/warning/exceeded)
    3. Search input (drug name/code/generic name)
  - Used reactive signals for state management (8 signals + 5 computed signals)
  - Dual progress bars per item showing quantity usage and budget usage percentages
  - Color-coded progress bars: Green (<80%), Yellow (80-99%), Red (≥100%)
  - Status badges with appropriate colors (error/warning/success)
  - Export to CSV button (placeholder implementation)
  - View related PRs functionality (placeholder implementation)
  - Responsive layout with CSS Grid (adapts 1-4 columns based on screen size)
  - Data fetched from `/api/inventory/budget/budget-requests/:id/items-status` endpoint using toSignal()
  - Purpose: Provide comprehensive budget status overview with filtering and visual indicators
  - _Implementation: Standalone component with computed signal-based filtering (controlTypeFilter, statusFilter, searchQuery). Summary calculations use reduce() over filtered items. Progress bars dynamically colored based on usage thresholds. Table shows drug info, control badges (Q:HARD, P:SOFT), dual progress bars, status badges, and PR links. Responsive grid layout with media queries for mobile/tablet/desktop._

- [x] 5.2 Add API endpoint for dashboard data ✅ (Completed 2025-12-20)
  - File: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.controller.ts`, `budget-requests.service.ts`, `budget-requests.schemas.ts`, `budget-requests.route.ts`
  - Added GET endpoint: `/api/inventory/budget/budget-requests/:id/items-status`
  - Returns aggregated data: item details, usage percentages, status, related PR IDs
  - Calculates usage percentages for current quarter using getCurrentQuarter()
  - Determines status based on usage (normal <80%, warning 80-99%, exceeded 100%+)
  - Purpose: Provide dashboard with aggregated budget status data
  - _Leverage: Existing budget requests controller and service patterns, getCurrentQuarter() helper_
  - _Requirements: Requirement 5_
  - _Implementation: Created BudgetItemStatusSchema and BudgetItemsStatusResponseSchema with comprehensive TypeBox validation. Added getItemsStatus() service method with efficient Knex query using CASE statements for quarterly data selection. Calculates usage percentages for both quantity and amount, determines status based on max usage percentage. Returns summary statistics (total/normal/warning/exceeded counts, total amounts, overall usage %). Added controller method with error handling. Registered GET route with authentication and read permission check._

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
