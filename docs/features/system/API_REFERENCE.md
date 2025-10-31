# System Module - API Reference

> **Complete API documentation for all System module endpoints**

**Version:** 1.0.0
**Base URL:** `http://localhost:3333`
**Last Updated:** 2025-10-31

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [GET /api/health](#get-apihealth)
  - [GET /api/status](#get-apistatus)
  - [GET /api/info](#get-apiinfo)
  - [GET /api/ping](#get-apiping)
  - [GET /](#get-)
  - [GET /api/protected-data](#get-apiprotected-data)
  - [GET /api/hybrid-protected](#get-apihybrid-protected)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Examples](#examples)

---

## Overview

The System module provides infrastructure endpoints for health monitoring, API information, and connectivity testing. All production endpoints are **public** (no authentication required) and designed for use by load balancers, monitoring systems, and API clients.

### Endpoint Categories

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| **Health** | `/api/health`, `/api/status` | System monitoring |
| **Information** | `/api/info`, `/api/ping`, `/` | API information |
| **Demo** | `/api/protected-data`, `/api/hybrid-protected` | Authentication examples |

---

## Authentication

### Public Endpoints (No Authentication)

The following endpoints are **public** and do not require authentication:

- `GET /api/health`
- `GET /api/status`
- `GET /api/info`
- `GET /api/ping`
- `GET /`

### Protected Endpoints (Demo Only)

Demo endpoints require authentication:

- `GET /api/protected-data` - Requires API key (`X-Api-Key` header)
- `GET /api/hybrid-protected` - Accepts JWT token OR API key

---

## Endpoints

### GET /api/health

Simple health check endpoint designed for load balancers and monitoring systems.

**Purpose:** Quick check if API is responsive (OK/ERROR only)

#### Request

```bash
curl http://localhost:3333/api/health
```

**Headers:** None required

**Query Parameters:** None

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "version": "1.0.0"
  },
  "message": "API is healthy"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok" \| "error"` | Health status |
| `timestamp` | `string` | ISO 8601 timestamp |
| `version` | `string` | API version |

#### Performance

- **Target:** <50ms
- **Typical:** 5-10ms

#### Use Cases

- Load balancer health checks
- Kubernetes liveness probes
- Uptime monitoring services
- Simple connectivity tests

---

### GET /api/status

Detailed system status including database, Redis, and memory metrics.

**Purpose:** Comprehensive system health information for debugging and monitoring

#### Request

```bash
curl http://localhost:3333/api/status
```

**Headers:** None required

**Query Parameters:** None

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "services": {
      "database": {
        "status": "connected",
        "responseTime": 15
      },
      "redis": {
        "status": "connected",
        "responseTime": 5
      }
    },
    "memory": {
      "used": 52428800,
      "total": 134217728,
      "free": 81788928,
      "percentage": 39
    }
  },
  "message": "System status retrieved successfully"
}
```

#### Health Status Determination

| Status | Conditions |
|--------|------------|
| **🟢 Healthy** | Database connected, memory <90%, Redis OK (if configured) |
| **🟡 Degraded** | High memory (>90%), Redis down, OR slow database (>1000ms) |
| **🔴 Unhealthy** | Database disconnected or error |

#### Performance

- **Target:** <200ms
- **Typical:** 50-100ms

---

### GET /api/info

API information including version, environment, and uptime.

#### Request

```bash
curl http://localhost:3333/api/info
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "name": "AegisX Platform API",
    "version": "1.0.0",
    "description": "Enterprise monorepo API for AegisX Platform",
    "environment": "production",
    "uptime": 86400,
    "timestamp": "2025-10-31T12:00:00.000Z"
  },
  "message": "API information retrieved successfully"
}
```

---

### GET /api/ping

Ultra-fast ping/pong endpoint for connectivity testing.

#### Request

```bash
curl http://localhost:3333/api/ping
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "pong",
    "timestamp": "2025-10-31T12:00:00.000Z"
  },
  "message": "Ping successful"
}
```

---

### GET /

Welcome message with ASCII logo and endpoint directory.

#### Request

```bash
curl http://localhost:3333/
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Welcome to AegisX Platform API",
    "description": "Enterprise-Ready Full Stack Application",
    "version": "1.1.1",
    "environment": "production",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "endpoints": {
      "api": "/api",
      "health": "/api/health",
      "info": "/api/info",
      "status": "/api/status",
      "documentation": "/documentation"
    },
    "logo": [
      "     █████╗ ███████╗ ██████╗ ██╗███████╗██╗  ██╗",
      "    ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚██╗██╔╝",
      "..."
    ]
  }
}
```

---

### GET /api/protected-data

**⚠️ Demo Endpoint** - Example of API key authentication

#### Request

```bash
curl http://localhost:3333/api/protected-data \
  -H "X-Api-Key: your-api-key-here"
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "This data is protected by API key authentication!",
    "timestamp": "2025-10-31T12:00:00.000Z",
    "authenticatedWith": "API Key",
    "keyInfo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My API Key",
      "prefix": "ak_test",
      "userId": "650e8400-e29b-41d4-a716-446655440001"
    }
  }
}
```

---

### GET /api/hybrid-protected

**⚠️ Demo Endpoint** - Example of hybrid authentication (JWT or API key)

#### Request (JWT)

```bash
curl http://localhost:3333/api/hybrid-protected \
  -H "Authorization: Bearer your-jwt-token-here"
```

#### Request (API Key)

```bash
curl http://localhost:3333/api/hybrid-protected \
  -H "X-Api-Key: your-api-key-here"
```

---

## Response Format

### Success Response

```typescript
{
  success: true,
  data: T,              // Endpoint-specific data
  message: string       // Human-readable message
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,       // Machine-readable error code
    message: string     // Human-readable error message
  }
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| `400` | `BAD_REQUEST` | Invalid request parameters |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `500` | `INTERNAL_SERVER_ERROR` | Server error |

---

## Examples

### cURL

```bash
# Health check
curl http://localhost:3333/api/health

# System status with jq formatting
curl -s http://localhost:3333/api/status | jq .

# Monitor memory usage
watch -n 5 'curl -s http://localhost:3333/api/status | jq .data.memory'
```

### JavaScript

```javascript
const response = await fetch('http://localhost:3333/api/status');
const data = await response.json();

if (data.success) {
  console.log('Status:', data.data.status);
  console.log('Memory:', data.data.memory.percentage + '%');
}
```

### Python

```python
import requests

response = requests.get('http://localhost:3333/api/status')
data = response.json()

if data['success']:
    print(f"Status: {data['data']['status']}")
    print(f"Memory: {data['data']['memory']['percentage']}%")
```

---

**Last Updated:** 2025-10-31
**API Version:** 1.0.0
