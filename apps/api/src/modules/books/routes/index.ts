import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { BooksController } from '../controllers/books.controller';
import {
  CreateBooksSchema,
  UpdateBooksSchema,
  BooksIdParamSchema,
  GetBooksQuerySchema,
  ListBooksQuerySchema,
  BooksResponseSchema,
  BooksListResponseSchema,
  FlexibleBooksListResponseSchema,
} from '../schemas/books.schemas';
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

export interface BooksRoutesOptions extends FastifyPluginOptions {
  controller: BooksController;
}

export async function booksRoutes(
  fastify: FastifyInstance,
  options: BooksRoutesOptions,
) {
  const { controller } = options;

  // Create books
  fastify.post('/', {
    schema: {
      tags: ['Books'],
      summary: 'Create a new books',
      description: 'Create a new books with the provided data',
      body: CreateBooksSchema,
      response: {
        201: BooksResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get books by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Get books by ID',
      description: 'Retrieve a books by its unique identifier',
      params: BooksIdParamSchema,
      querystring: GetBooksQuerySchema,
      response: {
        200: BooksResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all bookss
  fastify.get('/', {
    schema: {
      tags: ['Books'],
      summary: 'Get all bookss with pagination and formats',
      description:
        'Retrieve bookss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListBooksQuerySchema,
      response: {
        200: FlexibleBooksListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update books
  fastify.put('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Update books by ID',
      description: 'Update an existing books with new data',
      params: BooksIdParamSchema,
      body: UpdateBooksSchema,
      response: {
        200: BooksResponseSchema,
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
      fastify.authorize(['books.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete books
  fastify.delete('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Delete books by ID',
      description: 'Delete a books by its unique identifier',
      params: BooksIdParamSchema,
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
      fastify.authorize(['books.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['Books'],
      summary: 'Get books dropdown options',
      description: 'Get books options for dropdown/select components',
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
      fastify.authorize(['books.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create bookss
  fastify.post('/bulk', {
    schema: {
      tags: ['Books'],
      summary: 'Bulk create bookss',
      description: 'Create multiple bookss in one operation',
      body: BulkCreateSchema(CreateBooksSchema),
      response: {
        201: BulkResponseSchema(BooksResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update bookss
  fastify.put('/bulk', {
    schema: {
      tags: ['Books'],
      summary: 'Bulk update bookss',
      description: 'Update multiple bookss in one operation',
      body: BulkUpdateSchema(UpdateBooksSchema),
      response: {
        200: BulkResponseSchema(BooksResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete bookss
  fastify.delete('/bulk', {
    schema: {
      tags: ['Books'],
      summary: 'Bulk delete bookss',
      description: 'Delete multiple bookss in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(BooksResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['books.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Export books data
  fastify.get('/export', {
    schema: {
      tags: ['Books'],
      summary: 'Export books data',
      description: 'Export books data in various formats (CSV, Excel, PDF)',
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
      fastify.authorize(['books.read', 'books.export', 'admin']),
    ],
    handler: controller.export.bind(controller),
  });

  // ===== FULL PACKAGE ROUTES =====

  // Validate data before save
  fastify.post('/validate', {
    schema: {
      tags: ['Books'],
      summary: 'Validate books data',
      description: 'Validate books data before saving',
      body: ValidationRequestSchema(CreateBooksSchema),
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
      fastify.authorize(['books.create', 'books.update', 'admin']),
    ],
    handler: controller.validate.bind(controller),
  });

  // Check field uniqueness
  fastify.get('/check/:field', {
    schema: {
      tags: ['Books'],
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
      fastify.authorize(['books.read', 'admin']),
    ],
    handler: controller.checkUniqueness.bind(controller),
  });
}
