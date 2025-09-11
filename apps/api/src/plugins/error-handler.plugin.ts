import { FastifyInstance, FastifyPluginOptions, FastifyError } from 'fastify';
import fp from 'fastify-plugin';

async function errorHandlerPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    const { statusCode = 500, message } = error;
    // Don't destructure 'code' as it's the Fastify error code, not our custom code

    // Log the error
    fastify.log.error({
      error,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        params: request.params,
        query: request.query,
      },
    });

    // Validation errors
    if (error.validation) {
      // Format validation errors properly
      const details = error.validation.map((err: any) => ({
        field:
          err.instancePath.replace(/^\//, '') ||
          err.params?.missingProperty ||
          'unknown',
        message: err.message || 'Validation failed',
        code: err.keyword?.toUpperCase() || 'INVALID',
        value: err.params?.value,
      }));

      const response = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
          statusCode: 400,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: ['development', 'staging', 'production'].includes(
            process.env.NODE_ENV || '',
          )
            ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
            : 'development',
        },
      };

      return reply.code(400).send(response);
    }

    // JWT errors
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      return reply.unauthorized('No authorization header found');
    }
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      return reply.unauthorized('Token expired');
    }
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      return reply.unauthorized('Invalid token');
    }
    if (error.message === 'INVALID_TOKEN') {
      return reply.unauthorized('Invalid token');
    }

    // Custom business errors - check both code and message
    const errorCode = (error as any).code || error.message;

    if (
      errorCode === 'INSUFFICIENT_PERMISSIONS' ||
      error.message === 'INSUFFICIENT_PERMISSIONS'
    ) {
      return reply.forbidden('Insufficient permissions');
    }
    if (
      errorCode === 'RESOURCE_ACCESS_DENIED' ||
      error.message === 'RESOURCE_ACCESS_DENIED'
    ) {
      return reply.forbidden('Access denied to this resource');
    }
    if (
      errorCode === 'PERMISSION_DENIED' ||
      error.message === 'PERMISSION_DENIED'
    ) {
      return reply.forbidden('Permission denied');
    }
    if (
      errorCode === 'EMAIL_ALREADY_EXISTS' ||
      error.message === 'Email already exists'
    ) {
      return reply.error('EMAIL_ALREADY_EXISTS', 'Email already exists', 409);
    }
    if (
      errorCode === 'USERNAME_ALREADY_EXISTS' ||
      error.message === 'USERNAME_ALREADY_EXISTS' ||
      error.message === 'Username already exists'
    ) {
      return reply.error(
        'USERNAME_ALREADY_EXISTS',
        'Username already exists',
        409,
      );
    }
    if (errorCode === 'USER_NOT_FOUND' || error.message === 'USER_NOT_FOUND') {
      return reply.notFound('User not found');
    }
    if (
      errorCode === 'INVALID_CREDENTIALS' ||
      error.message === 'INVALID_CREDENTIALS' ||
      error.message === 'Invalid credentials'
    ) {
      return reply.error(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401,
      );
    }
    if (
      errorCode === 'REFRESH_TOKEN_NOT_FOUND' ||
      error.message === 'REFRESH_TOKEN_NOT_FOUND'
    ) {
      return reply.error(
        'REFRESH_TOKEN_NOT_FOUND',
        'Refresh token not found or expired',
        401,
      );
    }
    if (
      errorCode === 'ACCOUNT_DISABLED' ||
      error.message === 'ACCOUNT_DISABLED' ||
      error.message === 'Account is disabled'
    ) {
      return reply.error('ACCOUNT_DISABLED', 'Account is disabled', 403);
    }

    // If we reach here, no specific error was handled, proceed to generic handler

    // Rate limit errors
    if (statusCode === 429) {
      return reply.error(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later',
        429,
      );
    }

    // Generic errors - use error code if available, otherwise use status-based code
    const genericErrorCode =
      errorCode ||
      (statusCode >= 500
        ? 'INTERNAL_SERVER_ERROR'
        : statusCode === 409
          ? 'CONFLICT'
          : statusCode === 404
            ? 'NOT_FOUND'
            : statusCode === 403
              ? 'FORBIDDEN'
              : statusCode === 401
                ? 'UNAUTHORIZED'
                : statusCode === 400
                  ? 'BAD_REQUEST'
                  : 'REQUEST_ERROR');

    return reply.error(
      genericErrorCode,
      statusCode >= 500 ? 'An unexpected error occurred' : message,
      statusCode,
      process.env.NODE_ENV === 'development'
        ? { stack: error.stack }
        : undefined,
    );
  });

  // Not found handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.notFound(`Route ${request.method} ${request.url} not found`);
  });
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler-plugin',
  dependencies: ['response-handler-plugin'],
});
