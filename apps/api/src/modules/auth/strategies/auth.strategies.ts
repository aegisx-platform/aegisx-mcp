import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import '../../../types/fastify.d';
import '../../../types/jwt.types';

async function authStrategiesPlugin(fastify: FastifyInstance) {
  // Strategy 1: JWT Authentication
  fastify.decorate(
    'verifyJWT',
    async function (request: FastifyRequest, _reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (_err) {
        throw new Error('INVALID_TOKEN');
      }
    },
  );

  // Strategy 2: Role-based Authorization
  fastify.decorate('verifyRole', function (allowedRoles: string[]) {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
      const user = request.user;
      if (!user || !user.role || !allowedRoles.includes(user.role)) {
        throw new Error('INSUFFICIENT_PERMISSIONS');
      }
    };
  });

  // Strategy 3: Resource Ownership
  fastify.decorate('verifyOwnership', function (resourceParam = 'id') {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
      const user = request.user;
      const resourceId = (request.params as Record<string, string>)[
        resourceParam
      ];

      // Check if user owns resource or is admin
      if (user.role !== 'admin' && user.id !== resourceId) {
        throw new Error('RESOURCE_ACCESS_DENIED');
      }
    };
  });

  // Strategy 4: Permission-based Authorization
  fastify.decorate(
    'verifyPermission',
    function (resource: string, action: string) {
      return async function (request: FastifyRequest, _reply: FastifyReply) {
        const user = request.user;
        const requiredPermission = `${resource}:${action}`;

        try {
          // Get user's permissions from database based on their role(s)
          const permissions = await fastify
            .knex('user_roles')
            .join('roles', 'user_roles.role_id', 'roles.id')
            .join('role_permissions', 'roles.id', 'role_permissions.role_id')
            .join(
              'permissions',
              'role_permissions.permission_id',
              'permissions.id',
            )
            .where('user_roles.user_id', user.id)
            .select('permissions.resource', 'permissions.action')
            .distinct();

          // Check for admin permission (wildcard access)
          const hasAdminPermission = permissions.some(
            (perm: any) => perm.resource === '*' && perm.action === '*',
          );

          if (hasAdminPermission) {
            return; // Admin has all permissions
          }

          // Check for specific permission
          const hasSpecificPermission = permissions.some(
            (perm: any) => perm.resource === resource && perm.action === action,
          );

          // Check for resource wildcard permission (e.g., users:*)
          const hasResourceWildcard = permissions.some(
            (perm: any) => perm.resource === resource && perm.action === '*',
          );

          // Check for action wildcard permission (e.g., *:read)
          const hasActionWildcard = permissions.some(
            (perm: any) => perm.resource === '*' && perm.action === action,
          );

          if (
            !hasSpecificPermission &&
            !hasResourceWildcard &&
            !hasActionWildcard
          ) {
            throw new Error('PERMISSION_DENIED');
          }
        } catch (error) {
          // If it's a permission denied error, re-throw it
          if (error instanceof Error && error.message === 'PERMISSION_DENIED') {
            throw error;
          }

          // For database errors, log and throw a generic permission error
          (fastify.log as any).error(
            'Database error in verifyPermission:',
            error,
          );
          throw new Error('PERMISSION_DENIED');
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
