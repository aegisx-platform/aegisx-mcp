import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugFocusListsController } from './drug-focus-lists.controller';
import {
  CreateDrugFocusListsSchema,
  UpdateDrugFocusListsSchema,
  DrugFocusListsIdParamSchema,
  GetDrugFocusListsQuerySchema,
  ListDrugFocusListsQuerySchema,
  DrugFocusListsResponseSchema,
  DrugFocusListsListResponseSchema,
  FlexibleDrugFocusListsListResponseSchema,
} from './drug-focus-lists.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugFocusListsRoutesOptions extends FastifyPluginOptions {
  controller: DrugFocusListsController;
}

export async function drugFocusListsRoutes(
  fastify: FastifyInstance,
  options: DrugFocusListsRoutesOptions,
) {
  const { controller } = options;

  // Create drugFocusLists
  fastify.post('/', {
    schema: {
      tags: ['DrugFocusLists'],
      summary: 'Create a new drugFocusLists',
      description: 'Create a new drugFocusLists with the provided data',
      body: CreateDrugFocusListsSchema,
      response: {
        201: DrugFocusListsResponseSchema,
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
      fastify.verifyPermission('drugFocusLists', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugFocusLists by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DrugFocusLists'],
      summary: 'Get drugFocusLists by ID',
      description: 'Retrieve a drugFocusLists by its unique identifier',
      params: DrugFocusListsIdParamSchema,
      querystring: GetDrugFocusListsQuerySchema,
      response: {
        200: DrugFocusListsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugFocusLists', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugFocusListss
  fastify.get('/', {
    schema: {
      tags: ['DrugFocusLists'],
      summary: 'Get all drugFocusListss with pagination and formats',
      description:
        'Retrieve drugFocusListss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugFocusListsQuerySchema,
      response: {
        200: FlexibleDrugFocusListsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugFocusLists', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugFocusLists
  fastify.put('/:id', {
    schema: {
      tags: ['DrugFocusLists'],
      summary: 'Update drugFocusLists by ID',
      description: 'Update an existing drugFocusLists with new data',
      params: DrugFocusListsIdParamSchema,
      body: UpdateDrugFocusListsSchema,
      response: {
        200: DrugFocusListsResponseSchema,
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
      fastify.verifyPermission('drugFocusLists', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugFocusLists
  fastify.delete('/:id', {
    schema: {
      tags: ['DrugFocusLists'],
      summary: 'Delete drugFocusLists by ID',
      description: 'Delete a drugFocusLists by its unique identifier',
      params: DrugFocusListsIdParamSchema,
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
      fastify.verifyPermission('drugFocusLists', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
