import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ComprehensiveTestsService } from '../services/comprehensive-tests.service';
import {
  CreateComprehensiveTests,
  UpdateComprehensiveTests,
} from '../types/comprehensive-tests.types';
import {
  CreateComprehensiveTestsSchema,
  UpdateComprehensiveTestsSchema,
  ComprehensiveTestsIdParamSchema,
  GetComprehensiveTestsQuerySchema,
  ListComprehensiveTestsQuerySchema,
} from '../schemas/comprehensive-tests.schemas';
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
 * ComprehensiveTests Controller
 * Package: enterprise
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ComprehensiveTestsController {
  constructor(
    private comprehensiveTestsService: ComprehensiveTestsService,
    private exportService: ExportService,
  ) {}

  /**
   * Create new comprehensiveTests
   * POST /comprehensiveTests
   */
  async create(
    request: FastifyRequest<{
      Body: Static<typeof CreateComprehensiveTestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating comprehensiveTests');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const comprehensiveTests =
      await this.comprehensiveTestsService.create(createData);

    request.log.info(
      { comprehensiveTestsId: comprehensiveTests.id },
      'ComprehensiveTests created successfully',
    );

    return reply
      .code(201)
      .success(comprehensiveTests, 'ComprehensiveTests created successfully');
  }

  /**
   * Get comprehensiveTests by ID
   * GET /comprehensiveTests/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Querystring: Static<typeof GetComprehensiveTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Fetching comprehensiveTests',
    );

    const comprehensiveTests = await this.comprehensiveTestsService.findById(
      id,
      request.query,
    );

    return reply.success(comprehensiveTests);
  }

  /**
   * Get paginated list of comprehensiveTestss
   * GET /comprehensiveTests
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListComprehensiveTestsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching comprehensiveTests list',
    );

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'title', 'created_at'],
      user: [
        'id',
        'title',
        'id',
        'title',
        'description',
        'slug',
        'short_code',
        'price',
        'quantity',
        'weight',
        'rating',
        'is_active',
        'is_featured',
        'is_available',
        'created_at',
        'updated_at',
        'published_at',
        'expires_at',
        'start_time',
        'metadata',
        'tags',
        'ip_address',
        'website_url',
        'email_address',
        'status',
        'priority',
        'content',
        'notes',
        'created_at',
      ],
      admin: [
        'id',
        'title',
        'description',
        'slug',
        'short_code',
        'price',
        'quantity',
        'weight',
        'rating',
        'is_active',
        'is_featured',
        'is_available',
        'created_at',
        'updated_at',
        'published_at',
        'expires_at',
        'start_time',
        'metadata',
        'tags',
        'ip_address',
        'website_url',
        'email_address',
        'status',
        'priority',
        'content',
        'notes',
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

    // Get comprehensiveTests list with field filtering
    const result = await this.comprehensiveTestsService.findMany({
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
      'ComprehensiveTests list fetched',
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
   * Update comprehensiveTests
   * PUT /comprehensiveTests/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Body: Static<typeof UpdateComprehensiveTestsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id, body: request.body },
      'Updating comprehensiveTests',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const comprehensiveTests = await this.comprehensiveTestsService.update(
      id,
      updateData,
    );

    request.log.info(
      { comprehensiveTestsId: id },
      'ComprehensiveTests updated successfully',
    );

    return reply.success(
      comprehensiveTests,
      'ComprehensiveTests updated successfully',
    );
  }

  /**
   * Delete comprehensiveTests
   * DELETE /comprehensiveTests/:id
   */
  async delete(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Deleting comprehensiveTests',
    );

    const deleted = await this.comprehensiveTestsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'ComprehensiveTests not found');
    }

    request.log.info(
      { comprehensiveTestsId: id },
      'ComprehensiveTests deleted successfully',
    );

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'ComprehensiveTests deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /comprehensiveTests/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching comprehensiveTests dropdown options',
    );

    const result = await this.comprehensiveTestsService.getDropdownOptions(
      request.query,
    );

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create comprehensiveTestss
   * POST /comprehensiveTests/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateComprehensiveTests[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating comprehensiveTestss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result =
      await this.comprehensiveTestsService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update comprehensiveTestss
   * PUT /comprehensiveTests/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: {
        items: Array<{ id: string | number; data: UpdateComprehensiveTests }>;
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating comprehensiveTestss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result =
      await this.comprehensiveTestsService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete comprehensiveTestss
   * DELETE /comprehensiveTests/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting comprehensiveTestss',
    );

    const result = await this.comprehensiveTestsService.bulkDelete(
      request.body,
    );

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk status update
   * PATCH /comprehensiveTests/bulk/status
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
      'Bulk updating comprehensiveTests status',
    );

    // Convert status to boolean if it's a string
    const statusData = {
      ...request.body,
      status:
        typeof request.body.status === 'string'
          ? request.body.status === 'true' || request.body.status === '1'
          : Boolean(request.body.status),
    };

    const result =
      await this.comprehensiveTestsService.bulkUpdateStatus(statusData);

    return reply.success(
      result,
      `Bulk status update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Activate comprehensiveTests
   * PATCH /comprehensiveTests/:id/activate
   */
  async activate(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Activating comprehensiveTests',
    );

    const result = await this.comprehensiveTestsService.activate(
      id,
      request.body,
    );

    return reply.success(result, 'ComprehensiveTests activated successfully');
  }

  /**
   * Deactivate comprehensiveTests
   * PATCH /comprehensiveTests/:id/deactivate
   */
  async deactivate(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Deactivating comprehensiveTests',
    );

    const result = await this.comprehensiveTestsService.deactivate(
      id,
      request.body,
    );

    return reply.success(result, 'ComprehensiveTests deactivated successfully');
  }

  /**
   * Toggle comprehensiveTests status
   * PATCH /comprehensiveTests/:id/toggle
   */
  async toggle(
    request: FastifyRequest<{
      Params: Static<typeof ComprehensiveTestsIdParamSchema>;
      Body: Static<typeof StatusToggleSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { comprehensiveTestsId: id },
      'Toggling comprehensiveTests status',
    );

    const result = await this.comprehensiveTestsService.toggle(
      id,
      request.body,
    );

    return reply.success(
      result,
      'ComprehensiveTests status toggled successfully',
    );
  }

  /**
   * Get statistics
   * GET /comprehensiveTests/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching comprehensiveTests statistics');

    const stats = await this.comprehensiveTestsService.getStats();

    return reply.success(stats);
  }

  /**
   * Export comprehensiveTests data
   * GET /comprehensiveTests/export
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
      'Exporting comprehensiveTests data',
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
      const exportData = await this.comprehensiveTestsService.getExportData(
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
            title: 'ComprehensiveTests Export',
            metadata,
          });
          break;
        case 'pdf':
          buffer = await this.exportService.exportToPdf({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'ComprehensiveTests Export - รายงานการทดสอบครอบคลุม',
            metadata,
            pdfOptions: {
              template: 'professional',
              pageSize: 'A4',
              orientation: 'landscape',
              subtitle: 'Generated with Thai Font Support',
              logo: process.env.PDF_LOGO_URL
            }
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
        'ComprehensiveTests export completed successfully',
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
        key: 'title',
        label: 'Title',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'slug',
        label: 'Slug',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'short_code',
        label: 'Short code',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'price',
        label: 'Price',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'weight',
        label: 'Weight',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_active',
        label: 'Is active',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_featured',
        label: 'Is featured',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'is_available',
        label: 'Is available',
        type: 'boolean' as 'string' | 'number' | 'date' | 'boolean' | 'json',
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
      {
        key: 'published_at',
        label: 'Published at',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'expires_at',
        label: 'Expires at',
        type: 'date' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'start_time',
        label: 'Start time',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'metadata',
        label: 'Metadata',
        type: 'json' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'ip_address',
        label: 'Ip address',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'website_url',
        label: 'Website url',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'email_address',
        label: 'Email address',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'content',
        label: 'Content',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'notes',
        label: 'Notes',
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
    const module = 'comprehensive-tests';

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
    schema: Static<typeof CreateComprehensiveTestsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      title: schema.title,
      description: schema.description,
      slug: schema.slug,
      short_code: schema.short_code,
      price: schema.price,
      quantity: schema.quantity,
      weight: schema.weight,
      rating: schema.rating,
      is_active: schema.is_active,
      is_featured: schema.is_featured,
      is_available: schema.is_available,
      published_at: schema.published_at,
      expires_at: schema.expires_at,
      start_time: schema.start_time,
      metadata: schema.metadata,
      tags: schema.tags,
      ip_address: schema.ip_address,
      website_url: schema.website_url,
      email_address: schema.email_address,
      status: schema.status,
      priority: schema.priority,
      content: schema.content,
      notes: schema.notes,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateComprehensiveTestsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.title !== undefined) {
      updateData.title = schema.title;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.slug !== undefined) {
      updateData.slug = schema.slug;
    }
    if (schema.short_code !== undefined) {
      updateData.short_code = schema.short_code;
    }
    if (schema.price !== undefined) {
      updateData.price = schema.price;
    }
    if (schema.quantity !== undefined) {
      updateData.quantity = schema.quantity;
    }
    if (schema.weight !== undefined) {
      updateData.weight = schema.weight;
    }
    if (schema.rating !== undefined) {
      updateData.rating = schema.rating;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.is_featured !== undefined) {
      updateData.is_featured = schema.is_featured;
    }
    if (schema.is_available !== undefined) {
      updateData.is_available = schema.is_available;
    }
    if (schema.published_at !== undefined) {
      updateData.published_at = schema.published_at;
    }
    if (schema.expires_at !== undefined) {
      updateData.expires_at = schema.expires_at;
    }
    if (schema.start_time !== undefined) {
      updateData.start_time = schema.start_time;
    }
    if (schema.metadata !== undefined) {
      updateData.metadata = schema.metadata;
    }
    if (schema.tags !== undefined) {
      updateData.tags = schema.tags;
    }
    if (schema.ip_address !== undefined) {
      updateData.ip_address = schema.ip_address;
    }
    if (schema.website_url !== undefined) {
      updateData.website_url = schema.website_url;
    }
    if (schema.email_address !== undefined) {
      updateData.email_address = schema.email_address;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.priority !== undefined) {
      updateData.priority = schema.priority;
    }
    if (schema.content !== undefined) {
      updateData.content = schema.content;
    }
    if (schema.notes !== undefined) {
      updateData.notes = schema.notes;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
