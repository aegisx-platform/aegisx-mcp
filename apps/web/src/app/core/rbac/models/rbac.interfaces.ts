export interface Role {
  id: string;
  name: string;
  description: string | null;
  category: string;
  parent_role_id: string | null;
  hierarchy_level: number;
  is_system_role: boolean;
  is_active: boolean;
  permissions: Permission[];
  user_count: number;
  created_at: string;
  updated_at: string;

  // Frontend-specific properties
  isLoading?: boolean;
  isExpanded?: boolean;
  hasUnsavedChanges?: boolean;
  effectivePermissions?: Permission[];
  canEdit?: boolean;
  canDelete?: boolean;
  isLocked?: boolean;
  lockedBy?: string;
  lockType?: string;

  // Real-time state
  lastModified?: {
    by: string;
    at: string;
    isConflict?: boolean;
  };
}

export interface Permission {
  id: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  is_system_permission: boolean;
  is_active: boolean;
  conditions: string | null;
  role_count: number;
  created_at: string;
  updated_at: string;
}

// Utility functions for permissions
export const getPermissionName = (permission: Permission): string => {
  return `${permission.resource}:${permission.action}`;
};

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Role;
  assigned_at: string;
  assigned_by: string | null;
  expires_at: string | null;
  is_active: boolean;

  // Frontend-specific properties
  isLoading?: boolean;
  isExpired?: boolean;
  isExpiring?: boolean;
  daysUntilExpiry?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request/Response types

export interface CreateRoleRequest {
  name: string;
  description?: string;
  category: string;
  parent_role_id?: string;
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
  category?: string;
  parent_role_id?: string | null;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  conditions?: string | null;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  category?: string;
  is_active?: boolean;
  conditions?: string | null;
}

export interface AssignRoleRequest {
  role_id: string;
  expires_at?: string | null;
}

export interface BulkAssignRolesRequest {
  user_ids: string[];
  role_id: string;
  expires_at?: string | null;
}

export interface BulkRoleUpdateRequest {
  role_ids: string[];
  updates: {
    is_active?: boolean;
    category?: string;
  };
}

export interface BulkPermissionUpdateRequest {
  permission_ids: string[];
  updates: {
    is_active?: boolean;
    category?: string;
  };
}

// Query parameters

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_active?: boolean;
  is_system_role?: boolean;
  parent_role_id?: string | 'null';
  include_permissions?: boolean;
  include_user_count?: boolean;
}

export interface PermissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  resource?: string;
  action?: string;
  is_active?: boolean;
  is_system_permission?: boolean;
  include_role_count?: boolean;
}

export interface UserRoleQuery {
  page?: number;
  limit?: number;
  user_id?: string;
  role_id?: string;
  is_active?: boolean;
  expires_before?: string;
  expires_after?: string;
  include_role?: boolean;
}

// Response types

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  meta: {
    request_id: string;
    timestamp: string;
    version: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
    version: string;
  };
}

export interface BulkOperationResponse {
  success_count: number;
  error_count: number;
  total_count: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

export interface RbacStats {
  total_roles: number;
  active_roles: number;
  system_roles: number;
  custom_roles: number;
  total_permissions: number;
  active_permissions: number;
  system_permissions: number;
  custom_permissions: number;
  total_user_roles: number;
  expiring_user_roles: number;
}

// UI-specific types

export interface RoleHierarchyNode extends Role {
  children?: RoleHierarchyNode[];
  level: number;
  hasChildren: boolean;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
  count: number;
  isExpanded?: boolean;
}

export interface RoleFormData {
  name: string;
  description?: string;
  category: string;
  parent_role_id?: string;
  permission_ids: string[];
}

export interface PermissionFormData {
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  conditions?: string;
}

export interface UserRoleAssignmentData {
  user_id: string;
  role_id: string;
  expires_at?: string;
}

// Filter and sort options

export interface RoleFilters {
  search: string;
  category: string | null;
  isActive: boolean | null;
  isSystemRole: boolean | null;
  parentRoleId: string | null;
}

export interface PermissionFilters {
  search: string;
  category: string | null;
  resource: string | null;
  action: string | null;
  isActive: boolean | null;
  isSystemPermission: boolean | null;
}

export interface UserRoleFilters {
  search: string;
  roleId: string | null;
  isActive: boolean | null;
  expiryStatus: 'all' | 'expiring' | 'expired' | 'active';
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Dialog data interfaces

export interface RoleDialogData {
  mode: 'create' | 'edit';
  role?: Role;
  availablePermissions: Permission[];
  availableRoles: Role[];
}

export interface PermissionDialogData {
  mode: 'create' | 'edit';
  permission?: Permission;
  availableCategories: string[];
  availableResources: string[];
  availableActions: string[];
}

export interface UserRoleDialogData {
  mode: 'assign' | 'edit';
  user?: User;
  userRole?: UserRole;
  availableRoles: Role[];
}

export interface BulkAssignDialogData {
  selectedUsers: User[];
  availableRoles: Role[];
}

// Action types for state management

export interface RbacAction {
  type:
    | 'LOAD_ROLES'
    | 'LOAD_PERMISSIONS'
    | 'LOAD_USER_ROLES'
    | 'CREATE_ROLE'
    | 'UPDATE_ROLE'
    | 'DELETE_ROLE'
    | 'CREATE_PERMISSION'
    | 'UPDATE_PERMISSION'
    | 'DELETE_PERMISSION'
    | 'ASSIGN_ROLE'
    | 'REMOVE_ROLE'
    | 'BULK_ASSIGN_ROLES'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'CLEAR_ERROR';
  payload?: any;
}

// Error types

export interface RbacError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

// Dashboard card types

export interface DashboardCard {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'accent' | 'warn';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  action?: {
    label: string;
    route: string;
  };
}

// Activity types

export interface RecentActivity {
  id: string;
  type:
    | 'role_created'
    | 'role_updated'
    | 'role_deleted'
    | 'permission_created'
    | 'permission_updated'
    | 'permission_deleted'
    | 'role_assigned'
    | 'role_removed'
    | 'bulk_operation';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
  metadata?: any;
}
