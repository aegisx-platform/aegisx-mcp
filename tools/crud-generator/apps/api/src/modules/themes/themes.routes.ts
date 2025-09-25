import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ThemesController } from './themes.controller';
import {
  CreateThemesSchema,
  UpdateThemesSchema,
  ThemesIdParamSchema,
  GetThemesQuerySchema,
  ListThemesQuerySchema,
  ThemesResponseSchema,
  ThemesListResponseSchema,
} from './themes.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../schemas/base.schemas';
import { SchemaRefs } from '../../schemas/registry';

export interface ThemesRoutesOptions extends FastifyPluginOptions {
  controller: ThemesController;
}

export async function themesRoutes(
  fastify: FastifyInstance,
  options: ThemesRoutesOptions
) {
  const { controller } = options;

  // Create themes
  fastify.post('/', {
    schema: {
      tags: ['Themes'],
      summary: 'Create a new themes',
      description: 'Create a new themes with the provided data',
      body: CreateThemesSchema,
      response: {
        201: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get themes by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Get themes by ID',
      description: 'Retrieve a themes by its unique identifier',
      params: ThemesIdParamSchema,
      querystring: GetThemesQuerySchema,
      response: {
        200: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all themess
  fastify.get('/', {
    schema: {
      tags: ['Themes'],
      summary: 'Get all themess with pagination',
      description: 'Retrieve a paginated list of themess with optional filtering',
      querystring: ListThemesQuerySchema,
      response: {
        200: ThemesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update themes
  fastify.put('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Update themes by ID',
      description: 'Update an existing themes with new data',
      params: ThemesIdParamSchema,
      body: UpdateThemesSchema,
      response: {
        200: ThemesResponseSchema,
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

  // Delete themes
  fastify.delete('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Delete themes by ID',
      description: 'Delete a themes by its unique identifier',
      params: ThemesIdParamSchema,
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