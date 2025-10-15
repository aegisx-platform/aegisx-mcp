import { RbacRepository } from './rbac.repository';
import {
  Role,
  Permission,
  UserRole,
  RoleQuery,
  PermissionQuery,
  UserRoleQuery,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignRoleRequest,
  BulkAssignRolesRequest,
  BulkRoleUpdateRequest,
  BulkPermissionUpdateRequest,
  BulkOperationResponse,
  RbacStats,
} from './rbac.schemas';
import { PaginationMeta } from '../../shared/pagination.utils';

export class RbacService {
  constructor(private rbacRepository: RbacRepository) {}

  // ===== ROLE SERVICES =====

  async getRoles(
    query: RoleQuery,
  ): Promise<{ roles: Role[]; pagination: PaginationMeta }> {
    return await this.rbacRepository.getRoles(query);
  }

  async getRoleById(
    id: string,
    includePermissions = true,
  ): Promise<Role | null> {
    const role = await this.rbacRepository.getRoleById(id, includePermissions);

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  async createRole(data: CreateRoleRequest, createdBy: string): Promise<Role> {
    // Validate role name uniqueness
    const existingRole = await this.rbacRepository
      .db('roles')
      .where('name', data.name)
      .first();

    if (existingRole) {
      throw new Error('Role with this name already exists');
    }

    // Validate parent role if specified
    if (data.parent_role_id) {
      const parentRole = await this.rbacRepository.getRoleById(
        data.parent_role_id,
        false,
      );
      if (!parentRole) {
        throw new Error('Parent role not found');
      }

      // Check for circular dependency
      if (
        await this.wouldCreateCircularDependency(data.parent_role_id, data.name)
      ) {
        throw new Error('Cannot create circular role hierarchy');
      }
    }

    // Validate permissions if specified
    if (data.permission_ids && data.permission_ids.length > 0) {
      const permissions = await this.rbacRepository
        .db('permissions')
        .whereIn('id', data.permission_ids)
        .where('is_active', true);

      if (permissions.length !== data.permission_ids.length) {
        throw new Error('One or more permissions not found or inactive');
      }
    }

    return await this.rbacRepository.createRole(data, createdBy);
  }

  async updateRole(
    id: string,
    data: UpdateRoleRequest,
    updatedBy: string,
  ): Promise<Role> {
    // Check if role exists
    const existingRole = await this.rbacRepository.getRoleById(id, false);
    if (!existingRole) {
      throw new Error('Role not found');
    }

    // Prevent modification of system roles (certain fields)
    if (existingRole.is_system_role) {
      if (data.name && data.name !== existingRole.name) {
        throw new Error('Cannot change name of system role');
      }
      if (data.category && data.category !== existingRole.category) {
        throw new Error('Cannot change category of system role');
      }
    }

    // Validate name uniqueness if changing
    if (data.name && data.name !== existingRole.name) {
      const duplicateName = await this.rbacRepository
        .db('roles')
        .where('name', data.name)
        .where('id', '!=', id)
        .first();

      if (duplicateName) {
        throw new Error('Role with this name already exists');
      }
    }

    // Validate parent role if changing
    if (data.parent_role_id !== undefined) {
      if (data.parent_role_id) {
        const parentRole = await this.rbacRepository.getRoleById(
          data.parent_role_id,
          false,
        );
        if (!parentRole) {
          throw new Error('Parent role not found');
        }

        // Check for circular dependency
        if (
          await this.wouldCreateCircularDependency(
            data.parent_role_id,
            existingRole.name,
            id,
          )
        ) {
          throw new Error('Cannot create circular role hierarchy');
        }
      }
    }

    // Validate permissions if changing
    if (data.permission_ids && data.permission_ids.length > 0) {
      const permissions = await this.rbacRepository
        .db('permissions')
        .whereIn('id', data.permission_ids)
        .where('is_active', true);

      if (permissions.length !== data.permission_ids.length) {
        throw new Error('One or more permissions not found or inactive');
      }
    }

    const updatedRole = await this.rbacRepository.updateRole(
      id,
      data,
      updatedBy,
    );
    if (!updatedRole) {
      throw new Error('Failed to update role');
    }

    return updatedRole;
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.rbacRepository.getRoleById(id, false);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if role has child roles
    const childRoles = await this.rbacRepository
      .db('roles')
      .where('parent_role_id', id)
      .where('is_active', true);

    if (childRoles.length > 0) {
      throw new Error('Cannot delete role with child roles');
    }

    const deleted = await this.rbacRepository.deleteRole(id);
    if (!deleted) {
      throw new Error('Failed to delete role');
    }
  }

  private async wouldCreateCircularDependency(
    parentRoleId: string,
    roleName: string,
    excludeRoleId?: string,
  ): Promise<boolean> {
    // Get all roles to build hierarchy tree
    const roles = await this.rbacRepository
      .db('roles')
      .select(['id', 'name', 'parent_role_id'])
      .where('is_active', true);

    // Build parent-child map
    const parentChildMap = new Map<string, string[]>();
    const roleMap = new Map<
      string,
      { id: string; name: string; parent_role_id: string | null }
    >();

    roles.forEach((role) => {
      roleMap.set(role.id, role);
      roleMap.set(role.name, role);

      if (role.parent_role_id) {
        if (!parentChildMap.has(role.parent_role_id)) {
          parentChildMap.set(role.parent_role_id, []);
        }
        parentChildMap.get(role.parent_role_id)!.push(role.id);
      }
    });

    // Check if making parentRoleId a parent of roleName would create a cycle
    const visited = new Set<string>();

    function hasDescendant(
      currentRoleId: string,
      targetRoleName: string,
    ): boolean {
      if (visited.has(currentRoleId)) {
        return false; // Already visited, avoid infinite loop
      }

      visited.add(currentRoleId);

      const currentRole = roleMap.get(currentRoleId);
      if (!currentRole) return false;

      // Check if current role is the target role (excluding the role being updated)
      if (
        currentRole.name === targetRoleName &&
        currentRoleId !== excludeRoleId
      ) {
        return true;
      }

      // Check children
      const children = parentChildMap.get(currentRoleId) || [];
      for (const childId of children) {
        if (hasDescendant(childId, targetRoleName)) {
          return true;
        }
      }

      return false;
    }

    return hasDescendant(parentRoleId, roleName);
  }

  // ===== PERMISSION SERVICES =====

  async getPermissions(
    query: PermissionQuery,
  ): Promise<{ permissions: Permission[]; pagination: PaginationMeta }> {
    return await this.rbacRepository.getPermissions(query);
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.rbacRepository.getPermissionById(id);

    if (!permission) {
      throw new Error('Permission not found');
    }

    return permission;
  }

  async createPermission(
    data: CreatePermissionRequest,
    createdBy: string,
  ): Promise<Permission> {
    // Note: Validation for resource+action uniqueness is handled in repository

    return await this.rbacRepository.createPermission(data, createdBy);
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest,
    updatedBy: string,
  ): Promise<Permission> {
    const existingPermission = await this.rbacRepository.getPermissionById(id);
    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    // Note: Resource+action uniqueness validation is handled in repository layer

    const updatedPermission = await this.rbacRepository.updatePermission(
      id,
      data,
      updatedBy,
    );
    if (!updatedPermission) {
      throw new Error('Failed to update permission');
    }

    return updatedPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.rbacRepository.getPermissionById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const deleted = await this.rbacRepository.deletePermission(id);
    if (!deleted) {
      throw new Error('Failed to delete permission');
    }
  }

  // ===== USER-ROLE SERVICES =====

  async getUserRoles(
    query: UserRoleQuery,
  ): Promise<{ userRoles: UserRole[]; pagination: PaginationMeta }> {
    return await this.rbacRepository.getUserRoles(query);
  }

  async getUserRolesByUserId(userId: string): Promise<UserRole[]> {
    const { userRoles } = await this.rbacRepository.getUserRoles({
      user_id: userId,
      is_active: true,
      include_role: true,
      page: 1,
      limit: 100, // Get all user roles
    });

    return userRoles;
  }

  async assignRoleToUser(
    userId: string,
    data: AssignRoleRequest,
    assignedBy: string,
  ): Promise<UserRole> {
    // Validate user exists
    const user = await this.rbacRepository
      .db('users')
      .where('id', userId)
      .first();
    if (!user) {
      throw new Error('User not found');
    }

    // Validate role exists and is active
    const role = await this.rbacRepository.getRoleById(data.role_id, false);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!role.is_active) {
      throw new Error('Cannot assign inactive role');
    }

    // Validate expiration date if provided
    if (data.expires_at) {
      const expirationDate = new Date(data.expires_at);
      if (expirationDate <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
    }

    return await this.rbacRepository.assignRoleToUser(userId, data, assignedBy);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // Check if assignment exists
    const { userRoles } = await this.rbacRepository.getUserRoles({
      user_id: userId,
      role_id: roleId,
      is_active: true,
      page: 1,
      limit: 1,
    });

    if (userRoles.length === 0) {
      throw new Error('User role assignment not found');
    }

    const removed = await this.rbacRepository.removeRoleFromUser(
      userId,
      roleId,
    );
    if (!removed) {
      throw new Error('Failed to remove role from user');
    }
  }

  async updateUserRoleExpiry(
    userId: string,
    roleId: string,
    expiresAt: string | null,
  ): Promise<UserRole> {
    // Check if assignment exists
    const { userRoles } = await this.rbacRepository.getUserRoles({
      user_id: userId,
      role_id: roleId,
      is_active: true,
      page: 1,
      limit: 1,
    });

    if (userRoles.length === 0) {
      throw new Error('User role assignment not found');
    }

    const userRole = userRoles[0];

    // Update expiry date
    const updated = await this.rbacRepository.updateUserRoleExpiry(
      userId,
      roleId,
      expiresAt,
    );

    if (!updated) {
      throw new Error('Failed to update user role expiry');
    }

    // Return updated user role
    return {
      ...userRole,
      expires_at: expiresAt,
    };
  }

  async bulkAssignRoles(
    data: BulkAssignRolesRequest,
    assignedBy: string,
  ): Promise<BulkOperationResponse> {
    // Validate role exists and is active
    const role = await this.rbacRepository.getRoleById(data.role_id, false);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!role.is_active) {
      throw new Error('Cannot assign inactive role');
    }

    // Validate users exist
    const users = await this.rbacRepository
      .db('users')
      .whereIn('id', data.user_ids)
      .where('status', 'active');

    if (users.length !== data.user_ids.length) {
      throw new Error('One or more users not found or inactive');
    }

    // Validate expiration date if provided
    if (data.expires_at) {
      const expirationDate = new Date(data.expires_at);
      if (expirationDate <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
    }

    const results: BulkOperationResponse = {
      success_count: 0,
      error_count: 0,
      total_count: data.user_ids.length,
      errors: [],
    };

    // Assign roles to each user
    for (const userId of data.user_ids) {
      try {
        await this.rbacRepository.assignRoleToUser(
          userId,
          {
            role_id: data.role_id,
            expires_at: data.expires_at,
          },
          assignedBy,
        );
        results.success_count++;
      } catch (error) {
        results.error_count++;
        results.errors.push({
          id: userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // ===== BULK OPERATIONS =====

  async bulkUpdateRoles(
    data: BulkRoleUpdateRequest,
    updatedBy: string,
  ): Promise<BulkOperationResponse> {
    // Validate all roles exist
    const roles = await this.rbacRepository
      .db('roles')
      .whereIn('id', data.role_ids);

    if (roles.length !== data.role_ids.length) {
      throw new Error('One or more roles not found');
    }

    return await this.rbacRepository.bulkUpdateRoles(data, updatedBy);
  }

  async bulkUpdatePermissions(
    data: BulkPermissionUpdateRequest,
    updatedBy: string,
  ): Promise<BulkOperationResponse> {
    // Validate all permissions exist
    const permissions = await this.rbacRepository
      .db('permissions')
      .whereIn('id', data.permission_ids);

    if (permissions.length !== data.permission_ids.length) {
      throw new Error('One or more permissions not found');
    }

    return await this.rbacRepository.bulkUpdatePermissions(data, updatedBy);
  }

  // ===== STATISTICS =====

  async getRbacStats(): Promise<RbacStats> {
    return await this.rbacRepository.getRbacStats();
  }

  // ===== UTILITY METHODS =====

  async getRoleHierarchy(): Promise<Role[]> {
    const { roles } = await this.rbacRepository.getRoles({
      is_active: true,
      include_permissions: true,
      page: 1,
      limit: 1000, // Get all active roles
    });

    // Build hierarchy tree
    const roleMap = new Map<string, Role>();
    const rootRoles: Role[] = [];

    // Index roles by ID
    roles.forEach((role) => {
      roleMap.set(role.id, { ...role } as any);
      (roleMap.get(role.id) as any).children = [];
    });

    // Build parent-child relationships
    roles.forEach((role) => {
      if (!role.parent_role_id) {
        rootRoles.push(roleMap.get(role.id)!);
      } else {
        const parent = roleMap.get(role.parent_role_id);
        if (parent) {
          if (!(parent as any).children) {
            (parent as any).children = [];
          }
          (parent as any).children.push(roleMap.get(role.id)!);
        }
      }
    });

    return rootRoles;
  }

  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const { permissions } = await this.rbacRepository.getPermissions({
      is_active: true,
      page: 1,
      limit: 1000, // Get all active permissions
    });

    // Group by category
    const permissionsByCategory = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );

    return permissionsByCategory;
  }

  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    // Get all active user roles
    const userRoles = await this.getUserRolesByUserId(userId);

    if (userRoles.length === 0) {
      return [];
    }

    // Get all permissions for these roles
    const roleIds = userRoles.map((ur) => ur.role_id);
    const permissions = await this.rbacRepository
      .db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .select('permissions.*')
      .whereIn('role_permissions.role_id', roleIds)
      .where('permissions.is_active', true)
      .groupBy('permissions.id'); // Remove duplicates

    return permissions;
  }
}
