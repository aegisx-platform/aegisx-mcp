import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
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
  meta?: Record<string, any>
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  meta
});

// Paginated responses
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiResponse<T[]> => ({
  success: true,
  data,
  message,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});

// Error responses
export const createErrorResponse = (
  code: string,
  message: string,
  details?: any,
  statusCode?: number
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    statusCode
  }
});

async function responseHandlerPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Decorate reply with helper methods
  fastify.decorateReply('success', function(data: any, message?: string) {
    return this.send(createSuccessResponse(data, message));
  });

  fastify.decorateReply('paginated', function(
    data: any[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ) {
    return this.send(createPaginatedResponse(data, page, limit, total, message));
  });

  fastify.decorateReply('error', function(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    return this.code(statusCode).send(createErrorResponse(code, message, details, statusCode));
  });

  fastify.decorateReply('created', function(data: any, message?: string) {
    return this.code(201).send(createSuccessResponse(data, message));
  });

  // Don't override notFound if it already exists (from fastify-sensible)
  if (!fastify.hasReplyDecorator('notFound')) {
    fastify.decorateReply('notFound', function(message: string = 'Resource not found') {
      return this.code(404).send(createErrorResponse('NOT_FOUND', message, undefined, 404));
    });
  }

  // Don't override decorators if they already exist (from fastify-sensible)
  if (!fastify.hasReplyDecorator('unauthorized')) {
    fastify.decorateReply('unauthorized', function(message: string = 'Authentication required') {
      return this.code(401).send(createErrorResponse('UNAUTHORIZED', message, undefined, 401));
    });
  }

  if (!fastify.hasReplyDecorator('forbidden')) {
    fastify.decorateReply('forbidden', function(message: string = 'Insufficient permissions') {
      return this.code(403).send(createErrorResponse('FORBIDDEN', message, undefined, 403));
    });
  }
}

export default fp(responseHandlerPlugin, {
  name: 'response-handler'
});

// TypeScript declarations
declare module 'fastify' {
  interface FastifyReply {
    success(data: any, message?: string): FastifyReply;
    paginated(data: any[], page: number, limit: number, total: number, message?: string): FastifyReply;
    error(code: string, message: string, statusCode?: number, details?: any): FastifyReply;
    created(data: any, message?: string): FastifyReply;
    notFound(message?: string): FastifyReply;
    unauthorized(message?: string): FastifyReply;
    forbidden(message?: string): FastifyReply;
  }
}