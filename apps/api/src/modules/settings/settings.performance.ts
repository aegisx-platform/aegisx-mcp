/**
 * Settings API Performance Optimization
 *
 * This file contains performance improvements and optimizations
 * for the Settings API module.
 */

import { Knex } from 'knex';

/**
 * Additional indexes for optimizing Settings API queries
 * Run these in a migration for production deployment
 */
export const PERFORMANCE_INDEXES = {
  // Composite index for common filter combinations
  filteringIndex: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_filter_combo 
    ON app_settings(namespace, access_level, is_hidden, category)
    WHERE is_hidden = false;
  `,

  // Partial index for search operations
  searchIndex: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_search_text 
    ON app_settings USING gin(
      to_tsvector('english', coalesce(key, '') || ' ' || 
                            coalesce(label, '') || ' ' || 
                            coalesce(description, ''))
    );
  `,

  // Index for sorting performance
  sortingIndex: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_sort 
    ON app_settings(sort_order, created_at);
  `,

  // Index for user settings lookups
  userSettingsIndex: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_lookup 
    ON app_user_settings(user_id, setting_id) 
    INCLUDE (value);
  `,

  // Index for history queries
  historyTimeRangeIndex: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_history_time_range 
    ON app_settings_history(setting_id, changed_at DESC);
  `,
};

/**
 * Query optimization strategies
 */
export class SettingsQueryOptimizer {
  /**
   * Optimized query for finding settings with full-text search
   */
  static getOptimizedSearchQuery(knex: Knex) {
    return (qb: Knex.QueryBuilder, search: string) => {
      // Use PostgreSQL full-text search instead of ILIKE for better performance
      const searchVector = knex.raw(`
        to_tsvector('english', coalesce(key, '') || ' ' || 
                              coalesce(label, '') || ' ' || 
                              coalesce(description, ''))
      `);

      const searchQuery = knex.raw(`plainto_tsquery('english', ?)`, [search]);

      return qb.whereRaw(`${searchVector} @@ ${searchQuery}`);
    };
  }

  /**
   * Batch load settings to reduce N+1 queries
   */
  static async batchLoadSettings(
    knex: Knex,
    settingIds: string[],
  ): Promise<Map<string, any>> {
    if (settingIds.length === 0) return new Map();

    const settings = await knex('app_settings')
      .whereIn('id', settingIds)
      .select('id', 'key', 'value', 'namespace');

    return new Map(settings.map((s) => [s.id, s]));
  }

  /**
   * Optimized grouped settings query with single pass
   */
  static async getGroupedSettingsOptimized(
    knex: Knex,
    namespace = 'default',
  ): Promise<Record<string, Record<string, any[]>>> {
    const settings = await knex('app_settings')
      .where('namespace', namespace)
      .where('is_hidden', false)
      .orderBy('category')
      .orderBy('group')
      .orderBy('sort_order')
      .select(
        'id',
        'key',
        'value',
        'label',
        'description',
        'category',
        'group',
        'data_type',
        'access_level',
      );

    // Group in memory to avoid multiple queries
    return settings.reduce(
      (acc, setting) => {
        const category = setting.category || 'uncategorized';
        const group = setting.group || 'default';

        if (!acc[category]) acc[category] = {};
        if (!acc[category][group]) acc[category][group] = [];

        acc[category][group].push(setting);
        return acc;
      },
      {} as Record<string, Record<string, any[]>>,
    );
  }

  /**
   * Use EXPLAIN ANALYZE to check query performance
   */
  static async analyzeQuery(
    knex: Knex,
    query: Knex.QueryBuilder,
  ): Promise<any> {
    const sql = query.toSQL();
    const result = await knex.raw(
      `EXPLAIN (ANALYZE, BUFFERS) ${sql.sql}`,
      sql.bindings,
    );
    return result.rows;
  }
}

/**
 * Cache warming strategies for Redis
 */
export class SettingsCacheWarmer {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly CACHE_PREFIX = 'settings:';

  /**
   * Warm cache with frequently accessed settings
   */
  static async warmFrequentSettings(knex: Knex, redis: any): Promise<void> {
    // Get frequently accessed settings (public and user level)
    const frequentSettings = await knex('app_settings')
      .whereIn('access_level', ['public', 'user'])
      .where('is_hidden', false)
      .select('id', 'key', 'namespace', 'value');

    // Batch set in Redis with pipeline
    const pipeline = redis.pipeline();

    for (const setting of frequentSettings) {
      const cacheKey = `${this.CACHE_PREFIX}${setting.namespace}:${setting.key}`;
      pipeline.setex(cacheKey, this.CACHE_TTL, JSON.stringify(setting));
    }

    await pipeline.exec();
  }

  /**
   * Pre-cache user settings for active users
   */
  static async warmUserSettings(
    knex: Knex,
    redis: any,
    activeUserIds: string[],
  ): Promise<void> {
    if (activeUserIds.length === 0) return;

    // Get user settings with their base settings
    const userSettings = await knex('app_user_settings as us')
      .join('app_settings as s', 'us.setting_id', 's.id')
      .whereIn('us.user_id', activeUserIds)
      .select(
        'us.user_id',
        'us.setting_id',
        'us.value as user_value',
        's.key',
        's.namespace',
      );

    // Group by user
    const settingsByUser = userSettings.reduce(
      (acc, setting) => {
        if (!acc[setting.user_id]) acc[setting.user_id] = [];
        acc[setting.user_id].push(setting);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    // Cache per user
    const pipeline = redis.pipeline();

    for (const [userId, settings] of Object.entries(settingsByUser)) {
      const cacheKey = `${this.CACHE_PREFIX}user:${userId}`;
      pipeline.setex(cacheKey, this.CACHE_TTL, JSON.stringify(settings));
    }

    await pipeline.exec();
  }
}

/**
 * Connection pool optimization for Settings queries
 */
export const POOL_CONFIG = {
  // Dedicated pool for read-heavy operations
  readPool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    reapIntervalMillis: 1000,
  },

  // Smaller pool for write operations
  writePool: {
    min: 1,
    max: 5,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    reapIntervalMillis: 1000,
  },
};

/**
 * Query performance monitoring
 */
export class PerformanceMonitor {
  private static slowQueryThreshold = 100; // ms

  static async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    logger?: any,
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - start;

      if (duration > this.slowQueryThreshold && logger) {
        logger.warn({
          message: 'Slow query detected',
          query: queryName,
          duration,
          threshold: this.slowQueryThreshold,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      if (logger) {
        logger.error({
          message: 'Query failed',
          query: queryName,
          duration,
          error,
        });
      }

      throw error;
    }
  }
}
