import { FastifyInstance, FastifyPluginOptions, FastifyError } from 'fastify';
import fp from 'fastify-plugin';

async function errorHandlerPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    const { statusCode = 500, message, code } = error;
    
    // Log the error
    fastify.log.error({
      error,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        params: request.params,
        query: request.query
      }
    });

    // Validation errors
    if (error.validation) {
      return reply.error(
        'VALIDATION_ERROR', 
        'Invalid request data', 
        400, 
        error.validation
      );
    }

    // JWT errors
    if (code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      return reply.unauthorized('No authorization header found');
    }
    if (code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.unauthorized('Token expired');
    }
    if (code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      return reply.unauthorized('Invalid token');
    }
    if (error.message === 'INVALID_TOKEN') {
      return reply.unauthorized('Invalid token');
    }

    // Custom business errors
    if (error.message === 'INSUFFICIENT_PERMISSIONS') {
      return reply.forbidden('Insufficient permissions');
    }
    if (error.message === 'RESOURCE_ACCESS_DENIED') {
      return reply.forbidden('Access denied to this resource');
    }
    if (error.message === 'PERMISSION_DENIED') {
      return reply.forbidden('Permission denied');
    }
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return reply.error('EMAIL_ALREADY_EXISTS', 'Email already exists', 409);
    }
    if (error.message === 'USERNAME_ALREADY_EXISTS') {
      return reply.error('USERNAME_ALREADY_EXISTS', 'Username already exists', 409);
    }
    if (error.message === 'USER_NOT_FOUND') {
      return reply.notFound('User not found');
    }
    if (error.message === 'INVALID_CREDENTIALS') {
      return reply.error('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    if (error.message === 'REFRESH_TOKEN_NOT_FOUND') {
      return reply.error('REFRESH_TOKEN_NOT_FOUND', 'Refresh token not found or expired', 401);
    }

    // Rate limit errors
    if (statusCode === 429) {
      return reply.error(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later',
        429
      );
    }

    // Generic errors
    return reply.error(
      statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
      statusCode >= 500 ? 'An unexpected error occurred' : message,
      statusCode,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    );
  });

  // Not found handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.notFound(`Route ${request.method} ${request.url} not found`);
  });
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
  dependencies: ['response-handler']
});