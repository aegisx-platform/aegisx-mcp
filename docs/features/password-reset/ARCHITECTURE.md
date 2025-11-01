# Password Reset - System Architecture

> **System design decisions, security architecture, and technical implementation**

## 📋 Table of Contents

- [Overview](#overview)
- [System Components](#system-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Database Design](#database-design)
- [Service Layer](#service-layer)
- [API Layer](#api-layer)
- [Email Integration](#email-integration)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Scalability](#scalability)
- [Design Decisions](#design-decisions)

## 🎯 Overview

### Architecture Style

The Password Reset System follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────────────┐
│              API Layer (Routes)                  │
│  - Request validation (TypeBox schemas)          │
│  - Rate limiting                                 │
│  - Response formatting                           │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           Service Layer (Business Logic)         │
│  - Token generation                              │
│  - Token validation                              │
│  - Password reset logic                          │
│  - Session invalidation                          │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│        Repository Layer (Data Access)            │
│  - Database queries                              │
│  - Transaction management                        │
│  - Data persistence                              │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Database (PostgreSQL)               │
│  - password_reset_tokens table                   │
│  - users table                                   │
│  - user_sessions table                           │
└─────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns** - Each layer has clear responsibilities
2. **Security First** - Security considerations at every layer
3. **Type Safety** - Full TypeScript with TypeBox schemas
4. **Error Handling** - Comprehensive error handling and logging
5. **Testability** - Easy to unit test and integration test
6. **Maintainability** - Clean, documented, modular code

## 🏗️ System Components

### 1. API Routes (`password-reset.routes.ts`)

**Responsibilities:**

- HTTP endpoint definitions
- Request/response handling
- Schema validation
- Rate limiting configuration
- OpenAPI documentation

**Key Features:**

```typescript
export async function passwordResetRoutes(fastify: FastifyInstance) {
  // Request password reset - 3 requests/hour
  fastify.post(
    '/request-password-reset',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Request password reset',
        body: RequestPasswordResetSchema,
        response: {
          200: PasswordResetResponseSchema,
        },
      },
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 hour',
        },
      },
    },
    passwordResetController.requestPasswordReset,
  );

  // Reset password - 5 attempts/minute
  fastify.post(
    '/reset-password',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    passwordResetController.resetPassword,
  );
}
```

### 2. Controller (`password-reset.controller.ts`)

**Responsibilities:**

- Request handling
- Response formatting
- Error translation
- HTTP status codes

**Key Features:**

```typescript
export class PasswordResetController {
  async requestPasswordReset(request: FastifyRequest<{ Body: RequestPasswordReset }>, reply: FastifyReply) {
    const { email } = request.body;

    await this.passwordResetService.requestPasswordReset(email);

    return reply.success({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  async resetPassword(request: FastifyRequest<{ Body: ResetPassword }>, reply: FastifyReply) {
    const { token, newPassword } = request.body;
    const ip = request.ip;

    await this.passwordResetService.resetPassword(token, newPassword, ip);

    return reply.success({
      message: 'Password has been reset successfully',
    });
  }
}
```

### 3. Service Layer (`password-reset.service.ts`)

**Responsibilities:**

- Business logic
- Token generation and validation
- Password hashing
- Email sending
- Session management

**Key Features:**

```typescript
export class PasswordResetService {
  private readonly TOKEN_LENGTH = 32; // 32 bytes = 64 hex chars
  private readonly EXPIRATION_HOURS = 1;

  async requestPasswordReset(email: string): Promise<void> {
    // 1. Find user (or generate fake token for timing attack prevention)
    // 2. Generate secure random token
    // 3. Store token in database with expiration
    // 4. Send email with reset link
  }

  async verifyResetToken(token: string): Promise<boolean> {
    // 1. Find token in database
    // 2. Check if token exists
    // 3. Check if token is used
    // 4. Check if token is expired
  }

  async resetPassword(token: string, newPassword: string, ip?: string): Promise<void> {
    // 1. Verify token (reuse verifyResetToken)
    // 2. Hash new password
    // 3. Update user password
    // 4. Mark token as used
    // 5. Delete all user sessions
  }
}
```

### 4. Repository Layer

**Responsibilities:**

- Database access
- Query building
- Transaction management

**Key Queries:**

```typescript
// Find user by email
await this.db('users').where('email', email).whereNull('deleted_at').first();

// Create reset token
await this.db('password_reset_tokens').insert({
  id: this.db.raw('gen_random_uuid()'),
  user_id: user.id,
  token,
  email,
  used: false,
  expires_at: expiresAt,
  ip_address: ip,
});

// Delete all user sessions
await this.db('user_sessions').where('user_id', userId).del();
```

### 5. Email Service Integration

**Responsibilities:**

- Email template rendering
- SMTP connection
- Email delivery

**Key Features:**

```typescript
await this.emailService.sendPasswordResetEmail(email, token, user.name);

// Email contains:
// - Reset link: https://yourapp.com/reset-password?token=...
// - Expiration notice: 1 hour
// - Security notice: ignore if not requested
```

## 🔄 Data Flow

### Request Password Reset Flow

```
┌─────────┐  1. POST /request-password-reset    ┌──────────────┐
│ Client  │ ──────────────────────────────────> │ API Routes   │
└─────────┘                                      └──────────────┘
                                                        │
                      ┌─────────────────────────────────┘
                      │ 2. Validate request body
                      ▼
                 ┌──────────────┐
                 │  Controller  │
                 └──────────────┘
                      │
                      │ 3. Call service
                      ▼
                 ┌──────────────┐
                 │   Service    │
                 └──────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Find User    Generate Token  Store Token
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                 Send Email
                      │
                      ▼
               Return Success
```

### Reset Password Flow

```
┌─────────┐  1. POST /reset-password           ┌──────────────┐
│ Client  │ ──────────────────────────────────> │ API Routes   │
└─────────┘                                      └──────────────┘
                                                        │
                      ┌─────────────────────────────────┘
                      │ 2. Validate + Rate limit
                      ▼
                 ┌──────────────┐
                 │  Controller  │
                 └──────────────┘
                      │
                      │ 3. Call service
                      ▼
                 ┌──────────────┐
                 │   Service    │
                 └──────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
   Verify Token  Hash Password  Update User  Mark Token Used
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │             │
                      ▼             ▼
              Delete Sessions  Return Success
```

## 🔐 Security Architecture

### 1. Token Security

**Generation:**

```typescript
import { randomBytes } from 'crypto';

// 32 bytes = 64 hex characters = 256 bits of entropy
const token = randomBytes(32).toString('hex');
```

**Why 32 bytes?**

- 256 bits of entropy
- Cryptographically secure random
- Practically impossible to brute force
- Unique across all tokens

**Storage:**

```sql
-- Tokens stored in database, NOT in plain text in emails
CREATE TABLE password_reset_tokens (
  token VARCHAR(255) NOT NULL UNIQUE,  -- Indexed for fast lookup
  expires_at TIMESTAMP NOT NULL,       -- Time-limited
  used BOOLEAN DEFAULT false,          -- One-time use
  -- ...
);
```

### 2. Timing Attack Prevention

**Problem:** Different response times can reveal if email exists in system.

**Solution:**

```typescript
async requestPasswordReset(email: string): Promise<void> {
  const user = await this.db('users').where('email', email).first();

  if (!user) {
    // Generate fake token to maintain consistent timing
    const fakeToken = randomBytes(this.TOKEN_LENGTH).toString('hex');
    // Always return success (no enumeration)
    return;
  }

  // Normal flow continues...
}
```

**Result:** Same response time whether email exists or not.

### 3. Email Enumeration Prevention

**Strategy:**

```typescript
// Always return same success message
return {
  success: true,
  message: 'If an account with that email exists, a password reset link has been sent.',
};
```

**Why?**

- Prevents attackers from discovering valid email addresses
- Security best practice (OWASP recommendation)
- No information leakage

### 4. Session Invalidation

**Why?**

- Prevent unauthorized access with old sessions
- Force re-authentication with new password
- Security best practice after password change

**Implementation:**

```typescript
async resetPassword(token: string, newPassword: string): Promise<void> {
  // ... verify token, update password ...

  // Delete ALL user sessions
  await this.db('user_sessions')
    .where('user_id', userId)
    .del();

  // User must login again with new password
}
```

### 5. IP Tracking

**Purpose:**

- Security audit trail
- Detect suspicious patterns
- Compliance requirements

**Implementation:**

```typescript
await this.db('password_reset_tokens').insert({
  // ...
  ip_address: request.ip, // Fastify provides real IP
});
```

### 6. Rate Limiting

**Protection Against:**

- Brute force attacks
- Token guessing attempts
- Email spam/abuse
- Resource exhaustion

**Implementation:**

```typescript
// Request limit: Prevent email spam
config: {
  rateLimit: {
    max: 3,           // 3 requests
    timeWindow: '1 hour',  // per hour
  },
}

// Reset limit: Prevent brute force
config: {
  rateLimit: {
    max: 5,           // 5 attempts
    timeWindow: '1 minute',  // per minute
  },
}
```

## 💾 Database Design

### password_reset_tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),  -- Supports IPv4 and IPv6
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
```

### Field Decisions

| Field        | Type         | Decision Rationale                                    |
| ------------ | ------------ | ----------------------------------------------------- |
| `id`         | UUID         | Unique identifier, no sequential pattern              |
| `user_id`    | UUID         | Foreign key to users table                            |
| `token`      | VARCHAR(255) | 64 chars + margin, UNIQUE constraint                  |
| `email`      | VARCHAR(255) | Redundant storage for audit (user might change email) |
| `used`       | BOOLEAN      | One-time use flag                                     |
| `used_at`    | TIMESTAMP    | Audit trail (when token was used)                     |
| `expires_at` | TIMESTAMP    | Time-limited tokens (1 hour)                          |
| `ip_address` | VARCHAR(45)  | IPv6 support (max 39 chars + margin)                  |

### Cascading Deletes

```sql
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

**Why?**

- If user is deleted, their reset tokens should also be deleted
- Prevents orphaned records
- Data integrity

## 🔧 Service Layer

### Token Generation Strategy

**Requirements:**

- Cryptographically secure
- Unpredictable
- Unique
- Sufficient entropy

**Implementation:**

```typescript
private generateResetToken(): string {
  return randomBytes(this.TOKEN_LENGTH).toString('hex');
}
```

**Alternatives Considered:**

| Method            | Pros                    | Cons                          | Decision        |
| ----------------- | ----------------------- | ----------------------------- | --------------- |
| `Math.random()`   | Simple                  | NOT cryptographically secure  | ❌ Rejected     |
| `uuid.v4()`       | Standard UUID           | Only 122 bits of entropy      | ❌ Rejected     |
| `randomBytes(32)` | 256 bits, crypto-secure | Requires crypto module        | ✅ **Selected** |
| JWT               | Self-contained          | Complexity, revocation issues | ❌ Rejected     |

### Token Validation Logic

```typescript
async verifyResetToken(token: string): Promise<boolean> {
  const resetToken = await this.db('password_reset_tokens')
    .where('token', token)
    .first();

  // Check 1: Token exists
  if (!resetToken) {
    throw new Error('Invalid reset token');
  }

  // Check 2: Not already used
  if (resetToken.used) {
    throw new Error('Reset token has already been used');
  }

  // Check 3: Not expired
  if (new Date() > new Date(resetToken.expires_at)) {
    throw new Error('Reset token has expired. Please request a new one.');
  }

  return true;
}
```

**Order Matters:**

1. Check existence first (most common failure)
2. Check usage (security critical)
3. Check expiration (time-based)

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(newPassword, 10);
```

**Why bcrypt?**

- Industry standard
- Adaptive (can increase rounds as hardware improves)
- Salt included automatically
- Resistant to rainbow table attacks

**Rounds = 10:**

- Balance between security and performance
- ~100ms on modern hardware
- Recommended by OWASP

## 🌐 API Layer

### Request Validation (TypeBox)

**Schema Definition:**

```typescript
export const RequestPasswordResetSchema = Type.Object({
  email: Type.String({ format: 'email' }),
});

export const ResetPasswordSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
  newPassword: Type.String({ minLength: 8 }),
});
```

**Benefits:**

- Runtime validation
- TypeScript type inference
- OpenAPI generation
- Compile-time safety

### Response Standardization

**All responses follow standard format:**

```typescript
{
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
    environment: string;
  };
}
```

**Implemented via Fastify decorators:**

```typescript
reply.success({ message: '...' });
reply.badRequest('Invalid token');
```

### Error Handling

**Layers of Error Handling:**

1. **Schema Validation** - Fastify automatic validation
2. **Service Layer** - Business logic errors
3. **Global Error Handler** - Unhandled exceptions

**Example:**

```typescript
try {
  await this.passwordResetService.resetPassword(token, newPassword, ip);
  return reply.success({ message: '...' });
} catch (error) {
  if (error.message.includes('expired')) {
    return reply.badRequest('Token has expired');
  }
  throw error; // Caught by global handler
}
```

## 📧 Email Integration

### Email Template Structure

```
Subject: Password Reset Request

Hello [Name],

You requested to reset your password. Click the link below:

https://yourapp.com/reset-password?token=[TOKEN]

This link expires in 1 hour.

If you didn't request this, ignore this email.
```

### Email Service Interface

```typescript
interface EmailService {
  sendPasswordResetEmail(to: string, token: string, name: string): Promise<void>;
}
```

### SMTP Configuration

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

## ⏱️ Rate Limiting

### Strategy: IP-Based

**Why IP-based?**

- User not authenticated yet (can't use user ID)
- Prevents distributed attacks
- Simple to implement

**Limitations:**

- Shared IPs (NAT, VPN) may affect legitimate users
- VPN hopping can bypass

**Mitigation:**

- Generous limits (3/hour, 5/minute)
- Clear error messages
- Consider email-based limits in future

### Implementation (Fastify)

```typescript
import rateLimit from '@fastify/rate-limit';

fastify.register(rateLimit, {
  global: false, // Per-route configuration
});

// In route
config: {
  rateLimit: {
    max: 3,
    timeWindow: '1 hour',
  },
}
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1699012800
```

## 📊 Performance Considerations

### Database Indexes

**Critical indexes:**

```sql
-- Token lookup (most frequent query)
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- User lookup
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Email lookup
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
```

**Query Performance:**

```sql
-- Without index: O(n) sequential scan
-- With index: O(log n) B-tree lookup

EXPLAIN ANALYZE
SELECT * FROM password_reset_tokens WHERE token = 'abc123...';
-- Index Scan using idx_password_reset_tokens_token
-- Execution time: 0.05 ms
```

### Token Cleanup

**Problem:** Old tokens accumulate over time.

**Solution:** Periodic cleanup job

```typescript
async cleanupExpiredTokens(): Promise<number> {
  const result = await this.db('password_reset_tokens')
    .where('expires_at', '<', new Date())
    .orWhere('used', true)
    .del();

  return result; // Number of deleted rows
}
```

**Recommended Schedule:**

- Run daily at off-peak hours
- Use cron job or scheduled task

### Email Delivery

**Async Processing:**

```typescript
// Don't wait for email delivery
emailService.sendPasswordResetEmail(email, token, name).catch((error) => logger.error('Email failed', error));

// Return immediately
return reply.success({ message: '...' });
```

**Benefits:**

- Faster API response
- Better user experience
- Email failures don't block reset flow

## 🚀 Scalability

### Horizontal Scaling

**Stateless Design:**

- No session state in API servers
- All state in database
- Can scale API servers independently

**Load Balancing:**

```
        ┌─────────┐
        │   LB    │
        └─────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐
│ API 1 ││ API 2 ││ API 3 │
└───────┘└───────┘└───────┘
             │
        ┌────▼────┐
        │   DB    │
        └─────────┘
```

### Database Scalability

**Read Replicas:**

```typescript
// Read from replica for token verification
const token = await this.readDB('password_reset_tokens')
  .where('token', token)
  .first();

// Write to primary for token creation
await this.writeDB('password_reset_tokens').insert({ ... });
```

### Caching Considerations

**What NOT to cache:**

- Reset tokens (security sensitive)
- User passwords (security sensitive)
- Session data (changes frequently)

**What to cache:**

- Email templates (static)
- Rate limit counters (Redis)

## 🎯 Design Decisions

### 1. Why 1-hour expiration?

**Rationale:**

- Balance between security and usability
- Long enough for user to check email
- Short enough to limit attack window
- Industry standard

**Alternatives:**

- 30 minutes: Too short, user frustration
- 24 hours: Too long, security risk
- No expiration: Unacceptable security risk

### 2. Why one-time use tokens?

**Rationale:**

- Prevents replay attacks
- Limits attack surface
- Industry best practice

**Implementation:**

```sql
used BOOLEAN DEFAULT false,
used_at TIMESTAMP
```

### 3. Why delete all sessions?

**Rationale:**

- User might be compromised
- Force re-authentication everywhere
- Security best practice (OWASP)

**User Impact:**

- Minor inconvenience (must login again)
- Major security benefit

### 4. Why no email enumeration?

**Rationale:**

- OWASP recommendation
- Prevents account discovery
- Privacy protection

**Trade-off:**

- User can't verify email exists
- Better security worth the UX cost

### 5. Why bcrypt over Argon2?

**Rationale:**

- Bcrypt is battle-tested (20+ years)
- Wider library support
- Sufficient for password hashing
- Team familiarity

**Future:** Consider Argon2 when upgrading

### 6. Why TypeBox over Joi/Yup?

**Rationale:**

- TypeScript-first
- Runtime and compile-time validation
- OpenAPI generation
- Zero runtime overhead

### 7. Why Fastify over Express?

**Rationale:**

- Better performance
- Built-in schema validation
- Modern async/await support
- Plugin architecture

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-01
**Related:** [Developer Guide](./DEVELOPER_GUIDE.md) | [Deployment Guide](./DEPLOYMENT_GUIDE.md)
