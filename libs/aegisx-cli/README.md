# @aegisx/cli

> Professional CRUD Generator for Angular + Fastify

Generate full-stack modules with a single command. No more boilerplate, just business logic.

[![npm version](https://img.shields.io/npm/v/@aegisx/cli.svg)](https://www.npmjs.com/package/@aegisx/cli)
[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](./LICENSE.md)

---

## Why AegisX CLI?

- **One Command, Full Stack** - Generate backend + frontend in seconds
- **60+ Templates** - Professional TypeScript code, not scaffolds
- **Type-Safe** - TypeBox schemas with full TypeScript integration
- **Enterprise Ready** - Import/Export, WebSocket events, audit trails
- **Works Offline** - No internet required after installation

---

## Installation

```bash
npm install -g @aegisx/cli
```

---

## Quick Start

```bash
# 1. Start a free 14-day trial
aegisx trial

# 2. List available tables
aegisx list

# 3. Generate your first module
aegisx generate products --force

# 4. Generate frontend
aegisx generate products --target frontend --force
```

---

## What You Get

From a single `aegisx generate products` command:

### Backend (Fastify + TypeBox)

```
modules/products/
├── products.routes.ts      # REST API endpoints
├── products.controller.ts  # Business logic
├── products.service.ts     # Database operations
├── products.repository.ts  # Query builder
├── products.schemas.ts     # TypeBox validation
├── products.types.ts       # TypeScript types
└── index.ts               # Module exports
```

### Frontend (Angular 17+ Standalone)

```
products/
├── products.component.ts      # Smart component
├── products.component.html    # Material Design template
├── products.component.scss    # Tailwind CSS styles
├── products.service.ts        # API service
├── products-dialog.component.ts  # Create/Edit dialog
├── products.routes.ts         # Lazy-loaded routes
└── index.ts                   # Public API
```

---

## Features

### Core Features (All Tiers)

- ✅ CRUD API generation (Create, Read, Update, Delete)
- ✅ TypeBox schemas with validation
- ✅ Pagination, filtering, sorting
- ✅ Soft delete support
- ✅ Search functionality
- ✅ Angular Material components
- ✅ Responsive design with Tailwind

### Enterprise Features

- 📊 **Bulk Import** - Excel/CSV file import with validation
- 🔔 **WebSocket Events** - Real-time updates with event emission
- 📝 **Audit Fields** - Automatic created_at, updated_at tracking
- 🎯 **Custom Templates** - Team/Enterprise only

---

## Commands

### Generate Module

```bash
# Backend (default)
aegisx generate <table_name> [options]

# Frontend
aegisx generate <table_name> --target frontend

# Options
-t, --target <target>    backend (default) or frontend
-f, --force              Overwrite existing files
-d, --dry-run            Preview without creating
-e, --with-events        Include WebSocket events
--with-import            Include bulk import
-a, --app <app>          Target app: api, web, admin
```

### Database Commands

```bash
# List tables
aegisx list

# Interactive shell
aegisx shell
```

### License Commands

```bash
# Start free trial
aegisx trial

# Activate license
aegisx activate <key>

# Check status
aegisx license

# Remove license
aegisx deactivate
```

---

## License Tiers

| Tier         | Price        | Developers | What's Included              |
| ------------ | ------------ | ---------- | ---------------------------- |
| Professional | $49 one-time | 1          | All features, 1 year updates |
| Team         | $199/year    | Up to 10   | Priority support, templates  |
| Enterprise   | Contact us   | Unlimited  | On-premise, SLA, dedicated   |

**Start Free:** `aegisx trial` (14 days)

**Purchase:** https://aegisx.dev

---

## Requirements

- Node.js 18+
- PostgreSQL database
- Angular 17+ (for frontend generation)
- Fastify 4+ (for backend generation)

---

## HIS Mode (Hospital Information System)

**v2.1.0+** includes HIS Mode for critical enterprise systems:

- ⚕️ **Data Accuracy First**: UI always shows actual database state
- 📊 **Backend Always Emits Events**: Audit trail and event-driven ready
- 🔧 **Optional Real-Time Mode**: Easy to enable when needed
- 🛡️ **No User Confusion**: Never show outdated data

---

## Documentation

- **[Installation Guide](./docs/INSTALLATION.md)** - License activation & setup
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - CLI commands
- **[Events Guide](./docs/EVENTS_GUIDE.md)** - WebSocket events
- **[Import Guide](./docs/IMPORT_GUIDE.md)** - Bulk Excel/CSV import

---

## Support

- **Community:** [GitHub Issues](https://github.com/aegisx-platform/cli/issues)
- **Email:** support@aegisx.dev (Team/Enterprise)
- **Discord:** Private channel (Team/Enterprise)

---

## Links

- **Website:** https://aegisx.dev
- **Documentation:** https://docs.aegisx.dev
- **Purchase:** https://aegisx.gumroad.com

---

## License

Commercial license. See [LICENSE.md](./LICENSE.md) for details.

**Generated code is 100% yours** - use it anywhere, including open source projects.

---

**Version:** 3.0.0
**Last Updated:** 2025-12-03

**Made with ❤️ by the AegisX Team**
