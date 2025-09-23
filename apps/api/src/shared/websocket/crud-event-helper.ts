import { RealtimeEventBus } from './realtime-event-bus';
import { WebSocketManager } from './websocket.gateway';

interface EventContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface EventMetadata {
  timestamp: string;
  userId: string;
  sessionId: string;
  featureVersion: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  context?: EventContext;
}

interface BulkEventProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

/**
 * Generic CRUD Event Helper
 * 
 * This helper provides a scalable way to emit real-time events for any entity
 * without bloating the EventService with entity-specific methods.
 */
export class CrudEventHelper {
  private websocketManager: WebSocketManager;
  private eventBus?: RealtimeEventBus;
  private feature: string;
  private entity: string;
  private currentUserId: string = 'system';
  private currentSessionId: string = 'unknown';

  constructor(
    websocketManager: WebSocketManager,
    feature: string,
    entity: string,
    eventBus?: RealtimeEventBus
  ) {
    this.websocketManager = websocketManager;
    this.eventBus = eventBus;
    this.feature = feature;
    this.entity = entity;
  }

  /**
   * Set event bus instance for enhanced event handling
   */
  setEventBus(eventBus: RealtimeEventBus): void {
    this.eventBus = eventBus;
  }

  /**
   * Set current user context for events
   */
  setContext(userId: string, sessionId?: string): void {
    this.currentUserId = userId;
    this.currentSessionId = sessionId || 'unknown';
  }

  /**
   * Emit a generic event
   */
  private emit(
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    context?: EventContext
  ): void {
    try {
      // Use EventBus if available for enhanced event handling
      if (this.eventBus) {
        const metadata = {
          userId: context?.userId || this.currentUserId,
          sessionId: context?.sessionId || this.currentSessionId,
          requestId: context?.requestId,
          version: this.getFeatureVersion()
        };
        
        this.eventBus.emitEvent(this.feature, this.entity, action, data, priority, metadata);
      } else {
        // Fallback to direct WebSocket emission
        this.websocketManager.emitToFeature(this.feature, this.entity, action, data, priority);
      }
      
      console.log(
        `📡 CrudEventHelper: ${this.feature}.${this.entity}.${action} with priority ${priority}`
      );
    } catch (error) {
      console.error(`❌ Failed to emit ${this.feature}.${this.entity}.${action}:`, error);
    }
  }

  // ===== BASIC CRUD OPERATIONS =====

  /**
   * Emit created event
   */
  emitCreated(data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.emit('created', data, priority);
  }

  /**
   * Emit updated event
   */
  emitUpdated(data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.emit('updated', data, priority);
  }

  /**
   * Emit deleted event
   */
  emitDeleted(id: string | number, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    console.log(`🗑️ CrudEventHelper.emitDeleted: ${this.feature}.${this.entity}.deleted with ID:`, id);
    this.emit('deleted', { id }, priority);
    console.log(`✅ CrudEventHelper.emitDeleted completed`);
  }

  // ===== STATUS & LIFECYCLE OPERATIONS =====

  /**
   * Emit activated event
   */
  emitActivated(data: any): void {
    this.emit('activated', data, 'normal');
  }

  /**
   * Emit deactivated event
   */
  emitDeactivated(data: any): void {
    this.emit('deactivated', data, 'normal');
  }

  /**
   * Emit status change event
   */
  emitStatusChanged(data: { id: string | number; oldStatus: string; newStatus: string; [key: string]: any }): void {
    this.emit('status_changed', data, 'normal');
  }

  // ===== RELATIONSHIP OPERATIONS =====

  /**
   * Emit assigned event (for relationships)
   */
  emitAssigned(data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.emit('assigned', data, priority);
  }

  /**
   * Emit revoked event (for relationship removals)
   */
  emitRevoked(data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.emit('revoked', data, priority);
  }

  // ===== BULK OPERATIONS =====

  /**
   * Emit bulk operation started event
   */
  emitBulkStarted(data: { operationId: string; total: number; operation: string }): void {
    this.emit('bulk_started', data, 'high');
  }

  /**
   * Emit bulk operation progress event
   */
  emitBulkProgress(data: { operationId: string; progress: BulkEventProgress }): void {
    this.emit('bulk_progress', data, 'normal');
  }

  /**
   * Emit bulk operation completed event
   */
  emitBulkCompleted(data: { 
    operationId: string; 
    results: { successful: number; failed: number; errors?: any[] } 
  }): void {
    this.emit('bulk_completed', data, 'high');
  }

  // ===== COLLABORATION OPERATIONS =====

  /**
   * Emit lock acquired event (for collaborative editing)
   */
  emitLockAcquired(data: { id: string | number; userId: string; lockType?: string }): void {
    this.emit('lock_acquired', data, 'high');
  }

  /**
   * Emit lock released event
   */
  emitLockReleased(data: { id: string | number; userId: string; lockType?: string }): void {
    this.emit('lock_released', data, 'high');
  }

  /**
   * Emit conflict detected event
   */
  emitConflictDetected(data: { id: string | number; conflictType: string; users: string[] }): void {
    this.emit('conflict_detected', data, 'critical');
  }

  /**
   * Emit conflict resolved event
   */
  emitConflictResolved(data: { id: string | number; resolution: string; resolvedBy: string }): void {
    this.emit('conflict_resolved', data, 'high');
  }

  // ===== CUSTOM EVENTS =====

  /**
   * Emit custom event with any action name
   */
  emitCustom(
    action: string, 
    data: any, 
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    this.emit(action, data, priority);
  }

  // ===== USER-SPECIFIC EVENTS =====

  /**
   * Emit event to specific user only
   */
  emitToUser(
    userId: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    try {
      const eventName = `${this.feature}.${this.entity}.${action}`;
      this.websocketManager.emitToUser(userId, eventName, data);
      
      console.log(
        `📡 CrudEventHelper: Event to user ${userId}: ${this.feature}.${this.entity}.${action}`
      );
    } catch (error) {
      console.error(`❌ Failed to emit event to user ${userId}:`, error);
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Get feature version
   */
  private getFeatureVersion(): string {
    return process.env.APP_VERSION || '1.0.0';
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return this.websocketManager.getStats();
  }
}

/**
 * Factory function to create CrudEventHelper instances
 */
export function createCrudEventHelper(
  websocketManager: WebSocketManager,
  feature: string,
  entity: string,
  eventBus?: RealtimeEventBus
): CrudEventHelper {
  return new CrudEventHelper(websocketManager, feature, entity, eventBus);
}