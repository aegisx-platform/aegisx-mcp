# Redis Caching & Performance

## Redis Integration with Fastify

### Official Fastify Redis Plugin Setup

#### Installation

```bash
# Install official Fastify Redis plugin
yarn add @fastify/redis ioredis

# TypeScript types
yarn add -D @types/ioredis
```

#### Basic Redis Plugin Registration

```typescript
// apps/api/src/plugins/redis.plugin.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

const redisPlugin: FastifyPluginAsync = async (fastify, options) => {
  // Register main Redis instance
  await fastify.register(require('@fastify/redis'), {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    family: 4,
    keyPrefix: 'app:cache:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,

    // Connection pool settings
    keepAlive: true,
    connectTimeout: 10000,
    commandTimeout: 5000,

    // Retry strategy
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  // Register additional Redis instances for different purposes
  await fastify.register(require('@fastify/redis'), {
    namespace: 'session',
    host: process.env.REDIS_SESSION_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_SESSION_PORT || process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_SESSION_PASSWORD || process.env.REDIS_PASSWORD,
    db: 1,
    keyPrefix: 'app:session:',
    lazyConnect: true,
  });

  await fastify.register(require('@fastify/redis'), {
    namespace: 'websocket',
    host: process.env.REDIS_WS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_WS_PORT || process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_WS_PASSWORD || process.env.REDIS_PASSWORD,
    db: 2,
    keyPrefix: 'app:ws:',
    lazyConnect: true,
  });

  // Add type declarations
  fastify.log.info('Redis clients registered successfully');
};

export default fp(redisPlugin, {
  name: 'redis',
  dependencies: [],
});
```

#### TypeScript Declarations for Multiple Redis Instances

````typescript
// apps/api/src/types/fastify.d.ts
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;           // Default Redis instance
    session: Redis;         // Session Redis instance
    websocket: Redis;       // WebSocket Redis instance
  }
}

## Caching Service Layer

### Universal Cache Service
```typescript
// apps/api/src/services/cache.service.ts
import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean;
  serialize?: boolean;
  tags?: string[];
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  tags: string[];
  compressed: boolean;
}

export class CacheService {
  private redis: Redis;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, redisInstance?: Redis) {
    this.fastify = fastify;
    // Use provided Redis instance or default to main Redis
    this.redis = redisInstance || fastify.redis;
  }

  // Basic cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Decompress if needed
      if (entry.compressed) {
        entry.data = await this.decompress(entry.data);
      }

      return entry.data;
    } catch (error) {
      this.fastify.log.error('Cache get error:', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        tags: options.tags || [],
        compressed: options.compress || false
      };

      // Compress large objects
      if (options.compress) {
        entry.data = await this.compress(entry.data);
      }

      const serialized = JSON.stringify(entry);

      if (options.ttl) {
        await this.redis.setex(key, options.ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }

      // Add to tag sets for bulk invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key);
        }
      }

      return true;
    } catch (error) {
      this.fastify.log.error('Cache set error:', { key, error });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.fastify.log.error('Cache delete error:', { key, error });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.fastify.log.error('Cache exists error:', { key, error });
      return false;
    }
  }

  // Advanced operations
  async mget<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const values = await this.redis.mget(...keys);
      const result: Record<string, T | null> = {};

      keys.forEach((key, index) => {
        const value = values[index];
        if (value) {
          const entry: CacheEntry<T> = JSON.parse(value);
          result[key] = entry.data;
        } else {
          result[key] = null;
        }
      });

      return result;
    } catch (error) {
      this.fastify.log.error('Cache mget error:', { keys, error });
      return {};
    }
  }

  async mset<T>(entries: Record<string, { value: T; options?: CacheOptions }>): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();

      for (const [key, { value, options = {} }] of Object.entries(entries)) {
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          tags: options.tags || [],
          compressed: options.compress || false
        };

        const serialized = JSON.stringify(entry);

        if (options.ttl) {
          pipeline.setex(key, options.ttl, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      this.fastify.log.error('Cache mset error:', error);
      return false;
    }
  }

  // Tag-based invalidation
  async invalidateByTag(tag: string): Promise<number> {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length === 0) return 0;

      const pipeline = this.redis.pipeline();

      // Delete all keys with this tag
      for (const key of keys) {
        pipeline.del(key);
      }

      // Remove tag set
      pipeline.del(`tag:${tag}`);

      const results = await pipeline.exec();
      return keys.length;
    } catch (error) {
      this.fastify.log.error('Cache invalidate by tag error:', { tag, error });
      return 0;
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      this.fastify.log.error('Cache invalidate by pattern error:', { pattern, error });
      return 0;
    }
  }

  // Cache statistics
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');

      return {
        memoryUsed: this.parseMemoryInfo(info),
        totalKeys: this.parseKeyspaceInfo(keyspace),
        hitRate: await this.getHitRate(),
        uptime: await this.getUptime()
      };
    } catch (error) {
      this.fastify.log.error('Cache stats error:', error);
      return {
        memoryUsed: 0,
        totalKeys: 0,
        hitRate: 0,
        uptime: 0
      };
    }
  }

  // Utility methods
  generateKey(namespace: string, identifier: string, version?: string): string {
    const parts = [namespace, identifier];
    if (version) parts.push(version);
    return parts.join(':');
  }

  private async compress<T>(data: T): Promise<string> {
    // Implement compression logic (gzip, lz4, etc.)
    return JSON.stringify(data);
  }

  private async decompress<T>(data: string): Promise<T> {
    // Implement decompression logic
    return JSON.parse(data);
  }

  private parseMemoryInfo(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private parseKeyspaceInfo(info: string): number {
    const match = info.match(/keys=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private async getHitRate(): Promise<number> {
    const hits = await this.redis.get('cache:hits') || '0';
    const misses = await this.redis.get('cache:misses') || '0';
    const total = parseInt(hits) + parseInt(misses);
    return total > 0 ? parseInt(hits) / total : 0;
  }

  private async getUptime(): Promise<number> {
    const info = await this.redis.info('server');
    const match = info.match(/uptime_in_seconds:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

interface CacheStats {
  memoryUsed: number;
  totalKeys: number;
  hitRate: number;
  uptime: number;
}
````

### Cache Decorators & Middleware

```typescript
// apps/api/src/decorators/cache.decorator.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export interface CacheDecoratorOptions {
  ttl?: number;
  keyGenerator?: (request: FastifyRequest) => string;
  tags?: string[] | ((request: FastifyRequest) => string[]);
  condition?: (request: FastifyRequest) => boolean;
  compress?: boolean;
}

export function Cache(options: CacheDecoratorOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (request: FastifyRequest, reply: FastifyReply) {
      const fastify = this.fastify || request.server;
      const cacheService = new CacheService(fastify, fastify.redis);

      // Check cache condition
      if (options.condition && !options.condition(request)) {
        return method.apply(this, [request, reply]);
      }

      // Generate cache key
      const cacheKey = options.keyGenerator ? options.keyGenerator(request) : generateDefaultKey(request);

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        await incrementCacheHit(fastify);
        return reply.success(cached);
      }

      // Cache miss - execute original method
      await incrementCacheMiss(fastify);
      const result = await method.apply(this, [request, reply]);

      // Cache the result
      const tags = Array.isArray(options.tags) ? options.tags : options.tags?.(request) || [];

      await cacheService.set(cacheKey, result, {
        ttl: options.ttl || 300, // 5 minutes default
        tags,
        compress: options.compress,
      });

      return result;
    };
  };
}

function generateDefaultKey(request: FastifyRequest): string {
  const { method, url, params, query } = request;
  const parts = [method, url];

  if (Object.keys(params || {}).length > 0) {
    parts.push(JSON.stringify(params));
  }

  if (Object.keys(query || {}).length > 0) {
    parts.push(JSON.stringify(query));
  }

  return parts.join(':');
}

async function incrementCacheHit(fastify: FastifyInstance) {
  try {
    await fastify.redis.cache.incr('cache:hits');
  } catch (error) {
    fastify.log.error('Failed to increment cache hit:', error);
  }
}

async function incrementCacheMiss(fastify: FastifyInstance) {
  try {
    await fastify.redis.cache.incr('cache:misses');
  } catch (error) {
    fastify.log.error('Failed to increment cache miss:', error);
  }
}
```

## Session Storage with Redis

### Session Service

```typescript
// apps/api/src/services/session.service.ts
import { FastifyInstance } from 'fastify';
import { CacheService } from './cache.service';

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export class SessionService extends CacheService {
  private readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 days
  private readonly ACTIVITY_UPDATE_INTERVAL = 5 * 60; // 5 minutes

  constructor(fastify: FastifyInstance) {
    super(fastify, fastify.session);
  }

  // Session management
  async createSession(userId: string, metadata: Partial<UserSession>): Promise<string> {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      id: sessionId,
      userId,
      email: metadata.email!,
      role: metadata.role!,
      permissions: metadata.permissions || [],
      lastActivity: new Date(),
      ipAddress: metadata.ipAddress!,
      userAgent: metadata.userAgent!,
      expiresAt: new Date(Date.now() + this.SESSION_TTL * 1000),
      metadata: metadata.metadata,
    };

    const key = this.getSessionKey(sessionId);
    await this.set(key, session, {
      ttl: this.SESSION_TTL,
      tags: [`user:${userId}`, 'sessions'],
    });

    // Track active sessions for user
    await this.addToUserSessions(userId, sessionId);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    const key = this.getSessionKey(sessionId);
    const session = await this.get<UserSession>(key);

    if (!session) return null;

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await this.deleteSession(sessionId);
      return null;
    }

    // Update last activity if enough time has passed
    const timeSinceLastActivity = Date.now() - new Date(session.lastActivity).getTime();
    if (timeSinceLastActivity > this.ACTIVITY_UPDATE_INTERVAL * 1000) {
      await this.updateLastActivity(sessionId);
    }

    return session;
  }

  async updateSession(sessionId: string, updates: Partial<UserSession>): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const updatedSession = { ...session, ...updates };
    const key = this.getSessionKey(sessionId);

    return await this.set(key, updatedSession, {
      ttl: this.SESSION_TTL,
      tags: [`user:${session.userId}`, 'sessions'],
    });
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const key = this.getSessionKey(sessionId);
    const deleted = await this.del(key);

    // Remove from user sessions
    await this.removeFromUserSessions(session.userId, sessionId);

    return deleted;
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    const sessionIds = await this.getUserSessions(userId);
    let deletedCount = 0;

    for (const sessionId of sessionIds) {
      const deleted = await this.deleteSession(sessionId);
      if (deleted) deletedCount++;
    }

    return deletedCount;
  }

  // User session tracking
  async getUserSessions(userId: string): Promise<string[]> {
    const key = this.getUserSessionsKey(userId);
    return await this.redis.smembers(key);
  }

  async getActiveSessionsCount(userId: string): Promise<number> {
    const sessionIds = await this.getUserSessions(userId);
    let activeCount = 0;

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) activeCount++;
    }

    return activeCount;
  }

  // Session analytics
  async getSessionAnalytics(): Promise<SessionAnalytics> {
    const allSessionKeys = await this.redis.keys(this.getSessionKey('*'));
    const totalSessions = allSessionKeys.length;

    let activeSessions = 0;
    let expiredSessions = 0;
    const userAgents: Record<string, number> = {};
    const locations: Record<string, number> = {};

    for (const key of allSessionKeys.slice(0, 1000)) {
      // Limit for performance
      const session = await this.get<UserSession>(key);
      if (!session) continue;

      if (new Date() > new Date(session.expiresAt)) {
        expiredSessions++;
      } else {
        activeSessions++;

        // Count user agents
        const agent = this.parseUserAgent(session.userAgent);
        userAgents[agent] = (userAgents[agent] || 0) + 1;

        // Count locations (if available)
        const location = await this.getLocationFromIP(session.ipAddress);
        if (location) {
          locations[location] = (locations[location] || 0) + 1;
        }
      }
    }

    return {
      totalSessions,
      activeSessions,
      expiredSessions,
      userAgents,
      locations,
    };
  }

  // Private methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `user:${userId}:sessions`;
  }

  private async addToUserSessions(userId: string, sessionId: string): Promise<void> {
    const key = this.getUserSessionsKey(userId);
    await this.redis.sadd(key, sessionId);
    await this.redis.expire(key, this.SESSION_TTL);
  }

  private async removeFromUserSessions(userId: string, sessionId: string): Promise<void> {
    const key = this.getUserSessionsKey(userId);
    await this.redis.srem(key, sessionId);
  }

  private async updateLastActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date();
      await this.updateSession(sessionId, session);
    }
  }

  private parseUserAgent(userAgent: string): string {
    // Simple user agent parsing - could use a library like ua-parser-js
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private async getLocationFromIP(ip: string): Promise<string | null> {
    // Implement IP geolocation if needed
    return null;
  }
}

interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  userAgents: Record<string, number>;
  locations: Record<string, number>;
}
```

## API Response Caching

### HTTP Cache Middleware

```typescript
// apps/api/src/middleware/cache.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CacheService } from '../services/cache.service';

export interface HttpCacheOptions {
  ttl: number;
  keyGenerator?: (request: FastifyRequest) => string;
  varyBy?: string[];
  skipIf?: (request: FastifyRequest) => boolean;
  tags?: string[];
}

export function createCacheMiddleware(options: HttpCacheOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Skip if condition met
    if (options.skipIf && options.skipIf(request)) {
      return;
    }

    const cacheService = new CacheService(request.server, request.server.redis);
    const cacheKey = options.keyGenerator ? options.keyGenerator(request) : generateHttpCacheKey(request, options.varyBy);

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      // Set cache headers
      reply.header('X-Cache', 'HIT');
      reply.header('Cache-Control', `public, max-age=${options.ttl}`);

      return reply.send(cached);
    }

    // Cache miss - set up response caching
    reply.header('X-Cache', 'MISS');

    const originalSend = reply.send.bind(reply);
    reply.send = function (payload: any) {
      // Cache successful responses only
      if (reply.statusCode >= 200 && reply.statusCode < 300) {
        cacheService
          .set(cacheKey, payload, {
            ttl: options.ttl,
            tags: options.tags,
          })
          .catch((error) => {
            request.log.error('Failed to cache response:', error);
          });
      }

      return originalSend(payload);
    };
  };
}

function generateHttpCacheKey(request: FastifyRequest, varyBy?: string[]): string {
  const parts = [request.method, request.url];

  // Include specific headers in cache key
  if (varyBy) {
    for (const header of varyBy) {
      const value = request.headers[header];
      if (value) {
        parts.push(`${header}:${value}`);
      }
    }
  }

  // Include user context for user-specific caching
  const userId = (request as any).user?.id;
  if (userId) {
    parts.push(`user:${userId}`);
  }

  return parts.join('|');
}
```

### Repository Layer Caching

```typescript
// apps/api/src/repositories/cached-user.repository.ts
import { UserRepository } from './user.repository';
import { CacheService } from '../services/cache.service';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { FastifyInstance } from 'fastify';

export class CachedUserRepository extends UserRepository {
  private cacheService: CacheService;
  private readonly USER_CACHE_TTL = 15 * 60; // 15 minutes
  private readonly LIST_CACHE_TTL = 5 * 60; // 5 minutes

  constructor(fastify: FastifyInstance) {
    super(fastify.knex);
    this.cacheService = new CacheService(fastify, fastify.redis);
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = this.cacheService.generateKey('user', id);

    // Try cache first
    let user = await this.cacheService.get<User>(cacheKey);
    if (user) {
      return user;
    }

    // Cache miss - get from database
    user = await super.findById(id);
    if (user) {
      await this.cacheService.set(cacheKey, user, {
        ttl: this.USER_CACHE_TTL,
        tags: [`user:${id}`, 'users'],
      });
    }

    return user;
  }

  async findAll(filters?: any, pagination?: any): Promise<{ users: User[]; total: number }> {
    const cacheKey = this.generateListCacheKey(filters, pagination);

    // Try cache first
    let result = await this.cacheService.get<{ users: User[]; total: number }>(cacheKey);
    if (result) {
      return result;
    }

    // Cache miss - get from database
    result = await super.findAll(filters, pagination);

    await this.cacheService.set(cacheKey, result, {
      ttl: this.LIST_CACHE_TTL,
      tags: ['users', 'user-lists'],
    });

    return result;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = await super.create(userData);

    // Cache the new user
    const userCacheKey = this.cacheService.generateKey('user', user.id);
    await this.cacheService.set(userCacheKey, user, {
      ttl: this.USER_CACHE_TTL,
      tags: [`user:${user.id}`, 'users'],
    });

    // Invalidate list caches
    await this.cacheService.invalidateByTag('user-lists');

    return user;
  }

  async update(id: string, updates: UpdateUserDto): Promise<User | null> {
    const user = await super.update(id, updates);

    if (user) {
      // Update cache
      const userCacheKey = this.cacheService.generateKey('user', id);
      await this.cacheService.set(userCacheKey, user, {
        ttl: this.USER_CACHE_TTL,
        tags: [`user:${id}`, 'users'],
      });

      // Invalidate list caches
      await this.cacheService.invalidateByTag('user-lists');
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await super.delete(id);

    if (deleted) {
      // Remove from cache
      const userCacheKey = this.cacheService.generateKey('user', id);
      await this.cacheService.del(userCacheKey);

      // Invalidate related caches
      await this.cacheService.invalidateByTag(`user:${id}`);
      await this.cacheService.invalidateByTag('user-lists');
    }

    return deleted;
  }

  // Bulk operations with cache management
  async bulkCreate(users: CreateUserDto[]): Promise<User[]> {
    const createdUsers = await super.bulkCreate(users);

    // Cache all created users
    const cachePromises = createdUsers.map((user) => {
      const key = this.cacheService.generateKey('user', user.id);
      return this.cacheService.set(key, user, {
        ttl: this.USER_CACHE_TTL,
        tags: [`user:${user.id}`, 'users'],
      });
    });

    await Promise.all(cachePromises);

    // Invalidate list caches
    await this.cacheService.invalidateByTag('user-lists');

    return createdUsers;
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateUserDto }>): Promise<User[]> {
    const updatedUsers = await super.bulkUpdate(updates);

    // Update cache for each user
    const cachePromises = updatedUsers.map((user) => {
      const key = this.cacheService.generateKey('user', user.id);
      return this.cacheService.set(key, user, {
        ttl: this.USER_CACHE_TTL,
        tags: [`user:${user.id}`, 'users'],
      });
    });

    await Promise.all(cachePromises);

    // Invalidate list caches
    await this.cacheService.invalidateByTag('user-lists');

    return updatedUsers;
  }

  // Search with caching
  async search(query: string, filters?: any): Promise<User[]> {
    const cacheKey = this.generateSearchCacheKey(query, filters);

    let results = await this.cacheService.get<User[]>(cacheKey);
    if (results) {
      return results;
    }

    results = await super.search(query, filters);

    await this.cacheService.set(cacheKey, results, {
      ttl: 2 * 60, // 2 minutes for search results
      tags: ['users', 'user-search'],
    });

    return results;
  }

  // Aggregate queries with caching
  async getUserStatistics(): Promise<any> {
    const cacheKey = 'user:statistics';

    let stats = await this.cacheService.get(cacheKey);
    if (stats) {
      return stats;
    }

    stats = await super.getUserStatistics();

    await this.cacheService.set(cacheKey, stats, {
      ttl: 30 * 60, // 30 minutes
      tags: ['users', 'statistics'],
    });

    return stats;
  }

  // Cache warming
  async warmCache(userIds: string[]): Promise<void> {
    const uncachedIds: string[] = [];

    // Check which users are not in cache
    for (const id of userIds) {
      const cacheKey = this.cacheService.generateKey('user', id);
      const exists = await this.cacheService.exists(cacheKey);
      if (!exists) {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached users in batch
    if (uncachedIds.length > 0) {
      const users = await super.findByIds(uncachedIds);

      // Cache them all
      const cachePromises = users.map((user) => {
        const key = this.cacheService.generateKey('user', user.id);
        return this.cacheService.set(key, user, {
          ttl: this.USER_CACHE_TTL,
          tags: [`user:${user.id}`, 'users'],
        });
      });

      await Promise.all(cachePromises);
    }
  }

  // Private helpers
  private generateListCacheKey(filters?: any, pagination?: any): string {
    const parts = ['users', 'list'];

    if (filters) {
      parts.push(JSON.stringify(filters));
    }

    if (pagination) {
      parts.push(`page:${pagination.page}`, `limit:${pagination.limit}`);
    }

    return parts.join(':');
  }

  private generateSearchCacheKey(query: string, filters?: any): string {
    const parts = ['users', 'search', query];

    if (filters) {
      parts.push(JSON.stringify(filters));
    }

    return parts.join(':');
  }
}
```

## Database Query Caching

### Knex Plugin Integration

```typescript
// apps/api/src/plugins/knex.plugin.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import knex, { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
    db: Knex; // Alias for convenience
  }
}

const knexPlugin: FastifyPluginAsync = async (fastify, options) => {
  const db = knex({
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
    debug: process.env.NODE_ENV === 'development',
  });

  // Test connection
  try {
    await db.raw('SELECT 1');
    fastify.log.info('Database connected successfully');
  } catch (error) {
    fastify.log.error('Failed to connect to database:', error);
    throw error;
  }

  // Decorate fastify with knex instance
  fastify.decorate('knex', db);
  fastify.decorate('db', db);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await db.destroy();
    fastify.log.info('Database connection closed');
  });
};

export default fp(knexPlugin, {
  name: 'knex',
  dependencies: [],
});
```

### Query Result Caching

```typescript
// apps/api/src/database/cached-query-builder.ts
import { Knex } from 'knex';
import { CacheService } from '../services/cache.service';
import { FastifyInstance } from 'fastify';

export class CachedQueryBuilder {
  private cacheService: CacheService;
  private knex: Knex;

  constructor(fastify: FastifyInstance) {
    this.knex = fastify.knex;
    this.cacheService = new CacheService(fastify, fastify.redis);
  }

  // Cached query execution
  async cachedQuery<T>(query: Knex.QueryBuilder, cacheKey: string, ttl: number = 300, tags: string[] = []): Promise<T[]> {
    // Try cache first
    const cached = await this.cacheService.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute query
    const results = await query;

    // Cache results
    await this.cacheService.set(cacheKey, results, { ttl, tags });

    return results;
  }

  // Cached aggregation queries
  async cachedCount(table: string, where?: any, cacheKey?: string, ttl: number = 600): Promise<number> {
    const key = cacheKey || `count:${table}:${JSON.stringify(where || {})}`;

    const cached = await this.cacheService.get<number>(key);
    if (cached !== null) {
      return cached;
    }

    const query = this.knex(table);
    if (where) {
      query.where(where);
    }

    const result = await query.count('* as count').first();
    const count = parseInt(result?.count as string) || 0;

    await this.cacheService.set(key, count, {
      ttl,
      tags: [table, 'counts'],
    });

    return count;
  }

  async cachedSum(table: string, column: string, where?: any, cacheKey?: string, ttl: number = 600): Promise<number> {
    const key = cacheKey || `sum:${table}:${column}:${JSON.stringify(where || {})}`;

    const cached = await this.cacheService.get<number>(key);
    if (cached !== null) {
      return cached;
    }

    const query = this.knex(table);
    if (where) {
      query.where(where);
    }

    const result = await query.sum(`${column} as sum`).first();
    const sum = parseFloat(result?.sum as string) || 0;

    await this.cacheService.set(key, sum, {
      ttl,
      tags: [table, 'aggregates'],
    });

    return sum;
  }

  // Cached complex queries
  async cachedRawQuery<T>(sql: string, bindings: any[] = [], cacheKey: string, ttl: number = 300, tags: string[] = []): Promise<T[]> {
    const cached = await this.cacheService.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.knex.raw(sql, bindings);
    const rows = results.rows || results;

    await this.cacheService.set(cacheKey, rows, { ttl, tags });

    return rows;
  }
}

// Usage in repositories
export class UserRepository {
  private queryBuilder: CachedQueryBuilder;

  constructor(fastify: FastifyInstance) {
    this.queryBuilder = new CachedQueryBuilder(fastify);
  }

  async getUserStatistics(): Promise<UserStatistics> {
    return this.queryBuilder.cachedRawQuery<UserStatistics>(
      `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_last_24h
      FROM users
      `,
      [],
      'user:statistics',
      30 * 60, // 30 minutes
      ['users', 'statistics'],
    );
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    const cacheKey = `users:by-role:${roleId}`;

    return this.queryBuilder.cachedQuery<User>(
      this.queryBuilder.knex('users').where('role_id', roleId),
      cacheKey,
      10 * 60, // 10 minutes
      ['users', `role:${roleId}`],
    );
  }
}
```

## Cache Invalidation Strategies

### Smart Cache Invalidation

```typescript
// apps/api/src/services/cache-invalidation.service.ts
export class CacheInvalidationService {
  private cacheService: CacheService;

  constructor(fastify: FastifyInstance) {
    this.cacheService = new CacheService(fastify, fastify.redis);
  }

  // Entity-based invalidation
  async invalidateUser(userId: string): Promise<void> {
    // Invalidate specific user cache
    await this.cacheService.invalidateByTag(`user:${userId}`);

    // Invalidate related caches
    await this.cacheService.invalidateByTag('user-lists');
    await this.cacheService.invalidateByTag('user-search');

    // Invalidate aggregates that might include this user
    await this.invalidateUserStatistics();

    // Invalidate role-based caches
    const user = await this.getUserFromDatabase(userId);
    if (user) {
      await this.cacheService.invalidateByTag(`role:${user.roleId}`);
    }
  }

  async invalidateUserStatistics(): Promise<void> {
    await this.cacheService.invalidateByTag('statistics');
    await this.cacheService.del('user:statistics');
  }

  // Time-based invalidation
  async invalidateExpiredCaches(): Promise<void> {
    // Get all keys with TTL
    const pattern = 'app:cache:*';
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // No expiration set
        await this.redis.expire(key, 3600); // Set 1 hour default
      }
    }
  }

  // Pattern-based invalidation for bulk operations
  async invalidateByOperationType(operation: 'create' | 'update' | 'delete', entity: string): Promise<void> {
    const patterns = {
      create: [`${entity}-lists`, `${entity}-search`, 'statistics'],
      update: [`${entity}:*`, `${entity}-lists`, `${entity}-search`, 'statistics'],
      delete: [`${entity}:*`, `${entity}-lists`, `${entity}-search`, 'statistics'],
    };

    const tagsToInvalidate = patterns[operation];

    for (const tag of tagsToInvalidate) {
      await this.cacheService.invalidateByTag(tag);
    }
  }

  // Scheduled cache maintenance
  async performCacheMaintenance(): Promise<CacheMaintenanceReport> {
    const report: CacheMaintenanceReport = {
      expiredKeysRemoved: 0,
      orphanedTagsRemoved: 0,
      memoryReclaimed: 0,
      timestamp: new Date(),
    };

    // Remove expired keys manually (Redis should handle this, but just in case)
    const expiredKeys = await this.findExpiredKeys();
    if (expiredKeys.length > 0) {
      await this.redis.del(...expiredKeys);
      report.expiredKeysRemoved = expiredKeys.length;
    }

    // Clean up orphaned tag sets
    const tagKeys = await this.redis.keys('tag:*');
    for (const tagKey of tagKeys) {
      const members = await this.redis.smembers(tagKey);
      const existingMembers = [];

      for (const member of members) {
        const exists = await this.redis.exists(member);
        if (exists) {
          existingMembers.push(member);
        }
      }

      if (existingMembers.length === 0) {
        await this.redis.del(tagKey);
        report.orphanedTagsRemoved++;
      } else if (existingMembers.length < members.length) {
        await this.redis.del(tagKey);
        await this.redis.sadd(tagKey, ...existingMembers);
      }
    }

    return report;
  }

  private async findExpiredKeys(): Promise<string[]> {
    const allKeys = await this.redis.keys('app:cache:*');
    const expiredKeys: string[] = [];

    for (const key of allKeys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -2) {
        // Key doesn't exist (expired)
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  private async getUserFromDatabase(userId: string): Promise<any> {
    // Implement direct database query without cache
    return null;
  }
}

interface CacheMaintenanceReport {
  expiredKeysRemoved: number;
  orphanedTagsRemoved: number;
  memoryReclaimed: number;
  timestamp: Date;
}
```

## Distributed Caching & Clustering

### Redis Cluster Setup with @fastify/redis

```typescript
// apps/api/src/plugins/redis-cluster.plugin.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

const redisClusterPlugin: FastifyPluginAsync = async (fastify, options) => {
  // Register Redis Cluster with @fastify/redis
  await fastify.register(require('@fastify/redis'), {
    host: process.env.REDIS_NODE1_HOST!,
    port: parseInt(process.env.REDIS_NODE1_PORT!),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: true,
    maxRetriesPerRequest: 5,
    retryDelayOnFailover: 1000,

    // Cluster configuration
    cluster: {
      enableReadyCheck: true,
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 10000,
        commandTimeout: 5000,
      },
      clusterRetryDelayOnFailover: 1000,
      clusterRetryDelayOnClusterDown: 300,
      scaleReads: 'slave',
      natMap: {
        // NAT mapping for Docker/K8s environments
        '10.0.1.10:6379': {
          host: process.env.REDIS_NODE1_PUBLIC_HOST!,
          port: parseInt(process.env.REDIS_NODE1_PUBLIC_PORT!),
        },
      },
    },
  });

  // Setup cluster event handlers
  fastify.redis.on('connect', () => {
    fastify.log.info('Redis cluster connected');
  });

  fastify.redis.on('ready', () => {
    fastify.log.info('Redis cluster ready');
  });

  fastify.redis.on('error', (err) => {
    fastify.log.error('Redis cluster error:', err);
  });

  fastify.redis.on('close', () => {
    fastify.log.info('Redis cluster connection closed');
  });

  fastify.redis.on('reconnecting', () => {
    fastify.log.info('Redis cluster reconnecting');
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await fastify.redis.quit();
  });
};

export default fp(redisClusterPlugin, {
  name: 'redis-cluster',
  dependencies: [],
});

export class RedisClusterManager {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async getClusterInfo(): Promise<any> {
    const redis = this.fastify.redis;

    // Get cluster info if available
    if (redis.constructor.name === 'Cluster') {
      return {
        nodes: (redis as any).nodes(),
        status: (redis as any).status,
        options: (redis as any).options,
      };
    }

    // Single node info
    const info = await redis.info();
    return {
      type: 'single-node',
      info: info,
    };
  }

  async getHealth(): Promise<any> {
    try {
      const ping = await this.fastify.redis.ping();
      const info = await this.fastify.redis.info('replication');

      return {
        status: 'healthy',
        ping,
        replication: info,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
```

### Distributed Cache Patterns

```typescript
// apps/api/src/patterns/distributed-cache.patterns.ts
export class DistributedCachePatterns {
  private cache: CacheService;

  constructor(fastify: FastifyInstance) {
    this.cache = new CacheService(fastify, fastify.redis);
  }

  // Write-Through Cache Pattern
  async writeThrough<T>(key: string, dbOperation: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    // Execute database operation
    const result = await dbOperation();

    // Write to cache
    await this.cache.set(key, result, options);

    return result;
  }

  // Write-Behind Cache Pattern (Write-Back)
  async writeBehind<T>(key: string, data: T, dbOperation: () => Promise<void>, options: CacheOptions = {}): Promise<T> {
    // Write to cache immediately
    await this.cache.set(key, data, options);

    // Schedule database write
    setImmediate(async () => {
      try {
        await dbOperation();
      } catch (error) {
        // Handle write-behind failures
        console.error('Write-behind operation failed:', error);
        // Could implement retry logic or dead letter queue
      }
    });

    return data;
  }

  // Cache-Aside Pattern (Lazy Loading)
  async cacheAside<T>(key: string, dbOperation: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    // Try cache first
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - load from database
    const result = await dbOperation();

    // Store in cache
    await this.cache.set(key, result, options);

    return result;
  }

  // Read-Through Cache Pattern
  async readThrough<T>(key: string, dbOperation: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    return this.cacheAside(key, dbOperation, options);
  }

  // Refresh-Ahead Pattern
  async refreshAhead<T>(
    key: string,
    dbOperation: () => Promise<T>,
    refreshThreshold: number = 0.8, // Refresh when 80% of TTL elapsed
    options: CacheOptions = {},
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);

    if (cached) {
      // Check if refresh is needed
      const ttl = await this.cache.redis.ttl(key);
      const originalTtl = options.ttl || 300;

      if (ttl > 0 && ttl < originalTtl * (1 - refreshThreshold)) {
        // Refresh in background
        setImmediate(async () => {
          try {
            const fresh = await dbOperation();
            await this.cache.set(key, fresh, options);
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        });
      }

      return cached;
    }

    // Cache miss - load and cache
    const result = await dbOperation();
    await this.cache.set(key, result, options);

    return result;
  }

  // Multi-Level Cache (L1: Memory, L2: Redis)
  async multiLevelCache<T>(key: string, dbOperation: () => Promise<T>, l1Cache: Map<string, any>, l1Ttl: number = 60, l2Options: CacheOptions = {}): Promise<T> {
    // L1 Cache (in-memory)
    if (l1Cache.has(key)) {
      return l1Cache.get(key);
    }

    // L2 Cache (Redis)
    const l2Cached = await this.cache.get<T>(key);
    if (l2Cached !== null) {
      // Store in L1 for faster access
      l1Cache.set(key, l2Cached);
      setTimeout(() => l1Cache.delete(key), l1Ttl * 1000);
      return l2Cached;
    }

    // Cache miss - load from database
    const result = await dbOperation();

    // Store in both levels
    l1Cache.set(key, result);
    setTimeout(() => l1Cache.delete(key), l1Ttl * 1000);
    await this.cache.set(key, result, l2Options);

    return result;
  }
}
```

## API Caching Implementation

### Controller Caching

```typescript
// apps/api/src/modules/users/user.controller.ts
import { Cache } from '../../decorators/cache.decorator';
import { createCacheMiddleware } from '../../middleware/cache.middleware';

export class UserController {
  private userService: UserService;
  private cacheService: CacheService;

  constructor(fastify: FastifyInstance) {
    this.userService = new UserService(fastify);
    this.cacheService = new CacheService(fastify, fastify.redis);
  }

  async register(fastify: FastifyInstance) {
    // List users with caching
    fastify.get(
      '/users',
      {
        preHandler: createCacheMiddleware({
          ttl: 5 * 60, // 5 minutes
          keyGenerator: (req) => {
            const { page = 1, limit = 10, search = '', role = '' } = req.query as any;
            return `users:list:${page}:${limit}:${search}:${role}`;
          },
          tags: ['users', 'user-lists'],
          varyBy: ['authorization'], // Different cache per user
        }),
      },
      this.getUsers.bind(this),
    );

    // Get user by ID with caching
    fastify.get(
      '/users/:id',
      {
        preHandler: createCacheMiddleware({
          ttl: 15 * 60, // 15 minutes
          keyGenerator: (req) => `user:${(req.params as any).id}`,
          tags: ['users'],
        }),
      },
      this.getUserById.bind(this),
    );

    // User statistics with long cache
    fastify.get(
      '/users/statistics',
      {
        preHandler: createCacheMiddleware({
          ttl: 30 * 60, // 30 minutes
          keyGenerator: () => 'users:statistics',
          tags: ['users', 'statistics'],
        }),
      },
      this.getUserStatistics.bind(this),
    );

    // Search users with short cache
    fastify.get(
      '/users/search',
      {
        preHandler: createCacheMiddleware({
          ttl: 2 * 60, // 2 minutes
          keyGenerator: (req) => {
            const { q = '', filters = '{}' } = req.query as any;
            return `users:search:${q}:${filters}`;
          },
          tags: ['users', 'user-search'],
        }),
      },
      this.searchUsers.bind(this),
    );

    // No cache for mutations
    fastify.post('/users', this.createUser.bind(this));
    fastify.put('/users/:id', this.updateUser.bind(this));
    fastify.delete('/users/:id', this.deleteUser.bind(this));
  }

  // Cached methods
  @Cache({
    ttl: 5 * 60,
    keyGenerator: (req) => `users:list:${JSON.stringify(req.query)}`,
    tags: ['users', 'user-lists'],
  })
  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.userService.getUsers(request.query as any);
    return reply.success(result);
  }

  @Cache({
    ttl: 15 * 60,
    keyGenerator: (req) => `user:${(req.params as any).id}`,
    tags: ['users'],
  })
  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const user = await this.userService.getUserById(id);

    if (!user) {
      return reply.notFound('User not found');
    }

    return reply.success(user);
  }

  // Mutation methods with cache invalidation
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const userData = request.body as CreateUserDto;
    const user = await this.userService.createUser(userData);

    // Invalidate relevant caches
    await this.cacheService.invalidateByTag('user-lists');
    await this.cacheService.invalidateByTag('statistics');

    return reply.status(201).send(user);
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const updates = request.body as UpdateUserDto;

    const user = await this.userService.updateUser(id, updates);

    if (!user) {
      return reply.notFound('User not found');
    }

    // Invalidate specific user and related caches
    await this.cacheService.invalidateByTag(`user:${id}`);
    await this.cacheService.invalidateByTag('user-lists');
    await this.cacheService.invalidateByTag('statistics');

    return reply.success(user);
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const deleted = await this.userService.deleteUser(id);

    if (!deleted) {
      return reply.notFound('User not found');
    }

    // Invalidate all related caches
    await this.cacheService.invalidateByTag(`user:${id}`);
    await this.cacheService.invalidateByTag('user-lists');
    await this.cacheService.invalidateByTag('statistics');

    return reply.status(204).send();
  }
}
```

## Session-Based Caching

### Session Store Implementation

```typescript
// apps/api/src/stores/redis-session.store.ts
import { SessionService } from '../services/session.service';
import { FastifyInstance } from 'fastify';

export class RedisSessionStore {
  private sessionService: SessionService;

  constructor(fastify: FastifyInstance) {
    this.sessionService = new SessionService(fastify);
  }

  // Session CRUD operations
  async get(sessionId: string): Promise<any> {
    return this.sessionService.getSession(sessionId);
  }

  async set(sessionId: string, session: any, maxAge?: number): Promise<void> {
    await this.sessionService.createSession(session.userId, {
      ...session,
      sessionId,
    });
  }

  async destroy(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
  }

  async touch(sessionId: string, maxAge: number): Promise<void> {
    const session = await this.sessionService.getSession(sessionId);
    if (session) {
      const expiresAt = new Date(Date.now() + maxAge * 1000);
      await this.sessionService.updateSession(sessionId, { expiresAt });
    }
  }

  // Session management
  async length(): Promise<number> {
    const keys = await this.sessionService.redis.keys('session:*');
    return keys.length;
  }

  async clear(): Promise<void> {
    await this.sessionService.invalidateByPattern('session:*');
  }

  async all(): Promise<any[]> {
    const keys = await this.sessionService.redis.keys('session:*');
    const sessions = [];

    for (const key of keys) {
      const session = await this.sessionService.get(key);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }
}

// Fastify session plugin configuration
export const sessionConfig = {
  store: RedisSessionStore,
  secret: process.env.SESSION_SECRET!,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};
```

## WebSocket Scaling with Redis

### Redis Adapter for WebSocket Scaling

```typescript
// apps/api/src/adapters/redis-websocket.adapter.ts
import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';

export class RedisWebSocketAdapter {
  private publisher: Redis;
  private subscriber: Redis;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.publisher = fastify.websocket;
    this.subscriber = fastify.websocket.duplicate();

    this.setupSubscriber();
  }

  private setupSubscriber(): void {
    this.subscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        this.handleBroadcastMessage(channel, data);
      } catch (error) {
        this.fastify.log.error('Failed to parse WebSocket message:', error);
      }
    });

    // Subscribe to broadcast channels
    this.subscriber.subscribe('ws:broadcast', 'ws:room', 'ws:user', 'ws:system');
  }

  // Broadcasting methods
  async broadcastToAll(message: any): Promise<void> {
    await this.publisher.publish(
      'ws:broadcast',
      JSON.stringify({
        type: 'broadcast',
        data: message,
        timestamp: Date.now(),
      }),
    );
  }

  async broadcastToRoom(roomId: string, message: any): Promise<void> {
    await this.publisher.publish(
      'ws:room',
      JSON.stringify({
        type: 'room',
        roomId,
        data: message,
        timestamp: Date.now(),
      }),
    );
  }

  async sendToUser(userId: string, message: any): Promise<void> {
    await this.publisher.publish(
      'ws:user',
      JSON.stringify({
        type: 'user',
        userId,
        data: message,
        timestamp: Date.now(),
      }),
    );
  }

  async sendSystemMessage(message: any): Promise<void> {
    await this.publisher.publish(
      'ws:system',
      JSON.stringify({
        type: 'system',
        data: message,
        timestamp: Date.now(),
      }),
    );
  }

  // Room management
  async joinRoom(userId: string, roomId: string): Promise<void> {
    await this.publisher.sadd(`room:${roomId}:members`, userId);
    await this.publisher.sadd(`user:${userId}:rooms`, roomId);

    // Set TTL for automatic cleanup
    await this.publisher.expire(`user:${userId}:rooms`, 24 * 60 * 60); // 24 hours
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    await this.publisher.srem(`room:${roomId}:members`, userId);
    await this.publisher.srem(`user:${userId}:rooms`, roomId);
  }

  async getRoomMembers(roomId: string): Promise<string[]> {
    return this.publisher.smembers(`room:${roomId}:members`);
  }

  async getUserRooms(userId: string): Promise<string[]> {
    return this.publisher.smembers(`user:${userId}:rooms`);
  }

  // Presence management
  async setUserOnline(userId: string, metadata?: any): Promise<void> {
    await this.publisher.hset(
      'presence:online',
      userId,
      JSON.stringify({
        timestamp: Date.now(),
        metadata: metadata || {},
      }),
    );

    await this.publisher.expire('presence:online', 60); // 1 minute TTL
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.publisher.hdel('presence:online', userId);
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.publisher.hkeys('presence:online');
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const exists = await this.publisher.hexists('presence:online', userId);
    return exists === 1;
  }

  // Message handling
  private async handleBroadcastMessage(channel: string, data: any): Promise<void> {
    switch (data.type) {
      case 'broadcast':
        await this.deliverBroadcast(data.data);
        break;

      case 'room':
        await this.deliverToRoom(data.roomId, data.data);
        break;

      case 'user':
        await this.deliverToUser(data.userId, data.data);
        break;

      case 'system':
        await this.deliverSystemMessage(data.data);
        break;

      default:
        this.fastify.log.warn('Unknown WebSocket message type:', data.type);
    }
  }

  private async deliverBroadcast(message: any): Promise<void> {
    // Deliver to all connected clients on this server instance
    for (const [clientId, client] of this.fastify.websocketClients.entries()) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        this.fastify.log.error(`Failed to deliver broadcast to client ${clientId}:`, error);
      }
    }
  }

  private async deliverToRoom(roomId: string, message: any): Promise<void> {
    const roomMembers = await this.getRoomMembers(roomId);

    for (const [clientId, client] of this.fastify.websocketClients.entries()) {
      if (client.userId && roomMembers.includes(client.userId)) {
        try {
          client.socket.send(JSON.stringify(message));
        } catch (error) {
          this.fastify.log.error(`Failed to deliver room message to client ${clientId}:`, error);
        }
      }
    }
  }

  private async deliverToUser(userId: string, message: any): Promise<void> {
    for (const [clientId, client] of this.fastify.websocketClients.entries()) {
      if (client.userId === userId) {
        try {
          client.socket.send(JSON.stringify(message));
        } catch (error) {
          this.fastify.log.error(`Failed to deliver user message to client ${clientId}:`, error);
        }
      }
    }
  }

  private async deliverSystemMessage(message: any): Promise<void> {
    // Deliver system messages to all authenticated clients
    for (const [clientId, client] of this.fastify.websocketClients.entries()) {
      if (client.userId) {
        try {
          client.socket.send(
            JSON.stringify({
              type: 'system',
              data: message,
            }),
          );
        } catch (error) {
          this.fastify.log.error(`Failed to deliver system message to client ${clientId}:`, error);
        }
      }
    }
  }
}
```

### Service Layer Caching

```typescript
// apps/api/src/modules/users/user.service.ts
export class UserService {
  private userRepository: CachedUserRepository;
  private cacheInvalidation: CacheInvalidationService;

  constructor(fastify: FastifyInstance) {
    this.userRepository = new CachedUserRepository(fastify);
    this.cacheInvalidation = new CacheInvalidationService(fastify);
  }

  async getUsers(filters: any = {}, pagination: any = {}): Promise<PaginatedResult<User>> {
    // Repository handles caching
    return this.userRepository.findAll(filters, pagination);
  }

  async getUserById(id: string): Promise<User | null> {
    // Repository handles caching
    return this.userRepository.findById(id);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(userData);

    // Cache warm-up for new user
    const cacheKey = `user:${user.id}`;
    await this.userRepository.cacheService.set(cacheKey, user, {
      ttl: 15 * 60,
      tags: [`user:${user.id}`, 'users'],
    });

    // Trigger cache invalidation
    await this.cacheInvalidation.invalidateByOperationType('create', 'user');

    return user;
  }

  async updateUser(id: string, updates: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.update(id, updates);

    if (user) {
      await this.cacheInvalidation.invalidateUser(id);
    }

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = await this.userRepository.delete(id);

    if (deleted) {
      await this.cacheInvalidation.invalidateUser(id);
    }

    return deleted;
  }

  // Bulk operations with efficient caching
  async bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserDto }>): Promise<User[]> {
    const users = await this.userRepository.bulkUpdate(updates);

    // Invalidate all affected users
    const userIds = updates.map((u) => u.id);
    await Promise.all(userIds.map((id) => this.cacheInvalidation.invalidateUser(id)));

    return users;
  }

  // Cache warming strategies
  async warmUserCache(userIds: string[]): Promise<void> {
    await this.userRepository.warmCache(userIds);
  }

  async warmPopularUsersCache(): Promise<void> {
    // Get most frequently accessed users
    const popularUsers = await this.getPopularUsers();
    const userIds = popularUsers.map((u) => u.id);
    await this.warmUserCache(userIds);
  }

  private async getPopularUsers(): Promise<User[]> {
    // This could be based on access logs, but for now return recent users
    return this.userRepository.findAll({ limit: 50, orderBy: 'last_login', order: 'desc' });
  }
}
```

## Advanced Caching Patterns

### Cache-First Pattern with Fallback

```typescript
// apps/api/src/patterns/cache-first.pattern.ts
export class CacheFirstPattern<T> {
  private cacheService: CacheService;
  private fallbackServices: Array<() => Promise<T>>;

  constructor(cacheService: CacheService, fallbackServices: Array<() => Promise<T>>) {
    this.cacheService = cacheService;
    this.fallbackServices = fallbackServices;
  }

  async get(key: string, options: CacheOptions = {}): Promise<T | null> {
    // Try cache first
    let result = await this.cacheService.get<T>(key);
    if (result !== null) {
      return result;
    }

    // Try fallback services in order
    for (const fallback of this.fallbackServices) {
      try {
        result = await fallback();
        if (result !== null) {
          // Cache the result
          await this.cacheService.set(key, result, options);
          return result;
        }
      } catch (error) {
        console.error('Fallback service error:', error);
        continue;
      }
    }

    return null;
  }
}

// Usage example
const userCacheFirst = new CacheFirstPattern<User>(cacheService, [
  () => userRepository.findById(userId), // Primary database
  () => userBackupRepository.findById(userId), // Backup database
  () => userApiService.getUserById(userId), // External API
]);

const user = await userCacheFirst.get(`user:${userId}`, { ttl: 15 * 60 });
```

### Cache Warming Scheduler

```typescript
// apps/api/src/schedulers/cache-warming.scheduler.ts
import cron from 'node-cron';

export class CacheWarmingScheduler {
  private cacheService: CacheService;
  private userService: UserService;

  constructor(cacheService: CacheService, userService: UserService) {
    this.cacheService = cacheService;
    this.userService = userService;
  }

  startScheduler(): void {
    // Warm popular data every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.warmPopularData();
    });

    // Warm daily statistics every hour
    cron.schedule('0 * * * *', async () => {
      await this.warmStatistics();
    });

    // Clean up expired caches every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.performCacheMaintenance();
    });

    // Pre-warm for business hours
    cron.schedule('0 8 * * 1-5', async () => {
      // 8 AM on weekdays
      await this.preWarmForBusinessHours();
    });
  }

  private async warmPopularData(): Promise<void> {
    try {
      // Warm user lists with common filters
      const commonFilters = [{ isActive: true }, { role: 'admin' }, { role: 'manager' }];

      for (const filter of commonFilters) {
        await this.userService.getUsers(filter, { page: 1, limit: 20 });
      }

      // Warm user statistics
      await this.userService.getUserStatistics();

      console.log('Popular data warmed successfully');
    } catch (error) {
      console.error('Failed to warm popular data:', error);
    }
  }

  private async warmStatistics(): Promise<void> {
    try {
      // Pre-calculate and cache statistics
      await this.userService.getUserStatistics();
      await this.userService.getDailyActiveUsers();
      await this.userService.getMonthlyGrowth();

      console.log('Statistics warmed successfully');
    } catch (error) {
      console.error('Failed to warm statistics:', error);
    }
  }

  private async performCacheMaintenance(): Promise<void> {
    try {
      const invalidationService = new CacheInvalidationService(this.fastify);
      const report = await invalidationService.performCacheMaintenance();

      console.log('Cache maintenance completed:', report);
    } catch (error) {
      console.error('Cache maintenance failed:', error);
    }
  }

  private async preWarmForBusinessHours(): Promise<void> {
    try {
      // Pre-warm data that's commonly accessed during business hours
      await this.warmPopularData();

      // Warm data for active users
      const activeUsers = await this.userService.getActiveUsers();
      const userIds = activeUsers.map((u) => u.id);
      await this.userService.warmUserCache(userIds.slice(0, 100)); // Top 100

      console.log('Business hours cache pre-warmed');
    } catch (error) {
      console.error('Failed to pre-warm for business hours:', error);
    }
  }
}
```

## Cache Monitoring & Analytics

### Cache Metrics Service

```typescript
// apps/api/src/services/cache-metrics.service.ts
export class CacheMetricsService {
  private cacheService: CacheService;
  private metricsCache: Map<string, any> = new Map();

  constructor(fastify: FastifyInstance) {
    this.cacheService = new CacheService(fastify, fastify.redis);
    this.startMetricsCollection();
  }

  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(async () => {
      await this.collectMetrics();
    }, 60 * 1000);
  }

  private async collectMetrics(): Promise<void> {
    try {
      const stats = await this.cacheService.getStats();
      const timestamp = Date.now();

      // Store metrics in time-series format
      await this.cacheService.redis.zadd('metrics:cache:memory', timestamp, stats.memoryUsed);

      await this.cacheService.redis.zadd('metrics:cache:keys', timestamp, stats.totalKeys);

      await this.cacheService.redis.zadd('metrics:cache:hitrate', timestamp, stats.hitRate);

      // Keep only last 24 hours of metrics
      const yesterday = timestamp - 24 * 60 * 60 * 1000;
      await this.cacheService.redis.zremrangebyscore('metrics:cache:memory', 0, yesterday);
      await this.cacheService.redis.zremrangebyscore('metrics:cache:keys', 0, yesterday);
      await this.cacheService.redis.zremrangebyscore('metrics:cache:hitrate', 0, yesterday);
    } catch (error) {
      console.error('Failed to collect cache metrics:', error);
    }
  }

  async getCacheMetrics(timeRange: '1h' | '6h' | '24h' = '24h'): Promise<CacheMetrics> {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };

    const start = now - ranges[timeRange];

    const [memoryData, keysData, hitRateData] = await Promise.all([this.cacheService.redis.zrangebyscore('metrics:cache:memory', start, now, 'WITHSCORES'), this.cacheService.redis.zrangebyscore('metrics:cache:keys', start, now, 'WITHSCORES'), this.cacheService.redis.zrangebyscore('metrics:cache:hitrate', start, now, 'WITHSCORES')]);

    return {
      timeRange,
      memory: this.parseMetricsData(memoryData),
      keys: this.parseMetricsData(keysData),
      hitRate: this.parseMetricsData(hitRateData),
      currentStats: await this.cacheService.getStats(),
    };
  }

  async getCacheTopKeys(limit: number = 20): Promise<CacheKeyStats[]> {
    // This would require additional tracking of key access frequency
    // For now, return most recently accessed keys
    const pattern = 'app:cache:*';
    const keys = await this.cacheService.redis.keys(pattern);

    const keyStats: CacheKeyStats[] = [];

    for (const key of keys.slice(0, limit)) {
      const ttl = await this.cacheService.redis.ttl(key);
      const size = await this.getKeySize(key);

      keyStats.push({
        key: key.replace('app:cache:', ''),
        ttl: ttl > 0 ? ttl : null,
        size,
        lastAccessed: new Date(), // Placeholder
      });
    }

    return keyStats.sort((a, b) => b.size - a.size);
  }

  async getSlowQueries(threshold: number = 1000): Promise<SlowQueryStats[]> {
    // Track slow database queries that should be cached
    const slowQueries = await this.cacheService.redis.zrangebyscore('metrics:slow-queries', threshold, '+inf', 'WITHSCORES');

    return this.parseSlowQueries(slowQueries);
  }

  private parseMetricsData(data: string[]): Array<{ timestamp: number; value: number }> {
    const result = [];
    for (let i = 0; i < data.length; i += 2) {
      result.push({
        value: parseFloat(data[i]),
        timestamp: parseInt(data[i + 1]),
      });
    }
    return result;
  }

  private async getKeySize(key: string): Promise<number> {
    const value = await this.cacheService.redis.get(key);
    return value ? Buffer.byteLength(value, 'utf8') : 0;
  }

  private parseSlowQueries(data: string[]): SlowQueryStats[] {
    // Implementation depends on how slow queries are tracked
    return [];
  }
}

interface CacheMetrics {
  timeRange: string;
  memory: Array<{ timestamp: number; value: number }>;
  keys: Array<{ timestamp: number; value: number }>;
  hitRate: Array<{ timestamp: number; value: number }>;
  currentStats: any;
}

interface CacheKeyStats {
  key: string;
  ttl: number | null;
  size: number;
  lastAccessed: Date;
}

interface SlowQueryStats {
  query: string;
  duration: number;
  frequency: number;
  lastExecuted: Date;
}
```

## Production Redis Configuration

### Docker Compose with Redis Cluster

```yaml
# docker/redis-cluster.yml
version: '3.8'

services:
  redis-node-1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 6379
    ports:
      - '6379:6379'
      - '16379:16379'
    volumes:
      - redis-node-1-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}

  redis-node-2:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 6379
    ports:
      - '6380:6379'
      - '16380:16379'
    volumes:
      - redis-node-2-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}

  redis-node-3:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --port 6379
    ports:
      - '6381:6379'
      - '16381:16379'
    volumes:
      - redis-node-3-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}

  redis-cluster-init:
    image: redis:7-alpine
    depends_on:
      - redis-node-1
      - redis-node-2
      - redis-node-3
    command: >
      redis-cli --cluster create
      redis-node-1:6379
      redis-node-2:6379
      redis-node-3:6379
      --cluster-replicas 0
      --cluster-yes
    environment:
      REDISCLI_AUTH: ${REDIS_PASSWORD}

volumes:
  redis-node-1-data:
  redis-node-2-data:
  redis-node-3-data:
```

### Redis Configuration File

```bash
# docker/redis/redis.conf
# Memory optimization
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass ${REDIS_PASSWORD}
protected-mode yes

# Performance
tcp-keepalive 300
timeout 0

# Cluster settings
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip ${REDIS_ANNOUNCE_IP}
cluster-announce-port 6379
cluster-announce-bus-port 16379

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Network
bind 0.0.0.0
port 6379

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

### Health Check & Monitoring

```typescript
// apps/api/src/health/redis.health.ts
import { FastifyInstance } from 'fastify';

export class RedisHealthCheck {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([this.checkCacheRedis(), this.checkSessionRedis(), this.checkWebSocketRedis()]);

    const results = checks.map((check, index) => ({
      name: ['cache', 'session', 'websocket'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason,
      timestamp: new Date(),
    }));

    const overallStatus = results.every((r) => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date(),
    };
  }

  private async checkCacheRedis(): Promise<RedisHealthDetails> {
    const start = performance.now();

    try {
      // Test basic operations
      await this.fastify.redis.ping();
      await this.fastify.redis.set('health:check', 'ok', 'EX', 60);
      const value = await this.fastify.redis.get('health:check');

      if (value !== 'ok') {
        throw new Error('Cache read/write test failed');
      }

      const latency = performance.now() - start;
      const info = await this.fastify.redis.info('memory');

      return {
        status: 'healthy',
        latency: Math.round(latency),
        memoryUsage: this.parseMemoryUsage(info),
        uptime: await this.getUptime(this.fastify.redis),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: performance.now() - start,
      };
    }
  }

  private async checkSessionRedis(): Promise<RedisHealthDetails> {
    const start = performance.now();

    try {
      await this.fastify.session.ping();

      // Test session operations
      const testSessionId = 'health:check:session';
      await this.fastify.session.hset(testSessionId, 'test', 'value');
      const value = await this.fastify.session.hget(testSessionId, 'test');
      await this.fastify.session.del(testSessionId);

      if (value !== 'value') {
        throw new Error('Session read/write test failed');
      }

      const latency = performance.now() - start;

      return {
        status: 'healthy',
        latency: Math.round(latency),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: performance.now() - start,
      };
    }
  }

  private async checkWebSocketRedis(): Promise<RedisHealthDetails> {
    const start = performance.now();

    try {
      await this.fastify.websocket.ping();

      // Test pub/sub
      const testChannel = 'health:check:channel';
      let messageReceived = false;

      const testSubscriber = this.fastify.websocket.duplicate();
      testSubscriber.subscribe(testChannel);

      testSubscriber.on('message', (channel, message) => {
        if (channel === testChannel && message === 'test') {
          messageReceived = true;
        }
      });

      await this.fastify.websocket.publish(testChannel, 'test');

      // Wait for message
      await new Promise((resolve) => setTimeout(resolve, 100));

      testSubscriber.disconnect();

      if (!messageReceived) {
        throw new Error('Pub/sub test failed');
      }

      const latency = performance.now() - start;

      return {
        status: 'healthy',
        latency: Math.round(latency),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: performance.now() - start,
      };
    }
  }

  private parseMemoryUsage(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private async getUptime(redis: Redis): Promise<number> {
    const info = await redis.info('server');
    const match = info.match(/uptime_in_seconds:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'healthy' | 'unhealthy';
    details: any;
    timestamp: Date;
  }>;
  timestamp: Date;
}

interface RedisHealthDetails {
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
  memoryUsage?: number;
  uptime?: number;
}
```

### Cache Dashboard API

```typescript
// apps/api/src/modules/admin/cache.controller.ts
export class CacheController {
  private cacheService: CacheService;
  private metricsService: CacheMetricsService;
  private invalidationService: CacheInvalidationService;

  constructor(fastify: FastifyInstance) {
    this.cacheService = new CacheService(fastify, fastify.redis);
    this.metricsService = new CacheMetricsService(fastify);
    this.invalidationService = new CacheInvalidationService(fastify);
  }

  async register(fastify: FastifyInstance) {
    // Cache statistics
    fastify.get(
      '/admin/cache/stats',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.read')],
      },
      this.getCacheStats.bind(this),
    );

    // Cache metrics
    fastify.get(
      '/admin/cache/metrics',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.read')],
      },
      this.getCacheMetrics.bind(this),
    );

    // Top cache keys
    fastify.get(
      '/admin/cache/top-keys',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.read')],
      },
      this.getTopCacheKeys.bind(this),
    );

    // Cache invalidation
    fastify.delete(
      '/admin/cache/:key',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.manage')],
      },
      this.invalidateKey.bind(this),
    );

    fastify.delete(
      '/admin/cache/tag/:tag',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.manage')],
      },
      this.invalidateByTag.bind(this),
    );

    fastify.delete(
      '/admin/cache/pattern/:pattern',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.manage')],
      },
      this.invalidateByPattern.bind(this),
    );

    // Cache maintenance
    fastify.post(
      '/admin/cache/maintenance',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.manage')],
      },
      this.performMaintenance.bind(this),
    );

    // Cache warming
    fastify.post(
      '/admin/cache/warm',
      {
        preHandler: [fastify.authenticate, fastify.requirePermission('admin.cache.manage')],
      },
      this.warmCache.bind(this),
    );
  }

  async getCacheStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await this.cacheService.getStats();
    return reply.send(stats);
  }

  async getCacheMetrics(request: FastifyRequest, reply: FastifyReply) {
    const { timeRange = '24h' } = request.query as any;
    const metrics = await this.metricsService.getCacheMetrics(timeRange);
    return reply.send(metrics);
  }

  async getTopCacheKeys(request: FastifyRequest, reply: FastifyReply) {
    const { limit = 20 } = request.query as any;
    const topKeys = await this.metricsService.getCacheTopKeys(limit);
    return reply.send(topKeys);
  }

  async invalidateKey(request: FastifyRequest, reply: FastifyReply) {
    const { key } = request.params as any;
    const deleted = await this.cacheService.del(key);
    return reply.send({ deleted, key });
  }

  async invalidateByTag(request: FastifyRequest, reply: FastifyReply) {
    const { tag } = request.params as any;
    const count = await this.cacheService.invalidateByTag(tag);
    return reply.send({ invalidated: count, tag });
  }

  async invalidateByPattern(request: FastifyRequest, reply: FastifyReply) {
    const { pattern } = request.params as any;
    const count = await this.cacheService.invalidateByPattern(pattern);
    return reply.send({ invalidated: count, pattern });
  }

  async performMaintenance(request: FastifyRequest, reply: FastifyReply) {
    const report = await this.invalidationService.performCacheMaintenance();
    return reply.send(report);
  }

  async warmCache(request: FastifyRequest, reply: FastifyReply) {
    const { type = 'popular' } = request.body as any;

    let result;
    switch (type) {
      case 'popular':
        result = await this.warmPopularData();
        break;
      case 'statistics':
        result = await this.warmStatistics();
        break;
      case 'users':
        const { userIds } = request.body as any;
        result = await this.warmUserData(userIds);
        break;
      default:
        return reply.status(400).send({ error: 'Invalid warm type' });
    }

    return reply.success(result);
  }

  private async warmPopularData(): Promise<any> {
    // Implementation for warming popular data
    return { status: 'completed', type: 'popular' };
  }

  private async warmStatistics(): Promise<any> {
    // Implementation for warming statistics
    return { status: 'completed', type: 'statistics' };
  }

  private async warmUserData(userIds: string[]): Promise<any> {
    // Implementation for warming specific user data
    return { status: 'completed', type: 'users', count: userIds.length };
  }
}
```

## Testing Redis Cache

### Unit Tests for Cache Service

```typescript
// apps/api/src/services/__tests__/cache.service.test.ts
import { CacheService } from '../cache.service';
import Redis from 'ioredis-mock';

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: Redis;
  let mockFastify: any;

  beforeEach(() => {
    mockRedis = new Redis();
    mockFastify = {
      redis: mockRedis,
      log: { error: jest.fn() },
    };
    cacheService = new CacheService(mockFastify, mockRedis);
  });

  afterEach(async () => {
    await mockRedis.flushall();
  });

  describe('basic operations', () => {
    it('should set and get values', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };

      await cacheService.set(key, value);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should respect TTL', async () => {
      const key = 'test:ttl';
      const value = 'test-value';

      await cacheService.set(key, value, { ttl: 1 });

      let retrieved = await cacheService.get(key);
      expect(retrieved).toBe(value);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });

    it('should handle tags for bulk invalidation', async () => {
      await cacheService.set('user:1', { id: 1 }, { tags: ['users'] });
      await cacheService.set('user:2', { id: 2 }, { tags: ['users'] });
      await cacheService.set('post:1', { id: 1 }, { tags: ['posts'] });

      // Invalidate by tag
      const invalidated = await cacheService.invalidateByTag('users');
      expect(invalidated).toBe(2);

      // Check that user caches are gone
      expect(await cacheService.get('user:1')).toBeNull();
      expect(await cacheService.get('user:2')).toBeNull();

      // But post cache remains
      expect(await cacheService.get('post:1')).toEqual({ id: 1 });
    });
  });

  describe('multi operations', () => {
    it('should handle multiple get operations', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      await cacheService.set('key3', 'value3');

      const results = await cacheService.mget(['key1', 'key2', 'key4']);

      expect(results).toEqual({
        key1: 'value1',
        key2: 'value2',
        key4: null,
      });
    });

    it('should handle multiple set operations', async () => {
      const entries = {
        'multi:1': { value: { id: 1 }, options: { ttl: 60 } },
        'multi:2': { value: { id: 2 }, options: { ttl: 60 } },
        'multi:3': { value: { id: 3 }, options: { ttl: 60 } },
      };

      const success = await cacheService.mset(entries);
      expect(success).toBe(true);

      const results = await cacheService.mget(Object.keys(entries));
      expect(results['multi:1']).toEqual({ id: 1 });
      expect(results['multi:2']).toEqual({ id: 2 });
      expect(results['multi:3']).toEqual({ id: 3 });
    });
  });
});
```

### Integration Tests

```typescript
// apps/api/src/__tests__/cache-integration.test.ts
describe('Cache Integration', () => {
  let app: FastifyInstance;
  let cacheService: CacheService;

  beforeAll(async () => {
    app = await buildApp();
    cacheService = new CacheService(app, app.redis);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.redis.flushall();
  });

  it('should cache API responses', async () => {
    // First request - should hit database
    const response1 = await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    expect(response1.statusCode).toBe(200);
    expect(response1.headers['x-cache']).toBe('MISS');

    // Second request - should hit cache
    const response2 = await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    expect(response2.statusCode).toBe(200);
    expect(response2.headers['x-cache']).toBe('HIT');
    expect(response2.payload).toBe(response1.payload);
  });

  it('should invalidate cache on mutations', async () => {
    // Cache user list
    await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    // Verify cache exists
    const cached = await cacheService.exists('users:list:{}');
    expect(cached).toBe(true);

    // Create new user
    await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    });

    // Verify cache was invalidated
    const stillCached = await cacheService.exists('users:list:{}');
    expect(stillCached).toBe(false);
  });

  it('should handle cache failures gracefully', async () => {
    // Simulate Redis failure
    await app.redis.disconnect();

    // API should still work without cache
    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-cache']).toBe('MISS');
  });
});
```

### E2E Cache Testing

```typescript
// e2e/cache.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cache Performance', () => {
  test('should improve page load times with cache', async ({ page }) => {
    // First load - cache miss
    const start1 = Date.now();
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    const firstLoad = Date.now() - start1;

    // Reload - should be faster with cache
    const start2 = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoad = Date.now() - start2;

    // Second load should be noticeably faster
    expect(secondLoad).toBeLessThan(firstLoad * 0.8);
  });

  test('should update cache when data changes', async ({ page }) => {
    await page.goto('/users');

    // Take screenshot of initial state
    await page.screenshot({ path: 'cache-test-initial.png' });

    // Add new user
    await page.click('[data-testid="add-user"]');
    await page.fill('[name="firstName"]', 'Cache');
    await page.fill('[name="lastName"]', 'Test');
    await page.fill('[name="email"]', 'cache@test.com');
    await page.click('[type="submit"]');

    // Should return to list and show new user
    await expect(page.getByText('Cache Test')).toBeVisible();

    // Verify cache was invalidated and updated
    await page.screenshot({ path: 'cache-test-updated.png' });
  });
});
```

## Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Redis Cluster (Production)
REDIS_NODE1_HOST=redis-node-1
REDIS_NODE1_PORT=6379
REDIS_NODE1_PUBLIC_HOST=your-domain.com
REDIS_NODE1_PUBLIC_PORT=6379

REDIS_NODE2_HOST=redis-node-2
REDIS_NODE2_PORT=6379

REDIS_NODE3_HOST=redis-node-3
REDIS_NODE3_PORT=6379

# Session Redis
REDIS_SESSION_HOST=localhost
REDIS_SESSION_PORT=6379
REDIS_SESSION_PASSWORD=your-session-redis-password

# WebSocket Redis
REDIS_WS_HOST=localhost
REDIS_WS_PORT=6379
REDIS_WS_PASSWORD=your-ws-redis-password

# Cache Settings
CACHE_DEFAULT_TTL=300
CACHE_MAX_SIZE=100mb
CACHE_COMPRESSION_THRESHOLD=1024

# Session Settings
SESSION_SECRET=your-session-secret-key
SESSION_TTL=604800

# Performance
REDIS_POOL_SIZE=10
REDIS_CONNECTION_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

## Best Practices

### Caching Best Practices

1. **Cache Hierarchically**: Use different TTLs for different data types
2. **Tag Everything**: Use tags for efficient bulk invalidation
3. **Monitor Performance**: Track hit rates and response times
4. **Handle Failures**: Graceful degradation when Redis is unavailable
5. **Compress Large Objects**: Use compression for objects > 1KB
6. **Batch Operations**: Use pipeline for multiple operations
7. **Security**: Never cache sensitive data without encryption
8. **Consistent Keys**: Use consistent key naming conventions

### Redis Operations Optimization

1. **Use Pipeline**: Batch multiple commands for better performance
2. **Choose Right Data Structures**: Lists vs Sets vs Hashes vs Strings
3. **Memory Management**: Set appropriate maxmemory and eviction policies
4. **Connection Pooling**: Reuse connections and configure pool sizes
5. **Cluster Wisely**: Use cluster only when needed for scale
6. **Monitor Memory**: Track memory usage and optimize key patterns
7. **Backup Strategy**: Regular backups and point-in-time recovery
8. **Network Optimization**: Minimize network round trips

### Cache Invalidation Rules

1. **Immediate Invalidation**: For critical data consistency
2. **Lazy Invalidation**: For non-critical data with stale tolerance
3. **Time-Based**: For analytics and statistics
4. **Event-Driven**: Based on business events
5. **Tag-Based**: For related data invalidation
6. **Pattern-Based**: For bulk operations
7. **Smart Warming**: Pre-warm after invalidation
8. **Monitoring**: Track invalidation patterns

### Redis Security

1. **Authentication**: Always use password authentication
2. **Network Security**: Use VPN or private networks
3. **Encryption**: Enable TLS for data in transit
4. **Access Control**: Implement ACLs for different services
5. **Monitoring**: Log all Redis operations
6. **Backup Security**: Encrypt backup files
7. **Update Regularly**: Keep Redis version updated
8. **Resource Limits**: Set appropriate memory and connection limits

## Performance Benchmarks

### Expected Performance Metrics

- **Cache Hit Rate**: > 85%
- **Cache Response Time**: < 1ms for simple gets
- **Memory Usage**: < 80% of allocated memory
- **Network Latency**: < 5ms between app and Redis
- **Throughput**: > 10,000 operations/second
- **CPU Usage**: < 30% under normal load

### Monitoring & Alerting

```bash
# Key metrics to monitor
- redis_connected_clients
- redis_used_memory_percent
- redis_hit_rate
- redis_evicted_keys
- redis_expired_keys
- redis_network_io
- redis_cpu_usage

# Alert thresholds
- Memory usage > 80%
- Hit rate < 70%
- Connection count > 90% of max
- Evicted keys > 1000/hour
- Response time > 10ms
```
