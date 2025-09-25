import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance } from 'fastify';
import { SchemaRefs } from '../../schemas/registry';
import { UserProfileController } from './user-profile.controller';
import { UserActivityController } from './user-activity.controller';
import { DeleteAccountController } from './delete-account.controller';

export interface UserProfileRoutesOptions {
  controller: UserProfileController;
  activityController: UserActivityController;
  deleteAccountController: DeleteAccountController;
}

export async function userProfileRoutes(
  fastify: FastifyInstance,
  options: UserProfileRoutesOptions,
) {
  const { controller, activityController, deleteAccountController } = options;
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Get current user profile
  typedFastify.get(
    '/profile',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get current user profile',
        tags: ['User Profile'],
        summary:
          'Get current user profile with preferences and role information',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'user-profile-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserProfile.bind(controller),
  );

  // Update current user profile
  typedFastify.put(
    '/profile',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Update current user profile',
        tags: ['User Profile'],
        summary: 'Update user profile information',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('user-profile', 'user-profile-update-request'),
        response: {
          200: SchemaRefs.module('user-profile', 'user-profile-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          422: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
        activityLog: {
          enabled: true,
          action: 'profile_update',
          description: 'User updated profile information',
          severity: 'info',
          includeRequestData: true,
          shouldLog: (request, reply) => reply.statusCode < 300, // Only log successful updates
        },
      },
    },
    controller.updateUserProfile.bind(controller),
  );

  // Get user preferences
  typedFastify.get(
    '/profile/preferences',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get current user preferences',
        tags: ['User Profile'],
        summary:
          'Get user preferences including theme, language, and notifications',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'user-preferences-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.getUserPreferences.bind(controller),
  );

  // Update user preferences
  typedFastify.put(
    '/profile/preferences',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Update current user preferences',
        tags: ['User Profile'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module(
          'user-profile',
          'user-preferences-update-request',
        ),
        response: {
          200: SchemaRefs.module('user-profile', 'user-preferences-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
        activityLog: {
          enabled: true,
          action: 'preferences_update',
          description: 'User updated preferences',
          severity: 'info',
          includeRequestData: true,
          shouldLog: (request, reply) => reply.statusCode < 300,
        },
      },
    },
    controller.updateUserPreferences.bind(controller),
  );

  // Upload user avatar
  typedFastify.post(
    '/profile/avatar',
    {
      preValidation: [fastify.authenticate],
      attachValidation: true, // Skip validation errors for multipart/form-data compatibility
      schema: {
        description: 'Upload user avatar',
        tags: ['User Profile'],
        summary: 'Upload a new avatar image',
        security: [{ bearerAuth: [] }],
        consumes: ['multipart/form-data'],
        body: SchemaRefs.module('user-profile', 'avatar-upload-request'),
        response: {
          200: SchemaRefs.module('user-profile', 'avatar-upload-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          413: SchemaRefs.ValidationError,
          415: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.uploadUserAvatar.bind(controller),
  );

  // Delete user avatar
  typedFastify.delete(
    '/profile/avatar',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Delete user avatar',
        tags: ['User Profile'],
        summary: 'Delete the current user avatar',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'avatar-delete-response'),
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
    },
    controller.deleteUserAvatar.bind(controller),
  );

  // === Activity Tracking Routes ===

  // Get user's activity logs
  typedFastify.get(
    '/profile/activity',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get user activity logs with filtering and pagination',
        tags: ['User Activity'],
        summary: 'Retrieve user activity history with optional filters',
        security: [{ bearerAuth: [] }],
        querystring: SchemaRefs.module(
          'user-profile',
          'get-activity-logs-query',
        ),
        response: {
          200: SchemaRefs.module('user-profile', 'activity-logs-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    activityController.getUserActivities.bind(activityController),
  );

  // Get user's activity sessions
  typedFastify.get(
    '/profile/activity/sessions',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get user activity sessions grouped by login session',
        tags: ['User Activity'],
        summary: 'Retrieve user login sessions with activity counts',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
        response: {
          200: SchemaRefs.module('user-profile', 'activity-sessions-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    activityController.getUserActivitySessions.bind(activityController),
  );

  // Get user's activity statistics
  typedFastify.get(
    '/profile/activity/stats',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Get user activity statistics and insights',
        tags: ['User Activity'],
        summary: 'Retrieve aggregated activity statistics for the user',
        security: [{ bearerAuth: [] }],
        response: {
          200: SchemaRefs.module('user-profile', 'activity-stats-response'),
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    activityController.getUserActivityStats.bind(activityController),
  );

  // Manual activity logging (internal/admin use)
  typedFastify.post(
    '/profile/activity/log',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Manually log user activity (internal use)',
        tags: ['User Activity'],
        summary: 'Create a new activity log entry',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('user-profile', 'create-activity-log'),
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: SchemaRefs.module('user-profile', 'activity-log'),
            },
          },
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
    },
    activityController.logActivity.bind(activityController),
  );

  // Delete user account (soft delete)
  typedFastify.delete(
    '/profile/delete',
    {
      preValidation: [fastify.authenticate],
      schema: {
        description: 'Delete user account permanently',
        tags: ['User Profile'],
        summary: 'Mark user account for deletion with security validation',
        security: [{ bearerAuth: [] }],
        body: SchemaRefs.module('user-profile', 'delete-account-request'),
        response: {
          200: SchemaRefs.module('user-profile', 'delete-account-response'),
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          409: SchemaRefs.ValidationError,
          500: SchemaRefs.ServerError,
        },
      },
    },
    deleteAccountController.deleteAccount.bind(deleteAccountController),
  );
}
