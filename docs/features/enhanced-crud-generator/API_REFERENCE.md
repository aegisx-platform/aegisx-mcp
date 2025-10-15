# Enhanced CRUD Generator - API Reference

> **📚 Complete API documentation for all generated endpoints across package levels**

## 📋 API Overview

The Enhanced CRUD Generator creates RESTful APIs with OpenAPI/Swagger documentation. All endpoints support:

- **TypeBox Schema Validation**
- **Role-Based Authorization (RBAC)**
- **Structured Error Responses**
- **Request/Response Logging**

## 🎯 Package Comparison

| Feature           | Standard (5) | Enterprise (13) | Full (15) |
| ----------------- | ------------ | --------------- | --------- |
| Basic CRUD        | ✅           | ✅              | ✅        |
| Bulk Operations   | ❌           | ✅              | ✅        |
| UI Helpers        | ❌           | ✅              | ✅        |
| Status Management | ❌           | ✅              | ✅        |
| Validation APIs   | ❌           | ❌              | ✅        |

---

## 🔵 Standard Package Routes (5)

### 1. Create Item

**`POST /{resource}`**

Creates a new resource item.

```http
POST /api/products
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones",
  "price": 299.99,
  "is_active": true
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "price": 299.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Product created successfully"
}
```

**Authorization:** `{resource}.create` or `admin`

---

### 2. Get Item by ID

**`GET /{resource}/{id}`**

Retrieves a specific resource by ID.

```http
GET /api/products/123?include=category,tags
Authorization: Bearer {token}
```

**Query Parameters:**

- `include` (optional): Comma-separated list of relations to include

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones",
    "price": 299.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Authorization:** `{resource}.read` or `admin`

---

### 3. List Items (Paginated)

**`GET /{resource}`**

Retrieves a paginated list of resources with filtering and search.

```http
GET /api/products?page=1&limit=20&search=wireless&is_active=true&sortBy=name&sortOrder=asc
Authorization: Bearer {token}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 1000)
- `search` (optional): Search term for searchable fields
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): `asc` or `desc` (default: desc)
- `include` (optional): Relations to include
- **Dynamic filters**: Any table column can be used as filter

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Wireless Headphones",
      "price": 299.99,
      "is_active": true
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Authorization:** `{resource}.read` or `admin`

---

### 4. Update Item

**`PUT /{resource}/{id}`**

Updates an existing resource.

```http
PUT /api/products/123
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Premium Wireless Headphones",
  "price": 349.99
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Premium Wireless Headphones",
    "price": 349.99,
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Product updated successfully"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 5. Delete Item

**`DELETE /{resource}/{id}`**

Deletes a resource.

```http
DELETE /api/products/123
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "123",
    "deleted": true
  }
}
```

**Authorization:** `{resource}.delete` or `admin`

---

## 🟡 Enterprise Package Routes (+8)

### 6. Get Dropdown Options

**`GET /{resource}/dropdown`**

Retrieves formatted options for UI dropdown/select components.

```http
GET /api/products/dropdown?search=wireless&limit=50&labelField=name&valueField=id
Authorization: Bearer {token}
```

**Query Parameters:**

- `search` (optional): Filter by search term
- `limit` (optional): Maximum options to return
- `labelField` (optional): Field to use as label
- `valueField` (optional): Field to use as value

**Response (200):**

```json
{
  "success": true,
  "data": {
    "options": [
      {
        "value": "123",
        "label": "Wireless Headphones",
        "disabled": false
      },
      {
        "value": "124",
        "label": "Wireless Mouse",
        "disabled": false
      }
    ],
    "total": 2
  }
}
```

**Authorization:** `{resource}.read` or `admin`

---

### 7. Bulk Create Items

**`POST /{resource}/bulk`**

Creates multiple items in a single operation.

```http
POST /api/products/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
  "items": [
    {
      "name": "Product 1",
      "price": 100
    },
    {
      "name": "Product 2",
      "price": 200
    }
  ],
  "options": {
    "continueOnError": true
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "created": [
      { "id": "125", "name": "Product 1" },
      { "id": "126", "name": "Product 2" }
    ],
    "summary": {
      "successful": 2,
      "failed": 0,
      "errors": []
    }
  },
  "message": "Bulk create completed: 2 successful, 0 failed"
}
```

**Authorization:** `{resource}.create` or `admin`

---

### 8. Bulk Update Items

**`PUT /{resource}/bulk`**

Updates multiple items in a single operation.

```http
PUT /api/products/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
  "items": [
    {
      "id": "125",
      "data": { "price": 150 }
    },
    {
      "id": "126",
      "data": { "price": 250 }
    }
  ],
  "options": {
    "continueOnError": false
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "updated": [
      { "id": "125", "price": 150 },
      { "id": "126", "price": 250 }
    ],
    "summary": {
      "successful": 2,
      "failed": 0,
      "errors": []
    }
  },
  "message": "Bulk update completed: 2 successful, 0 failed"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 9. Bulk Delete Items

**`DELETE /{resource}/bulk`**

Deletes multiple items in a single operation.

```http
DELETE /api/products/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
  "ids": ["125", "126", "127"],
  "options": {
    "continueOnError": true
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "deleted": ["125", "126"],
    "summary": {
      "successful": 2,
      "failed": 1,
      "errors": [
        {
          "id": "127",
          "error": "Item not found"
        }
      ]
    }
  },
  "message": "Bulk delete completed: 2 successful, 1 failed"
}
```

**Authorization:** `{resource}.delete` or `admin`

---

### 10. Bulk Status Update

**`PATCH /{resource}/bulk/status`**

Updates status of multiple items (for tables with is_active field).

```http
PATCH /api/products/bulk/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "ids": ["123", "124"],
  "status": true,
  "options": {
    "continueOnError": false
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "updated": [
      { "id": "123", "is_active": true },
      { "id": "124", "is_active": true }
    ],
    "summary": {
      "successful": 2,
      "failed": 0,
      "errors": []
    }
  },
  "message": "Bulk status update completed: 2 successful, 0 failed"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 11. Activate Item

**`PATCH /{resource}/{id}/activate`**

Activates an item (sets is_active = true).

```http
PATCH /api/products/123/activate
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Approved by admin"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "is_active": true,
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Product activated successfully"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 12. Deactivate Item

**`PATCH /{resource}/{id}/deactivate`**

Deactivates an item (sets is_active = false).

```http
PATCH /api/products/123/deactivate
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Out of stock"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "is_active": false,
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Product deactivated successfully"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 13. Toggle Item Status

**`PATCH /{resource}/{id}/toggle`**

Toggles item status (active ↔ inactive).

```http
PATCH /api/products/123/toggle
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Quick toggle"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "is_active": false,
    "previous_status": true,
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Product status toggled successfully"
}
```

**Authorization:** `{resource}.update` or `admin`

---

### 14. Get Statistics

**`GET /{resource}/stats`**

Retrieves statistical information about the resource.

```http
GET /api/products/stats
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "isActiveCount": 120,
    "isInactiveCount": 30,
    "lastCreated": "2024-01-02T00:00:00Z",
    "lastUpdated": "2024-01-02T00:00:00Z"
  }
}
```

**Authorization:** `{resource}.read` or `admin`

---

## 🔴 Full Package Routes (+2)

### 15. Validate Data

**`POST /{resource}/validate`**

Validates data before saving (without actually saving).

```http
POST /api/products/validate
Content-Type: application/json
Authorization: Bearer {token}

{
  "data": {
    "name": "Test Product",
    "price": -10
  },
  "options": {
    "skipBusinessRules": false,
    "context": {
      "userId": "current-user-id"
    }
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      },
      {
        "field": "name",
        "message": "Product name already exists"
      }
    ]
  }
}
```

**Authorization:** `{resource}.create` or `{resource}.update` or `admin`

---

### 16. Check Field Uniqueness

**`GET /{resource}/check/{field}`**

Checks if a field value is unique.

```http
GET /api/products/check/name?value=Wireless%20Headphones&excludeId=123
Authorization: Bearer {token}
```

**Path Parameters:**

- `field`: Field name to check for uniqueness

**Query Parameters:**

- `value`: Value to check
- `excludeId` (optional): ID to exclude from check (for updates)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "unique": false,
    "exists": {
      "id": "124",
      "name": "Wireless Headphones",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Authorization:** `{resource}.read` or `admin`

---

## 🚨 Error Responses

All endpoints return standardized error responses:

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "price",
        "message": "must be a number"
      }
    ]
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

## 🔐 Authentication & Authorization

### Required Headers

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Permission Structure

Each resource generates these permissions:

- `{resource}.create` - Create operations
- `{resource}.read` - Read operations
- `{resource}.update` - Update operations
- `{resource}.delete` - Delete operations

### Admin Override

Users with `admin` role can access all endpoints regardless of specific permissions.

---

**Related Documentation:**

- [User Guide](./USER_GUIDE.md) - Usage instructions
- [Developer Guide](./DEVELOPER_GUIDE.md) - Technical implementation
- [Architecture](./ARCHITECTURE.md) - System design
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
