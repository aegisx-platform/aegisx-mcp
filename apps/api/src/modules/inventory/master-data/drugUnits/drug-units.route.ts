import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugUnitsController } from './drug-units.controller';
import {
  CreateDrugUnitsSchema,
  UpdateDrugUnitsSchema,
  DrugUnitsIdParamSchema,
  GetDrugUnitsQuerySchema,
  ListDrugUnitsQuerySchema,
  DrugUnitsResponseSchema,
  DrugUnitsListResponseSchema,
  FlexibleDrugUnitsListResponseSchema,
} from './drug-units.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugUnitsRoutesOptions extends FastifyPluginOptions {
  controller: DrugUnitsController;
}

export async function drugUnitsRoutes(
  fastify: FastifyInstance,
  options: DrugUnitsRoutesOptions,
) {
  const { controller } = options;

  // Create drugUnits
  fastify.post('/', {
    schema: {
      tags: ['DrugUnits'],
      summary: 'Create a new drugUnits',
      description: 'Create a new drugUnits with the provided data',
      body: CreateDrugUnitsSchema,
      response: {
        201: DrugUnitsResponseSchema,
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
      fastify.verifyPermission('drugUnits', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugUnits by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DrugUnits'],
      summary: 'Get drugUnits by ID',
      description: 'Retrieve a drugUnits by its unique identifier',
      params: DrugUnitsIdParamSchema,
      querystring: GetDrugUnitsQuerySchema,
      response: {
        200: DrugUnitsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugUnits', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugUnitss
  fastify.get('/', {
    schema: {
      tags: ['DrugUnits'],
      summary: 'Get all drugUnitss with pagination and formats',
      description:
        'Retrieve drugUnitss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugUnitsQuerySchema,
      response: {
        200: FlexibleDrugUnitsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugUnits', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugUnits
  fastify.put('/:id', {
    schema: {
      tags: ['DrugUnits'],
      summary: 'Update drugUnits by ID',
      description: 'Update an existing drugUnits with new data',
      params: DrugUnitsIdParamSchema,
      body: UpdateDrugUnitsSchema,
      response: {
        200: DrugUnitsResponseSchema,
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
      fastify.verifyPermission('drugUnits', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugUnits
  fastify.delete('/:id', {
    schema: {
      tags: ['DrugUnits'],
      summary: 'Delete drugUnits by ID',
      description: 'Delete a drugUnits by its unique identifier',
      params: DrugUnitsIdParamSchema,
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
      fastify.verifyPermission('drugUnits', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
