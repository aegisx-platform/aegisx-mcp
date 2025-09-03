import { FastifyRequest, FastifyReply } from 'fastify';
import {
  GetSettingsQuery,
  CreateSetting,
  UpdateSetting,
  UpdateSettingValue,
  UpdateUserSetting,
  BulkUpdateSettings,
  GetSettingHistoryQuery,
} from './settings.schemas';

export const settingsController = {
  async getSettings(
    request: FastifyRequest<{ Querystring: GetSettingsQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = request.user?.id;
      const result = await request.server.settingsService.getSettings(
        request.query,
        userId,
      );

      return reply.send({
        success: true,
        data: result.settings,
        message: 'Settings retrieved successfully',
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      request.server.log.error('Settings GET error: ' + error);
      throw error;
    }
  },

  async getGroupedSettings(
    request: FastifyRequest<{ Querystring: { namespace?: string } }>,
    reply: FastifyReply,
  ) {
    const { namespace } = request.query;
    const userId = request.user?.id;
    const grouped = await request.server.settingsService.getGroupedSettings(
      namespace,
      userId,
    );

    return reply.send({
      success: true,
      data: grouped,
      message: 'Grouped settings retrieved successfully',
    });
  },

  async getSettingByKey(
    request: FastifyRequest<{
      Params: { key: string };
      Querystring: { namespace?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { key } = request.params;
    const { namespace } = request.query;
    const userId = request.user?.id;

    const setting = await request.server.settingsService.getSettingByKey(
      key,
      namespace,
      userId,
    );

    if (!setting) {
      return reply.notFound('Setting not found');
    }

    return reply.send({
      success: true,
      data: setting,
      message: 'Setting retrieved successfully',
    });
  },

  async getSettingValue(
    request: FastifyRequest<{
      Params: { key: string };
      Querystring: { namespace?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { key } = request.params;
    const { namespace } = request.query;
    const userId = request.user?.id;

    const value = await request.server.settingsService.getSettingValue(
      key,
      namespace,
      userId,
    );

    if (value === null) {
      return reply.notFound('Setting not found');
    }

    return reply.send({
      success: true,
      data: { value },
      message: 'Setting value retrieved successfully',
    });
  },

  async getSettingById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const setting = await request.server.settingsService.getSettingById(id);

    if (!setting) {
      return reply.notFound('Setting not found');
    }

    return reply.send({
      success: true,
      data: setting,
      message: 'Setting retrieved successfully',
    });
  },

  async createSetting(
    request: FastifyRequest<{ Body: CreateSetting }>,
    reply: FastifyReply,
  ) {
    const setting = await request.server.settingsService.createSetting(
      request.body,
      request.user.id,
    );

    return reply.status(201).send({
      success: true,
      data: setting,
      message: 'Setting created successfully',
    });
  },

  async updateSetting(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSetting }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const setting = await request.server.settingsService.updateSetting(
      id,
      request.body,
      request.user.id,
    );

    return reply.send({
      success: true,
      data: setting,
      message: 'Setting updated successfully',
    });
  },

  async updateSettingValue(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateSettingValue;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { value } = request.body;
    const setting = await request.server.settingsService.updateSettingValue(
      id,
      value,
      request.user.id,
      request,
    );

    return reply.send({
      success: true,
      data: setting,
      message: 'Setting value updated successfully',
    });
  },

  async deleteSetting(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    await request.server.settingsService.deleteSetting(id, request.user.id);

    return reply.send({
      success: true,
      message: 'Setting deleted successfully',
    });
  },

  async bulkUpdateSettings(
    request: FastifyRequest<{
      Body: BulkUpdateSettings;
      Querystring: { namespace?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { namespace } = request.query;
    const result = await request.server.settingsService.bulkUpdateSettings(
      request.body,
      namespace,
      request.user.id,
    );

    return reply.send({
      success: true,
      data: result,
      message: 'Bulk update completed',
    });
  },

  async getSettingHistory(
    request: FastifyRequest<{ Querystring: GetSettingHistoryQuery }>,
    reply: FastifyReply,
  ) {
    const result = await request.server.settingsService.getSettingHistory(
      request.query,
    );

    return reply.send({
      success: true,
      data: result.history,
      message: 'Setting history retrieved successfully',
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  },

  async getUserSettings(request: FastifyRequest, reply: FastifyReply) {
    const settings = await request.server.settingsService.getUserSettings(
      request.user.id,
    );

    return reply.send({
      success: true,
      data: settings,
      message: 'User settings retrieved successfully',
    });
  },

  async updateUserSetting(
    request: FastifyRequest<{
      Params: { settingId: string };
      Body: UpdateUserSetting;
    }>,
    reply: FastifyReply,
  ) {
    const { settingId } = request.params;
    const { value } = request.body;

    const userSetting = await request.server.settingsService.updateUserSetting(
      request.user.id,
      settingId,
      value,
    );

    return reply.send({
      success: true,
      data: userSetting,
      message: 'User setting updated successfully',
    });
  },

  async deleteUserSetting(
    request: FastifyRequest<{ Params: { settingId: string } }>,
    reply: FastifyReply,
  ) {
    const { settingId } = request.params;

    await request.server.settingsService.deleteUserSetting(
      request.user.id,
      settingId,
    );

    return reply.send({
      success: true,
      message: 'User setting deleted successfully',
    });
  },
};
