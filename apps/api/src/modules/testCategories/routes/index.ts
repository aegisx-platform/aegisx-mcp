import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { TestCategoriesController } from '../controllers/test-categories.controller';
import {
  CreateTestCategoriesSchema,
  UpdateTestCategoriesSchema,
  TestCategoriesIdParamSchema,
  GetTestCategoriesQuerySchema,
  ListTestCategoriesQuerySchema,
  TestCategoriesResponseSchema,
  TestCategoriesListResponseSchema,
  FlexibleTestCategoriesListResponseSchema,
} from '../schemas/test-categories.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface TestCategoriesRoutesOptions extends FastifyPluginOptions {
  controller: TestCategoriesController;
}

export async function testCategoriesRoutes(
  fastify: FastifyInstance,
  options: TestCategoriesRoutesOptions,
) {
  const { controller } = options;

  // Create testCategories
  fastify.post('/', {
    schema: {
      tags: ['TestCategories'],
      summary: 'Create a new testCategories',
      description: 'Create a new testCategories with the provided data',
      body: CreateTestCategoriesSchema,
      response: {
        201: TestCategoriesResponseSchema,
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
      fastify.verifyPermission('testCategories', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get testCategories by ID
  fastify.get('/:id', {
    schema: {
      tags: ['TestCategories'],
      summary: 'Get testCategories by ID',
      description: 'Retrieve a testCategories by its unique identifier',
      params: TestCategoriesIdParamSchema,
      querystring: GetTestCategoriesQuerySchema,
      response: {
        200: TestCategoriesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('testCategories', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all testCategoriess
  fastify.get('/', {
    schema: {
      tags: ['TestCategories'],
      summary: 'Get all testCategoriess with pagination and formats',
      description:
        'Retrieve testCategoriess with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListTestCategoriesQuerySchema,
      response: {
        200: FlexibleTestCategoriesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('testCategories', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update testCategories
  fastify.put('/:id', {
    schema: {
      tags: ['TestCategories'],
      summary: 'Update testCategories by ID',
      description: 'Update an existing testCategories with new data',
      params: TestCategoriesIdParamSchema,
      body: UpdateTestCategoriesSchema,
      response: {
        200: TestCategoriesResponseSchema,
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
      fastify.verifyPermission('testCategories', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete testCategories
  fastify.delete('/:id', {
    schema: {
      tags: ['TestCategories'],
      summary: 'Delete testCategories by ID',
      description: 'Delete a testCategories by its unique identifier',
      params: TestCategoriesIdParamSchema,
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
      fastify.verifyPermission('testCategories', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
