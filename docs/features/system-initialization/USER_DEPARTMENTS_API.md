# User-Departments REST API Implementation

**Status**: Complete - Builds successfully
**Date**: December 13, 2025
**Implementation**: Week 3 (API Layer) of Department Management System

## Overview

Complete REST API implementation for managing user-department relationships. Supports multi-department users, granular permissions, and temporal assignments.

## Files Created

### 1. Schemas (`user-departments.schemas.ts`)

**Path**: `apps/api/src/modules/users/user-departments/user-departments.schemas.ts`

TypeBox schemas for all request/response types:

- `UserDepartmentAssignmentSchema` - Core assignment data
- `UserDepartmentWithDetailsSchema` - Assignment with department info
- `DepartmentUserSchema` - Department member with user details
- `PermissionFlagsSchema` - Granular permission flags
- Request schemas for POST/PUT operations
- Parameter schemas for route parameters
- Query schemas for pagination and filtering
- Response schemas with proper error handling

**Lines**: 323
**Key Exports**: 20+ TypeBox schemas and TypeScript types

### 2. Controller (`user-departments.controller.ts`)

**Path**: `apps/api/src/modules/users/user-departments/user-departments.controller.ts`

HTTP request handler with 6 main endpoints:

- `listUserDepartments()` - GET /users/:userId/departments
- `assignUserToDepartment()` - POST /users/:userId/departments
- `removeUserFromDepartment()` - DELETE /users/:userId/departments/:deptId
- `setPrimaryDepartment()` - PUT /users/:userId/departments/:deptId/primary
- `listDepartmentUsers()` - GET /departments/:deptId/users
- `checkPermissions()` - GET /users/:userId/departments/:deptId/permissions
- `getUserPrimaryDepartment()` - GET /users/:userId/departments/primary

**Lines**: 410
**Features**:

- Comprehensive error handling with AppError
- Request validation via TypeBox schemas
- Pagination support
- Permission checks via service layer
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 500)

### 3. Routes (`user-departments.route.ts`)

**Path**: `apps/api/src/modules/users/user-departments/user-departments.route.ts`

Fastify route definitions with complete documentation:

#### Endpoints Implemented

1. **GET /users/:userId/departments**
   - Lists user's active department assignments
   - Pagination: page, limit (default 20, max 100)
   - Query params: activeOnly (default true)
   - Response: 200 with pagination metadata

2. **POST /users/:userId/departments**
   - Assigns user to a department
   - Request body:
     - departmentId (required)
     - isPrimary (boolean, optional)
     - assignedRole (string, optional)
     - permissions (object, optional)
     - validFrom, validUntil (date, optional)
     - notes (string, optional)
   - Response: 201 Created

3. **DELETE /users/:userId/departments/:deptId**
   - Soft delete: marks assignment as inactive
   - Preserves audit history
   - Cannot remove only primary department
   - Response: 200 OK

4. **PUT /users/:userId/departments/:deptId/primary**
   - Sets department as primary
   - Automatically unsets other primaries
   - Validates temporal validity
   - Response: 200 OK with updated assignment

5. **GET /departments/:deptId/users**
   - Lists all users in a department
   - Returns user details with assignment info
   - Pagination support
   - Response: 200 with pagination

6. **GET /users/:userId/departments/:deptId/permissions**
   - Checks granular permissions
   - Returns individual permission flags
   - Response: 200 with permission object

7. **GET /users/:userId/departments/primary**
   - Gets user's primary department
   - Returns department ID, code, and name
   - Response: 200 or 404 if not found

**Lines**: 327
**Security**:

- All endpoints require `fastify.authenticate`
- Most require `fastify.verifyPermission('userDepartments', action)`
- Follows RBAC permission pattern
- Proper error response codes

### 4. Plugin (`user-departments.plugin.ts`)

**Path**: `apps/api/src/modules/users/user-departments/user-departments.plugin.ts`

Fastify plugin for dependency injection:

- Initializes repositories (UserDepartments, Users, Departments)
- Creates service instance (UserDepartmentsService)
- Creates controller instance (UserDepartmentsController)
- Registers routes
- Decorates fastify instance with service
- Declares plugin dependencies

**Lines**: 58
**Dependencies**:

- knex-plugin (database)
- jwt-auth-plugin (authentication)
- users-plugin (UsersService)
- inventory-plugin (DepartmentsRepository)

### 5. Index (`index.ts`)

**Path**: `apps/api/src/modules/users/user-departments/index.ts`

Module exports for public API.

## Integration with Plugin Loader

**File Modified**: `apps/api/src/bootstrap/plugin.loader.ts`

Added import:

```typescript
import userDepartmentsPlugin from '../modules/users/user-departments/user-departments.plugin';
```

Registered in core infrastructure plugins:

```typescript
{
  name: 'user-departments',
  plugin: userDepartmentsPlugin,
  required: true,
}
```

**Location**: After 'users' plugin, before 'rbac' plugin
**Reason**: Depends on users plugin, used by permission system

## API Schema Documentation

### UserDepartment Assignment Structure

```typescript
{
  id: string;                    // UUID
  userId: string;                // UUID
  departmentId: number;
  hospitalId?: number;
  isPrimary: boolean;
  assignedRole?: string;
  canCreateRequests: boolean;
  canEditRequests: boolean;
  canSubmitRequests: boolean;
  canApproveRequests: boolean;
  canViewReports: boolean;
  validFrom?: string;            // ISO date
  validUntil?: string;           // ISO date
  assignedBy?: string;           // UUID
  assignedAt: string;            // ISO datetime
  notes?: string;
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
}
```

### Permission Flags

```typescript
{
  canCreateRequests: boolean;
  canEditRequests: boolean;
  canSubmitRequests: boolean;
  canApproveRequests: boolean;
  canViewReports: boolean;
}
```

## Error Handling

Comprehensive error responses following standard format:

```typescript
// Success
{
  success: true,
  data: {...},
  pagination?: {...},
  message?: "..."
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details?: {...}
  }
}
```

### Error Codes Handled

- `USER_NOT_FOUND` (404)
- `DEPARTMENT_NOT_FOUND` (404)
- `ASSIGNMENT_EXISTS` (409)
- `ASSIGNMENT_NOT_FOUND` (404)
- `INVALID_DATE_RANGE` (400)
- `CANNOT_REMOVE_ONLY_PRIMARY` (400)
- `ASSIGNMENT_NOT_YET_VALID` (400)
- `ASSIGNMENT_EXPIRED` (400)
- `INTERNAL_ERROR` (500)

## Authentication & Authorization

All endpoints follow existing permission system:

```typescript
preValidation: [
  fastify.authenticate, // Requires valid JWT
  fastify.verifyPermission('userDepartments', action), // RBAC check
];
```

Available actions:

- `read` - List departments/users
- `create` - Assign user to department
- `update` - Change primary, modify permissions
- `delete` - Remove user from department

## Testing Endpoints

### Example 1: List User's Departments

```bash
curl -X GET \
  'http://localhost:3000/api/users/{userId}/departments?page=1&limit=20' \
  -H 'Authorization: Bearer {token}'
```

### Example 2: Assign User to Department

```bash
curl -X POST \
  'http://localhost:3000/api/users/{userId}/departments' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "departmentId": 1,
    "isPrimary": true,
    "assignedRole": "pharmacist",
    "permissions": {
      "canCreateRequests": true,
      "canApproveRequests": false
    }
  }'
```

### Example 3: Set Primary Department

```bash
curl -X PUT \
  'http://localhost:3000/api/users/{userId}/departments/{deptId}/primary' \
  -H 'Authorization: Bearer {token}'
```

### Example 4: Check Permissions

```bash
curl -X GET \
  'http://localhost:3000/api/users/{userId}/departments/{deptId}/permissions' \
  -H 'Authorization: Bearer {token}'
```

## Database Dependencies

The API layer assumes the following database components already exist:

### Tables

- `user_departments` - User-department assignments
- `users` - System users
- `departments` - Department master data

### Repositories

- `UserDepartmentsRepository` - Located in `apps/api/src/core/users/user-departments.repository.ts`
- `UsersRepository` - Located in `apps/api/src/core/users/users.repository.ts`
- `DepartmentsRepository` - Located in `apps/api/src/modules/inventory/master-data/departments/departments.repository.ts`

### Service

- `UserDepartmentsService` - Located in `apps/api/src/core/users/user-departments.service.ts`

## Build Status

✅ **Successfully Compiles**

```
NX Successfully ran target build for 5 projects
```

All TypeScript types properly declared, no compilation errors specific to this module.

## Next Steps

### Phase 4: Import/Export System (Week 4)

- CSV import functionality for user-department assignments
- Export endpoint for data backup
- CLI command for bulk import

### Phase 5: Frontend UI (Week 5)

- Admin interface for department management
- User department manager component
- Department user list view
- Import/export UI

## Related Documentation

- [Department Management Design](./DEPARTMENT_MANAGEMENT_DESIGN.md) - Full design specification
- [API Calling Standard](../../../development/API_CALLING_STANDARD.md) - URL patterns
- [Universal Full-Stack Standard](../../../development/universal-fullstack-standard.md) - Development patterns

## Code Metrics

| File                                  | Lines     | Type        |
| ------------------------------------- | --------- | ----------- |
| user-departments.schemas.ts           | 323       | Schemas     |
| user-departments.controller.ts        | 410       | Logic       |
| user-departments.route.ts             | 327       | Routes      |
| user-departments.plugin.ts            | 58        | Plugin      |
| user-departments.plugin.ts (modified) | +6        | Integration |
| **Total**                             | **1,124** |             |

## Compatibility

- Fastify: ^4.x
- TypeBox: Latest
- Node.js: 18+
- TypeScript: 5.x

## Contact & Support

For questions about the implementation, refer to:

1. Design specification: `DEPARTMENT_MANAGEMENT_DESIGN.md`
2. Service layer: `user-departments.service.ts`
3. Repository layer: `user-departments.repository.ts`
