# Requirements Document - Inventory Frontend UI

## Introduction

The Inventory Frontend UI provides a modern, user-friendly interface for hospital pharmacists and inventory managers to monitor and manage drug inventory in real-time. This Angular-based application integrates with the inventory-backend-api to deliver FIFO/FEFO lot tracking, stock level monitoring, and inventory adjustment capabilities.

**Purpose:** Enable efficient inventory management through intuitive UI workflows that support Ministry of Public Health compliance and reduce drug waste.

**Value to Users:**

- Real-time visibility of stock levels across all locations
- Proactive alerts for low stock and expiring drugs
- Simplified inventory adjustment workflows with full audit trail
- FIFO/FEFO lot management to minimize waste

## Alignment with Product Vision

This feature aligns with INVS Modern's core objectives:

1. **Enhance Inventory Accuracy**: Real-time display with color-coded alerts reduces stockouts and overstocking
2. **Minimize Drug Waste**: FIFO/FEFO lot tracking UI helps pharmacists dispense drugs before expiry (target: 30% reduction in expired drug waste)
3. **Support Data-Driven Decisions**: Visual dashboards and reports enable informed inventory decisions
4. **Ensure Compliance**: Complete audit trail for all inventory transactions meets Ministry requirements

## Requirements

### REQ-1: Stock View Dashboard

**User Story:** As a pharmacist, I want to view real-time stock levels for all drugs at my location, so that I can quickly identify items needing attention.

#### Acceptance Criteria

1. **WHEN** user opens Stock View page **THEN** system **SHALL** display:
   - List of all drugs with current stock levels
   - Quick stats summary (Total Items, Low Stock Count, Expired Count, Near Expiry Count)
   - Location selector dropdown
   - Search bar and filter controls

2. **WHEN** stock level is below minimum **THEN** system **SHALL** highlight row with ⚠️ warning (yellow) and "Low Stock" status

3. **WHEN** stock level is below reorder point **THEN** system **SHALL** highlight row with 🔴 critical (red) and "Reorder" status

4. **WHEN** drug has lots expiring within 90 days **THEN** system **SHALL** display ⏰ indicator with oldest expiry date

5. **WHEN** user selects location from dropdown **THEN** system **SHALL** filter stock display to show only that location's inventory

6. **WHEN** user types in search bar **THEN** system **SHALL** filter results by drug name (case-insensitive, partial match)

7. **WHEN** user clicks "View Lots" button **THEN** system **SHALL** open Lot Management dialog for selected drug

8. **WHEN** user clicks "Adjust Stock" button **THEN** system **SHALL** open Stock Adjustment dialog for selected drug

9. **WHEN** user clicks "Export Report" button **THEN** system **SHALL** download stock report as Excel/CSV file

### REQ-2: Quick Stats Cards

**User Story:** As a inventory manager, I want to see summary statistics at a glance, so that I can prioritize my work.

#### Acceptance Criteria

1. **WHEN** Stock View page loads **THEN** system **SHALL** display 4 stat cards:
   - 📦 Total Items (count of unique drugs)
   - ⚠️ Low Stock (count below reorder point)
   - 🔴 Expired (count of drugs with expired lots)
   - ⏰ Near Expiry (count of lots expiring within 180 days)

2. **WHEN** user clicks on stat card **THEN** system **SHALL** filter table to show only relevant items

3. **WHEN** backend data updates **THEN** system **SHALL** refresh stat cards automatically (via WebSocket)

### REQ-3: Lot Management Dialog

**User Story:** As a pharmacist, I want to view all lots for a specific drug with FIFO/FEFO ordering, so that I can dispense the appropriate lot first.

#### Acceptance Criteria

1. **WHEN** user opens Lot Management dialog **THEN** system **SHALL** display:
   - Drug name and total stock quantity
   - Current location
   - Table of all active lots with columns: Lot Number, Quantity, Unit Cost, Expiry Date, Days Left, FIFO Order, FEFO Order

2. **WHEN** lots are displayed **THEN** system **SHALL** sort by FEFO order by default (expiring first)

3. **WHEN** user toggles to FIFO mode **THEN** system **SHALL** re-sort lots by received date (oldest first)

4. **WHEN** lot has <90 days until expiry **THEN** system **SHALL** highlight row with 🔴 critical status

5. **WHEN** lot has 90-180 days until expiry **THEN** system **SHALL** highlight row with ⚠️ warning status

6. **WHEN** lot has >180 days until expiry **THEN** system **SHALL** show ✓ green status

7. **WHEN** dialog displays **THEN** system **SHALL** show "Next to Dispense" recommendation (first lot in selected order)

8. **WHEN** user closes dialog **THEN** system **SHALL** return to Stock View page

### REQ-4: Stock Adjustment Dialog

**User Story:** As a pharmacist, I want to adjust inventory quantities for various reasons (damage, expiry, physical count), so that records match physical stock.

#### Acceptance Criteria

1. **WHEN** user opens Stock Adjustment dialog **THEN** system **SHALL** display form with fields:
   - Drug selector (dropdown, searchable)
   - Location selector (dropdown)
   - Current Stock (read-only, displayed after drug/location selected)
   - Adjustment Type (radio: Add/Subtract/Set to Specific Amount)
   - Quantity to Adjust (number input)
   - Result Preview (calculated: current ± adjustment)
   - Reason dropdown (required, populated from adjustment_reasons master data)
   - Lot Number dropdown (optional, filtered by drug/location)
   - Notes (textarea, optional)

2. **WHEN** user selects "Subtract" and enters quantity **THEN** system **SHALL** validate that result ≥ 0

3. **IF** result would be negative **THEN** system **SHALL** display error "Insufficient stock. Current: X, Requested: Y, Shortage: Z"

4. **WHEN** user selects lot number **THEN** system **SHALL** display lot details (expiry date, available quantity) below dropdown

5. **WHEN** user clicks "Post Adjustment" **THEN** system **SHALL**:
   - Validate all required fields
   - Call POST /api/inventory/operations/inventory-adjustments API
   - Display success message with new quantity
   - Emit WebSocket event to refresh Stock View
   - Close dialog and return to Stock View

6. **WHEN** adjustment fails (API error) **THEN** system **SHALL** display error message and keep dialog open

7. **WHEN** user clicks "Cancel" **THEN** system **SHALL** close dialog without saving

### REQ-5: Low Stock Alert List

**User Story:** As a inventory manager, I want to see all items below reorder point with suggested order quantities, so that I can plan purchases.

#### Acceptance Criteria

1. **WHEN** user clicks "Low Stock" stat card **THEN** system **SHALL** display filtered table with:
   - Drug name
   - Current stock quantity
   - Min level / Reorder point / Max level
   - Days of supply remaining
   - Average daily usage (from last 90 days)
   - Suggested order quantity (calculated: max_level - current_stock)
   - Last received date

2. **WHEN** urgency is CRITICAL (qty < min_level) **THEN** system **SHALL** highlight row with 🔴 red background

3. **WHEN** urgency is LOW (qty <= reorder_point && qty >= min_level) **THEN** system **SHALL** highlight row with ⚠️ yellow background

4. **WHEN** user clicks "Create Purchase Request" button **THEN** system **SHALL** navigate to Procurement module (future integration point)

### REQ-6: Expiring Drugs Alert List

**User Story:** As a pharmacist, I want to see all drugs with lots expiring soon, so that I can prioritize their dispensing or quarantine.

#### Acceptance Criteria

1. **WHEN** user clicks "Near Expiry" stat card **THEN** system **SHALL** display filtered table with:
   - Drug name
   - Lot number
   - Quantity available
   - Expiry date
   - Days until expiry
   - Unit cost
   - Total value (quantity × unit_cost)

2. **WHEN** days until expiry <30 **THEN** system **SHALL** highlight row with 🔴 CRITICAL status

3. **WHEN** days until expiry 30-90 **THEN** system **SHALL** highlight row with ⚠️ WARNING status

4. **WHEN** days until expiry 90-180 **THEN** system **SHALL** highlight row with ℹ️ INFO status

5. **WHEN** table displays **THEN** system **SHALL** sort by expiry date ascending (soonest first)

6. **WHEN** table displays **THEN** system **SHALL** show summary footer:
   - Total lots count
   - Total value of expiring drugs
   - Critical lots count (<90 days)
   - Warning lots count (90-180 days)

### REQ-7: Transaction History View

**User Story:** As an auditor, I want to view complete transaction history for any drug, so that I can verify inventory accuracy.

#### Acceptance Criteria

1. **WHEN** user opens Transaction History page **THEN** system **SHALL** display filter controls:
   - Drug selector (dropdown, searchable, optional)
   - Location selector (dropdown, optional)
   - Transaction Type selector (dropdown: All/RECEIVE/ISSUE/TRANSFER/ADJUST/RETURN)
   - Date range picker (from date, to date)
   - Search bar

2. **WHEN** user applies filters **THEN** system **SHALL** display transaction table with columns:
   - Date/Time
   - Transaction Type (badge with color: green=RECEIVE, red=ISSUE, blue=TRANSFER, yellow=ADJUST)
   - Drug name
   - Location
   - Quantity (+/-)
   - Unit cost
   - Reference ID (link to source document if applicable)
   - Created by (user name)

3. **WHEN** transactions list displays **THEN** system **SHALL** sort by created_at DESC (newest first)

4. **WHEN** user clicks Reference ID link **THEN** system **SHALL** navigate to source document (e.g., receipt, adjustment) if available

5. **WHEN** user clicks "Export" button **THEN** system **SHALL** download filtered transactions as Excel/CSV file

### REQ-8: Stock Valuation Report

**User Story:** As a finance officer, I want to view current inventory valuation, so that I can report asset values.

#### Acceptance Criteria

1. **WHEN** user opens Stock Valuation page **THEN** system **SHALL** display:
   - Location selector (dropdown: All Locations or specific)
   - As of date picker (optional, defaults to current date)
   - Summary cards: Total Value, Drug Count, Total Quantity

2. **WHEN** user selects "All Locations" **THEN** system **SHALL** display grouped table:
   - Section header for each location
   - Subtotal per location (drug count, total quantity, total value)
   - Grand total footer (sum across all locations)

3. **WHEN** user selects specific location **THEN** system **SHALL** display detailed table for that location:
   - Drug name
   - Quantity on hand
   - Average unit cost
   - Total value (quantity × average_cost)

4. **WHEN** user clicks "Export" button **THEN** system **SHALL** download valuation report as Excel file with:
   - Summary sheet (totals by location)
   - Detail sheet (line-by-line drug valuation)

5. **WHEN** "As of Date" is selected **THEN** system **SHALL** calculate historical valuation from transaction log (if implemented)

### REQ-9: Real-Time Updates via WebSocket

**User Story:** As a pharmacist, I want stock levels to update automatically when colleagues make changes, so that I always see current data without refreshing.

#### Acceptance Criteria

1. **WHEN** user is viewing Stock View page **THEN** system **SHALL** subscribe to WebSocket channel for current location

2. **WHEN** another user posts inventory adjustment **THEN** system **SHALL**:
   - Receive WebSocket event "inventory:adjustment_created"
   - Update affected row in table (quantity, status)
   - Update quick stats cards
   - Display toast notification: "Stock updated: [Drug name]"

3. **WHEN** another user posts receipt (from Procurement) **THEN** system **SHALL**:
   - Receive WebSocket event "inventory:receipt_posted"
   - Update affected rows in table
   - Update quick stats
   - Display toast notification: "Receipt posted: [Receipt ID]"

4. **WHEN** another user transfers stock **THEN** system **SHALL**:
   - Receive WebSocket events for both source and destination locations
   - Update affected rows if user is viewing either location
   - Display toast notification: "Transfer completed: [Drug name]"

5. **WHEN** WebSocket connection is lost **THEN** system **SHALL**:
   - Display warning banner: "Live updates disconnected. Attempting to reconnect..."
   - Attempt reconnection every 5 seconds
   - Remove warning banner when reconnected

### REQ-10: Responsive Design and Accessibility

**User Story:** As a user, I want the interface to work well on tablets and be accessible, so that I can work efficiently in various situations.

#### Acceptance Criteria

1. **WHEN** application loads on desktop (>1024px) **THEN** system **SHALL** display full table layout with all columns

2. **WHEN** application loads on tablet (768px-1024px) **THEN** system **SHALL**:
   - Hide less critical columns (e.g., last received date, average daily usage)
   - Maintain core data visibility (drug name, quantity, status)
   - Enable horizontal scroll for full table access

3. **WHEN** application loads on mobile (<768px) **THEN** system **SHALL**:
   - Switch to card layout (one drug per card)
   - Display essential info: drug name, quantity, status, expiry
   - Provide "View Details" button to expand card

4. **WHEN** user navigates with keyboard **THEN** system **SHALL**:
   - Support Tab key for navigation
   - Support Enter key to activate buttons
   - Support Arrow keys in dropdowns and tables
   - Show visible focus indicators

5. **WHEN** screen reader is active **THEN** system **SHALL**:
   - Provide ARIA labels for all interactive elements
   - Announce status changes (e.g., "Stock level low")
   - Provide table headers for screen readers
   - Announce toast notifications

### REQ-11: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when operations succeed or fail, so that I know the system status.

#### Acceptance Criteria

1. **WHEN** API call succeeds (adjustment, transfer) **THEN** system **SHALL** display success toast notification with action summary

2. **WHEN** API call fails with validation error (400) **THEN** system **SHALL** display error message in dialog with specific field errors

3. **WHEN** API call fails with authorization error (403) **THEN** system **SHALL** display error toast: "You don't have permission for this action"

4. **WHEN** API call fails with not found error (404) **THEN** system **SHALL** display error toast: "Record not found. It may have been deleted."

5. **WHEN** API call fails with server error (500) **THEN** system **SHALL** display error toast: "System error. Please try again or contact support."

6. **WHEN** network request is pending **THEN** system **SHALL** display loading indicator (spinner or progress bar)

7. **WHEN** data table is empty **THEN** system **SHALL** display empty state component with message and icon

### REQ-12: Performance Optimization

**User Story:** As a user, I want the application to load and respond quickly, so that I can work efficiently.

#### Acceptance Criteria

1. **WHEN** Stock View page loads **THEN** system **SHALL** render initial view within 2 seconds (excluding API latency)

2. **WHEN** user types in search bar **THEN** system **SHALL** debounce input (wait 300ms after last keypress before filtering)

3. **WHEN** table contains >100 rows **THEN** system **SHALL** implement virtual scrolling or pagination (20-50 rows per page)

4. **WHEN** user switches tabs or navigates **THEN** system **SHALL** cache API responses for 5 minutes to reduce redundant calls

5. **WHEN** images/icons load **THEN** system **SHALL** use lazy loading for images below the fold

6. **WHEN** dialogs open **THEN** system **SHALL** use Angular animations for smooth transitions (300ms duration)

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each component should handle one UI concern (e.g., StockListComponent displays stock, StockAdjustmentDialogComponent handles adjustments)
- **Smart/Dumb Component Pattern**: Container components manage state and API calls, presentation components receive data via @Input and emit events via @Output
- **Service Layer**: Dedicated services for API communication (InventoryApiService), state management (InventoryStateService), and WebSocket (InventoryWebSocketService)
- **Shared Module**: Reusable UI components (stat cards, data tables, dialogs) in shared module
- **Routing Module**: Feature-based routing with lazy loading for inventory module

### Technology Stack

- **Framework**: Angular 17+ with standalone components
- **UI Components**: AegisX UI library + Angular Material
- **Styling**: TailwindCSS with custom design tokens
- **State Management**: Angular Signals for reactive state
- **Forms**: Angular Reactive Forms with validation
- **HTTP**: HttpClient with interceptors for auth and error handling
- **WebSocket**: Custom WebSocket service with reconnection logic
- **Date Handling**: date-fns for date formatting and calculations
- **Charts**: Chart.js or ng2-charts for visualizations (if needed)

### Performance

- **Initial Load Time**: <3 seconds for first contentful paint
- **Time to Interactive**: <5 seconds on 3G network
- **API Response Time**: Stock list <500ms, lot list <300ms
- **WebSocket Latency**: Real-time updates received within 100ms
- **Bundle Size**: Inventory feature module <500KB (gzipped)
- **Memory Usage**: <50MB for stock list with 1000 items

### Security

- **Authentication**: JWT token in Authorization header for all API calls
- **Authorization**: RBAC checks on frontend (hide/disable actions user can't perform)
- **Input Validation**: Client-side validation for all form inputs
- **XSS Prevention**: Sanitize all user-generated content before display
- **HTTPS Only**: All API calls over HTTPS in production

### Usability

- **Accessibility**: WCAG 2.1 Level AA compliance
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Keyboard Navigation**: Full keyboard support without mouse
- **Touch Support**: Touch-friendly UI on tablets (44px min touch targets)
- **Internationalization**: Ready for Thai/English language support (i18n structure in place)

### Reliability

- **Offline Handling**: Display "You are offline" banner when network disconnected
- **Error Recovery**: Retry failed API calls with exponential backoff (max 3 attempts)
- **WebSocket Reconnection**: Automatic reconnection with exponential backoff
- **Data Consistency**: Optimistic UI updates with rollback on error

## Out of Scope

The following features are explicitly out of scope for this spec:

1. **Purchase Request Creation**: Initiated from Low Stock list but handled by Procurement module
2. **Receipt Posting**: Handled by Procurement module, inventory updates via backend workflow
3. **Distribution/Dispensing**: Handled by Distribution module, lot deduction via backend workflow
4. **User Management**: Handled by Platform RBAC module
5. **Master Data Management**: Drug catalog, locations, adjustment reasons managed separately
6. **Mobile App**: This spec covers responsive web app only, not native mobile app
7. **Barcode Scanning**: Future enhancement, not in initial release
8. **Batch Operations**: Single-item adjustments only, no bulk update UI
9. **Advanced Analytics**: Basic reports only, dashboards in separate Analytics module

## Dependencies

### Backend APIs (from inventory-backend-api spec)

- `GET /api/inventory/operations/inventory/stock` - List stock levels
- `GET /api/inventory/operations/inventory/stock/:drugId/:locationId` - Get specific stock
- `GET /api/inventory/operations/drug-lots` - List active lots
- `GET /api/inventory/operations/drug-lots/expiring` - Get expiring lots
- `GET /api/inventory/operations/drug-lots/:id` - Get lot details
- `POST /api/inventory/operations/inventory-adjustments` - Create adjustment
- `GET /api/inventory/operations/inventory-adjustments` - List adjustments
- `PUT /api/inventory/operations/inventory/:id/min-max` - Update min/max levels
- `POST /api/inventory/operations/inventory-transfers` - Create transfer
- `GET /api/inventory/operations/inventory/low-stock` - Get low stock items
- `GET /api/inventory/operations/inventory-transactions` - Transaction history
- `GET /api/inventory/operations/inventory/valuation` - Stock valuation

### Master Data

- **Drugs**: From `public.drugs` table via separate API
- **Locations**: From `public.locations` table via separate API
- **Adjustment Reasons**: From `inventory.adjustment_reasons` via inventory API
- **Users**: From Platform RBAC for "Created By" display

### Shared Services

- **AuthService**: For JWT token and user context
- **PermissionService**: For RBAC permission checks
- **WebSocketService**: For real-time updates
- **ToastService**: For user notifications
- **DialogService**: For modal dialogs

## Success Metrics

1. **Adoption**: >80% of pharmacists use system daily within 2 weeks of deployment
2. **Efficiency**: Average time to post stock adjustment <2 minutes (vs 5 minutes in legacy system)
3. **Accuracy**: Stock discrepancy rate <2% in physical counts
4. **User Satisfaction**: System Usability Scale (SUS) score >75
5. **Performance**: 95th percentile page load time <3 seconds
6. **Error Rate**: <1% of inventory adjustments fail due to system errors
