import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DistributionTypesController } from './distribution-types.controller';
import {
  CreateDistributionTypesSchema,
  UpdateDistributionTypesSchema,
  DistributionTypesIdParamSchema,
  GetDistributionTypesQuerySchema,
  ListDistributionTypesQuerySchema,
  DistributionTypesResponseSchema,
  DistributionTypesListResponseSchema,
  FlexibleDistributionTypesListResponseSchema,
} from './distribution-types.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DistributionTypesRoutesOptions extends FastifyPluginOptions {
  controller: DistributionTypesController;
}

export async function distributionTypesRoutes(
  fastify: FastifyInstance,
  options: DistributionTypesRoutesOptions,
) {
  const { controller } = options;

  // Create distributionTypes
  fastify.post('/', {
    schema: {
      tags: ['DistributionTypes'],
      summary: 'Create a new distributionTypes',
      description: 'Create a new distributionTypes with the provided data',
      body: CreateDistributionTypesSchema,
      response: {
        201: DistributionTypesResponseSchema,
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
      fastify.verifyPermission('distributionTypes', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get distributionTypes by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DistributionTypes'],
      summary: 'Get distributionTypes by ID',
      description: 'Retrieve a distributionTypes by its unique identifier',
      params: DistributionTypesIdParamSchema,
      querystring: GetDistributionTypesQuerySchema,
      response: {
        200: DistributionTypesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('distributionTypes', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all distributionTypess
  fastify.get('/', {
    schema: {
      tags: ['DistributionTypes'],
      summary: 'Get all distributionTypess with pagination and formats',
      description:
        'Retrieve distributionTypess with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDistributionTypesQuerySchema,
      response: {
        200: FlexibleDistributionTypesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('distributionTypes', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update distributionTypes
  fastify.put('/:id', {
    schema: {
      tags: ['DistributionTypes'],
      summary: 'Update distributionTypes by ID',
      description: 'Update an existing distributionTypes with new data',
      params: DistributionTypesIdParamSchema,
      body: UpdateDistributionTypesSchema,
      response: {
        200: DistributionTypesResponseSchema,
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
      fastify.verifyPermission('distributionTypes', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete distributionTypes
  fastify.delete('/:id', {
    schema: {
      tags: ['DistributionTypes'],
      summary: 'Delete distributionTypes by ID',
      description: 'Delete a distributionTypes by its unique identifier',
      params: DistributionTypesIdParamSchema,
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
      fastify.verifyPermission('distributionTypes', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
