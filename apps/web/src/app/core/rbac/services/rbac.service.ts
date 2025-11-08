import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Role,
  Permission,
  UserRole,
  User,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignRoleRequest,
  BulkAssignRolesRequest,
  BulkRoleUpdateRequest,
  BulkPermissionUpdateRequest,
  BulkAssignRolesToUserRequest,
  ReplaceUserRolesRequest,
  RoleQuery,
  PermissionQuery,
  getPermissionName,
  UserRoleQuery,
  PaginatedResponse,
  ApiResponse,
  BulkOperationResponse,
  RbacStats,
  RoleHierarchyNode,
  PermissionCategory,
} from '../models/rbac.interfaces';

@Injectable({
  providedIn: 'root',
})
export class RbacService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/rbac';

  // ===== ROLE METHODS =====

  /**
   * Get paginated list of roles
   */
  getRoles(query?: RoleQuery): Observable<PaginatedResponse<Role>> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http
      .get<PaginatedResponse<Role>>(`${this.baseUrl}/roles`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get role by ID
   */
  getRoleById(
    id: string,
    includePermissions = true,
  ): Observable<ApiResponse<Role>> {
    let params = new HttpParams();
    if (includePermissions) {
      params = params.append('include_permissions', 'true');
    }

    return this.http
      .get<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new role
   */
  createRole(roleData: CreateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http
      .post<ApiResponse<Role>>(`${this.baseUrl}/roles`, roleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update role
   */
  updateRole(
    id: string,
    roleData: UpdateRoleRequest,
  ): Observable<ApiResponse<Role>> {
    return this.http
      .put<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`, roleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete role
   */
  deleteRole(id: string): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}/roles/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get role hierarchy as tree structure
   */
  getRoleHierarchy(): Observable<ApiResponse<RoleHierarchyNode[]>> {
    return this.http
      .get<ApiResponse<RoleHierarchyNode[]>>(`${this.baseUrl}/roles/hierarchy`)
      .pipe(
        map((response) => ({
          ...response,
          data: this.buildRoleTree(response.data as any[]),
        })),
        catchError(this.handleError),
      );
  }

  /**
   * Get permissions for a specific role
   */
  getRolePermissions(
    roleId: string,
  ): Observable<PaginatedResponse<Permission>> {
    return this.getRoleById(roleId, true).pipe(
      map((response) => {
        const permissions = response.data.permissions || [];
        return {
          success: true,
          data: permissions,
          pagination: {
            page: 1,
            limit: 1000,
            total: permissions.length,
            pages: 1,
            has_next: false,
            has_prev: false,
          },
          meta: response.meta,
        };
      }),
      catchError(this.handleError),
    );
  }

  // ===== PERMISSION METHODS =====

  /**
   * Get paginated list of permissions
   */
  getPermissions(
    query?: PermissionQuery,
  ): Observable<PaginatedResponse<Permission>> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http
      .get<
        PaginatedResponse<Permission>
      >(`${this.baseUrl}/permissions`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get permission by ID
   */
  getPermissionById(id: string): Observable<ApiResponse<Permission>> {
    return this.http
      .get<ApiResponse<Permission>>(`${this.baseUrl}/permissions/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new permission
   */
  createPermission(
    permissionData: CreatePermissionRequest,
  ): Observable<ApiResponse<Permission>> {
    return this.http
      .post<
        ApiResponse<Permission>
      >(`${this.baseUrl}/permissions`, permissionData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update permission
   */
  updatePermission(
    id: string,
    permissionData: UpdatePermissionRequest,
  ): Observable<ApiResponse<Permission>> {
    return this.http
      .put<
        ApiResponse<Permission>
      >(`${this.baseUrl}/permissions/${id}`, permissionData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete permission
   */
  deletePermission(id: string): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}/permissions/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get permissions grouped by category
   */
  getPermissionsByCategory(): Observable<
    ApiResponse<Record<string, Permission[]>>
  > {
    return this.http
      .get<
        ApiResponse<Record<string, Permission[]>>
      >(`${this.baseUrl}/permissions/by-category`)
      .pipe(
        map((response) => ({
          ...response,
          data: this.transformPermissionsToCategories(response.data),
        })),
        catchError(this.handleError),
      );
  }

  // ===== USER ROLE METHODS =====

  /**
   * Get paginated list of user role assignments
   */
  getUserRoles(query?: UserRoleQuery): Observable<PaginatedResponse<UserRole>> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http
      .get<
        PaginatedResponse<UserRole>
      >(`${this.baseUrl}/user-roles`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Assign role to user
   */
  assignRoleToUser(
    userId: string,
    assignData: AssignRoleRequest,
  ): Observable<ApiResponse<UserRole>> {
    return this.http
      .post<
        ApiResponse<UserRole>
      >(`${this.baseUrl}/users/${userId}/roles`, assignData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Remove role from user
   */
  removeRoleFromUser(
    userId: string,
    roleId: string,
  ): Observable<ApiResponse<any>> {
    return this.http
      .delete<
        ApiResponse<any>
      >(`${this.baseUrl}/users/${userId}/roles/${roleId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user's effective permissions
   */
  getUserEffectivePermissions(
    userId: string,
  ): Observable<ApiResponse<Permission[]>> {
    return this.http
      .get<
        ApiResponse<Permission[]>
      >(`${this.baseUrl}/users/${userId}/effective-permissions`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update user role expiry date
   */
  updateUserRoleExpiry(
    userId: string,
    roleId: string,
    expiresAt: Date | null,
  ): Observable<ApiResponse<UserRole>> {
    const body = {
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    };

    return this.http
      .put<
        ApiResponse<UserRole>
      >(`${this.baseUrl}/users/${userId}/roles/${roleId}/expiry`, body)
      .pipe(catchError(this.handleError));
  }

  // ===== BULK OPERATIONS =====

  /**
   * Bulk assign roles to multiple users
   */
  bulkAssignRoles(
    assignData: BulkAssignRolesRequest,
  ): Observable<ApiResponse<BulkOperationResponse>> {
    return this.http
      .post<
        ApiResponse<BulkOperationResponse>
      >(`${this.baseUrl}/bulk/assign-roles`, assignData)
      .pipe(catchError(this.handleError));
  }

  // ===== MULTI-ROLE MANAGEMENT METHODS =====

  /**
   * Assign multiple roles to a single user
   */
  bulkAssignRolesToUser(
    userId: string,
    assignData: BulkAssignRolesToUserRequest,
  ): Observable<ApiResponse<UserRole[]>> {
    return this.http
      .post<
        ApiResponse<UserRole[]>
      >(`${this.baseUrl}/users/${userId}/roles/bulk`, assignData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Replace all user roles with a new set
   */
  replaceUserRoles(
    userId: string,
    roleData: ReplaceUserRolesRequest,
  ): Observable<ApiResponse<UserRole[]>> {
    return this.http
      .put<
        ApiResponse<UserRole[]>
      >(`${this.baseUrl}/users/${userId}/roles`, roleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Bulk update multiple roles
   */
  bulkUpdateRoles(
    updateData: BulkRoleUpdateRequest,
  ): Observable<ApiResponse<BulkOperationResponse>> {
    return this.http
      .post<
        ApiResponse<BulkOperationResponse>
      >(`${this.baseUrl}/bulk/update-roles`, updateData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Bulk update multiple permissions
   */
  bulkUpdatePermissions(
    updateData: BulkPermissionUpdateRequest,
  ): Observable<ApiResponse<BulkOperationResponse>> {
    return this.http
      .post<
        ApiResponse<BulkOperationResponse>
      >(`${this.baseUrl}/bulk/update-permissions`, updateData)
      .pipe(catchError(this.handleError));
  }

  // ===== STATISTICS AND UTILITIES =====

  /**
   * Get RBAC system statistics
   */
  getRbacStats(): Observable<ApiResponse<RbacStats>> {
    return this.http
      .get<ApiResponse<RbacStats>>(`${this.baseUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get list of available role categories
   */
  getRoleCategories(): Observable<string[]> {
    return this.getRoles({ page: 1, limit: 1000 }).pipe(
      map((response) => {
        const categories = new Set(response.data.map((role) => role.category));
        return Array.from(categories).sort();
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get list of available permission categories
   */
  getPermissionCategories(): Observable<string[]> {
    return this.getPermissions({ page: 1, limit: 1000 }).pipe(
      map((response) => {
        const categories = new Set(
          response.data.map((permission) => permission.category),
        );
        return Array.from(categories).sort();
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get list of available resources
   */
  getResourceList(): Observable<string[]> {
    return this.getPermissions({ page: 1, limit: 1000 }).pipe(
      map((response) => {
        const resources = new Set(
          response.data.map((permission) => permission.resource),
        );
        return Array.from(resources).sort();
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get list of available actions
   */
  getActionList(): Observable<string[]> {
    return this.getPermissions({ page: 1, limit: 1000 }).pipe(
      map((response) => {
        const actions = new Set(
          response.data.map((permission) => permission.action),
        );
        return Array.from(actions).sort();
      }),
      catchError(this.handleError),
    );
  }

  // ===== USER METHODS (for user-role assignment) =====

  /**
   * Search users for role assignment
   */
  searchUsers(query: string, limit = 20): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .append('search', query)
      .append('limit', limit.toString());

    return this.http
      .get<PaginatedResponse<User>>('/users', { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`/users/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ===== UTILITY METHODS =====

  /**
   * Build role hierarchy tree from flat array
   */
  private buildRoleTree(roles: any[]): RoleHierarchyNode[] {
    const roleMap = new Map<string, RoleHierarchyNode>();
    const rootRoles: RoleHierarchyNode[] = [];

    // Convert to hierarchy nodes
    roles.forEach((role) => {
      const node: RoleHierarchyNode = {
        ...role,
        children: [],
        level: role.hierarchy_level || 0,
        hasChildren: false,
      };
      roleMap.set(role.id, node);
    });

    // Build tree structure
    roles.forEach((role) => {
      const node = roleMap.get(role.id)!;

      if (role.parent_role_id && roleMap.has(role.parent_role_id)) {
        const parent = roleMap.get(role.parent_role_id)!;
        parent.children!.push(node);
        parent.hasChildren = true;
      } else {
        rootRoles.push(node);
      }
    });

    return rootRoles.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Transform permissions by category response
   */
  private transformPermissionsToCategories(
    data: Record<string, Permission[]>,
  ): Record<string, Permission[]> {
    // The API already returns categorized permissions, but we might want to sort them
    const categorized: Record<string, Permission[]> = {};

    Object.entries(data).forEach(([category, permissions]) => {
      categorized[category] = permissions.sort((a, b) =>
        getPermissionName(a).localeCompare(getPermissionName(b)),
      );
    });

    return categorized;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    console.error('RBAC Service Error:', error);

    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error,
    }));
  };

  // ===== VALIDATION HELPERS =====

  /**
   * Validate role data
   */
  validateRoleData(roleData: CreateRoleRequest | UpdateRoleRequest): string[] {
    const errors: string[] = [];

    if ('name' in roleData && roleData.name) {
      if (roleData.name.length < 1 || roleData.name.length > 100) {
        errors.push('Role name must be between 1 and 100 characters');
      }
    }

    if ('category' in roleData && roleData.category) {
      if (roleData.category.length < 1 || roleData.category.length > 50) {
        errors.push('Category must be between 1 and 50 characters');
      }
    }

    if (
      'description' in roleData &&
      roleData.description &&
      typeof roleData.description === 'string'
    ) {
      if (roleData.description.length > 500) {
        errors.push('Description must not exceed 500 characters');
      }
    }

    return errors;
  }

  /**
   * Validate permission data
   */
  validatePermissionData(
    permissionData: CreatePermissionRequest | UpdatePermissionRequest,
  ): string[] {
    const errors: string[] = [];

    if ('name' in permissionData && permissionData.name) {
      if (permissionData.name.length < 1 || permissionData.name.length > 100) {
        errors.push('Permission name must be between 1 and 100 characters');
      }
    }

    if ('description' in permissionData && permissionData.description) {
      if (
        permissionData.description.length < 1 ||
        permissionData.description.length > 500
      ) {
        errors.push('Description must be between 1 and 500 characters');
      }
    }

    if ('resource' in permissionData && permissionData.resource) {
      if (
        permissionData.resource.length < 1 ||
        permissionData.resource.length > 50
      ) {
        errors.push('Resource must be between 1 and 50 characters');
      }
    }

    if ('action' in permissionData && permissionData.action) {
      if (
        permissionData.action.length < 1 ||
        permissionData.action.length > 50
      ) {
        errors.push('Action must be between 1 and 50 characters');
      }
    }

    if ('category' in permissionData && permissionData.category) {
      if (
        permissionData.category.length < 1 ||
        permissionData.category.length > 50
      ) {
        errors.push('Category must be between 1 and 50 characters');
      }
    }

    return errors;
  }

  /**
   * Check if role is deletable
   */
  isRoleDeletable(role: Role): boolean {
    return !role.is_system_role && role.user_count === 0;
  }

  /**
   * Check if permission is deletable
   */
  isPermissionDeletable(permission: Permission): boolean {
    return !permission.is_system_permission && permission.role_count === 0;
  }

  /**
   * Format expiry status
   */
  getExpiryStatus(userRole: UserRole): {
    status: 'active' | 'expiring' | 'expired';
    daysUntilExpiry?: number;
  } {
    if (!userRole.expires_at) {
      return { status: 'active' };
    }

    const expiryDate = new Date(userRole.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired' };
    } else if (diffDays <= 7) {
      return { status: 'expiring', daysUntilExpiry: diffDays };
    } else {
      return { status: 'active', daysUntilExpiry: diffDays };
    }
  }
}
