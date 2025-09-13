# RBAC API Contracts

> **🎯 API-First Design** - This document defines all API endpoints, request/response schemas, and error handling for the RBAC system.

**Last Updated**: 2025-09-13 14:50  
**API Version**: v1  
**Base URL**: `/api/rbac`

---

## 📋 API Overview

### Authentication
- All endpoints require valid JWT token
- Permission checks enforced at endpoint level
- Rate limiting: 100 requests/minute per user

### Response Format (TypeBox Schema)
```typescript
// Shared TypeBox Schema for consistency
export const ApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Any(),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String({ default: 'v1' }),
    requestId: Type.Optional(Type.String()),
    cacheInfo: Type.Optional(Type.Object({
      cached: Type.Boolean(),
      ttl: Type.Number(),
      source: Type.String()
    }))
  })
});

// Frontend TypeScript Interface (Auto-generated from TypeBox)
interface ApiResponse<T = any> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
    cacheInfo?: {
      cached: boolean;
      ttl: number;
      source: string;
    };
  };
}
```

### Enhanced Error Format with Frontend Specifications
```typescript
// TypeBox Error Schema
export const ApiErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Array(Type.String())),
    field: Type.Optional(Type.String()), // For field-specific validation errors
    suggestion: Type.Optional(Type.String()), // User-friendly suggestions
    retryable: Type.Optional(Type.Boolean()), // Whether frontend should retry
    retryAfter: Type.Optional(Type.Number()) // Seconds to wait before retry
  }),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
    requestId: Type.Optional(Type.String())
  })
});

// Frontend TypeScript Interface
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
    field?: string; // For form field highlighting
    suggestion?: string; // For user-friendly error messages
    retryable?: boolean; // For automatic retry logic
    retryAfter?: number; // For rate limiting feedback
  };
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// Frontend Error Handling Pattern
class RbacApiError extends Error {
  constructor(public apiError: ApiError) {
    super(apiError.error.message);
    this.name = 'RbacApiError';
  }
  
  get isRetryable(): boolean {
    return this.apiError.error.retryable ?? false;
  }
  
  get retryAfter(): number {
    return this.apiError.error.retryAfter ?? 0;
  }
}
```

---

## 🔐 Role Management Endpoints

### GET /api/rbac/roles
**Description**: List all roles with pagination and filtering

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  search?: string;         // Role name search
  category?: string;       // Filter by category
  active?: boolean;        // Filter by active status
  parentId?: string;       // Filter by parent role
  sortBy?: 'name' | 'createdAt' | 'hierarchy';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    roles: Role[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// TypeBox Schema for Role
export const RoleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  category: Type.String({ minLength: 1, maxLength: 50 }),
  isActive: Type.Boolean({ default: true }),
  parentId: Type.Optional(Type.String({ format: 'uuid' })),
  level: Type.Number({ minimum: 0, maximum: 10 }),
  permissions: Type.Array(Type.Ref('Permission')),
  userCount: Type.Number({ minimum: 0 }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

// Frontend TypeScript Interface (camelCase for frontend)
interface Role {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  parentId?: string;
  level: number;
  permissions: Permission[];
  userCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Frontend Service Interface Extensions
interface RoleWithFrontendMeta extends Role {
  // UI State
  isLoading?: boolean;
  isExpanded?: boolean; // For hierarchy tree
  hasUnsavedChanges?: boolean;
  
  // Computed Properties
  effectivePermissions?: Permission[]; // Including inherited
  canEdit?: boolean; // Based on current user permissions
  canDelete?: boolean; // Based on dependencies
  
  // Real-time State
  lastModified?: {
    by: string;
    at: string;
    isConflict?: boolean;
  };
}
```

**Permissions Required**: `role.list`

---

### GET /api/rbac/roles/:id
**Description**: Get specific role with full details

**Response**:
```typescript
{
  success: true;
  data: {
    role: Role & {
      children: Role[];
      ancestors: Role[];
      inheritedPermissions: Permission[];
      effectivePermissions: Permission[];
    };
  };
}
```

**Permissions Required**: `role.view`

---

### POST /api/rbac/roles
**Description**: Create new role

**Request Body**:
```typescript
{
  name: string;            // Required, unique
  description?: string;
  category: string;        // Required
  parentId?: string;       // Optional parent role
  permissions: string[];   // Array of permission IDs
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    role: Role;
  };
}
```

**Permissions Required**: `role.create`

---

### PUT /api/rbac/roles/:id
**Description**: Update existing role

**Request Body**:
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  parentId?: string;       // null to remove parent
  isActive?: boolean;
}
```

**Permissions Required**: `role.update`

---

### DELETE /api/rbac/roles/:id
**Description**: Soft delete role (marks as inactive)

**Query Parameters**:
```typescript
{
  force?: boolean;         // Hard delete if true
  reassignTo?: string;     // Role ID to reassign users to
}
```

**Permissions Required**: `role.delete`

---

## 🛡️ Permission Management Endpoints

### GET /api/rbac/permissions
**Description**: List all permissions with filtering

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  resource?: string;       // Filter by resource type
  action?: string;         // Filter by action type
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    permissions: Permission[];
    categories: string[];
    pagination: PaginationMeta;
  };
}

interface Permission {
  id: string;
  name: string;              // e.g., "user.create"
  description: string;
  category: string;          // e.g., "User Management"
  resource: string;          // e.g., "user"
  action: string;            // e.g., "create"
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Permissions Required**: `permission.list`

---

### POST /api/rbac/permissions
**Description**: Create new permission

**Request Body**:
```typescript
{
  name: string;              // Required, unique (format: resource.action)
  description: string;
  category: string;
  resource: string;
  action: string;
}
```

**Permissions Required**: `permission.create`

---

## 👥 User Role Management Endpoints

### GET /api/rbac/users/:userId/roles
**Description**: Get all roles assigned to a user

**Response**:
```typescript
{
  success: true;
  data: {
    userRoles: UserRole[];
    effectivePermissions: Permission[];
  };
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
}
```

**Permissions Required**: `user.role.view` or own user data

---

### POST /api/rbac/users/:userId/roles
**Description**: Assign role to user

**Request Body**:
```typescript
{
  roleId: string;
  expiresAt?: string;        // Optional expiration date
}
```

**Permissions Required**: `user.role.assign`

---

### DELETE /api/rbac/users/:userId/roles/:roleId
**Description**: Remove role from user

**Permissions Required**: `user.role.remove`

---

### POST /api/rbac/users/bulk-assign
**Description**: Bulk assign roles to multiple users

**Request Body**:
```typescript
{
  assignments: {
    userId: string;
    roleIds: string[];
    expiresAt?: string;
  }[];
}
```

**Permissions Required**: `user.role.bulk-assign`

---

## ✅ Permission Checking Endpoints

### POST /api/rbac/check-permission
**Description**: Check if user has specific permission(s)

**Request Body**:
```typescript
{
  permissions: string[];     // Array of permission names
  userId?: string;          // Default: current user
  context?: {               // Optional context for resource-specific permissions
    resourceId?: string;
    resourceType?: string;
    [key: string]: any;
  };
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    hasPermission: boolean;
    permissions: {
      [permissionName: string]: {
        granted: boolean;
        source: 'direct' | 'inherited' | 'denied';
        roleId?: string;
      };
    };
  };
}
```

**Permissions Required**: None (always accessible)

---

### GET /api/rbac/users/:userId/permissions
**Description**: Get all effective permissions for a user

**Query Parameters**:
```typescript
{
  includeInherited?: boolean; // Include inherited permissions
  groupByRole?: boolean;      // Group permissions by role
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    permissions: Permission[];
    rolePermissions?: {
      [roleId: string]: Permission[];
    };
  };
}
```

**Permissions Required**: `user.permission.view` or own user data

---

## 🏗️ Role Hierarchy Endpoints

### GET /api/rbac/hierarchy
**Description**: Get complete role hierarchy tree

**Response**:
```typescript
{
  success: true;
  data: {
    hierarchy: RoleHierarchyNode[];
  };
}

interface RoleHierarchyNode {
  role: Role;
  children: RoleHierarchyNode[];
  depth: number;
}
```

**Permissions Required**: `role.hierarchy.view`

---

### PUT /api/rbac/roles/:id/parent
**Description**: Change role parent (move in hierarchy)

**Request Body**:
```typescript
{
  parentId?: string;         // null to make root role
}
```

**Permissions Required**: `role.hierarchy.manage`

---

### POST /api/rbac/hierarchy/validate
**Description**: Validate hierarchy changes before applying

**Request Body**:
```typescript
{
  changes: {
    roleId: string;
    newParentId?: string;
  }[];
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    valid: boolean;
    conflicts: {
      type: 'circular_dependency' | 'depth_limit' | 'permission_conflict';
      roleId: string;
      message: string;
    }[];
  };
}
```

**Permissions Required**: `role.hierarchy.manage`

---

## 📊 Analytics & Reporting Endpoints

### GET /api/rbac/analytics/role-usage
**Description**: Get role usage statistics

**Response**:
```typescript
{
  success: true;
  data: {
    roleStats: {
      roleId: string;
      roleName: string;
      userCount: number;
      permissionCount: number;
      lastUsed: string;
    }[];
  };
}
```

**Permissions Required**: `rbac.analytics.view`

---

### GET /api/rbac/analytics/permission-usage
**Description**: Get permission usage statistics

**Response**:
```typescript
{
  success: true;
  data: {
    permissionStats: {
      permissionId: string;
      permissionName: string;
      roleCount: number;
      userCount: number;
      lastChecked: string;
    }[];
  };
}
```

**Permissions Required**: `rbac.analytics.view`

---

## 🔄 Real-time WebSocket Integration

> **🔗 Uses Universal WebSocket System** - RBAC now uses the shared WebSocket system described in `/docs/websocket-system.md`

### WebSocket Event Format
```typescript
// All RBAC events follow the universal format:
interface WebSocketMessage {
  feature: 'rbac';              // Feature identifier
  entity: 'role' | 'permission' | 'user_role' | 'hierarchy';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'revoked' | 'changed';
  data: any;                    // Event-specific payload
  meta: {
    timestamp: string;
    userId: string;
    sessionId: string;
    featureVersion: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
}
```

### RBAC Event Types
```typescript
// Role Events
'rbac.role.created'    // New role created
'rbac.role.updated'    // Role modified
'rbac.role.deleted'    // Role removed

// Permission Events  
'rbac.permission.assigned'  // Permission assigned to role
'rbac.permission.revoked'   // Permission removed from role

// User Role Events
'rbac.user_role.assigned'   // Role assigned to user
'rbac.user_role.revoked'    // Role removed from user

// Hierarchy Events
'rbac.hierarchy.changed'    // Role hierarchy modified
```

### Frontend Integration

#### State Manager Implementation
```typescript
// RBAC uses the BaseRealtimeStateManager from the universal system
import { BaseRealtimeStateManager } from '../../../shared/state/base-realtime-state.manager';
import { WebSocketService } from '../../../shared/services/websocket.service';

@Injectable({ providedIn: 'root' })
export class RbacRoleStateManager extends BaseRealtimeStateManager<Role> {
  constructor() {
    const config: StateManagerConfig = {
      feature: 'rbac',
      entity: 'role', 
      enableOptimisticUpdates: true,
      enableConflictDetection: true,
      enableCaching: true,
      cacheTTL: 300000 // 5 minutes
    };

    super(inject(WebSocketService), config);
  }

  // RBAC-specific methods
  getRolesByCategory(category: string): Role[] {
    return this.getItemsWhere(role => role.category === category);
  }

  getActiveRoles(): Role[] {
    return this.getItemsWhere(role => role.isActive);
  }

  async updateRole(id: string, updates: Partial<Role>, apiCall: () => Promise<Role>): Promise<Role> {
    return this.performOptimisticUpdate(id, updates, apiCall);
  }

  // Override for RBAC-specific behavior
  protected onItemUpdated(role: Role): void {
    super.onItemUpdated(role);
    this.invalidatePermissionCache(role.id);
  }
}
```

#### WebSocket Event Subscriptions
```typescript
// Automatic subscriptions through WebSocketService
export class RbacService {
  constructor(private websocket: WebSocketService) {
    // Subscribe to RBAC feature
    this.websocket.subscribe({ features: ['rbac'] });
    
    // Use convenience methods
    this.websocket.rbac.subscribeToRoleCreated().subscribe(role => {
      console.log('Role created:', role);
    });

    this.websocket.rbac.subscribeToPermissionAssigned().subscribe(data => {
      console.log('Permission assigned:', data);
    });
  }
}
```

### Migration from RBAC-specific WebSocket

> **📢 Migration Note**: Previous RBAC-specific WebSocket implementation has been replaced with the universal system. See `/docs/websocket-system.md` for complete documentation.

#### Benefits of Universal System
- **Consistent API**: Same patterns across all features
- **Type Safety**: Full TypeScript support with shared interfaces  
- **Performance**: Single WebSocket connection for all features
- **Maintainability**: Centralized WebSocket logic
- **Scalability**: Easy to add new features

---

## ⚡ Performance Optimization Patterns

### Caching Strategy with Frontend Integration
```typescript
// Frontend Caching Service
class RbacCacheService {
  private cache = new Map<string, CacheEntry>();
  
  // Permission Check Caching (5-minute TTL)
  async checkPermission(permissions: string[]): Promise<PermissionCheckResult> {
    const cacheKey = `permissions:${permissions.sort().join(',')}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached, 300)) { // 5 minutes
      return cached.data;
    }
    
    const result = await this.rbacService.checkPermission({ permissions });
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: 300
    });
    
    return result;
  }
  
  // Role Hierarchy Caching (15-minute TTL)
  async getRoleHierarchy(): Promise<RoleHierarchyNode[]> {
    const cacheKey = 'hierarchy:full';
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached, 900)) { // 15 minutes
      return cached.data;
    }
    
    const hierarchy = await this.rbacService.getHierarchy();
    this.cache.set(cacheKey, {
      data: hierarchy,
      timestamp: Date.now(),
      ttl: 900
    });
    
    return hierarchy;
  }
  
  // Cache Invalidation on Updates
  invalidatePermissionCache(roleId?: string) {
    if (roleId) {
      // Invalidate specific role-related caches
      for (const [key] of this.cache) {
        if (key.includes(`role:${roleId}`) || key.includes('permissions:')) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all permission-related caches
      for (const [key] of this.cache) {
        if (key.includes('permissions:') || key.includes('hierarchy:')) {
          this.cache.delete(key);
        }
      }
    }
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // seconds
}
```

### Angular Directives for Permission-Based UI
```typescript
// Permission-based Structural Directive
@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private subscription = new Subscription();
  
  @Input() hasPermission: string | string[] = [];
  @Input() hasPermissionRequireAll: boolean = false;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RbacService
  ) {}
  
  async ngOnInit() {
    const permissions = Array.isArray(this.hasPermission) 
      ? this.hasPermission 
      : [this.hasPermission];
    
    // Check permissions with caching
    const hasAccess = await this.rbacService.checkUserPermissions(
      permissions,
      this.hasPermissionRequireAll
    );
    
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
    
    // Subscribe to permission changes
    this.subscription.add(
      this.rbacService.permissionChanges$.subscribe(() => {
        this.ngOnInit(); // Re-check permissions
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

// Usage in Templates
/*
<div *hasPermission="'user.edit'">
  <button>Edit User</button>
</div>

<div *hasPermission="['user.delete', 'admin.access']; requireAll: true">
  <button>Delete User (Admin Only)</button>
</div>
*/
```

### Route Guards with RBAC Integration
```typescript
// Angular Route Guard with Permission Checking
@Injectable()
export class RbacGuard implements CanActivate, CanActivateChild {
  constructor(
    private rbacService: RbacService,
    private router: Router,
    private notificationService: NotificationService
  ) {}
  
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const requiredPermissions = route.data['permissions'] as string[];
    const requireAll = route.data['requireAllPermissions'] as boolean;
    
    if (!requiredPermissions?.length) {
      return true; // No permissions required
    }
    
    try {
      const hasAccess = await this.rbacService.checkUserPermissions(
        requiredPermissions,
        requireAll
      );
      
      if (!hasAccess) {
        this.notificationService.error(
          'Access denied. You do not have sufficient permissions.'
        );
        this.router.navigate(['/unauthorized']);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      this.router.navigate(['/error']);
      return false;
    }
  }
  
  async canActivateChild(route: ActivatedRouteSnapshot): Promise<boolean> {
    return this.canActivate(route);
  }
}

// Route Configuration
/*
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [RbacGuard],
  data: {
    permissions: ['admin.access'],
    requireAllPermissions: true
  },
  children: [
    {
      path: 'users',
      component: UserManagementComponent,
      canActivate: [RbacGuard],
      data: {
        permissions: ['user.list', 'user.view']
      }
    }
  ]
}
*/
```

---

## ❌ Error Codes

### Authentication Errors
- `AUTH_REQUIRED` (401): Authentication required
- `AUTH_INVALID` (401): Invalid authentication token
- `AUTH_EXPIRED` (401): Authentication token expired

### Authorization Errors
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `ROLE_ACCESS_DENIED` (403): Cannot access role due to hierarchy restrictions
- `RESOURCE_ACCESS_DENIED` (403): Cannot access specific resource

### Validation Errors
- `VALIDATION_ERROR` (400): Request validation failed
- `INVALID_ROLE_NAME` (400): Role name format invalid
- `INVALID_PERMISSION_NAME` (400): Permission name format invalid
- `CIRCULAR_DEPENDENCY` (400): Role hierarchy would create circular dependency
- `HIERARCHY_DEPTH_EXCEEDED` (400): Role hierarchy too deep

### Resource Errors
- `ROLE_NOT_FOUND` (404): Role does not exist
- `PERMISSION_NOT_FOUND` (404): Permission does not exist
- `USER_NOT_FOUND` (404): User does not exist
- `ROLE_ALREADY_EXISTS` (409): Role with name already exists
- `PERMISSION_ALREADY_EXISTS` (409): Permission with name already exists

### System Errors
- `INTERNAL_ERROR` (500): Internal server error
- `DATABASE_ERROR` (500): Database operation failed
- `CACHE_ERROR` (500): Cache operation failed

---

## 🔄 Rate Limiting

### Limits by Endpoint Type
- **Read Operations**: 200 requests/minute
- **Write Operations**: 50 requests/minute
- **Permission Checks**: 500 requests/minute
- **Bulk Operations**: 10 requests/minute

### Rate Limit Headers
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1694611200
```

---

## 📈 Performance Expectations

### Response Time Targets
- **Permission Checks**: <50ms (P95)
- **Role Queries**: <100ms (P95)
- **Bulk Operations**: <500ms (P95)
- **Analytics**: <1000ms (P95)

### Caching Strategy
- **Permission Checks**: 5-minute TTL with invalidation
- **Role Hierarchies**: 15-minute TTL with invalidation
- **User Permissions**: 10-minute TTL with invalidation

This API specification provides a comprehensive and secure foundation for the RBAC system with optimal performance characteristics.