# Password Reset Implementation - Technical Documentation

> **Complete implementation guide for secure password reset in authentication system**

## 📋 Overview

Password reset is implemented as a **2-step flow** across multiple services with proper security and separation of concerns:

1. **Step 1: Request Password Reset** - User requests reset, system sends email with secure token
2. **Step 2: Reset Password** - User submits new password with token, system validates and updates

**Key Components:**

- **PasswordResetService** - Manages reset tokens and password updates
- **EmailService** - Sends password reset emails via SMTP
- **AuthService** - Orchestrates the reset flow
- **Frontend** - Two pages: forgot-password and reset-password

**Security Features:**

- ✅ Generic success message (doesn't reveal if email exists)
- ✅ One-time use tokens (64 characters, cryptographically secure)
- ✅ Token expiration (1 hour)
- ✅ Invalidates all sessions after password change
- ✅ Rate limiting (3 requests per hour, 10 reset attempts per 5 minutes)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Email confirmation after successful reset

---

## 🏗️ Architecture & Flow

### Complete 2-Step Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: REQUEST PASSWORD RESET                                  │
│ User: /forgot-password page                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 1. User Enters Email (POST /api/auth/request-password-reset)   │
│    - Rate limited: 3 attempts per 60 minutes per IP            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. AuthController.requestPasswordReset()                        │
│    - Extract email from request body                            │
│    - Call AuthService.requestPasswordReset()                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. PasswordResetService.requestPasswordReset()                  │
│    - Call createResetToken(email)                               │
│    - Send reset email (if user exists)                          │
│    - Always return success message                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. PasswordResetService.createResetToken()                      │
│    - Find user by email                                         │
│    - If not found: Generate fake token (prevent timing attacks) │
│    - If found: Generate real 64-char token                      │
│    - Delete old unused tokens for this user                     │
│    - Store in password_reset_tokens table                       │
│    - Set expiration: 1 hour                                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 5. EmailService.sendPasswordResetEmail()                        │
│    - Build reset URL: /reset-password?token=xxx                 │
│    - Create HTML + text email                                   │
│    - Send via SMTP (nodemailer)                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 6. Return Generic Success Response                              │
│    - "If an account with that email exists, a password reset   │
│      link has been sent."                                       │
│    - Same message whether email exists or not                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: RESET PASSWORD WITH TOKEN                               │
│ User: /reset-password?token=xxx page                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 7. Frontend: Verify Token on Page Load                          │
│    - POST /api/auth/verify-reset-token                          │
│    - Display form if valid, error message if invalid            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 8. User Submits New Password (POST /api/auth/reset-password)   │
│    - Rate limited: 10 attempts per 5 minutes per IP             │
│    - Input: token + newPassword                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 9. AuthController.resetPassword()                               │
│    - Extract token, newPassword, ipAddress                      │
│    - Call AuthService.resetPassword()                           │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 10. PasswordResetService.resetPassword()                        │
│     - Verify token (exists, not expired, not used)              │
│     - Hash new password with bcrypt (10 rounds)                 │
│     - Begin database transaction:                               │
│       • Update users.password = hashed_password                 │
│       • Mark token as used (used = true, used_at = NOW())       │
│       • Delete all sessions for this user (invalidate)          │
│     - Commit transaction                                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 11. Return Success Response                                     │
│     - "Password has been reset successfully"                    │
│     - Frontend redirects to /login after 3 seconds              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── auth.routes.ts                          # Route definitions
│   │   ├─ POST /auth/request-password-reset → Lines 273-299
│   │   │  - Rate limiting: 3 attempts/1 hour per IP
│   │   │  - Handler: authController.requestPasswordReset
│   │   │
│   │   ├─ POST /auth/verify-reset-token → Lines 301-319
│   │   │  - Verify token validity before showing form
│   │   │  - Handler: authController.verifyResetToken
│   │   │
│   │   └─ POST /auth/reset-password → Lines 321-358
│   │      - Rate limiting: 10 attempts/5 minutes per IP
│   │      - Handler: authController.resetPassword
│   │
│   ├── auth.controller.ts                      # HTTP request handlers
│   │   ├─ requestPasswordReset() → Lines 284-306
│   │   │  - Extract email from request
│   │   │  - Call authService.requestPasswordReset()
│   │   │  - Return success response
│   │   │
│   │   ├─ verifyResetToken() → Lines 308-359
│   │   │  - Extract token from request
│   │   │  - Call authService.verifyResetToken()
│   │   │  - Return valid/invalid response
│   │   │
│   │   └─ resetPassword() → Lines 361-416
│   │      - Extract token, newPassword, ipAddress
│   │      - Call authService.resetPassword()
│   │      - Return success/error response
│   │
│   ├── services/
│   │   ├── auth.service.ts                     # Orchestrator
│   │   │   ├─ requestPasswordReset() → Line 426-427
│   │   │   ├─ verifyResetToken() → Lines 433-434
│   │   │   └─ resetPassword() → Lines 440-445
│   │   │      (Delegates to PasswordResetService)
│   │   │
│   │   └── password-reset.service.ts           # Core password reset logic
│   │       ├─ createResetToken() → Lines 55-111
│   │       │  - Generate secure token
│   │       │  - Store in database
│   │       │  - Handle fake tokens for security
│   │       │
│   │       ├─ verifyResetToken() → Lines 116-152
│   │       │  - Check token exists
│   │       │  - Check not already used
│   │       │  - Check not expired
│   │       │
│   │       ├─ resetPassword() → Lines 157-220
│   │       │  - Verify token
│   │       │  - Hash new password
│   │       │  - Update user password
│   │       │  - Mark token as used
│   │       │  - Invalidate all sessions
│   │       │
│   │       ├─ sendResetEmail() → Lines 225-231
│   │       │  - Wrapper to EmailService
│   │       │
│   │       ├─ cleanupExpiredTokens() → Lines 236-248
│   │       │  - Maintenance method
│   │       │
│   │       └─ requestPasswordReset() → Lines 253-277
│   │          - Public method combining create + send
│   │
│   └── auth.types.ts                           # TypeScript interfaces
│       ├─ RequestPasswordResetRequest
│       ├─ VerifyResetTokenRequest
│       └─ ResetPasswordRequest
│
└── email/
    └── email.service.ts                        # SMTP email sending
        └─ sendPasswordResetEmail() → Lines 264-335
           - Build reset URL with token
           - Create HTML + text email
           - Send via nodemailer
```

### Frontend Files

```
apps/web/src/app/
├── pages/auth/
│   ├── forgot-password.page.ts                 # Step 1: Request reset
│   │   ├─ forgotPasswordForm → Line 273
│   │   │  - Email input field
│   │   │
│   │   └─ onSubmit() → Lines 278-303
│   │      - Validate email
│   │      - Call passwordResetService.requestPasswordReset()
│   │      - Show success message
│   │
│   └── reset-password.page.ts                  # Step 2: Reset password
│       ├─ ngOnInit() → Lines 433-447
│       │  - Extract token from URL query params
│       │  - Call verifyToken()
│       │
│       ├─ verifyToken() → Lines 449-460
│       │  - Call passwordResetService.verifyResetToken()
│       │  - Show form if valid, error if invalid
│       │
│       ├─ resetPasswordForm → Lines 424-430
│       │  - newPassword + confirmPassword fields
│       │  - Password match validator
│       │
│       └─ onSubmit() → Lines 462-494
│          - Validate form
│          - Call passwordResetService.resetPassword()
│          - Redirect to /login after 3 seconds
│
└── core/auth/services/
    └── password-reset.service.ts               # Frontend service
        ├─ requestPasswordReset() → POST /auth/request-password-reset
        ├─ verifyResetToken() → POST /auth/verify-reset-token
        └─ resetPassword() → POST /auth/reset-password
```

---

## 🔍 Implementation Details

### STEP 1: Request Password Reset

#### 1.1 Route Configuration - Rate Limiting

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 273-299:**

```typescript
// POST /api/auth/request-password-reset
typedFastify.route({
  method: 'POST',
  url: '/auth/request-password-reset',
  config: {
    rateLimit: {
      max: 3, // 3 reset requests
      timeWindow: '1 hour', // per hour per IP
      keyGenerator: (req) => req.ip || 'unknown',
    },
  },
  schema: {
    tags: ['Authentication'],
    summary: 'Request password reset',
    description: 'Sends a password reset email with a secure token. ' + 'Always returns success for security (does not reveal if email exists). ' + 'Tokens expire after 1 hour.',
    body: SchemaRefs.module('auth', 'requestPasswordResetRequest'),
    response: {
      200: SchemaRefs.module('auth', 'requestPasswordResetResponse'),
      429: SchemaRefs.ServerError, // Rate limit exceeded
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.requestPasswordReset,
});
```

**Rate Limiting Strategy:**

- ✅ **3 attempts per hour** (prevents abuse while allowing legitimate retries)
- ✅ **Key: IP address** (prevents spamming from single source)
- ✅ **429 status code** for rate limit exceeded

**Why 3 attempts per hour?**

- Prevents automated password reset attacks
- Allows legitimate users to retry if email not received
- Balances security and user experience

---

#### 1.2 AuthController.requestPasswordReset()

**File:** `apps/api/src/core/auth/auth.controller.ts`

**Lines 284-306:**

```typescript
async requestPasswordReset(request: FastifyRequest, reply: FastifyReply) {
  const { email } = request.body as RequestPasswordResetRequest;

  const result = await request.server.authService.requestPasswordReset(email);

  return reply.send({
    success: true,
    data: {
      message: result.message,
    },
    message: result.message,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      requestId: request.id,
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
```

**What it does:**

- ✅ Extracts email from request body
- ✅ Calls AuthService.requestPasswordReset()
- ✅ Always returns 200 success (security)
- ✅ Includes metadata for debugging

---

#### 1.3 PasswordResetService.requestPasswordReset()

**File:** `apps/api/src/core/auth/services/password-reset.service.ts`

**Lines 253-277:**

```typescript
async requestPasswordReset(email: string): Promise<ResetResult> {
  const { token, userId } = await this.createResetToken(email);

  // Always return success for security (don't reveal if email exists)
  // But only send email if user actually exists
  if (userId) {
    // Get user details to personalize email
    const user = await this.db('users').where('id', userId).first();

    if (user) {
      await this.sendResetEmail(
        email,
        token,
        `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      );
    }
  }

  return {
    success: true,
    message:
      'If an account with that email exists, a password reset link has been sent.',
  };
}
```

**Security Feature:**

- ✅ **Generic success message** - doesn't reveal if email exists
- ✅ **Same response time** - fake token generated for non-existent emails
- ✅ **Email only sent if user exists** - but response is identical
- ✅ **Prevents email enumeration attacks**

---

#### 1.4 PasswordResetService.createResetToken()

**File:** `apps/api/src/core/auth/services/password-reset.service.ts`

**Lines 55-111:**

```typescript
async createResetToken(
  email: string,
): Promise<{ token: string; userId: string }> {
  // Find user by email
  const user = await this.db('users')
    .where('email', email)
    .whereNull('deleted_at')
    .first();

  if (!user) {
    // For security, don't reveal if email exists
    // But still generate a fake token to prevent timing attacks
    const fakeToken = randomBytes(this.TOKEN_LENGTH).toString('hex');

    this.fastify.log.info({
      msg: 'Password reset requested for non-existent email',
      email,
    });

    // Return fake data
    return { token: fakeToken, userId: '' };
  }

  // Generate secure random token
  const token = randomBytes(this.TOKEN_LENGTH).toString('hex');

  // Calculate expiration (1 hour from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

  // Delete any existing unused tokens for this user
  await this.db('password_reset_tokens')
    .where('user_id', user.id)
    .where('used', false)
    .del();

  // Create new reset token record
  await this.db('password_reset_tokens').insert({
    id: this.db.raw('gen_random_uuid()'),
    user_id: user.id,
    token,
    email,
    used: false,
    expires_at: expiresAt,
    created_at: this.db.fn.now(),
    updated_at: this.db.fn.now(),
  });

  this.fastify.log.info({
    msg: 'Password reset token created',
    userId: user.id,
    email,
    expiresAt,
  });

  return { token, userId: user.id };
}
```

**Token Generation:**

- **Length:** 64 characters (32 bytes hex)
- **Algorithm:** `crypto.randomBytes()` - Cryptographically secure
- **Example:** `a1b2c3d4e5f6...` (64 chars)
- **Expiration:** 1 hour (configurable via `EXPIRATION_HOURS`)

**Security Measures:**

- ✅ Generates fake token if email doesn't exist (prevents timing attacks)
- ✅ Deletes old unused tokens for user (prevents token accumulation)
- ✅ Excludes soft-deleted users (`whereNull('deleted_at')`)
- ✅ Logs all attempts for security audit

---

#### 1.5 EmailService.sendPasswordResetEmail()

**File:** `apps/api/src/core/email/email.service.ts`

**Lines 264-335:**

```typescript
async sendPasswordResetEmail(
  to: string,
  token: string,
  userName?: string,
): Promise<boolean> {
  const resetUrl = `${process.env.WEB_URL || 'http://localhost:4200'}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            <p>We received a request to reset your password for your AegisX Platform account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AegisX Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${userName || 'there'},

We received a request to reset your password for your AegisX Platform account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

⚠️ SECURITY NOTICE:
If you didn't request a password reset, please ignore this email and ensure your account is secure.

© ${new Date().getFullYear()} AegisX Platform. All rights reserved.
  `.trim();

  return await this.sendEmail({
    to,
    subject: 'Reset Your Password - AegisX Platform',
    text,
    html,
  });
}
```

**Email Content:**

- **Subject:** "Reset Your Password - AegisX Platform"
- **Reset URL:** `http://localhost:4200/reset-password?token=xxx`
- **Expiration:** 1 hour (clearly stated)
- **Security Notice:** Warns user to ignore if they didn't request

**Email Format:**

- ✅ HTML version with styling
- ✅ Plain text fallback
- ✅ Responsive design
- ✅ Clear call-to-action button
- ✅ Security warning

---

### STEP 2: Reset Password with Token

#### 2.1 Optional: Verify Reset Token (Frontend Pre-Check)

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 301-319:**

```typescript
// POST /api/auth/verify-reset-token
typedFastify.route({
  method: 'POST',
  url: '/auth/verify-reset-token',
  schema: {
    tags: ['Authentication'],
    summary: 'Verify password reset token',
    description: 'Checks if a password reset token is valid and not expired. ' + 'Used by frontend to validate token before showing reset form.',
    body: SchemaRefs.module('auth', 'verifyResetTokenRequest'),
    response: {
      200: SchemaRefs.module('auth', 'verifyResetTokenResponse'),
      400: SchemaRefs.ValidationError,
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.verifyResetToken,
});
```

**Purpose:**

- Validates token before showing password reset form
- Improves UX (shows error immediately if token invalid/expired)
- Prevents users from filling form with invalid token

---

#### 2.2 PasswordResetService.verifyResetToken()

**File:** `apps/api/src/core/auth/services/password-reset.service.ts`

**Lines 116-152:**

```typescript
async verifyResetToken(
  token: string,
): Promise<ResetResult & { userId?: string }> {
  // Find reset token record
  const resetRecord = await this.db('password_reset_tokens')
    .where('token', token)
    .first();

  if (!resetRecord) {
    return {
      success: false,
      message: 'Invalid reset token',
    };
  }

  // Check if already used
  if (resetRecord.used) {
    return {
      success: false,
      message: 'Reset token has already been used',
    };
  }

  // Check if expired
  if (new Date() > new Date(resetRecord.expires_at)) {
    return {
      success: false,
      message: 'Reset token has expired. Please request a new one.',
    };
  }

  return {
    success: true,
    message: 'Reset token is valid',
    userId: resetRecord.user_id,
  };
}
```

**Validation Checks:**

1. ✅ **Token exists** in database
2. ✅ **Not already used** (`used = false`)
3. ✅ **Not expired** (expires_at > now)

**Error Messages:**

- ❌ Token doesn't exist → "Invalid reset token"
- ❌ Token already used → "Reset token has already been used"
- ❌ Token expired → "Reset token has expired. Please request a new one."

---

#### 2.3 Route Configuration - Reset Password

**File:** `apps/api/src/core/auth/auth.routes.ts`

**Lines 321-358:**

```typescript
// POST /api/auth/reset-password
typedFastify.route({
  method: 'POST',
  url: '/auth/reset-password',
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
          message: 'Too many password reset attempts. Please try again in a few minutes.',
          statusCode: 429,
        },
      }),
    },
  },
  schema: {
    tags: ['Authentication'],
    summary: 'Reset password',
    description: 'Resets user password using a valid reset token. ' + 'Invalidates all existing sessions for security. ' + 'Token can only be used once.',
    body: SchemaRefs.module('auth', 'resetPasswordRequest'),
    response: {
      200: SchemaRefs.module('auth', 'resetPasswordResponse'),
      400: SchemaRefs.ValidationError,
      429: SchemaRefs.ServerError, // Rate limit exceeded
      500: SchemaRefs.ServerError,
    },
  },
  handler: authController.resetPassword,
});
```

**Rate Limiting Strategy:**

- ✅ **10 attempts per 5 minutes** (allows password validation retries)
- ✅ **More generous than request** (user might retry due to validation errors)
- ✅ **Still prevents brute force** attacks

---

#### 2.4 PasswordResetService.resetPassword()

**File:** `apps/api/src/core/auth/services/password-reset.service.ts`

**Lines 157-220:**

```typescript
async resetPassword(
  token: string,
  newPassword: string,
  ipAddress?: string,
): Promise<ResetResult> {
  // Verify token first
  const verification = await this.verifyResetToken(token);
  if (!verification.success || !verification.userId) {
    return {
      success: false,
      message: verification.message,
    };
  }

  const userId = verification.userId;

  try {
    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Use transaction for atomicity
    await this.db.transaction(async (trx) => {
      // Update user password
      await trx('users').where('id', userId).update({
        password: hashedPassword,
        updated_at: trx.fn.now(),
      });

      // Mark token as used
      await trx('password_reset_tokens')
        .where('token', token)
        .update({
          used: true,
          used_at: trx.fn.now(),
          ip_address: ipAddress || null,
          updated_at: trx.fn.now(),
        });

      // Invalidate all existing sessions for security
      await trx('user_sessions').where('user_id', userId).del();
    });

    this.fastify.log.info({
      msg: 'Password reset successfully',
      userId,
    });

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  } catch (error) {
    this.fastify.log.error({
      msg: 'Failed to reset password',
      error,
      userId,
    });

    return {
      success: false,
      message: 'Failed to reset password. Please try again.',
    };
  }
}
```

**Process Flow:**

1. ✅ **Verify token** (exists, not expired, not used)
2. ✅ **Hash new password** with bcrypt (10 rounds)
3. ✅ **Database transaction** (all-or-nothing):
   - Update `users.password` = hashed_password
   - Mark token as used (`used = true`, `used_at = NOW()`)
   - Delete all `user_sessions` for this user
4. ✅ **Log success/failure** for audit

**Why Transaction?**

- Ensures atomicity: Either all operations succeed or none
- Prevents partial updates (e.g., password changed but token not marked as used)
- Database consistency guaranteed

**Why Invalidate Sessions?**

- ✅ Security: If password was compromised, attacker's sessions are terminated
- ✅ Forces user to login with new password
- ✅ Standard security practice

---

### Frontend Implementation

#### 3.1 Forgot Password Page

**File:** `apps/web/src/app/pages/auth/forgot-password.page.ts`

**Lines 272-303:**

```typescript
constructor() {
  this.forgotPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
}

protected onSubmit(): void {
  if (this.forgotPasswordForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  const { email } = this.forgotPasswordForm.value;

  this.passwordResetService.requestPasswordReset(email).subscribe({
    next: (message) => {
      this.isLoading.set(false);
      this.successMessage.set(message);
      this.forgotPasswordForm.reset();
    },
    error: (error) => {
      this.isLoading.set(false);
      this.errorMessage.set(
        error.message || 'Failed to send reset link. Please try again.',
      );
    },
  });
}
```

**Form Validation:**

- ✅ Email required
- ✅ Email format validation
- ✅ Client-side validation before API call

**UX Features:**

- ✅ Loading spinner during request
- ✅ Success message after submission
- ✅ Error message if request fails
- ✅ Form reset after successful submission

---

#### 3.2 Reset Password Page

**File:** `apps/web/src/app/pages/auth/reset-password.page.ts`

**Lines 423-494:**

```typescript
constructor() {
  this.resetPasswordForm = this.formBuilder.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );
}

ngOnInit(): void {
  // Get token from query parameter
  this.route.queryParams.subscribe((params) => {
    this.resetToken = params['token'];

    if (!this.resetToken) {
      this.isVerifying.set(false);
      this.isTokenValid.set(false);
      return;
    }

    // Verify token
    this.verifyToken(this.resetToken);
  });
}

private verifyToken(token: string): void {
  this.passwordResetService.verifyResetToken(token).subscribe({
    next: (response) => {
      this.isVerifying.set(false);
      this.isTokenValid.set(response.valid);
    },
    error: () => {
      this.isVerifying.set(false);
      this.isTokenValid.set(false);
    },
  });
}

protected onSubmit(): void {
  if (this.resetPasswordForm.invalid || !this.resetToken) {
    this.markFormGroupTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  const { newPassword } = this.resetPasswordForm.value;

  this.passwordResetService
    .resetPassword(this.resetToken, newPassword)
    .subscribe({
      next: (message) => {
        this.isLoading.set(false);
        this.successMessage.set(message);
        this.resetPasswordForm.reset();

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Failed to reset password. Please try again.',
        );
      },
    });
}

private passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}
```

**Page States:**

1. **Verifying** - Checking token validity on load
2. **Invalid Token** - Shows error message, link to request new token
3. **Valid Token** - Shows password reset form

**Form Validation:**

- ✅ New password required (minimum 8 characters)
- ✅ Confirm password required
- ✅ Passwords must match (custom validator)

**UX Features:**

- ✅ Password visibility toggle (eye icon)
- ✅ Loading spinner during reset
- ✅ Success message
- ✅ Auto-redirect to login after 3 seconds
- ✅ Error handling

---

## 🛠️ Troubleshooting Guide

### Problem 1: No Email Received

**Symptoms:**

- Request password reset succeeds
- Success message shows
- No email in inbox

**Check 1: SMTP Credentials Configured?**

```bash
# Check .env.local
cat .env.local | grep SMTP

# Should see:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=aegisx.platform@gmail.com
SMTP_PASSWORD=lobczhychkrmnbmi
FROM_EMAIL=aegisx.platform@gmail.com
```

**Check 2: API Server Logs**

```bash
# Start API and look for:
pnpm run dev:api

# ✅ Good (SMTP configured):
[EMAIL_SERVICE] SMTP credentials found, initializing...
Email service initialized with SMTP

# ❌ Bad (No SMTP):
[EMAIL_SERVICE] No SMTP credentials, using console logging
```

**Check 3: Kill Multiple API Processes**

```bash
# Check for multiple processes
ps aux | grep "nx serve api"

# If multiple found, kill them:
pkill -f "nx serve api"

# Then start fresh:
pnpm run dev:api
```

**Check 4: Spam Folder**

- Check Gmail spam/junk folder
- Mark as "Not Spam" if found
- Add sender to contacts

**See Also:** [Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md) for detailed SMTP troubleshooting.

---

### Problem 2: Token Expired or Invalid

**Symptoms:**

- User clicks reset link
- Error: "Reset token has expired" or "Invalid reset token"

**Possible Causes:**

1. **Token expired** (1 hour passed since request)
2. **Token already used**
3. **Token not found** (database was reset)
4. **URL malformed** (token truncated)

**Check Database:**

```sql
-- Check token status
SELECT
  token,
  email,
  used,
  used_at,
  expires_at,
  created_at
FROM password_reset_tokens
WHERE email = 'user@example.com'
ORDER BY created_at DESC
LIMIT 1;

-- Check if expired
SELECT
  token,
  expires_at,
  (expires_at < NOW()) as is_expired,
  used
FROM password_reset_tokens
WHERE token = 'token-from-email';
```

**Solutions:**

1. **If expired:** Request new password reset
2. **If already used:** Request new password reset
3. **If not found:** Request new password reset

---

### Problem 3: Token Already Used

**Symptoms:**

- User clicks reset link again
- Error: "Reset token has already been used"

**Cause:**

- User already used this token to reset password
- Token marked as `used = true` in database

**Check Database:**

```sql
SELECT used, used_at FROM password_reset_tokens WHERE token = 'xxx';
```

**Solution:**

```bash
# User must request new password reset
# Old tokens cannot be reused (security feature)
```

**Why This Matters:**

- Prevents token reuse attacks
- If attacker intercepts token, they can only use it once
- Original user's password change invalidates the token

---

### Problem 4: Sessions Not Invalidated

**Symptoms:**

- User resets password
- Old sessions still active
- User can continue using app without re-login

**Check:**

```sql
-- Check if sessions were deleted
SELECT COUNT(*) FROM user_sessions WHERE user_id = 'user-id-here';
-- Should be 0 after password reset

-- Check user_sessions table name
SHOW TABLES LIKE '%session%';
-- Might be 'sessions' instead of 'user_sessions'
```

**Possible Causes:**

1. **Table name mismatch** - Code uses `user_sessions`, database has `sessions`
2. **Transaction failed** - Check logs for errors
3. **Foreign key constraint** - Check if cascading deletes work

**Fix:**

Update `password-reset.service.ts` line 196 to match your table name:

```typescript
// Check your actual table name first:
await trx('sessions').where('user_id', userId).del();
// OR
await trx('user_sessions').where('user_id', userId).del();
```

---

### Problem 5: Rate Limit Reached

**Symptoms:**

- Error: "Too many password reset attempts"
- Status code: 429

**Cause:**

- Fastify rate limiter: 3 requests per hour per IP

**Check:**

```bash
# Wait 1 hour for rate limit to reset
# Or use different IP address
```

**Temporary Fix (Development Only):**

```typescript
// In auth.routes.ts, increase limit:
config: {
  rateLimit: {
    max: 10, // Increase from 3
    timeWindow: '1 hour',
  },
},
```

**Why 3 Per Hour?**

- Prevents automated password reset attacks
- Allows legitimate retries
- Protects against email bombing

---

### Problem 6: Password Not Updated

**Symptoms:**

- Password reset succeeds
- Success message shows
- User cannot login with new password

**Check:**

```sql
-- Check if password was actually updated
SELECT email, updated_at FROM users WHERE email = 'user@example.com';
-- updated_at should be recent

-- Try logging in with old password
-- If old password works, new password not saved

-- Check password hash length
SELECT email, LENGTH(password) as password_length FROM users WHERE email = 'user@example.com';
-- Should be 60 characters (bcrypt hash)
```

**Possible Causes:**

1. **Transaction rollback** - Error occurred, changes rolled back
2. **User ID mismatch** - Wrong user updated
3. **Database connection issue**

**Check Logs:**

```bash
# Look for:
[ERROR] Failed to reset password
# Or
[INFO] Password reset successfully
```

**Solution:**

1. Check API logs for errors
2. Verify transaction completes successfully
3. Ensure bcrypt hash is 60 characters

---

## 🔒 Security Considerations

### 1. Email Enumeration Protection

**Problem:** Attackers can discover which emails are registered by trying password resets.

**Solution:**

- ✅ **Generic success message** - same message whether email exists or not
- ✅ **Fake token generation** - prevents timing attacks
- ✅ **Same response time** - no difference in processing time

**Implementation:**

```typescript
// Always return success
return {
  success: true,
  message: 'If an account with that email exists, a password reset link has been sent.',
};

// Generate fake token for non-existent emails
if (!user) {
  const fakeToken = randomBytes(this.TOKEN_LENGTH).toString('hex');
  return { token: fakeToken, userId: '' };
}
```

---

### 2. Token Security

**Token Generation:**

- ✅ Uses `crypto.randomBytes(32)` - Cryptographically secure
- ✅ 64-character hex string (256 bits of entropy)
- ✅ Practically impossible to guess or brute force

**Token Properties:**

- **Length:** 64 characters
- **Entropy:** 256 bits
- **Expiration:** 1 hour
- **One-time use:** Marked as `used = true` after reset
- **Storage:** Database only (not in JWT)

**Token Lifecycle:**

1. Generated → stored in database
2. Sent via email → user receives
3. Validated → checked before reset
4. Used → marked as used, cannot be reused
5. Expired → automatically invalid after 1 hour

---

### 3. Rate Limiting

**Two Layers:**

1. **Request Reset:** 3 attempts per hour per IP
2. **Reset Password:** 10 attempts per 5 minutes per IP

**Why Different Limits?**

- **Request (3/hour):** Prevents email bombing and enumeration
- **Reset (10/5min):** Allows password validation retries

**Benefits:**

- Prevents automated attacks
- Protects email service from abuse
- Allows legitimate user retries

---

### 4. Session Invalidation

**Why Invalidate All Sessions?**

- ✅ **Security:** If password was compromised, terminate attacker's access
- ✅ **Audit trail:** Forces re-login, creates new audit entries
- ✅ **Standard practice:** Industry standard security measure

**Implementation:**

```typescript
// Delete all sessions for user
await trx('user_sessions').where('user_id', userId).del();
```

**Impact:**

- All devices logged out
- User must login again on all devices
- Refresh tokens invalidated

---

### 5. Password Hashing

**Algorithm:** bcrypt with 10 rounds

```typescript
const hashedPassword = await hash(newPassword, 10);
```

**Why bcrypt?**

- ✅ Resistant to rainbow table attacks (automatic salt)
- ✅ Resistant to brute force (slow by design)
- ✅ Industry standard for password hashing
- ✅ Automatic salt generation

**Output:**

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

---

### 6. Error Message Security

**Generic Messages:**

- ✅ "Invalid reset token" (doesn't reveal why invalid)
- ✅ "Reset token has expired" (specific but safe)
- ✅ "If an account with that email exists..." (doesn't confirm existence)

**What NOT to Say:**

- ❌ "Email does not exist"
- ❌ "User not found"
- ❌ "Account is disabled"

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Start API and Web servers
pnpm run dev:api
pnpm run dev:web

# 2. Test request password reset
# Go to http://localhost:4200/forgot-password
# Enter valid email
# Submit form
# Check success message
# Check email inbox (wait 10-30 seconds)

# 3. Test email received
# Open email
# Click "Reset Password" button
# Should redirect to /reset-password?token=xxx

# 4. Test token verification
# Page should verify token on load
# If valid: show password reset form
# If invalid: show error message

# 5. Test password reset form
# Enter new password (min 8 characters)
# Enter confirm password (must match)
# Submit form
# Check success message
# Should redirect to /login after 3 seconds

# 6. Test login with new password
# Go to /login
# Login with email + new password
# Should succeed

# 7. Test old password
# Logout
# Try to login with old password
# Should fail (password changed)

# 8. Test token reuse
# Try to use same reset link again
# Should fail: "Reset token has already been used"

# 9. Test token expiration
# Request new password reset
# Wait 1 hour
# Click reset link
# Should fail: "Reset token has expired"

# 10. Test rate limiting
# Request password reset 3 times quickly
# 4th attempt should fail: "Too many reset attempts"

# 11. Verify database records
psql aegisx_db -c "SELECT token, email, used, expires_at FROM password_reset_tokens WHERE email='test@example.com';"
# Should show token with used=true

# 12. Verify sessions invalidated
psql aegisx_db -c "SELECT COUNT(*) FROM sessions WHERE user_id=(SELECT id FROM users WHERE email='test@example.com');"
# Should show 0 sessions (all invalidated)
```

---

## 📊 Database Schema

### password_reset_tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used);
```

**Important Fields:**

| Field      | Type      | Description                                  |
| ---------- | --------- | -------------------------------------------- |
| token      | VARCHAR   | 64-char hex token (unique, indexed)          |
| user_id    | UUID      | Reference to users table                     |
| email      | VARCHAR   | User email (for reference)                   |
| used       | BOOLEAN   | Whether token has been used (default: false) |
| used_at    | TIMESTAMP | When token was used (null until used)        |
| expires_at | TIMESTAMP | When token expires (1 hour from creation)    |
| ip_address | VARCHAR   | IP address of user who used token (audit)    |
| created_at | TIMESTAMP | When token was created                       |
| updated_at | TIMESTAMP | Last update (marked as used)                 |

---

### users Table (Relevant Fields)

```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
```

---

### sessions Table (For Invalidation)

```sql
-- Ensure this table exists (might be named 'user_sessions')
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
```

---

## 🎯 Environment Variables Reference

### Required for Password Reset

| Variable        | Example                     | Description                            |
| --------------- | --------------------------- | -------------------------------------- |
| `SMTP_HOST`     | `smtp.gmail.com`            | SMTP server hostname                   |
| `SMTP_PORT`     | `587`                       | SMTP server port (587 or 465)          |
| `SMTP_SECURE`   | `false`                     | Use TLS? (true for 465, false for 587) |
| `SMTP_USER`     | `aegisx.platform@gmail.com` | SMTP username                          |
| `SMTP_PASSWORD` | `abcd1234efgh5678`          | SMTP password (App Password for Gmail) |
| `FROM_EMAIL`    | `aegisx.platform@gmail.com` | Sender email address                   |
| `WEB_URL`       | `http://localhost:4200`     | Frontend URL for reset links           |
| `DATABASE_URL`  | `postgresql://...`          | PostgreSQL connection string           |

### Optional

| Variable   | Example      | Default       | Description                       |
| ---------- | ------------ | ------------- | --------------------------------- |
| `NODE_ENV` | `production` | `development` | Environment (affects SMTP config) |

---

## 💡 Quick Fixes

### Fix 1: Test Password Reset Flow Manually

```bash
# Request password reset
curl -X POST http://localhost:3333/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check email for token
# Or get token from database:
psql aegisx_db -c "SELECT token FROM password_reset_tokens WHERE email='test@example.com' ORDER BY created_at DESC LIMIT 1;"

# Verify token
curl -X POST http://localhost:3333/api/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token": "token-from-email"}'

# Reset password
curl -X POST http://localhost:3333/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-from-email",
    "newPassword": "NewPass123"
  }'
```

---

### Fix 2: Manually Expire a Token

```sql
-- Make token expire immediately
UPDATE password_reset_tokens
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE email = 'test@example.com' AND used = false;

-- Test that expired token is rejected
```

---

### Fix 3: Clean Up Old Tokens

```sql
-- Delete all expired tokens
DELETE FROM password_reset_tokens
WHERE used = false AND expires_at < NOW();

-- Delete all used tokens older than 7 days
DELETE FROM password_reset_tokens
WHERE used = true AND used_at < NOW() - INTERVAL '7 days';
```

Or use the service method:

```typescript
// In PasswordResetService
await this.cleanupExpiredTokens();
```

---

### Fix 4: Debug Token Validation

Add logging to `verifyResetToken()`:

```typescript
async verifyResetToken(token: string): Promise<ResetResult & { userId?: string }> {
  console.log('[PASSWORD_RESET] Verifying token:', token);

  const resetRecord = await this.db('password_reset_tokens')
    .where('token', token)
    .first();

  console.log('[PASSWORD_RESET] Token record:', {
    found: !!resetRecord,
    used: resetRecord?.used,
    expires_at: resetRecord?.expires_at,
    is_expired: resetRecord ? new Date() > new Date(resetRecord.expires_at) : null,
  });

  // ... rest of method
}
```

---

## 📚 Related Documentation

- **[Login Implementation](./LOGIN_IMPLEMENTATION.md)** - Login flow and authentication
- **[Registration Implementation](./REGISTRATION_IMPLEMENTATION.md)** - User registration and auto-login
- **[Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md)** - Email verification and SMTP setup
- **[Authentication Flow](../README.md)** - Complete auth system overview
- **[SMTP Setup Guide](../../getting-started/SMTP_SETUP_GUIDE.md)** - Configure SMTP for emails

---

## ❓ FAQ

**Q: Why does password reset always return success even if email doesn't exist?**

A: Security. Returning different messages reveals which emails are registered, allowing attackers to enumerate user accounts. We return the same message for all requests and generate fake tokens to prevent timing attacks.

**Q: How long is the reset token valid?**

A: 1 hour (configurable via `EXPIRATION_HOURS` in PasswordResetService). This short expiration limits the window for token interception attacks.

**Q: Can a user request multiple password resets?**

A: Yes, but old unused tokens are deleted when a new token is generated. Only the most recent token is valid. Rate limited to 3 requests per hour per IP.

**Q: What happens to active sessions after password reset?**

A: All sessions are invalidated (deleted from database). User must login again on all devices with the new password.

**Q: Can a reset token be used multiple times?**

A: No. After successful password reset, the token is marked as `used = true` and cannot be used again. This prevents token reuse attacks.

**Q: What if the user doesn't receive the email?**

A: Common causes: (1) SMTP not configured, (2) Email in spam folder, (3) Email service error. See [Troubleshooting Guide](#troubleshooting-guide) and [Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md) for SMTP setup.

**Q: How do I know if SMTP is working?**

A: Check API logs on startup. Should see "[EMAIL_SERVICE] SMTP credentials found, initializing..." and "Email service initialized with SMTP". If you see "No SMTP credentials", check .env.local and restart API.

**Q: Can I change the token expiration time?**

A: Yes, modify `EXPIRATION_HOURS` in `PasswordResetService` (line 42). Default is 1 hour for security. Don't make it too long.

**Q: What if I need to reset rate limits?**

A: Rate limits reset automatically after the time window expires. For development, you can increase limits in `auth.routes.ts` or restart the API server to clear in-memory rate limit counters.

**Q: Why are there two rate limits (request vs reset)?**

A: Different purposes. Request limit (3/hour) prevents email bombing. Reset limit (10/5min) allows password validation retries while still preventing brute force.

**Q: Can I customize the email template?**

A: Yes, edit `sendPasswordResetEmail()` in `email.service.ts` (lines 264-335). HTML and text versions are both customizable.

**Q: What happens to tokens in the database?**

A: Expired tokens can be cleaned up periodically using `cleanupExpiredTokens()` method. Used tokens can be kept for audit or deleted after a retention period.

**Q: Is it safe to log password reset attempts?**

A: Yes, but don't log passwords or complete tokens. We log email addresses, user IDs, success/failure, and IP addresses for security audit. This is standard practice.

**Q: What if the table is named 'sessions' instead of 'user_sessions'?**

A: Update line 196 in `password-reset.service.ts` to match your table name. Check with `SHOW TABLES LIKE '%session%'` in your database.

---

**Last Updated:** 2025-11-03
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
