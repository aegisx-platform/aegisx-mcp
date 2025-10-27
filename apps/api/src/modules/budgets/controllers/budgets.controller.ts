import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BudgetsService } from '../services/budgets.service';
import { CreateBudgets, UpdateBudgets } from '../types/budgets.types';
import {
  CreateBudgetsSchema,
  UpdateBudgetsSchema,
  BudgetsIdParamSchema,
  GetBudgetsQuerySchema,
  ListBudgetsQuerySchema,
} from '../schemas/budgets.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ExportService, ExportField } from '../../../services/export.service';
import { BudgetsImportService } from '../services/budgets-import.service';
import {
  ValidateImportApiResponseSchema,
  ExecuteImportApiResponseSchema,
  ExecuteImportRequestSchema,
  ImportStatusApiResponseSchema,
} from '../schemas/budgets.schemas';
import {
  DropdownQuerySchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  StatusToggleSchema,
} from '../../../schemas/base.schemas';

/**
 * Budgets Controller
 * Package: enterprise
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BudgetsController {
  constructor(
    private budgetsService: BudgetsService,
    private exportService: ExportService,
    private importService: BudgetsImportService,
  ) {}

  /**
   * Create new budgets
   * POST /budgets
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateBudgetsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating budgets');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const budgets = await this.budgetsService.create(createData);

    request.log.info({ budgetsId: budgets.id }, 'Budgets created successfully');

    return reply.code(201).success(budgets, 'Budgets created successfully');
  }

  /**
   * Get budgets by ID
   * GET /budgets/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Querystring: Static<typeof GetBudgetsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Fetching budgets');

    const budgets = await this.budgetsService.findById(id, request.query);

    return reply.success(budgets);
  }

  /**
   * Get paginated list of budgetss
   * GET /budgets
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBudgetsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching budgets list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'budget_code', 'created_at'],
      user: [
        'id',
        'budget_code',
        'id',
        'budget_code',
        'budget_type',
        'budget_category',
        'budget_description',
        'is_active',
        'created_at',
        'created_at',
      ],
      admin: [
        'id',
        'budget_code',
        'budget_type',
        'budget_category',
        'budget_description',
        'is_active',
        'created_at',
      ],
    };

    // 🛡️ Security: Get user role (default to public for safety)
    const userRole = request.user?.role || 'public';
    const allowedFields = SAFE_FIELDS[userRole] || SAFE_FIELDS.public;

    // 🛡️ Security: Filter requested fields against whitelist
    const safeFields = fields
      ? fields.filter((field) => allowedFields.includes(field))
      : undefined;

    // 🛡️ Security: Log suspicious requests
    if (fields && fields.some((field) => !allowedFields.includes(field))) {
      request.log.warn(
        {
          user: request.user?.id,
          requestedFields: fields,
          allowedFields,
          ip: request.ip,
        },
        'Suspicious field access attempt detected',
      );
    }

    // Get budgets list with field filtering
    const result = await this.budgetsService.findMany({
      ...queryParams,
      fields: safeFields,
    });

    request.log.info(
      {
        count: result.data.length,
        total: result.pagination.total,
        fieldsRequested: fields?.length || 0,
        fieldsAllowed: safeFields?.length || 'all',
      },
      'Budgets list fetched',
    );

    // Use raw send to match FlexibleSchema
    return reply.send({
      success: true,
      data: result.data,
      pagination: result.pagination,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        requestId: request.id,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  /**
   * Update budgets
   * PUT /budgets/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Body: Static<typeof UpdateBudgetsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id, body: request.body }, 'Updating budgets');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const budgets = await this.budgetsService.update(id, updateData);

    request.log.info({ budgetsId: id }, 'Budgets updated successfully');

    return reply.success(budgets, 'Budgets updated successfully');
  }

  /**
   * Delete budgets
   * DELETE /budgets/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof BudgetsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Deleting budgets');

    const deleted = await this.budgetsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Budgets not found');
    }

    request.log.info({ budgetsId: id }, 'Budgets deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Budgets deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /budgets/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching budgets dropdown options',
    );

    const result = await this.budgetsService.getDropdownOptions(request.query);

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create budgetss
   * POST /budgets/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateBudgets[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating budgetss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result = await this.budgetsService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update budgetss
   * PUT /budgets/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: { items: Array<{ id: string | number; data: UpdateBudgets }> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating budgetss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result = await this.budgetsService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete budgetss
   * DELETE /budgets/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting budgetss',
    );

    const result = await this.budgetsService.bulkDelete(request.body);

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk status update
   * PATCH /budgets/bulk/status
   */
  async bulkUpdateStatus(
    request: FastifyRequest<{ Body: Static<typeof BulkStatusSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      {
        count: request.body.ids.length,
        status: request.body.status,
      },
      'Bulk updating budgets status',
    );

    // Convert status to boolean if it's a string
    const statusData = {
      ...request.body,
      status:
        typeof request.body.status === 'string'
          ? request.body.status === 'true' || request.body.status === '1'
          : Boolean(request.body.status),
    };

    const result = await this.budgetsService.bulkUpdateStatus(statusData);

    return reply.success(
      result,
      `Bulk status update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Activate budgets
   * PATCH /budgets/:id/activate
   */
  async activate(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Activating budgets');

    const result = await this.budgetsService.activate(id, request.body);

    return reply.success(result, 'Budgets activated successfully');
  }

  /**
   * Deactivate budgets
   * PATCH /budgets/:id/deactivate
   */
  async deactivate(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Deactivating budgets');

    const result = await this.budgetsService.deactivate(id, request.body);

    return reply.success(result, 'Budgets deactivated successfully');
  }

  /**
   * Toggle budgets status
   * PATCH /budgets/:id/toggle
   */
  async toggle(
    request: FastifyRequest<{
      Params: Static<typeof BudgetsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ budgetsId: id }, 'Toggling budgets status');

    const result = await this.budgetsService.toggle(id, request.body);

    return reply.success(result, 'Budgets status toggled successfully');
  }

  /**
   * Get statistics
   * GET /budgets/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching budgets statistics');

    const stats = await this.budgetsService.getStats();

    return reply.success(stats);
  }

  /**
   * Export budgets data
   * GET /budgets/export
   */
  async export(
    request: FastifyRequest<{ Querystring: Static<typeof ExportQuerySchema> }>,
    reply: FastifyReply,
  ) {
    const {
      format,
      ids,
      filters,
      fields,
      filename,
      includeMetadata = true,
      applyFilters = false,
    } = request.query;

    request.log.info(
      {
        format,
        idsCount: ids?.length || 0,
        hasFilters: !!filters,
        fieldsCount: fields?.length || 0,
      },
      'Exporting budgets data',
    );

    try {
      // Prepare query parameters based on export options
      let queryParams: any = {};

      // Apply specific IDs if provided
      if (ids && ids.length > 0) {
        queryParams.ids = ids;
      }

      // Apply filters if requested
      if (applyFilters && filters) {
        queryParams = { ...queryParams, ...filters };
      }

      // Get data from service
      const exportData = await this.budgetsService.getExportData(
        queryParams,
        fields,
      );

      // Prepare export fields configuration
      const exportFields = this.getExportFields(fields);

      // Generate export filename and clean any existing extensions
      let exportFilename =
        filename || this.generateExportFilename(format, ids?.length);

      // Remove any existing file extensions to prevent double extensions
      if (exportFilename.includes('.')) {
        exportFilename = exportFilename.substring(
          0,
          exportFilename.lastIndexOf('.'),
        );
      }

      // Prepare metadata
      const metadata = includeMetadata
        ? {
            exportedBy:
              (request.user as any)?.username ||
              (request.user as any)?.email ||
              'System',
            exportedAt: new Date(),
            filtersApplied: applyFilters ? filters : undefined,
            totalRecords: exportData.length,
            selectedRecords: ids?.length,
          }
        : undefined;

      // Generate export file
      let buffer: Buffer;
      switch (format) {
        case 'csv':
          buffer = await this.exportService.exportToCsv({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            metadata,
          });
          break;
        case 'excel':
          buffer = await this.exportService.exportToExcel({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'Budgets Export',
            metadata,
          });
          break;
        case 'pdf':
          buffer = await this.exportService.exportToPdf({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'Budgets Export - รายงาน',
            metadata,
            pdfOptions: {
              template: 'professional',
              pageSize: 'A4',
              orientation: 'landscape',
              subtitle: 'Generated with Thai Font Support',
              logo: process.env.PDF_LOGO_URL,
            },
          });
          break;
        default:
          return reply
            .code(400)
            .error('INVALID_FORMAT', 'Unsupported export format');
      }

      // Set response headers for file download
      const mimeTypes = {
        csv: 'text/csv',
        excel:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf',
      };

      const fileExtensions = {
        csv: 'csv',
        excel: 'xlsx',
        pdf: 'pdf',
      };

      reply
        .header('Content-Type', mimeTypes[format])
        .header(
          'Content-Disposition',
          `attachment; filename="${exportFilename}.${fileExtensions[format]}"`,
        )
        .header('Content-Length', buffer.length);

      request.log.info(
        {
          format,
          filename: `${exportFilename}.${fileExtensions[format]}`,
          fileSize: buffer.length,
          recordCount: exportData.length,
        },
        'Budgets export completed successfully',
      );

      return reply.send(buffer);
    } catch (error) {
      request.log.error({ error, format }, 'Export failed');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          statusCode: 500,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: request.id,
          environment: process.env.NODE_ENV || 'development',
        },
      });
    }
  }

  // ===== PRIVATE EXPORT HELPER METHODS =====

  /**
   * Get export fields configuration
   */
  private getExportFields(requestedFields?: string[]): ExportField[] {
    // Define all available fields for export
    const allFields: ExportField[] = [
      {
        key: 'id',
        label: 'Id',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'budget_code',
        label: 'Budget code',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'budget_type',
        label: 'Budget type',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'budget_category',
        label: 'Budget category',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'budget_description',
        label: 'Budget description',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_active',
        label: 'Is active',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'created_at',
        label: 'Created at',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
    ];

    // Return requested fields or all fields
    if (requestedFields && requestedFields.length > 0) {
      return allFields.filter((field) => requestedFields.includes(field.key));
    }

    return allFields;
  }

  /**
   * Generate export filename
   */
  private generateExportFilename(
    format: string,
    selectedCount?: number,
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const module = 'budgets';

    let suffix = '';
    if (selectedCount && selectedCount > 0) {
      suffix = `-selected-${selectedCount}`;
    }

    return `${module}-export${suffix}-${timestamp}`;
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateBudgetsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      budget_code: schema.budget_code,
      budget_type: schema.budget_type,
      budget_category: schema.budget_category,
      budget_description: schema.budget_description,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateBudgetsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.budget_code !== undefined) {
      updateData.budget_code = schema.budget_code;
    }
    if (schema.budget_type !== undefined) {
      updateData.budget_type = schema.budget_type;
    }
    if (schema.budget_category !== undefined) {
      updateData.budget_category = schema.budget_category;
    }
    if (schema.budget_description !== undefined) {
      updateData.budget_description = schema.budget_description;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }

  // ===== IMPORT METHODS =====

  /**
   * Download import template
   * GET /budgets/import/template
   */
  async downloadImportTemplate(
    request: FastifyRequest<{
      Querystring: {
        format?: 'csv' | 'excel';
        includeExample?: boolean;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { format = 'excel', includeExample = true } = request.query;
    request.log.info({ format, includeExample }, 'Generating import template');

    try {
      const buffer = await this.importService.generateTemplate({
        format,
        includeExamples: includeExample,
        exampleRowCount: 3,
      });

      const mimeTypes = {
        csv: 'text/csv',
        excel:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const fileExtensions = {
        csv: 'csv',
        excel: 'xlsx',
      };

      const filename = `-import-template.${fileExtensions[format]}`;

      reply
        .header('Content-Type', mimeTypes[format])
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .header('Content-Length', buffer.length);

      request.log.info(
        { format, filename, fileSize: buffer.length },
        'Import template generated successfully',
      );

      return reply.send(buffer);
    } catch (error: any) {
      request.log.error(error, 'Failed to generate import template');
      return reply.error(
        'TEMPLATE_GENERATION_FAILED',
        error.message || 'Failed to generate import template',
        500,
      );
    }
  }

  /**
   * Validate import file
   * POST /budgets/import/validate
   */
  async validateImport(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Use @aegisx/fastify-multipart clean API
      const { files, fields } = await request.parseMultipart();

      if (!files || files.length === 0) {
        return reply
          .code(400)
          .error('NO_FILE_PROVIDED', 'No file provided in request');
      }

      const file = files[0]; // Get first file

      // Parse options from string field
      let options: any = {};
      if (fields.options) {
        try {
          options = JSON.parse(fields.options);
        } catch (error) {
          return reply
            .code(400)
            .error('INVALID_OPTIONS', 'Invalid options JSON format');
        }
      }

      request.log.info(
        {
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          options,
        },
        'Validating import file',
      );

      // Convert file to buffer
      const fileBuffer = await file.toBuffer();

      // Determine file type from extension
      const fileExt = file.filename.toLowerCase().split('.').pop();
      const fileType =
        fileExt === 'csv' ? ('csv' as const) : ('excel' as const);

      // Validate file using new interface
      const result = await this.importService.validateFile({
        file: fileBuffer,
        fileName: file.filename,
        fileType,
      });

      request.log.info(
        {
          sessionId: result.sessionId,
          totalRows: result.summary.totalRows,
          validRows: result.summary.validRows,
          invalidRows: result.summary.invalidRows,
        },
        'Import file validated successfully',
      );

      // Get session and config to access ALL validated rows and transformer
      const session = (this.importService as any).sessions.get(
        result.sessionId,
      );
      const validatedRows = session?.validatedRows || [];
      const config = (this.importService as any).config;

      // Map to ValidateImportApiResponseSchema format
      const mappedResult = {
        sessionId: result.sessionId,
        // Root-level summary fields for frontend compatibility
        totalRows: result.summary.totalRows,
        validRows: result.summary.validRows,
        invalidRows: result.summary.invalidRows,
        // Detailed summary object
        summary: {
          totalRows: result.summary.totalRows,
          validRows: result.summary.validRows,
          invalidRows: result.summary.invalidRows,
          warnings: result.summary.totalWarnings,
          duplicates: 0, // TODO: Implement duplicate detection
          willCreate: result.summary.validRows,
          willSkip: 0,
        },
        errors: result.errors.flatMap((error) =>
          error.errors.map((err) => ({
            row: error.row,
            field: err.field,
            message: err.message,
            value: err.value,
          })),
        ),
        warnings: result.errors.flatMap((error) =>
          error.warnings.map((warn) => ({
            row: error.row,
            field: warn.field,
            message: warn.message,
            value: warn.value,
          })),
        ),
        // Preview: Transform raw data to match frontend expectations
        preview: validatedRows.slice(0, 10).map((rowValidation, index) => {
          const transformedData =
            config.rowTransformer && rowValidation.data
              ? config.rowTransformer(rowValidation.data)
              : rowValidation.data;

          return {
            rowNumber: rowValidation.row,
            status: rowValidation.isValid ? 'valid' : 'error',
            action: 'create', // Default action (can be enhanced with duplicate detection)
            ...transformedData, // Spread entity fields directly
            errors: rowValidation.errors,
            warnings: rowValidation.warnings,
          };
        }),
      };

      return reply.success(mappedResult, 'Import file validated successfully');
    } catch (error: any) {
      request.log.error(error, 'Failed to validate import file');

      // Handle specific multipart errors
      if (error.code === 'FST_FILE_TOO_LARGE') {
        return reply
          .code(413)
          .error('FILE_TOO_LARGE', 'File size exceeds 10MB limit');
      }

      return reply.error(
        'VALIDATION_FAILED',
        error.message || 'Failed to validate import file',
        500,
      );
    }
  }

  /**
   * Execute import
   * POST /budgets/import/execute
   */
  async executeImport(
    request: FastifyRequest<{
      Body: Static<typeof ExecuteImportRequestSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { sessionId, options } = request.body;
    const userId = (request.user as any)?.id;

    try {
      request.log.info({ sessionId, options, userId }, 'Executing import job');

      // Execute import and get job result
      const result = await this.importService.executeImport({
        sessionId,
        skipWarnings: true, // Always skip warnings/errors - will import only valid rows
      });

      // Return job information (client can poll /import/status/:jobId for progress)
      return reply.code(202).success(result, 'Import job started successfully');
    } catch (error: any) {
      request.log.error(error, 'Failed to execute import');
      return reply.error(
        'IMPORT_EXECUTION_FAILED',
        error.message || 'Failed to execute import',
        500,
      );
    }
  }

  /**
   * Get import job status
   * GET /budgets/import/status/:jobId
   */
  async getImportStatus(
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply,
  ) {
    const { jobId } = request.params;

    try {
      request.log.info({ jobId }, 'Getting import job status');

      const status = await this.importService.getJobStatus(jobId);

      if (!status) {
        return reply
          .code(404)
          .error('JOB_NOT_FOUND', `Import job ${jobId} not found`);
      }

      // Return status directly - ImportJobStatusResponse has all necessary fields
      return reply.success(status, 'Import job status retrieved successfully');
    } catch (error: any) {
      request.log.error(error, 'Failed to get import job status');
      return reply.error(
        'STATUS_RETRIEVAL_FAILED',
        error.message || 'Failed to get import job status',
        500,
      );
    }
  }
}
