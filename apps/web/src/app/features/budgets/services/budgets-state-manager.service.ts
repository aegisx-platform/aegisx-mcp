import { Injectable, inject } from '@angular/core';
import {
  BaseRealtimeStateManager,
  BaseEntity,
  ConflictInfo,
} from '../../../shared/business/services/base-realtime-state-manager';
import { BudgetService } from './budgets.service';
import { Budget } from '../types/budgets.types';

/**
 * Real-time State Manager for Budget
 *
 * Features:
 * - Automatic WebSocket synchronization
 * - Optimistic updates
 * - Conflict detection and resolution
 * - Offline support with pending operations queue
 *
 * Usage:
 * ```typescript
 * class MyComponent {
 *   private stateManager = inject(BudgetStateManager);
 *
 *   // Subscribe to real-time state
 *   budgetsList = this.stateManager.localState;
 *
 *   // Create with optimistic update
 *   async create() {
 *     await this.stateManager.optimisticCreate(data);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetStateManager extends BaseRealtimeStateManager<Budget> {
  private budgetsService = inject(BudgetService);

  constructor() {
    super({
      feature: 'budgets',
      entity: 'budget',
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      debounceMs: 300,
      retryAttempts: 3,
    });

    // Initialize after all dependencies are ready
    this.initializeStateManager();

    console.log('🎯 BudgetStateManager initialized with real-time features');
  }

  /**
   * Fetch budgets from server
   * Called during sync operations
   */
  protected async fetchFromServer(): Promise<Budget[]> {
    console.log('📡 Fetching budgets from server...');

    try {
      await this.budgetsService.loadBudgetList({
        limit: 1000,
        page: 1,
      });

      const items = this.budgetsService.budgetsList();
      console.log(`✅ Fetched ${items.length} budgets from server`);

      return items;
    } catch (error) {
      console.error('❌ Failed to fetch budgets:', error);
      throw error;
    }
  }

  /**
   * Create budget on server
   * Called after optimistic create to persist to server
   */
  protected async serverCreate(data: Omit<Budget, 'id'>): Promise<Budget> {
    console.log('🚀 Creating budget on server:', data);

    try {
      const result = await this.budgetsService.createBudget(data);
      if (!result) {
        throw new Error('Failed to create budget: Server returned null');
      }
      console.log('✅ Budget created on server:', result);

      return result;
    } catch (error) {
      console.error('❌ Failed to create budget:', error);
      throw error;
    }
  }

  /**
   * Update budget on server
   * Called after optimistic update to persist to server
   */
  protected async serverUpdate(
    id: string | number,
    changes: Partial<Budget>,
  ): Promise<Budget> {
    console.log('🔄 Updating budget on server:', { id, changes });

    try {
      const result = await this.budgetsService.updateBudget(
        id as number,
        changes,
      );
      if (!result) {
        throw new Error('Failed to update budget: Server returned null');
      }
      console.log('✅ Budget updated on server:', result);

      return result;
    } catch (error) {
      console.error('❌ Failed to update budget:', error);
      throw error;
    }
  }

  /**
   * Delete budget from server
   * Called after optimistic delete to persist to server
   */
  protected async serverDelete(id: string | number): Promise<void> {
    console.log('🗑️ Deleting budget from server:', id);

    try {
      await this.budgetsService.deleteBudget(id as number);
      console.log('✅ Budget deleted from server');
    } catch (error) {
      console.error('❌ Failed to delete budget:', error);
      throw error;
    }
  }

  /**
   * Extract entity ID for conflict detection
   */
  protected extractEntityId(entity: any): string | number {
    return entity.id;
  }

  /**
   * Lifecycle hook: Called when WebSocket connection is established
   */
  protected override onRealtimeConnected(): void {
    console.log('✅ Budget real-time connection established');
    // Sync with server when connection is restored
    this.syncWithServer().catch((error) => {
      console.error('Failed to sync after reconnection:', error);
    });
  }

  /**
   * Lifecycle hook: Called when WebSocket connection is lost
   */
  protected override onRealtimeDisconnected(): void {
    console.warn(
      '⚠️ Budget real-time connection lost - operating in offline mode',
    );
  }

  /**
   * Lifecycle hook: Called when bulk operation starts
   */
  protected override onBulkOperationStarted(data: {
    operationId: string;
    total: number;
    operation: string;
  }): void {
    console.log('📦 Bulk operation started:', data);
  }

  /**
   * Lifecycle hook: Called during bulk operation progress
   */
  protected override onBulkOperationProgress(data: {
    operationId: string;
    progress: any;
  }): void {
    console.log('📊 Bulk operation progress:', data);
  }

  /**
   * Lifecycle hook: Called when bulk operation completes
   */
  protected override onBulkOperationCompleted(data: {
    operationId: string;
    results: any;
  }): void {
    console.log('✅ Bulk operation completed:', data);
    // Refresh local state after bulk operations
    this.syncWithServer().catch((error) => {
      console.error('Failed to sync after bulk operation:', error);
    });
  }

  /**
   * Lifecycle hook: Called when conflict is detected
   */
  protected override onConflictDetected(
    entityId: string | number,
    conflict: ConflictInfo,
  ): void {
    console.warn('🚨 Conflict detected for budget:', entityId, conflict);

    // Default strategy: Accept server version
    // Override this method to implement custom conflict resolution
    this.resolveConflict(entityId, 'accept_server');
  }

  /**
   * Lifecycle hook: Called when entity is locked by another user
   */
  protected override onEntityLocked(
    entityId: string | number,
    userId: string,
    lockType?: string,
  ): void {
    console.log('🔒 Budget locked:', { entityId, userId, lockType });
  }

  /**
   * Lifecycle hook: Called when entity is unlocked
   */
  protected override onEntityUnlocked(
    entityId: string | number,
    userId: string,
  ): void {
    console.log('🔓 Budget unlocked:', { entityId, userId });
  }

  /**
   * Public API: Initialize real-time features
   * Call this from your component's constructor or ngOnInit
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing Budget real-time features...');

    try {
      await this.syncWithServer();
      console.log('✅ Budget state manager ready');
    } catch (error) {
      console.error('❌ Failed to initialize Budget state manager:', error);
      throw error;
    }
  }

  /**
   * Public API: Force refresh from server
   * Useful for manual refresh buttons
   */
  public async refresh(): Promise<void> {
    console.log('🔄 Refreshing budgets...');
    await this.syncWithServer();
  }

  /**
   * Public API: Get sync statistics
   */
  public getSyncStats() {
    return {
      localCount: this.localState().length,
      serverCount: this.serverState().length,
      conflictCount: this.conflicts().size,
      pendingOperations: this.pendingOperations().length,
      lastSync: this.lastSync(),
      syncStatus: this.syncStatus(),
      isConnected: this.isConnected(),
    };
  }
}
