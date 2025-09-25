import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ThemesService } from '../services/themes.service';
import {
  CreateThemesSchema,
  UpdateThemesSchema,
  ThemesIdParamSchema,
  GetThemesQuerySchema,
  ListThemesQuerySchema
} from '../schemas/themes.schemas';

/**
 * Themes Controller
 * 
 * Following Fastify controller patterns:
 * - Proper request/reply typing with Static<typeof Schema>
 * - Schema-based validation integration
 * - Structured error handling
 * - Logging integration with Fastify's logger
 */
export class ThemesController {
  constructor(private themesService: ThemesService) {}

  /**
   * Create new themes
   * POST /themes
   */
  async create(
    request: FastifyRequest<{ Body: Static<typeof CreateThemesSchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ body: request.body }, 'Creating themes');

      // Transform API schema to domain model
      const createData = this.transformCreateSchema(request.body);
      
      const themes = await this.themesService.create(createData);
      
      request.log.info({ themesId: themes.id }, 'Themes created successfully');

      return reply.status(201).send({
        success: true,
        data: themes,
        message: 'Themes created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error creating themes');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to create themes'
        }
      });
    }
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
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ themesId: id }, 'Fetching themes');

      const themes = await this.themesService.findById(id, request.query);

      if (!themes) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Themes not found'
          }
        });
      }

      return reply.send({
        success: true,
        data: themes
      });
    } catch (error) {
      request.log.error({ error, themesId: request.params.id }, 'Error fetching themes');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch themes'
        }
      });
    }
  }

  /**
   * Get paginated list of themess
   * GET /themes
   */
  async findMany(
    request: FastifyRequest<{ Querystring: Static<typeof ListThemesQuerySchema> }>,
    reply: FastifyReply
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching themes list');

      const result = await this.themesService.findMany(request.query);

      request.log.info({ count: result.data.length, total: result.pagination.total }, 'Themes list fetched');

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error({ error, query: request.query }, 'Error fetching themes list');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'LIST_FETCH_FAILED',
          message: 'Failed to fetch themes list'
        }
      });
    }
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
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ themesId: id, body: request.body }, 'Updating themes');

      // Transform API schema to domain model
      const updateData = this.transformUpdateSchema(request.body);
      
      const themes = await this.themesService.update(id, updateData);

      if (!themes) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Themes not found'
          }
        });
      }

      request.log.info({ themesId: id }, 'Themes updated successfully');

      return reply.send({
        success: true,
        data: themes,
        message: 'Themes updated successfully'
      });
    } catch (error) {
      request.log.error({ error, themesId: request.params.id }, 'Error updating themes');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update themes'
        }
      });
    }
  }

  /**
   * Delete themes
   * DELETE /themes/:id
   */
  async delete(
    request: FastifyRequest<{ Params: Static<typeof ThemesIdParamSchema> }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      request.log.info({ themesId: id }, 'Deleting themes');

      const deleted = await this.themesService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Themes not found'
          }
        });
      }

      request.log.info({ themesId: id }, 'Themes deleted successfully');

      return reply.send({
        success: true,
        message: 'Themes deleted successfully',
        data: { id, deleted: true }
      });
    } catch (error) {
      request.log.error({ error, themesId: request.params.id }, 'Error deleting themes');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to delete themes'
        }
      });
    }
  }

  // ===== PRIVATE TRANSFORMATION METHODS =====

  /**
   * Transform API create schema to domain model
   */
  private transformCreateSchema(schema: Static<typeof CreateThemesSchema>) {
    return {
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
  }

  /**
   * Transform API update schema to domain model  
   */
  private transformUpdateSchema(schema: Static<typeof UpdateThemesSchema>) {
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
    
    return updateData;
  }
}