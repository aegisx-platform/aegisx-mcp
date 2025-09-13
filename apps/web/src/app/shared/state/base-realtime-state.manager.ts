import { Injectable, OnDestroy, signal, computed, Signal } from '@angular/core';
import { Subject, takeUntil, catchError, of, delay, retry } from 'rxjs';
import { WebSocketService, WebSocketMessage } from '../services/websocket.service';

export interface StateItem {
  id: string;
  isLocked?: boolean;
  lockedBy?: string;
  lockType?: string;
  [key: string]: any;
}

export interface OptimisticUpdate<T> {
  id: string;
  originalItem: T;
  updates: Partial<T>;
  timestamp: number;
  apiCall: () => Promise<T>;
}

export interface ConflictResolution<T> {
  item: T;
  localChanges: Partial<T>;
  remoteChanges: Partial<T>;
  conflictFields: (keyof T)[];
  resolution: 'local' | 'remote' | 'merge' | 'manual';
}

export interface StateManagerConfig {
  feature: string;
  entity: string;
  enableOptimisticUpdates: boolean;
  enableConflictDetection: boolean;
  enableCaching: boolean;
  cacheTTL: number; // milliseconds
}

@Injectable()
export abstract class BaseRealtimeStateManager<T extends StateItem> implements OnDestroy {
  protected destroy$ = new Subject<void>();
  protected pendingUpdates = new Map<string, OptimisticUpdate<T>>();
  protected lastCacheUpdate = 0;

  // Core signals
  protected _items = signal<T[]>([]);
  protected _loading = signal(false);
  protected _error = signal<string | null>(null);
  protected _conflicts = signal<ConflictResolution<T>[]>([]);

  // Public computed signals
  items: Signal<T[]> = computed(() => this._items());
  loading: Signal<boolean> = computed(() => this._loading());
  error: Signal<string | null> = computed(() => this._error());
  conflicts: Signal<ConflictResolution<T>[]> = computed(() => this._conflicts());
  
  // Utility computed signals
  itemsById: Signal<Map<string, T>> = computed(() => {
    const map = new Map<string, T>();
    this._items().forEach(item => map.set(item.id, item));
    return map;
  });

  hasItems: Signal<boolean> = computed(() => this._items().length > 0);
  hasError: Signal<boolean> = computed(() => this._error() !== null);
  hasConflicts: Signal<boolean> = computed(() => this._conflicts().length > 0);
  
  constructor(
    protected websocket: WebSocketService,
    protected config: StateManagerConfig
  ) {
    this.setupWebSocketSubscriptions();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pendingUpdates.clear();
  }

  /**
   * Setup WebSocket subscriptions for real-time updates
   */
  private setupWebSocketSubscriptions(): void {
    // Subscribe to created events
    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'created')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleItemCreated(data));

    // Subscribe to updated events
    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'updated')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleItemUpdated(data));

    // Subscribe to deleted events
    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'deleted')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleItemDeleted(data));

    // Subscribe to bulk operation events
    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'bulk_started')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleBulkStarted(data));

    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'bulk_progress')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleBulkProgress(data));

    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'bulk_completed')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleBulkCompleted(data));

    // Subscribe to collaboration events
    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'lock_acquired')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleLockAcquired(data));

    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'lock_released')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleLockReleased(data));

    this.websocket.subscribeToEvent(this.config.feature, this.config.entity, 'conflict_detected')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleConflictDetected(data));
  }

  /**
   * Subscribe to WebSocket features
   */
  private subscribeToWebSocket(): void {
    if (this.websocket.isConnected()) {
      this.websocket.subscribe({
        features: [this.config.feature]
      });
    } else {
      // Wait for connection and then subscribe
      this.websocket.getConnectionStatusObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe((status: any) => {
          if (status.status === 'connected') {
            this.websocket.subscribe({
              features: [this.config.feature]
            });
          }
        });
    }
  }

  // Core CRUD operations with optimistic updates

  /**
   * Perform optimistic update with automatic rollback on error
   */
  async performOptimisticUpdate(
    id: string,
    updates: Partial<T>,
    apiCall: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enableOptimisticUpdates) {
      return await apiCall();
    }

    const originalItem = this.getItem(id);
    if (!originalItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    // Apply optimistic update
    const optimisticUpdate: OptimisticUpdate<T> = {
      id,
      originalItem,
      updates,
      timestamp: Date.now(),
      apiCall
    };

    this.pendingUpdates.set(id, optimisticUpdate);
    this.applyOptimisticUpdate(id, updates);

    try {
      // Perform API call
      const result = await apiCall();
      
      // Replace optimistic update with server response
      this.replaceOptimisticUpdate(id, result);
      this.pendingUpdates.delete(id);
      
      this._error.set(null);
      return result;
    } catch (error) {
      // Revert optimistic update
      this.revertOptimisticUpdate(id);
      this.pendingUpdates.delete(id);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this._error.set(errorMessage);
      throw error;
    }
  }

  /**
   * Batch update multiple items optimistically
   */
  async performBatchOptimisticUpdate(
    updates: Array<{ id: string; updates: Partial<T>; apiCall: () => Promise<T> }>
  ): Promise<T[]> {
    const promises = updates.map(update => 
      this.performOptimisticUpdate(update.id, update.updates, update.apiCall)
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      // Some operations failed - individual rollbacks already handled
      throw error;
    }
  }

  /**
   * Add new item to state
   */
  addItem(item: T): void {
    this._items.update(items => {
      const exists = items.some(existing => existing.id === item.id);
      if (exists) {
        return items.map(existing => existing.id === item.id ? item : existing);
      }
      return [...items, item];
    });
    this.updateCacheTimestamp();
  }

  /**
   * Add multiple items to state
   */
  addItems(newItems: T[]): void {
    this._items.update(items => {
      const existingIds = new Set(items.map(item => item.id));
      const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
      return [...items, ...uniqueNewItems];
    });
    this.updateCacheTimestamp();
  }

  /**
   * Update existing item in state
   */
  updateItem(id: string, updates: Partial<T>): void {
    this._items.update(items =>
      items.map(item => 
        item.id === id 
          ? { ...item, ...updates } as T
          : item
      )
    );
    this.updateCacheTimestamp();
  }

  /**
   * Remove item from state
   */
  removeItem(id: string): void {
    this._items.update(items => items.filter(item => item.id !== id));
    this.pendingUpdates.delete(id);
    this.updateCacheTimestamp();
  }

  /**
   * Remove multiple items from state
   */
  removeItems(ids: string[]): void {
    const idSet = new Set(ids);
    this._items.update(items => items.filter(item => !idSet.has(item.id)));
    ids.forEach(id => this.pendingUpdates.delete(id));
    this.updateCacheTimestamp();
  }

  /**
   * Replace all items in state
   */
  setItems(items: T[]): void {
    this._items.set(items);
    this.pendingUpdates.clear();
    this.updateCacheTimestamp();
  }

  /**
   * Clear all items from state
   */
  clearItems(): void {
    this._items.set([]);
    this.pendingUpdates.clear();
    this._error.set(null);
    this.updateCacheTimestamp();
  }

  /**
   * Get item by ID
   */
  getItem(id: string): T | undefined {
    return this.itemsById().get(id);
  }

  /**
   * Check if item exists
   */
  hasItem(id: string): boolean {
    return this.itemsById().has(id);
  }

  /**
   * Get items matching predicate
   */
  getItemsWhere(predicate: (item: T) => boolean): T[] {
    return this._items().filter(predicate);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this._error.set(error);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if cache is stale
   */
  isCacheStale(): boolean {
    if (!this.config.enableCaching) {
      return true;
    }
    return Date.now() - this.lastCacheUpdate > this.config.cacheTTL;
  }

  // Optimistic update helpers

  private applyOptimisticUpdate(id: string, updates: Partial<T>): void {
    this.updateItem(id, { ...updates, isLoading: true } as Partial<T>);
  }

  private replaceOptimisticUpdate(id: string, serverItem: T): void {
    this._items.update(items =>
      items.map(item => 
        item.id === id 
          ? { ...serverItem, isLoading: false } as T
          : item
      )
    );
  }

  private revertOptimisticUpdate(id: string): void {
    const pendingUpdate = this.pendingUpdates.get(id);
    if (pendingUpdate) {
      this._items.update(items =>
        items.map(item => 
          item.id === id 
            ? pendingUpdate.originalItem
            : item
        )
      );
    }
  }

  private updateCacheTimestamp(): void {
    this.lastCacheUpdate = Date.now();
  }

  // WebSocket event handlers (can be overridden by subclasses)

  protected handleItemCreated(item: T): void {
    // Check if this is our own optimistic update
    if (this.pendingUpdates.has(item.id)) {
      return;
    }

    this.addItem(item);
    this.onItemCreated(item);
  }

  protected handleItemUpdated(item: T): void {
    // Check if this is our own optimistic update
    if (this.pendingUpdates.has(item.id)) {
      return;
    }

    if (this.config.enableConflictDetection) {
      this.detectAndHandleConflict(item);
    } else {
      this.updateItem(item.id, item);
    }

    this.onItemUpdated(item);
  }

  protected handleItemDeleted(data: { id: string }): void {
    this.removeItem(data.id);
    this.onItemDeleted(data.id);
  }

  protected handleBulkStarted(data: any): void {
    this.onBulkStarted(data);
  }

  protected handleBulkProgress(data: any): void {
    this.onBulkProgress(data);
  }

  protected handleBulkCompleted(data: any): void {
    this.onBulkCompleted(data);
  }

  protected handleLockAcquired(data: { id: string; userId: string; lockType?: string }): void {
    this.updateItem(data.id, { 
      isLocked: true, 
      lockedBy: data.userId,
      lockType: data.lockType 
    } as Partial<T>);
    this.onLockAcquired(data);
  }

  protected handleLockReleased(data: { id: string; userId: string }): void {
    this.updateItem(data.id, { 
      isLocked: false, 
      lockedBy: undefined,
      lockType: undefined 
    } as Partial<T>);
    this.onLockReleased(data);
  }

  protected handleConflictDetected(data: any): void {
    this.onConflictDetected(data);
  }

  // Conflict detection and resolution

  private detectAndHandleConflict(remoteItem: T): void {
    const localItem = this.getItem(remoteItem.id);
    if (!localItem) {
      this.addItem(remoteItem);
      return;
    }

    const pendingUpdate = this.pendingUpdates.get(remoteItem.id);
    if (!pendingUpdate) {
      this.updateItem(remoteItem.id, remoteItem);
      return;
    }

    // Conflict detected
    const conflictFields = this.getConflictFields(localItem, remoteItem);
    if (conflictFields.length > 0) {
      const conflict: ConflictResolution<T> = {
        item: remoteItem,
        localChanges: pendingUpdate.updates,
        remoteChanges: this.getChanges(pendingUpdate.originalItem, remoteItem),
        conflictFields,
        resolution: 'manual' // Default to manual resolution
      };

      this._conflicts.update(conflicts => [...conflicts, conflict]);
      this.onConflictDetected(conflict);
    } else {
      // No actual conflict, safe to update
      this.updateItem(remoteItem.id, remoteItem);
    }
  }

  private getConflictFields(localItem: T, remoteItem: T): (keyof T)[] {
    const conflicts: (keyof T)[] = [];
    const pendingUpdate = this.pendingUpdates.get(localItem.id);
    
    if (!pendingUpdate) return conflicts;

    Object.keys(pendingUpdate.updates).forEach(key => {
      const typedKey = key as keyof T;
      if (localItem[typedKey] !== remoteItem[typedKey]) {
        conflicts.push(typedKey);
      }
    });

    return conflicts;
  }

  private getChanges(original: T, updated: T): Partial<T> {
    const changes: Partial<T> = {};
    
    Object.keys(updated).forEach(key => {
      const typedKey = key as keyof T;
      if (original[typedKey] !== updated[typedKey]) {
        changes[typedKey] = updated[typedKey];
      }
    });

    return changes;
  }

  /**
   * Resolve conflict with specified strategy
   */
  resolveConflict(conflict: ConflictResolution<T>, resolution: 'local' | 'remote' | 'merge'): void {
    const item = this.getItem(conflict.item.id);
    if (!item) return;

    switch (resolution) {
      case 'local':
        // Keep local changes, ignore remote
        break;
      case 'remote':
        // Accept remote changes, discard local
        this.updateItem(conflict.item.id, conflict.item);
        this.pendingUpdates.delete(conflict.item.id);
        break;
      case 'merge':
        // Merge both changes (simple strategy)
        const merged = { ...conflict.item, ...conflict.localChanges };
        this.updateItem(conflict.item.id, merged);
        break;
    }

    // Remove conflict from list
    this._conflicts.update(conflicts => 
      conflicts.filter(c => c.item.id !== conflict.item.id)
    );
  }

  // Abstract methods that subclasses can override for custom behavior

  protected onItemCreated(item: T): void {
    // Override in subclasses for custom behavior
  }

  protected onItemUpdated(item: T): void {
    // Override in subclasses for custom behavior
  }

  protected onItemDeleted(id: string): void {
    // Override in subclasses for custom behavior
  }

  protected onBulkStarted(data: any): void {
    // Override in subclasses for custom behavior
  }

  protected onBulkProgress(data: any): void {
    // Override in subclasses for custom behavior
  }

  protected onBulkCompleted(data: any): void {
    // Override in subclasses for custom behavior
  }

  protected onLockAcquired(data: { id: string; userId: string; lockType?: string }): void {
    // Override in subclasses for custom behavior
  }

  protected onLockReleased(data: { id: string; userId: string }): void {
    // Override in subclasses for custom behavior
  }

  protected onConflictDetected(data: any): void {
    // Override in subclasses for custom behavior
  }
}