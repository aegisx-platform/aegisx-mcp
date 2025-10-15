import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
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
    enableRedis:
      process.env.NODE_ENV === 'production' ||
      process.env.ENABLE_REDIS === 'true',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    },
    instanceId:
      process.env.INSTANCE_ID ||
      `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    wildcard: true,
    delimiter: '.',
    maxListeners: 50,
    ...opts.eventBus,
  };

  // Configure Transport
  const transportConfig: TransportConfig = {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.CORS_ORIGINS?.split(',') || [
              'https://yourdomain.com',
              'https://admin.yourdomain.com',
            ]
          : true,
      credentials: true,
    },
    redis: eventBusConfig.enableRedis ? eventBusConfig.redis : undefined,
    enableCompression: true,
    maxConnections: 1000,
    pingTimeout: 60000,
    pingInterval: 25000,
    ...opts.transport,
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
      request.url.includes('/websocket/') ||
      request.url.includes('/ws/') ||
      request.url.includes('/events/')
    ) {
      eventService.setRequestContext(request);
    }
  });

  // Add WebSocket health check endpoint (separate from Socket.IO path)
  fastify.get(
    '/websocket/health',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'WebSocket Health Check',
        description: 'Get WebSocket service health status and basic statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  connections: { type: 'number' },
                  uptime: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const stats = websocketManager.getStats();
      return {
        success: true,
        data: {
          status: 'healthy',
          ...stats,
          uptime: process.uptime(),
        },
      };
    },
  );

  // Add enhanced WebSocket stats endpoint
  fastify.get(
    '/websocket/stats',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'WebSocket Statistics',
        description: 'Get comprehensive WebSocket and EventBus statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  websocket: { type: 'object' },
                  eventBus: { type: 'object' },
                  transport: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async () => {
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
            redis: eventBusConfig.enableRedis,
          },
        },
      };
    },
  );

  // Add detailed health metrics endpoint
  fastify.get(
    '/websocket/health-detailed',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'Detailed Health Metrics',
        description:
          'Get detailed WebSocket health metrics including performance data',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async () => {
      return {
        success: true,
        data: websocketManager.getHealthMetrics(),
      };
    },
  );

  // Add queue status endpoint
  fastify.get(
    '/websocket/queue-status',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'Queue Status',
        description: 'Get current status of WebSocket message queues',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async () => {
      return {
        success: true,
        data: websocketManager.getQueueStatus(),
      };
    },
  );

  // Add connection cleanup endpoint (admin only)
  fastify.post(
    '/websocket/cleanup',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'Cleanup Inactive Connections',
        description:
          'Force cleanup of inactive WebSocket connections (admin only)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  cleaned: { type: 'number' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const cleaned = await websocketManager.forceCleanupInactiveConnections();
      return {
        success: true,
        data: {
          message: `Cleaned up ${cleaned} inactive connections`,
          cleaned,
          timestamp: new Date().toISOString(),
        },
      };
    },
  );

  // Add event system monitoring endpoint
  fastify.get(
    '/events/stats',
    {
      schema: {
        tags: ['Events'],
        summary: 'Event System Statistics',
        description: 'Get EventBus statistics and performance metrics',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async () => {
      return {
        success: true,
        data: eventBus.getStatistics(),
      };
    },
  );

  // Add real-time metrics endpoint with streaming
  fastify.get(
    '/websocket/metrics-stream',
    {
      schema: {
        tags: ['WebSocket'],
        summary: 'Real-time Metrics Stream',
        description: 'Server-Sent Events stream of real-time WebSocket metrics',
        response: {
          200: {
            type: 'string',
            description: 'Server-Sent Events stream',
          },
        },
      },
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
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
    },
  );

  // Add graceful shutdown handler
  fastify.addHook('onClose', async () => {
    console.log('🔌 Closing WebSocket connections...');
    await eventBus.close();
    await transport.close();
    console.log('🔌 WebSocket plugin closed');
  });

  // WebSocket plugin initialized (silent)
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
