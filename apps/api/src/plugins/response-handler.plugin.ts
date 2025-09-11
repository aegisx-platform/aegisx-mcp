import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: Pagination;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Success responses
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  meta: {
    timestamp: new Date().toISOString(),
    version: 'v1',
    requestId: 'req-' + Math.random().toString(36).substr(2, 9),
    environment: ['development', 'staging', 'production'].includes(
      process.env.NODE_ENV || '',
    )
      ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
      : 'development',
    ...meta,
  },
});

// Paginated responses
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  meta?: Record<string, unknown>,
): ApiResponse<T[]> => ({
  success: true,
  data,
  message,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  meta: {
    timestamp: new Date().toISOString(),
    version: 'v1',
    requestId: 'req-' + Math.random().toString(36).substr(2, 9),
    environment: ['development', 'staging', 'production'].includes(
      process.env.NODE_ENV || '',
    )
      ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
      : 'development',
    ...meta,
  },
});

// Error responses
export const createErrorResponse = (
  code: string,
  message: string,
  details?: unknown,
  statusCode?: number,
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    statusCode,
  },
});

async function responseHandlerPlugin(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
) {
  // Helper to create response with metadata
  const createResponseWithMeta = (
    response: ApiResponse,
    requestId?: string,
  ) => {
    response.meta = {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId: requestId || 'req-' + Math.random().toString(36).substr(2, 9),
      environment: ['development', 'staging', 'production'].includes(
        process.env.NODE_ENV || '',
      )
        ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
        : 'development',
    };
    return response;
  };

  // Decorate reply with helper methods
  fastify.decorateReply('success', function <T>(data: T, message?: string) {
    return this.send(createSuccessResponse(data, message));
  });

  fastify.decorateReply('paginated', function <
    T,
  >(data: T[], page: number, limit: number, total: number, message?: string) {
    return this.send(
      createPaginatedResponse(data, page, limit, total, message),
    );
  });

  fastify.decorateReply('created', function <T>(data: T, message?: string) {
    return this.code(201).send(createSuccessResponse(data, message));
  });

  fastify.decorateReply(
    'error',
    function (
      code: string,
      message: string,
      statusCode = 400,
      details?: unknown,
    ) {
      const errorResponse = createErrorResponse(
        code,
        message,
        details,
        statusCode,
      );
      return this.code(statusCode).send(errorResponse);
    },
  );

  // ✅ Fastify-sensible style API with our response format
  fastify.decorateReply('badRequest', function (message = 'Bad Request') {
    const response = createResponseWithMeta(
      createErrorResponse('BAD_REQUEST', message, undefined, 400),
      this.request.id,
    );
    return this.code(400).send(response);
  });

  fastify.decorateReply(
    'unauthorized',
    function (message = 'Authentication required') {
      const response = createResponseWithMeta(
        createErrorResponse('UNAUTHORIZED', message, undefined, 401),
        this.request.id,
      );
      return this.code(401).send(response);
    },
  );

  fastify.decorateReply('forbidden', function (message = 'Access denied') {
    const response = createResponseWithMeta(
      createErrorResponse('FORBIDDEN', message, undefined, 403),
      this.request.id,
    );
    return this.code(403).send(response);
  });

  fastify.decorateReply('notFound', function (message = 'Resource not found') {
    const response = createResponseWithMeta(
      createErrorResponse('NOT_FOUND', message, undefined, 404),
      this.request.id,
    );
    return this.code(404).send(response);
  });

  fastify.decorateReply('conflict', function (message = 'Resource conflict') {
    const response = createResponseWithMeta(
      createErrorResponse('CONFLICT', message, undefined, 409),
      this.request.id,
    );
    return this.code(409).send(response);
  });

  fastify.decorateReply(
    'internalServerError',
    function (message = 'Internal server error') {
      const response = createResponseWithMeta(
        createErrorResponse('INTERNAL_SERVER_ERROR', message, undefined, 500),
        this.request.id,
      );
      return this.code(500).send(response);
    },
  );
}

export default fp(responseHandlerPlugin, {
  name: 'response-handler-plugin',
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyReply {
    success<T>(data: T, message?: string): FastifyReply;
    created<T>(data: T, message?: string): FastifyReply;
    paginated<T>(
      data: T[],
      page: number,
      limit: number,
      total: number,
      message?: string,
    ): FastifyReply;
    error(
      code: string,
      message: string,
      statusCode?: number,
      details?: unknown,
    ): FastifyReply;
    badRequest(message?: string): FastifyReply;
    unauthorized(message?: string): FastifyReply;
    forbidden(message?: string): FastifyReply;
    notFound(message?: string): FastifyReply;
    conflict(message?: string): FastifyReply;
    internalServerError(message?: string): FastifyReply;
  }
}
