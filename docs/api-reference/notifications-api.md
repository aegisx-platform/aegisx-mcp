# 📢 Notifications API Reference

Complete API reference for the **Notifications module** - generated using Enhanced CRUD Generator with **Full Package + WebSocket Events**.

## 🎯 Overview

This serves as the **reference implementation** and **test case** for both backend CRUD generation and upcoming frontend CRUD generation.

### Generated Configuration

```bash
# Generation command used:
node tools/crud-generator/index.js generate notifications --package full --with-events --force

# Generated structure:
apps/api/src/modules/notifications/
├── controllers/notifications.controller.ts  # ✅ 10,228 chars
├── services/notifications.service.ts        # ✅ 11,150 chars
├── repositories/notifications.repository.ts # ✅ 8,291 chars
├── schemas/notifications.schemas.ts         # ✅ 5,729 chars
├── types/notifications.types.ts            # ✅ 2,072 chars
├── routes/index.ts                         # ✅ 9,163 chars
├── __tests__/notifications.test.ts        # ✅ 6,746 chars
└── index.ts                               # ✅ 3,697 chars

# Plus permissions migration:
apps/api/src/database/migrations/
└── 20250928060607_add_notifications_permissions.ts
```

## 🔗 Complete API Endpoints

### 🎯 Standard CRUD Operations

| Method   | Endpoint                 | Description                    | Auth Required             |
| -------- | ------------------------ | ------------------------------ | ------------------------- |
| `POST`   | `/api/notifications`     | Create notification            | ✅ `notifications.create` |
| `GET`    | `/api/notifications/:id` | Get single notification        | ✅ `notifications.read`   |
| `GET`    | `/api/notifications`     | List notifications (paginated) | ✅ `notifications.read`   |
| `PUT`    | `/api/notifications/:id` | Update notification            | ✅ `notifications.update` |
| `DELETE` | `/api/notifications/:id` | Delete notification            | ✅ `notifications.delete` |

### 🚀 Enhanced Operations (Enterprise Package)

| Method   | Endpoint                      | Description      | Auth Required             |
| -------- | ----------------------------- | ---------------- | ------------------------- |
| `GET`    | `/api/notifications/dropdown` | Dropdown options | ✅ `notifications.read`   |
| `POST`   | `/api/notifications/bulk`     | Bulk create      | ✅ `notifications.create` |
| `PUT`    | `/api/notifications/bulk`     | Bulk update      | ✅ `notifications.update` |
| `DELETE` | `/api/notifications/bulk`     | Bulk delete      | ✅ `notifications.delete` |

### 🎨 Advanced Operations (Full Package)

| Method | Endpoint                          | Description      | Auth Required                     |
| ------ | --------------------------------- | ---------------- | --------------------------------- |
| `POST` | `/api/notifications/validate`     | Validate data    | ✅ `notifications.create\|update` |
| `GET`  | `/api/notifications/check/:field` | Check uniqueness | ✅ `notifications.read`           |
| `GET`  | `/api/notifications/stats`        | Get statistics   | ✅ `notifications.read`           |

## 📊 TypeBox Schema Reference

### Core Data Model

```typescript
// Notification entity (from database schema)
interface Notification {
  id: string; // UUID (auto-generated)
  user_id: string; // UUID (required)
  type: string; // required
  title: string; // required
  message: string; // required
  data?: Record<string, any>; // optional JSON
  action_url?: string; // optional
  read?: boolean; // optional (default: false)
  read_at?: string; // datetime
  archived?: boolean; // optional (default: false)
  archived_at?: string; // datetime
  priority?: string; // optional
  expires_at?: string; // datetime
  created_at: string; // auto-generated
  updated_at: string; // auto-generated
}
```

### Request Schemas

```typescript
// Create notification request
interface CreateNotificationRequest {
  user_id: string; // required
  type: string; // required
  title: string; // required
  message: string; // required
  data?: Record<string, any>; // optional
  action_url?: string; // optional
  read?: boolean; // optional
  priority?: string; // optional
  expires_at?: string; // optional
}

// Update notification request
interface UpdateNotificationRequest {
  user_id?: string; // optional
  type?: string; // optional
  title?: string; // optional
  message?: string; // optional
  data?: Record<string, any>; // optional
  action_url?: string; // optional
  read?: boolean; // optional
  archived?: boolean; // optional
  priority?: string; // optional
  expires_at?: string; // optional
}

// List query parameters
interface ListNotificationsQuery {
  page?: number; // default: 1
  limit?: number; // default: 10, max: 100
  sort?: string; // default: 'created_at'
  order?: 'asc' | 'desc'; // default: 'desc'
  search?: string; // search in title, message
  user_id?: string; // filter by user
  type?: string; // filter by type
  read?: boolean; // filter by read status
  archived?: boolean; // filter by archived status
  priority?: string; // filter by priority
}
```

### Response Schemas

```typescript
// Standard API response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

// Paginated response
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

// Bulk operation response
interface BulkResponse<T> {
  success: true;
  data: {
    processed: T[];
    summary: {
      successful: number;
      failed: number;
      errors: Array<{
        item: any;
        error: string;
      }>;
    };
  };
}
```

## ⚡ WebSocket Events Integration

### Event Types

All CRUD operations automatically emit WebSocket events:

```typescript
// Event structure
interface WebSocketMessage {
  feature: 'notifications';
  entity: 'notifications';
  action: string;
  data: any;
  meta: {
    timestamp: string;
    userId: string;
    sessionId: string;
    featureVersion: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
}
```

### Standard Events

| Event                     | Trigger                         | Data                        |
| ------------------------- | ------------------------------- | --------------------------- |
| `notifications.created`   | POST `/api/notifications`       | Full notification object    |
| `notifications.updated`   | PUT `/api/notifications/:id`    | Updated notification object |
| `notifications.deleted`   | DELETE `/api/notifications/:id` | Deleted notification ID     |
| `notifications.read`      | GET `/api/notifications/:id`    | Notification object         |
| `notifications.bulk_read` | GET `/api/notifications`        | `{ count, filters }`        |

### Custom Events

| Event                        | Trigger                          | Data                |
| ---------------------------- | -------------------------------- | ------------------- |
| `notifications.bulk_created` | POST `/api/notifications/bulk`   | Bulk result summary |
| `notifications.bulk_updated` | PUT `/api/notifications/bulk`    | Bulk result summary |
| `notifications.bulk_deleted` | DELETE `/api/notifications/bulk` | Bulk result summary |

## 🔐 Permission System

### Generated Permissions

```typescript
// Auto-generated permissions
const permissions = [
  {
    name: 'notifications.create',
    description: 'Create notifications',
    resource: 'notifications',
    action: 'create',
  },
  {
    name: 'notifications.read',
    description: 'Read notifications',
    resource: 'notifications',
    action: 'read',
  },
  {
    name: 'notifications.update',
    description: 'Update notifications',
    resource: 'notifications',
    action: 'update',
  },
  {
    name: 'notifications.delete',
    description: 'Delete notifications',
    resource: 'notifications',
    action: 'delete',
  },
];

// Auto-generated role
const role = {
  name: 'notifications',
  description: 'Access to notifications',
  permissions: ['notifications.create', 'notifications.read', 'notifications.update', 'notifications.delete'],
};
```

### Authorization Examples

```typescript
// Route protection examples
fastify.post('/', {
  preValidation: [fastify.authenticate, fastify.authorize(['notifications.create', 'admin'])],
  handler: controller.create,
});

fastify.get('/', {
  preValidation: [fastify.authenticate, fastify.authorize(['notifications.read', 'admin'])],
  handler: controller.findMany,
});
```

## 🎯 API Usage Examples

### Create Notification

```bash
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "info",
  "title": "Welcome to AegisX!",
  "message": "Thank you for joining our platform.",
  "data": {
    "welcome_bonus": 100,
    "tutorial_url": "/tutorial"
  },
  "action_url": "/dashboard",
  "priority": "high"
}
```

### List Notifications (Paginated)

```bash
GET /api/notifications?page=1&limit=10&type=info&read=false
Authorization: Bearer <token>
```

### Bulk Create

```bash
POST /api/notifications/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "user_id": "user1",
      "type": "welcome",
      "title": "Welcome!",
      "message": "Welcome to our platform"
    },
    {
      "user_id": "user2",
      "type": "info",
      "title": "Update Available",
      "message": "New features are available"
    }
  ]
}
```

### WebSocket Subscription

```typescript
// Frontend WebSocket usage
const socket = io('ws://localhost:3333');

// Subscribe to notifications events
socket.on('message', (message: WebSocketMessage) => {
  if (message.feature === 'notifications') {
    switch (message.action) {
      case 'created':
        console.log('New notification:', message.data);
        break;
      case 'updated':
        console.log('Notification updated:', message.data);
        break;
      case 'deleted':
        console.log('Notification deleted:', message.data);
        break;
    }
  }
});
```

## 📋 Frontend CRUD Requirements

Based on this API structure, the **Frontend CRUD Generator** should generate:

### 🎯 Angular Service

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  // Standard HTTP operations
  create(data: CreateNotificationRequest): Observable<ApiResponse<Notification>>;
  findMany(query?: ListNotificationsQuery): Observable<PaginatedResponse<Notification>>;
  findOne(id: string): Observable<ApiResponse<Notification>>;
  update(id: string, data: UpdateNotificationRequest): Observable<ApiResponse<Notification>>;
  delete(id: string): Observable<ApiResponse<boolean>>;

  // Enhanced operations
  getDropdownOptions(): Observable<ApiResponse<DropdownOption[]>>;
  bulkCreate(items: CreateNotificationRequest[]): Observable<BulkResponse<Notification>>;
  bulkUpdate(items: Array<{ id: string; data: UpdateNotificationRequest }>): Observable<BulkResponse<Notification>>;
  bulkDelete(ids: string[]): Observable<BulkResponse<Notification>>;

  // Advanced operations (Full package)
  validate(data: CreateNotificationRequest): Observable<ValidationResponse>;
  checkUniqueness(field: string, value: string): Observable<UniquenessResponse>;
  getStats(): Observable<ApiResponse<StatisticsResponse>>;
}
```

### 🎯 Real-time Service (Optional)

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationsRealtimeService extends BaseRealtimeStateManager<Notification> {
  constructor() {
    super({
      feature: 'notifications',
      entity: 'notifications',
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
    });
  }

  // Auto real-time state management
  readonly notifications = computed(() => this.localState());
  readonly isConnected = computed(() => this.connectionStatus().status === 'connected');
  readonly hasConflicts = computed(() => this.conflicts().size > 0);
}
```

### 🎯 Components

- **NotificationsListComponent** - Table/card view with pagination
- **NotificationFormDialogComponent** - Create/edit modal
- **NotificationDetailsComponent** - View single notification
- **NotificationsBulkActionsComponent** - Bulk operations toolbar

### 🎯 Features to Include

1. **Search & Filtering** - By type, read status, priority
2. **Pagination** - Table pagination with configurable page sizes
3. **Sorting** - Click column headers to sort
4. **Bulk Selection** - Select multiple items for bulk actions
5. **Real-time Updates** - Live notifications (if WebSocket enabled)
6. **Optimistic UI** - Instant feedback for user actions
7. **Error Handling** - Toast notifications for errors
8. **Loading States** - Spinners and skeleton loading

## 🚀 Next Steps

1. **✅ Backend Complete** - Full notifications API with events
2. **🎯 Frontend Generator** - Create Angular CRUD generator
3. **🧪 Test Integration** - Verify frontend ↔ backend communication
4. **📚 Documentation** - Complete API ↔ Frontend guide
5. **🎨 UI/UX Polish** - Material Design + TailwindCSS styling

---

**This notifications module serves as the complete reference implementation for:**

- ✅ **Backend CRUD API** generation
- 🎯 **Frontend CRUD** generation (next)
- ⚡ **Real-time WebSocket** integration
- 🔐 **Permission-based** authorization
- 📊 **Type-safe** development
