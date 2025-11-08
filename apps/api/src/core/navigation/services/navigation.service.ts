import { FastifyInstance } from 'fastify';
import { NavigationRepository } from '../navigation.repository';
import {
  NavigationItem,
  NavigationResponse,
  NavigationType,
  NavigationItemWithChildren,
  GetNavigationOptions,
  NavigationCacheKey,
} from '../navigation.types';

/**
 * NavigationService - Business logic for navigation system
 * Handles permission filtering, caching, and data transformation
 */
export class NavigationService {
  private navigationRepository: NavigationRepository;
  private cacheEnabled: boolean;
  private cacheTTL: number;

  constructor(private readonly app: FastifyInstance) {
    this.navigationRepository = new NavigationRepository(app.knex);
    this.cacheEnabled = process.env.NAVIGATION_CACHE_ENABLED !== 'false';
    this.cacheTTL = parseInt(process.env.NAVIGATION_CACHE_TTL || '300', 10); // 5 minutes default
  }

  /**
   * Get complete navigation structure
   * @param options Navigation options
   * @returns Promise<NavigationResponse>
   */
  async getNavigation(
    options: GetNavigationOptions = {},
  ): Promise<NavigationResponse> {
    const { type, includeDisabled = false } = options;

    // Generate cache key
    const cacheType = (type || 'all') as NavigationType;
    const cacheKey: NavigationCacheKey = `navigation:${cacheType}:${includeDisabled}`;

    // Try to get from cache first
    if (this.cacheEnabled) {
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        this.app.log.debug(`Navigation cache hit: ${cacheKey}`);
        return cached;
      }
    }

    // Get navigation items from repository
    const items =
      await this.navigationRepository.getNavigationItems(includeDisabled);

    // Transform to API format
    const navigationResponse = this.buildNavigationResponse(items, type);

    // Cache the result
    if (this.cacheEnabled) {
      await this.setCachedData(cacheKey, navigationResponse);
      this.app.log.debug(`Navigation cached: ${cacheKey}`);
    }

    return navigationResponse;
  }

  /**
   * Get user-specific navigation filtered by permissions
   * @param userId User ID
   * @param options Navigation options
   * @returns Promise<NavigationResponse>
   */
  async getUserNavigation(
    userId: string,
    options: GetNavigationOptions = {},
  ): Promise<NavigationResponse> {
    const { type } = options;

    // Generate cache key for user-specific navigation
    const cacheType = (type || 'all') as NavigationType;
    const cacheKey: NavigationCacheKey = `navigation:user:${userId}:${cacheType}`;

    // Try to get from cache first
    if (this.cacheEnabled) {
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        this.app.log.debug(`User navigation cache hit: ${cacheKey}`);
        return cached;
      }
    }

    // Get user navigation items from repository
    const items = await this.navigationRepository.getUserNavigationItems(
      userId,
      type,
      false,
    );

    // Transform to API format
    const navigationResponse = this.buildNavigationResponse(items, type);

    // Cache the result with shorter TTL for user-specific data
    if (this.cacheEnabled) {
      await this.setCachedData(
        cacheKey,
        navigationResponse,
        Math.floor(this.cacheTTL / 2),
      );
      this.app.log.debug(`User navigation cached: ${cacheKey}`);
    }

    return navigationResponse;
  }

  /**
   * Invalidate navigation cache
   * @param userId Optional user ID to invalidate user-specific cache
   */
  async invalidateCache(userId?: string): Promise<void> {
    const patterns: string[] = [];

    if (userId) {
      // Invalidate user-specific cache
      patterns.push(`navigation:user:${userId}:*`);
    } else {
      // Invalidate all navigation cache
      patterns.push('navigation:*');
    }

    for (const pattern of patterns) {
      await this.deleteCachedData(pattern);
    }

    this.app.log.info(`Navigation cache invalidated: ${patterns.join(', ')}`);
  }

  /**
   * Get navigation item by key
   * @param key Navigation item key
   * @returns Promise<NavigationItem | null>
   */
  async getNavigationItemByKey(key: string): Promise<NavigationItem | null> {
    const item = await this.navigationRepository.getNavigationItemByKey(key);
    if (!item) {
      return null;
    }

    return this.transformNavigationItem(item);
  }

  /**
   * Build navigation response based on type
   * @param items Navigation items with children
   * @param type Optional navigation type
   * @returns NavigationResponse
   */
  private buildNavigationResponse(
    items: NavigationItemWithChildren[],
    type?: NavigationType,
  ): NavigationResponse {
    const response: NavigationResponse = {};

    if (type) {
      // Return only requested type
      const filteredItems = this.navigationRepository.filterByType(items, type);
      response[type] = filteredItems.map((item) =>
        this.transformNavigationItem(item),
      );
    } else {
      // Return all navigation types
      const types: NavigationType[] = [
        'default',
        'compact',
        'horizontal',
        'mobile',
      ];

      for (const navType of types) {
        const filteredItems = this.navigationRepository.filterByType(
          items,
          navType,
        );
        response[navType] = filteredItems.map((item) =>
          this.transformNavigationItem(item),
        );
      }
    }

    return response;
  }

  /**
   * Transform database entity to API format
   * @param item Navigation item entity with children
   * @returns NavigationItem
   */
  private transformNavigationItem(
    item: NavigationItemWithChildren,
  ): NavigationItem {
    const transformed: NavigationItem = {
      id: item.key, // Use key as public ID
      title: item.title,
      type: item.type,
      disabled: item.disabled,
      hidden: item.hidden,
    };

    // Add optional fields
    if (item.icon) transformed.icon = item.icon;
    if (item.link) transformed.link = item.link;
    if (item.target && item.target !== '_self')
      transformed.target = item.target;
    if (item.exact_match !== undefined)
      transformed.exact_match = item.exact_match;

    // Add badge information
    if (item.badge_title) {
      transformed.badge = {
        title: item.badge_title,
        variant: item.badge_variant || 'default',
      };

      if (item.badge_classes) {
        transformed.badge.classes = item.badge_classes;
      }
    }

    // Add permissions if available
    if (item.permissions && item.permissions.length > 0) {
      transformed.permissions = item.permissions.filter((p) => p !== null);
    }

    // Add meta if available
    if (item.meta) {
      transformed.meta = item.meta;
    }

    // Transform children recursively
    if (item.children && item.children.length > 0) {
      transformed.children = item.children.map((child) =>
        this.transformNavigationItem(child),
      );
    }

    return transformed;
  }

  /**
   * Get cached data
   * @param key Cache key
   * @returns Promise<any | null>
   */
  private async getCachedData(key: string): Promise<any | null> {
    try {
      // If Redis is available, use it. Otherwise, use in-memory cache
      if (this.app.redis) {
        const cached = await this.app.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }

      // Fallback to simple in-memory cache (not recommended for production)
      return this.getInMemoryCache(key);
    } catch (error) {
      this.app.log.warn(`Failed to get cached data for key ${key}: ${error}`);
      return null;
    }
  }

  /**
   * Set cached data
   * @param key Cache key
   * @param data Data to cache
   * @param ttl TTL in seconds
   */
  private async setCachedData(
    key: string,
    data: any,
    ttl: number = this.cacheTTL,
  ): Promise<void> {
    try {
      // If Redis is available, use it. Otherwise, use in-memory cache
      if (this.app.redis) {
        await this.app.redis.setex(key, ttl, JSON.stringify(data));
      } else {
        // Fallback to simple in-memory cache (not recommended for production)
        this.setInMemoryCache(key, data, ttl);
      }
    } catch (error) {
      this.app.log.warn(`Failed to set cached data for key ${key}: ${error}`);
    }
  }

  /**
   * Delete cached data
   * @param pattern Cache key or pattern
   */
  private async deleteCachedData(pattern: string): Promise<void> {
    try {
      if (this.app.redis) {
        if (pattern.includes('*')) {
          // Use scan for pattern matching
          const keys = await this.app.redis.keys(pattern);
          if (keys.length > 0) {
            await this.app.redis.del(...keys);
          }
        } else {
          await this.app.redis.del(pattern);
        }
      } else {
        // Fallback to in-memory cache cleanup
        this.deleteInMemoryCache(pattern);
      }
    } catch (error) {
      this.app.log.warn(
        `Failed to delete cached data for pattern ${pattern}: ${error}`,
      );
    }
  }

  // Simple in-memory cache fallback (not recommended for production)
  private static memoryCache = new Map<
    string,
    { data: any; expires: number }
  >();

  private getInMemoryCache(key: string): any | null {
    const entry = NavigationService.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      NavigationService.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setInMemoryCache(key: string, data: any, ttl: number): void {
    NavigationService.memoryCache.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
    });
  }

  private deleteInMemoryCache(pattern: string): void {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const [key] of NavigationService.memoryCache) {
        if (regex.test(key)) {
          NavigationService.memoryCache.delete(key);
        }
      }
    } else {
      NavigationService.memoryCache.delete(pattern);
    }
  }

  // ============================================================================
  // Public CRUD Methods - Wrapper methods for repository access
  // These methods are used by the controller and handle cache invalidation
  // ============================================================================

  /**
   * Get all navigation items (flat list)
   * @param includeDisabled Whether to include disabled items
   * @returns Promise<NavigationItemWithChildren[]>
   */
  async getNavigationItems(
    includeDisabled = false,
  ): Promise<NavigationItemWithChildren[]> {
    return await this.navigationRepository.getNavigationItems(
      includeDisabled,
      true, // flatten=true for management UI
    );
  }

  /**
   * Get navigation item by ID
   * @param id Navigation item ID
   * @returns Promise<NavigationItemEntity | null>
   */
  async getNavigationItemById(id: string) {
    return await this.navigationRepository.getNavigationItemById(id);
  }

  /**
   * Get permissions for a navigation item
   * @param navigationItemId Navigation item ID
   * @returns Promise<Permission[]>
   */
  async getNavigationItemPermissions(navigationItemId: string) {
    return await this.navigationRepository.getNavigationItemPermissions(
      navigationItemId,
    );
  }

  /**
   * Check if key is unique
   * @param key Navigation item key
   * @param excludeId ID to exclude from check (for updates)
   * @returns Promise<boolean>
   */
  async isKeyUnique(key: string, excludeId?: string): Promise<boolean> {
    return await this.navigationRepository.isKeyUnique(key, excludeId);
  }

  /**
   * Create navigation item
   * @param item Navigation item data
   * @returns Promise<NavigationItemEntity>
   */
  async createNavigationItem(item: any) {
    const created = await this.navigationRepository.createNavigationItem(item);

    // Invalidate all navigation cache
    await this.invalidateCache();

    return created;
  }

  /**
   * Update navigation item
   * @param id Navigation item ID
   * @param updates Updates to apply
   * @returns Promise<NavigationItemEntity>
   */
  async updateNavigationItem(id: string, updates: any) {
    const updated = await this.navigationRepository.updateNavigationItem(
      id,
      updates,
    );

    // Invalidate all navigation cache
    await this.invalidateCache();

    return updated;
  }

  /**
   * Delete navigation item
   * @param id Navigation item ID
   * @returns Promise<boolean>
   */
  async deleteNavigationItem(id: string): Promise<boolean> {
    const deleted = await this.navigationRepository.deleteNavigationItem(id);

    // Invalidate all navigation cache
    await this.invalidateCache();

    return deleted;
  }

  /**
   * Assign permissions to navigation item
   * @param navigationItemId Navigation item ID
   * @param permissionIds Permission IDs to assign
   * @returns Promise<void>
   */
  async assignPermissionsToNavigationItem(
    navigationItemId: string,
    permissionIds: string[],
  ): Promise<void> {
    await this.navigationRepository.assignPermissionsToNavigationItem(
      navigationItemId,
      permissionIds,
    );

    // Invalidate all navigation cache (permissions affect visibility)
    await this.invalidateCache();
  }

  /**
   * Update navigation item sort orders (for reordering)
   * @param updates Array of {id, sort_order} pairs
   * @returns Promise<void>
   */
  async updateNavigationItemOrders(
    updates: Array<{ id: string; sort_order: number }>,
  ): Promise<void> {
    await this.navigationRepository.updateNavigationItemOrders(updates);

    // Invalidate all navigation cache
    await this.invalidateCache();
  }
}
