import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { settingsController } from './settings.controller';
import {
  GetSettingsQuerySchema,
  GetSettingHistoryQuerySchema,
  CreateSettingSchema,
  UpdateSettingSchema,
  UpdateSettingValueSchema,
  UpdateUserSettingSchema,
  BulkUpdateSettingsSchema,
  SettingResponseSchema,
  SettingsListResponseSchema,
  GroupedSettingsResponseSchema,
  SettingHistoryResponseSchema,
  BulkUpdateResponseSchema,
} from './settings.schemas';
import { SchemaRefs } from '../../schemas/registry';

export async function settingsRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const controller = settingsController;

  // Get all settings (with optional user overrides)
  server.get(
    '/',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get all settings',
        description:
          'Get all settings with filtering and pagination. Authenticated users get their personal overrides.',
        querystring: GetSettingsQuerySchema,
        response: {
          200: SettingsListResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    controller.getSettings,
  );

  // Get grouped settings
  server.get(
    '/grouped',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get settings grouped by category',
        description:
          'Get settings organized by category and group for UI display',
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' },
          },
        },
        response: {
          200: GroupedSettingsResponseSchema,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    controller.getGroupedSettings,
  );

  // Get setting by key
  server.get(
    '/key/:key',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get setting by key',
        description: 'Get a specific setting by its key',
        params: {
          type: 'object',
          properties: {
            key: { type: 'string' },
          },
          required: ['key'],
        },
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' },
          },
        },
        response: {
          200: SettingResponseSchema,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    controller.getSettingByKey,
  );

  // Get setting value only
  server.get(
    '/value/:key',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get setting value only',
        description: 'Get just the value of a setting',
        params: {
          type: 'object',
          properties: {
            key: { type: 'string' },
          },
          required: ['key'],
        },
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  value: {},
                },
              },
              message: { type: 'string' },
            },
          },
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    controller.getSettingValue,
  );

  // Get setting by ID (admin only)
  server.get(
    '/:id',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get setting by ID',
        description: 'Get a specific setting by its ID (admin only)',
        params: SchemaRefs.UuidParam,
        response: {
          200: SettingResponseSchema,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.getSettingById,
  );

  // Create new setting (admin only)
  server.post(
    '/',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Create new setting',
        description: 'Create a new system setting (admin only)',
        body: CreateSettingSchema,
        response: {
          201: SettingResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          409: SchemaRefs.Conflict,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.createSetting,
  );

  // Update setting (admin only)
  server.patch(
    '/:id',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Update setting',
        description: 'Update a setting configuration (admin only)',
        params: SchemaRefs.UuidParam,
        body: UpdateSettingSchema,
        response: {
          200: SettingResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.updateSetting,
  );

  // Update setting value only
  server.put(
    '/:id/value',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Update setting value',
        description: 'Update only the value of a setting',
        params: SchemaRefs.UuidParam,
        body: UpdateSettingValueSchema,
        response: {
          200: SettingResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.updateSettingValue,
  );

  // Delete setting (admin only)
  server.delete(
    '/:id',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Delete setting',
        description: 'Delete a setting (admin only)',
        params: SchemaRefs.UuidParam,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.deleteSetting,
  );

  // Bulk update settings
  server.post(
    '/bulk-update',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Bulk update settings',
        description: 'Update multiple setting values at once',
        body: BulkUpdateSettingsSchema,
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' },
          },
        },
        response: {
          200: BulkUpdateResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.bulkUpdateSettings,
  );

  // Get setting history
  server.get(
    '/history',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get setting history',
        description: 'Get change history for settings',
        querystring: GetSettingHistoryQuerySchema,
        response: {
          200: SettingHistoryResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])],
    },
    controller.getSettingHistory,
  );

  // User-specific settings routes
  // Get user settings
  server.get(
    '/user',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get user settings',
        description: 'Get all user-specific setting overrides',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
              message: { type: 'string' },
            },
          },
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate],
    },
    controller.getUserSettings,
  );

  // Update user setting
  server.put(
    '/user/:settingId',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Update user setting',
        description: 'Create or update a user-specific setting override',
        params: {
          type: 'object',
          properties: {
            settingId: { type: 'string', format: 'uuid' },
          },
          required: ['settingId'],
        },
        body: UpdateUserSettingSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate],
    },
    controller.updateUserSetting,
  );

  // Delete user setting
  server.delete(
    '/user/:settingId',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Delete user setting',
        description:
          'Remove user-specific setting override (revert to default)',
        params: {
          type: 'object',
          properties: {
            settingId: { type: 'string', format: 'uuid' },
          },
          required: ['settingId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      preValidation: [fastify.authenticate],
    },
    controller.deleteUserSetting,
  );
}
