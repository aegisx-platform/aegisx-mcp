import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { TestProductsController } from '../controllers/test-products.controller';
import {
  CreateTestProductsSchema,
  UpdateTestProductsSchema,
  TestProductsIdParamSchema,
  GetTestProductsQuerySchema,
  ListTestProductsQuerySchema,
  TestProductsResponseSchema,
  TestProductsListResponseSchema,
  FlexibleTestProductsListResponseSchema,
} from '../schemas/test-products.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface TestProductsRoutesOptions extends FastifyPluginOptions {
  controller: TestProductsController;
}

export async function testProductsRoutes(
  fastify: FastifyInstance,
  options: TestProductsRoutesOptions,
) {
  const { controller } = options;

  // Create testProducts
  fastify.post('/', {
    schema: {
      tags: ['TestProducts'],
      summary: 'Create a new testProducts',
      description: 'Create a new testProducts with the provided data',
      body: CreateTestProductsSchema,
      response: {
        201: TestProductsResponseSchema,
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
      fastify.verifyPermission('testProducts', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get testProducts by ID
  fastify.get('/:id', {
    schema: {
      tags: ['TestProducts'],
      summary: 'Get testProducts by ID',
      description: 'Retrieve a testProducts by its unique identifier',
      params: TestProductsIdParamSchema,
      querystring: GetTestProductsQuerySchema,
      response: {
        200: TestProductsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('testProducts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all testProductss
  fastify.get('/', {
    schema: {
      tags: ['TestProducts'],
      summary: 'Get all testProductss with pagination and formats',
      description:
        'Retrieve testProductss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListTestProductsQuerySchema,
      response: {
        200: FlexibleTestProductsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('testProducts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update testProducts
  fastify.put('/:id', {
    schema: {
      tags: ['TestProducts'],
      summary: 'Update testProducts by ID',
      description: 'Update an existing testProducts with new data',
      params: TestProductsIdParamSchema,
      body: UpdateTestProductsSchema,
      response: {
        200: TestProductsResponseSchema,
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
      fastify.verifyPermission('testProducts', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete testProducts
  fastify.delete('/:id', {
    schema: {
      tags: ['TestProducts'],
      summary: 'Delete testProducts by ID',
      description: 'Delete a testProducts by its unique identifier',
      params: TestProductsIdParamSchema,
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
      fastify.verifyPermission('testProducts', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
