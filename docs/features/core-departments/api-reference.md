# Core Departments - API Reference

> **Complete API documentation for department management endpoints**

**Version:** 1.0.0
**Last Updated:** 2025-12-14
**Base URL:** `/api/departments`

---

## Table of Contents

- [Authentication & Permissions](#authentication--permissions)
- [Response Format](#response-format)
- [List Departments](#list-departments)
- [Get Department](#get-department)
- [Create Department](#create-department)
- [Update Department](#update-department)
- [Delete Department](#delete-department)
- [Get Hierarchy](#get-hierarchy)
- [Get Dropdown](#get-dropdown)
- [Get Statistics](#get-statistics)
- [Error Codes](#error-codes)

---

## Authentication & Permissions

### Required Headers

```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Required Permissions

| Endpoint       | Method | Permission           |
| -------------- | ------ | -------------------- |
| All endpoints  | Any    | `departments:read`   |
| GET /hierarchy | GET    | `departments:read`   |
| GET /dropdown  | GET    | `departments:read`   |
| POST /         | POST   | `departments:create` |
| PUT /:id       | PUT    | `departments:update` |
| DELETE /:id    | DELETE | `departments:delete` |

### Example Header

```bash
curl -X GET http://localhost:3000/api/departments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Response Format

### Success Response (200, 201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital",
    "parent_id": null,
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T10:30:00Z"
  },
  "message": "Department retrieved successfully"
}
```

### Paginated Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dept_code": "HOSPITAL",
      "dept_name": "Main Hospital",
      "parent_id": null,
      "is_active": true,
      "created_at": "2025-12-14T10:30:00Z",
      "updated_at": "2025-12-14T10:30:00Z"
    },
    {
      "id": 2,
      "dept_code": "NURSING",
      "dept_name": "Nursing Department",
      "parent_id": 1,
      "is_active": true,
      "created_at": "2025-12-14T10:35:00Z",
      "updated_at": "2025-12-14T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### Error Response (400, 422, 500)

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_CODE_EXISTS",
    "message": "Department code already exists",
    "details": {
      "code": "HOSPITAL"
    }
  }
}
```

---

## List Departments

Get a paginated list of all departments with filtering and sorting.

### Endpoint

```
GET /api/departments
```

### Query Parameters

| Parameter   | Type     | Required | Description                            | Example                          |
| ----------- | -------- | -------- | -------------------------------------- | -------------------------------- |
| `page`      | number   | No       | Page number (default: 1)               | `?page=2`                        |
| `limit`     | number   | No       | Items per page, max 1000 (default: 20) | `?limit=50`                      |
| `sort`      | string   | No       | Sort order (field:asc or field:desc)   | `?sort=dept_code:asc`            |
| `search`    | string   | No       | Search dept_name or dept_code          | `?search=nursing`                |
| `dept_code` | string   | No       | Filter by department code              | `?dept_code=NURSING`             |
| `dept_name` | string   | No       | Filter by department name              | `?dept_name=Nursing`             |
| `parent_id` | number   | No       | Filter by parent department            | `?parent_id=1`                   |
| `is_active` | boolean  | No       | Filter by active status                | `?is_active=true`                |
| `fields`    | string[] | No       | Select specific fields to return       | `?fields=id,dept_code,dept_name` |

### Examples

#### List All Departments

```bash
curl -X GET http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dept_code": "HOSPITAL",
      "dept_name": "Main Hospital",
      "parent_id": null,
      "is_active": true,
      "created_at": "2025-12-14T10:30:00Z",
      "updated_at": "2025-12-14T10:30:00Z"
    },
    {
      "id": 2,
      "dept_code": "NURSING",
      "dept_name": "Nursing Department",
      "parent_id": 1,
      "is_active": true,
      "created_at": "2025-12-14T10:35:00Z",
      "updated_at": "2025-12-14T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

#### List with Pagination

```bash
curl -X GET "http://localhost:3000/api/departments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Search Departments

```bash
curl -X GET "http://localhost:3000/api/departments?search=nursing" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Filter by Status

```bash
curl -X GET "http://localhost:3000/api/departments?is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Sort and Filter

```bash
curl -X GET "http://localhost:3000/api/departments?sort=dept_code:asc&is_active=true&parent_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Select Specific Fields

```bash
curl -X GET "http://localhost:3000/api/departments?fields=id,dept_code,dept_name" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Status Codes

- `200 OK` - Departments retrieved successfully
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:read` permission
- `500 Internal Server Error` - Server error

---

## Get Department

Retrieve a single department by ID.

### Endpoint

```
GET /api/departments/:id
```

### Parameters

| Name | Type           | Required | Description   |
| ---- | -------------- | -------- | ------------- |
| `id` | integer/string | Yes      | Department ID |

### Example

```bash
curl -X GET http://localhost:3000/api/departments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital",
    "parent_id": null,
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T10:30:00Z"
  }
}
```

### Status Codes

- `200 OK` - Department found
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:read` permission
- `404 Not Found` - Department does not exist
- `500 Internal Server Error` - Server error

---

## Create Department

Create a new department.

### Endpoint

```
POST /api/departments
```

### Request Body

| Field       | Type    | Required | Validation         | Description                          |
| ----------- | ------- | -------- | ------------------ | ------------------------------------ |
| `dept_code` | string  | Yes      | 1-10 chars, unique | Department code identifier           |
| `dept_name` | string  | Yes      | 1-100 chars        | Department name                      |
| `parent_id` | integer | No       | Valid dept ID      | Parent department ID (null for root) |
| `is_active` | boolean | No       | —                  | Active status (default: true)        |

### Examples

#### Create Root Department

```bash
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital",
    "is_active": true
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital",
    "parent_id": null,
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T10:30:00Z"
  },
  "message": "Department created successfully"
}
```

#### Create Child Department

```bash
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_code": "NURSING",
    "dept_name": "Nursing Department",
    "parent_id": 1,
    "is_active": true
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "dept_code": "NURSING",
    "dept_name": "Nursing Department",
    "parent_id": 1,
    "is_active": true,
    "created_at": "2025-12-14T10:35:00Z",
    "updated_at": "2025-12-14T10:35:00Z"
  },
  "message": "Department created successfully"
}
```

### Status Codes

- `201 Created` - Department created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:create` permission
- `409 Conflict` - Department code already exists
- `422 Unprocessable Entity` - Validation error (invalid parent)
- `500 Internal Server Error` - Server error

### Error Examples

#### Duplicate Code

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_CODE_EXISTS",
    "message": "Department code already exists",
    "details": {
      "code": "HOSPITAL"
    }
  }
}
```

#### Invalid Parent

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_INVALID_PARENT",
    "message": "Invalid parent department",
    "details": {
      "parentId": 999
    }
  }
}
```

---

## Update Department

Update an existing department.

### Endpoint

```
PUT /api/departments/:id
```

### Parameters

| Name | Type           | Required | Description   |
| ---- | -------------- | -------- | ------------- |
| `id` | integer/string | Yes      | Department ID |

### Request Body

| Field       | Type    | Required | Validation         | Description                   |
| ----------- | ------- | -------- | ------------------ | ----------------------------- |
| `dept_code` | string  | No       | 1-10 chars, unique | Department code (if changing) |
| `dept_name` | string  | No       | 1-100 chars        | Department name               |
| `parent_id` | integer | No       | Valid dept ID      | Parent department ID          |
| `is_active` | boolean | No       | —                  | Active status                 |

### Examples

#### Update Department Name

```bash
curl -X PUT http://localhost:3000/api/departments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_name": "Main Hospital Complex"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital Complex",
    "parent_id": null,
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T11:00:00Z"
  },
  "message": "Department updated successfully"
}
```

#### Move Department (Change Parent)

```bash
curl -X PUT http://localhost:3000/api/departments/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parent_id": 2
  }'
```

#### Deactivate Department

```bash
curl -X PUT http://localhost:3000/api/departments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

### Status Codes

- `200 OK` - Department updated successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:update` permission
- `404 Not Found` - Department does not exist
- `409 Conflict` - Department code already exists (if changing)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Error Examples

#### Circular Hierarchy

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_CIRCULAR_HIERARCHY",
    "message": "Cannot create circular hierarchy in departments",
    "details": {
      "departmentId": 1,
      "parentId": 3
    }
  }
}
```

---

## Delete Department

Delete a department by ID.

### Endpoint

```
DELETE /api/departments/:id
```

### Parameters

| Name | Type           | Required | Description   |
| ---- | -------------- | -------- | ------------- |
| `id` | integer/string | Yes      | Department ID |

### Example

```bash
curl -X DELETE http://localhost:3000/api/departments/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 5,
    "deleted": true
  },
  "message": "Department deleted successfully"
}
```

### Status Codes

- `200 OK` - Department deleted successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:delete` permission
- `404 Not Found` - Department does not exist
- `422 Unprocessable Entity` - Cannot delete (has children or users)
- `500 Internal Server Error` - Server error

### Error Examples

#### Department Has Children

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_CANNOT_DELETE_HAS_CHILDREN",
    "message": "Cannot delete department - has child departments",
    "details": {
      "references": [
        {
          "table": "departments",
          "field": "parent_id",
          "count": 3,
          "reason": "child departments"
        }
      ],
      "message": "Cannot delete department - 3 child departments"
    }
  }
}
```

#### Department Has Users

```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENTS_CANNOT_DELETE_HAS_USERS",
    "message": "Cannot delete department - has assigned users",
    "details": {
      "references": [
        {
          "table": "users",
          "field": "department_id",
          "count": 5,
          "reason": "assigned users"
        }
      ],
      "message": "Cannot delete department - 5 assigned users"
    }
  }
}
```

---

## Get Hierarchy

Retrieve the department hierarchy as a nested tree structure.

### Endpoint

```
GET /api/departments/hierarchy
```

### Query Parameters

| Parameter  | Type   | Required | Description                              | Example       |
| ---------- | ------ | -------- | ---------------------------------------- | ------------- |
| `parentId` | number | No       | Start from specific parent (null = root) | `?parentId=1` |

### Examples

#### Get Full Hierarchy

```bash
curl -X GET http://localhost:3000/api/departments/hierarchy \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": {
    "hierarchy": [
      {
        "id": 1,
        "dept_code": "HOSPITAL",
        "dept_name": "Main Hospital",
        "parent_id": null,
        "is_active": true,
        "children": [
          {
            "id": 2,
            "dept_code": "NURSING",
            "dept_name": "Nursing Department",
            "parent_id": 1,
            "is_active": true,
            "children": [
              {
                "id": 3,
                "dept_code": "ICU-NURSING",
                "dept_name": "ICU Nursing",
                "parent_id": 2,
                "is_active": true,
                "children": []
              }
            ]
          },
          {
            "id": 4,
            "dept_code": "MEDICAL",
            "dept_name": "Medical Department",
            "parent_id": 1,
            "is_active": true,
            "children": []
          }
        ]
      }
    ],
    "total": 1
  }
}
```

#### Get Sub-hierarchy

```bash
curl -X GET "http://localhost:3000/api/departments/hierarchy?parentId=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": {
    "hierarchy": [
      {
        "id": 3,
        "dept_code": "ICU-NURSING",
        "dept_name": "ICU Nursing",
        "parent_id": 2,
        "is_active": true,
        "children": []
      },
      {
        "id": 5,
        "dept_code": "WARD-NURSING",
        "dept_name": "Ward Nursing",
        "parent_id": 2,
        "is_active": true,
        "children": []
      }
    ],
    "total": 2
  }
}
```

### Status Codes

- `200 OK` - Hierarchy retrieved successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:read` permission
- `500 Internal Server Error` - Server error

---

## Get Dropdown

Get simplified list of departments for UI dropdowns.

### Endpoint

```
GET /api/departments/dropdown
```

### Query Parameters

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| `search`  | string | No       | Search in dept_code or dept_name |
| `limit`   | number | No       | Max results (default: 100)       |

### Examples

#### Get All Active Departments

```bash
curl -X GET http://localhost:3000/api/departments/dropdown \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "success": true,
  "data": {
    "options": [
      {
        "id": 1,
        "dept_code": "HOSPITAL",
        "dept_name": "Main Hospital",
        "parent_id": null,
        "is_active": true
      },
      {
        "id": 2,
        "dept_code": "NURSING",
        "dept_name": "Nursing Department",
        "parent_id": 1,
        "is_active": true
      },
      {
        "id": 3,
        "dept_code": "MEDICAL",
        "dept_name": "Medical Department",
        "parent_id": 1,
        "is_active": true
      }
    ],
    "total": 3
  }
}
```

#### Search in Dropdown

```bash
curl -X GET "http://localhost:3000/api/departments/dropdown?search=nursing" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Status Codes

- `200 OK` - Dropdown list retrieved
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:read` permission
- `500 Internal Server Error` - Server error

---

## Get Statistics

Get department statistics.

### Endpoint

```
GET /api/departments/stats
```

### Example

```bash
curl -X GET http://localhost:3000/api/departments/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 145,
    "inactive": 5
  }
}
```

### Status Codes

- `200 OK` - Statistics retrieved successfully
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Missing `departments:read` permission
- `500 Internal Server Error` - Server error

---

## Error Codes

### Complete Error Reference

| Code                                       | HTTP Status | Cause                           | Solution                    |
| ------------------------------------------ | ----------- | ------------------------------- | --------------------------- |
| `DEPARTMENTS_NOT_FOUND`                    | 404         | Department doesn't exist        | Verify department ID        |
| `DEPARTMENTS_CODE_EXISTS`                  | 409         | Code already in use             | Use different code          |
| `DEPARTMENTS_INVALID_PARENT`               | 422         | Parent department not found     | Verify parent ID            |
| `DEPARTMENTS_CIRCULAR_HIERARCHY`           | 422         | Would create circular reference | Choose different parent     |
| `DEPARTMENTS_CANNOT_DELETE_HAS_CHILDREN`   | 422         | Has child departments           | Reassign children first     |
| `DEPARTMENTS_CANNOT_DELETE_HAS_USERS`      | 422         | Has assigned users              | Reassign users first        |
| `DEPARTMENTS_CANNOT_DELETE_HAS_REFERENCES` | 422         | Has other references            | Check details for specifics |
| `DEPARTMENTS_VALIDATION_ERROR`             | 400         | Invalid input                   | Check error details         |

### Generic Error Codes

| Code              | HTTP Status | Meaning                     |
| ----------------- | ----------- | --------------------------- |
| `Unauthorized`    | 401         | Missing or invalid token    |
| `Forbidden`       | 403         | Missing required permission |
| `ValidationError` | 400         | Invalid request format      |
| `ServerError`     | 500         | Internal server error       |

---

## Rate Limiting

No explicit rate limits are enforced on department endpoints. However, general API rate limits apply:

- Default: 100 requests per minute per API key
- Bulk operations: 10 requests per minute

For import operations, use System Init endpoints with higher limits.

---

## WebSocket Events

Real-time updates are sent via WebSocket when departments change:

```javascript
// Subscribe to department updates
socket.on('departments:created', (department) => {
  console.log('New department:', department);
});

socket.on('departments:updated', (department) => {
  console.log('Updated department:', department);
});

socket.on('departments:deleted', (departmentId) => {
  console.log('Deleted department:', departmentId);
});
```

---

## Pagination Guide

### How It Works

- **page**: Current page number (1-based)
- **limit**: Items per page (default: 20, max: 1000)
- **total**: Total number of items
- **totalPages**: Number of pages

### Example

```bash
# Get page 2 with 50 items per page
curl "http://localhost:3000/api/departments?page=2&limit=50"
```

Response includes:

```json
{
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

---

## Filtering Guide

### By Code

```bash
curl "http://localhost:3000/api/departments?dept_code=NURSING"
```

### By Name

```bash
curl "http://localhost:3000/api/departments?dept_name=Nursing"
```

### By Parent

```bash
curl "http://localhost:3000/api/departments?parent_id=1"
```

### By Status

```bash
curl "http://localhost:3000/api/departments?is_active=true"
```

### Combine Filters

```bash
curl "http://localhost:3000/api/departments?parent_id=1&is_active=true&sort=dept_code:asc"
```

---

## Sorting Guide

### Basic Sort

```bash
# Ascending (default)
curl "http://localhost:3000/api/departments?sort=dept_code:asc"

# Descending
curl "http://localhost:3000/api/departments?sort=created_at:desc"
```

### Multiple Sorts

```bash
# Sort by code, then by name
curl "http://localhost:3000/api/departments?sort=dept_code:asc,dept_name:asc"
```

### Available Fields for Sorting

- `id`
- `dept_code`
- `dept_name`
- `parent_id`
- `is_active`
- `created_at`
- `updated_at`

---

For bulk import operations, see [SYSTEM_INIT_INTEGRATION.md](./system-init-integration.md).
