/**
 * WebSocket Transport Interface
 * Enables switchable transport layer (Socket.IO ↔ ws)
 */

import type { Server } from 'socket.io';
import type { FastifyInstance } from 'fastify';

export interface IWebSocketTransport {
  /**
   * Initialize the transport layer
   */
  initialize(fastify: FastifyInstance): Promise<void>;

  /**
   * Get the transport instance
   */
  getInstance(): unknown;

  /**
   * Emit event to specific room
   */
  emitToRoom(room: string, event: string, data: any): void;

  /**
   * Emit event to all clients
   */
  emitToAll(event: string, data: any): void;

  /**
   * Join client to room
   */
  joinRoom(socketId: string, room: string): void;

  /**
   * Remove client from room
   */
  leaveRoom(socketId: string, room: string): void;

  /**
   * Get connection count
   */
  getConnectionCount(): number;

  /**
   * Get rooms for socket
   */
  getSocketRooms(socketId: string): string[];

  /**
   * Disconnect socket
   */
  disconnectSocket(socketId: string): void;

  /**
   * Close transport
   */
  close(): Promise<void>;
}

/**
 * Transport Configuration
 */
export interface TransportConfig {
  cors?: {
    origin: string | string[] | boolean;
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

/**
 * Transport Types
 */
export type TransportType = 'socket.io' | 'ws';

/**
 * Connection Info
 */
export interface ConnectionInfo {
  id: string;
  connected: boolean;
  rooms: string[];
  handshake: {
    headers: Record<string, string>;
    query: Record<string, string>;
    auth: Record<string, any>;
  };
  connectedAt: Date;
}