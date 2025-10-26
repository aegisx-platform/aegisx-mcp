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

**Current State (v2.1.0)**:

- ✅ Backend event emission fully implemented
- ✅ WebSocket infrastructure ready
- ✅ Event types and payload structure defined
- ✅ Frontend state manager generation (`--with-events` flag)
- ✅ BaseRealtimeStateManager with optimistic updates & conflict detection
- ✅ List component state manager integration (auto-injected & initialized)
- 🚧 Dialog components integration (planned for v2.2.0)
- 🚧 Import progress via WebSocket (planned for v2.2.0)

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

### Current State (v2.1.0)

**State Manager Generation** - The `--with-events` flag now generates a complete real-time state manager service:

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

### Planned for v2.2.0

#### 1. Dialog Components Integration

Auto-inject state manager in create/edit dialogs:

```typescript
// Future generated code (v2.2.0)
export class ProductEditDialogComponent {
  stateManager = inject(ProductStateManager);

  async onSubmit() {
    // Optimistic update - dialog closes immediately
    await this.stateManager.optimisticUpdate(this.data.product.id, formData);
    this.dialogRef.close(true);
  }
}
```

#### 2. Import Progress via WebSocket

Import dialogs will show real-time progress:

```typescript
// Future generated code (v2.1.0)
export class ProductsImportDialogComponent {
  private setupImportProgress(sessionId: string) {
    this.wsService
      .listen<ImportProgressEvent>(`products:import-progress`)
      .pipe(
        filter((event) => event.sessionId === sessionId),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        this.progress.set(event.progress);
        this.processedRows.set(event.processedRows);
      });
  }
}
```

#### 2. Automatic List Component Integration

```typescript
// Future feature (v2.2.0) - List components will auto-inject state manager
export class ProductsListComponent {
  private stateManager = inject(ProductStateManager);

  // Auto-generated initialization
  ngOnInit() {
    this.stateManager.initialize();
  }

  // All CRUD operations auto-wired to state manager
}
```

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

**Current Limitation**: v2.0.1 uses polling, not WebSocket for import progress.

**Workaround**:

```typescript
// Import dialog uses polling (current implementation)
const pollInterval = setInterval(() => {
  this.checkImportStatus(sessionId);
}, 2000);
```

**Future Solution**: v2.1.0 will use WebSocket for real-time import progress.

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

**What You Get with `--with-events`**:

- ✅ Automatic event emission for all CRUD operations
- ✅ Standardized event structure and naming
- ✅ Integration with existing EventService
- ✅ WebSocket infrastructure ready
- ✅ Backend implementation complete

**What's Coming in v2.1.0**:

- 🚧 Auto-generated frontend real-time listeners
- 🚧 Import progress via WebSocket
- 🚧 Optimistic UI updates
- 🚧 Batch event handling

**Best Practices**:

- Use consistent event naming
- Keep event payloads lean
- Handle events only after successful operations
- Throttle high-frequency events
- Always clean up subscriptions

**Related Guides**:

- [Import Guide](./IMPORT_GUIDE.md) - Bulk import with events
- [User Guide](./USER_GUIDE.md) - Complete feature overview
- [API Reference](./API_REFERENCE.md) - Technical specifications
