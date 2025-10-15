import Knex from 'knex';
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
  BulkRoleUpdateRequest,
  BulkPermissionUpdateRequest,
  BulkOperationResponse,
  RbacStats,
} from './rbac.schemas';
import {
  PaginationMeta,
  buildPaginationQuery,
} from '../../shared/pagination.utils';

export class RbacRepository {
  constructor(public db: any) {}

  // ===== ROLE METHODS =====

  async getRoles(
    query: RoleQuery,
  ): Promise<{ roles: Role[]; pagination: PaginationMeta }> {
    let baseQuery = this.db('roles')
      .select([
        'roles.*',
        this.db.raw('COALESCE(user_role_counts.user_count, 0) as user_count'),
      ])
      .leftJoin(
        this.db('user_roles')
          .select('role_id')
          .count('* as user_count')
          .where('is_active', true)
          .groupBy('role_id')
          .as('user_role_counts'),
        'roles.id',
        'user_role_counts.role_id',
      );

    // Apply filters
    if (query.search) {
      baseQuery = baseQuery.where(function () {
        this.where('roles.name', 'ilike', `%${query.search}%`).orWhere(
          'roles.description',
          'ilike',
          `%${query.search}%`,
        );
      });
    }

    if (query.category) {
      baseQuery = baseQuery.where('roles.category', query.category);
    }

    if (typeof query.is_active === 'boolean') {
      baseQuery = baseQuery.where('roles.is_active', query.is_active);
    }

    if (typeof query.is_system_role === 'boolean') {
      baseQuery = baseQuery.where('roles.is_system_role', query.is_system_role);
    }

    if (query.parent_role_id) {
      if (query.parent_role_id === 'null') {
        baseQuery = baseQuery.whereNull('roles.parent_role_id');
      } else {
        baseQuery = baseQuery.where(
          'roles.parent_role_id',
          query.parent_role_id,
        );
      }
    }

    // Build paginated query
    const { items: roles, pagination } = await buildPaginationQuery(
      baseQuery,
      query,
      'roles.created_at',
      'desc',
    );

    // Load permissions if requested
    if (query.include_permissions && roles.length > 0) {
      const roleIds = roles.map((role: any) => role.id);
      const rolePermissions = await this.db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .select([
          'role_permissions.role_id',
          'permissions.id',
          'permissions.resource',
          'permissions.action',
          'permissions.description',
        ])
        .whereIn('role_permissions.role_id', roleIds)
        .where('permissions.is_active', true);

      // Group permissions by role
      const permissionsByRole = rolePermissions.reduce(
        (acc, rp) => {
          if (!acc[rp.role_id]) {
            acc[rp.role_id] = [];
          }
          acc[rp.role_id].push({
            id: rp.id,
            resource: rp.resource,
            action: rp.action,
            description: rp.description,
          });
          return acc;
        },
        {} as Record<string, any[]>,
      );

      // Attach permissions to roles
      (roles as any[]).forEach((role: any) => {
        role.permissions = permissionsByRole[role.id] || [];
      });
    } else {
      (roles as any[]).forEach((role: any) => {
        role.permissions = [];
      });
    }

    return { roles: roles as Role[], pagination };
  }

  async getRoleById(
    id: string,
    includePermissions = true,
  ): Promise<Role | null> {
    const role = await this.db('roles')
      .select([
        'roles.*',
        this.db.raw('COALESCE(user_role_counts.user_count, 0) as user_count'),
      ])
      .leftJoin(
        this.db('user_roles')
          .select('role_id')
          .count('* as user_count')
          .where('is_active', true)
          .groupBy('role_id')
          .as('user_role_counts'),
        'roles.id',
        'user_role_counts.role_id',
      )
      .where('roles.id', id)
      .first();

    if (!role) return null;

    // Load permissions
    if (includePermissions) {
      const permissions = await this.db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .select([
          'permissions.id',
          'permissions.resource',
          'permissions.action',
          'permissions.description',
        ])
        .where('role_permissions.role_id', id)
        .where('permissions.is_active', true);

      (role as any).permissions = permissions;
    } else {
      (role as any).permissions = [];
    }

    return role as unknown as Role | null;
  }

  async createRole(data: CreateRoleRequest, createdBy: string): Promise<Role> {
    return await this.db.transaction(async (trx) => {
      // Determine hierarchy level
      let hierarchyLevel = 0;
      if (data.parent_role_id) {
        const parentRole = await trx('roles')
          .select('hierarchy_level')
          .where('id', data.parent_role_id)
          .first();

        if (!parentRole) {
          throw new Error('Parent role not found');
        }

        hierarchyLevel = parentRole.hierarchy_level + 1;
      }

      // Create role
      const [role] = await trx('roles')
        .insert({
          name: data.name,
          description: data.description || null,
          category: data.category,
          parent_role_id: data.parent_role_id || null,
          hierarchy_level: hierarchyLevel,
          is_system_role: false,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Assign permissions if provided
      if (data.permission_ids && data.permission_ids.length > 0) {
        const rolePermissions = data.permission_ids.map((permissionId) => ({
          role_id: role.id,
          permission_id: permissionId,
          created_at: new Date(),
        }));

        await trx('role_permissions').insert(rolePermissions);
      }

      // Return role with permissions
      return (await this.getRoleById(role.id, true)) as Role;
    });
  }

  async updateRole(
    id: string,
    data: UpdateRoleRequest,
    updatedBy: string,
  ): Promise<Role | null> {
    return await this.db.transaction(async (trx) => {
      // Check if role exists
      const existingRole = await trx('roles').where('id', id).first();
      if (!existingRole) return null;

      // Prepare update data
      const updateData: any = {
        updated_at: new Date(),
      };

      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      // Handle parent role change
      if (data.parent_role_id !== undefined) {
        updateData.parent_role_id = data.parent_role_id;

        if (data.parent_role_id) {
          const parentRole = await trx('roles')
            .select('hierarchy_level')
            .where('id', data.parent_role_id)
            .first();

          if (!parentRole) {
            throw new Error('Parent role not found');
          }

          updateData.hierarchy_level = parentRole.hierarchy_level + 1;
        } else {
          updateData.hierarchy_level = 0;
        }
      }

      // Update role
      await trx('roles').where('id', id).update(updateData);

      // Update permissions if provided
      if (data.permission_ids !== undefined) {
        // Remove existing permissions
        await trx('role_permissions').where('role_id', id).del();

        // Add new permissions
        if (data.permission_ids.length > 0) {
          const rolePermissions = data.permission_ids.map((permissionId) => ({
            role_id: id,
            permission_id: permissionId,
            created_at: new Date(),
          }));

          await trx('role_permissions').insert(rolePermissions);
        }
      }

      // Return updated role
      return (await this.getRoleById(id, true)) as Role;
    });
  }

  async deleteRole(id: string): Promise<boolean> {
    return await this.db.transaction(async (trx) => {
      // Check if role has users
      const userRoleCount = await trx('user_roles')
        .where('role_id', id)
        .where('is_active', true)
        .count('* as count')
        .first();

      if (userRoleCount && parseInt(userRoleCount.count as string) > 0) {
        throw new Error('Cannot delete role with assigned users');
      }

      // Check if role is system role
      const role = await trx('roles').where('id', id).first();
      if (role?.is_system_role) {
        throw new Error('Cannot delete system role');
      }

      // Delete role permissions
      await trx('role_permissions').where('role_id', id).del();

      // Delete role
      const deletedCount = await trx('roles').where('id', id).del();

      return deletedCount > 0;
    });
  }

  // ===== PERMISSION METHODS =====

  async getPermissions(
    query: PermissionQuery,
  ): Promise<{ permissions: Permission[]; pagination: PaginationMeta }> {
    let baseQuery = this.db('permissions')
      .select([
        'permissions.*',
        this.db.raw(
          'COALESCE(role_permission_counts.role_count, 0) as role_count',
        ),
      ])
      .leftJoin(
        this.db('role_permissions')
          .select('permission_id')
          .count('* as role_count')
          .groupBy('permission_id')
          .as('role_permission_counts'),
        'permissions.id',
        'role_permission_counts.permission_id',
      );

    // Apply filters
    if (query.search) {
      baseQuery = baseQuery.where(function () {
        this.where('permissions.description', 'ilike', `%${query.search}%`)
          .orWhere('permissions.resource', 'ilike', `%${query.search}%`)
          .orWhere('permissions.action', 'ilike', `%${query.search}%`);
      });
    }

    if (query.category) {
      baseQuery = baseQuery.where('permissions.category', query.category);
    }

    if (query.resource) {
      baseQuery = baseQuery.where('permissions.resource', query.resource);
    }

    if (query.action) {
      baseQuery = baseQuery.where('permissions.action', query.action);
    }

    if (typeof query.is_active === 'boolean') {
      baseQuery = baseQuery.where('permissions.is_active', query.is_active);
    }

    if (typeof query.is_system_permission === 'boolean') {
      baseQuery = baseQuery.where(
        'permissions.is_system_permission',
        query.is_system_permission,
      );
    }

    // Build paginated query
    const { items: permissions, pagination } = await buildPaginationQuery(
      baseQuery,
      query,
      'permissions.created_at',
      'desc',
    );

    return { permissions: permissions as Permission[], pagination };
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    const permission = await this.db('permissions')
      .select([
        'permissions.*',
        this.db.raw(
          'COALESCE(role_permission_counts.role_count, 0) as role_count',
        ),
      ])
      .leftJoin(
        this.db('role_permissions')
          .select('permission_id')
          .count('* as role_count')
          .groupBy('permission_id')
          .as('role_permission_counts'),
        'permissions.id',
        'role_permission_counts.permission_id',
      )
      .where('permissions.id', id)
      .first();

    return permission as unknown as Permission | null;
  }

  async createPermission(
    data: CreatePermissionRequest,
    createdBy: string,
  ): Promise<Permission> {
    // Check for duplicate resource-action combination
    const existing = await this.db('permissions')
      .where('resource', data.resource)
      .where('action', data.action)
      .first();

    if (existing) {
      throw new Error(
        'Permission with this resource and action already exists',
      );
    }

    const [permission] = await this.db('permissions')
      .insert({
        description: data.description,
        resource: data.resource,
        action: data.action,
        category: data.category,
        conditions: data.conditions || null,
        is_system_permission: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return (await this.getPermissionById(permission.id)) as Permission;
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest,
    updatedBy: string,
  ): Promise<Permission | null> {
    const existingPermission = await this.db('permissions')
      .where('id', id)
      .first();
    if (!existingPermission) return null;

    // Check if it's a system permission
    if (
      (existingPermission.is_system_permission &&
        data.resource !== undefined) ||
      data.action !== undefined
    ) {
      throw new Error('Cannot modify resource or action of system permission');
    }

    // Check for duplicate if resource or action is being changed
    if (data.resource !== undefined || data.action !== undefined) {
      const resource = data.resource ?? existingPermission.resource;
      const action = data.action ?? existingPermission.action;

      const duplicate = await this.db('permissions')
        .where('resource', resource)
        .where('action', action)
        .where('id', '!=', id)
        .first();

      if (duplicate) {
        throw new Error(
          'Permission with this resource and action already exists',
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.resource !== undefined) updateData.resource = data.resource;
    if (data.action !== undefined) updateData.action = data.action;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.conditions !== undefined) updateData.conditions = data.conditions;

    await this.db('permissions').where('id', id).update(updateData);

    return (await this.getPermissionById(id)) as Permission;
  }

  async deletePermission(id: string): Promise<boolean> {
    return await this.db.transaction(async (trx) => {
      // Check if permission is system permission
      const permission = await trx('permissions').where('id', id).first();
      if (permission?.is_system_permission) {
        throw new Error('Cannot delete system permission');
      }

      // Delete from role_permissions
      await trx('role_permissions').where('permission_id', id).del();

      // Delete permission
      const deletedCount = await trx('permissions').where('id', id).del();

      return deletedCount > 0;
    });
  }

  // ===== USER-ROLE METHODS =====

  async getUserRoles(
    query: UserRoleQuery,
  ): Promise<{ userRoles: UserRole[]; pagination: PaginationMeta }> {
    let baseQuery = this.db('user_roles')
      .select([
        'user_roles.*',
        'roles.name as role_name',
        'roles.description as role_description',
        'roles.category as role_category',
        'roles.is_system_role as role_is_system_role',
      ])
      .join('roles', 'user_roles.role_id', 'roles.id');

    // Apply filters
    if (query.user_id) {
      baseQuery = baseQuery.where('user_roles.user_id', query.user_id);
    }

    if (query.role_id) {
      baseQuery = baseQuery.where('user_roles.role_id', query.role_id);
    }

    if (typeof query.is_active === 'boolean') {
      baseQuery = baseQuery.where('user_roles.is_active', query.is_active);
    }

    if (query.expires_before) {
      baseQuery = baseQuery.where(
        'user_roles.expires_at',
        '<',
        query.expires_before,
      );
    }

    if (query.expires_after) {
      baseQuery = baseQuery.where(
        'user_roles.expires_at',
        '>',
        query.expires_after,
      );
    }

    // Build paginated query
    const { items: userRoles, pagination } = await buildPaginationQuery(
      baseQuery,
      query,
      'user_roles.assigned_at',
      'desc',
    );

    // Transform to include role object
    const transformedUserRoles = userRoles.map((ur: any) => ({
      id: ur.id,
      user_id: ur.user_id,
      role_id: ur.role_id,
      role: {
        id: ur.role_id,
        name: ur.role_name,
        description: ur.role_description,
        category: ur.role_category,
        parent_role_id: null,
        hierarchy_level: 0,
        is_system_role: ur.role_is_system_role,
        is_active: true,
        permissions: [],
        user_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      assigned_at: ur.assigned_at,
      assigned_by: ur.assigned_by,
      expires_at: ur.expires_at,
      is_active: ur.is_active,
    }));

    return { userRoles: transformedUserRoles, pagination };
  }

  async assignRoleToUser(
    userId: string,
    data: AssignRoleRequest,
    assignedBy: string,
  ): Promise<UserRole> {
    // Check if role assignment already exists
    const existing = await this.db('user_roles')
      .where('user_id', userId)
      .where('role_id', data.role_id)
      .where('is_active', true)
      .first();

    if (existing) {
      throw new Error('User already has this role assigned');
    }

    const [userRole] = await this.db('user_roles')
      .insert({
        user_id: userId,
        role_id: data.role_id,
        assigned_at: new Date(),
        assigned_by: assignedBy,
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
        is_active: true,
      })
      .returning('*');

    // Get the full UserRole with role data
    const result = await this.db('user_roles')
      .select(['user_roles.*', 'roles.*'])
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.id', userRole.id)
      .first();

    return {
      id: result.id,
      user_id: result.user_id,
      role_id: result.role_id,
      role: {
        id: result.role_id,
        name: result.name,
        description: result.description,
        category: result.category,
        parent_role_id: result.parent_role_id,
        hierarchy_level: result.hierarchy_level,
        is_system_role: result.is_system_role,
        is_active: result.is_active,
        permissions: [],
        user_count: 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
      assigned_at: result.assigned_at,
      assigned_by: result.assigned_by,
      expires_at: result.expires_at,
      is_active: result.is_active,
    };
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const deletedCount = await this.db('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .update({ is_active: false, updated_at: new Date() });

    return deletedCount > 0;
  }

  async updateUserRoleExpiry(
    userId: string,
    roleId: string,
    expiresAt: string | null,
  ): Promise<boolean> {
    const updatedCount = await this.db('user_roles')
      .where('user_id', userId)
      .where('role_id', roleId)
      .where('is_active', true)
      .update({
        expires_at: expiresAt,
        updated_at: new Date(),
      });

    return updatedCount > 0;
  }

  // ===== BULK OPERATIONS =====

  async bulkUpdateRoles(
    data: BulkRoleUpdateRequest,
    updatedBy: string,
  ): Promise<BulkOperationResponse> {
    const results: BulkOperationResponse = {
      success_count: 0,
      error_count: 0,
      total_count: data.role_ids.length,
      errors: [],
    };

    for (const roleId of data.role_ids) {
      try {
        await this.updateRole(
          roleId,
          data.updates as UpdateRoleRequest,
          updatedBy,
        );
        results.success_count++;
      } catch (error) {
        results.error_count++;
        results.errors.push({
          id: roleId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async bulkUpdatePermissions(
    data: BulkPermissionUpdateRequest,
    updatedBy: string,
  ): Promise<BulkOperationResponse> {
    const results: BulkOperationResponse = {
      success_count: 0,
      error_count: 0,
      total_count: data.permission_ids.length,
      errors: [],
    };

    for (const permissionId of data.permission_ids) {
      try {
        await this.updatePermission(
          permissionId,
          data.updates as UpdatePermissionRequest,
          updatedBy,
        );
        results.success_count++;
      } catch (error) {
        results.error_count++;
        results.errors.push({
          id: permissionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // ===== STATISTICS =====

  async getRbacStats(): Promise<RbacStats> {
    const [roleStats, permissionStats, userRoleStats, expiringRoles] =
      await Promise.all([
        // Role statistics
        this.db('roles')
          .select([
            this.db.raw('COUNT(*) as total_roles'),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_active = true) as active_roles',
            ),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_system_role = true) as system_roles',
            ),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_system_role = false) as custom_roles',
            ),
          ])
          .first(),

        // Permission statistics
        this.db('permissions')
          .select([
            this.db.raw('COUNT(*) as total_permissions'),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_active = true) as active_permissions',
            ),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_system_permission = true) as system_permissions',
            ),
            this.db.raw(
              'COUNT(*) FILTER (WHERE is_system_permission = false) as custom_permissions',
            ),
          ])
          .first(),

        // User role statistics
        this.db('user_roles')
          .select(this.db.raw('COUNT(*) as total_user_roles'))
          .where('is_active', true)
          .first(),

        // Expiring roles (within 30 days)
        this.db('user_roles')
          .select(this.db.raw('COUNT(*) as expiring_user_roles'))
          .where('is_active', true)
          .where(
            'expires_at',
            '<=',
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          )
          .whereNotNull('expires_at')
          .first(),
      ]);

    return {
      total_roles: parseInt((roleStats as any).total_roles),
      active_roles: parseInt((roleStats as any).active_roles),
      system_roles: parseInt((roleStats as any).system_roles),
      custom_roles: parseInt((roleStats as any).custom_roles),
      total_permissions: parseInt((permissionStats as any).total_permissions),
      active_permissions: parseInt((permissionStats as any).active_permissions),
      system_permissions: parseInt((permissionStats as any).system_permissions),
      custom_permissions: parseInt((permissionStats as any).custom_permissions),
      total_user_roles: parseInt((userRoleStats as any).total_user_roles),
      expiring_user_roles: parseInt((expiringRoles as any).expiring_user_roles),
    };
  }
}
