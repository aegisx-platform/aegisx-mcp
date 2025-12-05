import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { CompaniesService } from './companies.service';
import { CreateCompanies, UpdateCompanies } from './companies.types';
import {
  CreateCompaniesSchema,
  UpdateCompaniesSchema,
  CompaniesIdParamSchema,
  GetCompaniesQuerySchema,
  ListCompaniesQuerySchema,
} from './companies.schemas';

/**
 * Companies Controller
 * Package: standard
 * Has Status Field: true
 *
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  /**
   * Create new companies
   * POST /companies
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateCompaniesSchema> }>,
    reply: FastifyReply,
  ) {
    request.log.info({ body: request.body }, 'Creating companies');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const companies = await this.companiesService.create(createData);

    request.log.info(
      { companiesId: companies.id },
      'Companies created successfully',
    );

    return reply.code(201).success(companies, 'Companies created successfully');
  }

  /**
   * Get companies by ID
   * GET /companies/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof CompaniesIdParamSchema>;
      Querystring: Static<typeof GetCompaniesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ companiesId: id }, 'Fetching companies');

    const companies = await this.companiesService.findById(id, request.query);

    return reply.success(companies);
  }

  /**
   * Get paginated list of companiess
   * GET /companies
   * Supports: ?fields=id,name&limit=100 (Security hardened)
   */
  async findMany(
    request: FastifyRequest<{
      Querystring: Static<typeof ListCompaniesQuerySchema>;
    }>,
    reply: FastifyReply,
  ) {
    request.log.info({ query: request.query }, 'Fetching companies list');

    // 🛡️ Security: Extract and validate parameters
    const { fields, ...queryParams } = request.query;

    // 🛡️ Security: Define allowed fields by role
    const SAFE_FIELDS = {
      public: ['id', 'company_code', 'created_at'],
      user: [
        'id',
        'company_code',
        'id',
        'company_code',
        'company_name',
        'bank_id',
        'is_vendor',
        'is_manufacturer',
        'contact_person',
        'phone',
        'email',
        'address',
        'is_active',
        'created_at',
        'updated_at',
        'created_at',
      ],
      admin: [
        'id',
        'company_code',
        'company_name',
        'tax_id',
        'bank_id',
        'bank_account_number',
        'bank_account_name',
        'is_vendor',
        'is_manufacturer',
        'contact_person',
        'phone',
        'email',
        'address',
        'is_active',
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

    // Get companies list with field filtering
    const result = await this.companiesService.findMany({
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
      'Companies list fetched',
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
   * Update companies
   * PUT /companies/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof CompaniesIdParamSchema>;
      Body: Static<typeof UpdateCompaniesSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info(
      { companiesId: id, body: request.body },
      'Updating companies',
    );

    // Transform API schema to domain model
    const updateData = this.transformUpdateSchema(request.body, request);

    const companies = await this.companiesService.update(id, updateData);

    request.log.info({ companiesId: id }, 'Companies updated successfully');

    return reply.success(companies, 'Companies updated successfully');
  }

  /**
   * Delete companies
   * DELETE /companies/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof CompaniesIdParamSchema> }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ companiesId: id }, 'Deleting companies');

    const deleted = await this.companiesService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Companies not found');
    }

    request.log.info({ companiesId: id }, 'Companies deleted successfully');

    // Return operation result using standard success response
    return reply.success(
      {
        id,
        deleted: true,
      },
      'Companies deleted successfully',
    );
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(
    schema: Static<typeof CreateCompaniesSchema>,
    request: FastifyRequest,
  ) {
    const result: any = {
      // Transform snake_case API fields to camelCase domain fields
      company_code: schema.company_code,
      company_name: schema.company_name,
      tax_id: schema.tax_id,
      bank_id: schema.bank_id,
      bank_account_number: schema.bank_account_number,
      bank_account_name: schema.bank_account_name,
      is_vendor: schema.is_vendor,
      is_manufacturer: schema.is_manufacturer,
      contact_person: schema.contact_person,
      phone: schema.phone,
      email: schema.email,
      address: schema.address,
      is_active: schema.is_active,
    };

    // Auto-fill created_by from JWT if table has this field

    return result;
  }

  /**
   * Transform API update schema to domain model
   */
  private transformUpdateSchema(
    schema: Static<typeof UpdateCompaniesSchema>,
    request: FastifyRequest,
  ) {
    const updateData: any = {};

    if (schema.company_code !== undefined) {
      updateData.company_code = schema.company_code;
    }
    if (schema.company_name !== undefined) {
      updateData.company_name = schema.company_name;
    }
    if (schema.tax_id !== undefined) {
      updateData.tax_id = schema.tax_id;
    }
    if (schema.bank_id !== undefined) {
      updateData.bank_id = schema.bank_id;
    }
    if (schema.bank_account_number !== undefined) {
      updateData.bank_account_number = schema.bank_account_number;
    }
    if (schema.bank_account_name !== undefined) {
      updateData.bank_account_name = schema.bank_account_name;
    }
    if (schema.is_vendor !== undefined) {
      updateData.is_vendor = schema.is_vendor;
    }
    if (schema.is_manufacturer !== undefined) {
      updateData.is_manufacturer = schema.is_manufacturer;
    }
    if (schema.contact_person !== undefined) {
      updateData.contact_person = schema.contact_person;
    }
    if (schema.phone !== undefined) {
      updateData.phone = schema.phone;
    }
    if (schema.email !== undefined) {
      updateData.email = schema.email;
    }
    if (schema.address !== undefined) {
      updateData.address = schema.address;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }

    // Auto-fill updated_by from JWT if table has this field

    return updateData;
  }
}
