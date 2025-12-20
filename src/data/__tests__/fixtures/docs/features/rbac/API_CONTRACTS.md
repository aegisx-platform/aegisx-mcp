# RBAC (Role-Based Access Control) API Contract

## API Overview

**Base URL**: `/api/rbac`
**Authentication**: Required
**Content Type**: `application/json`

## Endpoints

### 1. List Roles

**GET** `/api/rbac/roles`

Retrieves all available roles in the system.

**Authentication:** Required

#### Query Parameters

- `limit` (number, optional): Maximum number of results (default: 100)
- `offset` (number, optional): Number of results to skip (default: 0)

#### Response Schema

```typescript
interface ListRolesResponse {
  roles: Role[];
  total: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}
```

#### Response Example

```json
{
  "roles": [
    {
      "id": "role-admin",
      "name": "Administrator",
      "description": "Full system access",
      "permissions": ["users.create", "users.update", "users.delete", "roles.manage"],
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "role-user",
      "name": "User",
      "description": "Basic user access",
      "permissions": ["profile.read", "profile.update"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 2
}
```

#### Error Responses

**401 Unauthorized** - Authentication required

**403 Forbidden** - Insufficient permissions

### 2. Create Role

**POST** `/api/rbac/roles`

Creates a new role in the system.

**Authentication:** Required

#### Request Schema

```typescript
interface CreateRolePayload {
  name: string;
  description: string;
  permissions: string[];
}
```

#### Response Schema

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}
```

#### Response Example

```json
{
  "id": "role-custom-001",
  "name": "Custom Role",
  "description": "Custom role with limited permissions",
  "permissions": ["profile.read", "profile.update"],
  "createdAt": "2024-01-20T14:30:00Z"
}
```

#### Error Responses

**400 Bad Request** - Missing required fields

**401 Unauthorized** - Authentication required

**403 Forbidden** - Insufficient permissions to create roles

**409 Conflict** - Role name already exists

### 3. Update Role Permissions

**PUT** `/api/rbac/roles/:id/permissions`

Updates the permissions for a specific role.

**Authentication:** Required

#### Path Parameters

- `id` (string, required): Role ID (e.g., "role-custom-001")

#### Request Schema

```typescript
interface UpdateRolePermissionsPayload {
  permissions: string[];
}
```

#### Response Schema

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### Error Responses

**400 Bad Request** - Invalid permissions list

**401 Unauthorized** - Authentication required

**403 Forbidden** - Cannot modify system roles

**404 Not Found** - Role not found
