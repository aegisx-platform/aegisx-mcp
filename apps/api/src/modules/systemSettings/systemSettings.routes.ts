import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SystemSettingsController } from './systemSettings.controller';
import {
  CreateSystemSettingsSchema,
  UpdateSystemSettingsSchema,
  SystemSettingsIdParamSchema,
  GetSystemSettingsQuerySchema,
  ListSystemSettingsQuerySchema,
  SystemSettingsResponseSchema,
  SystemSettingsListResponseSchema,
} from './systemSettings.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../schemas/base.schemas';
import { SchemaRefs } from '../../schemas/registry';

export interface SystemSettingsRoutesOptions extends FastifyPluginOptions {
  controller: SystemSettingsController;
}

export async function systemSettingsRoutes(
  fastify: FastifyInstance,
  options: SystemSettingsRoutesOptions
) {
  const { controller } = options;

  // Create systemSettings
  fastify.post('/', {
    schema: {
      tags: ['SystemSettings'],
      summary: 'Create a new systemSettings',
      description: 'Create a new systemSettings with the provided data',
      body: CreateSystemSettingsSchema,
      response: {
        201: SystemSettingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get systemSettings by ID
  fastify.get('/:id', {
    schema: {
      tags: ['SystemSettings'],
      summary: 'Get systemSettings by ID',
      description: 'Retrieve a systemSettings by its unique identifier',
      params: SystemSettingsIdParamSchema,
      querystring: GetSystemSettingsQuerySchema,
      response: {
        200: SystemSettingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all systemSettingss
  fastify.get('/', {
    schema: {
      tags: ['SystemSettings'],
      summary: 'Get all systemSettingss with pagination',
      description: 'Retrieve a paginated list of systemSettingss with optional filtering',
      querystring: ListSystemSettingsQuerySchema,
      response: {
        200: SystemSettingsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update systemSettings
  fastify.put('/:id', {
    schema: {
      tags: ['SystemSettings'],
      summary: 'Update systemSettings by ID',
      description: 'Update an existing systemSettings with new data',
      params: SystemSettingsIdParamSchema,
      body: UpdateSystemSettingsSchema,
      response: {
        200: SystemSettingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.update.bind(controller)
  });

  // Delete systemSettings
  fastify.delete('/:id', {
    schema: {
      tags: ['SystemSettings'],
      summary: 'Delete systemSettings by ID',
      description: 'Delete a systemSettings by its unique identifier',
      params: SystemSettingsIdParamSchema,
      response: {
        200: SchemaRefs.SuccessMessage,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.delete.bind(controller)
  });

}