import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ThemesService } from '../services/themes.service';
import { CreateThemes, UpdateThemes } from '../types/themes.types';
import {
  CreateThemesSchema,
  UpdateThemesSchema,
  ThemesIdParamSchema,
  GetThemesQuerySchema,
  ListThemesQuerySchema,
} from '../schemas/themes.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ExportService, ExportField } from '../../../services/export.service';
import {
  DropdownQuerySchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  BulkStatusSchema,
  StatusToggleSchema,
} from '../../../schemas/base.schemas';

/**
 * Themes Controller
 * Package: enterprise
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ThemesController {
  constructor(
    private themesService: ThemesService,
    private exportService: ExportService,
  ) {}

  /**
   * Create new themes
   * POST /themes
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateThemesSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating themes');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const themes = await this.themesService.create(createData);

    request.log.info({ themesId: themes.id }, 'Themes created successfully');

    return reply.code(201).success(themes, 'Themes created successfully');
  }

  /**
   * Get themes by ID
   * GET /themes/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ThemesIdParamSchema>;
      Querystring: Static<typeof GetThemesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id }, 'Fetching themes');

    const themes = await this.themesService.findById(id, request.query);

    return reply.success(themes);
  }

  /**
   * Get paginated list of themess
   * GET /themes
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListThemesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching themes list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'name', 'created_at'],
      user: [
        'id',
        'name',
        'id',
        'name',
        'display_name',
        'description',
        'preview_image_url',
        'color_palette',
        'css_variables',
        'is_active',
        'is_default',
        'sort_order',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'name',
        'display_name',
        'description',
        'preview_image_url',
        'color_palette',
        'css_variables',
        'is_active',
        'is_default',
        'sort_order',
        'created_at',
        'updated_at',
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

    // Get themes list with field filtering
    const result = await this.themesService.findMany({
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
      'Themes list fetched',
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
   * Update themes
   * PUT /themes/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ThemesIdParamSchema>;
      Body: Static<typeof UpdateThemesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id, body: request.body }, 'Updating themes');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const themes = await this.themesService.update(id, updateData);

    request.log.info({ themesId: id }, 'Themes updated successfully');

    return reply.success(themes, 'Themes updated successfully');
  }

  /**
   * Delete themes
   * DELETE /themes/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ThemesIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id }, 'Deleting themes');

    const deleted = await this.themesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Themes not found');
    }

    request.log.info({ themesId: id }, 'Themes deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Themes deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /themes/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching themes dropdown options',
    );

    const result = await this.themesService.getDropdownOptions(request.query);

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create themess
   * POST /themes/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateThemes[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating themess',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result = await this.themesService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update themess
   * PUT /themes/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: { items: Array<{ id: string | number; data: UpdateThemes }> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating themess',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result = await this.themesService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete themess
   * DELETE /themes/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting themess',
    );

    const result = await this.themesService.bulkDelete(request.body);

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk status update
   * PATCH /themes/bulk/status
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
      'Bulk updating themes status',
    );

    // Convert status to boolean if it's a string
    const statusData = {
      ...request.body,
      status:
        typeof request.body.status === 'string'
          ? request.body.status === 'true' || request.body.status === '1'
          : Boolean(request.body.status),
    };

    const result = await this.themesService.bulkUpdateStatus(statusData);

    return reply.success(
      result,
      `Bulk status update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Activate themes
   * PATCH /themes/:id/activate
   */
  async activate(
    request: FastifyRequest<{
      Params: Static<typeof ThemesIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id }, 'Activating themes');

    const result = await this.themesService.activate(id, request.body);

    return reply.success(result, 'Themes activated successfully');
  }

  /**
   * Deactivate themes
   * PATCH /themes/:id/deactivate
   */
  async deactivate(
    request: FastifyRequest<{
      Params: Static<typeof ThemesIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id }, 'Deactivating themes');

    const result = await this.themesService.deactivate(id, request.body);

    return reply.success(result, 'Themes deactivated successfully');
  }

  /**
   * Toggle themes status
   * PATCH /themes/:id/toggle
   */
  async toggle(
    request: FastifyRequest<{
      Params: Static<typeof ThemesIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ themesId: id }, 'Toggling themes status');

    const result = await this.themesService.toggle(id, request.body);

    return reply.success(result, 'Themes status toggled successfully');
  }

  /**
   * Get statistics
   * GET /themes/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching themes statistics');

    const stats = await this.themesService.getStats();

    return reply.success(stats);
  }

  /**
   * Export themes data
   * GET /themes/export
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
      'Exporting themes data',
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
      const exportData = await this.themesService.getExportData(
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
            title: 'Themes Export',
            metadata,
          });
          break;
        case 'pdf':
          buffer = await this.exportService.exportToPdf({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'Themes Export - รายงาน',
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
        'Themes export completed successfully',
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
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'name',
        label: 'Name',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'display_name',
        label: 'Display name',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'preview_image_url',
        label: 'Preview image url',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'color_palette',
        label: 'Color palette',
        type: 'json' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'css_variables',
        label: 'Css variables',
        type: 'json' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_active',
        label: 'Is active',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_default',
        label: 'Is default',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'sort_order',
        label: 'Sort order',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'created_at',
        label: 'Created at',
        type: 'date' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'updated_at',
        label: 'Updated at',
        type: 'date' as 'string' | 'number' | 'date' | 'boolean' | 'json',
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
    const module = 'themes';

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
    schema: Static<typeof CreateThemesSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      name: schema.name,
      display_name: schema.display_name,
      description: schema.description,
      preview_image_url: schema.preview_image_url,
      color_palette: schema.color_palette,
      css_variables: schema.css_variables,
      is_active: schema.is_active,
      is_default: schema.is_default,
      sort_order: schema.sort_order,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateThemesSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.display_name !== undefined) {
      updateData.display_name = schema.display_name;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.preview_image_url !== undefined) {
      updateData.preview_image_url = schema.preview_image_url;
    }
    if (schema.color_palette !== undefined) {
      updateData.color_palette = schema.color_palette;
    }
    if (schema.css_variables !== undefined) {
      updateData.css_variables = schema.css_variables;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.is_default !== undefined) {
      updateData.is_default = schema.is_default;
    }
    if (schema.sort_order !== undefined) {
      updateData.sort_order = schema.sort_order;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
