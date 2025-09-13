# RBAC Management API Contracts

> **🎯 Admin-Focused API Design** - This document defines all administrative API endpoints for managing the RBAC system through the admin interface.

**Last Updated**: 2025-09-13 15:05  
**API Version**: v1  
**Base URL**: `/api/admin/rbac`

---

## 📋 API Overview

### Authentication & Authorization
- All endpoints require admin-level authentication
- Specific admin permissions required for each operation
- Enhanced audit logging for all administrative actions
- Rate limiting: 200 requests/minute for read operations, 50/minute for write operations

### Enhanced Response Format
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2025-09-13T15:05:00Z",
    "version": "v1",
    "requestId": "req_123456789",
    "auditId": "audit_987654321"
  }
}
```

### Admin Error Format
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_INSUFFICIENT_PERMISSIONS",
    "message": "Administrator does not have required permissions for this operation",
    "details": ["Required permission: rbac.admin.manage"],
    "suggestion": "Contact system administrator to request rbac.admin.manage permission"
  },
  "meta": {
    "timestamp": "2025-09-13T15:05:00Z",
    "version": "v1",
    "requestId": "req_123456789"
  }
}
```

---

## 👥 Admin Role Management Endpoints

### GET /api/admin/rbac/roles
**Description**: Admin interface for comprehensive role management

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;           // Max: 500 for admin interface
  search?: string;
  category?: string;
  active?: boolean;
  parentId?: string;
  sortBy?: 'name' | 'createdAt' | 'userCount' | 'hierarchy';
  sortOrder?: 'asc' | 'desc';
  includeStats?: boolean;   // Include usage statistics
  includeUsers?: boolean;   // Include assigned users count
  includeHierarchy?: boolean; // Include full hierarchy data
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    roles: AdminRole[];
    categories: string[];
    statistics: {
      totalRoles: number;
      activeRoles: number;
      totalAssignments: number;
      unusedRoles: number;
    };
    pagination: PaginationMeta;
  };
}

interface AdminRole extends Role {
  userCount: number;
  permissionCount: number;
  hierarchyLevel: number;
  lastUsed?: string;
  createdBy: UserSummary;
  modifiedBy: UserSummary;
  assignedUsers?: UserSummary[];
  childRoles?: AdminRole[];
  parentRoles?: AdminRole[];
  usageStats: {
    loginCount: number;
    lastLogin?: string;
    popularityScore: number;
  };
}
```

**Permissions Required**: `rbac.admin.role.list`

---

### POST /api/admin/rbac/roles
**Description**: Create role with enhanced admin validation

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  category: string;
  parentId?: string;
  permissions: string[];
  isActive?: boolean;      // Default: true
  notes?: string;          // Admin notes
  expirationDate?: string; // Optional role expiration
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    role: AdminRole;
    auditEntry: AuditEntry;
    validationWarnings?: string[]; // Non-critical issues
  };
}
```

**Permissions Required**: `rbac.admin.role.create`

---

### PUT /api/admin/rbac/roles/:id
**Description**: Update role with impact analysis

**Request Body**:
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  parentId?: string;
  isActive?: boolean;
  notes?: string;
  expirationDate?: string;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    role: AdminRole;
    impactAnalysis: {
      affectedUsers: number;
      affectedPermissions: string[];
      hierarchyChanges: string[];
      estimatedDowntime?: string;
    };
    auditEntry: AuditEntry;
  };
}
```

**Permissions Required**: `rbac.admin.role.update`

---

### POST /api/admin/rbac/roles/bulk-create
**Description**: Bulk role creation with validation

**Request Body**:
```typescript
{
  roles: {
    name: string;
    description?: string;
    category: string;
    parentId?: string;
    permissions: string[];
  }[];
  validateOnly?: boolean;  // Dry run validation
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    created: AdminRole[];
    failed: {
      role: any;
      errors: string[];
    }[];
    validationSummary: {
      total: number;
      successful: number;
      failed: number;
      warnings: string[];
    };
  };
}
```

**Permissions Required**: `rbac.admin.role.bulk-create`

---

### POST /api/admin/rbac/roles/:id/duplicate
**Description**: Duplicate role with permission copying

**Request Body**:
```typescript
{
  newName: string;
  copyPermissions?: boolean; // Default: true
  copyHierarchy?: boolean;   // Default: false
  suffix?: string;           // Default: " (Copy)"
}
```

**Permissions Required**: `rbac.admin.role.duplicate`

---

## 🛡️ Admin Permission Management Endpoints

### GET /api/admin/rbac/permissions
**Description**: Comprehensive permission management interface

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  resource?: string;
  action?: string;
  unused?: boolean;        // Show unused permissions
  systemOnly?: boolean;    // Show only system permissions
  includeUsage?: boolean;  // Include usage statistics
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    permissions: AdminPermission[];
    categories: PermissionCategory[];
    resources: string[];
    actions: string[];
    statistics: {
      totalPermissions: number;
      unusedPermissions: number;
      mostUsedPermissions: AdminPermission[];
    };
    pagination: PaginationMeta;
  };
}

interface AdminPermission extends Permission {
  roleCount: number;
  userCount: number;
  lastUsed?: string;
  usageFrequency: number;
  relatedPermissions: string[];
  dependencies: string[];
}

interface PermissionCategory {
  name: string;
  description: string;
  permissionCount: number;
  color?: string;          // UI color coding
}
```

**Permissions Required**: `rbac.admin.permission.list`

---

### POST /api/admin/rbac/permissions/bulk-assign
**Description**: Bulk permission assignment to roles

**Request Body**:
```typescript
{
  operations: {
    roleId: string;
    permissionsToAdd: string[];
    permissionsToRemove: string[];
  }[];
  validateOnly?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    successful: {
      roleId: string;
      added: string[];
      removed: string[];
    }[];
    failed: {
      roleId: string;
      errors: string[];
    }[];
    impactSummary: {
      affectedUsers: number;
      affectedRoles: number;
      permissionChanges: number;
    };
  };
}
```

**Permissions Required**: `rbac.admin.permission.bulk-assign`

---

## 👤 Admin User Role Management Endpoints

### GET /api/admin/rbac/users
**Description**: User role management interface

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;         // Name, email, username
  roleId?: string;         // Filter by assigned role
  hasRole?: boolean;       // Users with/without roles
  lastLogin?: string;      // Date range filter
  sortBy?: 'name' | 'email' | 'lastLogin' | 'roleCount';
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    users: AdminUserSummary[];
    roleDistribution: {
      roleId: string;
      roleName: string;
      userCount: number;
    }[];
    statistics: {
      totalUsers: number;
      usersWithRoles: number;
      usersWithoutRoles: number;
      averageRolesPerUser: number;
    };
    pagination: PaginationMeta;
  };
}

interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive: boolean;
  lastLogin?: string;
  roles: {
    id: string;
    name: string;
    assignedAt: string;
    assignedBy: string;
    expiresAt?: string;
  }[];
  effectivePermissions: string[];
  roleCount: number;
}
```

**Permissions Required**: `rbac.admin.user.list`

---

### POST /api/admin/rbac/users/bulk-assign-roles
**Description**: Bulk user role assignment with conflict resolution

**Request Body**:
```typescript
{
  assignments: {
    userId: string;
    rolesToAdd: string[];
    rolesToRemove: string[];
    expirationDate?: string;
  }[];
  conflictResolution?: 'skip' | 'overwrite' | 'merge';
  sendNotifications?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    successful: {
      userId: string;
      rolesAdded: string[];
      rolesRemoved: string[];
      conflicts: string[];
    }[];
    failed: {
      userId: string;
      errors: string[];
    }[];
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
      notificationsSent: number;
    };
  };
}
```

**Permissions Required**: `rbac.admin.user.bulk-assign`

---

## 📊 Permission Matrix Endpoints

### GET /api/admin/rbac/permission-matrix
**Description**: Generate permission matrix for visualization

**Query Parameters**:
```typescript
{
  roleIds?: string[];      // Specific roles, empty = all
  permissionIds?: string[]; // Specific permissions, empty = all
  category?: string;       // Filter by permission category
  format?: 'grid' | 'tree' | 'flat'; // Matrix format
  includeInherited?: boolean; // Include inherited permissions
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    matrix: PermissionMatrixEntry[][];
    roles: Role[];
    permissions: Permission[];
    metadata: {
      totalCells: number;
      grantedCount: number;
      deniedCount: number;
      inheritedCount: number;
    };
  };
}

interface PermissionMatrixEntry {
  roleId: string;
  permissionId: string;
  status: 'granted' | 'denied' | 'inherited';
  source?: string;         // Source role for inherited permissions
  canModify: boolean;
}
```

**Permissions Required**: `rbac.admin.matrix.view`

---

### PUT /api/admin/rbac/permission-matrix
**Description**: Batch update permission matrix

**Request Body**:
```typescript
{
  changes: {
    roleId: string;
    permissionId: string;
    action: 'grant' | 'deny' | 'remove';
  }[];
  validateOnly?: boolean;
}
```

**Permissions Required**: `rbac.admin.matrix.update`

---

## 🏗️ Admin Hierarchy Management Endpoints

### GET /api/admin/rbac/hierarchy/tree
**Description**: Enhanced hierarchy visualization data

**Response**:
```typescript
{
  success: true;
  data: {
    tree: HierarchyNode[];
    metadata: {
      maxDepth: number;
      totalNodes: number;
      orphanedRoles: Role[];
      circularDependencies: string[];
    };
  };
}

interface HierarchyNode {
  role: AdminRole;
  children: HierarchyNode[];
  depth: number;
  path: string[];          // Path from root
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
}
```

**Permissions Required**: `rbac.admin.hierarchy.view`

---

### POST /api/admin/rbac/hierarchy/validate-move
**Description**: Validate hierarchy move before execution

**Request Body**:
```typescript
{
  roleId: string;
  newParentId?: string;    // null for root level
  position?: number;       // Position among siblings
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    valid: boolean;
    warnings: string[];
    errors: string[];
    impactAnalysis: {
      affectedRoles: string[];
      affectedUsers: number;
      permissionChanges: string[];
    };
  };
}
```

**Permissions Required**: `rbac.admin.hierarchy.validate`

---

## 📈 Admin Analytics Endpoints

### GET /api/admin/rbac/analytics/dashboard
**Description**: Admin dashboard analytics data

**Query Parameters**:
```typescript
{
  period?: 'day' | 'week' | 'month' | 'quarter';
  includeInactive?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    overview: {
      totalUsers: number;
      totalRoles: number;
      totalPermissions: number;
      recentChanges: number;
    };
    usage: {
      mostUsedRoles: RoleUsageStat[];
      leastUsedRoles: RoleUsageStat[];
      permissionUtilization: PermissionUsageStat[];
    };
    trends: {
      userGrowth: TimeSeries[];
      roleUsage: TimeSeries[];
      systemActivity: TimeSeries[];
    };
    health: {
      unusedRoles: number;
      orphanedPermissions: number;
      systemLoad: number;
      cacheHitRate: number;
    };
  };
}
```

**Permissions Required**: `rbac.admin.analytics.view`

---

### GET /api/admin/rbac/analytics/reports
**Description**: Generate detailed RBAC reports

**Query Parameters**:
```typescript
{
  reportType: 'user-roles' | 'role-permissions' | 'audit-summary' | 'compliance';
  startDate: string;
  endDate: string;
  format?: 'json' | 'csv' | 'pdf';
  includeInactive?: boolean;
}
```

**Permissions Required**: `rbac.admin.reports.generate`

---

## 🔍 Admin Audit Endpoints

### GET /api/admin/rbac/audit
**Description**: Comprehensive audit trail with advanced filtering

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;         // Filter by user who made changes
  targetUserId?: string;   // Filter by user affected by changes
  action?: 'create' | 'update' | 'delete' | 'assign' | 'remove';
  entityType?: 'role' | 'permission' | 'user_role';
  entityId?: string;
  severity?: 'info' | 'warning' | 'critical';
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    auditEntries: AuditEntry[];
    summary: {
      totalEntries: number;
      criticalActions: number;
      warningActions: number;
      infoActions: number;
    };
    timeline: {
      date: string;
      actionCount: number;
    }[];
    pagination: PaginationMeta;
  };
}

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  targetUserId?: string;
  targetUserName?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'critical';
  notes?: string;
}
```

**Permissions Required**: `rbac.admin.audit.view`

---

## 📤 Import/Export Endpoints

### POST /api/admin/rbac/export
**Description**: Export RBAC data in various formats

**Request Body**:
```typescript
{
  format: 'json' | 'csv' | 'xlsx';
  includeRoles?: boolean;
  includePermissions?: boolean;
  includeUserAssignments?: boolean;
  includeAuditTrail?: boolean;
  filters?: {
    roleIds?: string[];
    userIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    downloadUrl: string;
    fileName: string;
    fileSize: number;
    expiresAt: string;     // Download link expiration
    exportId: string;      // For tracking
  };
}
```

**Permissions Required**: `rbac.admin.export`

---

### POST /api/admin/rbac/import/validate
**Description**: Validate import file before processing

**Request**: Multipart form with file upload

**Response**:
```typescript
{
  success: true;
  data: {
    valid: boolean;
    summary: {
      totalRecords: number;
      validRecords: number;
      invalidRecords: number;
      duplicates: number;
    };
    errors: {
      row: number;
      field: string;
      message: string;
    }[];
    preview: any[];        // First 10 valid records
  };
}
```

**Permissions Required**: `rbac.admin.import`

---

### POST /api/admin/rbac/import/execute
**Description**: Execute validated import

**Request Body**:
```typescript
{
  validationId: string;    // From validate endpoint
  conflictResolution: 'skip' | 'overwrite' | 'merge';
  sendNotifications?: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  data: {
    jobId: string;         // For progress tracking
    estimatedDuration: number; // Seconds
  };
}
```

**Permissions Required**: `rbac.admin.import`

---

## 📊 System Health Endpoints

### GET /api/admin/rbac/health
**Description**: RBAC system health and performance metrics

**Response**:
```typescript
{
  success: true;
  data: {
    system: {
      status: 'healthy' | 'warning' | 'critical';
      uptime: number;
      version: string;
    };
    performance: {
      averageResponseTime: number;
      cacheHitRate: number;
      permissionCheckRate: number;
      errorRate: number;
    };
    database: {
      connectionCount: number;
      queryPerformance: number;
      storageUsed: number;
      indexEfficiency: number;
    };
    issues: {
      type: 'warning' | 'error';
      message: string;
      suggestion: string;
    }[];
  };
}
```

**Permissions Required**: `rbac.admin.health.view`

---

## ⚠️ Enhanced Error Codes

### Admin-Specific Errors
- `ADMIN_INSUFFICIENT_PERMISSIONS` (403): Admin lacks required permissions
- `ADMIN_OPERATION_DENIED` (403): Operation not allowed for admin user
- `BULK_OPERATION_PARTIAL_FAILURE` (207): Some operations in bulk request failed
- `HIERARCHY_MODIFICATION_RESTRICTED` (400): Hierarchy change would violate constraints
- `ROLE_IN_USE_CANNOT_DELETE` (409): Role cannot be deleted due to active assignments
- `IMPORT_VALIDATION_FAILED` (400): Import file validation failed
- `EXPORT_GENERATION_FAILED` (500): Export file generation failed

### Enhanced Rate Limiting for Admin Operations
- **Read Operations**: 200 requests/minute
- **Write Operations**: 50 requests/minute
- **Bulk Operations**: 10 requests/minute
- **Export Operations**: 5 requests/hour
- **Import Operations**: 3 requests/hour

This comprehensive admin API provides powerful tools for efficient RBAC system management while maintaining security and auditability.

---

## 🔄 Frontend-Backend Alignment Specifications

### TypeBox Schema Integration for Admin Interface

#### Enhanced Response Schema with Admin Metadata
```typescript
// TypeBox Schema for Admin Operations
export const AdminApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Any(),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String({ default: 'v1' }),
    requestId: Type.Optional(Type.String()),
    auditId: Type.String({ description: 'Audit trail identifier' }),
    performance: Type.Optional(Type.Object({
      queryTime: Type.Number({ description: 'Query execution time in ms' }),
      cacheHit: Type.Boolean(),
      totalRecords: Type.Optional(Type.Number())
    })),
    adminContext: Type.Object({
      userId: Type.String({ format: 'uuid' }),
      permissions: Type.Array(Type.String()),
      sessionId: Type.String(),
      impersonating: Type.Optional(Type.String({ format: 'uuid' }))
    })
  })
});

// Frontend TypeScript Interface (camelCase conversion)
interface AdminApiResponse<T = any> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
    auditId: string;
    performance?: {
      queryTime: number;
      cacheHit: boolean;
      totalRecords?: number;
    };
    adminContext: {
      userId: string;
      permissions: string[];
      sessionId: string;
      impersonating?: string;
    };
  };
}
```

#### Admin Error Schema with Enhanced Frontend Support
```typescript
// TypeBox Schema for Admin Errors
export const AdminErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Array(Type.String())),
    field: Type.Optional(Type.String()),
    suggestion: Type.Optional(Type.String()),
    retryable: Type.Optional(Type.Boolean()),
    retryAfter: Type.Optional(Type.Number()),
    severity: Type.Union([
      Type.Literal('info'),
      Type.Literal('warning'), 
      Type.Literal('error'),
      Type.Literal('critical')
    ]),
    userAction: Type.Optional(Type.String({ description: 'Recommended user action' })),
    supportContact: Type.Optional(Type.String({ description: 'Support contact for critical errors' }))
  }),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    version: Type.String(),
    requestId: Type.Optional(Type.String()),
    auditId: Type.String()
  })
});

// Frontend Error Handler Class
class AdminRbacError extends Error {
  constructor(public apiError: AdminApiError) {
    super(apiError.error.message);
    this.name = 'AdminRbacError';
  }
  
  get severity(): 'info' | 'warning' | 'error' | 'critical' {
    return this.apiError.error.severity;
  }
  
  get userAction(): string | undefined {
    return this.apiError.error.userAction;
  }
  
  get shouldShowToUser(): boolean {
    return ['warning', 'error'].includes(this.severity);
  }
  
  get requiresSupport(): boolean {
    return this.severity === 'critical';
  }
}
```

### Admin-Specific Frontend Components Integration

#### Role Management Component with TypeBox Schemas
```typescript
// TypeBox Schema for Role Operations
export const AdminRoleOperationSchema = Type.Object({
  roleId: Type.String({ format: 'uuid' }),
  operation: Type.Union([
    Type.Literal('activate'),
    Type.Literal('deactivate'),
    Type.Literal('duplicate'),
    Type.Literal('merge'),
    Type.Literal('archive')
  ]),
  parameters: Type.Optional(Type.Object({
    newName: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    copyPermissions: Type.Optional(Type.Boolean()),
    targetRoleId: Type.Optional(Type.String({ format: 'uuid' })),
    reason: Type.Optional(Type.String({ maxLength: 500 }))
  })),
  confirmation: Type.Object({
    confirmed: Type.Boolean(),
    confirmationToken: Type.String(),
    acknowledgeRisks: Type.Boolean()
  })
});

// Frontend Component Interface
interface AdminRoleOperation {
  roleId: string;
  operation: 'activate' | 'deactivate' | 'duplicate' | 'merge' | 'archive';
  parameters?: {
    newName?: string;
    copyPermissions?: boolean;
    targetRoleId?: string;
    reason?: string;
  };
  confirmation: {
    confirmed: boolean;
    confirmationToken: string;
    acknowledgeRisks: boolean;
  };
}

// Angular Component with Signal-based State
@Component({
  selector: 'app-admin-role-management',
  template: `
    <div class="admin-role-grid">
      <mat-table [dataSource]="filteredRoles()" class="mat-elevation-z2">
        <!-- Role columns with admin-specific actions -->
        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let role">
            <div class="action-buttons">
              <button mat-icon-button 
                      [disabled]="role.isLoading || !canModifyRole(role)"
                      (click)="openRoleEditor(role)"
                      matTooltip="Edit role">
                <mat-icon>edit</mat-icon>
              </button>
              
              <button mat-icon-button
                      [disabled]="role.isLoading || !canDuplicateRole(role)"
                      (click)="duplicateRole(role)"
                      matTooltip="Duplicate role">
                <mat-icon>content_copy</mat-icon>
              </button>
              
              <button mat-icon-button
                      [disabled]="role.isLoading || !canDeleteRole(role)"
                      (click)="confirmRoleOperation(role, 'archive')"
                      matTooltip="Archive role"
                      class="warn-action">
                <mat-icon>archive</mat-icon>
              </button>
            </div>
          </mat-cell>
        </ng-container>
      </mat-table>
    </div>
    
    <!-- Real-time conflict resolution dialog -->
    <mat-dialog #conflictDialog *ngIf="hasConflicts()">
      <h2 mat-dialog-title>Role Conflicts Detected</h2>
      <mat-dialog-content>
        <p>The following roles have been modified by other administrators:</p>
        <ul>
          <li *ngFor="let conflict of conflicts()">
            {{ conflict.roleName }} - Modified by {{ conflict.modifiedBy }}
            at {{ conflict.modifiedAt | date:'medium' }}
          </li>
        </ul>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="resolveConflicts('merge')">Merge Changes</button>
        <button mat-button (click)="resolveConflicts('overwrite')" color="warn">
          Overwrite
        </button>
        <button mat-button (click)="resolveConflicts('cancel')">Cancel</button>
      </mat-dialog-actions>
    </mat-dialog>
  `
})
export class AdminRoleManagementComponent {
  // Signal-based reactive state
  roles = signal<AdminRole[]>([]);
  filteredRoles = computed(() => 
    this.roles().filter(role => this.matchesFilters(role))
  );
  conflicts = signal<RoleConflict[]>([]);
  hasConflicts = computed(() => this.conflicts().length > 0);
  
  // Optimistic updates with error recovery
  async duplicateRole(role: AdminRole): Promise<void> {
    const confirmationDialog = this.dialog.open(RoleDuplicationDialog, {
      data: { role, permissions: role.permissions }
    });
    
    const result = await confirmationDialog.afterClosed().pipe(first()).toPromise();
    if (!result) return;
    
    // Optimistic UI update
    const optimisticRole: AdminRole = {
      ...role,
      id: 'temp-' + Date.now(),
      name: result.newName,
      isLoading: true,
      createdAt: new Date().toISOString()
    };
    
    this.roles.update(roles => [...roles, optimisticRole]);
    
    try {
      const response = await this.adminRbacService.duplicateRole(role.id, {
        newName: result.newName,
        copyPermissions: result.copyPermissions,
        copyHierarchy: result.copyHierarchy
      });
      
      // Replace optimistic role with server response
      this.roles.update(roles =>
        roles.map(r => 
          r.id === optimisticRole.id 
            ? { ...response.data.role, isLoading: false }
            : r
        )
      );
      
      this.notificationService.success(
        `Role "${result.newName}" created successfully`
      );
    } catch (error) {
      // Remove optimistic role on error
      this.roles.update(roles => 
        roles.filter(r => r.id !== optimisticRole.id)
      );
      
      if (error instanceof AdminRbacError) {
        this.handleAdminError(error);
      } else {
        this.notificationService.error('Failed to duplicate role');
      }
    }
  }
  
  private handleAdminError(error: AdminRbacError): void {
    switch (error.severity) {
      case 'critical':
        this.dialog.open(CriticalErrorDialog, { data: error });
        break;
      case 'error':
        this.notificationService.error(error.message);
        break;
      case 'warning':
        this.notificationService.warning(error.message);
        if (error.userAction) {
          this.notificationService.info(error.userAction);
        }
        break;
      case 'info':
        this.notificationService.info(error.message);
        break;
    }
  }
}
```

#### Permission Matrix Component with Advanced Visualization
```typescript
// TypeBox Schema for Permission Matrix Operations
export const PermissionMatrixUpdateSchema = Type.Object({
  changes: Type.Array(Type.Object({
    roleId: Type.String({ format: 'uuid' }),
    permissionId: Type.String({ format: 'uuid' }),
    action: Type.Union([
      Type.Literal('grant'),
      Type.Literal('deny'),
      Type.Literal('remove')
    ]),
    inherited: Type.Optional(Type.Boolean()),
    source: Type.Optional(Type.String({ format: 'uuid' }))
  })),
  validateOnly: Type.Optional(Type.Boolean()),
  auditReason: Type.String({ minLength: 10, maxLength: 500 })
});

// Frontend Permission Matrix Component
@Component({
  selector: 'app-permission-matrix',
  template: `
    <div class="permission-matrix-container">
      <!-- Matrix filters and controls -->
      <div class="matrix-controls">
        <mat-form-field>
          <mat-label>Filter Roles</mat-label>
          <mat-select multiple [(value)]="selectedRoleIds()">
            <mat-option *ngFor="let role of roles()" [value]="role.id">
              {{ role.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Filter Permissions</mat-label>
          <mat-select [(value)]="selectedCategory()">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let category of permissionCategories()" 
                        [value]="category.name">
              {{ category.name }} ({{ category.permissionCount }})
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <button mat-raised-button 
                color="primary"
                [disabled]="!hasChanges()"
                (click)="applyChanges()">
          Apply Changes ({{ pendingChanges().length }})
        </button>
      </div>
      
      <!-- Virtual scrolling matrix -->
      <cdk-virtual-scroll-viewport 
        itemSize="40" 
        class="matrix-viewport"
        [style.height.px]="matrixHeight()">
        
        <div class="matrix-grid" 
             [style.grid-template-columns]="gridColumns()">
          
          <!-- Header row -->
          <div class="matrix-header sticky-header">
            <div class="role-header">Roles / Permissions</div>
            <div *ngFor="let permission of filteredPermissions()" 
                 class="permission-header"
                 [matTooltip]="permission.description">
              {{ permission.name }}
            </div>
          </div>
          
          <!-- Data rows -->
          <div *cdkVirtualFor="let role of filteredRoles()" 
               class="matrix-row">
            
            <div class="role-cell sticky-column">
              <span class="role-name">{{ role.name }}</span>
              <mat-icon *ngIf="role.hierarchyLevel > 0" 
                        class="hierarchy-indicator">
                subdirectory_arrow_right
              </mat-icon>
            </div>
            
            <div *ngFor="let permission of filteredPermissions()" 
                 class="permission-cell"
                 [class.granted]="hasPermission(role.id, permission.id)"
                 [class.inherited]="isInherited(role.id, permission.id)"
                 [class.pending]="hasPendingChange(role.id, permission.id)"
                 (click)="togglePermission(role.id, permission.id)">
              
              <mat-icon *ngIf="hasPermission(role.id, permission.id)"
                        [class.inherited-icon]="isInherited(role.id, permission.id)">
                {{ isInherited(role.id, permission.id) ? 'arrow_downward' : 'check' }}
              </mat-icon>
              
              <div *ngIf="hasPendingChange(role.id, permission.id)"
                   class="pending-indicator">
                <mat-icon>hourglass_empty</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </cdk-virtual-scroll-viewport>
    </div>
  `,
  styles: [`
    .matrix-grid {
      display: grid;
      gap: 1px;
      background-color: #e0e0e0;
    }
    
    .permission-cell {
      width: 60px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .permission-cell.granted {
      background-color: #c8e6c9;
    }
    
    .permission-cell.inherited {
      background-color: #fff3e0;
    }
    
    .permission-cell.pending {
      background-color: #fff9c4;
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class PermissionMatrixComponent {
  roles = signal<AdminRole[]>([]);
  permissions = signal<AdminPermission[]>([]);
  matrix = signal<PermissionMatrixEntry[][]>([]);
  pendingChanges = signal<PermissionMatrixChange[]>([]);
  
  // Computed properties for filtering
  filteredRoles = computed(() => 
    this.roles().filter(role => 
      this.selectedRoleIds().length === 0 || 
      this.selectedRoleIds().includes(role.id)
    )
  );
  
  filteredPermissions = computed(() =>
    this.permissions().filter(permission =>
      !this.selectedCategory() || 
      permission.category === this.selectedCategory()
    )
  );
  
  hasChanges = computed(() => this.pendingChanges().length > 0);
  
  // Matrix operations
  togglePermission(roleId: string, permissionId: string): void {
    const currentEntry = this.getMatrixEntry(roleId, permissionId);
    const newAction = this.determineToggleAction(currentEntry);
    
    this.pendingChanges.update(changes => {
      const existingChange = changes.find(c => 
        c.roleId === roleId && c.permissionId === permissionId
      );
      
      if (existingChange) {
        existingChange.action = newAction;
        return [...changes];
      } else {
        return [...changes, {
          roleId,
          permissionId,
          action: newAction,
          timestamp: Date.now()
        }];
      }
    });
  }
  
  async applyChanges(): Promise<void> {
    const changes = this.pendingChanges();
    if (changes.length === 0) return;
    
    // Show confirmation dialog with impact analysis
    const confirmDialog = this.dialog.open(MatrixChangeConfirmationDialog, {
      data: {
        changes,
        impactAnalysis: await this.analyzeImpact(changes)
      }
    });
    
    const confirmed = await confirmDialog.afterClosed().pipe(first()).toPromise();
    if (!confirmed) return;
    
    try {
      const response = await this.adminRbacService.updatePermissionMatrix({
        changes: changes.map(c => ({
          roleId: c.roleId,
          permissionId: c.permissionId,
          action: c.action
        })),
        auditReason: confirmed.reason
      });
      
      // Update matrix with server response
      this.matrix.set(response.data.matrix);
      this.pendingChanges.set([]);
      
      this.notificationService.success(
        `${changes.length} permission changes applied successfully`
      );
    } catch (error) {
      if (error instanceof AdminRbacError) {
        this.handleMatrixError(error);
      } else {
        this.notificationService.error('Failed to apply permission changes');
      }
    }
  }
}
```

### Real-time Collaboration Features

#### WebSocket Integration for Admin Interface
```typescript
// Admin WebSocket Events Schema
export const AdminWebSocketEventSchema = Type.Object({
  type: Type.Union([
    Type.Literal('admin.role.locked'),
    Type.Literal('admin.role.unlocked'),
    Type.Literal('admin.bulk.started'),
    Type.Literal('admin.bulk.progress'),
    Type.Literal('admin.bulk.completed'),
    Type.Literal('admin.session.expired'),
    Type.Literal('admin.permission.matrix.changed')
  ]),
  data: Type.Any(),
  meta: Type.Object({
    timestamp: Type.String({ format: 'date-time' }),
    adminId: Type.String({ format: 'uuid' }),
    sessionId: Type.String(),
    priority: Type.Union([
      Type.Literal('low'),
      Type.Literal('normal'),
      Type.Literal('high'),
      Type.Literal('critical')
    ])
  })
});

// Frontend Admin WebSocket Service
@Injectable({
  providedIn: 'root'
})
export class AdminWebSocketService {
  private socket?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  adminEvents$ = new Subject<AdminWebSocketEvent>();
  connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  connect(adminToken: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.socket = new WebSocket(`ws://localhost:3333/ws/admin/rbac?token=${adminToken}`);
    
    this.socket.onopen = () => {
      this.connectionStatus$.next('connected');
      this.reconnectAttempts = 0;
      console.log('Admin WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as AdminWebSocketEvent;
        this.adminEvents$.next(message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      this.connectionStatus$.next('disconnected');
      this.attemptReconnect(adminToken);
    };
    
    this.socket.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
    };
  }
  
  private attemptReconnect(adminToken: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.connectionStatus$.next('reconnecting');
    this.reconnectAttempts++;
    
    setTimeout(() => {
      this.connect(adminToken);
    }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
  }
  
  // Send admin commands through WebSocket
  sendCommand(command: AdminCommand): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
}

interface AdminCommand {
  type: 'lock.role' | 'unlock.role' | 'request.matrix.lock';
  data: any;
  requestId: string;
}
```

This comprehensive enhancement ensures perfect alignment between the admin frontend and backend APIs, with TypeBox schema validation, optimistic updates, real-time collaboration, and robust error handling.