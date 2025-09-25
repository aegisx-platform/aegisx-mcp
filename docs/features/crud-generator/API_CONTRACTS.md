# CRUD Generator - CLI & API Contracts

## 📋 CLI & API Overview

**Primary Interface**: CLI Commands  
**Optional API**: `/api/generator`  
**Authentication**: CLI (Local), API (JWT Bearer Token)  
**Content Type**: `application/json`

## 🛠️ CLI Commands

### 1. Generate CRUD Module

```bash
npm run generate:crud <table-name> [options]
```

#### Required Parameters

- `table-name` (string): Database table name to generate CRUD for

#### Optional Parameters

- `--path` (string): Target directory (default: apps/api/src/modules)
- `--dry-run` (boolean): Preview without creating files
- `--skip-tests` (boolean): Skip test file generation
- `--naming` (string): Naming convention ('camel', 'pascal', 'kebab')
- `--template` (string): Custom template directory
- `--force` (boolean): Overwrite existing files

#### CLI Usage Examples

```bash
# Basic CRUD generation
npm run generate:crud products

# With custom path
npm run generate:crud users --path=apps/api/src/custom-modules

# Dry run to preview
npm run generate:crud orders --dry-run

# Skip tests and use custom naming
npm run generate:crud categories --skip-tests --naming=pascal

# Force overwrite existing files
npm run generate:crud inventory --force
```

#### CLI Output Example

```bash
$ npm run generate:crud products

🚀 CRUD Generator - Starting generation for 'products'
📊 Analyzing database table: products
  ✅ Found table with 8 columns
  ✅ Primary key: id (uuid)
  ✅ Foreign keys: category_id → categories(id)
  ✅ Indexes: name, category_id, created_at

📁 Generating files in: apps/api/src/modules/products/
  ✅ products.controller.ts
  ✅ products.service.ts
  ✅ products.repository.ts
  ✅ products.routes.ts
  ✅ products.schemas.ts
  ✅ products.types.ts
  ✅ products.plugin.ts
  ✅ products.spec.ts
  ✅ index.ts

🔧 Auto-registering plugin in main application...
  ✅ Updated apps/api/src/main.ts

✅ CRUD module for 'products' generated successfully!

📋 Next steps:
1. Review generated files in apps/api/src/modules/products/
2. Customize business logic in products.service.ts
3. Add additional validation in products.schemas.ts
4. Test endpoints: GET/POST/PUT/DELETE /api/products
```

### 2. List Available Tables

```bash
npm run generate:crud --list-tables
```

#### Output Example

```bash
$ npm run generate:crud --list-tables

📊 Available database tables:
  ✅ users (11 columns) - Has CRUD module
  ✅ roles (4 columns) - Has CRUD module
  🆕 products (8 columns) - Ready for generation
  🆕 categories (5 columns) - Ready for generation
  🆕 orders (12 columns) - Ready for generation
  ⚠️  audit_logs (15 columns) - Large table, consider custom implementation
```

### 3. Template Management

```bash
npm run generate:crud --list-templates
npm run generate:crud --create-template <name>
```

#### Template Commands

```bash
# List available templates
npm run generate:crud --list-templates

# Create custom template
npm run generate:crud --create-template my-custom-template

# Use custom template
npm run generate:crud products --template=my-custom-template
```

## 🔧 CLI Configuration

### Configuration File

The generator can be configured via `.crud-generator.json`:

```json
{
  "defaultPath": "apps/api/src/modules",
  "naming": "camel",
  "database": {
    "type": "postgresql",
    "connection": "DATABASE_URL"
  },
  "templates": {
    "default": "templates/default",
    "custom": "templates/custom"
  },
  "generation": {
    "skipTests": false,
    "includeSwagger": true,
    "autoRegister": true
  },
  "excludeTables": ["migrations", "seeds", "knex_migrations", "knex_migrations_lock"]
}
```

### Environment Variables

```bash
# Database connection (required)
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Generator configuration
CRUD_GENERATOR_PATH=apps/api/src/modules
CRUD_GENERATOR_TEMPLATES=./templates
CRUD_GENERATOR_AUTO_REGISTER=true
```

## 📊 CLI Data Models

### CLI Input Schema

```typescript
interface GenerateCommand {
  tableName: string;
  options: {
    path?: string;
    dryRun?: boolean;
    skipTests?: boolean;
    naming?: 'camel' | 'pascal' | 'kebab';
    template?: string;
    force?: boolean;
  };
}
```

### Database Schema Analysis

```typescript
interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  primaryKey: string[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}
```

### Generated File Structure

```typescript
interface GeneratedModule {
  files: GeneratedFile[];
  registrationCode: string;
  dependencies: string[];
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'controller' | 'service' | 'repository' | 'routes' | 'schemas' | 'types' | 'plugin' | 'test' | 'index';
}
```

## 🌐 Optional API Endpoints (Future)

### 1. Generate via API

```http
POST /api/generator/generate
```

#### Request Schema

```typescript
{
  tableName: string;
  options: {
    path?: string;
    skipTests?: boolean;
    naming?: string;
    template?: string;
  };
}
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    generatedFiles: string[];
    registeredPlugin: boolean;
    warnings: string[];
  };
  meta: {
    tableName: string;
    generationTime: number;
    filesCreated: number;
  };
}
```

### 2. Preview Generation

```http
POST /api/generator/preview
```

#### Request Schema

```typescript
{
  tableName: string;
  options: GenerateOptions;
}
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    previewFiles: {
      path: string;
      content: string;
      type: string;
    }
    [];
    analysis: TableSchema;
  }
}
```

### 3. List Tables

```http
GET /api/generator/tables
```

#### Response Schema

```typescript
{
  success: boolean;
  data: {
    tables: {
      name: string;
      columns: number;
      hasModule: boolean;
      recommended: boolean;
    }
    [];
  }
}
```

## ❌ CLI Error Handling

### Error Types

1. **Database Connection Error**

```bash
❌ Error: Cannot connect to database
💡 Check DATABASE_URL environment variable
💡 Ensure PostgreSQL is running
```

2. **Table Not Found**

```bash
❌ Error: Table 'products' not found in database
💡 Available tables: users, roles, categories
💡 Use --list-tables to see all tables
```

3. **File Already Exists**

```bash
⚠️  Warning: Module 'products' already exists
💡 Use --force to overwrite existing files
💡 Use --dry-run to preview changes
```

4. **Invalid Template**

```bash
❌ Error: Template 'custom-template' not found
💡 Available templates: default, minimal
💡 Use --list-templates to see all templates
```

5. **Permission Error**

```bash
❌ Error: Permission denied writing to apps/api/src/modules/
💡 Check file permissions
💡 Run with appropriate user privileges
```

### CLI Exit Codes

- `0` - Success
- `1` - General error
- `2` - Database connection error
- `3` - Table not found
- `4` - File permission error
- `5` - Template error
- `6` - Configuration error

## 🧪 CLI Testing

### Test Commands

```bash
# Run generator tests
npm run test:generator

# Test with real database
npm run test:generator:integration

# Test template rendering
npm run test:templates

# Test CLI interface
npm run test:cli
```

### Test Scenarios

1. **Basic Generation Test**
   - Generate CRUD for test table
   - Verify all files created
   - Compile generated TypeScript
   - Run generated tests

2. **Database Schema Test**
   - Test with various column types
   - Test with foreign keys
   - Test with composite primary keys
   - Test with indexes and constraints

3. **Template System Test**
   - Test default templates
   - Test custom templates
   - Test template inheritance
   - Test template error handling

4. **CLI Interface Test**
   - Test all command options
   - Test error scenarios
   - Test help documentation
   - Test configuration loading

## 📋 Implementation Checklist

### CLI Implementation

- [ ] Command-line argument parsing (Commander.js)
- [ ] Database connection and schema reading
- [ ] Template engine integration (Handlebars)
- [ ] File generation system
- [ ] Progress indicators and logging
- [ ] Error handling and validation
- [ ] Configuration file support
- [ ] Help documentation

### Template System

- [ ] Default templates for all file types
- [ ] Template inheritance and partials
- [ ] Custom template support
- [ ] Template validation
- [ ] Variable injection system
- [ ] Conditional rendering
- [ ] Loop support for arrays

### Integration

- [ ] Auto-registration in main application
- [ ] NPM script integration
- [ ] Environment variable support
- [ ] Configuration file loading
- [ ] Plugin dependency management
- [ ] Generated code validation

### Testing

- [ ] Unit tests for CLI components
- [ ] Integration tests with real database
- [ ] Template rendering tests
- [ ] Generated code compilation tests
- [ ] End-to-end CLI workflow tests

This CLI-first approach ensures developers can quickly generate consistent, high-quality CRUD modules while maintaining the flexibility to customize as needed.
