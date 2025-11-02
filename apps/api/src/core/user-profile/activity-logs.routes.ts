import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { UserActivityController } from './user-activity.controller';
import { SchemaRefs } from '../../schemas/registry';

export interface ActivityLogsRoutesOptions {
  controller: UserActivityController;
}

async function activityLogsRoutes(
  fastify: FastifyInstance,
  options: ActivityLogsRoutesOptions,
) {
  const { controller } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /activity-logs/stats - Get system-wide activity statistics (Admin only)
  typedFastify.get(
    '/stats',
    {
      schema: {
        summary: 'Get system-wide activity statistics',
        description:
          'Get aggregated activity statistics for all users (Admin only)',
        tags: ['Activity Logs'],
        response: {
          200: SchemaRefs.module('user-profile', 'activity-stats-response'),
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [
        fastify.verifyJWT,
        fastify.verifyPermission('activity-logs', 'read'),
      ],
    },
    controller.getAdminStats.bind(controller),
  );

  // GET /activity-logs - List all users' activity logs with filters (Admin only)
  typedFastify.get(
    '/',
    {
      schema: {
        summary: 'List all activity logs',
        description:
          "Get paginated list of all users' activity logs with optional filters (Admin only)",
        tags: ['Activity Logs'],
        querystring: SchemaRefs.module(
          'user-profile',
          'get-all-activity-logs-query',
        ),
        response: {
          200: SchemaRefs.module('user-profile', 'activity-logs-response'),
          400: SchemaRefs.ServerError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [
        fastify.verifyJWT,
        fastify.verifyPermission('activity-logs', 'read'),
      ],
    },
    controller.getAllActivities.bind(controller),
  );
}

export default activityLogsRoutes;
