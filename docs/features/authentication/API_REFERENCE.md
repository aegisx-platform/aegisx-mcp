# Authentication - API Reference

> **Complete API endpoint documentation**

**Base URL:** `/api/auth`
**Version:** 1.0.0
**Last Updated:** 2025-11-01 (Session 57)

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

| Endpoint      | Permission Required   |
| ------------- | --------------------- |
| `POST /`      | `feature-name:create` |
| `GET /`       | `feature-name:read`   |
| `GET /:id`    | `feature-name:read`   |
| `PUT /:id`    | `feature-name:update` |
| `DELETE /:id` | `feature-name:delete` |

---

## 📡 Endpoints

### List All Items

```http
GET /api/authentication
```

**Query Parameters:**

| Parameter       | Type   | Required | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| `page`          | number | No       | Page number (default: 1)               |
| `limit`         | number | No       | Items per page (default: 10, max: 100) |
| `search`        | string | No       | Search query                           |
| `sortBy`        | string | No       | Sort field (default: created_at)       |
| `sortOrder`     | string | No       | Sort order: asc/desc (default: desc)   |
| `filter[field]` | any    | No       | Filter by specific field               |

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
GET /api/authentication/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Feature ID  |

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
POST /api/authentication
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
PUT /api/authentication/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Feature ID  |

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
DELETE /api/authentication/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id`      | uuid | Yes      | Feature ID  |

**Response:** `204 No Content`

**Error Responses:**

- `404` - Feature not found
- `409` - Cannot delete (has dependencies)
- `403` - Access denied

---

### Bulk Operations

#### Bulk Create

```http
POST /api/authentication/bulk
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
DELETE /api/authentication/bulk
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
GET /api/authentication/export
```

**Query Parameters:**

| Parameter       | Type   | Required | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| `format`        | string | No       | Export format: csv/xlsx (default: csv) |
| `filter[field]` | any    | No       | Apply filters before export            |

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

| HTTP Status | Error Code                | Description                             |
| ----------- | ------------------------- | --------------------------------------- |
| 400         | `VALIDATION_ERROR`        | Request validation failed               |
| 401         | `UNAUTHORIZED`            | Missing or invalid token                |
| 403         | `FORBIDDEN`               | Insufficient permissions                |
| 404         | `NOT_FOUND`               | Resource not found                      |
| 409         | `CONFLICT`                | Duplicate entry or constraint violation |
| 422         | `BUSINESS_RULE_VIOLATION` | Business logic validation failed        |
| 429         | `RATE_LIMIT_EXCEEDED`     | Too many requests                       |
| 500         | `INTERNAL_SERVER_ERROR`   | Unexpected server error                 |

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

## 🚦 Rate Limits (Session 57)

### Authentication Endpoint Rate Limits

**Generous limits designed to allow fixing validation errors while preventing abuse**

| Endpoint                            | Rate Limit   | Time Window | Key Generator | Purpose                                 |
| ----------------------------------- | ------------ | ----------- | ------------- | --------------------------------------- |
| `POST /auth/register`               | 100 requests | 5 minutes   | IP address    | Allow ~90+ validation error corrections |
| `POST /auth/login`                  | 15 attempts  | 5 minutes   | IP + email    | Prevent brute force, allow typos        |
| `POST /auth/reset-password`         | 10 attempts  | 5 minutes   | IP address    | Allow password validation retries       |
| `POST /auth/request-password-reset` | 3 requests   | 1 hour      | IP address    | Prevent email enumeration               |
| `POST /auth/refresh`                | 10 requests  | 1 minute    | IP address    | Normal token refresh rate               |

### Design Philosophy

**"Generous limits that exceed normal user behavior but remain well below attacker patterns"**

- ✅ Users can fix validation errors (username exists, email exists, weak password)
- ✅ Still prevents spam, brute force, and enumeration attacks
- ✅ Excellent UX with maintained security

### Rate Limit Error Response

When rate limit is exceeded, all endpoints return standardized error format:

**Response:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Too many registration attempts. Please try again in a few minutes.",
    "statusCode": 429
  }
}
```

**Error Codes by Endpoint:**

| Endpoint       | Error Code                | Message                               |
| -------------- | ------------------------- | ------------------------------------- |
| Register       | `TOO_MANY_ATTEMPTS`       | "Too many registration attempts..."   |
| Login          | `TOO_MANY_LOGIN_ATTEMPTS` | "Too many login attempts..."          |
| Reset Password | `TOO_MANY_RESET_ATTEMPTS` | "Too many password reset attempts..." |

### Best Practices

1. **Client Implementation:**
   - Display user-friendly error messages
   - Show remaining time before retry
   - Implement exponential backoff for automated clients

2. **User Experience:**
   - Inform users about validation errors early (client-side validation)
   - Provide clear feedback about rate limits
   - Show countdown timer for retry availability

3. **Example Client Handling:**

```typescript
try {
  const response = await authService.register(data);
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    showError('Too many attempts. Please try again in 5 minutes.');
    // Optionally disable form and show countdown
  } else if (error.status === 409) {
    // Validation error (username/email exists)
    showError(error.message); // "Username already exists"
    // User can try again immediately with different data
  }
}
```

### Rate Limit Implementation Details

**Registration Endpoint:**

```typescript
config: {
  rateLimit: {
    max: 100,
    timeWindow: '5 minutes',
    keyGenerator: (req) => req.ip || 'unknown',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'TOO_MANY_ATTEMPTS',
        message: 'Too many registration attempts...',
        statusCode: 429,
      },
    }),
  },
}
```

**Login Endpoint (IP + Email Combo):**

```typescript
config: {
  rateLimit: {
    max: 15,
    timeWindow: '5 minutes',
    keyGenerator: (req) => {
      const email = (req.body as any)?.email || 'unknown';
      return `${req.ip}:${email}`;
    },
    // Prevents brute force on specific user accounts
  },
}
```

### Why These Limits?

**Register (100/5min):**

- User might need to try multiple usernames (all taken)
- User might need to try multiple emails (already registered)
- User might need to adjust password (doesn't meet requirements)
- 100 attempts allows ~90+ corrections while preventing spam

**Login (15/5min):**

- User might forget password and try multiple times
- User might have typos in email/password
- 15 attempts allows ~10-12 legitimate retries
- IP+email combo prevents account-specific brute force

**Reset Password (10/5min):**

- User might try multiple password combinations
- Password might not meet requirements on first attempt
- 10 attempts allows ~7-8 password validations
- Prevents token guessing attacks

---

## 📚 Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Implementation details
- [User Guide](./USER_GUIDE.md) - Feature usage
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

---

**API Version:** 1.0.0
**Last Updated:** 2025-10-31
**Support:** api-support@aegisx.example.com
