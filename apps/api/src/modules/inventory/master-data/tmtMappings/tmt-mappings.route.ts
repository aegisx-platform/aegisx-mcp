import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { TmtMappingsController } from './tmt-mappings.controller';
import {
  CreateTmtMappingsSchema,
  UpdateTmtMappingsSchema,
  TmtMappingsIdParamSchema,
  GetTmtMappingsQuerySchema,
  ListTmtMappingsQuerySchema,
  TmtMappingsResponseSchema,
  TmtMappingsListResponseSchema,
  FlexibleTmtMappingsListResponseSchema,
} from './tmt-mappings.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface TmtMappingsRoutesOptions extends FastifyPluginOptions {
  controller: TmtMappingsController;
}

export async function tmtMappingsRoutes(
  fastify: FastifyInstance,
  options: TmtMappingsRoutesOptions,
) {
  const { controller } = options;

  // Create tmtMappings
  fastify.post('/', {
    schema: {
      tags: ['TmtMappings'],
      summary: 'Create a new tmtMappings',
      description: 'Create a new tmtMappings with the provided data',
      body: CreateTmtMappingsSchema,
      response: {
        201: TmtMappingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('tmtMappings', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get tmtMappings by ID
  fastify.get('/:id', {
    schema: {
      tags: ['TmtMappings'],
      summary: 'Get tmtMappings by ID',
      description: 'Retrieve a tmtMappings by its unique identifier',
      params: TmtMappingsIdParamSchema,
      querystring: GetTmtMappingsQuerySchema,
      response: {
        200: TmtMappingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('tmtMappings', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all tmtMappingss
  fastify.get('/', {
    schema: {
      tags: ['TmtMappings'],
      summary: 'Get all tmtMappingss with pagination and formats',
      description:
        'Retrieve tmtMappingss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListTmtMappingsQuerySchema,
      response: {
        200: FlexibleTmtMappingsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('tmtMappings', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update tmtMappings
  fastify.put('/:id', {
    schema: {
      tags: ['TmtMappings'],
      summary: 'Update tmtMappings by ID',
      description: 'Update an existing tmtMappings with new data',
      params: TmtMappingsIdParamSchema,
      body: UpdateTmtMappingsSchema,
      response: {
        200: TmtMappingsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('tmtMappings', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete tmtMappings
  fastify.delete('/:id', {
    schema: {
      tags: ['TmtMappings'],
      summary: 'Delete tmtMappings by ID',
      description: 'Delete a tmtMappings by its unique identifier',
      params: TmtMappingsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('tmtMappings', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
