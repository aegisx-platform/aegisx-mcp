---
title: '[Feature Name] API Reference'
description: 'API endpoints, request/response schemas, and authentication for [Feature Name]'
category: features
tags: [api, backend, reference]
order: 2
---

# [Feature Name] API Reference

Complete API documentation for the [Feature Name] feature.

## 🔐 Authentication

All endpoints require authentication unless otherwise noted.

### Authentication Methods

```http
# Bearer Token
Authorization: Bearer <your_jwt_token>

# API Key
X-API-Key: <your_api_key>
```

## 📍 Base URL

```
Development: http://localhost:3000/api
Production: https://api.aegisx.com/api
```

## 🔌 Endpoints

### List Items

Retrieve a paginated list of items.

**Endpoint:** `GET /feature-items`

**Query Parameters:**

| Parameter | Type   | Required | Default     | Description                  |
| --------- | ------ | -------- | ----------- | ---------------------------- |
| `page`    | number | No       | 1           | Page number                  |
| `limit`   | number | No       | 10          | Items per page (max 100)     |
| `sort`    | string | No       | `createdAt` | Sort field                   |
| `order`   | string | No       | `desc`      | Sort order (`asc` or `desc`) |
| `search`  | string | No       | -           | Search query                 |

**Request Example:**

```http
GET /api/feature-items?page=1&limit=20&sort=name&order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Item 1",
      "description": "Description",
      "createdAt": "2025-12-14T10:00:00Z",
      "updatedAt": "2025-12-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid pagination parameters",
    "details": [
      {
        "field": "limit",
        "message": "Must be between 1 and 100"
      }
    ]
  }
}
```

---

### Get Item by ID

Retrieve a single item by its ID.

**Endpoint:** `GET /feature-items/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | UUID | Yes      | Item UUID   |

**Request Example:**

```http
GET /api/feature-items/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Item 1",
    "description": "Detailed description",
    "metadata": {
      "key1": "value1"
    },
    "createdAt": "2025-12-14T10:00:00Z",
    "updatedAt": "2025-12-14T10:00:00Z"
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found"
  }
}
```

---

### Create Item

Create a new item.

**Endpoint:** `POST /feature-items`

**Request Body:**

```json
{
  "name": "New Item",
  "description": "Item description",
  "metadata": {
    "key1": "value1"
  }
}
```

**TypeBox Schema:**

```typescript
const CreateItemSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String({ maxLength: 1000 })),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
```

**Response Example (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Item",
    "description": "Item description",
    "metadata": {
      "key1": "value1"
    },
    "createdAt": "2025-12-14T10:00:00Z",
    "updatedAt": "2025-12-14T10:00:00Z"
  }
}
```

---

### Update Item

Update an existing item.

**Endpoint:** `PUT /feature-items/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | UUID | Yes      | Item UUID   |

**Request Body:**

```json
{
  "name": "Updated Item",
  "description": "Updated description"
}
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Item",
    "description": "Updated description",
    "createdAt": "2025-12-14T10:00:00Z",
    "updatedAt": "2025-12-14T15:30:00Z"
  }
}
```

---

### Delete Item

Delete an item.

**Endpoint:** `DELETE /feature-items/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | UUID | Yes      | Item UUID   |

**Response Example (200 OK):**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 📊 Rate Limiting

| Endpoint                    | Rate Limit          |
| --------------------------- | ------------------- |
| `GET` endpoints             | 100 requests/minute |
| `POST/PUT/DELETE` endpoints | 50 requests/minute  |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## 🔔 WebSocket Events

Real-time updates via WebSocket.

**Connect:**

```typescript
const socket = io('ws://localhost:3000', {
  auth: { token: 'your_jwt_token' },
});
```

**Subscribe to Feature Events:**

```typescript
socket.on('feature:created', (data) => {
  console.log('New item created:', data);
});

socket.on('feature:updated', (data) => {
  console.log('Item updated:', data);
});

socket.on('feature:deleted', (data) => {
  console.log('Item deleted:', data);
});
```

## 🔗 Related Documentation

- [Feature Overview](./README.md)
- [Architecture](./architecture.md)
- [Developer Guide](./developer-guide.md)
- [API Response Standard](../../reference/api/api-response-standard.md)

---

For implementation details, see the [Developer Guide](./developer-guide.md).
