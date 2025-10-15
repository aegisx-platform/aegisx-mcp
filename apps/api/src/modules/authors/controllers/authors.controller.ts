import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { AuthorsService } from '../services/authors.service';
import { CreateAuthors, UpdateAuthors } from '../types/authors.types';
import {
  CreateAuthorsSchema,
  UpdateAuthorsSchema,
  AuthorsIdParamSchema,
  GetAuthorsQuerySchema,
  ListAuthorsQuerySchema,
} from '../schemas/authors.schemas';
import { ExportQuerySchema } from '../../../schemas/export.schemas';
import { ExportService, ExportField } from '../../../services/export.service';
import {
  DropdownQuerySchema,
  BulkCreateSchema,
  BulkUpdateSchema,
  BulkDeleteSchema,
  ValidationRequestSchema,
  UniquenessCheckSchema,
} from '../../../schemas/base.schemas';

/**
 * Authors Controller
 * Package: full
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class AuthorsController {
  constructor(
    private authorsService: AuthorsService,
    private exportService: ExportService,
  ) {}

  /**
   * Create new authors
   * POST /authors
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateAuthorsSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating authors');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const authors = await this.authorsService.create(createData);

    request.log.info({ authorsId: authors.id }, 'Authors created successfully');

    return reply.code(201).success(authors, 'Authors created successfully');
  }

  /**
   * Get authors by ID
   * GET /authors/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof AuthorsIdParamSchema>;
      Querystring: Static<typeof GetAuthorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id }, 'Fetching authors');

    const authors = await this.authorsService.findById(id, request.query);

    return reply.success(authors);
  }

  /**
   * Get paginated list of authorss
   * GET /authors
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListAuthorsQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching authors list');

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
        'email',
        'bio',
        'birth_date',
        'country',
        'active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'name',
        'email',
        'bio',
        'birth_date',
        'country',
        'active',
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

    // Get authors list with field filtering
    const result = await this.authorsService.findMany({
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
      'Authors list fetched',
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
   * Update authors
   * PUT /authors/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof AuthorsIdParamSchema>;
      Body: Static<typeof UpdateAuthorsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id, body: request.body }, 'Updating authors');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const authors = await this.authorsService.update(id, updateData);

    request.log.info({ authorsId: id }, 'Authors updated successfully');

    return reply.success(authors, 'Authors updated successfully');
  }

  /**
   * Delete authors
   * DELETE /authors/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof AuthorsIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ authorsId: id }, 'Deleting authors');

    const deleted = await this.authorsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Authors not found');
    }

    request.log.info({ authorsId: id }, 'Authors deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Authors deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /authors/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching authors dropdown options',
    );

    const result = await this.authorsService.getDropdownOptions(request.query);

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create authorss
   * POST /authors/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateAuthors[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating authorss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result = await this.authorsService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update authorss
   * PUT /authors/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: { items: Array<{ id: string | number; data: UpdateAuthors }> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating authorss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result = await this.authorsService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete authorss
   * DELETE /authors/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting authorss',
    );

    const result = await this.authorsService.bulkDelete(request.body);

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Get statistics
   * GET /authors/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching authors statistics');

    const stats = await this.authorsService.getStats();

    return reply.success(stats);
  }

  /**
   * Export authors data
   * GET /authors/export
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
      'Exporting authors data',
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
      const exportData = await this.authorsService.getExportData(
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
            title: 'Authors Export',
            metadata,
          });
          break;
        case 'pdf':
          buffer = await this.exportService.exportToPdf({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'Authors Export - รายงาน',
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
        'Authors export completed successfully',
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

  // ===== FULL PACKAGE METHODS =====

  /**
   * Validate data before save
   * POST /authors/validate
   */
  async validate(
    request: FastifyRequest<{
      Body: { data: Static<typeof CreateAuthorsSchema> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info('Validating authors data');

    const result = await this.authorsService.validate(request.body);

    return reply.success(result);
  }

  /**
   * Check field uniqueness
   * GET /authors/check/:field
   */
  async checkUniqueness(
    request: FastifyRequest<{
      Params: { field: string };
      Querystring: Static<typeof UniquenessCheckSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { field } = request.params;
    request.log.info(
      { field, value: request.query.value },
      'Checking authors field uniqueness',
    );

    const result = await this.authorsService.checkUniqueness(field, {
      value: String(request.query.value),
      excludeId: request.query.excludeId,
    });

    return reply.success(result);
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
        key: 'email',
        label: 'Email',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'bio',
        label: 'Bio',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'birth_date',
        label: 'Birth date',
        type: 'date' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'country',
        label: 'Country',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'active',
        label: 'Active',
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
    const module = 'authors';

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
    schema: Static<typeof CreateAuthorsSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      name: schema.name,
      email: schema.email,
      bio: schema.bio,
      birth_date: schema.birth_date,
      country: schema.country,
      active: schema.active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateAuthorsSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.email !== undefined) {
      updateData.email = schema.email;
    }
    if (schema.bio !== undefined) {
      updateData.bio = schema.bio;
    }
    if (schema.birth_date !== undefined) {
      updateData.birth_date = schema.birth_date;
    }
    if (schema.country !== undefined) {
      updateData.country = schema.country;
    }
    if (schema.active !== undefined) {
      updateData.active = schema.active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
