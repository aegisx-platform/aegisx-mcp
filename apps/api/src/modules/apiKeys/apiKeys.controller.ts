import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { ApiKeysService } from './apiKeys.service';
import {
  CreateApiKeysSchema,
  UpdateApiKeysSchema,
  ApiKeysIdParamSchema,
  GetApiKeysQuerySchema,
  ListApiKeysQuerySchema,
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeysIdParam,
  type GetApiKeysQuery,
  type ListApiKeysQuery
} from './apiKeys.schemas';
import { EventService } from '../../shared/websocket/event.service';

export class ApiKeysController {
  constructor(
    private apiKeysService: ApiKeysService,
    private eventService: EventService
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateApiKeys }>,
    reply: FastifyReply
  ) {
    try {
      const apiKeys = await this.apiKeysService.create(request.body);
      
      // Emit real-time event
      await this.eventService.emitToRoom(
        'global',
        'apiKeys.created',
        apiKeys
      );

      return reply.status(201).send({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      request.log.error(error, 'Error creating apiKeys');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findOne(
    request: FastifyRequest<{
      Params: ApiKeysIdParam;
      Querystring: GetApiKeysQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const apiKeys = await this.apiKeysService.findById(
        request.params.id,
        request.query
      );

      if (!apiKeys) {
        return reply.status(404).send({
          success: false,
          error: 'ApiKeys not found'
        });
      }

      return reply.send({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      request.log.error(error, 'Error finding apiKeys');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findMany(
    request: FastifyRequest<{ Querystring: ListApiKeysQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.apiKeysService.findMany(request.query);

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error(error, 'Error finding apiKeyss');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async update(
    request: FastifyRequest<{
      Params: ApiKeysIdParam;
      Body: UpdateApiKeys;
    }>,
    reply: FastifyReply
  ) {
    try {
      const apiKeys = await this.apiKeysService.update(
        request.params.id,
        request.body
      );

      if (!apiKeys) {
        return reply.status(404).send({
          success: false,
          error: 'ApiKeys not found'
        });
      }

      // Emit real-time event
      await this.eventService.emitToRoom(
        'global',
        'apiKeys.updated',
        apiKeys
      );

      return reply.send({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      request.log.error(error, 'Error updating apiKeys');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: ApiKeysIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const deleted = await this.apiKeysService.delete(request.params.id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'ApiKeys not found'
        });
      }

      // Emit real-time event
      await this.eventService.emitToRoom(
        'global',
        'apiKeys.deleted',
        { id: request.params.id }
      );

      return reply.send({
        success: true,
        message: 'ApiKeys deleted successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error deleting apiKeys');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}