import { FastifyRequest, FastifyReply } from 'fastify';
import { ErrorLogsService } from './error-logs.service';
import { ErrorLogsQuery, CleanupQuery } from './error-logs.schemas';

export class ErrorLogsController {
  constructor(private readonly service: ErrorLogsService) {}

  async findAll(
    request: FastifyRequest<{ Querystring: ErrorLogsQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.service.findAll(request.query);

      const totalPages = Math.ceil(result.total / result.limit);
      // Return data that matches PaginatedResponseSchema structure
      return reply.send({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages,
          hasNext: result.page < totalPages,
          hasPrev: result.page > 1,
        },
      });
    } catch (error: any) {
      request.log.error(
        { error: error.message, query: request.query },
        'Failed to fetch error logs',
      );

      return reply.error('FETCH_ERROR', 'Failed to fetch error logs', 500);
    }
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const errorLog = await this.service.findById(request.params.id);

      return reply.success(errorLog);
    } catch (error: any) {
      if (error.message === 'ERROR_NOT_FOUND') {
        return reply.notFound('Error log not found');
      }

      request.log.error(
        { error: error.message, id: request.params.id },
        'Failed to fetch error log',
      );

      return reply.error('FETCH_ERROR', 'Failed to fetch error log', 500);
    }
  }

  async getStats(
    request: FastifyRequest<{ Querystring: { days?: number } }>,
    reply: FastifyReply,
  ) {
    try {
      const days = request.query.days || 7;
      const stats = await this.service.getStats(days);

      return reply.success(stats);
    } catch (error: any) {
      request.log.error(
        { error: error.message },
        'Failed to fetch error stats',
      );

      return reply.error(
        'FETCH_ERROR',
        'Failed to fetch error statistics',
        500,
      );
    }
  }

  async cleanup(
    request: FastifyRequest<{ Querystring: CleanupQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.service.cleanup(request.query);

      return reply.success(result);
    } catch (error: any) {
      request.log.error(
        { error: error.message, query: request.query },
        'Failed to cleanup old errors',
      );

      return reply.error(
        'CLEANUP_ERROR',
        'Failed to cleanup old error logs',
        500,
      );
    }
  }
}
