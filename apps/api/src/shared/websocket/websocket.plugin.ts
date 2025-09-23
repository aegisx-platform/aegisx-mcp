import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Server } from 'socket.io';
import { WebSocketManager } from './websocket.gateway';
import { EventService } from './event.service';
import { RealtimeEventBus } from './realtime-event-bus';
import { SocketIOTransport } from './socket-io-transport';
import type { EventBusConfig, TransportConfig } from './realtime-event-bus';

export interface WebSocketPluginOptions extends FastifyPluginOptions {
  eventBus?: EventBusConfig;
  transport?: TransportConfig;
}

async function websocketPlugin(
  fastify: FastifyInstance,
  opts: WebSocketPluginOptions = {},
) {
  // Configure EventBus
  const eventBusConfig: EventBusConfig = {
    enableRedis: process.env.NODE_ENV === 'production' || process.env.ENABLE_REDIS === 'true',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    },
    instanceId: process.env.INSTANCE_ID || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wildcard: true,
    delimiter: '.',
    maxListeners: 50,
    ...opts.eventBus
  };

  // Configure Transport
  const transportConfig: TransportConfig = {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com', 'https://admin.yourdomain.com'])
        : true,
      credentials: true
    },
    redis: eventBusConfig.enableRedis ? eventBusConfig.redis : undefined,
    enableCompression: true,
    maxConnections: 1000,
    pingTimeout: 60000,
    pingInterval: 25000,
    ...opts.transport
  };

  // Create RealtimeEventBus
  const eventBus = new RealtimeEventBus(eventBusConfig);
  await eventBus.initializeRedis();

  // Create Socket.IO Transport
  const transport = new SocketIOTransport(transportConfig);
  await transport.initialize(fastify);

  // Connect EventBus with Transport
  eventBus.setTransport(transport);

  // Create enhanced WebSocket manager with EventBus integration
  const io = transport.getInstance();
  const websocketManager = new WebSocketManager(fastify, io);
  
  // Connect EventBus to WebSocketManager for auto-forwarding
  websocketManager.setEventBus(eventBus);

  // Create enhanced event service
  const eventService = new EventService(websocketManager, eventBus);

  // Decorate Fastify instance with WebSocket services
  fastify.decorate('websocketManager', websocketManager);
  fastify.decorate('eventService', eventService);
  fastify.decorate('eventBus', eventBus);
  fastify.decorate('wsTransport', transport);

  // Add hook to set request context for EventService (only for WebSocket endpoints)
  fastify.addHook('preHandler', async (request) => {
    // Only set context for WebSocket endpoints
    if (
      request.url.startsWith('/api/websocket/') ||
      request.url.startsWith('/api/ws/')
    ) {
      eventService.setRequestContext(request);
    }
  });

  // Add WebSocket health check endpoint (separate from Socket.IO path)
  fastify.get('/api/websocket/health', async () => {
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

  // Add enhanced WebSocket stats endpoint
  fastify.get('/api/websocket/stats', async () => {
    const websocketStats = websocketManager.getStats();
    const eventBusStats = eventBus.getStatistics();
    
    return {
      success: true,
      data: {
        websocket: websocketStats,
        eventBus: eventBusStats,
        transport: {
          type: 'socket.io',
          connections: transport.getConnectionCount(),
          redis: eventBusConfig.enableRedis
        }
      },
    };
  });

  // Add detailed health metrics endpoint
  fastify.get('/api/websocket/health-detailed', async () => {
    return {
      success: true,
      data: websocketManager.getHealthMetrics(),
    };
  });

  // Add queue status endpoint
  fastify.get('/api/websocket/queue-status', async () => {
    return {
      success: true,
      data: websocketManager.getQueueStatus(),
    };
  });

  // Add connection cleanup endpoint (admin only)
  fastify.post('/api/websocket/cleanup', async () => {
    const cleaned = await websocketManager.forceCleanupInactiveConnections();
    return {
      success: true,
      data: {
        message: `Cleaned up ${cleaned} inactive connections`,
        cleaned,
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Add event system monitoring endpoint
  fastify.get('/api/events/stats', async () => {
    return {
      success: true,
      data: eventBus.getStatistics(),
    };
  });

  // Add real-time metrics endpoint with streaming
  fastify.get('/api/websocket/metrics-stream', async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const sendMetrics = () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        connections: websocketManager.getStats().connections,
        queues: websocketManager.getQueueStatus(),
        memory: process.memoryUsage(),
      };
      
      reply.raw.write(`data: ${JSON.stringify(metrics)}\n\n`);
    };

    // Send initial metrics
    sendMetrics();

    // Send metrics every 5 seconds
    const interval = setInterval(sendMetrics, 5000);

    // Cleanup on client disconnect
    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  // Add graceful shutdown handler
  fastify.addHook('onClose', async () => {
    console.log('🔌 Closing WebSocket connections...');
    await eventBus.close();
    await transport.close();
    console.log('🔌 WebSocket plugin closed');
  });

  console.log('🔌 WebSocket plugin initialized with EventBus and Redis support');
  console.log(`🔌 Instance ID: ${eventBusConfig.instanceId}`);
  console.log(`🔌 Redis enabled: ${eventBusConfig.enableRedis}`);
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
    eventBus: RealtimeEventBus;
    wsTransport: SocketIOTransport;
  }
}
