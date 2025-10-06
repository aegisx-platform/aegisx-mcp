import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ComprehensiveTestsController } from '../controllers/comprehensive-tests.controller';
import {
  CreateComprehensiveTestsSchema,
  UpdateComprehensiveTestsSchema,
  ComprehensiveTestsIdParamSchema,
  GetComprehensiveTestsQuerySchema,
  ListComprehensiveTestsQuerySchema,
  ComprehensiveTestsResponseSchema,
  ComprehensiveTestsListResponseSchema,
  FlexibleComprehensiveTestsListResponseSchema,
} from '../schemas/comprehensive-tests.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface ComprehensiveTestsRoutesOptions extends FastifyPluginOptions {
  controller: ComprehensiveTestsController;
}

export async function comprehensiveTestsRoutes(
  fastify: FastifyInstance,
  options: ComprehensiveTestsRoutesOptions,
) {
  const { controller } = options;

  // Create comprehensiveTests
  fastify.post('/', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Create a new comprehensiveTests',
      description: 'Create a new comprehensiveTests with the provided data',
      body: CreateComprehensiveTestsSchema,
      response: {
        201: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get comprehensiveTests by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Get comprehensiveTests by ID',
      description: 'Retrieve a comprehensiveTests by its unique identifier',
      params: ComprehensiveTestsIdParamSchema,
      querystring: GetComprehensiveTestsQuerySchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all comprehensiveTestss
  fastify.get('/', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Get all comprehensiveTestss with pagination and formats',
      description:
        'Retrieve comprehensiveTestss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListComprehensiveTestsQuerySchema,
      response: {
        200: FlexibleComprehensiveTestsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update comprehensiveTests
  fastify.put('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Update comprehensiveTests by ID',
      description: 'Update an existing comprehensiveTests with new data',
      params: ComprehensiveTestsIdParamSchema,
      body: UpdateComprehensiveTestsSchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
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
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete comprehensiveTests
  fastify.delete('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Delete comprehensiveTests by ID',
      description: 'Delete a comprehensiveTests by its unique identifier',
      params: ComprehensiveTestsIdParamSchema,
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
      fastify.authorize(['comprehensiveTests.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
