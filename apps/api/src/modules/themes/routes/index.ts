import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { ThemesController } from '../controllers/themes.controller';
import {
  CreateThemesSchema,
  UpdateThemesSchema,
  ThemesIdParamSchema,
  GetThemesQuerySchema,
  ListThemesQuerySchema,
  ThemesResponseSchema,
  ThemesListResponseSchema,
  FlexibleThemesListResponseSchema,
} from '../schemas/themes.schemas';
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

export interface ThemesRoutesOptions extends FastifyPluginOptions {
  controller: ThemesController;
}

export async function themesRoutes(
  fastify: FastifyInstance,
  options: ThemesRoutesOptions,
) {
  const { controller } = options;

  // Create themes
  fastify.post('/', {
    schema: {
      tags: ['Themes'],
      summary: 'Create a new themes',
      description: 'Create a new themes with the provided data',
      body: CreateThemesSchema,
      response: {
        201: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes', 'admin']),
    ], // Authentication & authorization required
    handler: controller.create.bind(controller),
  });

  // Get themes by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Get themes by ID',
      description: 'Retrieve a themes by its unique identifier',
      params: ThemesIdParamSchema,
      querystring: GetThemesQuerySchema,
      response: {
        200: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findOne.bind(controller),
  });

  // Get all themess
  fastify.get('/', {
    schema: {
      tags: ['Themes'],
      summary: 'Get all themess with pagination and formats',
      description:
        'Retrieve themess with flexible formatting: ?format=dropdown for UI components, ?format=minimal for lightweight data, ?fields=id,name for custom field selection',
      querystring: ListThemesQuerySchema,
      response: {
        200: FlexibleThemesListResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.read', 'admin']),
    ], // Authentication & authorization required
    handler: controller.findMany.bind(controller),
  });

  // Update themes
  fastify.put('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Update themes by ID',
      description: 'Update an existing themes with new data',
      params: ThemesIdParamSchema,
      body: UpdateThemesSchema,
      response: {
        200: ThemesResponseSchema,
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
      fastify.authorize(['themes.update', 'admin']),
    ], // Authentication & authorization required
    handler: controller.update.bind(controller),
  });

  // Delete themes
  fastify.delete('/:id', {
    schema: {
      tags: ['Themes'],
      summary: 'Delete themes by ID',
      description: 'Delete a themes by its unique identifier',
      params: ThemesIdParamSchema,
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
      fastify.authorize(['themes.delete', 'admin']),
    ], // Authentication & authorization required
    handler: controller.delete.bind(controller),
  });

  // ===== ENHANCED CRUD ROUTES =====

  // Get dropdown options for UI components
  fastify.get('/dropdown', {
    schema: {
      tags: ['Themes'],
      summary: 'Get themes dropdown options',
      description: 'Get themes options for dropdown/select components',
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
      fastify.authorize(['themes.read', 'admin']),
    ],
    handler: controller.getDropdownOptions.bind(controller),
  });

  // Bulk create themess
  fastify.post('/bulk', {
    schema: {
      tags: ['Themes'],
      summary: 'Bulk create themess',
      description: 'Create multiple themess in one operation',
      body: BulkCreateSchema(CreateThemesSchema),
      response: {
        201: BulkResponseSchema(ThemesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.create', 'admin']),
    ],
    handler: controller.bulkCreate.bind(controller),
  });

  // Bulk update themess
  fastify.put('/bulk', {
    schema: {
      tags: ['Themes'],
      summary: 'Bulk update themess',
      description: 'Update multiple themess in one operation',
      body: BulkUpdateSchema(UpdateThemesSchema),
      response: {
        200: BulkResponseSchema(ThemesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.update', 'admin']),
    ],
    handler: controller.bulkUpdate.bind(controller),
  });

  // Bulk delete themess
  fastify.delete('/bulk', {
    schema: {
      tags: ['Themes'],
      summary: 'Bulk delete themess',
      description: 'Delete multiple themess in one operation',
      body: BulkDeleteSchema,
      response: {
        200: BulkResponseSchema(ThemesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.delete', 'admin']),
    ],
    handler: controller.bulkDelete.bind(controller),
  });

  // Bulk status update
  fastify.patch('/bulk/status', {
    schema: {
      tags: ['Themes'],
      summary: 'Bulk update themes status',
      description: 'Update status of multiple themess',
      body: BulkStatusSchema,
      response: {
        200: BulkResponseSchema(ThemesResponseSchema),
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.update', 'admin']),
    ],
    handler: controller.bulkUpdateStatus.bind(controller),
  });

  // Activate themes
  fastify.patch('/:id/activate', {
    schema: {
      tags: ['Themes'],
      summary: 'Activate themes',
      description: 'Activate a themes by setting is_active to true',
      params: ThemesIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.update', 'admin']),
    ],
    handler: controller.activate.bind(controller),
  });

  // Deactivate themes
  fastify.patch('/:id/deactivate', {
    schema: {
      tags: ['Themes'],
      summary: 'Deactivate themes',
      description: 'Deactivate a themes by setting is_active to false',
      params: ThemesIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.update', 'admin']),
    ],
    handler: controller.deactivate.bind(controller),
  });

  // Toggle themes status
  fastify.patch('/:id/toggle', {
    schema: {
      tags: ['Themes'],
      summary: 'Toggle themes status',
      description: 'Toggle the is_active status of a themes',
      params: ThemesIdParamSchema,
      body: StatusToggleSchema,
      response: {
        200: ThemesResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.authorize(['themes.update', 'admin']),
    ],
    handler: controller.toggle.bind(controller),
  });

  // Export themes data
  fastify.get('/export', {
    schema: {
      tags: ['Themes'],
      summary: 'Export themes data',
      description: 'Export themes data in various formats (CSV, Excel, PDF)',
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
      fastify.authorize(['themes.read', 'themes.export', 'admin']),
    ],
    handler: controller.export.bind(controller),
  });
}
