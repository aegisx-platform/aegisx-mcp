# Enhanced CRUD Generator - Developer Guide

> **🔧 Technical implementation guide for developers working with the Enhanced CRUD Generator**

## 🏗️ Architecture Overview

### Core Components

```
tools/crud-generator/
├── index.js                 # CLI entry point
├── src/
│   ├── generator.js         # Main generation logic
│   ├── database.js          # Database introspection
│   ├── role-generator.js    # Permission/role generation
│   ├── validator.js         # Input validation
│   └── knex-connection.js   # Database connection
└── templates/
    └── domain/              # Handlebars templates
        ├── controller.hbs
        ├── service.hbs
        ├── repository.hbs
        ├── route.hbs
        ├── schemas.hbs
        ├── types.hbs
        ├── test.hbs
        └── index.hbs
```

### Template System

The generator uses **Handlebars.js** templates with conditional logic for package-specific features:

```handlebars
{{#if (or (eq package 'enterprise') (eq package 'full'))}}
  // Enterprise/Full package specific code
{{/if}}

{{#if (eq package 'full')}}
  // Full package only code
{{/if}}
```

## 🔧 Implementation Details

### Database Introspection

The generator analyzes PostgreSQL tables to extract:

```javascript
// Column analysis
const columns = await knex.raw(
  `
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns 
  WHERE table_name = ? AND table_schema = 'public'
`,
  [tableName],
);

// Index detection
const indexes = await knex.raw(
  `
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = ?
`,
  [tableName],
);
```

### Template Context Generation

Each template receives a comprehensive context object:

```javascript
const context = {
  // Basic info
  tableName: 'products',
  className: 'Products',
  moduleName: 'products',

  // Package configuration
  package: 'enterprise', // 'standard' | 'enterprise' | 'full'
  hasStatusField: true,

  // Column analysis
  columns: [...],
  searchableFields: [...],
  filterableFields: [...],

  // Generated metadata
  timestamp: new Date().toISOString(),
  permissions: ['create', 'read', 'update', 'delete']
};
```

### Package Feature Matrix

| Feature            | Standard | Enterprise | Full |
| ------------------ | -------- | ---------- | ---- |
| Basic CRUD         | ✅       | ✅         | ✅   |
| Pagination         | ✅       | ✅         | ✅   |
| Filtering          | ✅       | ✅         | ✅   |
| TypeBox Schemas    | ✅       | ✅         | ✅   |
| RBAC Authorization | ✅       | ✅         | ✅   |
| Bulk Operations    | ❌       | ✅         | ✅   |
| Dropdown APIs      | ❌       | ✅         | ✅   |
| Status Management  | ❌       | ✅         | ✅   |
| Statistics         | ❌       | ✅         | ✅   |
| Data Validation    | ❌       | ❌         | ✅   |
| Uniqueness Check   | ❌       | ❌         | ✅   |

## 📝 Template Development

### Creating Custom Templates

1. **Template Structure**:

```handlebars
{{!-- Header comment --}}
import { /* imports */ } from '...';

{{#if package}}
// Package-specific imports
{{/if}}

export class {{className}}Controller {
  {{#each methods}}
  {{> methodTemplate}}
  {{/each}}
}
```

2. **Conditional Logic**:

```handlebars
{{#if (eq package 'enterprise')}}
  // Enterprise only
{{else if (eq package 'full')}}
  // Full only
{{else}}
  // Standard
{{/if}}
```

3. **Helper Functions**:

```javascript
// Register custom helpers
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('or', (a, b) => a || b);
Handlebars.registerHelper('capitalize', (str) => str.charAt(0).toUpperCase() + str.slice(1));
```

### Schema Generation

TypeBox schemas are generated dynamically based on database columns:

```javascript
// Column type mapping
const typeMapping = {
  'character varying': 'Type.String()',
  text: 'Type.String()',
  integer: 'Type.Number()',
  boolean: 'Type.Boolean()',
  'timestamp with time zone': 'Type.String({ format: "date-time" })',
  json: 'Type.Record(Type.String(), Type.Any())',
  jsonb: 'Type.Record(Type.String(), Type.Any())',
};

// Optional field detection
const isOptional = column.is_nullable === 'YES' || column.column_default !== null;
```

## 🔄 Code Generation Process

### 1. Database Analysis

```javascript
async function analyzeTable(tableName) {
  const columns = await getTableColumns(tableName);
  const indexes = await getTableIndexes(tableName);
  const constraints = await getTableConstraints(tableName);

  return {
    columns: transformColumns(columns),
    hasStatusField: columns.some((c) => c.column_name.includes('active')),
    searchableFields: extractSearchableFields(columns),
    relationships: detectRelationships(constraints),
  };
}
```

### 2. Context Building

```javascript
function buildTemplateContext(tableName, options, analysis) {
  return {
    // Transform table name to various formats
    tableName,
    className: pascalCase(tableName),
    camelCaseName: camelCase(tableName),

    // Package configuration
    package: options.package,
    packageEqualEnterprise: options.package === 'enterprise',
    packageEqualFull: options.package === 'full',

    // Database analysis
    ...analysis,

    // Generation metadata
    timestamp: new Date().toISOString(),
    generator: 'Enhanced CRUD Generator v1.0',
  };
}
```

### 3. File Generation

```javascript
async function generateModule(tableName, options) {
  const context = await buildContext(tableName, options);

  const files = ['controller.hbs', 'service.hbs', 'repository.hbs', 'route.hbs', 'schemas.hbs', 'types.hbs', 'test.hbs', 'index.hbs'];

  for (const template of files) {
    const content = await renderTemplate(template, context);
    await writeFile(getOutputPath(template, tableName), content);
  }
}
```

## 🧪 Testing Strategy

### Unit Tests for Generator

```javascript
describe('Enhanced CRUD Generator', () => {
  test('should generate standard package correctly', async () => {
    const result = await generateModule('test_table', {
      package: 'standard',
    });

    expect(result.files).toHaveLength(8);
    expect(result.routes).toHaveLength(5);
  });

  test('should include enterprise features', async () => {
    const content = await renderTemplate('controller.hbs', {
      package: 'enterprise',
      tableName: 'products',
    });

    expect(content).toContain('bulkCreate');
    expect(content).toContain('getDropdownOptions');
  });
});
```

### Integration Tests

```javascript
describe('Generated Module Integration', () => {
  test('should build without TypeScript errors', async () => {
    await generateModule('integration_test', { package: 'full' });

    const buildResult = await execAsync('nx run api:build');
    expect(buildResult.exitCode).toBe(0);
  });

  test('should create valid migration files', async () => {
    const migrations = await generateModule('test_table', {
      package: 'enterprise',
    });

    expect(migrations.migrationFile).toMatch(/add_test_table_permissions/);
  });
});
```

## 🔧 Extending the Generator

### Adding New Package Levels

1. **Update Package Validation**:

```javascript
const VALID_PACKAGES = ['standard', 'enterprise', 'full', 'custom'];
```

2. **Extend Template Logic**:

```handlebars
{{#if (eq package 'custom')}}
  // Custom package features
{{/if}}
```

3. **Add Package Documentation**:

```javascript
const packageDescriptions = {
  custom: {
    description: 'Custom enterprise features',
    routes: 20,
    features: ['advanced-auth', 'audit-trail', 'versioning'],
  },
};
```

### Custom Field Types

```javascript
// Add support for custom PostgreSQL types
const customTypeMapping = {
  geometry: 'Type.Object()', // PostGIS
  enum: 'Type.Union([...])', // Custom enums
  uuid: 'Type.String({ format: "uuid" })',
};
```

### Plugin System

```javascript
// Plugin interface for extensions
class GeneratorPlugin {
  beforeGeneration(context) {
    // Modify context before generation
  }

  afterGeneration(files) {
    // Post-process generated files
  }

  customTemplates() {
    // Return additional templates
  }
}
```

## 🚨 Error Handling

### Common Error Types

```javascript
class GeneratorError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

// Usage examples
throw new GeneratorError('Table not found', 'TABLE_NOT_FOUND', { tableName: 'missing_table' });
```

### Validation Strategies

```javascript
function validateTableStructure(columns) {
  const required = ['id', 'created_at', 'updated_at'];
  const missing = required.filter((col) => !columns.some((c) => c.column_name === col));

  if (missing.length > 0) {
    throw new GeneratorError(`Missing required columns: ${missing.join(', ')}`, 'INVALID_TABLE_STRUCTURE');
  }
}
```

## 📊 Performance Considerations

### Template Compilation

```javascript
// Pre-compile templates for better performance
const compiledTemplates = new Map();

function getCompiledTemplate(templateName) {
  if (!compiledTemplates.has(templateName)) {
    const source = fs.readFileSync(templatePath);
    compiledTemplates.set(templateName, Handlebars.compile(source));
  }
  return compiledTemplates.get(templateName);
}
```

### Database Connection Pooling

```javascript
// Use connection pooling for multiple table analysis
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
});
```

## 🔗 Integration Points

### Base Schema Dependencies

The generator relies on base schemas in `apps/api/src/schemas/base.schemas.ts`:

```typescript
// Required exports
export const PaginationQuerySchema = Type.Object({...});
export const ApiSuccessResponseSchema = <T>(data: T) => Type.Object({...});
export const BulkCreateSchema = <T>(itemSchema: T) => Type.Object({...});
```

### Module Registration

Generated modules must be registered in the main application:

```typescript
// apps/api/src/app.ts
import productsModule from './modules/products';

await fastify.register(productsModule, { prefix: '/api/products' });
```

---

**Next Steps:**

- Review [API Reference](./API_REFERENCE.md) for endpoint specifications
- Check [Architecture](./ARCHITECTURE.md) for system design details
- See [Troubleshooting](./TROUBLESHOOTING.md) for debugging guides
