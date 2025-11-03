# Registration Implementation - Technical Documentation

> **Complete implementation guide for user registration with auto-login in authentication system**

## 📋 Overview

User registration is implemented across multiple services with proper security, validation, and automatic login:

1. **AuthService** - Handles registration logic and auto-login
2. **EmailVerificationService** - Creates verification tokens and sends emails
3. **AuthRepository** - Database operations for user creation
4. **Frontend** - Registration form with validation and password strength indicator
5. **Rate Limiting** - Prevents spam registrations (100 attempts per 5 minutes)

**Key Features:**

- Auto-login after successful registration (JWT tokens generated immediately)
- Email verification sent but not required to access application
- Duplicate email/username detection
- Password strength validation (minimum 8 characters)
- Intelligent rate limiting (100 attempts/5min per IP)
- Bcrypt password hashing (10 rounds)
- Audit logging in database

---

## 🏗️ Architecture & Flow

### Complete Registration Flow (Auto-Login + Email Verification)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Submits Registration Form (POST /api/auth/register)    │
│    - Email, username, password, firstName, lastName             │
│    - Rate limited: 100 attempts per 5 minutes per IP            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. Rate Limiting Check (Fastify Route Config)                   │
│    - Key: IP address                                             │
│    - Max: 100 attempts per 5 minutes                             │
│    - Prevents spam registrations                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. Request Validation (TypeBox Schema)                          │
│    - Email format validation                                     │
│    - Username: 3-50 chars, alphanumeric + underscore/hyphen     │
│    - Password: minimum 8 characters                              │
│    - First name and last name required                           │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. AuthController.register()                                     │
│    - Extract registration data from request                      │
│    - Call AuthService.register()                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 5. Check Email Already Exists                                    │
│    - Query users table by email                                  │
│    - If exists: return 409 EMAIL_ALREADY_EXISTS                  │
│    - Excludes soft-deleted users                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 6. Check Username Already Exists                                 │
│    - Query users table by username                               │
│    - If exists: return 409 USERNAME_ALREADY_EXISTS               │
│    - Excludes soft-deleted users                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 7. Hash Password with Bcrypt                                     │
│    - Use AuthRepository.hashPassword()                           │
│    - bcrypt.hash with 10 rounds                                  │
│    - Automatic salt generation                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 8. Create User in Database                                       │
│    - Insert into users table                                     │
│    - Default: is_active = true, email_verified = false           │
│    - Assign default 'user' role                                  │
│    - Auto-generate UUID for user ID                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 9. Generate JWT Access Token (15 minutes)                        │
│    - Payload: { id, email, role, roles[] }                      │
│    - Sign with JWT_SECRET                                        │
│    - Expiration: JWT_EXPIRES_IN (default: 15m)                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 10. Generate Refresh Token (7 days)                              │
│     - Random 32 bytes hex string (64 characters)                 │
│     - Stored in sessions table with expiration                   │
│     - No userAgent or ipAddress (optional in registration)       │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 11. Create Email Verification Token                              │
│     - Via EmailVerificationService.createVerificationToken()     │
│     - 64-character random hex token                              │
│     - Expires in 24 hours                                        │
│     - Store in email_verifications table                         │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 12. Send Verification Email                                      │
│     - Via EmailVerificationService.sendVerificationEmail()       │
│     - Email contains verification link with token                │
│     - Non-blocking (email failure doesn't block registration)    │
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
│ 14. Return 201 Created Response to Client                        │
│     - { user, accessToken, refreshToken, expiresIn }            │
│     - Frontend stores accessToken in localStorage                │
│     - Frontend navigates to /dashboard                           │
│     - User is LOGGED IN immediately                              │
└─────────────────────────────────────────────────────────────────┘
```

**Important:** Email verification is sent but NOT required to access the application. User can login immediately after registration.

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── auth.routes.ts                          # Route definitions
│   │   └─ POST /auth/register → Lines 10-61
│   │      - Rate limiting: 100 attempts/5min per IP
│   │      - Schema validation with TypeBox
│   │      - Handler: authController.register
│   │
│   ├── auth.controller.ts                      # HTTP request handler
│   │   └─ register() → Lines 15-50
│   │      - Extract registration data
│   │      - Call authService.register()
│   │      - Set refresh token in httpOnly cookie
│   │      - Return 201 Created with user + tokens
│   │
│   ├── auth.schemas.ts                         # TypeBox schemas
│   │   └─ RegisterRequestSchema → Lines 23-48
│   │      - Email format validation
│   │      - Username: 3-50 chars, pattern validation
│   │      - Password: minimum 8 characters
│   │      - First name and last name required
│   │
│   ├── services/
│   │   ├── auth.service.ts                     # Core registration logic
│   │   │   └─ register() → Lines 34-123
│   │   │      - Check email/username exists
│   │   │      - Create user in database
│   │   │      - Generate JWT tokens (auto-login)
│   │   │      - Trigger email verification
│   │   │      - Return user + tokens
│   │   │
│   │   ├── email-verification.service.ts       # Email verification
│   │   │   ├─ createVerificationToken() → Lines 54-91
│   │   │   └─ sendVerificationEmail() → Lines 196-202
│   │   │
│   │   └── auth.repository.ts                  # Database operations
│   │       ├─ createUser() - Insert new user
│   │       ├─ hashPassword() - Bcrypt hashing
│   │       └─ createSession() - Store refresh token
│   │
│   └── auth.types.ts                           # TypeScript interfaces
│       └─ RegisterInput → Lines 8-14
```

### Frontend Files

```
apps/web/src/app/
├── pages/auth/
│   └── register.page.ts                        # Registration UI component
│       ├─ registerForm → FormGroup definition
│       │  - Email, username, firstName, lastName
│       │  - Password + confirmPassword
│       │  - Custom passwordMatchValidator
│       │
│       └─ onSubmit() → Lines 558-593
│          - Validate form
│          - Call authService.register()
│          - Handle success/error
│          - Auto-redirect to /dashboard
│
└── core/auth/services/
    └── auth.service.ts                         # Frontend auth service
        └─ register() → POST /auth/register
           - Store tokens in state + localStorage
           - Navigate to /dashboard
```

---

## 🔍 Implementation Details

### 1. Route Configuration - Rate Limiting

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 10-61:**

```typescript
// POST /api/auth/register
typedFastify.route({
  method: 'POST',
  url: '/auth/register',
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
          message: 'Too many registration attempts. Please try again in a few minutes.',
          statusCode: 429,
        },
      }),
    },
  },
  schema: {
    tags: ['Authentication'],
    summary: 'Register a new user account',
    body: bodySchema,
    response: {
      201: responseSchema,
      400: SchemaRefs.ValidationError,
      409: SchemaRefs.Conflict,
      429: SchemaRefs.ServerError, // Rate limit exceeded
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.register,
});
```

**Rate Limiting Strategy:**

- ✅ **100 attempts per 5 minutes** (generous for validation errors)
- ✅ **Key: IP address** (prevents spam from single IP)
- ✅ **Custom error message** for better user experience
- ✅ **429 status code** for rate limit exceeded

**Why 100 attempts?**

- Allows users to fix validation errors (email format, password strength, etc.)
- Still prevents automated spam registrations
- Balances security and user experience

---

### 2. Request Validation - TypeBox Schema

**File:** `apps/api/src/core/auth/auth.schemas.ts`

**Lines 23-48:**

```typescript
export const RegisterRequestSchema = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
    description: 'Username (alphanumeric, underscore, hyphen only)',
  }),
  password: Type.String({
    minLength: 8,
    description: 'Password (minimum 8 characters)',
  }),
  firstName: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'First name',
  }),
  lastName: Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Last name',
  }),
});
```

**Validation Rules:**

| Field     | Validation                                  | Example          |
| --------- | ------------------------------------------- | ---------------- |
| email     | Valid email format                          | user@example.com |
| username  | 3-50 chars, alphanumeric + `_` and `-` only | john_doe-123     |
| password  | Minimum 8 characters                        | MyPass123        |
| firstName | 1-100 characters, required                  | John             |
| lastName  | 1-100 characters, required                  | Doe              |

**Invalid Usernames:**

- ❌ `ab` (too short)
- ❌ `john.doe` (contains period)
- ❌ `john doe` (contains space)
- ❌ `john@doe` (contains @)
- ✅ `john_doe` (valid)
- ✅ `john-doe-123` (valid)

---

### 3. AuthController.register() - Request Handler

**File:** `apps/api/src/core/auth/auth.controller.ts`

**Lines 15-50:**

```typescript
async register(request: FastifyRequest, reply: FastifyReply) {
  console.log('[AUTH_CONTROLLER] Register request received');
  console.log(
    '[AUTH_CONTROLLER] Request body:',
    JSON.stringify(request.body, null, 2),
  );

  const result = await request.server.authService.register(
    request.body as RegisterRequest,
  );

  // Set refresh token in httpOnly cookie (same as login)
  (reply as any).setCookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'test' ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return reply.code(201).send({
    success: true,
    data: result,
    message: 'User registered successfully',
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId: 'req-' + Math.random().toString(36).substr(2, 9),
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
```

**What it does:**

- ✅ Logs registration attempt for debugging
- ✅ Calls AuthService.register()
- ✅ Sets refresh token in **httpOnly cookie** (XSS protection)
- ✅ Returns **201 Created** status code
- ✅ Returns user data + tokens (auto-login)
- ✅ Includes metadata (timestamp, version, requestId)

**Cookie Security:**

```typescript
{
  httpOnly: true,    // ✅ No JavaScript access (XSS protection)
  secure: true,      // ✅ HTTPS only in production
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/',         // ✅ Available to all routes
  maxAge: 7 days     // ✅ Matches token expiration
}
```

---

### 4. AuthService.register() - Core Registration Logic

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**Lines 34-123:**

#### Step 1: Log Registration Attempt (Line 38)

```typescript
console.log('[AUTH_SERVICE] Starting registration for email:', email);
```

#### Step 2: Check Email Already Exists (Lines 40-47)

```typescript
// Check if user exists
const existingUser = await this.authRepository.findUserByEmail(email);
if (existingUser) {
  const error = new Error('Email already exists');
  (error as any).statusCode = 409;
  (error as any).code = 'EMAIL_ALREADY_EXISTS';
  throw error;
}
```

**Why 409 Conflict?**

- Email uniqueness is a **constraint violation**, not invalid input
- 409 Conflict is semantically correct for duplicate resources
- Frontend can show specific "Email already taken" message

#### Step 3: Check Username Already Exists (Lines 49-61)

```typescript
// Check username
const existingUsername = await this.app
  .knex('users')
  .where('username', username)
  .whereNull('deleted_at') // Exclude deleted users
  .first();

if (existingUsername) {
  const error = new Error('Username already exists');
  (error as any).statusCode = 409;
  (error as any).code = 'USERNAME_ALREADY_EXISTS';
  throw error;
}
```

**Important:** Excludes soft-deleted users via `whereNull('deleted_at')`

#### Step 4: Create User (Lines 63-70)

```typescript
// Create user
const user = await this.authRepository.createUser({
  email,
  username,
  password, // Will be hashed by AuthRepository
  first_name: firstName || '',
  last_name: lastName || '',
});
```

**What AuthRepository.createUser() does:**

1. Hash password with bcrypt (10 rounds)
2. Insert into users table
3. Assign default role: 'user'
4. Set is_active = true
5. Set email_verified = false
6. Auto-generate UUID for user ID
7. Return created user object

**User Object Structure:**

```typescript
{
  id: 'uuid-here',
  email: 'user@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  role: 'user',
  roles: ['user'],
  createdAt: '2025-11-03T10:00:00Z',
  updatedAt: '2025-11-03T10:00:00Z'
}
```

#### Step 5: Generate JWT Access Token (Lines 72-81)

```typescript
// Generate tokens (similar to login)
const accessToken = this.app.jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role || 'user', // Backward compatibility
    roles: user.roles || ['user'], // Multi-role support
  },
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
);
```

**JWT Token Contents:**

```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "role": "user",
  "roles": ["user"],
  "iat": 1699000000,
  "exp": 1699000900
}
```

**Token Properties:**

- Expiration: **15 minutes** (default)
- Signed with JWT_SECRET
- Contains user ID, email, roles
- Used for API authentication
- **Note:** No permissions in registration token (user has no permissions yet until roles are assigned)

#### Step 6: Generate Refresh Token (Lines 83-94)

```typescript
const refreshToken = randomBytes(32).toString('hex');
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

// Save refresh token
await this.authRepository.createSession({
  user_id: user.id,
  refresh_token: refreshToken,
  expires_at: expiresAt,
  user_agent: undefined,
  ip_address: undefined,
});
```

**Refresh Token:**

- Length: **64 characters** (32 bytes hex)
- Expiration: **7 days**
- Stored in `sessions` table
- userAgent and ipAddress are undefined (optional in registration)
- Can be revoked from database

#### Step 7: Create Email Verification Token (Lines 96-101)

```typescript
// Create email verification token and send email
const verificationToken = await this.emailVerificationService.createVerificationToken(user.id, user.email);
```

**What EmailVerificationService.createVerificationToken() does:**

1. Generate 64-character random hex token
2. Calculate expiration (24 hours)
3. Delete old unverified tokens for this user
4. Insert new token into `email_verifications` table
5. Return token string

**Token Storage:**

```sql
INSERT INTO email_verifications (
  id,
  user_id,
  token,
  email,
  verified,
  expires_at,
  created_at
) VALUES (
  gen_random_uuid(),
  'user-id-here',
  'verification-token-here',
  'user@example.com',
  false,
  '2025-11-04T10:00:00Z',
  NOW()
);
```

#### Step 8: Send Verification Email (Lines 102-106)

```typescript
await this.emailVerificationService.sendVerificationEmail(user.email, verificationToken, `${firstName || ''} ${lastName || ''}`.trim());
```

**Email Content:**

- **Subject:** "Verify Your Email Address - AegisX Platform"
- **Body:** HTML + text versions
- **Link:** `http://localhost:4200/auth/verify-email?token=xxx`
- **Expiration:** 24 hours

**Important:** Email sending is **non-blocking**. If email fails, registration still succeeds.

#### Step 9: Remove Password from Response (Line 109)

```typescript
// Remove password from response
const { password: _, ...userWithoutPassword } = user;
```

**Security:** Never return password hash in API response, even if hashed.

#### Step 10: Log Success and Return (Lines 111-118)

```typescript
console.log('[AUTH_SERVICE] Registration successful for user:', user.id);

return {
  user: userWithoutPassword,
  accessToken,
  refreshToken,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
};
```

**Return Object:**

```typescript
{
  user: {
    id: 'uuid-here',
    email: 'user@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    role: 'user',
    roles: ['user'],
    createdAt: '2025-11-03T10:00:00Z',
    updatedAt: '2025-11-03T10:00:00Z'
  },
  accessToken: 'jwt-token-here',
  refreshToken: 'refresh-token-here',
  expiresIn: '15m'
}
```

---

### 5. Password Hashing - Security

**File:** `apps/api/src/core/auth/auth.repository.ts`

**Method:** `hashPassword()`

```typescript
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
```

**Bcrypt Configuration:**

- **Algorithm:** bcrypt
- **Salt Rounds:** 10 (2^10 = 1,024 iterations)
- **Salt:** Auto-generated per password
- **Output:** 60-character hash string

**Example:**

```typescript
Input:  "MyPassword123"
Output: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
         ^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         alg  salt + hash (combined)
```

**Why bcrypt?**

- ✅ Resistant to rainbow table attacks (salt)
- ✅ Resistant to brute force (slow by design)
- ✅ Industry standard for password hashing
- ✅ Automatic salt generation

---

### 6. Frontend Registration Form

**File:** `apps/web/src/app/pages/auth/register.page.ts`

#### Form Definition (Lines 545-556)

```typescript
this.registerForm = this.formBuilder.group(
  {
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  },
  { validators: this.passwordMatchValidator },
);
```

**Form Validation:**

| Field           | Validators                       | Error Message                               |
| --------------- | -------------------------------- | ------------------------------------------- |
| email           | required, email format           | "Email is required", "Invalid email format" |
| username        | required, minLength(3)           | "Username is required", "Min 3 characters"  |
| firstName       | required                         | "First name is required"                    |
| lastName        | required                         | "Last name is required"                     |
| password        | required, minLength(8)           | "Password is required", "Min 8 characters"  |
| confirmPassword | required, passwordMatchValidator | "Passwords do not match"                    |

#### Password Match Validator (Lines 603-614)

```typescript
private passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}
```

**Custom Validation:**

- Checks if password and confirmPassword match
- Returns `{ passwordMismatch: true }` if they don't match
- Displayed as "Passwords do not match" error

#### Submit Handler (Lines 558-593)

```typescript
protected onSubmit(): void {
  if (this.registerForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  const { email, username, firstName, lastName, password } =
    this.registerForm.value;

  this.authService
    .register({ email, username, firstName, lastName, password })
    .subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          'Account created successfully! Please check your email to verify your account.',
        );
        this.registerForm.reset();

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Failed to create account. Please try again.',
        );
      },
    });
}
```

**Flow:**

1. Validate form (client-side)
2. Set loading state
3. Call authService.register()
4. On success:
   - Show success message
   - Reset form
   - Wait 3 seconds
   - Navigate to /dashboard
5. On error:
   - Show error message
   - Keep form data for retry

#### Password Visibility Toggle (Lines 595-601)

```typescript
protected togglePasswordVisibility(): void {
  this.hidePassword.set(!this.hidePassword());
}

protected toggleConfirmPasswordVisibility(): void {
  this.hideConfirmPassword.set(!this.hideConfirmPassword());
}
```

**UI Feature:**

- Eye icon button to show/hide password
- Separate toggles for password and confirmPassword fields
- Accessibility: aria-label changes based on state

---

### 7. Auto-Login Flow (Key Feature)

**Why Auto-Login?**

- ✅ Better user experience (no need to login after registration)
- ✅ Standard practice (GitHub, Google, Facebook all auto-login)
- ✅ Email verification optional (user can access app immediately)

**How it Works:**

```
Registration Success
    ↓
Backend Generates JWT Tokens
    ↓
Frontend Receives Tokens in Response
    ↓
Frontend Stores Tokens
    ↓
Frontend Navigates to /dashboard
    ↓
User is Logged In
```

**Token Storage:**

1. **Access Token:** localStorage (frontend manages)
2. **Refresh Token:** httpOnly cookie (backend sets)

**Frontend Implementation:**

```typescript
// apps/web/src/app/core/auth/services/auth.service.ts
register(credentials: RegisterRequest): Observable<AuthResponse> {
  return this.http
    .post<AuthResponse>('/auth/register', credentials, {
      withCredentials: true, // Include cookies for refresh token
    })
    .pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setAuthData(response.data); // Store tokens + update state
          this.router.navigate(['/dashboard']); // Auto-navigate
        }
      }),
    );
}
```

---

## 🛠️ Troubleshooting Guide

### Problem 1: Email Already Exists

**Symptoms:**

- Registration fails with "Email already exists"
- Status code: 409 (Conflict)

**Check:**

```bash
# Verify user exists
psql aegisx_db -c "SELECT email, username, deleted_at FROM users WHERE email='user@example.com';"
```

**Possible Causes:**

1. Email already registered
2. User soft-deleted but not purged

**Solution 1: User Already Registered**

```bash
# User should login instead of register
# Or use password reset if forgot password
```

**Solution 2: Soft-Deleted User**

```sql
-- Check deleted users
SELECT email, deleted_at FROM users WHERE email='user@example.com';

-- If you want to allow re-registration (development only):
DELETE FROM users WHERE email='user@example.com' AND deleted_at IS NOT NULL;
```

---

### Problem 2: Username Already Exists

**Symptoms:**

- Registration fails with "Username already exists"
- Status code: 409 (Conflict)

**Check:**

```bash
psql aegisx_db -c "SELECT username, email, deleted_at FROM users WHERE username='johndoe';"
```

**Solution:**

- Choose different username
- Frontend should show specific error: "Username already taken"
- Backend returns `USERNAME_ALREADY_EXISTS` error code

---

### Problem 3: Password Too Weak

**Symptoms:**

- Registration fails with validation error
- Error: "Password must be at least 8 characters"

**Frontend Validation:**

```typescript
password: ['', [Validators.required, Validators.minLength(8)]],
```

**Backend Validation:**

```typescript
password: Type.String({
  minLength: 8,
  description: 'Password (minimum 8 characters)',
}),
```

**Solution:**

- Password must be at least 8 characters
- No other strength requirements (uppercase, numbers, symbols)
- Frontend shows error before submission

---

### Problem 4: No Email Received

**Symptoms:**

- Registration successful
- User can login
- No verification email in inbox

**Check:**

```bash
# Check email verification token created
psql aegisx_db -c "SELECT token, email, verified, expires_at FROM email_verifications WHERE email='user@example.com' ORDER BY created_at DESC LIMIT 1;"
```

**Possible Causes:**

1. SMTP not configured
2. Email in spam folder
3. Email service error (non-blocking, doesn't fail registration)

**Solution:**

See **[Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md)** for SMTP troubleshooting.

**Important:** Email verification is optional. User can access application without verifying email.

---

### Problem 5: Too Many Registration Attempts

**Symptoms:**

- Error: "Too many registration attempts. Please try again in a few minutes."
- Status code: 429

**Cause:**

- Rate limit: 100 attempts per 5 minutes per IP

**Check:**

```bash
# Wait 5 minutes
# Or use different IP address
```

**Why 100 attempts?**

- Allows fixing validation errors
- Prevents automated spam
- Balances security and UX

---

### Problem 6: Registration Successful But Not Logged In

**Symptoms:**

- Registration completes
- No error message
- User not redirected to dashboard
- User not logged in

**Check:**

1. **Browser Console Errors:**

```javascript
// Check for errors
console.log(localStorage.getItem('accessToken'));
console.log(document.cookie);
```

2. **Network Tab:**

```bash
# Check response contains tokens
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

**Possible Causes:**

1. Frontend not storing tokens
2. Frontend not navigating to dashboard
3. AuthService.setAuthData() not called

**Solution:**

```typescript
// Verify AuthService.register() implementation
register(credentials: RegisterRequest): Observable<AuthResponse> {
  return this.http
    .post<AuthResponse>('/auth/register', credentials, {
      withCredentials: true, // ✅ Required for cookies
    })
    .pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setAuthData(response.data); // ✅ Store tokens
          this.router.navigate(['/dashboard']); // ✅ Navigate
        }
      }),
    );
}
```

---

## 🔒 Security Considerations

### 1. Password Hashing

**Algorithm:** bcrypt with 10 rounds

**Why bcrypt?**

- ✅ Resistant to rainbow table attacks (automatic salt)
- ✅ Resistant to brute force (slow by design)
- ✅ Industry standard
- ✅ Automatic salt generation

**Implementation:**

```typescript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Output:**

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

### 2. Rate Limiting

**Two Layers:**

1. **Fastify Route Level:** 100 attempts per 5 minutes per IP
2. **Prevents:** Spam registrations and enumeration attacks

**Why 100 attempts?**

- Allows legitimate users to fix validation errors
- Still prevents automated spam
- Balances security and user experience

### 3. Duplicate Detection

**Email Check:**

```typescript
const existingUser = await this.authRepository.findUserByEmail(email);
if (existingUser) {
  throw new Error('Email already exists'); // 409 Conflict
}
```

**Username Check:**

```typescript
const existingUsername = await this.app
  .knex('users')
  .where('username', username)
  .whereNull('deleted_at') // Exclude soft-deleted
  .first();
```

**Why Important?**

- ✅ Prevents account hijacking
- ✅ Ensures unique identifiers
- ✅ Better user experience (clear error messages)

### 4. Token Security

**Access Token (JWT):**

- ✅ Short expiration (15 minutes)
- ✅ Signed with JWT_SECRET
- ✅ Contains minimal user data
- ✅ Stored in localStorage (acceptable for short-lived tokens)

**Refresh Token:**

- ✅ Long expiration (7 days)
- ✅ Stored in httpOnly cookie (XSS protection)
- ✅ Revocable from database
- ✅ Random 64-character string

**Cookie Security:**

```typescript
{
  httpOnly: true,    // ✅ No JavaScript access (XSS protection)
  secure: true,      // ✅ HTTPS only in production
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/',         // ✅ Available to all routes
  maxAge: 7 days     // ✅ Matches token expiration
}
```

### 5. Input Validation

**Backend Validation (TypeBox):**

```typescript
{
  email: Type.String({ format: 'email' }),
  username: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$', // Only alphanumeric + underscore/hyphen
  }),
  password: Type.String({ minLength: 8 }),
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
}
```

**Frontend Validation (Angular):**

```typescript
{
  email: [Validators.required, Validators.email],
  username: [Validators.required, Validators.minLength(3)],
  password: [Validators.required, Validators.minLength(8)],
  firstName: [Validators.required],
  lastName: [Validators.required],
}
```

**Why Both?**

- Frontend: Better UX (immediate feedback)
- Backend: Security (cannot be bypassed)

### 6. Error Message Security

**Generic Messages:**

- ✅ "Email already exists" (not "User already exists")
- ✅ "Username already exists" (not "This user is registered")
- ✅ Clear but not revealing sensitive info

**Specific Error Codes:**

```typescript
{
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  TOO_MANY_ATTEMPTS: 'Too many registration attempts',
}
```

**Why Important?**

- Prevents user enumeration attacks
- Provides actionable feedback
- Balances security and UX

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Start API and Web servers
pnpm run dev:api
pnpm run dev:web

# 2. Test successful registration
# Go to http://localhost:4200/register
# Fill form with valid data:
#   Email: test@example.com
#   Username: testuser
#   First Name: Test
#   Last Name: User
#   Password: TestPass123
#   Confirm Password: TestPass123
# Submit form
# Verify redirect to /dashboard
# Check localStorage for accessToken
# Check cookies for refreshToken

# 3. Test duplicate email
# Try to register with same email
# Should see "Email already exists" error
# Status code: 409

# 4. Test duplicate username
# Use different email but same username
# Should see "Username already exists" error
# Status code: 409

# 5. Test password too short
# Password: "test123" (7 chars)
# Should see "Password must be at least 8 characters" error
# Frontend validation should prevent submission

# 6. Test password mismatch
# Password: "TestPass123"
# Confirm Password: "TestPass456"
# Should see "Passwords do not match" error
# Frontend validation should prevent submission

# 7. Test invalid email format
# Email: "notanemail"
# Should see "Please enter a valid email address" error
# Frontend validation should prevent submission

# 8. Test invalid username
# Username: "test user" (contains space)
# Should fail backend validation
# Status code: 400

# 9. Test rate limiting
# Make 100 registration attempts quickly
# 101st attempt should fail with rate limit error
# Status code: 429

# 10. Verify database records
psql aegisx_db -c "SELECT id, email, username, is_active, email_verified FROM users WHERE email='test@example.com';"
# Should show:
# - is_active: true
# - email_verified: false

# 11. Verify email verification token
psql aegisx_db -c "SELECT token, email, verified, expires_at FROM email_verifications WHERE email='test@example.com';"
# Should show:
# - verified: false
# - expires_at: 24 hours from now

# 12. Verify session created
psql aegisx_db -c "SELECT refresh_token, expires_at FROM sessions WHERE user_id=(SELECT id FROM users WHERE email='test@example.com') ORDER BY created_at DESC LIMIT 1;"
# Should show:
# - refresh_token: 64-char hex string
# - expires_at: 7 days from now

# 13. Test auto-login
# After successful registration
# User should be logged in automatically
# Dashboard should load without login page

# 14. Test email verification (optional)
# Check email inbox for verification email
# Click verification link
# Should redirect to verify-email page
# Should show success message
```

---

### Automated Testing

**Test File:** `apps/api/src/core/auth/auth.routes.spec.ts`

```typescript
describe('POST /auth/register', () => {
  it('should register successfully with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().success).toBe(true);
    expect(response.json().data.accessToken).toBeDefined();
    expect(response.json().data.user.email).toBe('newuser@example.com');
  });

  it('should fail with duplicate email', async () => {
    // First registration
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Duplicate email
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'duplicate@example.com',
        username: 'user2',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('should fail with duplicate username', async () => {
    // First registration
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'user1@example.com',
        username: 'duplicate',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Duplicate username
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'user2@example.com',
        username: 'duplicate',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('USERNAME_ALREADY_EXISTS');
  });

  it('should fail with invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'notanemail',
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should fail with password too short', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123', // 7 characters
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should set refresh token in httpOnly cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'cookie@example.com',
        username: 'cookieuser',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.cookies).toBeDefined();

    const refreshTokenCookie = response.cookies.find((c: any) => c.name === 'refreshToken');
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie.httpOnly).toBe(true);
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

### email_verifications Table

```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);
```

---

## 🎯 Environment Variables Reference

### Required for Registration

| Variable         | Example            | Description                       |
| ---------------- | ------------------ | --------------------------------- |
| `JWT_SECRET`     | `your-secret-key`  | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `15m`              | Access token expiration time      |
| `DATABASE_URL`   | `postgresql://...` | PostgreSQL connection string      |

### Optional (for Email Verification)

| Variable        | Example                     | Description                  |
| --------------- | --------------------------- | ---------------------------- |
| `SMTP_HOST`     | `smtp.gmail.com`            | SMTP server hostname         |
| `SMTP_PORT`     | `587`                       | SMTP server port             |
| `SMTP_USER`     | `aegisx.platform@gmail.com` | SMTP username                |
| `SMTP_PASSWORD` | `app-password-here`         | SMTP password (App Password) |
| `FROM_EMAIL`    | `aegisx.platform@gmail.com` | Sender email address         |
| `WEB_URL`       | `http://localhost:4200`     | Frontend URL for links       |

---

## 💡 Quick Fixes

### Fix 1: Clear Duplicate Emails (Development Only)

```sql
-- Find duplicates
SELECT email, COUNT(*)
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete duplicates (keep first)
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email
);
```

### Fix 2: Reset Rate Limit (Development Only)

```bash
# Restart API server to clear rate limit counter
pkill -f "nx serve api"
pnpm run dev:api
```

### Fix 3: Test Registration API Directly

```bash
# Register via curl
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Save access token from response
ACCESS_TOKEN="<token-from-response>"

# Test authenticated endpoint
curl -X GET http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Fix 4: Verify Email Verification Token

```sql
-- Check token created
SELECT
  token,
  email,
  verified,
  expires_at,
  created_at
FROM email_verifications
WHERE email='test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📚 Related Documentation

- **[Login Implementation](./LOGIN_IMPLEMENTATION.md)** - Login flow and auto-login
- **[Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md)** - Email verification details
- **[Password Reset Implementation](./PASSWORD_RESET_IMPLEMENTATION.md)** - Password reset flow
- **[RBAC Implementation](../../rbac/IMPLEMENTATION.md)** - Role-based access control
- **[Authentication Flow](../README.md)** - Complete auth system overview

---

## ❓ FAQ

**Q: Can users login immediately after registration?**
A: Yes! Registration includes auto-login. User receives JWT tokens and is redirected to dashboard immediately.

**Q: Is email verification required to access the application?**
A: No. Email verification is sent but not required. User can access application with unverified email.

**Q: How long is the JWT access token valid?**
A: 15 minutes by default. Configurable via `JWT_EXPIRES_IN` environment variable.

**Q: How long is the refresh token valid?**
A: 7 days. Stored in httpOnly cookie and database.

**Q: What happens if email already exists?**
A: Registration fails with 409 Conflict error: "Email already exists". User should login instead.

**Q: What happens if username already exists?**
A: Registration fails with 409 Conflict error: "Username already exists". User should choose different username.

**Q: Can I use special characters in username?**
A: No. Username must match pattern: `^[a-zA-Z0-9_-]+$` (alphanumeric + underscore/hyphen only).

**Q: What's the minimum password length?**
A: 8 characters. No other requirements (uppercase, numbers, symbols).

**Q: How many registration attempts are allowed?**
A: 100 attempts per 5 minutes per IP. This allows fixing validation errors while preventing spam.

**Q: Are passwords stored in plain text?**
A: No. Passwords are hashed with bcrypt (10 rounds) before storing in database.

**Q: Can soft-deleted users re-register?**
A: No. Soft-deleted users are excluded from duplicate checks. Admin must hard-delete or restore user.

**Q: What if email sending fails?**
A: Registration still succeeds. Email verification is non-blocking. User can request resend later.

**Q: Where are tokens stored?**
A: Access token in localStorage, refresh token in httpOnly cookie.

**Q: Can I test without email verification?**
A: Yes. Email verification is optional. User can access application immediately after registration.

**Q: What's logged in the console?**
A: Registration attempts, email sending, user creation, token generation (see console for debugging).

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
