import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { DepartmentsController } from './departments.controller';
import {
  CreateDepartmentsSchema,
  UpdateDepartmentsSchema,
  DepartmentsIdParamSchema,
  GetDepartmentsQuerySchema,
  ListDepartmentsQuerySchema,
  DepartmentsResponseSchema,
  DepartmentsListResponseSchema,
  FlexibleDepartmentsListResponseSchema,
} from './departments.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../../schemas/base.schemas';
import { SchemaRefs } from '../../../../schemas/registry';

export interface DepartmentsRoutesOptions extends FastifyPluginOptions {
  controller: DepartmentsController;
}

export async function departmentsRoutes(
  fastify: FastifyInstance,
  options: DepartmentsRoutesOptions,
) {
  const { controller } = options;

  // Create departments
  fastify.post('/', {
    schema: {
      tags: ['Departments'],
      summary: 'Create a new departments',
      description: 'Create a new departments with the provided data',
      body: CreateDepartmentsSchema,
      response: {
        201: DepartmentsResponseSchema,
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
      fastify.verifyPermission('departments', 'create'),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get departments by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Departments'],
      summary: 'Get departments by ID',
      description: 'Retrieve a departments by its unique identifier',
      params: DepartmentsIdParamSchema,
      querystring: GetDepartmentsQuerySchema,
      response: {
        200: DepartmentsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('departments', 'read'),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all departmentss
  fastify.get('/', {
    schema: {
      tags: ['Departments'],
      summary: 'Get all departmentss with pagination and formats',
      description:
        'Retrieve departmentss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListDepartmentsQuerySchema,
      response: {
        200: FlexibleDepartmentsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('departments', 'read'),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update departments
  fastify.put('/:id', {
    schema: {
      tags: ['Departments'],
      summary: 'Update departments by ID',
      description: 'Update an existing departments with new data',
      params: DepartmentsIdParamSchema,
      body: UpdateDepartmentsSchema,
      response: {
        200: DepartmentsResponseSchema,
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
      fastify.verifyPermission('departments', 'update'),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete departments
  fastify.delete('/:id', {
    schema: {
      tags: ['Departments'],
      summary: 'Delete departments by ID',
      description: 'Delete a departments by its unique identifier',
      params: DepartmentsIdParamSchema,
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
      fastify.verifyPermission('departments', 'delete'),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });
}
