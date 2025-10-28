import Knex from 'knex';
import {
  NavigationItemEntity,
  UserNavigationPreferenceEntity,
  NavigationItemWithChildren,
  NavigationType,
  Permission
} from './navigation.types';

/**
 * NavigationRepository - Handles database operations for navigation system
 */
export class NavigationRepository {
  constructor(private readonly knex: any) {}

  /**
   * Get all navigation items with their permissions
   * @param includeDisabled Whether to include disabled items
   * @returns Promise<NavigationItemWithChildren[]>
   */
  async getNavigationItems(includeDisabled = false): Promise<NavigationItemWithChildren[]> {
    const query = this.knex('navigation_items as ni')
      .select([
        'ni.*',
        this.knex.raw('ARRAY_AGG(DISTINCT CONCAT(p.resource, \'.\', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions')
      ])
      .leftJoin('navigation_permissions as np', 'ni.id', 'np.navigation_item_id')
      .leftJoin('permissions as p', 'np.permission_id', 'p.id')
      .groupBy('ni.id')
      .orderBy('ni.sort_order');

    if (!includeDisabled) {
      query.where('ni.disabled', false);
    }

    const items = await query;

    // Build hierarchical structure
    return this.buildNavigationTree(items as unknown as NavigationItemWithChildren[]);
  }

  /**
   * Get navigation items filtered by user permissions
   * @param userId User ID
   * @param type Navigation type
   * @param includeDisabled Whether to include disabled items
   * @returns Promise<NavigationItemWithChildren[]>
   */
  async getUserNavigationItems(
    userId: string,
    type?: NavigationType,
    includeDisabled = false
  ): Promise<NavigationItemWithChildren[]> {
    // Get user permissions
    const userPermissions = await this.getUserPermissions(userId);

    // Build the query
    let query = this.knex('navigation_items as ni')
      .select([
        'ni.*',
        this.knex.raw('ARRAY_AGG(DISTINCT CONCAT(p.resource, \'.\', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions'),
        'unp.hidden as user_hidden',
        'unp.custom_sort_order as user_sort_order',
        'unp.pinned as user_pinned'
      ])
      .leftJoin('navigation_permissions as np', 'ni.id', 'np.navigation_item_id')
      .leftJoin('permissions as p', 'np.permission_id', 'p.id')
      .leftJoin('user_navigation_preferences as unp', (join) => {
        join.on('ni.id', 'unp.navigation_item_id')
            .andOn('unp.user_id', this.knex.raw('?', [userId]));
      })
      .groupBy('ni.id', 'unp.hidden', 'unp.custom_sort_order', 'unp.pinned');

    // Apply navigation type filter
    if (type) {
      query = query.where(`ni.show_in_${type}`, true);
    }

    if (!includeDisabled) {
      query = query.where('ni.disabled', false);
    }

    // Apply user-specific hidden preference
    query = query.where(function() {
      this.whereNull('unp.hidden').orWhere('unp.hidden', false);
    });

    // Order by user preference first, then default sort order
    query = query.orderByRaw('COALESCE(unp.custom_sort_order, ni.sort_order)');

    const items = await query;

    // Filter items based on user permissions
    const filteredItems = this.filterByPermissions(items, userPermissions);

    // Build hierarchical structure
    return this.buildNavigationTree(filteredItems);
  }

  /**
   * Get user permissions as array of strings
   * @param userId User ID
   * @returns Promise<string[]>
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const permissions = await this.knex('users as u')
      .select(this.knex.raw('ARRAY_AGG(DISTINCT CONCAT(p.resource, \'.\', p.action)) as permissions'))
      .join('user_roles as ur', 'u.id', 'ur.user_id')
      .join('role_permissions as rp', 'ur.role_id', 'rp.role_id')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('u.id', userId)
      .groupBy('u.id')
      .first();

    return (permissions as { permissions?: string[] })?.permissions || [];
  }

  /**
   * Get navigation item by key
   * @param key Navigation item key
   * @returns Promise<NavigationItemEntity | null>
   */
  async getNavigationItemByKey(key: string): Promise<NavigationItemEntity | null> {
    return await this.knex('navigation_items')
      .where('key', key)
      .first();
  }

  /**
   * Get user navigation preferences for a specific item
   * @param userId User ID
   * @param navigationItemId Navigation item ID
   * @returns Promise<UserNavigationPreferenceEntity | null>
   */
  async getUserNavigationPreference(
    userId: string,
    navigationItemId: string
  ): Promise<UserNavigationPreferenceEntity | null> {
    return await this.knex('user_navigation_preferences')
      .where({
        user_id: userId,
        navigation_item_id: navigationItemId
      })
      .first();
  }

  /**
   * Create or update user navigation preference
   * @param preference User navigation preference data
   * @returns Promise<UserNavigationPreferenceEntity>
   */
  async upsertUserNavigationPreference(
    preference: Partial<UserNavigationPreferenceEntity>
  ): Promise<UserNavigationPreferenceEntity> {
    const { user_id: _user_id, navigation_item_id: _navigation_item_id, ...updateData } = preference;

    return await this.knex('user_navigation_preferences')
      .insert(preference)
      .onConflict(['user_id', 'navigation_item_id'])
      .merge(updateData)
      .returning('*')
      .then(rows => rows[0]);
  }

  /**
   * Get all permissions
   * @returns Promise<Permission[]>
   */
  async getPermissions(): Promise<Permission[]> {
    return await this.knex('permissions')
      .select('*')
      .orderBy('resource', 'action');
  }

  /**
   * Build hierarchical navigation tree from flat array
   * @param items Flat array of navigation items
   * @returns NavigationItemWithChildren[]
   */
  private buildNavigationTree(items: NavigationItemWithChildren[]): NavigationItemWithChildren[] {
    const itemMap = new Map<string, NavigationItemWithChildren>();
    const rootItems: NavigationItemWithChildren[] = [];

    // Create map of all items
    items.forEach(item => {
      item.children = [];
      itemMap.set(item.id, item);
    });

    // Build tree structure
    items.forEach(item => {
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        }
      } else {
        rootItems.push(item);
      }
    });

    // Sort children recursively
    const sortChildren = (items: NavigationItemWithChildren[]) => {
      items.sort((a, b) => a.sort_order - b.sort_order);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(rootItems);
    return rootItems;
  }

  /**
   * Filter navigation items based on user permissions
   * @param items Navigation items with permissions
   * @param userPermissions User's permissions
   * @returns Filtered navigation items
   */
  private filterByPermissions(
    items: NavigationItemWithChildren[],
    userPermissions: string[]
  ): NavigationItemWithChildren[] {
    return items.filter(item => {
      // If item has no permissions, it's accessible to everyone
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Check if user has any of the required permissions
      return item.permissions.some(permission => 
        userPermissions.includes(permission) || userPermissions.includes('*:*')
      );
    });
  }

  /**
   * Filter navigation items by type
   * @param items Navigation items
   * @param type Navigation type
   * @returns Filtered navigation items
   */
  filterByType(items: NavigationItemWithChildren[], type: NavigationType): NavigationItemWithChildren[] {
    const typeField = `show_in_${type}` as keyof NavigationItemEntity;
    return items.filter(item => item[typeField] === true);
  }
}