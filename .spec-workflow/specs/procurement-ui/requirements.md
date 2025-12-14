# Requirements Document - Procurement UI

## Introduction

The Procurement UI provides a complete Angular-based frontend for the INVS Modern Procurement system. It enables users to manage the entire procurement lifecycle from purchase request creation through goods receipt and payment tracking. The UI integrates with the Procurement API backend and supports real-time collaboration, bulk data import, and complex approval workflows.

**Purpose**: Build a user-friendly, responsive Angular application for procurement operations using AegisX-UI components and Angular Material design system.

**Value**: Streamlines procurement processes, reduces manual data entry through Excel/CSV import, provides real-time visibility into procurement status, and ensures compliance with budget controls and approval workflows.

## Alignment with Product Vision

This feature aligns with the INVS platform's vision of providing integrated hospital management by:

- **Efficiency**: Reducing procurement cycle time through streamlined workflows and real-time updates
- **Accuracy**: Preventing budget overruns and data entry errors through validation and automation
- **Transparency**: Providing clear visibility into procurement status for all stakeholders
- **Integration**: Seamlessly connecting procurement with budget, inventory, and payment systems
- **User Experience**: Following Material Design principles and AegisX-UI standards for consistency

## Requirements

### REQ-1: Purchase Request List and Management

**User Story:** As a pharmacist, I want to view and manage all purchase requests in a filterable table, so that I can track requests and their approval status efficiently.

#### Acceptance Criteria

1. WHEN user navigates to Purchase Requests page THEN system SHALL display AegisX ax-table with all PRs
2. WHEN user applies filters (status, date range, department, fiscal year) THEN system SHALL update table with filtered results
3. WHEN user clicks "Create PR" button THEN system SHALL navigate to PR creation form
4. WHEN user clicks on PR row THEN system SHALL navigate to PR detail view
5. IF PR status is DRAFT THEN system SHALL display "Submit" and "Edit" action buttons
6. IF PR status is SUBMITTED THEN system SHALL display "Approve" and "Reject" buttons (for approvers only)
7. WHEN table loads THEN system SHALL display status badges (ax-badge) with appropriate colors: DRAFT (gray), SUBMITTED (blue), APPROVED (green), REJECTED (red), CONVERTED (purple)

### REQ-2: Purchase Request Creation Form

**User Story:** As a pharmacist, I want to create a new purchase request with multiple items, so that I can request drugs for my department.

#### Acceptance Criteria

1. WHEN user clicks "Create PR" THEN system SHALL display multi-step form with sections: General Info, Items, Summary
2. WHEN user selects fiscal year and budget type THEN system SHALL call Budget API to check available budget and display remaining amount
3. IF budget is insufficient THEN system SHALL display ax-alert warning with budget details
4. WHEN user adds items THEN system SHALL provide autocomplete search for drugs (ax-autocomplete)
5. WHEN user enters quantity and unit price THEN system SHALL calculate line total automatically
6. WHEN user saves as DRAFT THEN system SHALL save PR without budget reservation
7. WHEN PR grand total exceeds department threshold THEN system SHALL require approval document attachment
8. WHEN all required fields are filled THEN system SHALL enable "Submit" button

### REQ-3: Purchase Request Submission Workflow

**User Story:** As a pharmacist, I want to submit my purchase request for approval, so that it can be reviewed and converted to a purchase order.

#### Acceptance Criteria

1. WHEN user clicks "Submit" on DRAFT PR THEN system SHALL call POST /api/purchase-requests/:id/submit
2. IF budget is insufficient THEN system SHALL display error dialog (ax-dialog) with budget shortage details
3. IF budget is available THEN system SHALL reserve budget and update PR status to SUBMITTED
4. WHEN submission succeeds THEN system SHALL display success notification (ax-toast) and navigate to PR list
5. WHEN submission fails THEN system SHALL display error notification with retry option

### REQ-4: Purchase Request Approval Interface

**User Story:** As a pharmacy manager, I want to review and approve/reject purchase requests, so that I can control departmental spending.

#### Acceptance Criteria

1. WHEN approver views SUBMITTED PR THEN system SHALL display "Approve" and "Reject" buttons
2. WHEN user clicks "Approve" THEN system SHALL show confirmation dialog with PR summary
3. WHEN user confirms approval THEN system SHALL call POST /api/purchase-requests/:id/approve
4. WHEN user clicks "Reject" THEN system SHALL show dialog with required rejection reason (min 10 chars)
5. WHEN user confirms rejection THEN system SHALL call POST /api/purchase-requests/:id/reject with reason
6. WHEN approval/rejection succeeds THEN system SHALL update PR status and display notification
7. IF user lacks approval permission THEN system SHALL hide approval buttons

### REQ-5: Purchase Order List and Management

**User Story:** As a purchasing officer, I want to view and manage all purchase orders, so that I can track vendor orders and delivery status.

#### Acceptance Criteria

1. WHEN user navigates to Purchase Orders page THEN system SHALL display ax-table with all POs
2. WHEN user applies filters (status, vendor, PO date, PR reference) THEN system SHALL update table with filtered results
3. WHEN user clicks "Create PO from PR" THEN system SHALL display PR selection dialog with APPROVED PRs only
4. WHEN user selects PR THEN system SHALL pre-fill PO form with PR items and vendor
5. IF PO grand total > 100,000 THEN system SHALL require approval document upload
6. WHEN user clicks on PO row THEN system SHALL navigate to PO detail view
7. WHEN table loads THEN system SHALL display status badges: DRAFT, PENDING, APPROVED, SENT, PARTIAL, COMPLETED, CANCELLED

### REQ-6: Purchase Order Approval and Sending

**User Story:** As a purchasing manager, I want to approve purchase orders and send them to vendors, so that goods can be ordered.

#### Acceptance Criteria

1. WHEN user views PENDING or DRAFT PO THEN system SHALL display "Approve" button
2. WHEN user clicks "Approve" on PO > 100,000 THEN system SHALL validate approval document exists
3. IF approval document missing THEN system SHALL display error and prevent approval
4. WHEN user confirms approval THEN system SHALL call POST /api/purchase-orders/:id/approve
5. WHEN user views APPROVED PO THEN system SHALL display "Send to Vendor" button
6. WHEN user clicks "Send to Vendor" THEN system SHALL show confirmation with budget commitment warning
7. WHEN user confirms send THEN system SHALL call POST /api/purchase-orders/:id/send
8. WHEN PO is sent THEN system SHALL commit budget, release PR reservation, update PR to CONVERTED, update PO to SENT

### REQ-7: Purchase Order Cancellation

**User Story:** As a purchasing officer, I want to cancel incorrect purchase orders, so that I can prevent unwanted deliveries.

#### Acceptance Criteria

1. WHEN user views PO (not COMPLETED or CANCELLED) THEN system SHALL display "Cancel" button
2. WHEN user clicks "Cancel" THEN system SHALL check for existing receipts via API
3. IF receipts exist THEN system SHALL display error dialog "Cannot cancel PO with receipts"
4. IF no receipts THEN system SHALL show cancellation dialog with required reason (min 10 chars)
5. WHEN user confirms cancellation THEN system SHALL call POST /api/purchase-orders/:id/cancel with reason
6. WHEN cancellation succeeds THEN system SHALL release budget, update PR back to APPROVED, update PO to CANCELLED

### REQ-8: Goods Receipt List and Management

**User Story:** As a warehouse officer, I want to manage goods receipts for received deliveries, so that I can track inspections and inventory updates.

#### Acceptance Criteria

1. WHEN user navigates to Receipts page THEN system SHALL display ax-table with all receipts
2. WHEN user applies filters (status, PO reference, receipt date, location) THEN system SHALL update table
3. WHEN user clicks "Create Receipt" THEN system SHALL display PO selection dialog with SENT or PARTIAL POs only
4. WHEN user selects PO THEN system SHALL pre-fill receipt form with PO items
5. WHEN user enters received quantities THEN system SHALL allow quantity_accepted <= quantity_ordered
6. WHEN user enters lot information THEN system SHALL validate lot_number and expiry_date are required
7. WHEN table loads THEN system SHALL display status badges: DRAFT, INSPECTING, ACCEPTED, POSTED

### REQ-9: Receipt Inspector Committee Management

**User Story:** As a warehouse manager, I want to assign inspector committee members to receipts, so that quality control is documented.

#### Acceptance Criteria

1. WHEN user creates or edits receipt THEN system SHALL display "Inspectors" section with ax-multi-select
2. WHEN user opens inspector selector THEN system SHALL load employees from GET /api/employees
3. WHEN user selects inspectors THEN system SHALL display selected count badge
4. IF user selects < 3 inspectors THEN system SHALL display validation warning
5. WHEN user saves receipt with < 3 inspectors THEN system SHALL prevent posting (allow DRAFT save)
6. WHEN user saves receipt with >= 3 inspectors THEN system SHALL enable "Post to Inventory" button
7. WHEN receipt is posted THEN system SHALL lock inspector list (read-only)

### REQ-10: Receipt Posting to Inventory

**User Story:** As a warehouse officer, I want to post receipts to inventory, so that stock levels are updated automatically.

#### Acceptance Criteria

1. WHEN user views receipt with >= 3 inspectors and valid lot info THEN system SHALL display "Post to Inventory" button
2. WHEN user clicks "Post to Inventory" THEN system SHALL call POST /api/receipts/:id/post
3. IF validation fails (< 3 inspectors or missing lot info) THEN system SHALL display error list (ax-alert)
4. IF posting succeeds THEN system SHALL create drug lots, update inventory stock, create transactions, update PO status
5. WHEN posting completes THEN system SHALL display success notification and refresh receipt details
6. WHEN receipt is posted THEN system SHALL lock all fields for editing (read-only)
7. WHEN user views posted receipt THEN system SHALL display inventory impact summary (lots created, stock added)

### REQ-11: Approval Documents Upload and Management

**User Story:** As a purchasing officer, I want to upload approval documents for high-value POs, so that regulatory compliance is maintained.

#### Acceptance Criteria

1. WHEN user creates PO with grand_total > 100,000 THEN system SHALL display "Approval Document Required" warning (ax-alert)
2. WHEN user clicks "Upload Document" THEN system SHALL open file picker (accept: PDF, images)
3. WHEN user selects file THEN system SHALL validate file size <= 10MB and type
4. WHEN user uploads file THEN system SHALL call POST /api/approval-documents with file
5. WHEN upload succeeds THEN system SHALL display file thumbnail and metadata
6. WHEN user views PO > 100,000 without document THEN system SHALL disable "Approve" button
7. WHEN document exists THEN system SHALL enable "Approve" button

### REQ-12: Payment Documents Tracking

**User Story:** As an accountant, I want to track payment documents for completed receipts, so that vendor invoices can be processed.

#### Acceptance Criteria

1. WHEN user navigates to Payment Documents page THEN system SHALL display ax-table with all payments
2. WHEN user applies filters (status, vendor, payment date, receipt reference) THEN system SHALL update table
3. WHEN user creates payment document THEN system SHALL allow selection of posted receipts only
4. WHEN user uploads payment attachments THEN system SHALL support multiple files (invoices, receipts)
5. WHEN user saves payment THEN system SHALL record payment amount, date, and reference number
6. WHEN table loads THEN system SHALL display payment status badges: PENDING, PAID, CANCELLED

### REQ-13: Excel/CSV Import for Bulk Data Entry

**User Story:** As a purchasing officer, I want to import PR items from Excel, so that I can create large requests quickly.

#### Acceptance Criteria

1. WHEN user creates new PR THEN system SHALL display "Import from Excel" button
2. WHEN user clicks "Import" THEN system SHALL open import dialog with template download link
3. WHEN user selects Excel/CSV file THEN system SHALL validate headers match template
4. IF headers invalid THEN system SHALL display error with expected columns
5. WHEN file is valid THEN system SHALL parse rows and display preview table
6. WHEN user confirms import THEN system SHALL add items to PR form
7. IF drug codes not found THEN system SHALL display warning list with invalid rows

### REQ-14: Real-Time Updates via WebSocket

**User Story:** As a pharmacist, I want to see real-time updates when my PR is approved, so that I can monitor progress without refreshing.

#### Acceptance Criteria

1. WHEN user views PR detail page THEN system SHALL subscribe to WebSocket channel for that PR
2. WHEN PR status changes on backend THEN system SHALL receive WebSocket event
3. WHEN event received THEN system SHALL update UI status badge and action buttons without refresh
4. WHEN user views PO or Receipt detail THEN system SHALL subscribe to respective WebSocket channels
5. WHEN document updated by another user THEN system SHALL display notification "Document updated by [user]"
6. WHEN user leaves detail page THEN system SHALL unsubscribe from WebSocket channel

### REQ-15: Budget Availability Checking

**User Story:** As a pharmacist, I want to see available budget before submitting PR, so that I don't waste time on unfunded requests.

#### Acceptance Criteria

1. WHEN user selects fiscal year and budget type on PR form THEN system SHALL call Budget API GET /check-availability
2. WHEN budget data loads THEN system SHALL display available amount in ax-card widget
3. IF available budget < PR total THEN system SHALL display red warning "Insufficient budget: ฿X available, ฿Y needed"
4. IF available budget >= PR total THEN system SHALL display green checkmark "Budget available: ฿X remaining"
5. WHEN user changes PR items THEN system SHALL recalculate and update budget warning
6. IF budget becomes insufficient THEN system SHALL disable "Submit" button

### REQ-16: Inventory Status Display on Receipt Pages

**User Story:** As a warehouse officer, I want to see current inventory levels when creating receipts, so that I can assess stock adequacy.

#### Acceptance Criteria

1. WHEN user adds item to receipt THEN system SHALL call GET /api/inventory?drug_id={id}&location_id={loc}
2. WHEN inventory data loads THEN system SHALL display current stock quantity next to item row
3. IF stock level is low (< minimum threshold) THEN system SHALL display yellow warning icon
4. IF stock level is zero THEN system SHALL display red alert icon
5. WHEN user hovers over icon THEN system SHALL show tooltip with stock details
6. WHEN receipt is posted THEN system SHALL show "New stock: X units" update

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each component handles one specific UI concern (list, form, detail)
- **Modular Design**: Separate components for reusable parts (item tables, status badges, action buttons)
- **Service Layer**: Angular services handle all API calls and state management
- **Component Isolation**: Use Angular Signals for state management (NOT NgRx)
- **Clear Interfaces**: Define TypeScript interfaces for all API request/response models

### UI/UX Standards

- **Component Library**: Use AegisX-UI components (ax-table, ax-form, ax-badge, ax-dialog, ax-toast, ax-alert, ax-autocomplete, ax-multi-select, ax-card)
- **Material Design**: Use Angular Material components for base UI elements
- **Framework**: Angular 18+ with standalone components
- **State Management**: Angular Signals for reactive state
- **Responsive Design**: Support desktop (1920x1080), tablet (768px), mobile (375px)
- **Accessibility**: WCAG 2.1 AA compliance (ARIA labels, keyboard navigation)
- **Thai/English**: Support bilingual interface with i18n

### Performance

- **Initial Load**: Page loads within 2 seconds on 4G connection
- **Table Rendering**: Render 100 rows within 500ms
- **Real-time Updates**: WebSocket events update UI within 300ms
- **Excel Import**: Process 1000 rows within 3 seconds
- **API Calls**: Implement caching for master data (drugs, departments, vendors)

### Security

- **Authentication**: Validate JWT token on all API calls
- **Authorization**: Hide action buttons based on user permissions
- **Input Validation**: Validate all form inputs on client and server
- **File Upload**: Validate file types and sizes before upload
- **XSS Prevention**: Sanitize all user-generated content

### Reliability

- **Error Handling**: Display user-friendly error messages (Thai/English)
- **Retry Logic**: Implement retry for failed API calls (3 attempts with exponential backoff)
- **Offline Support**: Display offline warning when WebSocket disconnects
- **Data Persistence**: Auto-save DRAFT forms to local storage every 30 seconds

### Usability

- **Loading States**: Display ax-loading spinner during API calls
- **Validation Feedback**: Show inline validation errors below fields
- **Confirmation Dialogs**: Require confirmation for destructive actions (delete, cancel, reject)
- **Success Notifications**: Display ax-toast notifications for successful actions
- **Help Text**: Provide tooltips and help icons for complex fields

### Testability

- **Unit Tests**: 80% code coverage for components and services
- **Integration Tests**: Test all API integration points
- **E2E Tests**: Cover critical user journeys (PR creation → approval → PO → receipt → post)
- **Accessibility Tests**: Automated WCAG compliance checks
