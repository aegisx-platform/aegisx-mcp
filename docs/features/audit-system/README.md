# Audit System Documentation

## 📚 Overview

The AegisX Audit System provides comprehensive tracking and monitoring of user actions, security events, and system operations. It's built on a modular, extensible architecture that makes it easy to add new audit logs for any feature.

---

## 📖 Complete Documentation

### [🎯 AUDIT_SYSTEM_GUIDE.md](./AUDIT_SYSTEM_GUIDE.md)

**The complete implementation guide for the Audit System.**

This guide covers everything you need to know:

#### Contents:

1. **📊 Overview**
   - 3 existing audit tables (error_logs, login_attempts, file_audit_logs)
   - Architecture and design patterns

2. **🏗️ Architecture**
   - Base classes (BaseAuditRepository, BaseAuditService)
   - Module structure and inheritance pattern
   - Component organization

3. **🔄 Data Flow**
   - Request flow for read operations
   - Write flow for logging operations
   - Integration with business logic

4. **📋 Database Schema Requirements**
   - Required columns for ALL audit tables
   - Why both `timestamp` and `created_at`?
   - Index strategies

5. **🚀 Step-by-Step Implementation Guide**
   - Step 1: Create Migration
   - Step 2: Create TypeBox Schemas
   - Step 3: Create Repository
   - Step 4: Create Service
   - Step 5: Create Controller
   - Step 6: Create Routes
   - Step 7: Create Plugin
   - Step 8: Register Plugin
   - Step 9: Usage Examples

6. **📝 Best Practices**
   - Schema patterns (Type.String() vs Type.Literal())
   - Field mapping (snake_case ↔ camelCase)
   - Required columns
   - Indexes
   - Error handling
   - Fire-and-forget logging

7. **🔍 Testing**
   - Integration test examples
   - Test patterns

8. **🎯 Quick Checklist**
   - All steps required for new audit log

---

## 🚀 Quick Start

### Adding a New Audit Log in 9 Steps:

```bash
# 1. Create migration
pnpm knex migrate:make create_user_actions_table

# 2. Create module directory
mkdir -p apps/api/src/core/audit-system/user-actions

# 3. Create files
cd apps/api/src/core/audit-system/user-actions
touch user-actions.schemas.ts
touch user-actions.repository.ts
touch user-actions.service.ts
touch user-actions.controller.ts
touch user-actions.routes.ts
touch user-actions.plugin.ts
touch index.ts

# 4. Follow the guide in AUDIT_SYSTEM_GUIDE.md
```

---

## 📊 Current Audit Tables

| Table           | Purpose                        | Location                            |
| --------------- | ------------------------------ | ----------------------------------- |
| error_logs      | Client & server error tracking | `core/error-logs/`                  |
| login_attempts  | Authentication monitoring      | `core/audit-system/login-attempts/` |
| file_audit_logs | File operation tracking        | `core/audit-system/file-audit/`     |

---

## 🛠️ Common Patterns

### 1. Log User Action (Fire-and-Forget)

```typescript
// ✅ Don't block business logic
await userRepository.update(userId, data);

userActionsService
  .logAction({
    userId,
    action: 'update_profile',
    resourceType: 'user',
    resourceId: userId,
  })
  .catch((error) => {
    fastify.log.error('Failed to log action', error);
  });
```

### 2. Query with Pagination

```typescript
const result = await service.findAll({
  page: 1,
  limit: 25,
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-02T23:59:59Z',
  userId: 'some-user-id',
});
```

### 3. Get Statistics

```typescript
const stats = await service.getStats(7); // Last 7 days
// Returns: { total, recent24h, byAction, successRate }
```

### 4. Export to CSV

```typescript
const csv = await service.exportToCSV({
  startDate: '2025-11-01T00:00:00Z',
  endDate: '2025-11-02T23:59:59Z',
});
```

### 5. Cleanup Old Records

```typescript
const result = await service.cleanup({ olderThan: 30 }); // Delete older than 30 days
// Returns: { deletedCount, message }
```

---

## 🔑 Key Concepts

### Base Classes Inheritance

All audit modules extend base classes for consistency:

```
BaseAuditRepository → Your custom Repository
BaseAuditService → Your custom Service
```

### Required Database Columns

Every audit table MUST have:

```sql
id           UUID PRIMARY KEY
timestamp    TIMESTAMP NOT NULL  -- For filtering/queries
created_at   TIMESTAMP NOT NULL  -- Record creation time
```

### TypeBox Schema Pattern

```typescript
// ✅ CORRECT: Flexible string fields
failureReason: Type.Optional(Type.String({ maxLength: 100 }));

// ❌ WRONG: Type.Literal causes serialization issues
failureReason: Type.Optional(Type.Literal('invalid_credentials'));
```

---

## 📁 Module Structure

Every audit module follows this structure:

```
user-actions/
├── index.ts                    # Exports
├── user-actions.schemas.ts     # TypeBox schemas
├── user-actions.repository.ts  # Data access layer
├── user-actions.service.ts     # Business logic
├── user-actions.controller.ts  # Request handling
├── user-actions.routes.ts      # Route definitions
└── user-actions.plugin.ts      # Fastify plugin
```

---

## 🎯 When to Use Audit Logs

### ✅ Good Use Cases:

- **Security Events**: Login attempts, password changes, permission changes
- **Data Changes**: CRUD operations on important resources
- **File Operations**: Upload, download, delete, share
- **User Actions**: Profile updates, settings changes
- **API Usage**: Rate limiting, API key usage
- **Compliance**: GDPR access logs, audit trails

### ❌ Don't Use For:

- High-frequency events (use metrics/analytics instead)
- Debug logging (use application logs)
- Real-time monitoring (use monitoring tools)
- Temporary data (use cache)

---

## 🔍 Troubleshooting

### Common Issues:

1. **Missing `timestamp` column**
   - **Error**: `"timestamp" is required!`
   - **Fix**: Add `timestamp` column to migration

2. **Schema serialization error**
   - **Error**: `The value of [...] does not match schema definition`
   - **Fix**: Change `Type.Literal()` to `Type.String()`

3. **Field mapping issues**
   - **Error**: `undefined` fields in response
   - **Fix**: Check `getSelectFields()` mapping

4. **Port configuration**
   - **Error**: Wrong port (4250 vs 3384)
   - **Fix**: Check `.env.local`, use correct API port

---

## 📚 Additional Resources

- [TypeBox Schema Standard](../../05c-typebox-schema-standard.md)
- [API-First Workflow](../../development/api-first-workflow.md)
- [Testing Strategy](../../testing/testing-strategy.md)
- [BaseAuditRepository Source](../../../apps/api/src/core/audit-system/base/base.repository.ts)
- [BaseAuditService Source](../../../apps/api/src/core/audit-system/base/base.service.ts)

---

## 🤝 Contributing

When adding new audit logs:

1. Follow the [AUDIT_SYSTEM_GUIDE.md](./AUDIT_SYSTEM_GUIDE.md) step-by-step
2. Use the existing modules as reference (login-attempts, error-logs)
3. Test all endpoints before committing
4. Update this README if adding significant patterns

---

**Last Updated:** 2025-11-02 (Session 60)
