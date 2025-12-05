import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { HospitalPharmaceuticalProductsController } from './hospital-pharmaceutical-products.controller';
import {
  CreateHospitalPharmaceuticalProductsSchema,
  UpdateHospitalPharmaceuticalProductsSchema,
  HospitalPharmaceuticalProductsIdParamSchema,
  GetHospitalPharmaceuticalProductsQuerySchema,
  ListHospitalPharmaceuticalProductsQuerySchema,
  HospitalPharmaceuticalProductsResponseSchema,
  HospitalPharmaceuticalProductsListResponseSchema,
  FlexibleHospitalPharmaceuticalProductsListResponseSchema,
} from './hospital-pharmaceutical-products.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface HospitalPharmaceuticalProductsRoutesOptions
  extends FastifyPluginOptions {
  controller: HospitalPharmaceuticalProductsController;
}

export async function hospitalPharmaceuticalProductsRoutes(
  fastify: FastifyInstance,
  options: HospitalPharmaceuticalProductsRoutesOptions,
) {
  const { controller } = options;

  // Create hospitalPharmaceuticalProducts
  fastify.post('/', {
    schema: {
      tags: ['HospitalPharmaceuticalProducts'],
      summary: 'Create a new hospitalPharmaceuticalProducts',
      description:
        'Create a new hospitalPharmaceuticalProducts with the provided data',
      body: CreateHospitalPharmaceuticalProductsSchema,
      response: {
        201: HospitalPharmaceuticalProductsResponseSchema,
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
      fastify.verifyPermission('hospitalPharmaceuticalProducts', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get hospitalPharmaceuticalProducts by ID
  fastify.get('/:id', {
    schema: {
      tags: ['HospitalPharmaceuticalProducts'],
      summary: 'Get hospitalPharmaceuticalProducts by ID',
      description:
        'Retrieve a hospitalPharmaceuticalProducts by its unique identifier',
      params: HospitalPharmaceuticalProductsIdParamSchema,
      querystring: GetHospitalPharmaceuticalProductsQuerySchema,
      response: {
        200: HospitalPharmaceuticalProductsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('hospitalPharmaceuticalProducts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all hospitalPharmaceuticalProductss
  fastify.get('/', {
    schema: {
      tags: ['HospitalPharmaceuticalProducts'],
      summary:
        'Get all hospitalPharmaceuticalProductss with pagination and formats',
      description:
        'Retrieve hospitalPharmaceuticalProductss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListHospitalPharmaceuticalProductsQuerySchema,
      response: {
        200: FlexibleHospitalPharmaceuticalProductsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('hospitalPharmaceuticalProducts', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update hospitalPharmaceuticalProducts
  fastify.put('/:id', {
    schema: {
      tags: ['HospitalPharmaceuticalProducts'],
      summary: 'Update hospitalPharmaceuticalProducts by ID',
      description:
        'Update an existing hospitalPharmaceuticalProducts with new data',
      params: HospitalPharmaceuticalProductsIdParamSchema,
      body: UpdateHospitalPharmaceuticalProductsSchema,
      response: {
        200: HospitalPharmaceuticalProductsResponseSchema,
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
      fastify.verifyPermission('hospitalPharmaceuticalProducts', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete hospitalPharmaceuticalProducts
  fastify.delete('/:id', {
    schema: {
      tags: ['HospitalPharmaceuticalProducts'],
      summary: 'Delete hospitalPharmaceuticalProducts by ID',
      description:
        'Delete a hospitalPharmaceuticalProducts by its unique identifier',
      params: HospitalPharmaceuticalProductsIdParamSchema,
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
      fastify.verifyPermission('hospitalPharmaceuticalProducts', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
