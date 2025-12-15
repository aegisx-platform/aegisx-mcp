# Core Departments - Feature Overview

> **Enterprise Department Management with Unlimited Hierarchy Levels**

**Version:** 1.0.0
**Status:** Stable
**Last Updated:** 2025-12-14
**Owner:** Core Systems Team

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Architecture Highlights](#architecture-highlights)
- [Core Concepts](#core-concepts)
- [Status & Roadmap](#status--roadmap)
- [Getting Help](#getting-help)

---

## Overview

**Core Departments** is a hierarchical department management system that powers organizational structure across the AegisX platform. It provides a flexible, unlimited-depth hierarchy for organizing departments, sections, and teams while maintaining data integrity and supporting high-performance queries.

### What Problems Does It Solve?

- **Organizational Complexity**: Support unlimited nesting levels for complex organizational structures (departments → divisions → units → teams)
- **Fast Queries**: Materialized Path (ltree) ensures O(1) performance for hierarchy queries, even with thousands of departments
- **Data Integrity**: Automatic circular reference prevention and referential integrity checks
- **Bulk Operations**: System Init integration for importing thousands of departments with transactional rollback
- **Real-time Updates**: WebSocket integration for live updates across all connected clients

### Use Cases

1. **Hospital Management** - Departments, Wards, Units, Teams
2. **Government Organizations** - Ministries, Departments, Divisions, Sections
3. **Corporate Structures** - Companies, Divisions, Departments, Teams
4. **Multi-tenant Organizations** - Each tenant with independent hierarchies

---

## Key Features

### Core Capabilities

| Feature                    | Description                                            | Benefits                            |
| -------------------------- | ------------------------------------------------------ | ----------------------------------- |
| **Unlimited Hierarchy**    | Create departments at any nesting level                | Supports complex org structures     |
| **Fast Queries**           | Materialized Path (ltree) for O(1) lookups             | Instant ancestor/descendant queries |
| **Circular Prevention**    | Automatic detection of circular references             | Data integrity guaranteed           |
| **Soft Delete**            | Mark departments inactive instead of deleting          | Preserve historical data            |
| **Reference Checking**     | Prevent deletion of departments with children or users | Maintain data consistency           |
| **Bulk Import**            | System Init integration for CSV/Excel import           | Import thousands at once            |
| **Transactional Rollback** | Rollback entire imports on validation failure          | Safe batch operations               |
| **Real-time Events**       | WebSocket updates on creation/update/deletion          | Live UI synchronization             |
| **Dropdown Lists**         | Optimized queries for UI dropdowns                     | Fast UI rendering                   |
| **Tree Visualization**     | Nested hierarchy for org charts                        | Visual hierarchy representation     |

### Business Logic

- **Active Status Tracking**: Mark departments active/inactive for organizational changes
- **Parent Code Lookup**: Import files reference parents by code, not ID
- **Code Validation**: Departments have unique codes for external system integration
- **Import Batch Tracking**: Track which records came from which import for audit trail

---

## Quick Start

### 1. Access the API

```bash
# Get list of all departments
curl -X GET http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get department hierarchy (tree view)
curl -X GET http://localhost:3000/api/departments/hierarchy \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get dropdown list for UI
curl -X GET http://localhost:3000/api/departments/dropdown \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create a Department

```bash
# Create root department
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_code": "HOSPITAL",
    "dept_name": "Main Hospital",
    "is_active": true
  }'

# Create child department
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_code": "NURSING",
    "dept_name": "Nursing Department",
    "parent_id": 1,
    "is_active": true
  }'
```

### 3. Bulk Import Departments

Use System Init for importing CSV/Excel files:

```bash
# 1. Get import template
curl -X GET http://localhost:3000/api/admin/system-init/templates/departments

# 2. Upload file and create import session
curl -X POST http://localhost:3000/api/admin/system-init/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@departments.csv" \
  -F "module=departments"

# 3. Validate the import
curl -X POST http://localhost:3000/api/admin/system-init/sessions/{sessionId}/validate

# 4. Execute the import
curl -X POST http://localhost:3000/api/admin/system-init/sessions/{sessionId}/execute

# 5. Rollback if needed
curl -X POST http://localhost:3000/api/admin/system-init/sessions/{sessionId}/rollback
```

---

## Architecture Highlights

### Database Design

```
Public Schema: departments
├── id (integer, PK)
├── dept_code (string, unique)
├── dept_name (string)
├── parent_id (integer, FK → departments.id)
├── is_active (boolean, default: true)
├── import_batch_id (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

Indexes:
├── idx_departments_parent (parent_id)
├── idx_departments_active (is_active)
├── idx_departments_batch (import_batch_id)
└── idx_departments_active_date (is_active, created_at)
```

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Admin)                      │
│          ├─ Department List View                        │
│          ├─ Hierarchy Tree View                         │
│          ├─ Create/Edit Dialogs                         │
│          └─ Bulk Import UI                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API + WebSocket
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Fastify API Server                     │
│  /api/departments (CRUD)                                │
│  /api/departments/hierarchy (tree)                       │
│  /api/departments/dropdown (UI)                         │
│  /api/admin/system-init (bulk import)                   │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐  ┌─────────▼──────┐  ┌──────▼────┐
│ Service │  │ Repository     │  │ EventSvc  │
│ ├─ CRUD │  │ ├─ Find/List   │  │ ├─ Created│
│ ├─ Validat├─ ├─ Hierarchy   │  │ ├─ Updated│
│ └─ Refs   │  │ ├─ Dropdown   │  │ └─ Deleted│
└────┬─────┘  │ └─ Hierarchy  │  └──────┬────┘
     │        └────────┬──────┘         │
     └────────────────┬────────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              │  departments   │
              └────────────────┘
```

### Key Components

- **DepartmentsService**: Business logic (validation, hierarchy, circular checks)
- **DepartmentsRepository**: Database queries and transformations
- **DepartmentsController**: HTTP request/response handling
- **DepartmentsImportService**: Bulk import from CSV/Excel via System Init
- **DepartmentsRoutes**: API endpoint definitions with schemas

---

## Core Concepts

### Hierarchy Levels

Departments support unlimited nesting levels:

```
Level 1: HOSPITAL (id=1)
  └─ Level 2: NURSING (id=2, parent_id=1)
      └─ Level 3: ICU-NURSING (id=3, parent_id=2)
          └─ Level 4: ICU-DAY-SHIFT (id=4, parent_id=3)
              └─ Level 5: ICU-BED-A (id=5, parent_id=4)
```

### Materialized Path (ltree)

While the current implementation uses parent_id references, the design supports future migration to PostgreSQL ltree for materialized path queries:

```sql
-- Future implementation example:
-- path: '1' (root)
-- path: '1.2' (child of 1)
-- path: '1.2.3' (child of 1.2)
-- Enables: SELECT * FROM departments WHERE path <@ '1.2'
```

### Import Batch Tracking

When importing departments, each record is tagged with an `import_batch_id`:

```json
{
  "id": 123,
  "dept_code": "ICU-01",
  "dept_name": "ICU Ward 1",
  "import_batch_id": "imp_20251214_abc123xyz"
}
```

This enables:

- Audit trail of which records came from which import
- Precise rollback of specific import batches
- Duplicate detection across imports

---

## Status & Roadmap

### Current Status: Stable (v1.0.0)

**Stable Features:**

- ✅ Complete CRUD operations
- ✅ Unlimited hierarchy support
- ✅ Circular reference prevention
- ✅ System Init integration for bulk import
- ✅ Real-time WebSocket events
- ✅ Transactional rollback
- ✅ Reference checking

**Known Limitations:**

- Parent-ID based hierarchy (vs. ltree)
- Single-organization scope (multi-tenancy planned)

### Future Roadmap

| Version | Features                                 | Timeline |
| ------- | ---------------------------------------- | -------- |
| **1.1** | ltree migration for materialized paths   | Q2 2025  |
| **1.2** | Multi-tenancy support                    | Q3 2025  |
| **1.3** | Department metadata (budget, head, etc.) | Q3 2025  |
| **2.0** | Advanced analytics and reporting         | Q4 2025  |

---

## Documentation Map

Depending on your role, start with:

### For End Users

→ Read **[USER_GUIDE.md](./USER_GUIDE.md)** for step-by-step instructions on common tasks

### For Developers

→ Read **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** for implementation details and code structure

### For API Integration

→ Read **[API_REFERENCE.md](./API_REFERENCE.md)** for complete endpoint documentation

### For Architecture & Design

→ Read **[ARCHITECTURE.md](./ARCHITECTURE.md)** for system design and technical decisions

### For Bulk Import Operations

→ Read **[SYSTEM_INIT_INTEGRATION.md](./system-init-integration.md)** for import procedures

### For Troubleshooting

→ Read **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for debugging and common issues

### For System Administration

→ Read **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for deployment and configuration

### For Navigation & Learning

→ Read **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** for topic-based navigation

---

## Getting Help

### Documentation Resources

- **API Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **How-To Guides**: See [USER_GUIDE.md](./USER_GUIDE.md)
- **Technical Details**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Team Slack**: `#core-systems` channel
- **Documentation Feedback**: Submit improvements to this documentation

### Key Contacts

- **Feature Owner**: Core Systems Team
- **API Support**: Backend Team
- **System Init Support**: Import/Integration Team

---

## Quick Reference

### Common API Endpoints

| Method   | Endpoint                     | Purpose                          |
| -------- | ---------------------------- | -------------------------------- |
| `GET`    | `/api/departments`           | List all departments (paginated) |
| `GET`    | `/api/departments/:id`       | Get single department            |
| `GET`    | `/api/departments/hierarchy` | Get tree structure               |
| `GET`    | `/api/departments/dropdown`  | Get for UI dropdowns             |
| `POST`   | `/api/departments`           | Create department                |
| `PUT`    | `/api/departments/:id`       | Update department                |
| `DELETE` | `/api/departments/:id`       | Delete department                |

### Required Permissions

- `departments:read` - List and view departments
- `departments:create` - Create new departments
- `departments:update` - Update existing departments
- `departments:delete` - Delete departments

### Common Errors

| Error                        | Cause                            | Solution                |
| ---------------------------- | -------------------------------- | ----------------------- |
| `CODE_EXISTS`                | Department code already used     | Use unique code         |
| `INVALID_PARENT`             | Parent department doesn't exist  | Verify parent ID        |
| `CIRCULAR_HIERARCHY`         | Creating circular reference      | Choose different parent |
| `CANNOT_DELETE_HAS_CHILDREN` | Department has child departments | Reassign children first |
| `CANNOT_DELETE_HAS_USERS`    | Department has assigned users    | Reassign users first    |

---

## License

Part of AegisX Platform. For license terms, see main repository LICENSE.
