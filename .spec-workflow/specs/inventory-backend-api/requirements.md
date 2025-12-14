# Requirements Document - Inventory Backend API

## Introduction

The **Inventory Backend API** provides comprehensive backend services for hospital drug inventory management with real-time stock tracking, FIFO/FEFO lot management, and complete audit trails. This API serves as the core backend for the Inventory Management system, managing:

- **Real-time Stock Tracking**: Multi-location inventory with min/max/reorder point management
- **FIFO/FEFO Lot Management**: Complete lot traceability with expiry date tracking
- **Stock Movements**: Receipts, distributions, transfers, and adjustments
- **Expiry Management**: Automated alerts and quarantine of expired drugs
- **Audit Trail**: Immutable transaction log for all inventory movements

**Value to Users:**

- Pharmacists can track stock levels in real-time across all locations
- Warehouse staff can manage stock receipts with automatic lot creation
- Inventory managers can perform stock adjustments with full audit trails
- Finance officers can access accurate inventory valuation for reporting
- System administrators can configure min/max levels and reorder points
- Department staff can view available stock before requesting distributions

## Alignment with Product Vision

This feature supports the **INVS Modern** vision of a comprehensive hospital drug inventory management system by:

1. **Real-time Stock Visibility**: Eliminates manual stock counting and provides instant stock status across all hospital locations
2. **FIFO/FEFO Compliance**: Ensures proper drug rotation and minimizes waste from expired medications
3. **Integrated Workflows**: Seamless data flow from Procurement (receipts) to Distribution (dispensing) with automatic inventory updates
4. **Ministry Compliance**: Supports DMSIC 2568 INVENTORY export (15 fields) for regulatory reporting
5. **Audit Trail Integrity**: Complete transaction history for internal audits and regulatory compliance
6. **Cost Management**: Accurate inventory valuation using weighted average cost for financial reporting

**Technical Alignment:**

- Follows AegisX platform standards (TypeBox schemas, Fastify routes, service layer pattern)
- Implements domain-driven design in `inventory/operations` domain
- Uses PostgreSQL schema `inventory` with 3 core tables
- Integrates with Procurement API for receipt posting
- Integrates with Distribution API for FIFO/FEFO dispensing
- Uses database functions for complex business logic (FIFO/FEFO selection)

**Integration Points:**

- **Procurement → Inventory**: Receipt posting creates lots and updates stock
- **Distribution → Inventory**: Stock reduction using FIFO/FEFO logic
- **Drug Return → Inventory**: Stock increase from department returns
- **Master Data → Inventory**: Drugs and locations reference data

## Requirements

### Phase 1: Stock Inquiry (Week 1)

#### REQ-1: List Stock Levels

**User Story:** As a pharmacist, I want to view current stock levels for all drugs at my location, so that I can quickly identify what's in stock and what needs reordering.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory/stock` **THEN** system **SHALL** return paginated list of inventory records
2. **WHEN** `locationId` query parameter provided **THEN** system **SHALL** filter by location
3. **WHEN** `drugId` query parameter provided **THEN** system **SHALL** filter by drug
4. **WHEN** `belowMin=true` query parameter provided **THEN** system **SHALL** filter items where `quantity_on_hand <= min_level`
5. **WHEN** `search` query parameter provided **THEN** system **SHALL** search by drug trade name or drug code
6. **WHEN** stock data returned **THEN** system **SHALL** include drug details (code, name, unit), location details (code, name), and stock metrics (quantity, min, max, reorder point)
7. **WHEN** stock data returned **THEN** system **SHALL** calculate stock status (OK, LOW, CRITICAL, OVERSTOCK) based on min/max levels
8. **IF** user has department restriction **THEN** system **SHALL** filter to show only authorized locations

#### REQ-2: Get Specific Stock Level

**User Story:** As a warehouse staff member, I want to check the exact stock level for a specific drug at a specific location, so that I can verify availability before processing distribution requests.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory/stock/:drugId/:locationId` **THEN** system **SHALL** return single inventory record
2. **IF** inventory record not found **THEN** system **SHALL** return 404 with error code `STOCK_NOT_FOUND`
3. **WHEN** stock data returned **THEN** system **SHALL** include drug details, location details, stock levels, cost information (average_cost, last_cost)
4. **WHEN** stock data returned **THEN** system **SHALL** calculate days of supply based on average daily usage from last 90 days
5. **WHEN** stock data returned **THEN** system **SHALL** include stock value (quantity × average_cost)
6. **WHEN** stock data returned **THEN** system **SHALL** include reorder recommendation based on reorder point

#### REQ-3: List Active Lots

**User Story:** As a pharmacist, I want to view all active lots for a drug, so that I can see expiry dates and plan FIFO/FEFO dispensing.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/drug-lots` with `drugId` and `locationId` **THEN** system **SHALL** return list of active lots
2. **WHEN** `orderBy=FIFO` parameter provided **THEN** system **SHALL** order by `received_date ASC` (oldest first)
3. **WHEN** `orderBy=FEFO` parameter provided **THEN** system **SHALL** order by `expiry_date ASC` (expiring soonest first)
4. **WHEN** `orderBy` not provided **THEN** system **SHALL** default to FIFO order
5. **WHEN** `includeExpired=false` (default) **THEN** system **SHALL** filter to active lots only
6. **WHEN** lot data returned **THEN** system **SHALL** include lot number, manufacture date, expiry date, quantity available, unit cost
7. **WHEN** lot data returned **THEN** system **SHALL** calculate days until expiry and expiry status (OK, WARN, CRITICAL, EXPIRED)
8. **WHEN** lot data returned **THEN** system **SHALL** include utilization percentage (dispensed / received)

#### REQ-4: Get Expiring Lots

**User Story:** As an inventory manager, I want to see all lots expiring within a specified timeframe, so that I can plan to use them before expiry and minimize waste.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/drug-lots/expiring` **THEN** system **SHALL** return lots expiring within 180 days (default)
2. **WHEN** `daysThreshold` parameter provided **THEN** system **SHALL** filter lots expiring within specified days
3. **WHEN** `locationId` parameter provided **THEN** system **SHALL** filter by location
4. **WHEN** expiring lots returned **THEN** system **SHALL** include drug details, location details, lot information, and remaining quantity
5. **WHEN** expiring lots returned **THEN** system **SHALL** calculate days until expiry and expiry status
6. **WHEN** expiring lots returned **THEN** system **SHALL** calculate total value (quantity × unit_cost)
7. **WHEN** expiring lots returned **THEN** system **SHALL** order by expiry date ascending (expiring soonest first)
8. **WHEN** expiring lots returned **THEN** system **SHALL** include summary: total lots, total value, critical lots (< 3 months), warning lots (3-6 months)

#### REQ-5: Get Lot Details

**User Story:** As a pharmacist, I want to view complete details of a specific lot, so that I can verify lot number, expiry date, and remaining quantity before dispensing.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/drug-lots/:id` **THEN** system **SHALL** return complete lot details
2. **IF** lot not found **THEN** system **SHALL** return 404 with error code `LOT_NOT_FOUND`
3. **WHEN** lot details returned **THEN** system **SHALL** include all lot fields (lot number, dates, quantities, cost)
4. **WHEN** lot details returned **THEN** system **SHALL** include related drug details with generic name
5. **WHEN** lot details returned **THEN** system **SHALL** include location details
6. **WHEN** lot details returned **THEN** system **SHALL** include source receipt information if available
7. **WHEN** lot details returned **THEN** system **SHALL** calculate lot status (active, depleted, expired)

### Phase 2: Stock Management (Week 2)

#### REQ-6: Create Stock Adjustment

**User Story:** As an inventory manager, I want to adjust stock quantities after physical count, so that system records match actual stock on hand.

##### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/operations/inventory-adjustments` **THEN** system **SHALL** validate that drug and location exist
2. **WHEN** adjustment_type is "SUBTRACT" **AND** quantity > quantity_on_hand **THEN** system **SHALL** return 400 error `INSUFFICIENT_STOCK`
3. **WHEN** adjustment is created **THEN** system **SHALL** update inventory `quantity_on_hand` (add or subtract)
4. **WHEN** adjustment is created **THEN** system **SHALL** create inventory transaction record with type ADJUST
5. **WHEN** adjustment is created **THEN** system **SHALL** record adjustment reason from `adjustment_reason_id` lookup
6. **WHEN** adjustment is created **THEN** system **SHALL** record previous quantity, new quantity, and variance
7. **WHEN** lot_id provided **THEN** system **SHALL** also update specific lot quantity proportionally
8. **WHEN** adjustment is created **THEN** system **SHALL** include notes field for additional context
9. **WHEN** adjustment completed **THEN** system **SHALL** return adjustment record with before/after quantities

#### REQ-7: List Adjustment History

**User Story:** As a finance officer, I want to view all stock adjustments with reasons, so that I can audit inventory discrepancies.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory-adjustments` **THEN** system **SHALL** return paginated list of adjustments
2. **WHEN** `drugId` parameter provided **THEN** system **SHALL** filter by drug
3. **WHEN** `locationId` parameter provided **THEN** system **SHALL** filter by location
4. **WHEN** `fromDate` and `toDate` parameters provided **THEN** system **SHALL** filter by date range
5. **WHEN** adjustments returned **THEN** system **SHALL** include drug details, location details, adjustment type, quantity, reason
6. **WHEN** adjustments returned **THEN** system **SHALL** include user who created adjustment
7. **WHEN** adjustments returned **THEN** system **SHALL** order by created_at descending (newest first)

#### REQ-8: Update Min/Max Levels

**User Story:** As an inventory manager, I want to set minimum and maximum stock levels for drugs, so that the system can alert me when reordering is needed.

##### Acceptance Criteria

1. **WHEN** user calls `PUT /api/inventory/operations/inventory/:id/min-max` **THEN** system **SHALL** validate that inventory record exists
2. **WHEN** min_level > max_level **THEN** system **SHALL** return 400 error "Min level cannot exceed max level"
3. **WHEN** reorder_point provided **AND** (reorder_point < min_level OR reorder_point > max_level) **THEN** system **SHALL** return 400 error "Reorder point must be between min and max levels"
4. **WHEN** levels updated **THEN** system **SHALL** update inventory record with new min_level, max_level, reorder_point
5. **WHEN** levels updated **THEN** system **SHALL** record update timestamp and user
6. **WHEN** quantity_on_hand <= new min_level **THEN** system **SHALL** include warning in response

#### REQ-9: Stock Transfer Between Locations

**User Story:** As a warehouse supervisor, I want to transfer stock between locations, so that I can balance inventory across hospital departments.

##### Acceptance Criteria

1. **WHEN** user calls `POST /api/inventory/operations/inventory-transfers` **THEN** system **SHALL** validate source and destination locations exist
2. **WHEN** source and destination are same **THEN** system **SHALL** return 400 error "Cannot transfer to same location"
3. **WHEN** transfer created **THEN** system **SHALL** check source location has sufficient quantity
4. **IF** insufficient quantity at source **THEN** system **SHALL** return 400 error `INSUFFICIENT_STOCK`
5. **WHEN** transfer created **THEN** system **SHALL** use FIFO logic to select lots from source using `get_fifo_lots()` function
6. **WHEN** transfer created **THEN** system **SHALL** deduct quantity from source inventory
7. **WHEN** transfer created **THEN** system **SHALL** add quantity to destination inventory (create if not exists)
8. **WHEN** transfer created **THEN** system **SHALL** create new lots at destination with same lot numbers and expiry dates
9. **WHEN** transfer created **THEN** system **SHALL** create two transaction records: TRANSFER_OUT at source, TRANSFER_IN at destination
10. **WHEN** transfer created **THEN** system **SHALL** link transaction records via reference_id
11. **WHEN** any step fails **THEN** system **SHALL** rollback all changes atomically

### Phase 3: Reporting & Alerts (Week 3)

#### REQ-10: Get Low Stock Items

**User Story:** As a procurement officer, I want to see all items below reorder point, so that I can create purchase requests proactively.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory/low-stock` **THEN** system **SHALL** return items where `quantity_on_hand <= reorder_point`
2. **WHEN** `locationId` parameter provided **THEN** system **SHALL** filter by location
3. **WHEN** `urgency=CRITICAL` parameter provided **THEN** system **SHALL** filter items where `quantity_on_hand < min_level`
4. **WHEN** `urgency=LOW` parameter provided **THEN** system **SHALL** filter items where `quantity_on_hand <= reorder_point` but `>= min_level`
5. **WHEN** low stock items returned **THEN** system **SHALL** include drug details, current stock, min/max levels, reorder quantity
6. **WHEN** low stock items returned **THEN** system **SHALL** calculate days of supply based on 90-day average usage
7. **WHEN** low stock items returned **THEN** system **SHALL** calculate suggested order quantity (max_level - quantity_on_hand)
8. **WHEN** low stock items returned **THEN** system **SHALL** include last received date
9. **WHEN** low stock items returned **THEN** system **SHALL** include summary: critical items count, low items count, total value needed

#### REQ-11: Get Transaction History

**User Story:** As an auditor, I want to view complete transaction history for a drug, so that I can trace all stock movements for compliance.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory-transactions` **THEN** system **SHALL** return paginated transaction list
2. **WHEN** `inventoryId` parameter provided **THEN** system **SHALL** filter by inventory record
3. **WHEN** `drugId` and `locationId` parameters provided **THEN** system **SHALL** filter by drug/location combination
4. **WHEN** `transactionType` parameter provided **THEN** system **SHALL** filter by type (RECEIVE, ISSUE, TRANSFER, ADJUST, RETURN)
5. **WHEN** `fromDate` and `toDate` parameters provided **THEN** system **SHALL** filter by date range
6. **WHEN** transactions returned **THEN** system **SHALL** include transaction type, quantity (+ or -), unit cost, reference info
7. **WHEN** transactions returned **THEN** system **SHALL** include user who created transaction
8. **WHEN** transactions returned **THEN** system **SHALL** order by created_at descending (newest first)
9. **WHEN** transactions returned **THEN** system **SHALL** include drug and location details for context

#### REQ-12: Get Stock Valuation Report

**User Story:** As a finance manager, I want to see inventory valuation by location, so that I can report asset values for financial statements.

##### Acceptance Criteria

1. **WHEN** user calls `GET /api/inventory/operations/inventory/valuation` **THEN** system **SHALL** calculate total value per location using `quantity_on_hand × average_cost`
2. **WHEN** `locationId` parameter provided **THEN** system **SHALL** filter to specific location
3. **WHEN** `asOfDate` parameter provided **THEN** system **SHALL** calculate valuation as of that date (from transaction history)
4. **WHEN** `asOfDate` not provided **THEN** system **SHALL** use current stock levels
5. **WHEN** valuation returned **THEN** system **SHALL** group by location with subtotals
6. **WHEN** valuation returned **THEN** system **SHALL** include drug count, total quantity, total value per location
7. **WHEN** valuation returned **THEN** system **SHALL** include grand totals across all locations
8. **WHEN** valuation returned **THEN** system **SHALL** support export to CSV/Excel format

## Workflow Requirements

### WF-1: Stock Receipt from Procurement

**User Story:** As the system, I want to automatically update inventory when a receipt is posted in Procurement, so that stock levels are accurate without manual entry.

#### Acceptance Criteria

1. **WHEN** Procurement API posts receipt **THEN** system **SHALL** be notified via `update_inventory_from_receipt(receipt_id)` database function
2. **WHEN** receipt posted **THEN** system **SHALL** create or update inventory record for each receipt item
3. **WHEN** receipt posted **THEN** system **SHALL** create drug lot with lot number, expiry date, quantity, and unit cost
4. **WHEN** receipt posted **THEN** system **SHALL** calculate new weighted average cost: `(old_qty × old_cost + new_qty × new_cost) / total_qty`
5. **WHEN** receipt posted **THEN** system **SHALL** update last_cost to most recent receipt unit price
6. **WHEN** receipt posted **THEN** system **SHALL** create inventory transaction record with type RECEIVE
7. **WHEN** receipt posted **THEN** system **SHALL** execute all operations in single atomic transaction
8. **IF** any step fails **THEN** system **SHALL** rollback all changes and return error to Procurement API

### WF-2: FIFO/FEFO Dispensing to Distribution

**User Story:** As the system, I want to automatically select lots using FIFO or FEFO logic when Distribution requests stock, so that proper drug rotation is enforced.

#### Acceptance Criteria

1. **WHEN** Distribution API requests stock **THEN** system **SHALL** call `get_fifo_lots(drug_id, location_id, quantity_needed)` function
2. **WHEN** FEFO mode configured for drug **THEN** system **SHALL** call `get_fefo_lots()` instead
3. **WHEN** lots selected **THEN** system **SHALL** deduct quantity from each lot in order until quantity fulfilled
4. **WHEN** lot depleted (quantity_available = 0) **THEN** system **SHALL** set lot `is_active = FALSE`
5. **WHEN** lots updated **THEN** system **SHALL** reduce inventory `quantity_on_hand`
6. **WHEN** dispensing complete **THEN** system **SHALL** create inventory transaction record with type ISSUE
7. **WHEN** dispensing complete **THEN** system **SHALL** return dispensed lot details to Distribution API
8. **IF** insufficient stock **THEN** system **SHALL** return error without partial dispensing

### WF-3: Expiry Management Workflow

**User Story:** As the system, I want to automatically identify and quarantine expiring drugs, so that expired medications are not dispensed to patients.

#### Acceptance Criteria

1. **WHEN** daily scheduled job runs at 8:00 AM **THEN** system **SHALL** query lots expiring within 180 days
2. **WHEN** lots expiring within 180-90 days found **THEN** system **SHALL** create INFO level alerts
3. **WHEN** lots expiring within 90-30 days found **THEN** system **SHALL** create WARNING level alerts
4. **WHEN** lots expiring within 30 days found **THEN** system **SHALL** create CRITICAL level alerts and block dispensing
5. **WHEN** expired lots found **THEN** system **SHALL** automatically transfer to QUARANTINE location
6. **WHEN** expired lot transferred **THEN** system **SHALL** set lot `is_active = FALSE`
7. **WHEN** expired lot transferred **THEN** system **SHALL** create TRANSFER transaction to quarantine
8. **WHEN** expiry alerts created **THEN** system **SHALL** send notifications to pharmacy managers

## Integration Requirements

### INT-1: Procurement Integration

1. System **SHALL** provide database function `update_inventory_from_receipt(receipt_id)` callable from Procurement API
2. Function **SHALL** handle all inventory updates, lot creation, and transaction logging atomically
3. Function **SHALL** return boolean success/failure status
4. System **SHALL** validate receipt items reference valid drugs and locations before processing

### INT-2: Distribution Integration

1. System **SHALL** provide API endpoint for stock availability check before distribution creation
2. System **SHALL** provide database functions `get_fifo_lots()` and `get_fefo_lots()` for lot selection
3. System **SHALL** allow Distribution API to specify preferred dispensing method (FIFO or FEFO)
4. System **SHALL** validate requested quantity does not exceed available stock

### INT-3: Budget Integration

1. System **SHALL** provide inventory valuation data for budget planning
2. System **SHALL** support reorder point calculations for automatic PR generation
3. System **SHALL** provide average cost data for budget allocation by drug category

### INT-4: Master Data Integration

1. System **SHALL** validate all drug_id references exist in `inventory.drugs` table
2. System **SHALL** validate all location_id references exist in `inventory.locations` table
3. System **SHALL** enforce foreign key constraints for data integrity

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each service file handles one domain entity (inventory, drug_lots, transactions)
- **Modular Design**: Separate controllers, services, and repositories with clear boundaries
- **Dependency Management**: Use dependency injection for database, logger, and external services
- **Clear Interfaces**: Define TypeBox schemas for all request/response contracts
- **Domain-Driven Design**: Organize code in `apps/api/src/layers/inventory/operations` domain

### Performance

1. Stock level queries **SHALL** return results within 500ms for up to 10,000 inventory records
2. FIFO/FEFO lot selection **SHALL** execute within 200ms using database function optimization
3. Receipt posting workflow **SHALL** complete within 2 seconds for receipts with up to 50 line items
4. Expiry check job **SHALL** process 100,000 lots within 5 minutes
5. Database queries **SHALL** use appropriate indexes on `drug_id`, `location_id`, `expiry_date`, `received_date`

### Security

1. All endpoints **SHALL** require JWT authentication
2. All endpoints **SHALL** implement role-based access control (RBAC):
   - **ADMIN**: Full access to all endpoints
   - **PHARMACIST**: Read stock, create adjustments, view transactions
   - **INVENTORY_STAFF**: Read stock, create adjustments, transfers
   - **DEPARTMENT_USER**: Read stock only for authorized locations
   - **VIEWER**: Read-only access to stock levels
3. Adjustment creation **SHALL** log user ID for audit trail
4. Transfer operations **SHALL** verify user has access to both source and destination locations
5. Sensitive operations **SHALL** implement rate limiting (100 requests per minute per user)

### Reliability

1. All stock movement operations **SHALL** use database transactions with rollback on failure
2. Receipt posting **SHALL** implement idempotency to prevent duplicate lot creation
3. System **SHALL** implement retry logic for transient database connection failures (max 3 retries)
4. System **SHALL** log all errors with correlation IDs for troubleshooting
5. System **SHALL** validate all input data using TypeBox schemas before processing

### Data Integrity

1. Inventory `quantity_on_hand` **SHALL** never be negative
2. Lot `quantity_available` **SHALL** never exceed `quantity_received`
3. All inventory transactions **SHALL** be immutable (no updates or deletes)
4. FIFO/FEFO lot selection **SHALL** use database functions to ensure atomic updates
5. Average cost calculations **SHALL** use DECIMAL type to prevent rounding errors

### Monitoring and Logging

1. System **SHALL** log all stock movements with timestamp, user, and reference
2. System **SHALL** track API endpoint performance metrics (response time, error rate)
3. System **SHALL** alert administrators when error rate exceeds 5% over 5-minute window
4. System **SHALL** provide health check endpoint for monitoring tools
5. System **SHALL** log expiry check job results with counts of processed/alerted lots

### Scalability

1. System **SHALL** support horizontal scaling with stateless API design
2. Database connection pool **SHALL** support minimum 20 concurrent connections
3. System **SHALL** implement pagination for all list endpoints (default 50, max 200 records)
4. System **SHALL** cache frequently accessed master data (drugs, locations) for 5 minutes
5. System **SHALL** support future sharding by location_id for multi-hospital deployments

## Success Criteria

1. All 12 API endpoints implemented with 100% test coverage
2. All 5 workflows functional with integration tests
3. FIFO/FEFO logic verified with lot rotation tests
4. Receipt posting workflow completes in < 2 seconds
5. Stock query performance < 500ms for 10,000 records
6. Zero negative stock incidents in production
7. Complete audit trail for all stock movements
8. Expiry management reduces drug waste by 30%
9. API documentation complete with OpenAPI/Swagger specs
10. All role-based access controls functional and tested
