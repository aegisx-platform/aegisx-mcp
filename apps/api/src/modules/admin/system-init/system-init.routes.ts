/**
 * System Initialization Routes
 * API route definitions for the auto-discovery import system
 * Base path: /api/admin/system-init
 */

import { FastifyInstance } from 'fastify';
import { SystemInitController } from './system-init.controller';
import { SystemInitService } from './system-init.service';
import {
  AvailableModulesQuerySchema,
  AvailableModulesResponseSchema,
  ImportOrderQuerySchema,
  ImportOrderResponseSchema,
  ModuleNameParamSchema,
  TemplateQuerySchema,
  ModuleValidateParamSchema,
  ValidateResponseSchema,
  ImportDataRequestSchema,
  ImportResponseSchema,
  StatusParamSchema,
  StatusResponseSchema,
  RollbackParamSchema,
  RollbackResponseSchema,
  DashboardQuerySchema,
  DashboardResponseSchema,
  ErrorResponseSchema,
} from './system-init.schemas';

/**
 * Register system initialization routes
 * Requires: fastify.importDiscovery to be available (from import-discovery-plugin)
 */
export async function systemInitRoutes(fastify: FastifyInstance) {
  // Validate that importDiscovery service is available
  if (!fastify.importDiscovery) {
    throw new Error(
      'Import discovery service not available. Ensure import-discovery-plugin is registered.',
    );
  }

  // Initialize service and controller
  const service = new SystemInitService(fastify, fastify.knex);
  const controller = new SystemInitController({ systemInitService: service });

  // --- 1. GET /available-modules ---
  fastify.get<{
    Querystring: (typeof AvailableModulesQuerySchema)['static'];
  }>(
    '/available-modules',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'List all discovered import modules',
        description: 'Returns all available import modules with current status',
        querystring: AvailableModulesQuerySchema,
        response: {
          200: AvailableModulesResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.listAvailableModules(request, reply),
  );

  // --- 2. GET /import-order ---
  fastify.get<{
    Querystring: (typeof ImportOrderQuerySchema)['static'];
  }>(
    '/import-order',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Get recommended import order',
        description:
          'Returns modules in dependency-aware order with reasons for ordering',
        querystring: ImportOrderQuerySchema,
        response: {
          200: ImportOrderResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getImportOrder(request, reply),
  );

  // --- 3. GET /module/:moduleName/template ---
  fastify.get<{
    Params: (typeof ModuleNameParamSchema)['static'];
    Querystring: (typeof TemplateQuerySchema)['static'];
  }>(
    '/module/:moduleName/template',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Download import template',
        description: 'Download CSV or Excel template for module data import',
        params: ModuleNameParamSchema,
        querystring: TemplateQuerySchema,
        response: {
          200: {
            type: 'string',
            format: 'binary',
            description: 'Template file (CSV or Excel)',
          },
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.downloadTemplate(request, reply),
  );

  // --- 4. POST /module/:moduleName/validate ---
  fastify.post<{
    Params: (typeof ModuleValidateParamSchema)['static'];
  }>(
    '/module/:moduleName/validate',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Validate import file',
        description:
          'Upload and validate CSV/Excel file for a module (multipart/form-data). File size limited to 10MB.',
        params: ModuleValidateParamSchema,
        consumes: ['multipart/form-data'],
        security: [{ bearerAuth: [] }],
        response: {
          200: ValidateResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          413: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', const: 413 },
              error: { type: 'string', const: 'Payload Too Large' },
              message: { type: 'string' },
            },
          },
          500: ErrorResponseSchema,
        },
      },
      preValidation: [fastify.authenticate],
    },
    (request, reply) => controller.validateFile(request, reply),
  );

  // --- 5. POST /module/:moduleName/import ---
  fastify.post<{
    Params: (typeof ModuleValidateParamSchema)['static'];
    Body: (typeof ImportDataRequestSchema)['static'];
  }>(
    '/module/:moduleName/import',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Execute import job',
        description:
          'Start import from validated session (requires valid sessionId from validation)',
        params: ModuleValidateParamSchema,
        body: ImportDataRequestSchema,
        security: [{ bearerAuth: [] }],
        response: {
          200: ImportResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
      preValidation: [fastify.authenticate],
    },
    (request, reply) => controller.executeImport(request, reply),
  );

  // --- 6. GET /module/:moduleName/status/:jobId ---
  fastify.get<{
    Params: (typeof StatusParamSchema)['static'];
  }>(
    '/module/:moduleName/status/:jobId',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Get import job status',
        description: 'Check progress of an import job',
        params: StatusParamSchema,
        response: {
          200: StatusResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getImportStatus(request, reply),
  );

  // --- 7. DELETE /module/:moduleName/rollback/:jobId ---
  fastify.delete<{
    Params: (typeof RollbackParamSchema)['static'];
  }>(
    '/module/:moduleName/rollback/:jobId',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Rollback import job',
        description: 'Rollback a completed import job (if supported by module)',
        params: RollbackParamSchema,
        security: [{ bearerAuth: [] }],
        response: {
          200: RollbackResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
      preValidation: [fastify.authenticate],
    },
    (request, reply) => controller.rollbackImport(request, reply),
  );

  // --- 8. GET /dashboard ---
  fastify.get<{
    Querystring: (typeof DashboardQuerySchema)['static'];
  }>(
    '/dashboard',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'Get dashboard data',
        description:
          'Centralized view of system initialization status with overview, domain stats, recent imports, and recommendations',
        querystring: DashboardQuerySchema,
        response: {
          200: DashboardResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getDashboard(request, reply),
  );

  // --- 9. GET /health-status ---
  fastify.get(
    '/health-status',
    {
      schema: {
        tags: ['System Initialization'],
        summary: 'System-init health status',
        description:
          'Check health of import discovery service (validation errors, circular dependencies)',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  isHealthy: { type: 'boolean' },
                  validationErrors: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  circularDependencies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  timestamp: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
          },
          500: ErrorResponseSchema,
        },
      },
    },
    (request, reply) => controller.getHealthStatus(request, reply),
  );
}
