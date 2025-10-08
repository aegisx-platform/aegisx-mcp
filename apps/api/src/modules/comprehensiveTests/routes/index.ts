import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ComprehensiveTestsController } from '../controllers/comprehensive-tests.controller';
import {
  CreateComprehensiveTestsSchema,
  UpdateComprehensiveTestsSchema,
  ComprehensiveTestsIdParamSchema,
  GetComprehensiveTestsQuerySchema,
  ListComprehensiveTestsQuerySchema,
  ComprehensiveTestsResponseSchema,
  ComprehensiveTestsListResponseSchema,
  FlexibleComprehensiveTestsListResponseSchema,
} from '../schemas/comprehensive-tests.schemas';
import {
  DropdownQuerySchema,
  DropdownResponseSchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkResponseSchema,
  BulkStatusSchema,
  StatusToggleSchema,
  StatisticsResponseSchema,
} from '../../../schemas/base.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ApiErrorResponseSchema as ErrorResponseSchema } from '../../../schemas/base.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export interface ComprehensiveTestsRoutesOptions extends FastifyPluginOptions {
  controller: ComprehensiveTestsController;
}

export async function comprehensiveTestsRoutes(
  fastify: FastifyInstance,
  options: ComprehensiveTestsRoutesOptions,
) {
  const { controller } = options;

  // Create comprehensiveTests
  fastify.post('/', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Create a new comprehensiveTests',
      description: 'Create a new comprehensiveTests with the provided data',
      body: CreateComprehensiveTestsSchema,
      response: {
        201: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get comprehensiveTests by ID
  fastify.get('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Get comprehensiveTests by ID',
      description: 'Retrieve a comprehensiveTests by its unique identifier',
      params: ComprehensiveTestsIdParamSchema,
      querystring: GetComprehensiveTestsQuerySchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all comprehensiveTestss
  fastify.get('/', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Get all comprehensiveTestss with pagination and formats',
      description:
        'Retrieve comprehensiveTestss with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListComprehensiveTestsQuerySchema,
      response: {
        200: FlexibleComprehensiveTestsListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update comprehensiveTests
  fastify.put('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Update comprehensiveTests by ID',
      description: 'Update an existing comprehensiveTests with new data',
      params: ComprehensiveTestsIdParamSchema,
      body: UpdateComprehensiveTestsSchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
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
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete comprehensiveTests
  fastify.delete('/:id', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Delete comprehensiveTests by ID',
      description: 'Delete a comprehensiveTests by its unique identifier',
      params: ComprehensiveTestsIdParamSchema,
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
      fastify.authorize(['comprehensiveTests.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Get comprehensiveTests dropdown options',
      description:
        'Get comprehensiveTests options for dropdown/select components',
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
      fastify.authorize(['comprehensiveTests.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create comprehensiveTestss
  fastify.post('/bulk', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Bulk create comprehensiveTestss',
      description: 'Create multiple comprehensiveTestss in one operation',
      body: BulkCreateSchema(CreateComprehensiveTestsSchema),
      response: {
        201: BulkResponseSchema(ComprehensiveTestsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update comprehensiveTestss
  fastify.put('/bulk', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Bulk update comprehensiveTestss',
      description: 'Update multiple comprehensiveTestss in one operation',
      body: BulkUpdateSchema(UpdateComprehensiveTestsSchema),
      response: {
        200: BulkResponseSchema(ComprehensiveTestsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete comprehensiveTestss
  fastify.delete('/bulk', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Bulk delete comprehensiveTestss',
      description: 'Delete multiple comprehensiveTestss in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(ComprehensiveTestsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Bulk status update
  fastify.patch('/bulk/status', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Bulk update comprehensiveTests status',
      description: 'Update status of multiple comprehensiveTestss',
      body: BulkStatusSchema,
      response: {
        200: BulkResponseSchema(ComprehensiveTestsResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ],
    handler: controller.bulkUpdateStatus.bind(controller),
  });

  // Activate comprehensiveTests
  fastify.patch('/:id/activate', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Activate comprehensiveTests',
      description: 'Activate a comprehensiveTests by setting is_active to true',
      params: ComprehensiveTestsIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ],
    handler: controller.activate.bind(controller),
  });

  // Deactivate comprehensiveTests
  fastify.patch('/:id/deactivate', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Deactivate comprehensiveTests',
      description:
        'Deactivate a comprehensiveTests by setting is_active to false',
      params: ComprehensiveTestsIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ],
    handler: controller.deactivate.bind(controller),
  });

  // Toggle comprehensiveTests status
  fastify.patch('/:id/toggle', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Toggle comprehensiveTests status',
      description: 'Toggle the is_active status of a comprehensiveTests',
      params: ComprehensiveTestsIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ComprehensiveTestsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['comprehensiveTests.update', 'admin']),
    ],
    handler: controller.toggle.bind(controller),
  });

  // Export comprehensiveTests data
  fastify.get('/export', {
    schema: {
      tags: ['ComprehensiveTests'],
      summary: 'Export comprehensiveTests data',
      description:
        'Export comprehensiveTests data in various formats (CSV, Excel, PDF)',
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
      fastify.authorize([
        'comprehensiveTests.read',
        'comprehensiveTests.export',
        'admin',
      ]),
    ],
    handler: controller.export.bind(controller),
  });
}
