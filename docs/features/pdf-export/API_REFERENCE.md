# PDF Export - API Reference

> **Complete API endpoint documentation**

**Base URL:** `/api/pdf-export`
**Version:** 1.0.0
**Last Updated:** 2025-10-31

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)

---

## 🔐 Authentication

All API endpoints require authentication unless specified otherwise.

### Headers Required

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Permissions Required

| Endpoint | Permission Required |
|----------|---------------------|
| `POST /` | `feature-name:create` |
| `GET /` | `feature-name:read` |
| `GET /:id` | `feature-name:read` |
| `PUT /:id` | `feature-name:update` |
| `DELETE /:id` | `feature-name:delete` |

---

## 📡 Endpoints

### List All Items

```http
GET /api/pdf-export
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search query |
| `sortBy` | string | No | Sort field (default: created_at) |
| `sortOrder` | string | No | Sort order: asc/desc (default: desc) |
| `filter[field]` | any | No | Filter by specific field |

**Response:** `200 OK`

```typescript
{
  success: true,
  data: {
    items: Feature[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

---

### Get Single Item

```http
GET /api/pdf-export/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | Feature ID |

**Response:** `200 OK`

```typescript
{
  success: true,
  data: Feature
}
```

**Error Responses:**
- `404` - Feature not found
- `403` - Access denied

---

### Create Item

```http
POST /api/pdf-export
```

**Request Body:**

```typescript
{
  name: string,              // Required, 1-255 chars
  description?: string,      // Optional
  isActive?: boolean,        // Optional, default: true
  // ... other fields
}
```

**Response:** `201 Created`

```typescript
{
  success: true,
  data: Feature
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Duplicate entry
- `403` - Access denied

---

### Update Item

```http
PUT /api/pdf-export/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | Feature ID |

**Request Body:** (All fields optional)

```typescript
{
  name?: string,
  description?: string,
  isActive?: boolean,
  // ... other fields
}
```

**Response:** `200 OK`

```typescript
{
  success: true,
  data: Feature
}
```

**Error Responses:**
- `400` - Validation error
- `404` - Feature not found
- `409` - Duplicate entry
- `403` - Access denied

---

### Delete Item

```http
DELETE /api/pdf-export/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | Feature ID |

**Response:** `204 No Content`

**Error Responses:**
- `404` - Feature not found
- `409` - Cannot delete (has dependencies)
- `403` - Access denied

---

### Bulk Operations

#### Bulk Create

```http
POST /api/pdf-export/bulk
```

**Request Body:**

```typescript
{
  items: CreateFeature[]  // Array of items to create
}
```

**Response:** `201 Created`

```typescript
{
  success: true,
  data: {
    created: Feature[],
    failed: { item: CreateFeature, error: string }[]
  }
}
```

#### Bulk Delete

```http
DELETE /api/pdf-export/bulk
```

**Request Body:**

```typescript
{
  ids: string[]  // Array of UUIDs to delete
}
```

**Response:** `200 OK`

```typescript
{
  success: true,
  data: {
    deleted: string[],    // Successfully deleted IDs
    failed: string[]      // Failed to delete IDs
  }
}
```

---

### Export

```http
GET /api/pdf-export/export
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format: csv/xlsx (default: csv) |
| `filter[field]` | any | No | Apply filters before export |

**Response:** `200 OK`

Headers:
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="features-2025-10-31.csv"
```

---

## 📝 Request/Response Examples

### Create Feature Example

**Request:**

```bash
curl -X POST https://api.aegisx.example.com/api/features \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Feature",
    "description": "Feature description",
    "isActive": true
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Feature",
    "description": "Feature description",
    "isActive": true,
    "userId": "660e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-10-31T10:30:00.000Z",
    "updatedAt": "2025-10-31T10:30:00.000Z"
  }
}
```

---

## ⚠️ Error Codes

### Standard Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate entry or constraint violation |
| 422 | `BUSINESS_RULE_VIOLATION` | Business logic validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

### Validation Error Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      },
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 🚦 Rate Limits

### Default Limits

- **Authenticated requests:** 1000 requests per hour
- **Unauthenticated requests:** 100 requests per hour

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635724800
```

### Handling Rate Limits

When rate limit is exceeded:

**Response:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds",
    "retryAfter": 3600
  }
}
```

**Best Practice:** Implement exponential backoff in your client code.

---

## 📚 Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation details
- [User Guide](./USER_GUIDE.md) - Feature usage
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

---

**API Version:** 1.0.0
**Last Updated:** 2025-10-31
**Support:** api-support@aegisx.example.com
