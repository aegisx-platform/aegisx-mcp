import { FastifyRequest } from 'fastify';
import { WebSocketManager, WebSocketMessage } from './websocket.gateway';

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

export class EventService {
  private websocketManager: WebSocketManager;
  private currentRequest?: FastifyRequest;

  constructor(websocketManager: WebSocketManager) {
    this.websocketManager = websocketManager;
  }

  /**
   * Set current request context (for extracting user info)
   */
  setRequestContext(request: FastifyRequest) {
    this.currentRequest = request;
  }

  /**
   * Emit a generic event to all subscribers of a feature
   */
  emit(
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    context?: EventContext
  ): void {
    try {
      this.websocketManager.emitToFeature(feature, entity, action, data, priority);
      
      console.log(
        `📡 Emitted event: ${feature}.${entity}.${action} with priority ${priority}`
      );
    } catch (error) {
      console.error(`❌ Failed to emit event ${feature}.${entity}.${action}:`, error);
    }
  }

  /**
   * Emit event to specific user only
   */
  emitToUser(
    userId: string,
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    try {
      const eventName = `${feature}.${entity}.${action}`;
      this.websocketManager.emitToUser(userId, eventName, data);
      
      console.log(
        `📡 Emitted event to user ${userId}: ${feature}.${entity}.${action}`
      );
    } catch (error) {
      console.error(`❌ Failed to emit event to user ${userId}:`, error);
    }
  }

  // Convenience methods for common CRUD operations

  /**
   * Emit created event
   */
  emitCreated(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.emit(feature, entity, 'created', data, priority);
  }

  /**
   * Emit updated event
   */
  emitUpdated(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.emit(feature, entity, 'updated', data, priority);
  }

  /**
   * Emit deleted event
   */
  emitDeleted(feature: string, entity: string, id: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    this.emit(feature, entity, 'deleted', { id }, priority);
  }

  /**
   * Emit assigned event (for relationships like user-role assignments)
   */
  emitAssigned(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.emit(feature, entity, 'assigned', data, priority);
  }

  /**
   * Emit revoked event (for relationship removals)
   */
  emitRevoked(feature: string, entity: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'high'): void {
    this.emit(feature, entity, 'revoked', data, priority);
  }

  /**
   * Emit status change event
   */
  emitStatusChanged(feature: string, entity: string, data: { id: string; oldStatus: string; newStatus: string; [key: string]: any }): void {
    this.emit(feature, entity, 'status_changed', data, 'normal');
  }

  /**
   * Emit activated event
   */
  emitActivated(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'activated', data, 'normal');
  }

  /**
   * Emit deactivated event
   */
  emitDeactivated(feature: string, entity: string, data: any): void {
    this.emit(feature, entity, 'deactivated', data, 'normal');
  }

  // Bulk operation events

  /**
   * Emit bulk operation started event
   */
  emitBulkStarted(feature: string, entity: string, data: { operationId: string; total: number; operation: string }): void {
    this.emit(feature, entity, 'bulk_started', data, 'high');
  }

  /**
   * Emit bulk operation progress event
   */
  emitBulkProgress(feature: string, entity: string, data: { operationId: string; progress: BulkEventProgress }): void {
    this.emit(feature, entity, 'bulk_progress', data, 'normal');
  }

  /**
   * Emit bulk operation completed event
   */
  emitBulkCompleted(feature: string, entity: string, data: { operationId: string; results: { successful: number; failed: number; errors?: any[] } }): void {
    this.emit(feature, entity, 'bulk_completed', data, 'high');
  }

  // Real-time collaboration events

  /**
   * Emit lock acquired event (for collaborative editing)
   */
  emitLockAcquired(feature: string, entity: string, data: { id: string; userId: string; lockType?: string }): void {
    this.emit(feature, entity, 'lock_acquired', data, 'high');
  }

  /**
   * Emit lock released event
   */
  emitLockReleased(feature: string, entity: string, data: { id: string; userId: string; lockType?: string }): void {
    this.emit(feature, entity, 'lock_released', data, 'high');
  }

  /**
   * Emit conflict detected event
   */
  emitConflictDetected(feature: string, entity: string, data: { id: string; conflictType: string; users: string[] }): void {
    this.emit(feature, entity, 'conflict_detected', data, 'critical');
  }

  /**
   * Emit conflict resolved event
   */
  emitConflictResolved(feature: string, entity: string, data: { id: string; resolution: string; resolvedBy: string }): void {
    this.emit(feature, entity, 'conflict_resolved', data, 'high');
  }

  // Feature-specific convenience methods

  // RBAC Events
  rbac = {
    roleCreated: (role: any) => this.emitCreated('rbac', 'role', role),
    roleUpdated: (role: any) => this.emitUpdated('rbac', 'role', role),
    roleDeleted: (roleId: string) => this.emitDeleted('rbac', 'role', roleId),
    permissionAssigned: (data: { roleId: string; permissionId: string; assignedBy: string }) => 
      this.emitAssigned('rbac', 'permission', data),
    permissionRevoked: (data: { roleId: string; permissionId: string; revokedBy: string }) => 
      this.emitRevoked('rbac', 'permission', data),
    userRoleAssigned: (data: { userId: string; roleId: string; assignedBy: string; expiresAt?: string }) => 
      this.emitAssigned('rbac', 'user_role', data),
    userRoleRemoved: (data: { userId: string; roleId: string; removedBy: string }) => 
      this.emitRevoked('rbac', 'user_role', data),
    hierarchyChanged: (data: { roleId: string; oldParentId?: string; newParentId?: string; changedBy: string }) => 
      this.emit('rbac', 'hierarchy', 'changed', data, 'high'),
  };

  // Users Events
  users = {
    userCreated: (user: any) => this.emitCreated('users', 'user', user),
    userUpdated: (user: any) => this.emitUpdated('users', 'user', user),
    userDeleted: (userId: string) => this.emitDeleted('users', 'user', userId),
    userActivated: (user: any) => this.emitActivated('users', 'user', user),
    userDeactivated: (user: any) => this.emitDeactivated('users', 'user', user),
    profileUpdated: (profile: any) => this.emitUpdated('users', 'profile', profile),
    sessionCreated: (session: any) => this.emitCreated('users', 'session', session),
    sessionExpired: (sessionId: string) => this.emit('users', 'session', 'expired', { id: sessionId }, 'high'),
  };

  // Products Events
  products = {
    productCreated: (product: any) => this.emitCreated('products', 'product', product),
    productUpdated: (product: any) => this.emitUpdated('products', 'product', product),
    productDeleted: (productId: string) => this.emitDeleted('products', 'product', productId),
    inventoryUpdated: (data: { productId: string; oldQuantity: number; newQuantity: number }) => 
      this.emit('products', 'inventory', 'updated', data, 'normal'),
    priceUpdated: (data: { productId: string; oldPrice: number; newPrice: number; effectiveDate?: string }) => 
      this.emit('products', 'pricing', 'updated', data, 'normal'),
    stockAlert: (data: { productId: string; currentStock: number; threshold: number; alertType: 'low' | 'out' }) => 
      this.emit('products', 'inventory', 'alert', data, 'high'),
  };

  // Orders Events
  orders = {
    orderCreated: (order: any) => this.emitCreated('orders', 'order', order, 'high'),
    orderUpdated: (order: any) => this.emitUpdated('orders', 'order', order, 'high'),
    orderCancelled: (data: { orderId: string; reason: string; cancelledBy: string }) => 
      this.emit('orders', 'order', 'cancelled', data, 'high'),
    paymentReceived: (payment: any) => this.emitCreated('orders', 'payment', payment, 'high'),
    paymentFailed: (data: { orderId: string; paymentId: string; error: string }) => 
      this.emit('orders', 'payment', 'failed', data, 'critical'),
    orderShipped: (shipment: any) => this.emitCreated('orders', 'shipment', shipment, 'high'),
    orderDelivered: (data: { orderId: string; deliveredAt: string; signature?: string }) => 
      this.emit('orders', 'order', 'delivered', data, 'high'),
  };

  // Notification Events
  notifications = {
    messageSent: (message: any) => this.emitCreated('notifications', 'message', message, 'high'),
    messageRead: (data: { messageId: string; readBy: string; readAt: string }) => 
      this.emit('notifications', 'message', 'read', data, 'normal'),
    broadcastSent: (broadcast: any) => this.emitCreated('notifications', 'broadcast', broadcast, 'critical'),
  };

  // System Events
  system = {
    maintenanceStarted: (data: { message: string; estimatedDuration?: number }) => 
      this.emit('system', 'maintenance', 'started', data, 'critical'),
    maintenanceCompleted: (data: { message: string; actualDuration: number }) => 
      this.emit('system', 'maintenance', 'completed', data, 'critical'),
    configurationChanged: (data: { key: string; oldValue: any; newValue: any; changedBy: string }) => 
      this.emit('system', 'configuration', 'changed', data, 'high'),
    featureToggled: (data: { feature: string; enabled: boolean; toggledBy: string }) => 
      this.emit('system', 'feature', 'toggled', data, 'high'),
  };

  /**
   * Create event metadata from current context
   */
  private createEventMetadata(
    priority: 'low' | 'normal' | 'high' | 'critical',
    context?: EventContext
  ): EventMetadata {
    return {
      timestamp: new Date().toISOString(),
      userId: context?.userId || this.getCurrentUserId(),
      sessionId: context?.sessionId || this.getCurrentSessionId(),
      featureVersion: this.getFeatureVersion(),
      priority,
      context: context || this.getRequestContext()
    };
  }

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
   * Get request context information
   */
  private getRequestContext(): EventContext {
    try {
      return {
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
        requestId: (this.currentRequest as any)?.id,
        userAgent: this.currentRequest?.headers?.['user-agent'],
        ipAddress: this.currentRequest?.ip
      };
    } catch {
      return {};
    }
  }

  /**
   * Get feature version (can be enhanced to read from package.json or environment)
   */
  private getFeatureVersion(): string {
    return process.env.APP_VERSION || '1.0.0';
  }

  /**
   * Get gateway connection statistics
   */
  getConnectionStats() {
    return this.websocketManager.getStats();
  }
}