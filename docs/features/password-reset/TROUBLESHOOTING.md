# Password Reset - Troubleshooting Guide

> **Common issues, solutions, and debugging procedures**

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Email Issues](#email-issues)
- [Token Issues](#token-issues)
- [Rate Limiting Issues](#rate-limiting-issues)
- [Database Issues](#database-issues)
- [Frontend Issues](#frontend-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)
- [Development Issues](#development-issues)
- [Debugging Tools](#debugging-tools)

## 🔍 Quick Diagnostics

### Health Check Script

```bash
#!/bin/bash
# quick-diagnostics.sh - Run all health checks

echo "🔍 Password Reset System Diagnostics"
echo "===================================="

# 1. API Health
echo -n "API: "
curl -s http://localhost:3333/health | grep -q "ok" && echo "✅ OK" || echo "❌ FAILED"

# 2. Database Connection
echo -n "Database: "
psql -h localhost -U postgres -d aegisx_db -c "SELECT 1" > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# 3. Redis Connection
echo -n "Redis: "
redis-cli ping > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# 4. SMTP Connection
echo -n "SMTP: "
timeout 5 bash -c "echo quit | telnet smtp.gmail.com 587" > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# 5. Token Table Exists
echo -n "Token Table: "
psql -h localhost -U postgres -d aegisx_db -c "\dt password_reset_tokens" > /dev/null 2>&1 && echo "✅ OK" || echo "❌ FAILED"

# 6. Check Expired Tokens
echo -n "Expired Tokens: "
EXPIRED=$(psql -h localhost -U postgres -d aegisx_db -t -c "SELECT COUNT(*) FROM password_reset_tokens WHERE expires_at < NOW()")
echo "$EXPIRED tokens (should be cleaned up)"

echo "===================================="
echo "Diagnostics complete!"
```

**Run diagnostics:**

```bash
chmod +x quick-diagnostics.sh
./quick-diagnostics.sh
```

### Common Symptoms & Quick Fixes

| Symptom               | Likely Cause        | Quick Fix               |
| --------------------- | ------------------- | ----------------------- |
| Email not received    | SMTP config wrong   | Check `SMTP_*` env vars |
| "Invalid token" error | Token expired/used  | Request new reset link  |
| 429 Too Many Requests | Rate limit hit      | Wait 1 hour, try again  |
| Request hangs         | Database connection | Check `DATABASE_URL`    |
| 500 Internal Error    | Check logs          | `pm2 logs api`          |

## 📧 Email Issues

### Problem: Email Not Received

**Step 1: Check Spam Folder**

```
Instruct user to:
1. Check spam/junk folder
2. Search for sender: noreply@yourapp.com
3. Search for subject: "Password Reset"
```

**Step 2: Verify Email Sent**

```bash
# Check application logs
pm2 logs api | grep "sendPasswordResetEmail"

# Look for:
# ✅ "Email sent successfully to user@example.com"
# ❌ "Email failed: Connection timeout"
```

**Step 3: Test SMTP Connection**

```bash
# Test SMTP manually
telnet smtp.gmail.com 587

# Should see:
# Trying 142.250.185.108...
# Connected to smtp.gmail.com.
# 220 smtp.google.com ESMTP

# Type: QUIT
# Then press Enter
```

**Step 4: Verify Environment Variables**

```bash
# Check SMTP configuration
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_PORT: $SMTP_PORT"
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_FROM: $SMTP_FROM"

# Should show correct values
```

**Step 5: Test Email Service Directly**

```typescript
// test-email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
});

console.log('✅ Email sent successfully');
```

```bash
pnpm tsx test-email.ts
```

**Common Email Errors:**

| Error          | Cause                  | Solution                              |
| -------------- | ---------------------- | ------------------------------------- |
| `EAUTH`        | Invalid credentials    | Check `SMTP_USER` and `SMTP_PASSWORD` |
| `ETIMEDOUT`    | Network/firewall issue | Check firewall, try different port    |
| `ECONNREFUSED` | Wrong host/port        | Verify `SMTP_HOST` and `SMTP_PORT`    |
| `550 5.7.1`    | SPF/DKIM failure       | Configure SPF and DKIM records        |

### Problem: Email Goes to Spam

**Solutions:**

1. **Configure SPF Record:**

```dns
yourapp.com. IN TXT "v=spf1 include:_spf.google.com ~all"
```

2. **Configure DKIM:**
   Follow your email provider's instructions.

3. **Configure DMARC:**

```dns
_dmarc.yourapp.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourapp.com"
```

4. **Use Professional Email:**

```bash
# Instead of Gmail personal
SMTP_FROM=noreply@yourapp.com

# Add company name
SMTP_FROM_NAME=YourApp Security Team
```

5. **Improve Email Content:**

- Use plain text + HTML version
- Include unsubscribe link (even for transactional)
- Add physical address in footer
- Don't use spam trigger words

### Problem: Wrong Reset Link in Email

**Check 1: Environment Variables**

```bash
echo "WEB_URL: $WEB_URL"
# Should be: https://yourapp.com (production)
#         or http://localhost:4200 (development)
```

**Check 2: Email Template**

```typescript
// Email service should use:
const resetLink = `${process.env.WEB_URL}/reset-password?token=${token}`;

// NOT hardcoded:
// const resetLink = `http://localhost:4200/reset-password?token=${token}`; ❌
```

**Check 3: Token Format**

```typescript
// Token should be 64 hex characters
console.assert(token.length === 64, 'Token must be 64 characters');
console.assert(/^[a-f0-9]{64}$/.test(token), 'Token must be lowercase hex');
```

## 🎫 Token Issues

### Problem: "Invalid reset token"

**Possible Causes:**

1. **Token doesn't exist in database**
2. **Token already used**
3. **Token expired**
4. **Token format invalid**

**Debugging Steps:**

```bash
# 1. Check if token exists
psql -d aegisx_db -c "SELECT * FROM password_reset_tokens WHERE token = 'your-token-here'"

# 2. If found, check status
# - used = false ✅
# - expires_at > NOW() ✅
# - used_at IS NULL ✅

# 3. If not found
# - User may have requested multiple resets (old token invalidated)
# - Token was manually deleted
# - User copied token incorrectly
```

**Solutions:**

```typescript
// 1. Check exact error message
if (error.message === 'Invalid reset token') {
  // Token not found in database
  return 'Token not found. Request a new password reset.';
}

if (error.message === 'Reset token has already been used') {
  // Token was already used
  return 'This token was already used. Request a new password reset.';
}

if (error.message === 'Reset token has expired') {
  // Token older than 1 hour
  return 'Token expired. Request a new password reset.';
}
```

### Problem: "Reset token has already been used"

**Cause:** Token `used` field is `true`.

**Check:**

```sql
SELECT token, used, used_at, email
FROM password_reset_tokens
WHERE token = 'your-token-here';
```

**Solutions:**

1. **If legitimately used:**

```
User should request a new password reset.
```

2. **If accidentally marked as used (bug):**

```sql
-- ⚠️ ONLY IN DEVELOPMENT - DO NOT DO IN PRODUCTION
UPDATE password_reset_tokens
SET used = false, used_at = NULL
WHERE token = 'your-token-here';
```

3. **If security concern:**

```
Investigate:
- Check IP address in password_reset_tokens.ip_address
- Check user_sessions table for suspicious activity
- Review application logs around used_at timestamp
```

### Problem: "Reset token has expired"

**Cause:** Token `expires_at < NOW()`.

**Check:**

```sql
SELECT token, expires_at, NOW(), (expires_at - NOW()) as time_remaining
FROM password_reset_tokens
WHERE token = 'your-token-here';
```

**Solutions:**

1. **Token genuinely expired (>1 hour old):**

```
User should request a new password reset.
```

2. **Server time incorrect:**

```bash
# Check server time
date

# If wrong, fix system time
sudo ntpdate -s time.nist.gov

# Or configure NTP
sudo systemctl enable systemd-timesyncd
sudo systemctl start systemd-timesyncd
```

3. **Timezone mismatch:**

```typescript
// Ensure database timezone matches application
// Check PostgreSQL timezone
SELECT current_setting('TIMEZONE');

// Set to UTC
SET TIMEZONE='UTC';
```

### Problem: Token Not Created in Database

**Debugging:**

```bash
# Check logs for errors during token creation
pm2 logs api | grep "requestPasswordReset" | grep ERROR

# Common errors:
# - Database connection failed
# - User not found (no error shown to client for security)
# - Email service failed (token created but email not sent)
```

**Check database connection:**

```bash
psql -h localhost -U postgres -d aegisx_db -c "SELECT 1"
```

**Check table structure:**

```sql
\d password_reset_tokens
```

**Manual token creation (for testing):**

```sql
INSERT INTO password_reset_tokens (
  id, user_id, token, email, expires_at, ip_address
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'test-token-64-characters-long-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'test@example.com',
  NOW() + INTERVAL '1 hour',
  '127.0.0.1'
);
```

## ⏱️ Rate Limiting Issues

### Problem: 429 Too Many Requests

**User sees:**

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, retry in 3600 seconds"
}
```

**Cause:** Exceeded rate limits:

- Request reset: 3 requests/hour
- Reset password: 5 attempts/minute

**Check rate limit status:**

```bash
# Check Redis for rate limit keys
redis-cli KEYS "password-reset:*"

# Check specific IP
redis-cli GET "password-reset:/request-password-reset:127.0.0.1"

# Shows remaining time (TTL)
redis-cli TTL "password-reset:/request-password-reset:127.0.0.1"
```

**Solutions for legitimate users:**

1. **Wait for time window:**

```
For request limit: Wait up to 1 hour
For reset limit: Wait 1 minute
```

2. **Check email for existing reset link:**

```
If user already requested reset, use that link instead of requesting again.
```

3. **Use most recent link:**

```
If multiple requests made, only the most recent link works (others invalidated).
```

**Solutions for developers (testing):**

```bash
# Clear rate limit for specific IP (development only!)
redis-cli DEL "password-reset:/request-password-reset:127.0.0.1"
redis-cli DEL "password-reset:/reset-password:127.0.0.1"

# Or flush all rate limits (⚠️ USE WITH CAUTION)
redis-cli FLUSHDB
```

**Adjust rate limits (if needed):**

```typescript
// password-reset.routes.ts
config: {
  rateLimit: {
    max: 5,           // Increase from 3
    timeWindow: '1 hour',
  },
}
```

### Problem: Rate Limiting Not Working

**Check Redis connection:**

```bash
# Test Redis
redis-cli ping
# Should return: PONG

# If not working:
sudo systemctl status redis
sudo systemctl start redis
```

**Check Fastify rate limit plugin:**

```typescript
// Ensure plugin registered
fastify.register(rateLimit, {
  global: false,
  redis: process.env.REDIS_URL,
});

// Check REDIS_URL environment variable
console.log('REDIS_URL:', process.env.REDIS_URL);
```

**Check route configuration:**

```typescript
// Ensure config.rateLimit is set
fastify.post(
  '/request-password-reset',
  {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 hour',
      },
    },
  },
  handler,
);
```

## 💾 Database Issues

### Problem: Table 'password_reset_tokens' doesn't exist

**Check:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'password_reset_tokens';
```

**Solution:**

```bash
# Run migrations
pnpm run db:migrate

# Verify migration
pnpm knex migrate:status
```

**If migration failed:**

```bash
# Check migration file exists
ls apps/api/src/database/migrations/*password_reset*

# Run specific migration
pnpm knex migrate:up 001_create_password_reset_tokens_table.ts
```

### Problem: Column 'used_at' doesn't exist

**Cause:** Migration not up to date.

**Solution:**

```bash
# Check current migration version
pnpm knex migrate:currentVersion

# Run pending migrations
pnpm knex migrate:latest

# If issue persists, check migration file
cat apps/api/src/database/migrations/*password_reset*.ts
```

### Problem: Foreign key constraint violation

**Error:**

```
ERROR: insert or update on table "password_reset_tokens" violates foreign key constraint
```

**Cause:** User ID doesn't exist in `users` table.

**Check:**

```sql
SELECT id, email FROM users WHERE email = 'user@example.com';
```

**Solution:**

```sql
-- Ensure user exists
INSERT INTO users (id, email, password, username, created_at)
VALUES (
  gen_random_uuid(),
  'user@example.com',
  '$2b$10$hashed_password_here',
  'testuser',
  NOW()
);
```

### Problem: Index missing or slow queries

**Check indexes:**

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'password_reset_tokens';
```

**Expected indexes:**

```
idx_password_reset_tokens_token
idx_password_reset_tokens_user_id
idx_password_reset_tokens_email
```

**Create missing indexes:**

```sql
CREATE INDEX idx_password_reset_tokens_token
ON password_reset_tokens(token);

CREATE INDEX idx_password_reset_tokens_user_id
ON password_reset_tokens(user_id);

CREATE INDEX idx_password_reset_tokens_email
ON password_reset_tokens(email);
```

**Check query performance:**

```sql
EXPLAIN ANALYZE
SELECT * FROM password_reset_tokens WHERE token = 'abc123...';

-- Should show "Index Scan" not "Seq Scan"
```

## 🖥️ Frontend Issues

### Problem: Reset link doesn't navigate to reset page

**Check 1: Route configuration**

```typescript
// app.routes.ts
{
  path: 'reset-password',
  component: ResetPasswordComponent,
}
```

**Check 2: Query parameter extraction**

```typescript
// reset-password.component.ts
ngOnInit() {
  this.route.queryParams.subscribe(params => {
    this.token = params['token'];
    console.log('Token:', this.token); // Debug
  });
}
```

**Check 3: Token format**

```typescript
// Should be 64 hex characters
if (!/^[a-f0-9]{64}$/.test(this.token)) {
  console.error('Invalid token format');
}
```

### Problem: Form validation not working

**Check validation rules:**

```typescript
this.resetForm = this.fb.group(
  {
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  },
  { validators: this.passwordMatchValidator },
);
```

**Check password match validator:**

```typescript
passwordMatchValidator(g: FormGroup) {
  return g.get('newPassword')?.value === g.get('confirmPassword')?.value
    ? null
    : { mismatch: true };
}
```

### Problem: API call fails with CORS error

**Error in console:**

```
Access to XMLHttpRequest at 'http://localhost:3333/api/auth/reset-password'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:**

```typescript
// apps/api/src/main.ts
fastify.register(cors, {
  origin: process.env.WEB_URL || 'http://localhost:4200',
  credentials: true,
});
```

**Check environment variable:**

```bash
echo "WEB_URL: $WEB_URL"
```

### Problem: Success/error messages not displayed

**Check response handling:**

```typescript
this.authService.resetPassword(token, newPassword).subscribe({
  next: (response) => {
    this.snackBar.open('Password reset successfully', 'Close', {
      duration: 5000,
    });
    this.router.navigate(['/login']);
  },
  error: (error) => {
    console.error('Reset failed:', error); // Debug
    this.snackBar.open(error.error.message || 'Reset failed', 'Close', {
      duration: 5000,
      panelClass: 'error-snackbar',
    });
  },
});
```

## 🚀 Performance Issues

### Problem: Slow password reset requests

**Measure performance:**

```typescript
const start = Date.now();
await this.passwordResetService.requestPasswordReset(email);
const duration = Date.now() - start;
console.log(`Reset request took ${duration}ms`);
```

**Common bottlenecks:**

1. **Database query slow:**

```sql
-- Check query execution time
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com' AND deleted_at IS NULL;
```

2. **Email sending slow:**

```typescript
// Make email sending async (don't wait)
this.emailService.sendPasswordResetEmail(email, token, user.name).catch((err) => logger.error('Email failed', err));

// Return immediately
return { success: true, message: '...' };
```

3. **Token generation slow:**

```typescript
// Crypto.randomBytes should be fast (~1ms)
// If slow, check entropy pool
cat /proc/sys/kernel/random/entropy_avail
# Should be > 1000
```

### Problem: High memory usage

**Check for memory leaks:**

```bash
# Monitor memory
watch -n 1 "ps aux | grep node"

# Use Node.js memory profiler
node --inspect apps/api/dist/main.js
# Chrome DevTools → Memory → Take heap snapshot
```

**Common causes:**

1. **Tokens not cleaned up:**

```sql
-- Check token count
SELECT COUNT(*) FROM password_reset_tokens;

-- Clean up old tokens
DELETE FROM password_reset_tokens WHERE expires_at < NOW();
```

2. **Email queue backup:**

```bash
# Check email service queue
# Implementation depends on email service used
```

## 🔒 Security Issues

### Problem: Suspected brute force attack

**Symptoms:**

- Many rate limit hits from same IP
- Many invalid token attempts
- Unusual access patterns

**Investigation:**

```bash
# Check logs for suspicious activity
pm2 logs api | grep "password-reset" | grep "429"

# Check database for failed attempts
psql -d aegisx_db -c "
  SELECT ip_address, COUNT(*)
  FROM password_reset_tokens
  WHERE used = false AND expires_at < NOW()
  GROUP BY ip_address
  HAVING COUNT(*) > 10
  ORDER BY COUNT(*) DESC
"
```

**Immediate actions:**

```bash
# 1. Block suspicious IPs (firewall)
sudo ufw deny from 123.45.67.89

# 2. Tighten rate limits temporarily
# Edit password-reset.routes.ts:
config: {
  rateLimit: {
    max: 1,  # Reduce from 3
    timeWindow: '1 hour',
  },
}

# 3. Alert security team
# 4. Review logs for compromised accounts
```

### Problem: Token enumeration attempt

**Detection:**

```bash
# Check for sequential token testing
pm2 logs api | grep "Invalid reset token" | tail -100
```

**Prevention:**

- Tokens are 64 hex characters (2^256 possibilities)
- Rate limiting prevents brute force
- Constant-time token comparison

**Verify constant-time comparison:**

```typescript
import crypto from 'crypto';

// ✅ Good: constant-time comparison
const isValid = crypto.timingSafeEqual(Buffer.from(providedToken), Buffer.from(storedToken));

// ❌ Bad: timing attack vulnerable
const isValid = providedToken === storedToken;
```

## 🛠️ Development Issues

### Problem: Can't test password reset locally

**Solution 1: Use Mailhog (recommended)**

```bash
# Install Mailhog
brew install mailhog  # macOS
# OR
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure application
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=  # Leave empty
SMTP_PASSWORD=  # Leave empty

# View emails at: http://localhost:8025
```

**Solution 2: Get token from database**

```bash
# Request password reset
curl -X POST http://localhost:3333/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get token from database
psql -d aegisx_db -c "
  SELECT token
  FROM password_reset_tokens
  WHERE email = 'test@example.com'
  ORDER BY created_at DESC
  LIMIT 1
"

# Use token in reset request
curl -X POST http://localhost:3333/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_HERE","newPassword":"newpass123"}'
```

### Problem: Tests failing

**Common test failures:**

1. **Database not seeded:**

```bash
pnpm run db:seed:test
```

2. **Rate limit interference:**

```typescript
// Clear rate limits before each test
beforeEach(async () => {
  await redis.flushall();
});
```

3. **Time-sensitive tests:**

```typescript
// Use fake timers
jest.useFakeTimers();

// Advance time
jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour

// Token should now be expired
```

## 🔧 Debugging Tools

### Enable Debug Logging

```bash
# Set log level
LOG_LEVEL=debug pnpm run dev:api

# Watch logs
pm2 logs api --lines 100 --raw
```

### Database Query Logging

```typescript
// Enable Knex query logging
const db = knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  debug: true, // Enable query logging
});
```

### Network Debugging

```bash
# Capture HTTP traffic
tcpdump -i any -A 'port 3333'

# Or use Wireshark
```

### Email Debugging

```bash
# Test SMTP with verbose output
openssl s_client -starttls smtp -connect smtp.gmail.com:587 -crlf

# Send test email
EHLO localhost
AUTH LOGIN
# Base64 encoded username
# Base64 encoded password
MAIL FROM: <your@email.com>
RCPT TO: <recipient@email.com>
DATA
Subject: Test
Test email body
.
QUIT
```

### Token Debugging

```typescript
// Log token details
console.log({
  token: token.substring(0, 8) + '...',
  length: token.length,
  format: /^[a-f0-9]{64}$/.test(token),
  user: user.email,
  expiresAt: expiresAt.toISOString(),
});
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-01
**Related:** [User Guide](./USER_GUIDE.md) | [Deployment Guide](./DEPLOYMENT_GUIDE.md)
