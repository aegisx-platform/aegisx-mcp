import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export interface JwtAuthPluginOptions extends FastifyPluginOptions {
  // Additional options if needed
}

async function jwtAuthPlugin(
  fastify: FastifyInstance,
  _options: JwtAuthPluginOptions
) {
  // This plugin assumes @fastify/jwt is already registered
  // It provides a named dependency for other plugins
  
  // Add helper methods for JWT authentication
  fastify.decorate('authenticateJWT', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Add method to extract user from JWT
  fastify.decorate('getUserFromJWT', function(request) {
    return request.user;
  });

  fastify.log.info('JWT Auth plugin registered successfully');
}

export default fp(jwtAuthPlugin, {
  name: 'jwt-auth-plugin'
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    authenticateJWT: (request: any, reply: any) => Promise<void>;
    getUserFromJWT: (request: any) => any;
  }
}