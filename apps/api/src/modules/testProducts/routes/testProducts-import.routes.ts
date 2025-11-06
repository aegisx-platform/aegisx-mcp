import { FastifyInstance } from 'fastify';
import { TestProductsController } from '../controllers/test-products.controller';
import {
  ValidateImportApiResponseSchema,
  ExecuteImportApiResponseSchema,
  ExecuteImportRequestSchema,
  ImportStatusApiResponseSchema,
} from '../schemas/test-products.schemas';
import { StandardRouteResponses } from '../../../schemas/base.schemas';

export interface TestProductsImportRoutesOptions {
  controller: TestProductsController;
}

/**
 * Register testProducts import routes
 */
export async function testProductsImportRoutes(
  fastify: FastifyInstance,
  options: TestProductsImportRoutesOptions,
) {
  const { controller } = options;

  // Download import template
  fastify.get('/import/template', {
    schema: {
      tags: ['TestProducts', 'Import'],
      summary: 'Download import template',
      description:
        'Download Excel/CSV template for testProducts import with field instructions and example data',
      querystring: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['csv', 'excel'],
            default: 'excel',
            description: 'Template format (csv or excel)',
          },
          includeExample: {
            type: 'boolean',
            default: true,
            description: 'Include example data rows in template',
          },
        },
      },
      response: {
        200: {
          description: 'Template file download',
          type: 'string',
          format: 'binary',
        },
        400: StandardRouteResponses[400],
        401: StandardRouteResponses[401],
        403: StandardRouteResponses[403],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('testProducts', 'create'),
    ],
    handler: controller.downloadImportTemplate.bind(controller),
  });

  // Validate import file
  fastify.post('/import/validate', {
    schema: {
      tags: ['TestProducts', 'Import'],
      summary: 'Validate import file',
      description:
        'Upload and validate Excel/CSV file before import. Returns detailed validation results with row-by-row errors and warnings. Use multipart/form-data with file field.',
      consumes: ['multipart/form-data'],
      // Note: No body schema for multipart - handled by @aegisx/fastify-multipart
      response: {
        200: ValidateImportApiResponseSchema,
        400: StandardRouteResponses[400],
        401: StandardRouteResponses[401],
        403: StandardRouteResponses[403],
        413: {
          description: 'File too large (max 10MB)',
          type: 'object',
          properties: {
            success: { type: 'boolean', const: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('testProducts', 'create'),
    ],
    handler: controller.validateImport.bind(controller),
  });

  // Execute import
  fastify.post('/import/execute', {
    schema: {
      tags: ['TestProducts', 'Import'],
      summary: 'Execute import',
      description:
        'Execute validated import using session ID from validate endpoint. Creates/updates testProducts in database.',
      body: ExecuteImportRequestSchema,
      response: {
        202: ExecuteImportApiResponseSchema,
        400: StandardRouteResponses[400],
        401: StandardRouteResponses[401],
        403: StandardRouteResponses[403],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [
      fastify.authenticate,
      fastify.verifyPermission('testProducts', 'create'),
    ],
    handler: controller.executeImport.bind(controller),
  });

  // Get import job status (optional - for tracking progress)
  fastify.get('/import/status/:jobId', {
    schema: {
      tags: ['TestProducts', 'Import'],
      summary: 'Get import job status',
      description: 'Get current status and progress of an import job',
      params: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            format: 'uuid',
            description: 'Job ID from execute response',
          },
        },
        required: ['jobId'],
      },
      response: {
        200: ImportStatusApiResponseSchema,
        404: StandardRouteResponses[404],
        401: StandardRouteResponses[401],
        500: StandardRouteResponses[500],
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: controller.getImportStatus.bind(controller),
  });
}
