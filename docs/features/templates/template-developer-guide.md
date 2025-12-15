---
title: '[Feature Name] Developer Guide'
description: 'Implementation guide for developers working with [Feature Name]'
category: features
tags: [development, guide, implementation]
order: 4
---

# [Feature Name] Developer Guide

Complete implementation guide for developers working with the [Feature Name] feature.

## 🎯 Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 20+ installed
- [ ] PostgreSQL 15+ running
- [ ] Project dependencies installed (`pnpm install`)
- [ ] Database migrated (`pnpm run db:migrate`)
- [ ] Familiarity with [Architecture](./architecture.md)

## 🚀 Getting Started

### 1. Backend Setup

#### Generate CRUD Scaffolding (if applicable)

```bash
# Generate basic CRUD
pnpm run crud -- feature_items --force

# Or with additional features
pnpm run crud:full -- feature_items --force
```

#### Manual Setup

```typescript
// apps/api/src/layers/features/feature/feature.plugin.ts
import { FastifyPluginAsync } from 'fastify';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

export const FeaturePlugin: FastifyPluginAsync = async (fastify) => {
  const service = new FeatureService(fastify.db);
  const controller = new FeatureController(service);

  // Register routes
  fastify.get('/feature', controller.list.bind(controller));
  fastify.post('/feature', controller.create.bind(controller));
  fastify.get('/feature/:id', controller.getById.bind(controller));
  fastify.put('/feature/:id', controller.update.bind(controller));
  fastify.delete('/feature/:id', controller.delete.bind(controller));
};
```

### 2. Frontend Setup

#### Generate Component Scaffolding

```bash
# Using Angular CLI
ng generate component features/feature-list --standalone
ng generate service features/feature
```

#### Create Feature Module

```typescript
// apps/admin/src/app/features/feature/feature.routes.ts
import { Routes } from '@angular/router';

export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature-list/feature-list.component').then((m) => m.FeatureListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./feature-detail/feature-detail.component').then((m) => m.FeatureDetailComponent),
  },
];
```

## 💻 Implementation Guide

### Step 1: Define Database Schema

```typescript
// apps/api/src/db/schema/feature.schema.ts
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const featuresTable = pgTable('features', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Feature = typeof featuresTable.$inferSelect;
export type NewFeature = typeof featuresTable.$inferInsert;
```

### Step 2: Create Migration

```bash
pnpm run db:generate
# Edit the generated migration if needed
pnpm run db:migrate
```

### Step 3: Implement Repository

```typescript
// apps/api/src/layers/features/feature/feature.repository.ts
import { BaseRepository } from '@/core/repository/base.repository';
import { Feature, NewFeature } from '@/db/schema';

export class FeatureRepository extends BaseRepository<Feature, NewFeature> {
  constructor(db: Database) {
    super(db, 'features');
  }

  async findByName(name: string): Promise<Feature | null> {
    return this.db.select().from(this.table).where(eq(this.table.name, name)).get();
  }
}
```

### Step 4: Implement Service Layer

```typescript
// apps/api/src/layers/features/feature/feature.service.ts
import { FeatureRepository } from './feature.repository';

export class FeatureService {
  constructor(private repo: FeatureRepository) {}

  async create(data: NewFeature): Promise<Feature> {
    // Business logic validation
    if (!data.name) {
      throw new Error('Name is required');
    }

    // Check for duplicates
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new Error('Feature with this name already exists');
    }

    return this.repo.create(data);
  }

  async findAll(filters?: FilterOptions): Promise<Feature[]> {
    return this.repo.findMany(filters);
  }
}
```

### Step 5: Implement Controller

```typescript
// apps/api/src/layers/features/feature/feature.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from '@/core/controller/base.controller';

export class FeatureController extends BaseController {
  constructor(private service: FeatureService) {
    super();
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body;
      const result = await this.service.create(data);
      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }
}
```

### Step 6: Add Type Safety with TypeBox

```typescript
// apps/api/src/layers/features/feature/feature.schemas.ts
import { Type } from '@sinclair/typebox';

export const CreateFeatureSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String({ maxLength: 1000 })),
});

export const UpdateFeatureSchema = Type.Partial(CreateFeatureSchema);

export const FeatureParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
```

### Step 7: Implement Frontend Service

```typescript
// apps/admin/src/app/features/feature/feature.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Feature {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FeatureService {
  private http = inject(HttpClient);
  private apiUrl = '/api/feature';

  getAll() {
    return this.http.get<ApiResponse<Feature[]>>(this.apiUrl);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Feature>>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Feature>) {
    return this.http.post<ApiResponse<Feature>>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Feature>) {
    return this.http.put<ApiResponse<Feature>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
```

### Step 8: Implement Frontend Component

```typescript
// apps/admin/src/app/features/feature/feature-list/feature-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { FeatureService, Feature } from '../feature.service';

@Component({
  selector: 'app-feature-list',
  standalone: true,
  template: `
    <div class="p-4">
      <h1>Features</h1>

      @if (loading()) {
        <ax-spinner />
      } @else if (error()) {
        <ax-alert type="error">{{ error() }}</ax-alert>
      } @else {
        <ax-table [data]="features()" [columns]="columns" />
      }
    </div>
  `,
})
export class FeatureListComponent {
  private featureService = inject(FeatureService);

  features = signal<Feature[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadFeatures();
  }

  private loadFeatures() {
    this.featureService.getAll().subscribe({
      next: (response) => {
        this.features.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
// feature.service.spec.ts
describe('FeatureService', () => {
  let service: FeatureService;
  let mockRepo: jest.Mocked<FeatureRepository>;

  beforeEach(() => {
    mockRepo = createMock<FeatureRepository>();
    service = new FeatureService(mockRepo);
  });

  it('should create a feature', async () => {
    const data = { name: 'Test Feature' };
    mockRepo.create.mockResolvedValue({ id: '123', ...data });

    const result = await service.create(data);

    expect(result.name).toBe('Test Feature');
    expect(mockRepo.create).toHaveBeenCalledWith(data);
  });
});
```

### Integration Tests

```typescript
// feature.api.spec.ts
describe('Feature API', () => {
  it('POST /api/feature should create feature', async () => {
    const response = await request(app.server).post('/api/feature').send({ name: 'Test Feature' }).expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Feature');
  });
});
```

## 🔧 Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Implement backend**: Schema → Repository → Service → Controller
3. **Test backend**: Unit tests → Integration tests
4. **Implement frontend**: Service → Component → Template
5. **Test frontend**: Unit tests → E2E tests
6. **Code review**: Create PR and address feedback
7. **Deploy**: Merge to develop → staging → production

## 🐛 Debugging Tips

### Backend Debugging

```typescript
// Add debug logging
fastify.log.debug('Feature created', { featureId: result.id });

// Use Fastify logger
fastify.log.info({ feature }, 'Creating feature');
```

### Frontend Debugging

```typescript
// Use Angular DevTools
// Chrome extension for component inspection

// Console logging with signals
effect(() => {
  console.log('Features updated:', this.features());
});
```

## 🔗 Related Documentation

- [Feature Overview](./README.md)
- [API Reference](./api-reference.md)
- [Architecture](./architecture.md)
- [Feature Development Standard](../../guides/development/feature-development-standard.md)
- [Testing Strategy](../../guides/testing/testing-strategy.md)

---

Need help? Check the [Troubleshooting Guide](./troubleshooting.md).
