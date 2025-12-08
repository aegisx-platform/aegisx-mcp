import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugReturnsController } from './drug-returns.controller';
import {
  CreateDrugReturnsSchema,
  UpdateDrugReturnsSchema,
  DrugReturnsIdParamSchema,
  GetDrugReturnsQuerySchema,
  ListDrugReturnsQuerySchema,
  DrugReturnsResponseSchema,
  DrugReturnsListResponseSchema,
  FlexibleDrugReturnsListResponseSchema,
} from './drug-returns.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugReturnsRoutesOptions extends FastifyPluginOptions {
  controller: DrugReturnsController;
}

export async function drugReturnsRoutes(
  fastify: FastifyInstance,
  options: DrugReturnsRoutesOptions,
) {
  const { controller } = options;

  // Create drugReturns
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Drug Returns'],
      summary: 'Create a new drugReturns',
      description: 'Create a new drugReturns with the provided data',
      body: CreateDrugReturnsSchema,
      response: {
        201: DrugReturnsResponseSchema,
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
      fastify.verifyPermission('drugReturns', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugReturns by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Drug Returns'],
      summary: 'Get drugReturns by ID',
      description: 'Retrieve a drugReturns by its unique identifier',
      params: DrugReturnsIdParamSchema,
      querystring: GetDrugReturnsQuerySchema,
      response: {
        200: DrugReturnsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugReturns', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugReturnss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drug Returns'],
      summary: 'Get all drugReturnss with pagination and formats',
      description:
        'Retrieve drugReturnss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugReturnsQuerySchema,
      response: {
        200: FlexibleDrugReturnsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugReturns', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugReturns
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Drug Returns'],
      summary: 'Update drugReturns by ID',
      description: 'Update an existing drugReturns with new data',
      params: DrugReturnsIdParamSchema,
      body: UpdateDrugReturnsSchema,
      response: {
        200: DrugReturnsResponseSchema,
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
      fastify.verifyPermission('drugReturns', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugReturns
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Drug Returns'],
      summary: 'Delete drugReturns by ID',
      description: 'Delete a drugReturns by its unique identifier',
      params: DrugReturnsIdParamSchema,
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
      fastify.verifyPermission('drugReturns', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
