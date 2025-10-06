import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { SimpleTestsController } from '../controllers/simpleTests.controller';
import {
  CreateSimpleTestsSchema,
  UpdateSimpleTestsSchema,
  SimpleTestsIdParamSchema,
  GetSimpleTestsQuerySchema,
  ListSimpleTestsQuerySchema,
  SimpleTestsResponseSchema,
  SimpleTestsListResponseSchema,
  FlexibleSimpleTestsListResponseSchema,
} from '../schemas/simpleTests.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface SimpleTestsRoutesOptions extends FastifyPluginOptions {
  controller: SimpleTestsController;
}

export async function simpleTestsRoutes(
  fastify: FastifyInstance,
  options: SimpleTestsRoutesOptions,
) {
  const { controller } = options;

  // Create simpleTests
  fastify.post('/', {
    schema: {
      tags: ['SimpleTests'],
      summary: 'Create a new simpleTests',
      description: 'Create a new simpleTests with the provided data',
      body: CreateSimpleTestsSchema,
      response: {
        201: SimpleTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpleTests', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get simpleTests by ID
  fastify.get('/:id', {
    schema: {
      tags: ['SimpleTests'],
      summary: 'Get simpleTests by ID',
      description: 'Retrieve a simpleTests by its unique identifier',
      params: SimpleTestsIdParamSchema,
      querystring: GetSimpleTestsQuerySchema,
      response: {
        200: SimpleTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpleTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all simpleTestss
  fastify.get('/', {
    schema: {
      tags: ['SimpleTests'],
      summary: 'Get all simpleTestss with pagination and formats',
      description:
        'Retrieve simpleTestss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListSimpleTestsQuerySchema,
      response: {
        200: FlexibleSimpleTestsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['simpleTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update simpleTests
  fastify.put('/:id', {
    schema: {
      tags: ['SimpleTests'],
      summary: 'Update simpleTests by ID',
      description: 'Update an existing simpleTests with new data',
      params: SimpleTestsIdParamSchema,
      body: UpdateSimpleTestsSchema,
      response: {
        200: SimpleTestsResponseSchema,
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
      fastify.authorize(['simpleTests.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete simpleTests
  fastify.delete('/:id', {
    schema: {
      tags: ['SimpleTests'],
      summary: 'Delete simpleTests by ID',
      description: 'Delete a simpleTests by its unique identifier',
      params: SimpleTestsIdParamSchema,
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
      fastify.authorize(['simpleTests.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
