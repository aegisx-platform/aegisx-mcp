# Real-time WebSocket Integration Template

> **📋 Template สำหรับเพิ่ม Real-time capabilities ให้กับ feature ใหม่**

## 🎯 Overview

Template นี้แสดงวิธีการเพิ่ม real-time WebSocket integration ให้กับ feature ใหม่ โดยใช้ระบบ WebSocket ที่สร้างไว้แล้ว

---

## 🔧 Backend Integration

### 1. Service Integration

```typescript
// apps/api/src/modules/{FEATURE}/{FEATURE}.service.ts
import { Injectable } from '@nestjs/common';
import { EventService } from '../../shared/websocket/event.service';
import { {ENTITY}Repository } from './{FEATURE}.repository';

@Injectable()
export class {FEATURE}Service {
  constructor(
    private readonly {ENTITY}Repository: {ENTITY}Repository,
    private readonly eventService: EventService
  ) {}

  async create{ENTITY}(data: Create{ENTITY}Request): Promise<{ENTITY}> {
    const {ENTITY} = await this.{ENTITY}Repository.create(data);

    // 🔄 Emit real-time event
    this.eventService.emitCreated('{FEATURE}', '{ENTITY}', {ENTITY});

    return {ENTITY};
  }

  async update{ENTITY}(id: string, data: Update{ENTITY}Request): Promise<{ENTITY}> {
    const {ENTITY} = await this.{ENTITY}Repository.update(id, data);

    // 🔄 Emit real-time event
    this.eventService.emitUpdated('{FEATURE}', '{ENTITY}', {ENTITY});

    return {ENTITY};
  }

  async delete{ENTITY}(id: string): Promise<void> {
    await this.{ENTITY}Repository.delete(id);

    // 🔄 Emit real-time event
    this.eventService.emitDeleted('{FEATURE}', '{ENTITY}', id);
  }

  // Bulk operations
  async bulkUpdate{ENTITY}s(
    updates: Array<{ id: string; data: Update{ENTITY}Request }>
  ): Promise<{ENTITY}[]> {
    const operationId = `bulk_update_${Date.now()}`;

    // 🔄 Emit bulk started event
    this.eventService.emitBulkStarted('{FEATURE}', '{ENTITY}', {
      operationId,
      total: updates.length,
      operation: 'update'
    });

    const results: {ENTITY}[] = [];
    let completed = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        const result = await this.update{ENTITY}(update.id, update.data);
        results.push(result);
        completed++;
      } catch (error) {
        failed++;
      }

      // 🔄 Emit progress event
      this.eventService.emitBulkProgress('{FEATURE}', '{ENTITY}', {
        operationId,
        progress: {
          total: updates.length,
          completed,
          failed,
          percentage: Math.round((completed + failed) / updates.length * 100)
        }
      });
    }

    // 🔄 Emit bulk completed event
    this.eventService.emitBulkCompleted('{FEATURE}', '{ENTITY}', {
      operationId,
      results: { successful: completed, failed }
    });

    return results;
  }

  // Feature-specific events
  async approve{ENTITY}(id: string, approvedBy: string): Promise<{ENTITY}> {
    const {ENTITY} = await this.{ENTITY}Repository.update(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    });

    // 🔄 Emit custom event
    this.eventService.emit('{FEATURE}', '{ENTITY}', 'approved', {
      ...{ENTITY},
      approvedBy
    }, 'high');

    return {ENTITY};
  }
}
```

### 2. Feature-Specific Event Methods

```typescript
// apps/api/src/shared/websocket/event.service.ts
// Add to EventService class:

// {FEATURE} Events
{FEATURE} = {
  {ENTITY}Created: ({ENTITY}: any) => this.emitCreated('{FEATURE}', '{ENTITY}', {ENTITY}),
  {ENTITY}Updated: ({ENTITY}: any) => this.emitUpdated('{FEATURE}', '{ENTITY}', {ENTITY}),
  {ENTITY}Deleted: ({ENTITY}Id: string) => this.emitDeleted('{FEATURE}', '{ENTITY}', {ENTITY}Id),
  {ENTITY}Approved: (data: { {ENTITY}Id: string; approvedBy: string }) =>
    this.emit('{FEATURE}', '{ENTITY}', 'approved', data, 'high'),
  {ENTITY}Rejected: (data: { {ENTITY}Id: string; rejectedBy: string; reason: string }) =>
    this.emit('{FEATURE}', '{ENTITY}', 'rejected', data, 'high'),
  {ENTITY}StatusChanged: (data: { {ENTITY}Id: string; oldStatus: string; newStatus: string }) =>
    this.emit('{FEATURE}', '{ENTITY}', 'status_changed', data, 'normal'),
};
```

---

## 🖥️ Frontend Integration

### 1. State Manager Implementation

```typescript
// apps/web/src/app/features/{FEATURE}/services/{FEATURE}-state.manager.ts
import { Injectable, inject } from '@angular/core';
import { BaseRealtimeStateManager, StateManagerConfig } from '../../../shared/state/base-realtime-state.manager';
import { WebSocketService } from '../../../shared/services/websocket.service';

export interface {ENTITY} {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;

  // Frontend-specific properties
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isLocked?: boolean;
  lockedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class {FEATURE}StateManager extends BaseRealtimeStateManager<{ENTITY}> {
  constructor() {
    const config: StateManagerConfig = {
      feature: '{FEATURE}',
      entity: '{ENTITY}',
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      enableCaching: true,
      cacheTTL: 300000 // 5 minutes
    };

    super(inject(WebSocketService), config);
  }

  // Feature-specific methods

  /**
   * Get items by status
   */
  getItemsByStatus(status: {ENTITY}['status']): {ENTITY}[] {
    return this.getItemsWhere(item => item.status === status);
  }

  /**
   * Get pending items
   */
  getPendingItems(): {ENTITY}[] {
    return this.getItemsByStatus('pending');
  }

  /**
   * Get approved items
   */
  getApprovedItems(): {ENTITY}[] {
    return this.getItemsByStatus('approved');
  }

  /**
   * Update item with optimistic update
   */
  async updateItem(id: string, updates: Partial<{ENTITY}>, apiCall: () => Promise<{ENTITY}>): Promise<{ENTITY}> {
    return this.performOptimisticUpdate(id, updates, apiCall);
  }

  /**
   * Approve item
   */
  async approveItem(id: string, apiCall: () => Promise<{ENTITY}>): Promise<{ENTITY}> {
    return this.performOptimisticUpdate(id, { status: 'approved' }, apiCall);
  }

  /**
   * Reject item
   */
  async rejectItem(id: string, apiCall: () => Promise<{ENTITY}>): Promise<{ENTITY}> {
    return this.performOptimisticUpdate(id, { status: 'rejected' }, apiCall);
  }

  // Override parent methods for feature-specific behavior

  protected onItemCreated(item: {ENTITY}): void {
    console.log(`{ENTITY} created: ${item.name}`);
    // Feature-specific logic
  }

  protected onItemUpdated(item: {ENTITY}): void {
    console.log(`{ENTITY} updated: ${item.name}`);
    // Feature-specific logic
  }

  protected onItemDeleted(id: string): void {
    console.log(`{ENTITY} deleted: ${id}`);
    // Feature-specific logic
  }

  // Custom event handlers
  subscribeToApprovalEvents() {
    this.websocketService.subscribeToEvent('{FEATURE}', '{ENTITY}', 'approved')
      .subscribe(data => {
        console.log(`{ENTITY} approved:`, data);
        this.updateItem(data.{ENTITY}Id, { status: 'approved' });
      });

    this.websocketService.subscribeToEvent('{FEATURE}', '{ENTITY}', 'rejected')
      .subscribe(data => {
        console.log(`{ENTITY} rejected:`, data);
        this.updateItem(data.{ENTITY}Id, { status: 'rejected' });
      });
  }
}
```

### 2. Component Integration

```typescript
// apps/web/src/app/features/{FEATURE}/components/{FEATURE}-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { {FEATURE}StateManager } from '../services/{FEATURE}-state.manager';
import { {FEATURE}Service } from '../services/{FEATURE}.service';

@Component({
  selector: 'app-{FEATURE}-list',
  template: `
    <div class="{FEATURE}-list">
      <!-- Connection status indicator -->
      <div class="connection-status" [class]="connectionStatus()">
        <mat-icon>{{ getConnectionIcon() }}</mat-icon>
        {{ getConnectionText() }}
      </div>

      <!-- Items list -->
      <div class="items-grid">
        <mat-card *ngFor="let item of items(); trackBy: trackByItem"
                  [class.loading]="item.isLoading"
                  [class.locked]="item.isLocked"
                  class="item-card">

          <mat-card-header>
            <mat-card-title>{{ item.name }}</mat-card-title>
            <mat-card-subtitle>
              Status: {{ item.status }}
              <span *ngIf="item.isLocked" class="lock-indicator">
                🔒 Locked by {{ item.lockedBy }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>{{ item.description }}</p>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button
                    [disabled]="item.isLoading || item.isLocked || !item.canEdit"
                    (click)="editItem(item)">
              Edit
            </button>

            <button mat-button
                    [disabled]="item.isLoading || item.status !== 'pending'"
                    (click)="approveItem(item)">
              Approve
            </button>

            <button mat-button
                    color="warn"
                    [disabled]="item.isLoading || !item.canDelete"
                    (click)="deleteItem(item)">
              Delete
            </button>
          </mat-card-actions>

          <!-- Loading overlay -->
          <div *ngIf="item.isLoading" class="loading-overlay">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
        </mat-card>
      </div>

      <!-- Conflicts dialog -->
      <div *ngIf="hasConflicts()" class="conflicts-banner">
        <mat-icon>warning</mat-icon>
        {{ conflicts().length }} conflicts detected
        <button mat-button (click)="showConflictsDialog()">Resolve</button>
      </div>
    </div>
  `,
  styles: [`
    .item-card {
      position: relative;
      margin: 8px;
      transition: all 0.3s ease;
    }

    .item-card.loading {
      opacity: 0.7;
    }

    .item-card.locked {
      border-left: 4px solid orange;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .connection-status {
      padding: 8px;
      margin-bottom: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .connection-status.connected {
      background-color: #c8e6c9;
      color: #2e7d32;
    }

    .connection-status.disconnected {
      background-color: #ffcdd2;
      color: #c62828;
    }

    .connection-status.reconnecting {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .conflicts-banner {
      background-color: #fff3e0;
      color: #ef6c00;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class {FEATURE}ListComponent implements OnInit {
  private stateManager = inject({FEATURE}StateManager);
  private {FEATURE}Service = inject({FEATURE}Service);
  private websocketService = inject(WebSocketService);

  // Signals from state manager
  items = this.stateManager.items;
  loading = this.stateManager.loading;
  error = this.stateManager.error;
  conflicts = this.stateManager.conflicts;
  hasConflicts = this.stateManager.hasConflicts;

  // Connection status
  connectionStatus = this.websocketService.getConnectionStatus;

  ngOnInit() {
    this.loadItems();
    this.stateManager.subscribeToApprovalEvents();
  }

  async loadItems() {
    if (this.stateManager.isCacheStale()) {
      this.stateManager.setLoading(true);
      try {
        const items = await this.{FEATURE}Service.getAll();
        this.stateManager.setItems(items);
      } catch (error) {
        this.stateManager.setError('Failed to load items');
      } finally {
        this.stateManager.setLoading(false);
      }
    }
  }

  async editItem(item: {ENTITY}) {
    // Open edit dialog or navigate to edit page
  }

  async approveItem(item: {ENTITY}) {
    try {
      await this.stateManager.approveItem(
        item.id,
        () => this.{FEATURE}Service.approve(item.id)
      );
    } catch (error) {
      // Error already handled by state manager
    }
  }

  async deleteItem(item: {ENTITY}) {
    try {
      await this.stateManager.performOptimisticUpdate(
        item.id,
        { isLoading: true },
        () => this.{FEATURE}Service.delete(item.id).then(() => {
          this.stateManager.removeItem(item.id);
          return item; // Return item for consistency
        })
      );
    } catch (error) {
      // Error already handled by state manager
    }
  }

  getConnectionIcon(): string {
    const status = this.connectionStatus().status;
    switch (status) {
      case 'connected': return 'wifi';
      case 'disconnected': return 'wifi_off';
      case 'reconnecting': return 'wifi_tethering';
      default: return 'wifi_off';
    }
  }

  getConnectionText(): string {
    const status = this.connectionStatus().status;
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'reconnecting': return 'Reconnecting...';
      default: return 'Unknown';
    }
  }

  showConflictsDialog() {
    // Open dialog to resolve conflicts
  }

  trackByItem(index: number, item: {ENTITY}): string {
    return item.id;
  }
}
```

### 3. Service Integration

```typescript
// apps/web/src/app/features/{FEATURE}/services/{FEATURE}.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface {ENTITY}Request {
  name: string;
  description?: string;
  // Add other fields
}

export interface {ENTITY}Response {
  success: boolean;
  data: {ENTITY};
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface {ENTITY}ListResponse {
  success: boolean;
  data: {ENTITY}[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class {FEATURE}Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/{FEATURE}`;

  getAll(): Promise<{ENTITY}[]> {
    return this.http.get<{ENTITY}ListResponse>(`${this.baseUrl}`)
      .toPromise()
      .then(response => response?.data || []);
  }

  getById(id: string): Promise<{ENTITY}> {
    return this.http.get<{ENTITY}Response>(`${this.baseUrl}/${id}`)
      .toPromise()
      .then(response => response!.data);
  }

  create(data: {ENTITY}Request): Promise<{ENTITY}> {
    return this.http.post<{ENTITY}Response>(`${this.baseUrl}`, data)
      .toPromise()
      .then(response => response!.data);
  }

  update(id: string, data: Partial<{ENTITY}Request>): Promise<{ENTITY}> {
    return this.http.put<{ENTITY}Response>(`${this.baseUrl}/${id}`, data)
      .toPromise()
      .then(response => response!.data);
  }

  delete(id: string): Promise<void> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`)
      .toPromise()
      .then(() => undefined);
  }

  approve(id: string): Promise<{ENTITY}> {
    return this.http.post<{ENTITY}Response>(`${this.baseUrl}/${id}/approve`, {})
      .toPromise()
      .then(response => response!.data);
  }

  reject(id: string, reason: string): Promise<{ENTITY}> {
    return this.http.post<{ENTITY}Response>(`${this.baseUrl}/${id}/reject`, { reason })
      .toPromise()
      .then(response => response!.data);
  }
}
```

---

## 📋 Integration Checklist

### Backend Integration

- [ ] Add EventService to feature service constructors
- [ ] Call `eventService.emitCreated()` after create operations
- [ ] Call `eventService.emitUpdated()` after update operations
- [ ] Call `eventService.emitDeleted()` after delete operations
- [ ] Add feature-specific event methods to EventService
- [ ] Add bulk operation events for large datasets
- [ ] Add status change events for workflow features
- [ ] Test all events are emitted correctly

### Frontend Integration

- [ ] Create state manager extending BaseRealtimeStateManager
- [ ] Define feature, entity, and action constants
- [ ] Implement optimistic updates for better UX
- [ ] Add conflict resolution for concurrent edits
- [ ] Create components using the state manager
- [ ] Add loading and error state handling
- [ ] Add connection status indicators
- [ ] Test real-time updates work correctly

### WebSocket Configuration

- [ ] Subscribe to feature in WebSocketService
- [ ] Configure appropriate cache TTL
- [ ] Enable/disable optimistic updates based on use case
- [ ] Enable/disable conflict detection based on needs
- [ ] Add feature to WEBSOCKET_FEATURES config
- [ ] Test reconnection and error handling

---

## 🎯 Feature-Specific Examples

### Example 1: User Management

```typescript
// Replace placeholders:
{FEATURE} = 'users'
{ENTITY} = 'user'

// Events: user.created, user.updated, user.activated, user.deactivated
// Status changes: active, inactive, suspended
// Bulk operations: bulk user imports, bulk status changes
```

### Example 2: Product Catalog

```typescript
// Replace placeholders:
{FEATURE} = 'products'
{ENTITY} = 'product'

// Events: product.created, product.updated, inventory.updated, pricing.updated
// Status changes: draft, published, discontinued
// Bulk operations: bulk price updates, inventory synchronization
```

### Example 3: Order Management

```typescript
// Replace placeholders:
{FEATURE} = 'orders'
{ENTITY} = 'order'

// Events: order.created, order.updated, payment.received, order.shipped
// Status changes: pending, paid, shipped, delivered, cancelled
// Bulk operations: bulk status updates, bulk shipping
```

---

## 🚀 Best Practices

### Performance

- Use appropriate cache TTL based on data change frequency
- Enable optimistic updates only for user-initiated actions
- Batch similar events to reduce WebSocket traffic
- Use conflict detection only for collaborative features

### User Experience

- Show connection status to users
- Provide visual feedback for loading states
- Handle offline scenarios gracefully
- Resolve conflicts with clear user guidance

### Error Handling

- Always handle WebSocket disconnections
- Provide fallback for API-only mode
- Show meaningful error messages
- Implement retry mechanisms for failed operations

### Security

- Validate all WebSocket events on client side
- Don't expose sensitive data through WebSocket
- Implement proper authentication for WebSocket connections
- Log security-related events appropriately

นี่คือ template ที่สมบูรณ์สำหรับการเพิ่ม real-time capabilities ให้กับ feature ใหม่ๆ ใน AegisX platform! 🚀
