import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

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
    fastify.log.warn({ msg: 'Redis connection failed, some features may be unavailable', error });
  }
};

export default fp(redisPlugin, {
  name: 'redis',
});