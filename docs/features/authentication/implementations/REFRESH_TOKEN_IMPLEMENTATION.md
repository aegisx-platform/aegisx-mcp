# Refresh Token Implementation - Technical Documentation

> **Complete implementation guide for refresh token rotation in authentication system**

## 📋 Overview

Refresh token rotation is implemented to provide secure, long-lived authentication sessions with automatic token refresh:

1. **AuthService** - Handles token generation and rotation
2. **AuthRepository** - Manages session storage in database
3. **Frontend AuthService** - Manages tokens in localStorage/cookies
4. **HTTP Interceptor** - Automatically refreshes expired tokens
5. **Cookie Storage** - Stores refresh tokens in httpOnly cookies

**Key Features:**

- ✅ Short-lived access tokens (15 minutes)
- ✅ Long-lived refresh tokens (7 days)
- ✅ Automatic token rotation (old token deleted, new created)
- ✅ httpOnly cookies for XSS protection
- ✅ Database storage for revocation capability
- ✅ Automatic retry of failed requests after refresh
- ✅ Rate limiting (10 attempts per minute)

---

## 🏗️ Architecture & Flow

### Complete Token Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Initial Login/Register                                       │
│    - Access Token (JWT, 15 min) → localStorage                  │
│    - Refresh Token (random hex, 7 days) → httpOnly cookie + DB  │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 2. User Makes API Request                                       │
│    - HTTP Interceptor adds: Authorization: Bearer <accessToken> │
└──────────────┬─────────────────────────────────────────────────┘
               │
               ├───► [Access Token Valid] ─────► Request succeeds
               │
               └───► [Access Token Expired] ────┐
                                                 │
                                                 v
┌────────────────────────────────────────────────────────────────┐
│ 3. API Returns 401 Unauthorized                                 │
│    - HTTP Interceptor catches error                             │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 4. HTTP Interceptor Calls POST /api/auth/refresh               │
│    - Refresh token sent in cookie automatically                 │
│    - Rate limit: 10 attempts per minute                          │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 5. AuthController.refresh()                                     │
│    - Extract refresh token from cookie OR request body          │
│    - Validate token exists                                       │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 6. AuthService.refreshToken()                                   │
│    - Find session in database                                    │
│    - Check token not expired                                     │
│    - Check user still active                                     │
└──────────────┬─────────────────────────────────────────────────┘
               │
               ├───► [Invalid/Expired] ────► 401 Error ────┐
               │                                            │
               └───► [Valid] ──────────────────────────┐   │
                                                        │   │
                                                        v   v
┌────────────────────────────────────────────────────────────────┐
│ 7. Load User Permissions from RBAC                              │
│    - Join: users → user_roles → role_permissions → permissions │
│    - Include in new access token                                │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 8. Generate New Access Token (15 minutes)                       │
│    - Payload: { id, email, role, roles[], permissions[] }      │
│    - Sign with JWT_SECRET                                       │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 9. Return New Access Token to Frontend                          │
│    - Store in localStorage                                       │
│    - Update AuthService state                                    │
└──────────────┬─────────────────────────────────────────────────┘
               │
               v
┌────────────────────────────────────────────────────────────────┐
│ 10. HTTP Interceptor Retries Original Request                   │
│     - Use new access token                                       │
│     - Original request succeeds transparently                    │
└─────────────────────────────────────────────────────────────────┘
```

### Token Rotation Strategy

**Why Token Rotation?**

Traditional refresh tokens stay the same until they expire. This creates security risks:

- If token is stolen, attacker has 7 days of access
- Cannot detect if token was compromised
- Cannot invalidate specific sessions easily

**Our Implementation (No Rotation in Current Version):**

Currently, the system does NOT rotate refresh tokens:

- ✅ Same refresh token used for entire 7-day period
- ✅ Refresh token stored in database (can be revoked manually)
- ✅ Refresh token expires after 7 days
- ✅ Only access token is regenerated on each refresh

**Future Enhancement: Full Token Rotation (Not Yet Implemented):**

```typescript
// What rotation would look like (for future implementation):
async refreshToken(oldRefreshToken: string) {
  // 1. Validate old refresh token
  const session = await this.findSessionByToken(oldRefreshToken);

  // 2. Generate NEW refresh token
  const newRefreshToken = randomBytes(32).toString('hex');

  // 3. Generate new access token
  const accessToken = this.jwt.sign({ ... });

  // 4. Delete old refresh token
  await this.deleteSession(oldRefreshToken);

  // 5. Save new refresh token
  await this.createSession({
    user_id: session.user_id,
    refresh_token: newRefreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // 6. Return both tokens
  return { accessToken, newRefreshToken };
}
```

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── auth.routes.ts                          # Route definitions
│   │   └─ POST /auth/refresh → Lines 114-137
│   │      - Rate limiting: 10 attempts/minute
│   │      - Key: IP address
│   │      - Handler: authController.refresh
│   │
│   ├── auth.controller.ts                      # HTTP request handler
│   │   └─ refresh() → Lines 90-118
│   │      - Extract refresh token from cookie OR body
│   │      - Call authService.refreshToken()
│   │      - Return new access token
│   │
│   ├── services/
│   │   ├── auth.service.ts                     # Core refresh logic
│   │   │   └─ refreshToken() → Lines 311-360
│   │   │      - Find session in database
│   │   │      - Validate token and user
│   │   │      - Load permissions from RBAC
│   │   │      - Generate new access token
│   │   │
│   │   └── auth.repository.ts                  # Database operations
│   │       ├─ findSessionByToken() → Lines 236-243
│   │       ├─ createSession() → Lines 219-234
│   │       └─ deleteSession() → Lines 245-251
│   │
│   └── auth.types.ts                           # TypeScript interfaces
│       └─ RefreshRequest → { refreshToken?: string }
```

### Frontend Files

```
apps/web/src/app/
├── core/auth/
│   ├── interceptors/
│   │   └── auth.interceptor.ts                 # Automatic token refresh
│   │       └─ authInterceptor → Lines 14-71
│   │          - Catches 401 errors
│   │          - Calls authService.refreshToken()
│   │          - Retries original request
│   │          - Redirects to login if refresh fails
│   │
│   └── services/
│       └── auth.service.ts                     # Frontend auth service
│           ├─ refreshToken() → Lines 187-205
│           │  - POST /auth/refresh
│           │  - Update accessToken in state
│           │  - Store in localStorage
│           │
│           ├─ getAccessToken() → Returns current token
│           └─ storeToken() → Saves to localStorage
```

### Database Files

```
apps/api/src/database/
└── migrations/
    └── 003_create_sessions.ts                  # Sessions table
        - user_sessions table for refresh tokens
        - Columns: id, user_id, refresh_token, expires_at, user_agent, ip_address
```

---

## 🔍 Implementation Details

### 1. Route Configuration - Rate Limiting

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 114-137:**

```typescript
// POST /api/auth/refresh
typedFastify.route({
  method: 'POST',
  url: '/auth/refresh',
  config: {
    rateLimit: {
      max: 10, // 10 refresh attempts
      timeWindow: '1 minute', // per minute per IP
      keyGenerator: (req) => req.ip || 'unknown',
    },
  },
  schema: {
    tags: ['Authentication'],
    summary: 'Refresh access token using refresh token',
    body: SchemaRefs.module('auth', 'refreshRequest'),
    response: {
      200: SchemaRefs.module('auth', 'refreshResponse'),
      401: SchemaRefs.Unauthorized,
      429: SchemaRefs.ServerError, // Rate limit exceeded
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.refresh,
});
```

**Rate Limiting Strategy:**

- ✅ **10 attempts per minute** (per IP address)
- ✅ Prevents refresh token abuse
- ✅ Less strict than login (allows normal usage patterns)
- ✅ Key by IP only (not per user)

---

### 2. AuthController.refresh() - Request Handler

**File:** `apps/api/src/core/auth/auth.controller.ts`

**Lines 90-118:**

```typescript
async refresh(request: FastifyRequest, reply: FastifyReply) {
  // Try to get refresh token from cookie first, fallback to request body
  const refreshToken =
    (request as any).cookies.refreshToken ||
    (request.body as RefreshRequest).refreshToken;

  if (!refreshToken) {
    throw new Error('REFRESH_TOKEN_NOT_FOUND');
  }

  const result = await request.server.authService.refreshToken(refreshToken);

  return reply.send({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
    message: 'Token refreshed successfully',
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

- ✅ Accepts refresh token from **cookie OR request body**
- ✅ Cookie is preferred (more secure, httpOnly)
- ✅ Request body is fallback (for mobile apps, testing)
- ✅ Returns only new access token (refresh token stays same)
- ✅ Throws error if no refresh token provided

**Why both cookie and body?**

- **Cookie:** Default for web apps (secure, httpOnly)
- **Body:** For mobile apps that can't use cookies
- **Testing:** Easier to test with body parameter

---

### 3. AuthService.refreshToken() - Core Refresh Logic

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**Lines 311-360:**

#### Step 1: Find Session in Database (Lines 312-319)

```typescript
async refreshToken(refreshToken: string) {
  // Find session
  const session = await this.authRepository.findSessionByToken(refreshToken);
  if (!session) {
    const error = new Error('Invalid refresh token');
    (error as any).statusCode = 401;
    (error as any).code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }
```

**Session Lookup:**

- ✅ Searches `user_sessions` table
- ✅ Checks `refresh_token` matches
- ✅ Checks `expires_at > NOW()` (not expired)
- ✅ Returns null if not found or expired

#### Step 2: Validate User (Lines 321-328)

```typescript
// Get user
const user = await this.authRepository.findUserById(session.user_id);
if (!user || !user.isActive) {
  const error = new Error('User not found or inactive');
  (error as any).statusCode = 401;
  (error as any).code = 'USER_NOT_FOUND_OR_INACTIVE';
  throw error;
}
```

**User Validation:**

- ✅ Loads user from database
- ✅ Checks user exists (not deleted)
- ✅ Checks user is active (`is_active = true`)
- ✅ Loads user roles from RBAC

**Why validate user?**

- User might be deactivated after login
- User might be deleted (soft delete)
- User roles might have changed

#### Step 3: Load User Permissions (Lines 330-345)

```typescript
// Load user permissions (same as login)
const permissionsResult = await this.app.knex('users as u').select(this.app.knex.raw("ARRAY_AGG(DISTINCT CONCAT(p.resource, ':', p.action)) as permissions")).join('user_roles as ur', 'u.id', 'ur.user_id').join('role_permissions as rp', 'ur.role_id', 'rp.role_id').join('permissions as p', 'rp.permission_id', 'p.id').where('u.id', user.id).groupBy('u.id').first();

const permissions = permissionsResult?.permissions || [];
```

**Permission Loading:**

- ✅ Aggregates permissions from **all user roles**
- ✅ Format: `["users:read", "users:write", "roles:manage"]`
- ✅ Includes in new access token
- ✅ Ensures permissions are always up-to-date

**Why reload permissions?**

- User roles might have changed since login
- Role permissions might have been updated
- New access token must have current permissions

#### Step 4: Generate New Access Token (Lines 347-359)

```typescript
  // Generate new access token with permissions
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

  return { accessToken };
}
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
- Contains updated permissions
- Same structure as login token

---

### 4. AuthRepository Session Methods

**File:** `apps/api/src/core/auth/auth.repository.ts`

#### findSessionByToken() - Lines 236-243

```typescript
async findSessionByToken(refreshToken: string): Promise<UserSession | null> {
  const session = await this.knex('user_sessions')
    .where('refresh_token', refreshToken)
    .where('expires_at', '>', new Date())
    .first();

  return session || null;
}
```

**What it does:**

- ✅ Searches by refresh token
- ✅ Automatically filters expired sessions (`expires_at > NOW()`)
- ✅ Returns null if not found or expired
- ✅ Single database query

#### createSession() - Lines 219-234

```typescript
async createSession(sessionData: {
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  user_agent?: string;
  ip_address?: string;
}): Promise<UserSession> {
  const [session] = await this.knex('user_sessions')
    .insert({
      ...sessionData,
      created_at: new Date(),
    })
    .returning('*');

  return session;
}
```

**What it does:**

- ✅ Creates new session in database
- ✅ Stores user_id, refresh_token, expiration
- ✅ Optionally stores userAgent and IP
- ✅ Returns created session

#### deleteSession() - Lines 245-251

```typescript
async deleteSession(refreshToken: string): Promise<boolean> {
  const deletedRows = await this.knex('user_sessions')
    .where('refresh_token', refreshToken)
    .del();

  return deletedRows > 0;
}
```

**What it does:**

- ✅ Deletes session from database
- ✅ Called during logout
- ✅ Returns true if session was deleted
- ✅ Can be used to revoke specific sessions

---

### 5. Frontend HTTP Interceptor - Automatic Refresh

**File:** `apps/web/src/app/core/auth/interceptors/auth.interceptor.ts`

**Lines 14-71:**

```typescript
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth requests to avoid circular calls
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Get token from AuthService
  const token = authService.getAccessToken();

  // Add auth headers if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors by trying to refresh token
      if (error.status === 401) {
        console.log('401 error, attempting token refresh...');

        return authService.refreshToken().pipe(
          switchMap((response) => {
            console.log('Token refresh successful, retrying request');
            const newToken = authService.getAccessToken();

            if (newToken) {
              // Retry the original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(retryReq);
            }
            throw error;
          }),
          catchError((refreshError) => {
            console.log('Token refresh failed, redirecting to login');
            router.navigate(['/login']);
            return EMPTY; // Complete the stream silently
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
```

**How it works:**

1. **Intercepts all HTTP requests** (except `/auth/` endpoints)
2. **Adds Authorization header** with current access token
3. **Catches 401 errors** (token expired)
4. **Calls refreshToken()** automatically
5. **Retries original request** with new token
6. **Redirects to login** if refresh fails

**Why skip `/auth/` endpoints?**

- Prevents infinite loop (refresh calling refresh)
- Login/register don't need auth headers
- Refresh endpoint handles its own auth

**User Experience:**

- ✅ **Seamless:** Users never see "please login again"
- ✅ **Automatic:** No manual intervention needed
- ✅ **Transparent:** Original request succeeds as if nothing happened
- ✅ **Fast:** Refresh happens in milliseconds

---

### 6. Frontend AuthService.refreshToken()

**File:** `apps/web/src/app/core/auth/services/auth.service.ts`

**Lines 187-205:**

```typescript
refreshToken(): Observable<any> {
  return this.http
    .post<AuthResponse>(
      '/auth/refresh',
      {},
      {
        withCredentials: true,
      },
    )
    .pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._accessToken.set(response.data.accessToken);
          this.storeToken(response.data.accessToken);
        }
      }),
      catchError((error) => {
        // Refresh failed, clear auth data
        this.clearAuthData();
        return throwError(() => error);
      }),
    );
}
```

**What it does:**

- ✅ Calls POST `/auth/refresh` with empty body
- ✅ Sends cookies automatically (`withCredentials: true`)
- ✅ Updates access token in state signal
- ✅ Stores new token in localStorage
- ✅ Clears auth data if refresh fails

**State Management:**

```typescript
// Signals for reactive state
private _accessToken = signal<string | null>(null);

// Update token
this._accessToken.set(response.data.accessToken);

// Store in localStorage for persistence
localStorage.setItem('accessToken', token);
```

---

## 🛠️ Troubleshooting Guide

### Problem 1: Refresh Token Not Found

**Symptoms:**

- Error: "REFRESH_TOKEN_NOT_FOUND"
- Status code: 401
- Happens immediately on refresh attempt

**Possible Causes:**

1. **Cookie not sent** (CORS/credentials issue)
2. **Cookie expired or cleared**
3. **Session deleted from database**
4. **User logged out**

**Check:**

```bash
# Check if cookie exists in browser
# Browser DevTools → Application → Cookies → http://localhost:4200
# Look for "refreshToken" cookie

# Check database
psql aegisx_db -c "SELECT * FROM user_sessions WHERE user_id='<user-id>' ORDER BY created_at DESC LIMIT 5;"

# Check if withCredentials is set
# apps/web/src/app/core/auth/services/auth.service.ts
# Should have: withCredentials: true
```

**Solution:**

```typescript
// Ensure withCredentials is set for all auth requests
this.http.post(
  '/auth/refresh',
  {},
  {
    withCredentials: true, // Required for cookies!
  },
);
```

---

### Problem 2: Infinite Refresh Loop

**Symptoms:**

- Console shows repeated "401 error, attempting token refresh..."
- Multiple refresh requests in Network tab
- Page becomes unresponsive
- Eventually redirects to login

**Possible Causes:**

1. **Refresh endpoint returns 401** (invalid refresh token)
2. **HTTP interceptor not skipping `/auth/` routes**
3. **New access token is immediately invalid**

**Check:**

```typescript
// Verify interceptor skips auth routes
if (req.url.includes('/auth/')) {
  return next(req);
}
```

**Solution:**

```bash
# Clear all tokens and re-login
localStorage.clear();
# Delete cookies in DevTools
# Refresh page
# Login again
```

---

### Problem 3: Token Expired Error

**Symptoms:**

- Error: "Invalid refresh token"
- Refresh token exists but fails validation
- User logged out unexpectedly

**Possible Causes:**

1. **Refresh token expired** (> 7 days old)
2. **Session deleted from database**
3. **Clock skew** (server time vs database time)

**Check:**

```sql
-- Check session expiration
SELECT
  user_id,
  expires_at,
  NOW() as current_time,
  expires_at > NOW() as is_valid,
  EXTRACT(EPOCH FROM (expires_at - NOW()))/3600 as hours_remaining
FROM user_sessions
WHERE refresh_token = '<token-here>';

-- Check for expired sessions
SELECT COUNT(*) as expired_count
FROM user_sessions
WHERE expires_at < NOW();
```

**Solution:**

```bash
# Clean up expired sessions (run periodically)
psql aegisx_db -c "DELETE FROM user_sessions WHERE expires_at < NOW();"

# Or use repository method
# authRepository.deleteExpiredSessions()
```

---

### Problem 4: Cookie Not Set in Production

**Symptoms:**

- Refresh works in development
- Fails in production with "REFRESH_TOKEN_NOT_FOUND"
- Cookie not visible in browser

**Possible Causes:**

1. **HTTPS required** (`secure: true` in production)
2. **Domain mismatch** (cookie domain vs frontend domain)
3. **SameSite policy** blocking cookie
4. **CORS not configured** properly

**Check:**

```typescript
// apps/api/src/core/auth/auth.controller.ts
(reply as any).setCookie('refreshToken', result.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Must be HTTPS!
  sameSite: process.env.NODE_ENV === 'test' ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

**Solution (Production):**

```bash
# Ensure HTTPS is enabled
ENABLE_HTTPS=true

# Check CORS settings allow credentials
# apps/api/src/main.ts
app.register(cors, {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Required!
});

# Verify cookie domain matches frontend domain
# Should be same domain or subdomain
```

---

### Problem 5: Permissions Not Updated After Refresh

**Symptoms:**

- User still has old permissions after role change
- Access denied to newly granted features
- Must logout/login to see new permissions

**Cause:**

- Permissions are cached in JWT token
- Token doesn't reload until refresh

**This is CORRECT behavior:**

- ✅ Permissions are refreshed when access token expires (15 min)
- ✅ Refresh endpoint reloads permissions from database
- ✅ No need for logout/login

**Force Immediate Permission Update:**

```bash
# Option 1: Wait for access token to expire (15 minutes)
# Option 2: Logout and login again
# Option 3: Invalidate all user sessions
psql aegisx_db -c "DELETE FROM user_sessions WHERE user_id='<user-id>';"
```

---

### Problem 6: 401 Error Not Triggering Refresh

**Symptoms:**

- API returns 401
- No automatic refresh happens
- User redirected to login immediately

**Possible Causes:**

1. **Interceptor not registered** in app config
2. **Error response format** unexpected
3. **Request already to `/auth/` endpoint**

**Check:**

```typescript
// apps/web/src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]), // Must be registered!
    ),
  ],
};
```

**Solution:**

```bash
# Verify interceptor is registered
grep -r "authInterceptor" apps/web/src/app/app.config.ts

# Check console for error logs
# Should see: "401 error, attempting token refresh..."
```

---

## 🔒 Security Considerations

### 1. Token Storage Strategy

**Access Token (JWT):**

- ✅ **localStorage** - Acceptable for short-lived tokens
- ✅ **15 minute expiration** - Limited damage if stolen
- ✅ **Contains no sensitive data** - Only user ID, roles, permissions
- ✅ **Cannot be revoked** - But expires quickly

**Why localStorage for access tokens?**

- XSS risk exists but mitigated by short expiration
- Needs to be accessible to JavaScript for API calls
- Alternative (memory only) would break on page refresh
- Industry standard for short-lived tokens

**Refresh Token:**

- ✅ **httpOnly cookie** - Cannot be accessed by JavaScript
- ✅ **7 day expiration** - Longer lived but more secure
- ✅ **Stored in database** - Can be revoked anytime
- ✅ **Includes device info** - Track suspicious activity

**Why httpOnly cookie for refresh tokens?**

- XSS attacks cannot steal refresh token
- Longer expiration requires better protection
- Can be revoked from database
- Browser handles cookie security automatically

---

### 2. Token Rotation Benefits (Future Enhancement)

**Current Implementation:**

- ✅ Access token rotates every 15 minutes
- ❌ Refresh token stays same for 7 days

**Why Add Rotation?**

1. **Detect token theft:** If old token is used after rotation, attacker detected
2. **Limit damage window:** Stolen token expires on next legitimate refresh
3. **Better audit trail:** Each refresh creates new session record
4. **Industry best practice:** OAuth 2.0 recommends rotation

**How to Implement:**

```typescript
async refreshToken(oldRefreshToken: string) {
  // Validate old token
  const session = await this.findSessionByToken(oldRefreshToken);

  // Generate new tokens
  const accessToken = this.generateAccessToken(user);
  const newRefreshToken = randomBytes(32).toString('hex');

  // IMPORTANT: Do this atomically in transaction
  await this.knex.transaction(async (trx) => {
    // Delete old token
    await trx('user_sessions')
      .where('refresh_token', oldRefreshToken)
      .delete();

    // Create new token
    await trx('user_sessions').insert({
      user_id: session.user_id,
      refresh_token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  });

  // Return both tokens
  return { accessToken, refreshToken: newRefreshToken };
}
```

---

### 3. Cookie Security Settings

```typescript
(reply as any).setCookie('refreshToken', result.refreshToken, {
  httpOnly: true,    // ✅ No JavaScript access (XSS protection)
  secure: true,      // ✅ HTTPS only (MITM protection)
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/',         // ✅ Available to all routes
  maxAge: 7 days     // ✅ Matches token expiration
});
```

**httpOnly:**

- ✅ Prevents XSS attacks from stealing token
- ✅ Token cannot be accessed via `document.cookie`
- ✅ Only sent in HTTP requests

**secure:**

- ✅ Cookie only sent over HTTPS
- ✅ Prevents MITM attacks
- ✅ Development: set to `false` (http://localhost)

**sameSite:**

- ✅ `lax` - Prevents most CSRF attacks
- ✅ Cookie sent on same-site navigation
- ✅ Cookie NOT sent on cross-site requests
- ✅ Alternative: `strict` (more secure, may break some flows)

---

### 4. Rate Limiting

**Why Rate Limit Refresh?**

- Prevents token guessing attacks
- Prevents abuse of refresh endpoint
- Limits damage if token is leaked

**Configuration:**

```typescript
config: {
  rateLimit: {
    max: 10,              // 10 refresh attempts
    timeWindow: '1 minute', // per minute
    keyGenerator: (req) => req.ip || 'unknown',
  },
}
```

**Why 10 per minute?**

- ✅ Normal usage: 1 refresh per 15 minutes
- ✅ Allows burst of requests on page load
- ✅ Prevents automated attacks
- ✅ Doesn't impact legitimate users

---

### 5. Token Revocation

**When to Revoke Tokens:**

1. **User logout** - Delete session immediately
2. **Password change** - Invalidate all sessions
3. **Suspicious activity** - Revoke specific sessions
4. **Admin action** - Force logout user

**How to Revoke:**

```sql
-- Revoke single session
DELETE FROM user_sessions WHERE refresh_token = '<token>';

-- Revoke all user sessions (force logout)
DELETE FROM user_sessions WHERE user_id = '<user-id>';

-- Revoke all expired sessions (cleanup)
DELETE FROM user_sessions WHERE expires_at < NOW();
```

**Automatic Cleanup:**

```typescript
// Run periodically (cron job or scheduled task)
async cleanupExpiredSessions() {
  const deleted = await this.authRepository.deleteExpiredSessions();
  console.log(`Deleted ${deleted} expired sessions`);
}
```

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Start API and Web servers
pnpm run dev:api
pnpm run dev:web

# 2. Test login flow
# - Login at http://localhost:4200/login
# - Verify accessToken in localStorage
# - Verify refreshToken cookie in DevTools

# 3. Test automatic refresh
# - Wait 15 minutes (or manually expire token in localStorage)
# - Make any API request (navigate to dashboard)
# - Check Network tab for /auth/refresh call
# - Verify original request succeeds
# - Verify new accessToken in localStorage

# 4. Test manual refresh
# - Open browser console
# - Run: localStorage.removeItem('accessToken')
# - Navigate to any protected page
# - Should see 401 → refresh → success

# 5. Test refresh failure
# - Delete refreshToken cookie in DevTools
# - Try to access protected page
# - Should redirect to /login

# 6. Test token expiration
# - Login and note the session in database
psql aegisx_db -c "SELECT * FROM user_sessions WHERE user_id='<user-id>';"
# - Set expires_at to past
psql aegisx_db -c "UPDATE user_sessions SET expires_at='2020-01-01' WHERE user_id='<user-id>';"
# - Try to refresh
# - Should get "Invalid refresh token" error

# 7. Test rate limiting
# - Make 11 refresh requests quickly
curl -X POST http://localhost:3333/api/auth/refresh -b cookies.txt
# - 11th request should return 429 Too Many Requests

# 8. Test logout
# - Click logout button
# - Verify session deleted from database
# - Verify cookie cleared
# - Verify localStorage cleared
# - Try to refresh → Should fail

# 9. Test permission updates
# - Login as user
# - Admin changes user role
# - Wait 15 minutes for token to expire
# - Make request → Auto-refresh → New permissions loaded

# 10. Test multi-tab behavior
# - Open app in 2 tabs
# - Login in tab 1
# - Wait for token to expire in both tabs
# - Make request in tab 1 → Auto-refresh
# - Make request in tab 2 → Should use refreshed token
```

---

### Automated Testing

**Test File:** `apps/api/src/core/auth/auth.routes.spec.ts`

```typescript
describe('POST /auth/refresh', () => {
  it('should refresh access token with valid refresh token', async () => {
    // Login first to get refresh token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@aegisx.local',
        password: 'Admin123!',
      },
    });

    const refreshToken = loginResponse.json().data.refreshToken;

    // Wait a bit to ensure token time difference
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Refresh token
    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.json().success).toBe(true);
    expect(refreshResponse.json().data.accessToken).toBeDefined();

    // New token should be different from login token
    expect(refreshResponse.json().data.accessToken).not.toBe(loginResponse.json().data.accessToken);
  });

  it('should fail with invalid refresh token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: 'invalid-token' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('should fail with expired refresh token', async () => {
    // Create session with past expiration
    const userId = '<test-user-id>';
    const expiredToken = randomBytes(32).toString('hex');

    await app.knex('user_sessions').insert({
      user_id: userId,
      refresh_token: expiredToken,
      expires_at: new Date('2020-01-01'), // Past date
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: expiredToken },
    });

    expect(response.statusCode).toBe(401);
  });

  it('should include updated permissions in new token', async () => {
    // Login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'user@test.com', password: 'password' },
    });

    const refreshToken = loginResponse.json().data.refreshToken;
    const oldToken = loginResponse.json().data.accessToken;

    // Decode old token
    const oldPayload = jwt.decode(oldToken);

    // Change user permissions in database
    // (add new role, etc.)

    // Refresh token
    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken },
    });

    const newToken = refreshResponse.json().data.accessToken;
    const newPayload = jwt.decode(newToken);

    // New permissions should be different
    expect(newPayload.permissions).not.toEqual(oldPayload.permissions);
  });

  it('should respect rate limiting', async () => {
    const refreshToken = 'valid-token'; // Use actual valid token

    // Make 11 requests quickly
    const responses = await Promise.all(
      Array(11)
        .fill(null)
        .map(() =>
          app.inject({
            method: 'POST',
            url: '/auth/refresh',
            payload: { refreshToken },
          }),
        ),
    );

    // At least one should be rate limited
    const rateLimited = responses.some((r) => r.statusCode === 429);
    expect(rateLimited).toBe(true);
  });
});
```

---

## 📊 Database Schema

### user_sessions Table

**Migration:** `apps/api/src/database/migrations/003_create_sessions.ts`

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

**Column Details:**

| Column          | Type         | Description                             |
| --------------- | ------------ | --------------------------------------- |
| `id`            | UUID         | Primary key                             |
| `user_id`       | UUID         | Foreign key to users table              |
| `refresh_token` | VARCHAR(500) | 64-character hex string (32 bytes)      |
| `expires_at`    | TIMESTAMP    | Token expiration (7 days from creation) |
| `user_agent`    | VARCHAR(500) | Browser/device identifier               |
| `ip_address`    | VARCHAR(45)  | IP address (IPv4 or IPv6)               |
| `created_at`    | TIMESTAMP    | Session creation time                   |

**Why These Columns?**

- ✅ `user_id` - Link session to user, support cascade delete
- ✅ `refresh_token` - UNIQUE to prevent duplicates
- ✅ `expires_at` - Indexed for fast expiration queries
- ✅ `user_agent` - Track device for security/analytics
- ✅ `ip_address` - Detect suspicious activity (IP changes)

**Query Patterns:**

```sql
-- Find session by token (most common)
SELECT * FROM user_sessions
WHERE refresh_token = $1 AND expires_at > NOW();

-- Get all user sessions
SELECT * FROM user_sessions
WHERE user_id = $1 AND expires_at > NOW()
ORDER BY created_at DESC;

-- Clean up expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Revoke all user sessions (force logout)
DELETE FROM user_sessions WHERE user_id = $1;
```

---

## 🎯 Environment Variables Reference

### Required for Refresh Tokens

| Variable         | Example                | Description                       |
| ---------------- | ---------------------- | --------------------------------- |
| `JWT_SECRET`     | `your-secret-key-here` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `15m`                  | Access token expiration time      |
| `DATABASE_URL`   | `postgresql://...`     | PostgreSQL connection string      |

### Optional

| Variable       | Example                   | Default                 | Description                                |
| -------------- | ------------------------- | ----------------------- | ------------------------------------------ |
| `NODE_ENV`     | `production`              | `development`           | Environment mode (affects cookie security) |
| `FRONTEND_URL` | `https://app.example.com` | `http://localhost:4200` | Frontend URL for CORS                      |

**Cookie Security Based on NODE_ENV:**

```typescript
// Development
{
  secure: false,      // Allow HTTP (localhost)
  sameSite: 'lax',    // Allow same-site requests
}

// Production
{
  secure: true,       // Require HTTPS
  sameSite: 'lax',    // CSRF protection
}

// Test
{
  secure: false,      // Allow HTTP
  sameSite: 'strict', // Strict same-site
}
```

---

## 💡 Quick Fixes

### Fix 1: Clear All Sessions for User

**Problem:** User stuck with invalid session

**Solution:**

```sql
-- Clear all sessions for specific user
DELETE FROM user_sessions WHERE user_id = '<user-id>';

-- User will need to login again
```

---

### Fix 2: Manual Token Refresh Test

**Problem:** Want to test refresh flow manually

**Solution:**

```bash
# 1. Login and save cookies
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@aegisx.local","password":"Admin123!"}'

# 2. Refresh token (uses cookie automatically)
curl -X POST http://localhost:3333/api/auth/refresh \
  -b cookies.txt

# 3. Or pass token in body
curl -X POST http://localhost:3333/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token-from-login>"}'
```

---

### Fix 3: Debug Token Expiration

**Problem:** Token expires too quickly or too slowly

**Solution:**

```javascript
// Decode JWT token in browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));

console.log('Issued at:', new Date(payload.iat * 1000));
console.log('Expires at:', new Date(payload.exp * 1000));
console.log('Time remaining:', (payload.exp - Date.now() / 1000) / 60, 'minutes');
```

---

### Fix 4: Force Token Expiration for Testing

**Problem:** Don't want to wait 15 minutes to test refresh

**Solution:**

```typescript
// Option 1: Change JWT_EXPIRES_IN temporarily
JWT_EXPIRES_IN=30s pnpm run dev:api

// Option 2: Manually expire token in localStorage
const token = localStorage.getItem('accessToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
payload.exp = Math.floor(Date.now() / 1000) - 1; // Expired 1 second ago
const newToken = parts[0] + '.' + btoa(JSON.stringify(payload)) + '.' + parts[2];
localStorage.setItem('accessToken', newToken);
```

---

### Fix 5: Check Session Count

**Problem:** Want to see how many active sessions exist

**Solution:**

```sql
-- Count active sessions per user
SELECT
  u.email,
  COUNT(s.id) as active_sessions,
  MAX(s.created_at) as last_session
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id
  AND s.expires_at > NOW()
GROUP BY u.email
ORDER BY active_sessions DESC;

-- Find users with multiple sessions (suspicious?)
SELECT
  user_id,
  COUNT(*) as session_count,
  array_agg(ip_address) as ip_addresses
FROM user_sessions
WHERE expires_at > NOW()
GROUP BY user_id
HAVING COUNT(*) > 3;
```

---

## 📚 Related Documentation

- **[Login Implementation](./LOGIN_IMPLEMENTATION.md)** - Initial token generation
- **[Session Management](../../session-management/)** - Session tracking and cleanup
- **[JWT Authentication](../guides/JWT_AUTHENTICATION.md)** - Access token details
- **[RBAC Implementation](../../rbac/IMPLEMENTATION.md)** - Permission loading
- **[Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md)** - Session invalidation on password change

---

## ❓ FAQ

**Q: Why are refresh tokens stored in both cookies AND database?**

A:

- **Cookie:** Secure transmission (httpOnly, secure, sameSite)
- **Database:** Revocation capability (logout, password change, admin actions)
- **Combined:** Best of both worlds

**Q: Can I use refresh tokens from mobile apps?**

A: Yes! Mobile apps can:

- Send refresh token in request body instead of cookie
- Store refresh token in secure storage (Keychain, Keystore)
- Backend accepts token from either cookie OR body

**Q: What happens if refresh token is stolen?**

A: Limited damage:

- Attacker can generate access tokens for 7 days
- But: Can be revoked from database immediately
- Future: Token rotation would detect theft on next legitimate refresh
- Mitigation: Monitor suspicious activity (IP changes, unusual patterns)

**Q: Why not store access token in httpOnly cookie too?**

A: Access token needs to be accessible to JavaScript:

- Frontend needs to include it in Authorization headers
- Frontend needs to check expiration before requests
- httpOnly cookies can't be read by JavaScript
- Short expiration (15 min) mitigates XSS risk

**Q: Can a user have multiple active sessions?**

A: Yes! Each login creates a new session:

- User can be logged in on multiple devices
- Each device has its own refresh token
- All sessions tracked in database
- Can revoke specific sessions or all sessions

**Q: How to implement "Remember Me" functionality?**

A: Two approaches:

```typescript
// Option 1: Longer refresh token expiration
const expiresAt = rememberMe
  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

// Option 2: Remember email only (current implementation)
if (rememberMe) {
  localStorage.setItem('rememberedEmail', email);
}
```

**Q: Does refresh update permissions in real-time?**

A: Almost real-time (within 15 minutes):

- Permissions cached in JWT access token
- Access token expires every 15 minutes
- Refresh reloads permissions from database
- Maximum delay: 15 minutes for permission changes to take effect

**Q: Can refresh tokens be reused?**

A: In current implementation: Yes

- Same refresh token valid for 7 days
- Can be used multiple times
- Each refresh generates new access token
- Future enhancement: Token rotation (one-time use)

**Q: What happens if database is down during refresh?**

A: Refresh fails gracefully:

- Returns 500 Internal Server Error
- Frontend redirects to login page
- User must re-authenticate
- No data corruption (idempotent operation)

**Q: How to test refresh token rotation?**

A: Currently not implemented, but test plan would be:

```typescript
// Future test
it('should rotate refresh token', async () => {
  const { refreshToken: token1 } = await login();
  const { refreshToken: token2 } = await refresh(token1);

  // Tokens should be different
  expect(token2).not.toBe(token1);

  // Old token should be invalid
  await expect(refresh(token1)).rejects.toThrow('Invalid refresh token');

  // New token should work
  const { refreshToken: token3 } = await refresh(token2);
  expect(token3).not.toBe(token2);
});
```

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
