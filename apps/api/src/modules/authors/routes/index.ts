import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { AuthorsController } from '../controllers/authors.controller';
import {
  CreateAuthorsSchema,
  UpdateAuthorsSchema,
  AuthorsIdParamSchema,
  GetAuthorsQuerySchema,
  ListAuthorsQuerySchema,
  AuthorsResponseSchema,
  AuthorsListResponseSchema,
  FlexibleAuthorsListResponseSchema,
} from '../schemas/authors.schemas';
import {
  DropdownQuerySchema,
  DropdownResponseSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkResponseSchema,
  ValidationRequestSchema,
  ValidationResponseSchema,
  UniquenessParamSchema,
  UniquenessQuerySchema,
  UniquenessResponseSchema,
  StatisticsResponseSchema,
} from '../../../schemas/base.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface AuthorsRoutesOptions extends FastifyPluginOptions {
  controller: AuthorsController;
}

export async function authorsRoutes(
  fastify: FastifyInstance,
  options: AuthorsRoutesOptions,
) {
  const { controller } = options;

  // Create authors
  fastify.post('/', {
    schema: {
      tags: ['Authors'],
      summary: 'Create a new authors',
      description: 'Create a new authors with the provided data',
      body: CreateAuthorsSchema,
      response: {
        201: AuthorsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get authors by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Authors'],
      summary: 'Get authors by ID',
      description: 'Retrieve a authors by its unique identifier',
      params: AuthorsIdParamSchema,
      querystring: GetAuthorsQuerySchema,
      response: {
        200: AuthorsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all authorss
  fastify.get('/', {
    schema: {
      tags: ['Authors'],
      summary: 'Get all authorss with pagination and formats',
      description:
        'Retrieve authorss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListAuthorsQuerySchema,
      response: {
        200: FlexibleAuthorsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update authors
  fastify.put('/:id', {
    schema: {
      tags: ['Authors'],
      summary: 'Update authors by ID',
      description: 'Update an existing authors with new data',
      params: AuthorsIdParamSchema,
      body: UpdateAuthorsSchema,
      response: {
        200: AuthorsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete authors
  fastify.delete('/:id', {
    schema: {
      tags: ['Authors'],
      summary: 'Delete authors by ID',
      description: 'Delete a authors by its unique identifier',
      params: AuthorsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['Authors'],
      summary: 'Get authors dropdown options',
      description: 'Get authors options for dropdown/select components',
      querystring: DropdownQuerySchema,
      response: {
        200: DropdownResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create authorss
  fastify.post('/bulk', {
    schema: {
      tags: ['Authors'],
      summary: 'Bulk create authorss',
      description: 'Create multiple authorss in one operation',
      body: BulkCreateSchema(CreateAuthorsSchema),
      response: {
        201: BulkResponseSchema(AuthorsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update authorss
  fastify.put('/bulk', {
    schema: {
      tags: ['Authors'],
      summary: 'Bulk update authorss',
      description: 'Update multiple authorss in one operation',
      body: BulkUpdateSchema(UpdateAuthorsSchema),
      response: {
        200: BulkResponseSchema(AuthorsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete authorss
  fastify.delete('/bulk', {
    schema: {
      tags: ['Authors'],
      summary: 'Bulk delete authorss',
      description: 'Delete multiple authorss in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(AuthorsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Export authors data
  fastify.get('/export', {
    schema: {
      tags: ['Authors'],
      summary: 'Export authors data',
      description: 'Export authors data in various formats (CSV, Excel, PDF)',
      querystring: ExportQuerySchema,
      response: {
        200: {
          description: 'Export file download',
          type: 'string',
          format: 'binary',
        },
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.read', 'authors.export', 'admin']),
    ],
    handler: controller.export.bind(controller),
  });

  // ===== FULL PACKAGE ROUTES =====

  // Validate data before save
  fastify.post('/validate', {
    schema: {
      tags: ['Authors'],
      summary: 'Validate authors data',
      description: 'Validate authors data before saving',
      body: ValidationRequestSchema(CreateAuthorsSchema),
      response: {
        200: ValidationResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.create', 'authors.update', 'admin']),
    ],
    handler: controller.validate.bind(controller),
  });

  // Check field uniqueness
  fastify.get('/check/:field', {
    schema: {
      tags: ['Authors'],
      summary: 'Check field uniqueness',
      description: 'Check if a field value is unique',
      params: UniquenessParamSchema,
      querystring: UniquenessQuerySchema,
      response: {
        200: UniquenessResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['authors.read', 'admin']),
    ],
    handler: controller.checkUniqueness.bind(controller),
  });
}
