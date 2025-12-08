import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ReceiptInspectorsController } from './receipt-inspectors.controller';
import {
  CreateReceiptInspectorsSchema,
  UpdateReceiptInspectorsSchema,
  ReceiptInspectorsIdParamSchema,
  GetReceiptInspectorsQuerySchema,
  ListReceiptInspectorsQuerySchema,
  ReceiptInspectorsResponseSchema,
  ReceiptInspectorsListResponseSchema,
  FlexibleReceiptInspectorsListResponseSchema,
} from './receipt-inspectors.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface ReceiptInspectorsRoutesOptions extends FastifyPluginOptions {
  controller: ReceiptInspectorsController;
}

export async function receiptInspectorsRoutes(
  fastify: FastifyInstance,
  options: ReceiptInspectorsRoutesOptions,
) {
  const { controller } = options;

  // Create receiptInspectors
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Receipt Inspectors'],
      summary: 'Create a new receiptInspectors',
      description: 'Create a new receiptInspectors with the provided data',
      body: CreateReceiptInspectorsSchema,
      response: {
        201: ReceiptInspectorsResponseSchema,
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
      fastify.verifyPermission('receiptInspectors', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get receiptInspectors by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Receipt Inspectors'],
      summary: 'Get receiptInspectors by ID',
      description: 'Retrieve a receiptInspectors by its unique identifier',
      params: ReceiptInspectorsIdParamSchema,
      querystring: GetReceiptInspectorsQuerySchema,
      response: {
        200: ReceiptInspectorsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receiptInspectors', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all receiptInspectorss
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Receipt Inspectors'],
      summary: 'Get all receiptInspectorss with pagination and formats',
      description:
        'Retrieve receiptInspectorss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListReceiptInspectorsQuerySchema,
      response: {
        200: FlexibleReceiptInspectorsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('receiptInspectors', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update receiptInspectors
  fastify.put('/:id', {
    schema: {
      tags: ['Inventory: Receipt Inspectors'],
      summary: 'Update receiptInspectors by ID',
      description: 'Update an existing receiptInspectors with new data',
      params: ReceiptInspectorsIdParamSchema,
      body: UpdateReceiptInspectorsSchema,
      response: {
        200: ReceiptInspectorsResponseSchema,
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
      fastify.verifyPermission('receiptInspectors', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete receiptInspectors
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Receipt Inspectors'],
      summary: 'Delete receiptInspectors by ID',
      description: 'Delete a receiptInspectors by its unique identifier',
      params: ReceiptInspectorsIdParamSchema,
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
      fastify.verifyPermission('receiptInspectors', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
