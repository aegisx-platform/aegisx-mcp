# Authentication System - Implementation Overview

> **Complete technical overview of AegisX authentication system with flows, diagrams, and implementation details**

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Complete Feature List](#complete-feature-list)
- [System Flows](#system-flows)
- [Security Features](#security-features)
- [Implementation Details](#implementation-details)
- [Database Schema](#database-schema)

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Angular)                          │
│  ┌────────────┬────────────┬────────────┬────────────────────┐  │
│  │ Login Page │ Register   │ Password   │ Email Verification │  │
│  │            │ Page       │ Reset      │ Page               │  │
│  └─────┬──────┴──────┬─────┴──────┬─────┴──────┬─────────────┘  │
│        │             │            │            │                 │
│  ┌─────▼─────────────▼────────────▼────────────▼─────────────┐  │
│  │              Auth Service (Frontend)                       │  │
│  │  - State Management (Signals)                              │  │
│  │  - Token Storage (localStorage)                            │  │
│  │  - HTTP Client (with interceptors)                         │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   HTTP/HTTPS     │
                    │   /api/auth/*    │
                    └────────┬─────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    Backend (Fastify + Node.js)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Auth Controller                           │  │
│  │  - Route Handlers                                          │  │
│  │  - Request Validation (TypeBox Schemas)                    │  │
│  │  - Error Handling                                          │  │
│  └────────────────────┬──────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼──────────────────────────────────────┐  │
│  │                  Auth Service                              │  │
│  │  - Business Logic                                          │  │
│  │  - Token Generation (JWT)                                  │  │
│  │  - Password Hashing (bcrypt)                               │  │
│  └────┬──────────────┬──────────────┬────────────────────────┘  │
│       │              │              │                            │
│  ┌────▼─────┐  ┌────▼────────┐  ┌─▼────────────────────────┐  │
│  │ Auth     │  │ Email       │  │ Email Verification       │  │
│  │ Repo     │  │ Service     │  │ Service                  │  │
│  └────┬─────┘  └─────────────┘  └──────────────────────────┘  │
│       │                                                          │
│  ┌────▼─────────────────────────────────────────────────────┐  │
│  │              Rate Limiter Middleware                      │  │
│  │  - Redis-based counters                                   │  │
│  │  - Intelligent limits per endpoint                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │                  │
            ┌─────▼─────┐      ┌────▼─────┐
            │ PostgreSQL│      │  Redis   │
            │           │      │          │
            │ - users   │      │ - rates  │
            │ - tokens  │      │ - locks  │
            └───────────┘      └──────────┘
```

---

## 🎯 Complete Feature List

### Core Authentication Features

| Feature                   | Endpoints                                                                                                         | Frontend                                | Status      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| **1. User Registration**  | `POST /api/auth/register`                                                                                         | `/register`                             | ✅ Complete |
| **2. User Login**         | `POST /api/auth/login`                                                                                            | `/login`                                | ✅ Complete |
| **3. User Logout**        | `POST /api/auth/logout`                                                                                           | Button in navbar                        | ✅ Complete |
| **4. Email Verification** | `POST /api/auth/verify-email`<br>`POST /api/auth/resend-verification`                                             | `/verify-email`                         | ✅ Complete |
| **5. Password Reset**     | `POST /api/auth/request-password-reset`<br>`POST /api/auth/verify-reset-token`<br>`POST /api/auth/reset-password` | `/forgot-password`<br>`/reset-password` | ✅ Complete |
| **6. Refresh Token**      | `POST /api/auth/refresh`                                                                                          | Auto (interceptor)                      | ✅ Complete |
| **7. Get Current User**   | `GET /api/auth/me`                                                                                                | Auto (on load)                          | ✅ Complete |
| **8. Get Permissions**    | `GET /api/auth/permissions`                                                                                       | Auto (RBAC)                             | ✅ Complete |

### Security Features

| Feature              | Implementation                    | Status      |
| -------------------- | --------------------------------- | ----------- |
| **Rate Limiting**    | Redis-based, intelligent limits   | ✅ Complete |
| **Account Lockout**  | Auto-lock after failed attempts   | ✅ Complete |
| **JWT Tokens**       | Access (15min) + Refresh (7 days) | ✅ Complete |
| **Password Hashing** | bcrypt (10 rounds)                | ✅ Complete |
| **CSRF Protection**  | Same-origin policy                | ✅ Complete |

---

## 🔄 System Flows

### 1. Complete User Registration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: User Registration                                         │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                   User fills form
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: POST /register                                          │
│ - Email validation                                                │
│ - Password strength check                                         │
│ - Form validation                                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/register                                  │
│ 1. Validate request (TypeBox)                                     │
│ 2. Check if email exists                                          │
│ 3. Hash password (bcrypt)                                         │
│ 4. Create user in database                                        │
│ 5. Generate JWT tokens                                            │
│ 6. Create email verification token                                │
│ 7. Send verification email                                        │
│ 8. Return tokens + user data                                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Auto-login                                              │
│ - Store tokens in localStorage                                    │
│ - Update auth state                                               │
│ - Redirect to /dashboard                                          │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Email Verification (Async)                               │
│ - User receives email                                             │
│ - Clicks verification link                                        │
│ - Frontend: GET /verify-email?token=xxx                          │
│ - Backend: POST /api/auth/verify-email                           │
│ - Mark user as verified                                           │
│ - Show success message                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation Details:** [REGISTRATION_IMPLEMENTATION.md](./REGISTRATION_IMPLEMENTATION.md)

---

### 2. Login Flow with Rate Limiting

```
┌──────────────────────────────────────────────────────────────────┐
│ User enters credentials                                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: POST /login                                             │
│ - Email validation                                                │
│ - Submit credentials                                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: Rate Limiter Check                                       │
│ - Check IP + Email combination in Redis                           │
│ - Limit: 10 attempts per 15 minutes                              │
│ - If exceeded → 429 Too Many Requests                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Allowed
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/login                                     │
│ 1. Find user by email                                             │
│ 2. Check if account is locked                                     │
│ 3. Verify password (bcrypt.compare)                               │
│ 4. If invalid → increment failed attempts                         │
│ 5. If 5 failures → lock account for 15 minutes                   │
│ 6. If valid → reset failed attempts                               │
│ 7. Generate JWT tokens (access + refresh)                         │
│ 8. Save refresh token in database                                 │
│ 9. Return tokens + user data                                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Store tokens & redirect                                │
│ - localStorage.setItem('accessToken', ...)                       │
│ - localStorage.setItem('refreshToken', ...)                      │
│ - Update auth state (signals)                                     │
│ - Redirect to /dashboard                                          │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation Details:** [LOGIN_IMPLEMENTATION.md](./LOGIN_IMPLEMENTATION.md)

---

### 3. Email Verification Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Registration triggers email                                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: Create Verification Token                               │
│ 1. Generate 64-char random token                                 │
│ 2. Store in email_verifications table                            │
│ 3. Set expiration (24 hours)                                      │
│ 4. Build verification URL                                         │
│ 5. Send email via SMTP                                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ User receives email                                               │
│ - Subject: "Verify Your Email Address"                           │
│ - Link: http://localhost:4200/verify-email?token=xxx            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Clicks link
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: /verify-email?token=xxx                                │
│ - Extract token from query params                                │
│ - Show loading spinner                                            │
│ - Call verification API                                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/verify-email                             │
│ 1. Find token in database                                         │
│ 2. Check if expired                                               │
│ 3. Check if already used                                          │
│ 4. Mark token as verified                                         │
│ 5. Update user.email_verified = true                             │
│ 6. Return success                                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Show success                                            │
│ - Green checkmark icon                                            │
│ - "Email verified!" message                                       │
│ - "Go to Login" button                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation Details:** [EMAIL_VERIFICATION_IMPLEMENTATION.md](./EMAIL_VERIFICATION_IMPLEMENTATION.md)

---

### 4. Password Reset Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Request Password Reset                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                   User clicks "Forgot Password"
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: /forgot-password                                        │
│ - User enters email                                               │
│ - Submit request                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/request-password-reset                   │
│ 1. Find user by email                                             │
│ 2. Generate 64-char random token                                 │
│ 3. Store in password_resets table                                │
│ 4. Set expiration (1 hour)                                        │
│ 5. Send email with reset link                                     │
│ 6. Return success (always, even if email not found)              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Verify Token & Reset Password                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                   User receives email
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: /reset-password?token=xxx                              │
│ 1. Extract token from URL                                         │
│ 2. Verify token is valid (optional)                              │
│ 3. Show password reset form                                       │
│ 4. User enters new password                                       │
│ 5. Submit new password + token                                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/reset-password                           │
│ 1. Find token in database                                         │
│ 2. Check if expired                                               │
│ 3. Check if already used                                          │
│ 4. Hash new password                                              │
│ 5. Update user password                                           │
│ 6. Mark token as used                                             │
│ 7. Invalidate all refresh tokens                                  │
│ 8. Return success                                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Redirect to login                                       │
│ - Show success message                                            │
│ - Auto-redirect to /login                                         │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation Details:** [PASSWORD_RESET_IMPLEMENTATION.md](./PASSWORD_RESET_IMPLEMENTATION.md)

---

### 5. Refresh Token Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Access token expires (15 minutes)                                │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: API call fails with 401                                │
│ - HTTP Interceptor catches error                                 │
│ - Check if refresh token exists                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: POST /api/auth/refresh                                 │
│ - Send refresh token in request body                             │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/auth/refresh                                  │
│ 1. Verify refresh token signature                                │
│ 2. Check if token exists in database                             │
│ 3. Check if token is revoked                                      │
│ 4. Check if token is expired (7 days)                            │
│ 5. Generate new access token (15 min)                            │
│ 6. Generate new refresh token (7 days)                           │
│ 7. Save new refresh token                                         │
│ 8. Delete old refresh token                                       │
│ 9. Return new tokens                                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Store new tokens                                        │
│ - Update localStorage                                             │
│ - Retry original failed request                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation Details:** [REFRESH_TOKEN_IMPLEMENTATION.md](./REFRESH_TOKEN_IMPLEMENTATION.md)

---

## 🛡️ Security Features

### Rate Limiting Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Rate Limiting Strategy                        │
└──────────────────────────────────────────────────────────────────┘

Endpoint-Specific Limits:

┌─────────────────────┬──────────┬──────────┬────────────────────┐
│ Endpoint            │ Limit    │ Window   │ Reason             │
├─────────────────────┼──────────┼──────────┼────────────────────┤
│ POST /auth/login    │ 10 req   │ 15 min   │ Brute force        │
│ POST /auth/register │ 5 req    │ 60 min   │ Spam prevention    │
│ POST /auth/refresh  │ 20 req   │ 15 min   │ Normal usage       │
│ POST /verify-email  │ 10 req   │ 15 min   │ Token abuse        │
│ POST /reset-password│ 5 req    │ 60 min   │ Security           │
└─────────────────────┴──────────┴──────────┴────────────────────┘

Tracking Keys:
- IP Address: 192.168.1.1
- Email: user@example.com
- Combined: 192.168.1.1:user@example.com

Redis Structure:
rate_limit:login:192.168.1.1:user@example.com
├─ count: 3
├─ ttl: 847 seconds
└─ first_attempt: 2025-11-02T10:30:00Z
```

**Implementation Details:** [RATE_LIMITING_IMPLEMENTATION.md](./RATE_LIMITING_IMPLEMENTATION.md)

---

### Account Lockout Mechanism

```
┌──────────────────────────────────────────────────────────────────┐
│                  Account Lockout Protection                       │
└──────────────────────────────────────────────────────────────────┘

Flow:

Login Attempt → Password Check → Failed?
                                    │
                                    ▼ Yes
                      Increment failed_login_attempts
                                    │
                                    ▼
                      failed_login_attempts >= 5?
                                    │
                      ┌─────────────┴─────────────┐
                      │                           │
                     Yes                         No
                      │                           │
                      ▼                           ▼
            Lock account for 15 min      Continue login
            Set locked_until timestamp    Return error
            Return 423 Locked
```

**Implementation Details:** [ACCOUNT_LOCKOUT_IMPLEMENTATION.md](./ACCOUNT_LOCKOUT_IMPLEMENTATION.md)

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),

  -- Email verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,

  -- Account security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_locked_until ON users(locked_until);
```

### Email Verifications Table

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

-- Indexes
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);
```

### Password Resets Table

```sql
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## 📚 Implementation Details by Feature

### Core Authentication

1. **[User Registration](./REGISTRATION_IMPLEMENTATION.md)**
   - Account creation flow
   - Input validation
   - Password hashing
   - Auto-login after registration
   - Email verification trigger

2. **[User Login](./LOGIN_IMPLEMENTATION.md)**
   - Credential verification
   - JWT token generation
   - Session management
   - Rate limiting integration
   - Account lockout handling

3. **[Email Verification](./EMAIL_VERIFICATION_IMPLEMENTATION.md)** ✅ Complete
   - Token generation
   - Email sending (SMTP)
   - Token validation
   - Resend functionality
   - UI feedback

4. **[Password Reset](./PASSWORD_RESET_IMPLEMENTATION.md)**
   - Reset request flow
   - Token generation & expiration
   - Email sending
   - Password update
   - Session invalidation

5. **[Refresh Token](./REFRESH_TOKEN_IMPLEMENTATION.md)**
   - Token rotation strategy
   - Automatic refresh
   - HTTP interceptor
   - Security considerations

### Security Features

6. **[Rate Limiting](./RATE_LIMITING_IMPLEMENTATION.md)**
   - Redis-based implementation
   - Per-endpoint configuration
   - IP + Email tracking
   - Intelligent limits

7. **[Account Lockout](./ACCOUNT_LOCKOUT_IMPLEMENTATION.md)**
   - Failed attempt tracking
   - Automatic locking
   - Unlock mechanism
   - Admin override

---

## 🔗 Related Documentation

- **[API Reference](../API_REFERENCE.md)** - Complete API documentation
- **[User Guide](../USER_GUIDE.md)** - End-user documentation
- **[Developer Guide](../DEVELOPER_GUIDE.md)** - Development guidelines
- **[Deployment Guide](../DEPLOYMENT_GUIDE.md)** - Production setup
- **[Troubleshooting](../TROUBLESHOOTING.md)** - Common issues

---

## 📊 Feature Comparison Matrix

| Feature            | Backend | Frontend | Database | Email | Redis | Status   |
| ------------------ | ------- | -------- | -------- | ----- | ----- | -------- |
| Registration       | ✅      | ✅       | ✅       | ✅    | ✅    | Complete |
| Login              | ✅      | ✅       | ✅       | -     | ✅    | Complete |
| Logout             | ✅      | ✅       | ✅       | -     | -     | Complete |
| Email Verification | ✅      | ✅       | ✅       | ✅    | -     | Complete |
| Password Reset     | ✅      | ✅       | ✅       | ✅    | -     | Complete |
| Refresh Token      | ✅      | ✅       | ✅       | -     | -     | Complete |
| Rate Limiting      | ✅      | -        | -        | -     | ✅    | Complete |
| Account Lockout    | ✅      | ✅       | ✅       | -     | -     | Complete |

---

## 🎯 Quick Navigation

**By Use Case:**

- New user? → [Registration](./REGISTRATION_IMPLEMENTATION.md) → [Email Verification](./EMAIL_VERIFICATION_IMPLEMENTATION.md)
- Existing user? → [Login](./LOGIN_IMPLEMENTATION.md)
- Forgot password? → [Password Reset](./PASSWORD_RESET_IMPLEMENTATION.md)
- Session expired? → [Refresh Token](./REFRESH_TOKEN_IMPLEMENTATION.md)

**By Technology:**

- JWT implementation → [Login](./LOGIN_IMPLEMENTATION.md) + [Refresh Token](./REFRESH_TOKEN_IMPLEMENTATION.md)
- Email functionality → [Email Verification](./EMAIL_VERIFICATION_IMPLEMENTATION.md) + [Password Reset](./PASSWORD_RESET_IMPLEMENTATION.md)
- Security → [Rate Limiting](./RATE_LIMITING_IMPLEMENTATION.md) + [Account Lockout](./ACCOUNT_LOCKOUT_IMPLEMENTATION.md)

---

**Last Updated:** 2025-11-02
**Maintained By:** AegisX Platform Team
**Version:** 1.0.0
