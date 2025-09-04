# RBAC & Authentication with @fastify/auth

## RBAC with @fastify/auth (Complex Authentication)

```typescript
// apps/api/src/plugins/auth-strategies.plugin.ts
export default fp(
  async function authStrategiesPlugin(fastify: FastifyInstance) {
    // Strategy 1: JWT Authentication
    fastify.decorate('verifyJWT', async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        throw new Error('INVALID_TOKEN');
      }
    });

    // Strategy 2: Role-based Authorization
    fastify.decorate('verifyRole', function (allowedRoles: string[]) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as any;
        if (!user || !allowedRoles.includes(user.role)) {
          throw new Error('INSUFFICIENT_PERMISSIONS');
        }
      };
    });

    // Strategy 3: Resource Ownership
    fastify.decorate('verifyOwnership', function (resourceParam: string = 'id') {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as any;
        const resourceId = (request.params as any)[resourceParam];

        // Check if user owns resource or is admin
        if (user.role !== 'admin' && user.id !== resourceId) {
          throw new Error('RESOURCE_ACCESS_DENIED');
        }
      };
    });

    // Strategy 4: Permission-based Authorization
    fastify.decorate('verifyPermission', function (resource: string, action: string) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as any;

        // Check user permissions from database or cache
        const hasPermission = await fastify.permissionService.checkPermission(user.id, resource, action);

        if (!hasPermission) {
          throw new Error('PERMISSION_DENIED');
        }
      };
    });

    // Strategy 5: Time-based Access (business hours)
    fastify.decorate('verifyBusinessHours', async function (request: FastifyRequest, reply: FastifyReply) {
      const now = new Date();
      const hour = now.getHours();

      // Allow only during business hours (9 AM - 6 PM)
      if (hour < 9 || hour >= 18) {
        throw new Error('OUTSIDE_BUSINESS_HOURS');
      }
    });

    // Strategy 6: Rate Limiting per User
    fastify.decorate('verifyUserRateLimit', function (maxRequests: number) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as any;
        const key = `rate_limit:${user.id}`;

        // Check Redis for user rate limit
        const current = await fastify.redis.incr(key);
        if (current === 1) {
          await fastify.redis.expire(key, 60); // 1 minute window
        }

        if (current > maxRequests) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
      };
    });
  },
  {
    name: 'auth-strategies-plugin',
    dependencies: ['jwt-plugin', 'auth-plugin'],
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyOwnership: (param?: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyPermission: (resource: string, action: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyBusinessHours: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyUserRateLimit: (max: number) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
```

## RBAC Route Examples with @fastify/auth

```typescript
// Complex authentication combinations
async function userRoutes(fastify: FastifyInstance) {
  // Public endpoint - no auth
  fastify.route({
    method: 'GET',
    url: '/public-info',
    schema: {
      /* ... */
    },
    handler: async () => ({ info: 'public' }),
  });

  // Simple JWT auth
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth([fastify.verifyJWT]),
    handler: async () => {
      /* list users */
    },
  });

  // JWT + Role authorization
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth([fastify.verifyJWT, fastify.verifyRole(['admin', 'manager'])]),
    handler: async () => {
      /* create user */
    },
  });

  // JWT + Permission-based
  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth([fastify.verifyJWT, fastify.verifyPermission('users', 'update')]),
    handler: async () => {
      /* update user */
    },
  });

  // Complex: JWT + (Admin OR Owner)
  fastify.route({
    method: 'GET',
    url: '/:id/profile',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth(
      [
        fastify.verifyJWT,
        // Either admin role OR resource owner
        [fastify.verifyRole(['admin']), fastify.verifyOwnership('id')],
      ],
      { relation: 'or' },
    ), // OR relationship
    handler: async () => {
      /* get profile */
    },
  });

  // Multiple conditions with AND
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth([
      fastify.verifyJWT, // Must be authenticated
      fastify.verifyRole(['admin']), // Must be admin
      fastify.verifyBusinessHours, // Must be business hours
      fastify.verifyUserRateLimit(5), // Max 5 deletes per minute
    ]), // AND relationship (default)
    handler: async () => {
      /* delete user */
    },
  });

  // Advanced: Multiple strategies with mixed logic
  fastify.route({
    method: 'POST',
    url: '/:id/sensitive-action',
    schema: {
      /* ... */
    },
    preHandler: fastify.auth(
      [
        fastify.verifyJWT,
        // (Admin + Business Hours) OR (SuperAdmin anytime)
        [[fastify.verifyRole(['admin']), fastify.verifyBusinessHours], fastify.verifyRole(['super-admin'])],
      ],
      { relation: 'or' },
    ),
    handler: async () => {
      /* sensitive action */
    },
  });
}
```

## Permission Service for Fine-grained RBAC

```typescript
// apps/api/src/services/permission.service.ts
export class PermissionService {
  constructor(private knex: Knex) {}

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const result = await this.knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .join('role_permissions', 'roles.id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where({
        'users.id': userId,
        'permissions.resource': resource,
        'permissions.action': action,
      })
      .first();

    return !!result;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const permissions = await this.knex('users').join('roles', 'users.role_id', 'roles.id').join('role_permissions', 'roles.id', 'role_permissions.role_id').join('permissions', 'role_permissions.permission_id', 'permissions.id').where('users.id', userId).select('permissions.resource', 'permissions.action');

    return permissions.map((p) => `${p.resource}:${p.action}`);
  }

  async cacheUserPermissions(userId: string): Promise<void> {
    const permissions = await this.getUserPermissions(userId);
    await this.redis.setex(`permissions:${userId}`, 300, JSON.stringify(permissions));
  }

  async getCachedPermissions(userId: string): Promise<string[] | null> {
    const cached = await this.redis.get(`permissions:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

## Auth Registration in Main App

```typescript
// Update plugin registration order
await app.register(import('@fastify/jwt'), {
  /* ... */
});
await app.register(import('@fastify/cookie'), {
  /* ... */
});
await app.register(import('@fastify/auth')); // Add this
await app.register(import('./plugins/auth-strategies.plugin.js'));
```
