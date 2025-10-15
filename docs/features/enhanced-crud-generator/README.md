# Enhanced CRUD Generator

> **🚀 Enterprise-grade CRUD module generator with 3-tier package system for AegisX platform**

## Overview

The Enhanced CRUD Generator is a powerful command-line tool that generates complete, production-ready CRUD modules for the AegisX platform. It follows a 3-tier package system (Standard, Enterprise, Full) to provide scalable solutions from basic operations to enterprise-level features.

## 🎯 Key Features

### **Standard Package** (5 routes)

- Basic CRUD operations (Create, Read, Update, Delete, List)
- TypeBox schema validation
- OpenAPI/Swagger documentation
- Role-based authorization (RBAC)

### **Enterprise Package** (+8 routes)

- **All Standard features plus:**
- Bulk operations (create/update/delete multiple items)
- Dropdown/Options APIs for UI components
- Status management (activate/deactivate/toggle)
- Statistics and analytics endpoints

### **Full Package** (+2 routes)

- **All Enterprise features plus:**
- Data validation before save
- Field uniqueness checking

## 🚀 Quick Start

### Generate a Basic Module

```bash
# Standard package (basic CRUD)
node tools/crud-generator/index.js generate users --package=standard

# Enterprise package (with bulk operations)
node tools/crud-generator/index.js generate products --package=enterprise

# Full package (with validation features)
node tools/crud-generator/index.js generate themes --package=full
```

### Override Existing Module

```bash
# Force overwrite existing files
node tools/crud-generator/index.js generate themes --package=full --force
```

## 📋 Generated Files Structure

```
apps/api/src/modules/[table-name]/
├── index.ts                    # Module plugin registration
├── controllers/                # Request handling & validation
│   └── [table].controller.ts
├── services/                   # Business logic
│   └── [table].service.ts
├── repositories/               # Data access layer
│   └── [table].repository.ts
├── routes/                     # API endpoint definitions
│   └── index.ts
├── schemas/                    # TypeBox schemas & types
│   └── [table].schemas.ts
├── types/                      # TypeScript type definitions
│   └── [table].types.ts
└── __tests__/                  # Unit tests
    └── [table].test.ts
```

## 🔑 Migration Files

Each generation also creates role & permission migration files:

```
apps/api/src/database/migrations/
└── [timestamp]_add_[table]_permissions.ts
```

## 📊 Route Overview

| Package        | Routes | Features                            |
| -------------- | ------ | ----------------------------------- |
| **Standard**   | 5      | Basic CRUD, Auth, Validation        |
| **Enterprise** | 13     | + Bulk ops, Dropdown, Status, Stats |
| **Full**       | 15     | + Validation, Uniqueness checking   |

## 🛠️ Requirements

- Existing database table
- TypeBox schemas in `base.schemas.ts`
- Fastify application setup
- PostgreSQL database

## 📚 Documentation

- **[User Guide](./USER_GUIDE.md)** - Step-by-step usage instructions
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Technical implementation details
- **[API Reference](./API_REFERENCE.md)** - Complete endpoint documentation
- **[Architecture](./ARCHITECTURE.md)** - System design and patterns
- **[Deployment](./DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🔗 Quick Links

- [Feature Status Dashboard](../README.md)
- [Universal Full-Stack Standard](../../development/universal-fullstack-standard.md)
- [TypeBox Schema Standard](../../development/typebox-schema-standard.md)
- [API-First Workflow](../../development/api-first-workflow.md)

---

_Part of the AegisX Enterprise Platform - Built for scalability, maintainability, and enterprise-grade requirements._
