import { FastifyInstance } from 'fastify';
import { Server, Socket } from 'socket.io';
import { Type } from '@sinclair/typebox';

// TypeBox Schema for WebSocket messages
export const WebSocketMessageSchema = Type.Object({
  feature: Type.String({ description: 'Feature identifier (e.g., rbac, users)' }),
  entity: Type.String({ description: 'Entity type (e.g., role, user, permission)' }),
  action: Type.String({ description: 'Action performed (created, updated, deleted, etc.)' }),
  data: Type.Any({ description: 'Event payload' }),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    userId: Type.String(),
    sessionId: Type.String(),
    featureVersion: Type.Optional(Type.String({ default: 'v1' })),
    priority: Type.Union([
      Type.Literal('low'),
      Type.Literal('normal'),
      Type.Literal('high'),
      Type.Literal('critical')
    ], { default: 'normal' })
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
  
  private connectedClients = new Map<string, {
    socket: Socket;
    userId?: string;
    subscriptions: Set<string>;
    joinedAt: Date;
  }>();

  private roomSubscriptions = new Map<string, Set<string>>();

  constructor(fastify: FastifyInstance, io: Server) {
    this.fastify = fastify;
    this.io = io;
    this.setupEventHandlers();
    console.log('🔌 WebSocket Manager initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
      
      socket.on('disconnect', () => this.handleDisconnect(socket));
      socket.on('auth:authenticate', (data) => this.handleAuthentication(data, socket));
      socket.on('subscribe:features', (data) => this.handleFeatureSubscription(data, socket));
      socket.on('unsubscribe:features', (data) => this.handleFeatureUnsubscription(data, socket));
      socket.on('ping', () => this.handlePing(socket));
    });
  }

  /**
   * Handle client connection
   */
  private handleConnection(client: Socket) {
    console.log(`🔗 Client connected: ${client.id}`);
    
    this.connectedClients.set(client.id, {
      socket: client,
      subscriptions: new Set(),
      joinedAt: new Date(),
    });

    // Send welcome message
    client.emit('connection:established', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
      server: 'AegisX WebSocket Server',
      version: '1.0.0',
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
      clientInfo.subscriptions.forEach(room => {
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
  private handleFeatureSubscription(data: { features: string[], entities?: string[] }, client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    const { features, entities } = data;
    const rooms: string[] = [];

    // Subscribe to feature-level events
    features.forEach(feature => {
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
        entities.forEach(entity => {
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
  private handleFeatureUnsubscription(data: { features: string[], entities?: string[] }, client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    const { features, entities } = data;
    const rooms: string[] = [];

    features.forEach(feature => {
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
        entities.forEach(entity => {
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
  emitToFeature(feature: string, entity: string, action: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') {
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

    console.log(`📡 Emitted ${eventName} to rooms: ${featureRoom}, ${entityRoom}`);
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
   * Get connection statistics
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      activeRooms: this.roomSubscriptions.size,
      roomDetails: Array.from(this.roomSubscriptions.entries()).map(([room, clients]) => ({
        room,
        clientCount: clients.size,
      })),
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
  emitLockAcquired(feature: string, entity: string, data: { id: string; userId: string; lockType?: string }) {
    this.emitToFeature(feature, entity, 'lock_acquired', data, 'normal');
  }

  emitLockReleased(feature: string, entity: string, data: { id: string; userId: string }) {
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
  emitBulkStarted(feature: string, entity: string, data: { operationId: string; total: number; operation: string }) {
    this.emitToFeature(feature, entity, 'bulk_started', data, 'normal');
  }

  emitBulkProgress(feature: string, entity: string, data: { operationId: string; progress: any }) {
    this.emitToFeature(feature, entity, 'bulk_progress', data, 'normal');
  }

  emitBulkCompleted(feature: string, entity: string, data: { operationId: string; results: any }) {
    this.emitToFeature(feature, entity, 'bulk_completed', data, 'normal');
  }
}