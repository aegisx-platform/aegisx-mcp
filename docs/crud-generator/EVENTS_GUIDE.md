# WebSocket Events Guide

**Complete guide to real-time event emission in CRUD Generator v2.0+**

## Table of Contents

- [Overview](#overview)
- [What is `--with-events`?](#what-is---with-events)
- [Backend Implementation](#backend-implementation)
- [Event Types](#event-types)
- [Event Structure](#event-structure)
- [Testing Events](#testing-events)
- [Frontend Integration](#frontend-integration)
- [Future Features](#future-features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The `--with-events` flag enables **real-time WebSocket event emission** for all CRUD operations. When enabled, the backend automatically broadcasts events whenever data changes, allowing frontend applications to react in real-time.

**Current State (v2.4.0)** - HIS Mode Update:

- ✅ Backend event emission fully implemented
- ✅ WebSocket infrastructure ready
- ✅ Event types and payload structure defined
- ✅ Frontend state manager generation (`--with-events` flag)
- ✅ BaseRealtimeStateManager for import events & optional CRUD
- ✅ List component state manager integration (auto-injected & initialized)
- ✅ **HIS Mode (Default)**: No optimistic updates, reload trigger for data accuracy
- ✅ **Commented CRUD subscription code**: Optional real-time updates (uncomment when needed)
- ✅ Import progress via WebSocket (real-time progress updates)

**Use Cases**:

- Real-time dashboard updates
- Multi-user collaboration features
- Live data synchronization
- Activity feeds and notifications
- Import/export progress tracking

---

## What is `--with-events`?

### Enabling Events

```bash
# Generate CRUD module with WebSocket events
pnpm run crud-gen products \
  --entity Product \
  --with-events

# Or use interactive mode and select "Enterprise" or "Full" package
pnpm run crud-gen products
```

### What Gets Generated

**Backend Files**:

- `{{domain}}.controller.ts` - Event emission after each operation
- Integration with `EventService` (from `@shared/services/event.service`)
- Integration with `CrudEventHelper` (from `@shared/helpers/crud-event.helper`)

**Frontend Files** (NEW in v2.1.0):

- `{{module}}-state-manager.service.ts` - Real-time state management service
- Extends `BaseRealtimeStateManager` with full CRUD synchronization
- Automatic optimistic updates and conflict detection
- Complete lifecycle hooks for connection events

**Event Emission Points**:

- ✅ After successful CREATE operations
- ✅ After successful UPDATE operations
- ✅ After successful DELETE operations
- ✅ After successful BULK DELETE operations
- ✅ After successful IMPORT operations (if `--with-import` also enabled)

---

## Backend Implementation

### Generated Controller with Events

```typescript
// Generated: apps/api/src/domains/products/products.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductsService } from './products.service';
import { EventService } from '@shared/services/event.service';
import { CrudEventHelper } from '@shared/helpers/crud-event.helper';

export class ProductsController {
  private eventService: EventService;

  constructor(private readonly service: ProductsService) {
    this.eventService = EventService.getInstance();
  }

  async create(request: FastifyRequest<{ Body: CreateProduct }>, reply: FastifyReply) {
    const result = await this.service.create(request.body, request.user);

    // 🔥 Emit WebSocket event after successful creation
    CrudEventHelper.emitCreated(this.eventService, 'products', result.data, request.user);

    return reply.code(201).send(result);
  }

  async update(
    request: FastifyRequest<{
      Params: ProductIdParam;
      Body: UpdateProduct;
    }>,
    reply: FastifyReply,
  ) {
    const result = await this.service.update(request.params.id, request.body, request.user);

    // 🔥 Emit WebSocket event after successful update
    CrudEventHelper.emitUpdated(this.eventService, 'products', result.data, request.user);

    return reply.send(result);
  }

  async delete(request: FastifyRequest<{ Params: ProductIdParam }>, reply: FastifyReply) {
    await this.service.delete(request.params.id, request.user);

    // 🔥 Emit WebSocket event after successful deletion
    CrudEventHelper.emitDeleted(this.eventService, 'products', request.params.id, request.user);

    return reply.code(204).send();
  }

  async bulkDelete(request: FastifyRequest<{ Body: BulkDeleteRequest }>, reply: FastifyReply) {
    const result = await this.service.bulkDelete(request.body.ids, request.user);

    // 🔥 Emit WebSocket event after successful bulk delete
    CrudEventHelper.emitBulkDeleted(this.eventService, 'products', request.body.ids, request.user);

    return reply.send(result);
  }
}
```

### EventService Integration

The generated code uses the existing `EventService` singleton:

```typescript
// apps/api/src/shared/services/event.service.ts (pre-existing)

export class EventService {
  private io: Server | null = null;

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  initialize(io: Server) {
    this.io = io;
  }

  emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
```

### CrudEventHelper Utilities

```typescript
// apps/api/src/shared/helpers/crud-event.helper.ts (pre-existing)

export class CrudEventHelper {
  static emitCreated(eventService: EventService, resource: string, data: any, user?: any) {
    eventService.emit(`${resource}:created`, {
      type: 'created',
      resource,
      data,
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
    });
  }

  static emitUpdated(eventService: EventService, resource: string, data: any, user?: any) {
    eventService.emit(`${resource}:updated`, {
      type: 'updated',
      resource,
      data,
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
    });
  }

  static emitDeleted(eventService: EventService, resource: string, id: string, user?: any) {
    eventService.emit(`${resource}:deleted`, {
      type: 'deleted',
      resource,
      id,
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
    });
  }

  static emitBulkDeleted(eventService: EventService, resource: string, ids: string[], user?: any) {
    eventService.emit(`${resource}:bulk-deleted`, {
      type: 'bulk-deleted',
      resource,
      ids,
      count: ids.length,
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
    });
  }

  static emitImportProgress(eventService: EventService, resource: string, sessionId: string, progress: number, processedRows: number, totalRows: number) {
    eventService.emit(`${resource}:import-progress`, {
      type: 'import-progress',
      resource,
      sessionId,
      progress,
      processedRows,
      totalRows,
      timestamp: new Date().toISOString(),
    });
  }

  static emitImportCompleted(eventService: EventService, resource: string, sessionId: string, result: any) {
    eventService.emit(`${resource}:import-completed`, {
      type: 'import-completed',
      resource,
      sessionId,
      result,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## Event Types

### Standard CRUD Events

| Event Type       | Event Name Pattern        | Triggered By               | Payload             |
| ---------------- | ------------------------- | -------------------------- | ------------------- |
| **Created**      | `{resource}:created`      | POST create operation      | Full created object |
| **Updated**      | `{resource}:updated`      | PUT/PATCH update operation | Full updated object |
| **Deleted**      | `{resource}:deleted`      | DELETE single item         | Item ID only        |
| **Bulk Deleted** | `{resource}:bulk-deleted` | POST bulk delete           | Array of IDs, count |

### Import Events (if `--with-import` enabled)

| Event Type           | Event Name Pattern            | Triggered By             | Payload                          |
| -------------------- | ----------------------------- | ------------------------ | -------------------------------- |
| **Import Progress**  | `{resource}:import-progress`  | During import processing | Progress %, rows processed/total |
| **Import Completed** | `{resource}:import-completed` | Import job finished      | Success/failure counts, errors   |

### Example Event Names

For a `products` module:

- `products:created`
- `products:updated`
- `products:deleted`
- `products:bulk-deleted`
- `products:import-progress`
- `products:import-completed`

---

## Event Structure

### Created Event

```typescript
{
  type: 'created',
  resource: 'products',
  data: {
    id: 'uuid-here',
    name: 'New Product',
    price: 99.99,
    createdAt: '2025-10-26T10:30:00Z',
    // ... full object
  },
  timestamp: '2025-10-26T10:30:00Z',
  user: {
    id: 'user-uuid',
    email: 'user@example.com'
  }
}
```

### Updated Event

```typescript
{
  type: 'updated',
  resource: 'products',
  data: {
    id: 'uuid-here',
    name: 'Updated Product Name',
    price: 149.99,
    updatedAt: '2025-10-26T10:35:00Z',
    // ... full updated object
  },
  timestamp: '2025-10-26T10:35:00Z',
  user: {
    id: 'user-uuid',
    email: 'user@example.com'
  }
}
```

### Deleted Event

```typescript
{
  type: 'deleted',
  resource: 'products',
  id: 'uuid-here',
  timestamp: '2025-10-26T10:40:00Z',
  user: {
    id: 'user-uuid',
    email: 'user@example.com'
  }
}
```

### Bulk Deleted Event

```typescript
{
  type: 'bulk-deleted',
  resource: 'products',
  ids: ['uuid-1', 'uuid-2', 'uuid-3'],
  count: 3,
  timestamp: '2025-10-26T10:45:00Z',
  user: {
    id: 'user-uuid',
    email: 'user@example.com'
  }
}
```

### Import Progress Event

```typescript
{
  type: 'import-progress',
  resource: 'products',
  sessionId: 'import-session-uuid',
  progress: 45,              // 0-100
  processedRows: 450,
  totalRows: 1000,
  timestamp: '2025-10-26T10:50:00Z'
}
```

### Import Completed Event

```typescript
{
  type: 'import-completed',
  resource: 'products',
  sessionId: 'import-session-uuid',
  result: {
    status: 'completed',
    progress: 100,
    successCount: 980,
    failedCount: 20,
    error: null
  },
  timestamp: '2025-10-26T10:55:00Z'
}
```

---

## Testing Events

### Using WebSocket Client

```typescript
// Test with Socket.IO client
import { io } from 'socket.io-client';

const socket = io('http://localhost:3333', {
  auth: {
    token: 'your-jwt-token',
  },
});

// Listen for created events
socket.on('products:created', (event) => {
  console.log('Product created:', event.data);
});

// Listen for updated events
socket.on('products:updated', (event) => {
  console.log('Product updated:', event.data);
});

// Listen for deleted events
socket.on('products:deleted', (event) => {
  console.log('Product deleted:', event.id);
});

// Listen for bulk deleted events
socket.on('products:bulk-deleted', (event) => {
  console.log(`${event.count} products deleted:`, event.ids);
});

// Listen for import progress
socket.on('products:import-progress', (event) => {
  console.log(`Import progress: ${event.progress}%`);
  console.log(`Processed: ${event.processedRows}/${event.totalRows}`);
});

// Listen for import completion
socket.on('products:import-completed', (event) => {
  console.log('Import completed:', event.result);
});
```

### Using curl + WebSocket CLI

```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3333/socket.io/?EIO=4&transport=websocket

# You'll see events as they're emitted
# Perform CRUD operations via REST API in another terminal
```

### Backend Unit Test Example

```typescript
// apps/api/src/domains/products/products.controller.spec.ts

import { EventService } from '@shared/services/event.service';

describe('ProductsController - Events', () => {
  let eventService: EventService;
  let emitSpy: jest.SpyInstance;

  beforeEach(() => {
    eventService = EventService.getInstance();
    emitSpy = jest.spyOn(eventService, 'emit');
  });

  it('should emit created event after successful creation', async () => {
    const createData = { name: 'Test Product', price: 99.99 };
    await controller.create(createData, mockUser);

    expect(emitSpy).toHaveBeenCalledWith('products:created', {
      type: 'created',
      resource: 'products',
      data: expect.objectContaining(createData),
      timestamp: expect.any(String),
      user: expect.objectContaining({ id: mockUser.id }),
    });
  });

  it('should emit updated event after successful update', async () => {
    const updateData = { name: 'Updated Product' };
    await controller.update('product-id', updateData, mockUser);

    expect(emitSpy).toHaveBeenCalledWith('products:updated', {
      type: 'updated',
      resource: 'products',
      data: expect.objectContaining(updateData),
      timestamp: expect.any(String),
      user: expect.objectContaining({ id: mockUser.id }),
    });
  });
});
```

---

## Frontend Integration

### Current State (v2.4.0) - HIS Mode

**⚕️ Hospital Information System (HIS) Mode** - The default behavior now prioritizes **data accuracy over real-time speed** for critical healthcare and enterprise systems:

**Default Behavior (HIS Mode)**:

- ✅ Backend always emits CRUD events (for audit trail, analytics, microservices)
- ✅ Frontend uses **reload trigger pattern** for data accuracy
- ✅ NO optimistic updates (prevents data misunderstandings)
- ✅ Server-verified data only
- ✅ State manager generated with `--with-events` (for import events)
- ✅ CRUD subscription code provided as **commented examples** (optional feature)

**Optional Real-Time Mode**:

- Uncomment WebSocket subscription code when real-time updates are needed
- Suitable for non-critical systems where speed > accuracy
- Full working examples provided in generated code

---

### HIS Mode Architecture (v2.4.0)

#### Why HIS Mode?

Hospital Information Systems and enterprise applications require **server-verified data accuracy** to prevent critical mistakes:

```typescript
// ❌ PROBLEM: Optimistic updates in healthcare
async deletePatientRecord(id: string) {
  // UI shows record deleted immediately...
  this.records.update(list => list.filter(r => r.id !== id));

  // ...but server might reject due to:
  // - Active prescriptions exist
  // - Insurance claims pending
  // - Legal hold on record

  // User sees "deleted" but record still exists! 🚨
}

// ✅ SOLUTION: HIS Mode with reload trigger
async deletePatientRecord(id: string) {
  const result = await this.service.delete(id);

  if (result) {
    // Refresh from server - shows actual database state
    this.reloadTrigger.update(n => n + 1);
  }
}
```

#### HIS Mode Benefits

1. **Data Accuracy**: Always shows server-verified state
2. **No Confusion**: What you see = what's in database
3. **Audit Trail**: Backend events captured for compliance
4. **Event-Driven Ready**: Backend emits events for microservices
5. **Optional Real-Time**: Can enable when needed (commented code provided)

#### How HIS Mode Works

**Backend** (Always emits events):

```typescript
// Generated controller with --with-events
async create(request: FastifyRequest<{ Body: CreateBudgets }>, reply: FastifyReply) {
  const budgets = await this.budgetsService.create(createData);

  // 🔥 Always emit event for audit trail and event-driven architecture
  this.eventService
    .for('budgets', 'budgets')
    .emitCustom('created', budgets, 'normal');

  return reply.code(201).success(budgets);
}
```

**Frontend** (Uses reload trigger, doesn't subscribe by default):

```typescript
// Generated service - NO optimistic updates
async createBudgets(budgets: CreateBudgets): Promise<Budgets | undefined> {
  const response = await this.httpClient.post<ApiSuccessResponse<Budgets>>(
    `${this.baseUrl}`,
    budgets
  );

  if (response) {
    // ✅ Return data without optimistic update
    // List component will refresh via reloadTrigger
    return response.data;
  }
  return undefined;
}
```

**List Component** (Reload trigger pattern):

```typescript
export class BudgetsListComponent {
  budgetsService = inject(BudgetsService);
  reloadTrigger = signal(0);

  // Effect watches reload trigger
  constructor() {
    effect(async () => {
      this.reloadTrigger(); // Watch for changes
      // ... filters, sorting, pagination ...

      // Fetch fresh data from server
      const result = await this.budgetsService.listBudgets(queryParams);
      this.dataSource.data = result.data;
    });
  }

  // After delete, trigger reload
  async onDeleteBudget(budget: Budgets) {
    const confirmed = await this.axDialog.confirmDelete(itemName);
    if (confirmed) {
      await this.budgetsService.deleteBudgets(budget.id);
      this.reloadTrigger.update((n) => n + 1); // Refresh from server
    }
  }
}
```

---

### Enabling Optional Real-Time Updates (v2.4.0)

When you generate with `--with-events`, **commented WebSocket subscription code** is included in the list component. Uncomment this code to enable real-time CRUD updates:

#### Step 1: Uncomment Required Imports

Find this section in your list component and uncomment:

```typescript
// 🔧 OPTIONAL: Uncomment for real-time CRUD updates
/*
// Note: Import required dependencies first:
// import { WebSocketService } from '../../../core/services/websocket.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
*/
```

Uncommented:

```typescript
// Real-time CRUD updates enabled
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
```

#### Step 2: Add Class Properties

Find and uncomment:

```typescript
/*
// Add these as class properties:
// private wsService = inject(WebSocketService);
// private authService = inject(AuthService);
// private destroy$ = new Subject<void>();
*/
```

Uncommented:

```typescript
// Class properties for WebSocket
private wsService = inject(WebSocketService);
private authService = inject(AuthService);
private destroy$ = new Subject<void>();
```

#### Step 3: Setup WebSocket in Constructor

Find and uncomment:

```typescript
constructor() {
  /*
  // Setup WebSocket connection for real-time updates
  const token = this.authService.accessToken();
  if (token) {
    this.wsService.connect(token);
    this.wsService.subscribe({ features: ['budgets'] });
    this.setupCrudEventListeners();
  }
  */
}
```

Uncommented:

```typescript
constructor() {
  // Setup WebSocket connection for real-time updates
  const token = this.authService.accessToken();
  if (token) {
    this.wsService.connect(token);
    this.wsService.subscribe({ features: ['budgets'] });
    this.setupCrudEventListeners();
  }
}
```

#### Step 4: Uncomment Event Listeners

Find the `setupCrudEventListeners()` method and uncomment the entire function:

```typescript
// 🔧 OPTIONAL: Real-time CRUD Event Listeners
/*
private setupCrudEventListeners(): void {
  // 📡 Subscribe to 'created' event
  this.wsService
    .subscribeToEvent('budgets', 'budgets', 'created')
    .pipe(takeUntil(this.destroy$))
    .subscribe((event: any) => {
      console.log('🔥 New budget created:', event.data);

      // Option 1: Add to local state and refresh display
      this.budgetsService.budgetsListSignal.update(
        list => [event.data, ...list]
      );
      this.reloadTrigger.update(n => n + 1);

      // Option 2: Just refresh from server (more reliable)
      // this.reloadTrigger.update(n => n + 1);
    });

  // ... updated and deleted events ...
}
*/
```

#### Step 5: Add Cleanup

Uncomment ngOnDestroy:

```typescript
/*
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
*/
```

#### Complete Example (Real-Time Enabled)

```typescript
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class BudgetsListComponent implements OnDestroy {
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  constructor() {
    // Initialize state manager for import events
    this.budgetStateManager.initialize();

    // Setup WebSocket for real-time CRUD updates
    const token = this.authService.accessToken();
    if (token) {
      this.wsService.connect(token);
      this.wsService.subscribe({ features: ['budgets'] });
      this.setupCrudEventListeners();
    }
  }

  private setupCrudEventListeners(): void {
    // Real-time create notifications
    this.wsService
      .subscribeToEvent('budgets', 'budgets', 'created')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('🔥 New budget created:', event.data);
        this.reloadTrigger.update((n) => n + 1); // Refresh display
      });

    // Real-time update notifications
    this.wsService
      .subscribeToEvent('budgets', 'budgets', 'updated')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('🔄 Budget updated:', event.data);
        this.reloadTrigger.update((n) => n + 1); // Refresh display
      });

    // Real-time delete notifications
    this.wsService
      .subscribeToEvent('budgets', 'budgets', 'deleted')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        console.log('🗑️ Budget deleted:', event.data);
        this.reloadTrigger.update((n) => n + 1); // Refresh display
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### State Manager Generation (v2.1.0+)

**State Manager Generation** - The `--with-events` flag generates a complete real-time state manager service:

```typescript
// Generated: apps/web/src/app/features/products/services/products-state-manager.service.ts

import { Injectable, inject } from '@angular/core';
import { BaseRealtimeStateManager } from '@shared/business/services/base-realtime-state-manager';
import { ProductService } from './products.service';
import { Product } from '../types/products.types';

@Injectable({ providedIn: 'root' })
export class ProductStateManager extends BaseRealtimeStateManager<Product> {
  private productsService = inject(ProductService);

  constructor() {
    super({
      feature: 'products',
      entity: 'product',
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      debounceMs: 300,
      retryAttempts: 3,
    });
  }

  // ✅ All abstract methods automatically implemented:
  // - fetchFromServer()
  // - serverCreate()
  // - serverUpdate()
  // - serverDelete()
  // - extractEntityId()

  // ✅ Lifecycle hooks available for customization:
  // - onRealtimeConnected()
  // - onRealtimeDisconnected()
  // - onBulkUpdate()
  // - onSyncComplete()
  // - onConflictDetected()
}
```

### WebSocketService (Pre-existing)

```typescript
// apps/web/src/app/core/services/websocket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    this.socket = io('http://localhost:3333', {
      auth: { token },
    });
  }

  listen<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket?.on(event, (data: T) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}
```

### List Component Integration (v2.1.0 ✅)

When you generate a CRUD module with `--with-events`, the list component **automatically** includes state manager integration:

```typescript
// Generated: apps/web/src/app/features/products/components/products-list.component.ts

export class ProductsListComponent {
  productsService = inject(ProductService);
  productStateManager = inject(ProductStateManager); // ← Auto-injected

  constructor() {
    // ✅ Auto-initialized in constructor
    this.productStateManager.initialize();

    // ✅ Effect watches state manager data
    effect(async () => {
      // ... filter/sort/pagination logic ...

      // ✅ Use real-time data from state manager
      this.dataSource.data = this.productStateManager.localState();
    });
  }

  // ✅ Delete operation uses optimistic update
  onDeleteProduct(product: Product) {
    this.axDialog.confirmDelete(itemName).subscribe(async (confirmed) => {
      if (confirmed) {
        // Item disappears from UI instantly!
        await this.productStateManager.optimisticDelete(product.id);

        // No manual reload needed - dataSource auto-updates via effect
      }
    });
  }
}
```

**Benefits**:

- 🚀 **Instant Delete**: Item disappears immediately (0ms vs 500ms)
- 🔄 **Auto-Refresh**: No manual `reloadTrigger` needed
- 📡 **Real-time Sync**: See changes from other users instantly
- ⚡ **Better UX**: Users don't wait for server responses

---

### Manual State Manager Usage

For custom components or advanced scenarios, you can use the state manager directly:

**Basic Usage** - Initialize and subscribe to real-time state:

```typescript
// Use in components: apps/web/src/app/modules/products/list/products-list.component.ts

export class ProductsListComponent implements OnInit {
  private stateManager = inject(ProductStateManager);

  // Subscribe to real-time synchronized state
  products = this.stateManager.localState;
  isConnected = this.stateManager.isConnected;
  syncStatus = this.stateManager.syncStats;

  ngOnInit() {
    // Initialize state manager (fetches initial data + starts WebSocket sync)
    this.stateManager.initialize();
  }

  // Optimistic create - UI updates immediately, syncs with server in background
  async createProduct(data: Omit<Product, 'id'>) {
    await this.stateManager.optimisticCreate(data);
    // List auto-updates via localState signal!
  }

  // Optimistic update - Shows change immediately while syncing
  async updateProduct(id: string, changes: Partial<Product>) {
    await this.stateManager.optimisticUpdate(id, changes);
  }

  // Optimistic delete - Removes from UI immediately
  async deleteProduct(id: string) {
    await this.stateManager.optimisticDelete(id);
  }

  // Manual refresh from server (if needed)
  async refresh() {
    await this.stateManager.refresh();
  }
}
```

**Advanced Usage** - Custom lifecycle hooks and conflict handling:

```typescript
// Extend generated state manager for custom behavior
export class ProductStateManager extends BaseRealtimeStateManager<Product> {
  // ... constructor and required methods ...

  // Override lifecycle hooks for custom logic
  protected override onRealtimeConnected(): void {
    console.log('✅ Connected to real-time product updates');
    this.showNotification('Real-time sync enabled');
  }

  protected override onRealtimeDisconnected(): void {
    console.warn('⚠️ Disconnected from real-time updates');
    this.showNotification('Working offline');
  }

  protected override onConflictDetected(conflict: ConflictInfo<Product>): void {
    console.warn('🔥 Conflict detected:', conflict);

    // Custom conflict resolution
    if (this.shouldUseServerVersion(conflict)) {
      // Server wins
      return;
    } else {
      // Keep local version, retry server update
      this.retryUpdate(conflict.entity.id, conflict.localChanges);
    }
  }

  protected override onBulkUpdate(entities: Product[]): void {
    console.log(`📦 Received bulk update: ${entities.length} products`);
    this.showNotification(`${entities.length} products updated`);
  }
}
```

---

## Future Features

### Completed in v2.1.0 ✅

- ✅ **State Manager Generation** - Automatically generates real-time state management services
- ✅ **List Component Integration** - Auto-injects & initializes state manager in list components
- ✅ **Optimistic Delete** - Delete operations update UI instantly (0ms response time)
- ✅ **Auto Data Sync** - dataSource uses state manager's real-time data
- ✅ **Optimistic Updates** - UI updates immediately with automatic server synchronization
- ✅ **Conflict Detection** - Detects and handles concurrent modifications
- ✅ **Offline Support** - Pending operations queue for offline scenarios
- ✅ **Lifecycle Hooks** - Customizable hooks for connection events and conflicts

### Completed in v2.2.0 ✅

#### Dialog Components Integration

Auto-inject state manager in create/edit dialogs for optimistic updates:

**Auto-Generated Create Dialog**:

```typescript
export class ProductCreateDialogComponent {
  private productStateManager = inject(ProductStateManager);

  async onFormSubmit(formData: ProductFormData) {
    this.loading.set(true);
    try {
      // Optimistic create - dialog closes immediately, list updates automatically
      await this.productStateManager.optimisticCreate(formData);
      this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
      this.dialogRef.close(true); // Close with success flag
    } catch (error: any) {
      this.snackBar.open(error?.message || 'Failed to create product', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading.set(false);
    }
  }
}
```

**Auto-Generated Edit Dialog**:

```typescript
export class ProductEditDialogComponent {
  private productStateManager = inject(ProductStateManager);

  async onFormSubmit(formData: ProductFormData) {
    this.loading.set(true);
    try {
      // Optimistic update - dialog closes immediately, list updates automatically
      await this.productStateManager.optimisticUpdate(this.data.product.id, formData);
      this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
      this.dialogRef.close(true); // Close with success flag
    } catch (error: any) {
      this.snackBar.open(error?.message || 'Failed to update product', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading.set(false);
    }
  }
}
```

**Benefits**:

- ⚡ Dialog closes instantly (0ms perceived latency)
- 🔄 List updates automatically via state manager
- ✨ No manual reload triggers needed
- 🎯 Consistent UX across all CRUD operations

### Completed in v2.3.0 ✅

#### Import Progress via WebSocket

**Real-time Progress Updates** - Import dialogs now receive instant progress updates via WebSocket instead of polling:

**Backend Implementation**:

BaseImportService automatically emits progress events during batch processing:

```typescript
// apps/api/src/shared/services/base-import.service.ts
export abstract class BaseImportService<T> {
  protected readonly eventService: EventService;
  protected readonly resourceName: string;

  constructor(knex: Knex, config: ImportModuleConfig<T>, resourceName: string) {
    this.knex = knex;
    this.config = config;
    this.resourceName = resourceName;
    this.eventService = EventService.getInstance();
  }

  private emitImportProgress(job: ImportJobData): void {
    const progressEvent = {
      jobId: job.jobId,
      sessionId: job.sessionId,
      status: job.status,
      progress: job.progress,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      failedCount: job.failedCount,
      error: job.error,
    };
    this.eventService.emit(`${this.resourceName}:import-progress`, progressEvent);
  }

  private async processImportJob(jobId: string, validRows: ImportRowValidation[]): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = ImportJobStatus.PROCESSING;
      this.emitImportProgress(job); // Emit processing started

      // Process batches...
      for (let i = 0; i < transformedRows.length; i += batchSize) {
        // ... batch processing ...
        job.processedRecords = Math.min(i + batchSize, transformedRows.length);
        job.progress = Math.round((job.processedRecords / job.totalRecords) * 100);

        this.emitImportProgress(job); // Real-time progress after each batch
      }

      job.status = ImportJobStatus.COMPLETED;
      this.emitImportProgress(job); // Emit completion
    } catch (error) {
      job.status = ImportJobStatus.FAILED;
      job.error = error instanceof Error ? error.message : String(error);
      this.emitImportProgress(job); // Emit failure
    }
  }
}
```

**Frontend Implementation**:

Generated import dialogs automatically use WebSocket when `--with-events` flag is set:

```typescript
// Generated with: pnpm run crud-gen products --with-import --with-events
export class ProductsImportDialogComponent implements OnDestroy {
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  async executeImport(): Promise<void> {
    // ... validation and API call ...

    if (response?.success && response.data) {
      this.importJob.set(response.data);
      this.currentStep.set('progress');
      this.setupWebSocketListener(response.data.jobId); // Use WebSocket instead of polling
    }
  }

  private setupWebSocketListener(jobId: string): void {
    this.wsService
      .listen<any>('products:import-progress')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.jobId !== jobId) return;

        // Update UI immediately when progress event arrives
        this.importJob.update((current) => ({
          ...current!,
          status: event.status,
          progress: event.progress,
          processedRecords: event.processedRecords,
          successCount: event.successCount,
          failedCount: event.failedCount,
          error: event.error,
        }));

        // Handle completion/failure
        if (event.status === 'completed' || event.status === 'failed') {
          this.currentStep.set('complete');
          if (event.status === 'completed') {
            this.snackBar.open('Import completed successfully!', 'Close', {
              duration: 5000,
            });
          } else {
            this.snackBar.open('Import failed', 'Close', { duration: 5000 });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Event Payload Structure**:

```typescript
{
  jobId: 'uuid-here',
  sessionId: 'session-uuid',
  status: 'processing' | 'completed' | 'failed',
  progress: 45,              // 0-100
  totalRecords: 1000,
  processedRecords: 450,
  successCount: 445,
  failedCount: 5,
  error: null | string
}
```

**Benefits**:

- ⚡ **Instant Updates**: 0ms delay vs 2000ms average with polling
- 📉 **Reduced Server Load**: No repeated API calls every 2 seconds
- 🎯 **More Accurate Progress**: Updates after each batch instead of periodic sampling
- 🔄 **Real-time Sync**: Multiple users see progress updates simultaneously
- ♻️ **Proper Cleanup**: No memory leaks with Subject-based cleanup

**Module-Specific Configuration**:

Each import service extends BaseImportService with resource name:

```typescript
// apps/api/src/modules/products/services/products-import.service.ts
export class ProductsImportService extends BaseImportService<Products> {
  constructor(
    knex: Knex,
    private productsRepository: ProductsRepository,
  ) {
    super(knex, ProductsImportService.createConfig(productsRepository), 'products');
    //                                                                    ^^^^^^^^^
    //                                             Resource name for event naming
  }
}
```

---

### Future Features

---

## Best Practices

### 1. Event Naming Conventions

```typescript
// ✅ Good: Use resource name from generator
const RESOURCE = 'products';
eventService.emit(`${RESOURCE}:created`, data);

// ❌ Bad: Hardcoded or inconsistent naming
eventService.emit('product_created', data);
eventService.emit('PRODUCTS_CREATED', data);
```

### 2. Event Payload Size

```typescript
// ✅ Good: Include only necessary data
CrudEventHelper.emitCreated(eventService, 'products', {
  id: product.id,
  name: product.name,
  price: product.price,
  // Only essential fields
});

// ❌ Bad: Sending huge nested objects
CrudEventHelper.emitCreated(eventService, 'products', {
  ...product,
  category: { ...fullCategoryObject },
  images: [...allImagesWithBase64],
  relatedProducts: [...hundreds of products]
});
```

### 3. Authentication in Events

```typescript
// ✅ Good: Only send safe user info
user: user ? { id: user.id, email: user.email } : null;

// ❌ Bad: Leaking sensitive data
user: user ? { ...user, password: user.password } : null;
```

### 4. Error Handling

```typescript
// ✅ Good: Emit events only after successful operations
const result = await this.service.create(data);
CrudEventHelper.emitCreated(eventService, 'products', result.data);

// ❌ Bad: Emitting before operation completes
CrudEventHelper.emitCreated(eventService, 'products', data);
await this.service.create(data); // What if this fails?
```

### 5. Performance Considerations

```typescript
// ✅ Good: Throttle high-frequency events
import { throttle } from 'lodash';

const emitProgress = throttle((progress) => {
  CrudEventHelper.emitImportProgress(eventService, resource, sessionId, progress);
}, 1000); // Max once per second

// ❌ Bad: Emitting on every row
for (const row of 10000rows) {
  processRow(row);
  emitProgress(currentProgress); // 10000 events!
}
```

---

## Troubleshooting

### Events Not Being Received

**Symptoms**: Frontend not receiving WebSocket events

**Solutions**:

1. **Check WebSocket connection**:

   ```typescript
   console.log('Socket connected:', this.wsService.socket?.connected);
   ```

2. **Verify event name**:

   ```typescript
   // Make sure event names match exactly
   Backend:  'products:created'
   Frontend: 'products:created'  ✅
   Frontend: 'product:created'   ❌
   ```

3. **Check CORS configuration**:

   ```typescript
   // apps/api/src/main.ts
   fastify.register(cors, {
     origin: 'http://localhost:4200',
     credentials: true,
   });
   ```

4. **Verify authentication**:
   ```typescript
   // Ensure JWT token is sent with WebSocket connection
   this.wsService.connect(this.authService.getToken());
   ```

### Events Emitted but List Not Updating

**Symptoms**: Console shows events, but UI doesn't update

**Solutions**:

1. **Use Angular Signals**:

   ```typescript
   // ✅ Good: Signals trigger change detection
   this.items.update((items) => [...items, newItem]);

   // ❌ Bad: Direct mutation doesn't trigger updates
   this.items.push(newItem);
   ```

2. **Run in NgZone**:

   ```typescript
   import { NgZone } from '@angular/core';

   constructor(private ngZone: NgZone) {}

   this.wsService.listen('products:created').subscribe(event => {
     this.ngZone.run(() => {
       this.items.update(items => [...items, event.data]);
     });
   });
   ```

### Performance Issues with Many Events

**Symptoms**: Browser slows down with many events

**Solutions**:

1. **Debounce/Throttle event handlers**:

   ```typescript
   import { debounceTime } from 'rxjs/operators';

   this.wsService
     .listen('products:updated')
     .pipe(debounceTime(300))
     .subscribe((event) => {
       this.updateItem(event.data);
     });
   ```

2. **Batch updates**:
   ```typescript
   // Collect events and update once
   this.wsService.listen('products:bulk-deleted').subscribe((event) => {
     this.items.update((items) => items.filter((item) => !event.ids.includes(item.id)));
     // Single update for all IDs
   });
   ```

### Import Progress Not Showing

**Symptoms**: Import completes but no progress updates

**Solutions**:

1. **Verify `--with-events` flag was used**:

   ```bash
   # Generate with events enabled
   pnpm run crud-gen products --with-import --with-events
   ```

2. **Check WebSocket connection**:

   ```typescript
   // Verify WebSocket service is injected and connected
   console.log('WebSocket connected:', this.wsService.isConnected());
   ```

3. **Verify event listener setup**:

   ```typescript
   // Should call setupWebSocketListener() instead of startPolling()
   if (response?.success && response.data) {
     this.setupWebSocketListener(response.data.jobId); // ✅ With events
     // NOT: this.startPolling(response.data.jobId);    // ❌ Old polling
   }
   ```

4. **Check import service configuration**:

   ```typescript
   // Verify resource name is passed to BaseImportService
   constructor(knex: Knex, private repository: Repository) {
     super(knex, Config.createConfig(repository), 'products'); // ← Must match event name
   }
   ```

5. **Backward Compatibility Note**:

   If generated without `--with-events`, module will fall back to polling:

   ```typescript
   // Without --with-events flag (backward compatible)
   if (response?.success && response.data) {
     this.startPolling(response.data.jobId); // Still works with polling
   }
   ```

---

## Example: Complete Event Integration

Here's a complete example showing backend and frontend event integration:

### Backend Controller

```typescript
// apps/api/src/domains/products/products.controller.ts
export class ProductsController {
  private eventService = EventService.getInstance();

  async create(request: FastifyRequest, reply: FastifyReply) {
    const product = await this.service.create(request.body);

    CrudEventHelper.emitCreated(this.eventService, 'products', product, request.user);

    return reply.code(201).send(product);
  }
}
```

### Frontend Service

```typescript
// apps/web/src/app/modules/products/services/products.service.ts
@Injectable()
export class ProductsService {
  private wsService = inject(WebSocketService);

  onProductCreated(): Observable<Product> {
    return this.wsService.listen<any>('products:created').pipe(map((event) => event.data));
  }
}
```

### Frontend Component

```typescript
// apps/web/src/app/modules/products/list/products-list.component.ts
export class ProductsListComponent implements OnInit {
  items = signal<Product[]>([]);

  ngOnInit() {
    this.loadProducts();
    this.setupRealtimeUpdates();
  }

  private setupRealtimeUpdates() {
    this.productsService
      .onProductCreated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        this.items.update((items) => [...items, product]);
        this.snackBar.open('New product added', 'Close', { duration: 3000 });
      });
  }
}
```

---

## Summary

**What You Get with `--with-events` (v2.4.0 - HIS Mode)**:

**Backend**:

- ✅ Automatic event emission for all CRUD operations (always enabled)
- ✅ Standardized event structure and naming
- ✅ Integration with existing EventService
- ✅ Real-time import progress events (v2.3.0)
- ✅ BaseImportService with automatic event emission
- ✅ Event-driven architecture ready (for microservices, audit trail)

**Frontend (HIS Mode)**:

- ✅ Auto-generated state manager for import events (v2.1.0+)
- ✅ **Reload trigger pattern** for data accuracy (v2.4.0)
- ✅ **NO optimistic updates by default** (prevents data misunderstandings)
- ✅ Server-verified data only
- ✅ **Commented CRUD subscription code** (optional real-time feature)
- ✅ Import progress via WebSocket (v2.3.0)
- ✅ Proper RxJS cleanup with takeUntil pattern

**Frontend (Optional Real-Time Mode)**:

- ✅ Full WebSocket subscription examples (commented)
- ✅ Easy enable: Uncomment 4 code blocks
- ✅ Multi-user synchronization
- ✅ Real-time CRUD notifications
- ✅ Memory-safe subscriptions

**HIS Mode Benefits (v2.4.0)**:

- ⚕️ **Data accuracy over speed** - Critical for healthcare systems
- 🛡️ **No data confusion** - UI shows actual database state
- 📊 **Audit trail** - Backend always emits events for compliance
- 🏗️ **Event-driven ready** - Events available for microservices
- 🔧 **Optional real-time** - Enable when needed with commented code

**Performance Benefits (When Real-Time Enabled)**:

- ⚡ Instant UI updates (0ms perceived latency)
- 📉 Reduced server load (no polling)
- 🎯 Accurate real-time progress tracking
- 🔄 Multi-user synchronization
- ♻️ Memory-safe subscriptions

**Best Practices**:

- **Use HIS Mode for critical systems** (healthcare, finance, legal)
- **Use Real-Time Mode for non-critical systems** (chat, notifications, dashboards)
- Backend always emits events (for audit trail and microservices)
- Frontend chooses to subscribe or use reload trigger
- Keep event payloads lean
- Handle events only after successful operations
- Throttle high-frequency events
- Always clean up subscriptions with `takeUntil()`
- Pass resource name to BaseImportService for event naming
- Enable `--with-events` for event infrastructure

**Related Guides**:

- [Import Guide](./IMPORT_GUIDE.md) - Bulk import with events
- [User Guide](./USER_GUIDE.md) - Complete feature overview
- [API Reference](./API_REFERENCE.md) - Technical specifications
