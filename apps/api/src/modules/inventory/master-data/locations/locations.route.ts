import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { LocationsController } from './locations.controller';
import {
  CreateLocationsSchema,
  UpdateLocationsSchema,
  LocationsIdParamSchema,
  GetLocationsQuerySchema,
  ListLocationsQuerySchema,
  LocationsResponseSchema,
  LocationsListResponseSchema,
  FlexibleLocationsListResponseSchema,
} from './locations.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface LocationsRoutesOptions extends FastifyPluginOptions {
  controller: LocationsController;
}

export async function locationsRoutes(
  fastify: FastifyInstance,
  options: LocationsRoutesOptions,
) {
  const { controller } = options;

  // Create locations
  fastify.post('/', {
    schema: {
      tags: ['Locations'],
      summary: 'Create a new locations',
      description: 'Create a new locations with the provided data',
      body: CreateLocationsSchema,
      response: {
        201: LocationsResponseSchema,
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
      fastify.verifyPermission('locations', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get locations by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Locations'],
      summary: 'Get locations by ID',
      description: 'Retrieve a locations by its unique identifier',
      params: LocationsIdParamSchema,
      querystring: GetLocationsQuerySchema,
      response: {
        200: LocationsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('locations', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all locationss
  fastify.get('/', {
    schema: {
      tags: ['Locations'],
      summary: 'Get all locationss with pagination and formats',
      description:
        'Retrieve locationss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListLocationsQuerySchema,
      response: {
        200: FlexibleLocationsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('locations', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update locations
  fastify.put('/:id', {
    schema: {
      tags: ['Locations'],
      summary: 'Update locations by ID',
      description: 'Update an existing locations with new data',
      params: LocationsIdParamSchema,
      body: UpdateLocationsSchema,
      response: {
        200: LocationsResponseSchema,
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
      fastify.verifyPermission('locations', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete locations
  fastify.delete('/:id', {
    schema: {
      tags: ['Locations'],
      summary: 'Delete locations by ID',
      description: 'Delete a locations by its unique identifier',
      params: LocationsIdParamSchema,
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
      fastify.verifyPermission('locations', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
