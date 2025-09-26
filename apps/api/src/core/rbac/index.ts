// Export all public interfaces and types
export * from './rbac.schemas';
export * from './rbac.repository';
export * from './rbac.service';
export * from './rbac.controller';
export { default as rbacPlugin } from './rbac.plugin';

// Re-export types for external use
export type {
  Role,
  Permission,
  UserRole,
  RbacStats,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignRoleRequest,
  BulkAssignRolesRequest,
  BulkRoleUpdateRequest,
  BulkPermissionUpdateRequest,
  BulkOperationResponse,
  RoleQuery,
  PermissionQuery,
  UserRoleQuery,
} from './rbac.schemas';
