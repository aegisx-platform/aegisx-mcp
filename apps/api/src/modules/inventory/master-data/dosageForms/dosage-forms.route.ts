import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DosageFormsController } from './dosage-forms.controller';
import {
  CreateDosageFormsSchema,
  UpdateDosageFormsSchema,
  DosageFormsIdParamSchema,
  GetDosageFormsQuerySchema,
  ListDosageFormsQuerySchema,
  DosageFormsResponseSchema,
  DosageFormsListResponseSchema,
  FlexibleDosageFormsListResponseSchema,
} from './dosage-forms.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DosageFormsRoutesOptions extends FastifyPluginOptions {
  controller: DosageFormsController;
}

export async function dosageFormsRoutes(
  fastify: FastifyInstance,
  options: DosageFormsRoutesOptions,
) {
  const { controller } = options;

  // Create dosageForms
  fastify.post('/', {
    schema: {
      tags: ['DosageForms'],
      summary: 'Create a new dosageForms',
      description: 'Create a new dosageForms with the provided data',
      body: CreateDosageFormsSchema,
      response: {
        201: DosageFormsResponseSchema,
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
      fastify.verifyPermission('dosageForms', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get dosageForms by ID
  fastify.get('/:id', {
    schema: {
      tags: ['DosageForms'],
      summary: 'Get dosageForms by ID',
      description: 'Retrieve a dosageForms by its unique identifier',
      params: DosageFormsIdParamSchema,
      querystring: GetDosageFormsQuerySchema,
      response: {
        200: DosageFormsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('dosageForms', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all dosageFormss
  fastify.get('/', {
    schema: {
      tags: ['DosageForms'],
      summary: 'Get all dosageFormss with pagination and formats',
      description:
        'Retrieve dosageFormss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDosageFormsQuerySchema,
      response: {
        200: FlexibleDosageFormsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('dosageForms', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update dosageForms
  fastify.put('/:id', {
    schema: {
      tags: ['DosageForms'],
      summary: 'Update dosageForms by ID',
      description: 'Update an existing dosageForms with new data',
      params: DosageFormsIdParamSchema,
      body: UpdateDosageFormsSchema,
      response: {
        200: DosageFormsResponseSchema,
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
      fastify.verifyPermission('dosageForms', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete dosageForms
  fastify.delete('/:id', {
    schema: {
      tags: ['DosageForms'],
      summary: 'Delete dosageForms by ID',
      description: 'Delete a dosageForms by its unique identifier',
      params: DosageFormsIdParamSchema,
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
      fastify.verifyPermission('dosageForms', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
