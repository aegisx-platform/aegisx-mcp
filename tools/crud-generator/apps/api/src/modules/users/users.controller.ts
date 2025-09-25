import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { UsersService } from './users.service';
import {
  CreateUsersSchema,
  UpdateUsersSchema,
  UsersIdParamSchema,
  GetUsersQuerySchema,
  ListUsersQuerySchema
} from './users.schemas';

/**
 * Users Controller
 * 
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Create new users
   * POST /users
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateUsersSchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating users');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);
      
      const users = await this.usersService.create(createData);
      
      request.log.info({ usersId: users.id }, 'Users created successfully');

      return reply.status(201).send({
        success: true,
        data: users,
        message: 'Users created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error creating users');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create users'
        }
      });
    }
  }

  /**
   * Get users by ID
   * GET /users/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof UsersIdParamSchema>;
      Querystring: Static<typeof GetUsersQuerySchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ usersId: id }, 'Fetching users');

      const users = await this.usersService.findById(id, request.query);

      if (!users) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Users not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: users
      });
    } catch (error) {
      request.log.error({ error, usersId: request.params.id }, 'Error fetching users');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch users'
        }
      });
    }
  }

  /**
   * Get paginated list of userss
   * GET /users
   */
  async findMany(
    request: FastifyRequest<{ Querystring: Static<typeof ListUsersQuerySchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching users list');

      const result = await this.usersService.findMany(request.query);

      request.log.info({ count: result.data.length, total: result.pagination.total }, 'Users list fetched');

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error({ error, query: request.query }, 'Error fetching users list');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch users list'
        }
      });
    }
  }

  /**
   * Update users
   * PUT /users/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof UsersIdParamSchema>;
      Body: Static<typeof UpdateUsersSchema>;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ usersId: id, body: request.body }, 'Updating users');

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);
      
      const users = await this.usersService.update(id, updateData);

      if (!users) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Users not found'
          }
        });
      }

      request.log.info({ usersId: id }, 'Users updated successfully');

      return reply.send({
        success: true,
        data: users,
        message: 'Users updated successfully'
      });
    } catch (error) {
      request.log.error({ error, usersId: request.params.id }, 'Error updating users');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update users'
        }
      });
    }
  }

  /**
   * Delete users
   * DELETE /users/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof UsersIdParamSchema> }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ usersId: id }, 'Deleting users');

      const deleted = await this.usersService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Users not found'
          }
        });
      }

      request.log.info({ usersId: id }, 'Users deleted successfully');

      return reply.send({
        success: true,
        message: 'Users deleted successfully',
        data: { id, deleted: true }
      });
    } catch (error) {
      request.log.error({ error, usersId: request.params.id }, 'Error deleting users');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete users'
        }
      });
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(schema: Static<typeof CreateUsersSchema>) {
    return {
      // Transform snake_case API fields to camelCase domain fields
      email: schema.email,
      username: schema.username,
      password: schema.password,
      first_name: schema.first_name,
      last_name: schema.last_name,
      is_active: schema.is_active,
      last_login_at: schema.last_login_at,
      avatar_url: schema.avatar_url,
      name: schema.name,
      status: schema.status,
      email_verified: schema.email_verified,
      email_verified_at: schema.email_verified_at,
      two_factor_enabled: schema.two_factor_enabled,
      two_factor_secret: schema.two_factor_secret,
      two_factor_backup_codes: schema.two_factor_backup_codes,
      deleted_at: schema.deleted_at,
      bio: schema.bio,
      timezone: schema.timezone,
      language: schema.language,
      date_of_birth: schema.date_of_birth,
      phone: schema.phone,
      deletion_reason: schema.deletion_reason,
      recovery_deadline: schema.recovery_deadline,
      deleted_by_ip: schema.deleted_by_ip,
      deleted_by_user_agent: schema.deleted_by_user_agent,
    };
  }

  /**
   * Transform API update schema to domain model  
   */
  private transformUpdateSchema(schema: Static<typeof UpdateUsersSchema>) {
    const updateData: any = {};
    
    if (schema.email !== undefined) {
      updateData.email = schema.email;
    }
    if (schema.username !== undefined) {
      updateData.username = schema.username;
    }
    if (schema.password !== undefined) {
      updateData.password = schema.password;
    }
    if (schema.first_name !== undefined) {
      updateData.first_name = schema.first_name;
    }
    if (schema.last_name !== undefined) {
      updateData.last_name = schema.last_name;
    }
    if (schema.is_active !== undefined) {
      updateData.is_active = schema.is_active;
    }
    if (schema.last_login_at !== undefined) {
      updateData.last_login_at = schema.last_login_at;
    }
    if (schema.avatar_url !== undefined) {
      updateData.avatar_url = schema.avatar_url;
    }
    if (schema.name !== undefined) {
      updateData.name = schema.name;
    }
    if (schema.status !== undefined) {
      updateData.status = schema.status;
    }
    if (schema.email_verified !== undefined) {
      updateData.email_verified = schema.email_verified;
    }
    if (schema.email_verified_at !== undefined) {
      updateData.email_verified_at = schema.email_verified_at;
    }
    if (schema.two_factor_enabled !== undefined) {
      updateData.two_factor_enabled = schema.two_factor_enabled;
    }
    if (schema.two_factor_secret !== undefined) {
      updateData.two_factor_secret = schema.two_factor_secret;
    }
    if (schema.two_factor_backup_codes !== undefined) {
      updateData.two_factor_backup_codes = schema.two_factor_backup_codes;
    }
    if (schema.deleted_at !== undefined) {
      updateData.deleted_at = schema.deleted_at;
    }
    if (schema.bio !== undefined) {
      updateData.bio = schema.bio;
    }
    if (schema.timezone !== undefined) {
      updateData.timezone = schema.timezone;
    }
    if (schema.language !== undefined) {
      updateData.language = schema.language;
    }
    if (schema.date_of_birth !== undefined) {
      updateData.date_of_birth = schema.date_of_birth;
    }
    if (schema.phone !== undefined) {
      updateData.phone = schema.phone;
    }
    if (schema.deletion_reason !== undefined) {
      updateData.deletion_reason = schema.deletion_reason;
    }
    if (schema.recovery_deadline !== undefined) {
      updateData.recovery_deadline = schema.recovery_deadline;
    }
    if (schema.deleted_by_ip !== undefined) {
      updateData.deleted_by_ip = schema.deleted_by_ip;
    }
    if (schema.deleted_by_user_agent !== undefined) {
      updateData.deleted_by_user_agent = schema.deleted_by_user_agent;
    }
    
    return updateData;
  }
}