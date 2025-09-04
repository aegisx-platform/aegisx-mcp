import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  // Skip Redis in test environment unless explicitly enabled
  if (process.env.NODE_ENV === 'test' && process.env.ENABLE_REDIS_IN_TEST !== 'true') {
    fastify.log.info('Redis disabled in test environment');
    return;
  }

  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        // Give up after 3 retries
        if (times > 3) {
          fastify.log.warn('Redis connection failed after 3 retries, continuing without Redis');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Test connection with timeout
    await Promise.race([
      redis.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);

    redis.on('error', (err) => {
      fastify.log.error({ msg: 'Redis connection error', err });
    });

    redis.on('connect', () => {
      fastify.log.info('Redis connected successfully');
    });

    // Decorate fastify instance with redis
    fastify.decorate('redis', redis);

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      await redis.quit();
    });
  } catch (error) {
    // Redis is optional, so we just log the error
    fastify.log.warn({ msg: 'Redis connection failed, continuing without caching', error });
  }
};

export default fp(redisPlugin, {
  name: 'redis-plugin',
});