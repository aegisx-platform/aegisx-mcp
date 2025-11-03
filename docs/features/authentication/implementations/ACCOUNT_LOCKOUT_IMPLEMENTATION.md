# Account Lockout Implementation - Technical Documentation

> **Complete implementation guide for intelligent account lockout and brute force protection**

## 📋 Overview

AegisX implements a **dual-storage account lockout system** to prevent brute force attacks while maintaining excellent user experience. The system intelligently tracks failed login attempts and temporarily locks accounts after repeated failures.

**Key Features:**

- **5 failed attempts** within **15 minutes** → Account locked for **15 minutes**
- **Dual storage**: Redis (fast, temporary) + PostgreSQL (persistent, audit)
- **Auto-unlock**: Automatic unlock after lockout duration expires
- **Comprehensive tracking**: Records all login attempts (success and failure)
- **Multiple failure types**: user_not_found, invalid_password, account_disabled, account_locked
- **Admin unlock**: Manual unlock endpoint for administrators
- **Performance optimized**: Fire-and-forget async operations for success cases
- **Security-critical**: Synchronous validation for failure cases

**Lockout Philosophy:**

- **Strict enough** to prevent brute force attacks (5 attempts)
- **Generous enough** to allow legitimate user typos
- **Smart tracking** by identifier (email or username), not just IP
- **Transparent feedback** with lockout end time in error messages
- **Independent layer** from rate limiting (complementary protection)

---

## 🏗️ Architecture & Flow

### Account Lockout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ User Submits Login (POST /api/auth/login)                       │
│ ↓                                                                │
│ { email: "admin@aegisx.local", password: "WrongPassword" }      │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 1. Check Account Lockout Status                                 │
│    AccountLockoutService.isAccountLocked(identifier)            │
│    ├─ Check Redis: auth:lockout:{identifier}                    │
│    ├─ If locked: Return { isLocked: true, lockoutEndsAt }       │
│    └─ If not locked: Check attempt count from Redis             │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├─── LOCKED ────────────┐
               │                       │
               │                       v
               │              ┌─────────────────────────────────────┐
               │              │ 2a. Record Blocked Attempt          │
               │              │     failureReason: 'account_locked' │
               │              │     ↓                               │
               │              │ 3a. Return 429 Error                │
               │              │     "Account is locked until..."    │
               │              └─────────────────────────────────────┘
               │
               └─── NOT LOCKED ───────┐
                                      │
                                      v
               ┌─────────────────────────────────────────────────────┐
               │ 2b. Proceed with Authentication                     │
               │     ├─ Find user by email/username                  │
               │     ├─ Verify password (bcrypt)                     │
               │     └─ Check account active status                  │
               └──────────────┬──────────────────────────────────────┘
                              │
                              ├─── SUCCESS ──────────┐
                              │                      │
                              │                      v
                              │      ┌────────────────────────────────────┐
                              │      │ 3b. Record Successful Attempt      │
                              │      │     success: true                  │
                              │      │     ↓                              │
                              │      │ 4b. Clear Failed Attempts (Async) │
                              │      │     DEL auth:attempts:{identifier} │
                              │      │     DEL auth:lockout:{identifier}  │
                              │      │     ↓                              │
                              │      │ 5b. Generate Tokens & Login        │
                              │      └────────────────────────────────────┘
                              │
                              └─── FAILURE ─────────┐
                                                    │
                                                    v
               ┌─────────────────────────────────────────────────────┐
               │ 3c. Record Failed Attempt                           │
               │     AccountLockoutService.recordAttempt()           │
               │     ├─ Log to PostgreSQL (async, fire-and-forget)   │
               │     ├─ Increment Redis counter (MUST await)         │
               │     ├─ Check if count >= 5                          │
               │     └─ If yes: Lock account for 15 minutes          │
               └──────────────┬──────────────────────────────────────┘
                              │
                              v
               ┌─────────────────────────────────────────────────────┐
               │ 4c. Lock Account (if threshold reached)             │
               │     ├─ SET auth:lockout:{identifier}                │
               │     ├─ Value: { lockedAt, lockedUntil, attempts }   │
               │     ├─ TTL: 15 minutes (900 seconds)                │
               │     └─ Log warning                                  │
               └──────────────┬──────────────────────────────────────┘
                              │
                              v
               ┌─────────────────────────────────────────────────────┐
               │ 5c. Return 401 Error                                │
               │     "Invalid credentials"                           │
               │     (Generic error, doesn't reveal failure reason)  │
               └─────────────────────────────────────────────────────┘
```

### Dual Storage Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Login Attempt Tracking                        │
└───────────────────────┬──────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        v                               v
┌─────────────────────┐        ┌─────────────────────┐
│  Redis (Fast)       │        │  PostgreSQL (Audit) │
│  Temporary Storage  │        │  Persistent Storage │
└─────────────────────┘        └─────────────────────┘
        │                               │
        v                               v
┌─────────────────────┐        ┌─────────────────────┐
│ auth:attempts:{id}  │        │ login_attempts      │
│ - Counter: 3        │        │ - Full records      │
│ - TTL: 15 minutes   │        │ - User details      │
│                     │        │ - IP, userAgent     │
│ auth:lockout:{id}   │        │ - Success/failure   │
│ - lockedAt          │        │ - Failure reason    │
│ - lockedUntil       │        │ - Timestamp         │
│ - TTL: 15 minutes   │        │ - Permanent audit   │
└─────────────────────┘        └─────────────────────┘
        │                               │
        v                               v
┌─────────────────────┐        ┌─────────────────────┐
│ Used For:           │        │ Used For:           │
│ - Fast lookups      │        │ - Security audit    │
│ - Auto-unlock       │        │ - Trend analysis    │
│ - Attempt counting  │        │ - Compliance        │
│ - TTL-based expiry  │        │ - Export/reporting  │
└─────────────────────┘        └─────────────────────┘
```

**Why Dual Storage?**

| Storage    | Purpose                       | Speed | Persistence | Use Case                   |
| ---------- | ----------------------------- | ----- | ----------- | -------------------------- |
| Redis      | Real-time lockout enforcement | < 1ms | Temporary   | Check if account is locked |
| Redis      | Attempt counter               | < 1ms | Temporary   | Count failed attempts      |
| PostgreSQL | Comprehensive audit logging   | ~10ms | Permanent   | Security analysis          |
| PostgreSQL | Historical data               | ~10ms | Permanent   | Compliance, reports        |

**Performance Design:**

- ✅ **Successful logins**: Fast (async operations don't block)
- ✅ **Failed attempts**: Security-critical (synchronous validation)
- ✅ **PostgreSQL writes**: Fire-and-forget (don't block request)
- ✅ **Redis operations**: Awaited only when security-critical

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── services/
│   │   ├── account-lockout.service.ts             # Core lockout logic
│   │   │   ├─ isAccountLocked() → Lines 61-98
│   │   │   │  - Check Redis for lockout status
│   │   │   │  - Return lockout info + attempts remaining
│   │   │   │  - Auto-cleanup expired locks
│   │   │   │
│   │   │   ├─ recordAttempt() → Lines 112-173
│   │   │   │  - Log to PostgreSQL (async)
│   │   │   │  - Clear attempts on success (async)
│   │   │   │  - Increment counter on failure (await)
│   │   │   │  - Lock if threshold reached
│   │   │   │
│   │   │   ├─ unlockAccount() → Lines 236-247
│   │   │   │  - Admin manual unlock
│   │   │   │  - Delete Redis keys
│   │   │   │  - Log unlock event
│   │   │   │
│   │   │   ├─ getAttemptHistory() → Lines 277-316
│   │   │   │  - Query login attempts from DB
│   │   │   │  - Filter by identifier, success/fail
│   │   │   │
│   │   │   ├─ cleanupOldAttempts() → Lines 322-334
│   │   │   │  - Remove old records (30+ days)
│   │   │   │
│   │   │   └─ getLockoutStats() → Lines 340-367
│   │   │      - Statistics for monitoring
│   │   │      - Count currently locked accounts
│   │   │
│   │   └── auth.service.ts                        # Integration with login
│   │       └─ login() → Lines 125-309
│   │          ├─ Check lockout (lines 129-149)
│   │          ├─ Record attempts (lines 183-248)
│   │          └─ Call lockoutService methods
│   │
│   ├── auth.routes.ts                             # Unlock endpoint
│   │   └─ POST /auth/unlock-account → Lines 204-228
│   │      - Admin-only endpoint
│   │      - Requires auth:unlock permission
│   │      - Handler: authController.unlockAccount
│   │
│   ├── auth.controller.ts                         # HTTP handler
│   │   └─ unlockAccount() → Calls authService.unlockAccount()
│   │
│   └── auth.schemas.ts                            # TypeBox schemas
│       ├─ UnlockAccountRequestSchema
│       └─ UnlockAccountResponseSchema
│
└── audit-system/
    └── login-attempts/                            # Audit logging
        ├── login-attempts.service.ts
        │   ├─ logLoginAttempt()
        │   ├─ findAll() - Query attempts
        │   ├─ getStats() - Statistics
        │   └─ cleanup() - Remove old records
        │
        └── login-attempts.repository.ts
            └─ Database operations for login_attempts table
```

**Dependency Chain:**

```
AuthService (login)
  └─> AccountLockoutService
       ├─> LoginAttemptsService (audit logging)
       │    └─> LoginAttemptsRepository
       │         └─> PostgreSQL (login_attempts table)
       │
       └─> Redis (lockout keys + attempt counters)
```

---

## 🔍 Implementation Details

### 1. AccountLockoutService - Core Configuration

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Lines 41-46:**

```typescript
private readonly MAX_ATTEMPTS = 5;
private readonly LOCKOUT_DURATION_MINUTES = 15;
private readonly TRACKING_WINDOW_MINUTES = 15;

private readonly REDIS_KEY_PREFIX = 'auth:lockout:';
private readonly REDIS_ATTEMPT_KEY_PREFIX = 'auth:attempts:';
```

**Configuration Breakdown:**

| Setting                    | Value            | Reasoning                                  |
| -------------------------- | ---------------- | ------------------------------------------ |
| `MAX_ATTEMPTS`             | 5                | Allows 4 typos, strict enough for security |
| `LOCKOUT_DURATION_MINUTES` | 15               | Long enough to deter brute force           |
| `TRACKING_WINDOW_MINUTES`  | 15               | Match lockout duration                     |
| `REDIS_KEY_PREFIX`         | `auth:lockout:`  | Lockout status storage                     |
| `REDIS_ATTEMPT_KEY_PREFIX` | `auth:attempts:` | Attempt counter storage                    |

**Why These Values?**

**5 Attempts:**

- Typical user: 1-2 typos maximum
- 5 attempts = generous for legitimate users
- 5 attempts = small attack surface for brute force
- Industry standard (GitHub, AWS, many others use 3-5)

**15 Minutes:**

- Short enough: Attacker can't efficiently brute force
- Long enough: Deters automated attacks
- Reasonable for users: Can retry after a short break
- Common industry standard (10-30 minutes typical)

**Tracking Window = Lockout Duration:**

- Simplicity: Same window for counting and locking
- Clear behavior: 5 attempts in 15 min → locked 15 min
- Auto-cleanup: Redis TTL handles both

---

### 2. Check Account Lockout Status

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Lines 61-98:**

```typescript
async isAccountLocked(identifier: string): Promise<LockoutStatus> {
  // identifier can be email or username
  const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;
  const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;

  // Check Redis for lockout status
  const lockoutData = await this.redis.get(redisKey);

  if (lockoutData) {
    const { lockedUntil } = JSON.parse(lockoutData);
    const lockoutEndsAt = new Date(lockedUntil);

    if (lockoutEndsAt > new Date()) {
      // Still locked
      const attemptCount = await this.getAttemptCount(identifier);
      return {
        isLocked: true,
        lockoutEndsAt,
        attemptsRemaining: 0,
        totalAttempts: attemptCount,
      };
    } else {
      // Lockout expired, clean up
      await this.redis.del(redisKey);
      await this.redis.del(attemptKey);
    }
  }

  // Not locked, check attempt count
  const attemptCount = await this.getAttemptCount(identifier);
  const attemptsRemaining = Math.max(0, this.MAX_ATTEMPTS - attemptCount);

  return {
    isLocked: false,
    attemptsRemaining,
    totalAttempts: attemptCount,
  };
}
```

**What This Does:**

1. **Check Redis for lockout key**: `auth:lockout:{identifier}`
2. **If locked:**
   - Parse lockout data (lockedAt, lockedUntil, attempts)
   - Check if lock still valid (lockedUntil > now)
   - Return `{ isLocked: true, lockoutEndsAt, ... }`
3. **If lockout expired:**
   - Auto-cleanup: Delete both lockout and attempt keys
   - Proceed to check attempt count
4. **If not locked:**
   - Get current attempt count from Redis
   - Calculate attempts remaining (5 - current)
   - Return `{ isLocked: false, attemptsRemaining, ... }`

**Return Interface:**

```typescript
export interface LockoutStatus {
  isLocked: boolean; // true if account is currently locked
  lockoutEndsAt?: Date; // When lock expires (if locked)
  attemptsRemaining: number; // How many attempts left before lock
  totalAttempts: number; // Total attempts in current window
}
```

**Example Scenarios:**

```typescript
// Scenario 1: Account locked
{
  isLocked: true,
  lockoutEndsAt: new Date('2025-11-03T15:30:00Z'),
  attemptsRemaining: 0,
  totalAttempts: 5
}

// Scenario 2: 3 failed attempts (not locked yet)
{
  isLocked: false,
  attemptsRemaining: 2,
  totalAttempts: 3
}

// Scenario 3: No attempts yet
{
  isLocked: false,
  attemptsRemaining: 5,
  totalAttempts: 0
}
```

---

### 3. Record Login Attempt (Success or Failure)

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Lines 112-173:**

```typescript
async recordAttempt(
  identifier: string,
  params: {
    userId?: string | null;
    email?: string | null;
    username?: string | null;
    ipAddress: string;
    userAgent?: string | null;
    success: boolean;
    failureReason?: string | null;
  },
): Promise<void> {
  const {
    userId = null,
    email = null,
    username = null,
    ipAddress,
    userAgent = null,
    success,
    failureReason = null,
  } = params;

  // Log to database (async, fire-and-forget - doesn't block request)
  this.logAttemptToDatabase({
    user_id: userId,
    email,
    username,
    ip_address: ipAddress,
    user_agent: userAgent,
    success,
    failure_reason: failureReason,
  }).catch((error) => {
    this.fastify.log.error({
      msg: 'Failed to log login attempt to database',
      error,
      identifier,
    });
  });

  if (success) {
    // Successful login - clear attempts asynchronously (fire-and-forget)
    // This doesn't block successful login response
    this.clearAttempts(identifier).catch((error) => {
      this.fastify.log.error({
        msg: 'Failed to clear login attempts from Redis',
        error,
        identifier,
      });
    });
    return;
  }

  // Failed attempt - increment counter (MUST await - security critical)
  await this.incrementFailedAttempts(identifier);

  // Check if should lock account (MUST await - security critical)
  const attemptCount = await this.getAttemptCount(identifier);

  if (attemptCount >= this.MAX_ATTEMPTS) {
    await this.lockAccount(identifier);
  }
}
```

**Performance Design Philosophy:**

| Operation                   | Async Type      | Blocking? | Why?                                 |
| --------------------------- | --------------- | --------- | ------------------------------------ |
| Log to PostgreSQL           | Fire-and-forget | No        | Audit only, don't slow login         |
| Clear attempts (success)    | Fire-and-forget | No        | User already authenticated           |
| Increment counter (failure) | Awaited         | Yes       | Security critical (must be accurate) |
| Lock account                | Awaited         | Yes       | Security critical (must enforce)     |

**Why This Design?**

**Successful Login (Fast Path):**

```typescript
if (success) {
  // Async (fire-and-forget)
  this.logAttemptToDatabase(...).catch(...);
  this.clearAttempts(identifier).catch(...);
  return; // Immediate return, don't block!
}
```

Result: **Successful logins complete in ~50-100ms** (no blocking operations)

**Failed Login (Security Path):**

```typescript
// MUST await (security critical)
await this.incrementFailedAttempts(identifier);
const attemptCount = await this.getAttemptCount(identifier);
if (attemptCount >= this.MAX_ATTEMPTS) {
  await this.lockAccount(identifier);
}
```

Result: **Failed attempts take ~10-20ms longer** but security is guaranteed

**Why Log to Database is Fire-and-Forget:**

- Audit logging is important but not critical to authentication flow
- If database write fails, login should still succeed/fail correctly
- Errors are logged for monitoring
- PostgreSQL logs are for historical analysis, not real-time enforcement

---

### 4. Failure Reasons Tracked

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**All Failure Types:**

| Failure Reason     | When It Occurs                           | Lines | User Feedback                |
| ------------------ | ---------------------------------------- | ----- | ---------------------------- |
| `account_locked`   | Account already locked (attempt blocked) | 139   | "Account is locked until..." |
| `user_not_found`   | Email/username doesn't exist             | 189   | "Invalid credentials"        |
| `invalid_password` | Wrong password                           | 212   | "Invalid credentials"        |
| `account_disabled` | User's is_active = false                 | 232   | "Account is disabled"        |

**Example Recording:**

**Scenario 1: User Not Found**

```typescript
await this.lockoutService.recordAttempt(identifier, {
  email: email.includes('@') ? email : null,
  username: !email.includes('@') ? email : null,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: false,
  failureReason: 'user_not_found', // ← No userId (user doesn't exist)
});
```

**Scenario 2: Invalid Password**

```typescript
await this.lockoutService.recordAttempt(identifier, {
  userId: user.id, // ← User exists
  email: user.email,
  username: user.username,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: false,
  failureReason: 'invalid_password',
});
```

**Scenario 3: Account Disabled**

```typescript
await this.lockoutService.recordAttempt(identifier, {
  userId: user.id,
  email: user.email,
  username: user.username,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: false,
  failureReason: 'account_disabled',
});
```

**Scenario 4: Account Locked (Blocked Attempt)**

```typescript
await this.lockoutService.recordAttempt(identifier, {
  email: email.includes('@') ? email : null,
  username: !email.includes('@') ? email : null,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: false,
  failureReason: 'account_locked',
});
```

**Scenario 5: Successful Login**

```typescript
await this.lockoutService.recordAttempt(identifier, {
  userId: user.id,
  email: user.email,
  username: user.username,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: true, // ← Clears failed attempts counter
});
```

---

### 5. Lock Account in Redis

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Lines 201-220:**

```typescript
private async lockAccount(identifier: string): Promise<void> {
  const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;
  const lockoutDurationSeconds = this.LOCKOUT_DURATION_MINUTES * 60;
  const lockedUntil = new Date(Date.now() + lockoutDurationSeconds * 1000);

  const lockoutData = JSON.stringify({
    lockedAt: new Date().toISOString(),
    lockedUntil: lockedUntil.toISOString(),
    attempts: await this.getAttemptCount(identifier),
  });

  await this.redis.setex(redisKey, lockoutDurationSeconds, lockoutData);

  this.fastify.log.warn({
    msg: 'Account locked due to too many failed login attempts',
    identifier,
    lockedUntil,
    attempts: await this.getAttemptCount(identifier),
  });
}
```

**What This Does:**

1. **Calculate lockout end time**: Now + 15 minutes
2. **Create lockout record**:
   ```json
   {
     "lockedAt": "2025-11-03T15:15:00.000Z",
     "lockedUntil": "2025-11-03T15:30:00.000Z",
     "attempts": 5
   }
   ```
3. **Store in Redis with TTL**: 900 seconds (15 minutes)
4. **Log warning**: For monitoring and alerting

**Redis Key Example:**

```
Key: auth:lockout:admin@aegisx.local
Value: {"lockedAt":"2025-11-03T15:15:00Z","lockedUntil":"2025-11-03T15:30:00Z","attempts":5}
TTL: 900 seconds
```

**Auto-Unlock Mechanism:**

Redis automatically deletes the key after TTL expires:

- ✅ No cleanup job needed
- ✅ Guaranteed unlock after 15 minutes
- ✅ No stale locks in Redis

---

### 6. Admin Manual Unlock

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Lines 236-247:**

```typescript
async unlockAccount(identifier: string): Promise<void> {
  const attemptKey = `${this.REDIS_ATTEMPT_KEY_PREFIX}${identifier}`;
  const redisKey = `${this.REDIS_KEY_PREFIX}${identifier}`;

  await this.redis.del(attemptKey);
  await this.redis.del(redisKey);

  this.fastify.log.info({
    msg: 'Account manually unlocked',
    identifier,
  });
}
```

**What This Does:**

1. Delete attempt counter: `auth:attempts:{identifier}`
2. Delete lockout status: `auth:lockout:{identifier}`
3. Log unlock event for audit

**Usage:**

**Via API (Admin Only):**

```bash
curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com"
  }'
```

**Direct via Redis (Development Only):**

```bash
redis-cli
> DEL auth:attempts:user@example.com
> DEL auth:lockout:user@example.com
```

**Route Configuration:**

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 204-228:**

```typescript
// POST /api/auth/unlock-account - Manually unlock a locked account (Admin only)
typedFastify.route({
  method: 'POST',
  url: '/auth/unlock-account',
  schema: {
    tags: ['Authentication'],
    summary: 'Manually unlock a locked account',
    description: 'Admin endpoint to manually unlock an account that has been locked due to failed login attempts. ' + 'Requires admin permission.',
    security: [{ bearerAuth: [] }],
    body: SchemaRefs.module('auth', 'unlockAccountRequest'),
    response: {
      200: SchemaRefs.module('auth', 'unlockAccountResponse'),
      401: SchemaRefs.Unauthorized,
      403: SchemaRefs.Forbidden,
      500: SchemaRefs.ServerError,
    },
  },
  preHandler: [fastify.authenticateJWT, fastify.verifyPermission('auth', 'unlock')],
  handler: authController.unlockAccount,
});
```

**Security:**

- ✅ Requires JWT authentication
- ✅ Requires `auth:unlock` permission
- ✅ Admin/support staff only
- ✅ All unlocks logged

---

### 7. Integration with Login Flow

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**Step 1: Check Lockout Before Authentication (Lines 129-149)**

```typescript
// Check if account is locked
const lockoutStatus = await this.lockoutService.isAccountLocked(identifier);
if (lockoutStatus.isLocked) {
  // Record the blocked attempt
  await this.lockoutService.recordAttempt(identifier, {
    email: email.includes('@') ? email : null,
    username: !email.includes('@') ? email : null,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'account_locked',
  });

  const error = new Error(`Account is locked. Try again after ${lockoutStatus.lockoutEndsAt?.toLocaleString()}`);
  (error as any).statusCode = 429;
  (error as any).code = 'ACCOUNT_LOCKED';
  (error as any).lockoutEndsAt = lockoutStatus.lockoutEndsAt;
  throw error;
}
```

**Step 2: Record All Login Attempts**

**User Not Found (Lines 181-196):**

```typescript
if (!user || !user.password) {
  await this.lockoutService.recordAttempt(identifier, {
    email: email.includes('@') ? email : null,
    username: !email.includes('@') ? email : null,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'user_not_found',
  });
  throw error; // "Invalid credentials"
}
```

**Invalid Password (Lines 198-219):**

```typescript
const isValid = await this.authRepository.verifyPassword(password, user.password);
if (!isValid) {
  await this.lockoutService.recordAttempt(identifier, {
    userId: user.id,
    email: user.email,
    username: user.username,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'invalid_password',
  });
  throw error; // "Invalid credentials"
}
```

**Account Disabled (Lines 221-238):**

```typescript
if (!user.isActive) {
  await this.lockoutService.recordAttempt(identifier, {
    userId: user.id,
    email: user.email,
    username: user.username,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'account_disabled',
  });
  throw error; // "Account is disabled"
}
```

**Successful Login (Lines 240-248):**

```typescript
// Record successful login attempt
await this.lockoutService.recordAttempt(identifier, {
  userId: user.id,
  email: user.email,
  username: user.username,
  ipAddress: ipAddress || 'unknown',
  userAgent,
  success: true,
});
```

---

## 🛠️ Troubleshooting Guide

### Problem 1: Account Locked Unexpectedly

**Symptoms:**

- User reports account locked after few attempts
- Error: "Account is locked. Try again after..."
- Status code: 429

**Check Lockout Status:**

```bash
# Connect to Redis
redis-cli

# Check lockout status
GET auth:lockout:user@example.com

# Check attempt count
GET auth:attempts:user@example.com
```

**Example Output:**

```json
// Lockout status
{
  "lockedAt": "2025-11-03T15:15:00.000Z",
  "lockedUntil": "2025-11-03T15:30:00.000Z",
  "attempts": 5
}

// Attempt count
"5"
```

**Check Database Logs:**

```sql
-- View recent failed attempts
SELECT
  email,
  username,
  ip_address,
  success,
  failure_reason,
  created_at
FROM login_attempts
WHERE email = 'user@example.com'
  OR username = 'user@example.com'
ORDER BY created_at DESC
LIMIT 10;
```

**Solutions:**

**1. Wait for Auto-Unlock (15 minutes):**

```bash
# Check TTL (time to live)
redis-cli TTL auth:lockout:user@example.com
# Output: 450 (450 seconds = 7.5 minutes remaining)
```

**2. Admin Manual Unlock:**

```bash
curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com"
  }'
```

**3. Direct Redis Unlock (Development Only):**

```bash
redis-cli
> DEL auth:lockout:user@example.com
> DEL auth:attempts:user@example.com
```

**4. Investigate Root Cause:**

```sql
-- Check for unusual patterns
SELECT
  failure_reason,
  COUNT(*) as count,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM login_attempts
WHERE email = 'user@example.com'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY failure_reason;
```

Possible causes:

- User forgetting password (many invalid_password attempts)
- Typo in email/username (user_not_found)
- Automated attack (rapid attempts from same IP)
- Browser autofill with old password

---

### Problem 2: Auto-Unlock Not Working

**Symptoms:**

- Account stays locked after 15 minutes
- User still gets "Account is locked" error
- TTL shows -1 (no expiry)

**Check Redis TTL:**

```bash
redis-cli

# Check if key has TTL
TTL auth:lockout:user@example.com

# Possible outputs:
# 450 = 450 seconds until expiry (normal)
# -1 = key exists but no expiry set (BUG!)
# -2 = key does not exist (already expired or never locked)
```

**Problem: TTL is -1 (No Expiry Set)**

This should never happen but can occur if:

- Redis persistence/replication issue
- Manual SET command without SETEX
- Redis version incompatibility

**Solution 1: Manual Unlock**

```bash
redis-cli DEL auth:lockout:user@example.com
```

**Solution 2: Check AccountLockoutService Code**

```typescript
// Verify lockAccount() uses SETEX (sets TTL automatically)
await this.redis.setex(redisKey, lockoutDurationSeconds, lockoutData);

// NOT this (no TTL):
await this.redis.set(redisKey, lockoutData); // ❌ Missing TTL!
```

**Solution 3: Check Redis Persistence Config**

```bash
# Check Redis configuration
redis-cli CONFIG GET save
redis-cli CONFIG GET appendonly

# If persistence enabled, TTL should survive restarts
```

---

### Problem 3: Failed Attempts Not Tracked

**Symptoms:**

- Multiple failed logins don't trigger lockout
- Attempt counter stays at 0
- Login attempts not recorded in database

**Check Redis Counter:**

```bash
redis-cli

# Check attempt counter
GET auth:attempts:user@example.com

# Should return: "3" (or current count)
# If returns: (nil) = no attempts tracked
```

**Check Database Logs:**

```sql
-- Check if attempts are being logged
SELECT COUNT(*) as total_attempts
FROM login_attempts
WHERE email = 'user@example.com'
  AND created_at > NOW() - INTERVAL '15 minutes';

-- Should return: 3 (or actual count)
-- If returns: 0 = not being logged
```

**Possible Causes:**

**1. Redis Connection Issue:**

```bash
# Test Redis connection
redis-cli PING
# Should return: PONG

# Check Redis logs
tail -f /var/log/redis/redis-server.log
```

**2. recordAttempt() Not Called:**

```typescript
// Verify AuthService.login() calls recordAttempt()
await this.lockoutService.recordAttempt(identifier, {
  success: false,
  failureReason: 'invalid_password',
  // ... other params
});
```

**3. Fire-and-Forget Errors:**

```typescript
// Database logging errors may be silently caught
this.logAttemptToDatabase(...).catch((error) => {
  // Check fastify logs for this error
  this.fastify.log.error({
    msg: 'Failed to log login attempt to database',
    error,
  });
});
```

**Solution:**

```bash
# Check Fastify logs for errors
tail -f logs/app.log | grep "Failed to log login attempt"

# Test Redis write
redis-cli
> INCR auth:attempts:test@example.com
> GET auth:attempts:test@example.com
# Should return: "1"

# Test database write
psql aegisx_db -c "INSERT INTO login_attempts (email, ip_address, success, failure_reason) VALUES ('test@example.com', '127.0.0.1', false, 'test');"
```

---

### Problem 4: Manual Unlock Fails

**Symptoms:**

- Admin unlock endpoint returns error
- Account still locked after unlock
- 403 Forbidden error

**Check Permissions:**

```bash
# Decode JWT token to check permissions
node -e "
const token = 'YOUR_ACCESS_TOKEN';
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
console.log('Permissions:', payload.permissions);
"

# Should include: "auth:unlock"
```

**Check User Roles:**

```sql
-- Check if user has auth:unlock permission
SELECT
  u.email,
  r.name as role,
  p.resource,
  p.action
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@aegisx.local'
  AND p.resource = 'auth'
  AND p.action = 'unlock';

-- Should return: at least one row
-- If empty: user doesn't have permission
```

**Grant Permission (Admin Only):**

```sql
-- Grant auth:unlock permission to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'admin'),
  (SELECT id FROM permissions WHERE resource = 'auth' AND action = 'unlock')
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  JOIN roles r ON rp.role_id = r.id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE r.name = 'admin' AND p.resource = 'auth' AND p.action = 'unlock'
);
```

**Test Unlock Endpoint:**

```bash
# Get admin token first
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisx.local",
    "password": "Admin123!"
  }' | jq -r '.data.accessToken')

# Test unlock
curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com"
  }'
```

---

### Problem 5: Multiple Instances Not Sharing Lockout State

**Symptoms:**

- User locked on Instance 1, can login on Instance 2
- Attempt counts different on different instances
- Lockout inconsistent across API servers

**Check Redis Connection:**

All instances must use **same Redis**:

```bash
# Check Redis host/port in .env.local for each instance
cat .env.local | grep REDIS

# Should be same for all instances:
# REDIS_HOST=localhost (or shared Redis host)
# REDIS_PORT=6379
```

**Verify Shared Storage:**

```bash
# On Instance 1: Make 3 failed attempts
curl -X POST http://localhost:3333/api/auth/login \
  -d '{"email":"test@example.com","password":"wrong"}'

# Check Redis
redis-cli GET auth:attempts:test@example.com
# Should return: "3"

# On Instance 2: Check same counter
redis-cli GET auth:attempts:test@example.com
# Should also return: "3" (same value!)
```

**Solution:**

```yaml
# docker-compose.yml - Shared Redis
services:
  api-1:
    environment:
      REDIS_HOST: redis # Shared Redis service
      REDIS_PORT: 6379

  api-2:
    environment:
      REDIS_HOST: redis # Same Redis!
      REDIS_PORT: 6379

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
```

---

## 🔒 Security Considerations

### 1. Why Identifier-Based (Not IP-Based)?

**Current Implementation:**

```typescript
keyGenerator: (identifier) => identifier; // email or username
```

**Why This Approach?**

**Scenario: Office Network (100 Users, 1 IP)**

```
Office (NAT Gateway)
├─ User A: admin@company.com
├─ User B: manager@company.com
├─ User C: dev@company.com
└─ ... (97 more users)
   ↓
Same Public IP: 203.0.113.45
   ↓
API Server
```

**IP-Based Lockout (BAD):**

```
User A makes 5 failed attempts → IP locked
User B tries to login → BLOCKED (shares same IP!)
All 100 users can't login for 15 minutes
```

**Identifier-Based Lockout (GOOD):**

```
User A makes 5 failed attempts → A's account locked
User B tries to login → SUCCESS (different account)
Only User A affected
```

**Trade-offs:**

| Approach          | Pros                                  | Cons                                  |
| ----------------- | ------------------------------------- | ------------------------------------- |
| IP-based          | ✅ Prevents distributed attacks       | ❌ False positives (shared IPs)       |
|                   | ✅ Protects all accounts from 1 IP    | ❌ Corporate networks affected        |
| Identifier-based  | ✅ Per-account protection             | ❌ Attacker can try multiple accounts |
|                   | ✅ No false positives                 | ❌ Distributed attack possible        |
| **AegisX (Both)** | ✅ Rate limiting (IP-based)           | ✅ Covers both attack vectors         |
|                   | ✅ Account lockout (identifier-based) | ✅ Balanced security + UX             |

**AegisX Strategy:**

- **Rate Limiting**: IP-based (15 attempts/5min) - See [RATE_LIMITING_IMPLEMENTATION.md](./RATE_LIMITING_IMPLEMENTATION.md)
- **Account Lockout**: Identifier-based (5 attempts/15min) - This document
- **Result**: Double protection without false positives

---

### 2. Why 5 Attempts (Not More or Less)?

**Industry Standards:**

| Company/Service    | Failed Attempts | Lockout Duration | Notes                     |
| ------------------ | --------------- | ---------------- | ------------------------- |
| GitHub             | 5               | 15 minutes       | Similar to AegisX         |
| AWS IAM            | 5               | 15 minutes       | Enterprise standard       |
| Microsoft Azure AD | 10              | 60 seconds       | Shorter locks, more tries |
| Google Accounts    | 5-10            | Varies           | Progressive delays        |
| AegisX             | **5**           | **15 minutes**   | **Industry standard**     |

**Why Not 3 Attempts?**

```
User scenario:
Attempt 1: "MyPassword" → Wrong (caps lock on)
Attempt 2: "mypassword" → Wrong (missing numbers)
Attempt 3: "myPassword123" → LOCKED! (legitimate user frustrated)
```

**Why Not 10 Attempts?**

```
Attacker scenario:
10 attempts every 15 minutes
= 40 attempts per hour
= 960 attempts per day
= Enough to crack weak passwords
```

**Why 5 is Sweet Spot:**

```
Legitimate user:
✅ Enough attempts to fix typos (caps lock, wrong keyboard layout)
✅ Time to realize they need password reset

Attacker:
❌ 5 attempts/15min = 20 attempts/hour
❌ 480 attempts/day = inefficient brute force
❌ Likely to give up
```

---

### 3. Why 15 Minutes (Not More or Less)?

**Industry Standards:**

| Duration       | Used By            | Pros             | Cons                  |
| -------------- | ------------------ | ---------------- | --------------------- |
| 1 minute       | Some APIs          | Fast recovery    | Easy to brute force   |
| 5 minutes      | Some systems       | Reasonable delay | Still vulnerable      |
| **15 minutes** | **AegisX, GitHub** | **Good balance** | **Industry standard** |
| 30 minutes     | Some banks         | Very secure      | Poor UX               |
| 1 hour         | High security      | Maximum security | Users frustrated      |

**Why Not 5 Minutes?**

```
Attacker: Makes 5 attempts → Wait 5 min → Repeat
Result: 60 attempts per hour still possible
```

**Why Not 30+ Minutes?**

```
User: Forgets password → Locked for 30 minutes
User: Gets frustrated → Calls support → Bad UX
```

**Why 15 Minutes?**

```
Attacker: 5 attempts / 15 min = 20 per hour
Result: Too slow for effective brute force

User: Locked for 15 minutes
User: Takes a break, tries again → Reasonable UX
```

---

### 4. Audit Logging Best Practices

**What We Log:**

```typescript
{
  id: 'uuid',
  user_id: 'uuid | null',        // null if user doesn't exist
  email: 'user@example.com',
  username: 'johndoe',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...',
  success: false,
  failure_reason: 'invalid_password',
  created_at: '2025-11-03T15:15:00Z'
}
```

**Why We Log Everything:**

**1. Security Forensics:**

```sql
-- Detect brute force patterns
SELECT
  ip_address,
  COUNT(*) as attempts,
  COUNT(DISTINCT email) as unique_emails
FROM login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 50;

-- Result: IPs making suspicious attempts
```

**2. User Support:**

```sql
-- Help user who can't login
SELECT
  failure_reason,
  created_at
FROM login_attempts
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 5;

-- Result: "All attempts show invalid_password → Likely password issue"
```

**3. Compliance (GDPR, SOC2):**

- ✅ Audit trail of all access attempts
- ✅ Track who accessed what and when
- ✅ Detect unauthorized access attempts
- ✅ Export for compliance reports

**4. Trend Analysis:**

```sql
-- Login success rate over time
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  ROUND(COUNT(*) FILTER (WHERE success = true)::numeric / COUNT(*) * 100, 2) as success_rate
FROM login_attempts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

**Data Retention:**

```typescript
// Cleanup old attempts (default: 30 days)
await lockoutService.cleanupOldAttempts(30);
```

**Why 30 Days?**

- Long enough for security investigation
- Short enough to comply with GDPR (data minimization)
- Configurable per organization policy

---

### 5. Admin Unlock Security

**Why Admin-Only?**

If any user could unlock accounts:

- ❌ Attacker locks victim's account
- ❌ Attacker unlocks own account
- ❌ Lockout mechanism bypassed

**AegisX Protection:**

```typescript
preHandler: [
  fastify.authenticateJWT,                    // Must be logged in
  fastify.verifyPermission('auth', 'unlock'), // Must have permission
],
```

**Permission Assignment:**

```sql
-- Only assign to admin/support roles
SELECT
  r.name as role,
  p.resource || ':' || p.action as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'auth' AND p.action = 'unlock';

-- Result: Only 'admin' and 'support' roles have this permission
```

**Audit Logging:**

```typescript
// Log all unlock operations
this.fastify.log.info({
  msg: 'Account manually unlocked',
  identifier,
  unlockedBy: request.user.id, // Who performed unlock
  timestamp: new Date(),
});
```

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Start API server
pnpm run dev:api

# 2. Test normal login (should succeed)
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisx.local",
    "password": "Admin123!"
  }'
# Expected: 200 OK, access token returned

# 3. Test failed login (wrong password)
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisx.local",
    "password": "WrongPassword"
  }'
# Expected: 401 Unauthorized, "Invalid credentials"

# 4. Make 5 failed attempts (trigger lockout)
for i in {1..5}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3333/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrong"
    }'
  sleep 1
done
# Expected: First 5 return 401, then account locked

# 5. Check lockout status in Redis
redis-cli GET "auth:lockout:test@example.com"
# Expected: JSON with lockedUntil timestamp

redis-cli GET "auth:attempts:test@example.com"
# Expected: "5"

# 6. Attempt login while locked
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "correct-password"
  }'
# Expected: 429 Too Many Requests, "Account is locked until..."

# 7. Check database logs
psql aegisx_db -c "
  SELECT email, success, failure_reason, created_at
  FROM login_attempts
  WHERE email = 'test@example.com'
  ORDER BY created_at DESC
  LIMIT 10;
"
# Expected: 5 failed attempts + 1 account_locked attempt

# 8. Admin unlock
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegisx.local","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com"}'
# Expected: 200 OK, account unlocked

# 9. Verify unlock worked
redis-cli GET "auth:lockout:test@example.com"
# Expected: (nil) - key deleted

curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "correct-password"
  }'
# Expected: 200 OK, login succeeds

# 10. Test auto-unlock (wait 15 minutes)
# Lock account again (5 failed attempts)
for i in {1..5}; do
  curl -s -X POST http://localhost:3333/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"auto@example.com","password":"wrong"}' > /dev/null
done

# Wait 15 minutes (or fast-forward Redis TTL)
redis-cli SET "auth:lockout:auto@example.com" '{"lockedUntil":"2025-11-03T15:00:00Z"}' EX 5
# Wait 5 seconds

# Try login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auto@example.com","password":"correct-password"}'
# Expected: 200 OK (auto-unlocked after TTL)
```

---

### Automated Testing

**Test File:** `apps/api/src/core/auth/auth.routes.spec.ts`

```typescript
describe('Account Lockout', () => {
  describe('isAccountLocked()', () => {
    it('should return not locked for new account', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);
      const status = await lockoutService.isAccountLocked('new@example.com');

      expect(status.isLocked).toBe(false);
      expect(status.attemptsRemaining).toBe(5);
      expect(status.totalAttempts).toBe(0);
    });

    it('should return locked status when account is locked', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);

      // Lock account manually
      await app.redis.setex(
        'auth:lockout:locked@example.com',
        900,
        JSON.stringify({
          lockedAt: new Date().toISOString(),
          lockedUntil: new Date(Date.now() + 900000).toISOString(),
          attempts: 5,
        }),
      );

      const status = await lockoutService.isAccountLocked('locked@example.com');

      expect(status.isLocked).toBe(true);
      expect(status.attemptsRemaining).toBe(0);
      expect(status.lockoutEndsAt).toBeDefined();
    });
  });

  describe('recordAttempt()', () => {
    it('should increment counter on failed attempt', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);

      await lockoutService.recordAttempt('test@example.com', {
        ipAddress: '127.0.0.1',
        success: false,
        failureReason: 'invalid_password',
      });

      const count = await app.redis.get('auth:attempts:test@example.com');
      expect(count).toBe('1');
    });

    it('should lock account after 5 failed attempts', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await lockoutService.recordAttempt('lock@example.com', {
          ipAddress: '127.0.0.1',
          success: false,
          failureReason: 'invalid_password',
        });
      }

      const status = await lockoutService.isAccountLocked('lock@example.com');
      expect(status.isLocked).toBe(true);
    });

    it('should clear attempts on successful login', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);

      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await lockoutService.recordAttempt('clear@example.com', {
          ipAddress: '127.0.0.1',
          success: false,
          failureReason: 'invalid_password',
        });
      }

      // Successful login
      await lockoutService.recordAttempt('clear@example.com', {
        ipAddress: '127.0.0.1',
        success: true,
      });

      // Wait for async clear to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const count = await app.redis.get('auth:attempts:clear@example.com');
      expect(count).toBeNull();
    });
  });

  describe('unlockAccount()', () => {
    it('should unlock locked account', async () => {
      const lockoutService = new AccountLockoutService(app, app.knex, app.redis);

      // Lock account
      await app.redis.setex('auth:lockout:unlock@example.com', 900, '{}');
      await app.redis.set('auth:attempts:unlock@example.com', '5');

      // Unlock
      await lockoutService.unlockAccount('unlock@example.com');

      // Verify unlocked
      const lockoutKey = await app.redis.get('auth:lockout:unlock@example.com');
      const attemptKey = await app.redis.get('auth:attempts:unlock@example.com');

      expect(lockoutKey).toBeNull();
      expect(attemptKey).toBeNull();
    });
  });

  describe('POST /auth/login - Lockout Integration', () => {
    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await app.inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: 'locktest@example.com',
            password: 'wrongpassword',
          },
        });
      }

      // 6th attempt should be blocked
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'locktest@example.com',
          password: 'correctpassword',
        },
      });

      expect(response.statusCode).toBe(429);
      expect(response.json().error.code).toBe('ACCOUNT_LOCKED');
      expect(response.json().error.message).toContain('locked');
    });

    it('should allow login after admin unlock', async () => {
      // Lock account
      for (let i = 0; i < 5; i++) {
        await app.inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            email: 'unlocktest@example.com',
            password: 'wrong',
          },
        });
      }

      // Admin unlock
      const adminToken = await getAdminToken(app);
      await app.inject({
        method: 'POST',
        url: '/auth/unlock-account',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          identifier: 'unlocktest@example.com',
        },
      });

      // Should allow login now
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'unlocktest@example.com',
          password: 'correctpassword',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
```

---

## 📊 Database Schema

### login_attempts Table

```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- null if user doesn't exist
  email VARCHAR(255),                                     -- may not match users.email
  username VARCHAR(255),                                  -- may not match users.username
  ip_address VARCHAR(45) NOT NULL,                       -- IPv4 or IPv6
  user_agent VARCHAR(500),                               -- Browser info
  success BOOLEAN NOT NULL,                              -- true = success, false = failure
  failure_reason VARCHAR(50),                            -- user_not_found, invalid_password, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_username ON login_attempts(username);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX idx_login_attempts_failure_reason ON login_attempts(failure_reason);

-- Composite index for common queries
CREATE INDEX idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
```

**Sample Records:**

```sql
-- Failed login (user not found)
{
  "id": "uuid-1",
  "user_id": null,                           -- User doesn't exist
  "email": "nonexistent@example.com",
  "username": null,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": false,
  "failure_reason": "user_not_found",
  "created_at": "2025-11-03T15:15:00Z"
}

-- Failed login (wrong password)
{
  "id": "uuid-2",
  "user_id": "user-uuid",                    -- User exists
  "email": "admin@aegisx.local",
  "username": "admin",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": false,
  "failure_reason": "invalid_password",
  "created_at": "2025-11-03T15:16:00Z"
}

-- Successful login
{
  "id": "uuid-3",
  "user_id": "user-uuid",
  "email": "admin@aegisx.local",
  "username": "admin",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "failure_reason": null,
  "created_at": "2025-11-03T15:17:00Z"
}
```

---

## 🗄️ Redis Structure

### Redis Keys

**Lockout Status Key:**

```
Key: auth:lockout:{identifier}
Type: String (JSON)
TTL: 900 seconds (15 minutes)
Value: {
  "lockedAt": "2025-11-03T15:15:00.000Z",
  "lockedUntil": "2025-11-03T15:30:00.000Z",
  "attempts": 5
}
```

**Attempt Counter Key:**

```
Key: auth:attempts:{identifier}
Type: String (integer)
TTL: 900 seconds (15 minutes)
Value: "3" (current attempt count)
```

### Redis Commands for Debugging

```bash
# Connect to Redis
redis-cli

# ════════════════════════════════════════════════════════
# Check Lockout Status
# ════════════════════════════════════════════════════════

# Get lockout info
GET auth:lockout:admin@aegisx.local

# Get attempt count
GET auth:attempts:admin@aegisx.local

# Check TTL (time to live)
TTL auth:lockout:admin@aegisx.local
TTL auth:attempts:admin@aegisx.local

# ════════════════════════════════════════════════════════
# List All Lockouts
# ════════════════════════════════════════════════════════

# Find all locked accounts
KEYS auth:lockout:*

# Find all attempt counters
KEYS auth:attempts:*

# Count currently locked accounts
redis-cli KEYS "auth:lockout:*" | wc -l

# ════════════════════════════════════════════════════════
# Manual Operations (Development Only)
# ════════════════════════════════════════════════════════

# Unlock specific account
DEL auth:lockout:user@example.com
DEL auth:attempts:user@example.com

# Clear all lockouts
redis-cli KEYS "auth:lockout:*" | xargs redis-cli DEL
redis-cli KEYS "auth:attempts:*" | xargs redis-cli DEL

# Manually lock account (testing)
SETEX auth:lockout:test@example.com 900 '{"lockedAt":"2025-11-03T15:15:00Z","lockedUntil":"2025-11-03T15:30:00Z","attempts":5}'
SET auth:attempts:test@example.com 5

# ════════════════════════════════════════════════════════
# Monitoring
# ════════════════════════════════════════════════════════

# Watch Redis operations in real-time
MONITOR

# Then make login attempts in another terminal
# You'll see all Redis commands

# ════════════════════════════════════════════════════════
# Statistics
# ════════════════════════════════════════════════════════

# Get Redis memory usage
INFO memory

# Get key count
DBSIZE

# Sample key value
RANDOMKEY
```

---

## 🌍 Environment Variables

### Required Environment Variables

| Variable       | Example            | Description                    | Default     |
| -------------- | ------------------ | ------------------------------ | ----------- |
| `REDIS_HOST`   | `localhost`        | Redis host for lockout storage | `localhost` |
| `REDIS_PORT`   | `6379`             | Redis port                     | `6379`      |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL for audit logs      | (required)  |

### Optional Configuration

| Variable         | Example     | Description                 | Default |
| ---------------- | ----------- | --------------------------- | ------- |
| `REDIS_PASSWORD` | `secret123` | Redis password (if enabled) | (none)  |
| `REDIS_DB`       | `0`         | Redis database number       | `0`     |

### Checking Current Configuration

```bash
# View environment variables
cat .env.local | grep -E "REDIS|DATABASE"

# Test Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
# Expected: PONG

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"
# Expected: 1
```

---

## 📚 Related Documentation

- **[Login Implementation](./LOGIN_IMPLEMENTATION.md)** - Complete login flow with lockout integration
- **[Rate Limiting Implementation](./RATE_LIMITING_IMPLEMENTATION.md)** - IP-based rate limiting (complementary protection)
- **[Authentication Architecture](../ARCHITECTURE.md)** - Overall authentication system design
- **[RBAC Implementation](../../rbac/IMPLEMENTATION.md)** - Role-based access control (admin unlock permission)
- **[Audit System](../../audit-system/README.md)** - Comprehensive audit logging

---

## ❓ FAQ

**Q: What happens after 5 failed login attempts?**
A: Account is locked for 15 minutes. User sees "Account is locked. Try again after [timestamp]". Admin can manually unlock anytime.

**Q: Does account lockout apply to all authentication methods?**
A: Yes, applies to email and username login. Identifier-based tracking (not IP-based).

**Q: Can users unlock their own accounts?**
A: No, only admins with `auth:unlock` permission can unlock accounts. This prevents attackers from bypassing lockout.

**Q: What if I forget my password and get locked out?**
A: Use "Forgot password?" link to reset password. Password reset bypasses lockout. Or contact admin for manual unlock.

**Q: How is this different from rate limiting?**
A: Rate limiting is IP-based (15 attempts/5min). Account lockout is identifier-based (5 attempts/15min). Both layers protect different attack vectors.

**Q: Will lockout survive API server restart?**
A: Yes, Redis persists data. PostgreSQL audit logs are permanent. Lockout state maintained across restarts.

**Q: What if Redis goes down?**
A: Lockout stops working (security degradation). Rate limiting continues. PostgreSQL audit logs still recorded. Monitor Redis uptime in production.

**Q: Can I change lockout settings (5 attempts, 15 minutes)?**
A: Yes, modify `MAX_ATTEMPTS`, `LOCKOUT_DURATION_MINUTES`, `TRACKING_WINDOW_MINUTES` in `account-lockout.service.ts`. Requires code change and restart.

**Q: Are failed attempts logged even if user doesn't exist?**
A: Yes, all attempts logged (including user_not_found). This helps detect enumeration attacks.

**Q: What failure reasons are tracked?**
A: `user_not_found`, `invalid_password`, `account_disabled`, `account_locked`. Each provides security insights.

**Q: Can I see login attempt history?**
A: Yes, query `login_attempts` table or use `lockoutService.getAttemptHistory(identifier)`. Admin dashboard shows statistics.

**Q: Does successful login reset the counter?**
A: Yes, successful login clears attempt counter and lockout status (async, doesn't block response).

**Q: Why identifier-based instead of IP-based?**
A: Prevents false positives from shared IPs (corporate networks, NAT). Each user gets independent lockout tracking.

**Q: What if attacker tries multiple accounts from same IP?**
A: Rate limiting (separate layer) protects against this. See [RATE_LIMITING_IMPLEMENTATION.md](./RATE_LIMITING_IMPLEMENTATION.md).

**Q: How do I monitor lockout activity?**
A: Check `getLockoutStats()` for metrics. Query `login_attempts` table for detailed analysis. Set up alerts on high failure rates.

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
