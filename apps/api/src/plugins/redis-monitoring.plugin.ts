import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { RedisCacheService } from '../services/redis-cache.service';

interface RedisMonitoringOptions {
  interval?: number; // Monitoring interval in seconds
  logLevel?: 'debug' | 'info' | 'warn';
}

const redisMonitoringPlugin: FastifyPluginAsync<
  RedisMonitoringOptions
> = async (fastify, options) => {
  const interval = (options.interval || 300) * 1000; // Default 5 minutes
  const logLevel = options.logLevel || 'info';

  if (!fastify.redis) {
    fastify.log.warn('Redis monitoring disabled - Redis not available');
    return;
  }

  let monitoringInterval: NodeJS.Timeout | undefined;
  const cacheServices = new Map<string, RedisCacheService>();

  // Register cache service tracking
  fastify.decorate(
    'registerCacheService',
    (name: string, service: RedisCacheService) => {
      cacheServices.set(name, service);
    },
  );

  // Monitor Redis and cache statistics
  const monitor = async () => {
    try {
      // Get Redis info
      const info = await fastify.redis.info();
      const memoryInfo = parseRedisInfo(info, 'used_memory_human');
      const connectedClients = parseRedisInfo(info, 'connected_clients');
      const totalConnections = parseRedisInfo(
        info,
        'total_connections_received',
      );
      const commandsProcessed = parseRedisInfo(
        info,
        'total_commands_processed',
      );
      const hitRate = calculateHitRate(info);

      // Get cache service statistics
      const cacheStats: any = {};
      for (const [name, service] of cacheServices) {
        cacheStats[name] = service.getStats();
      }

      const monitoringData = {
        timestamp: new Date().toISOString(),
        redis: {
          memory: memoryInfo,
          clients: connectedClients,
          totalConnections,
          commandsProcessed,
          hitRate: `${hitRate.toFixed(2)}%`,
        },
        cacheServices: cacheStats,
      };

      fastify.log[logLevel]({
        msg: 'Redis monitoring update',
        ...monitoringData,
      });

      // Check for potential issues
      if (parseInt(connectedClients) > 100) {
        fastify.log.warn({
          msg: 'High number of Redis connections',
          connectedClients,
        });
      }

      // Check cache hit rates
      for (const [name, stats] of Object.entries(cacheStats)) {
        const serviceStats = stats as any;
        if (
          serviceStats.hitRate < 50 &&
          serviceStats.hits + serviceStats.misses > 100
        ) {
          fastify.log.warn({
            msg: `Low cache hit rate for ${name}`,
            hitRate: serviceStats.hitRate,
            hits: serviceStats.hits,
            misses: serviceStats.misses,
          });
        }
      }
    } catch (error) {
      fastify.log.error({ msg: 'Redis monitoring error', error });
    }
  };

  // Parse Redis INFO output
  function parseRedisInfo(info: string, key: string): string {
    const match = info.match(new RegExp(`${key}:(.*)`, 'm'));
    return match ? match[1].trim() : '0';
  }

  // Calculate hit rate from Redis INFO
  function calculateHitRate(info: string): number {
    const hits = parseInt(parseRedisInfo(info, 'keyspace_hits') || '0');
    const misses = parseInt(parseRedisInfo(info, 'keyspace_misses') || '0');
    const total = hits + misses;
    return total > 0 ? (hits / total) * 100 : 0;
  }

  // Add monitoring endpoints
  fastify.get('/api/monitoring/redis', async () => {
    const info = await fastify.redis.info();
    const stats: any = {};

    for (const [name, service] of cacheServices) {
      stats[name] = service.getStats();
    }

    return {
      redis: {
        memory: parseRedisInfo(info, 'used_memory_human'),
        clients: parseRedisInfo(info, 'connected_clients'),
        uptime: parseRedisInfo(info, 'uptime_in_seconds'),
        version: parseRedisInfo(info, 'redis_version'),
        hitRate: `${calculateHitRate(info).toFixed(2)}%`,
      },
      cacheServices: stats,
    };
  });

  // Reset cache statistics endpoint
  fastify.post('/api/monitoring/redis/reset-stats', async () => {
    for (const [name, service] of cacheServices) {
      service.resetStats();
    }
    return { message: 'Cache statistics reset' };
  });

  // Start monitoring
  monitoringInterval = setInterval(monitor, interval);

  // Initial monitoring
  await monitor();

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
  });
};

export default fp(redisMonitoringPlugin, {
  name: 'redis-monitoring-plugin',
  dependencies: ['redis-plugin'],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    registerCacheService: (name: string, service: RedisCacheService) => void;
  }
}
