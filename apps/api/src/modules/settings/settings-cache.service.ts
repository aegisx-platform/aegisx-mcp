import { FastifyInstance } from 'fastify';
import {
  SettingsCacheWarmer,
  PerformanceMonitor,
} from './settings.performance';
import { SettingsRepository } from './settings.repository';
import { Knex } from 'knex';

export class SettingsCacheService {
  private redis: any;
  private knex: Knex;
  private repository: SettingsRepository;
  private warmupInterval?: NodeJS.Timeout;

  constructor(
    private fastify: FastifyInstance,
    private logger = fastify.log,
  ) {
    this.redis = fastify.redis;
    this.knex = fastify.knex;
    this.repository = new SettingsRepository(this.knex);
  }

  /**
   * Start cache warming on a schedule
   */
  startCacheWarming(intervalMinutes = 30): void {
    // Initial warmup
    this.warmCache().catch((err) =>
      this.logger.error({ err }, 'Failed to warm cache on startup'),
    );

    // Schedule periodic warmup
    this.warmupInterval = setInterval(
      () => {
        this.warmCache().catch((err) =>
          this.logger.error({ err }, 'Failed to warm cache'),
        );
      },
      intervalMinutes * 60 * 1000,
    );
  }

  /**
   * Stop cache warming
   */
  stopCacheWarming(): void {
    if (this.warmupInterval) {
      clearInterval(this.warmupInterval);
      this.warmupInterval = undefined;
    }
  }

  /**
   * Warm the cache with frequently accessed data
   */
  private async warmCache(): Promise<void> {
    await PerformanceMonitor.trackQuery(
      'cache-warmup',
      async () => {
        // Warm frequently accessed settings
        await SettingsCacheWarmer.warmFrequentSettings(this.knex, this.redis);

        // Get active users from recent activity
        const activeUserIds = await this.getActiveUserIds();

        // Warm user settings for active users
        if (activeUserIds.length > 0) {
          await SettingsCacheWarmer.warmUserSettings(
            this.knex,
            this.redis,
            activeUserIds,
          );
        }
      },
      this.logger,
    );
  }

  /**
   * Get list of recently active user IDs
   */
  private async getActiveUserIds(): Promise<string[]> {
    // Get users who have accessed settings in the last hour
    const recentUsers = await this.knex('app_settings_history')
      .distinct('changed_by')
      .whereNotNull('changed_by')
      .where('changed_at', '>', new Date(Date.now() - 60 * 60 * 1000))
      .limit(100)
      .pluck('changed_by');

    return recentUsers as string[];
  }

  /**
   * Clear cache for a specific setting
   */
  async clearSettingCache(namespace: string, key: string): Promise<void> {
    const cacheKey = `settings:${namespace}:${key}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Clear cache for a user's settings
   */
  async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `settings:user:${userId}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Clear all settings cache
   */
  async clearAllCache(): Promise<void> {
    const keys = await this.redis.keys('settings:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
