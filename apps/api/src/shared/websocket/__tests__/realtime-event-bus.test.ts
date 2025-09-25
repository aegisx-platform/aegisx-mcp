/**
 * RealtimeEventBus Unit Tests
 */

import { RealtimeEventBus, EventPayload } from '../realtime-event-bus';
import { IWebSocketTransport } from '../transport.interface';

// Mock WebSocket Transport
class MockWebSocketTransport implements IWebSocketTransport {
  private events: Array<{ room: string; event: string; data: any }> = [];
  
  async initialize(): Promise<void> {
    // Mock implementation
  }
  
  getInstance(): unknown {
    return {};
  }
  
  emitToRoom(room: string, event: string, data: any): void {
    this.events.push({ room, event, data });
  }
  
  emitToAll(event: string, data: any): void {
    this.events.push({ room: 'all', event, data });
  }
  
  joinRoom(): void {}
  leaveRoom(): void {}
  getConnectionCount(): number { return 1; }
  getSocketRooms(): string[] { return []; }
  disconnectSocket(): void {}
  async close(): Promise<void> {}
  
  // Test helper
  getEmittedEvents() {
    return this.events;
  }
  
  clearEvents() {
    this.events = [];
  }
}

describe('RealtimeEventBus', () => {
  let eventBus: RealtimeEventBus;
  let mockTransport: MockWebSocketTransport;

  beforeEach(() => {
    eventBus = new RealtimeEventBus({
      enableRedis: false, // Disable Redis for unit tests
      wildcard: true,
      delimiter: '.',
      maxListeners: 20
    });
    
    mockTransport = new MockWebSocketTransport();
    eventBus.setTransport(mockTransport);
  });

  afterEach(async () => {
    await eventBus.close();
    mockTransport.clearEvents();
  });

  describe('Event Emission', () => {
    it('should emit events with correct format', () => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToEvents('users.user.*', (payload) => {
        receivedEvents.push(payload);
      });

      const testData = { id: '123', name: 'John Doe' };
      eventBus.emitEvent('users', 'user', 'created', testData, 'normal');

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toMatchObject({
        feature: 'users',
        entity: 'user',
        action: 'created',
        data: testData,
        priority: {
          level: 'normal',
          retries: 0
        }
      });
    });

    it('should auto-forward events to WebSocket transport', () => {
      const testData = { id: '123', name: 'John Doe' };
      eventBus.emitEvent('users', 'user', 'created', testData, 'high');

      const emittedEvents = mockTransport.getEmittedEvents();
      expect(emittedEvents).toHaveLength(2); // One to feature room, one to entity room
      
      expect(emittedEvents[0]).toMatchObject({
        room: 'users:user',
        event: 'users.user.created'
      });
      
      expect(emittedEvents[1]).toMatchObject({
        room: 'users',
        event: 'users.user.created'
      });
    });

    it('should support wildcard subscriptions', () => {
      const receivedEvents: EventPayload[] = [];
      
      // Subscribe to all user events
      eventBus.subscribeToEvents('users.user.*', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitUpdated('users', 'user', { id: '1' });
      eventBus.emitDeleted('users', 'user', { id: '1' });

      expect(receivedEvents).toHaveLength(3);
      expect(receivedEvents.map(e => e.action)).toEqual(['created', 'updated', 'deleted']);
    });

    it('should support feature-level subscriptions', (done) => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToFeature('users', (payload) => {
        receivedEvents.push(payload);
        
        if (receivedEvents.length === 2) {
          expect(receivedEvents).toHaveLength(2);
          expect(receivedEvents.every(e => e.feature === 'users')).toBe(true);
          done();
        }
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitCreated('users', 'profile', { id: '1' });
      eventBus.emitCreated('products', 'item', { id: '1' }); // Different feature
    });
  });

  describe('Convenience Methods', () => {
    it('should emit CRUD operations with correct actions', () => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToEvents('users.user.*', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitUpdated('users', 'user', { id: '1' });
      eventBus.emitDeleted('users', 'user', { id: '1' });

      expect(receivedEvents.map(e => e.action)).toEqual(['created', 'updated', 'deleted']);
      expect(receivedEvents.map(e => e.priority.level)).toEqual(['normal', 'normal', 'high']);
    });

    it('should emit bulk operations with progress tracking', (done) => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToEvents('users.user.bulk_*', (payload) => {
        receivedEvents.push(payload);
        
        if (receivedEvents.length === 3) {
          expect(receivedEvents).toHaveLength(3);
          expect(receivedEvents.map(e => e.action)).toEqual(['bulk_started', 'bulk_progress', 'bulk_completed']);
          expect(receivedEvents.map(e => e.priority.level)).toEqual(['high', 'normal', 'high']);
          done();
        }
      });

      const operationId = 'bulk_123';
      eventBus.emitBulkStarted('users', 'user', { operationId, total: 100, operation: 'update' });
      eventBus.emitBulkProgress('users', 'user', { 
        operationId, 
        progress: { total: 100, completed: 50, failed: 0, percentage: 50 }
      });
      eventBus.emitBulkCompleted('users', 'user', { 
        operationId, 
        results: { successful: 95, failed: 5 }
      });
    });
  });

  describe('Priority Handling', () => {
    it('should set correct retry limits based on priority', () => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToEvents('test.*.*', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.emitEvent('test', 'entity', 'action', {}, 'low');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'normal');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'high');
      eventBus.emitEvent('test', 'entity', 'action', {}, 'critical');

      expect(receivedEvents[0].priority.maxRetries).toBe(1); // low
      expect(receivedEvents[1].priority.maxRetries).toBe(2); // normal
      expect(receivedEvents[2].priority.maxRetries).toBe(3); // high
      expect(receivedEvents[3].priority.maxRetries).toBe(5); // critical
    });
  });

  describe('Statistics', () => {
    it('should return event bus statistics', () => {
      const stats = eventBus.getStatistics();
      
      expect(stats).toMatchObject({
        isRedisEnabled: false,
        transport: 'connected',
        processing: true
      });
      
      expect(stats.instanceId).toBeDefined();
      expect(typeof stats.listenerCount).toBe('number');
      expect(Array.isArray(stats.eventNames)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create an error handler that doesn't throw
      eventBus.on('error', (error) => {
        console.error('Error caught:', error);
      });
      
      eventBus.emit('error', new Error('Test error'));
      
      // Should not crash the application
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should continue working after transport errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock transport to throw error
      jest.spyOn(mockTransport, 'emitToRoom').mockImplementation(() => {
        throw new Error('Transport error');
      });

      const receivedEvents: EventPayload[] = [];
      eventBus.subscribeToEvents('test.*.*', (payload) => {
        receivedEvents.push(payload);
      });

      // Should still emit locally even if transport fails
      eventBus.emitEvent('test', 'entity', 'action', {}, 'normal');
      
      expect(receivedEvents).toHaveLength(1);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Subscription Management', () => {
    it('should support entity-specific subscriptions', () => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToEntity('users', 'profile', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.emitCreated('users', 'profile', { id: '1' });
      eventBus.emitCreated('users', 'user', { id: '1' }); // Different entity
      eventBus.emitCreated('products', 'profile', { id: '1' }); // Different feature

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toMatchObject({
        feature: 'users',
        entity: 'profile',
        action: 'created'
      });
    });

    it('should support action-specific subscriptions', () => {
      const receivedEvents: EventPayload[] = [];
      
      eventBus.subscribeToAction('users', 'user', 'deleted', (payload) => {
        receivedEvents.push(payload);
      });

      eventBus.emitCreated('users', 'user', { id: '1' });
      eventBus.emitUpdated('users', 'user', { id: '1' });
      eventBus.emitDeleted('users', 'user', { id: '1' });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].action).toBe('deleted');
    });
  });
});