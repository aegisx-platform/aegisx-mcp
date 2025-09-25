import { Injectable, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { takeUntil, debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { WebSocketService, WebSocketMessage } from './websocket.service';

export interface BaseEntity {
  id: string | number;
  [key: string]: any;
}

export interface StateOptions {
  feature: string;
  entity: string;
  enableOptimisticUpdates?: boolean;
  enableConflictDetection?: boolean;
  debounceMs?: number;
  retryAttempts?: number;
}

export interface ConflictInfo {
  localVersion: any;
  serverVersion: any;
  conflictedFields: string[];
  timestamp: Date;
}

export interface StateSync<T extends BaseEntity> {
  localState: T[];
  serverState: T[];
  conflicts: Map<string | number, ConflictInfo>;
  lastSync: Date | null;
  isLoading: boolean;
  hasChanges: boolean;
}

export interface OptimisticOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityId: string | number;
  data: any;
  timestamp: Date;
  retryCount: number;
}

@Injectable()
export abstract class BaseRealtimeStateManager<T extends BaseEntity> implements OnDestroy {
  private websocketService = inject(WebSocketService);
  private destroy$ = new Subject<void>();
  
  // Configuration
  protected options: StateOptions;
  
  // State management
  private _localState = signal<T[]>([]);
  private _serverState = signal<T[]>([]);
  private _conflicts = signal<Map<string | number, ConflictInfo>>(new Map());
  private _isLoading = signal(false);
  private _lastSync = signal<Date | null>(null);
  private _hasChanges = signal(false);
  private _isConnected = signal(false);
  
  // Optimistic updates
  private _pendingOperations = signal<OptimisticOperation[]>([]);
  private operationQueue$ = new BehaviorSubject<OptimisticOperation[]>([]);
  
  // Computed signals
  readonly localState = computed(() => this._localState());
  readonly serverState = computed(() => this._serverState());
  readonly conflicts = computed(() => this._conflicts());
  readonly isLoading = computed(() => this._isLoading());
  readonly lastSync = computed(() => this._lastSync());
  readonly hasChanges = computed(() => this._hasChanges());
  readonly isConnected = computed(() => this._isConnected());
  readonly pendingOperations = computed(() => this._pendingOperations());
  
  // Derived computed properties
  readonly hasConflicts = computed(() => this._conflicts().size > 0);
  readonly hasPendingOperations = computed(() => this._pendingOperations().length > 0);
  readonly syncStatus = computed(() => {
    if (this._isLoading()) return 'syncing';
    if (this.hasConflicts()) return 'conflict';
    if (this.hasPendingOperations()) return 'pending';
    if (this._hasChanges()) return 'dirty';
    return 'clean';
  });
  
  // State synchronization computed signal
  readonly stateSync = computed<StateSync<T>>(() => ({
    localState: this._localState(),
    serverState: this._serverState(),
    conflicts: this._conflicts(),
    lastSync: this._lastSync(),
    isLoading: this._isLoading(),
    hasChanges: this._hasChanges()
  }));
  
  constructor(options: StateOptions) {
    this.options = {
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      debounceMs: 300,
      retryAttempts: 3,
      ...options
    };
    
    this.initializeRealtimeConnection();
    this.setupOperationProcessing();
    this.setupConnectionMonitoring();
    
    console.log(`🎯 BaseRealtimeStateManager initialized for ${this.options.feature}.${this.options.entity}`);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initialize real-time WebSocket connection
   */
  private initializeRealtimeConnection(): void {
    // Subscribe to connection status
    this.websocketService.getConnectionStatusObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this._isConnected.set(status.status === 'connected');
        
        if (status.status === 'connected') {
          this.onRealtimeConnected?.();
        } else if (status.status === 'disconnected') {
          this.onRealtimeDisconnected?.();
        }
      });
    
    // Subscribe to real-time updates for this entity
    this.websocketService.subscribeToEntity(this.options.feature, this.options.entity)
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.handleRealtimeMessage(message);
      });
  }
  
  /**
   * Setup operation queue processing
   */
  private setupOperationProcessing(): void {
    if (!this.options.enableOptimisticUpdates) return;
    
    this.operationQueue$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.options.debounceMs!),
        distinctUntilChanged(),
        filter(operations => operations.length > 0)
      )
      .subscribe(operations => {
        this.processOperationQueue(operations);
      });
  }
  
  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    // Monitor connection and retry failed operations when reconnected
    effect(() => {
      if (this._isConnected() && this.hasPendingOperations()) {
        console.log('🔄 Connection restored, retrying pending operations');
        this.retryFailedOperations();
      }
    });
  }
  
  /**
   * Handle real-time messages from WebSocket
   */
  private handleRealtimeMessage(message: WebSocketMessage): void {
    console.log(`📡 Received real-time message: ${message.action}`, message.data);
    
    if (message.action === 'created') {
      console.log('🆕 CREATE MESSAGE RECEIVED:', message.data);
      console.log('🆕 Current pending operations:', this._pendingOperations());
      console.log('🆕 Current local state count:', this._localState().length);
      console.log('🆕 Current server state count:', this._serverState().length);
    }
    
    if (message.action === 'deleted') {
      console.log('🗑️ DELETE MESSAGE RECEIVED:', message);
    }
    
    switch (message.action) {
      case 'created':
        this.handleServerCreate(message.data);
        break;
      case 'updated':
        this.handleServerUpdate(message.data);
        break;
      case 'deleted':
        this.handleServerDelete(message.data);
        break;
      case 'bulk_started':
        this.handleBulkStarted(message.data);
        break;
      case 'bulk_progress':
        this.handleBulkProgress(message.data);
        break;
      case 'bulk_completed':
        this.handleBulkCompleted(message.data);
        break;
      case 'conflict_detected':
        this.handleConflictDetected(message.data);
        break;
      case 'lock_acquired':
        this.handleLockAcquired(message.data);
        break;
      case 'lock_released':
        this.handleLockReleased(message.data);
        break;
      default:
        console.warn('Unknown real-time message action:', message.action);
    }
    
    this.updateLastSync();
  }
  
  /**
   * Handle server create events
   */
  private handleServerCreate(data: T): void {
    console.log('🔄 BaseRealtimeStateManager.handleServerCreate:', data);
    
    // Check if this item already exists in our states (from API response)
    const currentLocalState = this._localState();
    const currentServerState = this._serverState();
    const existingInLocal = currentLocalState.find(item => item.id === data.id);
    const existingInServer = currentServerState.find(item => item.id === data.id);
    
    console.log('📊 Existence check:', {
      existingInLocal: !!existingInLocal,
      existingInServer: !!existingInServer,
      localCount: currentLocalState.length,
      serverCount: currentServerState.length
    });
    
    if (existingInLocal && existingInServer) {
      // Item already exists in both states (likely from API response)
      console.log('⚠️ WebSocket create event for item that already exists - IGNORING');
      return;
    }
    
    // Find and remove corresponding optimistic operation (temp ID)
    const pendingCreateOp = this._pendingOperations().find(op => 
      op.type === 'create' && this.isMatchingOptimisticCreate(op, data)
    );
    
    console.log('🔍 Pending create operations:', this._pendingOperations().filter(op => op.type === 'create'));
    console.log('🔍 Found matching optimistic operation:', pendingCreateOp);
    
    if (pendingCreateOp) {
      // This is a WebSocket echo of our own create operation
      console.log('🔄 WebSocket echo of our own operation - optimistic already handled by API response');
      this.removePendingOperation('create', pendingCreateOp.entityId);
      
      // Only add to server state if not already there
      if (!existingInServer) {
        console.log('📊 Adding to server state from WebSocket');
        this._serverState.set([...currentServerState, data]);
      }
      
      // Don't modify local state - API response already handled it
      console.log('🎯 WebSocket echo handled - no local state changes needed');
    } else {
      // This is a new item from external source (other users, etc.)
      console.log('➕ Adding external item from another source');
      
      // Add to server state if not already there
      if (!existingInServer) {
        this._serverState.set([...currentServerState, data]);
      }
      
      // Add to local state if not already there
      if (!existingInLocal) {
        this.mergeServerChange('create', data);
      }
    }
  }
  
  /**
   * Handle server update events
   */
  private handleServerUpdate(data: T): void {
    const currentState = this._serverState();
    const existingIndex = currentState.findIndex(item => item.id === data.id);
    
    if (existingIndex !== -1) {
      const updatedState = [...currentState];
      updatedState[existingIndex] = data;
      this._serverState.set(updatedState);
      
      // Remove from pending operations if this was an optimistic update
      this.removePendingOperation('update', data.id);
      
      // Check for conflicts if enabled
      if (this.options.enableConflictDetection) {
        this.detectConflicts(data);
      } else {
        this.mergeServerChange('update', data);
      }
    }
  }
  
  /**
   * Handle server delete events
   */
  private handleServerDelete(data: { id: string | number }): void {
    console.log('🗑️ Handling server delete event:', data);
    const currentState = this._serverState();
    console.log('📊 Current server state before delete:', currentState.length, 'items');
    
    const filteredState = currentState.filter(item => item.id !== data.id);
    this._serverState.set(filteredState);
    console.log('📊 Server state after delete:', filteredState.length, 'items');
    
    // Remove from pending operations if this was an optimistic delete
    this.removePendingOperation('delete', data.id);
    
    // Remove from local state as well
    this.mergeServerChange('delete', data as T);
    console.log('✅ Delete event processed successfully');
  }
  
  /**
   * Handle bulk operation events
   */
  private handleBulkStarted(data: { operationId: string; total: number; operation: string }): void {
    this._isLoading.set(true);
    this.onBulkOperationStarted?.(data);
  }
  
  private handleBulkProgress(data: { operationId: string; progress: any }): void {
    this.onBulkOperationProgress?.(data);
  }
  
  private handleBulkCompleted(data: { operationId: string; results: any }): void {
    this._isLoading.set(false);
    this.onBulkOperationCompleted?.(data);
    this.updateLastSync();
  }
  
  /**
   * Handle conflict detection
   */
  private handleConflictDetected(data: ConflictInfo): void {
    const conflicts = this._conflicts();
    const entityId = this.extractEntityId(data.localVersion);
    conflicts.set(entityId, data);
    this._conflicts.set(new Map(conflicts));
    
    console.warn('🚨 Conflict detected for entity:', entityId, data);
    this.onConflictDetected?.(entityId, data);
  }
  
  /**
   * Handle entity locking
   */
  private handleLockAcquired(data: { id: string | number; userId: string; lockType?: string }): void {
    this.onEntityLocked?.(data.id, data.userId, data.lockType);
  }
  
  private handleLockReleased(data: { id: string | number; userId: string }): void {
    this.onEntityUnlocked?.(data.id, data.userId);
  }
  
  /**
   * Optimistic update operations
   */
  public async optimisticCreate(data: Omit<T, 'id'>): Promise<T> {
    console.log('🚀 BaseRealtimeStateManager.optimisticCreate:', data);
    
    if (!this.options.enableOptimisticUpdates) {
      console.log('⚠️ Optimistic updates disabled, falling back to server-only');
      return this.serverCreate(data);
    }
    
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticEntity = { ...data, id: tempId } as T;
    
    console.log('📝 Created optimistic entity:', {
      tempId,
      data: { 
        email: (data as any).email, 
        username: (data as any).username,
        firstName: (data as any).firstName,
        lastName: (data as any).lastName
      }
    });
    
    // Add to local state immediately
    const currentLocalState = this._localState();
    console.log('📊 Local state before add:', currentLocalState.length, 'items');
    this._localState.set([...currentLocalState, optimisticEntity]);
    this._hasChanges.set(true);
    console.log('📊 Local state after add:', this._localState().length, 'items');
    
    // Queue the operation
    const operation: OptimisticOperation = {
      id: this.generateOperationId(),
      type: 'create',
      entityId: tempId,
      data,
      timestamp: new Date(),
      retryCount: 0
    };
    
    console.log('📋 Added pending operation:', {
      operationId: operation.id,
      tempId: operation.entityId,
      timestamp: operation.timestamp.getTime()
    });
    this.addPendingOperation(operation);
    
    return optimisticEntity;
  }
  
  public async optimisticUpdate(id: string | number, changes: Partial<T>): Promise<T> {
    if (!this.options.enableOptimisticUpdates) {
      return this.serverUpdate(id, changes);
    }
    
    // Apply changes to local state immediately
    const currentState = this._localState();
    const existingIndex = currentState.findIndex(item => item.id === id);
    
    if (existingIndex === -1) {
      throw new Error(`Entity with id ${id} not found in local state`);
    }
    
    const updatedEntity = { ...currentState[existingIndex], ...changes };
    const updatedState = [...currentState];
    updatedState[existingIndex] = updatedEntity;
    
    this._localState.set(updatedState);
    this._hasChanges.set(true);
    
    // Queue the operation
    const operation: OptimisticOperation = {
      id: this.generateOperationId(),
      type: 'update',
      entityId: id,
      data: changes,
      timestamp: new Date(),
      retryCount: 0
    };
    
    this.addPendingOperation(operation);
    
    return updatedEntity;
  }
  
  public async optimisticDelete(id: string | number): Promise<void> {
    console.log('🗑️ BaseRealtimeStateManager.optimisticDelete called for ID:', id);
    
    if (!this.options.enableOptimisticUpdates) {
      console.log('🗑️ Optimistic updates disabled, calling serverDelete directly');
      return this.serverDelete(id);
    }
    
    console.log('🗑️ Removing from local state optimistically');
    // Remove from local state immediately
    const currentState = this._localState();
    console.log('📊 Local state before delete:', currentState.length, 'items');
    const filteredState = currentState.filter(item => item.id !== id);
    this._localState.set(filteredState);
    this._hasChanges.set(true);
    console.log('📊 Local state after delete:', filteredState.length, 'items');
    
    // Queue the operation
    const operation: OptimisticOperation = {
      id: this.generateOperationId(),
      type: 'delete',
      entityId: id,
      data: null,
      timestamp: new Date(),
      retryCount: 0
    };
    
    this.addPendingOperation(operation);
  }
  
  /**
   * Conflict resolution methods
   */
  public resolveConflict(entityId: string | number, resolution: 'accept_local' | 'accept_server' | 'merge'): void {
    const conflicts = this._conflicts();
    const conflict = conflicts.get(entityId);
    
    if (!conflict) {
      console.warn('No conflict found for entity:', entityId);
      return;
    }
    
    switch (resolution) {
      case 'accept_local':
        this.acceptLocalVersion(entityId, conflict);
        break;
      case 'accept_server':
        this.acceptServerVersion(entityId, conflict);
        break;
      case 'merge':
        this.mergeVersions(entityId, conflict);
        break;
    }
    
    // Remove conflict
    conflicts.delete(entityId);
    this._conflicts.set(new Map(conflicts));
  }
  
  /**
   * Synchronization methods
   */
  public async syncWithServer(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      const serverData = await this.fetchFromServer();
      this._serverState.set(serverData);
      
      if (!this.options.enableConflictDetection) {
        this._localState.set(serverData);
        this._hasChanges.set(false);
      } else {
        this.detectAllConflicts(serverData);
      }
      
      this.updateLastSync();
    } catch (error) {
      console.error('Failed to sync with server:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }
  
  public async forcePushToServer(): Promise<void> {
    if (!this.hasPendingOperations()) {
      console.warn('No pending operations to push');
      return;
    }
    
    this._isLoading.set(true);
    
    try {
      const operations = this._pendingOperations();
      await this.processOperationQueue(operations);
    } finally {
      this._isLoading.set(false);
    }
  }
  
  /**
   * Reset and cleanup methods
   */
  public reset(): void {
    this._localState.set([]);
    this._serverState.set([]);
    this._conflicts.set(new Map());
    this._pendingOperations.set([]);
    this._hasChanges.set(false);
    this._lastSync.set(null);
    this._isLoading.set(false);
  }
  
  public clearConflicts(): void {
    this._conflicts.set(new Map());
  }
  
  public cancelPendingOperations(): void {
    this._pendingOperations.set([]);
    this._hasChanges.set(false);
  }
  
  // Abstract methods to be implemented by concrete classes
  protected abstract fetchFromServer(): Promise<T[]>;
  protected abstract serverCreate(data: Omit<T, 'id'>): Promise<T>;
  protected abstract serverUpdate(id: string | number, changes: Partial<T>): Promise<T>;
  protected abstract serverDelete(id: string | number): Promise<void>;
  protected abstract extractEntityId(entity: any): string | number;
  
  // Optional hooks for concrete classes
  protected onRealtimeConnected?(): void;
  protected onRealtimeDisconnected?(): void;
  protected onBulkOperationStarted?(data: any): void;
  protected onBulkOperationProgress?(data: any): void;
  protected onBulkOperationCompleted?(data: any): void;
  protected onConflictDetected?(entityId: string | number, conflict: ConflictInfo): void;
  protected onEntityLocked?(entityId: string | number, userId: string, lockType?: string): void;
  protected onEntityUnlocked?(entityId: string | number, userId: string): void;
  
  // Private helper methods
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private addPendingOperation(operation: OptimisticOperation): void {
    const operations = [...this._pendingOperations(), operation];
    this._pendingOperations.set(operations);
    this.operationQueue$.next(operations);
  }
  
  private removePendingOperation(type: OptimisticOperation['type'], entityId: string | number): void {
    const operations = this._pendingOperations().filter(
      op => !(op.type === type && op.entityId === entityId)
    );
    this._pendingOperations.set(operations);
  }
  
  private async processOperationQueue(operations: OptimisticOperation[]): Promise<void> {
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        this.removePendingOperation(operation.type, operation.entityId);
      } catch (error) {
        console.error('Failed to execute operation:', operation, error);
        
        if (operation.retryCount < this.options.retryAttempts!) {
          operation.retryCount++;
          console.log(`Retrying operation (${operation.retryCount}/${this.options.retryAttempts})`);
        } else {
          console.error('Max retry attempts reached for operation:', operation);
          this.removePendingOperation(operation.type, operation.entityId);
          this.revertOptimisticOperation(operation);
        }
      }
    }
  }
  
  private async executeOperation(operation: OptimisticOperation): Promise<void> {
    console.log('🚀 Executing operation:', operation.type, 'for entity:', operation.entityId);
    
    switch (operation.type) {
      case 'create': {
        console.log('🚀 Calling serverCreate with data:', operation.data);
        const serverResult = await this.serverCreate(operation.data);
        console.log('✅ Server response received:', serverResult);
        
        // Replace optimistic item with server result immediately
        console.log('🔄 Replacing optimistic entity with server result');
        this.replaceOptimisticWithServerData(operation.entityId, serverResult);
        
        // Also update server state if not already there
        const currentServerState = this._serverState();
        const existingServerIndex = currentServerState.findIndex(item => item.id === serverResult.id);
        if (existingServerIndex === -1) {
          console.log('📊 Adding server result to server state');
          this._serverState.set([...currentServerState, serverResult]);
        }
        break;
      }
      case 'update':
        await this.serverUpdate(operation.entityId, operation.data);
        break;
      case 'delete': {
        console.log('🗑️ Calling serverDelete for entity:', operation.entityId);
        await this.serverDelete(operation.entityId);
        console.log('✅ Server delete completed');
        
        // Remove from server state if exists
        const currentServerState = this._serverState();
        const filteredServerState = currentServerState.filter(item => item.id !== operation.entityId);
        if (filteredServerState.length !== currentServerState.length) {
          console.log('📊 Removing deleted item from server state');
          this._serverState.set(filteredServerState);
        }
        break;
      }
    }
    
    console.log('✅ Operation execution completed');
  }
  
  private revertOptimisticOperation(operation: OptimisticOperation): void {
    const currentState = this._localState();
    
    switch (operation.type) {
      case 'create':
        // Remove the optimistically created item
        const filteredState = currentState.filter(item => item.id !== operation.entityId);
        this._localState.set(filteredState);
        break;
      case 'delete':
        // Restore the optimistically deleted item from server state
        const serverItem = this._serverState().find(item => item.id === operation.entityId);
        if (serverItem) {
          this._localState.set([...currentState, serverItem]);
        }
        break;
      case 'update':
        // Revert to server version
        const serverVersion = this._serverState().find(item => item.id === operation.entityId);
        if (serverVersion) {
          const revertedState = currentState.map(item => 
            item.id === operation.entityId ? serverVersion : item
          );
          this._localState.set(revertedState);
        }
        break;
    }
  }
  
  private retryFailedOperations(): void {
    const operations = this._pendingOperations();
    if (operations.length > 0) {
      this.operationQueue$.next(operations);
    }
  }
  
  private hasLocalChanges(entityId: string | number): boolean {
    const localItem = this._localState().find(item => item.id === entityId);
    const serverItem = this._serverState().find(item => item.id === entityId);
    
    if (!localItem || !serverItem) return false;
    
    return JSON.stringify(localItem) !== JSON.stringify(serverItem);
  }
  
  private detectConflicts(serverData: T): void {
    const localItem = this._localState().find(item => item.id === serverData.id);
    
    if (!localItem) return;
    
    // Simple field-level conflict detection
    const conflictedFields = Object.keys(serverData).filter(key => {
      return localItem[key] !== serverData[key];
    });
    
    if (conflictedFields.length > 0) {
      const conflict: ConflictInfo = {
        localVersion: localItem,
        serverVersion: serverData,
        conflictedFields,
        timestamp: new Date()
      };
      
      this.handleConflictDetected(conflict);
    } else {
      this.mergeServerChange('update', serverData);
    }
  }
  
  private detectAllConflicts(serverData: T[]): void {
    serverData.forEach(serverItem => {
      this.detectConflicts(serverItem);
    });
  }
  
  private mergeServerChange(action: 'create' | 'update' | 'delete', data: T): void {
    const currentState = this._localState();
    
    switch (action) {
      case 'create':
        if (!currentState.find(item => item.id === data.id)) {
          this._localState.set([...currentState, data]);
        }
        break;
      case 'update':
        const updatedState = currentState.map(item => 
          item.id === data.id ? data : item
        );
        this._localState.set(updatedState);
        break;
      case 'delete':
        const filteredState = currentState.filter(item => item.id !== data.id);
        this._localState.set(filteredState);
        break;
    }
  }

  /**
   * Check if an optimistic create operation matches the server response
   */
  private isMatchingOptimisticCreate(operation: OptimisticOperation, serverData: T): boolean {
    if (operation.type !== 'create') return false;
    
    // Compare the data properties to see if this is the same entity
    const opData = operation.data as any;
    const sData = serverData as any;
    
    console.log('🔍 Comparing optimistic data vs server data:');
    console.log('   Optimistic:', { 
      email: opData.email, 
      username: opData.username, 
      firstName: opData.firstName, 
      lastName: opData.lastName,
      timestamp: operation.timestamp.getTime()
    });
    console.log('   Server:', { 
      email: sData.email, 
      username: sData.username, 
      firstName: sData.firstName, 
      lastName: sData.lastName,
      id: sData.id
    });
    
    // Use stricter matching - require multiple fields to match to avoid false positives
    const emailMatch = opData.email === sData.email;
    const usernameMatch = opData.username === sData.username;
    const nameMatch = opData.firstName === sData.firstName && opData.lastName === sData.lastName;
    
    // Require at least 2 out of 3 matches for higher confidence
    const matchScore = [emailMatch, usernameMatch, nameMatch].filter(Boolean).length;
    const isMatch = matchScore >= 2;
    
    console.log('🔍 Match analysis:', { emailMatch, usernameMatch, nameMatch, matchScore, isMatch });
    
    // Additional check: ensure operation is recent (within last 30 seconds)
    const isRecentOperation = (Date.now() - operation.timestamp.getTime()) < 30000;
    const finalMatch = isMatch && isRecentOperation;
    
    console.log('🔍 Final match result:', { isMatch, isRecentOperation, finalMatch });
    return finalMatch;
  }

  /**
   * Replace optimistic item with server data
   */
  private replaceOptimisticWithServerData(tempId: string | number, serverData: T): void {
    const currentState = this._localState();
    const optimisticIndex = currentState.findIndex(item => item.id === tempId);
    
    console.log('🔄 Replacing optimistic data:', { 
      tempId, 
      serverId: serverData.id, 
      optimisticIndex,
      totalItems: currentState.length 
    });
    
    if (optimisticIndex !== -1) {
      // Check if server data already exists in local state
      const existingServerIndex = currentState.findIndex(item => item.id === serverData.id);
      
      if (existingServerIndex !== -1 && existingServerIndex !== optimisticIndex) {
        // Server data already exists! Remove the optimistic one
        console.log('⚠️ Server data already exists, removing optimistic duplicate');
        const filteredState = currentState.filter(item => item.id !== tempId);
        this._localState.set(filteredState);
      } else {
        // Safe to replace optimistic with server data
        console.log('✅ Replacing optimistic item with server data');
        const updatedState = [...currentState];
        updatedState[optimisticIndex] = serverData;
        this._localState.set(updatedState);
      }
    } else {
      console.log('⚠️ Optimistic item not found for replacement');
    }
    
    console.log('📊 Local state after replacement:', this._localState().length, 'items');
  }
  
  private acceptLocalVersion(entityId: string | number, conflict: ConflictInfo): void {
    // Push local version to server
    this.optimisticUpdate(entityId, conflict.localVersion);
  }
  
  private acceptServerVersion(entityId: string | number, conflict: ConflictInfo): void {
    // Accept server version
    this.mergeServerChange('update', conflict.serverVersion);
  }
  
  private mergeVersions(entityId: string | number, conflict: ConflictInfo): void {
    // Simple merge strategy - could be enhanced with custom merge logic
    const merged = { ...conflict.serverVersion, ...conflict.localVersion };
    this.mergeServerChange('update', merged);
  }
  
  private updateLastSync(): void {
    this._lastSync.set(new Date());
  }
}