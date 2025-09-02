import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { SettingsService } from './settings.service';
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
  BulkUpdateResponseSchema
} from './settings.schemas';
import { SchemaRefs } from '../../schemas/registry';

export async function settingsRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new SettingsService(fastify.knex, fastify.redis);

  // Get all settings (with optional user overrides)
  server.get(
    '/',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get all settings',
        description: 'Get all settings with filtering and pagination. Authenticated users get their personal overrides.',
        querystring: GetSettingsQuerySchema,
        response: {
          200: SettingsListResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError
        }
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        const result = await service.getSettings(request.query, userId);

        return reply.send({
          success: true,
          data: result.settings,
          message: 'Settings retrieved successfully',
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: Math.ceil(result.total / result.limit)
          }
        });
      } catch (error) {
        fastify.log.error('Settings GET error: ' + error);
        throw error;
      }
    }
  );

  // Get grouped settings
  server.get(
    '/grouped',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Get settings grouped by category',
        description: 'Get settings organized by category and group for UI display',
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' }
          }
        },
        response: {
          200: GroupedSettingsResponseSchema,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError
        }
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    async (request, reply) => {
      const { namespace } = request.query as { namespace?: string };
      const userId = request.user?.id;
      const grouped = await service.getGroupedSettings(namespace, userId);

      return reply.send({
        success: true,
        data: grouped,
        message: 'Grouped settings retrieved successfully'
      });
    }
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
            key: { type: 'string' }
          },
          required: ['key']
        },
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' }
          }
        },
        response: {
          200: SettingResponseSchema,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError
        }
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const { namespace } = request.query as { namespace?: string };
      const userId = request.user?.id;
      
      const setting = await service.getSettingByKey(key, namespace, userId);
      
      if (!setting) {
        return reply.notFound('Setting not found');
      }

      return reply.send({
        success: true,
        data: setting,
        message: 'Setting retrieved successfully'
      });
    }
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
            key: { type: 'string' }
          },
          required: ['key']
        },
        querystring: {
          type: 'object',
          properties: {
            namespace: { type: 'string', default: 'default' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { 
                type: 'object',
                properties: {
                  value: {}
                }
              },
              message: { type: 'string' }
            }
          },
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError
        }
      },
      // Optional authentication - user gets personalized settings if authenticated
    },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const { namespace } = request.query as { namespace?: string };
      const userId = request.user?.id;
      
      const value = await service.getSettingValue(key, namespace, userId);
      
      if (value === null) {
        return reply.notFound('Setting not found');
      }

      return reply.send({
        success: true,
        data: { value },
        message: 'Setting value retrieved successfully'
      });
    }
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
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const setting = await service.getSettingById(id);
      
      if (!setting) {
        return reply.notFound('Setting not found');
      }

      return reply.send({
        success: true,
        data: setting,
        message: 'Setting retrieved successfully'
      });
    }
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
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const setting = await service.createSetting(request.body, request.user.id);
      
      return reply.status(201).send({
        success: true,
        data: setting,
        message: 'Setting created successfully'
      });
    }
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
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const setting = await service.updateSetting(id, request.body, request.user.id);
      
      return reply.send({
        success: true,
        data: setting,
        message: 'Setting updated successfully'
      });
    }
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
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { value } = request.body;
      const setting = await service.updateSettingValue(id, value, request.user.id, request);
      
      return reply.send({
        success: true,
        data: setting,
        message: 'Setting value updated successfully'
      });
    }
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
              message: { type: 'string' }
            }
          },
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await service.deleteSetting(id, request.user.id);
      
      return reply.send({
        success: true,
        message: 'Setting deleted successfully'
      });
    }
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
            namespace: { type: 'string', default: 'default' }
          }
        },
        response: {
          200: BulkUpdateResponseSchema,
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          403: SchemaRefs.Forbidden,
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const { namespace } = request.query as { namespace?: string };
      const result = await service.bulkUpdateSettings(
        request.body,
        namespace,
        request.user.id
      );
      
      return reply.send({
        success: true,
        data: result,
        message: 'Bulk update completed'
      });
    }
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
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate, fastify.verifyRole(['admin'])]
    },
    async (request, reply) => {
      const result = await service.getSettingHistory(request.query);
      
      return reply.send({
        success: true,
        data: result.history,
        message: 'Setting history retrieved successfully',
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit)
        }
      });
    }
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
              message: { type: 'string' }
            }
          },
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate]
    },
    async (request, reply) => {
      const settings = await service.getUserSettings(request.user.id);
      
      return reply.send({
        success: true,
        data: settings,
        message: 'User settings retrieved successfully'
      });
    }
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
            settingId: { type: 'string', format: 'uuid' }
          },
          required: ['settingId']
        },
        body: UpdateUserSettingSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          },
          400: SchemaRefs.ValidationError,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate]
    },
    async (request, reply) => {
      const { settingId } = request.params as { settingId: string };
      const { value } = request.body;
      
      const userSetting = await service.updateUserSetting(
        request.user.id,
        settingId,
        value
      );
      
      return reply.send({
        success: true,
        data: userSetting,
        message: 'User setting updated successfully'
      });
    }
  );

  // Delete user setting
  server.delete(
    '/user/:settingId',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Delete user setting',
        description: 'Remove user-specific setting override (revert to default)',
        params: {
          type: 'object',
          properties: {
            settingId: { type: 'string', format: 'uuid' }
          },
          required: ['settingId']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          },
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError
        }
      },
      preValidation: [fastify.authenticate]
    },
    async (request, reply) => {
      const { settingId } = request.params as { settingId: string };
      
      await service.deleteUserSetting(request.user.id, settingId);
      
      return reply.send({
        success: true,
        message: 'User setting deleted successfully'
      });
    }
  );
}