import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import '../../../types/fastify.d';
import '../../../types/jwt.types';

async function authStrategiesPlugin(fastify: FastifyInstance) {
  // Strategy 1: JWT Authentication
  fastify.decorate(
    'verifyJWT',
    async function (request: FastifyRequest, reply: FastifyReply) {
      console.log('[DEBUG] verifyJWT - START');
      try {
        console.log('[DEBUG] verifyJWT - Calling jwtVerify');
        await request.jwtVerify();
        console.log('[DEBUG] verifyJWT - JWT verified successfully');

        // Check if user account is deleted (soft delete)
        const user = request.user;
        console.log('[DEBUG] verifyJWT - User from token:', user.id);
        if (user && user.id) {
          console.log('[DEBUG] verifyJWT - Checking user in database');
          const userRecord = await fastify
            .knex('users')
            .select('deleted_at')
            .where('id', user.id)
            .first();
          console.log(
            '[DEBUG] verifyJWT - User record:',
            userRecord ? 'FOUND' : 'NOT FOUND',
          );

          if (!userRecord) {
            request.log.warn({ userId: user.id }, 'User not found in database');
            return reply.unauthorized('User account not found');
          }

          if (userRecord.deleted_at) {
            request.log.warn(
              { userId: user.id, deletedAt: userRecord.deleted_at },
              'Deleted user attempting access',
            );
            return reply.unauthorized('User account has been deleted');
          }
        }
      } catch (err) {
        request.log.error({ error: err }, 'JWT verification failed');
        return reply.unauthorized('Invalid or expired token');
      }
    },
  );

  // Strategy 2: Role-based Authorization
  fastify.decorate('verifyRole', function (allowedRoles: string[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      const user = request.user;

      // Support both multi-role (roles array) and single role (backward compatibility)
      const userRoles = user.roles || (user.role ? [user.role] : []);

      // Check if user has at least one of the allowed roles
      const hasAllowedRole = userRoles.some((role: string) =>
        allowedRoles.includes(role),
      );

      if (!user || userRoles.length === 0 || !hasAllowedRole) {
        return reply.forbidden('Insufficient permissions');
      }
    };
  });

  // Strategy 3: Resource Ownership
  fastify.decorate('verifyOwnership', function (resourceParam = 'id') {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      const user = request.user;
      const resourceId = (request.params as Record<string, string>)[
        resourceParam
      ];

      // Support both multi-role (roles array) and single role (backward compatibility)
      const userRoles = user.roles || (user.role ? [user.role] : []);

      // Check if user owns resource or has admin role
      const isAdmin = userRoles.includes('admin');
      if (!isAdmin && user.id !== resourceId) {
        return reply.forbidden('Access denied to this resource');
      }
    };
  });

  // Strategy 4: Permission-based Authorization with Redis Cache
  fastify.decorate(
    'verifyPermission',
    function (resource: string, action: string) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;
        const requiredPermission = `${resource}:${action}`;

        try {
          // Try to get permissions from cache first
          console.log('[DEBUG] Permission check START for user:', user.id);
          console.log('[DEBUG] About to call permissionCache.get()');
          let permissions = await fastify.permissionCache.get(user.id);
          console.log(
            '[DEBUG] permissionCache.get() returned:',
            permissions ? `${permissions.length} permissions` : 'CACHE MISS',
          );

          if (!permissions) {
            // Cache miss - query from database
            console.log(
              '[DEBUG] Cache miss - querying database for user permissions',
            );
            const permissionsResult = await fastify
              .knex('user_roles')
              .join('roles', 'user_roles.role_id', 'roles.id')
              .join('role_permissions', 'roles.id', 'role_permissions.role_id')
              .join(
                'permissions',
                'role_permissions.permission_id',
                'permissions.id',
              )
              .where('user_roles.user_id', user.id)
              .where('user_roles.is_active', true) // Only active role assignments
              .select('permissions.resource', 'permissions.action')
              .distinct();
            console.log(
              '[DEBUG] Database query returned',
              permissionsResult.length,
              'permissions',
            );

            // Convert to "resource:action" format for cache
            permissions = permissionsResult.map(
              (perm: any) => `${perm.resource}:${perm.action}`,
            );

            // Cache for future requests
            console.log(
              '[DEBUG] Caching',
              permissions.length,
              'permissions for user',
            );
            await fastify.permissionCache.set(user.id, permissions);
          }

          // Check for admin permission (wildcard access)
          const hasAdminPermission = permissions.some((perm) => perm === '*:*');

          if (hasAdminPermission) {
            return; // Admin has all permissions
          }

          // Check for specific permission
          const hasSpecificPermission = permissions.some(
            (perm) => perm === requiredPermission,
          );

          // Check for resource wildcard permission (e.g., users:*)
          const hasResourceWildcard = permissions.some(
            (perm) => perm === `${resource}:*`,
          );

          // Check for action wildcard permission (e.g., *:read)
          const hasActionWildcard = permissions.some(
            (perm) => perm === `*:${action}`,
          );

          if (
            !hasSpecificPermission &&
            !hasResourceWildcard &&
            !hasActionWildcard
          ) {
            return reply.forbidden('Permission denied');
          }
        } catch (error) {
          // For errors, log and return permission error
          request.log.error(
            { error, resource, action, userId: user.id },
            'Error in verifyPermission (cache or database)',
          );
          return reply.forbidden('Permission denied');
        }
      };
    },
  );

  // Simplified authenticate decorator for backward compatibility
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      await fastify.verifyJWT(request, reply);
    },
  );

  // Simplified requireRole decorator for backward compatibility
  fastify.decorate('requireRole', function (roles: string[]) {
    return fastify.auth([fastify.verifyJWT, fastify.verifyRole(roles)]);
  });

  // authorize decorator (alias for verifyRole)
  fastify.decorate('authorize', fastify.verifyRole);
}

export default fp(authStrategiesPlugin, {
  name: 'auth-strategies-plugin',
  dependencies: ['@fastify/jwt', '@fastify/auth', 'knex-plugin'],
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyRole: (
      roles: string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyOwnership: (
      param?: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyPermission: (
      resource: string,
      action: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireRole: (roles: string[]) => unknown;
    authorize: (
      roles: string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
