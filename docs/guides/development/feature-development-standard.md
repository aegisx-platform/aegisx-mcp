---
title: 'Feature Development Standard'
description: 'Standard workflow for developing new features in the AegisX Platform'
category: guides
tags: [development, workflow, standards]
---

# Feature Development Standard

> **MANDATORY STANDARD** - This standard MUST be followed for every feature development to ensure quality, maintainability, and architectural consistency.

## Overview

This guide reflects the **current layered architecture** with plugin-based routing, domain-driven design, and database-first development workflow.

**Key Architecture References:**

- [Layer-Based Routing](../../architecture/layer-based-routing.md) - 3-layer structure
- [Domain Architecture Guide](../../architecture/domain-architecture-guide.md) - Domain classification
- [Backend Architecture](../../architecture/backend-architecture.md) - Plugin patterns

---

## Feature Development Lifecycle

### Phase 1: Planning & Domain Classification

#### Step 1.1: Determine Layer & Domain Placement

**CRITICAL:** Every feature MUST be correctly classified before development.

**3-Layer Architecture:**

```
apps/api/src/layers/
├── core/           # Infrastructure (auth, audit, monitoring)
├── platform/       # Shared services (users, rbac, departments)
└── domains/        # Business domains (inventory, hr, etc.)
```

**Decision Matrix:**

| Question                           | Answer | Layer    | Example Path                |
| ---------------------------------- | ------ | -------- | --------------------------- |
| Is this infrastructure/auth?       | Yes    | Core     | `layers/core/auth/`         |
| Is this shared across all domains? | Yes    | Platform | `layers/platform/users/`    |
| Is this business-specific?         | Yes    | Domains  | `layers/domains/inventory/` |

**Domain Section Classification (for business domains):**

| Question                        | Answer | Section     | Example                                        |
| ------------------------------- | ------ | ----------- | ---------------------------------------------- |
| Is this lookup/reference data?  | Yes    | master-data | `drugs`, `locations`                           |
| Is this transactional data?     | Yes    | operations  | `drug_distributions`, `inventory_transactions` |
| Is this specific business area? | Yes    | Custom      | `procurement`, `budget`, `tmt`                 |

**Tools:**

```bash
# Use Domain Checker before generating CRUD
bash /tmp/check_domain.sh TABLE_NAME
```

**Example Classifications:**

```bash
# Platform Layer (shared services)
/api/v1/platform/users
/api/v1/platform/rbac/roles
/api/v1/platform/departments

# Inventory Domain - Master Data
/api/inventory/master-data/drugs
/api/inventory/master-data/budgets
/api/inventory/master-data/locations

# Inventory Domain - Operations
/api/inventory/operations/drug-distributions
/api/inventory/operations/budget-allocations
/api/inventory/operations/inventory-transactions
```

**Reference:** See `.claude/rules/inventory-domain.md` for complete examples

**Checklist:**

- [ ] Layer determined (core, platform, or domains)
- [ ] If domains: section identified (master-data, operations, etc.)
- [ ] URL pattern defined
- [ ] Database schema determined (public vs domain schema)
- [ ] Domain checker script executed

---

#### Step 1.2: Database Schema Design

**Database-first approach is MANDATORY.** The database schema drives the entire feature architecture.

**Schema Selection:**

- Platform layer: Use `public` schema
- Domain layer: Use domain-specific schema (e.g., `inventory`)

**Example Migration:**

```typescript
// apps/api/src/database/migrations/20250120100000_create_drugs.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use domain schema for domain tables
  return knex.schema.withSchema('inventory').createTable('drugs', (table) => {
    // UUID primary key with auto-generation
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys to other domain tables
    table.uuid('drug_generic_id').references('id').inTable('inventory.drug_generics');
    table.uuid('location_id').references('id').inTable('inventory.locations');

    // Business fields
    table.string('code', 50).notNullable().unique();
    table.string('name', 255).notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);

    // Audit fields
    table.uuid('created_by').references('id').inTable('public.users');
    table.uuid('updated_by').references('id').inTable('public.users');
    table.timestamps(true, true);

    // Indexes for performance
    table.index(['drug_generic_id']);
    table.index(['location_id']);
    table.index(['is_active']);
    table.index(['code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema('inventory').dropTableIfExists('drugs');
}
```

**Run Migration:**

```bash
# Main system migrations
pnpm run db:migrate

# Domain-specific migrations (if using domain-separated approach)
pnpm run db:migrate:inventory
```

**Verify:**

```bash
# Check table created
psql $DATABASE_URL -c "\d+ inventory.drugs"
```

**Checklist:**

- [ ] Correct schema selected (public vs domain)
- [ ] UUID primary key with `gen_random_uuid()`
- [ ] Foreign keys use full table names (`schema.table`)
- [ ] NOT NULL constraints on required fields
- [ ] Indexes on foreign keys and frequently queried columns
- [ ] Audit fields (created_by, updated_by, timestamps)
- [ ] Migration tested (up and down)

---

#### Step 1.3: API Contract Definition

Define API endpoints, schemas, and behavior BEFORE implementation.

**Create Contract Document:**

```bash
mkdir -p docs/features/inventory-drugs
touch docs/features/inventory-drugs/API_CONTRACTS.md
```

**Example Contract:**

````markdown
# Drugs API Contracts

## Base URL

`/api/inventory/master-data/drugs`

## Authentication

All endpoints require JWT authentication via `fastify.authenticate`

## Authorization

- `read`: All authenticated users
- `create`, `update`, `delete`: Require `drugs` resource permission

## Endpoints

### 1. List Drugs

**GET** `/api/inventory/master-data/drugs`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by code/name |
| is_active | boolean | Filter by active status |
| format | string | Response format: dropdown, minimal |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "string",
      "name": "string",
      "drug_generic_id": "uuid",
      "location_id": "uuid",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
````

### 2. Create Drug

**POST** `/api/inventory/master-data/drugs`

**Request Body:**

```json
{
  "code": "D001",
  "name": "Paracetamol 500mg",
  "drug_generic_id": "uuid",
  "location_id": "uuid",
  "is_active": true
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    /* drug object */
  }
}
```

**Error Responses:**

- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (permission denied)
- 409: Conflict (duplicate code)
- 500: Server error

````

**Checklist:**
- [ ] All CRUD endpoints documented
- [ ] Authentication requirements specified
- [ ] Authorization permissions defined
- [ ] Request schemas with validation rules
- [ ] Response schemas with examples
- [ ] Error responses documented

**Reference:** See `.claude/rules/api-endpoints.md`

---

### Phase 2: Backend Implementation (Plugin Pattern)

#### Step 2.1: Generate CRUD Scaffolding

Use the CRUD generator with correct domain placement.

**Commands:**

```bash
# Master-Data Module (lookup/reference data)
pnpm run crud -- drugs --domain inventory/master-data --schema inventory --force

# Operations Module (transactional data)
pnpm run crud -- drug_distributions --domain inventory/operations --schema inventory --force

# Platform Module (shared services)
pnpm run crud -- departments --domain platform --schema public --force
````

**Generated Structure:**

```
apps/api/src/layers/domains/inventory/master-data/drugs/
├── drugs.controller.ts    # HTTP request handling
├── drugs.repository.ts    # Database operations
├── drugs.route.ts         # Route definitions (NOT .routes.ts!)
├── drugs.schemas.ts       # TypeBox schemas
├── drugs.service.ts       # Business logic
├── drugs.types.ts         # TypeScript types
└── index.ts               # Plugin export
```

**File Naming Convention:**

- Use `{module}.route.ts` (singular, NOT `.routes.ts`)
- Use `{module}.controller.ts`
- Use `index.ts` as plugin export

**Checklist:**

- [ ] Files generated in correct layer/domain path
- [ ] File naming follows convention (`.route.ts` not `.routes.ts`)
- [ ] Schema parameter matches database schema
- [ ] All 7 files created

---

#### Step 2.2: Module Plugin Pattern

Every module MUST be a Fastify plugin with proper dependency injection.

**Example: `drugs/index.ts`**

```typescript
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
    // 1. Service instantiation (dependency injection pattern)
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
      fastify.log.info(`Drugs domain module registered successfully`);
    });
  },
  {
    name: 'drugs-domain-plugin',
    dependencies: ['knex-plugin'], // Ensure database is available
  },
);

// Re-exports for external consumers
export * from './drugs.schemas';
export * from './drugs.types';
export { DrugsRepository } from './drugs.repository';
export { DrugsService } from './drugs.service';
export { DrugsController } from './drugs.controller';
```

**Pattern Breakdown:**

1. **Dependency Injection**: Access `fastify.knex` from decorated instance
2. **Service Hierarchy**: Repository → Service → Controller
3. **Route Registration**: Use `fastify.register()` with controller
4. **Prefix Handling**: Accept `options.prefix` for flexibility
5. **Dependencies**: Declare plugin dependencies (`knex-plugin`)
6. **Lifecycle Hooks**: Use `onReady` for logging
7. **Re-exports**: Export types and services for external use

**Checklist:**

- [ ] Uses `fastify-plugin` (fp)
- [ ] Dependency injection via `fastify.knex`
- [ ] Services instantiated in correct order
- [ ] Routes registered with controller
- [ ] Prefix from options (not hardcoded)
- [ ] Plugin name and dependencies declared
- [ ] Re-exports for external consumers

---

#### Step 2.3: Route Definition Pattern

Routes are plain functions (NOT plugins) that accept controller as options.

**Example: `drugs/drugs.route.ts`**

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
import { CreateDrugsSchema, UpdateDrugsSchema, DrugsIdParamSchema, GetDrugsQuerySchema, ListDrugsQuerySchema, DrugsResponseSchema, DrugsListResponseSchema } from './drugs.schemas';
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
      summary: 'Create a new drug',
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
      summary: 'Get drug by ID',
      params: DrugsIdParamSchema,
      querystring: GetDrugsQuerySchema,
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
      querystring: ListDrugsQuerySchema,
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
      tags: ['Inventory: Drugs'],
      summary: 'Update drug',
      params: DrugsIdParamSchema,
      body: UpdateDrugsSchema,
      response: {
        200: DrugsResponseSchema,
        404: SchemaRefs.NotFound,
        409: SchemaRefs.Conflict,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'update')],
    handler: controller.update.bind(controller),
  });

  // Delete
  fastify.delete('/:id', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Delete drug',
      params: DrugsIdParamSchema,
      response: {
        200: SchemaRefs.OperationResult,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'delete')],
    handler: controller.delete.bind(controller),
  });
}
```

**Key Points:**

1. **Routes Function**: Plain async function, NOT fp() wrapper
2. **Options Interface**: Extends FastifyPluginOptions, includes controller
3. **SchemaRefs**: Use centralized error schemas
4. **Authentication**: `fastify.authenticate` decorator (NOT function call)
5. **Authorization**: `fastify.verifyPermission(resource, action)`
6. **Controller Binding**: `.bind(controller)` for correct `this` context
7. **Tags**: Consistent naming (e.g., "Inventory: Drugs")

**Checklist:**

- [ ] Plain function (NOT fp() wrapped)
- [ ] Controller from options
- [ ] All CRUD routes defined
- [ ] SchemaRefs for error responses
- [ ] `fastify.authenticate` (decorator, not call)
- [ ] `fastify.verifyPermission()` for auth
- [ ] Controller methods bound with `.bind()`
- [ ] Consistent tags for OpenAPI

**Reference:** See `.claude/rules/api-endpoints.md` for authentication patterns

---

#### Step 2.4: Domain Aggregator Plugin

Section-level plugin that aggregates all modules in a section.

**Example: `master-data/index.ts`**

```typescript
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import locationsPlugin from './locations';
import budgetsPlugin from './budgets';
import budgetTypesPlugin from './budgetTypes';
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
    // ... register other modules

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

**URL Structure After Registration:**

```
Domain Plugin (/inventory)
  └── Section Plugin (/inventory/master-data)
        ├── Module Plugin (/inventory/master-data/drugs)
        │     ├── GET  /api/inventory/master-data/drugs
        │     ├── POST /api/inventory/master-data/drugs
        │     ├── GET  /api/inventory/master-data/drugs/:id
        │     ├── PUT  /api/inventory/master-data/drugs/:id
        │     └── DELETE /api/inventory/master-data/drugs/:id
        └── Module Plugin (/inventory/master-data/locations)
              └── ... (same pattern)
```

**Checklist:**

- [ ] Section prefix from options
- [ ] All module plugins registered
- [ ] Module prefixes inherit from section prefix
- [ ] onReady hook logs loaded modules
- [ ] Plugin name and dependencies declared

---

#### Step 2.5: Repository Pattern

Use BaseRepository for standard CRUD with automatic UUID validation.

**Example: `drugs/drugs.repository.ts`**

```typescript
import { Knex } from 'knex';
import { BaseRepository } from '../../../../../core/database/base.repository';
import { Drugs, CreateDrugs, UpdateDrugs } from './drugs.types';

export class DrugsRepository extends BaseRepository<Drugs> {
  constructor(db: Knex) {
    // CRITICAL: Always use schema.table format
    super(db, 'inventory.drugs');
  }

  // Custom queries beyond CRUD
  async findByCode(code: string): Promise<Drugs | undefined> {
    return this.db('inventory.drugs').where({ code }).first();
  }

  async findActive(): Promise<Drugs[]> {
    return this.db('inventory.drugs').where({ is_active: true }).orderBy('name');
  }

  // Complex joins
  async findWithRelations(id: string): Promise<any> {
    return this.db('inventory.drugs').where('inventory.drugs.id', id).leftJoin('inventory.drug_generics', 'drugs.drug_generic_id', 'drug_generics.id').leftJoin('inventory.locations', 'drugs.location_id', 'locations.id').select('drugs.*', 'drug_generics.name as generic_name', 'locations.name as location_name').first();
  }
}
```

**CRITICAL Rules:**

1. Always use `schema.table` format: `inventory.drugs`
2. Extend `BaseRepository<EntityType>`
3. Pass correct schema.table to super()
4. Add custom methods for business logic
5. Use full table names in joins

**Checklist:**

- [ ] Extends BaseRepository
- [ ] Constructor calls super with schema.table
- [ ] Custom methods use schema.table format
- [ ] Complex queries properly typed
- [ ] Joins use full table names

---

#### Step 2.6: Schema Registry Pattern

Use centralized SchemaRefs for consistent error responses.

**Example: Using SchemaRefs**

```typescript
import { SchemaRefs } from '../../../../../schemas/registry';

// In route definition
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

**Available SchemaRefs:**

```typescript
SchemaRefs.ValidationError; // 400 - Invalid input
SchemaRefs.Unauthorized; // 401 - Missing/invalid token
SchemaRefs.Forbidden; // 403 - Insufficient permissions
SchemaRefs.NotFound; // 404 - Resource not found
SchemaRefs.Conflict; // 409 - Duplicate/conflict
SchemaRefs.UnprocessableEntity; // 422 - Business logic error
SchemaRefs.ServerError; // 500 - Internal error
SchemaRefs.OperationResult; // 200 - Success with message
```

**TypeBox Schema Standards:**

```typescript
import { Type } from '@sinclair/typebox';

// UUID validation REQUIRED
export const DrugsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  drug_generic_id: Type.String({ format: 'uuid' }),
  location_id: Type.String({ format: 'uuid' }),

  // String validation with limits
  code: Type.String({ minLength: 1, maxLength: 50 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),

  // Optional fields
  description: Type.Optional(Type.String()),

  // Boolean with default
  is_active: Type.Boolean({ default: true }),
});

// Create schema (omit id and timestamps)
export const CreateDrugsSchema = Type.Omit(DrugsSchema, ['id', 'created_at', 'updated_at']);

// Update schema (all fields optional)
export const UpdateDrugsSchema = Type.Partial(CreateDrugsSchema);
```

**Checklist:**

- [ ] All UUID fields have `format: 'uuid'`
- [ ] String fields have minLength and maxLength
- [ ] SchemaRefs used for all error responses
- [ ] Create/Update schemas derived from base schema
- [ ] Optional fields use Type.Optional()

---

#### Step 2.7: Testing Backend

Test all endpoints with curl BEFORE frontend development.

**Setup:**

```bash
# Start API server
pnpm run dev:api

# Get authentication token
TOKEN=$(curl -X POST http://localhost:3383/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')
```

**Test CRUD Operations:**

```bash
# List drugs
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Create drug
curl -X POST http://localhost:3383/api/inventory/master-data/drugs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "D001",
    "name": "Paracetamol 500mg",
    "drug_generic_id": "uuid-here",
    "location_id": "uuid-here",
    "is_active": true
  }' | jq .

# Get by ID
DRUG_ID="uuid-from-create"
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs/$DRUG_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Update
curl -X PUT "http://localhost:3383/api/inventory/master-data/drugs/$DRUG_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Paracetamol 500mg Updated"}' | jq .

# Delete
curl -X DELETE "http://localhost:3383/api/inventory/master-data/drugs/$DRUG_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Test Error Cases:**

```bash
# 401 - Unauthorized (no token)
curl -X GET http://localhost:3383/api/inventory/master-data/drugs | jq .

# 400 - Validation error
curl -X POST http://localhost:3383/api/inventory/master-data/drugs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' | jq .

# 404 - Not found
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Checklist:**

- [ ] All CRUD operations return correct status codes
- [ ] Response schemas match API contract
- [ ] Authentication returns 401 without token
- [ ] Authorization returns 403 without permission
- [ ] Validation errors return 400 with details
- [ ] Not found returns 404
- [ ] Duplicates return 409

---

### Phase 3: Frontend Implementation

Frontend development begins ONLY after backend is tested and working.

#### Step 3.1: Generate Frontend CRUD

```bash
# Generate frontend components
pnpm run crud -- drugs --target frontend --domain inventory/master-data --force
```

**Generated Structure:**

```
apps/web/src/app/features/inventory/
└── drugs/
    ├── drugs-list.component.ts
    ├── drugs-form.component.ts
    ├── drugs.service.ts
    └── drugs.types.ts
```

#### Step 3.2: Service Implementation

**Example: `drugs.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Drug, CreateDrug, UpdateDrug } from './drugs.types';

@Injectable({ providedIn: 'root' })
export class DrugsService {
  private http = inject(HttpClient);
  // CRITICAL: No /api prefix - interceptor adds it
  private readonly baseUrl = '/inventory/master-data/drugs';

  list(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateDrug): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  update(id: string, data: UpdateDrug): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
```

**CRITICAL: URL Pattern**

- Use relative path WITHOUT `/api` prefix
- Example: `/inventory/master-data/drugs` (NOT `/api/inventory/master-data/drugs`)
- BaseUrlInterceptor will add `/api` automatically

**Checklist:**

- [ ] Service uses inject() for HttpClient
- [ ] baseUrl WITHOUT /api prefix
- [ ] All CRUD methods implemented
- [ ] Query parameters properly constructed
- [ ] Return types match backend responses

**Reference:** See [API Calling Standard](./api-calling-standard.md)

---

#### Step 3.3: Component with Signals

Use Angular signals for reactive state management.

**Example: List Component**

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { DrugsService } from '../drugs.service';
import { Drug } from '../drugs.types';

@Component({
  selector: 'app-drugs-list',
  standalone: true,
  templateUrl: './drugs-list.component.html',
})
export class DrugsListComponent implements OnInit {
  private drugsService = inject(DrugsService);

  drugs = signal<Drug[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  pagination = signal({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  ngOnInit() {
    this.loadDrugs();
  }

  loadDrugs() {
    this.loading.set(true);
    this.error.set(null);

    this.drugsService.list(this.pagination()).subscribe({
      next: (response) => {
        this.drugs.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load drugs');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadDrugs();
  }

  onDelete(drug: Drug) {
    if (!confirm(`Delete ${drug.name}?`)) return;

    this.drugsService.delete(drug.id).subscribe({
      next: () => this.loadDrugs(),
      error: (err) => alert(err.error?.message || 'Delete failed'),
    });
  }
}
```

**Checklist:**

- [ ] Component uses signals for state
- [ ] Loading and error states handled
- [ ] Pagination implemented
- [ ] Error messages user-friendly
- [ ] Confirmation for destructive actions

---

### Phase 4: Integration & Testing

#### Step 4.1: Build Verification (MANDATORY)

**CRITICAL: MUST pass before any commit.**

```bash
# Build all projects
pnpm run build

# Expected: All successful, no errors
```

**If Build Fails:**

1. Read error messages carefully
2. Fix TypeScript errors
3. Run `pnpm run build` again
4. DO NOT commit until build passes

**Checklist:**

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No circular dependencies
- [ ] No schema validation errors

---

#### Step 4.2: Manual Testing

**Test Complete Workflows:**

1. **Create Workflow**
   - Navigate to feature page
   - Click "Create" button
   - Fill form with valid data
   - Submit
   - Verify: Item appears in list
   - Verify: Success message shown

2. **Edit Workflow**
   - Click edit on existing item
   - Modify fields
   - Submit
   - Verify: Changes reflected
   - Verify: Success message shown

3. **Delete Workflow**
   - Click delete on item
   - Confirm deletion
   - Verify: Item removed
   - Verify: Success message shown

4. **Validation**
   - Try to submit empty form
   - Verify: Validation errors shown
   - Try to create duplicate
   - Verify: Conflict error shown

5. **Pagination**
   - Create 25+ items
   - Navigate pages
   - Verify: Correct items shown
   - Verify: Page numbers accurate

**Browser Console Check:**

```bash
# Open Chrome DevTools (F12)
# Console tab:
- [ ] No red errors
- [ ] No unhandled rejections

# Network tab:
- [ ] All API calls return 200/201
- [ ] No 404 errors
- [ ] Correct request/response format
- [ ] Authorization headers present
```

**Checklist:**

- [ ] All CRUD workflows work
- [ ] Form validation works
- [ ] Error messages display
- [ ] Loading states work
- [ ] No console errors
- [ ] Responsive design tested

**Reference:** See [QA Checklist](./qa-checklist.md)

---

### Phase 5: Documentation & Git

#### Step 5.1: Update Documentation

Update API contract document with actual implementation details.

```bash
# Add implementation notes
docs/features/inventory-drugs/API_CONTRACTS.md
docs/features/inventory-drugs/IMPLEMENTATION.md
```

**Example Implementation Notes:**

```markdown
# Implementation Notes

## Database

- Table: `inventory.drugs`
- Migration: `20250120100000_create_drugs.ts`
- Schema: inventory (domain-specific)

## Backend

- Layer: Domains
- Domain: inventory
- Section: master-data
- Path: `layers/domains/inventory/master-data/drugs/`
- Plugin: `drugs-domain-plugin`
- Routes: `/api/inventory/master-data/drugs`

## Frontend

- Path: `apps/web/src/app/features/inventory/drugs/`
- Service: `DrugsService`
- Components: List, Form

## Testing

- Backend: curl scripts in Phase 2.7
- Frontend: Manual scenarios in Phase 4.2
```

**Checklist:**

- [ ] API contracts updated
- [ ] Implementation details documented
- [ ] File paths recorded
- [ ] Testing approach documented

---

#### Step 5.2: Git Commit

**Follow git rules from CLAUDE.md and .claude/rules/git-workflow.md**

```bash
# MANDATORY: Build MUST pass first
pnpm run build

# Check what changed
git status

# Add SPECIFIC files only (NEVER git add -A)
git add apps/api/src/layers/domains/inventory/master-data/drugs/
git add apps/web/src/app/features/inventory/drugs/
git add apps/api/src/database/migrations/20250120100000_create_drugs.ts
git add docs/features/inventory-drugs/

# Review staged changes
git diff --staged

# Commit with proper message
# NO "Generated with Claude Code"
# NO "BREAKING CHANGE:"
git commit -m "feat(inventory): add drugs master data CRUD

- Add drugs table migration in inventory schema
- Implement plugin-based backend module
- Use SchemaRefs for error responses
- Add Angular service and components
- Include API documentation

IMPORTANT: Tested end-to-end, all operations working"

# Verify commit
git log -1 --stat

# Push to feature branch
git push origin feature/inventory-drugs
```

**CRITICAL Git Rules:**

- ✅ Run `pnpm run build` BEFORE commit
- ✅ Add specific files only (NEVER `git add -A`)
- ✅ Write descriptive commit message
- ❌ NO "Generated with Claude Code" or "Co-Authored-By: Claude"
- ❌ NO "BREAKING CHANGE:" (triggers v2.x.x)
- ✅ Use `IMPORTANT:`, `MIGRATION:` instead

**Checklist:**

- [ ] Build passes
- [ ] Only relevant files staged
- [ ] Commit message follows convention
- [ ] No forbidden phrases
- [ ] Pushed to feature branch (not main)

---

## Common Patterns & Best Practices

### Database-First Workflow

**Why Database-First?**

- Database schema is single source of truth
- API contracts derive from schema
- Frontend types mirror backend
- Prevents schema drift

**Workflow:**

1. Design schema → 2. Run migration → 3. Define API contracts → 4. Implement backend → 5. Test API → 6. Implement frontend

### Plugin Pattern Hierarchy

```
Domain Plugin (inventory)
  └── Section Plugin (master-data)
        └── Module Plugin (drugs)
              └── Routes Function (drugsRoutes)
                    └── Controller Methods
```

**Key Points:**

- Domain/Section plugins use `fp()`
- Routes are plain functions (NOT fp() wrapped)
- Controller passed via options
- Prefix cascades down hierarchy

### Authentication & Authorization

```typescript
// CORRECT: Use decorators
preValidation: [
  fastify.authenticate, // Decorator
  fastify.verifyPermission('drugs', 'create'), // Permission check
];

// WRONG: Don't call as functions
preValidation: [
  authenticate(), // WRONG!
  authorize('drugs'), // WRONG!
];
```

### Repository Best Practices

```typescript
// CORRECT: Always use schema.table
constructor(db: Knex) {
  super(db, 'inventory.drugs'); // schema.table format
}

// CORRECT: Custom queries with schema prefix
async findByCode(code: string) {
  return this.db('inventory.drugs') // Full table name
    .where({ code })
    .first();
}

// WRONG: Missing schema
constructor(db: Knex) {
  super(db, 'drugs'); // Missing schema!
}
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Wrong Domain Placement

**Problem:** Putting shared services in domain layer or vice versa
**Impact:** 404 errors, wrong URL structure
**Solution:** Use Domain Checker script, follow decision matrix

### Pitfall 2: Missing Schema Prefix

**Problem:** Using `drugs` instead of `inventory.drugs`
**Impact:** Database queries fail
**Solution:** Always use `schema.table` format

### Pitfall 3: Calling Decorators as Functions

**Problem:** `authenticate()` instead of `fastify.authenticate`
**Impact:** Authentication doesn't work
**Solution:** Use decorators directly (no parentheses)

### Pitfall 4: Double /api Prefix

**Problem:** Frontend service uses `/api/inventory/...`
**Impact:** URLs become `/api/api/inventory/...`
**Solution:** Use relative URLs without `/api` (interceptor adds it)

### Pitfall 5: Not Testing Backend First

**Problem:** Implementing frontend before backend is tested
**Impact:** Integration issues, wasted time
**Solution:** Test all endpoints with curl before frontend

### Pitfall 6: Committing Without Build

**Problem:** Pushing code that doesn't build
**Impact:** CI/CD failures, broken builds
**Solution:** Run `pnpm run build` before EVERY commit

### Pitfall 7: Wrong File Naming

**Problem:** Using `.routes.ts` instead of `.route.ts`
**Impact:** Inconsistent naming, harder to find files
**Solution:** Follow convention: `{module}.route.ts` (singular)

---

## Quick Reference Checklists

### Pre-Development Checklist

- [ ] Layer determined (core, platform, domains)
- [ ] Domain/section classified
- [ ] Database schema designed
- [ ] Migration created and tested
- [ ] API contracts documented
- [ ] URL pattern defined

### Backend Implementation Checklist

- [ ] CRUD generated with correct domain
- [ ] Module plugin uses fp()
- [ ] Routes are plain functions
- [ ] Repository uses schema.table format
- [ ] SchemaRefs for error responses
- [ ] Authentication decorators used
- [ ] Authorization permissions set
- [ ] Tested with curl scripts

### Frontend Implementation Checklist

- [ ] Service uses inject()
- [ ] baseUrl WITHOUT /api prefix
- [ ] Components use signals
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Form validation matches backend

### Integration Testing Checklist

- [ ] `pnpm run build` passes
- [ ] All CRUD workflows work
- [ ] Form validation works
- [ ] Error messages display
- [ ] No console errors
- [ ] Responsive design tested

### Git Commit Checklist

- [ ] Build passes
- [ ] Specific files staged (no `git add -A`)
- [ ] Commit message follows convention
- [ ] NO "Generated with Claude Code"
- [ ] NO "BREAKING CHANGE:"
- [ ] Pushed to feature branch

---

## Architecture References

**Must-read before development:**

- [Layer-Based Routing](../../architecture/layer-based-routing.md)
- [Domain Architecture Guide](../../architecture/domain-architecture-guide.md)
- [Backend Architecture](../../architecture/backend-architecture.md)

**Pattern references:**

- `.claude/rules/inventory-domain.md` - Complete plugin examples
- `.claude/rules/api-endpoints.md` - Authentication patterns
- `.claude/rules/git-workflow.md` - Git commit rules

**Standards:**

- [API Calling Standard](./api-calling-standard.md)
- [API Response Standard](../../reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../reference/api/typebox-schema-standard.md)

---

This standard ensures consistent, maintainable, and architecturally-sound feature development across the entire platform.
