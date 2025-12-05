import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { CompaniesController } from './companies.controller';
import {
  CreateCompaniesSchema,
  UpdateCompaniesSchema,
  CompaniesIdParamSchema,
  GetCompaniesQuerySchema,
  ListCompaniesQuerySchema,
  CompaniesResponseSchema,
  CompaniesListResponseSchema,
  FlexibleCompaniesListResponseSchema,
} from './companies.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface CompaniesRoutesOptions extends FastifyPluginOptions {
  controller: CompaniesController;
}

export async function companiesRoutes(
  fastify: FastifyInstance,
  options: CompaniesRoutesOptions,
) {
  const { controller } = options;

  // Create companies
  fastify.post('/', {
    schema: {
      tags: ['Companies'],
      summary: 'Create a new companies',
      description: 'Create a new companies with the provided data',
      body: CreateCompaniesSchema,
      response: {
        201: CompaniesResponseSchema,
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
      fastify.verifyPermission('companies', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get companies by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Companies'],
      summary: 'Get companies by ID',
      description: 'Retrieve a companies by its unique identifier',
      params: CompaniesIdParamSchema,
      querystring: GetCompaniesQuerySchema,
      response: {
        200: CompaniesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('companies', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all companiess
  fastify.get('/', {
    schema: {
      tags: ['Companies'],
      summary: 'Get all companiess with pagination and formats',
      description:
        'Retrieve companiess with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListCompaniesQuerySchema,
      response: {
        200: FlexibleCompaniesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('companies', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update companies
  fastify.put('/:id', {
    schema: {
      tags: ['Companies'],
      summary: 'Update companies by ID',
      description: 'Update an existing companies with new data',
      params: CompaniesIdParamSchema,
      body: UpdateCompaniesSchema,
      response: {
        200: CompaniesResponseSchema,
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
      fastify.verifyPermission('companies', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete companies
  fastify.delete('/:id', {
    schema: {
      tags: ['Companies'],
      summary: 'Delete companies by ID',
      description: 'Delete a companies by its unique identifier',
      params: CompaniesIdParamSchema,
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
      fastify.verifyPermission('companies', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
