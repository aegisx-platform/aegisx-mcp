import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugReturnItemsController } from './drug-return-items.controller';
import {
  CreateDrugReturnItemsSchema,
  UpdateDrugReturnItemsSchema,
  DrugReturnItemsIdParamSchema,
  GetDrugReturnItemsQuerySchema,
  ListDrugReturnItemsQuerySchema,
  DrugReturnItemsResponseSchema,
  DrugReturnItemsListResponseSchema,
  FlexibleDrugReturnItemsListResponseSchema,
} from './drug-return-items.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugReturnItemsRoutesOptions extends FastifyPluginOptions {
  controller: DrugReturnItemsController;
}

export async function drugReturnItemsRoutes(
  fastify: FastifyInstance,
  options: DrugReturnItemsRoutesOptions,
) {
  const { controller } = options;

  // Create drugReturnItems
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Drug Return Items'],
      summary: 'Create a new drugReturnItems',
      description: 'Create a new drugReturnItems with the provided data',
      body: CreateDrugReturnItemsSchema,
      response: {
        201: DrugReturnItemsResponseSchema,
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
      fastify.verifyPermission('drugReturnItems', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugReturnItems by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Drug Return Items'],
      summary: 'Get drugReturnItems by ID',
      description: 'Retrieve a drugReturnItems by its unique identifier',
      params: DrugReturnItemsIdParamSchema,
      querystring: GetDrugReturnItemsQuerySchema,
      response: {
        200: DrugReturnItemsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugReturnItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugReturnItemss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drug Return Items'],
      summary: 'Get all drugReturnItemss with pagination and formats',
      description:
        'Retrieve drugReturnItemss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugReturnItemsQuerySchema,
      response: {
        200: FlexibleDrugReturnItemsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugReturnItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugReturnItems
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Drug Return Items'],
      summary: 'Update drugReturnItems by ID',
      description: 'Update an existing drugReturnItems with new data',
      params: DrugReturnItemsIdParamSchema,
      body: UpdateDrugReturnItemsSchema,
      response: {
        200: DrugReturnItemsResponseSchema,
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
      fastify.verifyPermission('drugReturnItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugReturnItems
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Drug Return Items'],
      summary: 'Delete drugReturnItems by ID',
      description: 'Delete a drugReturnItems by its unique identifier',
      params: DrugReturnItemsIdParamSchema,
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
      fastify.verifyPermission('drugReturnItems', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
