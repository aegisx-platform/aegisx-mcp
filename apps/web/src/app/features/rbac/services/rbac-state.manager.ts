import { Injectable, inject } from '@angular/core';
import {
  BaseRealtimeStateManager,
  StateManagerConfig,
} from '../../../shared/state/base-realtime-state.manager';
import { WebSocketService } from '../../../shared/services/websocket.service';
import { Role, Permission, UserRole } from '../models/rbac.interfaces';

@Injectable({
  providedIn: 'root',
})
export class RbacRoleStateManager extends BaseRealtimeStateManager<Role> {
  private websocketService = inject(WebSocketService);

  constructor() {
    const config: StateManagerConfig = {
      feature: 'rbac',
      entity: 'role',
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      enableCaching: true,
      cacheTTL: 300000, // 5 minutes
    };

    super(inject(WebSocketService), config);
  }

  // Role-specific methods

  /**
   * Get roles by category
   */
  getRolesByCategory(category: string): Role[] {
    return this.getItemsWhere((role) => role.category === category);
  }

  /**
   * Get active roles only
   */
  getActiveRoles(): Role[] {
    return this.getItemsWhere((role) => role.is_active);
  }

  /**
   * Get root roles (no parent)
   */
  getRootRoles(): Role[] {
    return this.getItemsWhere((role) => !role.parent_role_id);
  }

  /**
   * Get child roles for a parent role
   */
  getChildRoles(parentId: string): Role[] {
    return this.getItemsWhere((role) => role.parent_role_id === parentId);
  }

  /**
   * Get role hierarchy as tree structure
   */
  getRoleHierarchy(): Role[] {
    const roles = this.items();
    const roleMap = new Map<string, Role>();

    // Create role map
    roles.forEach((role) => roleMap.set(role.id, { ...role }));

    // Build hierarchy
    const rootRoles: Role[] = [];

    roles.forEach((role) => {
      if (!role.parent_role_id) {
        rootRoles.push(roleMap.get(role.id)!);
      }
    });

    return rootRoles;
  }

  /**
   * Check if role can be edited by current user
   */
  canEditRole(roleId: string): boolean {
    const role = this.getItem(roleId);
    return role ? (role.canEdit ?? true) && !role.isLocked : false;
  }

  /**
   * Check if role can be deleted
   */
  canDeleteRole(roleId: string): boolean {
    const role = this.getItem(roleId);
    return role ? (role.canDelete ?? true) && role.user_count === 0 : false;
  }

  /**
   * Get roles with conflicts
   */
  getConflictedRoles(): Role[] {
    return this.getItemsWhere((role) => role.lastModified?.isConflict === true);
  }

  /**
   * Update role with optimistic update
   */
  async updateRole(
    id: string,
    updates: Partial<Role>,
    apiCall: () => Promise<Role>,
  ): Promise<Role> {
    return this.performOptimisticUpdate(id, updates, apiCall);
  }

  /**
   * Batch update multiple roles
   */
  async updateRoles(
    updates: Array<{
      id: string;
      updates: Partial<Role>;
      apiCall: () => Promise<Role>;
    }>,
  ): Promise<Role[]> {
    return this.performBatchOptimisticUpdate(updates);
  }

  // Override parent methods for RBAC-specific behavior

  protected override onItemCreated(role: Role): void {
    console.log(`Role created: ${role.name}`);
    // Invalidate permission cache if needed
    this.invalidatePermissionCache();
  }

  protected override onItemUpdated(role: Role): void {
    console.log(`Role updated: ${role.name}`);

    // Check for conflicts
    const existingRole = this.getItem(role.id);
    if (existingRole?.hasUnsavedChanges) {
      // Mark as conflict
      this.updateItem(role.id, {
        ...role,
        lastModified: {
          by: role.lastModified?.by || 'Unknown',
          at: role.updated_at,
          isConflict: true,
        },
      });
    } else {
      this.updateItem(role.id, role);
    }

    // Invalidate related caches
    this.invalidatePermissionCache();
  }

  protected override onItemDeleted(roleId: string): void {
    console.log(`Role deleted: ${roleId}`);
    this.invalidatePermissionCache();
  }

  protected override onLockAcquired(data: {
    id: string;
    userId: string;
    lockType?: string;
  }): void {
    console.log(`Role locked by ${data.userId}: ${data.id}`);
    this.updateItem(data.id, {
      isLocked: true,
      lockedBy: data.userId,
      lockType: data.lockType,
    } as Partial<Role>);
  }

  protected override onLockReleased(data: {
    id: string;
    userId: string;
  }): void {
    console.log(`Role unlocked: ${data.id}`);
    this.updateItem(data.id, {
      isLocked: false,
      lockedBy: undefined,
      lockType: undefined,
    } as Partial<Role>);
  }

  protected override onConflictDetected(data: any): void {
    console.warn('Role conflict detected:', data);
    // Handle role-specific conflict resolution
  }

  private invalidatePermissionCache(): void {
    // Emit event to invalidate permission caches
    // This would trigger permission recalculation in related services
  }
}

@Injectable({
  providedIn: 'root',
})
export class RbacPermissionStateManager extends BaseRealtimeStateManager<Permission> {
  constructor() {
    const config: StateManagerConfig = {
      feature: 'rbac',
      entity: 'permission',
      enableOptimisticUpdates: false, // Permissions usually don't need optimistic updates
      enableConflictDetection: false,
      enableCaching: true,
      cacheTTL: 600000, // 10 minutes (permissions change less frequently)
    };

    super(inject(WebSocketService), config);
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(category: string): Permission[] {
    return this.getItemsWhere((permission) => permission.category === category);
  }

  /**
   * Get permissions by resource
   */
  getPermissionsByResource(resource: string): Permission[] {
    return this.getItemsWhere((permission) => permission.resource === resource);
  }

  /**
   * Get system permissions only
   */
  getSystemPermissions(): Permission[] {
    return this.getItemsWhere((permission) => permission.is_system_permission);
  }

  /**
   * Get custom (non-system) permissions
   */
  getCustomPermissions(): Permission[] {
    return this.getItemsWhere((permission) => !permission.is_system_permission);
  }

  /**
   * Search permissions by name or description
   */
  searchPermissions(query: string): Permission[] {
    const lowerQuery = query.toLowerCase();
    return this.getItemsWhere(
      (permission) =>
        permission.description.toLowerCase().includes(lowerQuery) ||
        permission.description.toLowerCase().includes(lowerQuery),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class RbacUserRoleStateManager extends BaseRealtimeStateManager<UserRole> {
  constructor() {
    const config: StateManagerConfig = {
      feature: 'rbac',
      entity: 'user_role',
      enableOptimisticUpdates: true,
      enableConflictDetection: false, // User role assignments usually don't conflict
      enableCaching: true,
      cacheTTL: 300000, // 5 minutes
    };

    super(inject(WebSocketService), config);
  }

  /**
   * Get roles for specific user
   */
  getUserRoles(userId: string): UserRole[] {
    return this.getItemsWhere((userRole) => userRole.user_id === userId);
  }

  /**
   * Get users for specific role
   */
  getRoleUsers(roleId: string): UserRole[] {
    return this.getItemsWhere((userRole) => userRole.role_id === roleId);
  }

  /**
   * Get expiring user roles
   */
  getExpiringUserRoles(withinDays: number = 7): UserRole[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    return this.getItemsWhere((userRole) => {
      if (!userRole.expires_at) return false;
      const expiryDate = new Date(userRole.expires_at);
      return expiryDate <= cutoffDate;
    });
  }

  /**
   * Check if user has specific role
   */
  userHasRole(userId: string, roleId: string): boolean {
    return (
      this.getItemsWhere(
        (userRole) =>
          userRole.user_id === userId && userRole.role_id === roleId,
      ).length > 0
    );
  }

  /**
   * Assign role to user with optimistic update
   */
  async assignRole(
    userId: string,
    roleId: string,
    expiresAt: string | undefined,
    apiCall: () => Promise<UserRole>,
  ): Promise<UserRole> {
    const tempId = `temp-${Date.now()}`;
    const optimisticUserRole: Partial<UserRole> = {
      id: tempId,
      user_id: userId,
      role_id: roleId,
      expires_at: expiresAt,
      assigned_at: new Date().toISOString(),
      isLoading: true as any,
    };

    return this.performOptimisticUpdate(tempId, optimisticUserRole, apiCall);
  }

  protected override onItemCreated(userRole: UserRole): void {
    console.log(
      `User role assigned: ${userRole.user_id} -> ${userRole.role_id}`,
    );
  }

  protected override onItemDeleted(userRoleId: string): void {
    console.log(`User role removed: ${userRoleId}`);
  }
}
