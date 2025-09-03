import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ClientErrorsRequestSchema,
  ClientErrorsResponseSchema,
  ClientMonitoringRequestSchema,
  ClientMonitoringResponseSchema,
  ClientErrorsRequest,
  ClientMonitoringRequest,
  ClientErrorsResponse,
  ClientMonitoringResponse,
  ClientErrorLog,
  PerformanceMetric,
  UserAction,
} from './monitoring.schemas';

async function monitoringRoutes(fastify: FastifyInstance) {
  // Client error logging endpoint
  fastify.post<{
    Body: ClientErrorsRequest;
    Reply: ClientErrorsResponse;
  }>(
    '/client-errors',
    {
      schema: {
        description: 'Log client-side errors from the frontend application',
        tags: ['monitoring'],
        body: ClientErrorsRequestSchema,
        response: {
          200: ClientErrorsResponseSchema,
          400: ClientErrorsResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: ClientErrorsRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const { errors } = request.body;
        const correlationId = request.correlationId;

        // Process each error
        for (const error of errors) {
          // Enhance error with server-side context
          const enhancedError = {
            ...error,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            ip: request.ip,
            serverUserAgent: request.headers['user-agent'],
            referer: request.headers.referer,
          };

          // Log based on error level
          const logLevel =
            error.level === 'error'
              ? 'error'
              : error.level === 'warn'
                ? 'warn'
                : 'info';

          fastify.logger[logLevel]('Client error received', enhancedError);

          // Store in database if needed (optional implementation)
          await storeClientError(fastify, enhancedError);
        }

        const response: ClientErrorsResponse = {
          success: true,
          message: `Successfully processed ${errors.length} error(s)`,
          errorsProcessed: errors.length,
        };

        return response;
      } catch (error) {
        fastify.logger.error('Failed to process client errors', {
          error: error.message,
          stack: error.stack,
          correlationId: request.correlationId,
        });

        const response: ClientErrorsResponse = {
          success: false,
          message: 'Failed to process client errors',
          errorsProcessed: 0,
        };

        reply.code(500);
        return response;
      }
    },
  );

  // Client monitoring data endpoint
  fastify.post<{
    Body: ClientMonitoringRequest;
    Reply: ClientMonitoringResponse;
  }>(
    '/client-monitoring',
    {
      schema: {
        description:
          'Receive client-side performance and user interaction data',
        tags: ['monitoring'],
        body: ClientMonitoringRequestSchema,
        response: {
          200: ClientMonitoringResponseSchema,
          400: ClientMonitoringResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: ClientMonitoringRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const { performance, userActions, sessionId, timestamp } = request.body;
        const correlationId = request.correlationId;

        // Process performance metrics
        for (const metric of performance) {
          const enhancedMetric = {
            ...metric,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            sessionId,
            ip: request.ip,
          };

          // Log significant performance issues
          if (shouldLogPerformanceMetric(metric)) {
            fastify.logger.info('Performance metric received', enhancedMetric);
          }

          // Store in database/metrics system
          await storePerformanceMetric(fastify, enhancedMetric);
        }

        // Process user actions
        for (const action of userActions) {
          const enhancedAction = {
            ...action,
            serverTimestamp: new Date().toISOString(),
            correlationId,
            sessionId,
            ip: request.ip,
          };

          // Log user interactions (optional, for analytics)
          if (shouldLogUserAction(action)) {
            fastify.logger.info('User action received', enhancedAction);
          }

          // Store in database/analytics system
          await storeUserAction(fastify, enhancedAction);
        }

        const response: ClientMonitoringResponse = {
          success: true,
          message: `Successfully processed ${performance.length} metrics and ${userActions.length} actions`,
          metricsProcessed: performance.length,
          actionsProcessed: userActions.length,
        };

        return response;
      } catch (error) {
        fastify.logger.error('Failed to process client monitoring data', {
          error: error.message,
          stack: error.stack,
          correlationId: request.correlationId,
        });

        const response: ClientMonitoringResponse = {
          success: false,
          message: 'Failed to process monitoring data',
          metricsProcessed: 0,
          actionsProcessed: 0,
        };

        reply.code(500);
        return response;
      }
    },
  );
}

// Helper functions

async function storeClientError(
  fastify: FastifyInstance,
  error: any,
): Promise<void> {
  try {
    // Optional: Store in database for analysis
    // This could be implemented to store in a dedicated errors table
    if (process.env.STORE_CLIENT_ERRORS === 'true' && fastify.knex) {
      await fastify.knex('client_errors').insert({
        timestamp: new Date(error.timestamp),
        level: error.level,
        message: error.message,
        url: error.url,
        user_agent: error.userAgent,
        user_id: error.userId,
        session_id: error.sessionId,
        correlation_id: error.correlationId,
        stack: error.stack,
        context: JSON.stringify(error.context || {}),
        type: error.type,
        server_timestamp: new Date(),
        ip: error.ip,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store client error in database', {
      error: dbError.message,
      originalError: error.message,
    });
  }
}

async function storePerformanceMetric(
  fastify: FastifyInstance,
  metric: any,
): Promise<void> {
  try {
    // Optional: Store in database or metrics system
    // This could integrate with time-series databases like InfluxDB
    if (process.env.STORE_PERFORMANCE_METRICS === 'true' && fastify.knex) {
      await fastify.knex('client_performance').insert({
        name: metric.name,
        value: metric.value,
        timestamp: new Date(metric.timestamp),
        url: metric.url,
        user_agent: metric.userAgent,
        session_id: metric.sessionId,
        correlation_id: metric.correlationId,
        context: JSON.stringify(metric.context || {}),
        server_timestamp: new Date(),
        ip: metric.ip,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store performance metric in database', {
      error: dbError.message,
      metric: metric.name,
    });
  }
}

async function storeUserAction(
  fastify: FastifyInstance,
  action: any,
): Promise<void> {
  try {
    // Optional: Store in database for user behavior analysis
    if (process.env.STORE_USER_ACTIONS === 'true' && fastify.knex) {
      await fastify.knex('client_user_actions').insert({
        type: action.type,
        element: action.element,
        url: action.url,
        timestamp: new Date(action.timestamp),
        duration: action.duration,
        session_id: action.sessionId,
        correlation_id: action.correlationId,
        context: JSON.stringify(action.context || {}),
        server_timestamp: new Date(),
        ip: action.ip,
      });
    }
  } catch (dbError) {
    fastify.logger.warn('Failed to store user action in database', {
      error: dbError.message,
      action: action.type,
    });
  }
}

function shouldLogPerformanceMetric(metric: PerformanceMetric): boolean {
  // Log significant performance issues
  return (
    (metric.name === 'lcp' && metric.value > 4000) ||
    (metric.name === 'fid' && metric.value > 300) ||
    (metric.name === 'cls' && metric.value > 0.25) ||
    (metric.name === 'page_load_time' && metric.value > 3000)
  );
}

function shouldLogUserAction(action: UserAction): boolean {
  // Log important user actions (navigation, form submissions)
  return action.type === 'navigation' || action.type === 'form_submit';
}

export default monitoringRoutes;
