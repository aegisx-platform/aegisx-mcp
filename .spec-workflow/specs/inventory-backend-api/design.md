# Design Document - Inventory Backend API

## Overview

The Inventory Backend API implements a comprehensive drug inventory management system with real-time stock tracking, FIFO/FEFO lot management, and complete audit trails. The system is designed following domain-driven design principles, implementing the `inventory/operations` domain with three core entities and twelve RESTful endpoints.

**Key Design Principles:**

- **API-First Development**: Complete API specification before implementation
- **Domain-Driven Design**: Operations domain with clear bounded contexts
- **TypeBox Schema Validation**: Type-safe request/response contracts
- **Repository Pattern**: Clean separation of data access from business logic
- **Service Layer**: Centralized business logic and workflow orchestration
- **Immutable Audit Trail**: Transaction log for regulatory compliance
- **Database Functions**: Complex business logic (FIFO/FEFO) in PostgreSQL

## Steering Document Alignment

### Technical Standards (tech.md)

This design follows AegisX platform standards:

1. **Fastify Framework**: All endpoints use Fastify with TypeBox schema validation
2. **Layered Architecture**: Repository → Service → Controller → Routes pattern
3. **TypeScript Strict Mode**: Full type safety across all layers
4. **BaseRepository Pattern**: Extends platform BaseRepository for CRUD operations
5. **Authentication**: JWT-based authentication via `fastify.authenticate` hook
6. **Authorization**: RBAC via `fastify.verifyPermission` hook
7. **Error Handling**: Standardized AppError with error codes
8. **Logging**: Structured logging with correlation IDs
9. **WebSocket Events**: Real-time updates via EventService
10. **Database**: PostgreSQL with Knex query builder

### Project Structure (structure.md)

Implementation follows project organization conventions:

```
apps/api/src/layers/inventory/operations/
├── inventory/
│   ├── inventory.repository.ts
│   ├── inventory.service.ts
│   ├── inventory.controller.ts
│   ├── inventory.routes.ts
│   ├── inventory.schemas.ts
│   ├── inventory.types.ts
│   ├── index.ts
│   └── __tests__/
│       ├── inventory.repository.spec.ts
│       ├── inventory.service.spec.ts
│       └── inventory.controller.spec.ts
├── drug-lots/
│   ├── drug-lots.repository.ts
│   ├── drug-lots.service.ts
│   ├── drug-lots.controller.ts
│   ├── drug-lots.routes.ts
│   ├── drug-lots.schemas.ts
│   ├── drug-lots.types.ts
│   ├── index.ts
│   └── __tests__/
├── inventory-transactions/
│   ├── inventory-transactions.repository.ts
│   ├── inventory-transactions.service.ts
│   ├── inventory-transactions.controller.ts
│   ├── inventory-transactions.routes.ts
│   ├── inventory-transactions.schemas.ts
│   ├── inventory-transactions.types.ts
│   ├── index.ts
│   └── __tests__/
├── inventory-adjustments/
│   ├── inventory-adjustments.service.ts
│   ├── inventory-adjustments.controller.ts
│   ├── inventory-adjustments.routes.ts
│   ├── inventory-adjustments.schemas.ts
│   └── __tests__/
├── inventory-transfers/
│   ├── inventory-transfers.service.ts
│   ├── inventory-transfers.controller.ts
│   ├── inventory-transfers.routes.ts
│   ├── inventory-transfers.schemas.ts
│   └── __tests__/
└── workflows/
    ├── receipt-posting.workflow.ts
    ├── fifo-dispensing.workflow.ts
    ├── expiry-management.workflow.ts
    └── __tests__/
```

**Database Schema**: `inventory` (separate schema from `public`)

**Migration Path**: `apps/api/src/database/migrations-inventory/`

## Code Reuse Analysis

### Existing Components to Leverage

1. **BaseRepository** (`shared/repositories/base.repository.ts`)
   - **Usage**: All repositories extend BaseRepository for standard CRUD operations
   - **Features**: Automatic pagination, filtering, sorting, field selection, search
   - **Benefits**: Reduces boilerplate, ensures consistent query patterns

2. **BaseService** (`shared/services/base.service.ts`)
   - **Usage**: All services extend BaseService for common operations
   - **Features**: getById, getList, create, update, delete with validation
   - **Benefits**: Centralized business logic patterns, error handling

3. **EventService** (`shared/websocket/event.service.ts`)
   - **Usage**: Real-time WebSocket notifications for inventory changes
   - **Features**: CRUD event helper, room-based broadcasting
   - **Benefits**: Automatic frontend updates on stock changes

4. **AppError** (`core/errors/app-error.ts`)
   - **Usage**: Standardized error responses with error codes
   - **Features**: HTTP status mapping, localized error messages
   - **Benefits**: Consistent error handling across all endpoints

5. **TypeBox Base Schemas** (`schemas/base.schemas.ts`)
   - **Usage**: Pagination, sorting, filtering query schemas
   - **Features**: ApiSuccessResponseSchema, PaginatedResponseSchema
   - **Benefits**: Reusable schema patterns, OpenAPI documentation

6. **Authentication Hooks** (`core/auth/hooks/`)
   - **Usage**: fastify.authenticate, fastify.verifyPermission
   - **Features**: JWT validation, RBAC enforcement
   - **Benefits**: Secured endpoints with minimal configuration

7. **Response Helpers** (`core/response/response-helper.ts`)
   - **Usage**: reply.paginated(), reply.success(), reply.error()
   - **Features**: Standardized response formats
   - **Benefits**: Consistent API responses

### Integration Points

1. **Procurement API Integration**
   - **Endpoint**: Receipt posting triggers inventory update
   - **Method**: Database function `update_inventory_from_receipt(receipt_id)`
   - **Data Flow**: Receipt items → Create lots → Update inventory → Create transactions
   - **Error Handling**: Atomic transaction with rollback on failure

2. **Distribution API Integration**
   - **Endpoint**: Stock dispensing requests
   - **Method**: Database functions `get_fifo_lots()`, `get_fefo_lots()`
   - **Data Flow**: Distribution request → Select lots → Deduct quantity → Update transactions
   - **Error Handling**: Validate stock availability before dispensing

3. **Budget API Integration**
   - **Endpoint**: Inventory valuation for budget planning
   - **Method**: Service-to-service API call
   - **Data Flow**: Calculate stock value → Provide to budget allocation
   - **Error Handling**: Graceful degradation if Budget API unavailable

4. **Master Data Tables**
   - **Tables**: `inventory.drugs`, `inventory.locations`
   - **Method**: Foreign key references with validation
   - **Data Flow**: Validate drug_id and location_id exist before operations
   - **Error Handling**: Return 404 if master data not found

5. **Database Schema**
   - **Schema**: `inventory` (separate from `public`)
   - **Tables**: `inventory.inventory`, `inventory.drug_lots`, `inventory.inventory_transactions`
   - **Functions**: `inventory.get_fifo_lots()`, `inventory.get_fefo_lots()`, `inventory.update_inventory_from_receipt()`
   - **Views**: `inventory.low_stock_items`, `inventory.expiring_drugs`

## Architecture

### Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Frontend Application]
    end

    subgraph "API Layer - Fastify"
        Routes[Routes + Schemas]
        Auth[Authentication Hook]
        RBAC[Authorization Hook]
        Controller[Controllers]
    end

    subgraph "Business Logic Layer"
        Service[Services]
        Workflow[Workflows]
        Validation[Validation Logic]
    end

    subgraph "Data Access Layer"
        Repository[Repositories]
        DBFunctions[Database Functions]
    end

    subgraph "Database - PostgreSQL"
        Tables[(Tables:<br/>inventory<br/>drug_lots<br/>inventory_transactions)]
        Functions[(Functions:<br/>get_fifo_lots<br/>get_fefo_lots<br/>update_inventory_from_receipt)]
    end

    subgraph "External Systems"
        Procurement[Procurement API]
        Distribution[Distribution API]
        MasterData[Master Data]
    end

    UI -->|HTTP/WebSocket| Routes
    Routes --> Auth
    Auth --> RBAC
    RBAC --> Controller
    Controller --> Service
    Service --> Validation
    Service --> Workflow
    Service --> Repository
    Repository --> Tables
    Workflow --> DBFunctions
    DBFunctions --> Tables
    DBFunctions --> Functions

    Procurement -->|Receipt Posted| Workflow
    Distribution -->|Request Stock| Workflow
    Repository -->|Validate| MasterData
```

### Modular Design Principles

1. **Single File Responsibility**:
   - Each repository handles one table's data access
   - Each service handles one entity's business logic
   - Each controller handles one resource's HTTP operations

2. **Component Isolation**:
   - Repositories are independent and reusable
   - Services can be tested without database
   - Controllers are thin HTTP adapters

3. **Service Layer Separation**:
   - **Repository**: Pure data access, no business logic
   - **Service**: Business rules, validation, workflow orchestration
   - **Controller**: HTTP request/response handling only

4. **Utility Modularity**:
   - FIFO/FEFO logic in database functions (reusable across services)
   - Cost calculation utilities (weighted average)
   - Date/time utilities for expiry calculations

### Layer Responsibilities

#### Repository Layer

- Database query construction
- Entity transformation (DB row ↔ Entity)
- Basic CRUD operations
- Query optimization (indexes, joins)

#### Service Layer

- Business rule enforcement
- Multi-step workflows
- Cross-entity operations
- Error handling and validation

#### Controller Layer

- Request parsing and validation
- Response formatting
- HTTP status code mapping
- WebSocket event emission

#### Workflow Layer

- Complex multi-step processes
- Integration with external systems
- Transaction management
- Error recovery

## Components and Interfaces

### Component 1: InventoryRepository

**Purpose:** Manages database operations for inventory table

**File:** `inventory/inventory.repository.ts`

**Extends:** `BaseRepository<Inventory, CreateInventory, UpdateInventory>`

**Interfaces:**

```typescript
class InventoryRepository extends BaseRepository<Inventory, CreateInventory, UpdateInventory> {
  constructor(knex: Knex);

  // Inherited from BaseRepository
  findById(id: string | number): Promise<Inventory | null>;
  findMany(query: ListInventoryQuery): Promise<PaginatedListResult<Inventory>>;
  create(data: CreateInventory): Promise<Inventory>;
  update(id: string | number, data: UpdateInventory): Promise<Inventory>;
  delete(id: string | number): Promise<boolean>;

  // Custom methods
  findByDrugAndLocation(drugId: bigint, locationId: bigint): Promise<Inventory | null>;
  findLowStock(locationId?: bigint): Promise<Inventory[]>;
  getStockValuation(locationId?: bigint): Promise<StockValuationResult>;
  updateQuantity(id: bigint, quantity: number, operation: 'add' | 'subtract'): Promise<Inventory>;
  recalculateAverageCost(id: bigint): Promise<Inventory>;
}
```

**Dependencies:**

- Knex (database client)
- BaseRepository

**Reuses:**

- BaseRepository for standard CRUD
- Query builder from BaseRepository
- Pagination logic from BaseRepository

---

### Component 2: InventoryService

**Purpose:** Business logic for inventory management

**File:** `inventory/inventory.service.ts`

**Extends:** `BaseService<Inventory, CreateInventory, UpdateInventory>`

**Interfaces:**

```typescript
class InventoryService extends BaseService<Inventory, CreateInventory, UpdateInventory> {
  constructor(
    private inventoryRepository: InventoryRepository,
    private drugLotsRepository: DrugLotsRepository
  )

  // Inherited from BaseService
  getById(id: string | number): Promise<Inventory | null>
  getList(query: ListInventoryQuery): Promise<PaginatedListResult<Inventory>>
  create(data: CreateInventory): Promise<Inventory>
  update(id: string | number, data: UpdateInventory): Promise<Inventory>
  delete(id: string | number): Promise<boolean>

  // Stock inquiry methods
  getStockLevel(drugId: bigint, locationId: bigint): Promise<StockLevelDetails>
  getLowStockItems(query: LowStockQuery): Promise<LowStockItem[]>
  getStockValuation(query: ValuationQuery): Promise<StockValuationReport>

  // Stock management methods
  updateMinMaxLevels(id: bigint, data: MinMaxUpdate): Promise<Inventory>

  // Validation methods
  validateStockAvailability(drugId: bigint, locationId: bigint, quantity: number): Promise<boolean>
  calculateStockStatus(inventory: Inventory): StockStatus
  calculateDaysOfSupply(inventory: Inventory): number
}
```

**Dependencies:**

- InventoryRepository
- DrugLotsRepository
- AppError for business rule violations

**Reuses:**

- BaseService for standard operations
- Error handling patterns from AppError

---

### Component 3: InventoryController

**Purpose:** HTTP request handling for inventory endpoints

**File:** `inventory/inventory.controller.ts`

**Interfaces:**

```typescript
class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private eventService: EventService
  )

  // Phase 1: Stock Inquiry
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void>
  async getByDrugLocation(request: FastifyRequest, reply: FastifyReply): Promise<void>
  async getLowStock(request: FastifyRequest, reply: FastifyReply): Promise<void>
  async getValuation(request: FastifyRequest, reply: FastifyReply): Promise<void>

  // Phase 2: Stock Management
  async updateMinMax(request: FastifyRequest, reply: FastifyReply): Promise<void>
}
```

**Dependencies:**

- InventoryService
- EventService (WebSocket)
- FastifyRequest/FastifyReply

**Reuses:**

- reply.paginated() helper
- reply.success() helper
- CrudEventHelper for WebSocket

---

### Component 4: DrugLotsRepository

**Purpose:** Manages database operations for drug_lots table

**File:** `drug-lots/drug-lots.repository.ts`

**Extends:** `BaseRepository<DrugLot, CreateDrugLot, UpdateDrugLot>`

**Interfaces:**

```typescript
class DrugLotsRepository extends BaseRepository<DrugLot, CreateDrugLot, UpdateDrugLot> {
  constructor(knex: Knex);

  // Custom methods
  findByDrugAndLocation(drugId: bigint, locationId: bigint, orderBy: 'FIFO' | 'FEFO'): Promise<DrugLot[]>;
  findExpiringLots(daysThreshold: number, locationId?: bigint): Promise<DrugLot[]>;
  findByLotNumber(drugId: bigint, locationId: bigint, lotNumber: string): Promise<DrugLot | null>;
  updateQuantityAvailable(id: bigint, quantity: number, operation: 'add' | 'subtract'): Promise<DrugLot>;
  deactivateLot(id: bigint): Promise<DrugLot>;

  // Database function wrappers
  getFifoLots(drugId: bigint, locationId: bigint, quantityNeeded: number): Promise<FifoLotResult[]>;
  getFefoLots(drugId: bigint, locationId: bigint, quantityNeeded: number): Promise<FefoLotResult[]>;
}
```

**Dependencies:**

- Knex
- BaseRepository
- Database functions (get_fifo_lots, get_fefo_lots)

**Reuses:**

- BaseRepository for CRUD
- Query builder patterns

---

### Component 5: DrugLotsService

**Purpose:** Business logic for lot management

**File:** `drug-lots/drug-lots.service.ts`

**Extends:** `BaseService<DrugLot, CreateDrugLot, UpdateDrugLot>`

**Interfaces:**

```typescript
class DrugLotsService extends BaseService<DrugLot, CreateDrugLot, UpdateDrugLot> {
  constructor(private drugLotsRepository: DrugLotsRepository)

  // Lot inquiry methods
  getLotsByDrug(drugId: bigint, locationId: bigint, orderBy: 'FIFO' | 'FEFO'): Promise<DrugLot[]>
  getExpiringLots(query: ExpiringLotsQuery): Promise<ExpiringLotsReport>
  getLotDetails(id: bigint): Promise<LotDetailsWithCalculations>

  // Lot management methods
  createLotFromReceipt(receiptItem: ReceiptItem): Promise<DrugLot>
  deductLotQuantity(lotId: bigint, quantity: number): Promise<DrugLot>

  // Validation methods
  validateLotNotExpired(lot: DrugLot): boolean
  validateLotActive(lot: DrugLot): boolean
  calculateExpiryStatus(expiryDate: Date): ExpiryStatus
  calculateDaysUntilExpiry(expiryDate: Date): number
}
```

**Dependencies:**

- DrugLotsRepository
- AppError

**Reuses:**

- BaseService patterns
- Date utilities

---

### Component 6: InventoryTransactionsRepository

**Purpose:** Manages immutable transaction log

**File:** `inventory-transactions/inventory-transactions.repository.ts`

**Extends:** `BaseRepository<InventoryTransaction, CreateInventoryTransaction, never>` (no updates!)

**Interfaces:**

```typescript
class InventoryTransactionsRepository extends BaseRepository<InventoryTransaction, CreateInventoryTransaction, never> {
  constructor(knex: Knex);

  // Override to prevent updates (immutable log)
  update(): Promise<never> {
    throw new Error('Inventory transactions are immutable');
  }

  delete(): Promise<never> {
    throw new Error('Inventory transactions cannot be deleted');
  }

  // Custom query methods
  findByInventory(inventoryId: bigint, query: TransactionQuery): Promise<PaginatedListResult<InventoryTransaction>>;
  findByDrugAndLocation(drugId: bigint, locationId: bigint, query: TransactionQuery): Promise<PaginatedListResult<InventoryTransaction>>;
  findByReference(referenceId: bigint, referenceType: string): Promise<InventoryTransaction[]>;
  getTransactionHistory(query: HistoryQuery): Promise<PaginatedListResult<InventoryTransaction>>;
}
```

**Dependencies:**

- Knex
- BaseRepository

**Reuses:**

- BaseRepository for read operations
- Query builder for filtering

---

### Component 7: InventoryAdjustmentsService

**Purpose:** Handles stock adjustments with validation

**File:** `inventory-adjustments/inventory-adjustments.service.ts`

**Interfaces:**

```typescript
class InventoryAdjustmentsService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private drugLotsRepository: DrugLotsRepository,
    private transactionsRepository: InventoryTransactionsRepository,
    private knex: Knex
  )

  async createAdjustment(data: CreateAdjustment, userId: string): Promise<AdjustmentResult>
  async getAdjustmentHistory(query: AdjustmentHistoryQuery): Promise<PaginatedListResult<AdjustmentRecord>>

  // Private helper methods
  private validateAdjustment(data: CreateAdjustment): Promise<void>
  private updateInventoryQuantity(inventoryId: bigint, quantity: number, type: 'ADD' | 'SUBTRACT'): Promise<void>
  private adjustLotQuantities(drugId: bigint, locationId: bigint, variance: number): Promise<void>
  private createAdjustmentTransaction(data: TransactionData): Promise<InventoryTransaction>
}
```

**Dependencies:**

- InventoryRepository
- DrugLotsRepository
- InventoryTransactionsRepository
- Knex (for transactions)

**Reuses:**

- Transaction management patterns
- Validation utilities

---

### Component 8: InventoryTransfersService

**Purpose:** Handles stock transfers between locations

**File:** `inventory-transfers/inventory-transfers.service.ts`

**Interfaces:**

```typescript
class InventoryTransfersService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private drugLotsRepository: DrugLotsRepository,
    private transactionsRepository: InventoryTransactionsRepository,
    private knex: Knex
  )

  async createTransfer(data: CreateTransfer, userId: string): Promise<TransferResult>
  async getTransferHistory(query: TransferHistoryQuery): Promise<PaginatedListResult<TransferRecord>>

  // Private helper methods
  private validateTransfer(data: CreateTransfer): Promise<void>
  private selectLotsForTransfer(drugId: bigint, fromLocationId: bigint, quantity: number): Promise<FifoLotResult[]>
  private deductFromSourceLocation(data: DeductData): Promise<void>
  private addToDestinationLocation(data: AddData): Promise<void>
  private createLotAtDestination(lot: FifoLotResult, destinationLocationId: bigint): Promise<DrugLot>
  private createTransferTransactions(data: TransferTransactionData): Promise<void>
}
```

**Dependencies:**

- InventoryRepository
- DrugLotsRepository
- InventoryTransactionsRepository
- Knex
- Database function (get_fifo_lots)

**Reuses:**

- FIFO lot selection from database function
- Transaction patterns

---

### Component 9: ReceiptPostingWorkflow

**Purpose:** Automates inventory update from receipt posting

**File:** `workflows/receipt-posting.workflow.ts`

**Interfaces:**

```typescript
class ReceiptPostingWorkflow {
  constructor(
    private inventoryRepository: InventoryRepository,
    private drugLotsRepository: DrugLotsRepository,
    private transactionsRepository: InventoryTransactionsRepository,
    private knex: Knex
  )

  // Main workflow method (called by database function)
  async processReceipt(receiptId: bigint): Promise<boolean>

  // Private workflow steps
  private fetchReceiptData(receiptId: bigint): Promise<ReceiptData>
  private processReceiptItem(item: ReceiptItem, receipt: Receipt): Promise<void>
  private createOrUpdateInventory(data: InventoryData): Promise<Inventory>
  private createDrugLot(data: LotData): Promise<DrugLot>
  private calculateAverageCost(current: Inventory, newQty: number, newCost: number): number
  private createReceiveTransaction(data: TransactionData): Promise<InventoryTransaction>
  private rollbackOnError(error: Error): Promise<void>
}
```

**Dependencies:**

- All repositories
- Knex for atomic transactions
- Receipt data from Procurement schema

**Reuses:**

- Transaction management
- Cost calculation utilities

---

### Component 10: FifoDispensingWorkflow

**Purpose:** Automates lot selection and stock deduction for distributions

**File:** `workflows/fifo-dispensing.workflow.ts`

**Interfaces:**

```typescript
class FifoDispensingWorkflow {
  constructor(
    private inventoryRepository: InventoryRepository,
    private drugLotsRepository: DrugLotsRepository,
    private transactionsRepository: InventoryTransactionsRepository,
    private knex: Knex
  )

  // Main workflow methods
  async dispenseFifo(data: DispenseRequest): Promise<DispenseResult>
  async dispenseFefo(data: DispenseRequest): Promise<DispenseResult>

  // Private workflow steps
  private validateStockAvailability(drugId: bigint, locationId: bigint, quantity: number): Promise<void>
  private selectLots(drugId: bigint, locationId: bigint, quantity: number, method: 'FIFO' | 'FEFO'): Promise<FifoLotResult[]>
  private deductFromLots(lots: FifoLotResult[], quantity: number): Promise<LotDeductionResult[]>
  private updateInventoryQuantity(inventoryId: bigint, quantity: number): Promise<void>
  private createIssueTransaction(data: IssueTransactionData): Promise<InventoryTransaction>
  private deactivateDepletedLots(lots: LotDeductionResult[]): Promise<void>
}
```

**Dependencies:**

- All repositories
- Knex
- Database functions (get_fifo_lots, get_fefo_lots)

**Reuses:**

- Database FIFO/FEFO logic
- Transaction patterns

---

### Component 11: ExpiryManagementWorkflow

**Purpose:** Scheduled job for expiry alerts and quarantine

**File:** `workflows/expiry-management.workflow.ts`

**Interfaces:**

```typescript
class ExpiryManagementWorkflow {
  constructor(
    private drugLotsRepository: DrugLotsRepository,
    private transfersService: InventoryTransfersService,
    private notificationService: NotificationService
  )

  // Main workflow method (called by cron job)
  async checkExpiringDrugs(): Promise<ExpiryCheckResult>

  // Private workflow steps
  private findExpiringLots(daysThreshold: number): Promise<DrugLot[]>
  private categorizeByUrgency(lots: DrugLot[]): CategorizedLots
  private sendExpiryAlerts(categorized: CategorizedLots): Promise<void>
  private quarantineExpiredLots(expiredLots: DrugLot[]): Promise<void>
  private generateExpiryReport(): Promise<ExpiryReport>
}
```

**Dependencies:**

- DrugLotsRepository
- InventoryTransfersService
- NotificationService

**Reuses:**

- Transfer logic for quarantine
- Date utilities

## Data Models

### Model 1: Inventory

```typescript
interface Inventory {
  id: bigint; // Primary key
  drug_id: bigint; // FK → inventory.drugs(id)
  location_id: bigint; // FK → inventory.locations(id)
  quantity_on_hand: number; // Current stock quantity (DECIMAL 15,3)
  min_level?: number; // Minimum stock level (alert threshold)
  max_level?: number; // Maximum stock level (overstock threshold)
  reorder_point?: number; // Reorder point (when to purchase)
  average_cost?: number; // Weighted average cost (DECIMAL 15,4)
  last_cost?: number; // Most recent purchase cost
  last_updated?: Date; // Last stock movement timestamp
  created_at: Date;
  updated_at: Date;

  // Computed fields (not in database)
  stock_status?: 'OK' | 'LOW' | 'CRITICAL' | 'OVERSTOCK';
  days_of_supply?: number;
  stock_value?: number;
}

interface CreateInventory {
  drug_id: bigint;
  location_id: bigint;
  quantity_on_hand: number;
  min_level?: number;
  max_level?: number;
  reorder_point?: number;
  average_cost?: number;
  last_cost?: number;
}

interface UpdateInventory {
  quantity_on_hand?: number;
  min_level?: number;
  max_level?: number;
  reorder_point?: number;
  average_cost?: number;
  last_cost?: number;
  last_updated?: Date;
}

// Unique constraint: (drug_id, location_id)
// Business rule: quantity_on_hand >= 0
// Business rule: min_level < reorder_point < max_level (if all specified)
```

### Model 2: DrugLot

```typescript
interface DrugLot {
  id: bigint; // Primary key
  drug_id: bigint; // FK → inventory.drugs(id)
  location_id: bigint; // FK → inventory.locations(id)
  lot_number: string; // Manufacturer lot number (VARCHAR 50)
  expiry_date: Date; // Expiration date
  quantity_available: number; // Remaining quantity in lot (DECIMAL 15,3)
  unit_cost: number; // Cost per unit for this lot (DECIMAL 15,4)
  received_date: Date; // Date lot was received
  receipt_id?: bigint; // FK → procurement.receipts(id)
  is_active: boolean; // FALSE when lot depleted
  created_at: Date;
  updated_at: Date;

  // Computed fields
  is_expired?: boolean;
  days_until_expiry?: number;
  expiry_status?: 'OK' | 'WARN' | 'CRITICAL' | 'EXPIRED';
  dispensed_quantity?: number;
  utilization_percent?: number;
}

interface CreateDrugLot {
  drug_id: bigint;
  location_id: bigint;
  lot_number: string;
  expiry_date: Date;
  quantity_available: number;
  unit_cost: number;
  received_date: Date;
  receipt_id?: bigint;
  is_active?: boolean;
}

interface UpdateDrugLot {
  quantity_available?: number;
  is_active?: boolean;
}

// Unique constraint: (drug_id, location_id, lot_number)
// Business rule: quantity_available >= 0
// Business rule: expiry_date > received_date
// Business rule: is_active = FALSE when quantity_available = 0
```

### Model 3: InventoryTransaction

```typescript
type TransactionType = 'RECEIVE' | 'ISSUE' | 'TRANSFER' | 'ADJUST' | 'RETURN';

interface InventoryTransaction {
  id: bigint; // Primary key
  inventory_id: bigint; // FK → inventory.inventory(id)
  transaction_type: TransactionType;
  quantity: number; // Quantity moved (+ or -, DECIMAL 15,3)
  unit_cost?: number; // Cost per unit (for costing, DECIMAL 15,4)
  reference_id?: bigint; // ID of source document
  reference_type?: string; // Type: receipt, distribution, return, adjustment
  notes?: string; // Transaction notes/reason
  created_by: string; // User who created transaction
  created_at: Date; // Transaction timestamp (immutable)
}

interface CreateInventoryTransaction {
  inventory_id: bigint;
  transaction_type: TransactionType;
  quantity: number;
  unit_cost?: number;
  reference_id?: bigint;
  reference_type?: string;
  notes?: string;
  created_by: string;
}

// IMMUTABLE: No updates or deletes allowed
// Business rule: reference_id + reference_type must be valid
// Business rule: quantity can be positive or negative depending on type
```

### Model 4: FIFO/FEFO Result (Database Function Output)

```typescript
interface FifoLotResult {
  lot_id: bigint;
  lot_number: string;
  quantity: number; // Quantity to dispense from this lot
  unit_cost: number;
}

interface FefoLotResult {
  lot_id: bigint;
  lot_number: string;
  expiry_date: Date;
  quantity: number; // Quantity to dispense from this lot
}
```

### Model 5: Stock Level Details (Computed)

```typescript
interface StockLevelDetails {
  inventory: Inventory;
  drug: {
    drug_code: string;
    trade_name: string;
    unit_price: number;
  };
  location: {
    location_code: string;
    location_name: string;
  };
  stock_status: 'OK' | 'LOW' | 'CRITICAL' | 'OVERSTOCK';
  days_of_supply: number;
  stock_value: number;
  active_lots_count: number;
  oldest_expiry_date?: Date;
}
```

### Model 6: Low Stock Item (Report)

```typescript
interface LowStockItem {
  drug_id: bigint;
  location_id: bigint;
  current_stock: number;
  min_level: number;
  reorder_point: number;
  reorder_quantity: number;
  urgency: 'LOW' | 'CRITICAL';
  drug: {
    drug_code: string;
    trade_name: string;
    unit_price: number;
  };
  location: {
    location_name: string;
  };
  days_of_supply: number;
  average_daily_usage: number;
  suggested_order_quantity: number;
  last_received_date?: Date;
  days_since_last_received?: number;
}
```

## Error Handling

### Error Scenarios

1. **STOCK_NOT_FOUND**
   - **Description**: Inventory record doesn't exist for drug/location combination
   - **HTTP Status**: 404 Not Found
   - **Handling**: Check if inventory.findByDrugAndLocation() returns null
   - **User Impact**: "Stock record not found for this drug at this location"
   - **Recovery**: Create initial inventory record or verify drug/location IDs

2. **INSUFFICIENT_STOCK**
   - **Description**: Requested quantity exceeds available quantity
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Validate quantity_on_hand >= requested_quantity before operation
   - **User Impact**: "Insufficient stock. Available: 500, Requested: 1000"
   - **Recovery**: User reduces requested quantity or transfers from another location

3. **LOT_NOT_FOUND**
   - **Description**: Specified lot ID doesn't exist
   - **HTTP Status**: 404 Not Found
   - **Handling**: Check if drugLotsRepository.findById() returns null
   - **User Impact**: "Lot record not found"
   - **Recovery**: Verify lot ID or search for available lots

4. **LOT_EXPIRED**
   - **Description**: Attempting to use a lot past its expiry date
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Check lot.expiry_date < current_date before dispensing
   - **User Impact**: "Cannot dispense expired lot. Expiry date: 2024-06-01"
   - **Recovery**: Use FEFO to dispense unexpired lots first, quarantine expired lot

5. **LOT_DEPLETED**
   - **Description**: Lot has zero remaining quantity
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Check lot.quantity_available > 0 before deduction
   - **User Impact**: "Lot has no remaining quantity"
   - **Recovery**: Select next FIFO/FEFO lot automatically

6. **NEGATIVE_STOCK**
   - **Description**: Operation would result in negative quantity_on_hand
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Check (current_qty - deduct_qty) >= 0 before update
   - **User Impact**: "Operation would result in negative stock"
   - **Recovery**: Validate calculations, check for concurrent updates

7. **INVALID_ADJUSTMENT_REASON**
   - **Description**: Adjustment reason ID doesn't exist in lookup table
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Validate adjustment_reason_id exists before creating adjustment
   - **User Impact**: "Invalid adjustment reason"
   - **Recovery**: User selects valid reason from dropdown

8. **MIN_MAX_VIOLATION**
   - **Description**: min_level >= max_level or reorder_point outside range
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Validate min < reorder < max before update
   - **User Impact**: "Min level must be less than max level"
   - **Recovery**: User corrects min/max values

9. **TRANSFER_SAME_LOCATION**
   - **Description**: Source and destination locations are identical
   - **HTTP Status**: 400 Bad Request
   - **Handling**: Check from_location_id !== to_location_id
   - **User Impact**: "Cannot transfer to the same location"
   - **Recovery**: User selects different destination

10. **RECEIPT_ALREADY_POSTED**
    - **Description**: Receipt has already been posted to inventory
    - **HTTP Status**: 409 Conflict
    - **Handling**: Check receipt.posted_at IS NOT NULL before processing
    - **User Impact**: "Receipt has already been posted"
    - **Recovery**: Idempotency - return existing result

### Error Response Format

All errors follow standardized format:

```typescript
{
  success: false,
  error: {
    code: "INSUFFICIENT_STOCK",
    message: "Insufficient stock. Available: 500, Requested: 1000",
    details: {
      drug_id: 1,
      location_id: 2,
      requested: 1000,
      available: 500,
      shortage: 500
    },
    timestamp: "2025-12-14T13:30:00Z",
    correlationId: "abc123"
  }
}
```

## Testing Strategy

### Unit Testing

**Tool**: Vitest

**Coverage Target**: 80% minimum

**Key Components to Test**:

1. **Repository Tests** (`*.repository.spec.ts`)
   - Test data transformation (DB row ↔ Entity)
   - Test query building with filters, sorting, pagination
   - Test custom methods (findByDrugAndLocation, getFifoLots)
   - Mock Knex for database operations

2. **Service Tests** (`*.service.spec.ts`)
   - Test business logic in isolation
   - Test validation rules (min < reorder < max)
   - Test error handling (INSUFFICIENT_STOCK)
   - Test calculations (average cost, days of supply)
   - Mock repositories

3. **Controller Tests** (`*.controller.spec.ts`)
   - Test request parsing and validation
   - Test response formatting
   - Test error responses (400, 404, 500)
   - Mock services

**Example Test Structure**:

```typescript
describe('InventoryService', () => {
  let service: InventoryService;
  let mockRepository: MockInventoryRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new InventoryService(mockRepository);
  });

  describe('validateStockAvailability', () => {
    it('should return true when stock is sufficient', async () => {
      mockRepository.findByDrugAndLocation.mockResolvedValue({
        id: 1n,
        quantity_on_hand: 1000,
      });

      const result = await service.validateStockAvailability(1n, 2n, 500);
      expect(result).toBe(true);
    });

    it('should throw INSUFFICIENT_STOCK when quantity exceeds available', async () => {
      mockRepository.findByDrugAndLocation.mockResolvedValue({
        id: 1n,
        quantity_on_hand: 500,
      });

      await expect(service.validateStockAvailability(1n, 2n, 1000)).rejects.toThrow('INSUFFICIENT_STOCK');
    });
  });
});
```

### Integration Testing

**Tool**: Vitest + TestContainers (PostgreSQL)

**Key Flows to Test**:

1. **Receipt Posting Flow**
   - Create receipt in Procurement schema
   - Call update_inventory_from_receipt()
   - Verify inventory created/updated
   - Verify lot created
   - Verify transaction logged

2. **FIFO Dispensing Flow**
   - Create inventory with 3 lots (different received dates)
   - Request stock via get_fifo_lots()
   - Verify lots returned in FIFO order
   - Verify quantities deducted correctly
   - Verify depleted lots deactivated

3. **Stock Adjustment Flow**
   - Create stock adjustment (SUBTRACT 100)
   - Verify inventory quantity reduced
   - Verify transaction created with type ADJUST
   - Verify audit trail intact

4. **Transfer Flow**
   - Create transfer from Location A to Location B
   - Verify source inventory reduced
   - Verify destination inventory increased
   - Verify lots created at destination
   - Verify two transactions created

**Example Integration Test**:

```typescript
describe('Receipt Posting Integration', () => {
  let db: Knex;
  let workflow: ReceiptPostingWorkflow;

  beforeAll(async () => {
    db = await setupTestDatabase();
    workflow = new ReceiptPostingWorkflow(/* ... */);
  });

  it('should create inventory and lot from receipt', async () => {
    // Arrange: Create receipt with items
    const receipt = await createTestReceipt(db, {
      items: [
        {
          drug_id: 1n,
          lot_number: 'LOT2025001',
          expiry_date: '2027-12-31',
          quantity: 1000,
          unit_price: 2.5,
        },
      ],
    });

    // Act: Post receipt
    await workflow.processReceipt(receipt.id);

    // Assert: Verify inventory created
    const inventory = await db('inventory.inventory').where({ drug_id: 1, location_id: 2 }).first();

    expect(inventory.quantity_on_hand).toBe(1000);
    expect(inventory.average_cost).toBe(2.5);

    // Assert: Verify lot created
    const lot = await db('inventory.drug_lots').where({ lot_number: 'LOT2025001' }).first();

    expect(lot.quantity_available).toBe(1000);
    expect(lot.expiry_date).toBe('2027-12-31');

    // Assert: Verify transaction created
    const transaction = await db('inventory.inventory_transactions').where({ inventory_id: inventory.id }).first();

    expect(transaction.transaction_type).toBe('RECEIVE');
    expect(transaction.quantity).toBe(1000);
  });
});
```

### End-to-End Testing

**Tool**: Playwright (via frontend tests)

**User Scenarios to Test**:

1. **Scenario: View Stock Levels**
   - Login as Pharmacist
   - Navigate to Inventory → Stock Levels
   - Filter by location (Central Pharmacy)
   - Verify stock data displayed correctly
   - Verify low stock items highlighted

2. **Scenario: Create Stock Adjustment**
   - Login as Inventory Manager
   - Navigate to Inventory → Adjustments
   - Select drug and location
   - Enter adjustment (SUBTRACT 500)
   - Select reason (Damaged)
   - Submit adjustment
   - Verify success message
   - Verify stock updated on Stock Levels page

3. **Scenario: Transfer Stock Between Locations**
   - Login as Warehouse Supervisor
   - Navigate to Inventory → Transfers
   - Select drug, source (Warehouse), destination (Pharmacy)
   - Enter quantity (1000)
   - Submit transfer
   - Verify success message
   - Verify source stock reduced
   - Verify destination stock increased

**Example E2E Test**:

```typescript
test('pharmacist can view low stock items', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="username"]', 'pharmacist1');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to Low Stock
  await page.goto('/inventory/low-stock');

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Low Stock Items');

  // Verify low stock items displayed
  const items = page.locator('[data-testid="low-stock-item"]');
  await expect(items).toHaveCount.greaterThan(0);

  // Verify critical urgency highlighted
  const criticalItems = page.locator('[data-urgency="CRITICAL"]');
  await expect(criticalItems.first()).toHaveClass(/text-red-600/);

  // Verify reorder quantity suggested
  const firstItem = items.first();
  await expect(firstItem.locator('[data-testid="suggested-qty"]')).toBeVisible();
});
```

## Performance Optimization

### Database Indexes

```sql
-- inventory table
CREATE INDEX idx_inventory_drug ON inventory.inventory(drug_id);
CREATE INDEX idx_inventory_location ON inventory.inventory(location_id);
CREATE INDEX idx_inventory_reorder ON inventory.inventory(reorder_point)
  WHERE quantity_on_hand <= reorder_point;

-- drug_lots table
CREATE INDEX idx_drug_lots_drug ON inventory.drug_lots(drug_id);
CREATE INDEX idx_drug_lots_location ON inventory.drug_lots(location_id);
CREATE INDEX idx_drug_lots_expiry ON inventory.drug_lots(expiry_date)
  WHERE is_active = TRUE;
CREATE INDEX idx_drug_lots_fifo ON inventory.drug_lots(drug_id, location_id, received_date)
  WHERE quantity_available > 0;
CREATE INDEX idx_drug_lots_fefo ON inventory.drug_lots(drug_id, location_id, expiry_date)
  WHERE quantity_available > 0;

-- inventory_transactions table
CREATE INDEX idx_inv_trans_inventory ON inventory.inventory_transactions(inventory_id);
CREATE INDEX idx_inv_trans_type ON inventory.inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_reference ON inventory.inventory_transactions(reference_id, reference_type);
CREATE INDEX idx_inv_trans_created ON inventory.inventory_transactions(created_at DESC);
CREATE INDEX idx_inv_trans_user ON inventory.inventory_transactions(created_by);
```

### Query Optimization

1. **Use Database Functions**: FIFO/FEFO logic in PostgreSQL for better performance
2. **Pagination**: Default limit 50, max 200 records per page
3. **Field Selection**: Support `fields` parameter to reduce data transfer
4. **Eager Loading**: Join drug and location data in single query when needed
5. **Caching**: Cache master data (drugs, locations) for 5 minutes

### Response Time Targets

- Stock list query: < 500ms for 10,000 records
- FIFO/FEFO lot selection: < 200ms
- Receipt posting: < 2 seconds for 50 line items
- Transaction history: < 300ms for 1000 transactions

## Security Considerations

### Authentication & Authorization

All endpoints require:

1. **JWT Authentication**: `fastify.authenticate` hook
2. **RBAC**: `fastify.verifyPermission(resource, action)` hook

**Permission Matrix**:

| Endpoint               | Resource               | Action | Roles                                               |
| ---------------------- | ---------------------- | ------ | --------------------------------------------------- |
| GET /stock             | inventory              | read   | ADMIN, PHARMACIST, INVENTORY_STAFF, DEPARTMENT_USER |
| PUT /stock/:id/min-max | inventory              | update | ADMIN, PHARMACIST, INVENTORY_STAFF                  |
| POST /adjustments      | inventory_adjustments  | create | ADMIN, PHARMACIST, INVENTORY_STAFF                  |
| GET /adjustments       | inventory_adjustments  | read   | ADMIN, PHARMACIST, INVENTORY_STAFF                  |
| POST /transfers        | inventory_transfers    | create | ADMIN, INVENTORY_STAFF                              |
| GET /low-stock         | inventory              | read   | ADMIN, PHARMACIST, PROCUREMENT_OFFICER              |
| GET /transactions      | inventory_transactions | read   | ADMIN, FINANCE_OFFICER                              |
| GET /valuation         | inventory_valuation    | read   | ADMIN, FINANCE_OFFICER                              |

### Data Validation

1. **TypeBox Schemas**: All inputs validated against schemas
2. **SQL Injection Prevention**: Knex query builder (parameterized queries)
3. **XSS Prevention**: Input sanitization, output encoding
4. **UUID Validation**: BaseRepository validates UUID fields
5. **Business Rule Validation**: Service layer enforces min < reorder < max, qty >= 0

### Audit Trail

1. **Immutable Transactions**: No updates/deletes on inventory_transactions
2. **User Tracking**: created_by field on all adjustments and transfers
3. **Timestamp Tracking**: created_at on all records
4. **Correlation IDs**: Request correlation for troubleshooting
5. **Change Log**: WebSocket events broadcast all changes for audit

## WebSocket Real-Time Updates

### Event Types

```typescript
// Stock level changed
{
  event: 'inventory:stock_updated',
  data: {
    inventory_id: 123,
    drug_id: 1,
    location_id: 2,
    old_quantity: 1000,
    new_quantity: 1500,
    stock_status: 'OK'
  }
}

// Lot created
{
  event: 'inventory:lot_created',
  data: {
    lot_id: 456,
    drug_id: 1,
    location_id: 2,
    lot_number: 'LOT2025001',
    quantity: 1000,
    expiry_date: '2027-12-31'
  }
}

// Low stock alert
{
  event: 'inventory:low_stock_alert',
  data: {
    drug_id: 1,
    location_id: 2,
    current_stock: 450,
    reorder_point: 500,
    urgency: 'CRITICAL'
  }
}

// Expiry alert
{
  event: 'inventory:expiry_alert',
  data: {
    lot_id: 789,
    drug_id: 2,
    expiry_date: '2025-03-15',
    days_until_expiry: 25,
    quantity_remaining: 300
  }
}
```

### Room-Based Broadcasting

```typescript
// Broadcast to location-specific room
eventService.for('inventory', 'stock').broadcast(`location:${locationId}`, 'stock_updated', data);

// Broadcast to drug-specific room
eventService.for('inventory', 'lot').broadcast(`drug:${drugId}`, 'lot_created', data);

// Broadcast to all inventory managers
eventService.for('inventory', 'alert').broadcast('role:inventory_manager', 'low_stock_alert', data);
```

## Deployment Considerations

### Database Migration

1. **Create schema**: `CREATE SCHEMA IF NOT EXISTS inventory`
2. **Run migrations**: Execute all migrations in `migrations-inventory/` folder
3. **Create functions**: Deploy FIFO/FEFO database functions
4. **Create views**: Deploy low_stock_items, expiring_drugs views
5. **Seed master data**: Run seed script for drugs, locations

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5434/invs_modern
DATABASE_SCHEMA=inventory

# Inventory Configuration
INVENTORY_ALLOW_NEGATIVE_STOCK=false
INVENTORY_EXPIRY_WARNING_DAYS=180
INVENTORY_EXPIRY_CRITICAL_DAYS=90
INVENTORY_DEFAULT_DISPENSING_METHOD=FEFO

# Performance
INVENTORY_QUERY_TIMEOUT=30000
INVENTORY_DEFAULT_PAGE_LIMIT=50
INVENTORY_MAX_PAGE_LIMIT=200

# Caching
INVENTORY_CACHE_MASTER_DATA=true
INVENTORY_CACHE_TTL=300

# Monitoring
INVENTORY_LOG_LEVEL=info
INVENTORY_ENABLE_METRICS=true
```

### Health Checks

```typescript
// Health check endpoint
fastify.get('/health/inventory', async (request, reply) => {
  const checks = {
    database: await checkDatabaseConnection(),
    schema: await checkSchemaExists(),
    functions: await checkDatabaseFunctions(),
  };

  const healthy = Object.values(checks).every((check) => check.status === 'ok');

  return reply.code(healthy ? 200 : 503).send({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
  });
});
```

## Future Enhancements

1. **Batch Operations**: Bulk adjustments, bulk transfers
2. **Advanced Reporting**: ABC-VEN analysis, usage forecasting
3. **Mobile API**: Optimized endpoints for mobile stock taking
4. **Barcode Integration**: Scan barcodes for quick stock updates
5. **AI-Powered Reordering**: Machine learning for optimal reorder points
6. **Multi-Hospital Support**: Sharding by hospital_id for scale
7. **Offline Support**: Sync mechanism for disconnected operations
8. **Advanced Alerts**: Custom alert rules, escalation workflows
