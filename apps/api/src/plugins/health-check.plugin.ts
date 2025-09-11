import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type, Static } from '@sinclair/typebox';

// Health check status enum
const HealthStatus = Type.Union([
  Type.Literal('healthy'),
  Type.Literal('unhealthy'),
  Type.Literal('degraded'),
]);

// Individual service health check
const ServiceHealth = Type.Object({
  status: HealthStatus,
  message: Type.Optional(Type.String()),
  responseTime: Type.Optional(
    Type.Number({ description: 'Response time in milliseconds' }),
  ),
  details: Type.Optional(Type.Record(Type.String(), Type.Any())),
  timestamp: Type.String({ format: 'date-time' }),
});

// Overall health response
const HealthCheckResponse = Type.Object({
  status: HealthStatus,
  timestamp: Type.String({ format: 'date-time' }),
  uptime: Type.Number({ description: 'Server uptime in seconds' }),
  version: Type.Optional(Type.String()),
  services: Type.Object({
    database: ServiceHealth,
    redis: Type.Optional(ServiceHealth),
    memory: ServiceHealth,
    disk: ServiceHealth,
  }),
  summary: Type.Object({
    total: Type.Number(),
    healthy: Type.Number(),
    unhealthy: Type.Number(),
    degraded: Type.Number(),
  }),
});

type HealthCheckResponseType = Static<typeof HealthCheckResponse>;

interface HealthCheckOptions {
  enableDetailedChecks?: boolean;
  databaseTimeout?: number;
  redisTimeout?: number;
  memoryThreshold?: number; // In percentage
  diskThreshold?: number; // In percentage
}

async function healthCheckPlugin(
  fastify: FastifyInstance,
  options: HealthCheckOptions = {},
) {
  const {
    enableDetailedChecks = true,
    databaseTimeout = 5000,
    redisTimeout = 3000,
    memoryThreshold = 85,
    diskThreshold = 90,
  } = options;

  // Helper function to check database health
  async function checkDatabaseHealth(): Promise<Static<typeof ServiceHealth>> {
    const startTime = Date.now();

    try {
      if (!fastify.knex) {
        return {
          status: 'unhealthy',
          message: 'Database connection not available',
          timestamp: new Date().toISOString(),
        };
      }

      // Simple query to test connection
      await Promise.race([
        fastify.knex.raw('SELECT 1 as health_check'),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Database query timeout')),
            databaseTimeout,
          ),
        ),
      ]);

      const responseTime = Date.now() - startTime;

      // Get additional database info
      let details = {};
      if (enableDetailedChecks) {
        try {
          const pool = fastify.knex.client.pool;
          details = {
            poolSize: pool?.max || 0,
            activeConnections: pool?.numUsed() || 0,
            idleConnections: pool?.numFree() || 0,
            pendingAcquires: pool?.numPendingAcquires() || 0,
          };
        } catch (e) {
          // Ignore pool info errors
        }
      }

      return {
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        message:
          responseTime > 1000
            ? 'Database responding slowly'
            : 'Database connection healthy',
        responseTime,
        details: enableDetailedChecks ? details : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper function to check Redis health
  async function checkRedisHealth(): Promise<
    Static<typeof ServiceHealth> | undefined
  > {
    if (!fastify.redis) {
      return undefined;
    }

    const startTime = Date.now();

    try {
      // Simple ping to test Redis connection
      await Promise.race([
        fastify.redis.ping(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Redis ping timeout')),
            redisTimeout,
          ),
        ),
      ]);

      const responseTime = Date.now() - startTime;

      let details = {};
      if (enableDetailedChecks) {
        try {
          const info = await fastify.redis.info('memory');
          const lines = info.split('\r\n');
          const memoryInfo: any = {};

          lines.forEach((line) => {
            if (line.includes(':')) {
              const [key, value] = line.split(':');
              if (
                key === 'used_memory' ||
                key === 'used_memory_human' ||
                key === 'maxmemory'
              ) {
                memoryInfo[key] = value;
              }
            }
          });

          details = {
            status: fastify.redis.status,
            memoryUsage: memoryInfo,
          };
        } catch (e) {
          // Ignore info errors
        }
      }

      return {
        status: responseTime > 500 ? 'degraded' : 'healthy',
        message:
          responseTime > 500
            ? 'Redis responding slowly'
            : 'Redis connection healthy',
        responseTime,
        details: enableDetailedChecks ? details : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Redis check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper function to check memory health
  function checkMemoryHealth(): Static<typeof ServiceHealth> {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.rss + memUsage.heapTotal;

      // Rough estimation of memory usage percentage
      // In a real scenario, you'd want to compare against system memory
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      const status =
        heapUsagePercent > memoryThreshold
          ? 'unhealthy'
          : heapUsagePercent > memoryThreshold * 0.8
            ? 'degraded'
            : 'healthy';

      const details = enableDetailedChecks
        ? {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
            heapUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
          }
        : undefined;

      return {
        status,
        message:
          status === 'healthy'
            ? 'Memory usage normal'
            : status === 'degraded'
              ? 'Memory usage elevated'
              : 'Memory usage critical',
        details,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Memory check failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper function to check disk health
  function checkDiskHealth(): Static<typeof ServiceHealth> {
    try {
      // This is a basic check - in production you might want to use a library like 'diskusage'
      // For now, we'll just check if we can write to a temp file
      const fs = require('fs');
      const path = require('path');

      const tempFile = path.join(process.cwd(), '.health-check-temp');
      fs.writeFileSync(tempFile, 'health check');
      const stats = fs.statSync(tempFile);
      fs.unlinkSync(tempFile);

      return {
        status: 'healthy',
        message: 'Disk write/read operations successful',
        details: enableDetailedChecks
          ? {
              workingDirectory: process.cwd(),
              canWrite: true,
              tempFileSize: stats.size,
            }
          : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Disk check failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Register health check schemas
  fastify.addSchema({
    $id: 'health-check-response',
    ...HealthCheckResponse,
  });

  // Basic liveness probe - minimal check
  fastify.get(
    '/health/live',
    {
      schema: {
        description: 'Liveness probe - basic server health',
        tags: ['health'],
        response: {
          200: Type.Object({
            status: Type.Literal('healthy'),
            timestamp: Type.String({ format: 'date-time' }),
            uptime: Type.Number(),
          }),
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      };
    },
  );

  // Readiness probe - checks if app is ready to serve traffic
  fastify.get(
    '/health/ready',
    {
      schema: {
        description:
          'Readiness probe - checks if application is ready to serve requests',
        tags: ['health'],
        response: {
          200: { $ref: 'health-check-response' },
          503: { $ref: 'health-check-response' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();

      // Perform all health checks
      const [databaseHealth, redisHealth] = await Promise.allSettled([
        checkDatabaseHealth(),
        checkRedisHealth(),
      ]);

      const memoryHealth = checkMemoryHealth();
      const diskHealth = checkDiskHealth();

      // Build services object
      const services: any = {
        database:
          databaseHealth.status === 'fulfilled'
            ? databaseHealth.value
            : {
                status: 'unhealthy',
                message: 'Database check failed',
                timestamp: new Date().toISOString(),
              },
        memory: memoryHealth,
        disk: diskHealth,
      };

      // Add Redis if available
      if (redisHealth.status === 'fulfilled' && redisHealth.value) {
        services.redis = redisHealth.value;
      }

      // Calculate summary
      const serviceValues = Object.values(services);
      const summary = {
        total: serviceValues.length,
        healthy: serviceValues.filter((s: any) => s.status === 'healthy')
          .length,
        degraded: serviceValues.filter((s: any) => s.status === 'degraded')
          .length,
        unhealthy: serviceValues.filter((s: any) => s.status === 'unhealthy')
          .length,
      };

      // Determine overall status
      const overallStatus =
        summary.unhealthy > 0
          ? 'unhealthy'
          : summary.degraded > 0
            ? 'degraded'
            : 'healthy';

      const response: HealthCheckResponseType = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: process.env.npm_package_version,
        services,
        summary,
      };

      // Set appropriate HTTP status code
      const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
      reply.code(statusCode);

      // Log health check results
      fastify.logger.info('Health check completed', {
        status: overallStatus,
        responseTime: `${Date.now() - startTime}ms`,
        summary,
      });

      return response;
    },
  );

  fastify.logger.info('Health check plugin initialized', {
    endpoints: ['/health/live', '/health/ready'],
    enableDetailedChecks,
    databaseTimeout: `${databaseTimeout}ms`,
    redisTimeout: `${redisTimeout}ms`,
  });
}

export default fp(healthCheckPlugin, {
  name: 'health-check-plugin',
  dependencies: ['logging-plugin', 'knex-plugin'],
  fastify: '>=4.x',
});

export { HealthCheckOptions };
