import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ContractsController } from './contracts.controller';
import {
  CreateContractsSchema,
  UpdateContractsSchema,
  ContractsIdParamSchema,
  GetContractsQuerySchema,
  ListContractsQuerySchema,
  ContractsResponseSchema,
  ContractsListResponseSchema,
  FlexibleContractsListResponseSchema,
} from './contracts.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ContractsRoutesOptions extends FastifyPluginOptions {
  controller: ContractsController;
}

export async function contractsRoutes(
  fastify: FastifyInstance,
  options: ContractsRoutesOptions,
) {
  const { controller } = options;

  // Create contracts
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Contracts'],
      summary: 'Create a new contracts',
      description: 'Create a new contracts with the provided data',
      body: CreateContractsSchema,
      response: {
        201: ContractsResponseSchema,
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
      fastify.verifyPermission('contracts', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get contracts by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Contracts'],
      summary: 'Get contracts by ID',
      description: 'Retrieve a contracts by its unique identifier',
      params: ContractsIdParamSchema,
      querystring: GetContractsQuerySchema,
      response: {
        200: ContractsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('contracts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all contractss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Contracts'],
      summary: 'Get all contractss with pagination and formats',
      description:
        'Retrieve contractss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListContractsQuerySchema,
      response: {
        200: FlexibleContractsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('contracts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update contracts
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Contracts'],
      summary: 'Update contracts by ID',
      description: 'Update an existing contracts with new data',
      params: ContractsIdParamSchema,
      body: UpdateContractsSchema,
      response: {
        200: ContractsResponseSchema,
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
      fastify.verifyPermission('contracts', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete contracts
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Contracts'],
      summary: 'Delete contracts by ID',
      description: 'Delete a contracts by its unique identifier',
      params: ContractsIdParamSchema,
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
      fastify.verifyPermission('contracts', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
