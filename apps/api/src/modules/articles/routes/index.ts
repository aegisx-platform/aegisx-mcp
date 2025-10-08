import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ArticlesController } from '../controllers/articles.controller';
import {
  CreateArticlesSchema,
  UpdateArticlesSchema,
  ArticlesIdParamSchema,
  GetArticlesQuerySchema,
  ListArticlesQuerySchema,
  ArticlesResponseSchema,
  ArticlesListResponseSchema,
  FlexibleArticlesListResponseSchema,
} from '../schemas/articles.schemas';
import {
  DropdownQuerySchema,
  DropdownResponseSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkResponseSchema,
  StatisticsResponseSchema,
} from '../../../schemas/base.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface ArticlesRoutesOptions extends FastifyPluginOptions {
  controller: ArticlesController;
}

export async function articlesRoutes(
  fastify: FastifyInstance,
  options: ArticlesRoutesOptions,
) {
  const { controller } = options;

  // Create articles
  fastify.post('/', {
    schema: {
      tags: ['Articles'],
      summary: 'Create a new articles',
      description: 'Create a new articles with the provided data',
      body: CreateArticlesSchema,
      response: {
        201: ArticlesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get articles by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Articles'],
      summary: 'Get articles by ID',
      description: 'Retrieve a articles by its unique identifier',
      params: ArticlesIdParamSchema,
      querystring: GetArticlesQuerySchema,
      response: {
        200: ArticlesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all articless
  fastify.get('/', {
    schema: {
      tags: ['Articles'],
      summary: 'Get all articless with pagination and formats',
      description:
        'Retrieve articless with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListArticlesQuerySchema,
      response: {
        200: FlexibleArticlesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update articles
  fastify.put('/:id', {
    schema: {
      tags: ['Articles'],
      summary: 'Update articles by ID',
      description: 'Update an existing articles with new data',
      params: ArticlesIdParamSchema,
      body: UpdateArticlesSchema,
      response: {
        200: ArticlesResponseSchema,
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
      fastify.authorize(['articles.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete articles
  fastify.delete('/:id', {
    schema: {
      tags: ['Articles'],
      summary: 'Delete articles by ID',
      description: 'Delete a articles by its unique identifier',
      params: ArticlesIdParamSchema,
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
      fastify.authorize(['articles.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['Articles'],
      summary: 'Get articles dropdown options',
      description: 'Get articles options for dropdown/select components',
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
      fastify.authorize(['articles.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create articless
  fastify.post('/bulk', {
    schema: {
      tags: ['Articles'],
      summary: 'Bulk create articless',
      description: 'Create multiple articless in one operation',
      body: BulkCreateSchema(CreateArticlesSchema),
      response: {
        201: BulkResponseSchema(ArticlesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update articless
  fastify.put('/bulk', {
    schema: {
      tags: ['Articles'],
      summary: 'Bulk update articless',
      description: 'Update multiple articless in one operation',
      body: BulkUpdateSchema(UpdateArticlesSchema),
      response: {
        200: BulkResponseSchema(ArticlesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete articless
  fastify.delete('/bulk', {
    schema: {
      tags: ['Articles'],
      summary: 'Bulk delete articless',
      description: 'Delete multiple articless in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(ArticlesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['articles.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Export articles data
  fastify.get('/export', {
    schema: {
      tags: ['Articles'],
      summary: 'Export articles data',
      description: 'Export articles data in various formats (CSV, Excel, PDF)',
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
      fastify.authorize(['articles.read', 'articles.export', 'admin']),
    ],
    handler: controller.export.bind(controller),
  });
}
