# Tasks Document: TMT Frontend UI

## Phase 1: Project Setup & Foundation (4 tasks)

- [ ] 1. Create TMT feature module structure and folder organization
  - Files: `apps/web/src/app/features/inventory/modules/tmt/` (entire directory structure)
  - Create folder structure: components/, services/, models/, validators/
  - Create index.ts for public API exports
  - Create tmt.routes.ts for lazy-loaded routing
  - Purpose: Establish organized feature module structure following Angular 18+ standalone pattern
  - _Leverage: apps/web/src/app/features/inventory/modules/drugs/ (existing pattern)_
  - _Requirements: Design Document - Project Structure_
  - _Prompt: Role: Angular Frontend Architect specializing in feature module organization | Task: Create complete TMT feature module folder structure following Angular 18+ standalone component pattern as specified in design document, replicating the drugs module structure | Restrictions: Must use standalone components (no NgModules), follow existing inventory module patterns, maintain lazy-loading capability | Success: All folders created with proper structure, index.ts exports configured, routes file ready for component imports_

- [ ] 2. Create TypeScript data models and interfaces
  - Files: `apps/web/src/app/features/inventory/modules/tmt/models/*.model.ts` (5 files)
  - Define TMTConcept, TMTMapping, ComplianceStats, AISuggestion, ExportRequest models
  - Include TypeScript enums (TMTLevel, ExportFormat)
  - Match backend API response types exactly
  - Purpose: Establish type-safe data contracts between frontend and backend
  - _Leverage: apps/web/src/app/features/inventory/modules/drugs/types/drugs.types.ts_
  - _Requirements: Design Document - Data Models section_
  - _Prompt: Role: TypeScript Developer specializing in type systems and API contracts | Task: Create all TypeScript data models and interfaces matching backend TMT API schemas from design document, ensuring exact type alignment with backend responses | Restrictions: Must match backend TypeBox schemas exactly, use readonly where appropriate, include JSDoc comments for complex types | Success: All models compile without errors, types align with backend API contracts, enums properly defined_

- [ ] 3. Setup routing configuration with lazy loading
  - Files: `apps/web/src/app/features/inventory/modules/tmt/tmt.routes.ts`, update `apps/web/src/app/features/inventory/inventory.routes.ts`
  - Define routes: /tmt/compliance (default), /tmt/search
  - Configure lazy-loaded route with loadComponent()
  - Add route guards for RBAC (Finance Manager, Pharmacist, Dept Head, Nurse)
  - Purpose: Enable lazy-loaded navigation to TMT feature with proper authorization
  - _Leverage: apps/web/src/app/features/inventory/inventory.routes.ts (existing routing pattern)_
  - _Requirements: Design Document - Routing Structure_
  - _Prompt: Role: Angular Routing Specialist with expertise in lazy loading and route guards | Task: Configure TMT feature routes with lazy loading and RBAC guards following design document routing structure, integrating with existing inventory routes | Restrictions: Must use loadComponent() for lazy loading, apply proper route guards, maintain route data for breadcrumbs | Success: Routes lazy-load correctly, RBAC guards prevent unauthorized access, breadcrumbs display properly_

- [ ] 4. Create form validators for mapping validation
  - Files: `apps/web/src/app/features/inventory/modules/tmt/validators/mapping.validators.ts`
  - Create custom validators: tmtConceptRequired, verificationRequired, notesMaxLength
  - Implement async validator for duplicate mapping check
  - Purpose: Ensure form data integrity before API submission
  - _Leverage: Angular Validators, existing custom validators from drugs module_
  - _Requirements: Requirement 2 - Drug-to-TMT Mapping Management (verification required)_
  - _Prompt: Role: Angular Forms Specialist with expertise in reactive forms and custom validators | Task: Create custom form validators for TMT mapping forms following Angular reactive forms best practices | Restrictions: Must use ValidatorFn and AsyncValidatorFn types, provide descriptive error messages in Thai, handle edge cases | Success: All validators work correctly, error messages display properly in forms, async validators debounce API calls_

## Phase 2: Core Services Implementation (4 tasks)

- [ ] 5. Implement TmtApiService with all backend endpoint methods
  - Files: `apps/web/src/app/features/inventory/modules/tmt/services/tmt-api.service.ts`
  - Implement methods: searchConcepts, getConceptById, getMappings, createMapping, updateMapping, deleteMapping, getMappingSuggestions, getComplianceStats, getUnmappedDrugs, exportMinistryReport
  - Use HttpClient with proper HttpParams construction
  - Handle error responses (400, 403, 404, 500)
  - Purpose: Provide centralized HTTP client for all TMT backend API calls
  - _Leverage: apps/web/src/app/features/inventory/modules/drugs/services/drugs.service.ts (API client pattern)_
  - _Requirements: Design Document - Service 1: TmtApiService_
  - _Prompt: Role: Angular HTTP Client Specialist with expertise in RESTful API integration | Task: Implement complete TmtApiService with all backend endpoint methods from design document, following existing drugs service HTTP client pattern | Restrictions: Must use HttpClient, properly construct HttpParams for query strings, handle all error status codes, return Promises (not Observables) | Success: All API methods implemented, error handling robust, HttpParams constructed correctly for complex queries_

- [ ] 6. Implement TmtStateService with Signal-based state management
  - Files: `apps/web/src/app/features/inventory/modules/tmt/services/tmt-state.service.ts`
  - Create private writable signals: complianceStatsSignal, unmappedDrugsSignal, complianceTrendSignal, loadingSignal, errorSignal
  - Expose readonly signals for components
  - Implement computed signals: isCompliant, complianceRate, unmappedCount
  - Implement actions: loadCompliance(), loadComplianceTrend(), updateComplianceRate()
  - Purpose: Centralized reactive state management for TMT module using Angular Signals
  - _Leverage: apps/web/src/app/features/inventory/modules/drugs/services/drugs.service.ts (Signal pattern)_
  - _Requirements: Design Document - Service 2: TmtStateService_
  - _Prompt: Role: Angular State Management Expert specializing in Signals and reactive patterns | Task: Implement TmtStateService with Signal-based state management following design document specification, using drugs service as reference pattern | Restrictions: Must use signal() for private state, asReadonly() for public exposure, computed() for derived state, no manual subscriptions | Success: All signals reactive, computed signals auto-update, state changes trigger component re-renders automatically_

- [ ] 7. Implement TmtWebSocketService for real-time updates
  - Files: `apps/web/src/app/features/inventory/modules/tmt/services/tmt-websocket.service.ts`
  - Subscribe to TMT events: mapping.created, mapping.updated, mapping.deleted, compliance.rate_changed
  - Handle WebSocket messages and update TmtStateService
  - Show snackbar notifications for real-time events
  - Implement auto-reconnect on connection loss
  - Purpose: Enable real-time compliance rate updates and mapping notifications
  - _Leverage: apps/web/src/app/shared/business/services/websocket.service.ts (existing WebSocket service)_
  - _Requirements: Requirement 6 - Real-time Updates and Notifications, Design Document - Service 3_
  - _Prompt: Role: WebSocket Integration Specialist with expertise in Socket.io and real-time updates | Task: Implement TmtWebSocketService wrapping existing WebSocket service for TMT-specific real-time events, following design document specification | Restrictions: Must reuse existing WebSocketService, subscribe to feature='tmt' entity='mapping'/'compliance', handle connection errors gracefully | Success: WebSocket messages received correctly, TmtStateService updated on events, snackbar notifications appear, auto-reconnect works_

- [ ] 8. Implement ExportService for ministry report generation
  - Files: `apps/web/src/app/features/inventory/modules/tmt/services/export.service.ts`
  - Implement exportMinistryReport() with progress callback
  - Handle file download with XMLHttpRequest for progress tracking
  - Support CSV, Excel, JSON formats
  - Purpose: Generate and download ministry reports with progress indication
  - _Leverage: apps/web/src/app/shared/components/shared-export/shared-export.component.ts (export pattern)_
  - _Requirements: Requirement 5 - Ministry Report Generation and Export UI, Design Document - Service 4_
  - _Prompt: Role: File Download Specialist with expertise in browser file APIs and progress tracking | Task: Implement ExportService for ministry report generation and download with progress callback, following design document specification | Restrictions: Must use XMLHttpRequest for progress events, support onProgress callback, handle blob downloads, auto-trigger file download | Success: Files download correctly in all formats, progress callback fires with accurate percentages, filenames match pattern_

## Phase 3: Reusable Components (3 tasks)

- [ ] 9. Create ConfidenceBadgeComponent for AI confidence visualization
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-mapping/confidence-badge.component.ts` (+ HTML, SCSS)
  - Input: confidence score (0-100)
  - Display confidence level badge (HIGH/MEDIUM/LOW) with color coding
  - Show visual indicator (5-dot scale)
  - Add tooltip explaining confidence scoring algorithm
  - Purpose: Consistent visual representation of AI confidence scores
  - _Leverage: @aegisx/ui AxBadgeComponent, MatTooltip_
  - _Requirements: Requirement 3 - AI Suggestion Review and Acceptance UI_
  - _Prompt: Role: Angular Component Developer specializing in presentation components | Task: Create ConfidenceBadgeComponent displaying AI confidence scores with color-coded badges and visual indicators, using AegisX UI and Material components | Restrictions: Must be standalone component, use OnPush change detection, accept Input() score, use AxBadgeComponent for styling | Success: Badge displays correct color per level (green=HIGH, yellow=MEDIUM, red=LOW), tooltip shows scoring breakdown, 5-dot indicator renders correctly_

- [ ] 10. Create TmtConceptCardComponent for TMT concept display
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-search/tmt-concept-card.component.ts` (+ HTML, SCSS)
  - Input: TMT concept object
  - Display concept code, preferred term, FSN, level badge
  - Show children count if applicable
  - Emit click event for concept selection
  - Purpose: Reusable card component for displaying TMT concepts in search results
  - _Leverage: @aegisx/ui AxCardComponent, AxBadgeComponent_
  - _Requirements: Requirement 1 - TMT Concept Search and Browse Interface_
  - _Prompt: Role: Angular Component Developer with UI/UX expertise | Task: Create TmtConceptCardComponent displaying TMT concept details in card format using AegisX UI components | Restrictions: Must be standalone, use AxCardComponent wrapper, emit Output() conceptClick event, show TMT level badge with color coding | Success: Card displays all concept fields correctly, level badges color-coded (VTM=blue, GP=green, etc.), click event emits concept object_

- [ ] 11. Create TmtHierarchyTreeComponent for parent-child visualization
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-search/tmt-hierarchy-tree.component.ts` (+ HTML, SCSS)
  - Input: TMT concept with parent and children
  - Display hierarchical tree: parent → current → children
  - Expand/collapse children nodes
  - Highlight current concept
  - Purpose: Visualize TMT concept hierarchy for better understanding
  - _Leverage: Angular CDK Tree, MatIcon_
  - _Requirements: Requirement 1 - TMT Concept Search and Browse Interface (hierarchy view)_
  - _Prompt: Role: Angular Component Developer specializing in tree structures and data visualization | Task: Create TmtHierarchyTreeComponent displaying TMT concept hierarchy using Angular CDK Tree utilities | Restrictions: Must be standalone, use Angular CDK Tree or custom nested list, support expand/collapse, highlight current node | Success: Tree displays full hierarchy correctly, expand/collapse works smoothly, current concept visually distinct, arrows indicate parent-child relationships_

## Phase 4: TMT Search Feature (1 task)

- [ ] 12. Create TmtSearchComponent with debounced search and filters
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-search/tmt-search.component.ts` (+ HTML, SCSS)
  - Implement search input with 300ms debounce
  - Add TMT level filter (multi-select)
  - Display search results using TmtConceptCardComponent
  - Show hierarchy tree for selected concept using TmtHierarchyTreeComponent
  - Implement pagination or virtual scrolling (>100 results)
  - Purpose: Main TMT concepts search interface for pharmacists
  - _Leverage: TmtApiService, TmtConceptCardComponent, TmtHierarchyTreeComponent, CdkVirtualScrollViewport_
  - _Requirements: Requirement 1 - TMT Concept Search and Browse Interface_
  - _Prompt: Role: Angular Search UI Specialist with expertise in debounced inputs and virtual scrolling | Task: Create TmtSearchComponent with debounced search, level filters, and virtual scrolling following design document specification | Restrictions: Must use RxJS debounceTime(300ms), implement virtual scrolling for >100 results, reuse child components (TmtConceptCard, TmtHierarchyTree) | Success: Search debounces correctly, level filters work, virtual scrolling renders only visible items, hierarchy tree displays on concept selection_

## Phase 5: Mapping Feature (3 tasks)

- [ ] 13. Create AiSuggestionsListComponent for displaying AI matches
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-mapping/ai-suggestions-list.component.ts` (+ HTML, SCSS)
  - Input: array of AI suggestions with confidence scores
  - Display top 5 suggestions sorted by confidence
  - Show match breakdown (✓ Name matched, ✓ Strength matched, ○ Form not matched)
  - Use ConfidenceBadgeComponent for confidence visualization
  - Emit suggestionSelected event
  - Purpose: Display AI-suggested TMT matches for quick mapping
  - _Leverage: ConfidenceBadgeComponent, AxCardComponent, MatList_
  - _Requirements: Requirement 3 - AI Suggestion Review and Acceptance UI_
  - _Prompt: Role: Angular List Component Developer specializing in data presentation | Task: Create AiSuggestionsListComponent displaying AI suggestions with confidence indicators and match breakdown using design document specification | Restrictions: Must be standalone, use ConfidenceBadgeComponent, emit Output() suggestionSelected, sort by confidence descending, limit to top 5 | Success: Suggestions display correctly sorted, confidence badges render, match breakdown shows checkmarks/circles, selection emits event_

- [ ] 14. Create MappingFormComponent for TMT mapping form
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-mapping/mapping-form.component.ts` (+ HTML, SCSS)
  - Create reactive form with fields: tmt_concept_id, verified (checkbox), notes
  - Apply custom validators from mapping.validators.ts
  - Show selected TMT concept details with hierarchy path
  - Display validation errors in Thai
  - Purpose: Form component for creating/editing TMT mappings
  - _Leverage: ReactiveFormsModule, custom validators, MatFormField, MatCheckbox_
  - _Requirements: Requirement 2 - Drug-to-TMT Mapping Interface_
  - _Prompt: Role: Angular Reactive Forms Developer with validation expertise | Task: Create MappingFormComponent with reactive form validation using custom validators from mapping.validators.ts | Restrictions: Must use ReactiveFormsModule, apply custom validators, show Thai error messages, require pharmacist verification checkbox | Success: Form validates correctly, verification checkbox required, error messages display in Thai, form value emits on valid submission_

- [ ] 15. Create MappingDialogComponent integrating all mapping sub-components
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/tmt-mapping/mapping-dialog.component.ts` (+ HTML, SCSS)
  - Accept dialog data: drug object, existing mapping (if edit mode)
  - Load AI suggestions on init using TmtApiService
  - Integrate AiSuggestionsListComponent for AI matches
  - Integrate TmtSearchComponent for manual search
  - Integrate MappingFormComponent for final form
  - Handle suggestion selection → auto-fill form
  - Save mapping via TmtApiService
  - Show success/error snackbar
  - Purpose: Complete mapping workflow dialog with AI suggestions and manual search
  - _Leverage: MatDialog, AiSuggestionsListComponent, TmtSearchComponent, MappingFormComponent, TmtApiService, MatSnackBar_
  - _Requirements: Requirement 2 + Requirement 3 (complete mapping workflow)_
  - _Prompt: Role: Angular Dialog Developer with expertise in complex modal interactions | Task: Create MappingDialogComponent orchestrating AI suggestions, manual search, and form submission following design document workflow | Restrictions: Must use MatDialog with MAT_DIALOG_DATA injection, integrate all child components, handle create/edit modes, show loading states | Success: Dialog opens correctly, AI suggestions load automatically, manual search works, suggestion selection pre-fills form, save creates/updates mapping, snackbar shows feedback_

## Phase 6: Compliance Dashboard (5 tasks)

- [ ] 16. Create ComplianceStatsCardsComponent for statistics display
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/compliance/compliance-stats-cards.component.ts` (+ HTML, SCSS)
  - Input: ComplianceStats object
  - Display 4 cards: Total Drugs, Mapped & Verified, Unmapped, Compliance Rate
  - Use AxCardComponent for each stat
  - Color-code based on status (green=compliant, red=non-compliant)
  - Purpose: Visual statistics cards for compliance overview
  - _Leverage: AxCardComponent, TailwindCSS utilities_
  - _Requirements: Requirement 4 - Compliance Dashboard and Monitoring (statistics breakdown)_
  - _Prompt: Role: Angular Dashboard Component Developer specializing in data visualization | Task: Create ComplianceStatsCardsComponent displaying compliance statistics in card grid using AegisX UI components | Restrictions: Must be standalone, use AxCardComponent for each stat, apply TailwindCSS responsive grid (2x2 on desktop, 1 column on mobile), color-code by status | Success: 4 cards display correctly, responsive grid works, colors match status (green≥95%, red<95%), numbers format with commas_

- [ ] 17. Create ComplianceProgressBarComponent for visual progress
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/compliance/compliance-progress-bar.component.ts` (+ HTML, SCSS)
  - Input: compliance rate percentage (0-100)
  - Display progress bar with color coding (green≥95%, yellow 80-94%, red<80%)
  - Show percentage text overlay
  - Add status badge (✅ COMPLIANT / ⚠️ NON_COMPLIANT)
  - Purpose: Visual progress indicator for compliance rate
  - _Leverage: MatProgressBar or custom progress bar, AxBadgeComponent_
  - _Requirements: Requirement 4 - Compliance Dashboard and Monitoring (visual indicators)_
  - _Prompt: Role: Angular UI Component Developer with CSS animation expertise | Task: Create ComplianceProgressBarComponent with color-coded progress visualization using Material or custom progress bar | Restrictions: Must be standalone, Input() complianceRate, color-code based on thresholds (≥95%=green, 80-94%=yellow, <80%=red), animate progress changes | Success: Progress bar fills to correct percentage, colors match thresholds, percentage text overlays correctly, status badge displays_

- [ ] 18. Create ComplianceChartComponent for trend visualization
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/compliance/compliance-chart.component.ts` (+ HTML, SCSS)
  - Input: array of compliance trend data (last 6 months)
  - Use AxChartComponent or Chart.js for line chart
  - Display compliance rate line + 95% target threshold line
  - Configure responsive chart options
  - Purpose: Historical compliance rate trend visualization
  - _Leverage: AxChartComponent (AegisX UI), or ng2-charts with Chart.js_
  - _Requirements: Requirement 4 - Compliance Dashboard and Monitoring (trend chart)_
  - _Prompt: Role: Angular Chart Component Developer with Chart.js expertise | Task: Create ComplianceChartComponent displaying compliance trend line chart using AxChartComponent or Chart.js | Restrictions: Must be standalone, use computed() for chart data transformation, show 95% threshold line (dashed), maintain aspect ratio, responsive | Success: Chart displays correctly, trend line shows data points, threshold line visible, responsive resizing works, tooltip shows percentages_

- [ ] 19. Create UnmappedDrugsTableComponent with Mat-Table
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/compliance/unmapped-drugs-table.component.ts` (+ HTML, SCSS)
  - Input: array of unmapped drugs
  - Display columns: drug_code, trade_name, usage_count, days_unmapped, actions
  - Implement MatSort for column sorting
  - Implement MatPaginator for pagination
  - Add [Map] button per row → opens MappingDialogComponent
  - Show priority badge for drugs unmapped >7 days or high usage
  - Purpose: Actionable table of unmapped drugs sorted by priority
  - _Leverage: MatTable, MatSort, MatPaginator, MappingDialogComponent, MatDialog, AxBadgeComponent_
  - _Requirements: Requirement 4 - Compliance Dashboard and Monitoring (unmapped drugs table)_
  - _Prompt: Role: Angular Table Component Developer with Mat-Table expertise | Task: Create UnmappedDrugsTableComponent with sorting, pagination, and mapping action buttons using Material table components | Restrictions: Must be standalone, use MatTableDataSource, implement trackBy for performance, emit Output() mapClicked event, calculate days_unmapped client-side | Success: Table displays correctly, sorting works on all columns, pagination functional, [Map] button opens dialog, priority badges show for overdue drugs_

- [ ] 20. Create ComplianceDashboardComponent integrating all dashboard components
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/compliance/compliance-dashboard.component.ts` (+ HTML, SCSS)
  - Load compliance data on init using TmtStateService
  - Integrate ComplianceStatsCardsComponent
  - Integrate ComplianceProgressBarComponent
  - Integrate ComplianceChartComponent
  - Integrate UnmappedDrugsTableComponent
  - Subscribe to TmtWebSocketService for real-time updates
  - Add "Generate Ministry Report" button → opens ExportDialogComponent
  - Show breadcrumb navigation
  - Purpose: Main compliance dashboard page orchestrating all sub-components
  - _Leverage: All child components, TmtStateService, TmtWebSocketService, BreadcrumbComponent_
  - _Requirements: Requirement 4 - Compliance Dashboard (complete page)_
  - _Prompt: Role: Angular Page Component Developer with dashboard layout expertise | Task: Create ComplianceDashboardComponent as main dashboard page integrating all child components and real-time WebSocket updates | Restrictions: Must be standalone, load data on ngOnInit, subscribe to WebSocket updates, handle loading/error states with AxEmptyState/AxErrorState, use OnPush detection | Success: Dashboard loads compliance data, all child components render correctly, real-time updates work, export button opens dialog, breadcrumbs display_

## Phase 7: Export Feature (3 tasks)

- [ ] 21. Create ExportProgressComponent for download progress
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/export/export-progress.component.ts` (+ HTML, SCSS)
  - Input: progress percentage (0-100), exporting status
  - Display MatProgressBar with percentage text
  - Show loading spinner + status message ("กำลังสร้างรายงาน... (500/1169)")
  - Purpose: Visual feedback during ministry report generation
  - _Leverage: MatProgressBar, MatProgressSpinner_
  - _Requirements: Requirement 5 - Ministry Report Generation and Export UI (progress indication)_
  - _Prompt: Role: Angular Progress Component Developer specializing in loading states | Task: Create ExportProgressComponent displaying export progress with progress bar and status message | Restrictions: Must be standalone, Input() progress and exporting signals, show spinner when exporting=true, hide when complete | Success: Progress bar updates smoothly, percentage text displays, status message shows record count, spinner appears during export_

- [ ] 22. Create ExportHistoryListComponent for past exports
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/export/export-history-list.component.ts` (+ HTML, SCSS)
  - Input: array of export history records
  - Display list with format, date, compliance rate, download link
  - Limit to last 10 exports
  - Purpose: Show recent ministry report exports for re-download
  - _Leverage: MatList, MatIcon, AxEmptyStateComponent_
  - _Requirements: Requirement 5 - Ministry Report Generation and Export UI (export history)_
  - _Prompt: Role: Angular List Component Developer | Task: Create ExportHistoryListComponent displaying past ministry report exports with download links | Restrictions: Must be standalone, Input() exportHistory array, show last 10 only, format dates in Thai locale, provide download link per item | Success: History displays correctly, dates formatted (DD/MM/YYYY HH:mm), download links trigger file download, empty state shows when no history_

- [ ] 23. Create ExportDialogComponent for report configuration
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/export/export-dialog.component.ts` (+ HTML, SCSS)
  - Accept dialog data: current compliance rate
  - Create form: format selection (CSV/Excel/JSON), optional date range
  - Show warning dialog if compliance < 95%
  - Integrate ExportProgressComponent for progress tracking
  - Integrate ExportHistoryListComponent below form
  - Call ExportService.exportMinistryReport() with progress callback
  - Trigger file download on completion
  - Purpose: Complete export workflow dialog
  - _Leverage: MatDialog, ReactiveFormsModule, ExportService, ExportProgressComponent, ExportHistoryListComponent, MatSnackBar_
  - _Requirements: Requirement 5 - Ministry Report Generation and Export UI (complete workflow)_
  - _Prompt: Role: Angular Dialog Developer with file export expertise | Task: Create ExportDialogComponent orchestrating export configuration, progress tracking, and file download workflow | Restrictions: Must use MatDialog with MAT_DIALOG_DATA, validate compliance rate, show warning if <95%, track progress via ExportService callback, auto-download file | Success: Dialog opens correctly, form validates, warning shows for non-compliance, progress updates in real-time, file downloads on completion, snackbar confirms success_

## Phase 8: Integration & Testing (5 tasks)

- [ ] 24. Integrate WebSocket real-time updates across all components
  - Files: Update `compliance-dashboard.component.ts`, `unmapped-drugs-table.component.ts`
  - Subscribe to WebSocket events in ComplianceDashboardComponent
  - Handle mapping.created → reload compliance stats
  - Handle compliance.rate_changed → update progress bar
  - Show snackbar notifications for real-time events
  - Handle WebSocket connection lost → show warning banner
  - Purpose: Enable real-time UI updates when other users create mappings
  - _Leverage: TmtWebSocketService, MatSnackBar, MatBanner (or custom banner)_
  - _Requirements: Requirement 6 - Real-time Updates and Notifications_
  - _Prompt: Role: WebSocket Integration Specialist with Angular expertise | Task: Integrate TmtWebSocketService into ComplianceDashboardComponent for real-time updates following design document specification | Restrictions: Must subscribe in ngOnInit, unsubscribe in ngOnDestroy, handle all event types (created, updated, deleted, rate_changed), show user-friendly notifications | Success: WebSocket events trigger UI updates, snackbar notifications appear, compliance rate updates automatically, connection lost banner shows and hides correctly_

- [ ] 25. Add route guards for RBAC authorization
  - Files: `apps/web/src/app/features/inventory/modules/tmt/guards/tmt-role.guard.ts`, update `tmt.routes.ts`
  - Create TmtRoleGuard implementing CanActivate
  - Check user roles: Finance Manager, Pharmacist, Department Head, Nurse (read-only), Other (403)
  - Redirect unauthorized users to 403 Forbidden page
  - Apply guard to all TMT routes
  - Purpose: Prevent unauthorized access to TMT features
  - _Leverage: Existing AuthGuard, RoleGuard patterns from core/auth_
  - _Requirements: Design Document - Security (RBAC)_
  - _Prompt: Role: Angular Security Specialist with route guard expertise | Task: Create TmtRoleGuard implementing RBAC authorization for TMT routes following existing AuthGuard patterns | Restrictions: Must implement CanActivate interface, check user roles via AuthService, redirect to /403 on unauthorized, apply to all routes in tmt.routes.ts | Success: Guard blocks unauthorized users, authorized roles can access routes, proper redirect to 403 page, guard integrates with existing auth system_

- [ ] 26. Write unit tests for all services (≥70% coverage)
  - Files: `apps/web/src/app/features/inventory/modules/tmt/services/*.service.spec.ts` (4 test files)
  - Test TmtApiService: mock HttpClient, verify correct URL construction, test error handling
  - Test TmtStateService: verify signal updates, test computed signals, test error states
  - Test TmtWebSocketService: mock WebSocket messages, verify event handling, test snackbar notifications
  - Test ExportService: mock XMLHttpRequest, verify download triggered, test progress callback
  - Purpose: Ensure service layer reliability and catch regressions
  - _Leverage: Jest or Jasmine, HttpClientTestingModule, jasmine.createSpyObj_
  - _Requirements: Design Document - Testing Strategy (Unit Testing)_
  - _Prompt: Role: QA Engineer specializing in Angular unit testing with Jest/Jasmine | Task: Write comprehensive unit tests for all TMT services achieving ≥70% code coverage following design document testing strategy | Restrictions: Must use HttpClientTestingModule for HTTP tests, mock all external dependencies, test both success and error scenarios, verify signal updates | Success: All services have test files, code coverage ≥70%, tests pass consistently, mocks properly configured, edge cases covered_

- [ ] 27. Write integration tests for critical components
  - Files: `apps/web/src/app/features/inventory/modules/tmt/components/**/*.component.spec.ts`
  - Test ComplianceDashboardComponent: verify data loading flow, test child component integration
  - Test MappingDialogComponent: test AI suggestions → form pre-fill → save flow
  - Test UnmappedDrugsTableComponent: test [Map] button → dialog opens → table refreshes
  - Purpose: Verify component interactions and data flow
  - _Leverage: TestBed, HttpClientTestingModule, NoopAnimationsModule_
  - _Requirements: Design Document - Testing Strategy (Integration Testing)_
  - _Prompt: Role: QA Engineer with Angular integration testing expertise | Task: Write integration tests for critical TMT components testing data flow and component interactions | Restrictions: Must use TestBed.configureTestingModule, import NoopAnimationsModule to disable animations, test user interactions via fixture.nativeElement | Success: Integration tests verify complete workflows, component interactions work correctly, tests run without flakiness_

- [ ] 28. Write E2E tests for critical user workflows using Playwright
  - Files: `apps/web-e2e/src/tmt/*.spec.ts` (3 test files)
  - Test "Pharmacist maps drug to TMT concept" workflow (search suggestions → select → verify → save)
  - Test "Finance manager exports ministry report" workflow (open dialog → select format → export → download)
  - Test "Real-time compliance update" workflow (simulate mapping creation → verify UI updates)
  - Purpose: Validate end-to-end user journeys work correctly
  - _Leverage: Playwright, page.goto(), page.click(), page.waitForSelector()_
  - _Requirements: Design Document - Testing Strategy (E2E Testing)_
  - _Prompt: Role: QA Automation Engineer specializing in Playwright E2E testing | Task: Write end-to-end tests for critical TMT user workflows using Playwright following design document test scenarios | Restrictions: Must use Playwright test framework, test real user interactions, verify file downloads, handle async operations with waitForSelector | Success: All E2E tests pass reliably, tests cover critical workflows (mapping, export, real-time), file downloads verified, tests run in CI/CD pipeline_
