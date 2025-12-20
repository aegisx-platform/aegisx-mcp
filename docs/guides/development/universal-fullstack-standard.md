---
title: 'Universal Full-Stack Standard'
description: 'Database-first development workflow for full-stack features'
category: guides
tags: [development, full-stack, workflow]
---

# Universal Full-Stack Development Standard

> **MANDATORY**: Standard workflow for all feature development - no exceptions

## Overview

This standard follows a **Database-First, Layer-Based** approach using the AegisX Platform's layered architecture. Every feature development MUST follow this workflow to ensure consistency, quality, and maintainability.

**Key Principles:**

- Database schema is the single source of truth
- Layer-based routing (Core, Platform, Domains)
- Plugin pattern for all modules
- TypeBox schemas for validation
- API-first development
- Test backend before frontend

---

## Phase 1: Database Schema Design

### 1.1 Determine Domain and Schema

**CRITICAL:** Determine correct domain placement and database schema FIRST.

```bash
# Use Domain Checker before creating any CRUD
bash /tmp/check_domain.sh {TABLE_NAME}
```

**Domain Classification:**

| Type                  | Location                            | Schema      | Example                                |
| --------------------- | ----------------------------------- | ----------- | -------------------------------------- |
| Platform/Shared       | `/v1/platform/{resource}`           | `public`    | users, roles, departments              |
| Inventory Master-Data | `/inventory/master-data/{resource}` | `inventory` | drugs, budgets, locations              |
| Inventory Operations  | `/inventory/operations/{resource}`  | `inventory` | budget_allocations, drug_distributions |
| Inventory Budget      | `/inventory/budget/{resource}`      | `inventory` | budget_requests, budget_plans          |

**References:**

- [Domain Architecture Guide](../../architecture/domain-architecture-guide.md)
- [Layer-Based Routing](../../architecture/layer-based-routing.md)
- [Inventory Domain Rules](.claude/rules/inventory-domain.md)
- [Budget Domain Rules](.claude/rules/budget-domain.md)

### 1.2 Create Migration

**ALWAYS use correct schema prefix for inventory tables.**

```bash
# Create migration
npx knex migrate:make create_{table_name}_table

# For domain-specific migrations (inventory)
npx knex migrate:make create_{table_name}_table --migrations-directory ./apps/api/src/database/migrations/inventory
```

**Migration Template:**

```typescript
// apps/api/src/database/migrations/{timestamp}_create_{table_name}_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use correct schema for inventory tables
  return knex.schema.withSchema('inventory').createTable('{table_name}', (table) => {
    // Primary key (use auto-increment INTEGER for inventory tables)
    table.increments('id').primary();

    // Required fields
    table.string('code', 50).notNullable().unique();
    table.string('name', 255).notNullable();
    table.text('description');

    // Foreign keys (ALWAYS use correct schema prefix)
    table.integer('category_id').unsigned().references('id').inTable('inventory.categories');
    table.integer('location_id').unsigned().references('id').inTable('inventory.locations');

    // Amounts (ALWAYS use DECIMAL for money)
    table.decimal('unit_price', 15, 2).defaultTo(0);
    table.decimal('total_amount', 15, 2).notNullable();

    // Status fields
    table.boolean('is_active').defaultTo(true);

    // Audit fields
    table.integer('created_by').unsigned();
    table.integer('updated_by').unsigned();
    table.timestamps(true, true);

    // Indexes
    table.index(['is_active']);
    table.index(['code']);
    table.index(['name']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema('inventory').dropTableIfExists('{table_name}');
}
```

**Critical Rules:**

- Use `inventory` schema for inventory tables
- Use `public` schema for platform tables
- Use `INTEGER` primary keys (not UUID) for inventory
- Use `DECIMAL(15, 2)` for money fields
- Always include audit fields (`created_by`, `updated_by`)
- Add indexes on foreign keys and frequently queried columns
- Use schema prefix in foreign key references: `inventory.{table}`

**Run Migration:**

```bash
# Main system migrations (public schema)
pnpm run db:migrate

# Inventory domain migrations
pnpm run db:migrate:inventory

# Check status
pnpm run db:status:inventory
```

**Verify Migration:**

```bash
# Check table exists
psql $DATABASE_URL -c "\dt inventory.*"

# Check table structure
psql $DATABASE_URL -c "\d+ inventory.{table_name}"

# Test insert
psql $DATABASE_URL -c "INSERT INTO inventory.{table_name} (code, name) VALUES ('TEST001', 'Test Item')"
```

---

## Phase 2: Backend Development

### 2.1 Choose Layer and Generate CRUD

**Determine layer placement:**

1. **Platform Layer** (`apps/api/src/layers/platform/`)
   - Shared across all domains
   - Examples: users, rbac, departments, settings
   - Prefix: `/api/v1/platform/{resource}`

2. **Domain Layer** (`apps/api/src/layers/domains/{domain}/`)
   - Business-specific features
   - Examples: inventory, admin
   - Prefix: `/api/{domain}/{section}/{resource}`

**Generate CRUD:**

```bash
# Platform Layer
pnpm run crud -- {table_name} --force

# Inventory Master-Data
pnpm run crud -- {table_name} --domain inventory/master-data --schema inventory --force

# Inventory Operations
pnpm run crud -- {table_name} --domain inventory/operations --schema inventory --force

# Inventory Budget
pnpm run crud -- {table_name} --domain inventory/budget --schema inventory --force

# With features
pnpm run crud:import -- {table_name} --domain inventory/master-data --schema inventory --force
pnpm run crud:events -- {table_name} --domain inventory/master-data --schema inventory --force
pnpm run crud:full -- {table_name} --domain inventory/master-data --schema inventory --force
```

**Generated Structure:**

```
apps/api/src/layers/domains/inventory/master-data/{module}/
├── {module}.controller.ts     # HTTP request handling
├── {module}.repository.ts     # Database operations
├── {module}.route.ts          # Route definitions
├── {module}.schemas.ts        # TypeBox schemas
├── {module}.service.ts        # Business logic
├── {module}.types.ts          # TypeScript types
└── index.ts                   # Plugin export
```

### 2.2 Plugin Pattern

**Module Plugin (index.ts):**

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/index.ts
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

**Section Aggregator Plugin (master-data/index.ts):**

```typescript
// apps/api/src/layers/domains/inventory/master-data/index.ts
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import drugsPlugin from './drugs';
import locationsPlugin from './locations';
import budgetsPlugin from './budgets';

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

### 2.3 TypeBox Schemas

**Schema Definition:**

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.schemas.ts
import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema, PaginatedResponseSchema } from '../../../../../schemas/base.schemas';

// Base Entity Schema
export const DrugsSchema = Type.Object({
  id: Type.Integer(),
  drug_code: Type.String({ minLength: 1, maxLength: 50 }),
  trade_name: Type.String({ minLength: 1, maxLength: 255 }),
  generic_id: Type.Integer(),
  manufacturer_id: Type.Integer(),
  unit_price: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
  created_at: Type.Optional(Type.String({ format: 'date-time' })),
  updated_at: Type.Optional(Type.String({ format: 'date-time' })),
});

// Create Schema (without auto-generated fields)
export const CreateDrugsSchema = Type.Object({
  drug_code: Type.String({ minLength: 1, maxLength: 50 }),
  trade_name: Type.String({ minLength: 1, maxLength: 255 }),
  generic_id: Type.Integer(),
  manufacturer_id: Type.Integer(),
  unit_price: Type.Optional(Type.Number({ minimum: 0 })),
  is_active: Type.Optional(Type.Boolean()),
});

// Update Schema (partial)
export const UpdateDrugsSchema = Type.Partial(CreateDrugsSchema);

// ID Parameter Schema
export const DrugsIdParamSchema = Type.Object({
  id: Type.Union([Type.String(), Type.Number()]),
});

// Query Schema
export const ListDrugsQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 1000, default: 20 })),
  sort: Type.Optional(Type.String()),
  search: Type.Optional(Type.String()),
  is_active: Type.Optional(Type.Boolean()),
});

// Response Schemas
export const DrugsResponseSchema = ApiSuccessResponseSchema(DrugsSchema);
export const DrugsListResponseSchema = PaginatedResponseSchema(DrugsSchema);

// Export types
export type Drugs = Static<typeof DrugsSchema>;
export type CreateDrugs = Static<typeof CreateDrugsSchema>;
export type UpdateDrugs = Static<typeof UpdateDrugsSchema>;
```

### 2.4 Routes Definition

**Route Pattern:**

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
import { CreateDrugsSchema, UpdateDrugsSchema, DrugsIdParamSchema, ListDrugsQuerySchema, DrugsResponseSchema, DrugsListResponseSchema } from './drugs.schemas';
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

  // List
  fastify.get('/', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'List all drugs with pagination',
      querystring: ListDrugsQuerySchema,
      response: {
        200: DrugsListResponseSchema,
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findMany.bind(controller),
  });

  // Get by ID
  fastify.get('/:id', {
    schema: {
      tags: ['Inventory: Drugs'],
      summary: 'Get drug by ID',
      params: DrugsIdParamSchema,
      response: {
        200: DrugsResponseSchema,
        401: SchemaRefs.Unauthorized,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findOne.bind(controller),
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
        400: SchemaRefs.ValidationError,
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
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
        401: SchemaRefs.Unauthorized,
        403: SchemaRefs.Forbidden,
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'delete')],
    handler: controller.delete.bind(controller),
  });
}
```

**Critical Rules:**

- Use `fastify.authenticate` decorator (NOT function call)
- Use `fastify.verifyPermission(resource, action)` for authorization
- Use `SchemaRefs` for error responses
- Bind controller methods: `controller.create.bind(controller)`
- Use descriptive tags: `['Inventory: Drugs']`

### 2.5 Repository Pattern

**Repository Implementation:**

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.repository.ts
import { Knex } from 'knex';
import { BaseRepository } from '../../../../core/database/base.repository';
import { Drugs, CreateDrugs, UpdateDrugs } from './drugs.types';

export class DrugsRepository extends BaseRepository<Drugs> {
  constructor(db: Knex) {
    super(db, 'inventory.drugs'); // Note: schema.table
  }

  // Custom methods
  async findByCode(code: string): Promise<Drugs | undefined> {
    return this.db('inventory.drugs').where({ drug_code: code }).first();
  }

  async findActive(): Promise<Drugs[]> {
    return this.db('inventory.drugs').where({ is_active: true }).orderBy('trade_name');
  }
}
```

**Critical Rules:**

- ALWAYS use schema prefix: `inventory.drugs` (not just `drugs`)
- Extend BaseRepository for type-safe operations
- UUID validation handled automatically by BaseRepository
- Use schema prefix in all query builders

### 2.6 Test Backend Endpoints

**MANDATORY before frontend development.**

```bash
# Start API server
pnpm run dev:api

# Test list endpoint
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq .

# Test create endpoint
curl -X POST "http://localhost:3383/api/inventory/master-data/drugs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drug_code": "TEST001",
    "trade_name": "Test Drug",
    "generic_id": 1,
    "manufacturer_id": 1
  }' \
  | jq .

# Test get by ID
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq .

# Test update
curl -X PUT "http://localhost:3383/api/inventory/master-data/drugs/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trade_name": "Updated Drug Name"
  }' \
  | jq .

# Test delete
curl -X DELETE "http://localhost:3383/api/inventory/master-data/drugs/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq .

# Test validation error (400)
curl -X POST "http://localhost:3383/api/inventory/master-data/drugs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' \
  | jq .

# Test unauthorized (401)
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs" \
  | jq .

# Test not found (404)
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs/999999" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq .
```

**Checklist:**

- All CRUD operations return expected status codes
- Validation errors return 400 with details
- Unauthorized returns 401
- Not found returns 404
- Success responses match schema
- No console errors in server logs

---

## Phase 3: Frontend Development

### 3.1 TypeScript Interfaces

**Create types matching backend schemas:**

```typescript
// apps/web/src/app/features/inventory/types/drugs.types.ts

export interface Drug {
  id: number;
  drug_code: string;
  trade_name: string;
  generic_id: number;
  manufacturer_id: number;
  unit_price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDrugRequest {
  drug_code: string;
  trade_name: string;
  generic_id: number;
  manufacturer_id: number;
  unit_price?: number;
  is_active?: boolean;
}

export interface UpdateDrugRequest {
  drug_code?: string;
  trade_name?: string;
  generic_id?: number;
  manufacturer_id?: number;
  unit_price?: number;
  is_active?: boolean;
}

export interface DrugResponse {
  success: boolean;
  data: Drug;
  message?: string;
}

export interface DrugListResponse {
  success: boolean;
  data: Drug[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3.2 Service with Signals

**Angular service using signals pattern:**

```typescript
// apps/web/src/app/features/inventory/services/drugs.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Drug, CreateDrugRequest, UpdateDrugRequest, DrugResponse, DrugListResponse } from '../types/drugs.types';

@Injectable({ providedIn: 'root' })
export class DrugsService {
  private readonly baseUrl = '/api/inventory/master-data/drugs';

  // Signals for state management
  private drugsSignal = signal<Drug[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  drugs = this.drugsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  activeDrugs = computed(() => this.drugsSignal().filter((d) => d.is_active));

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; limit?: number; search?: string; is_active?: boolean }): Observable<DrugListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.is_active !== undefined) httpParams = httpParams.set('is_active', params.is_active);

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<DrugListResponse>(this.baseUrl, { params: httpParams }).pipe(
      tap({
        next: (response) => {
          this.drugsSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(err.error?.message || 'Failed to load drugs');
          this.loadingSignal.set(false);
        },
      }),
    );
  }

  getById(id: number): Observable<DrugResponse> {
    return this.http.get<DrugResponse>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateDrugRequest): Observable<DrugResponse> {
    return this.http.post<DrugResponse>(this.baseUrl, data);
  }

  update(id: number, data: UpdateDrugRequest): Observable<DrugResponse> {
    return this.http.put<DrugResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
```

### 3.3 Standalone Components

**List Component with Signals:**

```typescript
// apps/web/src/app/features/inventory/components/drug-list/drug-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrugsService } from '../../services/drugs.service';
import { Drug } from '../../types/drugs.types';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drug-list.component.html',
})
export class DrugListComponent implements OnInit {
  private drugsService = inject(DrugsService);
  private router = inject(Router);

  // Local component state
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

    this.drugsService
      .list({
        page: this.pagination().page,
        limit: this.pagination().limit,
      })
      .subscribe({
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

  onEdit(drug: Drug) {
    this.router.navigate(['/inventory/drugs', drug.id, 'edit']);
  }

  onDelete(drug: Drug) {
    if (!confirm(`Delete drug "${drug.trade_name}"?`)) return;

    this.drugsService.delete(drug.id).subscribe({
      next: () => {
        this.loadDrugs(); // Reload list
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete drug');
      },
    });
  }
}
```

**Form Component with AegisX UI:**

```typescript
// apps/web/src/app/features/inventory/components/drug-form/drug-form.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DrugsService } from '../../services/drugs.service';

@Component({
  selector: 'app-drug-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drug-form.component.html',
})
export class DrugFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private drugsService = inject(DrugsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = signal(false);
  drugId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.drugId.set(Number(id));
      this.loadDrug(Number(id));
    }
  }

  initForm() {
    this.form = this.fb.group({
      drug_code: ['', [Validators.required, Validators.maxLength(50)]],
      trade_name: ['', [Validators.required, Validators.maxLength(255)]],
      generic_id: [null, [Validators.required]],
      manufacturer_id: [null, [Validators.required]],
      unit_price: [0, [Validators.min(0)]],
      is_active: [true],
    });
  }

  loadDrug(id: number) {
    this.loading.set(true);
    this.drugsService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load drug');
        this.loading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const operation = this.isEditMode() ? this.drugsService.update(this.drugId()!, this.form.value) : this.drugsService.create(this.form.value);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/inventory/drugs']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save drug');
        this.loading.set(false);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/inventory/drugs']);
  }
}
```

---

## Phase 4: Integration & Testing

### 4.1 Build Verification (MANDATORY)

```bash
# Build all projects
pnpm run build

# MUST pass before commit
```

**Checklist:**

- No TypeScript errors
- No circular dependencies
- All projects build successfully

### 4.2 End-to-End Testing

**Manual Test Scenarios:**

1. **Create**: Navigate to form, fill data, submit, verify in list
2. **Read**: Click item in list, verify details page
3. **Update**: Edit item, submit, verify changes in list
4. **Delete**: Delete item, confirm, verify removed from list
5. **Validation**: Try invalid data, verify error messages
6. **Pagination**: Create 25+ items, test page navigation
7. **Search**: Enter search term, verify filtered results

**Browser Console Check:**

- No red errors in Console tab
- All API calls successful in Network tab
- Proper request/response format
- Authorization headers present

---

## Phase 5: Pre-Commit Checklist

### 5.1 Quality Checks

```bash
# 1. Build check (MANDATORY)
pnpm run build

# 2. Type check
nx run-many --target=typecheck --all

# 3. Lint check
nx run-many --target=lint --all

# 4. Fix linting issues
nx run-many --target=lint --all --fix
```

### 5.2 Git Workflow

**Add Specific Files Only:**

```bash
# NEVER use git add -A or git add .
# ALWAYS add specific files

git add apps/api/src/layers/domains/inventory/master-data/drugs/
git add apps/web/src/app/features/inventory/components/drug-list/
git add apps/web/src/app/features/inventory/services/drugs.service.ts
git add apps/api/src/database/migrations/inventory/*_create_drugs_table.ts
```

**Check Staged Changes:**

```bash
git status
git diff --staged
```

**Commit with Proper Message:**

```bash
# Correct format: type(scope): subject
git commit -m "feat(inventory): add drug catalog CRUD

- Add migration for inventory.drugs table
- Implement CRUD endpoints with plugin pattern
- Create Angular service with signals
- Add list and form components
- Include TypeBox schemas for validation

IMPORTANT: Tested end-to-end, all operations working"
```

**Forbidden Patterns:**

- NO `git add -A` or `git add .`
- NO "Generated with Claude Code"
- NO "Co-Authored-By: Claude"
- NO "BREAKING CHANGE:" (triggers v2.x.x release)
- Use "IMPORTANT:", "MAJOR UPDATE:", or "MIGRATION:" instead

**Push to Branch:**

```bash
# Push to feature branch (NOT main)
git push origin feature/inventory-drug-catalog
```

---

## URL Structure Reference

### Platform Layer

```
/api/v1/platform/users              # User management
/api/v1/platform/rbac/roles         # RBAC roles
/api/v1/platform/departments        # Departments
/api/v1/platform/settings           # Settings
```

### Inventory Domain

```
# Master-Data (Configuration)
/api/inventory/master-data/drugs
/api/inventory/master-data/budgets
/api/inventory/master-data/locations

# Operations (Transactional)
/api/inventory/operations/drug-distributions
/api/inventory/operations/budget-allocations

# Budget (Workflow)
/api/inventory/budget/budget-requests
/api/inventory/budget/budget-plans
```

---

## Common Mistakes

### Wrong: Missing Schema Prefix

```typescript
// Don't do this
return this.db('drugs').select('*'); // Missing schema!
```

### Correct: Always Use Schema Prefix

```typescript
// Do this
return this.db('inventory.drugs').select('*');
```

### Wrong: Wrong Data Type for Money

```typescript
// Don't do this
table.float('unit_price'); // Precision issues!
table.integer('unit_price'); // Can't handle decimals!
```

### Correct: Use DECIMAL for Money

```typescript
// Do this
table.decimal('unit_price', 15, 2);
```

### Wrong: Function Call for Auth

```typescript
// Don't do this
preValidation: [
  authenticate(), // WRONG!
  authorize('drugs'), // WRONG!
];
```

### Correct: Use Fastify Decorators

```typescript
// Do this
preValidation: [
  fastify.authenticate, // Decorator
  fastify.verifyPermission('drugs', 'create'), // Permission check
];
```

### Wrong: Including /api Prefix in Service

```typescript
// Don't do this
private readonly baseUrl = '/api/inventory/master-data/drugs'; // Results in /api/api/...
```

### Correct: Let Interceptor Add /api

```typescript
// Do this
private readonly baseUrl = '/api/inventory/master-data/drugs'; // Correct full path
```

---

## Quick Reference

### CRUD Generation Commands

```bash
# Inventory Master-Data
pnpm run crud -- drugs --domain inventory/master-data --schema inventory --force

# Inventory Operations
pnpm run crud -- drug_distributions --domain inventory/operations --schema inventory --force

# Inventory Budget
pnpm run crud -- budget_requests --domain inventory/budget --schema inventory --force

# With features
pnpm run crud:import -- drugs --domain inventory/master-data --schema inventory --force
pnpm run crud:full -- drugs --domain inventory/master-data --schema inventory --force
```

### Testing Commands

```bash
# Backend
curl -X GET "http://localhost:3383/api/inventory/master-data/drugs" \
  -H "Authorization: Bearer TOKEN"

# Build
pnpm run build

# Database
pnpm run db:migrate:inventory
pnpm run db:status:inventory
psql $DATABASE_URL -c "\dt inventory.*"
```

### File Locations

```
Backend:
apps/api/src/layers/domains/inventory/master-data/drugs/
apps/api/src/layers/domains/inventory/operations/budget-allocations/
apps/api/src/database/migrations/inventory/

Frontend:
apps/web/src/app/features/inventory/components/
apps/web/src/app/features/inventory/services/
apps/web/src/app/features/inventory/types/
```

---

## Related Documentation

- [Layer-Based Routing Architecture](../../architecture/layer-based-routing.md)
- [Domain Architecture Guide](../../architecture/domain-architecture-guide.md)
- [Inventory Domain Rules](.claude/rules/inventory-domain.md)
- [Budget Domain Rules](.claude/rules/budget-domain.md)
- [API Calling Standard](./api-calling-standard.md)
- [Feature Development Standard](./feature-development-standard.md)
- [Git Workflow Rules](.claude/rules/git-workflow.md)
