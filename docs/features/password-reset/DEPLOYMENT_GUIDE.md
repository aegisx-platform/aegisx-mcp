# Password Reset - Deployment Guide

> **Production deployment procedures, configuration, and operational guidelines**

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Email Service Configuration](#email-service-configuration)
- [Rate Limiting Configuration](#rate-limiting-configuration)
- [Security Hardening](#security-hardening)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring Setup](#monitoring-setup)
- [Maintenance Tasks](#maintenance-tasks)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## ✅ Pre-Deployment Checklist

### Code Review

```bash
# ✅ 1. All tests passing
pnpm test

# ✅ 2. Build succeeds
pnpm build

# ✅ 3. Linting passes
pnpm lint

# ✅ 4. Type checking passes
pnpm type-check
```

### Documentation Review

- ✅ API documentation updated
- ✅ Environment variables documented
- ✅ Security considerations reviewed
- ✅ User guide available
- ✅ Troubleshooting guide complete

### Security Review

- ✅ Token generation uses crypto.randomBytes()
- ✅ Tokens expire after 1 hour
- ✅ One-time use enforced
- ✅ Rate limiting configured
- ✅ Session invalidation on password reset
- ✅ No email enumeration
- ✅ HTTPS enforced in production
- ✅ Email SPF/DKIM configured

### Infrastructure Review

- ✅ Database migrations ready
- ✅ Email service configured and tested
- ✅ Rate limiting service (Redis) available
- ✅ Monitoring and alerting configured
- ✅ Backup procedures in place

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
API_URL=https://api.yourapp.com
WEB_URL=https://yourapp.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # false = TLS, true = SSL
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourapp.com
SMTP_FROM_NAME=YourApp Team

# Rate Limiting (Redis)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# Logging
LOG_LEVEL=info  # error, warn, info, debug
LOG_FORMAT=json  # json or pretty
```

### Environment Variable Validation

**Create validation script:**

```typescript
// scripts/validate-env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  API_URL: z.string().url(),
  WEB_URL: z.string().url(),
  DATABASE_URL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().email(),
  REDIS_URL: z.string(),
});

try {
  envSchema.parse(process.env);
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}
```

**Run before deployment:**

```bash
pnpm tsx scripts/validate-env.ts
```

## 💾 Database Setup

### 1. Create Migration

Migration file should already exist from development. Verify:

```bash
ls apps/api/src/database/migrations/*_create_password_reset_tokens_table.ts
```

### 2. Run Migration in Production

**Using Knex CLI:**

```bash
NODE_ENV=production pnpm knex migrate:latest
```

**Using custom script:**

```bash
NODE_ENV=production pnpm run db:migrate
```

### 3. Verify Migration

```sql
-- Check table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'password_reset_tokens';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'password_reset_tokens';
```

Expected indexes:

```
idx_password_reset_tokens_token
idx_password_reset_tokens_user_id
idx_password_reset_tokens_email
```

### 4. Database Permissions

**Grant necessary permissions:**

```sql
-- Create application user if not exists
CREATE USER yourapp_user WITH PASSWORD 'secure-password';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE password_reset_tokens
TO yourapp_user;

GRANT SELECT, UPDATE
ON TABLE users
TO yourapp_user;

GRANT DELETE
ON TABLE user_sessions
TO yourapp_user;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yourapp_user;
```

## 📧 Email Service Configuration

### Gmail SMTP Setup

**1. Enable 2-Step Verification:**

- Go to: https://myaccount.google.com/security
- Enable 2-Step Verification

**2. Create App Password:**

- Go to: https://myaccount.google.com/apppasswords
- Select app: "Mail"
- Select device: "Other (Custom name)"
- Name: "YourApp Password Reset"
- Copy the generated password

**3. Update Environment Variables:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # 16-character app password
```

### AWS SES Setup

**1. Verify Domain:**

```bash
aws ses verify-domain-identity --domain yourapp.com
```

**2. Configure DNS:**
Add TXT records provided by AWS SES.

**3. Create SMTP Credentials:**

```bash
aws iam create-access-key --user-name ses-smtp-user
```

**4. Update Environment Variables:**

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASSWORD=your-smtp-password
```

### SendGrid Setup

**1. Create API Key:**

- Go to: https://app.sendgrid.com/settings/api_keys
- Create API Key with "Mail Send" permission

**2. Update Environment Variables:**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Email Template Configuration

**Production email template:**

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      .button {
        background-color: #4caf50;
        color: white;
        padding: 15px 32px;
        text-decoration: none;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p>Hello {{name}},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="{{resetLink}}" class="button">Reset Password</a>
      <p>Or copy this link to your browser:</p>
      <p>{{resetLink}}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email. Your password won't change until you click the link above and create a new one.</p>
      <p>Thanks,<br />The {{appName}} Team</p>
    </div>
  </body>
</html>
```

### SPF and DKIM Configuration

**SPF Record (DNS TXT):**

```
v=spf1 include:_spf.google.com ~all  # For Gmail
v=spf1 include:amazonses.com ~all    # For AWS SES
v=spf1 include:sendgrid.net ~all     # For SendGrid
```

**DKIM Configuration:**
Follow your email provider's instructions:

- Gmail: Automatic
- AWS SES: Add CNAME records
- SendGrid: Add CNAME records

**DMARC Record (DNS TXT):**

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourapp.com
```

## ⏱️ Rate Limiting Configuration

### Redis Setup

**1. Install Redis:**

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Docker
docker run -d -p 6379:6379 --name redis redis:alpine
```

**2. Configure Redis:**

```bash
# /etc/redis/redis.conf
bind 127.0.0.1
port 6379
requirepass your-secure-redis-password
maxmemory 256mb
maxmemory-policy allkeys-lru
```

**3. Start Redis:**

```bash
sudo systemctl start redis
sudo systemctl enable redis
```

**4. Verify Redis:**

```bash
redis-cli ping
# Should return: PONG
```

### Rate Limit Configuration

**Fastify Rate Limit Plugin:**

```typescript
import rateLimit from '@fastify/rate-limit';

fastify.register(rateLimit, {
  global: false,
  redis: process.env.REDIS_URL,
  nameSpace: 'password-reset:',
  skipOnError: false, // Fail closed (safer)
});
```

**Per-Route Limits:**

```typescript
// Request password reset: 3 requests/hour
config: {
  rateLimit: {
    max: 3,
    timeWindow: '1 hour',
  },
}

// Reset password: 5 attempts/minute
config: {
  rateLimit: {
    max: 5,
    timeWindow: '1 minute',
  },
}
```

## 🔒 Security Hardening

### 1. HTTPS Enforcement

**Nginx Configuration:**

```nginx
server {
  listen 80;
  server_name api.yourapp.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.yourapp.com;

  ssl_certificate /etc/letsencrypt/live/yourapp.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  location / {
    proxy_pass http://localhost:3333;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 2. Database Connection Security

**Use SSL for database connections:**

```typescript
const db = knex({
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync('./ca-certificate.crt').toString(),
    },
  },
});
```

### 3. Environment Variable Security

**Use secrets management:**

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name yourapp/production/env \
  --secret-string file://.env.production

# Retrieve at runtime
aws secretsmanager get-secret-value \
  --secret-id yourapp/production/env \
  --query SecretString \
  --output text > .env.production
```

### 4. Token Security Audit

**Verify token generation:**

```typescript
// Test script
import { randomBytes } from 'crypto';

for (let i = 0; i < 100; i++) {
  const token = randomBytes(32).toString('hex');
  console.assert(token.length === 64, 'Token length must be 64');
  console.assert(/^[a-f0-9]{64}$/.test(token), 'Token must be hex');
}
console.log('✅ Token generation verified');
```

## 🚀 Deployment Steps

### Step 1: Prepare Release

```bash
# 1. Ensure on correct branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Run all checks
pnpm run pre-deploy

# 4. Create release tag
git tag -a v1.0.0 -m "Release: Password Reset feature"
git push origin v1.0.0
```

### Step 2: Build Application

```bash
# 1. Clean previous builds
pnpm run clean

# 2. Install production dependencies only
pnpm install --production

# 3. Build application
NODE_ENV=production pnpm run build

# 4. Verify build
ls dist/apps/api
ls dist/apps/web
```

### Step 3: Deploy to Server

**Using Docker:**

```bash
# 1. Build Docker image
docker build -t yourapp/api:v1.0.0 -f apps/api/Dockerfile .

# 2. Push to registry
docker push yourapp/api:v1.0.0

# 3. Deploy to server
ssh user@server "docker pull yourapp/api:v1.0.0"
ssh user@server "docker-compose up -d --no-deps api"
```

**Using PM2:**

```bash
# 1. Copy files to server
rsync -avz dist/ user@server:/var/www/yourapp/

# 2. SSH to server
ssh user@server

# 3. Install dependencies
cd /var/www/yourapp
pnpm install --production

# 4. Run migrations
pnpm run db:migrate

# 5. Restart application
pm2 restart api
```

### Step 4: Smoke Tests

```bash
# 1. Health check
curl https://api.yourapp.com/health

# 2. Request password reset
curl -X POST https://api.yourapp.com/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. Check logs
pm2 logs api --lines 50
```

## ✅ Post-Deployment Verification

### Automated Tests

```bash
# Run E2E tests against production
ENVIRONMENT=production pnpm run test:e2e:password-reset
```

### Manual Verification Checklist

**1. Request Password Reset:**

- ✅ Form accessible at /forgot-password
- ✅ Email validation works
- ✅ Success message displayed
- ✅ Email received (check spam folder)
- ✅ Reset link correct format

**2. Email Verification:**

- ✅ Email from correct sender
- ✅ Subject line correct
- ✅ Link contains valid token (64 chars)
- ✅ Link points to production URL
- ✅ Email template rendered correctly

**3. Token Verification:**

- ✅ Valid token accepted
- ✅ Expired token rejected
- ✅ Used token rejected
- ✅ Invalid token rejected

**4. Password Reset:**

- ✅ New password accepted
- ✅ Password validation works
- ✅ Success message displayed
- ✅ All sessions logged out
- ✅ Can login with new password

**5. Rate Limiting:**

- ✅ 3 requests/hour enforced
- ✅ 5 attempts/minute enforced
- ✅ 429 error returned when exceeded
- ✅ Error message clear

**6. Security:**

- ✅ HTTPS enforced
- ✅ No email enumeration
- ✅ Token expires after 1 hour
- ✅ One-time use enforced
- ✅ IP address logged

## 📊 Monitoring Setup

### Application Metrics

**Key metrics to track:**

```typescript
// Prometheus metrics
const passwordResetRequestsTotal = new Counter({
  name: 'password_reset_requests_total',
  help: 'Total password reset requests',
  labelNames: ['status'],
});

const passwordResetDuration = new Histogram({
  name: 'password_reset_duration_seconds',
  help: 'Password reset process duration',
  buckets: [0.1, 0.5, 1, 2, 5],
});

const passwordResetTokensExpired = new Counter({
  name: 'password_reset_tokens_expired_total',
  help: 'Total expired token attempts',
});
```

### Logging

**Structured logging:**

```typescript
logger.info('Password reset requested', {
  email: email,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});

logger.info('Password reset completed', {
  userId: user.id,
  ip: request.ip,
  sessionsDeleted: sessionCount,
});

logger.warn('Invalid reset token attempt', {
  token: token.substring(0, 8) + '...', // Log partial token
  ip: request.ip,
  reason: 'expired',
});
```

### Alerting

**Configure alerts for:**

1. **High rate limit hits:**

```yaml
alert: HighPasswordResetRateLimit
expr: rate(password_reset_rate_limit_total[5m]) > 10
severity: warning
```

2. **Email delivery failures:**

```yaml
alert: PasswordResetEmailFailures
expr: rate(password_reset_email_failures_total[5m]) > 0.1
severity: critical
```

3. **Database errors:**

```yaml
alert: PasswordResetDatabaseErrors
expr: rate(password_reset_database_errors_total[5m]) > 0
severity: critical
```

## 🔄 Maintenance Tasks

### Daily Tasks

**1. Monitor metrics:**

```bash
# Check password reset requests
curl https://api.yourapp.com/metrics | grep password_reset

# Check error rates
pm2 logs api | grep ERROR | grep password-reset
```

**2. Verify email delivery:**

```bash
# Check SMTP connection
telnet smtp.gmail.com 587

# Review email logs
tail -f /var/log/mail.log | grep password-reset
```

### Weekly Tasks

**1. Clean up expired tokens:**

```sql
-- Check expired tokens count
SELECT COUNT(*)
FROM password_reset_tokens
WHERE expires_at < NOW() OR used = true;

-- Delete expired tokens
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() OR used = true;
```

**Create cron job:**

```bash
# /etc/cron.d/cleanup-reset-tokens
0 2 * * * postgres psql -d yourapp_db -c "DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = true;"
```

**2. Review security logs:**

```bash
# Check for suspicious patterns
grep "password-reset" /var/log/app.log | grep -E "(rate_limit|invalid_token)" | tail -100
```

### Monthly Tasks

**1. Review metrics:**

- Password reset request rate
- Success/failure rate
- Token expiration rate
- Average time between request and reset

**2. Update dependencies:**

```bash
pnpm outdated
pnpm update
pnpm test
```

**3. Security audit:**

```bash
pnpm audit
pnpm audit fix
```

## ⏪ Rollback Procedures

### Immediate Rollback

**If critical issue discovered:**

```bash
# 1. Identify previous stable version
git tag -l | grep v1

# 2. Deploy previous version
docker pull yourapp/api:v0.9.0
docker-compose up -d --no-deps api

# 3. Verify rollback
curl https://api.yourapp.com/health
```

### Database Rollback

**If migration issues:**

```bash
# 1. SSH to database server
ssh db-server

# 2. Run rollback migration
NODE_ENV=production pnpm knex migrate:rollback

# 3. Verify database state
psql -d yourapp_db -c "\dt password_reset_tokens"
```

### Feature Flag Rollback

**Disable feature without full rollback:**

```typescript
// Feature flag
const FEATURE_PASSWORD_RESET_ENABLED = process.env.FEATURE_PASSWORD_RESET === 'true';

if (!FEATURE_PASSWORD_RESET_ENABLED) {
  return reply.serviceUnavailable('Password reset temporarily unavailable');
}
```

**Disable via environment variable:**

```bash
# Update .env
FEATURE_PASSWORD_RESET=false

# Restart application
pm2 restart api
```

## 🔍 Troubleshooting

### Email Not Received

**Check SMTP connection:**

```bash
telnet smtp.gmail.com 587
# Should connect successfully
```

**Check application logs:**

```bash
pm2 logs api | grep "sendPasswordResetEmail"
```

**Verify email configuration:**

```bash
echo $SMTP_HOST $SMTP_PORT $SMTP_USER
```

### Rate Limit Not Working

**Check Redis connection:**

```bash
redis-cli ping
# Should return: PONG
```

**Check rate limit configuration:**

```bash
pm2 logs api | grep "rate-limit"
```

### Token Validation Failing

**Check database connection:**

```sql
SELECT COUNT(*) FROM password_reset_tokens;
```

**Check system time:**

```bash
date
# Ensure server time is correct
```

### High CPU/Memory Usage

**Check for token cleanup:**

```sql
SELECT COUNT(*) FROM password_reset_tokens;
# If very high, run cleanup
```

**Check for email queue backup:**

```bash
# Check email service status
systemctl status postfix
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-01
**Related:** [Architecture](./ARCHITECTURE.md) | [Troubleshooting](./TROUBLESHOOTING.md)
