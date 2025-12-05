import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { HospitalsController } from './hospitals.controller';
import {
  CreateHospitalsSchema,
  UpdateHospitalsSchema,
  HospitalsIdParamSchema,
  GetHospitalsQuerySchema,
  ListHospitalsQuerySchema,
  HospitalsResponseSchema,
  HospitalsListResponseSchema,
  FlexibleHospitalsListResponseSchema,
} from './hospitals.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface HospitalsRoutesOptions extends FastifyPluginOptions {
  controller: HospitalsController;
}

export async function hospitalsRoutes(
  fastify: FastifyInstance,
  options: HospitalsRoutesOptions,
) {
  const { controller } = options;

  // Create hospitals
  fastify.post('/', {
    schema: {
      tags: ['Hospitals'],
      summary: 'Create a new hospitals',
      description: 'Create a new hospitals with the provided data',
      body: CreateHospitalsSchema,
      response: {
        201: HospitalsResponseSchema,
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
      fastify.verifyPermission('hospitals', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get hospitals by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Hospitals'],
      summary: 'Get hospitals by ID',
      description: 'Retrieve a hospitals by its unique identifier',
      params: HospitalsIdParamSchema,
      querystring: GetHospitalsQuerySchema,
      response: {
        200: HospitalsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('hospitals', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all hospitalss
  fastify.get('/', {
    schema: {
      tags: ['Hospitals'],
      summary: 'Get all hospitalss with pagination and formats',
      description:
        'Retrieve hospitalss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListHospitalsQuerySchema,
      response: {
        200: FlexibleHospitalsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('hospitals', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update hospitals
  fastify.put('/:id', {
    schema: {
      tags: ['Hospitals'],
      summary: 'Update hospitals by ID',
      description: 'Update an existing hospitals with new data',
      params: HospitalsIdParamSchema,
      body: UpdateHospitalsSchema,
      response: {
        200: HospitalsResponseSchema,
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
      fastify.verifyPermission('hospitals', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete hospitals
  fastify.delete('/:id', {
    schema: {
      tags: ['Hospitals'],
      summary: 'Delete hospitals by ID',
      description: 'Delete a hospitals by its unique identifier',
      params: HospitalsIdParamSchema,
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
      fastify.verifyPermission('hospitals', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
