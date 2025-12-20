---
paths:
  - apps/api/src/layers/domains/inventory/**/*.ts
  - apps/web/src/app/features/inventory/**/*.ts
---

# Inventory Domain Rules

## Architecture Overview

โปรเจคใช้ **Layered Architecture** with **Plugin Pattern**:

```
apps/api/src/layers/domains/inventory/
├── index.ts                    # Domain plugin aggregator
├── master-data/               # Master data modules
│   ├── index.ts              # Master-data plugin
│   ├── drugs/
│   │   ├── drugs.controller.ts
│   │   ├── drugs.repository.ts
│   │   ├── drugs.route.ts
│   │   ├── drugs.schemas.ts
│   │   ├── drugs.service.ts
│   │   ├── drugs.types.ts
│   │   └── index.ts          # Drugs plugin
│   ├── budgets/
│   ├── locations/
│   └── ...
├── operations/                # Operations modules
│   ├── index.ts
│   ├── budgetAllocations/
│   ├── drugDistributions/
│   └── ...
├── procurement/               # Procurement modules
├── budget/                    # Budget modules
└── tmt/                       # TMT modules
```

## Database Schema

- **ALWAYS use `inventory` schema** for all inventory-related tables
- Never use `public` schema for inventory tables

## Domain Classification

### Master-Data Tables (inventory/master-data)

Tables that store lookup/reference data:

- `drugs` - รายการยา
- `drug_generics` - ยาสามัญ
- `drug_units` - หน่วยนับยา
- `dosage_forms` - รูปแบบการจัดยา
- `locations` - สถานที่จัดเก็บ
- `companies` - บริษัท
- `budgets` - งบประมาณ (configuration)
- `budget_types` - ประเภทงบ
- `budget_categories` - หมวดงบ

**Characteristics:**

- มี fields: `code`, `name`, `is_active`
- ใช้สำหรับ dropdown/selection
- เปลี่ยนแปลงไม่บ่อย

**CRUD Command:**

```bash
pnpm run crud -- TABLE_NAME --domain inventory/master-data --schema inventory --force
```

### Operations Tables (inventory/operations)

Tables that store transactional data:

- `inventory` - สต็อกคงเหลือ
- `inventory_transactions` - รายการเคลื่อนไหวสินค้า
- `drug_distributions` - การจ่ายยา
- `drug_returns` - การรับคืนยา
- `budget_allocations` - การจัดสรรงบ
- `budget_plans` - แผนงบประมาณ

**Characteristics:**

- มี audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- มี foreign keys หลายตัว
- เกิดขึ้นบ่อย, มีปริมาณมาก

**CRUD Command:**

```bash
pnpm run crud -- TABLE_NAME --domain inventory/operations --schema inventory --force
```

## File Structure Pattern

Every module MUST follow this structure:

```
{module-name}/
├── {module}.controller.ts     # HTTP request handling
├── {module}.repository.ts     # Database operations
├── {module}.route.ts          # Route definitions
├── {module}.schemas.ts        # TypeBox schemas
├── {module}.service.ts        # Business logic
├── {module}.types.ts          # TypeScript types
└── index.ts                   # Plugin export
```

## Plugin Pattern

### Module Plugin (e.g., drugs/index.ts)

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
import { DrugsService } from './drugs.service';
import { DrugsRepository } from './drugs.repository';
import { drugsRoutes } from './drugs.route';

export default fp(
  async function drugsDomainPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Service instantiation with proper dependency injection
    const drugsRepository = new DrugsRepository((fastify as any).knex);
    const drugsService = new DrugsService(drugsRepository);
    const drugsController = new DrugsController(drugsService);

    // Register routes
    await fastify.register(drugsRoutes, {
      controller: drugsController,
      prefix: options.prefix || '/inventory/master-data/drugs',
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Drugs domain module registered successfully`);
    });
  },
  {
    name: 'drugs-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);

// Re-exports
export * from './drugs.schemas';
export * from './drugs.types';
export { DrugsRepository } from './drugs.repository';
export { DrugsService } from './drugs.service';
export { DrugsController } from './drugs.controller';
```

### Domain Aggregator Plugin (master-data/index.ts)

```typescript
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import locationsPlugin from './locations';
import budgetsPlugin from './budgets';
// ... other imports

export default fp(
  async function masterDataDomainPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const prefix = options.prefix || '/inventory/master-data';

    // Register all domain modules
    await fastify.register(drugsPlugin, {
      ...options,
      prefix: `${prefix}/drugs`,
    });
    await fastify.register(locationsPlugin, {
      ...options,
      prefix: `${prefix}/locations`,
    });
    await fastify.register(budgetsPlugin, {
      ...options,
      prefix: `${prefix}/budgets`,
    });

    fastify.addHook('onReady', async () => {
      fastify.log.info(`Master-data domain loaded at ${prefix}`);
    });
  },
  {
    name: 'masterData-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);
```

## Route Definition Pattern

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
import { CreateDrugsSchema, UpdateDrugsSchema, DrugsIdParamSchema, DrugsResponseSchema } from './drugs.schemas';
import { SchemaRefs } from '../../../../../schemas/registry';

export interface DrugsRoutesOptions extends FastifyPluginOptions {
  controller: DrugsController;
}

export async function drugsRoutes(fastify: FastifyInstance, options: DrugsRoutesOptions) {
  const { controller } = options;

  // Create
  fastify.post('/', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Create a new drugs',
      body: CreateDrugsSchema,
      response: {
        201: DrugsResponseSchema,
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'create')],
    handler: controller.create.bind(controller),
  });

  // Get by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Get drugs by ID',
      params: DrugsIdParamSchema,
      response: {
        200: DrugsResponseSchema,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findOne.bind(controller),
  });

  // List all
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Get all drugs with pagination',
      response: {
        200: DrugsListResponseSchema,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findMany.bind(controller),
  });

  // Update
  fastify.put('/:id', {
    schema: {
      params: DrugsIdParamSchema,
      body: UpdateDrugsSchema,
      response: {
        200: DrugsResponseSchema,
        404: SchemaRefs.NotFound,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'update')],
    handler: controller.update.bind(controller),
  });

  // Delete
  fastify.delete('/:id', {
    schema: {
      params: DrugsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        404: SchemaRefs.NotFound,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'delete')],
    handler: controller.delete.bind(controller),
  });
}
```

## URL Structure

Final URLs after all plugin registrations:

```
/api/inventory/master-data/drugs             GET, POST
/api/inventory/master-data/drugs/:id         GET, PUT, DELETE
/api/inventory/master-data/budgets           GET, POST
/api/inventory/master-data/budgets/:id       GET, PUT, DELETE

/api/inventory/operations/drug-distributions         GET, POST
/api/inventory/operations/drug-distributions/:id     GET, PUT, DELETE
/api/inventory/operations/budget-allocations         GET, POST
/api/inventory/operations/budget-allocations/:id     GET, PUT, DELETE
```

## Repository Pattern

```typescript
import { Knex } from 'knex';
import { BaseRepository } from '../../../../core/database/base.repository';
import { Drugs, CreateDrugs, UpdateDrugs } from './drugs.types';

export class DrugsRepository extends BaseRepository<Drugs> {
  constructor(db: Knex) {
    super(db, 'inventory.drugs'); // Note: schema.table
  }

  // Custom methods
  async findByCode(code: string): Promise<Drugs | undefined> {
    return this.db('inventory.drugs').where({ code }).first();
  }

  async findActive(): Promise<Drugs[]> {
    return this.db('inventory.drugs').where({ is_active: true }).orderBy('name');
  }
}
```

## Authentication & Authorization

### CRITICAL: Use Fastify Decorators

```typescript
// ✅ CORRECT: Use fastify decorators (NOT function calls)
preValidation: [
  fastify.authenticate, // Decorator, not authenticate()
  fastify.verifyPermission('drugs', 'create'), // Permission check
];

// ❌ WRONG: Don't call as functions
preValidation: [
  authenticate(), // WRONG!
  authorize('drugs'), // WRONG!
];
```

### Available Fastify Decorators

```typescript
// From fastify instance
fastify.authenticate; // JWT verification
fastify.verifyPermission(resource, action); // Permission check
fastify.knex; // Database connection
```

## Schema Registry Pattern

```typescript
import { SchemaRefs } from '../../../../../schemas/registry';

// Use centralized error schemas
response: {
  200: DrugsResponseSchema,
  400: SchemaRefs.ValidationError,
  401: SchemaRefs.Unauthorized,
  403: SchemaRefs.Forbidden,
  404: SchemaRefs.NotFound,
  409: SchemaRefs.Conflict,
  422: SchemaRefs.UnprocessableEntity,
  500: SchemaRefs.ServerError,
}
```

## TypeBox Schema Standard

```typescript
import { Type } from '@sinclair/typebox';

// UUID validation
export const DrugsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  drug_generic_id: Type.String({ format: 'uuid' }),
  location_id: Type.String({ format: 'uuid' }),
  code: Type.String({ minLength: 1, maxLength: 50 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  is_active: Type.Boolean({ default: true }),
});

export const CreateDrugsSchema = Type.Omit(DrugsSchema, ['id']);
export const UpdateDrugsSchema = Type.Partial(CreateDrugsSchema);
```

## Common Mistakes

### ❌ WRONG: Old module pattern

```typescript
// Don't use this pattern
export async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.register(drugCatalogRoutes, { prefix: '/drug-catalogs' });
}
```

### ✅ CORRECT: Plugin pattern

```typescript
// Use fastify-plugin
export default fp(
  async function drugsDomainPlugin(fastify, options) {
    const repo = new DrugsRepository(fastify.knex);
    const service = new DrugsService(repo);
    const controller = new DrugsController(service);

    await fastify.register(drugsRoutes, {
      controller,
      prefix: options.prefix,
    });
  },
  { name: 'drugs-domain-plugin', dependencies: ['knex-plugin'] },
);
```

### ❌ WRONG: Missing schema prefix

```typescript
return this.db('drugs').select('*'); // Missing schema!
```

### ✅ CORRECT: Always use schema prefix

```typescript
return this.db('inventory.drugs').select('*');
```

## Quick Reference

```bash
# Generate Master-Data CRUD
pnpm run crud -- drugs --domain inventory/master-data --schema inventory --force

# Generate Operations CRUD
pnpm run crud -- drug_distributions --domain inventory/operations --schema inventory --force

# File structure will be created:
apps/api/src/layers/domains/inventory/master-data/drugs/
  drugs.controller.ts
  drugs.repository.ts
  drugs.route.ts
  drugs.schemas.ts
  drugs.service.ts
  drugs.types.ts
  index.ts
```

## Testing

```bash
# Test endpoint
curl -X GET "http://localhost:3000/api/inventory/master-data/drugs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Pre-CRUD Checklist

1. ✅ Classify domain correctly (master-data vs operations)
2. ✅ Verify table exists in `inventory` schema
3. ✅ Check migration has UUID primary key
4. ✅ Use `--schema inventory` flag
5. ✅ Follow plugin pattern
6. ✅ Use SchemaRefs for error responses
7. ✅ Use fastify decorators for auth
