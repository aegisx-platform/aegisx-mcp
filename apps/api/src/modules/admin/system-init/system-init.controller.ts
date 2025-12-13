/**
 * System Initialization Controller
 * Handles HTTP requests for the auto-discovery import system
 * Provides endpoints for module discovery, validation, import, and monitoring
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { SystemInitService } from './system-init.service';
import {
  AvailableModulesQuery,
  ImportOrderQuery,
  ModuleNameParam,
  TemplateQuery,
  ModuleValidateParam,
  ImportDataRequest,
  StatusParam,
  RollbackParam,
  DashboardQuery,
  AvailableModulesResponse,
  ImportOrderResponse,
  ValidateResponse,
  ImportResponse,
  StatusResponse,
  RollbackResponse,
  DashboardResponse,
  ErrorResponse,
} from './system-init.schemas';

export interface SystemInitControllerDependencies {
  systemInitService: SystemInitService;
}

/**
 * System Initialization Controller
 *
 * Endpoints:
 * 1. GET /available-modules - List all discovered import services
 * 2. GET /import-order - Get dependency-sorted import order
 * 3. GET /module/:moduleName/template - Download CSV/Excel template
 * 4. POST /module/:moduleName/validate - Validate uploaded file
 * 5. POST /module/:moduleName/import - Execute import job
 * 6. GET /module/:moduleName/status/:jobId - Check import progress
 * 7. DELETE /module/:moduleName/rollback/:jobId - Rollback import
 * 8. GET /dashboard - Centralized system initialization dashboard
 * 9. GET /health - Health status of discovery service
 */
export class SystemInitController {
  constructor(private deps: SystemInitControllerDependencies) {}

  /**
   * GET /available-modules
   * List all discovered import modules with current status
   */
  async listAvailableModules(
    request: FastifyRequest<{
      Querystring: AvailableModulesQuery;
    }>,
    reply: FastifyReply,
  ): Promise<AvailableModulesResponse> {
    try {
      const { domain, tag, limit } = request.query;

      const result = await this.deps.systemInitService.getAvailableModules({
        domain,
        tag,
        limit,
      });

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to list available modules');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'LIST_MODULES_FAILED',
          message: error.message || 'Failed to list available modules',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * GET /import-order
   * Get recommended import order based on dependency graph
   */
  async getImportOrder(
    request: FastifyRequest<{
      Querystring: ImportOrderQuery;
    }>,
    reply: FastifyReply,
  ): Promise<ImportOrderResponse> {
    try {
      const { includeDetails } = request.query;

      const result =
        await this.deps.systemInitService.getImportOrder(includeDetails);

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to get import order');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'GET_ORDER_FAILED',
          message: error.message || 'Failed to get import order',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * GET /module/:moduleName/template
   * Download CSV or Excel template for data import
   */
  async downloadTemplate(
    request: FastifyRequest<{
      Params: ModuleNameParam;
      Querystring: TemplateQuery;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { moduleName } = request.params;
      const { format = 'csv' } = request.query;

      // Validate format
      if (!['csv', 'excel'].includes(format)) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: "Format must be 'csv' or 'excel'",
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        } as ErrorResponse);
      }

      const buffer = await this.deps.systemInitService.generateTemplate(
        moduleName,
        format as 'csv' | 'excel',
      );

      // Set response headers for file download
      const mimeType =
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv';
      const fileName = `${moduleName}_template.${format === 'excel' ? 'xlsx' : 'csv'}`;

      reply.type(mimeType);
      reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
      reply.header('Content-Length', buffer.length.toString());

      return reply.send(buffer);
    } catch (error: any) {
      request.log.error(error, 'Failed to generate template');

      const statusCode = error.message.includes('not found') ? 404 : 500;
      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'TEMPLATE_GENERATION_FAILED',
          message: error.message || 'Failed to generate template',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * POST /module/:moduleName/validate
   * Upload and validate CSV/Excel file
   * Uses multipart/form-data
   */
  async validateFile(
    request: FastifyRequest<{
      Params: ModuleValidateParam;
    }>,
    reply: FastifyReply,
  ): Promise<ValidateResponse> {
    try {
      const { moduleName } = request.params;

      // Parse multipart form data
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided in request',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        } as ErrorResponse);
      }

      // Convert stream to buffer
      const buffer = await data.toBuffer();
      const fileName = data.filename;

      // Determine file type
      const fileType = fileName.endsWith('.xlsx') ? 'excel' : 'csv';

      // Validate file
      const result = await this.deps.systemInitService.validateFile(
        moduleName,
        buffer,
        fileName,
        fileType,
      );

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to validate file');

      const statusCode = error.message.includes('not found') ? 404 : 400;
      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error.message || 'Failed to validate file',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * POST /module/:moduleName/import
   * Execute import from validated session
   */
  async executeImport(
    request: FastifyRequest<{
      Params: ModuleValidateParam;
      Body: ImportDataRequest;
    }>,
    reply: FastifyReply,
  ): Promise<ImportResponse> {
    try {
      const { moduleName } = request.params;
      const { sessionId, options } = request.body;

      // Validate session ID format
      if (!sessionId || typeof sessionId !== 'string') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Valid sessionId is required',
          },
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        } as ErrorResponse);
      }

      // Execute import
      const result = await this.deps.systemInitService.executeImport(
        moduleName,
        sessionId,
        options,
      );

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to execute import');

      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Invalid')
          ? 400
          : 500;

      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'IMPORT_EXECUTION_FAILED',
          message: error.message || 'Failed to execute import',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * GET /module/:moduleName/status/:jobId
   * Get current status and progress of import job
   */
  async getImportStatus(
    request: FastifyRequest<{
      Params: StatusParam;
    }>,
    reply: FastifyReply,
  ): Promise<StatusResponse> {
    try {
      const { moduleName, jobId } = request.params;

      const result = await this.deps.systemInitService.getImportStatus(
        moduleName,
        jobId,
      );

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to get import status');

      const statusCode = error.message.includes('not found') ? 404 : 500;
      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'STATUS_FETCH_FAILED',
          message: error.message || 'Failed to get import status',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * DELETE /module/:moduleName/rollback/:jobId
   * Rollback completed import job
   */
  async rollbackImport(
    request: FastifyRequest<{
      Params: RollbackParam;
    }>,
    reply: FastifyReply,
  ): Promise<RollbackResponse> {
    try {
      const { moduleName, jobId } = request.params;

      const result = await this.deps.systemInitService.rollbackImport(
        moduleName,
        jobId,
      );

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to rollback import');

      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('does not support')
          ? 400
          : 500;

      return reply.code(statusCode).send({
        success: false,
        error: {
          code: 'ROLLBACK_FAILED',
          message: error.message || 'Failed to rollback import',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * GET /dashboard
   * Centralized system initialization dashboard
   */
  async getDashboard(
    request: FastifyRequest<{
      Querystring: DashboardQuery;
    }>,
    reply: FastifyReply,
  ): Promise<DashboardResponse> {
    try {
      const { includeHistory, historyLimit } = request.query;

      const result = await this.deps.systemInitService.getDashboardData({
        includeHistory,
        historyLimit,
      });

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to get dashboard data');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'DASHBOARD_FETCH_FAILED',
          message: error.message || 'Failed to get dashboard data',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }

  /**
   * GET /health
   * Health status of import discovery service
   */
  async getHealthStatus(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{
    success: boolean;
    data: {
      isHealthy: boolean;
      validationErrors: string[];
      circularDependencies: Array<{ path: string[] }>;
    };
    meta: {
      requestId: string;
      timestamp: string;
      version: string;
    };
  }> {
    try {
      const result = await this.deps.systemInitService.getHealthStatus();

      return {
        success: true,
        data: result,
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error: any) {
      request.log.error(error, 'Failed to get health status');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error.message || 'Failed to get health status',
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      } as ErrorResponse);
    }
  }
}
