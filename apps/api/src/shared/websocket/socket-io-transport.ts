/**
 * Socket.IO Transport Implementation
 * Implements IWebSocketTransport interface for Socket.IO
 */

import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { FastifyInstance } from 'fastify';
import type { IWebSocketTransport, TransportConfig, ConnectionInfo } from './transport.interface';

export class SocketIOTransport implements IWebSocketTransport {
  private io: Server | null = null;
  private connections: Map<string, Socket> = new Map();
  private redisAdapter: any = null;

  constructor(private config: TransportConfig = {}) {}

  async initialize(fastify: FastifyInstance): Promise<void> {
    // Create Socket.IO server
    this.io = new Server(fastify.server, {
      path: '/api/ws/',  // Match frontend expectation
      cors: this.config.cors || {
        origin: true,
        credentials: true
      },
      maxHttpBufferSize: 1e6, // 1MB
      pingTimeout: this.config.pingTimeout || 60000,
      pingInterval: this.config.pingInterval || 25000,
      // compression: this.config.enableCompression ?? true, // Not supported in Socket.IO v4
      allowEIO3: true,
      transports: ['websocket', 'polling'], // Allow both transports
      upgradeTimeout: 3000, // Reduce upgrade timeout for faster WebSocket connection
    });

    // Setup Redis adapter if configured
    if (this.config.redis) {
      await this.setupRedisAdapter();
    }

    // Setup connection handling
    this.setupConnectionHandling();

    console.log('[SocketIOTransport] Initialized');
  }

  getInstance(): Server {
    if (!this.io) {
      throw new Error('SocketIOTransport not initialized');
    }
    return this.io;
  }

  emitToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  emitToAll(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  joinRoom(socketId: string, room: string): void {
    const socket = this.connections.get(socketId);
    if (socket) {
      socket.join(room);
    }
  }

  leaveRoom(socketId: string, room: string): void {
    const socket = this.connections.get(socketId);
    if (socket) {
      socket.leave(room);
    }
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getSocketRooms(socketId: string): string[] {
    const socket = this.connections.get(socketId);
    if (!socket) return [];
    
    return Array.from(socket.rooms).filter(room => room !== socketId);
  }

  disconnectSocket(socketId: string): void {
    const socket = this.connections.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
  }

  async close(): Promise<void> {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.connections.clear();
  }

  /**
   * Socket.IO specific methods
   */

  getConnectionInfo(socketId: string): ConnectionInfo | null {
    const socket = this.connections.get(socketId);
    if (!socket) return null;

    return {
      id: socket.id,
      connected: socket.connected,
      rooms: this.getSocketRooms(socketId),
      handshake: {
        headers: socket.handshake.headers as Record<string, string>,
        query: socket.handshake.query as Record<string, string>,
        auth: socket.handshake.auth || {}
      },
      connectedAt: new Date(socket.handshake.time)
    };
  }

  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.keys())
      .map(id => this.getConnectionInfo(id))
      .filter(info => info !== null) as ConnectionInfo[];
  }

  emitToSocket(socketId: string, event: string, data: any): void {
    const socket = this.connections.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Private Methods
   */

  private async setupRedisAdapter(): Promise<void> {
    if (!this.config.redis || !this.io) return;

    try {
      const redisConfig = {
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port,
        },
        password: this.config.redis.password,
        database: this.config.redis.db || 0,
      };

      const pubClient = createClient(redisConfig);
      const subClient = pubClient.duplicate();

      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);

      this.redisAdapter = createAdapter(pubClient, subClient);
      this.io.adapter(this.redisAdapter);

      console.log('[SocketIOTransport] Redis adapter configured');
    } catch (error) {
      console.error('[SocketIOTransport] Redis adapter setup failed:', error);
    }
  }

  private setupConnectionHandling(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`[SocketIOTransport] Client connected: ${socket.id}`);
      
      // Store connection
      this.connections.set(socket.id, socket);

      // Setup authentication if token provided
      this.handleAuthentication(socket);

      // Setup room management
      this.setupRoomManagement(socket);

      // Setup disconnection
      socket.on('disconnect', (reason) => {
        console.log(`[SocketIOTransport] Client disconnected: ${socket.id}, reason: ${reason}`);
        this.connections.delete(socket.id);
      });

      // Setup error handling
      socket.on('error', (error) => {
        console.error(`[SocketIOTransport] Socket error for ${socket.id}:`, error);
      });

      // Emit connection established event
      socket.emit('connection:established', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // Setup server-level error handling
    this.io.on('error', (error) => {
      console.error('[SocketIOTransport] Server error:', error);
    });
  }

  private handleAuthentication(socket: Socket): void {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (token) {
      // TODO: Validate JWT token
      // For now, just log that we received a token
      console.log(`[SocketIOTransport] Authentication token received for ${socket.id}`);
      
      // Join authenticated users room
      socket.join('authenticated');
    } else {
      // Join anonymous users room
      socket.join('anonymous');
    }
  }

  private setupRoomManagement(socket: Socket): void {
    // Join feature-specific rooms
    socket.on('join:feature', (feature: string) => {
      if (typeof feature === 'string' && feature.length > 0) {
        socket.join(feature);
        socket.emit('joined:feature', { feature, socketId: socket.id });
        console.log(`[SocketIOTransport] ${socket.id} joined feature room: ${feature}`);
      }
    });

    // Join entity-specific rooms
    socket.on('join:entity', ({ feature, entity }: { feature: string; entity: string }) => {
      if (typeof feature === 'string' && typeof entity === 'string') {
        const room = `${feature}:${entity}`;
        socket.join(room);
        socket.emit('joined:entity', { feature, entity, room, socketId: socket.id });
        console.log(`[SocketIOTransport] ${socket.id} joined entity room: ${room}`);
      }
    });

    // Leave room
    socket.on('leave:room', (room: string) => {
      if (typeof room === 'string') {
        socket.leave(room);
        socket.emit('left:room', { room, socketId: socket.id });
        console.log(`[SocketIOTransport] ${socket.id} left room: ${room}`);
      }
    });

    // Get rooms
    socket.on('get:rooms', () => {
      const rooms = this.getSocketRooms(socket.id);
      socket.emit('rooms:list', { rooms, socketId: socket.id });
    });
  }
}