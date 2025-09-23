/**
 * Realtime Event Bus
 * Enhanced event system with EventEmitter2 patterns and Redis clustering
 */

import { EventEmitter2 } from 'eventemitter2';
import { createClient, RedisClientType } from 'redis';
import type { IWebSocketTransport } from './transport.interface';

export interface EventPriority {
  level: 'low' | 'normal' | 'high' | 'critical';
  timestamp: Date;
  retries?: number;
  maxRetries?: number;
}

export interface EventPayload {
  feature: string;
  entity: string;
  action: string;
  data: any;
  priority: EventPriority;
  metadata?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    version?: string;
  };
}

export interface EventBusConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  enableRedis?: boolean;
  instanceId?: string;
  wildcard?: boolean;
  delimiter?: string;
  maxListeners?: number;
  verboseMemoryLeak?: boolean;
}

export interface TransportConfig {
  cors?: {
    origin: string[] | string | boolean;
    credentials?: boolean;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  enableCompression?: boolean;
  maxConnections?: number;
  pingTimeout?: number;
  pingInterval?: number;
}

export class RealtimeEventBus extends EventEmitter2 {
  private redisClient: RedisClientType | null = null;
  private redisPub: RedisClientType | null = null;
  private redisSub: RedisClientType | null = null;
  private transport: IWebSocketTransport | null = null;
  private instanceId: string;
  private isRedisEnabled: boolean;
  private eventQueue: Map<string, EventPayload[]> = new Map();
  private processing: boolean = false;

  constructor(private config: EventBusConfig = {}) {
    super({
      wildcard: config.wildcard ?? true,
      delimiter: config.delimiter ?? '.',
      maxListeners: config.maxListeners ?? 20,
      verboseMemoryLeak: config.verboseMemoryLeak ?? false,
      ignoreErrors: false
    });

    this.instanceId = config.instanceId ?? `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.isRedisEnabled = config.enableRedis ?? false;

    this.setupEventBus();
  }

  /**
   * Initialize Redis connections for multi-instance support
   */
  async initializeRedis(): Promise<void> {
    if (!this.isRedisEnabled || !this.config.redis) {
      return;
    }

    try {
      const redisConfig = {
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port,
        },
        password: this.config.redis.password,
        database: this.config.redis.db ?? 0,
      };

      // Create Redis clients
      this.redisPub = createClient(redisConfig);
      this.redisSub = createClient(redisConfig);

      // Connect to Redis
      await this.redisPub.connect();
      await this.redisSub.connect();

      // Subscribe to events from other instances
      await this.redisSub.subscribe('realtime:events', (message) => {
        this.handleRedisEvent(message);
      });

      console.log(`[EventBus] Redis initialized for instance: ${this.instanceId}`);
    } catch (error) {
      console.error('[EventBus] Redis initialization failed:', error);
      // Continue without Redis if connection fails
      this.isRedisEnabled = false;
    }
  }

  /**
   * Set WebSocket transport for auto-forwarding
   */
  setTransport(transport: IWebSocketTransport): void {
    this.transport = transport;
  }

  /**
   * Emit event with priority and metadata
   */
  emitEvent(
    feature: string,
    entity: string,
    action: string,
    data: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    metadata?: EventPayload['metadata']
  ): void {
    const eventPayload: EventPayload = {
      feature,
      entity,
      action,
      data,
      priority: {
        level: priority,
        timestamp: new Date(),
        retries: 0,
        maxRetries: this.getMaxRetriesForPriority(priority)
      },
      metadata
    };

    // Emit locally first
    this.emitLocalEvent(eventPayload);

    // Distribute to other instances via Redis
    if (this.isRedisEnabled && this.redisPub) {
      this.publishToRedis(eventPayload);
    }

    // Auto-forward to WebSocket clients
    this.forwardToWebSocket(eventPayload);
  }

  /**
   * Emit convenience methods for common CRUD operations
   */
  emitCreated(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'created', data, 'normal', metadata);
  }

  emitUpdated(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'updated', data, 'normal', metadata);
  }

  emitDeleted(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'deleted', data, 'high', metadata);
  }

  emitBulkStarted(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'bulk_started', data, 'high', metadata);
  }

  emitBulkProgress(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'bulk_progress', data, 'normal', metadata);
  }

  emitBulkCompleted(feature: string, entity: string, data: any, metadata?: EventPayload['metadata']): void {
    this.emitEvent(feature, entity, 'bulk_completed', data, 'high', metadata);
  }

  /**
   * Subscribe to events with wildcard patterns
   */
  subscribeToEvents(pattern: string, handler: (payload: EventPayload) => void): void {
    this.on(pattern, handler);
  }

  /**
   * Subscribe to feature events
   */
  subscribeToFeature(feature: string, handler: (payload: EventPayload) => void): void {
    this.subscribeToEvents(`${feature}.*`, handler);
  }

  /**
   * Subscribe to entity events
   */
  subscribeToEntity(feature: string, entity: string, handler: (payload: EventPayload) => void): void {
    this.subscribeToEvents(`${feature}.${entity}.*`, handler);
  }

  /**
   * Subscribe to specific action
   */
  subscribeToAction(feature: string, entity: string, action: string, handler: (payload: EventPayload) => void): void {
    this.subscribeToEvents(`${feature}.${entity}.${action}`, handler);
  }

  /**
   * Get event statistics
   */
  getStatistics(): Record<string, any> {
    let listenerCount = 0;
    let eventNames: string[] = [];
    
    try {
      // Get total listener count across all events
      const allEvents = this.eventNames();
      eventNames = Array.isArray(allEvents) ? allEvents.map(String) : [];
      listenerCount = eventNames.reduce((count, eventName) => {
        try {
          return count + this.listenerCount(eventName);
        } catch {
          return count;
        }
      }, 0);
    } catch (error) {
      // Fallback if eventNames() fails
      eventNames = [];
      listenerCount = 0;
    }
    
    return {
      instanceId: this.instanceId,
      isRedisEnabled: this.isRedisEnabled,
      listenerCount,
      eventNames,
      queueSize: Array.from(this.eventQueue.values()).reduce((sum, events) => sum + events.length, 0),
      processing: this.processing,
      transport: this.transport ? 'connected' : 'disconnected'
    };
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    this.removeAllListeners();
    
    if (this.redisPub) {
      await this.redisPub.disconnect();
    }
    
    if (this.redisSub) {
      await this.redisSub.disconnect();
    }
  }

  /**
   * Private Methods
   */

  private setupEventBus(): void {
    // Set up error handling
    this.on('error', (error) => {
      console.error('[EventBus] Error:', error);
    });

    // Start event queue processor
    this.startEventProcessor();
  }

  private emitLocalEvent(payload: EventPayload): void {
    const eventName = `${payload.feature}.${payload.entity}.${payload.action}`;
    
    // Add to priority queue
    this.addToQueue(payload);
    
    // Emit immediately for synchronous listeners
    this.emit(eventName, payload);
  }

  private addToQueue(payload: EventPayload): void {
    const key = payload.priority.level;
    
    if (!this.eventQueue.has(key)) {
      this.eventQueue.set(key, []);
    }
    
    this.eventQueue.get(key)!.push(payload);
  }

  private async startEventProcessor(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.processing) {
      await this.processEventQueue();
      await this.sleep(10); // Small delay to prevent busy waiting
    }
  }

  private async processEventQueue(): Promise<void> {
    const priorities = ['critical', 'high', 'normal', 'low'];
    
    for (const priority of priorities) {
      const events = this.eventQueue.get(priority);
      if (events && events.length > 0) {
        const event = events.shift()!;
        await this.processEvent(event);
        break; // Process one event per cycle to maintain fairness
      }
    }
  }

  private async processEvent(payload: EventPayload): Promise<void> {
    try {
      // Process the event (already emitted, this is for any async processing)
      // Could add logging, metrics, etc. here
    } catch (error) {
      console.error('[EventBus] Event processing error:', error);
      
      // Retry logic for failed events
      if (payload.priority.retries! < payload.priority.maxRetries!) {
        payload.priority.retries!++;
        this.addToQueue(payload);
      }
    }
  }

  private async publishToRedis(payload: EventPayload): Promise<void> {
    if (!this.redisPub) return;
    
    try {
      const message = JSON.stringify({
        ...payload,
        instanceId: this.instanceId
      });
      
      await this.redisPub.publish('realtime:events', message);
    } catch (error) {
      console.error('[EventBus] Redis publish error:', error);
    }
  }

  private handleRedisEvent(message: string): void {
    try {
      const payload = JSON.parse(message);
      
      // Don't process events from the same instance
      if (payload.instanceId === this.instanceId) {
        return;
      }
      
      // Emit the event locally
      delete payload.instanceId;
      this.emitLocalEvent(payload);
    } catch (error) {
      console.error('[EventBus] Redis message parse error:', error);
    }
  }

  private forwardToWebSocket(payload: EventPayload): void {
    if (!this.transport) return;
    
    try {
      const eventName = `${payload.feature}.${payload.entity}.${payload.action}`;
      const room = `${payload.feature}:${payload.entity}`;
      
      // Emit to specific feature room
      this.transport.emitToRoom(room, eventName, {
        action: payload.action,
        data: payload.data,
        timestamp: payload.priority.timestamp,
        metadata: payload.metadata
      });
      
      // Also emit to general feature room
      this.transport.emitToRoom(payload.feature, eventName, {
        action: payload.action,
        data: payload.data,
        timestamp: payload.priority.timestamp,
        metadata: payload.metadata
      });
    } catch (error) {
      console.error('[EventBus] Transport forwarding error:', error);
    }
  }

  private getMaxRetriesForPriority(priority: string): number {
    switch (priority) {
      case 'critical': return 5;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}