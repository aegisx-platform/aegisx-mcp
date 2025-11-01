# SMTP Email Service Setup

## Gmail SMTP Configuration

To enable real email sending (instead of console logging), add these to your `.env.local`:

```env
# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=aegisx.platform@gmail.com
SMTP_PASSWORD=lobc zhyc hkrm nbmi
FROM_EMAIL=aegisx.platform@gmail.com
```

## Testing Email Sending

### 1. Without SMTP (Development Mode - Console Only)

If SMTP credentials are NOT configured, emails will be logged to console:

```
=================================
📧 EMAIL (Development Mode)
=================================
From: noreply@aegisx.local
To: test@example.com
Subject: Verify Your Email Address
...
```

### 2. With SMTP (Real Email Sending)

If SMTP credentials ARE configured, emails will be sent via Gmail:

- Registration → Verification email sent to user's inbox
- Resend verification → New email sent
- Beautiful HTML email templates
- Fallback to plain text

## Quick Test

1. **Add SMTP credentials to `.env.local`** (see above)
2. **Restart API server:**
   ```bash
   # Stop current dev server (Ctrl+C if running)
   pnpm run dev:api
   ```
3. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3333/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-test-email@gmail.com",
       "username": "testuser",
       "password": "TestPass123!",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```
4. **Check your inbox** - You should receive a verification email!

## Security Notes

⚠️ **IMPORTANT:**

- The credentials in this file are for **development/testing only**
- **DO NOT commit** `.env.local` to git (it's already in `.gitignore`)
- For production, use:
  - App-specific passwords (Gmail)
  - Dedicated email service (SendGrid, AWS SES, Mailgun)
  - Environment variables from secure vault

## Email Templates Included

### 1. Email Verification (implemented)

- Beautiful HTML template with branding
- Call-to-action button
- Fallback plain text version
- 24-hour expiration notice

### 2. Password Reset (ready for Phase 4)

- Security-focused design
- Warning for suspicious activity
- 1-hour expiration
- Red theme for urgency

## Troubleshooting

### Emails not sending?

1. Check SMTP credentials in `.env.local`
2. Check server logs: `pnpm run dev:api`
3. Verify Gmail App Password is correct
4. Ensure Gmail account allows "Less secure app access" (if needed)

### Still logging to console?

- Make sure `.env.local` has SMTP_USER and SMTP_PASSWORD
- Restart API server to reload environment variables

### Gmail specific issues?

- Use **App Password**, not regular Gmail password
- Generate App Password: https://myaccount.google.com/apppasswords
- Enable 2-factor authentication first

## Production Recommendations

For production, consider using dedicated email services:

1. **SendGrid** (Free tier: 100 emails/day)
2. **AWS SES** (Pay as you go, very cheap)
3. **Mailgun** (Free tier: 5,000 emails/month)
4. **Postmark** (Best deliverability)

These services provide:

- Better deliverability
- Analytics & tracking
- Bounce handling
- Template management
- Higher sending limits
