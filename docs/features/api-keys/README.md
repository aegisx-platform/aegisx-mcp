# API Keys Management System

> **Enterprise-grade API Key authentication system with permission-based access control, caching, and comprehensive security features.**

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Authentication Methods](#authentication-methods)
- [System Architecture](#system-architecture)
- [Documentation](#documentation)
- [Security Considerations](#security-considerations)

## Overview

The API Keys Management System provides a secure, scalable solution for managing programmatic access to your APIs. Built on enterprise-grade security practices, it offers:

- **Permission-Based Access Control** - Fine-grained control over what each API key can access
- **Multiple Authentication Methods** - Flexible integration options (custom header, bearer token, query parameter)
- **Caching Strategy** - High-performance validation with cache-first hybrid approach
- **Audit Trail** - Complete tracking of key usage and access patterns
- **Security First** - Bcrypt hashing, expiration management, and revocation support

## Key Features

### 🔐 Secure Key Generation

- **Prefixed Keys**: `ak_<hash>_<random>` format for easy identification
- **Bcrypt Hashing**: Keys hashed with bcrypt before storage
- **One-Time Display**: Full key shown only once after generation
- **Optional Expiration**: Set expiration dates for temporary access

### 🎯 Permission Scoping

```typescript
// Generate key with specific permissions
{
  "name": "Product API Key",
  "scopes": [
    {
      "resource": "products",
      "actions": ["read", "create", "update"]
    }
  ]
}
```

### ⚡ High-Performance Validation

**Cache-First Hybrid Strategy**:

1. Check cache for metadata (is_active, expires_at)
2. Validate hash against database
3. Track usage (last_used_at, last_used_ip)

**Benefits**:

- Fast metadata checks from cache
- Secure hash validation from database
- Background usage tracking doesn't block requests

### 🔄 Lifecycle Management

- **Generate** - Create new API keys with permissions
- **Rotate** - Replace compromised keys without changing configuration
- **Revoke** - Immediately disable access
- **List** - View all your API keys (masked for security)
- **Delete** - Permanently remove keys

## Quick Start

### 1. Generate an API Key (Web UI)

1. Navigate to **Settings → API Keys**
2. Click **"Generate New Key"**
3. Enter key details:
   - Name: "Production Server"
   - Description: "Main API access"
   - Expiry: 365 days (optional)
4. **⚠️ COPY THE KEY NOW** - You won't see it again!

### 2. Use the API Key

**Method 1: Custom Header (Recommended)**

```bash
curl -X GET http://api.example.com/users \
  -H "x-api-key: ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e"
```

**Method 2: Bearer Token**

```bash
curl -X GET http://api.example.com/users \
  -H "Authorization: Bearer ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e"
```

**Method 3: Query Parameter** (must be enabled on route)

```bash
curl -X GET "http://api.example.com/users?api_key=ak_8a9590a2_87e400a2..."
```

### 3. Test Your Key

```javascript
// Node.js example
const http = require('http');

const options = {
  hostname: 'api.example.com',
  path: '/api/users?limit=10',
  method: 'GET',
  headers: {
    'x-api-key': 'your-api-key-here',
    'Content-Type': 'application/json',
  },
};

http
  .request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Data:', JSON.parse(body));
    });
  })
  .end();
```

## Authentication Methods

### 1. Custom Header (x-api-key)

**Best for**: Server-to-server communication, scheduled jobs

```http
GET /api/users HTTP/1.1
Host: api.example.com
x-api-key: ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
Content-Type: application/json
```

**Advantages**:

- Clear intent (dedicated header for API keys)
- Doesn't conflict with OAuth/JWT headers
- Easy to filter in logs

### 2. Bearer Token

**Best for**: Tools that expect OAuth-style authentication

```http
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
Content-Type: application/json
```

**Advantages**:

- Standard authorization header
- Compatible with OAuth-aware tools
- Works with most HTTP clients out-of-the-box

### 3. Query Parameter

**Best for**: Webhooks, temporary URLs, integrations with limited header support

```http
GET /api/users?api_key=ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e HTTP/1.1
Host: api.example.com
```

**⚠️ Security Warnings**:

- Keys may appear in server logs
- Keys visible in browser history
- Must be explicitly enabled on routes
- Use only when headers not possible

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API REQUEST WITH KEY                      │
│  Headers: x-api-key: ak_8a9590a2_87e400a2b35cd...          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API KEY AUTHENTICATION FLOW                     │
│                                                              │
│  1. Extract Key ──→ from header/bearer/query                │
│  2. Parse Prefix ──→ ak_8a9590a2_...                       │
│  3. Check Cache ──→ Redis: { is_active, expires_at }       │
│     │                                                        │
│     ├─ Cache Hit ──→ Quick metadata validation              │
│     └─ Cache Miss ──→ Query database                        │
│                                                              │
│  4. Validate Hash ──→ Database: bcrypt.compare()            │
│  5. Check Permissions ──→ Verify resource:action scope      │
│  6. Track Usage ──→ Background job: last_used_at, IP        │
│                                                              │
│  ✅ Success ──→ Continue to route handler                   │
│  ❌ Failure ──→ Return 401 Unauthorized / 403 Forbidden     │
└─────────────────────────────────────────────────────────────┘
```

### Cache Strategy

**Hybrid Approach for Security & Performance**:

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Check Redis Cache  │
│  (metadata only)    │
└──────┬──────────────┘
       │
       ├─ Cache Hit
       │  ├─ Get: is_active, expires_at
       │  ├─ Quick validation
       │  └─ Still query DB for hash! (security)
       │
       └─ Cache Miss
          ├─ Query database for all fields
          ├─ Validate hash with bcrypt
          └─ Cache result for next time

Benefits:
✅ Fast metadata checks (Redis)
✅ Secure hash validation (PostgreSQL)
✅ No sensitive data in cache
```

## Documentation

### For Users

- **[User Guide](./USER_GUIDE.md)** - Complete guide for generating and using API keys
- **[API Reference](./API_REFERENCE.md)** - REST API endpoint documentation

### For Developers

- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Integration guide for adding API key auth to routes
- **[Architecture](./ARCHITECTURE.md)** - System design and technical decisions
- **[Security Guide](./SECURITY.md)** - Security best practices and considerations

## Security Considerations

### ⚠️ Critical Security Practices

1. **Never Commit Keys to Git**

   ```bash
   # ❌ WRONG
   const API_KEY = "ak_8a9590a2_87e400a2...";

   # ✅ CORRECT
   const API_KEY = process.env.API_KEY;
   ```

2. **Store Keys in Environment Variables**

   ```bash
   # .env (add to .gitignore!)
   API_KEY=ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
   ```

3. **Rotate Keys Regularly**
   - Rotate production keys every 90 days
   - Immediately rotate if key may be compromised
   - Use `/api/api-keys/:id/rotate` endpoint

4. **Use Minimal Permissions**
   - Grant only required permissions
   - Create separate keys for different services
   - Example: read-only key for dashboards, write key for backend

5. **Set Expiration Dates**
   - Use expiring keys for temporary integrations
   - Maximum recommended: 1 year
   - Review and rotate before expiration

6. **Monitor Usage**
   - Check `last_used_at` for suspicious activity
   - Review `last_used_ip` for unexpected locations
   - Audit API key list regularly

### 🔒 System Security Features

- **Bcrypt Hashing** - Keys hashed with bcrypt (cost factor 10)
- **Prefix Identification** - Easy identification without revealing key
- **One-Time Display** - Full key shown only once after generation
- **Automatic Expiration** - Keys automatically disabled after expiry
- **Revocation** - Immediate key disabling with reason tracking
- **Usage Tracking** - Complete audit trail of access patterns

## Next Steps

1. **[Read the User Guide](./USER_GUIDE.md)** - Learn how to generate and manage keys
2. **[Review API Reference](./API_REFERENCE.md)** - Understand available endpoints
3. **[Developer Integration](./DEVELOPER_GUIDE.md)** - Add API key auth to your routes
4. **[Security Best Practices](./SECURITY.md)** - Secure your implementation

---

**Version**: 1.0.0
**Last Updated**: 2025-10-30
**Feature Status**: ✅ Production Ready
