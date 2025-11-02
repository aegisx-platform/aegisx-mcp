import { FastifyRequest, FastifyReply } from 'fastify';
import { UserActivityService } from './user-activity.service';
import {
  GetActivityLogsQuery,
  GetAllActivityLogsQuery,
} from './user-activity.schemas';

export class UserActivityController {
  constructor(private userActivityService: UserActivityService) {}

  /**
   * Get user's activity logs
   * GET /api/profile/activity
   */
  async getUserActivities(
    request: FastifyRequest<{
      Querystring: GetActivityLogsQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      // Validate user authentication
      if (!request.user || !request.user.id) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const userId = request.user.id;
      const query = request.query;

      request.log.info(`Getting activities for user: ${userId}`);

      const result = await this.userActivityService.getUserActivities(
        userId,
        query,
      );

      request.log.info(`Found ${result.data.length} activities`);

      // Log the activity view (but don't fail if this fails)
      try {
        await this.userActivityService.logActivity(
          userId,
          'profile_view',
          'Viewed activity log',
          request,
        );
      } catch (logError) {
        request.log.warn({ error: logError }, 'Failed to log activity view');
      }

      return reply.code(200).send({
        success: true,
        data: {
          activities: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get user activities');

      // Log the error
      if (request.user?.id) {
        await this.userActivityService.logApiError(
          request.user.id,
          error as Error,
          request,
          '/api/profile/activity',
        );
      }

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to retrieve activity logs',
          code: 'ACTIVITY_FETCH_ERROR',
        },
      });
    }
  }

  /**
   * Get user's activity sessions
   * GET /api/profile/activity/sessions
   */
  async getUserActivitySessions(
    request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user.id;
      const { page = 1, limit = 10 } = request.query;

      const result = await this.userActivityService.getUserActivitySessions(
        userId,
        page,
        limit,
      );

      return reply.code(200).send({
        success: true,
        data: {
          sessions: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get user activity sessions');

      if (request.user?.id) {
        await this.userActivityService.logApiError(
          request.user.id,
          error as Error,
          request,
          '/api/profile/activity/sessions',
        );
      }

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to retrieve activity sessions',
          code: 'ACTIVITY_SESSIONS_ERROR',
        },
      });
    }
  }

  /**
   * Get user's activity statistics
   * GET /api/profile/activity/stats
   */
  async getUserActivityStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;

      const stats = await this.userActivityService.getUserActivityStats(userId);

      return reply.code(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get user activity stats');

      if (request.user?.id) {
        await this.userActivityService.logApiError(
          request.user.id,
          error as Error,
          request,
          '/api/profile/activity/stats',
        );
      }

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to retrieve activity statistics',
          code: 'ACTIVITY_STATS_ERROR',
        },
      });
    }
  }

  /**
   * Manual activity logging (internal/admin use)
   * POST /api/profile/activity/log
   */
  async logActivity(
    request: FastifyRequest<{
      Body: {
        action: string;
        description: string;
        severity?: 'info' | 'warning' | 'error' | 'critical';
        metadata?: Record<string, any>;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user.id;
      const { action, description, severity, metadata } = request.body;

      const activity = await this.userActivityService.logActivity(
        userId,
        action as any, // Type assertion since we validate in schema
        description,
        request,
        { severity, metadata },
      );

      return reply.code(201).send({
        success: true,
        data: activity,
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to log activity');

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to log activity',
          code: 'ACTIVITY_LOG_ERROR',
        },
      });
    }
  }

  /**
   * Admin: Get all users' activity logs
   * GET /api/activity-logs
   */
  async getAllActivities(
    request: FastifyRequest<{
      Querystring: GetAllActivityLogsQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const query = request.query;

      request.log.info("Admin: Getting all users' activities");

      const result = await this.userActivityService.getAllActivities(query);

      request.log.info(`Found ${result.data.length} activities`);

      return reply.code(200).send({
        success: true,
        data: {
          activities: result.data,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get all activities');

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to retrieve activity logs',
          code: 'ACTIVITY_FETCH_ERROR',
        },
      });
    }
  }

  /**
   * Admin: Get system-wide activity statistics
   * GET /api/activity-logs/stats
   */
  async getAdminStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      request.log.info('Admin: Getting system-wide activity stats');

      const stats = await this.userActivityService.getAdminStats();

      return reply.code(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get admin activity stats');

      return reply.code(500).send({
        success: false,
        error: {
          message: 'Failed to retrieve activity statistics',
          code: 'ACTIVITY_STATS_ERROR',
        },
      });
    }
  }
}
