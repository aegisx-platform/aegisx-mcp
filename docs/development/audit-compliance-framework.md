# Audit & Compliance Framework

> **Enterprise audit trail and regulatory compliance guidelines**

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Target Audience:** All Developers, Compliance Officers, Auditors

---

## 📋 Table of Contents

- [Overview](#overview)
- [Audit Trail Requirements](#audit-trail-requirements)
- [Implementation Patterns](#implementation-patterns)
- [Data Retention](#data-retention)
- [Compliance Requirements](#compliance-requirements)
- [Audit Reporting](#audit-reporting)
- [User Consent & Privacy](#user-consent--privacy)
- [Compliance Checklist](#compliance-checklist)

---

## Overview

Audit trails and compliance are mandatory for enterprise applications. This framework ensures:

- Complete traceability of all user actions
- Regulatory compliance (GDPR, PDPA, SOC 2, ISO 27001)
- Data privacy and user consent
- Audit reporting capabilities

### Audit Principles

1. **Completeness** - Log all significant events
2. **Immutability** - Audit logs cannot be modified
3. **Timeliness** - Real-time logging (no delay)
4. **Accessibility** - Easy to query and report
5. **Retention** - Kept for required period

---

## Audit Trail Requirements

### What to Log (MANDATORY)

#### 1. Authentication Events

```typescript
// MUST log these events
const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'User logged in',
  LOGIN_FAILURE: 'Login failed',
  LOGOUT: 'User logged out',
  PASSWORD_CHANGE: 'Password changed',
  PASSWORD_RESET: 'Password reset requested',
  SESSION_EXPIRED: 'Session expired',
  MFA_ENABLED: 'MFA enabled',
  MFA_DISABLED: 'MFA disabled',
};
```

#### 2. Authorization Events

```typescript
const AUTHZ_EVENTS = {
  PERMISSION_DENIED: 'Permission denied (403)',
  ROLE_CHANGED: 'User role changed',
  PERMISSION_GRANTED: 'Permission granted to user',
  PERMISSION_REVOKED: 'Permission revoked from user',
};
```

#### 3. Data Modification (CRUD)

```typescript
const DATA_EVENTS = {
  CREATE: 'Record created',
  READ: 'Record accessed', // Only for sensitive data
  UPDATE: 'Record modified',
  DELETE: 'Record deleted',
};
```

#### 4. Sensitive Data Access

```typescript
const SENSITIVE_ACCESS_EVENTS = {
  VIEW_PII: 'Personal information viewed',
  VIEW_PHI: 'Protected health information viewed',
  EXPORT_DATA: 'Data exported',
  DOWNLOAD_FILE: 'File downloaded',
  REPORT_GENERATED: 'Report generated',
};
```

### Audit Log Schema

```typescript
import { Type } from '@sinclair/typebox';

export const AuditLogSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  timestamp: Type.String({ format: 'date-time' }),

  // Who (Actor)
  userId: Type.String({ format: 'uuid' }),
  username: Type.String(),
  userRole: Type.String(),

  // What (Action)
  action: Type.Union([Type.Literal('CREATE'), Type.Literal('READ'), Type.Literal('UPDATE'), Type.Literal('DELETE'), Type.Literal('LOGIN'), Type.Literal('LOGOUT')]),

  // Where (Resource)
  resource: Type.String(), // Table/entity name
  resourceId: Type.Optional(Type.String()),

  // Changes (for UPDATE operations)
  changes: Type.Optional(
    Type.Object({
      before: Type.Any(),
      after: Type.Any(),
    }),
  ),

  // Context
  ipAddress: Type.String(),
  userAgent: Type.String(),
  endpoint: Type.String(), // API endpoint called
  httpMethod: Type.String(),
  statusCode: Type.Integer(),

  // Additional metadata
  metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type AuditLog = Static<typeof AuditLogSchema>;
```

### Database Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Actor
  user_id UUID NOT NULL REFERENCES users(id),
  username VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,

  -- Action
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),

  -- Changes (JSONB for flexible structure)
  changes JSONB,

  -- Context
  ip_address INET NOT NULL,
  user_agent TEXT,
  endpoint VARCHAR(255),
  http_method VARCHAR(10),
  status_code INTEGER,

  -- Metadata
  metadata JSONB,

  -- Indexes for common queries
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_timestamp (timestamp DESC),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource, resource_id),
  INDEX idx_audit_user_timestamp (user_id, timestamp DESC)
);

-- Make table immutable (prevent updates/deletes)
CREATE OR REPLACE RULE audit_logs_no_update AS
  ON UPDATE TO audit_logs DO INSTEAD NOTHING;

CREATE OR REPLACE RULE audit_logs_no_delete AS
  ON DELETE TO audit_logs DO INSTEAD NOTHING;
```

---

## Implementation Patterns

### 1. Service-Level Audit Logging

```typescript
// Base service with audit logging
export class BaseService {
  constructor(
    protected knex: Knex,
    protected auditLogService: AuditLogService,
  ) {}

  async create<T>(tableName: string, data: any, userId: string, context: AuditContext): Promise<T> {
    // 1. Perform operation
    const [created] = await this.knex(tableName).insert(data).returning('*');

    // 2. Log audit trail
    await this.auditLogService.log({
      userId,
      action: 'CREATE',
      resource: tableName,
      resourceId: created.id,
      changes: {
        before: null,
        after: created,
      },
      ...context,
    });

    return created as T;
  }

  async update<T>(tableName: string, id: string, updates: any, userId: string, context: AuditContext): Promise<T> {
    // 1. Fetch current state
    const before = await this.knex(tableName).where({ id }).first();

    // 2. Perform update
    const [updated] = await this.knex(tableName).where({ id }).update(updates).returning('*');

    // 3. Log audit trail
    await this.auditLogService.log({
      userId,
      action: 'UPDATE',
      resource: tableName,
      resourceId: id,
      changes: {
        before,
        after: updated,
      },
      ...context,
    });

    return updated as T;
  }

  async delete(tableName: string, id: string, userId: string, context: AuditContext): Promise<void> {
    // 1. Fetch current state
    const before = await this.knex(tableName).where({ id }).first();

    // 2. Soft delete (preferred)
    await this.knex(tableName).where({ id }).update({ deleted_at: this.knex.fn.now() });

    // 3. Log audit trail
    await this.auditLogService.log({
      userId,
      action: 'DELETE',
      resource: tableName,
      resourceId: id,
      changes: {
        before,
        after: null,
      },
      ...context,
    });
  }
}
```

### 2. Middleware-Level Audit Logging

```typescript
// Fastify hook for automatic audit logging
fastify.addHook('onResponse', async (request, reply) => {
  // Skip logging for GET requests (unless accessing sensitive data)
  if (request.method === 'GET' && !isSensitiveEndpoint(request.url)) {
    return;
  }

  // Skip logging for health check endpoints
  if (request.url.includes('/health') || request.url.includes('/ping')) {
    return;
  }

  const user = request.user;
  if (!user) return; // Skip if not authenticated

  const auditLog: AuditLog = {
    userId: user.id,
    username: user.username,
    userRole: user.role,
    action: mapHttpMethodToAction(request.method),
    resource: extractResourceName(request.url),
    resourceId: (request.params as any)?.id,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'] || 'Unknown',
    endpoint: request.url,
    httpMethod: request.method,
    statusCode: reply.statusCode,
    timestamp: new Date().toISOString(),
  };

  await fastify.auditLogService.log(auditLog);
});

function mapHttpMethodToAction(method: string): string {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    default:
      return method;
  }
}
```

### 3. Sensitive Data Access Logging

```typescript
// Log sensitive data access
async function getUserWithAudit(userId: string, requestingUserId: string, context: AuditContext): Promise<User> {
  const user = await knex('users').where({ id: userId }).first();

  // Log sensitive data access
  await auditLogService.log({
    userId: requestingUserId,
    action: 'READ',
    resource: 'users',
    resourceId: userId,
    metadata: {
      accessedFields: ['national_id', 'email', 'phone'],
      reason: context.reason, // Optional: reason for access
    },
    ...context,
  });

  return user;
}
```

---

## Data Retention

### Retention Periods

```typescript
export const RETENTION_PERIODS = {
  // Audit logs (regulatory requirement)
  AUDIT_LOGS: 7 * 365, // 7 years

  // User data
  ACTIVE_USERS: Infinity, // Keep until deletion requested
  DELETED_USERS: 30, // 30 days after deletion

  // Transaction data
  FINANCIAL_RECORDS: 7 * 365, // 7 years
  REGULAR_TRANSACTIONS: 2 * 365, // 2 years

  // Temporary data
  PASSWORD_RESET_TOKENS: 1, // 1 day
  EMAIL_VERIFICATION_TOKENS: 7, // 7 days
  SESSIONS: 7, // 7 days

  // Backups
  DAILY_BACKUPS: 30, // 30 days
  WEEKLY_BACKUPS: 90, // 90 days
  MONTHLY_BACKUPS: 365, // 1 year
} as const;
```

### Automated Data Retention

```typescript
// Cron job to enforce retention policies
export async function enforceDataRetention(): Promise<void> {
  const now = new Date();

  // Delete old password reset tokens
  await knex('password_reset_tokens').where('created_at', '<', daysBefore(now, RETENTION_PERIODS.PASSWORD_RESET_TOKENS)).delete();

  // Archive old audit logs (move to cold storage)
  const archiveDate = daysBefore(now, RETENTION_PERIODS.AUDIT_LOGS);
  await archiveAuditLogs(archiveDate);

  // Permanently delete soft-deleted users after retention period
  await knex('users').where('deleted_at', '<', daysBefore(now, RETENTION_PERIODS.DELETED_USERS)).delete();
}

function daysBefore(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
```

---

## Compliance Requirements

### GDPR Compliance Checklist

- [ ] **Data Mapping** - Document all personal data collected
- [ ] **Lawful Basis** - Identify legal basis for processing
- [ ] **Consent Management** - Obtain and track user consent
- [ ] **Data Minimization** - Collect only necessary data
- [ ] **Right to Access** - Users can request their data
- [ ] **Right to Erasure** - Users can request deletion
- [ ] **Right to Portability** - Export data in machine-readable format
- [ ] **Privacy by Design** - Privacy built into systems
- [ ] **Data Protection Officer** - Appointed if required
- [ ] **Breach Notification** - 72-hour breach reporting process

### PDPA Compliance (Thailand)

Similar to GDPR with local requirements:

- [ ] **Data Subject Rights** - Access, correction, deletion, portability
- [ ] **Consent Required** - Explicit consent for sensitive data
- [ ] **Privacy Notice** - In Thai language
- [ ] **Data Transfer** - Controls for cross-border transfers
- [ ] **Retention Limits** - Delete when no longer needed
- [ ] **Security Measures** - Appropriate technical safeguards

### Implementation Example

```typescript
// Data subject rights endpoints
export class DataSubjectRightsController {
  // Right to access
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await knex('users').where({ id: userId }).first();
    const posts = await knex('posts').where({ user_id: userId });
    const comments = await knex('comments').where({ user_id: userId });

    return {
      user: sanitizeUser(user),
      posts,
      comments,
      exportDate: new Date().toISOString(),
    };
  }

  // Right to erasure
  async deleteUserData(userId: string): Promise<void> {
    await knex.transaction(async (trx) => {
      // Anonymize instead of delete (preserve referential integrity)
      await trx('users')
        .where({ id: userId })
        .update({
          email: `deleted-${userId}@example.com`,
          name: 'Deleted User',
          deleted_at: trx.fn.now(),
        });

      // Delete posts and comments
      await trx('posts').where({ user_id: userId }).delete();
      await trx('comments').where({ user_id: userId }).delete();
    });
  }

  // Right to rectification
  async updateUserData(userId: string, updates: any): Promise<User> {
    return await knex('users').where({ id: userId }).update(updates).returning('*').first();
  }
}
```

---

## Audit Reporting

### Common Audit Queries

```typescript
export class AuditReportService {
  // User activity report
  async getUserActivityReport(userId: string, startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await knex('audit_logs').where({ user_id: userId }).whereBetween('timestamp', [startDate, endDate]).orderBy('timestamp', 'desc');
  }

  // Failed login attempts
  async getFailedLoginAttempts(hours: number = 24): Promise<AuditLog[]> {
    return await knex('audit_logs')
      .where({ action: 'LOGIN' })
      .where({ status_code: 401 })
      .where('timestamp', '>=', knex.raw(`NOW() - INTERVAL '${hours} hours'`))
      .orderBy('timestamp', 'desc');
  }

  // Data modifications
  async getDataModifications(resource: string, resourceId: string): Promise<AuditLog[]> {
    return await knex('audit_logs').where({ resource, resource_id: resourceId }).whereIn('action', ['CREATE', 'UPDATE', 'DELETE']).orderBy('timestamp', 'asc');
  }

  // Access to sensitive data
  async getSensitiveDataAccess(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return await knex('audit_logs').whereIn('resource', ['users', 'medical_records', 'financial_data']).where({ action: 'READ' }).whereBetween('timestamp', [startDate, endDate]).orderBy('timestamp', 'desc');
  }

  // Export to CSV for compliance
  async exportToCSV(startDate: Date, endDate: Date): Promise<string> {
    const logs = await knex('audit_logs').whereBetween('timestamp', [startDate, endDate]).orderBy('timestamp', 'asc');

    // Convert to CSV format
    const csv = ['Timestamp,User,Action,Resource,IP Address,Status', ...logs.map((log) => `${log.timestamp},${log.username},${log.action},${log.resource},${log.ip_address},${log.status_code}`)].join('\n');

    return csv;
  }
}
```

---

## User Consent & Privacy

### Consent Management

```typescript
export interface UserConsent {
  userId: string;
  consentType: 'terms' | 'privacy' | 'marketing' | 'cookies';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  version: string; // Track policy version
  ipAddress: string;
}

// Track consent
async function recordConsent(consent: UserConsent): Promise<void> {
  await knex('user_consents').insert(consent);

  // Audit log
  await auditLogService.log({
    userId: consent.userId,
    action: consent.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
    resource: 'user_consents',
    metadata: { consentType: consent.consentType, version: consent.version },
  });
}

// Check if user has given consent
async function hasConsent(userId: string, consentType: string): Promise<boolean> {
  const consent = await knex('user_consents').where({ user_id: userId, consent_type: consentType, granted: true }).whereNull('revoked_at').orderBy('granted_at', 'desc').first();

  return !!consent;
}
```

### Privacy Notice Template

```markdown
# Privacy Policy

**Last Updated:** 2025-11-01

## Data We Collect

- Name, email, phone number
- Usage data and analytics
- IP address and device information

## How We Use Your Data

- Provide and improve our services
- Send important notifications
- Comply with legal obligations

## Your Rights

- Access your personal data
- Request correction or deletion
- Object to processing
- Data portability
- Withdraw consent

## Contact

Data Protection Officer: privacy@example.com
```

---

## Compliance Checklist

### Development Phase

- [ ] Audit logging implemented for all CRUD operations
- [ ] Sensitive data access logged
- [ ] User consent management in place
- [ ] Data retention policies configured
- [ ] Privacy notice created

### Testing Phase

- [ ] Audit logs tested for all operations
- [ ] Data export functionality tested
- [ ] Data deletion functionality tested
- [ ] Consent tracking tested
- [ ] Audit reports generated successfully

### Deployment Phase

- [ ] Audit log table created with correct permissions
- [ ] Automated retention policies scheduled
- [ ] Backup procedures tested
- [ ] Compliance documentation complete
- [ ] Privacy notice published

### Post-Deployment

- [ ] Regular audit log reviews scheduled
- [ ] Compliance reports automated
- [ ] Breach response procedures documented
- [ ] Data protection impact assessments (DPIA) completed
- [ ] Annual compliance review scheduled

---

**Related Standards:**

- [Security Best Practices](./security-best-practices.md)
- [Performance & Scalability Guidelines](./performance-scalability-guidelines.md)
- [Universal Full-Stack Standard](./universal-fullstack-standard.md)

**Last Updated:** 2025-11-01 | **Version:** 1.0.0
