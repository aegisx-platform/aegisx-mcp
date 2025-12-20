---
name: aegisx-cli-library
description: Complete guide for the @aegisx/crud-generator NPM package. Use when working with the published CLI library, understanding its architecture, or integrating it into other projects.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# AegisX CLI Library (@aegisx/crud-generator)

Enterprise-grade CRUD generator for Angular + Fastify + PostgreSQL applications.

## When Claude Should Use This Skill

- User asks about "@aegisx/crud-generator" NPM package
- User wants to install the CLI in another project
- User needs to understand the library's architecture
- User asks about programmatic API usage
- User mentions "published CRUD generator package"
- User wants to extend or customize the generator
- User needs documentation for the standalone library

## Package Information

### NPM Package

```bash
# Package name
@aegisx/crud-generator

# Installation
npm install -g @aegisx/crud-generator
# or
pnpm add -D @aegisx/crud-generator

# Usage
npx aegisx-crud-generator [command] [options]
# or
aegisx-cli [command] [options]
```

### Repository

- **Monorepo**: `libs/aegisx-cli/` in aegisx-starter-1
- **Standalone**: https://github.com/aegisx-platform/crud-generator
- **NPM**: https://www.npmjs.com/package/@aegisx/crud-generator

## Library Architecture

### Core Components

1. **Command System** (`bin/` directory)
   - `crud.js` - Main CRUD generation command
   - `domain.js` - Domain initialization
   - `list.js` - Table listing utility

2. **Generator Engine** (`src/generators/`)
   - `backend-generator.ts` - Fastify backend code generation
   - `frontend-generator.ts` - Angular frontend generation
   - `schema-generator.ts` - TypeBox schema generation
   - `template-engine.ts` - EJS template rendering

3. **Templates** (`templates/` directory)
   - `backend/` - Fastify routes, services, controllers
   - `frontend/` - Angular components, services, forms
   - `shared/` - TypeBox schemas, types

4. **Utilities** (`src/utils/`)
   - `database.ts` - PostgreSQL introspection
   - `layer-classifier.ts` - Domain layer classification
   - `naming-conventions.ts` - Name transformations

## Features

### Package Tiers

| Feature             | Standard | Enterprise | Full |
| ------------------- | -------- | ---------- | ---- |
| Basic CRUD          | ✅       | ✅         | ✅   |
| Bulk Operations     | ❌       | ✅         | ✅   |
| Excel/CSV Import    | ❌       | ✅         | ✅   |
| WebSocket Events    | Optional | Optional   | ✅   |
| Advanced Validation | ❌       | ❌         | ✅   |
| Search & Filter     | ❌       | ✅         | ✅   |

### Commands

```bash
# Generate CRUD (standard package)
aegisx-cli crud TABLE_NAME --force

# Generate with import (enterprise package)
aegisx-cli crud TABLE_NAME --with-import --force

# Generate with events
aegisx-cli crud TABLE_NAME --with-events --force

# Generate full feature (full package)
aegisx-cli crud TABLE_NAME --package=full --force

# Initialize domain
aegisx-cli domain init DOMAIN_NAME

# List available tables
aegisx-cli list
```

## Integration Guide

### Standalone Project Integration

```bash
# 1. Install package
npm install -D @aegisx/crud-generator

# 2. Configure package.json scripts
{
  "scripts": {
    "crud": "aegisx-cli crud",
    "crud:import": "aegisx-cli crud --with-import",
    "crud:events": "aegisx-cli crud --with-events",
    "crud:full": "aegisx-cli crud --package=full"
  }
}

# 3. Create configuration file
# .aegisxrc.json or aegisx.config.js

# 4. Run generator
npm run crud users --force
```

### Configuration

```javascript
// aegisx.config.js
module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  paths: {
    backend: 'apps/api/src',
    frontend: 'apps/web/src',
    shared: 'libs/shared/src',
  },
  templates: {
    backend: 'custom-templates/backend',
    frontend: 'custom-templates/frontend',
  },
};
```

## Programmatic API

### Basic Usage

```typescript
import { CrudGenerator } from '@aegisx/crud-generator';

const generator = new CrudGenerator({
  tableName: 'users',
  package: 'enterprise',
  options: {
    withImport: true,
    withEvents: false,
    force: true,
  },
});

await generator.generate();
```

### Advanced Usage

```typescript
import { BackendGenerator, FrontendGenerator, SchemaGenerator } from '@aegisx/crud-generator';

// Generate backend only
const backend = new BackendGenerator('users', {
  domain: 'master-data',
  layer: 'infrastructure',
});
await backend.generate();

// Generate frontend only
const frontend = new FrontendGenerator('users', {
  section: 'admin',
});
await frontend.generate();

// Generate schemas only
const schema = new SchemaGenerator('users');
await schema.generate();
```

## Customization

### Custom Templates

```bash
# 1. Create custom template directory
mkdir -p custom-templates/backend
mkdir -p custom-templates/frontend

# 2. Copy default templates
cp -r node_modules/@aegisx/crud-generator/templates/* custom-templates/

# 3. Modify templates
# Edit .ejs files in custom-templates/

# 4. Configure to use custom templates
# In aegisx.config.js
module.exports = {
  templates: {
    backend: 'custom-templates/backend',
    frontend: 'custom-templates/frontend',
  },
};
```

### Template Variables

Available variables in EJS templates:

```typescript
{
  tableName: string;           // Original table name (snake_case)
  entityName: string;          // Pascal case (User)
  fileName: string;            // Kebab case (user-profile)
  variableName: string;        // Camel case (userProfile)
  pluralName: string;          // Plural form (users)
  columns: Column[];           // Table columns
  primaryKey: Column;          // Primary key column
  foreignKeys: ForeignKey[];   // Foreign key relationships
  domain: string;              // Domain name (inventory, budget)
  layer: string;               // Layer (master-data, operations)
  package: 'standard' | 'enterprise' | 'full';
  options: {
    withImport: boolean;
    withEvents: boolean;
    withValidation: boolean;
  };
}
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/aegisx-platform/crud-generator.git
cd crud-generator

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
aegisx-cli crud test_table --force

# Unlink
npm unlink -g @aegisx/crud-generator
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **"Table not found"**

   ```bash
   # Ensure database connection is correct
   psql -h localhost -U postgres -d mydb -c "\dt"

   # Check .env configuration
   cat .env | grep DB_
   ```

2. **"Permission denied"**

   ```bash
   # Make CLI executable
   chmod +x node_modules/.bin/aegisx-cli

   # Or install globally
   npm install -g @aegisx/crud-generator
   ```

3. **"Template not found"**
   ```bash
   # Reinstall package
   npm uninstall @aegisx/crud-generator
   npm install @aegisx/crud-generator
   ```

## Best Practices

### DO:

- ✅ Use domain classifier before generation
- ✅ Review generated code before committing
- ✅ Customize templates for project-specific patterns
- ✅ Use `--force` flag cautiously (overwrites existing files)
- ✅ Test generated endpoints before deploying

### DON'T:

- ❌ Generate directly to production
- ❌ Skip database migration review
- ❌ Ignore TypeScript errors after generation
- ❌ Modify generated files without understanding templates

## Version Management

### Semantic Versioning

- **Major** (x.0.0): Breaking changes to API or templates
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes

### Upgrading

```bash
# Check current version
aegisx-cli --version

# Update to latest
npm update @aegisx/crud-generator

# Update to specific version
npm install @aegisx/crud-generator@1.2.3
```

## Resources

- **Documentation**: [README.md](https://github.com/aegisx-platform/crud-generator#readme)
- **Examples**: `/examples` directory in repository
- **Issues**: https://github.com/aegisx-platform/crud-generator/issues
- **Changelog**: [CHANGELOG.md](https://github.com/aegisx-platform/crud-generator/blob/main/CHANGELOG.md)

## Related Skills

- `crud-generator-guide` - Usage guide for CRUD generation
- `domain-checker` - Domain classification tool
- `backend-customization-guide` - Customizing generated backend code
- `frontend-integration-guide` - Integrating generated frontend components
