# System Initialization Feature - Complete Documentation Index

> **Status**: Production Ready
> **Version**: 1.0.0
> **Last Updated**: 2025-12-14

## Quick Navigation

### For New Users / First-Time Setup

1. **Start Here**: [SYSTEM_INIT_COMPLETE_GUIDE.md](./SYSTEM_INIT_COMPLETE_GUIDE.md) - The comprehensive guide to everything
2. **Quick Setup**: [BATCH_TRACKING_QUICK_REFERENCE.md](./BATCH_TRACKING_QUICK_REFERENCE.md) - Fast reference

### For Frontend Developers

- [FRONTEND_SPECIFICATION.md](./FRONTEND_SPECIFICATION.md) - Complete Angular implementation spec
- [IMPORT_HISTORY_TIMELINE_COMPONENT.md](./IMPORT_HISTORY_TIMELINE_COMPONENT.md) - Timeline component details

### For Backend Developers

- [AUTO_DISCOVERY_IMPORT_SYSTEM.md](./AUTO_DISCOVERY_IMPORT_SYSTEM.md) - Architecture & design
- [IMPORT_DISCOVERY_SERVICE_IMPLEMENTATION.md](./IMPORT_DISCOVERY_SERVICE_IMPLEMENTATION.md) - Service implementation
- [BATCH_TRACKING_MIGRATION.md](./BATCH_TRACKING_MIGRATION.md) - Database schema

### For Adding New Modules

- See [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 4](./SYSTEM_INIT_COMPLETE_GUIDE.md#4-how-to-add-new-moduletable)
- Code template included in guide

### For User-Department Management

**Note**: User department management has been moved to a separate feature directory.

- See [User Departments Documentation](../user-departments/) for complete guides

### For Testing

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing strategy
- [TEST_COVERAGE_SUMMARY.md](./TEST_COVERAGE_SUMMARY.md) - Current test coverage

### For Understanding the Implementation

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was implemented
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Completion status
- [CRITICAL_FIXES_SUMMARY.md](./CRITICAL_FIXES_SUMMARY.md) - Critical fixes applied

### For Advanced Topics

- [DEPARTMENT_MANAGEMENT_DESIGN.md](./DEPARTMENT_MANAGEMENT_DESIGN.md) - Department management system
- [FIXES_SPECIFICATION.md](./FIXES_SPECIFICATION.md) - Additional fixes

---

## Feature Overview

The **System Initialization Feature** is a zero-configuration auto-discovery system for managing bulk data imports into AegisX. It automatically detects modules with import capability and displays them in a centralized dashboard.

### Key Features

- **Auto-Discovery**: Modules are automatically discovered via `@ImportService` decorators
- **Zero Configuration**: No manual registration required
- **Dependency Management**: Automatic import ordering based on dependencies
- **Validation**: Comprehensive field and business logic validation
- **Batch Processing**: Atomic transactions with configurable batch sizes
- **Rollback Support**: Safe rollback using `import_batch_id` column
- **Progress Tracking**: Real-time updates via WebSocket/polling
- **Audit Trail**: Complete import history with user tracking

### Architecture

```
User Interface (Angular Dashboard)
         ↓
    REST API Layer
         ↓
SystemInitService (Business Logic)
    ↙        ↘
ImportDiscovery   BaseImportService
Service          (Generic Base Class)
    ↓                    ↓
    └──→ Module-Specific Services ←──┘
         (30+ modules)
         ↓
      Database
```

---

## Documentation Structure

### Level 1: Getting Started

- **SYSTEM_INIT_COMPLETE_GUIDE.md** (2,500+ lines)
  - Everything you need to know
  - Includes code examples
  - Complete API reference
  - Best practices
  - Troubleshooting

### Level 2: Detailed Specifications

- **AUTO_DISCOVERY_IMPORT_SYSTEM.md** (1,200+ lines)
  - Architecture overview
  - Design patterns
  - Dependency management
  - Module coverage (30+ modules)

- **FRONTEND_SPECIFICATION.md** (1,400+ lines)
  - Angular implementation
  - Component structure
  - User interface design
  - Technical specifications

### Level 3: Implementation Details

- **IMPORT_DISCOVERY_SERVICE_IMPLEMENTATION.md**
  - Service implementation details
  - File scanning mechanism
  - Registry management

- **BATCH_TRACKING_MIGRATION.md**
  - Database schema
  - Migration guide
  - Column definitions

### Level 4: Quick References

- **BATCH_TRACKING_QUICK_REFERENCE.md**
  - Cheat sheet
  - Common tasks
  - Quick solutions

### Level 5: Specific Topics

- **USER_DEPARTMENTS_SERVICE.md**
- **IMPORT_HISTORY_TIMELINE_COMPONENT.md**
- **TESTING_GUIDE.md**
- **DEPARTMENT_MANAGEMENT_DESIGN.md**

---

## Key Files in Codebase

### Backend

```
apps/api/src/
├── core/import/
│   ├── decorator/import-service.decorator.ts
│   ├── discovery/import-discovery.service.ts
│   ├── plugin/import-discovery.plugin.ts
│   ├── registry/import-service-registry.ts
│   └── repositories/
│       ├── import-session.repository.ts
│       ├── import-history.repository.ts
│       └── import-batch.repository.ts
│
├── shared/services/
│   └── base-import.service.ts
│
└── modules/admin/system-init/
    ├── system-init.controller.ts
    ├── system-init.service.ts
    ├── system-init.routes.ts
    └── system-init.schemas.ts
```

### Frontend

```
apps/web/src/app/features/system-init/
├── pages/
│   └── system-init-dashboard/
│       ├── system-init-dashboard.page.ts
│       ├── system-init-dashboard.page.html
│       └── system-init-dashboard.page.scss
│
├── components/
│   ├── module-card/
│   ├── import-wizard/
│   ├── progress-tracker/
│   ├── import-history-timeline/
│   └── validation-results/
│
├── services/
│   ├── system-init.service.ts
│   ├── import-progress.service.ts
│   └── user-departments.service.ts
│
└── types/
    ├── system-init.types.ts
    ├── import-module.types.ts
    └── validation.types.ts
```

### Example Import Services

```
apps/api/src/modules/
├── inventory/master-data/departments/departments-import.service.ts
├── users/users-import.service.ts
└── testProducts/services/test-products-import.service.ts
```

---

## API Endpoints

Base URL: `/api/admin/system-init`

| Method | Endpoint                                         | Purpose                      |
| ------ | ------------------------------------------------ | ---------------------------- |
| GET    | `/available-modules`                             | List all discovered modules  |
| GET    | `/import-order`                                  | Get recommended import order |
| GET    | `/module/:moduleName/template?format=csv\|excel` | Download template            |
| POST   | `/module/:moduleName/validate`                   | Validate uploaded file       |
| POST   | `/module/:moduleName/import`                     | Execute import               |
| GET    | `/module/:moduleName/status/:jobId`              | Check progress               |
| DELETE | `/module/:moduleName/rollback/:jobId`            | Rollback import              |
| GET    | `/dashboard`                                     | Dashboard data               |
| GET    | `/health-status`                                 | Health check                 |

See [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 6](./SYSTEM_INIT_COMPLETE_GUIDE.md#6-api-endpoints) for complete details.

---

## Common Tasks

### Adding a New Import Module

1. Create `[table]-import.service.ts` file
2. Extend `BaseImportService<T>`
3. Add `@ImportService` decorator
4. Implement `getTemplateColumns()`
5. Implement `validateRow()`
6. Implement `insertBatch()`
7. Implement `performRollback()` (optional)
8. Add `import_batch_id` column to table

See [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 4](./SYSTEM_INIT_COMPLETE_GUIDE.md#4-how-to-add-new-moduletable) for step-by-step guide with code template.

### Importing Data

1. User visits `/admin/system-init`
2. Clicks "Import" on module
3. Downloads template (CSV or Excel)
4. Fills template with data
5. Uploads file
6. Reviews validation results
7. Confirms import
8. Monitors progress
9. (Optional) Rolls back if needed

### Testing an Import Service

```bash
# Run tests for a specific service
pnpm test -- departments-import.service

# Test with file validation
pnpm test -- import validation

# Run all import tests
pnpm test -- import
```

---

## Database Schema

Three required tables:

1. **import_service_registry** - Module metadata and status
2. **import_sessions** - Validation session data
3. **import_history** - Import job history

Plus add `import_batch_id UUID` column to all tables supporting imports.

See [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 8](./SYSTEM_INIT_COMPLETE_GUIDE.md#8-database-schema) for complete schema.

---

## Configuration

### @ImportService Decorator Options

```typescript
@ImportService({
  module: 'departments',           // Unique ID
  domain: 'inventory',             // Domain
  subdomain: 'master-data',        // Subdomain
  displayName: 'Departments (แผนก)', // Display name
  description: '...',              // Description
  dependencies: [],                // Required modules
  priority: 1,                      // Import order (1 = first)
  tags: ['master-data'],           // Tags for filtering
  supportsRollback: true,          // Enable rollback
  version: '1.0.0',               // Version
})
```

### Template Column Options

```typescript
{
  name: 'code',                    // Field name
  displayName: 'Code',             // Header
  required: true,                  // Required?
  type: 'string',                  // Type
  maxLength: 50,                   // Max length
  pattern: '^[A-Z0-9_-]+$',        // Regex
  enumValues: ['A', 'B'],          // Allowed values
  description: '...',              // Description
  example: 'ABC-01',               // Example
}
```

---

## Performance Targets

- **Module Discovery**: <100ms for 30+ modules
- **Template Generation**: <1s
- **File Validation**: <10 seconds for 1,000 rows
- **Batch Import**: 5-10 records/second
- **Progress Updates**: Every 2 seconds
- **API Response**: <500ms (p95)

---

## Support & Troubleshooting

### Common Issues

1. **Module not appearing**
   - Check file name ends with `-import.service.ts`
   - Verify `@ImportService` decorator present
   - Check class extends `BaseImportService<T>`
   - Restart API server

2. **Validation errors not showing**
   - Check `validateRow()` implemented
   - Verify error codes are correct
   - Check database queries

3. **Import fails silently**
   - Check `import_batch_id` column exists
   - Review transaction error handling
   - Check table schema

4. **Rollback not working**
   - Verify `import_batch_id` column exists
   - Check rollback index created
   - Verify `performRollback()` implementation

See [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 11](./SYSTEM_INIT_COMPLETE_GUIDE.md#11-troubleshooting) for detailed troubleshooting.

---

## Development Workflow

### 1. Create Module

Follow [SYSTEM_INIT_COMPLETE_GUIDE.md - Section 4](./SYSTEM_INIT_COMPLETE_GUIDE.md#4-how-to-add-new-moduletable)

### 2. Add Database Column

```sql
ALTER TABLE [table] ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_[table]_import_batch ON [table](import_batch_id);
```

### 3. Test Locally

```bash
pnpm run dev:api
# Visit http://localhost:4249/admin/system-init
```

### 4. Run Tests

```bash
pnpm test -- import
```

### 5. Build & Deploy

```bash
pnpm run build
git commit -m "feat(system-init): add [module] import"
```

---

## Version History

| Version | Date       | Status     | Notes                                    |
| ------- | ---------- | ---------- | ---------------------------------------- |
| 1.0.0   | 2025-12-14 | Production | Complete implementation with 30+ modules |
| 0.9.0   | 2025-12-13 | Beta       | Frontend implementation complete         |
| 0.8.0   | 2025-12-12 | Beta       | Backend core complete                    |

---

## Related Features

- **User Departments Management** - [USER_DEPARTMENTS_SERVICE.md](./USER_DEPARTMENTS_SERVICE.md)
- **Import History Tracking** - [IMPORT_HISTORY_TIMELINE_COMPONENT.md](./IMPORT_HISTORY_TIMELINE_COMPONENT.md)
- **Department Management** - [DEPARTMENT_MANAGEMENT_DESIGN.md](./DEPARTMENT_MANAGEMENT_DESIGN.md)

---

## Contacts & Support

For questions or issues:

1. Check [SYSTEM_INIT_COMPLETE_GUIDE.md - Troubleshooting](./SYSTEM_INIT_COMPLETE_GUIDE.md#11-troubleshooting)
2. Review specific documentation file
3. Check implementation logs
4. Contact development team

---

## Links to Main Documentation

- [AegisX Platform README](../../../README.md)
- [Development Guidelines](../../development/)
- [Architecture Documentation](../../architecture/)
- [Infrastructure Setup](../../infrastructure/)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-14
**Status**: Production Ready ✅
**Lines of Code**: 2,500+ lines in complete guide
**API Endpoints**: 9 documented
**Example Modules**: 3 (departments, users, test products)
**Database Tables**: 3 required + column in target tables
