import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationsSchema,
  UpdateNotificationsSchema,
  NotificationsIdParamSchema,
  GetNotificationsQuerySchema,
  ListNotificationsQuerySchema,
  type CreateNotifications,
  type UpdateNotifications,
  type NotificationsIdParam,
  type GetNotificationsQuery,
  type ListNotificationsQuery
} from './notifications.schemas';

export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService
  ) {}

  async create(
    request: FastifyRequest<{ Body: CreateNotifications }>,
    reply: FastifyReply
  ) {
    try {
      const notifications = await this.notificationsService.create(request.body);
      

      return reply.status(201).send({
        success: true,
        data: notifications
      });
    } catch (error) {
      request.log.error(error, 'Error creating notifications');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findOne(
    request: FastifyRequest<{
      Params: NotificationsIdParam;
      Querystring: GetNotificationsQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const notifications = await this.notificationsService.findById(
        request.params.id,
        request.query
      );

      if (!notifications) {
        return reply.status(404).send({
          success: false,
          error: 'Notifications not found'
        });
      }

      return reply.send({
        success: true,
        data: notifications
      });
    } catch (error) {
      request.log.error(error, 'Error finding notifications');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async findMany(
    request: FastifyRequest<{ Querystring: ListNotificationsQuery }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.notificationsService.findMany(request.query);

      return reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error(error, 'Error finding notificationss');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async update(
    request: FastifyRequest<{
      Params: NotificationsIdParam;
      Body: UpdateNotifications;
    }>,
    reply: FastifyReply
  ) {
    try {
      const notifications = await this.notificationsService.update(
        request.params.id,
        request.body
      );

      if (!notifications) {
        return reply.status(404).send({
          success: false,
          error: 'Notifications not found'
        });
      }


      return reply.send({
        success: true,
        data: notifications
      });
    } catch (error) {
      request.log.error(error, 'Error updating notifications');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: NotificationsIdParam }>,
    reply: FastifyReply
  ) {
    try {
      const deleted = await this.notificationsService.delete(request.params.id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Notifications not found'
        });
      }


      return reply.send({
        success: true,
        message: 'Notifications deleted successfully'
      });
    } catch (error) {
      request.log.error(error, 'Error deleting notifications');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}