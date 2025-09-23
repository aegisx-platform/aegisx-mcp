import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ThemesService } from './themes.service';
import {
  CreateThemesSchema,
  UpdateThemesSchema,
  ThemesIdParamSchema,
  GetThemesQuerySchema,
  ListThemesQuerySchema,
  type CreateThemes,
  type UpdateThemes,
  type ThemesIdParam,
  type GetThemesQuery,
  type ListThemesQuery
} from './themes.schemas';

export class ThemesController {
  constructor(
    private themesService: ThemesService
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateThemes }>,
    reply: FastifyReply
  ) {
    try {
      const themes = await this.themesService.create(request.body);
      

      return reply.status(201).send({
        success: true,
        data: themes
      });
    } catch (error) {
      request.log.error(error, 'Error creating themes');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findOne(
    request: FastifyRequest<{
      Params: ThemesIdParam;
      Querystring: GetThemesQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const themes = await this.themesService.findById(
        request.params.id,
        request.query
      );

      if (!themes) {
        return reply.status(404).send({
          success: false,
          error: 'Themes not found'
        });
      }

      return reply.send({
        success: true,
        data: themes
      });
    } catch (error) {
      request.log.error(error, 'Error finding themes');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findMany(
    request: FastifyRequest<{ Querystring: ListThemesQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.themesService.findMany(request.query);

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error(error, 'Error finding themess');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async update(
    request: FastifyRequest<{
      Params: ThemesIdParam;
      Body: UpdateThemes;
    }>,
    reply: FastifyReply
  ) {
    try {
      const themes = await this.themesService.update(
        request.params.id,
        request.body
      );

      if (!themes) {
        return reply.status(404).send({
          success: false,
          error: 'Themes not found'
        });
      }


      return reply.send({
        success: true,
        data: themes
      });
    } catch (error) {
      request.log.error(error, 'Error updating themes');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: ThemesIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const deleted = await this.themesService.delete(request.params.id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Themes not found'
        });
      }


      return reply.send({
        success: true,
        message: 'Themes deleted successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error deleting themes');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}