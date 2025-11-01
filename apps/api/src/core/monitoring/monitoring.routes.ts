import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SchemaRefs } from '../../schemas/registry';
import {
  ClientErrorsRequest,
  ClientErrorsResponse,
  ClientMonitoringRequest,
  ClientMonitoringResponse,
  PerformanceMetric,
  UserAction,
} from './monitoring.schemas';
import { MetricsService } from './services/metrics.service';
import { createSessionTracker } from './services/session-tracker.service';

async function monitoringRoutes(fastify: FastifyInstance) {
  // Initialize services
  const metricsService = new MetricsService(fastify, 'prometheus');
  const sessionTracker = createSessionTracker(fastify);
  // Client error logging endpoint
  fastify.post<{
    Body: ClientErrorsRequest;
    Reply: ClientErrorsResponse;
  }>(
    '/client-errors',
    {
      preValidation: [fastify.authenticate],
      schema: {
        summary: 'Log client errors',
        description: 'Log client-side errors from the frontend application',
        tags: ['monitoring'],
        body: SchemaRefs.module('monitoring', 'client-errors-request'),
        response: {
          200: SchemaRefs.module('monitoring', 'client-errors-response'),
          400: SchemaRefs.ServerError,
          401: SchemaRefs.ServerError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: ClientErrorsRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const { errors } = request.body;
        const correlationId = request.correlationId;

        // Process each error
        for (const error of errors) {
          // Enhance error with server-side context
          const enhancedError = {
            ...error,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            ip: request.ip,
            serverUserAgent: request.headers['user-agent'],
            referer: request.headers.referer,
          };

          // Log based on error level
          const logLevel =
            error.level === 'error'
              ? 'error'
              : error.level === 'warn'
                ? 'warn'
                : 'info';

          fastify.logger[logLevel]('Client error received', enhancedError);

          // Store in database if needed (optional implementation)
          await storeClientError(fastify, enhancedError);
        }

        return reply.success({
          message: `Successfully processed ${errors.length} error(s)`,
          errorsProcessed: errors.length,
        });
      } catch (error) {
        fastify.logger.error('Failed to process client errors', {
          error: error.message,
          stack: error.stack,
          correlationId: request.correlationId,
        });

        return reply.error(
          'PROCESSING_ERROR',
          'Failed to process client errors',
          500,
        );
      }
    },
  );

  // Client monitoring data endpoint
  fastify.post<{
    Body: ClientMonitoringRequest;
    Reply: ClientMonitoringResponse;
  }>(
    '/client-monitoring',
    {
      preValidation: [fastify.authenticate],
      schema: {
        summary: 'Log monitoring data',
        description:
          'Receive client-side performance and user interaction data',
        tags: ['monitoring'],
        body: SchemaRefs.module('monitoring', 'client-monitoring-request'),
        response: {
          200: SchemaRefs.module('monitoring', 'client-monitoring-response'),
          400: SchemaRefs.ServerError,
          401: SchemaRefs.ServerError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: ClientMonitoringRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const { performance, userActions, sessionId, timestamp } = request.body;
        const correlationId = request.correlationId;

        // Process performance metrics
        for (const metric of performance) {
          const enhancedMetric = {
            ...metric,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            sessionId,
            ip: request.ip,
          };

          // Log significant performance issues
          if (shouldLogPerformanceMetric(metric)) {
            fastify.logger.info('Performance metric received', enhancedMetric);
          }

          // Store in database/metrics system
          await storePerformanceMetric(fastify, enhancedMetric);
        }

        // Process user actions
        for (const action of userActions) {
          const enhancedAction = {
            ...action,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            sessionId,
            ip: request.ip,
          };

          // Log user interactions (optional, for analytics)
          if (shouldLogUserAction(action)) {
            fastify.logger.info('User action received', enhancedAction);
          }

          // Store in database/analytics system
          await storeUserAction(fastify, enhancedAction);
        }

        return reply.success({
          message: `Successfully processed ${performance.length} metrics and ${userActions.length} actions`,
          metricsProcessed: performance.length,
          actionsProcessed: userActions.length,
        });
      } catch (error) {
        fastify.logger.error('Failed to process client monitoring data', {
          error: error.message,
          stack: error.stack,
          correlationId: request.correlationId,
        });

        return reply.error(
          'PROCESSING_ERROR',
          'Failed to process monitoring data',
          500,
        );
      }
    },
  );

  // System metrics endpoint
  fastify.get(
    '/system-metrics',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get system metrics',
        description: 'Get current system metrics (CPU, memory, disk usage)',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  cpu: {
                    type: 'object',
                    properties: {
                      usage: { type: 'number' },
                      cores: { type: 'number' },
                      loadAverage: {
                        type: 'array',
                        items: { type: 'number' },
                      },
                    },
                  },
                  memory: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      used: { type: 'number' },
                      free: { type: 'number' },
                      usagePercent: { type: 'number' },
                    },
                  },
                  process: {
                    type: 'object',
                    properties: {
                      memoryUsage: { type: 'number' },
                      uptime: { type: 'number' },
                      pid: { type: 'number' },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const os = await import('os');
        const process = await import('process');

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        // Calculate CPU usage as percentage from load average
        const cores = os.cpus().length;
        const loadAvg = os.loadavg()[0]; // 1-minute load average
        const cpuPercent = (loadAvg / cores) * 100;

        // Use reply.success() to wrap response in standard format
        return reply.success({
          cpu: {
            usage: cpuPercent, // CPU usage as percentage
            cores: cores,
            loadAverage: os.loadavg(),
          },
          memory: {
            total: totalMem,
            used: usedMem,
            free: freeMem,
            usagePercent: (usedMem / totalMem) * 100,
          },
          process: {
            memoryUsage: process.memoryUsage().heapUsed,
            uptime: process.uptime(),
            pid: process.pid,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get system metrics', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get system metrics',
          500,
        );
      }
    },
  );

  // API performance endpoint
  fastify.get(
    '/api-performance',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get API performance metrics',
        description: 'Get API response times and throughput',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  responseTime: {
                    type: 'object',
                    properties: {
                      average: { type: 'number' },
                      median: { type: 'number' },
                      p95: { type: 'number' },
                      p99: { type: 'number' },
                      min: { type: 'number' },
                      max: { type: 'number' },
                    },
                  },
                  throughput: {
                    type: 'object',
                    properties: {
                      requestsPerSecond: { type: 'number' },
                      requestsPerMinute: { type: 'number' },
                      totalRequests: { type: 'number' },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
              message: { type: 'string' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get real metrics from Prometheus
        const requestMetrics = await metricsService.getRequestMetrics();

        // Calculate aggregated performance metrics
        let totalResponseTime = 0;
        let totalCount = 0;

        // Aggregate response times across all endpoints
        for (const endpoint of requestMetrics.byEndpoint) {
          totalResponseTime += endpoint.avgResponseTime * endpoint.count;
          totalCount += endpoint.count;
        }

        const avgResponseTime =
          totalCount > 0 ? totalResponseTime / totalCount : 0;

        // Calculate throughput (requests per time unit)
        // For development, estimate based on total requests
        // In production, this should use time-series data
        const requestsPerMinute = totalCount; // Total requests in last time window
        const requestsPerSecond = requestsPerMinute / 60;

        return reply.success({
          responseTime: {
            average: Math.round(avgResponseTime * 10) / 10,
            median: Math.round(avgResponseTime * 10) / 10, // Approximation
            p95: Math.round(avgResponseTime * 2.5 * 10) / 10, // Approximation (2.5x average)
            p99: Math.round(avgResponseTime * 3.5 * 10) / 10, // Approximation (3.5x average)
            min: 0, // Min requires percentile data from histogram
            max: Math.round(avgResponseTime * 5 * 10) / 10, // Approximation (5x average)
          },
          throughput: {
            requestsPerSecond: Math.round(requestsPerSecond * 10) / 10,
            requestsPerMinute: requestsPerMinute,
            totalRequests: requestMetrics.totalRequests,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get API performance metrics', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get API performance metrics',
          500,
        );
      }
    },
  );

  // Database statistics endpoint
  fastify.get(
    '/database-stats',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get database statistics',
        description: 'Get database connection pool and query performance',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              pool: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  idle: { type: 'number' },
                  active: { type: 'number' },
                },
              },
              queries: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  slow: { type: 'number' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get Knex pool status
        const pool = fastify.knex?.client?.pool;

        return reply.success({
          pool: {
            total: pool?.max || 0,
            idle: pool?.numFree?.() || 0,
            active: pool?.numUsed?.() || 0,
          },
          queries: {
            total: 0, // TODO: Implement query counting
            slow: 0, // TODO: Implement slow query detection
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get database stats', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get database stats',
          500,
        );
      }
    },
  );

  // Redis statistics endpoint
  fastify.get(
    '/redis-stats',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get Redis statistics',
        description: 'Get Redis cache hit rates and memory usage',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              cache: {
                type: 'object',
                properties: {
                  hits: { type: 'number' },
                  misses: { type: 'number' },
                  hitRate: { type: 'number' },
                },
              },
              memory: {
                type: 'object',
                properties: {
                  used: { type: 'number' },
                  peak: { type: 'number' },
                },
              },
              connections: {
                type: 'object',
                properties: {
                  active: { type: 'number' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get Redis info if available
        const redis = (fastify as any).redis;
        const stats = {
          cache: {
            hits: 0,
            misses: 0,
            hitRate: 0,
          },
          memory: {
            used: 0,
            peak: 0,
          },
          connections: {
            active: redis ? 1 : 0,
          },
        };

        if (redis && typeof redis.info === 'function') {
          try {
            const info = await redis.info('stats');
            // Parse Redis INFO output
            const lines = info.split('\r\n');
            for (const line of lines) {
              if (line.startsWith('keyspace_hits:')) {
                stats.cache.hits = parseInt(line.split(':')[1]);
              } else if (line.startsWith('keyspace_misses:')) {
                stats.cache.misses = parseInt(line.split(':')[1]);
              }
            }
            const total = stats.cache.hits + stats.cache.misses;
            stats.cache.hitRate =
              total > 0 ? (stats.cache.hits / total) * 100 : 0;
          } catch (redisError) {
            fastify.logger.warn('Failed to get Redis stats', {
              error: redisError.message,
            });
          }
        }

        return reply.success({
          ...stats,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get Redis stats', {
          error: error.message,
        });
        return reply.error('METRICS_ERROR', 'Failed to get Redis stats', 500);
      }
    },
  );

  // Database pool endpoint (for System Monitoring dashboard)
  fastify.get(
    '/database-pool',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get database pool status',
        description: 'Get database connection pool information',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  pool: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      active: { type: 'number' },
                      idle: { type: 'number' },
                    },
                  },
                  queries: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      slow: { type: 'number' },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const pool = fastify.knex?.client?.pool;

        return reply.success({
          pool: {
            total: pool?.max || 10,
            active: pool?.numUsed?.() || 0,
            idle: pool?.numFree?.() || pool?.max || 10,
          },
          queries: {
            total: 0,
            slow: 0,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get database pool status', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get database pool status',
          500,
        );
      }
    },
  );

  // Cache stats endpoint (for System Monitoring dashboard)
  fastify.get(
    '/cache-stats',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get cache statistics',
        description: 'Get Redis cache hit rates and performance',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  cache: {
                    type: 'object',
                    properties: {
                      hits: { type: 'number' },
                      misses: { type: 'number' },
                      hitRate: { type: 'number' },
                      keys: { type: 'number' },
                      memory: { type: 'number' },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const redis = (fastify as any).redis;
        const stats = {
          hits: 0,
          misses: 0,
          hitRate: 0,
          keys: 0,
          memory: 0,
        };

        if (redis && typeof redis.info === 'function') {
          try {
            // Get stats section
            const statsInfo = await redis.info('stats');
            const lines = statsInfo.split('\r\n');
            for (const line of lines) {
              if (line.startsWith('keyspace_hits:')) {
                stats.hits = parseInt(line.split(':')[1]) || 0;
              } else if (line.startsWith('keyspace_misses:')) {
                stats.misses = parseInt(line.split(':')[1]) || 0;
              }
            }

            // Calculate hit rate
            const total = stats.hits + stats.misses;
            stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

            // Get keyspace section for key count
            const keyspaceInfo = await redis.info('keyspace');
            const keyspaceLines = keyspaceInfo.split('\r\n');
            for (const line of keyspaceLines) {
              if (line.startsWith('db0:')) {
                const match = line.match(/keys=(\d+)/);
                if (match) {
                  stats.keys = parseInt(match[1]) || 0;
                }
              }
            }

            // Get memory section
            const memoryInfo = await redis.info('memory');
            const memoryLines = memoryInfo.split('\r\n');
            for (const line of memoryLines) {
              if (line.startsWith('used_memory:')) {
                stats.memory = parseInt(line.split(':')[1]) || 0;
              }
            }
          } catch (redisError) {
            fastify.logger.warn('Failed to get Redis stats', {
              error: redisError.message,
            });
          }
        }

        return reply.success({
          cache: {
            hits: stats.hits,
            misses: stats.misses,
            hitRate: stats.hitRate,
            keys: stats.keys,
            memory: stats.memory,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        fastify.logger.error('Failed to get cache stats', {
          error: error.message,
        });
        return reply.error('METRICS_ERROR', 'Failed to get cache stats', 500);
      }
    },
  );

  // Active sessions endpoint
  fastify.get(
    '/active-sessions',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get active sessions',
        description: 'Get current active user sessions count',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  users: { type: 'number' },
                  sessions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        lastActivity: { type: 'string' },
                      },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
              message: { type: 'string' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get real session data from Redis via SessionTracker
        const sessions = await sessionTracker.getActiveSessions();
        return reply.success(sessions);
      } catch (error: any) {
        fastify.logger.error('Failed to get active sessions', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get active sessions',
          500,
        );
      }
    },
  );

  // Request metrics endpoint
  fastify.get(
    '/request-metrics',
    {
      preValidation: [
        fastify.authenticate,
        fastify.verifyPermission('system', 'monitoring:read'),
      ],
      schema: {
        summary: 'Get request metrics',
        description: 'Get request counts by endpoint',
        tags: ['monitoring'],
        response: {
          200: {
            type: 'object',
            required: ['success', 'data'],
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  totalRequests: { type: 'number' },
                  byEndpoint: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        endpoint: { type: 'string' },
                        count: { type: 'number' },
                        avgResponseTime: { type: 'number' },
                      },
                    },
                  },
                  timestamp: { type: 'string' },
                },
              },
              message: { type: 'string' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get real request metrics from Prometheus-based metrics service
        const metrics = await metricsService.getRequestMetrics();

        return reply.success(metrics);
      } catch (error: any) {
        fastify.logger.error('Failed to get request metrics', {
          error: error.message,
        });
        return reply.error(
          'METRICS_ERROR',
          'Failed to get request metrics',
          500,
        );
      }
    },
  );
}

// Helper functions

async function storeClientError(
  fastify: FastifyInstance,
  error: any,
): Promise<void> {
  try {
    // Store in error_logs table (always enabled now)
    if (fastify.knex) {
      await fastify.knex('error_logs').insert({
        timestamp: new Date(error.timestamp),
        level: error.level,
        message: error.message,
        url: error.url,
        user_agent: error.userAgent,
        user_id: error.userId,
        session_id: error.sessionId,
        correlation_id: error.correlationId,
        stack: error.stack,
        context: error.context ? JSON.stringify(error.context) : null,
        type: error.type,
        ip_address: error.ip,
        referer: error.referer,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store client error in database', {
      error: dbError.message,
      originalError: error.message,
    });
  }
}

async function storePerformanceMetric(
  fastify: FastifyInstance,
  metric: any,
): Promise<void> {
  try {
    // Optional: Store in database or metrics system
    // This could integrate with time-series databases like InfluxDB
    if (process.env.STORE_PERFORMANCE_METRICS === 'true' && fastify.knex) {
      await fastify.knex('client_performance').insert({
        name: metric.name,
        value: metric.value,
        timestamp: new Date(metric.timestamp),
        url: metric.url,
        user_agent: metric.userAgent,
        session_id: metric.sessionId,
        correlation_id: metric.correlationId,
        context: JSON.stringify(metric.context || {}),
        server_timestamp: new Date(),
        ip: metric.ip,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store performance metric in database', {
      error: dbError.message,
      metric: metric.name,
    });
  }
}

async function storeUserAction(
  fastify: FastifyInstance,
  action: any,
): Promise<void> {
  try {
    // Optional: Store in database for user behavior analysis
    if (process.env.STORE_USER_ACTIONS === 'true' && fastify.knex) {
      await fastify.knex('client_user_actions').insert({
        type: action.type,
        element: action.element,
        url: action.url,
        timestamp: new Date(action.timestamp),
        duration: action.duration,
        session_id: action.sessionId,
        correlation_id: action.correlationId,
        context: JSON.stringify(action.context || {}),
        server_timestamp: new Date(),
        ip: action.ip,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store user action in database', {
      error: dbError.message,
      action: action.type,
    });
  }
}

function shouldLogPerformanceMetric(metric: PerformanceMetric): boolean {
  // Log significant performance issues
  return (
    (metric.name === 'lcp' && metric.value > 4000) ||
    (metric.name === 'fid' && metric.value > 300) ||
    (metric.name === 'cls' && metric.value > 0.25) ||
    (metric.name === 'page_load_time' && metric.value > 3000)
  );
}

function shouldLogUserAction(action: UserAction): boolean {
  // Log important user actions (navigation, form submissions)
  return action.type === 'navigation' || action.type === 'form_submit';
}

export default monitoringRoutes;
