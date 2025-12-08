import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DrugDistributionsController } from './drug-distributions.controller';
import {
  CreateDrugDistributionsSchema,
  UpdateDrugDistributionsSchema,
  DrugDistributionsIdParamSchema,
  GetDrugDistributionsQuerySchema,
  ListDrugDistributionsQuerySchema,
  DrugDistributionsResponseSchema,
  DrugDistributionsListResponseSchema,
  FlexibleDrugDistributionsListResponseSchema,
} from './drug-distributions.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DrugDistributionsRoutesOptions extends FastifyPluginOptions {
  controller: DrugDistributionsController;
}

export async function drugDistributionsRoutes(
  fastify: FastifyInstance,
  options: DrugDistributionsRoutesOptions,
) {
  const { controller } = options;

  // Create drugDistributions
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Drug Distributions'],
      summary: 'Create a new drugDistributions',
      description: 'Create a new drugDistributions with the provided data',
      body: CreateDrugDistributionsSchema,
      response: {
        201: DrugDistributionsResponseSchema,
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
      fastify.verifyPermission('drugDistributions', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get drugDistributions by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Drug Distributions'],
      summary: 'Get drugDistributions by ID',
      description: 'Retrieve a drugDistributions by its unique identifier',
      params: DrugDistributionsIdParamSchema,
      querystring: GetDrugDistributionsQuerySchema,
      response: {
        200: DrugDistributionsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugDistributions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all drugDistributionss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drug Distributions'],
      summary: 'Get all drugDistributionss with pagination and formats',
      description:
        'Retrieve drugDistributionss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDrugDistributionsQuerySchema,
      response: {
        200: FlexibleDrugDistributionsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('drugDistributions', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update drugDistributions
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Drug Distributions'],
      summary: 'Update drugDistributions by ID',
      description: 'Update an existing drugDistributions with new data',
      params: DrugDistributionsIdParamSchema,
      body: UpdateDrugDistributionsSchema,
      response: {
        200: DrugDistributionsResponseSchema,
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
      fastify.verifyPermission('drugDistributions', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete drugDistributions
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Drug Distributions'],
      summary: 'Delete drugDistributions by ID',
      description: 'Delete a drugDistributions by its unique identifier',
      params: DrugDistributionsIdParamSchema,
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
      fastify.verifyPermission('drugDistributions', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
