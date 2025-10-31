# User Management - Developer Guide

> **Audience:** Developers implementing, extending, or maintaining this feature

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Tech Stack:** Fastify 4+, Angular 19+, PostgreSQL 15+, Redis

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Code Structure](#code-structure)
- [Development Setup](#development-setup)
- [Core Concepts](#core-concepts)
- [Implementation Guide](#implementation-guide)
- [Testing Guide](#testing-guide)
- [Best Practices](#best-practices)
- [Extending the Feature](#extending-the-feature)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Angular   │─────▶│   Fastify   │─────▶│  PostgreSQL  │
│  Frontend   │      │   Backend   │      │   Database   │
└─────────────┘      └─────────────┘      └──────────────┘
       │                     │
       │                     ▼
       │              ┌─────────────┐
       └─────────────▶│    Redis    │
                      │    Cache    │
                      └─────────────┘
```

### Key Components

**Backend:**
- **Controller:** Request handling and validation
- **Service:** Business logic and orchestration
- **Repository:** Data access layer
- **Schemas:** TypeBox validation schemas
- **Routes:** API endpoint definitions

**Frontend:**
- **Components:** UI components with Signals
- **Services:** API communication and state management
- **Dialogs:** CRUD operation dialogs
- **Routes:** Angular routing configuration

---

## 📁 Code Structure

### Backend Structure

```
apps/api/src/core/users/
├── controllers/
│   └── [feature].controller.ts        # Request handlers
├── services/
│   └── [feature].service.ts           # Business logic
├── repositories/
│   └── [feature].repository.ts        # Data access
├── routes/
│   └── index.ts                        # Route definitions
├── schemas/
│   └── [feature].schemas.ts           # TypeBox schemas
├── types/
│   └── [feature].types.ts             # TypeScript types
├── __tests__/
│   ├── [feature].controller.spec.ts
│   ├── [feature].service.spec.ts
│   └── [feature].repository.spec.ts
└── index.ts                            # Plugin export
```

### Frontend Structure

```
apps/web/src/app/features/users/
├── components/
│   ├── [feature]-list.component.ts       # List view
│   ├── [feature]-list.component.html
│   ├── [feature]-list.component.scss
│   ├── [feature]-create.dialog.ts        # Create dialog
│   ├── [feature]-edit.dialog.ts          # Edit dialog
│   ├── [feature]-view.dialog.ts          # View dialog
│   ├── [feature]-form.component.ts       # Shared form
│   └── [feature]-list-filters.component.ts
├── services/
│   └── [feature].service.ts              # API service
├── types/
│   └── [feature].types.ts                # TypeScript interfaces
└── [feature].routes.ts                   # Route config
```

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Setup environment
pnpm run setup

# Start development servers
pnpm run dev:api    # Backend
pnpm run dev:web    # Frontend
```

### Database Setup

```bash
# Create migration
pnpm run knex migrate:make create_[table_name]_table

# Run migrations
pnpm run db:migrate

# Create seed
pnpm run knex seed:make 003_[table_name]

# Run seeds
pnpm run db:seed
```

### Environment Variables

Required environment variables in `.env.local`:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=aegisx_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3333
JWT_SECRET=your-secret-key
```

---

## 💡 Core Concepts

### 1. TypeBox Schema Pattern

```typescript
// Define schema
export const CreateFeatureSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  isActive: Type.Boolean({ default: true }),
});

// Export type
export type CreateFeature = Static<typeof CreateFeatureSchema>;

// Use in route
{
  schema: {
    body: CreateFeatureSchema,
    response: {
      201: FeatureResponseSchema,
      400: SchemaRefs.ValidationError,
    },
  },
}
```

### 2. Repository Pattern

```typescript
export class FeatureRepository extends BaseRepository<
  Feature,
  CreateFeature,
  UpdateFeature
> {
  constructor(knex: Knex) {
    super(
      knex,
      'features',                    // Table name
      ['name', 'description'],       // Searchable fields
      ['id', 'user_id'],            // UUID fields for validation
    );
  }

  // Custom queries
  async findByStatus(status: string): Promise<Feature[]> {
    return this.knex(this.tableName)
      .where({ status })
      .select('*');
  }
}
```

### 3. Service Layer Pattern

```typescript
export class FeatureService {
  constructor(
    private repository: FeatureRepository,
    private cacheService: CacheService,
  ) {}

  async create(data: CreateFeature): Promise<Feature> {
    // 1. Validation
    this.validateData(data);

    // 2. Business logic
    const processed = this.processData(data);

    // 3. Database operation
    const feature = await this.repository.create(processed);

    // 4. Cache invalidation
    await this.cacheService.del('features:*');

    // 5. Return result
    return feature;
  }
}
```

### 4. Frontend Signal Pattern

```typescript
export class FeatureService {
  // Signals for reactive state
  private featuresSignal = signal<Feature[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Read-only computed signals
  features = this.featuresSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  async loadFeatures(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.httpClient.get<Feature[]>(this.baseUrl);
      if (response) {
        this.featuresSignal.set(response.data || []);
      }
    } catch (error) {
      this.errorSignal.set('Failed to load features');
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
```

---

## 🔨 Implementation Guide

### Step 1: Create Database Migration

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('features', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Data fields
    table.string('name', 255).notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);

    // Foreign keys
    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.index('user_id');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Unique constraints
    table.unique(['name', 'user_id']);
  });
}
```

### Step 2: Create TypeBox Schemas

```typescript
// Base schemas
export const FeatureSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  isActive: Type.Boolean(),
  userId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export const CreateFeatureSchema = Type.Omit(FeatureSchema, [
  'id',
  'createdAt',
  'updatedAt',
]);

export const UpdateFeatureSchema = Type.Partial(CreateFeatureSchema);
```

### Step 3: Implement Repository

```typescript
export class FeatureRepository extends BaseRepository<
  Feature,
  CreateFeature,
  UpdateFeature
> {
  constructor(knex: Knex) {
    super(knex, 'features', ['name', 'description'], ['id', 'user_id']);
  }
}
```

### Step 4: Implement Service

```typescript
export class FeatureService {
  constructor(private repository: FeatureRepository) {}

  async create(data: CreateFeature): Promise<Feature> {
    return this.repository.create(data);
  }

  async findById(id: string): Promise<Feature | null> {
    return this.repository.findById(id);
  }

  // Add more methods as needed
}
```

### Step 5: Implement Controller

```typescript
export class FeatureController {
  constructor(private service: FeatureService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateFeature;
    const feature = await this.service.create(data);
    return reply.code(201).success(feature);
  }

  // Add more handlers
}
```

### Step 6: Register Routes

```typescript
export async function featureRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const controller = new FeatureController(/* dependencies */);

  fastify.post('/', {
    schema: {
      tags: ['Features'],
      body: CreateFeatureSchema,
      response: {
        201: FeatureResponseSchema,
      },
    },
    preValidation: [
      fastify.authenticate,
      fastify.verifyPermission('features', 'create'),
    ],
    handler: controller.create.bind(controller),
  });
}
```

---

## 🧪 Testing Guide

### Unit Tests

```typescript
describe('FeatureService', () => {
  let service: FeatureService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = createMockRepository();
    service = new FeatureService(repository);
  });

  it('should create feature', async () => {
    const data: CreateFeature = {
      name: 'Test Feature',
      isActive: true,
    };

    const result = await service.create(data);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(data.name);
  });
});
```

### Integration Tests

```typescript
describe('Feature API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  it('POST /features - should create feature', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/features',
      headers: {
        authorization: `Bearer ${testToken}`,
      },
      payload: {
        name: 'Test Feature',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('id');
  });
});
```

---

## ✅ Best Practices

### Code Organization

- ✅ Follow single responsibility principle
- ✅ Use dependency injection
- ✅ Keep controllers thin
- ✅ Put business logic in services
- ✅ Use repositories for data access

### Error Handling

```typescript
// Controller level
try {
  const result = await this.service.doSomething();
  return reply.success(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return reply.code(400).error('Validation failed', error.details);
  }
  throw error; // Let error handler deal with it
}
```

### Security

- ✅ Always use `verifyPermission` for authorization
- ✅ Validate all inputs with TypeBox schemas
- ✅ Sanitize user inputs
- ✅ Use parameterized queries (Knex handles this)
- ✅ Don't expose sensitive data in responses

### Performance

- ✅ Use caching for frequently accessed data
- ✅ Add database indexes for common queries
- ✅ Use pagination for large datasets
- ✅ Minimize database round trips
- ✅ Use connection pooling

---

## 🔧 Extending the Feature

### Adding New Endpoint

1. Update schemas if needed
2. Add method to service
3. Add handler to controller
4. Register route
5. Add tests
6. Update documentation

### Adding Real-time Events

```typescript
// Backend - emit event
this.eventService
  .for('features', 'features')
  .emitCustom('created', feature, 'normal');

// Frontend - subscribe to events
this.wsService.subscribeToEvent('features', 'features', 'created')
  .pipe(takeUntil(this.destroy$))
  .subscribe((event) => {
    console.log('Feature created:', event.data);
    this.reloadTrigger.update(n => n + 1);
  });
```

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** Type errors in generated code
**Solution:** Ensure schemas and types are in sync, regenerate types if needed

**Problem:** Database query performance
**Solution:** Add indexes, check explain plan, use caching

**Problem:** Frontend state not updating
**Solution:** Verify signal updates, check reloadTrigger, ensure subscription active

---

## 📚 Additional Resources

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Architecture](./ARCHITECTURE.md) - System design details
- [User Guide](./USER_GUIDE.md) - End-user documentation
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

---

**Last Reviewed:** 2025-10-31
**Maintainer:** Development Team
