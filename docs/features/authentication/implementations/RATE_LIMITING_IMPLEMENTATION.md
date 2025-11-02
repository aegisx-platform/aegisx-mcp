# Rate Limiting Implementation - Technical Documentation

> **Complete implementation guide for intelligent rate limiting in authentication system**

## 📋 Overview

AegisX implements a **two-layer rate limiting strategy** to protect against abuse while maintaining excellent user experience:

1. **Global Rate Limiting** - Fastify Rate Limit plugin with Redis storage (distributed)
2. **Endpoint-Specific Rate Limiting** - Per-endpoint configuration for different security levels
3. **Account Lockout** - Brute force protection for login attempts (see Login Implementation)

**Key Features:**

- Distributed rate limiting via Redis (multi-instance support)
- Intelligent per-endpoint limits (security vs UX balance)
- Custom error responses with retry-after information
- IP-based tracking (customizable per endpoint)
- Production-ready configuration (100 req/min global, stricter per-endpoint)
- Automatic retry-after headers (X-RateLimit-\*)

**Rate Limiting Philosophy:**

- **Generous limits** for endpoints where users fix validation errors (register, reset password)
- **Strict limits** for security-critical endpoints (login, password reset request)
- **Balanced approach** to prevent abuse while allowing legitimate use

---

## 🏗️ Architecture & Flow

### Rate Limiting Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Client Request                                                   │
│ ↓                                                                │
│ POST /api/auth/login                                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 1. Global Rate Limiter Check (Fastify Plugin)                   │
│    - Max: 100 requests per minute (production)                  │
│    - Max: 1000 requests per minute (development)                │
│    - Key: IP address (default)                                  │
│    - Storage: Redis (distributed across instances)              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├─── PASSED ────────────┐
               │                       │
               └─── EXCEEDED ──────────┼──→ Return 429 + Headers
                                       │    X-RateLimit-Limit: 100
                                       │    X-RateLimit-Remaining: 0
                                       │    X-RateLimit-Reset: <timestamp>
                                       │    Retry-After: <seconds>
                                       │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. Endpoint-Specific Rate Limiter Check (Route Config)          │
│    - Login: 15 attempts / 5 min per IP+email                    │
│    - Register: 100 attempts / 5 min per IP                      │
│    - Password Reset Request: 3 attempts / 1 hour per IP         │
│    - Reset Password: 10 attempts / 5 min per IP                 │
│    - Refresh Token: 10 attempts / 1 min per IP                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├─── PASSED ────────────┐
               │                       │
               └─── EXCEEDED ──────────┼──→ Custom Error Response
                                       │    { code: 'TOO_MANY_ATTEMPTS',
                                       │      message: 'Too many login attempts...',
                                       │      statusCode: 429 }
                                       │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. Route Handler Executes                                        │
│    - Process authentication logic                                │
│    - Return success/error response                               │
└─────────────────────────────────────────────────────────────────┘
```

### Redis Storage Architecture

```
Redis Key Structure:
───────────────────────────────────────────────────────────────────

Global Rate Limit:
  Key: fastify-rate-limit:<ip-address>
  Value: { count: 45, ttl: 60000 }
  TTL: 1 minute (60 seconds)

Endpoint-Specific Rate Limit (Login):
  Key: fastify-rate-limit:<ip>:<email>
  Value: { count: 5, ttl: 300000 }
  TTL: 5 minutes (300 seconds)

Endpoint-Specific Rate Limit (Register):
  Key: fastify-rate-limit:<ip>
  Value: { count: 10, ttl: 300000 }
  TTL: 5 minutes (300 seconds)

Endpoint-Specific Rate Limit (Password Reset Request):
  Key: fastify-rate-limit:<ip>
  Value: { count: 2, ttl: 3600000 }
  TTL: 1 hour (3600 seconds)
```

**Why Redis?**

- ✅ **Distributed**: Works across multiple API instances
- ✅ **Fast**: In-memory storage (< 1ms lookup)
- ✅ **Automatic Expiration**: TTL support built-in
- ✅ **Atomic Operations**: Race condition safe
- ✅ **Persistence**: Optional (can survive restarts)

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/
├── bootstrap/
│   └── plugin.loader.ts                       # Global rate limiter registration
│       └─ Lines 114-121: Rate limit plugin configuration
│          - Import: @fastify/rate-limit
│          - Options: securityConfig.rateLimit
│          - Global: true (applies to all routes by default)
│
├── config/
│   └── security.config.ts                     # Rate limit configuration
│       └─ Lines 103-114: Global rate limit settings
│          - Production: 100 requests/minute
│          - Development: 1000 requests/minute
│          - Error response builder
│          - Retry-after calculation
│
└── core/auth/
    └── auth.routes.ts                         # Per-endpoint rate limiting
        ├─ Lines 18-34: Register route (100/5min)
        ├─ Lines 68-89: Login route (15/5min, IP+email key)
        ├─ Lines 119-123: Refresh route (10/1min)
        ├─ Lines 278-282: Password reset request (3/1hour)
        └─ Lines 326-340: Reset password (10/5min)
```

**Dependency Chain:**

```
main.ts
  → bootstrap()
    → loadAllPlugins()
      → createPluginGroups()
        → infrastructure group
          → fastify-rate-limit plugin
            → securityConfig.rateLimit options
              → Redis storage (from redis.plugin.ts)
```

---

## 🔍 Implementation Details

### 1. Global Rate Limiter - Plugin Configuration

**File:** `apps/api/src/bootstrap/plugin.loader.ts`

**Lines 114-121:**

```typescript
{
  name: 'rate-limit',
  plugin: fastifyRateLimit,
  options: {
    ...securityConfig.rateLimit,
    global: true, // Apply to all routes by default
  },
  required: true,
}
```

**What it does:**

- Registers `@fastify/rate-limit` plugin globally
- Applies default rate limit to **all routes**
- Uses configuration from `securityConfig.rateLimit`
- Can be overridden per-route with custom `config.rateLimit`

**Global Configuration:**

**File:** `apps/api/src/config/security.config.ts`

**Lines 103-114:**

```typescript
rateLimit: {
  max: isProduction ? 100 : 1000, // 100 req/min (prod), 1000 req/min (dev)
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: Math.round(context.ttl / 1000), // seconds until reset
    },
  }),
}
```

**Configuration Breakdown:**

| Setting                | Production | Development | Description                               |
| ---------------------- | ---------- | ----------- | ----------------------------------------- |
| `max`                  | 100        | 1000        | Maximum requests per window               |
| `timeWindow`           | 1 minute   | 1 minute    | Time window for rate limit                |
| `errorResponseBuilder` | Custom     | Custom      | Custom error response (consistent format) |
| `retryAfter`           | Dynamic    | Dynamic     | Seconds until rate limit resets           |

**Why 100 requests/minute in production?**

- Generous for normal user behavior
- Prevents DoS attacks
- Allows burst requests (page load, multiple API calls)
- Can be adjusted per deployment

**Why 1000 requests/minute in development?**

- Allows rapid testing
- Frontend hot-reload generates many requests
- Prevents false positives during debugging

---

### 2. Endpoint-Specific Rate Limiting

#### 2.1 Login Endpoint - Strict with Smart Key

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 68-89:**

```typescript
config: {
  rateLimit: {
    // Balanced rate limiting for better UX while preventing brute force
    max: 15, // 15 login attempts
    timeWindow: '5 minutes', // per 5 minutes
    keyGenerator: (req) => {
      // Rate limit by IP + email combination to prevent brute force on specific users
      const email =
        (req.body as any)?.email ||
        (req.body as any)?.username ||
        'unknown';
      return `${req.ip}:${email}`;
    },
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message:
          'Too many login attempts. Please try again in a few minutes.',
        statusCode: 429,
      },
    }),
  },
}
```

**Why IP + Email Combination?**

Traditional approach (IP only):

```typescript
// ❌ BAD: Attacker can brute force multiple accounts from same IP
keyGenerator: (req) => req.ip;
// Result: All login attempts share same rate limit
// Problem: After 15 attempts on account A, can't login to account B
```

**AegisX approach (IP + Email):**

```typescript
// ✅ GOOD: Each IP+email combination gets separate rate limit
keyGenerator: (req) => `${req.ip}:${email}`;
// Result: 15 attempts per account from same IP
// Benefit: Prevents targeted brute force on specific users
```

**Example Scenario:**

```
IP: 192.168.1.100

Attempt 1-15: Login to admin@aegisx.local → Rate limited after 15
Attempt 16-30: Login to user@example.com → Still allowed!

Why? Different rate limit keys:
  - 192.168.1.100:admin@aegisx.local (15 attempts)
  - 192.168.1.100:user@example.com (0 attempts, fresh limit)
```

**Security Trade-off:**

- ✅ **Pro:** Prevents targeted brute force on single account
- ✅ **Pro:** Legitimate users can still access different accounts
- ❌ **Con:** Attacker can try 15 passwords across multiple accounts
- ✅ **Mitigation:** Account lockout service handles this (5 failed attempts → account locked)

**Rate Limit Configuration:**

| Setting        | Value                     | Reasoning                                |
| -------------- | ------------------------- | ---------------------------------------- |
| `max`          | 15 attempts               | Allows typos, strict enough for security |
| `timeWindow`   | 5 minutes                 | Short enough to prevent brute force      |
| `keyGenerator` | IP + email                | Per-account rate limiting                |
| Error code     | `TOO_MANY_LOGIN_ATTEMPTS` | Specific for login endpoint              |

---

#### 2.2 Register Endpoint - Generous for UX

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 18-34:**

```typescript
config: {
  rateLimit: {
    // Generous rate limiting to allow fixing validation errors
    // While still preventing spam and enumeration attacks
    max: 100, // 100 total registration attempts
    timeWindow: '5 minutes', // per 5 minutes per IP
    keyGenerator: (req) => req.ip || 'unknown',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'TOO_MANY_ATTEMPTS',
        message:
          'Too many registration attempts. Please try again in a few minutes.',
        statusCode: 429,
      },
    }),
  },
}
```

**Why 100 attempts?**

Registration has many validation points:

- Email format validation
- Username pattern validation (alphanumeric + underscore/hyphen)
- Password minimum length
- Password confirmation match
- First name and last name required

**User Experience Scenario:**

```
Attempt 1: Email: "notanemail" → Validation error
Attempt 2: Email: "user@example" → Validation error (invalid domain)
Attempt 3: Email: "user@example.com" → OK
           Username: "user name" → Validation error (space)
Attempt 4: Username: "user-name" → OK
           Password: "test123" → Validation error (too short)
Attempt 5: Password: "testpass123" → OK
           Confirm: "testpass456" → Validation error (mismatch)
Attempt 6: All fields valid → Success!
```

With only 15 attempts (like login), user would hit limit while fixing errors.

**Rate Limit Configuration:**

| Setting        | Value               | Reasoning                           |
| -------------- | ------------------- | ----------------------------------- |
| `max`          | 100 attempts        | Allows multiple validation retries  |
| `timeWindow`   | 5 minutes           | Prevents automated spam             |
| `keyGenerator` | IP only             | Simple, sufficient for registration |
| Error code     | `TOO_MANY_ATTEMPTS` | Generic error for rate limit        |

**Still Secure:**

- 100 attempts in 5 minutes = 20 per minute
- Prevents automated account creation
- Prevents email enumeration attacks
- Balances security and user experience

---

#### 2.3 Password Reset Request - Very Strict

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 278-282:**

```typescript
config: {
  rateLimit: {
    max: 3, // 3 reset requests
    timeWindow: '1 hour', // per hour per IP
    keyGenerator: (req) => req.ip || 'unknown',
  },
}
```

**Why only 3 attempts?**

Password reset is security-critical:

- Sends email with reset token
- Prevents email spam
- Prevents enumeration attacks (checking if email exists)
- Prevents DoS on email service

**Attack Scenario Prevented:**

```
Attacker tries to:
1. Enumerate emails (test if accounts exist)
2. Spam user's inbox with reset emails
3. DoS email service with thousands of requests

With 3 attempts/hour:
- Can only test 3 emails per hour
- Can only spam 3 reset emails per hour
- Email service protected from abuse
```

**Legitimate User Scenario:**

```
User forgets password:
Attempt 1: Email: "user@example" → Error (invalid)
Attempt 2: Email: "user@example.com" → Success
           Checks inbox → Email received

No need for more attempts.
```

**Rate Limit Configuration:**

| Setting        | Value      | Reasoning                                  |
| -------------- | ---------- | ------------------------------------------ |
| `max`          | 3 attempts | Strict to prevent abuse                    |
| `timeWindow`   | 1 hour     | Long window for security                   |
| `keyGenerator` | IP only    | Prevent mass password reset from single IP |

---

#### 2.4 Reset Password - Generous for Validation

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 326-340:**

```typescript
config: {
  rateLimit: {
    // Generous limit to allow password validation retries
    max: 10, // 10 reset attempts
    timeWindow: '5 minutes', // per 5 minutes per IP
    keyGenerator: (req) => req.ip || 'unknown',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'TOO_MANY_RESET_ATTEMPTS',
        message:
          'Too many password reset attempts. Please try again in a few minutes.',
        statusCode: 429,
      },
    }),
  },
}
```

**Why 10 attempts?**

Password reset has validation:

- Token validation (token exists, not expired, not used)
- Password strength validation (minimum 8 characters)
- Password confirmation match

**User Experience Scenario:**

```
User has valid reset token:
Attempt 1: Password: "test" → Validation error (too short)
Attempt 2: Password: "testpass" → OK, Confirm: "testpas" → Mismatch
Attempt 3: Password: "testpass123" → OK, Confirm: "testpass123" → Success!

Only 3 attempts needed.
```

10 attempts is generous but still prevents abuse.

**Rate Limit Configuration:**

| Setting        | Value                     | Reasoning                          |
| -------------- | ------------------------- | ---------------------------------- |
| `max`          | 10 attempts               | Allows password validation retries |
| `timeWindow`   | 5 minutes                 | Prevents token brute force         |
| `keyGenerator` | IP only                   | Simple, sufficient for reset       |
| Error code     | `TOO_MANY_RESET_ATTEMPTS` | Specific for reset password        |

---

#### 2.5 Refresh Token - Moderate

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 119-123:**

```typescript
config: {
  rateLimit: {
    max: 10, // 10 refresh attempts
    timeWindow: '1 minute', // per minute per IP
    keyGenerator: (req) => req.ip || 'unknown',
  },
}
```

**Why 10 attempts per minute?**

Refresh token is called:

- When access token expires (every 15 minutes)
- When user navigates between pages (may trigger multiple times)
- When multiple tabs are open

**Normal Usage:**

- 1 refresh per 15 minutes
- 10 attempts per minute is very generous
- Prevents automated token refresh spam

**Rate Limit Configuration:**

| Setting        | Value       | Reasoning                    |
| -------------- | ----------- | ---------------------------- |
| `max`          | 10 attempts | Generous for normal usage    |
| `timeWindow`   | 1 minute    | Short window, resets quickly |
| `keyGenerator` | IP only     | Simple, sufficient           |

---

### 3. Complete Rate Limit Configuration Table

| Endpoint                              | Max Attempts  | Time Window | Key Generation | Error Code                | Reasoning                         |
| ------------------------------------- | ------------- | ----------- | -------------- | ------------------------- | --------------------------------- |
| **Global (All Routes)**               | 100 (prod)    | 1 minute    | IP address     | `RATE_LIMIT_EXCEEDED`     | General DoS protection            |
|                                       | 1000 (dev)    | 1 minute    | IP address     |                           |                                   |
| **POST /auth/login**                  | 15            | 5 minutes   | IP + email     | `TOO_MANY_LOGIN_ATTEMPTS` | Prevent account brute force       |
| **POST /auth/register**               | 100           | 5 minutes   | IP address     | `TOO_MANY_ATTEMPTS`       | Allow validation error retries    |
| **POST /auth/refresh**                | 10            | 1 minute    | IP address     | (Default error)           | Prevent token refresh spam        |
| **POST /auth/request-password-reset** | 3             | 1 hour      | IP address     | (Default error)           | Prevent email spam/enumeration    |
| **POST /auth/reset-password**         | 10            | 5 minutes   | IP address     | `TOO_MANY_RESET_ATTEMPTS` | Allow password validation retries |
| **POST /auth/verify-email**           | (Global only) | -           | IP address     | `RATE_LIMIT_EXCEEDED`     | Global limit sufficient           |
| **POST /auth/resend-verification**    | (Global only) | -           | IP address     | `RATE_LIMIT_EXCEEDED`     | Global limit sufficient           |
| **POST /auth/logout**                 | (None)        | -           | -              | -                         | No rate limit (safe operation)    |
| **GET /auth/me**                      | (Global only) | -           | IP address     | `RATE_LIMIT_EXCEEDED`     | Global limit sufficient           |
| **GET /auth/permissions**             | (Global only) | -           | IP address     | `RATE_LIMIT_EXCEEDED`     | Global limit sufficient           |

**Legend:**

- **(Global only)**: No endpoint-specific rate limit, uses global 100/min
- **(None)**: No rate limiting applied
- **IP + email**: Rate limit key is combination of IP address and email from request body

---

## 🔧 Redis Storage Details

### Redis Key Structure

**Global Rate Limit Key:**

```
Key: rl:192.168.1.100
Value: { total: 45, ttl: 42000 }
Expiry: 60 seconds
```

**Login Rate Limit Key:**

```
Key: rl:192.168.1.100:admin@aegisx.local
Value: { total: 5, ttl: 180000 }
Expiry: 300 seconds
```

**Register Rate Limit Key:**

```
Key: rl:192.168.1.100
Value: { total: 10, ttl: 120000 }
Expiry: 300 seconds
```

**Password Reset Request Key:**

```
Key: rl:192.168.1.100
Value: { total: 2, ttl: 2400000 }
Expiry: 3600 seconds
```

### Redis Commands for Debugging

```bash
# Connect to Redis
redis-cli

# Check global rate limit for IP
GET "rl:192.168.1.100"

# Check login rate limit for IP+email
GET "rl:192.168.1.100:admin@aegisx.local"

# List all rate limit keys
KEYS "rl:*"

# Check TTL (time to live) for key
TTL "rl:192.168.1.100"

# Get all rate limit keys with values
SCAN 0 MATCH "rl:*" COUNT 100

# Delete specific rate limit (development only)
DEL "rl:192.168.1.100"
DEL "rl:192.168.1.100:admin@aegisx.local"

# Clear all rate limits (development only)
KEYS "rl:*" | xargs redis-cli DEL

# Monitor rate limit operations in real-time
MONITOR
# Then make requests and watch Redis commands
```

### Redis Storage Benefits

**Distributed Architecture:**

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  API Instance 1 │────→│     Redis       │←────│  API Instance 2 │
│  Port: 3333     │     │  Shared Storage │     │  Port: 3334     │
└─────────────────┘     └─────────────────┘     └─────────────────┘

All instances share same rate limit counters!
```

**Why This Matters:**

Without Redis (in-memory):

```
User makes 50 requests to Instance 1 → OK (under limit)
User makes 50 requests to Instance 2 → OK (under limit)
Total: 100 requests (should be rate limited!)
```

With Redis (distributed):

```
User makes 50 requests to Instance 1 → Redis: count = 50
User makes 50 requests to Instance 2 → Redis: count = 100
Instance 2 returns 429 (rate limit exceeded) ✅
```

---

## 🛠️ Troubleshooting Guide

### Problem 1: Rate Limit Reached Unexpectedly

**Symptoms:**

- Normal usage triggers rate limit
- Error: "Too many requests, please try again later"
- Status code: 429

**Check Current Limits:**

```bash
# Check global limit
cat apps/api/src/config/security.config.ts | grep -A 5 "rateLimit:"

# Check endpoint-specific limits
cat apps/api/src/core/auth/auth.routes.ts | grep -A 10 "rateLimit:"
```

**Check Redis Counter:**

```bash
# Connect to Redis
redis-cli

# Check your IP rate limit
GET "rl:<your-ip>"

# Example
GET "rl:192.168.1.100"
# Output: { total: 45, ttl: 30000 }
# Meaning: 45 requests made, resets in 30 seconds
```

**Solutions:**

1. **Wait for TTL to expire:**

   ```bash
   # Check when rate limit resets
   redis-cli TTL "rl:192.168.1.100"
   # Output: 30 (30 seconds until reset)
   ```

2. **Clear rate limit (development only):**

   ```bash
   redis-cli DEL "rl:192.168.1.100"
   ```

3. **Increase limit for development:**

   ```typescript
   // apps/api/src/config/security.config.ts
   rateLimit: {
     max: isProduction ? 100 : 10000, // Increase dev limit
     timeWindow: '1 minute',
   }
   ```

4. **Disable rate limit temporarily (development only):**
   ```typescript
   // apps/api/src/core/auth/auth.routes.ts
   config: {
     rateLimit: false, // Disable for this endpoint
   }
   ```

---

### Problem 2: Redis Connection Issues

**Symptoms:**

- Rate limiting not working
- All requests pass through
- Redis errors in logs

**Check Redis Connection:**

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis is running
redis-cli info server

# Check Redis logs
tail -f /var/log/redis/redis-server.log
```

**Check Redis Configuration:**

```bash
# Verify Redis environment variables
cat .env.local | grep REDIS

# Should have:
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Restart Redis:**

```bash
# macOS (Homebrew)
brew services restart redis

# Linux (systemd)
sudo systemctl restart redis

# Docker
docker restart redis
```

**Fallback to In-Memory:**

If Redis is unavailable, `@fastify/rate-limit` falls back to in-memory storage:

- ⚠️ **Warning:** Not distributed (each instance has separate counters)
- ⚠️ **Warning:** Lost on server restart
- ⚠️ **Warning:** Not suitable for production

---

### Problem 3: Rate Limit Not Resetting

**Symptoms:**

- Rate limit stays at max even after waiting
- TTL expired but still rate limited

**Check Redis Key:**

```bash
redis-cli

# Check if key exists
EXISTS "rl:192.168.1.100"
# 1 = exists, 0 = does not exist

# Check TTL
TTL "rl:192.168.1.100"
# Positive number = seconds until expiry
# -1 = no expiry set (BUG!)
# -2 = key does not exist

# If TTL is -1 (no expiry), manually delete:
DEL "rl:192.168.1.100"
```

**Check System Clock:**

```bash
# Redis TTL is based on system time
date

# If clock is wrong, rate limits won't reset correctly
```

**Reset All Rate Limits:**

```bash
# Development only!
redis-cli FLUSHDB
```

---

### Problem 4: Testing Rate Limits

**How to Test Rate Limiting:**

**Method 1: Manual Testing with cURL**

```bash
# Test global rate limit (100 requests/minute)
for i in {1..110}; do
  echo "Request $i:"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3333/api/auth/me \
    -H "Authorization: Bearer <your-token>"

  # Small delay
  sleep 0.1
done

# First 100 should return 200
# Requests 101-110 should return 429
```

**Method 2: Test Login Rate Limit (15 attempts/5min)**

```bash
# Test with wrong password
for i in {1..20}; do
  echo "Login attempt $i:"
  curl -s -X POST http://localhost:3333/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@aegisx.local",
      "password": "WrongPassword123"
    }' | jq '.error.code'

  sleep 0.5
done

# First 15 should return "INVALID_CREDENTIALS"
# Requests 16-20 should return "TOO_MANY_LOGIN_ATTEMPTS"
```

**Method 3: Test Password Reset Request (3 attempts/hour)**

```bash
# Should fail after 3 attempts
for i in {1..5}; do
  echo "Password reset request $i:"
  curl -s -X POST http://localhost:3333/api/auth/request-password-reset \
    -H "Content-Type: application/json" \
    -d '{ "email": "test@example.com" }' | jq '.error.code'

  sleep 1
done

# First 3 should return success or "user not found"
# Requests 4-5 should return rate limit error
```

**Method 4: Check Rate Limit Headers**

```bash
# Make request and check headers
curl -v http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer <your-token>"

# Look for headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 95
# X-RateLimit-Reset: 1699000000
# Retry-After: 45 (if rate limited)
```

**Method 5: Automated Testing Script**

```bash
#!/bin/bash
# test-rate-limits.sh

API_URL="http://localhost:3333"
ENDPOINT="/api/auth/login"
MAX_ATTEMPTS=20

echo "Testing rate limit for $ENDPOINT"
echo "Expected to fail after 15 attempts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in $(seq 1 $MAX_ATTEMPTS); do
  response=$(curl -s -X POST "$API_URL$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}')

  status=$(echo $response | jq -r '.error.code // "SUCCESS"')

  if [ "$status" == "TOO_MANY_LOGIN_ATTEMPTS" ]; then
    echo "✅ Attempt $i: Rate limit triggered (expected)"
  elif [ "$status" == "INVALID_CREDENTIALS" ]; then
    echo "⏳ Attempt $i: Request allowed"
  else
    echo "⚠️ Attempt $i: Unexpected status: $status"
  fi

  sleep 0.2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test completed"
```

---

### Problem 5: Different Rate Limits on Different Environments

**Symptoms:**

- Works in development but fails in production
- Different behavior on different API instances

**Check Environment Configuration:**

```bash
# Check which environment you're running
echo $NODE_ENV

# Check rate limit configuration
node -e "
const { loadSecurityConfig } = require('./apps/api/src/config/security.config');
console.log(JSON.stringify(loadSecurityConfig().rateLimit, null, 2));
"
```

**Environment-Specific Limits:**

```typescript
// apps/api/src/config/security.config.ts
rateLimit: {
  max: isProduction ? 100 : 1000, // Different limits!
  timeWindow: '1 minute',
}
```

**Solution:**

Set `NODE_ENV` explicitly:

```bash
# Development
export NODE_ENV=development
pnpm run dev:api

# Production
export NODE_ENV=production
pnpm run start:api
```

---

## 🔒 Security Considerations

### 1. IP-Based Tracking Limitations

**Current Implementation:**

```typescript
keyGenerator: (req) => req.ip;
```

**Issues:**

**Behind Proxy/Load Balancer:**

```
Client (real IP: 203.0.113.45)
  ↓
Load Balancer
  ↓
API Server sees: 10.0.0.1 (load balancer IP)

All users share same rate limit!
```

**Solution:**

```typescript
// Configure trust proxy in Fastify
fastify.register(fastifyRateLimit, {
  trustProxy: true, // Trust X-Forwarded-For header
  keyGenerator: (req) => {
    // Get real IP from proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
    return ip;
  },
});
```

**NAT/Corporate Networks:**

```
Office Network (100 users)
  ↓
NAT Gateway (single public IP: 203.0.113.45)
  ↓
API Server

All 100 users share same rate limit!
```

**Mitigation:**

- Use authenticated endpoints where possible
- Consider user-based rate limiting for authenticated routes
- Increase limits for known corporate IPs

---

### 2. Distributed Denial of Service (DDoS) Protection

**Rate Limiting is NOT Enough:**

Rate limiting protects against:

- ✅ Individual IP abuse
- ✅ Credential stuffing attacks
- ✅ Brute force attempts
- ✅ API abuse from single source

Rate limiting does NOT protect against:

- ❌ **Distributed** DoS (thousands of IPs)
- ❌ Layer 3/4 attacks (network/transport layer)
- ❌ Amplification attacks

**Recommended Additional Protections:**

1. **CDN/WAF (Cloudflare, AWS Shield):**
   - DDoS mitigation
   - Geographic filtering
   - Bot detection

2. **API Gateway (Kong, AWS API Gateway):**
   - Advanced rate limiting (user-based, plan-based)
   - Request quotas
   - Throttling

3. **Firewall Rules:**
   - Block known bad IPs
   - Geographic restrictions
   - Connection limits

4. **Monitoring & Alerting:**
   - Track rate limit violations
   - Alert on unusual patterns
   - Automatic IP blocking

---

### 3. Configuration Trade-offs

**Security vs User Experience:**

| Configuration         | Security Level | User Experience | Use Case               |
| --------------------- | -------------- | --------------- | ---------------------- |
| 5 attempts / 1 min    | Very High      | Poor            | Password reset request |
| 15 attempts / 5 min   | High           | Good            | Login                  |
| 100 attempts / 5 min  | Medium         | Excellent       | Registration           |
| 1000 attempts / 1 min | Low            | Excellent       | Development only       |

**Choosing the Right Limit:**

**Too Strict:**

- Users get frustrated
- Support tickets increase
- Legitimate use blocked

**Too Generous:**

- Attackers can brute force
- API abuse not prevented
- Server resources wasted

**AegisX Philosophy:**

- **Start generous** (allow user errors)
- **Monitor abuse** (track rate limit violations)
- **Adjust based on data** (real-world usage patterns)
- **Different limits per endpoint** (security-critical vs user-friendly)

---

### 4. Rate Limit Bypass Techniques (and Mitigations)

**Attack 1: Rotating IP Addresses**

```
Attacker uses:
- VPN with multiple exit nodes
- Residential proxy network
- Botnet (thousands of IPs)

Each IP gets fresh rate limit!
```

**Mitigation:**

- Implement CAPTCHA on repeated failures
- Fingerprint devices (browser fingerprinting)
- Monitor patterns (same password tried from multiple IPs)
- Account lockout (independent of rate limiting)

**Attack 2: Distributed Attack**

```
Attacker uses 1000 IPs:
- Each makes 10 requests
- Total: 10,000 requests
- None hit rate limit!
```

**Mitigation:**

- WAF/CDN with DDoS protection
- Global rate limiting (all IPs combined)
- Pattern detection (unusual traffic spikes)

**Attack 3: Timing Attacks**

```
Attacker makes requests just below limit:
- 99 requests/minute (stays under 100)
- Continues for hours
- Never rate limited but still abuses API
```

**Mitigation:**

- Long-term quotas (1000 requests/hour)
- Account-based limits (requires auth)
- Anomaly detection

---

## 📝 Testing Guide

### Unit Testing Rate Limits

**Test File:** `apps/api/src/core/auth/auth.routes.spec.ts`

```typescript
describe('Rate Limiting', () => {
  describe('POST /auth/login', () => {
    it('should allow 15 login attempts', async () => {
      for (let i = 0; i < 15; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        });

        expect(response.statusCode).toBe(401); // Invalid credentials
      }
    });

    it('should rate limit after 15 attempts', async () => {
      // Make 15 requests first
      for (let i = 0; i < 15; i++) {
        await app.inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        });
      }

      // 16th request should be rate limited
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(429);
      expect(response.json().error.code).toBe('TOO_MANY_LOGIN_ATTEMPTS');
    });

    it('should return rate limit headers', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('POST /auth/register', () => {
    it('should allow 100 registration attempts', async () => {
      for (let i = 0; i < 100; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: `user${i}@example.com`,
            username: `user${i}`,
            password: 'testpass123',
            firstName: 'Test',
            lastName: 'User',
          },
        });

        // Should succeed or fail validation, but not rate limited
        expect(response.statusCode).not.toBe(429);
      }
    });

    it('should rate limit after 100 attempts', async () => {
      // Make 100 requests first
      for (let i = 0; i < 100; i++) {
        await app.inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: `user${i}@example.com`,
            username: `user${i}`,
            password: 'testpass123',
            firstName: 'Test',
            lastName: 'User',
          },
        });
      }

      // 101st request should be rate limited
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'user101@example.com',
          username: 'user101',
          password: 'testpass123',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      expect(response.statusCode).toBe(429);
      expect(response.json().error.code).toBe('TOO_MANY_ATTEMPTS');
    });
  });

  describe('POST /auth/request-password-reset', () => {
    it('should allow 3 reset requests', async () => {
      for (let i = 0; i < 3; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/auth/request-password-reset',
          payload: {
            email: 'test@example.com',
          },
        });

        expect(response.statusCode).not.toBe(429);
      }
    });

    it('should rate limit after 3 attempts', async () => {
      // Make 3 requests first
      for (let i = 0; i < 3; i++) {
        await app.inject({
          method: 'POST',
          url: '/auth/request-password-reset',
          payload: {
            email: 'test@example.com',
          },
        });
      }

      // 4th request should be rate limited
      const response = await app.inject({
        method: 'POST',
        url: '/auth/request-password-reset',
        payload: {
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(429);
    });
  });
});
```

---

### Integration Testing with Redis

```typescript
describe('Rate Limiting with Redis', () => {
  let redis: Redis;

  beforeAll(async () => {
    // Connect to Redis
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  });

  afterAll(async () => {
    // Clean up
    await redis.flushdb();
    await redis.quit();
  });

  it('should store rate limit in Redis', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    // Check Redis
    const keys = await redis.keys('rl:*');
    expect(keys.length).toBeGreaterThan(0);
  });

  it('should share rate limit across multiple API instances', async () => {
    // This test requires multiple API instances
    // Simulate by making requests and checking Redis counter

    const ip = '192.168.1.100';
    const email = 'test@example.com';
    const key = `rl:${ip}:${email}`;

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email, password: 'wrong' },
        headers: { 'x-forwarded-for': ip },
      });
    }

    // Check Redis counter
    const data = await redis.get(key);
    const counter = JSON.parse(data || '{}');
    expect(counter.total).toBe(5);
  });

  it('should expire rate limit after time window', async () => {
    const key = 'rl:192.168.1.100:test@example.com';

    await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
      headers: { 'x-forwarded-for': '192.168.1.100' },
    });

    // Check TTL
    const ttl = await redis.ttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(300); // 5 minutes
  });
});
```

---

## 🌍 Environment Variables

### Required Environment Variables

| Variable     | Example      | Description                       | Default       |
| ------------ | ------------ | --------------------------------- | ------------- |
| `REDIS_HOST` | `localhost`  | Redis host for rate limit storage | `localhost`   |
| `REDIS_PORT` | `6379`       | Redis port                        | `6379`        |
| `NODE_ENV`   | `production` | Environment (affects rate limits) | `development` |

### Optional Configuration

| Variable         | Example     | Description                 | Default |
| ---------------- | ----------- | --------------------------- | ------- |
| `REDIS_PASSWORD` | `secret123` | Redis password (if enabled) | (none)  |
| `REDIS_DB`       | `0`         | Redis database number       | `0`     |

### Checking Current Configuration

```bash
# View rate limit configuration
cat apps/api/src/config/security.config.ts | grep -A 15 "rateLimit:"

# View environment
cat .env.local | grep -E "NODE_ENV|REDIS"

# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

---

## 💡 Best Practices

### 1. Always Use Redis in Production

**Why:**

- Distributed (works across multiple instances)
- Persistent (survives server restarts)
- Fast (in-memory)

**Setup:**

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Environment variables
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

### 2. Monitor Rate Limit Violations

**Setup Logging:**

```typescript
// apps/api/src/plugins/rate-limit-monitor.plugin.ts
import type { FastifyInstance } from 'fastify';

export default async function rateLimitMonitorPlugin(fastify: FastifyInstance) {
  fastify.addHook('onResponse', async (request, reply) => {
    if (reply.statusCode === 429) {
      fastify.log.warn({
        msg: 'Rate limit exceeded',
        ip: request.ip,
        url: request.url,
        headers: request.headers,
      });

      // Optional: Track in database for analytics
      await fastify.knex('rate_limit_violations').insert({
        ip_address: request.ip,
        url: request.url,
        user_agent: request.headers['user-agent'],
        created_at: new Date(),
      });
    }
  });
}
```

---

### 3. Implement Graceful Degradation

**Fallback to In-Memory if Redis Unavailable:**

```typescript
// apps/api/src/bootstrap/plugin.loader.ts
const redisAvailable = await checkRedisConnection();

await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
  // Only use Redis if available
  ...(redisAvailable && {
    redis: fastify.redis,
  }),
});
```

---

### 4. Test Rate Limits in CI/CD

**GitHub Actions Example:**

```yaml
# .github/workflows/test.yml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run rate limit tests
        run: pnpm test:rate-limits
        env:
          REDIS_HOST: localhost
          REDIS_PORT: 6379
```

---

## 📚 Related Documentation

- **[Login Implementation](./LOGIN_IMPLEMENTATION.md)** - Account lockout service (5 failed attempts)
- **[Registration Implementation](./REGISTRATION_IMPLEMENTATION.md)** - Registration rate limiting
- **[Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md)** - Reset request rate limiting
- **[Authentication Architecture](../ARCHITECTURE.md)** - Overall authentication system
- **[Security Best Practices](../DEPLOYMENT_GUIDE.md#security)** - Production security checklist

---

## ❓ FAQ

**Q: What happens when rate limit is exceeded?**
A: HTTP 429 Too Many Requests with headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

**Q: Do rate limits apply to authenticated users?**
A: Yes, but they can be customized per user/role if needed.

**Q: Why different limits for different endpoints?**
A: Balance security (strict limits for password reset) and UX (generous limits for registration with validation errors).

**Q: Can I disable rate limiting for testing?**
A: Yes, set `config.rateLimit = false` in route configuration or increase limits in development.

**Q: What if Redis is down?**
A: Falls back to in-memory storage (not distributed, lost on restart).

**Q: How do I check current rate limit status?**
A: Check response headers: `X-RateLimit-Limit` (max), `X-RateLimit-Remaining` (remaining), `X-RateLimit-Reset` (reset time).

**Q: Can rate limits be different per user?**
A: Yes, implement custom `keyGenerator` to use user ID instead of IP.

**Q: Why IP + email for login instead of just IP?**
A: Prevents targeted brute force on specific accounts while allowing different users from same IP.

**Q: What's the difference between rate limiting and account lockout?**
A: Rate limiting is per IP/time window. Account lockout is per account (5 failed attempts → locked for 15 min).

**Q: How do I monitor rate limit violations?**
A: Add logging on 429 responses, track in database, set up alerts.

**Q: Can I whitelist certain IPs from rate limiting?**
A: Yes, use `skip` function in rate limit configuration.

**Q: What's the overhead of Redis for rate limiting?**
A: Minimal (< 1ms per request), adds one Redis GET/SET per request.

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
