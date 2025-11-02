# Email Verification Implementation - Technical Documentation

> **Complete implementation guide for email verification in authentication system**

## 📋 Overview

Email verification is implemented across multiple services with proper separation of concerns:

1. **AuthService** - Handles user registration
2. **EmailVerificationService** - Manages verification tokens
3. **EmailService** - Sends actual emails via SMTP
4. **Frontend** - Verification UI

---

## 🏗️ Architecture & Flow

### Registration → Email Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Registers (POST /api/auth/register)                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 2. AuthService.register()                                        │
│    - Create user in database                                     │
│    - Generate JWT tokens (auto-login)                            │
│    - Call EmailVerificationService                               │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 3. EmailVerificationService.createVerificationToken()            │
│    - Generate 64-character random token                          │
│    - Store in email_verifications table                          │
│    - Set expiration (24 hours)                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 4. EmailVerificationService.sendVerificationEmail()              │
│    - Pass token to EmailService                                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 5. EmailService.sendVerificationEmail()                          │
│    - Build verification URL with token                           │
│    - Create HTML + text email                                    │
│    - Call sendEmail()                                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 6. EmailService.sendEmail()                                      │
│    - Check if SMTP configured (SMTP_USER + SMTP_PASSWORD)       │
│    - If YES: Send via nodemailer transport                       │
│    - If NO: Log to console only                                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 7. User receives email                                           │
│    - Click verification link                                     │
│    - Link format: http://localhost:4200/verify-email?token=xxx  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend: verify-email.page.ts                               │
│    - Extract token from URL                                      │
│    - Call POST /api/auth/verify-email                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 9. AuthController.verifyEmail()                                  │
│    - Call EmailVerificationService.verifyEmail()                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               v
┌─────────────────────────────────────────────────────────────────┐
│ 10. EmailVerificationService.verifyEmail()                       │
│     - Validate token (exists, not expired, not used)             │
│     - Mark token as verified                                     │
│     - Update user.email_verified = true                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### Backend Files

```
apps/api/src/core/
├── auth/
│   ├── auth.service.ts                           # Orchestrates registration
│   │   └─ register() → Lines 34-123
│   │      - Creates user
│   │      - Calls EmailVerificationService (Lines 97-106)
│   │
│   ├── services/
│   │   ├── email-verification.service.ts         # Token management
│   │   │   ├─ createVerificationToken()          # Lines 54-91
│   │   │   ├─ verifyEmail()                      # Lines 96-157
│   │   │   ├─ sendVerificationEmail()            # Lines 196-202 (wrapper)
│   │   │   └─ resendVerification()               # Lines 162-191
│   │   │
│   │   └── auth.repository.ts                    # Database queries
│   │
│   └── auth.controller.ts                        # HTTP endpoints
│       ├─ register → POST /api/auth/register
│       ├─ verifyEmail → POST /api/auth/verify-email
│       └─ resendVerification → POST /api/auth/resend-verification
│
└── email/
    └── email.service.ts                          # SMTP email sending
        ├─ constructor() → Lines 29-46            # Check SMTP config
        ├─ initializeTransporter() → Lines 58-83  # Setup nodemailer
        ├─ sendEmail() → Lines 88-156             # Core email sender
        └─ sendVerificationEmail() → Lines 185-251 # Build verification email
```

### Frontend Files

```
apps/web/src/app/
├── pages/auth/
│   ├── register.page.ts                          # Registration form
│   │   └─ onSubmit() → Calls AuthService.register()
│   │
│   └── verify-email.page.ts                      # Email verification UI
│       └─ verifyEmail() → Calls API with token
│
└── core/auth/services/
    ├── auth.service.ts                           # Frontend auth service
    │   └─ register() → POST /api/auth/register
    │
    └── email-verification.service.ts             # Frontend verification service
        ├─ verifyEmail() → POST /api/auth/verify-email
        └─ resendVerification() → POST /api/auth/resend-verification
```

---

## 🔍 Implementation Details

### 1. AuthService.register() - Entry Point

**File:** `apps/api/src/core/auth/services/auth.service.ts`

**Lines 96-106:**

```typescript
// Create email verification token and send email
const verificationToken = await this.emailVerificationService.createVerificationToken(user.id, user.email);
await this.emailVerificationService.sendVerificationEmail(user.email, verificationToken, `${firstName || ''} ${lastName || ''}`.trim());
```

**What it does:**

- ✅ Creates verification token
- ✅ Sends verification email
- ✅ Happens AFTER user is created
- ✅ Auto-login (returns JWT tokens)

**Console Logs:**

```
[AUTH_SERVICE] Starting registration for email: user@example.com
[AUTH_SERVICE] Registration successful for user: uuid-here
```

---

### 2. EmailVerificationService - Token Management

**File:** `apps/api/src/core/auth/services/email-verification.service.ts`

#### createVerificationToken() - Lines 54-91

```typescript
async createVerificationToken(userId: string, email: string): Promise<string> {
  // Generate secure random token (64 characters)
  const token = randomBytes(this.TOKEN_LENGTH).toString('hex');

  // Calculate expiration (24 hours)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

  // Delete old unverified tokens for this user
  await this.db('email_verifications')
    .where('user_id', userId)
    .where('verified', false)
    .del();

  // Insert new token
  await this.db('email_verifications').insert({
    id: this.db.raw('gen_random_uuid()'),
    user_id: userId,
    token,
    email,
    verified: false,
    expires_at: expiresAt,
  });

  return token;
}
```

**Token Format:**

- Length: 64 characters (32 bytes hex)
- Example: `a1b2c3d4e5f6...` (64 chars)
- Stored in: `email_verifications` table
- Expiration: 24 hours

#### sendVerificationEmail() - Lines 196-202

```typescript
async sendVerificationEmail(
  email: string,
  token: string,
  userName?: string,
): Promise<void> {
  await this.emailService.sendVerificationEmail(email, token, userName);
}
```

**What it does:**

- Simple wrapper to EmailService
- Passes email, token, userName

---

### 3. EmailService - SMTP Email Sender

**File:** `apps/api/src/core/email/email.service.ts`

#### Constructor - Lines 29-46 (CRITICAL!)

```typescript
constructor(private readonly fastify: FastifyInstance) {
  this.isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  // Initialize SMTP transporter if credentials are provided
  if (this.shouldUseSMTP()) {
    console.log('[EMAIL_SERVICE] SMTP credentials found, initializing...');
    this.initializeTransporter();
  } else {
    console.log('[EMAIL_SERVICE] No SMTP credentials, using console logging');
  }
}
```

**CRITICAL CHECK:**

```typescript
private shouldUseSMTP(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
```

**This is why emails might not send:**

- ❌ If SMTP_USER or SMTP_PASSWORD is missing → No transporter created
- ❌ If .env.local not loaded → No SMTP credentials
- ❌ If API server not restarted → Old config still in memory

#### initializeTransporter() - Lines 58-83

```typescript
private initializeTransporter(): void {
  try {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.fastify.log.info({
      msg: 'Email service initialized with SMTP',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });
  } catch (error) {
    this.fastify.log.error({
      msg: 'Failed to initialize email transporter',
      error,
    });
    this.transporter = null;
  }
}
```

**Console Logs to Check:**

```
✅ [EMAIL_SERVICE] SMTP credentials found, initializing...
✅ Email service initialized with SMTP

❌ [EMAIL_SERVICE] No SMTP credentials, using console logging
```

#### sendEmail() - Lines 88-156 (Core Logic)

```typescript
async sendEmail(options: EmailOptions): Promise<boolean> {
  // Development mode without SMTP → Log to console only
  if (this.isDevelopment && !this.transporter) {
    console.log('[EMAIL_SERVICE] Development mode without SMTP - logging to console');
    this.logEmailToConsole({ to, subject, text, html, from });
    return true;
  }

  // No transporter configured → Return false
  if (!this.transporter) {
    console.log('[EMAIL_SERVICE] No transporter configured - email not sent');
    return false;
  }

  // Send via SMTP
  try {
    console.log('[EMAIL_SERVICE] Attempting to send email via SMTP...');
    const info = await this.transporter.sendMail({
      from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
    });

    console.log('[EMAIL_SERVICE] Email sent successfully!', {
      messageId: info.messageId,
      to,
    });
    return true;
  } catch (error) {
    console.error('[EMAIL_SERVICE] Failed to send email:', error);
    return false;
  }
}
```

#### sendVerificationEmail() - Lines 185-251

```typescript
async sendVerificationEmail(
  to: string,
  token: string,
  userName?: string,
): Promise<boolean> {
  const verificationUrl = `${process.env.WEB_URL || 'http://localhost:4200'}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Email styles... */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            <p>Thank you for registering with AegisX Platform!</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${userName || 'there'},
Thank you for registering with AegisX Platform!
Please verify your email: ${verificationUrl}
This link will expire in 24 hours.
  `.trim();

  return await this.sendEmail({
    to,
    subject: 'Verify Your Email Address - AegisX Platform',
    text,
    html,
  });
}
```

---

## 🛠️ Troubleshooting Guide

### Problem 1: No Email Received

**Symptoms:**

- Register completes successfully
- No email in inbox
- No errors shown

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
# Start API and look for this:
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

# If you see multiple processes, kill them:
pkill -f "nx serve api"

# Then start fresh:
pnpm run dev:api
```

**Check 4: Environment Variables Loaded?**

```bash
# The API uses load-env.sh to load .env.local
# Verify the script works:
cat scripts/load-env.sh

# Should see .env.local being sourced
```

**Check 5: Register and Watch Logs**

```bash
# Terminal 1: API logs
pnpm run dev:api

# Terminal 2: Register
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'

# Check Terminal 1 for logs:
[AUTH_SERVICE] Starting registration for email: test@example.com
[EMAIL_SERVICE] sendEmail called
[EMAIL_SERVICE] Attempting to send email via SMTP...
[EMAIL_SERVICE] Email sent successfully!
```

---

### Problem 2: Authentication Error (Gmail)

**Error:**

```
Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:**

1. **Use App Password** (NOT regular Gmail password)
2. **Enable 2-Step Verification** first
3. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "AegisX Platform"
   - Copy 16-character password

**Correct .env.local:**

```bash
SMTP_USER=aegisx.platform@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # 16-char App Password
```

---

### Problem 3: Connection Timeout

**Error:**

```
Connection timeout
```

**Solutions:**

**Try different port:**

```bash
# Option 1: Port 587 with STARTTLS
SMTP_PORT=587
SMTP_SECURE=false

# Option 2: Port 465 with SSL
SMTP_PORT=465
SMTP_SECURE=true

# Option 3: Port 25 (if allowed)
SMTP_PORT=25
SMTP_SECURE=false
```

**Check firewall:**

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# If connection fails, firewall might be blocking
```

---

### Problem 4: Emails in Spam Folder

**Solutions:**

1. Check spam/junk folder
2. Mark as "Not Spam"
3. Add sender to contacts
4. For production: Set up SPF, DKIM records

---

## 📝 Testing Checklist

### Manual Testing Steps

```bash
# 1. Verify SMTP Config
cat .env.local | grep SMTP
# Ensure SMTP_USER and SMTP_PASSWORD are set

# 2. Kill old API processes
pkill -f "nx serve api"

# 3. Start API fresh
pnpm run dev:api

# 4. Watch for initialization logs
# Look for: "[EMAIL_SERVICE] SMTP credentials found"

# 5. Register new user
# Go to http://localhost:4200/register
# Fill form and submit

# 6. Check API logs
# Look for:
#   [AUTH_SERVICE] Starting registration
#   [EMAIL_SERVICE] Attempting to send email
#   [EMAIL_SERVICE] Email sent successfully!

# 7. Check email inbox
# Wait 10-30 seconds
# Check Gmail inbox (or spam folder)

# 8. Click verification link
# Should redirect to verify-email page
# Should show success message

# 9. Verify in database
psql aegisx_db -c "SELECT email_verified FROM users WHERE email='test@example.com';"
# Should show: email_verified | t
```

---

## 🧪 Automated Testing

### Test Email Sending Directly

Create this test file: `apps/api/src/core/email/email.service.spec.ts`

```typescript
import { EmailService } from './email.service';

describe('EmailService', () => {
  it('should send verification email', async () => {
    // Setup test fastify instance
    const fastify = {
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    const emailService = new EmailService(fastify as any);

    // Send test email
    const result = await emailService.sendVerificationEmail('test@example.com', 'test-token-123', 'Test User');

    expect(result).toBe(true);
  });
});
```

---

## 🔒 Security Considerations

### Token Security

**Token Generation:**

- ✅ Uses `crypto.randomBytes(32)` - Cryptographically secure
- ✅ 64-character hex string (256 bits of entropy)
- ✅ Practically impossible to guess

**Token Storage:**

- ✅ Stored in database (not in JWT)
- ✅ Expires after 24 hours
- ✅ One-time use (marked as verified)
- ✅ Old tokens deleted when requesting new ones

**Token Validation:**

```typescript
// In EmailVerificationService.verifyEmail()
- Check token exists
- Check not already verified
- Check not expired
- Check belongs to correct user
```

### Email Security

**Headers:**

- ✅ SPF record (for production domain)
- ✅ DKIM signing (for production)
- ⚠️ Using Gmail App Password (encrypted)

**Content Security:**

- ✅ No sensitive data in email body
- ✅ Token in URL (one-time use, expires)
- ✅ HTTPS verification page

---

## 📊 Database Schema

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

### users Table (Relevant Fields)

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
```

---

## 🎯 Environment Variables Reference

### Required for Email Sending

| Variable        | Example                     | Description                            |
| --------------- | --------------------------- | -------------------------------------- |
| `SMTP_HOST`     | `smtp.gmail.com`            | SMTP server hostname                   |
| `SMTP_PORT`     | `587`                       | SMTP server port (587 or 465)          |
| `SMTP_SECURE`   | `false`                     | Use TLS? (true for 465, false for 587) |
| `SMTP_USER`     | `aegisx.platform@gmail.com` | SMTP username                          |
| `SMTP_PASSWORD` | `abcd1234efgh5678`          | SMTP password (App Password for Gmail) |
| `FROM_EMAIL`    | `aegisx.platform@gmail.com` | Sender email address                   |

### Optional

| Variable   | Example                 | Default                             |
| ---------- | ----------------------- | ----------------------------------- |
| `WEB_URL`  | `http://localhost:4200` | Frontend URL for verification links |
| `NODE_ENV` | `development`           | Environment (affects logging)       |

---

## 💡 Quick Fixes

### Fix 1: Force SMTP Initialization

Add this to email.service.ts constructor:

```typescript
console.log('[EMAIL_SERVICE] Environment check:', {
  SMTP_USER: !!process.env.SMTP_USER,
  SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
});
```

### Fix 2: Test SMTP Connection

Add this method to EmailService:

```typescript
async testConnection(): Promise<boolean> {
  if (!this.transporter) {
    console.log('No transporter configured');
    return false;
  }

  try {
    await this.transporter.verify();
    console.log('✅ SMTP connection successful');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
```

Call after initialization:

```typescript
if (this.transporter) {
  this.testConnection();
}
```

### Fix 3: Debug Verification URL

Log the verification URL:

```typescript
console.log('[EMAIL_SERVICE] Verification URL:', verificationUrl);
// Should be: http://localhost:4200/auth/verify-email?token=xxx
```

---

## 📚 Related Documentation

- **[SMTP Setup Guide](../../getting-started/SMTP_SETUP_GUIDE.md)** - How to configure SMTP
- **[Authentication Flow](./README.md)** - Complete auth system overview
- **[Email Service API](../../api/email-service.md)** - Email service reference

---

## ❓ FAQ

**Q: Why do I need to restart API server after changing .env.local?**
A: Environment variables are loaded at startup. Changes to .env.local require restart.

**Q: Can I test without SMTP?**
A: Yes, emails will be logged to console. But verification links won't work without clicking real email.

**Q: How do I know if email was sent?**
A: Check API logs for "[EMAIL_SERVICE] Email sent successfully!"

**Q: What if I don't see SMTP initialization logs?**
A: SMTP_USER or SMTP_PASSWORD is missing from .env.local

**Q: Gmail says "Less secure app"?**
A: Use App Password instead. Never use regular Gmail password.

**Q: How long is verification link valid?**
A: 24 hours (configurable in EmailVerificationService.EXPIRATION_HOURS)

**Q: Can user request new verification email?**
A: Yes, use POST /api/auth/resend-verification endpoint

---

**Last Updated:** 2025-11-02
**Maintained By:** AegisX Platform Team
