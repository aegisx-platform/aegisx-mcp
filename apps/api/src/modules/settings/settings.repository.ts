import { Knex } from 'knex';
import {
  type Setting,
  type CreateSetting,
  type UpdateSetting,
  type UserSetting,
  type SettingHistory,
  type GetSettingsQuery,
  type GetSettingHistoryQuery,
} from './settings.schemas';

export interface DBSetting {
  id: string;
  key: string;
  namespace: string;
  category: string;
  value: any;
  default_value: any;
  label: string;
  description?: string;
  data_type: string;
  access_level: string;
  is_encrypted: boolean;
  is_readonly: boolean;
  is_hidden: boolean;
  validation_rules?: any;
  ui_schema?: any;
  sort_order: number;
  group?: string;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DBUserSetting {
  id: string;
  user_id: string;
  setting_id: string;
  value: any;
  created_at: Date;
  updated_at: Date;
}

export interface DBSettingHistory {
  id: string;
  setting_id: string;
  old_value?: any;
  new_value: any;
  action: string;
  reason?: string;
  changed_by?: string;
  changed_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export class SettingsRepository {
  constructor(private knex: Knex) {}

  /**
   * Get all settings with filtering and pagination
   */
  async findSettings(
    query: GetSettingsQuery,
  ): Promise<{ settings: DBSetting[]; total: number }> {
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
      sortOrder = 'asc',
    } = query;

    let qb = this.knex('app_settings').where('namespace', namespace);

    // Apply filters
    if (category) qb = qb.where('category', category);
    if (group) qb = qb.where('group', group);
    if (accessLevel) qb = qb.where('access_level', accessLevel);
    if (!includeHidden) qb = qb.where('is_hidden', false);

    if (search) {
      qb = qb.where(function () {
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

    return { settings, total };
  }

  /**
   * Find settings grouped by category and group
   */
  async findGroupedSettings(namespace = 'default'): Promise<DBSetting[]> {
    return this.knex('app_settings')
      .where('namespace', namespace)
      .where('is_hidden', false)
      .orderBy('category')
      .orderBy('group')
      .orderBy('sort_order');
  }

  /**
   * Find setting by key and namespace
   */
  async findSettingByKey(
    key: string,
    namespace = 'default',
  ): Promise<DBSetting | null> {
    const setting = await this.knex('app_settings')
      .where('key', key)
      .where('namespace', namespace)
      .first();

    return setting || null;
  }

  /**
   * Find setting by ID
   */
  async findSettingById(id: string): Promise<DBSetting | null> {
    const setting = await this.knex('app_settings').where('id', id).first();
    return setting || null;
  }

  /**
   * Create new setting
   */
  async createSetting(
    data: CreateSetting & { created_by?: string },
  ): Promise<DBSetting> {
    const [created] = await this.knex('app_settings')
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
        validation_rules: data.validationRules
          ? JSON.stringify(data.validationRules)
          : null,
        ui_schema: data.uiSchema ? JSON.stringify(data.uiSchema) : null,
        sort_order: data.sortOrder || 0,
        group: data.group,
        created_by: data.created_by,
        updated_by: data.created_by,
      })
      .returning('*');

    return created;
  }

  /**
   * Update setting
   */
  async updateSetting(
    id: string,
    data: UpdateSetting & { updated_by?: string },
  ): Promise<DBSetting | null> {
    const updateData: any = {
      updated_at: new Date(),
      updated_by: data.updated_by,
    };

    // Only include fields that are present in the update
    if ('key' in data) updateData.key = data.key;
    if ('category' in data) updateData.category = data.category;
    if ('value' in data) updateData.value = JSON.stringify(data.value);
    if ('defaultValue' in data)
      updateData.default_value = JSON.stringify(data.defaultValue);
    if ('label' in data) updateData.label = data.label;
    if ('description' in data) updateData.description = data.description;
    if ('dataType' in data) updateData.data_type = data.dataType;
    if ('accessLevel' in data) updateData.access_level = data.accessLevel;
    if ('isEncrypted' in data) updateData.is_encrypted = data.isEncrypted;
    if ('isReadonly' in data) updateData.is_readonly = data.isReadonly;
    if ('isHidden' in data) updateData.is_hidden = data.isHidden;
    if ('validationRules' in data) {
      updateData.validation_rules = data.validationRules
        ? JSON.stringify(data.validationRules)
        : null;
    }
    if ('uiSchema' in data) {
      updateData.ui_schema = data.uiSchema
        ? JSON.stringify(data.uiSchema)
        : null;
    }
    if ('sortOrder' in data) updateData.sort_order = data.sortOrder;
    if ('group' in data) updateData.group = data.group;

    const [updated] = await this.knex('app_settings')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated || null;
  }

  /**
   * Update setting value only
   */
  async updateSettingValue(
    id: string,
    value: any,
    updatedBy?: string,
  ): Promise<DBSetting | null> {
    const [updated] = await this.knex('app_settings')
      .where('id', id)
      .update({
        value: JSON.stringify(value),
        updated_at: new Date(),
        updated_by: updatedBy,
      })
      .returning('*');

    return updated || null;
  }

  /**
   * Delete setting
   */
  async deleteSetting(id: string): Promise<void> {
    await this.knex('app_settings').where('id', id).delete();
  }

  /**
   * Check if setting exists by key and namespace
   */
  async settingExists(key: string, namespace = 'default'): Promise<boolean> {
    const result = await this.knex('app_settings')
      .where('key', key)
      .where('namespace', namespace)
      .first();

    return !!result;
  }

  /**
   * Get user settings
   */
  async findUserSettings(userId: string): Promise<DBUserSetting[]> {
    return this.knex('app_user_settings').where('user_id', userId);
  }

  /**
   * Get user setting for specific setting
   */
  async findUserSetting(
    userId: string,
    settingId: string,
  ): Promise<DBUserSetting | null> {
    const setting = await this.knex('app_user_settings')
      .where('user_id', userId)
      .where('setting_id', settingId)
      .first();

    return setting || null;
  }

  /**
   * Create or update user setting
   */
  async upsertUserSetting(
    userId: string,
    settingId: string,
    value: any,
  ): Promise<DBUserSetting> {
    const existing = await this.findUserSetting(userId, settingId);

    if (existing) {
      const [updated] = await this.knex('app_user_settings')
        .where('id', existing.id)
        .update({
          value: JSON.stringify(value),
          updated_at: new Date(),
        })
        .returning('*');
      return updated;
    } else {
      const [created] = await this.knex('app_user_settings')
        .insert({
          user_id: userId,
          setting_id: settingId,
          value: JSON.stringify(value),
        })
        .returning('*');
      return created;
    }
  }

  /**
   * Delete user setting
   */
  async deleteUserSetting(userId: string, settingId: string): Promise<void> {
    await this.knex('app_user_settings')
      .where('user_id', userId)
      .where('setting_id', settingId)
      .delete();
  }

  /**
   * Get setting history
   */
  async findSettingHistory(
    query: GetSettingHistoryQuery,
  ): Promise<{ history: DBSettingHistory[]; total: number }> {
    const {
      settingId,
      action,
      changedBy,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    let qb = this.knex('app_settings_history');

    // Apply filters
    if (settingId) qb = qb.where('setting_id', settingId);
    if (action) qb = qb.where('action', action);
    if (changedBy) qb = qb.where('changed_by', changedBy);
    if (startDate) qb = qb.where('changed_at', '>=', startDate);
    if (endDate) qb = qb.where('changed_at', '<=', endDate);

    // Get total count
    const [{ count }] = await qb.clone().count('* as count');
    const total = parseInt(count as string, 10);

    // Apply pagination and sorting
    const offset = (page - 1) * limit;
    const history = await qb
      .orderBy('changed_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { history, total };
  }

  /**
   * Create setting history entry
   */
  async createSettingHistory(data: {
    setting_id: string;
    old_value?: any;
    new_value: any;
    action: string;
    reason?: string;
    changed_by?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<DBSettingHistory> {
    const [created] = await this.knex('app_settings_history')
      .insert({
        setting_id: data.setting_id,
        old_value: data.old_value ? JSON.stringify(data.old_value) : null,
        new_value: JSON.stringify(data.new_value),
        action: data.action,
        reason: data.reason,
        changed_by: data.changed_by,
        changed_at: new Date(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      })
      .returning('*');

    return created;
  }

  /**
   * Transform database setting to camelCase
   */
  transformSetting(dbSetting: DBSetting): Setting {
    return {
      id: dbSetting.id,
      key: dbSetting.key,
      namespace: dbSetting.namespace,
      category: dbSetting.category,
      value: this.parseJsonValue(dbSetting.value),
      defaultValue: this.parseJsonValue(dbSetting.default_value),
      label: dbSetting.label,
      description: dbSetting.description,
      dataType: dbSetting.data_type as any,
      accessLevel: dbSetting.access_level as any,
      isEncrypted: dbSetting.is_encrypted,
      isReadonly: dbSetting.is_readonly,
      isHidden: dbSetting.is_hidden,
      validationRules: this.parseJsonValue(dbSetting.validation_rules),
      uiSchema: this.parseJsonValue(dbSetting.ui_schema),
      sortOrder: dbSetting.sort_order,
      group: dbSetting.group,
      createdBy: dbSetting.created_by,
      updatedBy: dbSetting.updated_by,
      createdAt: dbSetting.created_at.toISOString(),
      updatedAt: dbSetting.updated_at.toISOString(),
    };
  }

  /**
   * Transform database user setting to camelCase
   */
  transformUserSetting(dbSetting: DBUserSetting): UserSetting {
    return {
      id: dbSetting.id,
      userId: dbSetting.user_id,
      settingId: dbSetting.setting_id,
      value: this.parseJsonValue(dbSetting.value),
      createdAt: dbSetting.created_at.toISOString(),
      updatedAt: dbSetting.updated_at.toISOString(),
    };
  }

  /**
   * Transform database setting history to camelCase
   */
  transformSettingHistory(dbHistory: DBSettingHistory): SettingHistory {
    return {
      id: dbHistory.id,
      settingId: dbHistory.setting_id,
      oldValue: this.parseJsonValue(dbHistory.old_value),
      newValue: this.parseJsonValue(dbHistory.new_value),
      action: dbHistory.action,
      reason: dbHistory.reason,
      changedBy: dbHistory.changed_by,
      changedAt: dbHistory.changed_at.toISOString(),
      ipAddress: dbHistory.ip_address,
      userAgent: dbHistory.user_agent,
    };
  }

  /**
   * Parse JSON value safely
   */
  private parseJsonValue(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
}
