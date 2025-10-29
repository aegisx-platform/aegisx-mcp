# Navigation Management - API Reference

> **Complete API documentation for all navigation endpoints**

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Public Navigation API](#public-navigation-api)
- [Navigation Management API](#navigation-management-api)
- [Permission Management API](#permission-management-api)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

**Base URL**: `http://your-domain/api`

**API Version**: v1

**Content Type**: `application/json`

**Authentication**: JWT Bearer Token (except public endpoints)

## Authentication

Most endpoints require authentication using JWT Bearer token.

### Including Auth Token

```bash
# In headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# cURL example
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user
```

### Getting Auth Token

```bash
# Login to get token
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Required Permissions

| Endpoint                               | Permission Required          |
| -------------------------------------- | ---------------------------- |
| GET /navigation                        | None (Public)                |
| GET /navigation/user                   | Authenticated                |
| GET /navigation-items                  | `navigation:read` or `*:*`   |
| POST /navigation-items                 | `navigation:create` or `*:*` |
| PUT /navigation-items/:id              | `navigation:update` or `*:*` |
| DELETE /navigation-items/:id           | `navigation:delete` or `*:*` |
| POST /navigation-items/reorder         | `navigation:update` or `*:*` |
| POST /navigation-items/:id/permissions | `navigation:update` or `*:*` |

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Codes

| Code                           | HTTP Status | Description                       |
| ------------------------------ | ----------- | --------------------------------- |
| `UNAUTHORIZED`                 | 401         | Missing or invalid authentication |
| `FORBIDDEN`                    | 403         | Insufficient permissions          |
| `NOT_FOUND`                    | 404         | Resource not found                |
| `VALIDATION_ERROR`             | 400         | Invalid request data              |
| `KEY_ALREADY_EXISTS`           | 409         | Navigation key must be unique     |
| `NAVIGATION_ITEM_HAS_CHILDREN` | 400         | Cannot delete item with children  |
| `NAVIGATION_ITEM_NOT_FOUND`    | 404         | Navigation item does not exist    |
| `INTERNAL_SERVER_ERROR`        | 500         | Server error                      |

---

## Public Navigation API

### Get Public Navigation

Get navigation structure for all users (public access).

**Endpoint**: `GET /api/navigation`

**Authentication**: Not required

**Query Parameters**:

| Parameter         | Type    | Required | Default | Description                                                          |
| ----------------- | ------- | -------- | ------- | -------------------------------------------------------------------- |
| `type`            | string  | No       | `all`   | Navigation type: `default`, `compact`, `horizontal`, `mobile`, `all` |
| `includeDisabled` | boolean | No       | `false` | Include disabled items                                               |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "default": [
      {
        "id": "dashboard",
        "title": "Dashboard",
        "type": "item",
        "icon": "dashboard",
        "link": "/dashboard",
        "disabled": false,
        "hidden": false,
        "permissions": []
      },
      {
        "id": "rbac-management",
        "title": "RBAC",
        "type": "collapsible",
        "icon": "shield",
        "disabled": false,
        "hidden": false,
        "permissions": ["rbac:read"],
        "children": [
          {
            "id": "rbac-roles",
            "title": "Roles",
            "type": "item",
            "icon": "people",
            "link": "/rbac/roles",
            "disabled": false,
            "hidden": false,
            "permissions": ["roles:read"]
          }
        ]
      }
    ],
    "mobile": [ ... ],
    "compact": [ ... ],
    "horizontal": [ ... ]
  }
}
```

**Example Requests**:

```bash
# Get all navigation types
curl http://localhost:3333/api/navigation

# Get default layout only
curl http://localhost:3333/api/navigation?type=default

# Include disabled items
curl http://localhost:3333/api/navigation?includeDisabled=true
```

**Response Fields**:

| Field           | Type     | Description                                                    |
| --------------- | -------- | -------------------------------------------------------------- |
| `id`            | string   | Navigation item key                                            |
| `title`         | string   | Display text                                                   |
| `type`          | string   | Item type: `item`, `group`, `collapsible`, `divider`, `spacer` |
| `icon`          | string   | Material icon name                                             |
| `link`          | string   | Navigation route                                               |
| `target`        | string   | Link target: `_self`, `_blank`, `_parent`, `_top`              |
| `disabled`      | boolean  | Item disabled state                                            |
| `hidden`        | boolean  | Item hidden state                                              |
| `permissions`   | string[] | Required permissions (format: `resource.action`)               |
| `badge`         | object   | Badge configuration                                            |
| `badge.title`   | string   | Badge text                                                     |
| `badge.variant` | string   | Badge style                                                    |
| `badge.classes` | string   | Custom CSS classes                                             |
| `children`      | array    | Child navigation items (for collapsible)                       |
| `meta`          | object   | Custom metadata                                                |

---

### Get User Navigation

Get navigation filtered by user's permissions.

**Endpoint**: `GET /api/navigation/user`

**Authentication**: Required (JWT Bearer Token)

**Query Parameters**:

| Parameter | Type   | Required | Default | Description     |
| --------- | ------ | -------- | ------- | --------------- |
| `type`    | string | No       | `all`   | Navigation type |

**Response**: `200 OK`

Same structure as public navigation, but filtered to show only items the user has permission to access.

**Example Request**:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user?type=default
```

**Permission Filtering Logic**:

```
For each navigation item:
  IF item.permissions IS EMPTY:
    → INCLUDE (public access)
  ELSE IF user has '*:*' permission:
    → INCLUDE (admin wildcard)
  ELSE IF user has ANY of item.permissions:
    → INCLUDE (has required permission)
  ELSE:
    → EXCLUDE (no permission)
```

**Example Response** (filtered for user with `users:read` permission):

```json
{
  "success": true,
  "data": {
    "default": [
      {
        "id": "dashboard",
        "title": "Dashboard",
        "type": "item",
        "permissions": []
      },
      {
        "id": "users",
        "title": "Users",
        "type": "item",
        "link": "/users",
        "permissions": ["users:read"]
      }
      // RBAC items excluded (user lacks rbac:read permission)
    ]
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Navigation Management API

### List All Navigation Items

Get all navigation items (flat list, no hierarchy).

**Endpoint**: `GET /api/navigation-items`

**Authentication**: Required

**Permission**: `navigation:read` or `*:*`

**Query Parameters**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "parent_id": null,
      "key": "dashboard",
      "title": "Dashboard",
      "type": "item",
      "icon": "dashboard",
      "link": "/dashboard",
      "target": "_self",
      "sort_order": 10,
      "disabled": false,
      "hidden": false,
      "exact_match": false,
      "badge_title": null,
      "badge_classes": null,
      "badge_variant": null,
      "show_in_default": true,
      "show_in_compact": true,
      "show_in_horizontal": true,
      "show_in_mobile": true,
      "meta": {},
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "permissions": []
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "parent_id": null,
      "key": "rbac-management",
      "title": "RBAC",
      "type": "collapsible",
      "icon": "shield",
      "link": null,
      "target": "_self",
      "sort_order": 20,
      "disabled": false,
      "hidden": false,
      "exact_match": false,
      "badge_title": null,
      "badge_classes": null,
      "badge_variant": null,
      "show_in_default": true,
      "show_in_compact": false,
      "show_in_horizontal": true,
      "show_in_mobile": true,
      "meta": null,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "permissions": ["rbac:read"]
    }
  ]
}
```

**Example Request**:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items
```

**Error Responses**:

```json
// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions. Required: navigation:read"
  }
}
```

---

### Get Navigation Item by ID

Get single navigation item details.

**Endpoint**: `GET /api/navigation-items/:id`

**Authentication**: Required

**Permission**: `navigation:read` or `*:*`

**Path Parameters**:

| Parameter | Type | Required | Description        |
| --------- | ---- | -------- | ------------------ |
| `id`      | UUID | Yes      | Navigation item ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "parent_id": null,
    "key": "dashboard",
    "title": "Dashboard",
    "type": "item",
    "icon": "dashboard",
    "link": "/dashboard",
    "target": "_self",
    "sort_order": 10,
    "disabled": false,
    "hidden": false,
    "exact_match": false,
    "badge_title": null,
    "badge_classes": null,
    "badge_variant": null,
    "show_in_default": true,
    "show_in_compact": true,
    "show_in_horizontal": true,
    "show_in_mobile": true,
    "meta": {},
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "permissions": []
  }
}
```

**Example Request**:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items/550e8400-e29b-41d4-a716-446655440000
```

**Error Responses**:

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Navigation item not found"
  }
}
```

---

### Create Navigation Item

Create a new navigation item.

**Endpoint**: `POST /api/navigation-items`

**Authentication**: Required

**Permission**: `navigation:create` or `*:*`

**Request Body**:

```json
{
  "parent_id": "660e8400-e29b-41d4-a716-446655440001",
  "key": "rbac-permissions",
  "title": "Permissions",
  "type": "item",
  "icon": "lock",
  "link": "/rbac/permissions",
  "target": "_self",
  "sort_order": 30,
  "disabled": false,
  "hidden": false,
  "exact_match": false,
  "badge_title": "New",
  "badge_classes": "bg-blue-500 text-white",
  "badge_variant": "primary",
  "show_in_default": true,
  "show_in_compact": false,
  "show_in_horizontal": true,
  "show_in_mobile": true,
  "meta": {
    "feature_flag": "rbac_enabled"
  },
  "permission_ids": ["770e8400-e29b-41d4-a716-446655440002"]
}
```

**Required Fields**:

| Field   | Type   | Required | Constraints                                                 |
| ------- | ------ | -------- | ----------------------------------------------------------- |
| `key`   | string | ✅ Yes   | Max 100 chars, unique, kebab-case recommended               |
| `title` | string | ✅ Yes   | Max 200 chars                                               |
| `type`  | string | ✅ Yes   | One of: `item`, `group`, `collapsible`, `divider`, `spacer` |

**Optional Fields**:

| Field                | Type    | Default | Constraints                                  |
| -------------------- | ------- | ------- | -------------------------------------------- |
| `parent_id`          | UUID    | `null`  | Must be valid navigation item ID             |
| `icon`               | string  | `null`  | Max 100 chars, Material icon name            |
| `link`               | string  | `null`  | Max 500 chars, route path                    |
| `target`             | string  | `_self` | One of: `_self`, `_blank`, `_parent`, `_top` |
| `sort_order`         | integer | `0`     | Display order (lower = first)                |
| `disabled`           | boolean | `false` | Hide from all users                          |
| `hidden`             | boolean | `false` | Hide from menu but route accessible          |
| `exact_match`        | boolean | `false` | Require exact route match for active state   |
| `badge_title`        | string  | `null`  | Max 50 chars                                 |
| `badge_classes`      | string  | `null`  | Max 200 chars, CSS classes                   |
| `badge_variant`      | string  | `null`  | Max 20 chars                                 |
| `show_in_default`    | boolean | `true`  | Show in default layout                       |
| `show_in_compact`    | boolean | `false` | Show in compact layout                       |
| `show_in_horizontal` | boolean | `false` | Show in horizontal layout                    |
| `show_in_mobile`     | boolean | `true`  | Show in mobile layout                        |
| `meta`               | object  | `null`  | Custom JSON data                             |
| `permission_ids`     | UUID[]  | `[]`    | Array of permission IDs                      |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "parent_id": "660e8400-e29b-41d4-a716-446655440001",
    "key": "rbac-permissions",
    "title": "Permissions",
    "type": "item",
    "icon": "lock",
    "link": "/rbac/permissions",
    "target": "_self",
    "sort_order": 30,
    "disabled": false,
    "hidden": false,
    "exact_match": false,
    "badge_title": "New",
    "badge_classes": "bg-blue-500 text-white",
    "badge_variant": "primary",
    "show_in_default": true,
    "show_in_compact": false,
    "show_in_horizontal": true,
    "show_in_mobile": true,
    "meta": {
      "feature_flag": "rbac_enabled"
    },
    "created_at": "2025-01-15T11:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z",
    "permissions": ["permissions:read"]
  }
}
```

**Example Request**:

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "reports",
    "title": "Reports",
    "type": "item",
    "icon": "bar_chart",
    "link": "/reports",
    "sort_order": 40,
    "show_in_default": true,
    "permission_ids": []
  }' \
  http://localhost:3333/api/navigation-items
```

**Error Responses**:

```json
// 400 Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "key",
        "message": "required property",
        "code": "REQUIRED"
      }
    ]
  }
}

// 409 Conflict (duplicate key)
{
  "success": false,
  "error": {
    "code": "KEY_ALREADY_EXISTS",
    "message": "Navigation item with key 'dashboard' already exists"
  }
}
```

---

### Update Navigation Item

Update existing navigation item.

**Endpoint**: `PUT /api/navigation-items/:id`

**Authentication**: Required

**Permission**: `navigation:update` or `*:*`

**Path Parameters**:

| Parameter | Type | Required | Description        |
| --------- | ---- | -------- | ------------------ |
| `id`      | UUID | Yes      | Navigation item ID |

**Request Body**:

All fields are optional. Only provided fields will be updated.

```json
{
  "title": "User Management",
  "icon": "people",
  "sort_order": 15,
  "badge_title": "5",
  "badge_variant": "warn",
  "show_in_mobile": false,
  "permission_ids": ["770e8400-e29b-41d4-a716-446655440002"]
}
```

**Field Constraints**: Same as Create endpoint

**Immutable Fields**:

- `id` - Cannot be changed
- `key` - Cannot be changed after creation
- `created_at` - System managed

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "users",
    "title": "User Management",
    "icon": "people",
    "sort_order": 15,
    "badge_title": "5",
    "badge_variant": "warn",
    "show_in_mobile": false,
    "updated_at": "2025-01-15T12:00:00Z",
    ...
  }
}
```

**Example Request**:

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "disabled": true
  }' \
  http://localhost:3333/api/navigation-items/550e8400-e29b-41d4-a716-446655440000
```

**Error Responses**:

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NAVIGATION_ITEM_NOT_FOUND",
    "message": "Navigation item not found"
  }
}

// 400 Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "parent_id",
        "message": "must match format \"uuid\"",
        "code": "FORMAT"
      }
    ]
  }
}
```

---

### Delete Navigation Item

Delete navigation item.

**Endpoint**: `DELETE /api/navigation-items/:id`

**Authentication**: Required

**Permission**: `navigation:delete` or `*:*`

**Path Parameters**:

| Parameter | Type | Required | Description        |
| --------- | ---- | -------- | ------------------ |
| `id`      | UUID | Yes      | Navigation item ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Navigation item deleted successfully"
  }
}
```

**Example Request**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items/550e8400-e29b-41d4-a716-446655440000
```

**Constraints**:

- ⚠️ Cannot delete items with children
- ⚠️ Deletion is permanent (cannot be undone)
- ⚠️ Associated permissions are automatically removed
- ⚠️ User preferences for this item are deleted

**Error Responses**:

```json
// 400 Has Children
{
  "success": false,
  "error": {
    "code": "NAVIGATION_ITEM_HAS_CHILDREN",
    "message": "Cannot delete navigation item with children. Delete or move children first."
  }
}

// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NAVIGATION_ITEM_NOT_FOUND",
    "message": "Navigation item not found"
  }
}
```

---

### Reorder Navigation Items

Update sort order for multiple navigation items at once.

**Endpoint**: `POST /api/navigation-items/reorder`

**Authentication**: Required

**Permission**: `navigation:update` or `*:*`

**Request Body**:

```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sort_order": 10
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "sort_order": 20
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "sort_order": 30
    }
  ]
}
```

**Request Schema**:

| Field                 | Type    | Required | Description            |
| --------------------- | ------- | -------- | ---------------------- |
| `orders`              | array   | Yes      | Array of order updates |
| `orders[].id`         | UUID    | Yes      | Navigation item ID     |
| `orders[].sort_order` | integer | Yes      | New sort order         |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Navigation items reordered successfully",
    "updated_count": 3
  }
}
```

**Example Request**:

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {"id": "550e8400-e29b-41d4-a716-446655440000", "sort_order": 5},
      {"id": "660e8400-e29b-41d4-a716-446655440001", "sort_order": 10}
    ]
  }' \
  http://localhost:3333/api/navigation-items/reorder
```

**Use Cases**:

- Drag & drop reordering
- Bulk position updates
- Menu reorganization

**Transaction Behavior**:

- All updates are atomic (all succeed or all fail)
- Uses database transaction
- Cache invalidated after successful commit

**Error Responses**:

```json
// 400 Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": [
      {
        "field": "orders[0].id",
        "message": "must match format \"uuid\"",
        "code": "FORMAT"
      }
    ]
  }
}
```

---

## Permission Management API

### Get Navigation Item Permissions

Get all permissions assigned to a navigation item.

**Endpoint**: `GET /api/navigation-items/:id/permissions`

**Authentication**: Required

**Permission**: `navigation:read` or `*:*`

**Path Parameters**:

| Parameter | Type | Required | Description        |
| --------- | ---- | -------- | ------------------ |
| `id`      | UUID | Yes      | Navigation item ID |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "resource": "users",
      "action": "read",
      "description": "View user information",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440006",
      "resource": "users",
      "action": "create",
      "description": "Create new users",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Example Request**:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items/550e8400-e29b-41d4-a716-446655440000/permissions
```

---

### Assign Permissions to Navigation Item

Assign permissions to navigation item (replaces existing permissions).

**Endpoint**: `POST /api/navigation-items/:id/permissions`

**Authentication**: Required

**Permission**: `navigation:update` or `*:*`

**Path Parameters**:

| Parameter | Type | Required | Description        |
| --------- | ---- | -------- | ------------------ |
| `id`      | UUID | Yes      | Navigation item ID |

**Request Body**:

```json
{
  "permission_ids": ["990e8400-e29b-41d4-a716-446655440005", "aa0e8400-e29b-41d4-a716-446655440006"]
}
```

**Field Schema**:

| Field            | Type   | Required | Description                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `permission_ids` | UUID[] | Yes      | Array of permission IDs to assign |

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "resource": "users",
      "action": "read",
      "description": "View user information"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440006",
      "resource": "users",
      "action": "create",
      "description": "Create new users"
    }
  ]
}
```

**Example Request**:

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [
      "990e8400-e29b-41d4-a716-446655440005"
    ]
  }' \
  http://localhost:3333/api/navigation-items/550e8400-e29b-41d4-a716-446655440000/permissions
```

**Behavior**:

- **Replaces** all existing permissions (not additive)
- Empty array = Remove all permissions (make public)
- Transaction-safe (all or nothing)
- Cache automatically invalidated

**Making Item Public**:

```bash
# Remove all permissions
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission_ids": []}' \
  http://localhost:3333/api/navigation-items/{id}/permissions
```

**Error Responses**:

```json
// 400 Invalid Permission ID
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more permission IDs are invalid"
  }
}
```

---

## Rate Limiting

**Limits**:

- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 1000 requests/minute per user
- Bulk operations: 10 requests/minute per user

**Headers**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

**429 Response** (Rate limit exceeded):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Examples

### Example 1: Complete CRUD Flow

```bash
# 1. Create parent group
PARENT_RESPONSE=$(curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "inventory",
    "title": "Inventory",
    "type": "collapsible",
    "icon": "inventory_2",
    "sort_order": 50,
    "show_in_default": true
  }' \
  http://localhost:3333/api/navigation-items)

PARENT_ID=$(echo $PARENT_RESPONSE | jq -r '.data.id')

# 2. Create child items
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent_id\": \"$PARENT_ID\",
    \"key\": \"inventory-items\",
    \"title\": \"Items\",
    \"type\": \"item\",
    \"icon\": \"list\",
    \"link\": \"/inventory/items\",
    \"sort_order\": 1,
    \"show_in_default\": true
  }" \
  http://localhost:3333/api/navigation-items

# 3. Assign permissions
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": ["'$INVENTORY_READ_PERMISSION_ID'"]
  }' \
  http://localhost:3333/api/navigation-items/$PARENT_ID/permissions

# 4. Get user navigation (verify)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation/user?type=default

# 5. Update item
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badge_title": "New",
    "badge_variant": "primary"
  }' \
  http://localhost:3333/api/navigation-items/$PARENT_ID

# 6. Delete child items first
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items/$CHILD_ID

# 7. Delete parent
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items/$PARENT_ID
```

### Example 2: Bulk Reordering

```bash
# Get all items
ITEMS=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/navigation-items)

# Extract IDs and create new order
NEW_ORDER=$(echo $ITEMS | jq '.data | to_entries | map({id: .value.id, sort_order: (.key + 1) * 10})')

# Apply new order
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orders\": $NEW_ORDER}" \
  http://localhost:3333/api/navigation-items/reorder
```

### Example 3: Permission-Based Menu

```bash
# User with 'users:read' permission
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3333/api/navigation/user

# Response includes:
# - Dashboard (no permission required)
# - Users (has users:read)
# Excludes:
# - RBAC (requires rbac:read)
# - Settings (requires settings:manage)

# Admin with '*:*' permission
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3333/api/navigation/user

# Response includes ALL items (wildcard permission)
```

### Example 4: TypeScript Client

```typescript
// Navigation API Client
class NavigationAPI {
  constructor(
    private baseURL: string,
    private token: string,
  ) {}

  async getNavigation(type: string = 'default') {
    const response = await fetch(`${this.baseURL}/navigation?type=${type}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  async getUserNavigation(type: string = 'default') {
    const response = await fetch(`${this.baseURL}/navigation/user?type=${type}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  async createNavigationItem(data: CreateNavigationItemRequest) {
    const response = await fetch(`${this.baseURL}/navigation-items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateNavigationItem(id: string, data: UpdateNavigationItemRequest) {
    const response = await fetch(`${this.baseURL}/navigation-items/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteNavigationItem(id: string) {
    const response = await fetch(`${this.baseURL}/navigation-items/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  async assignPermissions(itemId: string, permissionIds: string[]) {
    const response = await fetch(`${this.baseURL}/navigation-items/${itemId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permission_ids: permissionIds }),
    });
    return response.json();
  }
}

// Usage
const api = new NavigationAPI('http://localhost:3333/api', token);

// Load user navigation
const navigation = await api.getUserNavigation('default');

// Create new item
const newItem = await api.createNavigationItem({
  key: 'reports',
  title: 'Reports',
  type: 'item',
  icon: 'bar_chart',
  link: '/reports',
  sort_order: 40,
  show_in_default: true,
});

// Assign permissions
await api.assignPermissions(newItem.data.id, [permissionId]);
```

---

## OpenAPI Specification

Full OpenAPI 3.0 spec available at: `/api/documentation`

**Swagger UI**: `http://your-domain/api/documentation`

**OpenAPI JSON**: `http://your-domain/api/documentation/json`

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintained By**: Development Team
