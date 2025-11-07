import Knex from 'knex';
import {
  NavigationItemEntity,
  UserNavigationPreferenceEntity,
  NavigationItemWithChildren,
  NavigationType,
  Permission,
} from './navigation.types';

/**
 * NavigationRepository - Handles database operations for navigation system
 */
export class NavigationRepository {
  constructor(private readonly knex: any) {}

  /**
   * Get all navigation items with their permissions
   * @param includeDisabled Whether to include disabled items
   * @param flatten Whether to return flat list (true) or tree structure (false)
   * @returns Promise<NavigationItemWithChildren[]>
   */
  async getNavigationItems(
    includeDisabled = false,
    flatten = false,
  ): Promise<NavigationItemWithChildren[]> {
    const query = this.knex('navigation_items as ni')
      .select([
        'ni.*',
        this.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions",
        ),
      ])
      .leftJoin(
        'navigation_permissions as np',
        'ni.id',
        'np.navigation_item_id',
      )
      .leftJoin('permissions as p', 'np.permission_id', 'p.id')
      .groupBy('ni.id')
      .orderBy('ni.sort_order');

    if (!includeDisabled) {
      query.where('ni.disabled', false);
    }

    const items = await query;

    // Return flat list for management UI
    if (flatten) {
      return items.map((item: any) => ({
        ...item,
        children: [],
      })) as NavigationItemWithChildren[];
    }

    // Build hierarchical tree structure for navigation menu
    return this.buildNavigationTree(
      items as unknown as NavigationItemWithChildren[],
    );
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
    includeDisabled = false,
  ): Promise<NavigationItemWithChildren[]> {
    // Get user permissions
    const userPermissions = await this.getUserPermissions(userId);

    // Build the query
    let query = this.knex('navigation_items as ni')
      .select([
        'ni.id',
        'ni.parent_id',
        'ni.key',
        'ni.title',
        'ni.type',
        'ni.icon',
        'ni.link',
        'ni.target',
        'ni.sort_order',
        'ni.disabled',
        'ni.hidden',
        'ni.exact_match',
        'ni.badge_title',
        'ni.badge_classes',
        'ni.badge_variant',
        'ni.show_in_default',
        'ni.show_in_compact',
        'ni.show_in_horizontal',
        'ni.show_in_mobile',
        'ni.meta',
        'ni.created_at',
        'ni.updated_at',
        this.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions",
        ),
        'unp.hidden as user_hidden',
        'unp.custom_sort_order as user_sort_order',
        'unp.pinned as user_pinned',
      ])
      .leftJoin(
        'navigation_permissions as np',
        'ni.id',
        'np.navigation_item_id',
      )
      .leftJoin('permissions as p', 'np.permission_id', 'p.id')
      .leftJoin('user_navigation_preferences as unp', (join) => {
        join
          .on('ni.id', 'unp.navigation_item_id')
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
    query = query.where(function () {
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
      .select(
        this.knex.raw(
          "ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions",
        ),
      )
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
  async getNavigationItemByKey(
    key: string,
  ): Promise<NavigationItemEntity | null> {
    return await this.knex('navigation_items').where('key', key).first();
  }

  /**
   * Get user navigation preferences for a specific item
   * @param userId User ID
   * @param navigationItemId Navigation item ID
   * @returns Promise<UserNavigationPreferenceEntity | null>
   */
  async getUserNavigationPreference(
    userId: string,
    navigationItemId: string,
  ): Promise<UserNavigationPreferenceEntity | null> {
    return await this.knex('user_navigation_preferences')
      .where({
        user_id: userId,
        navigation_item_id: navigationItemId,
      })
      .first();
  }

  /**
   * Create or update user navigation preference
   * @param preference User navigation preference data
   * @returns Promise<UserNavigationPreferenceEntity>
   */
  async upsertUserNavigationPreference(
    preference: Partial<UserNavigationPreferenceEntity>,
  ): Promise<UserNavigationPreferenceEntity> {
    const {
      user_id: _user_id,
      navigation_item_id: _navigation_item_id,
      ...updateData
    } = preference;

    return await this.knex('user_navigation_preferences')
      .insert(preference)
      .onConflict(['user_id', 'navigation_item_id'])
      .merge(updateData)
      .returning('*')
      .then((rows) => rows[0]);
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
  private buildNavigationTree(
    items: NavigationItemWithChildren[],
  ): NavigationItemWithChildren[] {
    const itemMap = new Map<string, NavigationItemWithChildren>();
    const rootItems: NavigationItemWithChildren[] = [];

    // Create map of all items
    items.forEach((item) => {
      item.children = [];
      itemMap.set(item.id, item);
    });

    // Build tree structure
    items.forEach((item) => {
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
      items.forEach((item) => {
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
    userPermissions: string[],
  ): NavigationItemWithChildren[] {
    return items.filter((item) => {
      // If item has no permissions, it's accessible to everyone
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Check if user has any of the required permissions
      return item.permissions.some(
        (permission) =>
          userPermissions.includes(permission) ||
          userPermissions.includes('*:*'),
      );
    });
  }

  /**
   * Filter navigation items by type
   * @param items Navigation items
   * @param type Navigation type
   * @returns Filtered navigation items
   */
  filterByType(
    items: NavigationItemWithChildren[],
    type: NavigationType,
  ): NavigationItemWithChildren[] {
    const typeField = `show_in_${type}` as keyof NavigationItemEntity;
    return items.filter((item) => item[typeField] === true);
  }

  /**
   * Get navigation item by ID
   * @param id Navigation item ID
   * @returns Promise<NavigationItemEntity | null>
   */
  async getNavigationItemById(
    id: string,
  ): Promise<NavigationItemEntity | null> {
    return await this.knex('navigation_items').where('id', id).first();
  }

  /**
   * Create navigation item
   * @param item Navigation item data
   * @returns Promise<NavigationItemEntity>
   */
  async createNavigationItem(
    item: Partial<NavigationItemEntity>,
  ): Promise<NavigationItemEntity> {
    const [created] = await this.knex('navigation_items')
      .insert({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return created;
  }

  /**
   * Update navigation item
   * @param id Navigation item ID
   * @param updates Updates to apply
   * @returns Promise<NavigationItemEntity>
   */
  async updateNavigationItem(
    id: string,
    updates: Partial<NavigationItemEntity>,
  ): Promise<NavigationItemEntity> {
    const [updated] = await this.knex('navigation_items')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      throw new Error('NAVIGATION_ITEM_NOT_FOUND');
    }

    return updated;
  }

  /**
   * Delete navigation item
   * @param id Navigation item ID
   * @returns Promise<boolean>
   */
  async deleteNavigationItem(id: string): Promise<boolean> {
    // Check if item has children
    const children = await this.knex('navigation_items')
      .where('parent_id', id)
      .first();

    if (children) {
      throw new Error('NAVIGATION_ITEM_HAS_CHILDREN');
    }

    // Delete permission associations first
    await this.knex('navigation_permissions')
      .where('navigation_item_id', id)
      .delete();

    // Delete user preferences
    await this.knex('user_navigation_preferences')
      .where('navigation_item_id', id)
      .delete();

    // Delete the item
    const deleted = await this.knex('navigation_items')
      .where('id', id)
      .delete();

    return deleted > 0;
  }

  /**
   * Get permissions for a navigation item
   * @param navigationItemId Navigation item ID
   * @returns Promise<Permission[]>
   */
  async getNavigationItemPermissions(
    navigationItemId: string,
  ): Promise<Permission[]> {
    return await this.knex('permissions as p')
      .select('p.*')
      .join('navigation_permissions as np', 'p.id', 'np.permission_id')
      .where('np.navigation_item_id', navigationItemId);
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
    // Remove existing permissions
    await this.knex('navigation_permissions')
      .where('navigation_item_id', navigationItemId)
      .delete();

    // Insert new permissions
    if (permissionIds.length > 0) {
      const records = permissionIds.map((permissionId) => ({
        navigation_item_id: navigationItemId,
        permission_id: permissionId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await this.knex('navigation_permissions').insert(records);
    }
  }

  /**
   * Update navigation item sort orders (for reordering)
   * @param updates Array of {id, sort_order} pairs
   * @returns Promise<void>
   */
  async updateNavigationItemOrders(
    updates: Array<{ id: string; sort_order: number }>,
  ): Promise<void> {
    const trx = await this.knex.transaction();

    try {
      for (const update of updates) {
        await trx('navigation_items').where('id', update.id).update({
          sort_order: update.sort_order,
          updated_at: new Date(),
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Get navigation items by parent ID
   * @param parentId Parent ID (null for root items)
   * @returns Promise<NavigationItemEntity[]>
   */
  async getNavigationItemsByParentId(
    parentId: string | null,
  ): Promise<NavigationItemEntity[]> {
    const query = this.knex('navigation_items').orderBy('sort_order');

    if (parentId === null) {
      query.whereNull('parent_id');
    } else {
      query.where('parent_id', parentId);
    }

    return await query;
  }

  /**
   * Check if key already exists
   * @param key Navigation item key
   * @param excludeId ID to exclude from check (for updates)
   * @returns Promise<boolean>
   */
  async isKeyUnique(key: string, excludeId?: string): Promise<boolean> {
    const query = this.knex('navigation_items').where('key', key);

    if (excludeId) {
      query.whereNot('id', excludeId);
    }

    const existing = await query.first();
    return !existing;
  }
}
