import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugGenericsController } from '../controllers/drug-generics.controller';
import {
  CreateDrugGenericsSchema,
  UpdateDrugGenericsSchema,
  DrugGenericsIdParamSchema,
  GetDrugGenericsQuerySchema,
  ListDrugGenericsQuerySchema,
  DrugGenericsResponseSchema,
  DrugGenericsListResponseSchema,
  FlexibleDrugGenericsListResponseSchema,
} from '../schemas/drug-generics.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../../schemas/registry';

export interface DrugGenericsRoutesOptions extends FastifyPluginOptions {
  controller: DrugGenericsController;
}

export async function drugGenericsRoutes(
  fastify: FastifyInstance,
  options: DrugGenericsRoutesOptions,
) {
  const { controller } = options;

  // Create drugGenerics
  fastify.post('/', {
    schema: {
      tags: ['DrugGenerics'],
      summary: 'Create a new drugGenerics',
      description: 'Create a new drugGenerics with the provided data',
      body: CreateDrugGenericsSchema,
      response: {
        201: DrugGenericsResponseSchema,
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
      fastify.verifyPermission('drugGenerics', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugGenerics by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DrugGenerics'],
      summary: 'Get drugGenerics by ID',
      description: 'Retrieve a drugGenerics by its unique identifier',
      params: DrugGenericsIdParamSchema,
      querystring: GetDrugGenericsQuerySchema,
      response: {
        200: DrugGenericsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugGenerics', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugGenericss
  fastify.get('/', {
    schema: {
      tags: ['DrugGenerics'],
      summary: 'Get all drugGenericss with pagination and formats',
      description:
        'Retrieve drugGenericss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugGenericsQuerySchema,
      response: {
        200: FlexibleDrugGenericsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugGenerics', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugGenerics
  fastify.put('/:id', {
    schema: {
      tags: ['DrugGenerics'],
      summary: 'Update drugGenerics by ID',
      description: 'Update an existing drugGenerics with new data',
      params: DrugGenericsIdParamSchema,
      body: UpdateDrugGenericsSchema,
      response: {
        200: DrugGenericsResponseSchema,
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
      fastify.verifyPermission('drugGenerics', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugGenerics
  fastify.delete('/:id', {
    schema: {
      tags: ['DrugGenerics'],
      summary: 'Delete drugGenerics by ID',
      description: 'Delete a drugGenerics by its unique identifier',
      params: DrugGenericsIdParamSchema,
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
      fastify.verifyPermission('drugGenerics', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
