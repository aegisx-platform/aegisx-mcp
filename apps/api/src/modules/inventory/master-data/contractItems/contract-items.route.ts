import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ContractItemsController } from './contract-items.controller';
import {
  CreateContractItemsSchema,
  UpdateContractItemsSchema,
  ContractItemsIdParamSchema,
  GetContractItemsQuerySchema,
  ListContractItemsQuerySchema,
  ContractItemsResponseSchema,
  ContractItemsListResponseSchema,
  FlexibleContractItemsListResponseSchema,
} from './contract-items.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ContractItemsRoutesOptions extends FastifyPluginOptions {
  controller: ContractItemsController;
}

export async function contractItemsRoutes(
  fastify: FastifyInstance,
  options: ContractItemsRoutesOptions,
) {
  const { controller } = options;

  // Create contractItems
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Contract Items'],
      summary: 'Create a new contractItems',
      description: 'Create a new contractItems with the provided data',
      body: CreateContractItemsSchema,
      response: {
        201: ContractItemsResponseSchema,
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
      fastify.verifyPermission('contractItems', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get contractItems by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Contract Items'],
      summary: 'Get contractItems by ID',
      description: 'Retrieve a contractItems by its unique identifier',
      params: ContractItemsIdParamSchema,
      querystring: GetContractItemsQuerySchema,
      response: {
        200: ContractItemsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('contractItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all contractItemss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Contract Items'],
      summary: 'Get all contractItemss with pagination and formats',
      description:
        'Retrieve contractItemss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListContractItemsQuerySchema,
      response: {
        200: FlexibleContractItemsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('contractItems', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update contractItems
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Contract Items'],
      summary: 'Update contractItems by ID',
      description: 'Update an existing contractItems with new data',
      params: ContractItemsIdParamSchema,
      body: UpdateContractItemsSchema,
      response: {
        200: ContractItemsResponseSchema,
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
      fastify.verifyPermission('contractItems', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete contractItems
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Contract Items'],
      summary: 'Delete contractItems by ID',
      description: 'Delete a contractItems by its unique identifier',
      params: ContractItemsIdParamSchema,
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
      fastify.verifyPermission('contractItems', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
