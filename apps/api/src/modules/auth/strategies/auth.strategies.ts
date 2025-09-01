import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

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
      if (!user || !user.role || !allowedRoles.includes(user.role)) {
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
      
      // For now, we'll use role-based permissions
      // In a full implementation, this would check the permissions table
      const rolePermissions: Record<string, string[]> = {
        admin: ['*:*'], // Admin can do everything
        user: ['profile:read', 'profile:update'],
      };
      
      const userPermissions = rolePermissions[user.role] || [];
      const requiredPermission = `${resource}:${action}`;
      
      const hasPermission = userPermissions.includes('*:*') || 
                           userPermissions.includes(requiredPermission);
      
      if (!hasPermission) {
        throw new Error('PERMISSION_DENIED');
      }
    };
  });

  // Simplified authenticate decorator for backward compatibility
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    await fastify.verifyJWT(request, reply);
  });

  // Simplified requireRole decorator for backward compatibility
  fastify.decorate('requireRole', function (roles: string[]) {
    return fastify.auth([
      fastify.verifyJWT,
      fastify.verifyRole(roles)
    ]);
  });
}

export default fp(authStrategiesPlugin, {
  name: 'auth-strategies-plugin',
  dependencies: ['@fastify/jwt', '@fastify/auth']
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyOwnership: (param?: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyPermission: (resource: string, action: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => any;
  }
}