# rbac management - API Contracts

## 📋 API Overview

**Base URL**: `/api/[resource]`  
**Authentication**: JWT Bearer Token Required  
**Content Type**: `application/json`

## 🛠️ Endpoints

### 1. List [Resources]

```http
GET /api/[resource]
```

#### Query Parameters

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sort` (string, optional): Sort field (default: 'created_at')
- `order` (string, optional): Sort order ('asc' or 'desc', default: 'desc')
- `search` (string, optional): Search query
- `filter` (object, optional): Filter criteria

#### Request Example

```bash
GET /api/[resource]?page=1&limit=20&sort=name&order=asc&search=query
```

#### Response Schema

```typescript
{
  data: [Resource][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Response Example

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Example Resource",
      "created_at": "2025-09-12T10:30:00Z",
      "updated_at": "2025-09-12T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

### 2. Get Single [Resource]

```http
GET /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

#### Response Example

```json
{
  "data": {
    "id": "uuid",
    "name": "Example Resource",
    "description": "Resource description",
    "created_at": "2025-09-12T10:30:00Z",
    "updated_at": "2025-09-12T10:30:00Z"
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

### 3. Create [Resource]

```http
POST /api/[resource]
```

#### Request Schema

```typescript
{
  name: string;
  description?: string;
  // Add other required fields
}
```

#### Request Example

```json
{
  "name": "New Resource",
  "description": "Resource description"
}
```

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

### 4. Update [Resource]

```http
PUT /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Request Schema

```typescript
{
  name?: string;
  description?: string;
  // Add other updatable fields
}
```

#### Request Example

```json
{
  "name": "Updated Resource Name",
  "description": "Updated description"
}
```

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

### 5. Delete [Resource]

```http
DELETE /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Response Schema

```typescript
{
  data: {
    id: string;
    deleted: boolean;
  }
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

## 📊 Data Models

### Resource Model

```typescript
interface Resource {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}
```

### Request Models

```typescript
interface CreateResourceRequest {
  name: string;
  description?: string;
}

interface UpdateResourceRequest {
  name?: string;
  description?: string;
}

interface ResourceFilters {
  status?: 'active' | 'inactive';
  created_after?: string;
  created_before?: string;
}
```

### Response Models

```typescript
interface ResourceListResponse {
  data: Resource[];
  pagination: PaginationMeta;
  meta: ResponseMeta;
}

interface ResourceResponse {
  data: Resource;
  meta: ResponseMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
}
```

## ❌ Error Responses

### Error Schema

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

### Common Error Codes

- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Validation Error
- `500` Internal Server Error

### Error Examples

#### Validation Error (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"],
      "description": ["Description must be at least 10 characters"]
    }
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

#### Not Found Error (404)

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

## 🔐 Authentication & Authorization

### Authentication

All endpoints require JWT Bearer token in Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Authorization

Different endpoints may require different permissions:

- `[resource]:read` - View resources
- `[resource]:create` - Create resources
- `[resource]:update` - Update resources
- `[resource]:delete` - Delete resources

## 📝 TypeBox Schemas

### Request Schemas

```typescript
export const CreateResourceSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1000 })),
});

export const UpdateResourceSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1000 })),
});

export const ResourceFiltersSchema = Type.Object({
  status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
  created_after: Type.Optional(Type.String({ format: 'date-time' })),
  created_before: Type.Optional(Type.String({ format: 'date-time' })),
});
```

### Response Schemas

```typescript
export const ResourceSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('deleted')]),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
});

export const ResourceListResponseSchema = Type.Object({
  data: Type.Array(ResourceSchema),
  pagination: PaginationSchema,
  meta: ResponseMetaSchema,
});
```

## 🔄 Multi-Role Management Endpoints

### 1. Assign Roles to User

```http
POST /api/users/:id/roles/assign
```

#### Path Parameters

- `id` (string, required): User UUID

#### Request Schema

```typescript
{
  roleIds: string[]; // Array of role UUIDs to assign
  expiresAt?: string; // Optional ISO 8601 date when roles expire
}
```

#### Request Example

```json
{
  "roleIds": ["role-uuid-1", "role-uuid-2"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    message: string;
    userId: string;
  }
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

#### Notes

- ✅ **Cache Invalidation**: User's permission cache is automatically invalidated
- ✅ **Multi-Role Support**: Multiple roles can be assigned to a single user
- ✅ **Expiry Support**: Roles can have optional expiration dates

---

### 2. Remove Role from User

```http
POST /api/users/:id/roles/remove
```

#### Path Parameters

- `id` (string, required): User UUID

#### Request Schema

```typescript
{
  roleId: string; // UUID of role to remove
}
```

#### Request Example

```json
{
  "roleId": "role-uuid-1"
}
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    message: string;
    userId: string;
  }
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

#### Notes

- ✅ **Cache Invalidation**: User's permission cache is automatically invalidated
- ⚠️ **Validation**: User must have at least one role (cannot remove all roles)

---

### 3. Update Role Expiry

```http
POST /api/users/:id/roles/expiry
```

#### Path Parameters

- `id` (string, required): User UUID

#### Request Schema

```typescript
{
  roleId: string; // UUID of role to update
  expiresAt?: string; // ISO 8601 date for expiration (null to remove expiry)
}
```

#### Request Example

```json
{
  "roleId": "role-uuid-1",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    message: string;
    userId: string;
  }
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

#### Notes

- ✅ **Cache Invalidation**: User's permission cache is automatically invalidated
- ✅ **Flexible Expiry**: Can set, update, or remove role expiration

---

### 4. Get User Roles

```http
GET /api/users/:id/roles
```

#### Path Parameters

- `id` (string, required): User UUID

#### Query Parameters

- `include_role` (boolean, optional): Include full role objects with permissions (default: false)
- `limit` (number, optional): Maximum results (default: 100)
- `offset` (number, optional): Result offset for pagination (default: 0)

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    id: string;
    roleId: string;
    roleName: string;
    assignedAt: string;
    assignedBy?: string;
    expiresAt?: string;
    isActive: boolean;
  }[];
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": "user-role-uuid-1",
      "roleId": "role-uuid-1",
      "roleName": "admin",
      "assignedAt": "2025-09-15T10:30:00Z",
      "assignedBy": "admin-user-id",
      "expiresAt": "2025-12-31T23:59:59Z",
      "isActive": true
    },
    {
      "id": "user-role-uuid-2",
      "roleId": "role-uuid-2",
      "roleName": "editor",
      "assignedAt": "2025-09-15T11:00:00Z",
      "expiresAt": null,
      "isActive": true
    }
  ],
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-11-08T12:30:00Z",
    "version": "1.0"
  }
}
```

#### Notes

- ✅ **Active Roles Only**: By default returns only active role assignments
- ✅ **Expiry Handling**: Roles with past expiry dates are marked as inactive
- ✅ **Metadata Included**: Shows who assigned the role and when

---

## 🧪 Test Cases

### Unit Test Cases

1. **GET /api/[resource]**
   - Returns paginated list
   - Applies filters correctly
   - Handles empty results
   - Validates query parameters

2. **GET /api/[resource]/:id**
   - Returns single resource
   - Returns 404 for non-existent resource
   - Validates UUID format

3. **POST /api/[resource]**
   - Creates resource successfully
   - Validates required fields
   - Returns validation errors
   - Handles duplicate names

4. **PUT /api/[resource]/:id**
   - Updates resource successfully
   - Validates fields
   - Returns 404 for non-existent resource
   - Handles partial updates

5. **DELETE /api/[resource]/:id**
   - Deletes resource successfully
   - Returns 404 for non-existent resource
   - Handles cascade deletions

## 🆕 Multi-Role Management Endpoints

### Bulk Assign Multiple Roles to Single User

```http
POST /rbac/users/:id/roles/bulk
```

#### Request Body

```typescript
{
  role_ids: string[];        // Array of role UUIDs (required, max 10)
  expires_at?: string;       // ISO 8601 datetime (optional)
}
```

#### Response

**Status: 201 Created**

```typescript
{
  success: true;
  data: UserRole[];          // Array of newly assigned roles
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Example

```bash
curl -X POST http://localhost:3333/rbac/users/{userId}/roles/bulk \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": ["role-id-1", "role-id-2", "role-id-3"],
    "expires_at": "2025-12-31T23:59:59Z"
  }'
```

---

### Replace All User Roles

```http
PUT /rbac/users/:id/roles
```

#### Request Body

```typescript
{
  role_ids: string[];        // Array of role UUIDs (required, max 10)
  expires_at?: string;       // ISO 8601 datetime (optional)
}
```

#### Behavior

- Removes all existing user roles
- Assigns the new set of roles
- All roles get the same expiry date if specified
- Invalidates permission cache for the user

#### Response

**Status: 200 OK**

```typescript
{
  success: true;
  data: UserRole[];          // Array of all newly assigned roles
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Example

```bash
curl -X PUT http://localhost:3333/rbac/users/{userId}/roles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": ["admin-id", "manager-id"],
    "expires_at": "2026-06-30T23:59:59Z"
  }'
```

---

## 📊 Role Assignment History Endpoints

### Get Role Assignment History (Audit Log)

```http
GET /rbac/history
```

#### Query Parameters

```typescript
{
  page?: number;             // Page number (default: 1)
  limit?: number;            // Items per page (default: 20, max: 1000)
  user_id?: string;          // Filter by user UUID (optional)
  role_id?: string;          // Filter by role UUID (optional)
  action?: 'assigned' | 'removed' | 'expired';  // Action type (optional)
  from_date?: string;        // Start date ISO 8601 (optional)
  to_date?: string;          // End date ISO 8601 (optional)
  include_user?: boolean;    // Include user data (optional)
  include_role?: boolean;    // Include role data (optional)
}
```

#### Response

**Status: 200 OK**

```typescript
{
  success: true;
  data: RoleAssignmentHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### RoleAssignmentHistory Schema

```typescript
{
  id: string;                // UUID
  user_id: string;           // UUID
  role_id: string;           // UUID
  action: 'assigned' | 'removed' | 'expired';
  performed_by?: string;     // User UUID who performed action
  performed_at: string;      // ISO 8601
  expires_at?: string;       // ISO 8601
  metadata?: object;         // Additional context
  created_at: string;        // ISO 8601
}
```

#### Example

```bash
curl "http://localhost:3333/rbac/history?page=1&limit=20&action=assigned&from_date=2025-11-01T00:00:00Z" \
  -H "Authorization: Bearer {token}"
```

---

### Get User's Role Assignment History

```http
GET /rbac/users/:id/history
```

#### Path Parameters

- `id` (string, required): User UUID

#### Query Parameters

- `limit` (number, optional): Max items to return (default: 50)

#### Response

**Status: 200 OK**

```typescript
{
  success: true;
  data: RoleAssignmentHistory[];
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Example

```bash
curl "http://localhost:3333/rbac/users/{userId}/history?limit=50" \
  -H "Authorization: Bearer {token}"
```

---

### Integration Test Cases

1. **Complete CRUD workflow**
2. **Authentication/Authorization**
3. **Error handling**
4. **Performance under load**
5. **Concurrent operations**
6. **Multi-role assignment and replacement**
7. **History tracking and audit logging**

## 📋 Implementation Checklist

### Backend Implementation

- [ ] Database migrations
- [ ] TypeBox schemas defined
- [ ] Repository layer implemented
- [ ] Service layer implemented
- [ ] Controller layer implemented
- [ ] Route registration
- [ ] Validation middleware
- [ ] Error handling
- [ ] Unit tests written
- [ ] Integration tests written

### Frontend Implementation

- [ ] Service interfaces defined
- [ ] HTTP client implementation
- [ ] Type definitions created
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Response transformation
- [ ] Unit tests written

### Documentation

- [ ] API documentation complete
- [ ] OpenAPI/Swagger specs
- [ ] Postman collection created
- [ ] Examples provided
- [ ] Error scenarios documented
