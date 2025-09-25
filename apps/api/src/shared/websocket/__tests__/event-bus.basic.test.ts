/**
 * Basic RealtimeEventBus Tests
 */

import { RealtimeEventBus } from '../realtime-event-bus';

describe('RealtimeEventBus - Basic Tests', () => {
  let eventBus: RealtimeEventBus;

  beforeEach(() => {
    eventBus = new RealtimeEventBus({
      enableRedis: false,
      wildcard: true,
      delimiter: '.'
    });
  });

  afterEach(async () => {
    await eventBus.close();
  });

  describe('Initialization', () => {
    it('should create event bus with default config', () => {
      const bus = new RealtimeEventBus();
      expect(bus).toBeDefined();
      expect(bus.getStatistics).toBeDefined();
    });

    it('should create event bus with custom config', () => {
      const config = {
        enableRedis: false,
        wildcard: true,
        delimiter: '.',
        maxListeners: 10
      };
      
      const bus = new RealtimeEventBus(config);
      expect(bus).toBeDefined();
      
      const stats = bus.getStatistics();
      expect(stats.isRedisEnabled).toBe(false);
    });
  });

  describe('Basic Event Operations', () => {
    it('should emit and receive basic events', (done) => {
      let eventReceived = false;
      
      eventBus.on('test.entity.action', (payload) => {
        eventReceived = true;
        expect(payload.feature).toBe('test');
        expect(payload.entity).toBe('entity');
        expect(payload.action).toBe('action');
        done();
      });

      eventBus.emitEvent('test', 'entity', 'action', { id: '123' });
    });

    it('should emit CRUD convenience methods', () => {
      const events: any[] = [];
      
      eventBus.on('users.user.created', (payload) => events.push(payload));
      eventBus.on('users.user.updated', (payload) => events.push(payload));
      eventBus.on('users.user.deleted', (payload) => events.push(payload));

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitUpdated('users', 'user', { id: '1' });
      eventBus.emitDeleted('users', 'user', { id: '1' });

      expect(events).toHaveLength(3);
    });

    it('should emit bulk operation events', () => {
      const events: any[] = [];
      
      eventBus.on('users.user.bulk_started', (payload) => events.push(payload));
      eventBus.on('users.user.bulk_progress', (payload) => events.push(payload));
      eventBus.on('users.user.bulk_completed', (payload) => events.push(payload));

      eventBus.emitBulkStarted('users', 'user', { operationId: 'test' });
      eventBus.emitBulkProgress('users', 'user', { operationId: 'test', progress: { total: 10, completed: 5, failed: 0, percentage: 50 } });
      eventBus.emitBulkCompleted('users', 'user', { operationId: 'test', results: { successful: 10, failed: 0 } });

      expect(events).toHaveLength(3);
    });
  });

  describe('Priority System', () => {
    it('should handle different priority levels', () => {
      const events: any[] = [];
      
      eventBus.on('test.entity.action', (payload) => {
        events.push(payload);
      });

      eventBus.emitEvent('test', 'entity', 'action', {}, 'low');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'normal');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'high');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'critical');

      expect(events).toHaveLength(4);
      expect(events.map(e => e.priority.level)).toEqual(['low', 'normal', 'high', 'critical']);
    });
  });

  describe('Statistics', () => {
    it('should return basic statistics', () => {
      const stats = eventBus.getStatistics();
      
      expect(stats).toHaveProperty('instanceId');
      expect(stats).toHaveProperty('isRedisEnabled');
      expect(stats).toHaveProperty('transport');
      expect(stats).toHaveProperty('processing');
      expect(stats).toHaveProperty('listenerCount');
      expect(stats).toHaveProperty('eventNames');
      
      expect(typeof stats.instanceId).toBe('string');
      expect(typeof stats.isRedisEnabled).toBe('boolean');
      expect(typeof stats.processing).toBe('boolean');
    });
  });

  describe('Subscription Helpers', () => {
    it('should subscribe to feature events', () => {
      const events: any[] = [];
      
      eventBus.subscribeToFeature('users', (payload) => {
        events.push(payload);
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitCreated('users', 'profile', { id: '1' });
      eventBus.emitCreated('products', 'item', { id: '1' }); // Different feature

      // Should receive only users events
      expect(events.filter(e => e.feature === 'users')).toHaveLength(2);
    });

    it('should subscribe to entity events', () => {
      const events: any[] = [];
      
      eventBus.subscribeToEntity('users', 'profile', (payload) => {
        events.push(payload);
      });

      eventBus.emitCreated('users', 'profile', { id: '1' });
      eventBus.emitCreated('users', 'user', { id: '1' }); // Different entity

      expect(events).toHaveLength(1);
      expect(events[0].entity).toBe('profile');
    });

    it('should subscribe to specific actions', () => {
      const events: any[] = [];
      
      eventBus.subscribeToAction('users', 'user', 'deleted', (payload) => {
        events.push(payload);
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitUpdated('users', 'user', { id: '1' });
      eventBus.emitDeleted('users', 'user', { id: '1' });

      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('deleted');
    });
  });

  describe('Cleanup', () => {
    it('should close cleanly', async () => {
      const bus = new RealtimeEventBus({ enableRedis: false });
      
      // Should not throw
      await expect(bus.close()).resolves.not.toThrow();
    });
  });
});