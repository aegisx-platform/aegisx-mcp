import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { SimpletestController } from '../controllers/simpletest.controller';
import {
  CreateSimpletestSchema,
  UpdateSimpletestSchema,
  SimpletestIdParamSchema,
  GetSimpletestQuerySchema,
  ListSimpletestQuerySchema,
  SimpletestResponseSchema,
  SimpletestListResponseSchema,
  FlexibleSimpletestListResponseSchema,
} from '../schemas/simpletest.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface SimpletestRoutesOptions extends FastifyPluginOptions {
  controller: SimpletestController;
}

export async function simpletestRoutes(
  fastify: FastifyInstance,
  options: SimpletestRoutesOptions,
) {
  const { controller } = options;

  // Create simpletest
  fastify.post('/', {
    schema: {
      tags: ['Simpletest'],
      summary: 'Create a new simpletest',
      description: 'Create a new simpletest with the provided data',
      body: CreateSimpletestSchema,
      response: {
        201: SimpletestResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpletest', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get simpletest by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Simpletest'],
      summary: 'Get simpletest by ID',
      description: 'Retrieve a simpletest by its unique identifier',
      params: SimpletestIdParamSchema,
      querystring: GetSimpletestQuerySchema,
      response: {
        200: SimpletestResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpletest.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all simpletests
  fastify.get('/', {
    schema: {
      tags: ['Simpletest'],
      summary: 'Get all simpletests with pagination and formats',
      description:
        'Retrieve simpletests with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListSimpletestQuerySchema,
      response: {
        200: FlexibleSimpletestListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpletest.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update simpletest
  fastify.put('/:id', {
    schema: {
      tags: ['Simpletest'],
      summary: 'Update simpletest by ID',
      description: 'Update an existing simpletest with new data',
      params: SimpletestIdParamSchema,
      body: UpdateSimpletestSchema,
      response: {
        200: SimpletestResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpletest.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete simpletest
  fastify.delete('/:id', {
    schema: {
      tags: ['Simpletest'],
      summary: 'Delete simpletest by ID',
      description: 'Delete a simpletest by its unique identifier',
      params: SimpletestIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpletest.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
