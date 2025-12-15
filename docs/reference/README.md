---
title: Reference
description: Technical reference documentation for APIs, UI components, CLI tools, and libraries
category: reference
tags: [reference, api, documentation]
order: 3
---

# Reference

Information-oriented technical reference for looking up specifications, APIs, and component details.

## 📚 Reference Categories

### 🔌 [API Reference](./api/README.md)

REST API standards, response formats, and endpoint specifications.

- **[API Response Standard](./api/api-response-standard.md)** - Standard response format for all endpoints
- **[TypeBox Schema Standard](./api/typebox-schema-standard.md)** - Type-safe schema definitions
- **[Bulk Operations API Design](./api/bulk-operations-api-design.md)** - Bulk operation patterns
- **[File Upload Guide](./api/file-upload-guide.md)** - File upload API reference

### 🎨 [UI Reference](./ui/README.md)

Component library, theme system, and UI standards.

- **[AegisX UI Standards](./ui/aegisx-ui-standards.md)** - UI component standards
- **[Theme System Standard](./ui/theme-system-standard.md)** - Theming and styling
- **[Components](./ui/components/)** - Individual component reference

### 🛠️ [CLI Reference](./cli/README.md)

Command-line tools and generators.

- **[AegisX CLI](./cli/aegisx-cli/README.md)** - CRUD generator and CLI tools
- **[Quick Reference](./cli/aegisx-cli/quick-reference.md)** - Common commands
- **[Commands](./cli/commands/)** - Command documentation

### 📦 [Libraries](./libraries/README.md)

Shared library standards and patterns.

- **[Library Standards](./libraries/library-standards.md)** - Shared library conventions
- **[Fastify Plugin Standards](./libraries/fastify-plugin-standards.md)** - Plugin architecture

## 🔍 Quick Lookup

### API Endpoints

- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Files: `/api/files/*`

### UI Components

- Badge, Breadcrumb, Button
- Dialog, Drawer, Form Fields
- Table, Card, Tabs

### CLI Commands

```bash
pnpm run crud -- TABLE_NAME --force
pnpm run domain:init -- DOMAIN_NAME
pnpm run db:migrate
```

## 📖 Using This Reference

Reference documentation is designed for **quick lookups** when you know what you're looking for:

- **APIs**: Find endpoint paths, request/response formats, status codes
- **Components**: Look up props, events, methods, styling options
- **CLI**: Check command syntax, flags, and options
- **Libraries**: Understand interfaces, exports, and usage patterns

## 🔗 Related Documentation

- **[Guides](../guides/README.md)** - Task-oriented how-to guides
- **[Architecture](../architecture/README.md)** - Understand design decisions
- **[Features](../features/README.md)** - Feature-specific documentation

---

Browse categories above or use search to find what you need.
