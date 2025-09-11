# Event Bus System & Domain Events

## Overview

Event Bus system for decoupled communication between modules, domain events, and asynchronous processing with Redis pub/sub and local event handling.

## Event Bus Architecture

### Event Bus Plugin Setup

```typescript
// apps/api/src/plugins/event-bus.plugin.ts
import fp from 'fastify-plugin';
import { EventEmitter } from 'events';
import { FastifyInstance } from 'fastify';

interface EventBusOptions {
  redis?: boolean;
  maxListeners?: number;
}

const eventBusPlugin: FastifyPluginAsync<EventBusOptions> = async (fastify, options) => {
  // Local event emitter
  const localEventBus = new EventEmitter();
  localEventBus.setMaxListeners(options.maxListeners || 100);

  // Event bus service
  const eventBus = new EventBusService(fastify, localEventBus, options.redis);

  // Initialize event handlers
  const eventHandlerManager = new EventHandlerManager(fastify);
  await eventHandlerManager.registerAllHandlers();

  // Decorate fastify instance
  fastify.decorate('eventBus', eventBus);
  fastify.decorate('eventHandlerManager', eventHandlerManager);

  // Health check endpoint
  fastify.route({
    method: 'GET',
    url: '/health/event-bus',
    handler: async (request, reply) => {
      const health = await eventBus.healthCheck();
      return reply.success(health, 'Event bus health check');
    },
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await eventBus.shutdown();
  });
};

export default fp(eventBusPlugin, {
  name: 'event-bus-plugin',
  dependencies: ['redis-plugin', 'knex-plugin'],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    eventBus: EventBusService;
    eventHandlerManager: EventHandlerManager;
  }
}
```

### Core Event Bus Service

```typescript
// apps/api/src/services/event-bus.service.ts
import { EventEmitter } from 'events';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  metadata: {
    timestamp: Date;
    userId?: string;
    correlationId?: string;
    version: number;
  };
}

export interface EventHandler<T = any> {
  handle(event: DomainEvent<T>): Promise<void>;
}

export class EventBusService {
  private localEmitter: EventEmitter;
  private redisPublisher?: Redis;
  private redisSubscriber?: Redis;
  private handlers = new Map<string, EventHandler[]>();
  private isRedisEnabled: boolean;

  constructor(
    private fastify: FastifyInstance,
    localEmitter: EventEmitter,
    useRedis: boolean = true,
  ) {
    this.localEmitter = localEmitter;
    this.isRedisEnabled = useRedis;

    if (useRedis) {
      this.setupRedisEventBus();
    }
  }

  private setupRedisEventBus() {
    // Use Redis from fastify plugin
    this.redisPublisher = this.fastify.redis;

    // Create separate subscriber connection using namespace
    this.redisSubscriber = this.fastify.redis;

    // Subscribe to distributed events
    this.redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        const event: DomainEvent = JSON.parse(message);
        this.handleLocalEvent(event);
      } catch (error) {
        this.fastify.log.error('Failed to parse Redis event:', error);
      }
    });

    // Subscribe to event channels
    this.redisSubscriber.psubscribe('events:*');
  }

  // Publish event (local + distributed)
  async publish<T = any>(event: DomainEvent<T>): Promise<void> {
    try {
      // Always emit locally first
      this.handleLocalEvent(event);

      // Then distribute via Redis if enabled
      if (this.isRedisEnabled && this.redisPublisher) {
        const channel = `events:${event.type}`;
        await this.redisPublisher.publish(channel, JSON.stringify(event));
      }

      // Store event in database for audit
      await this.storeEvent(event);

      this.fastify.log.info(`Event published: ${event.type}`, {
        eventId: event.id,
        aggregateId: event.aggregateId,
      });
    } catch (error) {
      this.fastify.log.error('Failed to publish event:', error);
      throw error;
    }
  }

  // Subscribe to event type
  subscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);

    this.fastify.log.info(`Handler registered for event: ${eventType}`);
  }

  // Unsubscribe handler
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Handle local event processing
  private async handleLocalEvent<T = any>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    // Process handlers in parallel
    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        this.fastify.log.error(`Event handler failed for ${event.type}:`, error);
        // Don't throw - allow other handlers to continue
      }
    });

    await Promise.allSettled(promises);
  }

  // Store event for audit trail
  private async storeEvent(event: DomainEvent): Promise<void> {
    try {
      await this.fastify.knex('domain_events').insert({
        id: event.id,
        type: event.type,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        data: JSON.stringify(event.data),
        metadata: JSON.stringify(event.metadata),
        created_at: event.metadata.timestamp,
      });
    } catch (error) {
      this.fastify.log.error('Failed to store event:', error);
      // Don't throw - event processing should continue
    }
  }

  // Get event history
  async getEventHistory(aggregateId: string, aggregateType?: string): Promise<DomainEvent[]> {
    const query = this.fastify.knex('domain_events').where('aggregate_id', aggregateId).orderBy('created_at', 'asc');

    if (aggregateType) {
      query.where('aggregate_type', aggregateType);
    }

    const rows = await query;

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      data: JSON.parse(row.data),
      metadata: JSON.parse(row.metadata),
    }));
  }

  // Replay events (for rebuilding projections)
  async replayEvents(fromDate?: Date, eventTypes?: string[]): Promise<void> {
    const query = this.fastify.knex('domain_events').orderBy('created_at', 'asc');

    if (fromDate) {
      query.where('created_at', '>=', fromDate);
    }

    if (eventTypes && eventTypes.length > 0) {
      query.whereIn('type', eventTypes);
    }

    const events = await query;

    for (const row of events) {
      const event: DomainEvent = {
        id: row.id,
        type: row.type,
        aggregateId: row.aggregate_id,
        aggregateType: row.aggregate_type,
        data: JSON.parse(row.data),
        metadata: JSON.parse(row.metadata),
      };

      await this.handleLocalEvent(event);
    }
  }

  // Cleanup
  async shutdown(): Promise<void> {
    if (this.redisSubscriber) {
      await this.redisSubscriber.disconnect();
    }

    this.localEmitter.removeAllListeners();
    this.handlers.clear();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; redis: boolean; handlers: number }> {
    const handlerCount = Array.from(this.handlers.values()).reduce((total, handlers) => total + handlers.length, 0);

    let redisHealth = false;
    if (this.isRedisEnabled && this.redisPublisher) {
      try {
        await this.redisPublisher.ping();
        redisHealth = true;
      } catch {
        redisHealth = false;
      }
    }

    return {
      status: 'healthy',
      redis: redisHealth,
      handlers: handlerCount,
    };
  }
}
```

## Domain Events

### Event Factory

```typescript
// apps/api/src/events/event-factory.ts
import { randomUUID } from 'crypto';
import { DomainEvent } from '../services/event-bus.service';

export class EventFactory {
  static create<T = any>(type: string, aggregateId: string, aggregateType: string, data: T, metadata: Partial<DomainEvent['metadata']> = {}): DomainEvent<T> {
    return {
      id: randomUUID(),
      type,
      aggregateId,
      aggregateType,
      data,
      metadata: {
        timestamp: new Date(),
        version: 1,
        ...metadata,
      },
    };
  }

  // User events
  static userCreated(user: any, userId?: string): DomainEvent {
    return this.create('USER_CREATED', user.id, 'User', { user }, { userId });
  }

  static userUpdated(user: any, previousData: any, userId?: string): DomainEvent {
    return this.create('USER_UPDATED', user.id, 'User', { user, previousData }, { userId });
  }

  static userDeleted(userId: string, deletedBy?: string): DomainEvent {
    return this.create('USER_DELETED', userId, 'User', { userId }, { userId: deletedBy });
  }

  static userLoggedIn(user: any, sessionInfo: any): DomainEvent {
    return this.create('USER_LOGGED_IN', user.id, 'User', { user, sessionInfo }, { userId: user.id });
  }

  static userLoggedOut(userId: string, sessionId: string): DomainEvent {
    return this.create('USER_LOGGED_OUT', userId, 'User', { sessionId }, { userId });
  }

  // System events
  static systemMaintenanceStarted(details: any): DomainEvent {
    return this.create('SYSTEM_MAINTENANCE_STARTED', 'system', 'System', details);
  }

  static systemMaintenanceCompleted(details: any): DomainEvent {
    return this.create('SYSTEM_MAINTENANCE_COMPLETED', 'system', 'System', details);
  }

  // Business events (examples)
  static orderCreated(order: any, userId: string): DomainEvent {
    return this.create('ORDER_CREATED', order.id, 'Order', { order }, { userId });
  }

  static paymentProcessed(payment: any, orderId: string): DomainEvent {
    return this.create('PAYMENT_PROCESSED', payment.id, 'Payment', { payment, orderId }, { userId: payment.userId });
  }
}
```

## Event Handlers

### Email Notification Handler

```typescript
// apps/api/src/handlers/email-notification.handler.ts
import { EventHandler, DomainEvent } from '../services/event-bus.service';
import { FastifyInstance } from 'fastify';

export class EmailNotificationHandler implements EventHandler {
  constructor(private fastify: FastifyInstance) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case 'USER_CREATED':
        await this.sendWelcomeEmail(event);
        break;
      case 'USER_UPDATED':
        await this.sendProfileUpdateEmail(event);
        break;
      case 'ORDER_CREATED':
        await this.sendOrderConfirmationEmail(event);
        break;
      case 'PAYMENT_PROCESSED':
        await this.sendPaymentReceiptEmail(event);
        break;
    }
  }

  private async sendWelcomeEmail(event: DomainEvent): Promise<void> {
    const { user } = event.data;

    try {
      await this.fastify.emailService.send({
        to: user.email,
        subject: 'Welcome to Our Platform!',
        template: 'welcome',
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          loginUrl: `${process.env.USER_PORTAL_URL}/auth/login`,
        },
      });

      this.fastify.log.info(`Welcome email sent to ${user.email}`, {
        userId: user.id,
        eventId: event.id,
      });
    } catch (error) {
      this.fastify.log.error('Failed to send welcome email:', error);
    }
  }

  private async sendProfileUpdateEmail(event: DomainEvent): Promise<void> {
    const { user } = event.data;

    // Only send email if email was changed
    if (event.data.previousData?.email !== user.email) {
      try {
        await this.fastify.emailService.send({
          to: user.email,
          subject: 'Profile Updated',
          template: 'profile-updated',
          data: { user },
        });
      } catch (error) {
        this.fastify.log.error('Failed to send profile update email:', error);
      }
    }
  }

  private async sendOrderConfirmationEmail(event: DomainEvent): Promise<void> {
    const { order } = event.data;

    try {
      const user = await this.fastify.knex('users').where('id', order.userId).first();

      if (user) {
        await this.fastify.emailService.send({
          to: user.email,
          subject: `Order Confirmation #${order.orderNumber}`,
          template: 'order-confirmation',
          data: { order, user },
        });
      }
    } catch (error) {
      this.fastify.log.error('Failed to send order confirmation email:', error);
    }
  }

  private async sendPaymentReceiptEmail(event: DomainEvent): Promise<void> {
    const { payment, orderId } = event.data;

    try {
      const order = await this.fastify.knex('orders').where('id', orderId).first();

      const user = await this.fastify.knex('users').where('id', payment.userId).first();

      if (user && order) {
        await this.fastify.emailService.send({
          to: user.email,
          subject: `Payment Receipt #${payment.transactionId}`,
          template: 'payment-receipt',
          data: { payment, order, user },
        });
      }
    } catch (error) {
      this.fastify.log.error('Failed to send payment receipt email:', error);
    }
  }
}
```

### Audit Log Handler

```typescript
// apps/api/src/handlers/audit-log.handler.ts
import { EventHandler, DomainEvent } from '../services/event-bus.service';
import { FastifyInstance } from 'fastify';

export class AuditLogHandler implements EventHandler {
  constructor(private fastify: FastifyInstance) {}

  async handle(event: DomainEvent): Promise<void> {
    // Filter events that need audit logging
    const auditableEvents = ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'ORDER_CREATED', 'ORDER_CANCELLED', 'PAYMENT_PROCESSED', 'PAYMENT_FAILED', 'SYSTEM_MAINTENANCE_STARTED', 'SYSTEM_MAINTENANCE_COMPLETED'];

    if (!auditableEvents.includes(event.type)) {
      return;
    }

    try {
      await this.fastify.knex('audit_logs').insert({
        id: randomUUID(),
        user_id: event.metadata.userId || null,
        action: this.mapEventToAction(event.type),
        resource: event.aggregateType.toLowerCase(),
        resource_id: event.aggregateId,
        details: {
          eventId: event.id,
          eventType: event.type,
          data: event.data,
          correlationId: event.metadata.correlationId,
        },
        ip_address: event.metadata.ipAddress || null,
        user_agent: event.metadata.userAgent || null,
        created_at: event.metadata.timestamp,
      });

      this.fastify.log.debug(`Audit log created for event: ${event.type}`, {
        eventId: event.id,
        userId: event.metadata.userId,
      });
    } catch (error) {
      this.fastify.log.error('Failed to create audit log:', error);
    }
  }

  private mapEventToAction(eventType: string): string {
    const mapping: { [key: string]: string } = {
      USER_CREATED: 'CREATE',
      USER_UPDATED: 'UPDATE',
      USER_DELETED: 'DELETE',
      USER_LOGGED_IN: 'LOGIN',
      USER_LOGGED_OUT: 'LOGOUT',
      ROLE_CREATED: 'CREATE',
      ROLE_UPDATED: 'UPDATE',
      ROLE_DELETED: 'DELETE',
      PERMISSION_GRANTED: 'GRANT',
      PERMISSION_REVOKED: 'REVOKE',
      ORDER_CREATED: 'CREATE',
      ORDER_CANCELLED: 'CANCEL',
      PAYMENT_PROCESSED: 'PROCESS',
      PAYMENT_FAILED: 'FAIL',
    };

    return mapping[eventType] || 'UNKNOWN';
  }
}
```

### WebSocket Notification Handler

```typescript
// apps/api/src/handlers/websocket-notification.handler.ts
import { EventHandler, DomainEvent } from '../services/event-bus.service';
import { FastifyInstance } from 'fastify';

export class WebSocketNotificationHandler implements EventHandler {
  constructor(private fastify: FastifyInstance) {}

  async handle(event: DomainEvent): Promise<void> {
    // Events that trigger real-time notifications
    const notificationEvents = ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'PAYMENT_PROCESSED', 'PAYMENT_FAILED', 'SYSTEM_MAINTENANCE_STARTED', 'SYSTEM_MAINTENANCE_COMPLETED'];

    if (!notificationEvents.includes(event.type)) {
      return;
    }

    try {
      const notification = this.createNotification(event);

      // Send to specific user if userId is present
      if (event.metadata.userId) {
        await this.fastify.websocketService.sendToUser(event.metadata.userId, 'notification', notification);
      }

      // Send to admin room for admin events
      if (this.isAdminEvent(event.type)) {
        await this.fastify.websocketService.sendToRoom('admin', 'admin-notification', notification);
      }

      // Send to all connected users for system events
      if (this.isSystemEvent(event.type)) {
        await this.fastify.websocketService.broadcast('system-notification', notification);
      }
    } catch (error) {
      this.fastify.log.error('Failed to send WebSocket notification:', error);
    }
  }

  private createNotification(event: DomainEvent): any {
    const baseNotification = {
      id: randomUUID(),
      type: this.getNotificationType(event.type),
      title: this.getNotificationTitle(event.type),
      message: this.getNotificationMessage(event),
      data: event.data,
      timestamp: event.metadata.timestamp,
      eventId: event.id,
    };

    return baseNotification;
  }

  private getNotificationType(eventType: string): string {
    if (eventType.includes('CREATED')) return 'success';
    if (eventType.includes('UPDATED')) return 'info';
    if (eventType.includes('DELETED')) return 'warning';
    if (eventType.includes('FAILED') || eventType.includes('ERROR')) return 'error';
    return 'info';
  }

  private getNotificationTitle(eventType: string): string {
    const titles: { [key: string]: string } = {
      USER_CREATED: 'New User Registered',
      USER_UPDATED: 'User Profile Updated',
      USER_DELETED: 'User Account Deleted',
      ORDER_CREATED: 'New Order Received',
      ORDER_CANCELLED: 'Order Cancelled',
      PAYMENT_PROCESSED: 'Payment Successful',
      PAYMENT_FAILED: 'Payment Failed',
      SYSTEM_MAINTENANCE_STARTED: 'System Maintenance',
      SYSTEM_MAINTENANCE_COMPLETED: 'Maintenance Complete',
    };

    return titles[eventType] || 'System Notification';
  }

  private getNotificationMessage(event: DomainEvent): string {
    switch (event.type) {
      case 'USER_CREATED':
        return `${event.data.user.firstName} ${event.data.user.lastName} has registered`;
      case 'USER_UPDATED':
        return `User profile has been updated`;
      case 'ORDER_CREATED':
        return `Order #${event.data.order.orderNumber} has been created`;
      case 'PAYMENT_PROCESSED':
        return `Payment of ${event.data.payment.amount} has been processed`;
      default:
        return 'System event occurred';
    }
  }

  private isAdminEvent(eventType: string): boolean {
    const adminEvents = ['USER_CREATED', 'USER_DELETED', 'SYSTEM_MAINTENANCE_STARTED', 'SYSTEM_MAINTENANCE_COMPLETED'];
    return adminEvents.includes(eventType);
  }

  private isSystemEvent(eventType: string): boolean {
    const systemEvents = ['SYSTEM_MAINTENANCE_STARTED', 'SYSTEM_MAINTENANCE_COMPLETED'];
    return systemEvents.includes(eventType);
  }
}
```

### Cache Invalidation Handler

```typescript
// apps/api/src/handlers/cache-invalidation.handler.ts
import { EventHandler, DomainEvent } from '../services/event-bus.service';
import { FastifyInstance } from 'fastify';

export class CacheInvalidationHandler implements EventHandler {
  constructor(private fastify: FastifyInstance) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      const cacheKeys = this.getCacheKeysToInvalidate(event);

      if (cacheKeys.length > 0) {
        // Invalidate multiple cache keys
        for (const key of cacheKeys) {
          await this.fastify.redis.del(key);
        }

        // Also invalidate pattern-based keys
        const patterns = this.getCachePatternsToInvalidate(event);
        for (const pattern of patterns) {
          const keys = await this.fastify.redis.keys(pattern);
          if (keys.length > 0) {
            await this.fastify.redis.del(...keys);
          }
        }

        this.fastify.log.debug(`Cache invalidated for event: ${event.type}`, {
          keys: cacheKeys,
          patterns,
          eventId: event.id,
        });
      }
    } catch (error) {
      this.fastify.log.error('Failed to invalidate cache:', error);
    }
  }

  private getCacheKeysToInvalidate(event: DomainEvent): string[] {
    const keys: string[] = [];

    switch (event.type) {
      case 'USER_CREATED':
      case 'USER_UPDATED':
      case 'USER_DELETED':
        // Invalidate user-specific cache
        keys.push(`user:${event.aggregateId}`);
        keys.push(`user:profile:${event.aggregateId}`);

        // Invalidate user lists
        keys.push('users:list');
        keys.push('users:stats');
        break;

      case 'ROLE_CREATED':
      case 'ROLE_UPDATED':
      case 'ROLE_DELETED':
        // Invalidate role caches
        keys.push(`role:${event.aggregateId}`);
        keys.push('roles:list');

        // Invalidate user permission caches (roles affect permissions)
        keys.push('users:list'); // Users include role data
        break;

      case 'ORDER_CREATED':
      case 'ORDER_UPDATED':
      case 'ORDER_CANCELLED':
        // Invalidate order caches
        keys.push(`order:${event.aggregateId}`);
        keys.push(`user:orders:${event.data.order?.userId}`);
        keys.push('orders:stats');
        break;

      case 'PAYMENT_PROCESSED':
      case 'PAYMENT_FAILED':
        // Invalidate payment and related order caches
        keys.push(`payment:${event.aggregateId}`);
        if (event.data.orderId) {
          keys.push(`order:${event.data.orderId}`);
        }
        break;
    }

    return keys;
  }

  private getCachePatternsToInvalidate(event: DomainEvent): string[] {
    const patterns: string[] = [];

    switch (event.type) {
      case 'USER_CREATED':
      case 'USER_UPDATED':
      case 'USER_DELETED':
        // Invalidate all user list queries (different filters/sorts)
        patterns.push('api:users:list:*');
        patterns.push('api:users:search:*');
        break;

      case 'ROLE_CREATED':
      case 'ROLE_UPDATED':
      case 'ROLE_DELETED':
        // Invalidate permission-related caches
        patterns.push('api:users:*'); // Users include role data
        patterns.push('api:roles:*');
        patterns.push('permissions:*');
        break;

      case 'ORDER_CREATED':
      case 'ORDER_UPDATED':
        patterns.push('api:orders:*');
        patterns.push('api:analytics:*');
        break;
    }

    return patterns;
  }
}
```

## Event-Driven CRUD Wrapper

### Enhanced Base Repository with Events

```typescript
// apps/api/src/repositories/event-driven-base.repository.ts
import { BaseRepository } from './base.repository';
import { EventFactory } from '../events/event-factory';
import { FastifyInstance } from 'fastify';

export abstract class EventDrivenRepository<T, CreateDto, UpdateDto> extends BaseRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected fastify: FastifyInstance,
    tableName: string,
    searchFields: string[] = [],
  ) {
    super(fastify.knex, tableName, searchFields);
  }

  // Abstract methods for event creation
  abstract getAggregateType(): string;
  abstract createCreatedEvent(entity: T, userId?: string): any;
  abstract createUpdatedEvent(entity: T, previousData: any, userId?: string): any;
  abstract createDeletedEvent(id: string, userId?: string): any;

  // Override CRUD methods to emit events
  async create(data: CreateDto, userId?: string): Promise<T> {
    const entity = await super.create(data);

    // Emit domain event
    const event = this.createCreatedEvent(entity, userId);
    await this.fastify.eventBus.publish(event);

    return entity;
  }

  async update(id: string, data: UpdateDto, userId?: string): Promise<T | null> {
    // Get previous data for event
    const previousData = await this.findById(id);
    if (!previousData) return null;

    const entity = await super.update(id, data);
    if (!entity) return null;

    // Emit domain event
    const event = this.createUpdatedEvent(entity, previousData, userId);
    await this.fastify.eventBus.publish(event);

    return entity;
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    // Check if entity exists
    const existing = await this.findById(id);
    if (!existing) return false;

    const deleted = await super.delete(id);

    if (deleted) {
      // Emit domain event
      const event = this.createDeletedEvent(id, userId);
      await this.fastify.eventBus.publish(event);
    }

    return deleted;
  }

  // Bulk operations with events
  async createMany(items: CreateDto[], userId?: string): Promise<T[]> {
    const results: T[] = [];

    // Use transaction for consistency
    await this.knex.transaction(async (trx) => {
      for (const item of items) {
        const entity = await this.createInTransaction(trx, item);
        results.push(entity);

        // Emit event for each created item
        const event = this.createCreatedEvent(entity, userId);
        await this.fastify.eventBus.publish(event);
      }
    });

    return results;
  }

  async updateMany(updates: Array<{ id: string; data: UpdateDto }>, userId?: string): Promise<T[]> {
    const results: T[] = [];

    await this.knex.transaction(async (trx) => {
      for (const { id, data } of updates) {
        const previousData = await this.findById(id);
        if (!previousData) continue;

        const entity = await this.updateInTransaction(trx, id, data);
        if (!entity) continue;

        results.push(entity);

        // Emit event
        const event = this.createUpdatedEvent(entity, previousData, userId);
        await this.fastify.eventBus.publish(event);
      }
    });

    return results;
  }

  async deleteMany(ids: string[], userId?: string): Promise<number> {
    let deletedCount = 0;

    await this.knex.transaction(async (trx) => {
      for (const id of ids) {
        const existing = await this.findById(id);
        if (!existing) continue;

        const deleted = await this.deleteInTransaction(trx, id);
        if (deleted) {
          deletedCount++;

          // Emit event
          const event = this.createDeletedEvent(id, userId);
          await this.fastify.eventBus.publish(event);
        }
      }
    });

    return deletedCount;
  }

  // Transaction helpers
  private async createInTransaction(trx: Knex.Transaction, data: CreateDto): Promise<T> {
    const dbData = this.transformToDb(data);
    const [row] = await trx(this.tableName).insert(dbData).returning('*');
    return this.transformToEntity(row);
  }

  private async updateInTransaction(trx: Knex.Transaction, id: string, data: UpdateDto): Promise<T | null> {
    const dbData = this.transformToDb(data);
    const [row] = await trx(this.tableName)
      .where({ id })
      .update({ ...dbData, updated_at: new Date() })
      .returning('*');
    return row ? this.transformToEntity(row) : null;
  }

  private async deleteInTransaction(trx: Knex.Transaction, id: string): Promise<boolean> {
    const deletedRows = await trx(this.tableName).where({ id }).del();
    return deletedRows > 0;
  }
}
```

### Event-Driven User Repository

```typescript
// apps/api/src/modules/user/user.repository.ts
import { EventDrivenRepository } from '../../repositories/event-driven-base.repository';
import { User, CreateUserRequest, UpdateUserRequest } from '@org/api-client';
import { EventFactory } from '../../events/event-factory';
import { FastifyInstance } from 'fastify';

export class UserRepository extends EventDrivenRepository<User, CreateUserRequest, UpdateUserRequest> {
  constructor(fastify: FastifyInstance) {
    super(fastify, 'users', ['users.email', 'users.first_name', 'users.last_name', 'users.username']);
  }

  getAggregateType(): string {
    return 'User';
  }

  createCreatedEvent(user: User, userId?: string) {
    return EventFactory.userCreated(user, userId);
  }

  createUpdatedEvent(user: User, previousData: any, userId?: string) {
    return EventFactory.userUpdated(user, previousData, userId);
  }

  createDeletedEvent(id: string, userId?: string) {
    return EventFactory.userDeleted(id, userId);
  }

  // Join with roles table
  getJoinQuery() {
    return this.knex('users').leftJoin('roles', 'users.role_id', 'roles.id').select('users.id', 'users.email', 'users.username', 'users.first_name', 'users.last_name', 'users.is_active', 'users.created_at', 'users.updated_at', this.knex.raw("json_build_object('id', roles.id, 'name', roles.name, 'description', roles.description) as role"));
  }

  // Custom filters and transformations (same as before)
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any) {
    const { role, roles, status, createdAfter, createdBefore } = filters;

    if (role) {
      query.where('roles.name', role);
    }

    if (roles && roles.length > 0) {
      query.whereIn('roles.name', roles);
    }

    if (status) {
      query.where('users.is_active', status === 'active');
    }

    if (createdAfter) {
      query.where('users.created_at', '>=', createdAfter);
    }

    if (createdBefore) {
      query.where('users.created_at', '<=', createdBefore);
    }
  }

  transformToEntity(dbRow: any): User {
    return {
      id: dbRow.id,
      email: dbRow.email,
      username: dbRow.username,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      isActive: dbRow.is_active,
      role: dbRow.role,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }

  transformToDb(dto: CreateUserRequest | UpdateUserRequest): any {
    const transformed: any = {};

    if ('email' in dto) transformed.email = dto.email;
    if ('username' in dto) transformed.username = dto.username;
    if ('firstName' in dto) transformed.first_name = dto.firstName;
    if ('lastName' in dto) transformed.last_name = dto.lastName;
    if ('password' in dto) transformed.password = dto.password;
    if ('roleId' in dto) transformed.role_id = dto.roleId;
    if ('isActive' in dto) transformed.is_active = dto.isActive;

    return transformed;
  }

  // User-specific methods with events
  async updatePassword(id: string, hashedPassword: string, userId?: string): Promise<void> {
    const previousData = await this.findById(id);

    await this.knex('users').where({ id }).update({
      password: hashedPassword,
      updated_at: new Date(),
    });

    // Emit password change event
    const event = EventFactory.create('USER_PASSWORD_CHANGED', id, 'User', { userId: id }, { userId });

    await this.fastify.eventBus.publish(event);
  }

  async activateUser(id: string, userId?: string): Promise<boolean> {
    const user = await this.update(id, { isActive: true } as UpdateUserRequest, userId);
    return user !== null;
  }

  async deactivateUser(id: string, userId?: string): Promise<boolean> {
    const user = await this.update(id, { isActive: false } as UpdateUserRequest, userId);
    return user !== null;
  }
}
```

## Enhanced Service Layer with Events

### Event-Driven User Service

```typescript
// apps/api/src/modules/user/user.service.ts
import { BaseService } from '../../services/base.service';
import { UserRepository } from './user.repository';
import { User, CreateUserRequest, UpdateUserRequest } from '@org/api-client';
import { EventFactory } from '../../events/event-factory';
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

export class UserService extends BaseService<User, CreateUserRequest, UpdateUserRequest> {
  private userRepository: UserRepository;

  constructor(fastify: FastifyInstance) {
    const userRepository = new UserRepository(fastify);
    super(userRepository);
    this.userRepository = userRepository;
  }

  // Override create to add password hashing and additional events
  async create(data: CreateUserRequest, userId?: string): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData = { ...data, password: hashedPassword };

    // Create user (will emit USER_CREATED event)
    const user = await this.userRepository.create(userData, userId);

    // Emit additional registration event for welcome email
    const registrationEvent = EventFactory.create('USER_REGISTRATION_COMPLETED', user.id, 'User', { user, registrationSource: 'admin' }, { userId });

    await this.fastify.eventBus.publish(registrationEvent);

    return user;
  }

  // Login with events
  async login(email: string, password: string, sessionInfo: any): Promise<{ user: User; tokens: any }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new Error('ACCOUNT_INACTIVE');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = await this.fastify.authService.generateTokens(user);

    // Emit login event
    const loginEvent = EventFactory.userLoggedIn(user, {
      ...sessionInfo,
      loginTime: new Date(),
    });

    await this.fastify.eventBus.publish(loginEvent);

    return { user, tokens };
  }

  // Logout with events
  async logout(userId: string, sessionId: string): Promise<void> {
    // Invalidate session
    await this.fastify.authService.invalidateSession(sessionId);

    // Emit logout event
    const logoutEvent = EventFactory.userLoggedOut(userId, sessionId);
    await this.fastify.eventBus.publish(logoutEvent);
  }

  // Bulk operations with events
  async bulkActivate(userIds: string[], userId?: string): Promise<User[]> {
    const updates = userIds.map((id) => ({
      id,
      data: { isActive: true } as UpdateUserRequest,
    }));

    const results = await this.userRepository.updateMany(updates, userId);

    // Emit bulk activation event
    const bulkEvent = EventFactory.create('USERS_BULK_ACTIVATED', 'bulk-operation', 'User', { userIds, count: results.length }, { userId });

    await this.fastify.eventBus.publish(bulkEvent);

    return results;
  }

  async bulkDeactivate(userIds: string[], userId?: string): Promise<User[]> {
    const updates = userIds.map((id) => ({
      id,
      data: { isActive: false } as UpdateUserRequest,
    }));

    const results = await this.userRepository.updateMany(updates, userId);

    // Emit bulk deactivation event
    const bulkEvent = EventFactory.create('USERS_BULK_DEACTIVATED', 'bulk-operation', 'User', { userIds, count: results.length }, { userId });

    await this.fastify.eventBus.publish(bulkEvent);

    return results;
  }

  async importUsers(users: CreateUserRequest[], userId?: string): Promise<{ successful: User[]; failed: any[] }> {
    const successful: User[] = [];
    const failed: any[] = [];

    for (const userData of users) {
      try {
        const user = await this.create(userData, userId);
        successful.push(user);
      } catch (error) {
        failed.push({
          userData,
          error: error.message,
        });
      }
    }

    // Emit import completion event
    const importEvent = EventFactory.create(
      'USERS_IMPORT_COMPLETED',
      'import-operation',
      'User',
      {
        totalUsers: users.length,
        successful: successful.length,
        failed: failed.length,
        importedUsers: successful.map((u) => u.id),
      },
      { userId },
    );

    await this.fastify.eventBus.publish(importEvent);

    return { successful, failed };
  }
}
```

## CRUD Controller with Events

### Event-Enhanced Controller

```typescript
// apps/api/src/modules/user/user.controller.ts
import { FastifyInstance } from 'fastify';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor(private fastify: FastifyInstance) {
    this.userService = new UserService(fastify);
  }

  async register(fastify: FastifyInstance) {
    // CREATE with events
    fastify.route({
      method: 'POST',
      url: '/',
      schema: {
        description: 'Create new user',
        tags: ['Users'],
        body: { $ref: 'createUserRequest#' },
        response: {
          201: { $ref: 'userResponse#' },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const userId = request.user?.id;
        const user = await this.userService.create(request.body, userId);

        return reply.created(user, 'User created successfully');
      },
    });

    // UPDATE with events
    fastify.route({
      method: 'PUT',
      url: '/:id',
      schema: {
        description: 'Update user by ID',
        tags: ['Users'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: { $ref: 'updateUserRequest#' },
        response: {
          200: { $ref: 'userResponse#' },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin', 'manager'])],
      handler: async (request, reply) => {
        const { id } = request.params;
        const userId = request.user?.id;

        const user = await this.userService.update(id, request.body, userId);

        if (!user) {
          return reply.notFound('User not found');
        }

        return reply.success(user, 'User updated successfully');
      },
    });

    // DELETE with events
    fastify.route({
      method: 'DELETE',
      url: '/:id',
      schema: {
        description: 'Delete user by ID',
        tags: ['Users'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { id } = request.params;
        const userId = request.user?.id;

        const deleted = await this.userService.delete(id, userId);

        if (!deleted) {
          return reply.notFound('User not found');
        }

        return reply.success({ id }, 'User deleted successfully');
      },
    });

    // BULK OPERATIONS with events
    fastify.route({
      method: 'PATCH',
      url: '/bulk/activate',
      schema: {
        description: 'Bulk activate users',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['userIds'],
          properties: {
            userIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 100,
            },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { userIds } = request.body;
        const userId = request.user?.id;

        const users = await this.userService.bulkActivate(userIds, userId);

        return reply.success(users, `${users.length} users activated successfully`);
      },
    });

    fastify.route({
      method: 'PATCH',
      url: '/bulk/deactivate',
      schema: {
        description: 'Bulk deactivate users',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['userIds'],
          properties: {
            userIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 100,
            },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { userIds } = request.body;
        const userId = request.user?.id;

        const users = await this.userService.bulkDeactivate(userIds, userId);

        return reply.success(users, `${users.length} users deactivated successfully`);
      },
    });

    // IMPORT with events
    fastify.route({
      method: 'POST',
      url: '/import',
      schema: {
        description: 'Import multiple users',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['users'],
          properties: {
            users: {
              type: 'array',
              items: { $ref: 'createUserRequest#' },
              minItems: 1,
              maxItems: 1000,
            },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { users } = request.body;
        const userId = request.user?.id;

        const result = await this.userService.importUsers(users, userId);

        return reply.success(result, `Import completed: ${result.successful.length} successful, ${result.failed.length} failed`);
      },
    });
  }
}
```

## Event Handlers Registration

### Event Handler Manager

```typescript
// apps/api/src/services/event-handler-manager.ts
import { FastifyInstance } from 'fastify';
import { EmailNotificationHandler } from '../handlers/email-notification.handler';
import { AuditLogHandler } from '../handlers/audit-log.handler';
import { WebSocketNotificationHandler } from '../handlers/websocket-notification.handler';
import { CacheInvalidationHandler } from '../handlers/cache-invalidation.handler';

export class EventHandlerManager {
  constructor(private fastify: FastifyInstance) {}

  async registerAllHandlers(): Promise<void> {
    // Create handler instances
    const emailHandler = new EmailNotificationHandler(this.fastify);
    const auditHandler = new AuditLogHandler(this.fastify);
    const websocketHandler = new WebSocketNotificationHandler(this.fastify);
    const cacheHandler = new CacheInvalidationHandler(this.fastify);

    // Register handlers for user events
    this.registerUserEventHandlers(emailHandler, auditHandler, websocketHandler, cacheHandler);

    // Register handlers for system events
    this.registerSystemEventHandlers(emailHandler, auditHandler, websocketHandler, cacheHandler);

    // Register handlers for business events
    this.registerBusinessEventHandlers(emailHandler, auditHandler, websocketHandler, cacheHandler);

    this.fastify.log.info('All event handlers registered successfully');
  }

  private registerUserEventHandlers(emailHandler: EmailNotificationHandler, auditHandler: AuditLogHandler, websocketHandler: WebSocketNotificationHandler, cacheHandler: CacheInvalidationHandler) {
    // User created
    this.fastify.eventBus.subscribe('USER_CREATED', emailHandler);
    this.fastify.eventBus.subscribe('USER_CREATED', auditHandler);
    this.fastify.eventBus.subscribe('USER_CREATED', websocketHandler);
    this.fastify.eventBus.subscribe('USER_CREATED', cacheHandler);

    // User updated
    this.fastify.eventBus.subscribe('USER_UPDATED', auditHandler);
    this.fastify.eventBus.subscribe('USER_UPDATED', websocketHandler);
    this.fastify.eventBus.subscribe('USER_UPDATED', cacheHandler);

    // User deleted
    this.fastify.eventBus.subscribe('USER_DELETED', auditHandler);
    this.fastify.eventBus.subscribe('USER_DELETED', websocketHandler);
    this.fastify.eventBus.subscribe('USER_DELETED', cacheHandler);

    // User authentication events
    this.fastify.eventBus.subscribe('USER_LOGGED_IN', auditHandler);
    this.fastify.eventBus.subscribe('USER_LOGGED_OUT', auditHandler);
    this.fastify.eventBus.subscribe('USER_PASSWORD_CHANGED', emailHandler);
    this.fastify.eventBus.subscribe('USER_PASSWORD_CHANGED', auditHandler);

    // Bulk operations
    this.fastify.eventBus.subscribe('USERS_BULK_ACTIVATED', auditHandler);
    this.fastify.eventBus.subscribe('USERS_BULK_DEACTIVATED', auditHandler);
    this.fastify.eventBus.subscribe('USERS_IMPORT_COMPLETED', emailHandler);
    this.fastify.eventBus.subscribe('USERS_IMPORT_COMPLETED', auditHandler);
  }

  private registerSystemEventHandlers(emailHandler: EmailNotificationHandler, auditHandler: AuditLogHandler, websocketHandler: WebSocketNotificationHandler, cacheHandler: CacheInvalidationHandler) {
    // System maintenance
    this.fastify.eventBus.subscribe('SYSTEM_MAINTENANCE_STARTED', websocketHandler);
    this.fastify.eventBus.subscribe('SYSTEM_MAINTENANCE_COMPLETED', websocketHandler);
    this.fastify.eventBus.subscribe('SYSTEM_MAINTENANCE_STARTED', auditHandler);
    this.fastify.eventBus.subscribe('SYSTEM_MAINTENANCE_COMPLETED', auditHandler);
  }

  private registerBusinessEventHandlers(emailHandler: EmailNotificationHandler, auditHandler: AuditLogHandler, websocketHandler: WebSocketNotificationHandler, cacheHandler: CacheInvalidationHandler) {
    // Order events
    this.fastify.eventBus.subscribe('ORDER_CREATED', emailHandler);
    this.fastify.eventBus.subscribe('ORDER_CREATED', auditHandler);
    this.fastify.eventBus.subscribe('ORDER_CREATED', websocketHandler);
    this.fastify.eventBus.subscribe('ORDER_CREATED', cacheHandler);

    // Payment events
    this.fastify.eventBus.subscribe('PAYMENT_PROCESSED', emailHandler);
    this.fastify.eventBus.subscribe('PAYMENT_PROCESSED', auditHandler);
    this.fastify.eventBus.subscribe('PAYMENT_PROCESSED', websocketHandler);
    this.fastify.eventBus.subscribe('PAYMENT_FAILED', websocketHandler);
  }
}
```

## Database Schema for Events

### Event Store Migration

```sql
-- database/migrations/20240101000000_create_domain_events.sql
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for performance
  INDEX idx_domain_events_type (type),
  INDEX idx_domain_events_aggregate (aggregate_id, aggregate_type),
  INDEX idx_domain_events_created_at (created_at),
  INDEX idx_domain_events_user_id ((metadata->>'userId'))
);

-- Event projections for analytics
CREATE TABLE event_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_name VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  projection_data JSONB NOT NULL,
  last_event_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(projection_name, aggregate_id, aggregate_type),
  FOREIGN KEY (last_event_id) REFERENCES domain_events(id)
);

-- Event subscriptions for tracking handlers
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_name VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  last_processed_event_id UUID,
  processed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(handler_name, event_type),
  FOREIGN KEY (last_processed_event_id) REFERENCES domain_events(id)
);
```

## Event-Driven Architecture Patterns

### Saga Pattern for Complex Workflows

```typescript
// apps/api/src/sagas/user-registration.saga.ts
import { EventHandler, DomainEvent } from '../services/event-bus.service';
import { FastifyInstance } from 'fastify';
import { EventFactory } from '../events/event-factory';

export class UserRegistrationSaga implements EventHandler {
  constructor(private fastify: FastifyInstance) {}

  async handle(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case 'USER_REGISTRATION_COMPLETED':
        await this.handleUserRegistration(event);
        break;
      case 'WELCOME_EMAIL_SENT':
        await this.handleWelcomeEmailSent(event);
        break;
      case 'USER_ONBOARDING_STARTED':
        await this.handleOnboardingStarted(event);
        break;
    }
  }

  private async handleUserRegistration(event: DomainEvent): Promise<void> {
    const { user } = event.data;

    try {
      // Step 1: Send welcome email
      const emailEvent = EventFactory.create('SEND_WELCOME_EMAIL', user.id, 'User', { user }, { correlationId: event.id });

      await this.fastify.eventBus.publish(emailEvent);

      // Step 2: Create default user settings
      await this.createDefaultUserSettings(user.id);

      // Step 3: Start onboarding process
      const onboardingEvent = EventFactory.create('USER_ONBOARDING_STARTED', user.id, 'User', { user, step: 'profile_completion' }, { correlationId: event.id });

      await this.fastify.eventBus.publish(onboardingEvent);
    } catch (error) {
      // Emit compensation event
      const failureEvent = EventFactory.create('USER_REGISTRATION_FAILED', user.id, 'User', { user, error: error.message }, { correlationId: event.id });

      await this.fastify.eventBus.publish(failureEvent);
    }
  }

  private async createDefaultUserSettings(userId: string): Promise<void> {
    const defaultSettings = {
      userId,
      theme: 'light',
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    };

    await this.fastify.knex('user_settings').insert(defaultSettings);

    const settingsEvent = EventFactory.create('USER_SETTINGS_CREATED', userId, 'UserSettings', defaultSettings);

    await this.fastify.eventBus.publish(settingsEvent);
  }

  private async handleWelcomeEmailSent(event: DomainEvent): Promise<void> {
    // Update user onboarding status
    await this.fastify.knex('user_onboarding').where('user_id', event.aggregateId).update({
      welcome_email_sent: true,
      welcome_email_sent_at: new Date(),
    });
  }

  private async handleOnboardingStarted(event: DomainEvent): Promise<void> {
    const { user, step } = event.data;

    // Create onboarding record
    await this.fastify.knex('user_onboarding').insert({
      user_id: user.id,
      current_step: step,
      started_at: new Date(),
      is_completed: false,
    });
  }
}
```

### Event Projection Service

```typescript
// apps/api/src/services/event-projection.service.ts
export class EventProjectionService {
  constructor(private fastify: FastifyInstance) {}

  // Create/Update user statistics projection
  async updateUserStatsProjection(event: DomainEvent): Promise<void> {
    const projectionName = 'user_stats';

    try {
      const currentStats = await this.fastify
        .knex('event_projections')
        .where({
          projection_name: projectionName,
          aggregate_id: 'global',
          aggregate_type: 'UserStats',
        })
        .first();

      let newStats: any = {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsersThisMonth: 0,
        lastUpdated: new Date(),
      };

      if (currentStats) {
        newStats = JSON.parse(currentStats.projection_data);
      }

      // Update stats based on event
      switch (event.type) {
        case 'USER_CREATED':
          newStats.totalUsers++;
          newStats.activeUsers++;

          // Check if created this month
          const userCreatedAt = new Date(event.data.user.createdAt);
          const thisMonth = new Date();
          thisMonth.setDate(1);
          thisMonth.setHours(0, 0, 0, 0);

          if (userCreatedAt >= thisMonth) {
            newStats.newUsersThisMonth++;
          }
          break;

        case 'USER_DELETED':
          newStats.totalUsers--;
          newStats.activeUsers--;
          break;

        case 'USER_UPDATED':
          const { user, previousData } = event.data;

          // Check if status changed
          if (user.isActive !== previousData.isActive) {
            if (user.isActive) {
              newStats.activeUsers++;
              newStats.inactiveUsers--;
            } else {
              newStats.activeUsers--;
              newStats.inactiveUsers++;
            }
          }
          break;
      }

      newStats.lastUpdated = new Date();

      // Upsert projection
      await this.fastify
        .knex('event_projections')
        .insert({
          projection_name: projectionName,
          aggregate_id: 'global',
          aggregate_type: 'UserStats',
          projection_data: JSON.stringify(newStats),
          last_event_id: event.id,
          version: 1,
        })
        .onConflict(['projection_name', 'aggregate_id', 'aggregate_type'])
        .merge({
          projection_data: JSON.stringify(newStats),
          last_event_id: event.id,
          version: this.fastify.knex.raw('version + 1'),
          updated_at: new Date(),
        });
    } catch (error) {
      this.fastify.log.error('Failed to update user stats projection:', error);
    }
  }

  // Get projection data
  async getUserStats(): Promise<any> {
    const projection = await this.fastify
      .knex('event_projections')
      .where({
        projection_name: 'user_stats',
        aggregate_id: 'global',
        aggregate_type: 'UserStats',
      })
      .first();

    if (!projection) {
      // Return default stats if no projection exists
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsersThisMonth: 0,
        lastUpdated: null,
      };
    }

    return JSON.parse(projection.projection_data);
  }

  // Rebuild projection from events
  async rebuildUserStatsProjection(): Promise<void> {
    // Get all user events
    const events = await this.fastify.eventBus.getEventHistory('global', 'User');

    // Reset projection
    await this.fastify
      .knex('event_projections')
      .where({
        projection_name: 'user_stats',
        aggregate_id: 'global',
        aggregate_type: 'UserStats',
      })
      .del();

    // Replay all events
    for (const event of events) {
      await this.updateUserStatsProjection(event);
    }
  }
}
```

## Command Query Responsibility Segregation (CQRS)

### CQRS Service Wrapper

```typescript
// apps/api/src/services/cqrs-wrapper.service.ts
import { FastifyInstance } from 'fastify';
import { EventFactory } from '../events/event-factory';

export class CQRSService<T, CreateDto, UpdateDto> {
  constructor(
    private fastify: FastifyInstance,
    private writeRepository: any, // Write side repository
    private readRepository?: any, // Optional read side repository
  ) {}

  // Command side (Write operations)
  async executeCommand(command: Command): Promise<any> {
    try {
      let result: any;
      let event: any;

      switch (command.type) {
        case 'CREATE':
          result = await this.writeRepository.create(command.data, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        case 'UPDATE':
          result = await this.writeRepository.update(command.id, command.data, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        case 'DELETE':
          result = await this.writeRepository.delete(command.id, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        case 'BULK_CREATE':
          result = await this.writeRepository.createMany(command.data, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        case 'BULK_UPDATE':
          result = await this.writeRepository.updateMany(command.data, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        case 'BULK_DELETE':
          result = await this.writeRepository.deleteMany(command.data, command.userId);
          event = this.createEventForCommand(command, result);
          break;

        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }

      // Publish event
      if (event) {
        await this.fastify.eventBus.publish(event);
      }

      return result;
    } catch (error) {
      // Emit failure event
      const failureEvent = EventFactory.create(`${command.type}_FAILED`, command.id || 'unknown', command.aggregateType, { command, error: error.message }, { userId: command.userId });

      await this.fastify.eventBus.publish(failureEvent);
      throw error;
    }
  }

  // Query side (Read operations)
  async executeQuery(query: Query): Promise<any> {
    const repository = this.readRepository || this.writeRepository;

    try {
      let result: any;

      switch (query.type) {
        case 'GET_BY_ID':
          result = await repository.findById(query.id);
          break;

        case 'GET_LIST':
          result = await repository.list(query.params);
          break;

        case 'GET_COUNT':
          result = await repository.count(query.params);
          break;

        case 'SEARCH':
          result = await repository.search(query.params);
          break;

        default:
          throw new Error(`Unknown query type: ${query.type}`);
      }

      return result;
    } catch (error) {
      this.fastify.log.error(`Query failed: ${query.type}`, error);
      throw error;
    }
  }

  private createEventForCommand(command: Command, result: any): any {
    const eventType = `${command.aggregateType.toUpperCase()}_${command.type}D`;

    return EventFactory.create(eventType, command.id || result.id, command.aggregateType, { command, result }, { userId: command.userId });
  }
}

interface Command {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE';
  aggregateType: string;
  id?: string;
  data: any;
  userId?: string;
  metadata?: any;
}

interface Query {
  type: 'GET_BY_ID' | 'GET_LIST' | 'GET_COUNT' | 'SEARCH';
  id?: string;
  params?: any;
}
```

## Advanced Event Patterns

### Event Sourcing Repository

```typescript
// apps/api/src/repositories/event-sourced.repository.ts
export abstract class EventSourcedRepository<T> {
  constructor(protected fastify: FastifyInstance) {}

  abstract getAggregateType(): string;
  abstract applyEvent(aggregate: T | null, event: DomainEvent): T;
  abstract createSnapshot(aggregate: T): any;
  abstract fromSnapshot(snapshot: any): T;

  // Load aggregate from events
  async loadAggregate(id: string): Promise<T | null> {
    // Try to load from snapshot first
    const snapshot = await this.loadSnapshot(id);
    let aggregate: T | null = null;
    let fromVersion = 0;

    if (snapshot) {
      aggregate = this.fromSnapshot(snapshot.data);
      fromVersion = snapshot.version;
    }

    // Load events after snapshot
    const events = await this.fastify.knex('domain_events').where('aggregate_id', id).where('aggregate_type', this.getAggregateType()).where('metadata->version', '>', fromVersion).orderBy('metadata->version', 'asc');

    // Apply events to rebuild aggregate
    for (const eventRow of events) {
      const event: DomainEvent = {
        id: eventRow.id,
        type: eventRow.type,
        aggregateId: eventRow.aggregate_id,
        aggregateType: eventRow.aggregate_type,
        data: JSON.parse(eventRow.data),
        metadata: JSON.parse(eventRow.metadata),
      };

      aggregate = this.applyEvent(aggregate, event);
    }

    return aggregate;
  }

  // Save events for aggregate
  async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    await this.fastify.knex.transaction(async (trx) => {
      // Check current version
      const lastEvent = await trx('domain_events').where('aggregate_id', aggregateId).where('aggregate_type', this.getAggregateType()).orderBy('metadata->version', 'desc').first();

      const currentVersion = lastEvent ? JSON.parse(lastEvent.metadata).version : 0;

      if (currentVersion !== expectedVersion) {
        throw new Error('Concurrency conflict - aggregate has been modified');
      }

      // Insert new events
      for (const [index, event] of events.entries()) {
        event.metadata.version = expectedVersion + index + 1;

        await trx('domain_events').insert({
          id: event.id,
          type: event.type,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          data: JSON.stringify(event.data),
          metadata: JSON.stringify(event.metadata),
          created_at: event.metadata.timestamp,
        });
      }
    });

    // Publish events to event bus
    for (const event of events) {
      await this.fastify.eventBus.publish(event);
    }
  }

  // Snapshot management
  private async loadSnapshot(aggregateId: string): Promise<any> {
    return await this.fastify.knex('aggregate_snapshots').where('aggregate_id', aggregateId).where('aggregate_type', this.getAggregateType()).orderBy('version', 'desc').first();
  }

  async saveSnapshot(aggregateId: string, aggregate: T, version: number): Promise<void> {
    const snapshotData = this.createSnapshot(aggregate);

    await this.fastify
      .knex('aggregate_snapshots')
      .insert({
        aggregate_id: aggregateId,
        aggregate_type: this.getAggregateType(),
        data: JSON.stringify(snapshotData),
        version,
        created_at: new Date(),
      })
      .onConflict(['aggregate_id', 'aggregate_type'])
      .merge({
        data: JSON.stringify(snapshotData),
        version,
        updated_at: new Date(),
      });
  }
}
```

## Event API Endpoints

### Event Management Controller

```typescript
// apps/api/src/modules/events/events.controller.ts
export class EventsController {
  constructor(private fastify: FastifyInstance) {}

  async register(fastify: FastifyInstance) {
    // GET /api/events - Event history
    fastify.route({
      method: 'GET',
      url: '/',
      schema: {
        description: 'Get domain events history',
        tags: ['Events'],
        querystring: {
          type: 'object',
          properties: {
            aggregateId: { type: 'string' },
            aggregateType: { type: 'string' },
            eventType: { type: 'string' },
            fromDate: { type: 'string', format: 'date-time' },
            toDate: { type: 'string', format: 'date-time' },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { aggregateId, aggregateType, eventType, fromDate, toDate, page = 1, limit = 20 } = request.query;

        const query = this.fastify.knex('domain_events').orderBy('created_at', 'desc');

        if (aggregateId) query.where('aggregate_id', aggregateId);
        if (aggregateType) query.where('aggregate_type', aggregateType);
        if (eventType) query.where('type', eventType);
        if (fromDate) query.where('created_at', '>=', fromDate);
        if (toDate) query.where('created_at', '<=', toDate);

        // Get total count
        const countQuery = query.clone().count('* as total');
        const [{ total }] = await countQuery;

        // Get paginated results
        const events = await query.offset((page - 1) * limit).limit(limit);

        return reply.paginated(events, page, limit, parseInt(total), 'Events retrieved successfully');
      },
    });

    // POST /api/events/replay - Replay events
    fastify.route({
      method: 'POST',
      url: '/replay',
      schema: {
        description: 'Replay domain events',
        tags: ['Events'],
        body: {
          type: 'object',
          properties: {
            fromDate: { type: 'string', format: 'date-time' },
            eventTypes: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const { fromDate, eventTypes } = request.body;

        // Replay events in background
        setImmediate(async () => {
          try {
            await this.fastify.eventBus.replayEvents(fromDate ? new Date(fromDate) : undefined, eventTypes);
            this.fastify.log.info('Event replay completed');
          } catch (error) {
            this.fastify.log.error('Event replay failed:', error);
          }
        });

        return reply.success({}, 'Event replay started');
      },
    });

    // GET /api/events/stats - Event statistics
    fastify.route({
      method: 'GET',
      url: '/stats',
      schema: {
        description: 'Get event statistics',
        tags: ['Events'],
      },
      preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
      handler: async (request, reply) => {
        const stats = await this.fastify.knex('domain_events').select('type', 'aggregate_type', this.fastify.knex.raw('COUNT(*) as count'), this.fastify.knex.raw('MIN(created_at) as first_event'), this.fastify.knex.raw('MAX(created_at) as last_event')).groupBy('type', 'aggregate_type').orderBy('count', 'desc');

        const totalEvents = await this.fastify.knex('domain_events').count('* as total');

        return reply.success(
          {
            eventTypes: stats,
            totalEvents: parseInt(totalEvents[0].total),
          },
          'Event statistics retrieved',
        );
      },
    });

    // GET /api/events/health - Event bus health
    fastify.route({
      method: 'GET',
      url: '/health',
      schema: {
        description: 'Event bus health check',
        tags: ['Events'],
      },
      handler: async (request, reply) => {
        const health = await this.fastify.eventBus.healthCheck();
        return reply.success(health, 'Event bus health retrieved');
      },
    });
  }
}
```

## Event Testing

### Event Handler Testing

```typescript
// apps/api/src/modules/user/user.service.test.ts
import { FastifyInstance } from 'fastify';
import { UserService } from './user.service';
import { EventBusService } from '../../services/event-bus.service';

describe('UserService with Events', () => {
  let app: FastifyInstance;
  let userService: UserService;
  let eventBusSpy: jest.SpyObj<EventBusService>;

  beforeEach(async () => {
    // Mock event bus
    eventBusSpy = {
      publish: jest.fn(),
      subscribe: jest.fn(),
      healthCheck: jest.fn(),
    } as any;

    // Setup test app with mocked event bus
    app = fastify();
    app.decorate('eventBus', eventBusSpy);
    app.decorate('knex', mockKnex);

    userService = new UserService(app);
  });

  describe('create', () => {
    it('should create user and emit USER_CREATED event', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        roleId: 'role-id',
      };

      const createdUser = await userService.create(userData, 'admin-id');

      expect(createdUser).toBeDefined();
      expect(eventBusSpy.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'USER_CREATED',
          aggregateId: createdUser.id,
          aggregateType: 'User',
          data: { user: createdUser },
        }),
      );
    });

    it('should emit USER_REGISTRATION_COMPLETED event for new registrations', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        roleId: 'role-id',
      };

      await userService.create(userData, 'admin-id');

      expect(eventBusSpy.publish).toHaveBeenCalledTimes(2);
      expect(eventBusSpy.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'USER_REGISTRATION_COMPLETED',
        }),
      );
    });
  });

  describe('login', () => {
    it('should emit USER_LOGGED_IN event on successful login', async () => {
      const sessionInfo = {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // Mock user exists and password is valid
      mockKnex.select.mockResolvedValueOnce([
        {
          id: 'user-id',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
          is_active: true,
        },
      ]);

      const result = await userService.login('test@example.com', 'password123', sessionInfo);

      expect(result.user).toBeDefined();
      expect(eventBusSpy.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'USER_LOGGED_IN',
          data: {
            user: result.user,
            sessionInfo: expect.objectContaining(sessionInfo),
          },
        }),
      );
    });
  });

  describe('bulkActivate', () => {
    it('should emit USERS_BULK_ACTIVATED event', async () => {
      const userIds = ['user1', 'user2', 'user3'];

      const result = await userService.bulkActivate(userIds, 'admin-id');

      expect(eventBusSpy.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'USERS_BULK_ACTIVATED',
          data: {
            userIds,
            count: result.length,
          },
        }),
      );
    });
  });
});
```

### E2E Event Testing

```typescript
// e2e/api-e2e/src/specs/events.spec.ts
describe('Event System E2E', () => {
  let app: FastifyInstance;
  let eventBus: EventBusService;

  beforeEach(async () => {
    app = await buildTestApp();
    eventBus = app.eventBus;
  });

  it('should process user creation workflow end-to-end', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roleId: 'user-role-id',
    };

    // Create user via API
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: userData,
    });

    expect(response.statusCode).toBe(201);
    const createdUser = JSON.parse(response.payload).data;

    // Wait for events to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify audit log was created
    const auditLogs = await app.knex('audit_logs').where('resource_id', createdUser.id).where('action', 'CREATE');

    expect(auditLogs).toHaveLength(1);

    // Verify welcome email event was triggered
    const emailEvents = await app.knex('domain_events').where('type', 'SEND_WELCOME_EMAIL').where('aggregate_id', createdUser.id);

    expect(emailEvents).toHaveLength(1);

    // Verify user settings were created
    const userSettings = await app.knex('user_settings').where('user_id', createdUser.id);

    expect(userSettings).toHaveLength(1);
  });

  it('should handle cache invalidation on user update', async () => {
    // Create user first
    const user = await createTestUser();

    // Cache user data
    await app.redis.setex(`user:${user.id}`, 300, JSON.stringify(user));

    // Update user
    await app.inject({
      method: 'PUT',
      url: `/api/users/${user.id}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        firstName: 'Updated Name',
      },
    });

    // Wait for cache invalidation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify cache was invalidated
    const cachedUser = await app.redis.get(`user:${user.id}`);
    expect(cachedUser).toBeNull();
  });
});
```

## Production Configuration

### Event Bus with Redis Clustering

```typescript
// apps/api/src/plugins/event-bus-cluster.plugin.ts
import fp from 'fastify-plugin';
import Redis from 'ioredis';

export default fp(async function eventBusClusterPlugin(fastify) {
  // Redis cluster for distributed events
  const cluster = new Redis.Cluster(
    [
      { host: process.env.REDIS_HOST_1, port: 6379 },
      { host: process.env.REDIS_HOST_2, port: 6379 },
      { host: process.env.REDIS_HOST_3, port: 6379 },
    ],
    {
      enableOfflineQueue: false,
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
      },
    },
  );

  // Event bus with cluster support
  const eventBus = new EventBusService(fastify, new EventEmitter(), true);

  fastify.decorate('eventBusCluster', cluster);
  fastify.decorate('eventBus', eventBus);
});
```

### Health Monitoring

```typescript
// Event bus health monitoring
fastify.route({
  method: 'GET',
  url: '/health/events',
  handler: async (request, reply) => {
    const health = await fastify.eventBus.healthCheck();

    const eventStats = await fastify.knex('domain_events').select(fastify.knex.raw('COUNT(*) as total_events'), fastify.knex.raw('COUNT(DISTINCT type) as event_types'), fastify.knex.raw('MAX(created_at) as last_event')).first();

    return reply.success(
      {
        ...health,
        database: {
          totalEvents: parseInt(eventStats.total_events),
          eventTypes: parseInt(eventStats.event_types),
          lastEvent: eventStats.last_event,
        },
      },
      'Event system health',
    );
  },
});
```

## Best Practices

### Event Design Guidelines

1. **Event Names**: Use past tense (USER_CREATED, not CREATE_USER)
2. **Event Data**: Include complete aggregate state, not just changes
3. **Idempotency**: Handlers should be idempotent
4. **Error Handling**: Don't let one handler failure affect others
5. **Ordering**: Events within same aggregate should be ordered
6. **Versioning**: Include event schema version for evolution
7. **Correlation**: Use correlation IDs for tracing workflows
8. **Compensation**: Implement saga patterns for complex workflows

### Performance Considerations

1. **Async Processing**: Handle events asynchronously
2. **Batching**: Process multiple events in batches when possible
3. **Snapshots**: Use snapshots for large event streams
4. **Indexing**: Index event store tables properly
5. **Partitioning**: Partition event tables by date or aggregate type
6. **Monitoring**: Monitor event processing latency and failures
7. **Dead Letter Queue**: Handle failed events appropriately
8. **Circuit Breaker**: Protect against cascading failures

### Security Considerations

1. **Event Encryption**: Encrypt sensitive data in events
2. **Access Control**: Restrict event API access to admins
3. **Audit Trail**: Events provide complete audit trail
4. **Data Privacy**: Consider GDPR compliance for user events
5. **Event Replay**: Secure event replay functionality
6. **Handler Authorization**: Verify handler permissions
