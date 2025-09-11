import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

declare module 'fastify' {
  interface FastifyInstance {
    monitoring: {
      httpRequestsTotal: Counter<string>;
      httpRequestDuration: Histogram<string>;
      httpRequestsInProgress: Gauge<string>;
      dbConnectionsActive: Gauge<string>;
      redisConnectionsActive: Gauge<string>;
      errorRate: Counter<string>;
      memoryUsage: Gauge<string>;
      cpuUsage: Gauge<string>;
    };
  }
}

interface MonitoringOptions {
  enableDefaultMetrics?: boolean;
  metricsPrefix?: string;
  enableResourceMonitoring?: boolean;
}

async function monitoringPlugin(
  fastify: FastifyInstance,
  options: MonitoringOptions = {},
) {
  const prefix = options.metricsPrefix || 'aegisx_api_';

  // Clear existing metrics to avoid conflicts
  register.clear();

  // Enable default system metrics
  if (options.enableDefaultMetrics !== false) {
    collectDefaultMetrics({
      prefix,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });
  }

  // HTTP Request metrics
  const httpRequestsTotal = new Counter({
    name: `${prefix}http_requests_total`,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  const httpRequestDuration = new Histogram({
    name: `${prefix}http_request_duration_seconds`,
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  });

  const httpRequestsInProgress = new Gauge({
    name: `${prefix}http_requests_in_progress`,
    help: 'Number of HTTP requests currently in progress',
    labelNames: ['method'],
  });

  // Database connection metrics
  const dbConnectionsActive = new Gauge({
    name: `${prefix}db_connections_active`,
    help: 'Number of active database connections',
  });

  // Redis connection metrics
  const redisConnectionsActive = new Gauge({
    name: `${prefix}redis_connections_active`,
    help: 'Number of active Redis connections',
  });

  // Error metrics
  const errorRate = new Counter({
    name: `${prefix}errors_total`,
    help: 'Total number of errors',
    labelNames: ['type', 'route'],
  });

  // Resource usage metrics
  const memoryUsage = new Gauge({
    name: `${prefix}memory_usage_bytes`,
    help: 'Memory usage in bytes',
    labelNames: ['type'],
  });

  const cpuUsage = new Gauge({
    name: `${prefix}cpu_usage_percent`,
    help: 'CPU usage percentage',
  });

  // Decorate fastify instance with metrics
  fastify.decorate('monitoring', {
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestsInProgress,
    dbConnectionsActive,
    redisConnectionsActive,
    errorRate,
    memoryUsage,
    cpuUsage,
  });

  // Request tracking hooks
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      (request as any).startTime = startTime;

      // Track requests in progress
      httpRequestsInProgress.inc({ method: request.method });
    },
  );

  fastify.addHook(
    'onResponse',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const duration =
        (Date.now() - ((request as any).startTime || Date.now())) / 1000;
      const route = request.routeOptions?.url || request.url;

      // Update metrics
      httpRequestsTotal.inc({
        method: request.method,
        route,
        status_code: reply.statusCode.toString(),
      });

      httpRequestDuration.observe(
        {
          method: request.method,
          route,
          status_code: reply.statusCode.toString(),
        },
        duration,
      );

      // Decrease in-progress counter
      httpRequestsInProgress.dec({ method: request.method });
    },
  );

  // Error tracking
  fastify.addHook(
    'onError',
    async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
      const route = request.routeOptions?.url || request.url;

      errorRate.inc({
        type: error.name || 'UnknownError',
        route,
      });

      // Decrease in-progress counter on error
      httpRequestsInProgress.dec({ method: request.method });
    },
  );

  // Resource monitoring (if enabled)
  if (options.enableResourceMonitoring !== false) {
    const updateResourceMetrics = () => {
      const memUsage = process.memoryUsage();

      memoryUsage.set({ type: 'rss' }, memUsage.rss);
      memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
      memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
      memoryUsage.set({ type: 'external' }, memUsage.external);

      if (memUsage.arrayBuffers) {
        memoryUsage.set({ type: 'arrayBuffers' }, memUsage.arrayBuffers);
      }

      // CPU usage (requires some calculation)
      const usage = process.cpuUsage();
      const totalUsage = (usage.user + usage.system) / 1000; // Convert to milliseconds
      cpuUsage.set(totalUsage);
    };

    // Update resource metrics every 15 seconds
    const resourceInterval = setInterval(updateResourceMetrics, 15000);

    // Clean up interval on server close
    fastify.addHook('onClose', async () => {
      clearInterval(resourceInterval);
    });

    // Initial update
    updateResourceMetrics();
  }

  // Database connection monitoring (if Knex is available)
  if (fastify.knex) {
    const updateDbMetrics = () => {
      try {
        const pool = fastify.knex.client.pool;
        if (pool) {
          dbConnectionsActive.set(pool.numUsed() || 0);
        }
      } catch (error) {
        fastify.logger.warn('Failed to get database connection metrics', {
          error: error.message,
        });
      }
    };

    const dbInterval = setInterval(updateDbMetrics, 10000);
    fastify.addHook('onClose', async () => {
      clearInterval(dbInterval);
    });

    updateDbMetrics();
  }

  // Redis connection monitoring (if Redis is available)
  if (fastify.redis) {
    const updateRedisMetrics = () => {
      try {
        const status = fastify.redis.status;
        redisConnectionsActive.set(status === 'ready' ? 1 : 0);
      } catch (error) {
        fastify.logger.warn('Failed to get Redis connection metrics', {
          error: error.message,
        });
      }
    };

    const redisInterval = setInterval(updateRedisMetrics, 10000);
    fastify.addHook('onClose', async () => {
      clearInterval(redisInterval);
    });

    updateRedisMetrics();
  }

  // Metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return register.metrics();
  });

  fastify.logger.info('Monitoring plugin initialized', {
    enableDefaultMetrics: options.enableDefaultMetrics !== false,
    enableResourceMonitoring: options.enableResourceMonitoring !== false,
    metricsPrefix: prefix,
  });
}

export default fp(monitoringPlugin, {
  name: 'monitoring-plugin',
  dependencies: ['logging-plugin'],
  fastify: '>=4.x',
});

export { MonitoringOptions };
