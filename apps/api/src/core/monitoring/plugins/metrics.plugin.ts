/**
 * Metrics Plugin - Real-time HTTP request metrics collection
 *
 * Uses prom-client to collect:
 * - Request counter (by route, method, status)
 * - Request duration histogram (response time)
 * - Active requests gauge (concurrent requests)
 * - Request size histogram (payload sizes)
 *
 * Non-blocking: Metrics recorded AFTER response sent via onResponse hook
 */

import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import promClient from 'prom-client';

// Extend Fastify type definitions
declare module 'fastify' {
  interface FastifyInstance {
    metrics: {
      register: promClient.Registry;
      requestCounter: promClient.Counter;
      requestDuration: promClient.Histogram;
      activeRequests: promClient.Gauge;
      requestSize: promClient.Histogram;
    };
  }

  interface FastifyRequest {
    startTime?: number;
  }
}

const metricsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Create separate registry for our metrics
  const register = new promClient.Registry();

  // Add default labels (optional)
  register.setDefaultLabels({
    app: 'aegisx-api',
    environment: process.env.NODE_ENV || 'development',
  });

  // 1. HTTP Request Counter - Total requests by route/method/status
  const requestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  // 2. HTTP Request Duration - Response time histogram
  const requestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Response time buckets
    registers: [register],
  });

  // 3. Active Requests Gauge - Current concurrent requests
  const activeRequests = new promClient.Gauge({
    name: 'http_requests_active',
    help: 'Number of active HTTP requests in progress',
    registers: [register],
  });

  // 4. Request Size Histogram - Payload sizes
  const requestSize = new promClient.Histogram({
    name: 'http_request_size_bytes',
    help: 'HTTP request size in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000], // Size buckets
    registers: [register],
  });

  // Hook 1: Start timer and increment active requests when request begins
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, _reply: FastifyReply) => {
      request.startTime = Date.now();
      activeRequests.inc(); // Increment active requests
    },
  );

  // Hook 2: Record metrics when response is sent (NON-BLOCKING)
  fastify.addHook(
    'onResponse',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Decrement active requests
      activeRequests.dec();

      // Calculate request duration
      const duration = request.startTime
        ? (Date.now() - request.startTime) / 1000
        : 0; // seconds

      // Get route info (use routeOptions.url for accurate route pattern)
      const route = request.routeOptions?.url || request.url || 'unknown';
      const method = request.method;
      const statusCode = reply.statusCode.toString();

      // Record metrics (NON-BLOCKING - happens after response sent)
      try {
        // Increment request counter
        requestCounter.inc({
          method,
          route,
          status_code: statusCode,
        });

        // Record request duration
        requestDuration.observe(
          {
            method,
            route,
            status_code: statusCode,
          },
          duration,
        );

        // Record request size if available
        const contentLength = request.headers['content-length'];
        if (contentLength) {
          requestSize.observe(
            {
              method,
              route,
            },
            parseInt(contentLength, 10),
          );
        }
      } catch (err) {
        // Log error but don't affect response
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        fastify.log.error(
          `Failed to record metrics: ${errorMessage} (${method} ${route})`,
        );
      }
    },
  );

  // Expose /metrics endpoint for Prometheus scraping
  fastify.get(
    '/metrics',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await register.metrics();
        reply.type('text/plain; version=0.0.4; charset=utf-8');
        return metrics;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        fastify.log.error(`Failed to get metrics: ${errorMessage}`);
        reply.code(500).send({
          success: false,
          error: {
            code: 'METRICS_ERROR',
            message: 'Failed to retrieve metrics',
          },
        });
      }
    },
  );

  // Decorate Fastify instance with metrics for internal use
  fastify.decorate('metrics', {
    register,
    requestCounter,
    requestDuration,
    activeRequests,
    requestSize,
  });

  fastify.log.info('✅ Metrics plugin initialized successfully');
  fastify.log.info('📊 Metrics endpoint available at: /api/monitoring/metrics');
};

export default fastifyPlugin(metricsPlugin, {
  name: 'metrics-plugin',
  fastify: '5.x',
});
