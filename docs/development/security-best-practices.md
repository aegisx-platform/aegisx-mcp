# Security Best Practices

> **Enterprise security standards for building secure applications**

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Target Audience:** All Developers, Security Engineers, DevOps

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Access Control](#access-control)
- [API Security](#api-security)
- [Secure Development](#secure-development)
- [Security Testing](#security-testing)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

---

## Overview

Security is not optional—it's fundamental to every feature we build. This guide provides security best practices that **MUST** be followed for all applications.

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Fail Securely** - Errors should not expose sensitive data
4. **Never Trust Input** - Validate everything from users/external systems
5. **Security by Design** - Build security in from the start

---

## Authentication & Authorization

### Password Security

#### Hashing Standards (MANDATORY)

```typescript
import bcrypt from 'bcrypt';

// ✅ REQUIRED: bcrypt with minimum 12 rounds (14+ recommended)
const SALT_ROUNDS = 14;

// Hash password
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

**NEVER:**

- ❌ Store plain text passwords
- ❌ Use MD5 or SHA1 for passwords
- ❌ Use less than 12 bcrypt rounds
- ❌ Log passwords (even encrypted)
- ❌ Send passwords in URLs or query strings

#### Password Requirements

**Minimum Requirements:**

```typescript
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false, // Optional but recommended

  // Prevent common passwords
  blacklist: ['password', 'Password123', '12345678', 'qwerty', 'admin', 'letmein', 'welcome'],
} as const;

// Validation function
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters`);
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_POLICY.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one symbol');
  }

  // Check against blacklist
  if (PASSWORD_POLICY.blacklist.some((p) => password.toLowerCase().includes(p))) {
    errors.push('Password is too common');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Recommended:**

- Minimum length: 12+ characters
- Encourage passphrases over complex short passwords
- Implement password strength meter on frontend
- Allow special characters (don't restrict unnecessarily)

### JWT Security

#### Token Generation

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // MUST be in environment variable
const JWT_EXPIRES_IN = '2h';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Generate access token
function generateAccessToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'aegisx-api',
    audience: 'aegisx-web',
  });
}

// Generate refresh token (longer expiry, stored in DB)
function generateRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'aegisx-api',
  });
}
```

#### Token Verification

```typescript
// Verify and decode token
function verifyAccessToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'aegisx-api',
      audience: 'aegisx-web',
    }) as { userId: string; email: string };

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
```

**JWT Best Practices:**

- ✅ Store JWT_SECRET in environment variables (NEVER commit to code)
- ✅ Use short expiration for access tokens (2 hours)
- ✅ Use refresh tokens for extended sessions
- ✅ Include token version/jti for revocation
- ✅ Validate issuer and audience
- ❌ Never store sensitive data in JWT payload (it's not encrypted, just signed)

### Session Management

```typescript
// Session configuration
export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET, // Different from JWT_SECRET
  cookie: {
    httpOnly: true, // ✅ Prevent XSS access
    secure: true, // ✅ HTTPS only
    sameSite: 'strict', // ✅ CSRF protection
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  },
  rolling: true, // ✅ Refresh on activity
  resave: false,
  saveUninitialized: false,
};
```

### API Key Security

```typescript
// Generate secure API key
import crypto from 'crypto';

function generateApiKey(): string {
  // Format: ak_<environment>_<32-char-random>
  const randomBytes = crypto.randomBytes(24).toString('base64url');
  const environment = process.env.NODE_ENV === 'production' ? 'live' : 'test';

  return `ak_${environment}_${randomBytes}`;
}

// Hash API key before storing
async function hashApiKey(key: string): Promise<string> {
  // Use bcrypt for API keys too
  return await bcrypt.hash(key, 12);
}

// Verify API key
async function verifyApiKey(providedKey: string, storedHash: string): Promise<boolean> {
  return await bcrypt.compare(providedKey, storedHash);
}
```

**API Key Best Practices:**

- ✅ Generate cryptographically secure random keys
- ✅ Hash keys before storing in database
- ✅ Show full key only once (on creation)
- ✅ Allow users to revoke keys
- ✅ Include prefix to identify key type
- ✅ Support multiple keys per user
- ❌ Never log full API keys

---

## Data Protection

### Sensitive Data Classification

| Classification   | Examples                                | Encryption Required        | Access Control      | Logging               |
| ---------------- | --------------------------------------- | -------------------------- | ------------------- | --------------------- |
| **Public**       | Product names, public articles          | No                         | All users           | Basic                 |
| **Internal**     | User roles, settings                    | No                         | Authenticated users | Standard              |
| **Confidential** | Email, phone, address                   | Yes (in transit)           | Need-to-know        | All access logged     |
| **Restricted**   | Passwords, tokens, SSN, medical records | Yes (at rest + in transit) | Strict RBAC         | All operations logged |

### Encryption at Rest

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

// Encrypt sensitive data
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Decrypt sensitive data
export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Usage Example:**

```typescript
// Before saving to database
const user = {
  email: 'user@example.com',
  national_id: '1234567890123', // Sensitive
  phone: '+66812345678', // Sensitive
};

await knex('users').insert({
  email: user.email,
  // Encrypt sensitive fields
  national_id_encrypted: encrypt(user.national_id),
  phone_encrypted: encrypt(user.phone),
});

// After reading from database
const dbUser = await knex('users').where({ id }).first();

const decryptedUser = {
  ...dbUser,
  national_id: decrypt(dbUser.national_id_encrypted),
  phone: decrypt(dbUser.phone_encrypted),
};
```

### Encryption in Transit (HTTPS)

**MANDATORY in production:**

```typescript
// Fastify HTTPS configuration
import fs from 'fs';
import path from 'path';

const server = fastify({
  https: {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
  },
});
```

**Force HTTPS:**

```typescript
// Middleware to redirect HTTP to HTTPS
fastify.addHook('onRequest', (request, reply, done) => {
  if (!request.headers['x-forwarded-proto'] && request.protocol === 'http') {
    const httpsUrl = `https://${request.hostname}${request.url}`;
    reply.redirect(301, httpsUrl);
    return;
  }
  done();
});
```

### Data Masking in Logs

```typescript
// Mask sensitive data in logs
function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'national_id', 'ssn', 'credit_card'];

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };

    for (const key of Object.keys(masked)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        masked[key] = '***REDACTED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }

  return data;
}

// Usage in logger
logger.info({ user: maskSensitiveData(user) });
```

---

## Input Validation & Sanitization

### TypeBox Schema Validation (MANDATORY)

**All API inputs MUST use TypeBox schemas:**

```typescript
import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

// Define schema
export const CreateUserSchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255 }),
  username: Type.String({ minLength: 3, maxLength: 50, pattern: '^[a-zA-Z0-9_-]+$' }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  phone: Type.Optional(Type.String({ pattern: '^\\+?[0-9]{10,15}$' })),
});

// Compile for faster validation
const validateCreateUser = TypeCompiler.Compile(CreateUserSchema);

// Use in route
fastify.post('/api/users', {
  schema: {
    body: CreateUserSchema,
  },
  handler: async (request, reply) => {
    // TypeBox validates automatically
    // request.body is type-safe here
    const user = await createUser(request.body);
    return reply.success(user);
  },
});
```

### SQL Injection Prevention

**ALWAYS use parameterized queries:**

```typescript
// ❌ DANGEROUS: Never concatenate user input into SQL
const email = request.body.email;
const users = await knex.raw(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE: Use parameterized queries
const email = request.body.email;
const users = await knex('users').where({ email }); // Knex escapes automatically

// ✅ SAFE: Use raw with bindings
const email = request.body.email;
const users = await knex.raw('SELECT * FROM users WHERE email = ?', [email]);
```

**Dynamic column/table names require special care:**

```typescript
// If you MUST use dynamic column names (rare):
const allowedColumns = ['name', 'email', 'created_at'];
const sortBy = request.query.sortBy;

if (!allowedColumns.includes(sortBy)) {
  throw new Error('Invalid sort column');
}

// Now safe to use
const users = await knex('users').orderBy(sortBy);
```

### XSS (Cross-Site Scripting) Prevention

**Frontend - Angular automatically escapes:**

```typescript
// ✅ SAFE: Angular escapes automatically
@Component({
  template: `
    <div>{{ userInput }}</div>
    <p [innerHTML]="userInput"></p>
    <!-- ❌ UNSAFE if userInput contains HTML -->
  `,
})
export class ExampleComponent {
  userInput = signal('<script>alert("XSS")</script>');
}
```

**If you MUST render HTML, sanitize it:**

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class ExampleComponent {
  constructor(private sanitizer: DomSanitizer) {}

  get safeHtml(): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.userInput());
  }
}
```

**Backend - Escape output in non-JSON responses:**

```typescript
import validator from 'validator';

// If sending HTML email or other HTML response
const escapedContent = validator.escape(userInput);
```

### CSRF Protection

**Enabled by default with proper cookie settings:**

```typescript
// Session cookie with sameSite protection
cookie: {
  sameSite: 'strict', // ✅ Prevents CSRF
  httpOnly: true,
  secure: true,
}
```

**For API tokens, use custom header:**

```typescript
// Require custom header (not automatically sent by browser)
fastify.addHook('preHandler', async (request, reply) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfHeader = request.headers['x-csrf-token'];

    if (!csrfHeader) {
      reply.code(403).send({ error: 'CSRF token required' });
      return;
    }

    // Validate token
    const valid = await validateCsrfToken(csrfHeader, request.user?.id);

    if (!valid) {
      reply.code(403).send({ error: 'Invalid CSRF token' });
    }
  }
});
```

### File Upload Security

```typescript
import { FileFilterCallback } from 'multer';

// Whitelist allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.xls', '.xlsx'];

// File filter
function fileFilter(req: any, file: Express.Multer.File, cb: FileFilterCallback) {
  // 1. Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }

  // 2. Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file extension'));
  }

  // 3. Sanitize filename
  file.originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

  cb(null, true);
}

// Multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/uploads',
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5, // Max 5 files per request
  },
  fileFilter,
});
```

**Additional file security:**

```typescript
// Scan uploaded files for malware (example with ClamAV)
async function scanFile(filepath: string): Promise<boolean> {
  // Integration with antivirus scanner
  // Return true if clean, false if infected
}

// After upload
fastify.post('/api/upload', async (request, reply) => {
  const files = request.files;

  for (const file of files) {
    const isClean = await scanFile(file.path);

    if (!isClean) {
      // Delete infected file
      fs.unlinkSync(file.path);
      throw new Error('File failed security scan');
    }
  }

  return reply.success({ files });
});
```

---

## Access Control

### Role-Based Access Control (RBAC)

```typescript
// Define roles and permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Product management
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Settings
  SETTINGS_UPDATE: 'settings:update',
} as const;

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

  [ROLES.ADMIN]: [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE, PERMISSIONS.PRODUCT_DELETE],

  [ROLES.MANAGER]: [PERMISSIONS.USER_READ, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE],

  [ROLES.USER]: [PERMISSIONS.PRODUCT_READ],
};
```

### Permission Checking Middleware

```typescript
// Check if user has permission
function checkPermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user; // From JWT/session

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Get user's permissions based on role
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    if (!userPermissions.includes(permission)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}

// Usage
fastify.post('/api/users', {
  preHandler: checkPermission(PERMISSIONS.USER_CREATE),
  handler: async (request, reply) => {
    // User has permission to create users
    const user = await createUser(request.body);
    return reply.success(user);
  },
});
```

### Resource-Level Authorization

```typescript
// Check resource ownership
async function checkResourceOwnership(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const resourceId = (request.params as any).id;

  const resource = await knex('resources').where({ id: resourceId }).first();

  if (!resource) {
    return reply.code(404).send({ error: 'Resource not found' });
  }

  // Check ownership or admin role
  if (resource.user_id !== userId && request.user.role !== ROLES.ADMIN) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

// Usage
fastify.put('/api/posts/:id', {
  preHandler: checkResourceOwnership,
  handler: async (request, reply) => {
    // User owns resource or is admin
    const updated = await updatePost(request.params.id, request.body);
    return reply.success(updated);
  },
});
```

---

## API Security

### Rate Limiting

```typescript
import rateLimit from '@fastify/rate-limit';

// Global rate limiting
await fastify.register(rateLimit, {
  global: true,
  max: 100, // 100 requests
  timeWindow: '1 minute',
  redis: fastify.redis, // Store in Redis

  keyGenerator: (request) => {
    // Rate limit by user if authenticated, otherwise by IP
    return request.user?.id || request.ip;
  },

  errorResponseBuilder: (request, context) => {
    return {
      error: 'Too many requests',
      retryAfter: context.ttl,
    };
  },
});

// Stricter limit for sensitive endpoints
fastify.post('/api/auth/login', {
  config: {
    rateLimit: {
      max: 5, // 5 attempts
      timeWindow: '15 minutes',
    },
  },
  handler: loginHandler,
});
```

### CORS Configuration

```typescript
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://app.example.com', 'https://admin.example.com'];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

### Security Headers

```typescript
import helmet from '@fastify/helmet';

await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});
```

---

## Secure Development

### Secret Management

**NEVER commit secrets to code:**

```bash
# .gitignore
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
```

**Use environment variables:**

```typescript
// ✅ CORRECT: Load from environment
const JWT_SECRET = process.env.JWT_SECRET;
const DB_PASSWORD = process.env.DB_PASSWORD;

// ❌ WRONG: Hardcoded secrets
const JWT_SECRET = 'my-secret-key';
```

**Validate required secrets on startup:**

```typescript
const REQUIRED_SECRETS = ['JWT_SECRET', 'DB_PASSWORD', 'ENCRYPTION_KEY', 'SESSION_SECRET'];

for (const secret of REQUIRED_SECRETS) {
  if (!process.env[secret]) {
    throw new Error(`Missing required secret: ${secret}`);
  }
}
```

### Dependency Security

**Regular dependency scanning:**

```bash
# Check for vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Check outdated packages
npm outdated
```

**Keep dependencies updated:**

```json
// package.json - Use specific versions, not wildcards
{
  "dependencies": {
    "fastify": "4.25.0", // ✅ Specific version
    "bcrypt": "^5.1.1", // ✅ Allow patches
    "random-package": "*" // ❌ Never use *
  }
}
```

---

## Security Testing

### Security Test Checklist

**Before every release:**

- [ ] **Authentication Tests**
  - [ ] Login with correct credentials succeeds
  - [ ] Login with incorrect credentials fails
  - [ ] Password reset flow works correctly
  - [ ] Session expires after timeout
  - [ ] Token expiration handled properly

- [ ] **Authorization Tests**
  - [ ] Users cannot access resources they don't own
  - [ ] Users cannot perform actions they don't have permission for
  - [ ] Admin can access admin-only features
  - [ ] Regular users cannot access admin features

- [ ] **Input Validation Tests**
  - [ ] SQL injection attempts blocked
  - [ ] XSS attempts sanitized
  - [ ] Invalid file types rejected
  - [ ] File size limits enforced
  - [ ] Required fields validated

- [ ] **API Security Tests**
  - [ ] Rate limiting works
  - [ ] CORS configured correctly
  - [ ] Security headers present
  - [ ] HTTPS enforced in production

- [ ] **Data Protection Tests**
  - [ ] Sensitive data encrypted in database
  - [ ] Passwords properly hashed
  - [ ] API keys not exposed in logs
  - [ ] Personal data not in error messages

### Security Scanning Tools

```bash
# npm audit (automated in CI/CD)
npm audit --production

# OWASP Dependency Check
# Scan for known vulnerabilities
npx dependency-check --scan .

# Retire.js
# Check for outdated JS libraries
npx retire

# SonarQube (if available)
# Static code analysis for security issues
```

---

## Incident Response

### Security Incident Detection

**Monitor for suspicious activity:**

```typescript
// Log failed authentication attempts
fastify.addHook('onResponse', async (request, reply) => {
  if (request.url.includes('/auth/login') && reply.statusCode === 401) {
    await logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip: request.ip,
      username: request.body?.email,
      timestamp: new Date(),
    });

    // Alert if > 5 failures from same IP in 5 minutes
    const recentFailures = await getRecentAuthFailures(request.ip, 5);
    if (recentFailures.length > 5) {
      await alertSecurityTeam({
        type: 'BRUTE_FORCE_ATTEMPT',
        ip: request.ip,
        count: recentFailures.length,
      });
    }
  }
});
```

### Incident Response Procedures

**If security incident detected:**

1. **Contain**
   - Immediately revoke compromised tokens/keys
   - Block suspicious IP addresses
   - Disable affected user accounts

2. **Investigate**
   - Review audit logs
   - Identify scope of breach
   - Document timeline

3. **Notify**
   - Inform security team immediately
   - Notify affected users (if PII compromised)
   - Report to regulatory authorities (if required)

4. **Recover**
   - Patch vulnerability
   - Reset compromised credentials
   - Restore from backup if needed

5. **Post-Mortem**
   - Document what happened
   - Identify root cause
   - Implement preventive measures

### Security Event Logging

```typescript
export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
}

async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  await knex('security_events').insert(event);

  // Also log to external SIEM if critical
  if (event.type === 'SUSPICIOUS_ACTIVITY') {
    await sendToSIEM(event);
  }
}
```

---

## Security Checklist

### Development Phase

- [ ] All secrets in environment variables
- [ ] TypeBox schemas for all inputs
- [ ] Password hashing with bcrypt (14+ rounds)
- [ ] JWT tokens properly signed and verified
- [ ] Sensitive data encrypted at rest
- [ ] SQL queries use parameterization
- [ ] File uploads validated and scanned
- [ ] RBAC implemented correctly
- [ ] Rate limiting configured

### Testing Phase

- [ ] Security tests written and passing
- [ ] Dependency vulnerabilities checked (npm audit)
- [ ] Authentication tests pass
- [ ] Authorization tests pass
- [ ] Input validation tests pass
- [ ] No secrets in logs
- [ ] Error messages don't expose sensitive data

### Deployment Phase

- [ ] HTTPS enforced
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] Environment variables set correctly
- [ ] Database encrypted at rest (AWS RDS encryption, etc.)
- [ ] Firewall rules configured
- [ ] Monitoring and alerting enabled
- [ ] Backup and recovery tested

### Post-Deployment

- [ ] Security monitoring active
- [ ] Audit logs being collected
- [ ] Incident response procedures documented
- [ ] Regular security reviews scheduled
- [ ] Dependency updates automated
- [ ] Penetration testing scheduled (if applicable)

---

**Related Standards:**

- [Performance & Scalability Guidelines](./performance-scalability-guidelines.md)
- [Audit & Compliance Framework](./audit-compliance-framework.md)
- [Universal Full-Stack Standard](./universal-fullstack-standard.md)

**Last Updated:** 2025-11-01 | **Version:** 1.0.0
