# Backend Architecture

## Overview

The AegisX backend uses a **Layer-based Architecture** with **Plugin Pattern** built on Fastify. This architecture provides clear separation of concerns, scalability, and maintainability through structured layers and modular plugins.

### Key Architectural Principles

- **Layer-based Routing**: 3-tier separation (Core, Platform, Domains)
- **Plugin Pattern**: fastify-plugin for modular, encapsulated features
- **Dependency Injection**: Service-oriented architecture with proper DI
- **TypeBox Validation**: Runtime type safety with TypeBox schemas
- **Repository Pattern**: BaseRepository for consistent data access
- **Schema Registry**: Centralized schema management

---

## Layer-based Architecture

The backend is organized into **3 layers** based on responsibility and scope:

```
apps/api/src/layers/
├── core/           # Infrastructure & system services
├── platform/       # Shared cross-domain services
└── domains/        # Business domain modules
```

### 1. Core Layer

**Path:** `apps/api/src/layers/core/`

**Prefix:** None (global services)

**Responsibility:**

- Authentication & Authorization
- Audit logging
- System monitoring
- Infrastructure concerns

**Modules:**

```
core/
├── auth/           # JWT authentication, strategies
├── audit/          # Audit logging system
└── monitoring/     # System health monitoring
```

**Example Routes:**

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/me
```

---

### 2. Platform Layer

**Path:** `apps/api/src/layers/platform/`

**Prefix:** `/api/v1/platform/*`

**Responsibility:**

- Shared business services
- Cross-domain features
- Reusable components

**Modules:**

```
platform/
├── users/          # User management
├── rbac/           # Role-based access control
├── departments/    # Department management
├── settings/       # System settings
├── navigation/     # Navigation menu
├── file-upload/    # File upload service
├── attachments/    # Attachment handling
├── pdf-export/     # PDF generation
└── import/         # Import/export services
```

**Example Routes:**

```
# RBAC
GET    /api/v1/platform/rbac/roles
POST   /api/v1/platform/rbac/roles
GET    /api/v1/platform/rbac/permissions

# Users
GET    /api/v1/platform/users
POST   /api/v1/platform/users
PUT    /api/v1/platform/users/:id

# Navigation
GET    /api/v1/platform/navigation/navigation
POST   /api/v1/platform/navigation/navigation

# Settings
GET    /api/v1/platform/settings
PUT    /api/v1/platform/settings/:key
```

---

### 3. Domains Layer

**Path:** `apps/api/src/layers/domains/`

**Prefix:** `/api/{domain}/*`

**Responsibility:**

- Business-specific features
- Domain-driven design
- Isolated business logic

**Modules:**

```
domains/
├── admin/          # Admin management
│   └── system-init/
└── inventory/      # Inventory domain
    ├── master-data/  # Reference data (drugs, locations, budgets)
    ├── operations/   # Transactions (distributions, returns)
    ├── procurement/  # Procurement processes
    ├── budget/       # Budget management
    └── tmt/          # TMT integration
```

**Example Routes:**

```
# Admin Domain
GET    /api/admin/system-init/available-modules
POST   /api/admin/system-init/import

# Inventory Domain - Master Data
GET    /api/inventory/master-data/drugs
POST   /api/inventory/master-data/drugs
GET    /api/inventory/master-data/locations

# Inventory Domain - Operations
GET    /api/inventory/operations/drug-distributions
POST   /api/inventory/operations/drug-distributions
```

---

## Plugin Pattern

### Why Plugins?

The plugin pattern using `fastify-plugin` provides:

- **Encapsulation**: Each module is self-contained
- **Dependency Management**: Explicit plugin dependencies
- **Lifecycle Hooks**: onReady, onClose for resource management
- **Decorator Sharing**: Services available across plugins
- **Testability**: Easy to mock and test in isolation

### Plugin Hierarchy

```
1. Infrastructure Plugins (DB, Redis, Auth)
   ↓
2. Core Layer Plugins (System services)
   ↓
3. Platform Layer Plugins (Shared services)
   ↓
4. Domains Layer Plugins (Business logic)
```

---

## Module Structure

Every module follows a consistent 7-file pattern:

```
{module-name}/
├── index.ts                    # Plugin definition & exports
├── {module}.controller.ts      # HTTP request handling
├── {module}.service.ts         # Business logic
├── {module}.repository.ts      # Database operations
├── {module}.route.ts           # Route definitions
├── {module}.schemas.ts         # TypeBox schemas
└── {module}.types.ts           # TypeScript types
```

### File Responsibilities

| File            | Purpose           | Contains                                   |
| --------------- | ----------------- | ------------------------------------------ |
| `index.ts`      | Plugin definition | Service instantiation, plugin registration |
| `controller.ts` | Request/Response  | HTTP handling, schema transformation       |
| `service.ts`    | Business logic    | Validation, business rules, orchestration  |
| `repository.ts` | Data access       | Database queries, transformations          |
| `route.ts`      | Route config      | Endpoint definitions, schemas, auth        |
| `schemas.ts`    | Validation        | TypeBox schemas for validation             |
| `types.ts`      | Type definitions  | TypeScript interfaces, enums               |

---

## Plugin Implementation Pattern

### Module Plugin (index.ts)

Every module must export a plugin using `fastify-plugin`:

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/index.ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
import { DrugsService } from './drugs.service';
import { DrugsRepository } from './drugs.repository';
import { drugsRoutes } from './drugs.route';

/**
 * Drugs Domain Plugin
 *
 * Following Fastify best practices:
 * - Service instantiation with proper dependency injection
 * - Encapsulation through plugin scoping
 * - Lifecycle management with hooks
 */
export default fp(
  async function drugsDomainPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // 1. Service instantiation with dependency injection
    // Access Knex from Fastify decorator (provided by knex-plugin)
    const drugsRepository = new DrugsRepository((fastify as any).knex);
    const drugsService = new DrugsService(drugsRepository);
    const drugsController = new DrugsController(drugsService);

    // 2. Register routes with controller
    await fastify.register(drugsRoutes, {
      controller: drugsController,
      prefix: options.prefix || '/inventory/master-data/drugs',
    });

    // 3. Lifecycle hooks for monitoring
    fastify.addHook('onReady', async () => {
      fastify.log.info('Drugs domain module registered successfully');
    });
  },
  {
    // Plugin metadata
    name: 'drugs-domain-plugin',
    dependencies: ['knex-plugin'], // Ensure Knex is loaded first
  },
);

// Re-exports for external consumers
export * from './drugs.schemas';
export * from './drugs.types';
export { DrugsRepository } from './drugs.repository';
export { DrugsService } from './drugs.service';
export { DrugsController } from './drugs.controller';
```

### Domain Aggregator Plugin

Domain-level plugins aggregate multiple module plugins:

```typescript
// apps/api/src/layers/domains/inventory/master-data/index.ts
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import locationsPlugin from './locations';
import budgetsPlugin from './budgets';
// ... other imports

/**
 * Master-data Domain Plugin
 *
 * Aggregates all modules within the Master-data domain.
 * Route prefix: /inventory/master-data
 */
export default fp(
  async function masterDataDomainPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const prefix = options.prefix || '/inventory/master-data';

    // Register all domain modules with proper prefixes
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
      fastify.log.info(`Master-data domain loaded with 18 modules at ${prefix}`);
    });
  },
  {
    name: 'masterData-domain-plugin',
    dependencies: ['knex-plugin'],
  },
);
```

---

## Route Definition Pattern

Routes are defined using Fastify's route registration with full TypeBox schemas:

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

  // Create drugs
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
        422: SchemaRefs.UnprocessableEntity,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [
      fastify.authenticate, // JWT authentication
      fastify.verifyPermission('drugs', 'create'), // Permission check
    ],
    handler: controller.create.bind(controller),
  });

  // Get drugs by ID
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

  // List all drugs
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Get all drugs with pagination',
      querystring: ListDrugsQuerySchema,
      response: {
        200: FlexibleDrugsListResponseSchema,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findMany.bind(controller),
  });

  // Update drugs
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

  // Delete drugs
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

### Key Route Patterns

**CRITICAL: Authentication Decorators**

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

**Schema Registry Pattern**

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

---

## Controller Pattern

Controllers handle HTTP request/response transformation:

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { Static } from '@sinclair/typebox';
import { DrugsService } from './drugs.service';
import { CreateDrugsSchema, UpdateDrugsSchema, DrugsIdParamSchema } from './drugs.schemas';

export class DrugsController {
  constructor(private drugsService: DrugsService) {}

  /**
   * Create new drugs
   * POST /drugs
   */
  async create(request: FastifyRequest<{ Body: Static<typeof CreateDrugsSchema> }>, reply: FastifyReply) {
    request.log.info({ body: request.body }, 'Creating drugs');

    // Transform API schema to domain model
    const createData = this.transformCreateSchema(request.body, request);

    const drugs = await this.drugsService.create(createData);

    request.log.info({ drugsId: drugs.id }, 'Drugs created successfully');

    return reply.code(201).success(drugs, 'Drugs created successfully');
  }

  /**
   * Get drugs by ID
   * GET /drugs/:id
   */
  async findOne(
    request: FastifyRequest<{
      Params: Static<typeof DrugsIdParamSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugsId: id }, 'Fetching drugs');

    const drugs = await this.drugsService.findById(id);

    return reply.success(drugs);
  }

  /**
   * Update drugs
   * PUT /drugs/:id
   */
  async update(
    request: FastifyRequest<{
      Params: Static<typeof DrugsIdParamSchema>;
      Body: Static<typeof UpdateDrugsSchema>;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    request.log.info({ drugsId: id, body: request.body }, 'Updating drugs');

    const updateData = this.transformUpdateSchema(request.body, request);
    const drugs = await this.drugsService.update(id, updateData);

    return reply.success(drugs, 'Drugs updated successfully');
  }

  /**
   * Delete drugs
   * DELETE /drugs/:id
   */
  async delete(request: FastifyRequest<{ Params: Static<typeof DrugsIdParamSchema> }>, reply: FastifyReply) {
    const { id } = request.params;
    request.log.info({ drugsId: id }, 'Deleting drugs');

    const deleted = await this.drugsService.delete(id);

    if (!deleted) {
      return reply.code(404).error('NOT_FOUND', 'Drugs not found');
    }

    return reply.success({ id, deleted: true }, 'Drugs deleted successfully');
  }

  // Private transformation methods
  private transformCreateSchema(schema: Static<typeof CreateDrugsSchema>, request: FastifyRequest) {
    return {
      drug_code: schema.drug_code,
      trade_name: schema.trade_name,
      // ... map all fields
    };
  }

  private transformUpdateSchema(schema: Static<typeof UpdateDrugsSchema>, request: FastifyRequest) {
    const updateData: any = {};
    if (schema.drug_code !== undefined) updateData.drug_code = schema.drug_code;
    if (schema.trade_name !== undefined) updateData.trade_name = schema.trade_name;
    // ... map all fields
    return updateData;
  }
}
```

---

## Service Pattern

Services contain business logic and extend BaseService:

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.service.ts
import { BaseService } from '../../../../../shared/services/base.service';
import { DrugsRepository } from './drugs.repository';
import { Drugs, CreateDrugs, UpdateDrugs } from './drugs.types';

export class DrugsService extends BaseService<Drugs, CreateDrugs, UpdateDrugs> {
  constructor(private drugsRepository: DrugsRepository) {
    super(drugsRepository);
  }

  /**
   * Get drugs by ID with optional query parameters
   */
  async findById(id: string | number): Promise<Drugs | null> {
    return this.getById(id);
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options = {}) {
    return this.getList(options);
  }

  /**
   * Create new drugs
   */
  async create(data: CreateDrugs): Promise<Drugs> {
    return super.create(data);
  }

  /**
   * Update existing drugs
   */
  async update(id: string | number, data: UpdateDrugs): Promise<Drugs | null> {
    return super.update(id, data);
  }

  /**
   * Delete drugs
   */
  async delete(id: string | number): Promise<boolean> {
    const existing = await this.drugsRepository.findById(id);
    if (!existing) return false;

    return this.drugsRepository.delete(id);
  }

  // Business logic hooks (override in child classes)
  protected async validateCreate(data: CreateDrugs): Promise<void> {
    // Add custom validation logic here
    if (data.unit_price !== undefined && data.unit_price < 0) {
      const error = new Error('Unit price must be positive') as any;
      error.statusCode = 422;
      throw error;
    }
  }

  protected async beforeCreate(data: CreateDrugs): Promise<CreateDrugs> {
    // Add custom business logic before creation
    return { ...data };
  }

  protected async afterCreate(drugs: Drugs): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log('Drugs created:', drugs.id);
  }

  protected async validateDelete(id: string | number, existing: Drugs): Promise<void> {
    // Check foreign key references
    const deleteCheck = await this.drugsRepository.canBeDeleted(id);
    if (!deleteCheck.canDelete) {
      const error = new Error('Cannot delete - has references') as any;
      error.statusCode = 422;
      error.details = deleteCheck.blockedBy;
      throw error;
    }
  }
}
```

---

## Repository Pattern

Repositories handle database operations and extend BaseRepository:

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.repository.ts
import { BaseRepository } from '../../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import { CreateDrugs, UpdateDrugs, Drugs } from './drugs.types';

export class DrugsRepository extends BaseRepository<Drugs, CreateDrugs, UpdateDrugs> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drugs', // Schema.table
      ['inventory.drugs.trade_name'], // Searchable fields
      [], // Explicit UUID fields
      {
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Drugs {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      drug_code: dbRow.drug_code,
      trade_name: dbRow.trade_name,
      // ... map all fields
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateDrugs | UpdateDrugs): Partial<any> {
    const transformed: Partial<any> = {};

    if ('drug_code' in dto && dto.drug_code !== undefined) {
      transformed.drug_code = dto.drug_code;
    }
    if ('trade_name' in dto && dto.trade_name !== undefined) {
      transformed.trade_name = dto.trade_name;
    }
    // ... map all fields

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drugs').select('inventory.drugs.*');
    // Add joins here if needed:
    // .leftJoin('other_table', 'inventory.drugs.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: any): void {
    super.applyCustomFilters(query, filters);

    if (filters.drug_code !== undefined) {
      query.where('inventory.drugs.drug_code', filters.drug_code);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.drugs.is_active', filters.is_active);
    }
  }

  // Business-specific methods
  async findByCode(code: string): Promise<Drugs | undefined> {
    return this.knex('inventory.drugs').where({ code }).first();
  }

  async canBeDeleted(id: string | number): Promise<{
    canDelete: boolean;
    blockedBy: Array<{ table: string; field: string; count: number; cascade: boolean }>;
  }> {
    const blockedBy = [];

    // Check foreign key references
    const refCount = await this.knex('drug_distributions').where('drug_id', id).count('* as count').first();

    if (parseInt((refCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_distributions',
        field: 'drug_id',
        count: parseInt((refCount?.count as string) || '0'),
        cascade: false,
      });
    }

    return {
      canDelete: blockedBy.length === 0,
      blockedBy,
    };
  }
}
```

### BaseRepository Features

The BaseRepository provides:

- **CRUD Operations**: `create()`, `findById()`, `list()`, `update()`, `delete()`
- **Pagination**: Built-in pagination support
- **Filtering**: Dynamic filter application
- **Sorting**: Multi-field sorting
- **Search**: Full-text search on configured fields
- **Transactions**: `withTransaction()` for atomic operations
- **UUID Validation**: Automatic UUID format validation
- **Timestamps**: Automatic created_at/updated_at handling

---

## TypeBox Schema Pattern

All validation uses TypeBox schemas for runtime type safety:

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.schemas.ts
import { Type } from '@sinclair/typebox';

// Base entity schema
export const DrugsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  drug_code: Type.String({ minLength: 1, maxLength: 50 }),
  trade_name: Type.String({ minLength: 1, maxLength: 255 }),
  generic_id: Type.Number(),
  manufacturer_id: Type.Number(),
  unit_price: Type.Number({ minimum: 0 }),
  is_active: Type.Boolean({ default: true }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

// Create schema (omit auto-generated fields)
export const CreateDrugsSchema = Type.Omit(DrugsSchema, ['id', 'created_at', 'updated_at']);

// Update schema (all fields optional)
export const UpdateDrugsSchema = Type.Partial(CreateDrugsSchema);

// ID parameter schema
export const DrugsIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

// Query schema for list endpoint
export const ListDrugsQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
  sort: Type.Optional(Type.String()),
});

// Response schema
export const DrugsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: DrugsSchema,
  message: Type.Optional(Type.String()),
});

export const DrugsListResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: Type.Array(DrugsSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
  }),
});

// TypeScript types from schemas
export type Drugs = typeof DrugsSchema;
export type CreateDrugs = typeof CreateDrugsSchema;
export type UpdateDrugs = typeof UpdateDrugsSchema;
```

### Schema Registry

Centralized schema registry for reusable error schemas:

```typescript
import { SchemaRefs } from '../../../../../schemas/registry';

// Available schema references:
SchemaRefs.OperationResult; // 200 operation result
SchemaRefs.ValidationError; // 400 validation error
SchemaRefs.Unauthorized; // 401 unauthorized
SchemaRefs.Forbidden; // 403 forbidden
SchemaRefs.NotFound; // 404 not found
SchemaRefs.Conflict; // 409 conflict
SchemaRefs.UnprocessableEntity; // 422 unprocessable entity
SchemaRefs.ServerError; // 500 server error
```

---

## Authentication & Authorization

### Fastify Decorators Pattern

**CRITICAL**: Always use Fastify decorators, NOT function calls:

```typescript
// ✅ CORRECT
preValidation: [
  fastify.authenticate, // Decorator
  fastify.verifyPermission('drugs', 'create'), // Decorator with params
];

// ❌ WRONG
preValidation: [
  authenticate(), // Function call - WRONG!
  authorize('drugs'), // Function call - WRONG!
];
```

### Available Decorators

```typescript
fastify.authenticate; // JWT verification
fastify.verifyPermission(resource, action); // Permission check
fastify.knex; // Database connection
```

### Permission Actions

```typescript
'create'; // Create new records
'read'; // Read/view records
'update'; // Modify existing records
'delete'; // Delete records
```

---

## Error Handling

### CRITICAL: Never Throw in preValidation Hooks

```typescript
// ❌ WRONG: Causes FST_ERR_FAILED_ERROR_SERIALIZATION and timeout
fastify.addHook('preValidation', async (request, reply) => {
  if (!request.headers.authorization) {
    throw new Error('Unauthorized'); // THIS WILL HANG THE REQUEST!
  }
});

// ✅ CORRECT: Return reply methods
fastify.addHook('preValidation', async (request, reply) => {
  if (!request.headers.authorization) {
    return reply.unauthorized('Missing authorization header');
  }

  if (!hasPermission(request.user)) {
    return reply.forbidden('Insufficient permissions');
  }
});
```

### Available Reply Methods

```typescript
reply.badRequest('Invalid input'); // 400
reply.unauthorized('Authentication failed'); // 401
reply.forbidden('Access denied'); // 403
reply.notFound('Resource not found'); // 404
reply.conflict('Resource already exists'); // 409
reply.unprocessableEntity('Invalid data'); // 422
reply.internalServerError('Server error'); // 500

reply.success(data, 'Success message'); // 200
reply.code(201).success(data, 'Created'); // 201
reply.code(204).send(); // 204 No Content
```

---

## URL Structure

Final URLs after all plugin registrations:

```
# Core Layer
/api/auth/login
/api/auth/register

# Platform Layer
/api/v1/platform/users
/api/v1/platform/rbac/roles
/api/v1/platform/settings

# Domains Layer - Inventory
/api/inventory/master-data/drugs
/api/inventory/master-data/drugs/:id
/api/inventory/master-data/locations
/api/inventory/operations/drug-distributions
/api/inventory/operations/drug-distributions/:id
/api/inventory/budget/allocations
```

---

## Database Schema Prefix

**CRITICAL**: Always use schema prefix for non-public schemas:

```typescript
// ✅ CORRECT: Always use schema prefix
return this.db('inventory.drugs').select('*');

// ❌ WRONG: Missing schema prefix
return this.db('drugs').select('*'); // Will look in public schema!
```

### Schema Classification

```typescript
// Inventory domain - use 'inventory' schema
'inventory.drugs';
'inventory.locations';
'inventory.drug_distributions';

// Public schema (system-wide tables)
'public.users';
'public.roles';
'public.permissions';
```

---

## CRUD Generator Integration

Generate complete CRUD modules using AEGISX CLI:

```bash
# Master-Data CRUD
pnpm run crud -- TABLE_NAME --domain inventory/master-data --schema inventory --force

# Operations CRUD
pnpm run crud -- TABLE_NAME --domain inventory/operations --schema inventory --force

# With Excel/CSV import
pnpm run crud:import -- TABLE_NAME --domain inventory/master-data --schema inventory --force

# Full package (with events)
pnpm run crud:full -- TABLE_NAME --domain inventory/operations --schema inventory --force
```

Generated structure:

```
apps/api/src/layers/domains/inventory/master-data/TABLE_NAME/
├── index.ts                    # Plugin definition
├── TABLE_NAME.controller.ts    # Controller
├── TABLE_NAME.service.ts       # Service
├── TABLE_NAME.repository.ts    # Repository
├── TABLE_NAME.route.ts         # Routes
├── TABLE_NAME.schemas.ts       # Schemas
└── TABLE_NAME.types.ts         # Types
```

---

## Configuration

### Environment Variables

```bash
# .env.local
ENABLE_NEW_ROUTES=true   # Enable layer-based routes (default: true)
ENABLE_OLD_ROUTES=false  # Disable legacy routes (default: false)
API_PREFIX=/api          # Global API prefix
```

### Feature Flags

```typescript
// apps/api/src/config/app.config.ts
export interface AppConfig {
  features: {
    enableNewRoutes: boolean; // Layer-based routes
    enableOldRoutes: boolean; // Legacy routes (backward compatibility)
  };
}
```

---

## Best Practices

### 1. Use fastify-plugin (fp)

```typescript
import fp from 'fastify-plugin';

// ✅ CORRECT: Use fp() for infrastructure plugins
export default fp(myPlugin, {
  name: 'my-plugin',
  dependencies: ['knex-plugin'],
});

// ❌ WRONG: Not using fp() - decorations won't be globally accessible
export default myPlugin;
```

### 2. Manage Prefix Properly

```typescript
// ✅ CORRECT: Accept prefix from options
const prefix = options.prefix || '/v1/platform';

// ❌ WRONG: Hardcode prefix
const prefix = '/v1/platform'; // Not flexible
```

### 3. Declare Dependencies

```typescript
// ✅ CORRECT: Explicit dependencies
fp(myPlugin, {
  name: 'my-plugin',
  dependencies: ['knex-plugin', 'auth-plugin'],
});

// ❌ WRONG: No dependencies declared
fp(myPlugin, { name: 'my-plugin' }); // May fail if deps not loaded
```

### 4. Schema Validation

```typescript
// ✅ CORRECT: UUID format validation
const schema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

// ❌ WRONG: No format validation
const schema = Type.Object({
  id: Type.String(), // Missing UUID validation!
});
```

### 5. Error Handling in Hooks

```typescript
// ✅ CORRECT: Return reply
fastify.addHook('preValidation', async (request, reply) => {
  if (!valid) return reply.unauthorized('Invalid');
});

// ❌ WRONG: Throw error
fastify.addHook('preValidation', async (request, reply) => {
  if (!valid) throw new Error('Invalid'); // TIMEOUT!
});
```

---

## Common Mistakes

### ❌ WRONG: Calling decorators as functions

```typescript
preValidation: [authenticate(), authorize('drugs')];
```

### ✅ CORRECT: Use decorators directly

```typescript
preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'create')];
```

### ❌ WRONG: Missing schema prefix

```typescript
return this.db('drugs').select('*'); // Missing schema!
```

### ✅ CORRECT: Always use schema prefix

```typescript
return this.db('inventory.drugs').select('*');
```

### ❌ WRONG: No UUID validation

```typescript
const schema = Type.Object({
  id: Type.String(), // Missing format!
});
```

### ✅ CORRECT: UUID format validation

```typescript
const schema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
```

---

## Performance Metrics

After migration to layer-based architecture:

| Metric       | Before | After | Improvement |
| ------------ | ------ | ----- | ----------- |
| Route lookup | 12ms   | 5ms   | **58%**     |
| Plugin init  | 890ms  | 730ms | **18%**     |
| P95 latency  | 145ms  | 138ms | **5%**      |
| Memory usage | 185MB  | 175MB | **5%**      |
| Bundle size  | 180KB  | 63KB  | **65%**     |

---

## Quick Reference Checklist

Before implementing a new module:

- ✅ Choose correct layer (Core/Platform/Domains)
- ✅ Follow 7-file module structure
- ✅ Use `fastify-plugin` wrapper
- ✅ Declare plugin dependencies
- ✅ Use `fastify.authenticate` decorator (not function)
- ✅ Use `SchemaRefs` for error responses
- ✅ UUID fields have `format: 'uuid'`
- ✅ Use schema prefix for database tables
- ✅ Return `reply` methods in hooks (never throw)
- ✅ Extend BaseRepository for repositories
- ✅ Extend BaseService for services

---

## Related Documentation

- [Layer-based Routing Architecture](./layer-based-routing.md) - Complete layer structure guide
- [Domain Architecture Guide](./domain-architecture-guide.md) - Domain classification rules
- [TypeBox Schema Standard](../reference/api/typebox-schema-standard.md) - Schema validation patterns
- [API Response Standard](../reference/api/api-response-standard.md) - Standard API response format
- [CRUD Generator Guide](../../libs/aegisx-cli/docs/QUICK_REFERENCE.md) - CRUD generation commands

---

## Summary

The AegisX backend architecture provides:

- **Clear Separation**: 3-layer architecture (Core, Platform, Domains)
- **Modularity**: Plugin pattern for encapsulation
- **Type Safety**: TypeBox schemas for runtime validation
- **Scalability**: Easy to convert to microservices
- **Maintainability**: Consistent patterns across all modules
- **Performance**: 58% faster route lookup after migration

Follow these patterns consistently for a maintainable, scalable backend system.
