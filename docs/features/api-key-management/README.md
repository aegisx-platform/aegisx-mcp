# API Key Management System

> **🔑 Enterprise-Grade API Key Management for AegisX Platform**

The API Key Management system provides secure, scalable API key authentication for the AegisX platform, complementing the existing JWT authentication system with programmatic access capabilities.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [API Reference](#api-reference)
5. [Security Features](#security-features)
6. [Integration Examples](#integration-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The API Key Management system enables:

- **Secure API Access**: Generate secure API keys for programmatic access
- **Scope-Based Permissions**: Fine-grained access control with resource/action scopes
- **Hybrid Authentication**: Support both JWT tokens and API keys
- **Key Lifecycle Management**: Generate, rotate, revoke, and monitor API keys
- **Enterprise Security**: bcrypt hashing, audit logging, and usage tracking

## ✨ Features

### 🔐 Core Security Features

- **Secure Key Generation**: Cryptographically secure random keys with bcrypt hashing
- **Format Validation**: Structured key format `ak_{prefix}_{secret}` with regex validation
- **Scope-Based Authorization**: Resource/action permission system
- **Usage Tracking**: IP address and timestamp logging for all API key usage
- **Key Lifecycle Management**: Full CRUD operations with audit trails

### 🛡️ Authentication Methods

- **API Key Only**: Dedicated API key authentication
- **Hybrid Authentication**: JWT OR API key authentication
- **Multi-Source Detection**: Headers, query parameters, and bearer tokens
- **Rate Limiting Ready**: Framework for per-key rate limiting

### 📊 Management Features

- **Key Generation**: Create keys with custom names and scopes
- **Key Rotation**: Generate new keys while deactivating old ones
- **Key Revocation**: Permanently disable compromised keys
- **Usage Monitoring**: Track key usage patterns and statistics
- **Preview Display**: Masked key display for security

## 🚀 Quick Start

### 1. Generate Your First API Key

```bash
# Using curl (requires JWT authentication)
curl -X POST http://localhost:3333/api/apiKeys/generate \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First API Key",
    "scopes": [
      {
        "resource": "users",
        "actions": ["read"]
      }
    ],
    "expiryDays": 365
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My First API Key",
    "key": "ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...",
    "prefix": "ak_a1b2c3d4",
    "preview": "***...d479",
    "scopes": [
      {
        "resource": "users",
        "actions": ["read"]
      }
    ],
    "expires_at": "2024-09-26T10:00:00Z",
    "is_active": true,
    "created_at": "2023-09-26T10:00:00Z"
  },
  "message": "API key generated successfully. Store it securely - it will not be shown again!",
  "warning": "This API key will only be displayed once. Make sure to copy and store it securely."
}
```

### 2. Use Your API Key

```bash
# Method 1: Using x-api-key header (recommended)
curl -X GET http://localhost:3333/api/protected-data \
  -H "x-api-key: ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479..."

# Method 2: Using Authorization header
curl -X GET http://localhost:3333/api/protected-data \
  -H "Authorization: Bearer ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479..."
```

### 3. Validate API Key (Optional)

```bash
curl -X POST http://localhost:3333/api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{
    "key": "ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479...",
    "resource": "users",
    "action": "read"
  }'
```

## 📚 API Reference

### Authentication Endpoints

#### `POST /api/apiKeys/generate`

Generate a new API key with optional scopes and expiry.

**Authentication Required**: JWT Token

**Request Body:**

```typescript
{
  name: string;                    // Human-readable name (1-100 chars)
  scopes?: ApiKeyScope[];          // Optional permission scopes
  expiryDays?: number;            // Days until expiry (1-3650, default: 365)
  isActive?: boolean;             // Active status (default: true)
}

interface ApiKeyScope {
  resource: string;               // Resource type (e.g., 'users', 'files')
  actions: string[];             // Allowed actions (e.g., ['read'], ['*'])
  conditions?: Record<string, any>; // Optional conditions
}
```

**Responses:**

- `201` - API key generated successfully
- `400` - Validation error
- `401` - Authentication required
- `403` - Forbidden (rate limit exceeded)
- `500` - Server error

#### `POST /api/apiKeys/validate`

Validate an API key and optionally check permissions.

**Authentication Required**: None

**Request Body:**

```typescript
{
  key: string;                    // API key to validate
  resource?: string;              // Resource to check access for
  action?: string;               // Action to check permission for
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "keyData": {
      "id": "uuid",
      "name": "Key Name",
      "prefix": "ak_prefix",
      "user_id": "user_uuid",
      "scopes": [...],
      "expires_at": "2024-09-26T10:00:00Z",
      "is_active": true
    },
    "hasAccess": true,
    "error": null
  }
}
```

#### `GET /api/apiKeys/my-keys`

Get current user's API keys with previews.

**Authentication Required**: JWT Token

**Query Parameters:**

```typescript
{
  page?: number;                  // Page number (default: 1)
  limit?: number;                 // Items per page (1-100, default: 20)
  sortBy?: string;               // Sort field
  sortOrder?: 'asc' | 'desc';    // Sort direction (default: 'desc')
  isActive?: boolean;            // Filter by active status
  search?: string;               // Search in key names
  includeExpired?: boolean;      // Include expired keys (default: false)
}
```

### Management Endpoints

#### `POST /api/apiKeys/:id/revoke`

Revoke (deactivate) an API key.

**Authentication Required**: JWT Token

**Request Body:**

```typescript
{
  keyId: string;                  // UUID of key to revoke
  reason?: string;               // Optional reason (max 255 chars)
}
```

#### `POST /api/apiKeys/:id/rotate`

Generate a new API key with the same settings and deactivate the old one.

**Authentication Required**: JWT Token

**Request Body:**

```typescript
{
  keyId: string;                  // UUID of key to rotate
  newName?: string;              // Optional new name for rotated key
}
```

**Response:** Same as generate endpoint with new key details.

### Demo Endpoints

#### `GET /api/protected-data`

Example endpoint protected by API key authentication.

**Authentication Required**: API Key with `system:read` scope

**Headers:**

```
x-api-key: ak_prefix_secret...
```

#### `GET /api/hybrid-protected`

Example endpoint that accepts both JWT and API key authentication.

**Authentication Required**: JWT Token OR API Key with `system:read` scope

**Headers:**

```
# Option 1: JWT
Authorization: Bearer <jwt_token>

# Option 2: API Key
x-api-key: ak_prefix_secret...
```

## 🔐 Security Features

### Key Generation Security

- **Cryptographic Randomness**: Uses Node.js `crypto.randomBytes()` for secure generation
- **bcrypt Hashing**: Keys are hashed with bcrypt using 12 salt rounds before storage
- **Format Structure**: Consistent `ak_{8hex}_{64hex}` format with regex validation
- **Secure Comparison**: Timing-attack-resistant key validation

### Scope-Based Authorization

```typescript
// Example scope configurations
const scopes = [
  {
    resource: 'users',
    actions: ['read', 'write'], // Specific actions
  },
  {
    resource: 'files',
    actions: ['*'], // All actions
  },
  {
    resource: '*',
    actions: ['read'], // All resources, read-only
  },
];
```

### Usage Tracking & Audit Logging

- **Request Tracking**: All API key usage logged with IP addresses and timestamps
- **Audit Hashing**: Cryptographic audit hashes for all key operations
- **Real-time Events**: WebSocket events for key lifecycle changes
- **Security Logging**: Failed authentication attempts and security violations

### Key Lifecycle Security

- **Expiration Management**: Automatic expiry validation and enforcement
- **Key Rotation**: Secure key replacement without downtime
- **Revocation**: Immediate key deactivation with audit trail
- **Usage Limits**: Configurable per-user key limits (default: 50)

## 🔧 Integration Examples

### Express/Node.js Client

```javascript
const axios = require('axios');

class AegisXApiClient {
  constructor(apiKey, baseUrl = 'http://localhost:3333/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async makeRequest(endpoint, options = {}) {
    return axios({
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  async getUsers() {
    const response = await this.makeRequest('/users');
    return response.data;
  }
}

// Usage
const client = new AegisXApiClient('ak_a1b2c3d4_f47ac...');
const users = await client.getUsers();
```

### Python Client

```python
import requests

class AegisXApiClient:
    def __init__(self, api_key, base_url='http://localhost:3333/api'):
        self.api_key = api_key
        self.base_url = base_url

    def _headers(self):
        return {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }

    def make_request(self, endpoint, method='GET', data=None):
        response = requests.request(
            method=method,
            url=f"{self.base_url}{endpoint}",
            headers=self._headers(),
            json=data
        )
        response.raise_for_status()
        return response.json()

    def get_users(self):
        return self.make_request('/users')

# Usage
client = AegisXApiClient('ak_a1b2c3d4_f47ac...')
users = client.get_users()
```

### Frontend Integration (JavaScript)

```javascript
class AegisXApiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = '/api';
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async validateKey() {
    return this.request('/apiKeys/validate', {
      method: 'POST',
      body: JSON.stringify({
        key: this.apiKey,
        resource: 'users',
        action: 'read',
      }),
    });
  }
}

// Usage
const api = new AegisXApiService('ak_a1b2c3d4_f47ac...');

// Validate key before using
try {
  const validation = await api.validateKey();
  if (validation.data.valid && validation.data.hasAccess) {
    console.log('API key is valid and has required permissions');
  }
} catch (error) {
  console.error('API key validation failed:', error);
}
```

## 💡 Best Practices

### Security Best Practices

1. **Secure Storage**: Never store API keys in plain text or client-side code
2. **Environment Variables**: Use environment variables for API keys in applications
3. **HTTPS Only**: Always use HTTPS in production to protect keys in transit
4. **Scope Limitation**: Use minimal required scopes (principle of least privilege)
5. **Regular Rotation**: Rotate API keys periodically (recommended: every 90 days)
6. **Monitor Usage**: Regularly review API key usage patterns and logs

### Development Best Practices

```bash
# Development environment setup
export AEGISX_API_KEY="ak_dev_key_here"
export AEGISX_API_URL="http://localhost:3333/api"

# Production environment (never hardcode!)
export AEGISX_API_KEY="${PRODUCTION_API_KEY}"
export AEGISX_API_URL="https://api.yourdomain.com"
```

### Error Handling

```javascript
async function makeApiRequest(endpoint, apiKey) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Invalid or expired API key');
    } else if (response.status === 403) {
      throw new Error('Insufficient permissions for this operation');
    } else if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error.message);
    throw error;
  }
}
```

### Scope Design Patterns

```typescript
// ✅ Good: Specific and minimal scopes
const goodScopes = [
  { resource: 'users', actions: ['read'] },
  { resource: 'user-profile', actions: ['read', 'write'] },
];

// ❌ Avoid: Overly broad permissions
const avoidScopes = [
  { resource: '*', actions: ['*'] }, // Too permissive
];

// ✅ Good: Conditional access
const conditionalScopes = [
  {
    resource: 'users',
    actions: ['read'],
    conditions: { department: 'engineering' },
  },
];
```

## 🐛 Troubleshooting

### Common Issues

#### "Invalid API key format" Error

**Problem**: API key doesn't match expected format.
**Solution**: Ensure key follows `ak_{8hex}_{64hex}` format.

```bash
# Valid format example
ak_a1b2c3d4_f47ac10b58cc4372a5670e02b2c3d479abc123def456789012345678901234567890

# Invalid formats
api_key_123           # Wrong prefix
ak_short_key          # Too short
ak_a1b2c3d4_invalid!  # Contains invalid characters
```

#### "API key has expired" Error

**Problem**: API key has passed its expiration date.
**Solution**: Generate a new API key or rotate the existing one.

```bash
# Check key details
curl -X POST /api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{"key":"your_key_here"}'

# Rotate expired key
curl -X POST /api/apiKeys/{id}/rotate \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"keyId":"your_key_id"}'
```

#### "Insufficient permissions" Error

**Problem**: API key lacks required scope for the operation.
**Solution**: Check required scopes and update key permissions.

```bash
# Check what scopes your key has
curl -X GET /api/apiKeys/my-keys \
  -H "Authorization: Bearer <jwt_token>"

# Generate new key with required scopes
curl -X POST /api/apiKeys/generate \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Updated Key",
    "scopes":[
      {"resource":"users","actions":["read","write"]},
      {"resource":"files","actions":["read"]}
    ]
  }'
```

#### "API key is disabled" Error

**Problem**: API key has been revoked or deactivated.
**Solution**: Generate a new API key.

```bash
# Check key status
curl -X GET /api/apiKeys/my-keys \
  -H "Authorization: Bearer <jwt_token>"

# Generate replacement key
curl -X POST /api/apiKeys/generate \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Replacement Key"}'
```

### Debug Mode

Enable debug logging for API key operations:

```bash
# Set debug environment variable
export DEBUG=aegisx:apikeys

# Or enable in application
process.env.DEBUG = 'aegisx:apikeys';
```

Debug output will show:

- Key validation attempts
- Scope checking results
- Usage tracking events
- Authentication flow details

### Health Check

Check API key system health:

```bash
# System health
curl -X GET /api/health

# API key specific validation
curl -X POST /api/apiKeys/validate \
  -H "Content-Type: application/json" \
  -d '{"key":"test_key"}' # Should return validation error for test
```

---

## 📞 Support

For technical support or questions:

1. **Documentation**: Review this guide and related documentation
2. **GitHub Issues**: Report bugs or request features
3. **Development Team**: Contact the AegisX development team
4. **Security Issues**: Report security vulnerabilities privately

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Initial API key management system
- ✅ Secure key generation with bcrypt hashing
- ✅ Scope-based authorization
- ✅ Hybrid JWT + API key authentication
- ✅ Key lifecycle management (generate, rotate, revoke)
- ✅ Usage tracking and audit logging
- ✅ Production-ready security features

---

**📚 Related Documentation:**

- [User Guide](./USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Architecture](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
