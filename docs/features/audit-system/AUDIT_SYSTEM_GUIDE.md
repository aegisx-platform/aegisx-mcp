# Audit System - Complete Implementation Guide

## 📊 Overview

AegisX Platform มี Audit System แบบ **modular และ extensible** ที่ออกแบบมาเพื่อ track และ analyze user actions, security events, และ system operations

### จำนวน Audit Tables (3 Tables)

| Table Name        | Purpose                                    | Module Location                     |
| ----------------- | ------------------------------------------ | ----------------------------------- |
| `error_logs`      | Client & server error tracking             | `core/error-logs/`                  |
| `login_attempts`  | Authentication & security monitoring       | `core/audit-system/login-attempts/` |
| `file_audit_logs` | File operation tracking (upload, download) | `core/audit-system/file-audit/`     |

---

## 🏗️ Architecture Overview

### Base Classes (Abstract Pattern)

Audit System ใช้ **inheritance pattern** เพื่อ standardize การทำงานของทุก audit module:

```
BaseAuditRepository (base.repository.ts)
    ↓ extends
ErrorLogsRepository / LoginAttemptsRepository / FileAuditRepository
    ↓ used by
BaseAuditService (base.service.ts)
    ↓ extends
ErrorLogsService / LoginAttemptsService / FileAuditService
    ↓ used by
Controller → Routes → Fastify Plugin
```

### Core Components

```typescript
┌─────────────────────────────────────────────────┐
│          apps/api/src/core/                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  audit-system/                                  │
│  ├── base/                                      │
│  │   ├── base.repository.ts    ← Abstract      │
│  │   └── base.service.ts       ← Abstract      │
│  │                                              │
│  ├── login-attempts/                            │
│  │   ├── login-attempts.repository.ts           │
│  │   ├── login-attempts.service.ts              │
│  │   ├── login-attempts.controller.ts           │
│  │   ├── login-attempts.routes.ts               │
│  │   ├── login-attempts.schemas.ts              │
│  │   └── login-attempts.plugin.ts               │
│  │                                              │
│  ├── file-audit/                                │
│  │   └── (same structure)                       │
│  │                                              │
│  └── audit.plugin.ts (registers all modules)   │
│                                                 │
│  error-logs/  (same structure)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Request Flow (Read Operations)

```
HTTP GET /api/login-attempts?page=1&limit=25
    ↓
login-attempts.routes.ts (validation with TypeBox)
    ↓
login-attempts.controller.ts (request handling)
    ↓
login-attempts.service.ts (business logic)
    ↓
login-attempts.repository.ts (database queries)
    ↓
BaseAuditRepository (common query patterns)
    ↓
PostgreSQL (login_attempts table)
    ↓
← Response with PaginationResult<LoginAttempt>
```

### Write Flow (Log Operations)

```
User Action (e.g., failed login)
    ↓
AccountLockoutService.recordAttempt()
    ↓
LoginAttemptsService.logLoginAttempt()
    ↓
LoginAttemptsRepository.create()
    ↓
PostgreSQL INSERT into login_attempts
```

---

## 📋 Database Schema Requirements

### Required Columns for ALL Audit Tables

```sql
-- ✅ MANDATORY COLUMNS (BaseAuditRepository requires these)
id           UUID PRIMARY KEY
timestamp    TIMESTAMP NOT NULL  -- For filtering queries
created_at   TIMESTAMP NOT NULL  -- Record creation time

-- ✅ RECOMMENDED COLUMNS (for security audit)
user_id      UUID
ip_address   VARCHAR(45)  -- Supports IPv4 & IPv6
user_agent   TEXT
session_id   VARCHAR(255)
```

### Why Both `timestamp` and `created_at`?

- **`timestamp`**: Used for **filtering and querying** (e.g., "show errors from last 7 days")
- **`created_at`**: Used for **record tracking** (when was this record inserted into DB)

**Example from `error_logs`:**

```sql
timestamp         -- 2025-11-02 10:30:00 (when error actually occurred)
server_timestamp  -- 2025-11-02 10:30:05 (when server received error)
created_at        -- 2025-11-02 10:30:05 (when DB record was created)
```

---

## 🚀 Implementation Guide: Adding New Audit Log

### Step 1: Create Migration

```bash
# Create migration file
pnpm knex migrate:make create_user_actions_table
```

**File: `20251102120000_create_user_actions_table.ts`**

```typescript
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_actions', (table) => {
    // ✅ REQUIRED: Base audit columns
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // ✅ RECOMMENDED: Security context
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.string('session_id', 255);

    // ✅ CUSTOM: Your audit-specific columns
    table.string('action', 50).notNullable(); // e.g., 'view_profile', 'update_settings'
    table.string('resource_type', 50); // e.g., 'user', 'product'
    table.uuid('resource_id'); // ID of the resource being acted upon
    table.jsonb('metadata'); // Additional context
    table.boolean('success').notNullable().defaultTo(true);
    table.text('error_message');

    // ✅ Indexes for performance
    table.index(['user_id', 'timestamp']);
    table.index(['action', 'timestamp']);
    table.index(['resource_type', 'resource_id']);
    table.index(['timestamp']); // For cleanup queries
  });

  await knex.raw(`
    COMMENT ON TABLE user_actions IS 'Tracks all user actions for security audit';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_actions');
}
```

### Step 2: Create TypeBox Schemas

**File: `user-actions.schemas.ts`**

```typescript
import { Type, Static } from '@sinclair/typebox';
import { BaseAuditQuerySchema, PaginationResultSchema } from '../base/base.schemas';

// ==================== MAIN SCHEMA ====================

export const UserActionSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  timestamp: Type.String({ format: 'date-time' }),
  ipAddress: Type.Optional(Type.String()),
  userAgent: Type.Optional(Type.String()),
  sessionId: Type.Optional(Type.String()),

  // Custom fields
  action: Type.String({ minLength: 1, maxLength: 50 }),
  resourceType: Type.Optional(Type.String({ maxLength: 50 })),
  resourceId: Type.Optional(Type.String({ format: 'uuid' })),
  metadata: Type.Optional(Type.Any()),
  success: Type.Boolean(),
  errorMessage: Type.Optional(Type.String()),

  createdAt: Type.String({ format: 'date-time' }),
});

export type UserAction = Static<typeof UserActionSchema>;

// ==================== CREATE SCHEMA ====================

export const CreateUserActionSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  ipAddress: Type.Optional(Type.String()),
  userAgent: Type.Optional(Type.String()),
  action: Type.String({ minLength: 1, maxLength: 50 }),
  resourceType: Type.Optional(Type.String()),
  resourceId: Type.Optional(Type.String({ format: 'uuid' })),
  metadata: Type.Optional(Type.Any()),
  success: Type.Optional(Type.Boolean({ default: true })),
  errorMessage: Type.Optional(Type.String()),
});

export type CreateUserAction = Static<typeof CreateUserActionSchema>;

// ==================== QUERY SCHEMA ====================

export const UserActionsQuerySchema = Type.Intersect([
  BaseAuditQuerySchema,
  Type.Object({
    action: Type.Optional(Type.String()),
    resourceType: Type.Optional(Type.String()),
    resourceId: Type.Optional(Type.String({ format: 'uuid' })),
    success: Type.Optional(Type.Boolean()),
  }),
]);

export type UserActionsQuery = Static<typeof UserActionsQuerySchema>;

// ==================== STATS SCHEMA ====================

export const UserActionsStatsSchema = Type.Object({
  total: Type.Number(),
  recent24h: Type.Number(),
  byAction: Type.Record(Type.String(), Type.Number()),
  successRate: Type.Number({ minimum: 0, maximum: 100 }),
});

export type UserActionsStats = Static<typeof UserActionsStatsSchema>;

// ==================== RESPONSE SCHEMAS ====================

export const UserActionResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: UserActionSchema,
});

export const UserActionsListResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: PaginationResultSchema(UserActionSchema),
});

export const UserActionsStatsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: UserActionsStatsSchema,
});
```

**🚨 CRITICAL: Schema Patterns**

```typescript
// ❌ WRONG: Type.Literal() causes serialization issues
failureReason: Type.Optional(Type.Literal('invalid_credentials'));

// ✅ CORRECT: Type.String() allows runtime values
failureReason: Type.Optional(
  Type.String({
    minLength: 1,
    maxLength: 100,
    description: 'Reason for failure',
  }),
);
```

### Step 3: Create Repository

**File: `user-actions.repository.ts`**

```typescript
import { Knex } from 'knex';
import { BaseAuditRepository } from '../base/base.repository';
import { UserAction, UserActionsQuery, UserActionsStats } from './user-actions.schemas';

export class UserActionsRepository extends BaseAuditRepository<UserAction, UserActionsQuery> {
  constructor(knex: Knex) {
    super(knex, 'user_actions');
  }

  /**
   * Define which fields to SELECT from database
   * Maps snake_case (DB) → camelCase (TypeScript)
   */
  protected getSelectFields(): any[] {
    return ['id', this.knex.raw('user_id as "userId"'), 'timestamp', this.knex.raw('ip_address as "ipAddress"'), this.knex.raw('user_agent as "userAgent"'), this.knex.raw('session_id as "sessionId"'), 'action', this.knex.raw('resource_type as "resourceType"'), this.knex.raw('resource_id as "resourceId"'), 'metadata', 'success', this.knex.raw('error_message as "errorMessage"'), this.knex.raw('created_at as "createdAt"')];
  }

  /**
   * Apply custom filters beyond base filters
   */
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: UserActionsQuery): Knex.QueryBuilder {
    if (filters.action) {
      query = query.where('action', filters.action);
    }

    if (filters.resourceType) {
      query = query.where('resource_type', filters.resourceType);
    }

    if (filters.resourceId) {
      query = query.where('resource_id', filters.resourceId);
    }

    if (filters.success !== undefined) {
      query = query.where('success', filters.success);
    }

    return query;
  }

  /**
   * Get statistics (custom aggregation)
   */
  async getStats(days: number = 7): Promise<UserActionsStats> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total count
    const [{ count: total }] = await this.knex(this.tableName).where('timestamp', '>=', sinceDate).count('* as count');

    // Recent 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [{ count: recent24h }] = await this.knex(this.tableName).where('timestamp', '>=', yesterday).count('* as count');

    // By action
    const byActionRows = await this.knex(this.tableName).where('timestamp', '>=', sinceDate).select('action').count('* as count').groupBy('action');

    const byAction: Record<string, number> = {};
    byActionRows.forEach((row: any) => {
      byAction[row.action] = parseInt(row.count, 10);
    });

    // Success rate
    const [{ count: successCount }] = await this.knex(this.tableName).where('timestamp', '>=', sinceDate).where('success', true).count('* as count');

    const successRate = total > 0 ? Math.round((parseInt(successCount as string, 10) / parseInt(total as string, 10)) * 100) : 100;

    return {
      total: parseInt(total as string, 10),
      recent24h: parseInt(recent24h as string, 10),
      byAction,
      successRate,
    };
  }

  /**
   * Map TypeScript object → Database row (camelCase → snake_case)
   */
  protected mapToDatabase(data: Partial<UserAction>): Record<string, any> {
    return {
      id: data.id,
      user_id: data.userId,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      session_id: data.sessionId,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      metadata: data.metadata,
      success: data.success ?? true,
      error_message: data.errorMessage,
    };
  }
}
```

### Step 4: Create Service

**File: `user-actions.service.ts`**

```typescript
import { Knex } from 'knex';
import { BaseAuditService } from '../base/base.service';
import { UserActionsRepository } from './user-actions.repository';
import { UserAction, UserActionsQuery, UserActionsStats, CreateUserAction } from './user-actions.schemas';

export class UserActionsService extends BaseAuditService<UserAction, UserActionsQuery, UserActionsStats, UserActionsRepository> {
  constructor(knex: Knex) {
    super(knex, 'User action');
  }

  protected createRepository(knex: Knex): UserActionsRepository {
    return new UserActionsRepository(knex);
  }

  protected getExportHeaders(): string[] {
    return ['ID', 'Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Success', 'IP Address'];
  }

  protected getExportRow(log: UserAction): any[] {
    return [log.id, this.formatTimestamp(log.timestamp), log.userId, log.action, log.resourceType || '', log.resourceId || '', log.success ? 'Yes' : 'No', log.ipAddress || ''];
  }

  protected async validateCreate(data: Partial<UserAction>): Promise<void> {
    if (!data.userId) throw new Error('User ID is required');
    if (!data.action) throw new Error('Action is required');
  }

  /**
   * Convenience method: Log user action
   */
  async logAction(data: CreateUserAction): Promise<string> {
    return this.create({
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } as Partial<UserAction>);
  }

  /**
   * Get user's action history
   */
  async getUserHistory(userId: string, options: { limit?: number; offset?: number } = {}): Promise<UserAction[]> {
    const { limit = 50, offset = 0 } = options;
    const page = Math.floor(offset / limit) + 1;

    const result = await this.findAll({
      userId,
      page,
      limit,
    });

    return result.data;
  }
}
```

### Step 5: Create Controller

**File: `user-actions.controller.ts`**

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserActionsService } from './user-actions.service';
import { UserActionsQuery, CreateUserAction } from './user-actions.schemas';

export class UserActionsController {
  constructor(private readonly service: UserActionsService) {}

  async findAll(request: FastifyRequest<{ Querystring: UserActionsQuery }>, reply: FastifyReply) {
    try {
      const result = await this.service.findAll(request.query);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      request.log.error('Failed to fetch user actions', error);
      return reply.internalServerError(error.message);
    }
  }

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const log = await this.service.findById(request.params.id);
      return reply.send({ success: true, data: log });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return reply.notFound(error.message);
      }
      request.log.error('Failed to fetch user action', error);
      return reply.internalServerError(error.message);
    }
  }

  async create(request: FastifyRequest<{ Body: CreateUserAction }>, reply: FastifyReply) {
    try {
      const id = await this.service.logAction(request.body);
      const log = await this.service.findById(id);
      return reply.code(201).send({ success: true, data: log });
    } catch (error: any) {
      request.log.error('Failed to create user action', error);
      return reply.badRequest(error.message);
    }
  }

  async getStats(request: FastifyRequest<{ Querystring: { days?: number } }>, reply: FastifyReply) {
    try {
      const days = request.query.days || 7;
      const stats = await this.service.getStats(days);
      return reply.send({ success: true, data: stats });
    } catch (error: any) {
      request.log.error('Failed to fetch stats', error);
      return reply.internalServerError(error.message);
    }
  }

  async export(request: FastifyRequest<{ Querystring: UserActionsQuery }>, reply: FastifyReply) {
    try {
      const csv = await this.service.exportToCSV(request.query);
      return reply.header('Content-Type', 'text/csv').header('Content-Disposition', 'attachment; filename="user-actions.csv"').send(csv);
    } catch (error: any) {
      request.log.error('Failed to export user actions', error);
      return reply.internalServerError(error.message);
    }
  }

  async cleanup(request: FastifyRequest<{ Body: { days: number } }>, reply: FastifyReply) {
    try {
      const result = await this.service.cleanup({ olderThan: request.body.days });
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      request.log.error('Failed to cleanup user actions', error);
      return reply.internalServerError(error.message);
    }
  }
}
```

### Step 6: Create Routes

**File: `user-actions.routes.ts`**

```typescript
import { FastifyInstance } from 'fastify';
import { UserActionsController } from './user-actions.controller';
import { UserActionsService } from './user-actions.service';
import { UserActionsQuerySchema, CreateUserActionSchema, UserActionResponseSchema, UserActionsListResponseSchema, UserActionsStatsResponseSchema } from './user-actions.schemas';
import { SchemaRefs } from '../../../schemas/registry';

export async function userActionsRoutes(fastify: FastifyInstance) {
  const service = new UserActionsService(fastify.knex);
  const controller = new UserActionsController(service);

  // List user actions
  fastify.get(
    '/',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'List user actions with pagination',
        querystring: UserActionsQuerySchema,
        response: {
          200: UserActionsListResponseSchema,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:read')],
    },
    controller.findAll.bind(controller),
  );

  // Get single user action
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'Get user action by ID',
        params: SchemaRefs.UuidParam,
        response: {
          200: UserActionResponseSchema,
          401: SchemaRefs.Unauthorized,
          404: SchemaRefs.NotFound,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:read')],
    },
    controller.findById.bind(controller),
  );

  // Create user action (log event)
  fastify.post(
    '/',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'Log user action',
        body: CreateUserActionSchema,
        response: {
          201: UserActionResponseSchema,
          400: SchemaRefs.BadRequest,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:create')],
    },
    controller.create.bind(controller),
  );

  // Get statistics
  fastify.get(
    '/stats',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'Get user actions statistics',
        querystring: Type.Object({
          days: Type.Optional(Type.Number({ minimum: 1, maximum: 365 })),
        }),
        response: {
          200: UserActionsStatsResponseSchema,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:read')],
    },
    controller.getStats.bind(controller),
  );

  // Export to CSV
  fastify.get(
    '/export',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'Export user actions to CSV',
        querystring: UserActionsQuerySchema,
        response: {
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:export')],
    },
    controller.export.bind(controller),
  );

  // Cleanup old records
  fastify.post(
    '/cleanup',
    {
      schema: {
        tags: ['User Actions'],
        summary: 'Delete old user actions',
        body: Type.Object({
          days: Type.Number({ minimum: 1 }),
        }),
        response: {
          200: SchemaRefs.SuccessResponse,
          401: SchemaRefs.Unauthorized,
          500: SchemaRefs.ServerError,
        },
      },
      onRequest: [fastify.authenticate, fastify.verifyPermission('user-actions:delete')],
    },
    controller.cleanup.bind(controller),
  );
}
```

### Step 7: Create Plugin

**File: `user-actions.plugin.ts`**

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { userActionsRoutes } from './user-actions.routes';

export default fp(
  async function (fastify: FastifyInstance) {
    // Register routes under /api/user-actions
    await fastify.register(userActionsRoutes, {
      prefix: '/user-actions',
    });

    fastify.log.info('✅ User Actions plugin registered');
  },
  {
    name: 'user-actions-plugin',
    dependencies: ['knex-plugin', 'auth-plugin'],
  },
);
```

### Step 8: Register Plugin in Main Application

**File: `apps/api/src/app/app.ts` or plugin loader**

```typescript
// Register audit plugin (which includes user-actions)
await fastify.register(import('@/core/audit-system/audit.plugin'));
```

### Step 9: Usage Example

**In your business logic:**

```typescript
import { UserActionsService } from '@/core/audit-system/user-actions';

// Initialize service
const userActionsService = new UserActionsService(fastify.knex);

// Log user action
await userActionsService.logAction({
  userId: user.id,
  action: 'update_profile',
  resourceType: 'user',
  resourceId: user.id,
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  metadata: {
    fieldsChanged: ['firstName', 'email'],
  },
  success: true,
});

// Get user's history
const history = await userActionsService.getUserHistory(user.id, {
  limit: 20,
  offset: 0,
});

// Get statistics
const stats = await userActionsService.getStats(7); // Last 7 days
```

---

## 📝 Best Practices

### 1. Schema Patterns

```typescript
// ✅ DO: Use Type.String() for flexible values
failureReason: Type.Optional(Type.String({ maxLength: 100 }));

// ❌ DON'T: Use Type.Literal() - causes serialization issues
failureReason: Type.Optional(Type.Literal('invalid_credentials'));
```

### 2. Field Mapping

```typescript
// ✅ DO: Map snake_case → camelCase in getSelectFields()
protected getSelectFields(): any[] {
  return [
    'id',
    this.knex.raw('user_id as "userId"'),  // Map snake_case to camelCase
    this.knex.raw('ip_address as "ipAddress"'),
    'created_at',  // Keep as-is if frontend expects snake_case
  ];
}
```

### 3. Required Columns

```typescript
// ✅ DO: Include both timestamp and created_at
table.timestamp('timestamp').notNullable(); // For queries/filtering
table.timestamp('created_at').notNullable(); // For record tracking
```

### 4. Indexes

```typescript
// ✅ DO: Add indexes for common query patterns
table.index(['user_id', 'timestamp']); // User history queries
table.index(['timestamp']); // Date range queries + cleanup
table.index(['action']); // Filter by action type
```

### 5. Error Handling

```typescript
// ✅ DO: Handle specific error cases
try {
  const log = await service.findById(id);
  return reply.send({ success: true, data: log });
} catch (error: any) {
  if (error.message.includes('not found')) {
    return reply.notFound(error.message); // 404
  }
  return reply.internalServerError(error.message); // 500
}
```

### 6. Fire-and-Forget Logging

```typescript
// ✅ DO: Don't block business logic with audit logging
async updateProfile(userId: string, data: ProfileData) {
  // Business logic
  await this.userRepository.update(userId, data);

  // Audit logging (fire-and-forget, doesn't block)
  this.userActionsService.logAction({
    userId,
    action: 'update_profile',
    resourceType: 'user',
    resourceId: userId,
  }).catch(error => {
    fastify.log.error('Failed to log user action', error);
  });

  return { success: true };
}
```

---

## 🔍 Testing Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { buildTestApp } from '../../../test-helpers/app-helper';
import { FastifyInstance } from 'fastify';

describe('User Actions API', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildTestApp();
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@aegisx.local',
        password: 'Admin123!',
      },
    });
    token = loginRes.json().data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should log user action', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/user-actions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        userId: 'user-uuid',
        action: 'update_profile',
        success: true,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().success).toBe(true);
    expect(response.json().data.action).toBe('update_profile');
  });

  it('should get user actions with pagination', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/user-actions?page=1&limit=25',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().data.data).toBeInstanceOf(Array);
  });

  it('should get statistics', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/user-actions/stats?days=7',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveProperty('total');
    expect(response.json().data).toHaveProperty('byAction');
  });
});
```

---

## 🎯 Summary

### Quick Checklist for New Audit Log

- [ ] **Migration**: Create table with `id`, `timestamp`, `created_at` (mandatory)
- [ ] **Schemas**: Define TypeBox schemas (avoid `Type.Literal()` for flexible fields)
- [ ] **Repository**: Extend `BaseAuditRepository`, implement `getSelectFields()` and `applyCustomFilters()`
- [ ] **Service**: Extend `BaseAuditService`, implement export methods and validation
- [ ] **Controller**: Handle requests, call service methods, return proper responses
- [ ] **Routes**: Define endpoints with TypeBox schemas and authentication
- [ ] **Plugin**: Register routes under `/api/[module-name]`
- [ ] **Tests**: Write integration tests for all endpoints

### Key Points

1. **Always extend base classes** - Don't reinvent the wheel
2. **Use TypeBox for all schemas** - Runtime validation + TypeScript types
3. **Include both timestamp columns** - `timestamp` (filtering) + `created_at` (tracking)
4. **Map snake_case ↔ camelCase** - In `getSelectFields()` and `mapToDatabase()`
5. **Fire-and-forget logging** - Don't block business logic with audit logging
6. **Add proper indexes** - For common query patterns and cleanup operations

---

## 📚 Related Documentation

- [TypeBox Schema Standard](../../05c-typebox-schema-standard.md)
- [API-First Workflow](../../development/api-first-workflow.md)
- [Testing Strategy](../../testing/testing-strategy.md)

---

**Last Updated:** 2025-11-02 (Session 60)
