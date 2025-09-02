import { Knex } from 'knex';
import { Redis } from 'ioredis';
import {
  type Setting,
  type CreateSetting,
  type UpdateSetting,
  type UpdateSettingValue,
  type UserSetting,
  type UpdateUserSetting,
  type SettingHistory,
  type GetSettingsQuery,
  type GetSettingHistoryQuery,
  type GroupedSettings,
  type BulkUpdateSettings
} from './settings.schemas';
import { FastifyRequest } from 'fastify';

export class SettingsService {
  private static CACHE_PREFIX = 'settings:';
  private static CACHE_TTL = 3600; // 1 hour

  constructor(
    private db: Knex,
    private redis?: Redis
  ) {}

  /**
   * Get all settings with filtering and pagination
   */
  async getSettings(query: GetSettingsQuery, userId?: string): Promise<{
    settings: Setting[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      namespace = 'default',
      category,
      group,
      accessLevel,
      includeHidden = false,
      search,
      page = 1,
      limit = 20,
      sortBy = 'sort_order',
      sortOrder = 'asc'
    } = query;

    let qb = this.db('app_settings').where('namespace', namespace);

    // Apply filters
    if (category) qb = qb.where('category', category);
    if (group) qb = qb.where('group', group);
    if (accessLevel) qb = qb.where('access_level', accessLevel);
    if (!includeHidden) qb = qb.where('is_hidden', false);

    if (search) {
      qb = qb.where(function() {
        this.where('key', 'ilike', `%${search}%`)
          .orWhere('label', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    // Get total count
    const [{ count }] = await qb.clone().count('* as count');
    const total = parseInt(count as string, 10);

    // Apply pagination and sorting
    const offset = (page - 1) * limit;
    const settings = await qb
      .orderBy(sortBy, sortOrder as 'asc' | 'desc')
      .limit(limit)
      .offset(offset);

    // Transform database fields to camelCase
    const transformedSettings = settings.map(s => this.transformSetting(s));

    // If user ID provided, merge user overrides
    if (userId) {
      const userSettings = await this.getUserSettings(userId);
      const userSettingsMap = new Map(
        userSettings.map(us => [us.settingId, us.value])
      );

      transformedSettings.forEach(setting => {
        if (userSettingsMap.has(setting.id)) {
          setting.value = userSettingsMap.get(setting.id);
        }
      });
    }

    return {
      settings: transformedSettings,
      total,
      page,
      limit
    };
  }

  /**
   * Get settings grouped by category and group
   */
  async getGroupedSettings(
    namespace: string = 'default',
    userId?: string
  ): Promise<GroupedSettings[]> {
    const cacheKey = `${SettingsService.CACHE_PREFIX}grouped:${namespace}:${userId || 'public'}`;
    
    // Check cache
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const settings = await this.db('app_settings')
      .where('namespace', namespace)
      .where('is_hidden', false)
      .orderBy('category', 'asc')
      .orderBy('sort_order', 'asc');

    // Transform and apply user overrides
    let transformedSettings = settings.map(s => this.transformSetting(s));

    if (userId) {
      const userSettings = await this.getUserSettings(userId);
      const userSettingsMap = new Map(
        userSettings.map(us => [us.settingId, us.value])
      );

      transformedSettings.forEach(setting => {
        if (userSettingsMap.has(setting.id)) {
          setting.value = userSettingsMap.get(setting.id);
        }
      });
    }

    // Group by category and then by group
    const grouped = transformedSettings.reduce((acc, setting) => {
      const categoryGroup = acc.find(g => g.category === setting.category);
      
      if (!categoryGroup) {
        acc.push({
          category: setting.category,
          groups: [{
            name: setting.group || 'default',
            settings: [setting]
          }]
        });
      } else {
        const group = categoryGroup.groups.find(g => g.name === (setting.group || 'default'));
        if (!group) {
          categoryGroup.groups.push({
            name: setting.group || 'default',
            settings: [setting]
          });
        } else {
          group.settings.push(setting);
        }
      }
      
      return acc;
    }, [] as GroupedSettings[]);

    // Cache the result
    if (this.redis) {
      await this.redis.setex(cacheKey, SettingsService.CACHE_TTL, JSON.stringify(grouped));
    }

    return grouped;
  }

  /**
   * Get a single setting by key
   */
  async getSettingByKey(
    key: string,
    namespace: string = 'default',
    userId?: string
  ): Promise<Setting | null> {
    const cacheKey = `${SettingsService.CACHE_PREFIX}${namespace}:${key}:${userId || 'public'}`;
    
    // Check cache
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const setting = await this.db('app_settings')
      .where('key', key)
      .where('namespace', namespace)
      .first();

    if (!setting) {
      return null;
    }

    let transformedSetting = this.transformSetting(setting);

    // Apply user override if user ID provided
    if (userId) {
      const userSetting = await this.db('app_user_settings')
        .where('user_id', userId)
        .where('setting_id', setting.id)
        .first();

      if (userSetting) {
        transformedSetting.value = userSetting.value;
      }
    }

    // Cache the result
    if (this.redis) {
      await this.redis.setex(cacheKey, SettingsService.CACHE_TTL, JSON.stringify(transformedSetting));
    }

    return transformedSetting;
  }

  /**
   * Get a single setting by ID
   */
  async getSettingById(id: string): Promise<Setting | null> {
    const setting = await this.db('app_settings').where('id', id).first();
    return setting ? this.transformSetting(setting) : null;
  }

  /**
   * Get setting value only
   */
  async getSettingValue(
    key: string,
    namespace: string = 'default',
    userId?: string
  ): Promise<any> {
    const setting = await this.getSettingByKey(key, namespace, userId);
    return setting ? setting.value : null;
  }

  /**
   * Create a new setting
   */
  async createSetting(data: CreateSetting, createdBy?: string): Promise<Setting> {
    // Check if setting already exists
    const existing = await this.db('app_settings')
      .where('key', data.key)
      .where('namespace', data.namespace || 'default')
      .first();

    if (existing) {
      throw new Error( 'Setting with this key already exists in the namespace');
    }

    const [created] = await this.db('app_settings')
      .insert({
        key: data.key,
        namespace: data.namespace || 'default',
        category: data.category,
        value: JSON.stringify(data.value),
        default_value: JSON.stringify(data.defaultValue),
        label: data.label,
        description: data.description,
        data_type: data.dataType,
        access_level: data.accessLevel || 'admin',
        is_encrypted: data.isEncrypted || false,
        is_readonly: data.isReadonly || false,
        is_hidden: data.isHidden || false,
        validation_rules: data.validationRules ? JSON.stringify(data.validationRules) : null,
        ui_schema: data.uiSchema ? JSON.stringify(data.uiSchema) : null,
        sort_order: data.sortOrder || 0,
        group: data.group,
        created_by: createdBy
      })
      .returning('*');

    // Clear cache
    await this.clearCache();

    return this.transformSetting(created);
  }

  /**
   * Update a setting
   */
  async updateSetting(
    id: string,
    data: UpdateSetting,
    updatedBy?: string
  ): Promise<Setting> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error( 'Setting not found');
    }

    if (existing.isReadonly && data.value !== undefined) {
      throw new Error( 'Cannot update value of readonly setting');
    }

    const updateData: any = {
      updated_by: updatedBy,
      updated_at: new Date()
    };

    // Map fields to database columns
    if (data.key !== undefined) updateData.key = data.key;
    if (data.namespace !== undefined) updateData.namespace = data.namespace;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.value !== undefined) updateData.value = JSON.stringify(data.value);
    if (data.defaultValue !== undefined) updateData.default_value = JSON.stringify(data.defaultValue);
    if (data.label !== undefined) updateData.label = data.label;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dataType !== undefined) updateData.data_type = data.dataType;
    if (data.accessLevel !== undefined) updateData.access_level = data.accessLevel;
    if (data.isEncrypted !== undefined) updateData.is_encrypted = data.isEncrypted;
    if (data.isReadonly !== undefined) updateData.is_readonly = data.isReadonly;
    if (data.isHidden !== undefined) updateData.is_hidden = data.isHidden;
    if (data.validationRules !== undefined) updateData.validation_rules = JSON.stringify(data.validationRules);
    if (data.uiSchema !== undefined) updateData.ui_schema = JSON.stringify(data.uiSchema);
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    if (data.group !== undefined) updateData.group = data.group;

    const [updated] = await this.db('app_settings')
      .where('id', id)
      .update(updateData)
      .returning('*');

    // Log change to history
    if (data.value !== undefined && existing.value !== data.value) {
      await this.logSettingChange(
        id,
        existing.value,
        data.value,
        'update',
        updatedBy
      );
    }

    // Clear cache
    await this.clearCache();

    return this.transformSetting(updated);
  }

  /**
   * Update setting value only
   */
  async updateSettingValue(
    id: string,
    value: any,
    updatedBy?: string,
    request?: FastifyRequest
  ): Promise<Setting> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error( 'Setting not found');
    }

    if (existing.isReadonly) {
      throw new Error( 'Cannot update readonly setting');
    }

    // Validate value against validation rules
    if (existing.validationRules) {
      this.validateSettingValue(value, existing.validationRules, existing.dataType);
    }

    const [updated] = await this.db('app_settings')
      .where('id', id)
      .update({
        value: JSON.stringify(value),
        updated_by: updatedBy,
        updated_at: new Date()
      })
      .returning('*');

    // Log change to history
    await this.logSettingChange(
      id,
      existing.value,
      value,
      'update',
      updatedBy,
      null,
      request
    );

    // Clear cache
    await this.clearCache();

    return this.transformSetting(updated);
  }

  /**
   * Delete a setting
   */
  async deleteSetting(id: string, deletedBy?: string): Promise<void> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error( 'Setting not found');
    }

    if (existing.isReadonly) {
      throw new Error( 'Cannot delete readonly setting');
    }

    // Log deletion to history
    await this.logSettingChange(
      id,
      existing.value,
      null,
      'delete',
      deletedBy
    );

    await this.db('app_settings').where('id', id).delete();

    // Clear cache
    await this.clearCache();
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSetting[]> {
    const settings = await this.db('app_user_settings')
      .where('user_id', userId);

    return settings.map(s => ({
      id: s.id,
      userId: s.user_id,
      settingId: s.setting_id,
      value: s.value,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
  }

  /**
   * Update user setting
   */
  async updateUserSetting(
    userId: string,
    settingId: string,
    value: any
  ): Promise<UserSetting> {
    const setting = await this.getSettingById(settingId);
    if (!setting) {
      throw new Error( 'Setting not found');
    }

    // Validate value against setting rules
    if (setting.validationRules) {
      this.validateSettingValue(value, setting.validationRules, setting.dataType);
    }

    // Check if user setting exists
    const existing = await this.db('app_user_settings')
      .where('user_id', userId)
      .where('setting_id', settingId)
      .first();

    let result;
    if (existing) {
      [result] = await this.db('app_user_settings')
        .where('user_id', userId)
        .where('setting_id', settingId)
        .update({
          value: JSON.stringify(value),
          updated_at: new Date()
        })
        .returning('*');
    } else {
      [result] = await this.db('app_user_settings')
        .insert({
          user_id: userId,
          setting_id: settingId,
          value: JSON.stringify(value)
        })
        .returning('*');
    }

    // Clear cache
    await this.clearCache(setting.namespace, setting.key, userId);

    return {
      id: result.id,
      userId: result.user_id,
      settingId: result.setting_id,
      value: result.value,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  }

  /**
   * Delete user setting (revert to default)
   */
  async deleteUserSetting(userId: string, settingId: string): Promise<void> {
    const setting = await this.getSettingById(settingId);
    if (!setting) {
      throw new Error( 'Setting not found');
    }

    await this.db('app_user_settings')
      .where('user_id', userId)
      .where('setting_id', settingId)
      .delete();

    // Clear cache
    await this.clearCache(setting.namespace, setting.key, userId);
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(
    updates: BulkUpdateSettings,
    namespace: string = 'default',
    updatedBy?: string
  ): Promise<{
    updated: number;
    failed: number;
    errors?: Array<{ key: string; error: string }>;
  }> {
    let updated = 0;
    let failed = 0;
    const errors: Array<{ key: string; error: string }> = [];

    for (const update of updates) {
      try {
        const setting = await this.getSettingByKey(update.key, namespace);
        if (!setting) {
          failed++;
          errors.push({ key: update.key, error: 'Setting not found' });
          continue;
        }

        await this.updateSettingValue(setting.id, update.value, updatedBy);
        updated++;
      } catch (error: any) {
        failed++;
        errors.push({ key: update.key, error: error.message });
      }
    }

    // Clear cache
    await this.clearCache();

    return {
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get setting history
   */
  async getSettingHistory(query: GetSettingHistoryQuery): Promise<{
    history: SettingHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      settingId,
      action,
      changedBy,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = query;

    let qb = this.db('app_settings_history');

    if (settingId) qb = qb.where('setting_id', settingId);
    if (action) qb = qb.where('action', action);
    if (changedBy) qb = qb.where('changed_by', changedBy);
    if (startDate) qb = qb.where('changed_at', '>=', startDate);
    if (endDate) qb = qb.where('changed_at', '<=', endDate);

    const [{ count }] = await qb.clone().count('* as count');
    const total = parseInt(count as string, 10);

    const offset = (page - 1) * limit;
    const history = await qb
      .orderBy('changed_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      history: history.map(h => ({
        id: h.id,
        settingId: h.setting_id,
        oldValue: h.old_value,
        newValue: h.new_value,
        action: h.action,
        reason: h.reason,
        changedBy: h.changed_by,
        changedAt: h.changed_at,
        ipAddress: h.ip_address,
        userAgent: h.user_agent
      })),
      total,
      page,
      limit
    };
  }

  /**
   * Helper: Transform database record to Setting type
   */
  private transformSetting(record: any): Setting {
    return {
      id: record.id,
      key: record.key,
      namespace: record.namespace,
      category: record.category,
      value: record.value,
      defaultValue: record.default_value,
      label: record.label,
      description: record.description,
      dataType: record.data_type,
      accessLevel: record.access_level,
      isEncrypted: record.is_encrypted,
      isReadonly: record.is_readonly,
      isHidden: record.is_hidden,
      validationRules: record.validation_rules,
      uiSchema: record.ui_schema,
      sortOrder: record.sort_order,
      group: record.group,
      createdBy: record.created_by,
      updatedBy: record.updated_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  /**
   * Helper: Validate setting value
   */
  private validateSettingValue(value: any, rules: any, dataType: string): void {
    // Type validation
    switch (dataType) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error( 'Value must be a string');
        }
        if (rules.minLength && value.length < rules.minLength) {
          throw new Error( `Value must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          throw new Error( `Value must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          throw new Error( 'Value does not match required pattern');
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          throw new Error( 'Value must be a number');
        }
        if (rules.min !== undefined && value < rules.min) {
          throw new Error( `Value must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          throw new Error( `Value must be at most ${rules.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error( 'Value must be a boolean');
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error( 'Value must be an array');
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error( 'Value must be a valid email address');
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          throw new Error( 'Value must be a valid URL');
        }
        break;
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      throw new Error( `Value must be one of: ${rules.enum.join(', ')}`);
    }
  }

  /**
   * Helper: Log setting change to history
   */
  private async logSettingChange(
    settingId: string,
    oldValue: any,
    newValue: any,
    action: string,
    changedBy?: string,
    reason?: string,
    request?: FastifyRequest
  ): Promise<void> {
    await this.db('app_settings_history').insert({
      setting_id: settingId,
      old_value: oldValue !== undefined ? JSON.stringify(oldValue) : null,
      new_value: newValue !== undefined ? JSON.stringify(newValue) : null,
      action,
      reason,
      changed_by: changedBy,
      ip_address: request?.ip,
      user_agent: request?.headers['user-agent']
    });
  }

  /**
   * Helper: Clear cache
   */
  private async clearCache(namespace?: string, key?: string, userId?: string): Promise<void> {
    if (!this.redis) return;

    if (namespace && key && userId) {
      // Clear specific user setting cache
      await this.redis.del(`${SettingsService.CACHE_PREFIX}${namespace}:${key}:${userId}`);
    } else if (namespace && key) {
      // Clear all caches for a specific setting
      const pattern = `${SettingsService.CACHE_PREFIX}${namespace}:${key}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } else {
      // Clear all settings cache
      const pattern = `${SettingsService.CACHE_PREFIX}*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }
}