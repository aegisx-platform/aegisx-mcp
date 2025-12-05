import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugPackRatiosController } from './drug-pack-ratios.controller';
import {
  CreateDrugPackRatiosSchema,
  UpdateDrugPackRatiosSchema,
  DrugPackRatiosIdParamSchema,
  GetDrugPackRatiosQuerySchema,
  ListDrugPackRatiosQuerySchema,
  DrugPackRatiosResponseSchema,
  DrugPackRatiosListResponseSchema,
  FlexibleDrugPackRatiosListResponseSchema,
} from './drug-pack-ratios.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugPackRatiosRoutesOptions extends FastifyPluginOptions {
  controller: DrugPackRatiosController;
}

export async function drugPackRatiosRoutes(
  fastify: FastifyInstance,
  options: DrugPackRatiosRoutesOptions,
) {
  const { controller } = options;

  // Create drugPackRatios
  fastify.post('/', {
    schema: {
      tags: ['DrugPackRatios'],
      summary: 'Create a new drugPackRatios',
      description: 'Create a new drugPackRatios with the provided data',
      body: CreateDrugPackRatiosSchema,
      response: {
        201: DrugPackRatiosResponseSchema,
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
      fastify.verifyPermission('drugPackRatios', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugPackRatios by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DrugPackRatios'],
      summary: 'Get drugPackRatios by ID',
      description: 'Retrieve a drugPackRatios by its unique identifier',
      params: DrugPackRatiosIdParamSchema,
      querystring: GetDrugPackRatiosQuerySchema,
      response: {
        200: DrugPackRatiosResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugPackRatios', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugPackRatioss
  fastify.get('/', {
    schema: {
      tags: ['DrugPackRatios'],
      summary: 'Get all drugPackRatioss with pagination and formats',
      description:
        'Retrieve drugPackRatioss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugPackRatiosQuerySchema,
      response: {
        200: FlexibleDrugPackRatiosListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugPackRatios', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugPackRatios
  fastify.put('/:id', {
    schema: {
      tags: ['DrugPackRatios'],
      summary: 'Update drugPackRatios by ID',
      description: 'Update an existing drugPackRatios with new data',
      params: DrugPackRatiosIdParamSchema,
      body: UpdateDrugPackRatiosSchema,
      response: {
        200: DrugPackRatiosResponseSchema,
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
      fastify.verifyPermission('drugPackRatios', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugPackRatios
  fastify.delete('/:id', {
    schema: {
      tags: ['DrugPackRatios'],
      summary: 'Delete drugPackRatios by ID',
      description: 'Delete a drugPackRatios by its unique identifier',
      params: DrugPackRatiosIdParamSchema,
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
      fastify.verifyPermission('drugPackRatios', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
