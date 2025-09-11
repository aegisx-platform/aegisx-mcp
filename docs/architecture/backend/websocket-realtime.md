# WebSocket & Real-time Communication

## Fastify WebSocket Setup

### Basic WebSocket Plugin

```typescript
// apps/api/src/plugins/websocket.plugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

interface WebSocketClient {
  id: string;
  userId?: string;
  rooms: Set<string>;
  socket: any;
  lastPing: Date;
}

export default fp(
  async function websocketPlugin(fastify: FastifyInstance) {
    // Register WebSocket support
    await fastify.register(import('@fastify/websocket'), {
      options: {
        maxPayload: 1048576, // 1MB
        verifyClient: (info) => {
          // Verify client connection
          return true;
        },
      },
    });

    // Client management
    const clients = new Map<string, WebSocketClient>();
    const rooms = new Map<string, Set<string>>(); // room -> client IDs

    // WebSocket connection handler
    fastify.get('/ws', { websocket: true }, async (connection, request) => {
      const clientId = generateClientId();
      const client: WebSocketClient = {
        id: clientId,
        rooms: new Set(),
        socket: connection.socket,
        lastPing: new Date(),
      };

      clients.set(clientId, client);
      fastify.log.info({ clientId }, 'WebSocket client connected');

      // Authentication via query param or header
      const token = (request.query.token as string) || request.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = fastify.jwt.verify(token) as any;
          client.userId = decoded.userId;

          // Join user-specific room
          joinRoom(clientId, `user:${decoded.userId}`);

          // Send auth success
          sendToClient(clientId, {
            type: 'auth:success',
            data: { userId: decoded.userId },
          });
        } catch (error) {
          sendToClient(clientId, {
            type: 'auth:error',
            data: { message: 'Invalid token' },
          });
        }
      }

      // Message handlers
      connection.socket.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await handleMessage(clientId, message);
        } catch (error) {
          fastify.log.error({ clientId, error }, 'WebSocket message error');
        }
      });

      // Heartbeat
      const pingInterval = setInterval(() => {
        if (connection.socket.readyState === 1) {
          connection.socket.ping();
          client.lastPing = new Date();
        }
      }, 30000);

      // Cleanup on disconnect
      connection.socket.on('close', () => {
        clearInterval(pingInterval);
        cleanup(clientId);
        fastify.log.info({ clientId }, 'WebSocket client disconnected');
      });

      connection.socket.on('error', (error) => {
        fastify.log.error({ clientId, error }, 'WebSocket error');
        cleanup(clientId);
      });
    });

    // Message handling
    async function handleMessage(clientId: string, message: any) {
      const client = clients.get(clientId);
      if (!client) return;

      switch (message.type) {
        case 'join_room':
          joinRoom(clientId, message.room);
          break;

        case 'leave_room':
          leaveRoom(clientId, message.room);
          break;

        case 'chat_message':
          await handleChatMessage(clientId, message.data);
          break;

        case 'typing_start':
          broadcastToRoom(
            message.room,
            {
              type: 'user_typing_start',
              data: { userId: client.userId, room: message.room },
            },
            clientId,
          );
          break;

        case 'typing_stop':
          broadcastToRoom(
            message.room,
            {
              type: 'user_typing_stop',
              data: { userId: client.userId, room: message.room },
            },
            clientId,
          );
          break;

        default:
          fastify.log.warn({ clientId, messageType: message.type }, 'Unknown message type');
      }
    }

    // Room management
    function joinRoom(clientId: string, roomId: string) {
      const client = clients.get(clientId);
      if (!client) return;

      client.rooms.add(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)!.add(clientId);

      sendToClient(clientId, {
        type: 'room_joined',
        data: { room: roomId },
      });

      fastify.log.info({ clientId, roomId }, 'Client joined room');
    }

    function leaveRoom(clientId: string, roomId: string) {
      const client = clients.get(clientId);
      if (!client) return;

      client.rooms.delete(roomId);
      rooms.get(roomId)?.delete(clientId);

      if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId);
      }

      sendToClient(clientId, {
        type: 'room_left',
        data: { room: roomId },
      });
    }

    // Broadcasting
    function sendToClient(clientId: string, message: any) {
      const client = clients.get(clientId);
      if (client && client.socket.readyState === 1) {
        client.socket.send(JSON.stringify(message));
      }
    }

    function broadcastToRoom(roomId: string, message: any, excludeClientId?: string) {
      const roomClients = rooms.get(roomId);
      if (!roomClients) return;

      roomClients.forEach((clientId) => {
        if (clientId !== excludeClientId) {
          sendToClient(clientId, message);
        }
      });
    }

    function broadcastToUser(userId: string, message: any) {
      const userRoom = `user:${userId}`;
      broadcastToRoom(userRoom, message);
    }

    function broadcastToAll(message: any, excludeClientId?: string) {
      clients.forEach((client, clientId) => {
        if (clientId !== excludeClientId) {
          sendToClient(clientId, message);
        }
      });
    }

    // Cleanup
    function cleanup(clientId: string) {
      const client = clients.get(clientId);
      if (!client) return;

      // Leave all rooms
      client.rooms.forEach((roomId) => {
        rooms.get(roomId)?.delete(clientId);
        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        }
      });

      clients.delete(clientId);
    }

    // Utility functions
    function generateClientId(): string {
      return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Chat message handler
    async function handleChatMessage(clientId: string, data: any) {
      const client = clients.get(clientId);
      if (!client?.userId) return;

      // Save message to database
      const message = await fastify
        .knex('chat_messages')
        .insert({
          id: fastify.generateId(),
          user_id: client.userId,
          room_id: data.room,
          content: data.content,
          created_at: new Date(),
        })
        .returning('*');

      // Broadcast to room
      broadcastToRoom(data.room, {
        type: 'chat_message',
        data: message[0],
      });
    }

    // Expose utilities to fastify instance
    fastify.decorate('wsClients', clients);
    fastify.decorate('wsRooms', rooms);
    fastify.decorate('wsSendToClient', sendToClient);
    fastify.decorate('wsBroadcastToRoom', broadcastToRoom);
    fastify.decorate('wsBroadcastToUser', broadcastToUser);
    fastify.decorate('wsBroadcastToAll', broadcastToAll);

    // Health check for WebSocket
    fastify.get('/ws/health', async () => {
      return {
        status: 'healthy',
        connectedClients: clients.size,
        activeRooms: rooms.size,
        timestamp: new Date(),
      };
    });
  },
  {
    name: 'websocket-plugin',
  },
);
```

### Real-time Notification System

```typescript
// apps/api/src/modules/notifications/notification.service.ts
import { FastifyInstance } from 'fastify';

export class NotificationService {
  constructor(private fastify: FastifyInstance) {}

  async sendUserNotification(userId: string, notification: UserNotification) {
    // Save to database
    await this.fastify.knex('notifications').insert({
      id: this.fastify.generateId(),
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: JSON.stringify(notification.data || {}),
      read: false,
      created_at: new Date(),
    });

    // Send via WebSocket if user is online
    this.fastify.wsBroadcastToUser(userId, {
      type: 'notification',
      data: notification,
    });

    // Also send via email/push if critical
    if (notification.priority === 'high') {
      await this.sendEmailNotification(userId, notification);
    }
  }

  async sendRoomNotification(roomId: string, notification: RoomNotification) {
    this.fastify.wsBroadcastToRoom(roomId, {
      type: 'room_notification',
      data: notification,
    });
  }

  async sendSystemAnnouncement(announcement: SystemAnnouncement) {
    // Save to database
    await this.fastify.knex('system_announcements').insert({
      id: this.fastify.generateId(),
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      target_roles: JSON.stringify(announcement.targetRoles || []),
      created_at: new Date(),
    });

    // Broadcast to all connected clients
    this.fastify.wsBroadcastToAll({
      type: 'system_announcement',
      data: announcement,
    });
  }

  // Live data updates
  async broadcastDataUpdate(entity: string, operation: 'create' | 'update' | 'delete', data: any) {
    const updateMessage = {
      type: 'data_update',
      data: {
        entity,
        operation,
        payload: data,
        timestamp: new Date(),
      },
    };

    // Broadcast to relevant rooms
    if (entity === 'users') {
      this.fastify.wsBroadcastToRoom('admin', updateMessage);
    } else if (entity === 'orders') {
      this.fastify.wsBroadcastToRoom('managers', updateMessage);
      this.fastify.wsBroadcastToUser(data.userId, updateMessage);
    }
  }

  private async sendEmailNotification(userId: string, notification: UserNotification) {
    // Queue email job
    const emailQueue = this.fastify.emailQueue;
    await emailQueue.add('notification-email', {
      userId,
      notification,
    });
  }
}

interface UserNotification {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  data?: any;
  actionUrl?: string;
  actionText?: string;
}

interface RoomNotification {
  type: string;
  message: string;
  data?: any;
}

interface SystemAnnouncement {
  title: string;
  message: string;
  type: 'maintenance' | 'feature' | 'warning';
  targetRoles?: string[];
}
```

### WebSocket Controller

```typescript
// apps/api/src/modules/websocket/websocket.controller.ts
export class WebSocketController {
  constructor(
    private fastify: FastifyInstance,
    private notificationService: NotificationService,
  ) {}

  // REST endpoints for WebSocket management
  async getConnectedUsers(request: any, reply: any) {
    const clients = this.fastify.wsClients;
    const connectedUsers = Array.from(clients.values())
      .filter((client) => client.userId)
      .map((client) => ({
        clientId: client.id,
        userId: client.userId,
        rooms: Array.from(client.rooms),
        connectedAt: client.lastPing,
      }));

    return { connectedUsers, total: connectedUsers.length };
  }

  async sendNotification(request: any, reply: any) {
    const { userId, notification } = request.body;

    await this.notificationService.sendUserNotification(userId, notification);

    return { success: true, message: 'Notification sent' };
  }

  async broadcastAnnouncement(request: any, reply: any) {
    const announcement = request.body;

    await this.notificationService.sendSystemAnnouncement(announcement);

    return { success: true, message: 'Announcement broadcasted' };
  }

  async kickUser(request: any, reply: any) {
    const { userId } = request.params;

    // Find and disconnect user's connections
    const clients = this.fastify.wsClients;
    let disconnectedCount = 0;

    clients.forEach((client, clientId) => {
      if (client.userId === userId) {
        client.socket.close(1000, 'Disconnected by administrator');
        clients.delete(clientId);
        disconnectedCount++;
      }
    });

    return {
      success: true,
      message: `Disconnected ${disconnectedCount} connections for user ${userId}`,
    };
  }

  // Register routes
  async register(fastify: FastifyInstance) {
    fastify.get(
      '/admin/websocket/clients',
      {
        preHandler: [fastify.authenticate, fastify.authorize(['admin.websocket'])],
        schema: {
          tags: ['WebSocket', 'Admin'],
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              properties: {
                connectedUsers: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
      this.getConnectedUsers.bind(this),
    );

    fastify.post(
      '/admin/websocket/notify',
      {
        preHandler: [fastify.authenticate, fastify.authorize(['notifications.send'])],
        schema: {
          tags: ['WebSocket', 'Notifications'],
          body: {
            type: 'object',
            required: ['userId', 'notification'],
            properties: {
              userId: { type: 'string' },
              notification: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['info', 'warning', 'error', 'success'] },
                  title: { type: 'string' },
                  message: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                },
              },
            },
          },
        },
      },
      this.sendNotification.bind(this),
    );

    fastify.post(
      '/admin/websocket/broadcast',
      {
        preHandler: [fastify.authenticate, fastify.authorize(['announcements.send'])],
        schema: {
          tags: ['WebSocket', 'Admin'],
          body: {
            type: 'object',
            required: ['title', 'message', 'type'],
            properties: {
              title: { type: 'string' },
              message: { type: 'string' },
              type: { type: 'string', enum: ['maintenance', 'feature', 'warning'] },
              targetRoles: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      this.broadcastAnnouncement.bind(this),
    );

    fastify.delete(
      '/admin/websocket/users/:userId',
      {
        preHandler: [fastify.authenticate, fastify.authorize(['admin.websocket'])],
        schema: {
          tags: ['WebSocket', 'Admin'],
          params: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
            },
          },
        },
      },
      this.kickUser.bind(this),
    );
  }

  // Helper functions
  private joinRoom(clientId: string, roomId: string) {
    const client = this.fastify.wsClients.get(clientId);
    if (!client) return;

    client.rooms.add(roomId);

    if (!this.fastify.wsRooms.has(roomId)) {
      this.fastify.wsRooms.set(roomId, new Set());
    }
    this.fastify.wsRooms.get(roomId)!.add(clientId);
  }

  private leaveRoom(clientId: string, roomId: string) {
    const client = this.fastify.wsClients.get(clientId);
    if (!client) return;

    client.rooms.delete(roomId);
    this.fastify.wsRooms.get(roomId)?.delete(clientId);

    if (this.fastify.wsRooms.get(roomId)?.size === 0) {
      this.fastify.wsRooms.delete(roomId);
    }
  }
}
```

## Frontend WebSocket Service

### Angular WebSocket Service with Signals

```typescript
// libs/realtime/src/lib/services/websocket.service.ts
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private authService = inject(AuthService);

  // Connection state signals
  private connectionStateSignal = signal<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  private messagesSignal = signal<WebSocketMessage[]>([]);
  private lastErrorSignal = signal<string | null>(null);
  private reconnectAttemptsSignal = signal(0);

  // Public readonly signals
  readonly connectionState = this.connectionStateSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly lastError = this.lastErrorSignal.asReadonly();
  readonly reconnectAttempts = this.reconnectAttemptsSignal.asReadonly();

  // Computed connection status
  readonly isConnected = computed(() => this.connectionState() === 'connected');
  readonly isConnecting = computed(() => this.connectionState() === 'connecting');
  readonly hasError = computed(() => this.connectionState() === 'error');

  // WebSocket instance
  private socket: WebSocket | null = null;
  private reconnectTimer?: number;
  private heartbeatTimer?: number;

  // Configuration
  private readonly WS_URL = environment.wsUrl;
  private readonly RECONNECT_DELAY = 5000;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly HEARTBEAT_INTERVAL = 30000;

  // Message handlers
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor() {
    // Auto-connect when authenticated
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.connectionStateSignal.set('connecting');
    this.lastErrorSignal.set(null);

    const token = this.authService.token();
    const wsUrl = `${this.WS_URL}?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupSocketHandlers();
    } catch (error: any) {
      this.handleConnectionError(error.message);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.clearTimers();
    this.connectionStateSignal.set('disconnected');
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected() && this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }

  // Message type helpers
  joinRoom(roomId: string): void {
    this.send({ type: 'join_room', room: roomId });
  }

  leaveRoom(roomId: string): void {
    this.send({ type: 'leave_room', room: roomId });
  }

  sendChatMessage(roomId: string, content: string): void {
    this.send({
      type: 'chat_message',
      data: { room: roomId, content },
    });
  }

  startTyping(roomId: string): void {
    this.send({ type: 'typing_start', room: roomId });
  }

  stopTyping(roomId: string): void {
    this.send({ type: 'typing_stop', room: roomId });
  }

  // Message handler registration
  onMessage(type: string, handler: (data: any) => void): () => void {
    this.messageHandlers.set(type, handler);

    // Return unsubscribe function
    return () => this.messageHandlers.delete(type);
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.connectionStateSignal.set('connected');
      this.reconnectAttemptsSignal.set(0);
      this.startHeartbeat();

      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      this.connectionStateSignal.set('disconnected');
      this.clearTimers();

      console.log('WebSocket disconnected:', event.code, event.reason);

      // Attempt reconnection if not intentional disconnect
      if (event.code !== 1000 && this.authService.isAuthenticated()) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      this.handleConnectionError('WebSocket connection error');
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Add to message history
    this.messagesSignal.update((messages) => [...messages.slice(-99), message]);

    // Call registered handler
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }

    // Default handlers
    this.handleDefaultMessages(message);
  }

  private handleDefaultMessages(message: WebSocketMessage): void {
    switch (message.type) {
      case 'auth:success':
        console.log('WebSocket authenticated');
        break;

      case 'auth:error':
        this.handleConnectionError('Authentication failed');
        break;

      case 'notification':
        this.handleNotification(message.data);
        break;

      case 'system_announcement':
        this.handleSystemAnnouncement(message.data);
        break;

      case 'data_update':
        this.handleDataUpdate(message.data);
        break;
    }
  }

  private handleNotification(notification: UserNotification): void {
    // Show notification in UI
    const notificationService = inject(NotificationService);
    notificationService.show({
      type: notification.type,
      title: notification.title,
      message: notification.message,
    });
  }

  private handleSystemAnnouncement(announcement: SystemAnnouncement): void {
    // Show system announcement
    console.log('System announcement:', announcement);
  }

  private handleDataUpdate(update: any): void {
    // Emit data update event for services to handle
    const eventBus = inject(EventBusService);
    eventBus.emit('data:update', update);
  }

  private attemptReconnect(): void {
    const attempts = this.reconnectAttempts();

    if (attempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.handleConnectionError('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttemptsSignal.update((count) => count + 1);

    const delay = this.RECONNECT_DELAY * Math.pow(2, attempts); // Exponential backoff
    this.reconnectTimer = window.setTimeout(() => {
      console.log(`Attempting WebSocket reconnection (${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
      this.connect();
    }, delay);
  }

  private handleConnectionError(error: string): void {
    this.connectionStateSignal.set('error');
    this.lastErrorSignal.set(error);
    console.error('WebSocket error:', error);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected() && this.socket) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }
}

interface WebSocketMessage {
  type: string;
  data?: any;
  room?: string;
}
```

## Real-time Features Implementation

### Live User Presence

```typescript
// Real-time user presence tracking
@Injectable({ providedIn: 'root' })
export class PresenceService {
  private webSocketService = inject(WebSocketService);

  // Presence state signals
  private onlineUsersSignal = signal<Map<string, UserPresence>>(new Map());
  private currentUserPresenceSignal = signal<UserPresence | null>(null);

  readonly onlineUsers = this.onlineUsersSignal.asReadonly();
  readonly currentUserPresence = this.currentUserPresenceSignal.asReadonly();

  // Computed presence data
  readonly onlineCount = computed(() => this.onlineUsers().size);
  readonly onlineUsersList = computed(() => Array.from(this.onlineUsers().values()));

  constructor() {
    // Handle presence updates from WebSocket
    this.webSocketService.onMessage('user_presence', (data) => {
      this.updateUserPresence(data.userId, data.presence);
    });

    this.webSocketService.onMessage('user_joined', (data) => {
      this.addOnlineUser(data.userId, data.presence);
    });

    this.webSocketService.onMessage('user_left', (data) => {
      this.removeOnlineUser(data.userId);
    });

    // Send presence updates
    this.setupPresenceUpdates();
  }

  private setupPresenceUpdates(): void {
    // Send presence update every 30 seconds
    setInterval(() => {
      if (this.webSocketService.isConnected()) {
        this.sendPresenceUpdate();
      }
    }, 30000);

    // Send presence on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.sendPresenceUpdate();
      }
    });
  }

  private sendPresenceUpdate(): void {
    const presence: UserPresence = {
      status: document.hidden ? 'away' : 'online',
      lastSeen: new Date(),
      currentPage: window.location.pathname,
    };

    this.currentUserPresenceSignal.set(presence);

    this.webSocketService.send({
      type: 'presence_update',
      data: { presence },
    });
  }

  private updateUserPresence(userId: string, presence: UserPresence): void {
    this.onlineUsersSignal.update((users) => {
      const newMap = new Map(users);
      newMap.set(userId, presence);
      return newMap;
    });
  }

  private addOnlineUser(userId: string, presence: UserPresence): void {
    this.updateUserPresence(userId, presence);
  }

  private removeOnlineUser(userId: string): void {
    this.onlineUsersSignal.update((users) => {
      const newMap = new Map(users);
      newMap.delete(userId);
      return newMap;
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers().has(userId);
  }

  getUserPresence(userId: string): UserPresence | null {
    return this.onlineUsers().get(userId) || null;
  }
}

interface UserPresence {
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
  currentPage?: string;
}
```

### Live Data Synchronization

```typescript
// Service for live data updates
@Injectable({ providedIn: 'root' })
export class LiveDataService {
  private webSocketService = inject(WebSocketService);
  private eventBus = inject(EventBusService);

  constructor() {
    // Handle data updates from WebSocket
    this.webSocketService.onMessage('data_update', (update) => {
      this.handleDataUpdate(update);
    });
  }

  private handleDataUpdate(update: DataUpdate): void {
    const { entity, operation, payload } = update;

    // Emit event for specific services to handle
    this.eventBus.emit(`${entity}:${operation}`, payload);

    // Generic data update event
    this.eventBus.emit('data:update', update);
  }

  // Subscribe to specific entity updates
  onEntityUpdate<T>(entity: string, callback: (operation: string, data: T) => void): () => void {
    const handler = (data: T) => callback(entity, data);

    return this.eventBus.on(`${entity}:update`, handler);
  }

  // Subscribe to all data updates
  onDataUpdate(callback: (update: DataUpdate) => void): () => void {
    return this.eventBus.on('data:update', callback);
  }
}

interface DataUpdate {
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: Date;
}

// Usage in user service for live updates
@Injectable({ providedIn: 'root' })
export class UserService {
  private liveDataService = inject(LiveDataService);

  constructor() {
    // Listen for user data updates
    this.liveDataService.onEntityUpdate<User>('users', (operation, user) => {
      switch (operation) {
        case 'create':
          this.addUser(user);
          break;
        case 'update':
          this.updateUser(user.id, user);
          break;
        case 'delete':
          this.removeUser(user.id);
          break;
      }
    });
  }
}
```

### Real-time Chat Component

```typescript
@Component({
  selector: 'app-chat',
  standalone: true,
  template: `
    <div class="flex flex-col h-96 bg-white border border-gray-200 rounded-lg">
      <!-- Chat Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 class="font-medium">{{ roomName() }}</h3>
        <div class="flex items-center text-sm text-gray-500">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {{ onlineCount() }} online
        </div>
      </div>

      <!-- Messages -->
      <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3">
        @for (message of messages(); track message.id) {
          <div [class]="getMessageClasses(message)">
            @if (!isOwnMessage(message)) {
              <div class="flex items-center mb-1">
                <img [src]="message.user.avatar" class="w-6 h-6 rounded-full mr-2" />
                <span class="text-sm font-medium text-gray-700">{{ message.user.name }}</span>
                <span class="text-xs text-gray-500 ml-2">{{ formatTime(message.createdAt) }}</span>
              </div>
            }

            <div [class]="getMessageBubbleClasses(message)">
              {{ message.content }}
            </div>

            @if (isOwnMessage(message)) {
              <div class="text-xs text-gray-500 text-right mt-1">
                {{ formatTime(message.createdAt) }}
                @if (message.status === 'sent') {
                  <mat-icon class="text-blue-500 text-xs ml-1">check</mat-icon>
                } @else if (message.status === 'delivered') {
                  <mat-icon class="text-green-500 text-xs ml-1">done_all</mat-icon>
                }
              </div>
            }
          </div>
        }

        <!-- Typing indicators -->
        @for (user of typingUsers(); track user.id) {
          <div class="flex items-center text-sm text-gray-500">
            <img [src]="user.avatar" class="w-6 h-6 rounded-full mr-2" />
            <span>{{ user.name }} is typing...</span>
            <div class="flex space-x-1 ml-2">
              <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Message Input -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex space-x-2">
          <input #messageInput [(ngModel)]="newMessage" (keydown)="onKeyDown($event)" (input)="onTyping()" placeholder="Type a message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" />
          <button (click)="sendMessage()" [disabled]="!newMessage.trim() || !webSocketService.isConnected()" class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;
  @Input() roomName = 'Chat';

  webSocketService = inject(WebSocketService);
  authService = inject(AuthService);

  // Chat state signals
  private messagesSignal = signal<ChatMessage[]>([]);
  private typingUsersSignal = signal<User[]>([]);
  private onlineCountSignal = signal(0);

  readonly messages = this.messagesSignal.asReadonly();
  readonly typingUsers = this.typingUsersSignal.asReadonly();
  readonly onlineCount = this.onlineCountSignal.asReadonly();

  // Form state
  newMessage = '';
  private typingTimer?: number;
  private isTyping = false;

  // Unsubscribe functions
  private unsubscribeFunctions: (() => void)[] = [];

  ngOnInit() {
    // Join chat room
    this.webSocketService.joinRoom(this.roomId);

    // Setup message handlers
    this.setupMessageHandlers();

    // Load message history
    this.loadMessageHistory();
  }

  ngOnDestroy() {
    // Leave room and cleanup
    this.webSocketService.leaveRoom(this.roomId);
    this.unsubscribeFunctions.forEach((fn) => fn());

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  private setupMessageHandlers(): void {
    // Chat message handler
    this.unsubscribeFunctions.push(
      this.webSocketService.onMessage('chat_message', (message) => {
        this.addMessage(message);
        this.scrollToBottom();
      }),
    );

    // Typing indicators
    this.unsubscribeFunctions.push(
      this.webSocketService.onMessage('user_typing_start', (data) => {
        this.addTypingUser(data.userId);
      }),
    );

    this.unsubscribeFunctions.push(
      this.webSocketService.onMessage('user_typing_stop', (data) => {
        this.removeTypingUser(data.userId);
      }),
    );

    // Room info updates
    this.unsubscribeFunctions.push(
      this.webSocketService.onMessage('room_info', (data) => {
        this.onlineCountSignal.set(data.onlineCount);
      }),
    );
  }

  private async loadMessageHistory(): Promise<void> {
    try {
      const response = await fetch(`/api/chat/rooms/${this.roomId}/messages?limit=50`);
      const { data } = await response.json();
      this.messagesSignal.set(data.reverse());
      this.scrollToBottom();
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content || !this.webSocketService.isConnected()) return;

    this.webSocketService.sendChatMessage(this.roomId, content);
    this.newMessage = '';
    this.stopTyping();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.webSocketService.startTyping(this.roomId);
    }

    // Reset typing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = window.setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  private stopTyping(): void {
    if (this.isTyping) {
      this.isTyping = false;
      this.webSocketService.stopTyping(this.roomId);
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = undefined;
    }
  }

  private addMessage(message: ChatMessage): void {
    this.messagesSignal.update((messages) => [...messages, message]);
  }

  private addTypingUser(userId: string): void {
    // Add typing user logic
  }

  private removeTypingUser(userId: string): void {
    // Remove typing user logic
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.user.id === this.authService.currentUser()?.id;
  }

  getMessageClasses(message: ChatMessage): string {
    return this.isOwnMessage(message) ? 'flex justify-end' : 'flex justify-start';
  }

  getMessageBubbleClasses(message: ChatMessage): string {
    const baseClasses = 'max-w-xs lg:max-w-md px-3 py-2 rounded-lg';
    return this.isOwnMessage(message) ? `${baseClasses} bg-primary-600 text-white` : `${baseClasses} bg-gray-100 text-gray-900`;
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('#messagesContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}

interface ChatMessage {
  id: string;
  content: string;
  user: User;
  roomId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'error';
}
```

### Live Notifications Component

```typescript
@Component({
  selector: 'app-live-notifications',
  standalone: true,
  template: `
    <!-- Notification Bell -->
    <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="relative">
      <mat-icon>notifications</mat-icon>

      @if (unreadCount() > 0) {
        <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {{ unreadCount() > 99 ? '99+' : unreadCount() }}
        </span>
      }
    </button>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="w-80">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="font-medium">Notifications</h3>
          @if (unreadCount() > 0) {
            <button (click)="markAllAsRead()" class="text-sm text-primary-600 hover:text-primary-700">Mark all as read</button>
          }
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        @if (notifications().length === 0) {
          <div class="p-8 text-center text-gray-500">
            <mat-icon class="text-4xl mb-2">notifications_none</mat-icon>
            <p>No notifications</p>
          </div>
        } @else {
          @for (notification of notifications(); track notification.id) {
            <div class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" [class.bg-blue-50]="!notification.read" (click)="markAsRead(notification)">
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                  <div [class]="getNotificationIconClasses(notification.type)">
                    <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-2">{{ formatTime(notification.createdAt) }}</p>
                </div>

                @if (!notification.read) {
                  <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                }
              </div>

              @if (notification.actionUrl) {
                <div class="mt-2 ml-10">
                  <button (click)="handleNotificationAction(notification)" class="text-sm text-primary-600 hover:text-primary-700">
                    {{ notification.actionText || 'View' }}
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>

      @if (notifications().length > 0) {
        <div class="p-4 border-t border-gray-200">
          <a routerLink="/notifications" class="text-sm text-primary-600 hover:text-primary-700"> View all notifications </a>
        </div>
      }
    </mat-menu>
  `,
})
export class LiveNotificationsComponent implements OnInit, OnDestroy {
  private webSocketService = inject(WebSocketService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Notification state signals
  private notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  private unsubscribeFunctions: (() => void)[] = [];

  ngOnInit() {
    // Load recent notifications
    this.loadNotifications();

    // Listen for new notifications via WebSocket
    this.unsubscribeFunctions.push(
      this.webSocketService.onMessage('notification', (notification) => {
        this.addNotification(notification);

        // Show toast notification
        this.notificationService.show({
          type: notification.type,
          title: notification.title,
          message: notification.message,
        });
      }),
    );
  }

  ngOnDestroy() {
    this.unsubscribeFunctions.forEach((fn) => fn());
  }

  private async loadNotifications(): Promise<void> {
    try {
      const response = await fetch('/api/notifications?limit=20');
      const { data } = await response.json();
      this.notificationsSignal.set(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private addNotification(notification: Notification): void {
    this.notificationsSignal.update(
      (notifications) => [notification, ...notifications].slice(0, 50), // Keep last 50
    );
  }

  async markAsRead(notification: Notification): Promise<void> {
    if (notification.read) return;

    try {
      await fetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH' });

      this.notificationsSignal.update((notifications) => notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));

      // Handle action if exists
      if (notification.actionUrl) {
        this.router.navigate([notification.actionUrl]);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PATCH' });

      this.notificationsSignal.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  handleNotificationAction(notification: Notification): void {
    this.markAsRead(notification);
  }

  getNotificationIconClasses(type: string): string {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center';
    const typeClasses = {
      success: 'bg-green-100 text-green-600',
      error: 'bg-red-100 text-red-600',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-blue-100 text-blue-600',
    };
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  }

  getNotificationIcon(type: string): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] || 'info';
  }

  formatTime(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notificationDate.toLocaleDateString();
  }
}
```

## Database Schema for Real-time Features

### WebSocket Sessions & Chat Tables

```sql
-- WebSocket connection tracking
CREATE TABLE websocket_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address INET,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat rooms
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'group', -- group, direct, support
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Chat room members
CREATE TABLE chat_room_members (
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, system
  metadata JSONB DEFAULT '{}',
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Real-time notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- info, warning, error, success
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System announcements
CREATE TABLE system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- maintenance, feature, warning
  target_roles JSONB DEFAULT '[]', -- Array of role names, empty = all
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User presence tracking
CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline', -- online, away, busy, offline
  current_page VARCHAR(500),
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_chat_messages_room_time ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_websocket_connections_user ON websocket_connections(user_id, connected_at);
CREATE INDEX idx_user_presence_status ON user_presence(status, last_seen);
```

## Advanced WebSocket Features

### Room-based Broadcasting System

```typescript
// apps/api/src/modules/websocket/room.service.ts
export class RoomService {
  constructor(
    private fastify: FastifyInstance,
    private knex: any,
  ) {}

  async createRoom(data: CreateRoomRequest, createdBy: string): Promise<ChatRoom> {
    const room = await this.knex('chat_rooms')
      .insert({
        id: this.fastify.generateId(),
        name: data.name,
        type: data.type,
        created_by: createdBy,
        settings: JSON.stringify(data.settings || {}),
      })
      .returning('*');

    // Add creator as admin
    await this.addMember(room[0].id, createdBy, 'admin');

    // Broadcast room creation
    this.fastify.wsBroadcastToAll({
      type: 'room_created',
      data: room[0],
    });

    return room[0];
  }

  async addMember(roomId: string, userId: string, role: string = 'member'): Promise<void> {
    await this.knex('chat_room_members').insert({
      room_id: roomId,
      user_id: userId,
      role,
      joined_at: new Date(),
    });

    // Notify room members
    this.fastify.wsBroadcastToRoom(roomId, {
      type: 'member_joined',
      data: { roomId, userId, role },
    });
  }

  async removeMember(roomId: string, userId: string): Promise<void> {
    await this.knex('chat_room_members').where({ room_id: roomId, user_id: userId }).delete();

    // Notify room members
    this.fastify.wsBroadcastToRoom(roomId, {
      type: 'member_left',
      data: { roomId, userId },
    });
  }

  async sendMessage(roomId: string, userId: string, content: string): Promise<ChatMessage> {
    const message = await this.knex('chat_messages')
      .insert({
        id: this.fastify.generateId(),
        room_id: roomId,
        user_id: userId,
        content,
        created_at: new Date(),
      })
      .returning('*');

    // Get user info for broadcast
    const user = await this.knex('users').select('id', 'first_name', 'last_name', 'avatar').where('id', userId).first();

    const messageWithUser = {
      ...message[0],
      user,
    };

    // Broadcast to room
    this.fastify.wsBroadcastToRoom(roomId, {
      type: 'chat_message',
      data: messageWithUser,
    });

    return messageWithUser;
  }
}
```

### Event Bus for Cross-Component Communication

```typescript
// libs/realtime/src/lib/services/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSubjects = new Map<string, Subject<any>>();

  emit<T>(eventType: string, data: T): void {
    if (!this.eventSubjects.has(eventType)) {
      this.eventSubjects.set(eventType, new Subject<T>());
    }

    this.eventSubjects.get(eventType)!.next(data);
  }

  on<T>(eventType: string, callback: (data: T) => void): () => void {
    if (!this.eventSubjects.has(eventType)) {
      this.eventSubjects.set(eventType, new Subject<T>());
    }

    const subscription = this.eventSubjects.get(eventType)!.subscribe(callback);

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  }

  // Convert to signal for reactive use
  toSignal<T>(eventType: string, initialValue: T): Signal<T> {
    if (!this.eventSubjects.has(eventType)) {
      this.eventSubjects.set(eventType, new Subject<T>());
    }

    return toSignal(this.eventSubjects.get(eventType)!, { initialValue });
  }
}
```

## Production WebSocket Configuration

### Scaling WebSocket with Redis Adapter

```typescript
// apps/api/src/plugins/websocket-cluster.plugin.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export default fp(async function websocketClusterPlugin(fastify: FastifyInstance) {
  if (process.env.NODE_ENV === 'production') {
    // Redis clients for pub/sub
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Setup Redis adapter for clustering
    const io = fastify.io;
    io.adapter(createAdapter(pubClient, subClient));

    fastify.log.info('WebSocket clustering enabled with Redis');
  }
});
```

### Load Balancer Configuration for WebSocket

```nginx
# nginx/websocket.conf
upstream websocket_backend {
    ip_hash; # Sticky sessions for WebSocket
    server api-1:3000;
    server api-2:3000;
    server api-3:3000;
}

server {
    listen 80;
    server_name ws.yourdomain.com;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket specific settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60;
    }
}
```

### Docker Configuration for WebSocket

```yaml
# docker-compose.yml
services:
  api:
    build: ./apps/api
    environment:
      - REDIS_URL=redis://redis:6379
      - WEBSOCKET_ENABLED=true
    ports:
      - '3000:3000'
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/websocket.conf:/etc/nginx/conf.d/default.conf
    ports:
      - '80:80'
    depends_on:
      - api
```

## Testing Real-time Features

### WebSocket Testing

```typescript
// Integration test for WebSocket
describe('WebSocket Integration', () => {
  let app: FastifyInstance;
  let ws: WebSocket;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    return new Promise((resolve) => {
      ws = new WebSocket(`ws://localhost:${app.server.address().port}/ws`);
      ws.onopen = () => resolve();
    });
  });

  afterEach(() => {
    ws.close();
  });

  test('should authenticate via WebSocket', (done) => {
    const token = generateTestToken();

    ws.send(
      JSON.stringify({
        type: 'auth',
        token,
      }),
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      expect(message.type).toBe('auth:success');
      done();
    };
  });

  test('should join and leave rooms', (done) => {
    let messagesReceived = 0;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      messagesReceived++;

      if (messagesReceived === 1) {
        expect(message.type).toBe('room_joined');
        // Leave room
        ws.send(JSON.stringify({ type: 'leave_room', room: 'test-room' }));
      } else if (messagesReceived === 2) {
        expect(message.type).toBe('room_left');
        done();
      }
    };

    // Join room
    ws.send(JSON.stringify({ type: 'join_room', room: 'test-room' }));
  });
});
```

### E2E Real-time Testing

```typescript
// e2e/realtime.spec.ts
test('should receive real-time notifications', async ({ page, context }) => {
  // Open second tab for admin actions
  const adminPage = await context.newPage();

  // User page - setup notification listener
  await page.goto('/dashboard');

  // Admin page - send notification
  await adminPage.goto('/admin/notifications');
  await adminPage.fill('[data-testid="notification-title"]', 'Test Notification');
  await adminPage.fill('[data-testid="notification-message"]', 'This is a test');
  await adminPage.selectOption('[data-testid="target-user"]', 'user-123');
  await adminPage.click('[data-testid="send-notification"]');

  // Verify notification appears in real-time on user page
  await expect(page.getByTestId('notification-toast')).toBeVisible();
  await expect(page.getByText('Test Notification')).toBeVisible();

  // Check notification bell badge
  await expect(page.getByTestId('notification-badge')).toHaveText('1');
});

test('should sync data in real-time', async ({ page, context }) => {
  const userPage = await context.newPage();
  const adminPage = await context.newPage();

  // Both pages open user list
  await userPage.goto('/users');
  await adminPage.goto('/admin/users');

  // Admin creates new user
  await adminPage.click('[data-testid="add-user-button"]');
  await adminPage.fill('[name="firstName"]', 'John');
  await adminPage.fill('[name="lastName"]', 'Doe');
  await adminPage.fill('[name="email"]', 'john@test.com');
  await adminPage.click('[data-testid="save-user"]');

  // Verify new user appears in user page automatically
  await expect(userPage.getByText('John Doe')).toBeVisible({ timeout: 5000 });
});
```

## WebSocket Security

### Authentication & Authorization

```typescript
// WebSocket authentication middleware
function authenticateWebSocket(fastify: FastifyInstance) {
  return async (connection: any, request: any) => {
    const token = request.query.token || request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      connection.socket.close(4001, 'Authentication required');
      return false;
    }

    try {
      const decoded = fastify.jwt.verify(token) as any;
      connection.user = decoded;
      return true;
    } catch (error) {
      connection.socket.close(4001, 'Invalid token');
      return false;
    }
  };
}

// Rate limiting for WebSocket messages
class WebSocketRateLimit {
  private clientLimits = new Map<string, { count: number; resetTime: number }>();

  checkLimit(clientId: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const limit = this.clientLimits.get(clientId);

    if (!limit || now > limit.resetTime) {
      this.clientLimits.set(clientId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }
}
```

### Message Validation

```typescript
// WebSocket message validation
import { z } from 'zod';

const messageSchemas = {
  join_room: z.object({
    type: z.literal('join_room'),
    room: z.string().min(1).max(100),
  }),

  chat_message: z.object({
    type: z.literal('chat_message'),
    data: z.object({
      room: z.string(),
      content: z.string().min(1).max(1000),
    }),
  }),

  typing_start: z.object({
    type: z.literal('typing_start'),
    room: z.string(),
  }),
};

function validateMessage(message: any): { valid: boolean; error?: string } {
  try {
    const schema = messageSchemas[message.type];
    if (!schema) {
      return { valid: false, error: 'Unknown message type' };
    }

    schema.parse(message);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
```

## Health Monitoring & Metrics

### WebSocket Health Dashboard

```typescript
// WebSocket monitoring service
@Injectable()
export class WebSocketMonitoringService {
  private metricsSignal = signal<WebSocketMetrics>({
    totalConnections: 0,
    activeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    roomsActive: 0,
    errors: 0,
    averageLatency: 0,
  });

  readonly metrics = this.metricsSignal.asReadonly();

  // Track metrics
  recordConnection() {
    this.metricsSignal.update((m) => ({
      ...m,
      totalConnections: m.totalConnections + 1,
      activeConnections: m.activeConnections + 1,
    }));
  }

  recordDisconnection() {
    this.metricsSignal.update((m) => ({
      ...m,
      activeConnections: Math.max(0, m.activeConnections - 1),
    }));
  }

  recordMessage(type: 'sent' | 'received') {
    this.metricsSignal.update((m) => ({
      ...m,
      [type === 'sent' ? 'messagesSent' : 'messagesReceived']: m[type === 'sent' ? 'messagesSent' : 'messagesReceived'] + 1,
    }));
  }

  // Health check endpoint
  async getHealthStatus(): Promise<WebSocketHealth> {
    const metrics = this.metrics();

    return {
      status: metrics.activeConnections > 0 ? 'healthy' : 'idle',
      metrics,
      timestamp: new Date(),
    };
  }
}

interface WebSocketMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  roomsActive: number;
  errors: number;
  averageLatency: number;
}

interface WebSocketHealth {
  status: 'healthy' | 'degraded' | 'idle';
  metrics: WebSocketMetrics;
  timestamp: Date;
}
```

## Best Practices

### WebSocket Development

1. **Authentication**: Always authenticate WebSocket connections
2. **Rate Limiting**: Prevent message flooding
3. **Validation**: Validate all incoming messages
4. **Room Management**: Organize connections into logical groups
5. **Error Handling**: Graceful handling of connection errors
6. **Heartbeat**: Monitor connection health
7. **Cleanup**: Properly cleanup on disconnect
8. **Scaling**: Use Redis adapter for horizontal scaling

### Performance Optimization

1. **Connection Pooling**: Reuse connections when possible
2. **Message Batching**: Batch multiple updates into single message
3. **Compression**: Enable WebSocket compression
4. **Memory Management**: Clean up old messages and connections
5. **Load Balancing**: Use sticky sessions for WebSocket
6. **Monitoring**: Track connection metrics and performance

### Security Considerations

1. **Token Validation**: Verify JWT tokens on connection
2. **CORS Configuration**: Properly configure WebSocket CORS
3. **Rate Limiting**: Implement per-client rate limiting
4. **Input Validation**: Validate all message content
5. **Room Authorization**: Check user permissions for room access
6. **Message Filtering**: Filter sensitive data in broadcasts
7. **Audit Logging**: Log important WebSocket events
