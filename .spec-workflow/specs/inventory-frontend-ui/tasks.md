# Tasks Document - Inventory Frontend UI

## Overview

This document breaks down the implementation of the Inventory Frontend UI into atomic, testable tasks. Each task represents a discrete unit of work that can be implemented, tested, and verified independently.

**Total Estimated Effort**: 3-4 weeks (120-160 hours)

---

## Phase 1: Project Setup & Configuration (Week 1, Days 1-2)

### 1.1. Create feature module structure and routing configuration

- [ ] 1.1. Create feature module structure and routing configuration
  - Files:
    - `apps/admin/src/app/pages/inventory/inventory.routes.ts`
    - `apps/admin/src/app/pages/inventory/inventory.module.ts` (if needed)
  - Purpose: Setup lazy-loaded feature module with route configuration
  - _Leverage: Existing route patterns from other feature modules_
  - _Requirements: All page routes from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with Angular routing expertise | Task: Create inventory.routes.ts with lazy-loaded routes for 5 pages: stock (main), low-stock, expiring, transactions, valuation. Configure route guards (authGuard, permissionGuard) with appropriate permission data. Add breadcrumb metadata. Export INVENTORY_ROUTES constant. | Restrictions: Use standalone component pattern (Angular 17+), implement lazy loading with loadComponent(), add canActivate guards, include permission data: { resource: 'inventory', action: 'read' }, set proper breadcrumb labels | \_Leverage: apps/admin/src/app/app.routes.ts for routing patterns, existing guard implementations | \_Requirements: REQ-1 to REQ-12 from requirements.md | Success: Routes configured with lazy loading, guards applied, breadcrumbs set, tested navigation works, compiles without errors_

### 1.2. Setup shared models and interfaces

- [ ] 1.2. Setup shared models and interfaces
  - Files:
    - `apps/admin/src/app/pages/inventory/models/inventory.models.ts`
    - `apps/admin/src/app/pages/inventory/models/index.ts`
  - Purpose: Define TypeScript interfaces for all data structures
  - _Leverage: Backend API schemas from inventory-backend-api spec_
  - _Requirements: All data models from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with TypeScript expertise | Task: Create inventory.models.ts with 15+ TypeScript interfaces: StockItem, DrugLot, Adjustment, Transaction, QuickStats, WebSocket event types, API response types. Define enums: StockStatus, TransactionType, ExpiryStatus. Add JSDoc comments for each interface. Create barrel export in index.ts. | Restrictions: Match backend API response structures exactly, use proper types (number for IDs, string for dates in ISO format, enums for status fields), make all fields readonly where appropriate, add utility types (Partial, Omit) where needed | \_Leverage: Backend schema definitions from inventory-backend-api/design.md, TypeScript utility types | \_Requirements: All data models from design.md section "Data Models" | Success: All interfaces defined, enums created, types match backend responses, no TypeScript errors, exported via barrel file_

### 1.3. Configure environment settings for API and WebSocket URLs

- [ ] 1.3. Configure environment settings for API and WebSocket URLs
  - Files:
    - `apps/admin/src/environments/environment.ts`
    - `apps/admin/src/environments/environment.prod.ts`
  - Purpose: Add inventory-specific environment configuration
  - _Leverage: Existing environment configuration patterns_
  - _Requirements: API integration from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps/Frontend Developer | Task: Add inventory configuration to environment files: inventoryApiUrl (defaults to '/api/inventory/operations'), wsUrl (development: 'ws://localhost:3000', production: from ENV variable), enable/disable real-time updates flag. Ensure environment.prod.ts uses production URLs. | Restrictions: Use existing environment structure, don't hardcode production URLs (use process.env or placeholder), follow existing patterns for API base URLs, add feature flags if needed | \_Leverage: Existing apps/admin/src/environments files, environment variable patterns | \_Requirements: Backend API endpoint structure, WebSocket connection requirements | Success: Environment files updated, URLs configurable per environment, no hardcoded values in production build, tested in both dev and prod mode_

---

## Phase 2: Core Services (Week 1, Days 3-5)

### 2.1. Implement InventoryApiService with all HTTP endpoints

- [ ] 2.1. Implement InventoryApiService with all HTTP endpoints
  - Files:
    - `apps/admin/src/app/pages/inventory/services/inventory-api.service.ts`
    - `apps/admin/src/app/pages/inventory/services/inventory-api.service.spec.ts`
  - Purpose: HTTP communication layer for all inventory API endpoints
  - _Leverage: HttpClient, existing API service patterns_
  - _Requirements: REQ-1 to REQ-12 API integration_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with Angular HttpClient expertise | Task: Create InventoryApiService as injectable service with methods for all 11 endpoints: getStockLevels(), getStockByDrugLocation(), getDrugLots(), getExpiringLots(), createAdjustment(), getAdjustmentHistory(), getTransactionHistory(), getStockValuation(), getLowStockItems(), updateMinMaxLevels(), createTransfer(). Use HttpClient, map responses to typed interfaces, handle query parameters properly. | Restrictions: Mark as @Injectable(), use constructor injection for HttpClient, return Observable<T> for all methods, use proper HTTP methods (GET/POST/PUT), extract data from ApiResponse wrapper with map operator, handle query params with HttpParams, add error handling with catchError | \_Leverage: HttpClient from @angular/common/http, RxJS operators (map, catchError), existing service patterns in shared/services | \_Requirements: All API endpoints from design.md "InventoryApiService" section | Success: All 11 methods implemented, responses typed correctly, query params handled, compiles without errors, unit tests pass (mock HttpClient)_

### 2.2. Implement InventoryWebSocketService with reconnection logic

- [ ] 2.2. Implement InventoryWebSocketService with reconnection logic
  - Files:
    - `apps/admin/src/app/pages/inventory/services/inventory-websocket.service.ts`
    - `apps/admin/src/app/pages/inventory/services/inventory-websocket.service.spec.ts`
  - Purpose: WebSocket connection management for real-time updates
  - _Leverage: WebSocket API, RxJS Subjects_
  - _Requirements: REQ-9 Real-time updates_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with WebSocket expertise | Task: Create InventoryWebSocketService with WebSocket connection management, auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s max 5 attempts), event streams as RxJS Subjects (onAdjustmentCreated$, onReceiptPosted$, onTransferCompleted$), connection status BehaviorSubject. Implement connect(), disconnect(), send(), handleMessage() methods. Subscribe to 'inventory' channel on connect. | Restrictions: Use native WebSocket API, implement exponential backoff for reconnection, max 5 reconnect attempts, emit connection status changes, handle onopen/onmessage/onerror/onclose events, send token in connection URL (?token=), parse JSON messages, implement ngOnDestroy to clean up | \_Leverage: WebSocket API, RxJS Subject/BehaviorSubject, AuthService for token, exponential backoff algorithm | \_Requirements: REQ-9 WebSocket integration from requirements.md, connection management from design.md | Success: WebSocket connects successfully, reconnects on disconnect, events emitted to correct Subject streams, connection status tracked, no memory leaks, tested with mock WebSocket_

### 2.3. Implement InventoryStateService with Signals-based state management

- [ ] 2.3. Implement InventoryStateService with Signals-based state management
  - Files:
    - `apps/admin/src/app/pages/inventory/services/inventory-state.service.ts`
    - `apps/admin/src/app/pages/inventory/services/inventory-state.service.spec.ts`
  - Purpose: Centralized state management using Angular Signals
  - _Leverage: Angular Signals, RxJS for async operations_
  - _Requirements: State management from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with Angular Signals expertise | Task: Create InventoryStateService with private WritableSignals (stockItemsSignal, selectedLocationSignal, loadingSignal), public readonly signals (stockItems, selectedLocation, isLoading), computed signals (lowStockItems, expiringItems), RxJS Subject for stockUpdates$. Implement fetchStockLevels(), updateStockItem(), setSelectedLocation(), exportStockReport() methods. Subscribe to WebSocket events in initWebSocketSubscriptions(). | Restrictions: Use signal() for writable state, asReadonly() for public exposure, computed() for derived state, update() method for immutable updates, inject InventoryApiService and InventoryWebSocketService, handle WebSocket events to update signals, implement CSV export logic | \_Leverage: Angular Signals API (signal, computed, update), RxJS (tap, catchError), InventoryApiService, InventoryWebSocketService | \_Requirements: All state management requirements from design.md "InventoryStateService" section | Success: State managed with Signals, computed signals work correctly, WebSocket updates trigger signal changes, export functionality works, unit tests verify state updates, no memory leaks_

---

## Phase 3: Presentation Components (Week 2, Days 1-2)

### 3.1. Create QuickStatsComponent for summary cards

- [ ] 3.1. Create QuickStatsComponent for summary cards
  - Files:
    - `apps/admin/src/app/pages/inventory/components/quick-stats/quick-stats.component.ts`
    - `apps/admin/src/app/pages/inventory/components/quick-stats/quick-stats.component.spec.ts`
  - Purpose: Display 4 KPI cards with click handling
  - _Leverage: AegisX AxKpiCard component_
  - _Requirements: REQ-2 Quick Stats Cards_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with Angular component expertise | Task: Create standalone QuickStatsComponent with @Input() stats signal (QuickStats type), @Output() statClick EventEmitter. Template uses 4 ax-kpi-card components for Total Items, Low Stock, Expired, Near Expiry with appropriate icons (inventory_2, warning, error, schedule) and colors (primary, warning, danger, info). Emit statClick event with stat type ('total', 'low', 'expired', 'expiring') on card click. | Restrictions: Use standalone component, import CommonModule and AxKpiCard, make stats input required, use Signal<QuickStats> type, emit specific stat types as string literals, apply responsive grid (grid-cols-1 md:grid-cols-4), handle click events on cards | \_Leverage: AegisX AxKpiCard component, TailwindCSS grid utilities, Angular EventEmitter | \_Requirements: REQ-2 from requirements.md | Success: Component displays 4 cards, stats update reactively, click events emit correctly, responsive on mobile/tablet, unit tests pass, compiled without errors_

### 3.2. Create StockListComponent for table display

- [ ] 3.2. Create StockListComponent for table display
  - Files:
    - `apps/admin/src/app/pages/inventory/components/stock-list/stock-list.component.ts`
    - `apps/admin/src/app/pages/inventory/components/stock-list/stock-list.component.html`
    - `apps/admin/src/app/pages/inventory/components/stock-list/stock-list.component.spec.ts`
  - Purpose: Display stock items in Material table with sorting and pagination
  - _Leverage: Angular Material Table, MatSort, MatPaginator_
  - _Requirements: REQ-1 Stock View Dashboard_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with Angular Material expertise | Task: Create standalone StockListComponent with @Input() stockItems signal, @Output() viewLots and @Output() adjustStock EventEmitters. Implement Material table with 7 columns (drug_name, location_name, quantity_on_hand, min_level, stock_status, oldest_expiry, actions). Add MatSort for sorting, MatPaginator with page sizes [20, 50, 100]. Use computed signal for dataSource. Implement getStatusColor() and getStatusIcon() helper methods for badge styling. Add action buttons (View Lots, Adjust) that emit events. | Restrictions: Use standalone component, import MatTableModule/MatSortModule/MatPaginatorModule/AxBadge/AxButton, create computed() for dataSource from input signal, display drug name with generic name subtitle, format numbers with number pipe, format dates with date pipe, color-code status badges, make table responsive, add [data-testid] for testing | \_Leverage: Angular Material Table/Sort/Paginator, AegisX AxBadge/AxButton, computed() API, Angular pipes | \_Requirements: REQ-1 table requirements from requirements.md | Success: Table displays all columns, sorting works, pagination functional, status colors correct, action buttons emit events, responsive layout, unit tests pass_

### 3.3. Create TransactionTableComponent for reusable transaction display

- [ ] 3.3. Create TransactionTableComponent for reusable transaction display
  - Files:
    - `apps/admin/src/app/pages/inventory/components/transaction-table/transaction-table.component.ts`
    - `apps/admin/src/app/pages/inventory/components/transaction-table/transaction-table.component.html`
    - `apps/admin/src/app/pages/inventory/components/transaction-table/transaction-table.component.spec.ts`
  - Purpose: Reusable component for displaying transaction history
  - _Leverage: Angular Material Table_
  - _Requirements: REQ-7 Transaction History_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone TransactionTableComponent with @Input() transactions signal, Material table with columns: created_at, transaction_type, drug_name, location_name, quantity, unit_cost, reference_id, created_by. Implement getTransactionTypeColor() to return badge colors (RECEIVE=success, ISSUE=danger, TRANSFER=info, ADJUST=warning, RETURN=secondary). Format quantity with +/- sign based on transaction type. Add MatPaginator. | Restrictions: Use standalone component, import required Material modules, use computed signal for dataSource, format dates with date:'medium' pipe, color-code transaction type badges, show + for RECEIVE/RETURN and - for ISSUE/ADJUST, make reference_id clickable if present, add pagination | \_Leverage: Angular Material Table, AxBadge, date pipes, number pipes | \_Requirements: REQ-7 from requirements.md | Success: Transactions display correctly, type badges colored properly, quantity signs correct, pagination works, clickable reference IDs, unit tests pass_

---

## Phase 4: Container Components (Week 2, Days 3-5)

### 4.1. Create StockViewPage container component

- [ ] 4.1. Create StockViewPage container component
  - Files:
    - `apps/admin/src/app/pages/inventory/stock-view/stock-view.page.ts`
    - `apps/admin/src/app/pages/inventory/stock-view/stock-view.page.html`
    - `apps/admin/src/app/pages/inventory/stock-view/stock-view.page.spec.ts`
  - Purpose: Main container for stock monitoring with state management
  - _Leverage: InventoryStateService, child presentation components_
  - _Requirements: REQ-1, REQ-2 Stock View and Quick Stats_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with state management expertise | Task: Create standalone StockViewPage with signals (stockItems, quickStats computed, selectedLocation, searchTerm, isLoading), filteredStockItems computed signal that filters by location and search term. Inject InventoryStateService, MatDialog. Implement ngOnInit() to call loadStockData() and subscribeToRealtimeUpdates(), onLocationChange(), onSearchChange(), onViewLots() opens LotManagementDialog, onAdjustStock() opens StockAdjustmentDialog, onExportReport() calls state service. Use QuickStatsComponent, StockListComponent in template with filters section (location dropdown, search input). | Restrictions: Use standalone component, implement OnInit/OnDestroy, inject services via constructor, use signal() for state, computed() for derived data, use takeUntilDestroyed() for subscriptions, handle dialog afterClosed() to refresh data, implement calculateStats() helper, handle WebSocket updates with handleStockUpdate(), add loading skeleton while loading | \_Leverage: InventoryStateService, QuickStatsComponent, StockListComponent, LotManagementDialog, StockAdjustmentDialog, MatDialog, AxSelect, AxInput, AxButton, AxSkeleton | \_Requirements: REQ-1, REQ-2, REQ-9 from requirements.md | Success: Page displays stock list with filters, stats update reactively, location filter works, search filters correctly, dialogs open/close properly, real-time updates work, unit tests pass_

### 4.2. Create LowStockPage container component

- [ ] 4.2. Create LowStockPage container component
  - Files:
    - `apps/admin/src/app/pages/inventory/low-stock/low-stock.page.ts`
    - `apps/admin/src/app/pages/inventory/low-stock/low-stock.page.html`
    - `apps/admin/src/app/pages/inventory/low-stock/low-stock.page.spec.ts`
  - Purpose: Display items below reorder point with suggested orders
  - _Leverage: InventoryApiService, Material Table_
  - _Requirements: REQ-5 Low Stock Alert List_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone LowStockPage with signals (lowStockItems, urgencyFilter 'ALL'|'CRITICAL'|'LOW', isLoading). Inject InventoryApiService. Load data with getLowStockItems() API call. Display Material table with columns: drug_name, current_stock, min_level, reorder_point, max_level, days_of_supply, avg_daily_usage, suggested_order_quantity, last_received_date. Implement urgency filter dropdown. Color-code rows (CRITICAL=red, LOW=yellow). Add "Create Purchase Request" button (future integration). | Restrictions: Use standalone component, fetch data from API on init, filter by urgency locally with computed signal, highlight critical items with red background class, show suggested order quantity calculation (max - current), format dates, add action button placeholder | \_Leverage: InventoryApiService, Angular Material Table, AxSelect for filter, computed() for filtering | \_Requirements: REQ-5 from requirements.md | Success: Low stock items display, urgency filter works, calculations correct, color coding applied, button visible, unit tests pass_

### 4.3. Create ExpiringDrugsPage container component

- [ ] 4.3. Create ExpiringDrugsPage container component
  - Files:
    - `apps/admin/src/app/pages/inventory/expiring-drugs/expiring-drugs.page.ts`
    - `apps/admin/src/app/pages/inventory/expiring-drugs/expiring-drugs.page.html`
    - `apps/admin/src/app/pages/inventory/expiring-drugs/expiring-drugs.page.spec.ts`
  - Purpose: Display drugs with lots expiring soon
  - _Leverage: InventoryApiService_
  - _Requirements: REQ-6 Expiring Drugs Alert List_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone ExpiringDrugsPage with signals (expiringLots, daysThreshold default 180, locationFilter, isLoading, summary). Inject InventoryApiService. Call getExpiringLots() on init with threshold. Display Material table with columns: drug_name, lot_number, quantity_available, expiry_date, days_until_expiry, unit_cost, total_value. Sort by expiry_date ASC. Show summary footer with total_lots, total_value, critical_lots_count, warning_lots_count. Color-code by urgency (<30=CRITICAL red, 30-90=WARNING yellow, 90-180=INFO blue). Add threshold filter input (default 180 days). | Restrictions: Use standalone component, fetch with daysThreshold parameter, sort by expiry date ascending, calculate total_value = quantity × unit_cost, display summary in footer row or cards, color-code rows by days_until_expiry, make threshold adjustable | \_Leverage: InventoryApiService.getExpiringLots(), Material Table, summary calculations, date-fns for date calculations | \_Requirements: REQ-6 from requirements.md | Success: Expiring lots display sorted by expiry date, urgency colors correct, summary calculated accurately, threshold filter functional, unit tests pass_

### 4.4. Create TransactionHistoryPage container component

- [ ] 4.4. Create TransactionHistoryPage container component
  - Files:
    - `apps/admin/src/app/pages/inventory/transaction-history/transaction-history.page.ts`
    - `apps/admin/src/app/pages/inventory/transaction-history/transaction-history.page.html`
    - `apps/admin/src/app/pages/inventory/transaction-history/transaction-history.page.spec.ts`
  - Purpose: Display complete transaction audit trail with filters
  - _Leverage: InventoryApiService, TransactionTableComponent_
  - _Requirements: REQ-7 Transaction History View_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone TransactionHistoryPage with filter form (ReactiveFormsModule): drugId (searchable dropdown), locationId (dropdown), transactionType (dropdown with All/RECEIVE/ISSUE/TRANSFER/ADJUST/RETURN), fromDate (date picker), toDate (date picker), search bar. Inject InventoryApiService. Call getTransactionHistory() with filter params. Use TransactionTableComponent to display results. Add "Export" button to download CSV. Implement onFilterChange() to reload data. | Restrictions: Use standalone component, use ReactiveFormsModule for filter form, fetch transactions with query params, debounce filter changes (300ms), use TransactionTableComponent for display, implement CSV export (convert to CSV and trigger download), handle pagination from API response | \_Leverage: InventoryApiService.getTransactionHistory(), TransactionTableComponent, ReactiveFormsModule, Angular Material DatePicker, AxSelect, debounceTime operator | \_Requirements: REQ-7 from requirements.md | Success: Filters work correctly, transactions display, date range filtering accurate, export downloads CSV, pagination functional, unit tests pass_

### 4.5. Create StockValuationPage container component

- [ ] 4.5. Create StockValuationPage container component
  - Files:
    - `apps/admin/src/app/pages/inventory/stock-valuation/stock-valuation.page.ts`
    - `apps/admin/src/app/pages/inventory/stock-valuation/stock-valuation.page.html`
    - `apps/admin/src/app/pages/inventory/stock-valuation/stock-valuation.page.spec.ts`
  - Purpose: Display inventory valuation report grouped by location
  - _Leverage: InventoryApiService_
  - _Requirements: REQ-8 Stock Valuation Report_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone StockValuationPage with controls: locationId filter (All Locations or specific), asOfDate picker (optional). Inject InventoryApiService. Call getStockValuation() API. Display summary cards (Total Value, Drug Count, Total Quantity). When "All Locations" selected, display grouped table with location sections, subtotals per location, grand total footer. When specific location selected, display detailed drug-level table. Add "Export" button for Excel download. | Restrictions: Use standalone component, fetch valuation data from API, display summary as KPI cards, implement conditional display (grouped vs detailed), calculate subtotals and grand totals from API response, implement Excel export (use library like xlsx or server-side export), format currency values | \_Leverage: InventoryApiService.getStockValuation(), AxKpiCard for summary, Material Table for data, AxDatePicker, currency pipe | \_Requirements: REQ-8 from requirements.md | Success: Valuation displays correctly, location grouping works, summary accurate, export downloads Excel, asOfDate filter functional (if implemented), unit tests pass_

---

## Phase 5: Dialog Components (Week 3, Days 1-2)

### 5.1. Create LotManagementDialog component

- [ ] 5.1. Create LotManagementDialog component
  - Files:
    - `apps/admin/src/app/pages/inventory/dialogs/lot-management/lot-management.dialog.ts`
    - `apps/admin/src/app/pages/inventory/dialogs/lot-management/lot-management.dialog.html`
    - `apps/admin/src/app/pages/inventory/dialogs/lot-management/lot-management.dialog.spec.ts`
  - Purpose: Display and manage drug lots with FIFO/FEFO ordering
  - _Leverage: MatDialog, InventoryApiService_
  - _Requirements: REQ-3 Lot Management Dialog_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with dialog expertise | Task: Create standalone LotManagementDialog with @Inject(MAT_DIALOG_DATA) data: { drugId, locationId }. Use signals (drugId, locationId, lots, orderBy 'FIFO'|'FEFO' default 'FEFO', isLoading). Inject InventoryApiService. Implement computed signal sortedLots that sorts by received_date (FIFO) or expiry_date (FEFO) based on orderBy. Implement nextToDispense computed as first in sorted list. Display Material table with columns: lot_number, quantity_available, unit_cost, expiry_date, days_until_expiry, fifo_order, fefo_order. Add radio buttons to toggle FIFO/FEFO. Show "Next to Dispense" recommendation. Implement getExpiryStatusColor() helper (<30=danger, 30-90=warning, 90-180=info, >180=success). | Restrictions: Use standalone component, import MatDialogModule, inject MAT_DIALOG_DATA, use computed() for sorting, re-sort when orderBy changes, display lot details, color-code expiry status, show recommendation badge, add close button | \_Leverage: InventoryApiService.getDrugLots(), MatDialog/MatDialogRef/MAT_DIALOG_DATA, computed() for sorting, Material Table, MatRadioModule | \_Requirements: REQ-3 from requirements.md | Success: Dialog opens with drug lots, FIFO/FEFO toggle works, sorting accurate, next to dispense shown, expiry colors correct, close button works, unit tests pass_

### 5.2. Create StockAdjustmentDialog component

- [ ] 5.2. Create StockAdjustmentDialog component
  - Files:
    - `apps/admin/src/app/pages/inventory/dialogs/stock-adjustment/stock-adjustment.dialog.ts`
    - `apps/admin/src/app/pages/inventory/dialogs/stock-adjustment/stock-adjustment.dialog.html`
    - `apps/admin/src/app/pages/inventory/dialogs/stock-adjustment/stock-adjustment.dialog.spec.ts`
  - Purpose: Handle stock adjustments with validation
  - _Leverage: Reactive Forms, InventoryApiService_
  - _Requirements: REQ-4 Stock Adjustment Dialog_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with forms expertise | Task: Create standalone StockAdjustmentDialog with @Inject(MAT_DIALOG_DATA) data: { stockItem }. Use ReactiveFormsModule to create adjustmentForm with fields: drug_id, location_id, adjustment_type (radio: ADD/SUBTRACT/SET), quantity (number, required, min 1), adjustment_reason_id (dropdown, required), lot_id (optional dropdown), notes (textarea). Implement computed signal adjustmentResult that calculates: ADD = current + qty, SUBTRACT = current - qty, SET = qty. Implement custom validator adjustmentValidator to check SUBTRACT doesn't exceed current stock. Show validation error if insufficient. Inject InventoryApiService, ToastService. Implement onSubmit() to call createAdjustment() API, show success toast, close dialog with result. Handle API errors. | Restrictions: Use standalone component, import ReactiveFormsModule/MatDialogModule, use FormBuilder to create form, add custom validator at form level, display result preview reactively, validate before submit, show error messages for validation failures, call API on submit, close on success with { success: true, result }, keep open on error, disable submit while submitting | \_Leverage: ReactiveFormsModule, FormBuilder, AbstractControl validators, InventoryApiService.createAdjustment(), ToastService, MatDialogRef, computed() for result preview | \_Requirements: REQ-4 from requirements.md | Success: Form validates correctly, insufficient stock prevented, result preview accurate, API call successful, success toast shown, dialog closes, error handling works, unit tests pass_

---

## Phase 6: Global Features (Week 3, Days 3-4)

### 6.1. Implement global error interceptor

- [ ] 6.1. Implement global error interceptor
  - Files:
    - `apps/admin/src/app/core/interceptors/error.interceptor.ts` (extend existing or create)
    - `apps/admin/src/app/core/interceptors/error.interceptor.spec.ts`
  - Purpose: Global HTTP error handling with user-friendly messages
  - _Leverage: HttpInterceptor, ToastService_
  - _Requirements: REQ-11 Error Handling_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with error handling expertise | Task: Create or extend ErrorInterceptor implementing HttpInterceptor. In intercept() method, use catchError to handle HttpErrorResponse. Map status codes to user-friendly messages: 400=validation error (show error.message), 401=unauthorized (redirect to login), 403=no permission, 404=not found, 422=validation failed, 500=server error, others=unexpected error. Inject ToastService and display error toast. Return throwError() to allow component-level handling. Register in app providers with provideHttpClient(withInterceptors([errorInterceptor])). | Restrictions: Implement HttpInterceptor interface, use catchError operator, distinguish client vs server errors, map all common status codes, show toast for all errors, preserve error for component handling, register as HTTP interceptor in providers | \_Leverage: HttpInterceptor, HttpErrorResponse, ToastService, catchError operator, throwError | \_Requirements: REQ-11 from requirements.md, error handling strategy from design.md | Success: Interceptor catches all HTTP errors, displays appropriate toast messages, errors still propagate to components, 401 redirects to login, tested with various error scenarios_

### 6.2. Implement loading indicator and empty state components

- [ ] 6.2. Implement loading indicator and empty state components
  - Files:
    - `apps/admin/src/app/pages/inventory/components/loading-indicator/loading-indicator.component.ts` (if not using AegisX)
    - `apps/admin/src/app/pages/inventory/components/empty-state/empty-state.component.ts` (if not using AegisX)
  - Purpose: Reusable loading and empty state components
  - _Leverage: AegisX AxSkeleton, AxEmptyState_
  - _Requirements: REQ-11 User Feedback_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: If AegisX AxSkeleton and AxEmptyState exist, use them directly in pages. If not, create LoadingIndicatorComponent (spinner with optional message) and EmptyStateComponent (icon, title, message, optional action button). Make both standalone, reusable across all pages. Add loading indicators to all pages during API calls (use isLoading signal with @if control flow). Add empty states to tables when no data (use @if with data.length === 0). | Restrictions: Use standalone components, check AegisX library first before creating custom, use @if control flow for conditional rendering, make components generic and reusable, add proper ARIA labels for accessibility, use consistent styling | \_Leverage: AegisX AxSkeleton/AxEmptyState if available, Material Progress Spinner, @if/@else control flow | \_Requirements: REQ-11 from requirements.md | Success: Loading indicators display during API calls, empty states show when no data, components reusable, accessible, styled consistently, tested in multiple pages_

### 6.3. Implement WebSocket connection status indicator

- [ ] 6.3. Implement WebSocket connection status indicator
  - Files:
    - `apps/admin/src/app/pages/inventory/components/ws-status/ws-status.component.ts`
    - `apps/admin/src/app/pages/inventory/components/ws-status/ws-status.component.spec.ts`
  - Purpose: Display WebSocket connection status to user
  - _Leverage: InventoryWebSocketService_
  - _Requirements: REQ-9 Real-time Updates_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Create standalone WsStatusComponent that subscribes to InventoryWebSocketService.onConnectionStatus$. Display banner based on status: 'connected' = hidden (no banner), 'disconnected' = warning banner "Live updates disconnected", 'reconnecting' = info banner "Reconnecting... (attempt X)". Position banner at top of page, use AxAlert or custom div with TailwindCSS, auto-hide 'connected' status, keep visible while disconnected/reconnecting. Add to StockViewPage and other real-time pages. | Restrictions: Use standalone component, subscribe to connection status observable, use @if to conditionally show banner, display reconnection attempt count, style as non-intrusive banner, use warning/info colors, dismiss button optional | _Leverage: InventoryWebSocketService.onConnectionStatus$, AxAlert, @if control flow, AsyncPipe or toSignal() | \_Requirements: REQ-9 connection status from requirements.md | Success: Banner displays on disconnect, shows reconnecting state, auto-hides on connect, attempt count visible, styled appropriately, tested by simulating disconnect_

---

## Phase 7: Responsive Design & Accessibility (Week 3, Day 5)

### 7.1. Implement responsive layouts for mobile/tablet

- [ ] 7.1. Implement responsive layouts for mobile/tablet
  - Files:
    - Update all component templates with responsive classes
    - Update component stylesheets with media queries if needed
  - Purpose: Ensure UI works on tablets and mobile devices
  - _Leverage: TailwindCSS responsive utilities_
  - _Requirements: REQ-10 Responsive Design_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with responsive design expertise | Task: Update all component templates to use TailwindCSS responsive classes. Apply responsive grid for QuickStatsComponent (grid-cols-1 md:grid-cols-2 lg:grid-cols-4). Hide less critical table columns on tablet (<1024px) using hidden md:table-cell. On mobile (<768px), switch table to card layout (use @if with breakpoint detection or CSS display:none). Ensure dropdowns, inputs, buttons are touch-friendly (min 44px height). Test on multiple screen sizes. | Restrictions: Use TailwindCSS breakpoints (sm, md, lg, xl), apply mobile-first approach, hide columns gracefully with hidden/block utilities, ensure minimum touch target 44px, test on actual devices or browser dev tools, maintain functionality on all sizes | \_Leverage: TailwindCSS responsive utilities (md:, lg:), Angular @if for conditional rendering, CSS media queries if needed | \_Requirements: REQ-10 acceptance criteria 1-3 from requirements.md | Success: Layout responsive on desktop/tablet/mobile, columns hide appropriately, touch targets adequate, tested on multiple viewports, no horizontal scroll on mobile_

### 7.2. Implement keyboard navigation and ARIA labels

- [ ] 7.2. Implement keyboard navigation and ARIA labels
  - Files:
    - Update all component templates with ARIA attributes
    - Test keyboard navigation flow
  - Purpose: Ensure accessibility for keyboard and screen reader users
  - _Leverage: Angular Material built-in accessibility, ARIA attributes_
  - _Requirements: REQ-10 Accessibility_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Accessibility Specialist | Task: Add ARIA labels to all interactive elements: buttons (aria-label), inputs (aria-describedby for errors), tables (role="table", aria-label), dialogs (aria-labelledby, aria-describedby), status indicators (role="status", aria-live). Ensure tab order logical (use tabindex if needed). Test keyboard navigation: Tab for focus, Enter to activate, Arrow keys in dropdowns/tables, Escape to close dialogs. Add visible focus indicators with CSS (focus:ring-2). Verify with screen reader (VoiceOver/NVDA). | Restrictions: Add ARIA labels to all non-obvious elements, ensure logical tab order, test with keyboard only (no mouse), verify focus visible, announce dynamic changes with aria-live, follow WAI-ARIA authoring practices, test with actual screen reader | \_Leverage: Angular Material built-in accessibility, ARIA attributes, CSS focus styles, screen reader testing tools | \_Requirements: REQ-10 acceptance criteria 4-5 from requirements.md | Success: All interactive elements have labels, tab order logical, keyboard navigation works, focus visible, screen reader announces correctly, passes accessibility audit (Lighthouse/axe)_

---

## Phase 8: Testing (Week 4, Days 1-3)

### 8.1. Create unit tests for services

- [ ] 8.1. Create unit tests for services
  - Files:
    - `apps/admin/src/app/pages/inventory/services/inventory-api.service.spec.ts`
    - `apps/admin/src/app/pages/inventory/services/inventory-websocket.service.spec.ts`
    - `apps/admin/src/app/pages/inventory/services/inventory-state.service.spec.ts`
  - Purpose: Unit tests for all service classes
  - _Leverage: Jasmine, HttpTestingController, Signals testing_
  - _Requirements: Testing strategy from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with Angular testing expertise | Task: Write unit tests for InventoryApiService (test all 11 methods with HttpTestingController, verify requests, mock responses), InventoryWebSocketService (test connection, reconnection logic, event emission with mock WebSocket), InventoryStateService (test signal updates, computed signals, WebSocket event handling, export functionality). Achieve 80%+ code coverage. Mock dependencies, test success and error paths. | Restrictions: Use Jasmine test framework, HttpClientTestingModule for API service, mock WebSocket for WS service, test signal updates with TestBed.flushEffects(), verify method calls with spies, test error scenarios, aim for 80%+ coverage | \_Leverage: Jasmine, HttpTestingController, jasmine.createSpyObj, TestBed, mock data fixtures | \_Requirements: Testing strategy from design.md "Service Testing" section | Success: All service methods tested, mocks work correctly, error paths covered, signal updates verified, 80%+ coverage achieved, tests pass_

### 8.2. Create unit tests for components

- [ ] 8.2. Create unit tests for components
  - Files:
    - All component .spec.ts files (QuickStats, StockList, TransactionTable, all pages, dialogs)
  - Purpose: Unit tests for all component logic
  - _Leverage: Jasmine, ComponentFixture, mocked services_
  - _Requirements: Testing strategy from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Write unit tests for all components: QuickStatsComponent (test stats display, click events), StockListComponent (test table rendering, sorting, pagination, action button events), all page components (test data loading, filtering, signal updates, dialog opening), dialogs (test form validation, submission, API calls). Mock service dependencies with jasmine.createSpyObj. Test component inputs/outputs, signal changes, computed values, event emissions. Achieve 80%+ coverage. | Restrictions: Use ComponentFixture for component testing, mock all service dependencies, test inputs with componentRef.setInput(), test outputs with spies, verify template rendering with debugElement.query, test signal changes with fixture.detectChanges(), test computed signals reactivity, aim for 80%+ coverage | \_Leverage: ComponentFixture, DebugElement, By.css selector, jasmine spies, mock data | \_Requirements: Testing strategy from design.md "Component Testing" section | Success: All components tested, inputs/outputs verified, signals reactivity tested, template rendering checked, mocks effective, 80%+ coverage, tests pass_

### 8.3. Create E2E tests for critical user flows

- [ ] 8.3. Create E2E tests for critical user flows
  - Files:
    - `apps/admin-e2e/src/inventory/stock-view.spec.ts`
    - `apps/admin-e2e/src/inventory/stock-adjustment.spec.ts`
    - `apps/admin-e2e/src/inventory/lot-management.spec.ts`
  - Purpose: End-to-end tests for complete user workflows
  - _Leverage: Playwright or Cypress_
  - _Requirements: Testing strategy from design.md_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Automation Engineer | Task: Write E2E tests using Playwright: 1) Stock View flow - navigate to page, verify table loads, filter by location, search drugs, verify results. 2) Stock Adjustment flow - click adjust button, fill form (select type, enter quantity, select reason), submit, verify success toast, verify table updates. 3) Lot Management flow - click view lots, verify dialog opens, toggle FIFO/FEFO, verify sort order changes, close dialog. 4) Low Stock flow - navigate to low stock page, verify items display, verify color coding. Use data-testid attributes for selectors. | Restrictions: Use Playwright test framework, navigate via page.goto(), use data-testid selectors (avoid CSS classes), verify UI elements with expect(), wait for network requests with page.waitForResponse(), test against local dev server or staging, clean up test data after tests | \_Leverage: Playwright (or Cypress), data-testid attributes, page object pattern | \_Requirements: Testing strategy from design.md "E2E Testing" section | Success: All critical flows tested E2E, tests stable and reliable, use proper waits, tests pass consistently, cover happy path and error scenarios_

---

## Phase 9: Performance Optimization (Week 4, Days 4-5)

### 9.1. Implement virtual scrolling for large tables

- [ ] 9.1. Implement virtual scrolling for large tables
  - Files:
    - Update StockListComponent, TransactionTableComponent to use CDK Virtual Scroll
  - Purpose: Optimize rendering for large datasets
  - _Leverage: Angular CDK Scrolling_
  - _Requirements: REQ-12 Performance Optimization_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Performance Engineer | Task: Update StockListComponent and TransactionTableComponent to use cdk-virtual-scroll-viewport for tables with >100 rows. Wrap table with <cdk-virtual-scroll-viewport itemSize="50" class="viewport" [style.height.px]="600">. Use *cdkVirtualFor instead of *ngFor for table rows. Set appropriate itemSize based on row height. Test with 1000+ items to verify smooth scrolling. Keep MatPaginator as fallback option. | Restrictions: Import ScrollingModule from @angular/cdk/scrolling, set fixed viewport height, use itemSize matching actual row height (measure in dev tools), combine with pagination (show 100 items per page with virtual scroll), test performance with large datasets | \_Leverage: @angular/cdk/scrolling, cdk-virtual-scroll-viewport, cdkVirtualFor directive | \_Requirements: REQ-12 acceptance criteria 3 from requirements.md | Success: Virtual scrolling works smoothly with 1000+ items, no performance degradation, scroll position maintained, works with pagination, tested with large dataset_

### 9.2. Implement search debouncing and request caching

- [ ] 9.2. Implement search debouncing and request caching
  - Files:
    - Update StockViewPage, TransactionHistoryPage with debounced search
    - Implement caching in InventoryApiService
  - Purpose: Reduce unnecessary API calls
  - _Leverage: RxJS debounceTime, shareReplay_
  - _Requirements: REQ-12 Performance Optimization_
  - _Prompt: Implement the task for spec inventory-frontend-ui, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Performance Engineer | Task: Add debouncing to search inputs: create FormControl for search, subscribe to valueChanges with debounceTime(300), update searchTerm signal only after debounce. Implement caching in InventoryApiService: use shareReplay(1) operator on API observables, store cached observables in Map with cache key, check cache before making new request, invalidate cache after 5 minutes or on data mutations (create/update/delete). Add cache busting parameter for manual refresh. | Restrictions: Use debounceTime(300) for search inputs, implement cache with Map<string, Observable>, use shareReplay({ bufferSize: 1, refCount: true }), cache for 5 minutes (store timestamp), clear cache on mutations, provide refresh() method to bust cache | \_Leverage: RxJS debounceTime, shareReplay, Map for cache, distinctUntilChanged | \_Requirements: REQ-12 acceptance criteria 2, 4 from requirements.md | Success: Search debounced (waits 300ms after last keystroke), API calls reduced, cache works correctly, cache invalidates appropriately, tested with rapid typing_

---

## Completion Checklist

Before considering spec complete, verify:

- [ ] 1. **Routing**: All 5 routes configured, lazy loading works, guards applied, navigation functional
- [ ] 2. **Services**: InventoryApiService (11 methods), InventoryWebSocketService (connection + events), InventoryStateService (Signals state) all implemented and tested
- [ ] 3. **Components**: 10 components created (5 pages, 2 dialogs, 3 presentation components), all functional
- [ ] 4. **Data Models**: All TypeScript interfaces defined, enums created, types match backend
- [ ] 5. **State Management**: Signals working reactively, computed signals accurate, WebSocket updates trigger state changes
- [ ] 6. **Forms**: Stock adjustment form validates correctly, prevents invalid operations, submits successfully
- [ ] 7. **Real-time Updates**: WebSocket connects, receives events, updates UI, reconnects on disconnect
- [ ] 8. **Error Handling**: Global interceptor catches errors, user-friendly messages displayed, component-level handling works
- [ ] 9. **Loading States**: Loading indicators display during API calls, empty states show when no data
- [ ] 10. **Responsive Design**: Works on desktop/tablet/mobile, columns hide appropriately, touch targets adequate
- [ ] 11. **Accessibility**: ARIA labels added, keyboard navigation works, screen reader compatible, WCAG 2.1 AA compliant
- [ ] 12. **Performance**: Virtual scrolling implemented, search debounced, requests cached, meets performance targets (<3s load)
- [ ] 13. **Testing**: Unit tests pass (80%+ coverage), E2E tests cover critical flows, all tests green
- [ ] 14. **Integration**: Frontend connects to backend API successfully, all 11 endpoints work, WebSocket events received

---

**Total Estimated Effort**: 3-4 weeks (120-160 hours)

**Implementation Order**: Follow phase sequence for optimal dependency management and incremental testing.
