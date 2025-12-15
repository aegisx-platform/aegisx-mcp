import '@fastify/jwt';
import Knex from 'knex';
import { Redis } from 'ioredis';
import { JWTPayload } from './jwt.types';
import { ErrorQueueService } from '../core/monitoring/services/error-queue.service';
import { PermissionCacheService } from '../core/rbac/services/permission-cache.service';
import { ImportDiscoveryService } from '../core/import/discovery/import-discovery.service';
import type { RateLimitPluginOptions } from '@fastify/rate-limit';

declare module 'fastify' {
  interface FastifyInstance {
    knex: any;
    redis?: Redis;
    errorQueue?: ErrorQueueService;
    permissionCache: PermissionCacheService;
    importDiscovery?: ImportDiscoveryService;
  }

  interface FastifyContextConfig {
    rateLimit?: RateLimitPluginOptions;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload; // Use the full payload structure
  }
}
