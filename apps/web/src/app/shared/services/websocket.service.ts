import { Injectable, OnDestroy, signal, computed, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  takeUntil,
} from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ApiConfigService } from '../../core/api-config.service';

// WebSocket Message Interface (matches backend)
export interface WebSocketMessage {
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
    context?: {
      userId?: string;
      sessionId?: string;
      requestId?: string;
      userAgent?: string;
      ipAddress?: string;
    };
  };
}

export interface ConnectionStatus {
  status:
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'error';
  timestamp: Date;
  error?: string;
}

export interface SubscriptionOptions {
  features: string[];
  userId?: string;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private socket?: Socket;
  private subscriptions = new Map<string, Subject<WebSocketMessage>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectTimeout?: any;
  private destroy$ = new Subject<void>();
  private apiConfig = inject(ApiConfigService);

  constructor() {
    // Get WebSocket config from ApiConfigService
    const wsConfig = this.apiConfig.getWebSocketConfig();
    this.maxReconnectAttempts = wsConfig.reconnectionAttempts;

    console.log('🔌 WebSocket Service initialized with config:', wsConfig);

    // Don't auto-connect in constructor - let components manually connect
    // This prevents multiple connection attempts
    console.log('🔌 WebSocket service ready for manual connection');
  }

  // Connection status
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
    status: 'disconnected',
    timestamp: new Date(),
  });

  // Signal for reactive connection status
  private _connectionStatus = signal<ConnectionStatus>({
    status: 'disconnected',
    timestamp: new Date(),
  });

  getConnectionStatus = computed(() => this._connectionStatus());

  // Message subjects for different features
  private allMessages$ = new Subject<WebSocketMessage>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  /**
   * Get current connection status as observable
   */
  getConnectionStatusObservable(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionStatus$.value.status === 'connected';
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string, options?: { forceReconnect?: boolean }): void {
    // Prevent multiple connection attempts
    if (this.socket?.connected && !options?.forceReconnect) {
      console.log('WebSocket already connected');
      return;
    }
    
    // Prevent connection while already connecting
    const currentStatus = this._connectionStatus().status;
    if (currentStatus === 'connecting' && !options?.forceReconnect) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.updateConnectionStatus('connecting');

    try {
      // Disconnect existing connection
      if (this.socket) {
        this.socket.disconnect();
      }

      const wsUrl = this.apiConfig.getWebSocketUrl();
      const wsConfig = this.apiConfig.getWebSocketConfig();
      const wsPath = this.apiConfig.getWebSocketPath();

      console.log('🔌 Connecting to WebSocket:', {
        url: wsUrl,
        path: wsPath,
        config: wsConfig,
      });

      // Create new socket connection
      this.socket = io(wsUrl, {
        path: this.apiConfig.getWebSocketPath(),
        transports: wsConfig.transports,
        auth: {
          token,
        },
        autoConnect: false, // Don't auto-connect to prevent multiple connections
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000, // Increase delay
        reconnectionDelayMax: 10000, // Increase max delay
        timeout: wsConfig.timeout,
        forceNew: false, // Don't force new connections
        upgrade: wsConfig.upgrade,
      });

      this.setupEventHandlers();
      this.storeToken(token);
      
      // Manually connect since autoConnect is false
      this.socket.connect();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.updateConnectionStatus('error', `Connection failed: ${error}`);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.subscriptions.clear();
    this.updateConnectionStatus('disconnected');
    this.removeStoredToken();
  }

  /**
   * Subscribe to features
   */
  subscribe(options: SubscriptionOptions): void {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    this.socket.emit('subscribe:features', options);

    // Create subjects for new features
    options.features.forEach((feature) => {
      if (!this.subscriptions.has(feature)) {
        this.subscriptions.set(feature, new Subject<WebSocketMessage>());
      }
    });
  }

  /**
   * Unsubscribe from features
   */
  unsubscribe(features: string[]): void {
    if (!this.socket?.connected) {
      console.warn('Cannot unsubscribe: WebSocket not connected');
      return;
    }

    this.socket.emit('unsubscribe:features', { features });

    // Clean up subjects
    features.forEach((feature) => {
      const subject = this.subscriptions.get(feature);
      if (subject) {
        subject.complete();
        this.subscriptions.delete(feature);
      }
    });
  }

  /**
   * Subscribe to all messages from a specific feature
   */
  subscribeToFeature(feature: string): Observable<WebSocketMessage> {
    if (!this.subscriptions.has(feature)) {
      this.subscriptions.set(feature, new Subject<WebSocketMessage>());
    }

    return this.subscriptions
      .get(feature)!
      .asObservable()
      .pipe(takeUntil(this.destroy$));
  }

  /**
   * Subscribe to specific entity within a feature
   */
  subscribeToEntity(
    feature: string,
    entity: string,
  ): Observable<WebSocketMessage> {
    return this.subscribeToFeature(feature).pipe(
      filter((message) => message.entity === entity),
    );
  }

  /**
   * Subscribe to specific event type
   */
  subscribeToEvent(
    feature: string,
    entity: string,
    action: string,
  ): Observable<any> {
    return this.subscribeToEntity(feature, entity).pipe(
      filter((message) => message.action === action),
      map((message) => message.data),
    );
  }

  /**
   * Subscribe to events with specific priority
   */
  subscribeByPriority(
    priority: 'low' | 'normal' | 'high' | 'critical',
  ): Observable<WebSocketMessage> {
    return this.allMessages$.pipe(
      filter((message) => message.meta.priority === priority),
      takeUntil(this.destroy$),
    );
  }

  /**
   * Subscribe to events from specific user
   */
  subscribeToUserEvents(userId: string): Observable<WebSocketMessage> {
    return this.allMessages$.pipe(
      filter((message) => message.meta.userId === userId),
      takeUntil(this.destroy$),
    );
  }

  /**
   * Send message to server
   */
  send(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Send ping to server
   */
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  /**
   * Get connection statistics from server
   */
  getStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('get_stats', {}, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Feature-specific convenience methods

  /**
   * RBAC-specific subscriptions
   */
  rbac = {
    subscribeToRoles: () => this.subscribeToEntity('rbac', 'role'),
    subscribeToPermissions: () => this.subscribeToEntity('rbac', 'permission'),
    subscribeToUserRoles: () => this.subscribeToEntity('rbac', 'user_role'),
    subscribeToHierarchy: () => this.subscribeToEntity('rbac', 'hierarchy'),

    subscribeToRoleCreated: () =>
      this.subscribeToEvent('rbac', 'role', 'created'),
    subscribeToRoleUpdated: () =>
      this.subscribeToEvent('rbac', 'role', 'updated'),
    subscribeToRoleDeleted: () =>
      this.subscribeToEvent('rbac', 'role', 'deleted'),

    subscribeToPermissionAssigned: () =>
      this.subscribeToEvent('rbac', 'permission', 'assigned'),
    subscribeToPermissionRevoked: () =>
      this.subscribeToEvent('rbac', 'permission', 'revoked'),

    subscribeToUserRoleAssigned: () =>
      this.subscribeToEvent('rbac', 'user_role', 'assigned'),
    subscribeToUserRoleRemoved: () =>
      this.subscribeToEvent('rbac', 'user_role', 'revoked'),

    subscribeToHierarchyChanged: () =>
      this.subscribeToEvent('rbac', 'hierarchy', 'changed'),
  };

  /**
   * Products-specific subscriptions
   */
  products = {
    subscribeToProducts: () => this.subscribeToEntity('products', 'product'),
    subscribeToInventory: () => this.subscribeToEntity('products', 'inventory'),
    subscribeToPricing: () => this.subscribeToEntity('products', 'pricing'),

    subscribeToProductCreated: () =>
      this.subscribeToEvent('products', 'product', 'created'),
    subscribeToProductUpdated: () =>
      this.subscribeToEvent('products', 'product', 'updated'),
    subscribeToInventoryUpdated: () =>
      this.subscribeToEvent('products', 'inventory', 'updated'),
    subscribeToPriceUpdated: () =>
      this.subscribeToEvent('products', 'pricing', 'updated'),
    subscribeToStockAlerts: () =>
      this.subscribeToEvent('products', 'inventory', 'alert'),
  };

  /**
   * Orders-specific subscriptions
   */
  orders = {
    subscribeToOrders: () => this.subscribeToEntity('orders', 'order'),
    subscribeToPayments: () => this.subscribeToEntity('orders', 'payment'),
    subscribeToShipments: () => this.subscribeToEntity('orders', 'shipment'),

    subscribeToOrderCreated: () =>
      this.subscribeToEvent('orders', 'order', 'created'),
    subscribeToOrderUpdated: () =>
      this.subscribeToEvent('orders', 'order', 'updated'),
    subscribeToOrderCancelled: () =>
      this.subscribeToEvent('orders', 'order', 'cancelled'),
    subscribeToOrderDelivered: () =>
      this.subscribeToEvent('orders', 'order', 'delivered'),

    subscribeToPaymentReceived: () =>
      this.subscribeToEvent('orders', 'payment', 'created'),
    subscribeToPaymentFailed: () =>
      this.subscribeToEvent('orders', 'payment', 'failed'),

    subscribeToOrderShipped: () =>
      this.subscribeToEvent('orders', 'shipment', 'created'),
  };

  /**
   * Setup event handlers for socket connection
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      console.log('✅ Socket ID:', this.socket?.id);
      this.updateConnectionStatus('connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.updateConnectionStatus('disconnected');

      if (reason === 'io server disconnect') {
        // Server initiated disconnect - don't auto-reconnect
        return;
      }

      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      this.updateConnectionStatus('error', error.message);
      this.attemptReconnect();
    });

    // Message routing - listen for specific event patterns
    this.socket.onAny((eventName: string, message: any) => {
      if (eventName.includes('.')) {
        // This is a feature event (e.g., 'rbac.role.created')
        const [feature, entity, action] = eventName.split('.');
        const wsMessage: WebSocketMessage = {
          feature,
          entity,
          action,
          data: message.data || message,
          meta: message.meta || {
            timestamp: new Date().toISOString(),
            userId: 'unknown',
            sessionId: 'unknown',
            featureVersion: 'v1',
            priority: 'normal',
          },
        };
        this.routeMessage(wsMessage);
      }
    });

    // Server responses
    this.socket.on('connection:established', (data: any) => {
      console.log('WebSocket connection confirmed:', data);
    });

    this.socket.on('subscribe:confirmed', (data: any) => {
      console.log('Subscribed to features:', data.features);
    });

    this.socket.on('unsubscribe:confirmed', (data: any) => {
      console.log('Unsubscribed from features:', data.features);
    });

    this.socket.on('auth:authenticated', (data: any) => {
      console.log('WebSocket authentication successful:', data);
    });

    this.socket.on('auth:error', (data: any) => {
      console.error('WebSocket authentication failed:', data);
      this.updateConnectionStatus('error', data.error);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('pong', (data) => {
      console.log('Pong received:', data);
    });

    this.socket.on('disconnect_notice', (data) => {
      console.warn('Server disconnect notice:', data);
      this.updateConnectionStatus('disconnected');
    });
  }

  /**
   * Route incoming message to appropriate subscribers
   */
  private routeMessage(message: WebSocketMessage): void {
    try {
      // Send to all messages subject
      this.allMessages$.next(message);

      // Send to feature-specific subject
      const featureSubject = this.subscriptions.get(message.feature);
      if (featureSubject) {
        featureSubject.next(message);
      }

      console.debug(
        `Routed message: ${message.feature}.${message.entity}.${message.action}`,
      );
    } catch (error) {
      console.error('Error routing message:', error, message);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    // Prevent multiple reconnection attempts
    if (this.reconnectTimeout) {
      return;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.updateConnectionStatus('error', 'Max reconnection attempts reached');
      return;
    }

    const token = this.getStoredToken();
    if (!token) {
      console.warn('⚠️ Cannot reconnect: No token available');
      return;
    }

    console.log(
      `🔄 Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`,
    );
    this.updateConnectionStatus('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`⏱️ Waiting ${delay}ms before reconnect...`);

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      this.reconnectTimeout = undefined; // Clear timeout reference
      this.connect(token, { forceReconnect: true });
    }, delay);
  }

  /**
   * Update connection status
   */
  private updateConnectionStatus(
    status: ConnectionStatus['status'],
    error?: string,
  ): void {
    const statusObj = {
      status,
      timestamp: new Date(),
      error,
    };
    this.connectionStatus$.next(statusObj);
    this._connectionStatus.set(statusObj);
  }

  /**
   * Store authentication token
   */
  private storeToken(token: string): void {
    try {
      localStorage.setItem('websocket_token', token);
    } catch (error) {
      console.warn('Could not store WebSocket token:', error);
    }
  }

  /**
   * Get stored authentication token
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('websocket_token');
    } catch (error) {
      console.warn('Could not retrieve WebSocket token:', error);
      return null;
    }
  }

  /**
   * Remove stored authentication token
   */
  private removeStoredToken(): void {
    try {
      localStorage.removeItem('websocket_token');
    } catch (error) {
      console.warn('Could not remove WebSocket token:', error);
    }
  }

  /**
   * Users-specific subscriptions
   */
  users = {
    subscribeToUsers: () => this.subscribeToEntity('users', 'user'),
    subscribeToProfiles: () => this.subscribeToEntity('users', 'profile'),
    subscribeToSessions: () => this.subscribeToEntity('users', 'session'),
    subscribeToUserCreated: () =>
      this.subscribeToEvent('users', 'user', 'created'),
    subscribeToUserUpdated: () =>
      this.subscribeToEvent('users', 'user', 'updated'),
    subscribeToUserDeleted: () =>
      this.subscribeToEvent('users', 'user', 'deleted'),
    subscribeToUserActivated: () =>
      this.subscribeToEvent('users', 'user', 'activated'),
    subscribeToUserDeactivated: () =>
      this.subscribeToEvent('users', 'user', 'deactivated'),
    subscribeToProfileUpdated: () =>
      this.subscribeToEvent('users', 'profile', 'updated'),
    subscribeToSessionExpired: () =>
      this.subscribeToEvent('users', 'session', 'expired'),
  };
}
