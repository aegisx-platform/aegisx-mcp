import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Server } from 'socket.io';
import { WebSocketManager } from './websocket.gateway';
import { EventService } from './event.service';

async function websocketPlugin(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  // Create Socket.IO server
  const io = new Server(fastify.server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com', 'https://admin.yourdomain.com']
        : true,
      credentials: true,
    },
    path: '/api/ws/',
    transports: ['websocket', 'polling'],
  });

  // Create WebSocket manager
  const websocketManager = new WebSocketManager(fastify, io);
  
  // Create event service
  const eventService = new EventService(websocketManager);

  // Decorate Fastify instance with WebSocket services
  fastify.decorate('websocketManager', websocketManager);
  fastify.decorate('eventService', eventService);

  // Add hook to set request context for EventService
  fastify.addHook('onRequest', async (request) => {
    eventService.setRequestContext(request);
  });

  // Add WebSocket health check endpoint
  fastify.get('/api/ws/health', async () => {
    const stats = websocketManager.getStats();
    return {
      success: true,
      data: {
        status: 'healthy',
        ...stats,
        uptime: process.uptime(),
      },
    };
  });

  // Add WebSocket stats endpoint
  fastify.get('/api/ws/stats', async () => {
    const stats = websocketManager.getStats();
    return {
      success: true,
      data: stats,
    };
  });

  console.log('🔌 WebSocket plugin initialized');
}

export default fp(websocketPlugin, {
  name: 'websocket-plugin',
  dependencies: ['response-handler-plugin'],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    websocketManager: WebSocketManager;
    eventService: EventService;
  }
}