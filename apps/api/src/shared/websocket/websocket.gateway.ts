import { FastifyInstance } from 'fastify';
import { Server, Socket } from 'socket.io';
import { Type } from '@sinclair/typebox';
import { RealtimeEventBus, EventPayload } from './realtime-event-bus';

// TypeBox Schema for WebSocket messages
export const WebSocketMessageSchema = Type.Object({
  feature: Type.String({
    description: 'Feature identifier (e.g., rbac, users)',
  }),
  entity: Type.String({
    description: 'Entity type (e.g., role, user, permission)',
  }),
  action: Type.String({
    description: 'Action performed (created, updated, deleted, etc.)',
  }),
  data: Type.Any({ description: 'Event payload' }),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    userId: Type.String(),
    sessionId: Type.String(),
    featureVersion: Type.Optional(Type.String({ default: 'v1' })),
    priority: Type.Union(
      [
        Type.Literal('low'),
        Type.Literal('normal'),
        Type.Literal('high'),
        Type.Literal('critical'),
      ],
      { default: 'normal' },
    ),
  }),
});

export interface WebSocketMessage {
  feature: string;
  entity: string;
  action: string;
  data: any;
  meta: {
    timestamp: string;
    userId: string;
    sessionId: string;
    featureVersion?: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
}

export class WebSocketManager {
  private io: Server;
  private fastify: FastifyInstance;
  private eventBus?: RealtimeEventBus;

  private connectedClients = new Map<
    string,
    {
      socket: Socket;
      userId?: string;
      subscriptions: Set<string>;
      joinedAt: Date;
      lastActivity: Date;
      priority: 'low' | 'normal' | 'high' | 'critical';
    }
  >();

  private roomSubscriptions = new Map<string, Set<string>>();
  private priorityQueues = new Map<string, EventPayload[]>();
  private processingQueue = false;

  constructor(fastify: FastifyInstance, io: Server) {
    this.fastify = fastify;
    this.io = io;
    this.setupEventHandlers();
    this.initializePriorityQueues();
    console.log('🔌 Enhanced WebSocket Manager initialized');
  }

  /**
   * Set EventBus for auto-forwarding
   */
  setEventBus(eventBus: RealtimeEventBus): void {
    this.eventBus = eventBus;
    this.setupEventBusSubscriptions();
    console.log('🔗 EventBus connected to WebSocketManager');
  }

  /**
   * Initialize priority queues
   */
  private initializePriorityQueues(): void {
    this.priorityQueues.set('critical', []);
    this.priorityQueues.set('high', []);
    this.priorityQueues.set('normal', []);
    this.priorityQueues.set('low', []);
    
    // Start queue processor
    this.startQueueProcessor();
  }

  /**
   * Setup EventBus subscriptions for auto-forwarding
   */
  private setupEventBusSubscriptions(): void {
    if (!this.eventBus) return;

    try {
      // Subscribe to all events for auto-forwarding
      this.eventBus.subscribeToEvents('*.*.*', (payload: EventPayload) => {
        this.handleEventBusEvent(payload);
      });

      console.log('📡 Auto-forwarding enabled from EventBus to WebSocket');
    } catch (error) {
      console.error('[WebSocketManager] Failed to setup EventBus subscriptions:', error);
    }
  }

  /**
   * Handle events from EventBus
   */
  private handleEventBusEvent(payload: EventPayload): void {
    try {
      // Add to priority queue for processing
      this.addToQueue(payload);
    } catch (error) {
      console.error('[WebSocketManager] Error handling EventBus event:', error);
    }
  }

  /**
   * Add event to priority queue
   */
  private addToQueue(payload: EventPayload): void {
    const queue = this.priorityQueues.get(payload.priority.level);
    if (queue) {
      queue.push(payload);
    }
  }

  /**
   * Start queue processor
   */
  private async startQueueProcessor(): Promise<void> {
    if (this.processingQueue) return;
    
    this.processingQueue = true;
    
    while (this.processingQueue) {
      await this.processQueue();
      await this.sleep(5); // Small delay to prevent busy waiting
    }
  }

  /**
   * Process priority queue
   */
  private async processQueue(): Promise<void> {
    const priorities = ['critical', 'high', 'normal', 'low'];
    
    for (const priority of priorities) {
      const queue = this.priorityQueues.get(priority);
      if (queue && queue.length > 0) {
        const event = queue.shift()!;
        await this.processEventPayload(event);
        break; // Process one event per cycle to maintain fairness
      }
    }
  }

  /**
   * Process individual event payload
   */
  private async processEventPayload(payload: EventPayload): Promise<void> {
    try {
      const message: WebSocketMessage = {
        feature: payload.feature,
        entity: payload.entity,
        action: payload.action,
        data: payload.data,
        meta: {
          timestamp: payload.priority.timestamp.toISOString(),
          userId: payload.metadata?.userId || 'system',
          sessionId: payload.metadata?.sessionId || 'server',
          featureVersion: payload.metadata?.version || 'v1',
          priority: payload.priority.level,
        },
      };

      const eventName = `${payload.feature}.${payload.entity}.${payload.action}`;
      
      // Emit to feature and entity rooms
      this.emitToRooms(eventName, message, payload.feature, payload.entity);
      
    } catch (error) {
      console.error('[WebSocketManager] Error processing event payload:', error);
    }
  }

  /**
   * Emit to multiple rooms efficiently
   */
  private emitToRooms(eventName: string, message: WebSocketMessage, feature: string, entity: string): void {
    const featureRoom = `feature:${feature}`;
    const entityRoom = `feature:${feature}:entity:${entity}`;
    
    // Emit to feature subscribers
    this.io.to(featureRoom).emit(eventName, message);
    
    // Emit to specific entity subscribers
    this.io.to(entityRoom).emit(eventName, message);
    
    console.log(`📡 [Priority:${message.meta.priority}] Emitted ${eventName} to rooms: ${featureRoom}, ${entityRoom}`);
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventHandlers() {
    if (!this.io || typeof this.io.on !== 'function') {
      console.error('[WebSocketManager] Invalid Socket.IO instance provided');
      return;
    }

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);

      socket.on('disconnect', () => this.handleDisconnect(socket));
      socket.on('auth:authenticate', (data) =>
        this.handleAuthentication(data, socket),
      );
      socket.on('subscribe:features', (data) =>
        this.handleFeatureSubscription(data, socket),
      );
      socket.on('unsubscribe:features', (data) =>
        this.handleFeatureUnsubscription(data, socket),
      );
      socket.on('ping', () => this.handlePing(socket));
    });
  }

  /**
   * Handle client connection with enhanced monitoring
   */
  private handleConnection(client: Socket) {
    console.log(`🔗 Client connected: ${client.id} from ${client.handshake.address}`);

    // Check connection limits
    if (this.connectedClients.size >= 1000) { // Max connections
      console.warn(`⚠️ Connection limit reached, rejecting ${client.id}`);
      client.emit('connection:rejected', {
        reason: 'Server capacity reached',
        maxConnections: 1000,
        timestamp: new Date().toISOString(),
      });
      client.disconnect(true);
      return;
    }

    // Extract token from auth handshake if provided
    const token = client.handshake.auth?.token;
    let userId: string | undefined;
    let userPriority: 'low' | 'normal' | 'high' | 'critical' = 'normal';

    if (token) {
      try {
        // TODO: Validate JWT token using fastify.jwt.verify
        // For now, accept any token and extract user info
        userId = 'user_123'; // Extract from JWT
        userPriority = 'normal'; // Extract user priority from JWT claims
        console.log(`✅ User ${userId} authenticated on connection with priority: ${userPriority}`);
      } catch (error) {
        console.error(
          `❌ Token validation failed for client ${client.id}:`,
          error,
        );
      }
    }

    const now = new Date();
    this.connectedClients.set(client.id, {
      socket: client,
      userId,
      subscriptions: new Set(),
      joinedAt: now,
      lastActivity: now,
      priority: userPriority,
    });

    // Join user-specific room if authenticated
    if (userId) {
      client.join(`user:${userId}`);
    }

    // Join priority room for message routing
    client.join(`priority:${userPriority}`);

    // Setup activity monitoring
    this.setupActivityMonitoring(client);

    // Send welcome message with enhanced info
    client.emit('connection:established', {
      clientId: client.id,
      userId,
      authenticated: !!userId,
      priority: userPriority,
      timestamp: now.toISOString(),
      server: 'AegisX Enhanced WebSocket Server',
      version: '2.0.0',
      capabilities: {
        eventBus: !!this.eventBus,
        priorityQueue: true,
        healthMonitoring: true,
        connectionPooling: true,
      },
    });
  }

  /**
   * Setup activity monitoring for client
   */
  private setupActivityMonitoring(client: Socket): void {
    // Update last activity on any event
    const updateActivity = () => {
      const clientInfo = this.connectedClients.get(client.id);
      if (clientInfo) {
        clientInfo.lastActivity = new Date();
      }
    };

    // Monitor all client events for activity
    client.onAny(updateActivity);

    // Setup health check intervals
    const healthInterval = setInterval(() => {
      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo) {
        clearInterval(healthInterval);
        return;
      }

      const timeSinceActivity = Date.now() - clientInfo.lastActivity.getTime();
      const timeoutThreshold = 5 * 60 * 1000; // 5 minutes

      // Check for inactive connections
      if (timeSinceActivity > timeoutThreshold) {
        console.warn(`⚠️ Inactive client detected: ${client.id}, disconnecting`);
        client.emit('connection:timeout', {
          reason: 'Inactivity timeout',
          lastActivity: clientInfo.lastActivity.toISOString(),
          threshold: timeoutThreshold,
        });
        client.disconnect(true);
        clearInterval(healthInterval);
      }
    }, 60000); // Check every minute

    // Cleanup on disconnect
    client.on('disconnect', () => {
      clearInterval(healthInterval);
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);

    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      // Remove from all room subscriptions
      clientInfo.subscriptions.forEach((room) => {
        const roomClients = this.roomSubscriptions.get(room);
        if (roomClients) {
          roomClients.delete(client.id);
          if (roomClients.size === 0) {
            this.roomSubscriptions.delete(room);
          }
        }
      });
    }

    this.connectedClients.delete(client.id);
  }

  /**
   * Handle user authentication
   */
  private handleAuthentication(data: { token: string }, client: Socket) {
    try {
      // TODO: Validate JWT token using fastify.jwt.verify
      // For now, accept any token and extract user info
      const userId = 'user_123'; // Extract from JWT

      const clientInfo = this.connectedClients.get(client.id);
      if (clientInfo) {
        clientInfo.userId = userId;

        // Join user-specific room
        client.join(`user:${userId}`);

        client.emit('auth:authenticated', {
          success: true,
          userId,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ User ${userId} authenticated on client ${client.id}`);
      }
    } catch (error) {
      client.emit('auth:error', {
        success: false,
        error: 'Authentication failed',
        timestamp: new Date().toISOString(),
      });

      console.error(`❌ Authentication failed for client ${client.id}:`, error);
    }
  }

  /**
   * Handle feature subscription
   */
  private handleFeatureSubscription(
    data: { features: string[]; entities?: string[] },
    client: Socket,
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    const { features, entities } = data;
    const rooms: string[] = [];

    // Subscribe to feature-level events
    features.forEach((feature) => {
      const featureRoom = `feature:${feature}`;
      rooms.push(featureRoom);
      client.join(featureRoom);
      clientInfo.subscriptions.add(featureRoom);

      // Add to room tracking
      if (!this.roomSubscriptions.has(featureRoom)) {
        this.roomSubscriptions.set(featureRoom, new Set());
      }
      this.roomSubscriptions.get(featureRoom)!.add(client.id);

      // Subscribe to specific entities if provided
      if (entities) {
        entities.forEach((entity) => {
          const entityRoom = `feature:${feature}:entity:${entity}`;
          rooms.push(entityRoom);
          client.join(entityRoom);
          clientInfo.subscriptions.add(entityRoom);

          if (!this.roomSubscriptions.has(entityRoom)) {
            this.roomSubscriptions.set(entityRoom, new Set());
          }
          this.roomSubscriptions.get(entityRoom)!.add(client.id);
        });
      }
    });

    client.emit('subscribe:confirmed', {
      features,
      entities: entities || [],
      rooms,
      timestamp: new Date().toISOString(),
    });

    console.log(`📡 Client ${client.id} subscribed to:`, rooms);
  }

  /**
   * Handle unsubscription
   */
  private handleFeatureUnsubscription(
    data: { features: string[]; entities?: string[] },
    client: Socket,
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    const { features, entities } = data;
    const rooms: string[] = [];

    features.forEach((feature) => {
      const featureRoom = `feature:${feature}`;
      rooms.push(featureRoom);
      client.leave(featureRoom);
      clientInfo.subscriptions.delete(featureRoom);

      const roomClients = this.roomSubscriptions.get(featureRoom);
      if (roomClients) {
        roomClients.delete(client.id);
        if (roomClients.size === 0) {
          this.roomSubscriptions.delete(featureRoom);
        }
      }

      if (entities) {
        entities.forEach((entity) => {
          const entityRoom = `feature:${feature}:entity:${entity}`;
          rooms.push(entityRoom);
          client.leave(entityRoom);
          clientInfo.subscriptions.delete(entityRoom);

          const entityRoomClients = this.roomSubscriptions.get(entityRoom);
          if (entityRoomClients) {
            entityRoomClients.delete(client.id);
            if (entityRoomClients.size === 0) {
              this.roomSubscriptions.delete(entityRoom);
            }
          }
        });
      }
    });

    client.emit('unsubscribe:confirmed', {
      features,
      entities: entities || [],
      rooms,
      timestamp: new Date().toISOString(),
    });

    console.log(`📡 Client ${client.id} unsubscribed from:`, rooms);
  }

  /**
   * Emit event to specific feature subscribers
   */
  emitToFeature(
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
  ) {
    const message: WebSocketMessage = {
      feature,
      entity,
      action,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        userId: 'system', // Will be set by the calling service
        sessionId: 'server',
        featureVersion: 'v1',
        priority,
      },
    };

    const eventName = `${feature}.${entity}.${action}`;
    const featureRoom = `feature:${feature}`;
    const entityRoom = `feature:${feature}:entity:${entity}`;

    // Emit to feature subscribers
    this.io.to(featureRoom).emit(eventName, message);

    // Emit to specific entity subscribers
    this.io.to(entityRoom).emit(eventName, message);

    console.log(
      `📡 Emitted ${eventName} to rooms: ${featureRoom}, ${entityRoom}`,
    );
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    const userRoom = `user:${userId}`;
    this.io.to(userRoom).emit(event, data);
    console.log(`📡 Emitted ${event} to user ${userId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
    console.log(`📡 Broadcasted ${event} to all clients`);
  }

  /**
   * Get enhanced connection statistics
   */
  getStats() {
    const now = Date.now();
    const clientsArray = Array.from(this.connectedClients.values());
    
    // Calculate connection metrics
    const connectionMetrics = {
      total: this.connectedClients.size,
      authenticated: clientsArray.filter(c => c.userId).length,
      anonymous: clientsArray.filter(c => !c.userId).length,
      byPriority: {
        critical: clientsArray.filter(c => c.priority === 'critical').length,
        high: clientsArray.filter(c => c.priority === 'high').length,
        normal: clientsArray.filter(c => c.priority === 'normal').length,
        low: clientsArray.filter(c => c.priority === 'low').length,
      },
    };

    // Calculate activity metrics
    const activityMetrics = {
      activeLastMinute: clientsArray.filter(c => 
        now - c.lastActivity.getTime() < 60000
      ).length,
      activeLastHour: clientsArray.filter(c => 
        now - c.lastActivity.getTime() < 3600000
      ).length,
      averageSessionDuration: clientsArray.length > 0 
        ? clientsArray.reduce((sum, c) => sum + (now - c.joinedAt.getTime()), 0) / clientsArray.length 
        : 0,
    };

    // Calculate queue metrics
    const queueMetrics = {
      critical: this.priorityQueues.get('critical')?.length || 0,
      high: this.priorityQueues.get('high')?.length || 0,
      normal: this.priorityQueues.get('normal')?.length || 0,
      low: this.priorityQueues.get('low')?.length || 0,
      totalQueued: Array.from(this.priorityQueues.values()).reduce(
        (sum, queue) => sum + queue.length, 0
      ),
      processingActive: this.processingQueue,
    };

    // Room statistics
    const roomStats = Array.from(this.roomSubscriptions.entries()).map(
      ([room, clients]) => ({
        room,
        clientCount: clients.size,
        type: this.getRoomType(room),
      })
    );

    return {
      timestamp: new Date().toISOString(),
      connections: connectionMetrics,
      activity: activityMetrics,
      queues: queueMetrics,
      rooms: {
        total: this.roomSubscriptions.size,
        details: roomStats,
      },
      eventBus: {
        connected: !!this.eventBus,
        stats: this.eventBus?.getStatistics() || null,
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
  }

  /**
   * Get detailed health metrics
   */
  getHealthMetrics() {
    const stats = this.getStats();
    const isHealthy = this.determineHealth(stats);
    
    return {
      ...stats,
      health: {
        status: isHealthy ? 'healthy' : 'degraded',
        checks: {
          connectionLimit: stats.connections.total < 900, // Under 90% of limit
          queueHealth: stats.queues.totalQueued < 100,
          eventBusConnected: !!stats.eventBus.connected,
          processingActive: stats.queues.processingActive,
        },
        recommendations: this.getHealthRecommendations(stats),
      },
    };
  }

  /**
   * Determine overall health status
   */
  private determineHealth(stats: any): boolean {
    return (
      stats.connections.total < 900 &&
      stats.queues.totalQueued < 100 &&
      stats.eventBus.connected &&
      stats.queues.processingActive
    );
  }

  /**
   * Get health recommendations
   */
  private getHealthRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.connections.total > 800) {
      recommendations.push('Consider scaling WebSocket instances');
    }
    
    if (stats.queues.totalQueued > 50) {
      recommendations.push('High queue backlog detected, check processing performance');
    }
    
    if (!stats.eventBus.connected) {
      recommendations.push('EventBus disconnected, auto-forwarding disabled');
    }
    
    if (stats.activity.activeLastMinute < stats.connections.total * 0.1) {
      recommendations.push('Low client activity detected, consider connection cleanup');
    }
    
    return recommendations;
  }

  /**
   * Get room type for categorization
   */
  private getRoomType(room: string): string {
    if (room.startsWith('user:')) return 'user';
    if (room.startsWith('feature:')) return 'feature';
    if (room.startsWith('priority:')) return 'priority';
    return 'other';
  }

  /**
   * Force cleanup inactive connections
   */
  async forceCleanupInactiveConnections(): Promise<number> {
    const now = Date.now();
    const timeoutThreshold = 10 * 60 * 1000; // 10 minutes
    let cleaned = 0;
    
    for (const [clientId, clientInfo] of this.connectedClients.entries()) {
      const timeSinceActivity = now - clientInfo.lastActivity.getTime();
      
      if (timeSinceActivity > timeoutThreshold) {
        console.log(`🧹 Force cleaning inactive client: ${clientId}`);
        clientInfo.socket.emit('connection:cleanup', {
          reason: 'Administrative cleanup',
          lastActivity: clientInfo.lastActivity.toISOString(),
        });
        clientInfo.socket.disconnect(true);
        cleaned++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleaned} inactive connections`);
    return cleaned;
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      priorities: Array.from(this.priorityQueues.entries()).map(([priority, queue]) => ({
        priority,
        length: queue.length,
        oldestEvent: queue.length > 0 ? queue[0].priority.timestamp : null,
      })),
      processing: this.processingQueue,
      totalQueued: Array.from(this.priorityQueues.values()).reduce(
        (sum, queue) => sum + queue.length, 0
      ),
    };
  }

  /**
   * Handle ping from client
   */
  private handlePing(client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit lock events
   */
  emitLockAcquired(
    feature: string,
    entity: string,
    data: { id: string; userId: string; lockType?: string },
  ) {
    this.emitToFeature(feature, entity, 'lock_acquired', data, 'normal');
  }

  emitLockReleased(
    feature: string,
    entity: string,
    data: { id: string; userId: string },
  ) {
    this.emitToFeature(feature, entity, 'lock_released', data, 'normal');
  }

  /**
   * Emit conflict events
   */
  emitConflictDetected(feature: string, entity: string, data: any) {
    this.emitToFeature(feature, entity, 'conflict_detected', data, 'high');
  }

  /**
   * Emit bulk operation events
   */
  emitBulkStarted(
    feature: string,
    entity: string,
    data: { operationId: string; total: number; operation: string },
  ) {
    this.emitToFeature(feature, entity, 'bulk_started', data, 'normal');
  }

  emitBulkProgress(
    feature: string,
    entity: string,
    data: { operationId: string; progress: any },
  ) {
    this.emitToFeature(feature, entity, 'bulk_progress', data, 'normal');
  }

  emitBulkCompleted(
    feature: string,
    entity: string,
    data: { operationId: string; results: any },
  ) {
    this.emitToFeature(feature, entity, 'bulk_completed', data, 'normal');
  }
}
