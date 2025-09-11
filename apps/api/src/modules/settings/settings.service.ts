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
  type BulkUpdateSettings,
} from './settings.schemas';
import { FastifyRequest, FastifyInstance } from 'fastify';
import { SettingsRepository } from './settings.repository';
import { PerformanceMonitor } from './settings.performance';
import { RedisCacheService } from '../../services/redis-cache.service';

export class SettingsService {
  private static CACHE_PREFIX = 'settings:';
  private static CACHE_TTL = 3600; // 1 hour
  private repository: SettingsRepository;
  private logger: any;
  private cache?: RedisCacheService;

  constructor(
    private db: Knex,
    private redis?: Redis,
    logger?: any,
    fastify?: FastifyInstance,
  ) {
    this.repository = new SettingsRepository(db);
    this.logger = logger || console;

    // Initialize cache service if fastify instance is provided
    if (fastify && redis) {
      this.cache = new RedisCacheService(fastify, 'settings');
    }
  }

  /**
   * Get all settings with filtering and pagination
   */
  async getSettings(
    query: GetSettingsQuery,
    userId?: string,
  ): Promise<{
    settings: Setting[];
    total: number;
    page: number;
    limit: number;
  }> {
    return PerformanceMonitor.trackQuery(
      'getSettings',
      async () => {
        const { page = 1, limit = 20 } = query;

        // Get settings from repository
        const { settings, total } = await this.repository.findSettings(query);

        // Transform database fields to camelCase
        const transformedSettings = settings.map((s) =>
          this.repository.transformSetting(s),
        );

        // If user ID provided, merge user overrides
        if (userId) {
          const userSettings = await this.getUserSettings(userId);
          const userSettingsMap = new Map(
            userSettings.map((us) => [us.settingId, us.value]),
          );

          transformedSettings.forEach((setting) => {
            if (userSettingsMap.has(setting.id)) {
              setting.value = userSettingsMap.get(setting.id);
            }
          });
        }

        return {
          settings: transformedSettings,
          total,
          page,
          limit,
        };
      },
      this.logger,
    );
  }

  /**
   * Get settings grouped by category and group
   */
  async getGroupedSettings(
    namespace = 'default',
    userId?: string,
  ): Promise<GroupedSettings[]> {
    return PerformanceMonitor.trackQuery(
      'getGroupedSettings',
      async () => {
        const cacheKey = `grouped:${namespace}:${userId || 'public'}`;

        // Try enhanced cache first
        if (this.cache) {
          return this.cache.getOrSet(
            cacheKey,
            async () => {
              // Factory function to get data if not cached
              return this.computeGroupedSettings(namespace, userId);
            },
            {
              ttl: SettingsService.CACHE_TTL,
              tags: ['settings', `namespace:${namespace}`],
              compress: true,
            },
          );
        }

        // Fallback to direct computation if no cache
        return this.computeGroupedSettings(namespace, userId);
      },
      this.logger,
    );
  }

  /**
   * Compute grouped settings (extracted for reuse)
   */
  private async computeGroupedSettings(
    namespace: string,
    userId?: string,
  ): Promise<GroupedSettings[]> {
    const settings = await this.repository.findGroupedSettings(namespace);

    // Transform and apply user overrides
    const transformedSettings = settings.map((s) =>
      this.repository.transformSetting(s),
    );

    if (userId) {
      const userSettings = await this.getUserSettings(userId);
      const userSettingsMap = new Map(
        userSettings.map((us) => [us.settingId, us.value]),
      );

      transformedSettings.forEach((setting) => {
        if (userSettingsMap.has(setting.id)) {
          setting.value = userSettingsMap.get(setting.id);
        }
      });
    }

    // Group by category and then by group
    const grouped = transformedSettings.reduce((acc, setting) => {
      const categoryGroup = acc.find((g) => g.category === setting.category);

      if (!categoryGroup) {
        acc.push({
          category: setting.category,
          groups: [
            {
              name: setting.group || 'default',
              settings: [setting],
            },
          ],
        });
      } else {
        const group = categoryGroup.groups.find(
          (g) => g.name === (setting.group || 'default'),
        );
        if (!group) {
          categoryGroup.groups.push({
            name: setting.group || 'default',
            settings: [setting],
          });
        } else {
          group.settings.push(setting);
        }
      }

      return acc;
    }, [] as GroupedSettings[]);

    return grouped;
  }

  /**
   * Get a single setting by key
   */
  async getSettingByKey(
    key: string,
    namespace = 'default',
    userId?: string,
  ): Promise<Setting | null> {
    const cacheKey = `${SettingsService.CACHE_PREFIX}${namespace}:${key}:${userId || 'public'}`;

    // Check cache
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const setting = await this.repository.findSettingByKey(key, namespace);

    if (!setting) {
      return null;
    }

    const transformedSetting = this.repository.transformSetting(setting);

    // Apply user override if user ID provided
    if (userId) {
      const userSetting = await this.repository.findUserSetting(
        userId,
        setting.id,
      );

      if (userSetting) {
        transformedSetting.value = userSetting.value;
      }
    }

    // Cache the result
    if (this.redis) {
      await this.redis.setex(
        cacheKey,
        SettingsService.CACHE_TTL,
        JSON.stringify(transformedSetting),
      );
    }

    return transformedSetting;
  }

  /**
   * Get a single setting by ID
   */
  async getSettingById(id: string): Promise<Setting | null> {
    const setting = await this.repository.findSettingById(id);
    return setting ? this.repository.transformSetting(setting) : null;
  }

  /**
   * Get setting value only
   */
  async getSettingValue(
    key: string,
    namespace = 'default',
    userId?: string,
  ): Promise<any> {
    const setting = await this.getSettingByKey(key, namespace, userId);
    return setting ? setting.value : null;
  }

  /**
   * Create a new setting
   */
  async createSetting(
    data: CreateSetting,
    createdBy?: string,
  ): Promise<Setting> {
    // Check if setting already exists
    const existing = await this.repository.settingExists(
      data.key,
      data.namespace || 'default',
    );

    if (existing) {
      const error = new Error(
        'Setting with this key already exists in the namespace',
      );
      (error as any).statusCode = 409;
      (error as any).code = 'SETTING_ALREADY_EXISTS';
      throw error;
    }

    const created = await this.repository.createSetting({
      ...data,
      created_by: createdBy,
    });

    // Clear cache
    await this.clearCache();

    return this.repository.transformSetting(created);
  }

  /**
   * Update a setting
   */
  async updateSetting(
    id: string,
    data: UpdateSetting,
    updatedBy?: string,
  ): Promise<Setting> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error('Setting not found');
    }

    if (existing.isReadonly && data.value !== undefined) {
      throw new Error('Cannot update value of readonly setting');
    }

    const updated = await this.repository.updateSetting(id, {
      ...data,
      updated_by: updatedBy,
    });

    if (!updated) {
      throw new Error('Failed to update setting');
    }

    // Log change to history
    if (data.value !== undefined && existing.value !== data.value) {
      await this.logSettingChange(
        id,
        existing.value,
        data.value,
        'update',
        updatedBy,
      );
    }

    // Clear cache
    await this.clearCache();

    return this.repository.transformSetting(updated);
  }

  /**
   * Update setting value only
   */
  async updateSettingValue(
    id: string,
    value: any,
    updatedBy?: string,
    request?: FastifyRequest,
  ): Promise<Setting> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error('Setting not found');
    }

    if (existing.isReadonly) {
      throw new Error('Cannot update readonly setting');
    }

    // Validate value against validation rules
    if (existing.validationRules) {
      this.validateSettingValue(
        value,
        existing.validationRules,
        existing.dataType,
      );
    }

    const updated = await this.repository.updateSettingValue(
      id,
      value,
      updatedBy,
    );

    if (!updated) {
      throw new Error('Failed to update setting value');
    }

    // Log change to history
    await this.logSettingChange(
      id,
      existing.value,
      value,
      'update',
      updatedBy,
      null,
      request,
    );

    // Clear cache
    await this.clearCache();

    return this.repository.transformSetting(updated);
  }

  /**
   * Delete a setting
   */
  async deleteSetting(id: string, deletedBy?: string): Promise<void> {
    const existing = await this.getSettingById(id);
    if (!existing) {
      throw new Error('Setting not found');
    }

    if (existing.isReadonly) {
      throw new Error('Cannot delete readonly setting');
    }

    // Log deletion to history
    await this.logSettingChange(id, existing.value, null, 'delete', deletedBy);

    await this.repository.deleteSetting(id);

    // Clear cache
    await this.clearCache();
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSetting[]> {
    const settings = await this.repository.findUserSettings(userId);
    return settings.map((s) => this.repository.transformUserSetting(s));
  }

  /**
   * Update user setting
   */
  async updateUserSetting(
    userId: string,
    settingId: string,
    value: any,
  ): Promise<UserSetting> {
    const setting = await this.getSettingById(settingId);
    if (!setting) {
      throw new Error('Setting not found');
    }

    // Validate value against setting rules
    if (setting.validationRules) {
      this.validateSettingValue(
        value,
        setting.validationRules,
        setting.dataType,
      );
    }

    // Upsert user setting
    const result = await this.repository.upsertUserSetting(
      userId,
      settingId,
      value,
    );

    // Clear cache
    await this.clearCache(setting.namespace, setting.key, userId);

    return this.repository.transformUserSetting(result);
  }

  /**
   * Delete user setting (revert to default)
   */
  async deleteUserSetting(userId: string, settingId: string): Promise<void> {
    const setting = await this.getSettingById(settingId);
    if (!setting) {
      throw new Error('Setting not found');
    }

    await this.repository.deleteUserSetting(userId, settingId);

    // Clear cache
    await this.clearCache(setting.namespace, setting.key, userId);
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(
    updates: BulkUpdateSettings,
    namespace = 'default',
    updatedBy?: string,
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
      errors: errors.length > 0 ? errors : undefined,
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
    const { page = 1, limit = 20 } = query;
    const { history, total } = await this.repository.findSettingHistory(query);

    return {
      history: history.map((h) => this.repository.transformSettingHistory(h)),
      total,
      page,
      limit,
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
          throw new Error('Value must be a string');
        }
        if (rules.minLength && value.length < rules.minLength) {
          throw new Error(
            `Value must be at least ${rules.minLength} characters`,
          );
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          throw new Error(
            `Value must be at most ${rules.maxLength} characters`,
          );
        }
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          throw new Error('Value does not match required pattern');
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          throw new Error('Value must be a number');
        }
        if (rules.min !== undefined && value < rules.min) {
          throw new Error(`Value must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          throw new Error(`Value must be at most ${rules.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error('Value must be a boolean');
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error('Value must be an array');
        }
        break;

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Value must be a valid email address');
        }
        break;
      }

      case 'url':
        try {
          new URL(value);
        } catch {
          throw new Error('Value must be a valid URL');
        }
        break;
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      throw new Error(`Value must be one of: ${rules.enum.join(', ')}`);
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
    request?: FastifyRequest,
  ): Promise<void> {
    await this.repository.createSettingHistory({
      setting_id: settingId,
      old_value: oldValue,
      new_value: newValue,
      action,
      reason,
      changed_by: changedBy,
      ip_address: request?.ip,
      user_agent: request?.headers['user-agent'],
    });
  }

  /**
   * Helper: Clear cache
   */
  private async clearCache(
    namespace?: string,
    key?: string,
    userId?: string,
  ): Promise<void> {
    // Use enhanced cache service if available
    if (this.cache) {
      if (namespace && key && userId) {
        // Clear specific user setting cache
        await this.cache.del(`${namespace}:${key}:${userId}`);
      } else if (namespace && key) {
        // Clear all caches for a specific setting
        await this.cache.delPattern(`${namespace}:${key}:*`);
      } else if (namespace) {
        // Clear all caches for a namespace
        await this.cache.invalidateByTags([`namespace:${namespace}`]);
      } else {
        // Clear all settings cache
        await this.cache.invalidateByTags(['settings']);
      }
      return;
    }

    // Fallback to direct Redis operations
    if (!this.redis) return;

    if (namespace && key && userId) {
      // Clear specific user setting cache
      await this.redis.del(
        `${SettingsService.CACHE_PREFIX}${namespace}:${key}:${userId}`,
      );
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
