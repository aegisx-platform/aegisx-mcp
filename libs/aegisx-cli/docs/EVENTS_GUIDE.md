# AegisX CLI - WebSocket Events Guide

> Real-time CRUD operations with `--with-events`

---

## Overview

The `--with-events` flag adds WebSocket event emission to your CRUD modules, enabling real-time updates across all connected clients.

---

## Quick Start

```bash
# Backend with events
aegisx generate notifications --with-events --force

# Frontend with event handling
aegisx generate notifications --target frontend --with-events --force
```

---

## What Gets Generated

### Backend (Fastify)

When using `--with-events`, the generated service includes event emission:

```typescript
// notifications.service.ts
export class NotificationsService {
  constructor(
    private repository: NotificationsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateNotification): Promise<Notification> {
    const result = await this.repository.create(data);

    // Emit event after successful creation
    this.eventEmitter.emit('notifications.created', {
      action: 'created',
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async update(id: string, data: UpdateNotification): Promise<Notification> {
    const result = await this.repository.update(id, data);

    this.eventEmitter.emit('notifications.updated', {
      action: 'updated',
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);

    this.eventEmitter.emit('notifications.deleted', {
      action: 'deleted',
      data: { id },
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Frontend (Angular)

The frontend service includes WebSocket subscription:

```typescript
// notifications.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private wsService = inject(WebSocketService);

  // Observable for real-time events
  readonly events$ = this.wsService.on<NotificationEvent>('notifications');

  // Subscribe to specific actions
  readonly created$ = this.events$.pipe(filter((event) => event.action === 'created'));

  readonly updated$ = this.events$.pipe(filter((event) => event.action === 'updated'));

  readonly deleted$ = this.events$.pipe(filter((event) => event.action === 'deleted'));
}
```

The component automatically refreshes data on events:

```typescript
// notifications.component.ts
export class NotificationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Auto-refresh on any event
    this.service.events$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Event Types

### Standard CRUD Events

| Event              | Trigger      | Payload                                      |
| ------------------ | ------------ | -------------------------------------------- |
| `{module}.created` | After create | `{ action: 'created', data: newRecord }`     |
| `{module}.updated` | After update | `{ action: 'updated', data: updatedRecord }` |
| `{module}.deleted` | After delete | `{ action: 'deleted', data: { id } }`        |

### Bulk Operation Events

| Event                   | Trigger           | Payload                                                |
| ----------------------- | ----------------- | ------------------------------------------------------ |
| `{module}.bulk_created` | After bulk create | `{ action: 'bulk_created', data: records[], count }`   |
| `{module}.bulk_updated` | After bulk update | `{ action: 'bulk_updated', data: { ids: [] }, count }` |
| `{module}.bulk_deleted` | After bulk delete | `{ action: 'bulk_deleted', data: { ids: [] }, count }` |

### Status Events

| Event                     | Trigger             | Payload                                                            |
| ------------------------- | ------------------- | ------------------------------------------------------------------ |
| `{module}.status_changed` | After status change | `{ action: 'status_changed', data: { id, oldStatus, newStatus } }` |

---

## HIS Mode (Hospital Information System)

For critical systems, AegisX uses **HIS Mode** by default:

### Key Principles

1. **Backend Always Emits Events**
   - Events are emitted for audit trail regardless of frontend mode
   - No data loss in event history

2. **Frontend Shows Actual Data**
   - After CRUD operations, UI refreshes from database
   - No optimistic updates that could show stale data
   - User always sees actual database state

3. **Optional Real-Time Mode**
   - Real-time updates can be enabled when needed
   - Toggle in component configuration

### Configuration

```typescript
// notifications.component.ts
export class NotificationsComponent {
  // HIS Mode: Refresh from API after events (default)
  enableRealTimeRefresh = false;

  // Enable real-time mode when needed
  toggleRealTime() {
    this.enableRealTimeRefresh = !this.enableRealTimeRefresh;
  }
}
```

---

## Backend Setup

### Required Dependencies

Your Fastify app needs EventEmitter2:

```typescript
// app.ts
import { EventEmitter2 } from 'eventemitter2';

const eventEmitter = new EventEmitter2();
fastify.decorate('eventEmitter', eventEmitter);
```

### WebSocket Gateway

Events are broadcast via WebSocket:

```typescript
// ws-gateway.ts
eventEmitter.on('*', (event, data) => {
  wsServer.broadcast({
    event,
    data,
    timestamp: new Date().toISOString(),
  });
});
```

---

## Frontend Setup

### WebSocket Service

Your Angular app needs a WebSocket service:

```typescript
// websocket.service.ts
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$ = webSocket<WsMessage>('ws://localhost:3333/ws');

  on<T>(channel: string): Observable<T> {
    return this.socket$.pipe(
      filter((msg) => msg.event.startsWith(channel)),
      map((msg) => msg.data as T),
    );
  }
}
```

---

## Usage Examples

### 1. Basic Real-Time List

```typescript
@Component({...})
export class ProductsComponent implements OnInit {
  products$ = this.service.findAll();

  constructor(private service: ProductsService) {}

  ngOnInit() {
    // Refresh list when any product event occurs
    this.service.events$.subscribe(() => {
      this.products$ = this.service.findAll();
    });
  }
}
```

### 2. Toast Notifications on Events

```typescript
ngOnInit() {
  this.service.created$.subscribe(event => {
    this.snackBar.open(`Product created: ${event.data.name}`, 'Close');
  });

  this.service.deleted$.subscribe(event => {
    this.snackBar.open('Product deleted', 'Close');
  });
}
```

### 3. Dashboard Stats Update

```typescript
@Component({...})
export class DashboardComponent {
  stats$ = this.statsService.getStats();

  constructor(
    private statsService: StatsService,
    private productsService: ProductsService
  ) {
    // Refresh stats when products change
    this.productsService.events$.subscribe(() => {
      this.stats$ = this.statsService.getStats();
    });
  }
}
```

---

## Best Practices

### DO

- Use events for notifications and dashboard updates
- Refresh critical data from API after events
- Handle connection errors gracefully
- Clean up subscriptions on component destroy

### DON'T

- Use optimistic updates for critical data
- Trust event data without API verification
- Keep stale data visible to users
- Ignore WebSocket connection status

---

## Troubleshooting

### Events Not Received

1. Check WebSocket connection status
2. Verify event channel name matches
3. Check backend is emitting events
4. Verify CORS settings for WebSocket

### Duplicate Events

1. Ensure subscriptions are cleaned up
2. Check for multiple WebSocket connections
3. Verify takeUntil is used properly

### Performance Issues

1. Debounce rapid events
2. Use distinctUntilChanged for repeated data
3. Consider pagination for large lists

---

## Event Payload Interface

```typescript
interface CrudEvent<T> {
  action: 'created' | 'updated' | 'deleted' | 'bulk_created' | 'bulk_updated' | 'bulk_deleted';
  data: T;
  timestamp: string;
  userId?: string;
}
```

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
