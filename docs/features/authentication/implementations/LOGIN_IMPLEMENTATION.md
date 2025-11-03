# Login Implementation - Technical Documentation

> **Complete implementation guide for user login in authentication system**

## 📋 Overview

Login is implemented across multiple services with proper security and separation of concerns:

1. **AuthService** - Handles login logic and token generation
2. **AccountLockoutService** - Prevents brute force attacks with intelligent rate limiting
3. **AuthRepository** - Database queries for users and sessions
4. **Frontend** - Login UI with responsive error handling

---

## 🏗️ Architecture & Flow

### Login Flow (Complete Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Submits Login Form (POST /api/auth/login)               │
│    - Email/username + password                                   │
│    - Rate limited: 15 attempts per 5 minutes                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. Rate Limiting Check (Fastify Route Config)                   │
│    - Key: IP + email combination                                 │
│    - Max: 15 attempts per 5 minutes                              │
│    - Prevents brute force attacks                                │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. AuthController.login()                                        │
│    - Extract credentials from request                            │
│    - Extract userAgent and IP address                            │
│    - Call AuthService.login()                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. AccountLockoutService.isAccountLocked()                       │
│    - Check Redis for lockout status                              │
│    - If locked: return 429 with lockout end time                 │
│    - If not locked: continue to authentication                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 5. Find User in Database                                         │
│    - If email contains '@': search by email                      │
│    - If no '@': search by username                               │
│    - Load user roles from user_roles table                       │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 6. Password Verification (bcrypt)                                │
│    - Compare provided password with hashed password              │
│    - Use AuthRepository.verifyPassword()                         │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 7. Account Status Check                                          │
│    - Verify user.isActive = true                                 │
│    - If inactive: return 403 ACCOUNT_DISABLED                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 8. Record Login Attempt (Success/Failure)                        │
│    - Via AccountLockoutService.recordAttempt()                   │
│    - Store in Redis + PostgreSQL login_attempts table            │
│    - Track: userId, email, username, IP, userAgent, success      │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 9. Load User Permissions from RBAC                               │
│    - Join: users → user_roles → role_permissions → permissions  │
│    - Aggregate all permissions from all roles                    │
│    - Format: ["resource:action", "users:read", "users:write"]   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 10. Generate JWT Access Token (15 minutes)                       │
│     - Payload: { id, email, role, roles[], permissions[] }      │
│     - Sign with JWT_SECRET                                       │
│     - Expiration: JWT_EXPIRES_IN (default: 15m)                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 11. Generate Refresh Token (7 days)                              │
│     - Random 32 bytes hex string (64 characters)                 │
│     - Stored in sessions table with expiration                   │
│     - Includes: userId, userAgent, ipAddress                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 12. Update User Last Login Timestamp                             │
│     - Update users.last_login_at = NOW()                         │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 13. Set Refresh Token in HttpOnly Cookie                         │
│     - Cookie: refreshToken (httpOnly, secure, sameSite)          │
│     - MaxAge: 7 days                                             │
│     - Path: /                                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 14. Return Response to Client                                    │
│     - { user, accessToken, refreshToken, expiresIn }            │
│     - Frontend stores accessToken in localStorage                │
│     - Frontend navigates to /dashboard                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── auth.routes.ts                          # Route definitions
│   │   └─ POST /auth/login → Lines 63-112
│   │      - Rate limiting: 15 attempts/5min
│   │      - Key: IP + email combination
│   │      - Handler: authController.login
│   │
│   ├── auth.controller.ts                      # HTTP request handler
│   │   └─ login() → Lines 52-88
│   │      - Extract credentials, userAgent, IP
│   │      - Call authService.login()
│   │      - Set refresh token in httpOnly cookie
│   │      - Return JSON response
│   │
│   ├── services/
│   │   ├── auth.service.ts                     # Core login logic
│   │   │   └─ login() → Lines 125-309
│   │   │      - Account lockout check
│   │   │      - Find user (email or username)
│   │   │      - Password verification
│   │   │      - Account status check
│   │   │      - Record login attempt
│   │   │      - Load permissions
│   │   │      - Generate JWT tokens
│   │   │      - Update last_login_at
│   │   │
│   │   ├── account-lockout.service.ts          # Brute force protection
│   │   │   ├─ isAccountLocked() → Lines 61-98
│   │   │   ├─ recordAttempt() → Lines 100-200
│   │   │   └─ unlockAccount() → Lines 240-260
│   │   │
│   │   └── auth.repository.ts                  # Database operations
│   │       ├─ findUserByEmail()
│   │       ├─ verifyPassword()
│   │       └─ createSession()
│   │
│   └── auth.types.ts                           # TypeScript interfaces
│       └─ LoginRequest → Lines 22-25
```

### Frontend Files

```
apps/web/src/app/
├── pages/auth/
│   └── login.page.ts                           # Login UI component
│       ├─ onSubmit() → Lines 398-428
│       │  - Validate form
│       │  - Call authService.login()
│       │  - Handle errors
│       │  - Remember me functionality
│       │
│       └─ fillDemoCredentials() → Lines 434-461
│          - Quick login for development
│
└── core/auth/services/
    └── auth.service.ts                         # Frontend auth service
        ├─ login() → Lines 131-150
        │  - POST /auth/login with credentials
        │  - Store tokens in state + localStorage
        │  - Navigate to /dashboard
        │
        └─ setAuthData() → Lines 263-292
           - Extract permissions from JWT
           - Update reactive state signals
```

---

## 🔍 Implementation Details

### 1. Route Configuration - Rate Limiting

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 63-112:**

```typescript
// POST /api/auth/login
typedFastify.route({
  method: 'POST',
  url: '/auth/login',
  config: {
    rateLimit: {
      // Balanced rate limiting for better UX while preventing brute force
      max: 15, // 15 login attempts
      timeWindow: '5 minutes', // per 5 minutes
      keyGenerator: (req) => {
        // Rate limit by IP + email combination to prevent brute force on specific users
        const email = (req.body as any)?.email || (req.body as any)?.username || 'unknown';
        return `${req.ip}:${email}`;
      },
      errorResponseBuilder: () => ({
        success: false,
        error: {
          code: 'TOO_MANY_LOGIN_ATTEMPTS',
          message: 'Too many login attempts. Please try again in a few minutes.',
          statusCode: 429,
        },
      }),
    },
  },
  schema: {
    tags: ['Authentication'],
    summary: 'Login with email and password',
    body: SchemaRefs.module('auth', 'loginRequest'),
    response: {
      200: SchemaRefs.module('auth', 'authResponse'),
      401: SchemaRefs.Unauthorized,
      429: SchemaRefs.RateLimitError, // Rate limit exceeded or account locked
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.login,
});
```

**Rate Limiting Strategy:**

- ✅ **15 attempts per 5 minutes** (generous for UX, strict enough for security)
- ✅ **Key: IP + email** (prevents targeted brute force on specific accounts)
- ✅ **Custom error message** for better user experience
- ✅ **429 status code** for rate limit exceeded

---

### 2. AuthController.login() - Request Handler

**File:** `apps/api/src/core/auth/auth.controller.ts`

**Lines 52-88:**

```typescript
async login(request: FastifyRequest, reply: FastifyReply) {
  const result = await request.server.authService.login(
    request.body as LoginRequest,
    request.headers['user-agent'],
    request.ip,
  );

  // Set refresh token in httpOnly cookie
  (reply as any).setCookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'test' ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return reply.send({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    message: 'Login successful',
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId: request.id,
      environment: ['development', 'staging', 'production'].includes(
        process.env.NODE_ENV || '',
      )
        ? (process.env.NODE_ENV as 'development' | 'staging' | 'production')
        : 'development',
    },
  });
}
```

**What it does:**

- ✅ Extracts credentials from request body
- ✅ Passes userAgent and IP to service layer
- ✅ Sets refresh token in **httpOnly cookie** (XSS protection)
- ✅ Returns access token in response body
- ✅ Includes user data and metadata

**Cookie Security:**

- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: true` - HTTPS only in production
- `sameSite: 'lax'` - CSRF protection
- `maxAge: 7 days` - Matches refresh token expiration

---

### 3. AuthService.login() - Core Login Logic

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**Lines 125-309:**

#### Step 1: Check Account Lockout (Lines 129-149)

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

**Lockout Policy:**

- 5 failed attempts within 15 minutes → Account locked
- Lock duration: 15 minutes
- Auto-unlock after duration expires
- All attempts tracked in Redis + PostgreSQL

#### Step 2: Find User by Email or Username (Lines 151-179)

```typescript
// Find user by email or username
let user;
if (email.includes('@')) {
  // It's an email
  user = await this.authRepository.findUserByEmail(email);
} else {
  // It's a username
  const userResult = await this.app
    .knex('users')
    .where('username', email)
    .whereNull('deleted_at') // Exclude deleted users
    .first();
  if (userResult) {
    const rolesResult = await this.app.knex('user_roles').join('roles', 'user_roles.role_id', 'roles.id').where('user_roles.user_id', userResult.id).select('roles.name');

    const roles = rolesResult.map((r: any) => r.name);

    user = {
      ...userResult,
      isActive: userResult.is_active,
      role: roles[0] || 'user', // Keep backward compatibility with 'role'
      roles: roles.length > 0 ? roles : ['user'], // New multi-role support
    };
  }
}
```

**Smart Login Identifier:**

- ✅ If contains `@` → Search by email
- ✅ If no `@` → Search by username
- ✅ Loads user roles from RBAC
- ✅ Excludes soft-deleted users

#### Step 3: User Not Found - Record Failed Attempt (Lines 181-196)

```typescript
if (!user || !user.password) {
  // Record failed attempt - user not found
  await this.lockoutService.recordAttempt(identifier, {
    email: email.includes('@') ? email : null,
    username: !email.includes('@') ? email : null,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'user_not_found',
  });

  const error = new Error('Invalid credentials');
  (error as any).statusCode = 401;
  (error as any).code = 'INVALID_CREDENTIALS';
  throw error;
}
```

**Security Practice:**

- ✅ Generic error message ("Invalid credentials") - doesn't reveal if user exists
- ✅ Records attempt with reason 'user_not_found'
- ✅ Contributes to lockout counter

#### Step 4: Password Verification (Lines 198-219)

```typescript
// Verify password
const isValid = await this.authRepository.verifyPassword(password, user.password);
if (!isValid) {
  // Record failed attempt - invalid password
  await this.lockoutService.recordAttempt(identifier, {
    userId: user.id,
    email: user.email,
    username: user.username,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'invalid_password',
  });

  const error = new Error('Invalid credentials');
  (error as any).statusCode = 401;
  (error as any).code = 'INVALID_CREDENTIALS';
  throw error;
}
```

**Password Verification:**

- Uses bcrypt.compare() in AuthRepository
- Records attempt with userId (since user exists)
- Same generic error message for security

#### Step 5: Check Account Active Status (Lines 221-238)

```typescript
// Check if user is active
if (!user.isActive) {
  // Record failed attempt - account disabled
  await this.lockoutService.recordAttempt(identifier, {
    userId: user.id,
    email: user.email,
    username: user.username,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    success: false,
    failureReason: 'account_disabled',
  });

  const error = new Error('Account is disabled');
  (error as any).statusCode = 403;
  (error as any).code = 'ACCOUNT_DISABLED';
  throw error;
}
```

**Account Status Check:**

- ✅ Returns 403 (Forbidden) not 401 (Unauthorized)
- ✅ Specific error message for disabled accounts
- ✅ Still records attempt for audit

#### Step 6: Record Successful Login Attempt (Lines 240-248)

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

**Success Tracking:**

- ✅ Resets failed attempt counter in Redis
- ✅ Logs successful login in database
- ✅ Includes full user context for audit

#### Step 7: Load User Permissions from RBAC (Lines 250-265)

```typescript
// Load user permissions
const permissionsResult = await this.app.knex('users as u').select(this.app.knex.raw("ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions")).join('user_roles as ur', 'u.id', 'ur.user_id').join('role_permissions as rp', 'ur.role_id', 'rp.role_id').join('permissions as p', 'rp.permission_id', 'p.id').where('u.id', user.id).groupBy('u.id').first();

const permissions = permissionsResult?.permissions || [];
```

**Permission Loading:**

- ✅ Aggregates permissions from **all user roles**
- ✅ Format: `["users:read", "users:write", "roles:manage"]`
- ✅ Includes in JWT token payload
- ✅ Used for frontend authorization

#### Step 8: Generate JWT Access Token (Lines 267-277)

```typescript
// Generate tokens
const accessToken = this.app.jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role || 'user', // Backward compatibility
    roles: user.roles || ['user'], // Multi-role support
    permissions,
  },
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
);
```

**JWT Token Contents:**

```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "role": "admin", // First role (backward compatibility)
  "roles": ["admin", "manager"], // All roles
  "permissions": ["users:read", "users:write", "roles:manage"],
  "iat": 1699000000,
  "exp": 1699000900
}
```

**Token Properties:**

- Expiration: 15 minutes (default)
- Signed with JWT_SECRET
- Contains user ID, email, roles, permissions
- Used for API authentication

#### Step 9: Generate Refresh Token (Lines 279-290)

```typescript
const refreshToken = randomBytes(32).toString('hex');
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

// Save refresh token
await this.authRepository.createSession({
  user_id: user.id,
  refresh_token: refreshToken,
  expires_at: expiresAt,
  user_agent: userAgent,
  ip_address: ipAddress,
});
```

**Refresh Token:**

- Length: 64 characters (32 bytes hex)
- Expiration: 7 days
- Stored in `sessions` table
- Includes userAgent and IP for security
- Can be revoked from database

#### Step 10: Update Last Login Timestamp (Lines 292-296)

```typescript
// Update last login timestamp
await this.app.knex('users').where('id', user.id).update({ last_login_at: new Date() });
```

#### Step 11: Return Response (Lines 298-308)

```typescript
// Remove password from response
const { password: _, ...userWithoutPassword } = user;

return {
  user: {
    ...userWithoutPassword,
    permissions, // Add permissions to user response
  },
  accessToken,
  refreshToken,
};
```

---

### 4. Account Lockout Service - Brute Force Protection

**File:** `apps/api/src/core/auth/services/account-lockout.service.ts`

**Configuration (Lines 41-43):**

```typescript
private readonly MAX_ATTEMPTS = 5;
private readonly LOCKOUT_DURATION_MINUTES = 15;
private readonly TRACKING_WINDOW_MINUTES = 15;
```

**Lockout Logic:**

1. **Track attempts in Redis** (fast, temporary)
2. **Store attempts in PostgreSQL** (persistent, audit)
3. **After 5 failed attempts in 15 minutes** → Lock account
4. **Lock duration: 15 minutes** (configurable)
5. **Auto-unlock** when duration expires

**Storage:**

- Redis keys:
  - `auth:lockout:{identifier}` - Lockout status
  - `auth:attempts:{identifier}` - Attempt counter
- PostgreSQL table: `login_attempts`

---

### 5. Frontend Login Implementation

**File:** `apps/web/src/app/pages/auth/login.page.ts`

**Lines 398-428:**

```typescript
protected onSubmit(): void {
  if (this.loginForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');

  const { email, password, rememberMe } = this.loginForm.value;

  // Handle remember me
  if (rememberMe) {
    localStorage.setItem('rememberedEmail', email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }

  this.authService.login({ email, password }).subscribe({
    next: () => {
      this.isLoading.set(false);
      // Navigation is handled by AuthService
    },
    error: (error) => {
      this.isLoading.set(false);
      this.errorMessage.set(
        error.message || 'Login failed. Please try again.',
      );
    },
  });
}
```

**Frontend Features:**

- ✅ Form validation before submission
- ✅ Loading spinner during login
- ✅ Remember me functionality
- ✅ Error message display
- ✅ Auto-navigation to dashboard on success

---

### 6. Frontend AuthService

**File:** `apps/web/src/app/core/auth/services/auth.service.ts`

**Lines 131-150:**

```typescript
login(credentials: LoginRequest): Observable<AuthResponse> {
  this._isLoading.set(true);
  return this.http
    .post<AuthResponse>('/auth/login', credentials, {
      withCredentials: true, // Include cookies for refresh token
    })
    .pipe(
      tap((response) => {
        this._isLoading.set(false);
        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return this.handleAuthError(error);
      }),
    );
}
```

**State Management:**

- Uses Angular Signals for reactive state
- Stores access token in localStorage
- Stores refresh token in httpOnly cookie (backend sets)
- Updates user state and permissions
- Auto-navigates to /dashboard on success

---

## 🛠️ Troubleshooting Guide

### Problem 1: Invalid Credentials Error

**Symptoms:**

- Login fails with "Invalid credentials"
- No specific error about email or password

**Possible Causes:**

1. **Wrong email or password** (most common)
2. **User doesn't exist**
3. **Account soft-deleted** (deleted_at is not null)

**Check:**

```bash
# Verify user exists
psql aegisx_db -c "SELECT email, username, is_active, deleted_at FROM users WHERE email='user@example.com';"

# Check password hash exists
psql aegisx_db -c "SELECT email, LENGTH(password) as password_length FROM users WHERE email='user@example.com';"
```

**Solution:**

- Verify credentials are correct
- Check user is not soft-deleted
- Reset password if needed

---

### Problem 2: Account Locked Error

**Symptoms:**

- Login fails with "Account is locked"
- Error includes lockout end time

**Cause:**

- Too many failed login attempts (5 in 15 minutes)

**Check:**

```bash
# Check lockout status in Redis
redis-cli
> GET auth:lockout:user@example.com
> GET auth:attempts:user@example.com
```

**Solution 1: Wait for Auto-Unlock (15 minutes)**

```bash
# Lockout expires automatically after 15 minutes
```

**Solution 2: Manual Unlock (Admin)**

```bash
curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com"}'
```

**Solution 3: Clear Redis (Development Only)**

```bash
redis-cli
> DEL auth:lockout:user@example.com
> DEL auth:attempts:user@example.com
```

---

### Problem 3: Account Disabled Error

**Symptoms:**

- Login fails with "Account is disabled"
- Status code: 403 (Forbidden)

**Cause:**

- User's `is_active` field is set to `false`

**Check:**

```bash
psql aegisx_db -c "SELECT email, is_active FROM users WHERE email='user@example.com';"
```

**Solution:**

```sql
-- Re-activate account
UPDATE users SET is_active = true WHERE email = 'user@example.com';
```

---

### Problem 4: Too Many Login Attempts (Rate Limit)

**Symptoms:**

- Error: "Too many login attempts. Please try again in a few minutes."
- Status code: 429

**Cause:**

- Fastify rate limiter: 15 attempts per 5 minutes per IP+email combination

**Check:**

```bash
# Wait 5 minutes for rate limit to reset
# Or try different IP/email combination
```

**Solution:**

- Wait 5 minutes
- Check if making requests from correct endpoint
- Verify not in infinite loop

---

### Problem 5: Token Not Stored / Auto-Logout

**Symptoms:**

- Login successful but immediately logged out
- Access token not in localStorage
- Page refresh loses authentication

**Possible Causes:**

1. **localStorage blocked** (private browsing)
2. **Cookie not set** (refresh token)
3. **CORS issue** (withCredentials not working)

**Check:**

```javascript
// In browser console
console.log(localStorage.getItem('accessToken'));
console.log(document.cookie);
```

**Solution:**

```typescript
// Verify withCredentials in HTTP call
this.http.post('/auth/login', credentials, {
  withCredentials: true, // Required for cookies
});
```

---

### Problem 6: Permissions Not Loading

**Symptoms:**

- User logged in but can't access protected routes
- Permissions array is empty
- Authorization checks fail

**Possible Causes:**

1. **User has no roles assigned**
2. **Roles have no permissions**
3. **JWT token missing permissions**

**Check Database:**

```sql
-- Check user roles
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'user@example.com';

-- Check role permissions
SELECT r.name as role, p.resource, p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'user';
```

**Check JWT Token:**

```javascript
// In browser console - decode JWT
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Permissions:', payload.permissions);
```

**Solution:**

```sql
-- Assign role to user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'user@example.com' AND r.name = 'user';

-- Assign permissions to role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'user' AND p.resource = 'users' AND p.action = 'read';
```

---

## 🔒 Security Considerations

### 1. Password Security

**Hashing:**

- ✅ Uses bcrypt (industry standard)
- ✅ Automatic salt generation
- ✅ Configurable work factor

**Verification:**

- ✅ Constant-time comparison (bcrypt.compare)
- ✅ No timing attacks possible

### 2. Account Lockout Protection

**Features:**

- ✅ 5 failed attempts → 15 minute lockout
- ✅ Redis + PostgreSQL dual storage
- ✅ Auto-unlock after duration
- ✅ Tracks IP, userAgent, timestamp

**Why This Matters:**

- Prevents brute force attacks
- Protects against credential stuffing
- Alerts admins to suspicious activity

### 3. Rate Limiting

**Two Layers:**

1. **Fastify Route Level:** 15 attempts per 5 minutes (per IP+email)
2. **Account Level:** 5 attempts per 15 minutes (account lockout)

**Benefits:**

- Prevents distributed brute force
- Allows legitimate users with typos
- Balances security and UX

### 4. Token Security

**Access Token (JWT):**

- ✅ Short expiration (15 minutes)
- ✅ Signed with secret key
- ✅ Contains minimal user data
- ✅ Stored in localStorage (acceptable for short-lived tokens)

**Refresh Token:**

- ✅ Long expiration (7 days)
- ✅ Stored in httpOnly cookie (XSS protection)
- ✅ Revocable from database
- ✅ Tracks device and IP

**Cookie Security:**

```typescript
{
  httpOnly: true,    // ✅ No JavaScript access
  secure: true,      // ✅ HTTPS only (production)
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/',         // ✅ Available to all routes
  maxAge: 7 days     // ✅ Matches token expiration
}
```

### 5. Error Message Security

**Generic Messages:**

- ✅ "Invalid credentials" (doesn't reveal if user exists)
- ✅ Same response time for email/password errors
- ✅ No enumeration attacks possible

**Specific Messages (Safe):**

- ✅ "Account is locked" (user already authenticated)
- ✅ "Account is disabled" (user exists, admin action)

### 6. Audit Logging

**What's Logged:**

- ✅ Every login attempt (success + failure)
- ✅ User ID, email, username
- ✅ IP address, user agent
- ✅ Timestamp
- ✅ Failure reason (user_not_found, invalid_password, account_locked, account_disabled)

**Storage:**

- Redis: Fast, temporary (15 minutes)
- PostgreSQL: Persistent, for audit and analytics

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Start API and Web servers
pnpm run dev:api
pnpm run dev:web

# 2. Test successful login
# Go to http://localhost:4200/login
# Enter valid credentials
# Verify redirect to /dashboard
# Check localStorage for accessToken
# Check cookies for refreshToken

# 3. Test invalid password
# Enter correct email, wrong password
# Should see "Invalid credentials" error
# Check login_attempts table for failed attempt

# 4. Test user not found
# Enter non-existent email
# Should see "Invalid credentials" error
# No user_id in login_attempts record

# 5. Test account lockout
# Make 5 failed login attempts
# 6th attempt should show "Account is locked"
# Wait 15 minutes or use unlock endpoint

# 6. Test rate limiting
# Make 15 login attempts quickly
# Should see rate limit error on 16th attempt

# 7. Test remember me
# Check "Remember me" box
# Logout and return to login page
# Email should be pre-filled

# 8. Test demo credentials (development)
# Click "Admin Account" button
# Form should auto-fill with admin credentials
# Submit and verify login works

# 9. Test permissions in JWT
# Login successfully
# Decode access token in browser console
# Verify permissions array is populated

# 10. Test last_login_at update
psql aegisx_db -c "SELECT email, last_login_at FROM users WHERE email='test@example.com';"
# Timestamp should update after each login
```

---

### Automated Testing

**Test File:** `apps/api/src/core/auth/auth.routes.spec.ts`

```typescript
describe('POST /auth/login', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@aegisx.local',
        password: 'Admin123!',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().data.accessToken).toBeDefined();
    expect(response.json().data.user.email).toBe('admin@aegisx.local');
  });

  it('should fail with invalid password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@aegisx.local',
        password: 'WrongPassword',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should lock account after 5 failed attempts', async () => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'WrongPassword',
        },
      });
    }

    // 6th attempt should be locked
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'CorrectPassword',
      },
    });

    expect(response.statusCode).toBe(429);
    expect(response.json().error.code).toBe('ACCOUNT_LOCKED');
  });
});
```

---

## 📊 Database Schema

### users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

### sessions Table (Refresh Tokens)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### login_attempts Table (Audit Log)

```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  username VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  user_agent VARCHAR(500),
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);
```

### RBAC Tables

```sql
-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);
```

---

## 🎯 Environment Variables Reference

### Required for Login

| Variable         | Example            | Description                       |
| ---------------- | ------------------ | --------------------------------- |
| `JWT_SECRET`     | `your-secret-key`  | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `15m`              | Access token expiration time      |
| `DATABASE_URL`   | `postgresql://...` | PostgreSQL connection string      |
| `REDIS_HOST`     | `localhost`        | Redis host for lockout tracking   |
| `REDIS_PORT`     | `6379`             | Redis port                        |

### Optional

| Variable   | Example      | Default       | Description      |
| ---------- | ------------ | ------------- | ---------------- |
| `NODE_ENV` | `production` | `development` | Environment mode |
| `API_PORT` | `3333`       | `3333`        | API server port  |

---

## 💡 Quick Fixes

### Fix 1: Reset Account Lockout

**Problem:** Account locked during testing

**Solution:**

```bash
# Clear Redis lockout
redis-cli
> DEL auth:lockout:user@example.com
> DEL auth:attempts:user@example.com

# Or use unlock API
curl -X POST http://localhost:3333/api/auth/unlock-account \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com"}'
```

---

### Fix 2: Debug Login Attempts

**Problem:** Want to see login attempt history

**Solution:**

```sql
-- View recent login attempts
SELECT
  email,
  username,
  ip_address,
  success,
  failure_reason,
  created_at
FROM login_attempts
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 10;

-- Count failed attempts
SELECT COUNT(*) as failed_attempts
FROM login_attempts
WHERE email = 'user@example.com'
  AND success = false
  AND created_at > NOW() - INTERVAL '15 minutes';
```

---

### Fix 3: Verify JWT Token Contents

**Problem:** Want to see what's in JWT token

**Solution:**

```javascript
// In browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);
console.log('User ID:', payload.id);
console.log('Email:', payload.email);
console.log('Roles:', payload.roles);
console.log('Permissions:', payload.permissions);
console.log('Expires:', new Date(payload.exp * 1000));
```

---

### Fix 4: Test Login Flow Manually

**Problem:** Want to test API directly without frontend

**Solution:**

```bash
# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@aegisx.local",
    "password": "Admin123!"
  }'

# Save access token from response
ACCESS_TOKEN="<token-from-response>"

# Test authenticated endpoint
curl -X GET http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test refresh token
curl -X POST http://localhost:3333/api/auth/refresh \
  -b cookies.txt
```

---

## 📚 Related Documentation

- **[Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md)** - Email verification flow
- **[Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md)** - Password reset flow
- **[RBAC Implementation](../../rbac/IMPLEMENTATION.md)** - Role-based access control
- **[Authentication Flow](../README.md)** - Complete auth system overview
- **[Account Lockout Guide](../guides/ACCOUNT_LOCKOUT.md)** - Brute force protection details

---

## ❓ FAQ

**Q: Can users login with username instead of email?**
A: Yes! The system automatically detects if the input contains '@'. If yes, it searches by email. If no, it searches by username.

**Q: How long is the access token valid?**
A: 15 minutes by default. Configurable via `JWT_EXPIRES_IN` environment variable.

**Q: How long is the refresh token valid?**
A: 7 days. Stored in httpOnly cookie and database.

**Q: What happens after 5 failed login attempts?**
A: Account is locked for 15 minutes. Can be unlocked manually by admin or auto-unlocks after duration.

**Q: Are login attempts logged?**
A: Yes, every attempt (success and failure) is logged with user ID, email, username, IP, userAgent, timestamp, and failure reason.

**Q: Can I see permissions in the JWT token?**
A: Yes, decode the access token in browser console. Permissions are in the `permissions` array.

**Q: What's the difference between rate limiting and account lockout?**
A: Rate limiting (15/5min) is per IP+email at the route level. Account lockout (5/15min) is per account and stored in Redis/PostgreSQL.

**Q: Can users login while email is unverified?**
A: Yes, the system allows login but you can implement checks in your application to require email verification for certain features.

**Q: How do I test login with demo credentials?**
A: In development mode, the login page shows quick-login buttons for admin, manager, and demo accounts.

**Q: What if I forget my password?**
A: Use the "Forgot password?" link on the login page. See [Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md).

**Q: Can I revoke a refresh token?**
A: Yes, delete the token from the `sessions` table or call the logout endpoint.

**Q: Why is refresh token in httpOnly cookie instead of localStorage?**
A: HttpOnly cookies cannot be accessed by JavaScript, providing protection against XSS attacks.

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
