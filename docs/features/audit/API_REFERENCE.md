# Audit System API Reference

**Complete API endpoint documentation**

Version: 1.0.0
Last Updated: 2025-11-02
Base URL: `http://localhost:3333/api`

## Table of Contents

- [Authentication](#authentication)
- [Login Attempts API](#login-attempts-api)
- [File Audit API](#file-audit-api)
- [Request/Response Formats](#requestresponse-formats)
- [Error Handling](#error-handling)

## Authentication

All audit endpoints require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3333/api/login-attempts
```

## Login Attempts API

### List Login Attempts

**GET** `/api/login-attempts`

Lists login attempts with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 25 | Items per page |
| `search` | string | - | Search email/username |
| `success` | boolean | - | Filter by success status |
| `userId` | uuid | - | Filter by user ID |
| `startDate` | datetime | - | Start date (ISO 8601) |
| `endDate` | datetime | - | End date (ISO 8601) |
| `orderBy` | string | created_at | Sort field |
| `orderDir` | string | desc | Sort direction (asc/desc) |

**Example Request:**

```bash
curl "http://localhost:3333/api/login-attempts?page=1&limit=25&success=false"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "email": "user@example.com",
      "username": "user123",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": false,
      "failureReason": "INVALID_PASSWORD",
      "createdAt": "2025-11-02T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Login Attempt Statistics

**GET** `/api/login-attempts/stats`

Returns aggregated statistics for login attempts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | datetime | Start date for statistics |
| `endDate` | datetime | End date for statistics |
| `userId` | uuid | Filter by specific user |

**Example Request:**

```bash
curl "http://localhost:3333/api/login-attempts/stats"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalAttempts": 1234,
    "successfulAttempts": 1150,
    "failedAttempts": 84,
    "successRate": 93.19,
    "uniqueUsers": 45,
    "uniqueIPs": 32,
    "topFailureReasons": [
      {
        "reason": "INVALID_PASSWORD",
        "count": 50,
        "percentage": 59.52
      },
      {
        "reason": "USER_NOT_FOUND",
        "count": 20,
        "percentage": 23.81
      }
    ],
    "recentActivity": {
      "last24Hours": 234,
      "last7Days": 1234,
      "last30Days": 4567
    }
  }
}
```

### Get Single Login Attempt

**GET** `/api/login-attempts/:id`

Retrieves a specific login attempt by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Login attempt ID |

**Example Request:**

```bash
curl "http://localhost:3333/api/login-attempts/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "email": "user@example.com",
    "username": "user123",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "success": false,
    "failureReason": "INVALID_PASSWORD",
    "createdAt": "2025-11-02T10:30:00Z"
  }
}
```

### Delete Login Attempt

**DELETE** `/api/login-attempts/:id`

Deletes a specific login attempt (requires admin permission).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Login attempt ID |

**Example Request:**

```bash
curl -X DELETE "http://localhost:3333/api/login-attempts/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Login attempt deleted successfully"
}
```

### Cleanup Old Login Attempts

**DELETE** `/api/login-attempts/cleanup`

Deletes login attempts older than specified days.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Delete records older than X days |

**Example Request:**

```bash
curl -X DELETE "http://localhost:3333/api/login-attempts/cleanup?days=30"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "deletedCount": 2345
  },
  "message": "Successfully deleted 2345 login attempts"
}
```

### Export Login Attempts

**GET** `/api/login-attempts/export`

Exports login attempts as CSV file.

**Query Parameters:**
Accepts same query parameters as list endpoint for filtering.

**Example Request:**

```bash
curl -o login-attempts.csv \
  "http://localhost:3333/api/login-attempts/export?success=false"
```

**CSV Format:**

```csv
Timestamp,User ID,Email,Username,IP Address,User Agent,Success,Failure Reason
2025-11-02T10:30:00Z,7c9e6679...,user@example.com,user123,192.168.1.1,Mozilla/5.0...,false,INVALID_PASSWORD
```

## File Audit API

### List File Audit Logs

**GET** `/api/file-audit`

Lists file operation logs with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 25 | Items per page |
| `search` | string | - | Search filename |
| `fileId` | uuid | - | Filter by file ID |
| `userId` | uuid | - | Filter by user ID |
| `operation` | string | - | Filter by operation type |
| `success` | boolean | - | Filter by success status |
| `startDate` | datetime | - | Start date (ISO 8601) |
| `endDate` | datetime | - | End date (ISO 8601) |
| `orderBy` | string | created_at | Sort field |
| `orderDir` | string | desc | Sort direction |

**Operation Types:**

- `upload` - File uploaded
- `download` - File downloaded
- `delete` - File deleted
- `view` - File viewed/accessed
- `update` - File modified

**Example Request:**

```bash
curl "http://localhost:3333/api/file-audit?operation=upload&success=false"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fileId": "770e8400-e29b-41d4-a716-446655440002",
      "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "operation": "upload",
      "success": false,
      "fileName": "report.pdf",
      "fileSize": 2621440,
      "filePath": "/uploads/2025/11/report.pdf",
      "mimeType": "application/pdf",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "errorMessage": "File size exceeds maximum allowed",
      "createdAt": "2025-11-02T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 50,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get File Audit Statistics

**GET** `/api/file-audit/stats`

Returns aggregated statistics for file operations.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|---------|
| `startDate` | datetime | Start date for statistics |
| `endDate` | datetime | End date for statistics |
| `fileId` | uuid | Filter by specific file |

**Example Request:**

```bash
curl "http://localhost:3333/api/file-audit/stats"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalOperations": 5678,
    "operationCounts": {
      "upload": 1234,
      "download": 2456,
      "delete": 123,
      "view": 1789,
      "update": 76
    },
    "successRate": 98.5,
    "totalDataTransferred": 123456789,
    "topFiles": [
      {
        "fileName": "report.pdf",
        "fileId": "770e8400...",
        "operations": 45
      }
    ],
    "topUsers": [
      {
        "userId": "7c9e6679...",
        "operations": 234
      }
    ]
  }
}
```

### Get Single File Audit Log

**GET** `/api/file-audit/:id`

Retrieves a specific file audit log by ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | File audit log ID |

**Example Request:**

```bash
curl "http://localhost:3333/api/file-audit/660e8400-e29b-41d4-a716-446655440001"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "fileId": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "operation": "upload",
    "success": true,
    "fileName": "report.pdf",
    "fileSize": 2621440,
    "filePath": "/uploads/2025/11/report.pdf",
    "mimeType": "application/pdf",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2025-11-02T10:30:00Z"
  }
}
```

### Delete File Audit Log

**DELETE** `/api/file-audit/:id`

Deletes a specific file audit log (requires admin permission).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | File audit log ID |

**Example Request:**

```bash
curl -X DELETE "http://localhost:3333/api/file-audit/660e8400-e29b-41d4-a716-446655440001"
```

**Example Response:**

```json
{
  "success": true,
  "message": "File audit log deleted successfully"
}
```

### Cleanup Old File Audit Logs

**DELETE** `/api/file-audit/cleanup`

Deletes file audit logs older than specified days.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Delete records older than X days |

**Example Request:**

```bash
curl -X DELETE "http://localhost:3333/api/file-audit/cleanup?days=30"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "deletedCount": 3456
  },
  "message": "Successfully deleted 3456 file audit logs"
}
```

### Export File Audit Logs

**GET** `/api/file-audit/export`

Exports file audit logs as CSV file.

**Query Parameters:**
Accepts same query parameters as list endpoint for filtering.

**Example Request:**

```bash
curl -o file-activity.csv \
  "http://localhost:3333/api/file-audit/export?operation=upload"
```

**CSV Format:**

```csv
Timestamp,File ID,User ID,Operation,Success,File Name,File Size,MIME Type,IP Address,Error Message
2025-11-02T10:30:00Z,770e8400...,7c9e6679...,upload,true,report.pdf,2621440,application/pdf,192.168.1.1,
```

## Request/Response Formats

### Standard Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Optional success message",
  "pagination": {
    /* if applicable */
  }
}
```

### Pagination Object

```json
{
  "page": 1,
  "limit": 25,
  "total": 100,
  "totalPages": 4,
  "hasNext": true,
  "hasPrev": false
}
```

### Date Format

All dates use ISO 8601 format with timezone:

- **Request**: `2025-11-02T00:00:00Z`
- **Response**: `2025-11-02T10:30:15.123Z`

### UUID Format

All IDs use UUID v4 format:

- **Example**: `550e8400-e29b-41d4-a716-446655440000`

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": {
      /* optional additional details */
    }
  }
}
```

### Common HTTP Status Codes

| Status Code | Description           | Common Causes                         |
| ----------- | --------------------- | ------------------------------------- |
| 200         | Success               | Request processed successfully        |
| 400         | Bad Request           | Invalid parameters, validation errors |
| 401         | Unauthorized          | Missing or invalid JWT token          |
| 403         | Forbidden             | Insufficient permissions              |
| 404         | Not Found             | Resource doesn't exist                |
| 422         | Unprocessable Entity  | Validation failed                     |
| 429         | Too Many Requests     | Rate limit exceeded                   |
| 500         | Internal Server Error | Server-side error                     |

### Error Codes

**Authentication Errors:**

- `UNAUTHORIZED` - Missing or invalid token
- `TOKEN_EXPIRED` - JWT token has expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

**Validation Errors:**

- `VALIDATION_ERROR` - Request validation failed
- `INVALID_UUID` - Malformed UUID parameter
- `INVALID_DATE` - Invalid date format
- `INVALID_PARAMETER` - Invalid query parameter

**Resource Errors:**

- `NOT_FOUND` - Resource doesn't exist
- `ALREADY_EXISTS` - Resource already exists

**Rate Limiting:**

- `RATE_LIMIT_EXCEEDED` - Too many requests

### Example Error Response

**400 Bad Request:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to access this resource",
    "statusCode": 403
  }
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Login attempt not found",
    "statusCode": 404
  }
}
```

## Rate Limiting

All audit endpoints are rate-limited:

**Limits:**

- List/Stats endpoints: 60 requests per minute
- Export endpoints: 10 requests per hour
- Cleanup endpoints: 5 requests per hour

**Rate Limit Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1730548800
```

## Security Considerations

### Authentication

- All endpoints require valid JWT token
- Tokens must be included in `Authorization` header
- Tokens expire after 24 hours (configurable)

### Permissions

| Endpoint      | Required Permission          |
| ------------- | ---------------------------- |
| List/Get      | `audit:read`                 |
| Delete Single | `audit:delete`               |
| Cleanup       | `audit:cleanup` (admin only) |
| Export        | `audit:export`               |

### Data Privacy

- **Passwords**: Never logged or returned in API responses
- **Sensitive Data**: PII fields may be redacted based on user permissions
- **IP Addresses**: Stored for security analysis only
- **Retention**: Audit logs subject to data retention policies

---

**Related Documentation:**

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Integration examples
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
