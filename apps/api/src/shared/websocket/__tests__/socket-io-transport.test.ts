/**
 * SocketIOTransport Unit Tests
 */

import { SocketIOTransport } from '../socket-io-transport';
import { TransportConfig } from '../transport.interface';
import { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';

// Mock Fastify instance
const mockFastify = {
  server: {
    listen: jest.fn(),
    close: jest.fn()
  }
} as unknown as FastifyInstance;

// Mock Socket.IO Server
jest.mock('socket.io', () => {
  const mockSocket = {
    id: 'test-socket-id',
    connected: true,
    rooms: new Set(['room1', 'room2']),
    handshake: {
      headers: { 'user-agent': 'test' },
      query: { token: 'test-token' },
      auth: { userId: '123' },
      time: Date.now()
    },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn()
  };

  const mockIo = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    on: jest.fn(),
    adapter: jest.fn(),
    close: jest.fn(),
    sockets: {
      get: jest.fn().mockReturnValue(mockSocket)
    }
  };

  return {
    Server: jest.fn().mockImplementation(() => mockIo)
  };
});

// Mock Redis adapter
jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn().mockReturnValue({})
}));

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    duplicate: jest.fn().mockReturnThis()
  })
}));

describe('SocketIOTransport', () => {
  let transport: SocketIOTransport;
  let config: TransportConfig;

  beforeEach(async () => {
    config = {
      cors: {
        origin: true,
        credentials: true
      },
      enableCompression: true,
      maxConnections: 100,
      pingTimeout: 60000,
      pingInterval: 25000
    };

    transport = new SocketIOTransport(config);
    await transport.initialize(mockFastify);
  });

  afterEach(async () => {
    await transport.close();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', async () => {
      const defaultTransport = new SocketIOTransport();
      await defaultTransport.initialize(mockFastify);
      
      expect(Server).toHaveBeenCalled();
      await defaultTransport.close();
    });

    it('should initialize with custom configuration', () => {
      expect(Server).toHaveBeenCalledWith(mockFastify.server, expect.objectContaining({
        cors: config.cors,
        compression: config.enableCompression,
        pingTimeout: config.pingTimeout,
        pingInterval: config.pingInterval
      }));
    });

    it('should setup Redis adapter when Redis config provided', async () => {
      const redisConfig = {
        ...config,
        redis: {
          host: 'localhost',
          port: 6379,
          password: 'test',
          db: 0
        }
      };

      const redisTransport = new SocketIOTransport(redisConfig);
      await redisTransport.initialize(mockFastify);
      
      // Should not throw error even if Redis connection fails
      await redisTransport.close();
    });
  });

  describe('Basic Transport Operations', () => {
    it('should emit to specific room', () => {
      const testData = { message: 'test' };
      transport.emitToRoom('test-room', 'test-event', testData);

      const io = transport.getInstance();
      expect(io.to).toHaveBeenCalledWith('test-room');
      expect(io.emit).toHaveBeenCalledWith('test-event', testData);
    });

    it('should emit to all clients', () => {
      const testData = { message: 'broadcast' };
      transport.emitToAll('broadcast-event', testData);

      const io = transport.getInstance();
      expect(io.emit).toHaveBeenCalledWith('broadcast-event', testData);
    });

    it('should get connection count', () => {
      // Mock connections in transport
      (transport as any).connections = new Map([
        ['socket1', {}],
        ['socket2', {}],
        ['socket3', {}]
      ]);

      expect(transport.getConnectionCount()).toBe(3);
    });

    it('should handle room operations', () => {
      const mockSocket = {
        join: jest.fn(),
        leave: jest.fn()
      };
      
      (transport as any).connections = new Map([
        ['test-socket', mockSocket]
      ]);

      transport.joinRoom('test-socket', 'new-room');
      expect(mockSocket.join).toHaveBeenCalledWith('new-room');

      transport.leaveRoom('test-socket', 'old-room');
      expect(mockSocket.leave).toHaveBeenCalledWith('old-room');
    });
  });

  describe('Connection Management', () => {
    it('should get socket rooms correctly', () => {
      const mockSocket = {
        rooms: new Set(['socket-id', 'room1', 'room2', 'room3'])
      };
      
      (transport as any).connections = new Map([
        ['socket-id', mockSocket]
      ]);

      const rooms = transport.getSocketRooms('socket-id');
      expect(rooms).toEqual(['room1', 'room2', 'room3']);
      expect(rooms).not.toContain('socket-id'); // Should exclude socket's own room
    });

    it('should return empty array for non-existent socket', () => {
      const rooms = transport.getSocketRooms('non-existent');
      expect(rooms).toEqual([]);
    });

    it('should disconnect socket', () => {
      const mockSocket = {
        disconnect: jest.fn()
      };
      
      (transport as any).connections = new Map([
        ['test-socket', mockSocket]
      ]);

      transport.disconnectSocket('test-socket');
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should handle disconnect for non-existent socket', () => {
      // Should not throw error
      expect(() => {
        transport.disconnectSocket('non-existent');
      }).not.toThrow();
    });
  });

  describe('Socket.IO Specific Features', () => {
    it('should get connection info', () => {
      const mockSocket = {
        id: 'test-socket',
        connected: true,
        rooms: new Set(['test-socket', 'room1']),
        handshake: {
          headers: { 'user-agent': 'test-browser' },
          query: { token: 'auth-token' },
          auth: { userId: '123' },
          time: 1234567890
        }
      };
      
      (transport as any).connections = new Map([
        ['test-socket', mockSocket]
      ]);

      const info = transport.getConnectionInfo('test-socket');
      
      expect(info).toMatchObject({
        id: 'test-socket',
        connected: true,
        rooms: ['room1'],
        handshake: {
          headers: { 'user-agent': 'test-browser' },
          query: { token: 'auth-token' },
          auth: { userId: '123' }
        }
      });
      expect(info?.connectedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent connection info', () => {
      const info = transport.getConnectionInfo('non-existent');
      expect(info).toBeNull();
    });

    it('should get all connections', () => {
      const mockSocket1 = {
        id: 'socket1',
        connected: true,
        rooms: new Set(['socket1']),
        handshake: {
          headers: {},
          query: {},
          auth: {},
          time: Date.now()
        }
      };
      
      const mockSocket2 = {
        id: 'socket2',
        connected: false,
        rooms: new Set(['socket2']),
        handshake: {
          headers: {},
          query: {},
          auth: {},
          time: Date.now()
        }
      };
      
      (transport as any).connections = new Map([
        ['socket1', mockSocket1],
        ['socket2', mockSocket2]
      ]);

      const connections = transport.getAllConnections();
      expect(connections).toHaveLength(2);
      expect(connections.map(c => c.id)).toEqual(['socket1', 'socket2']);
    });

    it('should emit to specific socket', () => {
      const mockSocket = {
        emit: jest.fn()
      };
      
      (transport as any).connections = new Map([
        ['test-socket', mockSocket]
      ]);

      const testData = { message: 'direct' };
      transport.emitToSocket('test-socket', 'direct-event', testData);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('direct-event', testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock Server constructor to throw
      (Server as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      const errorTransport = new SocketIOTransport();
      
      await expect(errorTransport.initialize(mockFastify)).rejects.toThrow('Initialization failed');
      
      consoleSpy.mockRestore();
    });

    it('should handle Redis setup errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock Redis client to fail
      const { createClient } = require('redis');
      createClient.mockReturnValueOnce({
        connect: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        duplicate: jest.fn().mockReturnThis()
      });

      const redisConfig = {
        redis: {
          host: 'invalid-host',
          port: 6379
        }
      };

      const redisTransport = new SocketIOTransport(redisConfig);
      
      // Should not throw even if Redis fails
      await expect(redisTransport.initialize(mockFastify)).resolves.not.toThrow();
      
      consoleSpy.mockRestore();
      await redisTransport.close();
    });

    it('should handle missing socket operations gracefully', () => {
      // Operations on non-existent sockets should not throw
      expect(() => {
        transport.joinRoom('non-existent', 'room');
        transport.leaveRoom('non-existent', 'room');
        transport.disconnectSocket('non-existent');
        transport.emitToSocket('non-existent', 'event', {});
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should close cleanly', async () => {
      const io = transport.getInstance();
      
      await transport.close();
      
      expect(io.close).toHaveBeenCalled();
      expect(transport.getConnectionCount()).toBe(0);
    });

    it('should handle close when not initialized', async () => {
      const uninitializedTransport = new SocketIOTransport();
      
      // Should not throw
      await expect(uninitializedTransport.close()).resolves.not.toThrow();
    });
  });
});