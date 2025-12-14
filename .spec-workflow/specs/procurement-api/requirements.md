# Requirements Document - Procurement API

## Introduction

The **Procurement API** completes the backend implementation of the hospital drug procurement workflow system. While the foundational CRUD operations for 8 procurement modules (Purchase Requests, Purchase Orders, Receipts, Contracts, etc.) are already implemented (~80% complete), this specification focuses on implementing the critical **workflow endpoints** and **business logic** that enable the complete procurement cycle:

**Purchase Request (PR) → Approval → Purchase Order (PO) → Vendor Delivery → Goods Receipt (GR) → Inventory Update → Payment**

This API provides the backend services for:

- Multi-stage approval workflows for purchase requests
- Budget integration (reserve, commit, release)
- Purchase order lifecycle management
- Goods receipt verification and posting to inventory
- Inspector committee management
- Payment document tracking
- Contract-based pricing application

**Value to Users:**

- Pharmacists can submit purchase requests with automatic budget validation
- Department heads can approve/reject requests with full visibility
- Procurement officers can manage orders and vendor communications
- Warehouse staff can record receipts and update inventory seamlessly
- Finance officers can track payments with complete audit trails
- Management can monitor spending against budgets in real-time

## Alignment with Product Vision

This feature supports the **INVS Modern** vision of a comprehensive hospital drug inventory management system by:

1. **Automated Workflow Management**: Eliminates manual paper-based procurement processes, reducing approval time from days to hours
2. **Budget Control Integration**: Real-time budget checking prevents overspending and ensures fiscal responsibility
3. **Inventory Accuracy**: Automatic lot tracking and FIFO/FEFO integration ensures accurate stock levels and expiry management
4. **Audit Trail**: Complete transaction history for regulatory compliance and internal audits
5. **Cross-System Integration**: Seamless data flow between Budget, Procurement, and Inventory systems
6. **Ministry Compliance**: Supports DMSIC 2568 reporting requirements for RECEIPT and PURCHASEPLAN exports

**Technical Alignment:**

- Follows AegisX platform standards (TypeBox schemas, Fastify routes, service layer pattern)
- Reuses existing 8 CRUD modules as foundation
- Integrates with Budget Management API for financial controls
- Integrates with Inventory API for stock updates
- Uses PostgreSQL functions for complex business logic

## Requirements

### REQ-1: Purchase Request Submission Workflow

**User Story:** As a department staff member, I want to submit purchase requests for approval with automatic budget validation, so that I can get necessary drugs approved efficiently without budget violations.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/purchase-requests/:id/submit` **THEN** system **SHALL** validate that PR status is DRAFT
2. **WHEN** PR is submitted **THEN** system **SHALL** call Budget API to check availability using `check_budget_availability(fiscal_year, budget_type_id, dept_id, amount, quarter)`
3. **IF** budget is insufficient **THEN** system **SHALL** return 400 error with shortage details and prevent submission
4. **WHEN** budget is available **THEN** system **SHALL** call Budget API to reserve budget with 30-day expiration
5. **WHEN** budget reservation succeeds **THEN** system **SHALL** update PR status to SUBMITTED and record submission timestamp
6. **WHEN** PR is submitted **THEN** system **SHALL** send notification to department manager for approval
7. **IF** any step fails **THEN** system **SHALL** rollback all changes and return appropriate error

### REQ-2: Purchase Request Approval/Rejection Workflow

**User Story:** As a department head, I want to approve or reject purchase requests with clear reasoning, so that I can maintain budget control and ensure only necessary purchases proceed.

#### Acceptance Criteria

1. **WHEN** manager calls `POST /api/inventory/procurement/purchase-requests/:id/approve` **THEN** system **SHALL** validate that PR status is SUBMITTED
2. **WHEN** PR is approved **THEN** system **SHALL** update status to APPROVED, record approver ID and timestamp
3. **WHEN** PR is approved **THEN** system **SHALL** keep budget reservation active (do not release)
4. **WHEN** PR is approved **THEN** system **SHALL** send notification to requester with approval confirmation
5. **WHEN** manager calls `POST /api/inventory/procurement/purchase-requests/:id/reject` **THEN** system **SHALL** validate that PR status is SUBMITTED
6. **WHEN** PR is rejected **THEN** system **SHALL** update status to REJECTED, record rejector ID, timestamp, and rejection reason
7. **WHEN** PR is rejected **THEN** system **SHALL** call Budget API to release budget reservation immediately
8. **WHEN** PR is rejected **THEN** system **SHALL** send notification to requester with rejection reason
9. **IF** user is not authorized to approve/reject **THEN** system **SHALL** return 403 Forbidden error

### REQ-3: Purchase Order Creation from Approved PR

**User Story:** As a procurement officer, I want to create purchase orders from approved PRs with contract-based pricing, so that I can send orders to vendors quickly and accurately.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/purchase-orders` with pr_id **THEN** system **SHALL** validate that PR status is APPROVED
2. **IF** PR is not APPROVED **THEN** system **SHALL** return 400 error "Cannot create PO from non-approved PR"
3. **WHEN** creating PO **AND** vendor has active contract **THEN** system **SHALL** apply contract prices from `contract_items` table
4. **WHEN** creating PO **AND** no contract exists **THEN** system **SHALL** use estimated prices from PR items
5. **WHEN** PO is created **THEN** system **SHALL** calculate VAT (7%) and grand total automatically
6. **WHEN** PO is created **THEN** system **SHALL** set initial status to DRAFT
7. **WHEN** PO is created **THEN** system **SHALL** create PO items linked to PR items via `pr_item_id`
8. **WHEN** PO is saved **THEN** system **SHALL** return PO details with items, vendor info, and totals

### REQ-4: Purchase Order Approval and Sending Workflow

**User Story:** As a procurement officer, I want to send approved purchase orders to vendors with budget commitment, so that orders are officially recorded and budgets are properly allocated.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/purchase-orders/:id/approve` **THEN** system **SHALL** validate that PO status is PENDING or DRAFT
2. **WHEN** PO grand_total > 100,000 **THEN** system **SHALL** require approval document in `approval_documents` table
3. **IF** approval document missing for high-value PO **THEN** system **SHALL** return 400 error "Approval document required"
4. **WHEN** PO is approved **THEN** system **SHALL** update status to APPROVED, record approver and timestamp
5. **WHEN** user calls `POST /api/inventory/procurement/purchase-orders/:id/send` **THEN** system **SHALL** validate status is APPROVED
6. **WHEN** PO is sent **THEN** system **SHALL** call Budget API to commit budget (convert reservation to commitment)
7. **WHEN** budget is committed **THEN** system **SHALL** release budget reservation
8. **WHEN** PO is sent **THEN** system **SHALL** update linked PR status to CONVERTED
9. **WHEN** PO is sent **THEN** system **SHALL** update PO status to SENT and record sent timestamp
10. **IF** budget commit fails **THEN** system **SHALL** rollback PO status and return error

### REQ-5: Purchase Order Cancellation Workflow

**User Story:** As a finance manager, I want to cancel purchase orders when necessary, so that I can handle vendor issues or budget changes while releasing committed funds.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/purchase-orders/:id/cancel` **THEN** system **SHALL** validate that PO status is not COMPLETED or CANCELLED
2. **WHEN** PO is cancelled **THEN** system **SHALL** update status to CANCELLED and record cancellation timestamp and reason
3. **WHEN** PO with committed budget is cancelled **THEN** system **SHALL** call Budget API to release budget commitment
4. **WHEN** PO is cancelled **AND** PR exists **THEN** system **SHALL** update PR status back to APPROVED (allow new PO creation)
5. **WHEN** PO is cancelled **THEN** system **SHALL** send notification to vendor (if status was SENT)
6. **IF** PO has associated receipts **THEN** system **SHALL** return 400 error "Cannot cancel PO with receipts"

### REQ-6: Goods Receipt Recording

**User Story:** As a warehouse staff member, I want to record goods received from vendors with lot tracking, so that I can verify quantities and qualities before accepting delivery.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/receipts` **THEN** system **SHALL** validate that PO exists and status is SENT or PARTIAL
2. **WHEN** recording receipt items **THEN** system **SHALL** require lot_number, manufacture_date, and expiry_date for each item
3. **WHEN** received quantity > ordered quantity **THEN** system **SHALL** return 400 error "Cannot receive more than ordered"
4. **WHEN** expiry_date < 6 months from now **THEN** system **SHALL** return warning but allow acceptance
5. **WHEN** items have quantity_rejected > 0 **THEN** system **SHALL** require rejection_reason
6. **WHEN** receipt is created **THEN** system **SHALL** set status to DRAFT
7. **WHEN** receipt is created **THEN** system **SHALL** calculate total_amount based on accepted quantities

### REQ-7: Receipt Inspector Committee Management

**User Story:** As a warehouse manager, I want to assign inspector committee members to receipts, so that goods are verified by proper authorities as per hospital policy.

#### Acceptance Criteria

1. **WHEN** adding inspectors via `POST /api/inventory/procurement/receipts/:id/inspectors` **THEN** system **SHALL** create records in `receipt_inspectors` table
2. **WHEN** adding inspectors **THEN** system **SHALL** require minimum 3 inspectors (chairman, member, secretary)
3. **WHEN** all inspectors sign **THEN** system **SHALL** update receipt inspected_by and inspected_at
4. **IF** fewer than 3 inspectors **THEN** system **SHALL** prevent receipt posting with error "Minimum 3 inspectors required"
5. **WHEN** inspector signs **THEN** system **SHALL** record user_id, role, and signed timestamp

### REQ-8: Receipt Posting to Inventory

**User Story:** As a warehouse staff member, I want to post verified receipts to inventory, so that stock levels are updated automatically with proper lot tracking.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/receipts/:id/post` **THEN** system **SHALL** validate receipt status is DRAFT or INSPECTING
2. **WHEN** posting receipt **THEN** system **SHALL** validate minimum 3 inspectors signed
3. **WHEN** receipt is posted **THEN** system **SHALL** create drug_lots records for each accepted item with lot details
4. **WHEN** receipt is posted **THEN** system **SHALL** update or create inventory records for each drug/location combination
5. **WHEN** receipt is posted **THEN** system **SHALL** increment inventory quantity_on_hand by accepted quantity
6. **WHEN** receipt is posted **THEN** system **SHALL** create inventory_transactions with type='RECEIVE' and reference to receipt
7. **WHEN** all PO items fully received **THEN** system **SHALL** update PO status to COMPLETED
8. **WHEN** PO partially received **THEN** system **SHALL** update PO status to PARTIAL
9. **WHEN** receipt is posted **THEN** system **SHALL** update receipt status to POSTED
10. **IF** inventory update fails **THEN** system **SHALL** rollback entire transaction including lot creation

### REQ-9: Payment Document Management

**User Story:** As a finance officer, I want to record payment documents with evidence attachments, so that I can track vendor payments and maintain audit trails.

#### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/procurement/payments` **THEN** system **SHALL** validate that receipt status is POSTED
2. **IF** receipt not posted **THEN** system **SHALL** return 400 error "Cannot pay for unposted receipt"
3. **WHEN** creating payment **THEN** system **SHALL** validate payment_amount matches receipt total_amount
4. **WHEN** payment method is CHEQUE or TRANSFER **THEN** system **SHALL** require reference_number
5. **WHEN** payment is created **THEN** system **SHALL** allow attachment uploads via `POST /api/inventory/procurement/payments/:id/attachments`
6. **WHEN** payment is created **THEN** system **SHALL** record paid_by user and paid_at timestamp
7. **WHEN** payment is completed **THEN** system **SHALL** send notification to accounting department

### REQ-10: Contract-Based Pricing Integration

**User Story:** As a procurement officer, I want the system to automatically apply contract prices when creating POs, so that I can ensure agreed pricing is used and reduce manual errors.

#### Acceptance Criteria

1. **WHEN** creating PO from PR **AND** vendor has active contract **THEN** system **SHALL** query `contracts` table for active contract
2. **WHEN** active contract found **THEN** system **SHALL** join with `contract_items` to find agreed prices for requested drugs
3. **WHEN** contract item exists **THEN** system **SHALL** apply contract agreed_unit_price to PO item
4. **WHEN** contract item not found **THEN** system **SHALL** use PR estimated_unit_price
5. **WHEN** contract is expired **THEN** system **SHALL** return warning "Contract expired - using estimated prices"
6. **WHEN** using contract prices **THEN** system **SHALL** record contract_id in PO for audit trail

### REQ-11: Budget Integration Service

**User Story:** As a system administrator, I want the procurement API to properly integrate with Budget Management API, so that budget controls are enforced throughout the procurement workflow.

#### Acceptance Criteria

1. **WHEN** PR is submitted **THEN** system **SHALL** call `POST /api/budget/check-availability` with fiscal_year, budget_type, department, amount, quarter
2. **WHEN** budget available **THEN** system **SHALL** call `POST /api/budget/reserve` with allocation_id, pr_id, amount, quarter, expires_date (30 days)
3. **WHEN** PO is sent **THEN** system **SHALL** call `POST /api/budget/commit` with allocation_id, po_id, amount, quarter
4. **WHEN** PO is cancelled **THEN** system **SHALL** call `POST /api/budget/release-commitment` with commitment_id
5. **WHEN** PR is rejected **THEN** system **SHALL** call `POST /api/budget/release-reservation` with reservation_id
6. **IF** any budget API call fails **THEN** system **SHALL** return meaningful error to user and prevent workflow progression
7. **WHEN** budget API unavailable **THEN** system **SHALL** return 503 Service Unavailable with retry guidance

### REQ-12: Multi-Level Approval Workflow

**User Story:** As a hospital administrator, I want purchase requests to go through proper approval levels based on amount thresholds, so that high-value purchases receive appropriate oversight.

#### Acceptance Criteria

1. **WHEN** PR amount < 50,000 **THEN** system **SHALL** require only department head approval (1 level)
2. **WHEN** PR amount >= 50,000 AND < 200,000 **THEN** system **SHALL** require department head + finance manager approval (2 levels)
3. **WHEN** PR amount >= 200,000 **THEN** system **SHALL** require department head + finance manager + director approval (3 levels)
4. **WHEN** first level approves **THEN** system **SHALL** update status to PENDING_LEVEL_2 and notify next approver
5. **WHEN** all required levels approve **THEN** system **SHALL** update status to APPROVED
6. **IF** any level rejects **THEN** system **SHALL** update status to REJECTED and release budget immediately
7. **WHEN** approval level changes **THEN** system **SHALL** record each approver with timestamp in separate approval_history table (to be created)

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each workflow endpoint (submit, approve, send, post) should be a separate controller method with focused business logic
- **Service Layer Pattern**: Complex business logic must be implemented in service classes, not controllers
  - `PurchaseRequestWorkflowService` - handles PR submission, approval, rejection
  - `PurchaseOrderWorkflowService` - handles PO approval, sending, cancellation
  - `ReceiptWorkflowService` - handles receipt posting, lot creation, inventory updates
  - `BudgetIntegrationService` - handles all Budget API calls
  - `ContractPricingService` - handles contract price lookups
- **Modular Design**: Each service should be isolated and testable independently
- **Dependency Injection**: Services should be injected via Fastify decorators, not instantiated directly
- **Clear Interfaces**: Define TypeScript interfaces for all service method signatures
- **Transaction Management**: All multi-step operations must use Prisma transactions to ensure atomicity
- **Error Handling**: Use custom error classes (BudgetError, WorkflowError, ValidationError) with proper HTTP status codes

### Performance

- **Response Time**: All workflow endpoints must respond within 3 seconds under normal load
- **Budget API Calls**: Implement 5-second timeout for Budget API calls with retry logic (3 retries with exponential backoff)
- **Database Queries**: All queries must use proper indexes (verified with EXPLAIN ANALYZE)
- **Batch Operations**: Receipt posting with 100+ items must complete within 10 seconds
- **Concurrent Requests**: System must handle 50 concurrent PR submissions without performance degradation
- **Query Optimization**: Use Prisma `include` carefully to avoid N+1 queries; prefer `select` for large datasets

### Security

- **Authentication**: All endpoints must require JWT authentication via `fastify.authenticate` hook
- **Authorization**: Implement role-based permissions:
  - `procurement:pr:submit` - can submit PRs
  - `procurement:pr:approve` - can approve PRs
  - `procurement:po:create` - can create POs
  - `procurement:po:send` - can send POs
  - `procurement:receipt:post` - can post receipts
  - `procurement:payment:create` - can create payments
- **Input Validation**: All request bodies must be validated using TypeBox schemas before processing
- **SQL Injection Prevention**: Use Prisma parameterized queries exclusively; never construct raw SQL strings
- **Budget Validation**: Never trust client-submitted budget availability; always verify via Budget API
- **Audit Logging**: Log all approval/rejection actions with user_id, timestamp, IP address
- **Sensitive Data**: Mask payment reference numbers in logs

### Reliability

- **Transaction Atomicity**: All multi-step workflows must complete fully or rollback entirely (no partial states)
- **Budget Reservation Expiry**: Implement background job to auto-release expired reservations (>30 days)
- **Error Recovery**: Failed Budget API calls must not leave PR in inconsistent state
- **Data Integrity**: Enforce foreign key constraints at database level
- **Idempotency**: POST endpoints should use idempotency keys to prevent duplicate submissions
- **Retry Logic**: Implement exponential backoff for transient Budget API failures
- **Health Checks**: Expose `/api/inventory/procurement/health` endpoint checking database and Budget API connectivity

### Usability

- **Error Messages**: Return clear, actionable error messages in Thai and English
  - Example: `{"code": "INSUFFICIENT_BUDGET", "message": "งบประมาณไม่เพียงพอ", "message_en": "Insufficient budget", "details": {"available": 10000, "requested": 15000, "shortage": 5000}}`
- **Validation Feedback**: Return specific field errors for invalid inputs
- **Progress Indicators**: Provide status field in responses indicating workflow stage
- **Timestamp Formatting**: Return all timestamps in ISO 8601 format with timezone
- **Pagination**: List endpoints must support pagination with default page_size=50, max=500
- **Filtering**: Support filtering by status, date_range, department_id, fiscal_year
- **Sorting**: Support sorting by request_date, total_amount, status
- **Response Consistency**: All endpoints must follow AegisX standard response format:
  ```typescript
  {
    success: boolean,
    data: T | T[],
    message?: string,
    pagination?: { page, pageSize, total, totalPages }
  }
  ```

### Testability

- **Unit Tests**: Each service method must have unit tests with mocked dependencies (target: 80% coverage)
- **Integration Tests**: Each workflow endpoint must have integration tests hitting real database (test DB)
- **Budget API Mocking**: Provide mock Budget API responses for testing without external dependency
- **Test Data Factories**: Use factory pattern for creating test PRs, POs, Receipts
- **Transaction Rollback**: Tests must rollback transactions to keep test DB clean
- **Test Isolation**: Each test must be independent and not rely on other test execution order

### Scalability

- **Connection Pooling**: Configure Prisma connection pool (min: 5, max: 20 connections)
- **Caching**: Cache contract prices in Redis with 1-hour TTL
- **Background Jobs**: Heavy operations (receipt posting with 500+ items) should queue for background processing
- **Database Indexing**: Create indexes on frequently queried fields:
  - `purchase_requests(status, department_id, fiscal_year)`
  - `purchase_orders(status, po_date)`
  - `receipts(status, receipt_date)`
  - `contract_items(contract_id, generic_id)`
- **Rate Limiting**: Implement per-user rate limits (100 requests/minute for workflow endpoints)

### Maintainability

- **Code Documentation**: All service methods must have JSDoc comments explaining parameters, returns, and side effects
- **Type Safety**: Use TypeScript strict mode; no `any` types allowed
- **Schema Validation**: Maintain TypeBox schemas alongside route definitions
- **Error Codes**: Document all error codes in `docs/api/error-codes.md`
- **Changelog**: Maintain CHANGELOG.md for all workflow endpoint changes
- **Versioning**: Use API versioning if breaking changes needed (prefer backward compatible changes)
- **Logging**: Use structured logging with context (user_id, pr_id, correlation_id)
  ```typescript
  logger.info({ userId, prId, action: 'submit_pr', amount: 15000 }, 'PR submitted for approval');
  ```
