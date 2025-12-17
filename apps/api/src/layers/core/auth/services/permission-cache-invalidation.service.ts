import { FastifyInstance } from 'fastify';
import { PermissionCacheService } from './permission-cache.service';
import { Knex } from 'knex';

/**
 * Permission Cache Invalidation Service
 *
 * Provides RBAC-specific cache invalidation methods to ensure permission
 * cache stays synchronized with role and permission changes.
 *
 * Use Cases:
 * - Role assignment/removal → invalidate affected users
 * - Role permission changes → invalidate all users with that role
 * - Permission CRUD → invalidate all affected users
 * - Bulk operations → invalidate multiple users efficiently
 *
 * Error Handling:
 * - Cache invalidation failures are logged but don't block operations
 * - Stale cache is better than failed operation
 * - Users will get fresh permissions on next request if cache fails
 */
export class PermissionCacheInvalidationService {
  constructor(
    private permissionCache: PermissionCacheService,
    private db: Knex,
    private fastify: FastifyInstance,
  ) {}

  /**
   * Invalidate cache for a single user
   *
   * Call this when:
   * - Assigning a role to a user
   * - Removing a role from a user
   * - Updating user role expiry
   *
   * @param userId User ID to invalidate
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
      await this.permissionCache.invalidate(userId);
      this.fastify.log.info(
        { userId },
        'Permission cache invalidated for user',
      );
    } catch (error) {
      // Don't throw - log error but continue
      this.fastify.log.error(
        { error, userId },
        'Cache invalidation failed for user - cache may be stale',
      );
    }
  }

  /**
   * Invalidate cache for multiple users
   *
   * Call this when:
   * - Bulk role assignment
   * - Bulk role removal
   *
   * @param userIds Array of user IDs to invalidate
   */
  async invalidateUsers(userIds: string[]): Promise<void> {
    try {
      // Invalidate in parallel for better performance
      await Promise.all(
        userIds.map((userId) => this.permissionCache.invalidate(userId)),
      );

      this.fastify.log.info(
        { count: userIds.length },
        'Permission cache invalidated for multiple users',
      );
    } catch (error) {
      this.fastify.log.error(
        { error, count: userIds.length },
        'Cache invalidation failed for multiple users - cache may be stale',
      );
    }
  }

  /**
   * Invalidate all users who have a specific role
   *
   * Call this when:
   * - Role permissions are updated
   * - Role is deleted
   * - Role settings that affect permissions change
   *
   * @param roleId Role ID whose users should be invalidated
   */
  async invalidateUsersWithRole(roleId: string): Promise<void> {
    try {
      // Query user_roles table for active assignments
      const results = await this.db('user_roles')
        .where('role_id', roleId)
        .where('is_active', true)
        .select('user_id');

      const userIds = results.map((r) => r.user_id);

      if (userIds.length === 0) {
        this.fastify.log.debug(
          { roleId },
          'No active users found for role - skipping cache invalidation',
        );
        return;
      }

      // Invalidate all affected users
      await this.invalidateUsers(userIds);

      this.fastify.log.info(
        { roleId, userCount: userIds.length },
        'Permission cache invalidated for all users with role',
      );
    } catch (error) {
      this.fastify.log.error(
        { error, roleId },
        'Failed to invalidate users with role - cache may be stale',
      );
    }
  }

  /**
   * Invalidate all users who have any of the specified roles
   *
   * Call this when:
   * - Multiple roles are updated
   * - Bulk role operations affecting permissions
   *
   * @param roleIds Array of role IDs
   */
  async invalidateUsersWithRoles(roleIds: string[]): Promise<void> {
    try {
      // Query user_roles table for active assignments
      const results = await this.db('user_roles')
        .whereIn('role_id', roleIds)
        .where('is_active', true)
        .select('user_id')
        .distinct();

      const userIds = results.map((r) => r.user_id);

      if (userIds.length === 0) {
        this.fastify.log.debug(
          { roleIds },
          'No active users found for roles - skipping cache invalidation',
        );
        return;
      }

      await this.invalidateUsers(userIds);

      this.fastify.log.info(
        { roleCount: roleIds.length, userCount: userIds.length },
        'Permission cache invalidated for users with multiple roles',
      );
    } catch (error) {
      this.fastify.log.error(
        { error, roleCount: roleIds.length },
        'Failed to invalidate users with roles - cache may be stale',
      );
    }
  }

  /**
   * Invalidate all users who have a permission (through any role)
   *
   * Call this when:
   * - Permission is updated
   * - Permission is deleted
   * - Permission resource/action changes
   *
   * @param permissionId Permission ID
   */
  async invalidateUsersWithPermission(permissionId: string): Promise<void> {
    try {
      // Find all roles that have this permission
      const roleResults = await this.db('role_permissions')
        .where('permission_id', permissionId)
        .select('role_id')
        .distinct();

      const roleIds = roleResults.map((r) => r.role_id);

      if (roleIds.length === 0) {
        this.fastify.log.debug(
          { permissionId },
          'No roles found for permission - skipping cache invalidation',
        );
        return;
      }

      // Invalidate all users with these roles
      await this.invalidateUsersWithRoles(roleIds);

      this.fastify.log.info(
        { permissionId, roleCount: roleIds.length },
        'Permission cache invalidated for users with permission',
      );
    } catch (error) {
      this.fastify.log.error(
        { error, permissionId },
        'Failed to invalidate users with permission - cache may be stale',
      );
    }
  }

  /**
   * Clear all permission caches (use sparingly)
   *
   * Call this when:
   * - System-wide permission structure changes
   * - Emergency cache clear needed
   * - After major RBAC schema migrations
   *
   * ⚠️ WARNING: This will cause a cache stampede as all users re-query permissions
   */
  async invalidateAll(): Promise<void> {
    try {
      await this.permissionCache.invalidateAll();
      this.fastify.log.warn('All permission caches invalidated');
    } catch (error) {
      this.fastify.log.error(
        { error },
        'Failed to invalidate all caches - manual intervention may be needed',
      );
    }
  }
}
