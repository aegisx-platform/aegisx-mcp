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
  ErrorResponseSchema
} from './themes.schemas';

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
      body: CreateThemesSchema,
      response: {
        201: ThemesResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.create.bind(controller)
  });

  // Get themes by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Get themes by ID',
      params: ThemesIdParamSchema,
      querystring: GetThemesQuerySchema,
      response: {
        200: ThemesResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findOne.bind(controller)
  });

  // Get all themess
  fastify.get('/', {
    schema: {
      tags: ['Themes'],
      summary: 'Get all themess with pagination',
      querystring: ListThemesQuerySchema,
      response: {
        200: ThemesListResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.findMany.bind(controller)
  });

  // Update themes
  fastify.put('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Update themes by ID',
      params: ThemesIdParamSchema,
      body: UpdateThemesSchema,
      response: {
        200: ThemesResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.update.bind(controller)
  });

  // Delete themes
  fastify.delete('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Delete themes by ID',
      params: ThemesIdParamSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    },
    handler: controller.delete.bind(controller)
  });

}