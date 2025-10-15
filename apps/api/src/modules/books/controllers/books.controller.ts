import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { BooksService } from '../services/books.service';
import { CreateBooks, UpdateBooks } from '../types/books.types';
import {
  CreateBooksSchema,
  UpdateBooksSchema,
  BooksIdParamSchema,
  GetBooksQuerySchema,
  ListBooksQuerySchema,
} from '../schemas/books.schemas';
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
 * Books Controller
 * Package: full
 * Has Status Field: false
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class BooksController {
  constructor(
    private booksService: BooksService,
    private exportService: ExportService,
  ) {}

  /**
   * Create new books
   * POST /books
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateBooksSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating books');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const books = await this.booksService.create(createData);

    request.log.info({ booksId: books.id }, 'Books created successfully');

    return reply.code(201).success(books, 'Books created successfully');
  }

  /**
   * Get books by ID
   * GET /books/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof BooksIdParamSchema>;
      Querystring: Static<typeof GetBooksQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ booksId: id }, 'Fetching books');

    const books = await this.booksService.findById(id, request.query);

    return reply.success(books);
  }

  /**
   * Get paginated list of bookss
   * GET /books
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListBooksQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching books list');

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
        'author_id',
        'isbn',
        'pages',
        'published_date',
        'price',
        'genre',
        'available',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'title',
        'description',
        'author_id',
        'isbn',
        'pages',
        'published_date',
        'price',
        'genre',
        'available',
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

    // Get books list with field filtering
    const result = await this.booksService.findMany({
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
      'Books list fetched',
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
   * Update books
   * PUT /books/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof BooksIdParamSchema>;
      Body: Static<typeof UpdateBooksSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ booksId: id, body: request.body }, 'Updating books');

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const books = await this.booksService.update(id, updateData);

    request.log.info({ booksId: id }, 'Books updated successfully');

    return reply.success(books, 'Books updated successfully');
  }

  /**
   * Delete books
   * DELETE /books/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof BooksIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ booksId: id }, 'Deleting books');

    const deleted = await this.booksService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Books not found');
    }

    request.log.info({ booksId: id }, 'Books deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Books deleted successfully',
    );
  }

  // ===== ENHANCED CRUD METHODS =====

  /**
   * Get dropdown options
   * GET /books/dropdown
   */
  async getDropdownOptions(
    request: FastifyRequest<{
      Querystring: Static<typeof DropdownQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { query: request.query },
      'Fetching books dropdown options',
    );

    const result = await this.booksService.getDropdownOptions(request.query);

    return reply.success({
      options: result.options,
      total: result.total,
    });
  }

  /**
   * Bulk create bookss
   * POST /books/bulk
   */
  async bulkCreate(
    request: FastifyRequest<{
      Body: {
        items: CreateBooks[];
        options?: { skipDuplicates?: boolean; continueOnError?: boolean };
      };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk creating bookss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) =>
        this.transformCreateSchema(item, request),
      ),
    };

    const result = await this.booksService.bulkCreate(transformedData);

    return reply
      .code(201)
      .success(
        result,
        `Bulk create completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
  }

  /**
   * Bulk update bookss
   * PUT /books/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: { items: Array<{ id: string | number; data: UpdateBooks }> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.items.length },
      'Bulk updating bookss',
    );

    // Transform API schema to domain model for each item
    const transformedData = {
      items: request.body.items.map((item) => ({
        id: item.id,
        data: this.transformUpdateSchema(item.data, request),
      })),
    };

    const result = await this.booksService.bulkUpdate(transformedData);

    return reply.success(
      result,
      `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Bulk delete bookss
   * DELETE /books/bulk
   */
  async bulkDelete(
    request: FastifyRequest<{ Body: Static<typeof BulkDeleteSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info(
      { count: request.body.ids.length },
      'Bulk deleting bookss',
    );

    const result = await this.booksService.bulkDelete(request.body);

    return reply.success(
      result,
      `Bulk delete completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
    );
  }

  /**
   * Get statistics
   * GET /books/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    request.log.info('Fetching books statistics');

    const stats = await this.booksService.getStats();

    return reply.success(stats);
  }

  /**
   * Export books data
   * GET /books/export
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
      'Exporting books data',
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
      const exportData = await this.booksService.getExportData(
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
            title: 'Books Export',
            metadata,
          });
          break;
        case 'pdf':
          buffer = await this.exportService.exportToPdf({
            data: exportData,
            fields: exportFields,
            filename: exportFilename,
            title: 'Books Export - รายงาน',
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
        'Books export completed successfully',
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
   * POST /books/validate
   */
  async validate(
    request: FastifyRequest<{
      Body: { data: Static<typeof CreateBooksSchema> };
    }>,
    reply: FastifyReply,
  ) {
    request.log.info('Validating books data');

    const result = await this.booksService.validate(request.body);

    return reply.success(result);
  }

  /**
   * Check field uniqueness
   * GET /books/check/:field
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
      'Checking books field uniqueness',
    );

    const result = await this.booksService.checkUniqueness(field, {
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
        key: 'author_id',
        label: 'Author id',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'isbn',
        label: 'Isbn',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'pages',
        label: 'Pages',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'published_date',
        label: 'Published date',
        type: 'date' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'price',
        label: 'Price',
        type: 'number' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'genre',
        label: 'Genre',
        type: 'string' as 'string' | 'number' | 'date' | 'boolean' | 'json',
      },
      {
        key: 'available',
        label: 'Available',
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
    const module = 'books';

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
    schema: Static<typeof CreateBooksSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      title: schema.title,
      description: schema.description,
      author_id: schema.author_id,
      isbn: schema.isbn,
      pages: schema.pages,
      published_date: schema.published_date,
      price: schema.price,
      genre: schema.genre,
      available: schema.available,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateBooksSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.title !== undefined) {
      updateData.title = schema.title;
    }
    if (schema.description !== undefined) {
      updateData.description = schema.description;
    }
    if (schema.author_id !== undefined) {
      updateData.author_id = schema.author_id;
    }
    if (schema.isbn !== undefined) {
      updateData.isbn = schema.isbn;
    }
    if (schema.pages !== undefined) {
      updateData.pages = schema.pages;
    }
    if (schema.published_date !== undefined) {
      updateData.published_date = schema.published_date;
    }
    if (schema.price !== undefined) {
      updateData.price = schema.price;
    }
    if (schema.genre !== undefined) {
      updateData.genre = schema.genre;
    }
    if (schema.available !== undefined) {
      updateData.available = schema.available;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
