# Tasks Document: Department Management UI

## Phase 1: Core Department Management

- [x] 1. Create TypeScript interfaces and types
  - Files:
    - `apps/admin/src/app/pages/platform/departments/types/departments-ui.types.ts` (NEW)
  - Purpose: Define type-safe interfaces for department UI state, filters, and form data
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts` (existing Department interface)
  - \_Requirements: REQ-1, REQ-4
  - \_Prompt: **Role**: TypeScript Developer specializing in type systems and Angular interfaces | **Task**: Create comprehensive TypeScript interfaces for the department management UI following requirements REQ-1 (Admin Department Management Interface) and REQ-4 (Department Hierarchy Management). Define DepartmentFormData, DepartmentFilterState, DepartmentHierarchyNode, and DepartmentUIState interfaces. Extend the existing Department interface from the DepartmentService where appropriate. | **Restrictions**: Do not duplicate existing Department interface - import and extend it. Do not create any types - all properties must use existing types. Follow strict TypeScript mode conventions. | **\_Leverage**: Import Department interface from existing DepartmentService at apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts | **Success Criteria**: All interfaces compile without errors, proper type safety for UI state management, interfaces match design document specifications (DepartmentFormData, DepartmentFilterState, DepartmentHierarchyNode), no type duplication

- [x] 2. Create DepartmentsUIService for state management
  - Files:
    - `apps/admin/src/app/pages/platform/departments/services/departments-ui.service.ts` (NEW)
  - Purpose: Manage UI state including filters, pagination, selection, and search
  - \_Leverage:
    - `apps/admin/src/app/pages/platform/departments/types/departments-ui.types.ts` (from Task 1)
  - \_Requirements: REQ-1 (AC 11-14: filtering, searching, pagination)
  - \_Prompt: **Role**: Angular Frontend Developer specializing in signal-based reactive state management | **Task**: Implement DepartmentsUIService for managing UI state following requirement REQ-1 acceptance criteria 11-14 (filtering by active status and parent department, searching by dept_code/dept_name, pagination with 10/25/50/100 items per page). Use Angular signals for reactive state. Implement methods for: updateFilter(key, value), applySearch(term), setPagination(page, pageSize), resetFilters(). Store state in signals: filterState, searchTerm, paginationState, selectedDepartments. | **Restrictions**: Use signals only (no BehaviorSubject or RxJS for state). Do not make HTTP calls - this is UI state only. Must be injectable service with providedIn: 'root'. | **\_Leverage**: Use DepartmentFilterState interface from Task 1 | **Success Criteria**: Service manages filter state with signals, search is debounced (300ms), pagination state is tracked, state can be reset, service is injectable and type-safe

- [x] 3. Create main DepartmentsComponent page structure
  - Files:
    - `apps/admin/src/app/pages/platform/departments/departments.component.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/departments.component.html` (NEW)
    - `apps/admin/src/app/pages/platform/departments/departments.component.scss` (NEW)
  - Purpose: Main page with department list table, search, filters, and action buttons
  - \_Leverage:
    - `apps/admin/src/app/pages/playground/pages/user-management/user-management.component.ts` (pattern reference)
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts` (existing service)
    - `apps/admin/src/app/pages/platform/departments/services/departments-ui.service.ts` (from Task 2)
  - \_Requirements: REQ-1 (AC 1-2, 11-14)
  - \_Prompt: **Role**: Senior Angular Frontend Developer specializing in Material UI and data tables | **Task**: Implement the main DepartmentsComponent page following requirement REQ-1 acceptance criteria 1-2 (display department list with hierarchical view, show dept_code, dept_name, parent department, active status, action buttons) and AC 11-14 (filtering, searching, pagination). Use MatTableDataSource with MatPaginator and MatSort. Use signals for reactive state. Display columns: dept_code, dept_name, parent (parent_dept_name), is_active (toggle), actions (edit, delete). Import and inject existing DepartmentService for data fetching. Inject DepartmentsUIService for state management. Implement loadDepartments() to call DepartmentService.loadDepartmentList() with filter params. Add search bar with debouncing, filter dropdowns for active status and parent department, pagination controls (10/25/50/100), and "Add Department" button. | **Restrictions**: Must use existing DepartmentService - do not create new HTTP service. Follow user-management component patterns exactly. Use standalone component. Must implement OnInit and AfterViewInit. Do not implement dialog components yet (stubs only). | **\_Leverage**: Follow exact pattern from apps/admin/src/app/pages/playground/pages/user-management/user-management.component.ts for table setup, pagination, and filtering. Reuse DepartmentService from apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts | **Success Criteria**: Component renders table with department data, MatPaginator and MatSort work correctly, search and filter controls are functional (debounced search, active status filter, parent department filter), "Add Department" button is visible, action buttons (edit, delete) are present, component is standalone and follows admin panel conventions

- [x] 4. Create DepartmentFormDialogComponent for create/edit
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.html` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.scss` (NEW)
  - Purpose: Modal dialog for creating and editing departments with validation
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts` (existing service)
    - `apps/admin/src/app/pages/platform/departments/types/departments-ui.types.ts` (DepartmentFormData)
    - Material dialog patterns from existing admin components
  - \_Requirements: REQ-1 (AC 3-7, 11), REQ-4 (AC 1-4: parent department selection, circular reference prevention)
  - _Prompt: **Role**: Angular Forms Specialist with expertise in reactive forms and validation | **Task**: Implement DepartmentFormDialogComponent for creating and editing departments following requirement REQ-1 acceptance criteria 3-7 (create/edit forms with validation and API calls) and AC 11 (toggle active/inactive status), plus REQ-4 AC 1-4 (parent department selection with circular reference prevention). Use ReactiveFormsModule with FormBuilder. Create form with fields: dept_code (required, 2-20 chars, pattern ^[A-Z0-9_-]+$), dept_name (required, 2-200 chars), parent_id (optional, mat-select dropdown), is_active (mat-slide-toggle, default true). Inject MAT_DIALOG_DATA to receive mode ('create' | 'edit') and existing department data. Load parent department options from DepartmentService.loadDepartmentList({is_active: true}). Implement custom validator validateCircularReference() to prevent setting department as its own parent or ancestor. On save, call DepartmentService.createDepartment() or updateDepartment() based on mode. Show MatSnackBar on success/error. Close dialog on success with result. | **Restrictions**: Must use existing DepartmentService - no new HTTP calls. Must implement circular reference validation before submission. When editing, exclude current department and its descendants from parent dropdown. Use Material form components (mat-form-field, mat-input, mat-select, mat-slide-toggle). Must be standalone component. | **\_Leverage**: Use existing DepartmentService for CRUD operations and loading parent options. Use DepartmentFormData interface from Task 1. Follow Material dialog patterns from user management | **Success Criteria**: Dialog opens in create/edit mode, form pre-fills with department data in edit mode, all validations work (required fields, pattern matching, circular reference prevention), parent dropdown shows only valid options (excludes self and descendants), save creates/updates department via API, success/error feedback via MatSnackBar, dialog closes on successful save

- [x] 5. Connect form dialog to main component and add routing
  - Files:
    - `apps/admin/src/app/pages/platform/departments/departments.component.ts` (MODIFY from Task 3)
    - `apps/admin/src/app/app.routes.ts` (MODIFY - add route)
    - `apps/admin/src/app/layouts/admin-layout/admin-layout.component.ts` (MODIFY - add navigation menu item)
  - Purpose: Wire dialog to main component actions and make page accessible via routing
  - \_Leverage:
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.ts` (from Task 4)
  - \_Requirements: REQ-1 (AC 1, 3, 6, 8-9)
  - \_Prompt: **Role**: Angular Developer specializing in routing and component integration | **Task**: Connect the DepartmentFormDialogComponent to the main DepartmentsComponent actions following requirement REQ-1 acceptance criteria 1 (navigation), 3 (open create dialog), 6 (open edit dialog), 8-9 (delete confirmation). Implement openCreateDialog() to open dialog with mode='create'. Implement openEditDialog(department) to open dialog with mode='edit' and department data. Implement deleteDepartment(id) to show MatDialog confirmation, then call DepartmentService.deleteDepartment() on confirm. Handle errors (409 for departments with users). After dialog closes with success result, call loadDepartments() to refresh list. Add route to apps/admin/src/app/app.routes.ts: {path: 'platform/departments', component: DepartmentsComponent, canActivate: [authGuard, permissionGuard], data: {permission: 'departments:read'}}. Add navigation menu item to admin layout sidebar: {label: 'Departments', icon: 'account_tree', path: '/platform/departments', permission: 'departments:read'}. | **Restrictions**: Use MatDialog.open() for all dialogs. Must check permissions before showing delete button (hide if no departments:delete). Must refresh list after any CRUD operation. Follow existing route and navigation patterns. | **\_Leverage**: Use DepartmentFormDialogComponent from Task 4 for create/edit dialogs. Follow routing patterns from existing admin routes | **Success Criteria**: "Add Department" button opens create dialog, edit button opens edit dialog with pre-filled data, delete button shows confirmation and calls API, successful operations refresh the list, route works at /platform/departments, navigation menu item appears under Platform section (only if user has departments:read permission), page is protected by auth and permission guards

- [x] 6. Implement search and filter functionality
  - Files:
    - `apps/admin/src/app/pages/platform/departments/departments.component.ts` (MODIFY from Task 5)
    - `apps/admin/src/app/pages/platform/departments/departments.component.html` (MODIFY from Task 3)
  - Purpose: Add functional search bar and filter controls with debouncing
  - \_Leverage:
    - `apps/admin/src/app/pages/platform/departments/services/departments-ui.service.ts` (from Task 2)
    - RxJS operators (debounceTime, distinctUntilChanged)
  - \_Requirements: REQ-1 (AC 11-14)
  - \_Prompt: **Role**: Angular Developer specializing in reactive programming and RxJS | **Task**: Implement search and filter functionality following requirement REQ-1 acceptance criteria 11-14 (filtering by active status and parent department, searching by dept_code/dept_name, pagination). Create FormControl for search input with debounceTime(300ms) and distinctUntilChanged(). Create FormControl for active status filter (null=all, true=active, false=inactive). Create FormControl for parent department filter (mat-select with department dropdown). Subscribe to all FormControl valueChanges and update DepartmentsUIService filter state. In loadDepartments(), read filter state from DepartmentsUIService and pass to DepartmentService.loadDepartmentList() as params. Implement applyFilter() method that updates dataSource filter. Add search input to template with mat-form-field. Add filter dropdowns for active status and parent department. Wire search and filters to call loadDepartments() on change. Display result count and active filters. | **Restrictions**: Search must be debounced by 300ms. Must use DepartmentsUIService for state persistence. Filters should combine (AND logic). Must update URL query params with filter state (optional but recommended). | **\_Leverage**: Use DepartmentsUIService from Task 2 for state management. Follow filter patterns from user-management component | **Success Criteria**: Search input debounces and filters by dept_code/dept_name, active status dropdown filters correctly (All/Active/Inactive), parent department dropdown filters by parent, filters work together (combined), pagination shows correct counts, filter state persists in UI service, loading state shows during filtering

- [ ] 7. Add unit tests for Phase 1 components
  - Files:
    - `apps/admin/src/app/pages/platform/departments/departments.component.spec.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/services/departments-ui.service.spec.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.spec.ts` (NEW)
  - Purpose: Ensure core components and services work correctly with good test coverage
  - \_Leverage:
    - Existing test patterns from user-management tests
    - Angular testing utilities (TestBed, ComponentFixture)
  - \_Requirements: REQ-1 (all acceptance criteria)
  - \_Prompt: **Role**: QA Engineer specializing in Angular unit testing with Jasmine and Karma | **Task**: Create comprehensive unit tests for Phase 1 components covering requirement REQ-1 acceptance criteria. For DepartmentsComponent: test loadDepartments() loads data correctly, pagination changes trigger reload, filter application works, dialog opening (create/edit), delete confirmation. For DepartmentsUIService: test filter state updates, search debouncing, pagination state, reset filters. For DepartmentFormDialogComponent: test form validation (required fields, pattern, circular reference), pre-filling in edit mode, save calls correct API method (create vs update), error handling (409 duplicate code). Mock DepartmentService using jasmine.createSpyObj. Use TestBed.configureTestingModule with standalone: true. Test both success and error scenarios. Use fixture.detectChanges() and async/fakeAsync for async tests. | **Restrictions**: Must mock all external dependencies (DepartmentService, MatDialog, MatSnackBar). Do not test Angular framework code. Tests must be isolated and not depend on each other. Must achieve >80% code coverage for tested components. | **\_Leverage**: Follow test patterns from existing user-management component tests. Use Angular testing utilities and Jasmine matchers | **Success Criteria**: All component tests pass, service tests pass, form validation tests cover all scenarios, API call mocking works correctly, test coverage >80% for Phase 1 components, tests run independently and consistently

## Phase 2: Hierarchy Support

- [x] 8. Create DepartmentHierarchyViewComponent with tree display
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-hierarchy-view/department-hierarchy-view.component.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-hierarchy-view/department-hierarchy-view.component.html` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-hierarchy-view/department-hierarchy-view.component.scss` (NEW)
  - Purpose: Display department hierarchy as expandable tree with parent-child relationships
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts` (GET /hierarchy endpoint)
    - `apps/admin/src/app/pages/platform/departments/types/departments-ui.types.ts` (DepartmentHierarchyNode)
    - Material Tree component (@angular/material/tree)
  - \_Requirements: REQ-4 (AC 5-7: display hierarchy with indentation, tree structure with expand/collapse)
  - \_Prompt: **Role**: Angular Developer specializing in Material Tree components and hierarchical data visualization | **Task**: Implement DepartmentHierarchyViewComponent for displaying department hierarchy following requirement REQ-4 acceptance criteria 5-7 (display hierarchy levels with indentation, tree structure with expand/collapse controls). Use MatTree with FlatTreeControl and MatTreeFlatDataSource. Call DepartmentService.loadDepartmentList() or create new method getDepartmentHierarchy() to fetch hierarchy data from GET /v1/platform/departments/hierarchy. Transform flat department list into hierarchical tree structure (parent-child relationships via parent_id). Implement tree node interface with id, dept_code, dept_name, parent_id, is_active, children[], level, expandable. Add expand/collapse icons (mat-icon: expand_more, chevron_right). Show department count per branch. Highlight inactive departments (gray text or icon). Click on node to select/highlight. Emit selectedDepartment event when clicked. | **Restrictions**: Use Material Tree components (mat-tree, mat-tree-node, mat-nested-tree-node). Must handle cyclic references gracefully (should not occur with proper validation, but defensive). Use signals for tree data state. Must be standalone component. | **\_Leverage**: Use DepartmentService to fetch hierarchy data. Use DepartmentHierarchyNode interface from Task 1. Reference Material Tree documentation for implementation pattern | **Success Criteria**: Tree displays department hierarchy correctly, parent-child relationships are accurate, expand/collapse works on all nodes, department count shows per branch, inactive departments are visually distinct (gray color or strikethrough), clicking node emits event, tree handles empty state (no departments), tree is performant with 100+ departments

- [x] 9. Add hierarchy tree view button to main component
  - Files:
    - `apps/admin/src/app/pages/platform/departments/departments.component.ts` (MODIFY from Task 6)
    - `apps/admin/src/app/pages/platform/departments/departments.component.html` (MODIFY from Task 6)
  - Purpose: Add "View Hierarchy" button that opens tree view dialog
  - \_Leverage:
    - `apps/admin/src/app/pages/platform/departments/components/department-hierarchy-view/department-hierarchy-view.component.ts` (from Task 8)
  - \_Requirements: REQ-4 (AC 6: click "View Hierarchy" calls hierarchy endpoint)
  - \_Prompt: **Role**: Angular Developer specializing in dialog integration and component composition | **Task**: Add "View Hierarchy" button to main DepartmentsComponent that opens DepartmentHierarchyViewComponent in a MatDialog following requirement REQ-4 acceptance criteria 6 (click "View Hierarchy" calls hierarchy endpoint and displays tree). Add button to toolbar next to "Add Department" with icon (mat-icon: account_tree). Implement openHierarchyView() method that opens MatDialog with DepartmentHierarchyViewComponent. Set dialog config: width: '800px', maxHeight: '90vh', data: {}. Listen to selectedDepartment event from hierarchy component - when user clicks department in tree, close dialog and open edit dialog for that department. Add "Close" button to dialog actions. | **Restrictions**: Use MatDialog for display. Must pass any needed data to hierarchy component via dialog data. Dialog should be scrollable if tree is large. | **\_Leverage**: Use DepartmentHierarchyViewComponent from Task 8. Follow dialog patterns from Task 4 and 5 | **Success Criteria**: "View Hierarchy" button appears in toolbar, button opens dialog with tree view, tree displays hierarchy correctly, clicking department in tree opens edit dialog, dialog is scrollable and responsive, close button works

- [x] 10. Enhance parent department selector with hierarchy display
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.ts` (MODIFY from Task 4)
    - `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.html` (MODIFY from Task 4)
  - Purpose: Improve parent selector to show hierarchy path and validate against circular references
  - \_Leverage:
    - Existing form from Task 4
  - \_Requirements: REQ-4 (AC 1-4: prevent circular references, validation errors)
  - \_Prompt: **Role**: Angular Forms Developer with expertise in complex validation and mat-select customization | **Task**: Enhance parent department selector in DepartmentFormDialogComponent following requirement REQ-4 acceptance criteria 1-4 (prevent circular references, show validation errors). In parent_id mat-select, display department names with indentation to show hierarchy (e.g., "-- Backend Team" for children). When loading parent options, build hierarchy path for each department (e.g., "Engineering / Backend Team"). Exclude current department and all its descendants from dropdown (in edit mode). Strengthen validateCircularReference() custom validator: fetch department by id, traverse parent_id chain, ensure selected parent is not current dept or any descendant. Show inline error message if circular reference detected: "Cannot create circular reference - selected department is a descendant". Add mat-error below select with validation message. Disable save button if form is invalid. | **Restrictions**: Must traverse full parent chain to detect circular references. Must exclude current department and descendants from parent options. Validation must run before API submission. Use Material form components only. | **\_Leverage**: Use existing DepartmentService to fetch department details for validation. Use form validators from Angular forms | **Success Criteria**: Parent dropdown shows departments with hierarchy indentation, current department is excluded from parent options in edit mode, descendants are excluded from parent options, circular reference validator detects all circular scenarios, inline error appears when validation fails, save button is disabled if form invalid, validation error is user-friendly

- [ ] 11. Add unit tests for Phase 2 hierarchy components
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-hierarchy-view/department-hierarchy-view.component.spec.ts` (NEW)
    - Additional tests in `apps/admin/src/app/pages/platform/departments/components/department-form-dialog/department-form-dialog.component.spec.ts` (MODIFY from Task 7)
  - Purpose: Test hierarchy tree and circular reference validation
  - \_Leverage:
    - Test patterns from Task 7
  - \_Requirements: REQ-4 (all acceptance criteria)
  - \_Prompt: **Role**: QA Engineer specializing in Angular component testing and tree data structures | **Task**: Create unit tests for Phase 2 hierarchy features covering requirement REQ-4 acceptance criteria. For DepartmentHierarchyViewComponent: test hierarchy data transformation (flat to tree), tree rendering with correct parent-child relationships, expand/collapse functionality, department count per branch, inactive department styling, node selection event emission. For enhanced DepartmentFormDialogComponent: test parent dropdown excludes current department, parent dropdown excludes descendants, circular reference validation (direct parent loop, ancestor loop), validation error messages display, form is invalid when circular reference detected. Mock DepartmentService responses with hierarchical test data. Use fixture.debugElement.queryAll for testing tree nodes. | **Restrictions**: Must mock DepartmentService with hierarchical test data. Tests must handle edge cases (no departments, single department, deep nesting, circular data). Use fakeAsync/tick for async operations. | **\_Leverage**: Follow test patterns from Task 7. Use Angular testing utilities | **Success Criteria**: All hierarchy component tests pass, tree transformation tests verify correct structure, validation tests cover all circular reference scenarios (self-parent, ancestor-parent, multi-level), test coverage >80% for Phase 2 components

## Phase 3: User Management Integration

- [x] 12. Create reusable DepartmentSelectorComponent
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.ts` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.html` (NEW)
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.scss` (NEW)
  - Purpose: Standalone dropdown component for department selection in forms (implements ControlValueAccessor)
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
  - \_Requirements: REQ-2 (AC 1-5: department dropdown selector with hierarchical display)
  - \_Prompt: **Role**: Angular Forms Expert specializing in ControlValueAccessor and reusable form components | **Task**: Create DepartmentSelectorComponent as a reusable dropdown for department selection following requirement REQ-2 acceptance criteria 1-5 (department dropdown selector, hierarchical display, nullable field). Implement ControlValueAccessor interface for reactive forms integration. Add @Input() properties: label (default 'Department'), placeholder (default 'Select department'), required (default false), showInactive (default false). Add @Output() departmentSelected event emitter. Use mat-form-field with mat-select for dropdown. Load departments from DepartmentService.loadDepartmentList({is_active: !showInactive}). Display departments with hierarchy indentation (use parent_id to build tree, indent children with "--" prefix). Implement writeValue(), registerOnChange(), registerOnTouched(), setDisabledState() for ControlValueAccessor. Store selected department_id as value. Emit departmentSelected event with full Department object when selection changes. Support null value (no department selected). Add search/filter within dropdown using mat-select-filter or custom filter. | **Restrictions**: Must implement ControlValueAccessor correctly for reactive forms. Must be standalone component with all imports. Must work with formControlName directive. Must handle null values properly. Must load departments on init. | **\_Leverage**: Use DepartmentService to load department options. Follow ControlValueAccessor patterns from Angular documentation | **Success Criteria**: Component implements ControlValueAccessor, works with formControlName in reactive forms, loads department options on init, displays departments with hierarchy indentation, supports nullable selection, emits departmentSelected event with Department object, search/filter works within dropdown, component is fully standalone and reusable, disabled state works

- [x] 13. Integrate department field to user management forms
  - Files:
    - `apps/admin/src/app/pages/playground/pages/user-management/user-management.component.ts` (MODIFY)
    - `apps/admin/src/app/pages/playground/pages/user-management/user-management.component.html` (MODIFY)
    - User form dialog files (if separate component - depends on current structure)
  - Purpose: Add department selection to user create/edit forms
  - \_Leverage:
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.ts` (from Task 12)
  - \_Requirements: REQ-2 (AC 1-7, 10: add department field to user forms, validate department)
  - \_Prompt: **Role**: Angular Developer specializing in form integration and component composition | **Task**: Integrate department field to user management forms following requirement REQ-2 acceptance criteria 1-7 and 10 (department dropdown in create/edit forms, pre-select current department, validate is_active). Add department_id field to User interface (nullable number). Import and use DepartmentSelectorComponent in user form template. Add to user form: <app-department-selector formControlName="department_id" label="Department" [required]="false" />. In user edit mode, pre-fill department_id from user.department_id. Add FormControl for department_id to user form group. Add validator to check department is_active when selected (call DepartmentService.getDepartmentById to verify is_active=true, show warning if inactive). On form submit, include department_id in user data. Handle PUT /api/users/:id with new department_id. Update User interface to include department_id and optional department (DepartmentSummary) fields. | **Restrictions**: Department field must be optional (nullable). Must validate selected department is active before submission. Must handle case where user has no department (null). Use DepartmentSelectorComponent - do not create inline select. | **\_Leverage**: Use DepartmentSelectorComponent from Task 12. Use existing user form structure | **Success Criteria**: Department selector appears in user create form, department selector appears in user edit form with pre-selected value, department_id is nullable (can create user without department), form validates that selected department is active (warning if inactive), user save includes department_id in request body, User interface includes department_id field

- [x] 14. Add department column and filter to user list
  - Files:
    - `apps/admin/src/app/pages/playground/pages/user-management/user-management.component.ts` (MODIFY from Task 13)
    - `apps/admin/src/app/pages/playground/pages/user-management/user-management.component.html` (MODIFY from Task 13)
  - Purpose: Display department name in user list and add department filter
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.ts` (from Task 12)
  - \_Requirements: REQ-2 (AC 8-9: display department name column, filter by department)
  - \_Prompt: **Role**: Angular Developer specializing in data tables and filtering | **Task**: Add department display and filtering to user list following requirement REQ-2 acceptance criteria 8-9 (display department name column, filter users by department). Add 'department' to displayedColumns array (insert after 'role'). In table, add <td mat-cell>{{ user.department?.dept_name || 'None' }}</td>. When loading users, fetch department data: either (1) backend returns department object joined, or (2) after loading users, extract unique department_ids, call DepartmentService.loadDepartmentList({ids: [...]}), and map department names to users. Add filter control to user list toolbar: use DepartmentSelectorComponent with [required]="false" and label="Filter by Department". Add "All Departments" option (null value). When department filter changes, update user list query params and reload users. Display department filter as active filter chip if selected. | **Restrictions**: Must display department name, not just ID. Must handle users without department (show "None" or "-"). Department filter must allow "All" option. Filter should trigger user list reload. | **\_Leverage**: Use DepartmentService to load department names. Use DepartmentSelectorComponent from Task 12 for filter dropdown | **Success Criteria**: Department column appears in user table, department name displays correctly (not ID), users without department show "None", department filter dropdown appears in toolbar, filter has "All Departments" option, changing filter reloads user list with filtered results, active department filter shows as chip

- [ ] 15. Add unit tests for Phase 3 user integration
  - Files:
    - `apps/admin/src/app/pages/platform/departments/components/department-selector/department-selector.component.spec.ts` (NEW)
    - Additional tests in user-management.component.spec.ts (MODIFY)
  - Purpose: Test department selector and user management integration
  - \_Leverage:
    - Test patterns from Task 7 and 11
  - \_Requirements: REQ-2 (all acceptance criteria)
  - \_Prompt: **Role**: QA Engineer specializing in form component testing and integration testing | **Task**: Create unit tests for Phase 3 user integration covering requirement REQ-2 acceptance criteria. For DepartmentSelectorComponent: test ControlValueAccessor implementation (writeValue sets value, registerOnChange registers callback, touched state), department loading on init, hierarchical display with indentation, search/filter functionality, departmentSelected event emission, null value handling, disabled state. For user-management integration: test department field appears in user form, department pre-fills in edit mode, department validation (is_active check), user save includes department_id, department column displays in user list, department filter works correctly. Mock DepartmentService and user service. Test both with and without department assigned. | **Restrictions**: Must test ControlValueAccessor contract thoroughly. Must mock all HTTP services. Tests must verify integration points (form to component communication). | **\_Leverage**: Follow test patterns from previous tasks. Use Angular forms testing utilities | **Success Criteria**: All DepartmentSelectorComponent tests pass, ControlValueAccessor implementation is fully tested, user form integration tests pass, department column display tests pass, filter tests verify correct API calls, test coverage >80% for Phase 3 components

## Phase 4: Profile Integration

- [x] 16. Add department section to profile card
  - Files:
    - `apps/admin/src/app/shared/components/profile-card/profile-card.component.ts` (MODIFY)
    - `apps/admin/src/app/shared/components/profile-card/profile-card.component.html` (MODIFY)
    - `apps/admin/src/app/shared/components/profile-card/profile-card.component.scss` (MODIFY)
  - Purpose: Display user's department affiliation on profile page
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
  - \_Requirements: REQ-3 (AC 1-4, 6-7: display department info, hierarchy path, handle inactive)
  - \_Prompt: **Role**: Angular Developer specializing in profile components and data presentation | **Task**: Add department information section to user profile card following requirement REQ-3 acceptance criteria 1-4, 6-7 (display department section, show hierarchy path, handle no department, show warning for inactive, fetch department details). Add department section to profile card template using mat-card. If user has department_id, call DepartmentService.getDepartmentById(department_id) to fetch full department details. Display department information: dept_name (title), dept_code (subtitle), hierarchy path (breadcrumb). Build hierarchy path by traversing parent_id chain (e.g., "Engineering > Backend Team > API Squad"). If department.is_active = false, show warning indicator (mat-chip with color="warn" and text "Inactive"). If user has no department_id, display placeholder: "No department assigned" with mat-icon: info_outline. Handle fetch errors gracefully: show "Department information unavailable" if API call fails. Use signals for userDepartment and departmentPath state. | **Restrictions**: Must fetch department details on profile load. Must build full hierarchy path (all ancestors). Must handle null department_id (no department assigned). Must show visual warning for inactive department. Must not block profile rendering if department fetch fails. | **\_Leverage**: Use DepartmentService.getDepartmentById() to fetch department details. Traverse parent_id to build hierarchy path | **Success Criteria**: Department section appears in profile card, department name and code display correctly, hierarchy path shows full breadcrumb (e.g., "Parent > Child"), inactive department shows warning indicator (red chip), users without department show "No department assigned", fetch errors show "Department information unavailable", section is responsive and follows profile card design

- [x] 17. Implement hierarchy breadcrumb helper
  - Files:
    - `apps/admin/src/app/pages/platform/departments/services/departments-ui.service.ts` (MODIFY from Task 2)
    - OR create new `apps/admin/src/app/pages/platform/departments/utils/department-hierarchy.utils.ts` (NEW)
  - Purpose: Create utility function to build department hierarchy breadcrumb path
  - \_Leverage:
    - `apps/web/src/app/features/inventory/modules/departments/services/departments.service.ts`
  - \_Requirements: REQ-3 (AC 4: show full hierarchy path)
  - \_Prompt: **Role**: TypeScript Developer specializing in utility functions and tree traversal algorithms | **Task**: Implement utility function to build department hierarchy breadcrumb path following requirement REQ-3 acceptance criteria 4 (show full hierarchy path like "Engineering > Backend Team"). Create async function buildDepartmentPath(departmentId: number, departmentService: DepartmentService): Promise<string>. Algorithm: (1) Fetch department by ID, (2) If parent_id exists, recursively fetch parent and prepend to path, (3) Build breadcrumb string with " > " separator, (4) Return full path from root to current department. Handle circular references by tracking visited IDs (safety check). Cache department data to avoid redundant API calls. Alternatively, add to DepartmentsUIService as getDepartmentPath(departmentId) method. Export as standalone utility or service method. | **Restrictions**: Must traverse full parent chain to root. Must handle circular references (prevent infinite loop). Must return empty string if department not found. Consider caching for performance. | **\_Leverage**: Use DepartmentService.getDepartmentById() for fetching department data | **Success Criteria**: Function builds correct hierarchy path (root to leaf), handles multi-level hierarchies (3+ levels), handles department with no parent (returns just dept_name), prevents circular reference infinite loops, caches department data to minimize API calls, returns user-friendly path string with " > " separator

- [ ] 18. Add unit tests for Phase 4 profile integration
  - Files:
    - `apps/admin/src/app/shared/components/profile-card/profile-card.component.spec.ts` (MODIFY or NEW)
    - Tests for hierarchy utils (if created as separate file)
  - Purpose: Test department display on profile and hierarchy breadcrumb builder
  - \_Leverage:
    - Test patterns from previous tasks
  - \_Requirements: REQ-3 (all acceptance criteria)
  - \_Prompt: **Role**: QA Engineer specializing in component testing and utility function testing | **Task**: Create unit tests for Phase 4 profile integration covering requirement REQ-3 acceptance criteria. For profile-card component: test department section renders when user has department, department fetch on profile load, hierarchy path displays correctly, inactive department shows warning indicator, no department shows "No department assigned" placeholder, fetch error shows "Department information unavailable". For buildDepartmentPath utility: test single-level department (no parent), multi-level hierarchy (2-3 levels), circular reference handling (does not infinite loop), department not found (returns empty), caching behavior (multiple calls use cache). Mock DepartmentService with hierarchical test data including circular reference test case. Use fakeAsync/tick for async operations. | **Restrictions**: Must mock DepartmentService. Must test all edge cases (no department, inactive department, fetch error, circular reference). Tests must be isolated. | **\_Leverage**: Follow test patterns from previous tasks. Mock DepartmentService with test data | **Success Criteria**: All profile card tests pass, department section rendering tests verify correct display, hierarchy path tests verify correct breadcrumb, warning indicator tests verify inactive department handling, placeholder tests verify no department case, error handling tests verify graceful degradation, utility function tests cover all edge cases, test coverage >80% for Phase 4 components

## Final Tasks

- [ ] 19. End-to-end testing and integration verification
  - Files:
    - Create E2E test files in `apps/admin-e2e/src/` or equivalent E2E test directory
  - Purpose: Verify all features work together in realistic user workflows
  - \_Leverage:
    - Existing E2E test framework (Cypress, Playwright, or Protractor)
  - \_Requirements: All requirements (REQ-1, REQ-2, REQ-3, REQ-4)
  - \_Prompt: **Role**: QA Automation Engineer specializing in E2E testing with Cypress or Playwright | **Task**: Create comprehensive end-to-end tests covering all requirements (REQ-1 through REQ-4) with realistic user workflows. Test scenarios: (1) Admin creates root department, then child department, then nested child - verify hierarchy displays correctly in tree view. (2) Admin edits department name and parent - verify changes persist and hierarchy updates. (3) Admin tries to create circular reference - verify validation prevents it. (4) Admin tries to delete department with users - verify prevention and error message. (5) Admin creates user and assigns department - verify department appears in user list and user profile. (6) Admin filters user list by department - verify correct users shown. (7) User views own profile - verify department section shows with hierarchy breadcrumb. (8) Admin searches departments by dept_code - verify filtered results. (9) Admin toggles department inactive - verify warning appears in profile, inactive indicator in list. Use E2E testing best practices: wait for elements, use data-testid attributes, verify API calls, check for success messages. Test on both desktop and tablet viewports (responsive testing). | **Restrictions**: Must test complete user workflows, not just individual features. Must verify data persistence across page reloads. Must test error scenarios (validation, permissions). Must use proper waits (not arbitrary sleeps). | **\_Leverage**: Use existing E2E test framework and patterns. Add data-testid attributes to components if needed | **Success Criteria**: All E2E test scenarios pass, tests verify complete workflows (create > edit > delete), tests verify hierarchy and relationships, tests verify user integration (assignment, display), tests verify error handling and validation, tests verify responsive design (desktop, tablet), tests run reliably in CI/CD pipeline, critical user journeys are covered

- [ ] 20. Documentation and cleanup
  - Files:
    - Create or update `docs/features/departments/README.md` (NEW)
    - Update `docs/features/README.md` to include department management (MODIFY)
    - Add JSDoc comments to all public methods in components and services
  - Purpose: Document the feature for developers and admins, cleanup code
  - \_Leverage:
    - Existing documentation templates and conventions
  - \_Requirements: All requirements (complete feature documentation)
  - \_Prompt: **Role**: Technical Writer and Senior Developer with expertise in documentation and code quality | **Task**: Create comprehensive documentation for the department management UI feature and perform final code cleanup. Create feature documentation at docs/features/departments/README.md including: overview, user guide (how to use as admin), developer guide (component architecture, service usage, extending the feature), API integration details, troubleshooting common issues. Add department management to features index. Add JSDoc comments to all public methods, interfaces, and components: describe purpose, parameters, return values, usage examples. Review all code for: unused imports, console.logs (remove), TODO comments (address or file tickets), code formatting (run prettier), linting errors (run eslint --fix), accessibility (ARIA labels on all interactive elements). Create admin user guide section: how to create departments, manage hierarchy, assign users, view reports. Update CHANGELOG.md with new feature. | **Restrictions**: Documentation must be clear and actionable. JSDoc must follow TSDoc conventions. Must remove all debug console.logs. Must fix all linting errors. Must ensure WCAG 2.1 AA compliance (ARIA labels, keyboard navigation). | **\_Leverage**: Follow existing documentation patterns from docs/features/. Use TSDoc format for JSDoc comments | **Success Criteria**: Feature documentation is complete and comprehensive, developer guide explains architecture and patterns, user guide helps admins use the feature, all public methods have JSDoc comments, no unused imports remain, no console.logs in production code, all linting errors fixed, code is formatted consistently, ARIA labels on all interactive elements, CHANGELOG.md updated, keyboard navigation works throughout

---

## Implementation Workflow Instructions

**For each task:**

1. **Before starting:**
   - Mark task as in-progress: `[*] Task N`
   - Read task description, requirements, and \_Leverage sections
   - Review referenced requirement acceptance criteria
   - Examine code files mentioned in \_Leverage

2. **During implementation:**
   - Follow the role and task description exactly
   - Adhere to all restrictions
   - Use all referenced existing code (\_Leverage)
   - Reference specific requirement IDs in comments

3. **After completion:**
   - Verify all success criteria are met
   - Run relevant tests (unit tests for components, E2E for workflows)
   - Ensure build passes: `pnpm run build`
   - Log implementation using spec workflow (if applicable)
   - Mark task as complete: `[x] Task N`

4. **Testing requirements:**
   - All unit tests must pass before marking test tasks complete
   - E2E tests must pass before marking task 19 complete
   - Build must pass before marking task 20 complete

**Dependencies:**

- Task 2 depends on Task 1 (types)
- Task 3 depends on Task 2 (UI service)
- Task 4 depends on Task 1 (types)
- Task 5 depends on Task 3 and 4 (components)
- Task 6 depends on Task 5 (component updates)
- Task 7 can run after Tasks 2, 4, 6 complete
- Task 9 depends on Task 8 (hierarchy component)
- Task 10 depends on Task 4 (form dialog)
- Task 11 can run after Tasks 8, 10 complete
- Task 13 depends on Task 12 (selector component)
- Task 14 depends on Task 13 (user form updates)
- Task 15 can run after Tasks 12, 14 complete
- Task 17 can run independently or with Task 16
- Task 18 depends on Tasks 16, 17
- Task 19 depends on all previous tasks (integration testing)
- Task 20 depends on all previous tasks (final documentation)
