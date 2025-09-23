import { FastifyRequest } from 'fastify';
import { WebSocketManager, WebSocketMessage } from './websocket.gateway';
import { RealtimeEventBus } from './realtime-event-bus';
import { CrudEventHelper, createCrudEventHelper } from './crud-event-helper';

interface EventContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Scalable Event Service using Generic CrudEventHelper Pattern
 * 
 * Instead of having individual methods for each entity, this service provides
 * a clean API: eventService.for('feature', 'entity').emitCreated(data)
 * 
 * Usage Examples:
 * - eventService.for('users', 'user').emitCreated(user)
 * - eventService.for('products', 'product').emitDeleted(productId)
 * - eventService.for('orders', 'payment').emitCustom('failed', errorData)
 * - eventService.for('rbac', 'role').emitAssigned(roleAssignmentData)
 */
export class EventService {
  private websocketManager: WebSocketManager;
  private currentRequest?: FastifyRequest;
  private eventBus?: RealtimeEventBus;
  private eventHelpers: Map<string, CrudEventHelper> = new Map();

  constructor(websocketManager: WebSocketManager, eventBus?: RealtimeEventBus) {
    this.websocketManager = websocketManager;
    this.eventBus = eventBus;
  }

  /**
   * Set event bus instance for enhanced event handling
   */
  setEventBus(eventBus: RealtimeEventBus): void {
    this.eventBus = eventBus;
    // Update all existing helpers with new event bus
    this.eventHelpers.forEach(helper => {
      helper.setEventBus(eventBus);
    });
  }

  /**
   * Set current request context (for extracting user info)
   */
  setRequestContext(request: FastifyRequest) {
    this.currentRequest = request;
    
    // Update context for all existing event helpers
    const userId = this.getCurrentUserId();
    const sessionId = this.getCurrentSessionId();
    this.eventHelpers.forEach(helper => {
      helper.setContext(userId, sessionId);
    });
  }

  /**
   * Main method: Get or create CrudEventHelper for any feature/entity pair
   * This is the core of the scalable design
   * 
   * Usage: eventService.for('users', 'user').emitCreated(userData)
   */
  for(feature: string, entity: string): CrudEventHelper {
    const key = `${feature}.${entity}`;
    
    if (!this.eventHelpers.has(key)) {
      const helper = createCrudEventHelper(this.websocketManager, feature, entity, this.eventBus);
      
      // Set current context
      const userId = this.getCurrentUserId();
      const sessionId = this.getCurrentSessionId();
      helper.setContext(userId, sessionId);
      
      this.eventHelpers.set(key, helper);
    }
    
    return this.eventHelpers.get(key)!;
  }

  /**
   * Emit a generic event to all subscribers of a feature
   * @deprecated Use eventService.for(feature, entity).emitCustom(action, data) instead
   */
  emit(
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    context?: EventContext
  ): void {
    this.for(feature, entity).emitCustom(action, data, priority);
  }

  /**
   * Emit event to specific user only
   * @deprecated Use eventService.for(feature, entity).emitToUser(userId, action, data) instead
   */
  emitToUser(
    userId: string,
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    this.for(feature, entity).emitToUser(userId, action, data, priority);
  }

  // ===== BACKWARD COMPATIBILITY METHODS =====
  // These methods maintain compatibility with existing code
  // New code should use eventService.for('feature', 'entity').emitCreated(data)

  // Users Events (backward compatibility)
  users = {
    userCreated: (user: any) => this.for('users', 'user').emitCreated(user),
    userUpdated: (user: any) => this.for('users', 'user').emitUpdated(user),
    userDeleted: (userId: string) => this.for('users', 'user').emitDeleted(userId),
    userActivated: (user: any) => this.for('users', 'user').emitActivated(user),
    userDeactivated: (user: any) => this.for('users', 'user').emitDeactivated(user),
    profileUpdated: (profile: any) => this.for('users', 'profile').emitUpdated(profile),
    sessionCreated: (session: any) => this.for('users', 'session').emitCreated(session),
    sessionExpired: (sessionId: string) => this.for('users', 'session').emitCustom('expired', { id: sessionId }, 'high'),
  };

  /**
   * @deprecated Use eventService.for(feature, entity).emitCreated(data) instead
   */
  emitCreated(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.for(feature, entity).emitCreated(data, priority);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitUpdated(data) instead
   */
  emitUpdated(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.for(feature, entity).emitUpdated(data, priority);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitDeleted(id) instead
   */
  emitDeleted(feature: string, entity: string, id: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.for(feature, entity).emitDeleted(id, priority);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitActivated(data) instead
   */
  emitActivated(feature: string, entity: string, data: any): void {
    this.for(feature, entity).emitActivated(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitDeactivated(data) instead
   */
  emitDeactivated(feature: string, entity: string, data: any): void {
    this.for(feature, entity).emitDeactivated(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitStatusChanged(data) instead
   */
  emitStatusChanged(feature: string, entity: string, data: { id: string; oldStatus: string; newStatus: string; [key: string]: any }): void {
    this.for(feature, entity).emitStatusChanged(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitAssigned(data) instead
   */
  emitAssigned(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.for(feature, entity).emitAssigned(data, priority);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitRevoked(data) instead
   */
  emitRevoked(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.for(feature, entity).emitRevoked(data, priority);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitBulkStarted(data) instead
   */
  emitBulkStarted(feature: string, entity: string, data: { operationId: string; total: number; operation: string }): void {
    this.for(feature, entity).emitBulkStarted(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitBulkProgress(data) instead
   */
  emitBulkProgress(feature: string, entity: string, data: { operationId: string; progress: any }): void {
    this.for(feature, entity).emitBulkProgress(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitBulkCompleted(data) instead
   */
  emitBulkCompleted(feature: string, entity: string, data: { operationId: string; results: { successful: number; failed: number; errors?: any[] } }): void {
    this.for(feature, entity).emitBulkCompleted(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitLockAcquired(data) instead
   */
  emitLockAcquired(feature: string, entity: string, data: { id: string; userId: string; lockType?: string }): void {
    this.for(feature, entity).emitLockAcquired(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitLockReleased(data) instead
   */
  emitLockReleased(feature: string, entity: string, data: { id: string; userId: string; lockType?: string }): void {
    this.for(feature, entity).emitLockReleased(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitConflictDetected(data) instead
   */
  emitConflictDetected(feature: string, entity: string, data: { id: string; conflictType: string; users: string[] }): void {
    this.for(feature, entity).emitConflictDetected(data);
  }

  /**
   * @deprecated Use eventService.for(feature, entity).emitConflictResolved(data) instead
   */
  emitConflictResolved(feature: string, entity: string, data: { id: string; resolution: string; resolvedBy: string }): void {
    this.for(feature, entity).emitConflictResolved(data);
  }

  // ===== HELPER METHODS =====

  /**
   * Get current user ID from request context
   */
  private getCurrentUserId(): string {
    try {
      return (this.currentRequest as any)?.user?.id || 'system';
    } catch {
      return 'system';
    }
  }

  /**
   * Get current session ID from request context
   */
  private getCurrentSessionId(): string {
    try {
      return (this.currentRequest as any)?.session?.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get gateway connection statistics
   */
  getConnectionStats() {
    return this.websocketManager.getStats();
  }
}