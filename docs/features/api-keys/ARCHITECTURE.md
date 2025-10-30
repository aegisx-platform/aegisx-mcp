# API Keys System Architecture

> **Technical architecture, design decisions, and implementation details of the API Keys Management System.**

## System Overview

The API Keys system provides secure, scalable programmatic access to APIs through a permission-based authentication mechanism with hybrid caching strategy.

### Core Components

```
┌──────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                          │
│  (Server, Mobile App, Script)                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP Request
                          │ Header: x-api-key: ak_xxx...
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FASTIFY API GATEWAY                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  MIDDLEWARE LAYER                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │ Extract Key  │→│ Validate Key │→│ Check Permission │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │   CACHE     │ │  DATABASE   │ │  BUSINESS   │
   │  (Redis)    │ │(PostgreSQL) │ │   LOGIC     │
   │             │ │             │ │             │
   │ • Metadata  │ │ • Keys      │ │ • Routes    │
   │ • Fast      │ │ • Hashes    │ │ • Services  │
   │   checks    │ │ • Usage     │ │ • Handlers  │
   └─────────────┘ └─────────────┘ └─────────────┘
```

## Database Schema

### api_keys Table

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Key identification
  name VARCHAR(100) NOT NULL,
  description TEXT,
  key_hash VARCHAR(255) NOT NULL,      -- bcrypt hash
  key_prefix VARCHAR(20) NOT NULL,     -- ak_8a9590a2

  -- Permissions
  scopes JSONB,                        -- [{resource, actions, conditions}]

  -- Usage tracking
  last_used_at TIMESTAMP,
  last_used_ip VARCHAR(45),

  -- Lifecycle
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP,
  revocation_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_key_prefix (key_prefix),           -- Fast lookups
  INDEX idx_user_id (user_id),                 -- User's keys
  INDEX idx_is_active (is_active),             -- Active keys only
  INDEX idx_expires_at (expires_at)            -- Expiry checks
);
```

### Scopes Structure

```typescript
// TypeScript interface
interface ApiKeyScope {
  resource: string;           // e.g., "users", "products"
  actions: string[];          // e.g., ["read"], ["read", "write"]
  conditions?: {              // Optional conditions
    [key: string]: any;
  };
}

// Example in database
{
  "scopes": [
    {
      "resource": "products",
      "actions": ["read", "create", "update"]
    },
    {
      "resource": "orders",
      "actions": ["read"],
      "conditions": {
        "status": ["pending", "processing"]
      }
    }
  ]
}
```

## Component Architecture

### 1. Repository Layer

**Responsibilities**:

- Database operations (CRUD)
- Query building
- Data mapping

```typescript
class ApiKeysRepository extends BaseRepository {
  async findByPrefix(prefix: string): Promise<ApiKeys | null> {
    return this.knex('api_keys').where({ key_prefix: prefix, is_active: true }).whereRaw('(expires_at IS NULL OR expires_at > NOW())').first();
  }

  async updateUsage(id: string, ip: string): Promise<void> {
    await this.knex('api_keys').where({ id }).update({
      last_used_at: this.knex.fn.now(),
      last_used_ip: ip,
    });
  }
}
```

### 2. Service Layer

**Responsibilities**:

- Business logic
- Key generation/validation
- Cache management
- Event emission

```typescript
class ApiKeysService {
  async validateKey(apiKey: string): Promise<ValidationResult> {
    // 1. Parse and validate format
    const { prefix } = parseApiKey(apiKey);

    // 2. Check cache first
    const cached = await this.cache.get(`api_key:${prefix}`);
    if (cached) {
      return this.validateWithCache(apiKey, cached);
    }

    // 3. Query database
    const keyData = await this.repository.findByPrefix(prefix);
    if (!keyData) {
      return { isValid: false, error: 'Key not found' };
    }

    // 4. Validate hash
    const isValid = await bcrypt.compare(apiKey, keyData.key_hash);
    if (!isValid) {
      return { isValid: false, error: 'Invalid key' };
    }

    // 5. Cache result
    await this.cache.set(
      `api_key:${prefix}`,
      {
        is_active: keyData.is_active,
        expires_at: keyData.expires_at,
        scopes: keyData.scopes,
      },
      300,
    ); // 5 minutes

    // 6. Track usage (background)
    this.trackUsage(keyData.id, request.ip).catch(console.error);

    return { isValid: true, keyData };
  }

  async generateKey(data: GenerateApiKeyRequest): Promise<GeneratedKey> {
    // 1. Generate random key
    const fullKey = generateApiKey(); // ak_<hash>_<random>
    const prefix = extractPrefix(fullKey);

    // 2. Hash key
    const hash = await bcrypt.hash(fullKey, 10);

    // 3. Calculate expiry
    const expires_at = data.expiryDays ? addDays(new Date(), data.expiryDays) : null;

    // 4. Store in database
    const apiKey = await this.repository.create({
      user_id: request.user.id,
      name: data.name,
      description: data.description,
      key_hash: hash,
      key_prefix: prefix,
      scopes: data.scopes,
      expires_at,
      is_active: true,
    });

    // 5. Return full key (ONLY TIME!)
    return {
      id: apiKey.id,
      name: apiKey.name,
      fullKey, // ⚠️ Show once!
      prefix,
      preview: maskKey(fullKey), // ak_xxx...xxx
      expires_at,
      created_at: apiKey.created_at,
    };
  }
}
```

### 3. Middleware Layer

**Responsibilities**:

- Request interception
- Authentication
- Permission checking
- Error handling

```typescript
export function createApiKeyAuth(service: ApiKeysService, options: ApiKeyAuthOptions = {}) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // 1. Extract API key
    const apiKey = extractApiKey(request, options);
    if (!apiKey) {
      return reply.unauthorized('API key required');
    }

    // 2. Validate key
    const validation = await service.validateKey(apiKey);
    if (!validation.isValid) {
      return reply.unauthorized(validation.error);
    }

    // 3. Check permissions (if specified)
    if (options.resource && options.action) {
      const hasPermission = await service.checkScope(validation.keyData, options.resource, options.action);

      if (!hasPermission) {
        return reply.forbidden('Permission denied');
      }
    }

    // 4. Attach to request
    request.apiKey = validation.keyData;
    request.apiKeyAuth = {
      authenticated: true,
      keyData: validation.keyData,
    };

    // Continue to handler
  };
}
```

## Cache Strategy Design

### Hybrid Caching Rationale

**Why not full caching?**

```typescript
// ❌ INSECURE: Caching full key data including hash
{
  "api_key:ak_xxx": {
    "key_hash": "$2b$10$...",  // ❌ Security risk!
    "is_active": true,
    "expires_at": "..."
  }
}
// Problem: If Redis is compromised, hashes exposed
```

**Why not zero caching?**

```typescript
// ❌ SLOW: Every request queries database + bcrypt
async validateKey(key: string) {
  const data = await db.query(...);  // ~5ms
  await bcrypt.compare(key, hash);   // ~50ms
}
// Problem: 55ms per request, doesn't scale
```

**✅ Solution: Hybrid Approach**

```typescript
// ✅ SECURE + FAST: Cache metadata only
{
  "api_key:ak_xxx": {
    // Cached (fast checks)
    "is_active": true,
    "expires_at": "2026-01-15T00:00:00Z",
    "scopes": [...]

    // NOT cached (secure)
    // key_hash: ... (always from database!)
  }
}
```

### Cache Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST WITH API KEY                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Check Redis   │
                 └───────┬───────┘
                         │
            ┌────────────┴──────────────┐
            │                           │
        Cache Hit                   Cache Miss
            │                           │
            ▼                           ▼
   ┌─────────────────┐         ┌──────────────────┐
   │ Quick Checks    │         │ Full Validation  │
   │ - is_active?    │         │ - Query DB       │
   │ - expired?      │         │ - Check hash     │
   └────────┬────────┘         │ - Verify status  │
            │                  └────────┬──────────┘
            │                           │
            └────────────┬──────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │ Database Hash Check    │
            │ (ALWAYS, even cache hit)│
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Update Cache (if miss)│
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Track Usage (async)   │
            └────────────────────────┘

Performance:
• Cache Hit: ~6ms (1ms cache + 5ms DB hash check)
• Cache Miss: ~56ms (5ms DB + 50ms bcrypt + 1ms cache write)
• Hit Ratio: ~99% (most validations are cache hits)
```

## Key Generation Algorithm

### Secure Random Key Generation

```typescript
function generateApiKey(): string {
  // 1. Generate hash component (8 hex chars)
  const hash = crypto.randomBytes(4).toString('hex');

  // 2. Generate random component (64 hex chars)
  const random = crypto.randomBytes(32).toString('hex');

  // 3. Combine with prefix
  return `ak_${hash}_${random}`;
}

// Example output:
// ak_8a9590a2_87e400a2b35cd9ffccb6d76caf6432dfcf623b6fa6157b6d99f39940c12f5e1e
// │   │         │
// │   │         └─ 64 hex chars (32 bytes) - secret
// │   └─────────── 8 hex chars (4 bytes) - identifier
// └───────────────prefix (ak = API Key)
```

### Why This Format?

**Prefix (`ak_`):**

- Easy identification in logs
- Clear intent (API Key, not JWT)
- Filterable in monitoring tools

**Hash Component (`8a9590a2`):**

- Database index key (fast lookups)
- Visible in UI (for identification)
- Not secret (just for indexing)

**Random Component (64 chars):**

- High entropy (32 bytes = 256 bits)
- Cryptographically secure
- Virtually impossible to guess
- This is the secret part

## Permission System

### Scope-Based Permissions

```typescript
interface ApiKeyScope {
  resource: string; // What (e.g., "users", "products")
  actions: string[]; // How (e.g., ["read", "write"])
  conditions?: object; // When (optional filters)
}
```

### Permission Checking Algorithm

```typescript
async function checkScope(keyData: ApiKeys, resource: string, action: string): Promise<boolean> {
  if (!keyData.scopes || keyData.scopes.length === 0) {
    return false; // No permissions
  }

  for (const scope of keyData.scopes) {
    // Match resource
    if (scope.resource !== resource && scope.resource !== '*') {
      continue;
    }

    // Match action
    if (scope.actions.includes(action) || scope.actions.includes('*')) {
      // Check conditions (if any)
      if (scope.conditions) {
        return evaluateConditions(scope.conditions, context);
      }
      return true;
    }
  }

  return false; // No matching scope
}
```

### Examples

**Example 1: Read-Only Products**

```json
{
  "scopes": [
    {
      "resource": "products",
      "actions": ["read"]
    }
  ]
}
```

**Example 2: Full Access to Orders**

```json
{
  "scopes": [
    {
      "resource": "orders",
      "actions": ["*"]
    }
  ]
}
```

**Example 3: Conditional Access**

```json
{
  "scopes": [
    {
      "resource": "orders",
      "actions": ["read", "update"],
      "conditions": {
        "status": ["pending", "processing"],
        "amount_lt": 10000
      }
    }
  ]
}
```

## Security Design

### Defense in Depth

**Layer 1: Key Format Validation**

- Regex check: `/^ak_[a-f0-9]{8}_[a-f0-9]{64}$/`
- Length validation: Exactly 76 characters
- Prefix validation: Must start with `ak_`

**Layer 2: Database Lookup**

- Indexed by prefix (fast)
- Check `is_active = true`
- Check `expires_at > NOW() OR NULL`

**Layer 3: Hash Verification**

- Bcrypt comparison (slow, intentional)
- Cost factor 10 (~50ms per check)
- Prevents brute force attacks

**Layer 4: Permission Checking**

- Scope-based authorization
- Resource and action matching
- Optional condition evaluation

**Layer 5: Usage Tracking**

- Last used timestamp
- Last used IP address
- Audit trail for security reviews

### Threat Mitigation

| Threat                    | Mitigation                               |
| ------------------------- | ---------------------------------------- |
| **Key Theft**             | One-time display, bcrypt hashing         |
| **Brute Force**           | 256-bit entropy, bcrypt cost factor      |
| **Replay Attack**         | IP tracking, expiration dates            |
| **Permission Escalation** | Scope-based permissions, explicit checks |
| **Cache Poisoning**       | Hash never cached, always verified       |
| **SQL Injection**         | Parameterized queries (Knex)             |
| **XSS**                   | Keys not displayed in UI (preview only)  |
| **CSRF**                  | API keys stateless, no session cookies   |

## Performance Characteristics

### Latency Analysis

**Cold Start (Cache Miss):**

```
Component              Latency    Cumulative
──────────────────────────────────────────────
Format validation      ~0.1ms     0.1ms
Cache lookup (miss)    ~1ms       1.1ms
Database query         ~5ms       6.1ms
Bcrypt comparison      ~50ms      56.1ms
Cache write            ~1ms       57.1ms
Usage tracking (async) ~5ms       (non-blocking)
──────────────────────────────────────────────
Total: ~57ms
```

**Warm Path (Cache Hit):**

```
Component              Latency    Cumulative
──────────────────────────────────────────────
Format validation      ~0.1ms     0.1ms
Cache lookup (hit)     ~1ms       1.1ms
Quick status checks    ~0.1ms     1.2ms
Database hash query    ~5ms       6.2ms
Bcrypt comparison      ~50ms      56.2ms
Usage tracking (async) ~5ms       (non-blocking)
──────────────────────────────────────────────
Total: ~56ms

Note: Cache hit saves database query for metadata (~5ms)
but hash verification still requires DB (~5ms + 50ms bcrypt)
```

### Throughput

**Single Instance:**

- ~18 validations/second (with bcrypt)
- ~1000 validations/second (cached, parallel)

**Scaling:**

- Horizontal scaling: N instances = N \* throughput
- Redis caching: Near-linear scaling
- Database pooling: 10-20 connections typical

## Design Decisions

### 1. Why Bcrypt Instead of SHA-256?

**❌ SHA-256 Problems:**

- Too fast (~1ms) - vulnerable to brute force
- No salt by default
- GPU-accelerated attacks possible

**✅ Bcrypt Benefits:**

- Intentionally slow (~50ms) - prevents brute force
- Built-in salt
- Configurable cost factor
- Industry standard for password/key hashing

### 2. Why Not Cache Hash?

**Security > Performance**

- If Redis compromised, hashes exposed
- Bcrypt still protects, but layer defense broken
- Hybrid approach: fast for 99%, secure for all

### 3. Why Separate Prefix from Key?

**Operational Benefits:**

- Fast database lookups (indexed)
- Visible in UI without exposing secret
- Filterable in logs
- Easy key identification

### 4. Why Optional Query Parameter Auth?

**Flexibility vs Security:**

- Disabled by default (security)
- Enable only when necessary (webhooks, limited header support)
- Explicit opt-in per route
- Clear warnings in documentation

## Future Enhancements

### Planned Features

1. **Rate Limiting**
   - Per-key request limits
   - Time-window based (100 req/min)
   - Redis-backed counters

2. **IP Whitelisting**
   - Allow-list of IP addresses per key
   - CIDR range support
   - Geographic restrictions

3. **Webhook Signatures**
   - HMAC signing for webhooks
   - Request verification
   - Prevent replay attacks

4. **Key Rotation Policies**
   - Automatic rotation schedules
   - Grace period for old keys
   - Notification before expiry

5. **Analytics Dashboard**
   - Usage statistics per key
   - Top endpoints
   - Error rate tracking

---

**Related Documentation**:

- [README](./README.md) - Overview and quick start
- [Developer Guide](./DEVELOPER_GUIDE.md) - Integration guide
- [Security Guide](./SECURITY.md) - Security best practices

**Last Updated**: 2025-10-30
