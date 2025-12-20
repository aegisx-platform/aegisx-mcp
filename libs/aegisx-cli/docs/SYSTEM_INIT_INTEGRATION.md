# System Init Integration Guide

**How to integrate CRUD Generator with System Initialization (Auto-Discovery Import)**

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Generating System Init-Compatible Modules](#generating-system-init-compatible-modules)
- [Manual Integration Steps](#manual-integration-steps)
- [Template Structure](#template-structure)
- [Example Implementation](#example-implementation)
- [Testing Integration](#testing-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide shows how to generate CRUD modules that are compatible with the **System Initialization Auto-Discovery** system, allowing your modules to:

✅ Auto-discover on server start
✅ Appear in centralized import dashboard
✅ Support dependency management
✅ Enable batch tracking and rollback
✅ Track complete import history

---

## Prerequisites

### 1. Database Tables

System Init requires these tables (should already exist):

```sql
-- Import sessions (database-backed sessions)
import_sessions

-- Import history (audit trail)
import_history

-- Import service registry (discovered modules)
import_service_registry
```

**Check if tables exist:**

```bash
psql -d your_database -c "\dt import_*"
```

**If missing, run migrations:**

```bash
pnpm run db:migrate
```

### 2. System Init API

Verify System Init API is running:

```bash
curl http://localhost:3000/api/admin/system-init/health-status
```

**Expected response:**

```json
{
  "status": "healthy",
  "discoveredModules": 5,
  "registryStatus": "active"
}
```

### 3. Import Base Classes

Ensure these exist:

```
apps/api/src/layers/platform/import/
├── base/
│   └── base-import.service.ts
├── decorator/
│   └── import-service.decorator.ts
├── types/
│   └── import-service.types.ts
└── index.ts (exports all)
```

---

## Generating System Init-Compatible Modules

### Option 1: Using CRUD Generator (Recommended)

**Generate backend with System Init support:**

```bash
# Full package includes System Init import
pnpm run crud:full -- products \
  --domain inventory/master-data \
  --schema inventory \
  --force

# Or explicitly add System Init flag
pnpm run crud -- products \
  --with-import \
  --system-init \
  --domain inventory/master-data \
  --force
```

**What Gets Generated:**

```
apps/api/src/layers/platform/products/
├── products-import.service.ts      ← System Init-compatible
├── products.controller.ts
├── products.service.ts
├── products.repository.ts
├── products.schemas.ts
└── products.types.ts
```

**Key Differences from Generic Import:**

| File                 | Generic Import         | System Init Import               |
| -------------------- | ---------------------- | -------------------------------- |
| **Import Service**   | Uses config object     | Uses `@ImportService` decorator  |
| **Base Import Path** | `@shared/services/`    | `@layers/platform/import/`       |
| **Auto-Discovery**   | Manual registration    | Automatic on server start        |
| **Routes**           | Module-specific routes | Uses centralized System Init API |

---

### Option 2: Manual Creation

If you need to create manually or customize:

**Step 1: Create Import Service with Decorator**

```typescript
// apps/api/src/layers/platform/products/products-import.service.ts

import { Knex } from 'knex';
import { ImportService, BaseImportService, TemplateColumn, ValidationError, ImportOptions } from '../import'; // Adjust path as needed
import { Product } from './products.schemas';
import { ProductsRepository } from './products.repository';

/**
 * Products Import Service (System Init Compatible)
 * Auto-discovered by System Init on server startup
 */
@ImportService({
  module: 'products', // Unique module identifier
  domain: 'inventory', // Business domain
  subdomain: 'master-data', // Subdomain (optional)
  displayName: 'Products (สินค้า)', // Display name (with Thai)
  description: 'Product master data import', // Description
  dependencies: ['categories', 'suppliers'], // Import after these modules
  priority: 3, // Import order (1 = first)
  tags: ['master-data', 'inventory'], // Tags for filtering
  supportsRollback: true, // Enable rollback
  version: '1.0.0', // Semantic version
})
export class ProductsImportService extends BaseImportService<Product> {
  private repository: ProductsRepository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new ProductsRepository(knex);
    this.moduleName = 'products';
  }

  /**
   * Get service metadata (required)
   */
  getMetadata() {
    return {
      module: 'products',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Products (สินค้า)',
      description: 'Product master data import',
      dependencies: ['categories', 'suppliers'],
      priority: 3,
      tags: ['master-data', 'inventory'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  /**
   * Define Excel/CSV template structure
   */
  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Product Code',
        required: true,
        type: 'string',
        maxLength: 20,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique product code (uppercase, numbers, hyphens)',
        example: 'PRD-001',
      },
      {
        name: 'name',
        displayName: 'Product Name',
        required: true,
        type: 'string',
        maxLength: 100,
        description: 'Product name in Thai or English',
        example: 'Sample Product',
      },
      {
        name: 'category_code',
        displayName: 'Category Code',
        required: true,
        type: 'string',
        maxLength: 20,
        description: 'Category code (must exist)',
        example: 'CAT-001',
      },
      // Add more columns...
    ];
  }

  /**
   * Validate single row
   * Called for each row during file validation
   */
  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!row.code?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Product code is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    // Format validation
    if (row.code && !/^[A-Z0-9_-]+$/.test(row.code)) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Code must contain only uppercase letters, numbers, and hyphens',
        severity: 'ERROR',
        code: 'INVALID_FORMAT',
      });
    }

    // Duplicate check
    if (row.code) {
      const existing = await this.knex('products').where('product_code', row.code.trim()).first();

      if (existing) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message: `Product code '${row.code}' already exists`,
          severity: 'ERROR',
          code: 'DUPLICATE_CODE',
        });
      }
    }

    // Foreign key validation
    if (row.category_code) {
      const category = await this.knex('categories').where('category_code', row.category_code.trim()).first();

      if (!category) {
        errors.push({
          row: rowNumber,
          field: 'category_code',
          message: `Category '${row.category_code}' not found`,
          severity: 'ERROR',
          code: 'INVALID_REFERENCE',
        });
      }
    }

    return errors;
  }

  /**
   * Insert batch of records
   * Called during import execution with transaction
   */
  protected async insertBatch(batch: any[], trx: Knex.Transaction, options: ImportOptions): Promise<Product[]> {
    const results: Product[] = [];

    for (const row of batch) {
      // Lookup foreign keys
      const category = await trx('categories').select('id').where('category_code', row.category_code?.trim()).first();

      const dbData = {
        product_code: row.code?.trim(),
        product_name: row.name?.trim(),
        category_id: category?.id || null,
        price: parseFloat(row.price) || 0,
        is_active: true,
        import_batch_id: row.import_batch_id, // For rollback
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [inserted] = await trx('products').insert(dbData).returning('*');

      results.push(inserted);
    }

    return results;
  }

  /**
   * Rollback imported records
   * Uses batch_id for precise rollback
   */
  protected async performRollback(batchId: string, knex: Knex): Promise<number> {
    const deleted = await knex('products').where({ import_batch_id: batchId }).delete();

    return deleted;
  }
}
```

**Step 2: Add `import_batch_id` Column**

```sql
-- Add to products table for rollback support
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_batch_id UUID DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_products_import_batch ON products(import_batch_id);
```

**Step 3: Export from Module Index**

```typescript
// apps/api/src/layers/platform/products/index.ts

export * from './products.controller';
export * from './products.service';
export * from './products.repository';
export * from './products.schemas';
export * from './products.types';
export * from './products-import.service'; // Add this
```

**Step 4: Restart Server to Trigger Discovery**

```bash
pnpm run dev:api
```

**Check Discovery Log:**

```
[System Init] Auto-discovery started...
[System Init] Found products import service
[System Init] Registered: products (inventory/master-data)
[System Init] Auto-discovery completed in 95ms
[System Init] Discovered 6 modules
```

---

## Manual Integration Steps

### Step 1: Verify Import Base Path

**Ensure your import service uses correct path:**

```typescript
// ✅ CORRECT (System Init)
import { ImportService, BaseImportService, TemplateColumn, ValidationError } from '../import'; // or '@layers/platform/import'

// ❌ WRONG (Generic Import)
import { BaseImportService } from '@shared/services/base-import.service';
```

### Step 2: Add Decorator

```typescript
// Add decorator before class
@ImportService({
  module: 'products',
  domain: 'inventory',
  displayName: 'Products (สินค้า)',
  dependencies: [],
  priority: 1,
  tags: ['master-data'],
  supportsRollback: true,
  version: '1.0.0',
})
export class ProductsImportService extends BaseImportService<Product> {
  // ...
}
```

### Step 3: Implement Required Methods

```typescript
// Required methods for System Init
getMetadata() { /* ... */ }
getTemplateColumns(): TemplateColumn[] { /* ... */ }
async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> { /* ... */ }
protected async insertBatch(batch: any[], trx: Knex.Transaction, options: ImportOptions): Promise<Product[]> { /* ... */ }
protected async performRollback(batchId: string, knex: Knex): Promise<number> { /* ... */ }
```

### Step 4: Test Discovery

```bash
# Restart server
pnpm run dev:api

# Check System Init dashboard
curl http://localhost:3000/api/admin/system-init/available-modules
```

**Expected response:**

```json
{
  "modules": [
    {
      "module": "products",
      "domain": "inventory",
      "displayName": "Products (สินค้า)",
      "dependencies": ["categories"],
      "priority": 3,
      "tags": ["master-data"],
      "supportsRollback": true
    }
  ]
}
```

---

## Template Structure

### Handlebars Template for System Init Import

**File:** `libs/aegisx-cli/templates/backend/import-service-system-init.hbs`

```handlebars
/**
 * {{ModuleName}} Import Service (System Init)
 * Auto-discovered by System Initialization
 */

import { Knex } from 'knex';
import {
  ImportService,
  BaseImportService,
  TemplateColumn,
  ValidationError,
  ImportOptions,
} from '../import';
import { {{ModuleName}} } from './{{kebabCase moduleName}}.schemas';
import { {{ModuleName}}Repository } from './{{kebabCase moduleName}}.repository';

@ImportService({
  module: '{{moduleName}}',
  domain: '{{domain}}',
  subdomain: '{{subdomain}}',
  displayName: '{{displayName}}',
  description: '{{description}}',
  dependencies: [{{#each dependencies}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
  priority: {{priority}},
  tags: [{{#each tags}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
  supportsRollback: {{supportsRollback}},
  version: '1.0.0',
})
export class {{ModuleName}}ImportService extends BaseImportService<{{ModuleName}}> {
  private repository: {{ModuleName}}Repository;

  constructor(knex: Knex) {
    super(knex);
    this.repository = new {{ModuleName}}Repository(knex);
    this.moduleName = '{{moduleName}}';
  }

  getMetadata() {
    return {
      module: '{{moduleName}}',
      domain: '{{domain}}',
      subdomain: '{{subdomain}}',
      displayName: '{{displayName}}',
      description: '{{description}}',
      dependencies: [{{#each dependencies}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
      priority: {{priority}},
      tags: [{{#each tags}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
      supportsRollback: {{supportsRollback}},
      version: '1.0.0',
    };
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {{#each importFields}}
      {
        name: '{{name}}',
        displayName: '{{displayName}}',
        required: {{required}},
        type: '{{type}}',
        {{#if maxLength}}maxLength: {{maxLength}},{{/if}}
        {{#if pattern}}pattern: '{{pattern}}',{{/if}}
        description: '{{description}}',
        example: '{{example}}',
      },
      {{/each}}
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    {{#each importFields}}
    {{#if required}}
    // Validate required field: {{name}}
    if (!row.{{name}}{{#if (eq type 'string')}}?.trim(){{/if}}) {
      errors.push({
        row: rowNumber,
        field: '{{name}}',
        message: '{{displayName}} is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }
    {{/if}}

    {{#if pattern}}
    // Validate format: {{name}}
    if (row.{{name}} && !/({{pattern}})/.test(row.{{name}})) {
      errors.push({
        row: rowNumber,
        field: '{{name}}',
        message: '{{displayName}} format is invalid',
        severity: 'ERROR',
        code: 'INVALID_FORMAT',
      });
    }
    {{/if}}

    {{#if unique}}
    // Check duplicate: {{name}}
    if (row.{{name}}) {
      const existing = await this.knex('{{../tableName}}')
        .where('{{dbColumn}}', row.{{name}}.trim())
        .first();

      if (existing) {
        errors.push({
          row: rowNumber,
          field: '{{name}}',
          message: `{{displayName}} '${row.{{name}}}' already exists`,
          severity: 'ERROR',
          code: 'DUPLICATE_CODE',
        });
      }
    }
    {{/if}}

    {{/each}}

    return errors;
  }

  protected async insertBatch(
    batch: any[],
    trx: Knex.Transaction,
    options: ImportOptions,
  ): Promise<{{ModuleName}}[]> {
    const results: {{ModuleName}}[] = [];

    for (const row of batch) {
      const dbData = {
        {{#each importFields}}
        {{dbColumn}}: row.{{name}}{{#if (eq type 'string')}}?.trim(){{/if}},
        {{/each}}
        import_batch_id: row.import_batch_id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [inserted] = await trx('{{tableName}}')
        .insert(dbData)
        .returning('*');

      results.push(inserted);
    }

    return results;
  }

  protected async performRollback(batchId: string, knex: Knex): Promise<number> {
    const deleted = await knex('{{tableName}}')
      .where({ import_batch_id: batchId })
      .delete();

    return deleted;
  }
}
```

---

## Testing Integration

### 1. Test Auto-Discovery

```bash
# Restart API server
pnpm run dev:api

# Watch for discovery log
# Expected: "Discovered 6 modules" (or your count)
```

### 2. Test API Endpoints

```bash
# List available modules
curl http://localhost:3000/api/admin/system-init/available-modules

# Get import order
curl http://localhost:3000/api/admin/system-init/import-order

# Download template
curl http://localhost:3000/api/admin/system-init/module/products/template?format=csv \
  --output products-template.csv
```

### 3. Test Import Flow

```bash
# 1. Upload and validate file
curl -X POST http://localhost:3000/api/admin/system-init/module/products/validate \
  -F "file=@products.csv" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: { sessionId: "uuid", isValid: true, ... }

# 2. Execute import
curl -X POST http://localhost:3000/api/admin/system-init/module/products/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sessionId": "SESSION_ID", "options": {}}'

# Response: { jobId: "uuid", status: "queued" }

# 3. Check status
curl http://localhost:3000/api/admin/system-init/module/products/status/JOB_ID

# Response: { jobId: "uuid", status: "completed", progress: {...} }
```

### 4. Test Rollback

```bash
curl -X DELETE http://localhost:3000/api/admin/system-init/module/products/rollback/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: { success: true, deletedCount: 100 }
```

---

## Troubleshooting

### Module Not Discovered

**Symptoms:**

- Module not showing in `/available-modules`
- No discovery log on server start

**Solutions:**

1. **Check Decorator:**

   ```typescript
   // Ensure @ImportService is present
   @ImportService({
     /* config */
   })
   export class ProductsImportService {}
   ```

2. **Check File Name:**

   ```
   ✅ products-import.service.ts
   ❌ products-import.ts (missing .service)
   ❌ productsImport.service.ts (wrong format)
   ```

3. **Check Export:**

   ```typescript
   // index.ts must export the service
   export * from './products-import.service';
   ```

4. **Check Logs:**
   ```bash
   # Look for errors in console
   grep "System Init" logs/api.log
   ```

---

### Import Batch ID Column Missing

**Symptoms:**

- Error: `column "import_batch_id" does not exist`
- Rollback fails

**Solution:**

```sql
ALTER TABLE products ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_products_import_batch ON products(import_batch_id);
```

---

### Session Not Found

**Symptoms:**

- Error: `Validation session not found or expired`
- Import execution fails

**Solutions:**

1. **Check Session Expiration:**
   - Sessions expire after 30 minutes
   - Upload and import within time limit

2. **Check Database:**

   ```sql
   SELECT * FROM import_sessions WHERE session_id = 'YOUR_SESSION_ID';
   ```

3. **Verify Session Table Exists:**
   ```sql
   \dt import_sessions
   ```

---

### Dependency Validation Fails

**Symptoms:**

- Module shows in list but import disabled
- "Dependencies not met" warning

**Solution:**

1. **Check Dependencies:**

   ```typescript
   @ImportService({
     dependencies: ['categories'], // Must import categories first
     // ...
   })
   ```

2. **Import in Correct Order:**

   ```bash
   # Get import order
   curl http://localhost:3000/api/admin/system-init/import-order

   # Follow the order shown
   ```

---

## Best Practices

### 1. Naming Conventions

```typescript
// ✅ Good
module: 'products';
displayName: 'Products (สินค้า)';
class ProductsImportService {}

// ❌ Bad
module: 'Product'; // Should be lowercase plural
displayName: 'products'; // Should be capitalized
class ProductImportService {} // Missing plural
```

### 2. Dependencies

```typescript
// ✅ Explicit dependencies
@ImportService({
  module: 'products',
  dependencies: ['categories', 'suppliers'], // Clear dependencies
  priority: 3, // Import after dependencies
})

// ❌ Missing dependencies
@ImportService({
  module: 'products',
  dependencies: [], // Wrong! Products need categories
  priority: 1, // Will fail foreign key constraint
})
```

### 3. Error Codes

```typescript
// ✅ Use consistent error codes
errors.push({
  code: 'REQUIRED_FIELD', // Standard
  code: 'INVALID_FORMAT', // Standard
  code: 'DUPLICATE_CODE', // Standard
  code: 'INVALID_REFERENCE', // Standard
});

// ❌ Custom inconsistent codes
errors.push({
  code: 'MISSING', // Not descriptive
  code: 'bad_format', // Wrong case
  code: 'already_exists', // Use DUPLICATE_CODE
});
```

### 4. Rollback Support

```typescript
// ✅ Always include import_batch_id
const dbData = {
  product_code: row.code,
  import_batch_id: row.import_batch_id, // Required
  created_at: new Date(),
};

// ❌ Missing batch_id
const dbData = {
  product_code: row.code,
  // Missing import_batch_id - rollback won't work!
  created_at: new Date(),
};
```

---

## Conclusion

Integrating with System Init provides:

- ✅ Auto-discovery (no manual registration)
- ✅ Centralized dashboard
- ✅ Dependency management
- ✅ Complete audit trail
- ✅ Precise rollback support

Follow this guide to ensure proper integration and avoid common pitfalls.

---

**Related Documentation:**

- [Import Guide](./IMPORT_GUIDE.md) - Complete import functionality guide
- [Import Comparison](./IMPORT_COMPARISON.md) - Generic vs System Init comparison
- [System Initialization Spec](../../docs/features/system-initialization/auto-discovery-import-system.md) - Architecture details

**Last Updated:** December 20, 2025
