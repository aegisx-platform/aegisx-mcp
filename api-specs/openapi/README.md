# AegisX Platform OpenAPI Specifications

This directory contains comprehensive OpenAPI 3.0 specifications for all APIs required by the AegisX UI library and platform.

## 📋 API Specifications Overview

| API                     | File                       | Description                               | Endpoints                 |
| ----------------------- | -------------------------- | ----------------------------------------- | ------------------------- |
| **Complete API**        | `aegisx-complete-api.yaml` | Combined specification with all endpoints | All endpoints in one file |
| **Navigation API**      | `navigation-api.yaml`      | Navigation structure and menu management  | 2 endpoints               |
| **User Profile API**    | `user-profile-api.yaml`    | User profile, avatar, and preferences     | 4 endpoints               |
| **Settings API**        | `settings-api.yaml`        | Application settings and themes           | 6 endpoints               |
| **Auth Extensions API** | `auth-extensions-api.yaml` | Logout, refresh, and session management   | 6 endpoints               |

## 🚀 Quick Start

### 1. Using with Fastify

```javascript
import { swaggerConfig, swaggerUiConfig } from './openapi/swagger-config.js';

// Register swagger plugin
await fastify.register(import('@fastify/swagger'), swaggerConfig);

// Register swagger UI
await fastify.register(import('@fastify/swagger-ui'), swaggerUiConfig);
```

### 2. Accessing Documentation

Once integrated with your API server:

- **Interactive Documentation**: `http://localhost:3000/documentation`
- **OpenAPI JSON**: `http://localhost:3000/documentation/json`
- **OpenAPI YAML**: `http://localhost:3000/documentation/yaml`

### 3. Code Generation

Generate client SDKs using OpenAPI Generator:

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i openapi/aegisx-complete-api.yaml \
  -g typescript-axios \
  -o libs/api-client

# Generate Angular services
npx @openapitools/openapi-generator-cli generate \
  -i openapi/aegisx-complete-api.yaml \
  -g typescript-angular \
  -o libs/angular-api-client
```

## 🔐 Authentication

All APIs use JWT Bearer token authentication:

```typescript
// Example usage in TypeScript
const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
};

const response = await axios.get('/api/users/profile', config);
```

## 📊 API Endpoints Summary

### Authentication (`/api/auth`)

- `POST /auth/logout` - Logout user (current device or all devices)
- `POST /auth/refresh` - Refresh access token using refresh token
- `GET /auth/me` - Get current authenticated user information
- `GET /auth/sessions` - Get all user sessions
- `DELETE /auth/sessions/{sessionId}` - Revoke specific session
- `POST /auth/verify-token` - Verify if access token is valid

### Navigation (`/api/navigation`)

- `GET /navigation` - Get complete navigation structure
- `GET /navigation/user` - Get user-specific navigation (filtered by permissions)

### User Profile (`/api/users`)

- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `POST /users/avatar` - Upload user avatar image
- `DELETE /users/avatar` - Delete user avatar
- `GET /users/preferences` - Get user preferences
- `PUT /users/preferences` - Update user preferences

### Settings (`/api/settings`)

- `GET /settings` - Get all user settings
- `PUT /settings` - Update multiple settings
- `GET /settings/theme` - Get theme settings
- `PUT /settings/theme` - Update theme settings
- `GET /settings/layout` - Get layout settings
- `PUT /settings/layout` - Update layout settings
- `GET /settings/notifications` - Get notification settings
- `PUT /settings/notifications` - Update notification settings
- `POST /settings/reset` - Reset settings to defaults

## 🎨 Response Format

All APIs follow a consistent response format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0",
    "requestId": "req_123456789"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    },
    "field": "fieldName" // For validation errors
  }
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "code": "REQUIRED"
      },
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ]
  }
}
```

## 🏷️ Common Error Codes

| Code                     | HTTP Status | Description                          |
| ------------------------ | ----------- | ------------------------------------ |
| `BAD_REQUEST`            | 400         | Invalid request format or parameters |
| `UNAUTHORIZED`           | 401         | Authentication required              |
| `FORBIDDEN`              | 403         | Insufficient permissions             |
| `NOT_FOUND`              | 404         | Resource not found                   |
| `VALIDATION_ERROR`       | 422         | Input validation failed              |
| `FILE_TOO_LARGE`         | 413         | File size exceeds limit              |
| `UNSUPPORTED_MEDIA_TYPE` | 415         | Media type not supported             |
| `RATE_LIMIT_EXCEEDED`    | 429         | Too many requests                    |
| `INTERNAL_SERVER_ERROR`  | 500         | Unexpected server error              |

## 🔄 Rate Limiting

API requests are rate limited with the following headers included in responses:

- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

**Limits:**

- **Authenticated users**: 1000 requests/hour
- **Unauthenticated users**: 100 requests/hour
- **File uploads**: 10 uploads/minute

## 📝 Data Models

### Key Schemas

#### NavigationItem

Navigation menu items with hierarchical structure supporting different layouts (default, compact, horizontal, mobile).

#### UserProfile

Complete user profile including personal information, role, permissions, and preferences.

#### ThemeSettings

Theme configuration including color schemes, dark mode settings, and custom colors.

#### UserSettings

Comprehensive user settings covering theme, layout, localization, notifications, privacy, and accessibility preferences.

## 🔧 Implementation Notes

### File Upload Handling

Avatar uploads support:

- **Formats**: JPEG, PNG, WebP
- **Max size**: 5MB
- **Automatic thumbnails**: Small (64x64), Medium (128x128), Large (256x256)

### Navigation Permissions

Navigation items are filtered based on user permissions. Items without required permissions are automatically hidden.

### Theme System

The theme system supports:

- **Predefined themes**: default, dark, light, minimal, enterprise
- **Custom colors**: Primary, accent, warning colors
- **Auto theme**: System preference detection
- **Real-time switching**: Immediate UI updates

### Caching Strategy

- **Navigation**: Cached for 5 minutes
- **User profile**: Cached for 1 minute
- **Settings**: Cached for 10 minutes
- **Theme resources**: Cached for 1 hour

## 🧪 Testing

### Using the Interactive Documentation

1. Navigate to `/documentation` in your browser
2. Click "Authorize" and enter your JWT token
3. Expand any endpoint and click "Try it out"
4. Fill in required parameters and click "Execute"

### Example Test Requests

```bash
# Get user navigation
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/navigation/user

# Update theme settings
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheme":"dark","darkMode":true}' \
  http://localhost:3000/api/settings/theme

# Upload avatar
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg" \
  http://localhost:3000/api/users/avatar
```

## 🔗 Integration Examples

### React/TypeScript Client

```typescript
import axios from 'axios';

class AegisXApiClient {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  async getNavigation(type: 'default' | 'compact' | 'horizontal' | 'mobile' = 'default') {
    const response = await axios.get(`${this.baseURL}/navigation`, {
      params: { type },
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateTheme(settings: ThemeSettings) {
    const response = await axios.put(`${this.baseURL}/settings/theme`, settings, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${this.baseURL}/users/avatar`, formData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}
```

### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AegisXApiService {
  private baseURL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  getUserNavigation(type: string = 'default'): Observable<any> {
    return this.http.get(`${this.baseURL}/navigation/user`, {
      params: { type },
      headers: this.getHeaders(),
    });
  }

  updateUserProfile(profile: any): Observable<any> {
    return this.http.put(`${this.baseURL}/users/profile`, profile, {
      headers: this.getHeaders(),
    });
  }

  getThemeSettings(): Observable<any> {
    return this.http.get(`${this.baseURL}/settings/theme`, {
      headers: this.getHeaders(),
    });
  }
}
```

## 📚 Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Fastify Swagger Plugin](https://github.com/fastify/fastify-swagger)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

---

**Created for AegisX Platform** • [Documentation](https://docs.aegisx.com) • [GitHub](https://github.com/aegisx-platform)
