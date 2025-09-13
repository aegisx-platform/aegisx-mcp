# Multi-Feature WebSocket System

> **🚀 Universal Real-time System** - WebSocket system ที่ใช้ได้กับทุก feature ในระบบ

**Last Updated**: 2025-09-13  
**Version**: v1.0  

---

## 🎯 Overview

ระบบ WebSocket ที่ออกแบบให้ใช้งานได้กับทุก feature ในแอปพลิเคชัน โดยไม่ต้องเขียนโค้ดซ้ำสำหรับแต่ละ feature

### Core Components
- **WebSocketService** (Frontend) - จัดการการเชื่อมต่อและ subscription
- **WebSocketGateway** (Backend) - จัดการ WebSocket connections
- **EventService** (Backend) - ส่ง events จากทุก feature

---

## 🏗️ Architecture

### Event Message Format
```typescript
// TypeBox Schema สำหรับ WebSocket messages
export const WebSocketMessageSchema = Type.Object({
  feature: Type.String(),  // 'rbac', 'users', 'products', 'orders'
  entity: Type.String(),   // 'role', 'user', 'product', 'order'
  action: Type.String(),   // 'created', 'updated', 'deleted', 'assigned'
  data: Type.Any(),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    userId: Type.String({ format: 'uuid' }),
    sessionId: Type.String(),
    featureVersion: Type.String(),
    priority: Type.Union([
      Type.Literal('low'),
      Type.Literal('normal'),
      Type.Literal('high'),
      Type.Literal('critical')
    ])
  })
});

// Frontend TypeScript Interface
interface WebSocketMessage {
  feature: string;
  entity: string;
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

### Event Naming Convention
```
Format: {feature}.{entity}.{action}

Examples:
- rbac.role.created
- rbac.role.updated
- rbac.permission.assigned
- users.user.created
- users.profile.updated
- products.product.created
- products.inventory.updated
- orders.order.created
- orders.payment.completed
```

---

## 🖥️ Frontend Implementation

### WebSocket Service
```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket?: WebSocket;
  private subscriptions = new Map<string, Subject<WebSocketMessage>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  connect(token: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.socket = new WebSocket(`ws://localhost:3333/ws?token=${token}`);
    
    this.socket.onopen = () => {
      this.connectionStatus$.next('connected');
      this.reconnectAttempts = 0;
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.routeMessage(message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      this.connectionStatus$.next('disconnected');
      this.attemptReconnect(token);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  // Subscribe to specific feature events
  subscribeToFeature(feature: string): Observable<WebSocketMessage> {
    if (!this.subscriptions.has(feature)) {
      this.subscriptions.set(feature, new Subject<WebSocketMessage>());
    }
    return this.subscriptions.get(feature)!.asObservable();
  }
  
  // Subscribe to specific entity within feature
  subscribeToEntity(feature: string, entity: string): Observable<WebSocketMessage> {
    return this.subscribeToFeature(feature).pipe(
      filter(message => message.entity === entity)
    );
  }
  
  // Subscribe to specific event type
  subscribeToEvent(feature: string, entity: string, action: string): Observable<any> {
    return this.subscribeToEntity(feature, entity).pipe(
      filter(message => message.action === action),
      map(message => message.data)
    );
  }
  
  // Send WebSocket message
  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
  
  private routeMessage(message: WebSocketMessage): void {
    const featureSubject = this.subscriptions.get(message.feature);
    if (featureSubject) {
      featureSubject.next(message);
    }
  }
  
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.connectionStatus$.next('reconnecting');
    this.reconnectAttempts++;
    
    setTimeout(() => {
      this.connect(token);
    }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.subscriptions.clear();
  }
}
```

### Generic State Manager Base Class
```typescript
export abstract class BaseRealtimeStateManager<T extends { id: string }> {
  protected items = signal<T[]>([]);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  
  constructor(
    protected websocket: WebSocketService,
    protected feature: string,
    protected entity: string
  ) {
    this.setupWebSocketSubscriptions();
  }
  
  private setupWebSocketSubscriptions(): void {
    // Created events
    this.websocket.subscribeToEvent(this.feature, this.entity, 'created')
      .subscribe(data => this.handleItemCreated(data));
    
    // Updated events
    this.websocket.subscribeToEvent(this.feature, this.entity, 'updated')
      .subscribe(data => this.handleItemUpdated(data));
    
    // Deleted events
    this.websocket.subscribeToEvent(this.feature, this.entity, 'deleted')
      .subscribe(data => this.handleItemDeleted(data));
  }
  
  protected handleItemCreated(item: T): void {
    this.items.update(items => [...items, item]);
  }
  
  protected handleItemUpdated(item: T): void {
    this.items.update(items =>
      items.map(existing => existing.id === item.id ? item : existing)
    );
  }
  
  protected handleItemDeleted(data: { id: string }): void {
    this.items.update(items => items.filter(item => item.id !== data.id));
  }
  
  // Optimistic update pattern
  async performOptimisticUpdate(
    id: string,
    updates: Partial<T>,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const originalItem = this.applyOptimisticUpdate(id, updates);
    
    try {
      const result = await apiCall();
      this.replaceOptimisticUpdate(id, result);
      return result;
    } catch (error) {
      this.revertOptimisticUpdate(id, originalItem);
      throw error;
    }
  }
  
  private applyOptimisticUpdate(id: string, updates: Partial<T>): T {
    let originalItem: T;
    
    this.items.update(items =>
      items.map(item => {
        if (item.id === id) {
          originalItem = item;
          return { ...item, ...updates, isLoading: true } as T;
        }
        return item;
      })
    );
    
    return originalItem!;
  }
  
  private replaceOptimisticUpdate(id: string, serverItem: T): void {
    this.items.update(items =>
      items.map(item => 
        item.id === id 
          ? { ...serverItem, isLoading: false } as T
          : item
      )
    );
  }
  
  private revertOptimisticUpdate(id: string, originalItem: T): void {
    this.items.update(items =>
      items.map(item => item.id === id ? originalItem : item)
    );
  }
}
```

### Feature-Specific Implementation Example
```typescript
// RBAC State Manager
export class RbacStateManager extends BaseRealtimeStateManager<Role> {
  constructor(websocket: WebSocketService) {
    super(websocket, 'rbac', 'role');
  }
  
  // Override if needed for custom behavior
  protected handleItemUpdated(role: Role): void {
    super.handleItemUpdated(role);
    
    // Custom RBAC logic
    this.invalidatePermissionCache(role.id);
    this.checkForConflicts(role);
  }
  
  private invalidatePermissionCache(roleId: string): void {
    // RBAC-specific cache invalidation
  }
  
  private checkForConflicts(role: Role): void {
    // RBAC-specific conflict detection
  }
}

// Users State Manager
export class UsersStateManager extends BaseRealtimeStateManager<User> {
  constructor(websocket: WebSocketService) {
    super(websocket, 'users', 'user');
  }
  
  protected handleItemUpdated(user: User): void {
    super.handleItemUpdated(user);
    
    // Custom Users logic
    this.updateUserSessions(user);
  }
  
  private updateUserSessions(user: User): void {
    // Users-specific session management
  }
}
```

---

## 🔧 Backend Implementation

### WebSocket Gateway
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true
  }
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients = new Map<string, { socket: Socket; features: string[] }>();
  
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }
  
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }
  
  @SubscribeMessage('subscribe')
  handleSubscription(client: Socket, payload: { features: string[] }) {
    this.clients.set(client.id, {
      socket: client,
      features: payload.features
    });
    
    console.log(`Client ${client.id} subscribed to features: ${payload.features.join(', ')}`);
  }
  
  @SubscribeMessage('unsubscribe')
  handleUnsubscription(client: Socket, payload: { features: string[] }) {
    const clientData = this.clients.get(client.id);
    if (clientData) {
      clientData.features = clientData.features.filter(
        feature => !payload.features.includes(feature)
      );
    }
  }
  
  // Broadcast to all clients subscribed to a feature
  broadcastToFeature(feature: string, message: WebSocketMessage): void {
    for (const [clientId, clientData] of this.clients) {
      if (clientData.features.includes(feature)) {
        clientData.socket.emit('message', message);
      }
    }
  }
  
  // Broadcast to specific client
  broadcastToClient(clientId: string, message: WebSocketMessage): void {
    const clientData = this.clients.get(clientId);
    if (clientData) {
      clientData.socket.emit('message', message);
    }
  }
  
  // Get connected clients for a feature
  getFeatureClients(feature: string): string[] {
    const clients: string[] = [];
    for (const [clientId, clientData] of this.clients) {
      if (clientData.features.includes(feature)) {
        clients.push(clientId);
      }
    }
    return clients;
  }
}
```

### Event Service
```typescript
@Injectable()
export class EventService {
  constructor(
    private gateway: WebSocketGateway,
    private request: FastifyRequest // To get current user context
  ) {}
  
  // Emit event to all subscribers of a feature
  emit(
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    const message: WebSocketMessage = {
      feature,
      entity,
      action,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
        featureVersion: this.getFeatureVersion(feature),
        priority
      }
    };
    
    this.gateway.broadcastToFeature(feature, message);
  }
  
  // Convenience methods
  emitCreated(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'created', data, 'normal');
  }
  
  emitUpdated(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'updated', data, 'normal');
  }
  
  emitDeleted(feature: string, entity: string, id: string): void {
    this.emit(feature, entity, 'deleted', { id }, 'normal');
  }
  
  emitAssigned(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'assigned', data, 'high');
  }
  
  emitRevoked(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'revoked', data, 'high');
  }
  
  private getCurrentUserId(): string {
    return this.request.user?.id || 'system';
  }
  
  private getCurrentSessionId(): string {
    return this.request.session?.id || 'unknown';
  }
  
  private getFeatureVersion(feature: string): string {
    const versions = {
      rbac: '1.0',
      users: '1.0',
      products: '1.0',
      orders: '1.0'
    };
    return versions[feature] || '1.0';
  }
}
```

---

## 🔌 Feature Integration

### How to Use in Any Feature

#### 1. Backend Service Integration
```typescript
// Example: RBAC Role Service
@Injectable()
export class RoleService {
  constructor(
    private roleRepository: RoleRepository,
    private eventService: EventService
  ) {}
  
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const role = await this.roleRepository.create(data);
    
    // Emit WebSocket event
    this.eventService.emitCreated('rbac', 'role', role);
    
    return role;
  }
  
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const role = await this.roleRepository.update(id, data);
    
    // Emit WebSocket event
    this.eventService.emitUpdated('rbac', 'role', role);
    
    return role;
  }
  
  async deleteRole(id: string): Promise<void> {
    await this.roleRepository.delete(id);
    
    // Emit WebSocket event
    this.eventService.emitDeleted('rbac', 'role', id);
  }
}
```

#### 2. Frontend Component Integration
```typescript
@Component({
  selector: 'app-role-list',
  template: `
    <div class="role-list">
      <div *ngFor="let role of roles(); trackBy: trackByRole" 
           [class.loading]="role.isLoading"
           class="role-item">
        {{ role.name }}
        <span *ngIf="role.isLoading" class="loading-indicator">...</span>
      </div>
    </div>
  `
})
export class RoleListComponent implements OnInit, OnDestroy {
  roleManager = inject(RbacStateManager);
  
  roles = this.roleManager.items;
  
  ngOnInit() {
    // State manager automatically handles WebSocket subscriptions
    this.loadRoles();
  }
  
  async updateRole(id: string, data: Partial<Role>) {
    try {
      await this.roleManager.performOptimisticUpdate(
        id,
        data,
        () => this.roleService.updateRole(id, data)
      );
    } catch (error) {
      // Error handling - optimistic update already reverted
      this.notificationService.error('Failed to update role');
    }
  }
  
  trackByRole(index: number, role: Role): string {
    return role.id;
  }
}
```

---

## 📋 Feature Implementation Checklist

สำหรับ feature ใหม่ที่ต้องการ real-time updates:

### Backend
- [ ] Add EventService to feature service constructors
- [ ] Call `eventService.emitCreated()` after create operations
- [ ] Call `eventService.emitUpdated()` after update operations  
- [ ] Call `eventService.emitDeleted()` after delete operations
- [ ] Call `eventService.emitAssigned()` for assignment operations
- [ ] Add feature-specific event types if needed

### Frontend
- [ ] Create state manager extending `BaseRealtimeStateManager`
- [ ] Define feature, entity, and action constants
- [ ] Implement components using the state manager
- [ ] Add optimistic updates for better UX
- [ ] Handle loading and error states
- [ ] Add conflict resolution if needed

---

## 🎯 Supported Features

### Current Features
- **RBAC**: Roles, permissions, user assignments
- **Users**: User profiles, status changes
- **Products**: Inventory, pricing updates
- **Orders**: Order status, payment updates

### Future Features
- **Notifications**: Real-time message delivery
- **Analytics**: Live dashboard updates
- **Settings**: Configuration changes
- **Chat**: Real-time messaging

---

## 🚀 Performance Considerations

### Connection Management
- Single WebSocket connection per client
- Feature-based subscription model
- Automatic reconnection with exponential backoff
- Connection pooling on server side

### Event Filtering
- Client-side filtering by feature/entity/action
- Server-side subscription management
- Efficient event routing
- Message queuing for offline clients

### Caching & Optimization
- Local state caching with WebSocket updates
- Optimistic updates for immediate feedback
- Conflict detection and resolution
- Batch updates for bulk operations

---

## 🔧 Configuration

### Environment Variables
```bash
# WebSocket Configuration
WEBSOCKET_PORT=3333
WEBSOCKET_PATH=/ws
WEBSOCKET_CORS_ORIGIN=http://localhost:4200

# Connection Settings
WEBSOCKET_MAX_CONNECTIONS=1000
WEBSOCKET_HEARTBEAT_INTERVAL=30000
WEBSOCKET_CONNECTION_TIMEOUT=60000
```

### Feature Configuration
```typescript
// Feature registration
export const WEBSOCKET_FEATURES = {
  rbac: {
    entities: ['role', 'permission', 'user_role'],
    actions: ['created', 'updated', 'deleted', 'assigned', 'revoked'],
    priority: 'high'
  },
  users: {
    entities: ['user', 'profile', 'session'],
    actions: ['created', 'updated', 'deleted', 'activated', 'deactivated'],
    priority: 'normal'
  },
  products: {
    entities: ['product', 'inventory', 'pricing'],
    actions: ['created', 'updated', 'deleted', 'stock_changed', 'price_updated'],
    priority: 'normal'
  },
  orders: {
    entities: ['order', 'payment', 'shipment'],
    actions: ['created', 'updated', 'cancelled', 'paid', 'shipped', 'delivered'],
    priority: 'high'
  }
} as const;
```

---

## 🧪 Testing

### WebSocket Service Testing
```typescript
describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: jasmine.SpyObj<WebSocket>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketService);
  });
  
  it('should connect to WebSocket', () => {
    service.connect('test-token');
    expect(service.connectionStatus$.value).toBe('connected');
  });
  
  it('should route messages to correct feature', () => {
    const message: WebSocketMessage = {
      feature: 'rbac',
      entity: 'role',
      action: 'created',
      data: { id: '1', name: 'Test Role' },
      meta: { /* ... */ }
    };
    
    service.subscribeToFeature('rbac').subscribe(received => {
      expect(received).toEqual(message);
    });
    
    // Simulate message receipt
    service['routeMessage'](message);
  });
});
```

### State Manager Testing
```typescript
describe('BaseRealtimeStateManager', () => {
  let stateManager: TestStateManager;
  let websocketService: jasmine.SpyObj<WebSocketService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('WebSocketService', ['subscribeToEvent']);
    stateManager = new TestStateManager(spy, 'test', 'entity');
  });
  
  it('should handle item created events', () => {
    const newItem = { id: '1', name: 'Test Item' };
    stateManager['handleItemCreated'](newItem);
    
    expect(stateManager.items()).toContain(newItem);
  });
  
  it('should perform optimistic updates', async () => {
    const item = { id: '1', name: 'Original' };
    stateManager.items.set([item]);
    
    const apiCall = jasmine.createSpy().and.returnValue(
      Promise.resolve({ id: '1', name: 'Updated' })
    );
    
    await stateManager.performOptimisticUpdate('1', { name: 'Optimistic' }, apiCall);
    
    expect(stateManager.items()[0].name).toBe('Updated');
  });
});
```

---

## 📚 Migration Guide

### จาก RBAC-specific WebSocket

#### Before (RBAC-specific)
```typescript
export class RbacWebSocketService {
  subscribeToRoleUpdates() { /* ... */ }
  subscribeToPermissionUpdates() { /* ... */ }
}
```

#### After (Generic)
```typescript
export class RbacStateManager extends BaseRealtimeStateManager<Role> {
  constructor(websocket: WebSocketService) {
    super(websocket, 'rbac', 'role');
  }
}
```

### Migration Steps
1. Replace feature-specific WebSocket services with generic WebSocketService
2. Create state managers extending BaseRealtimeStateManager
3. Update components to use new state managers
4. Update backend services to use EventService
5. Test all real-time functionality

---

## 🎯 Best Practices

### Do's ✅
- Use optimistic updates for better UX
- Implement proper error handling and rollback
- Filter events on client side for performance
- Use Signal-based state management
- Handle connection failures gracefully
- Implement conflict resolution for concurrent edits

### Don'ts ❌
- Don't send sensitive data through WebSocket
- Don't create multiple WebSocket connections
- Don't ignore connection status
- Don't forget to unsubscribe from observables
- Don't emit events for every small change
- Don't block UI while waiting for events

---

## 🔍 Troubleshooting

### Common Issues

#### WebSocket Connection Fails
```typescript
// Check CORS configuration
// Verify WebSocket URL and port
// Check authentication token
```

#### Events Not Received
```typescript
// Verify subscription to correct feature
// Check message routing logic
// Ensure backend is emitting events
```

#### Memory Leaks
```typescript
// Unsubscribe from observables in ngOnDestroy
// Clear signal subscriptions
// Close WebSocket connections properly
```

#### Performance Issues
```typescript
// Implement client-side filtering
// Use trackBy functions in *ngFor
// Limit concurrent connections
// Batch similar events
```

---

ระบบ WebSocket นี้ให้พื้นฐานที่แข็งแกร่งสำหรับ real-time features ใดๆ ในแอปพลิเคชัน โดยไม่ต้องเขียนโค้ดซ้ำและมี type safety ครบถ้วน 🚀