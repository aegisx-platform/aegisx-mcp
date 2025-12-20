/**
 * AUTO-GENERATED FILE
 * Generated at: 2025-12-19T17:32:55.286Z
 * Generator: patterns-generator@1.0.0
 * Source files:
 *   - libs/aegisx-mcp/src/data/patterns.ts
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next sync
 */

 
 
 

/**
 * AegisX Development Patterns
 * Best practices and code patterns for development
 */

export interface CodePattern {
  name: string;
  category: string;
  description: string;
  code: string;
  language: string;
  notes?: string[];
  relatedPatterns?: string[];
}

export const patterns: CodePattern[] = [
  {
    name: 'TypeBox Schema Definition',
    category: 'backend',
    description: 'Define TypeBox schemas for request/response validation',
    language: 'typescript',
    code: `import { Type, Static } from '@sinclair/typebox';

// Request schemas

export const CreateProductSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  price: Type.Number({ minimum: 0 }),
  description: Type.Optional(Type.String()),
  categoryId: Type.String({ format: 'uuid' }),
  isActive: Type.Optional(Type.Boolean({ default: true })),
});

export const UpdateProductSchema = Type.Partial(CreateProductSchema);

export const ProductIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

// Response schema

export const ProductResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  price: Type.Number(),
  description: Type.Union([Type.String(), Type.Null()]),
  categoryId: Type.String({ format: 'uuid' }),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// TypeScript types

export type CreateProduct = Static<typeof CreateProductSchema>;

export type UpdateProduct = Static<typeof UpdateProductSchema>;

export type ProductIdParam = Static<typeof ProductIdParamSchema>;

export type ProductResponse = Static<typeof ProductResponseSchema>;`,
    notes: [
      'Always export both Schema and Static type',
      'Use format: uuid for ID fields',
      'Use Type.Optional for nullable fields',
      'Use Type.Partial for update schemas',
    ],
    relatedPatterns: ['Fastify Route Definition', 'Controller Type Safety'],
  },
  {
    name: 'Fastify Route Definition',
    category: 'backend',
    description: 'Define type-safe Fastify routes with schemas',
    language: 'typescript',
    code: `import { FastifyPluginAsync } from 'fastify';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductIdParamSchema,
  ProductResponseSchema,
} from './products.schemas';
import { ProductsController } from './products.controller';

export const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new ProductsController(fastify);

  // GET /products - List all
  fastify.get('/', {
    schema: {
      querystring: PaginationQuerySchema,
      response: {
        200: PaginatedResponseSchema(ProductResponseSchema),
      },
    },
    preValidation: [fastify.verifyJWT],
  }, controller.findAll);

  // GET /products/:id - Get one
  fastify.get('/:id', {
    schema: {
      params: ProductIdParamSchema,
      response: {
        200: ProductResponseSchema,
      },
    },
    preValidation: [fastify.verifyJWT],
  }, controller.findOne);

  // POST /products - Create
  fastify.post('/', {
    schema: {
      body: CreateProductSchema,
      response: {
        201: ProductResponseSchema,
      },
    },
    preValidation: [fastify.verifyJWT, fastify.verifyRole(['admin', 'editor'])],
  }, controller.create);

  // PATCH /products/:id - Update
  fastify.patch('/:id', {
    schema: {
      params: ProductIdParamSchema,
      body: UpdateProductSchema,
      response: {
        200: ProductResponseSchema,
      },
    },
    preValidation: [fastify.verifyJWT, fastify.verifyRole(['admin', 'editor'])],
  }, controller.update);

  // DELETE /products/:id - Delete
  fastify.delete('/:id', {
    schema: {
      params: ProductIdParamSchema,
    },
    preValidation: [fastify.verifyJWT, fastify.verifyRole(['admin'])],
  }, controller.delete);
};`,
    notes: [
      'Always define schema for request and response',
      'Use preValidation for auth middleware',
      'Return reply directly in middleware (not throw)',
    ],
    relatedPatterns: ['TypeBox Schema Definition', 'Auth Middleware Pattern'],
  },
  {
    name: 'Auth Middleware Pattern',
    category: 'backend',
    description: 'Correct auth middleware using reply (not throw)',
    language: 'typescript',
    code: `// ❌ WRONG: Throwing errors causes timeouts
fastify.decorate('verifyRole', function (allowedRoles: string[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply) {
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Error('INSUFFICIENT_PERMISSIONS'); // ❌ Request hangs!
    }
  };
});

// ✅ CORRECT: Return response directly
fastify.decorate('verifyRole', function (allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;

    if (!user) {
      return reply.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.forbidden('Insufficient permissions');
    }
  };
});

// ✅ CORRECT: JWT verification
fastify.decorate('verifyJWT', async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.unauthorized('Invalid or expired token');
  }
});`,
    notes: [
      'NEVER throw errors in preValidation hooks',
      'ALWAYS return reply.unauthorized() or reply.forbidden()',
      'Include reply parameter (not _reply)',
      'Throwing errors causes request timeouts',
    ],
    relatedPatterns: ['Fastify Route Definition'],
  },
  {
    name: 'Repository with UUID Validation',
    category: 'backend',
    description: 'BaseRepository pattern with automatic UUID validation',
    language: 'typescript',
    code: `import { BaseRepository, UUIDValidationStrategy } from '@aegisx/core';
import { Knex } from 'knex';
import { Product, CreateProduct, UpdateProduct } from './products.types';

export class ProductsRepository extends BaseRepository<Product, CreateProduct, UpdateProduct> {
  constructor(knex: Knex) {
    super(
      knex,
      'products',           // table name
      ['name', 'description'], // searchable fields
      ['id', 'category_id'],   // UUID fields (auto-validated)
    );

    // Optional: Configure validation strategy
    this.setUUIDValidationConfig({
      strategy: UUIDValidationStrategy.STRICT, // Throw 400 on invalid UUID
      allowAnyVersion: true,
      logInvalidAttempts: true,
    });
  }

  // Custom methods
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.db('products')
      .where({ category_id: categoryId, deleted_at: null })
      .orderBy('name');
  }

  async findActive(): Promise<Product[]> {
    return this.db('products')
      .where({ is_active: true, deleted_at: null });
  }
}`,
    notes: [
      'UUID fields are auto-detected by naming pattern (*_id, id, *uuid*)',
      'STRICT strategy returns 400 for invalid UUIDs',
      'GRACEFUL strategy filters out invalid UUIDs',
      'Prevents PostgreSQL casting errors',
    ],
    relatedPatterns: ['Service Layer Pattern'],
  },
  {
    name: 'Service Layer Pattern',
    category: 'backend',
    description: 'Service layer with repository integration',
    language: 'typescript',
    code: `import { ProductsRepository } from './products.repository';
import { CreateProduct, UpdateProduct, Product } from './products.types';
import { PaginationQuery, PaginatedResponse } from '@aegisx/core';

export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  async findAll(query: PaginationQuery): Promise<PaginatedResponse<Product>> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async create(data: CreateProduct, userId: string): Promise<Product> {
    return this.repository.create({
      ...data,
      created_by: userId,
    });
  }

  async update(id: string, data: UpdateProduct, userId: string): Promise<Product | null> {
    return this.repository.update(id, {
      ...data,
      updated_by: userId,
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }

  // Business logic methods
  async activateProduct(id: string): Promise<Product | null> {
    return this.repository.update(id, { is_active: true });
  }

  async deactivateProduct(id: string): Promise<Product | null> {
    return this.repository.update(id, { is_active: false });
  }
}`,
    notes: [
      'Service handles business logic',
      'Repository handles data access',
      'Use dependency injection',
      'Add userId for audit fields',
    ],
    relatedPatterns: ['Repository with UUID Validation', 'Controller Pattern'],
  },
  {
    name: 'Angular Signal-based Component',
    category: 'frontend',
    description: 'Modern Angular component using Signals',
    language: 'typescript',
    code: `import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductsService } from '../products.service';
import { Product } from '../products.types';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    @if (loading()) {
      <ax-skeleton type="table" [lines]="5"></ax-skeleton>
    } @else {
      <div class="grid gap-4">
        @for (product of filteredProducts(); track product.id) {
          <ax-card [title]="product.name">
            <p>{{ product.description }}</p>
            <ax-badge [color]="product.isActive ? 'success' : 'error'">
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </ax-badge>
          </ax-card>
        } @empty {
          <p>No products found</p>
        }
      </div>
    }
  \`,
})

export class ProductsListComponent {
  private productsService = inject(ProductsService);

  // State signals
  loading = signal(true);
  searchQuery = signal('');

  // Data from service (converted to signal)
  products = toSignal(this.productsService.getProducts(), {
    initialValue: [],
  });

  // Computed signals
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query)
    );
  });

  totalCount = computed(() => this.filteredProducts().length);

  // Methods
  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  async deleteProduct(id: string) {
    await this.productsService.delete(id);
    // Refresh handled by service
  }
}`,
    notes: [
      'Use standalone components',
      'Prefer signals over BehaviorSubject',
      'Use computed for derived state',
      'Use toSignal for RxJS conversion',
      'Use @if/@for control flow',
    ],
    relatedPatterns: ['Angular HTTP Service', 'AegisX UI Integration'],
  },
  {
    name: 'Angular HTTP Service',
    category: 'frontend',
    description: 'HTTP service with proper typing and error handling',
    language: 'typescript',
    code: `import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { Product, CreateProduct, UpdateProduct, PaginatedResponse, PaginationQuery } from './products.types';

@Injectable({ providedIn: 'root' })

export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = \`\${environment.apiUrl}/products\`;

  getProducts(query?: PaginationQuery): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    }

    return this.http.get<PaginatedResponse<Product>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(\`\${this.baseUrl}/\${id}\`)
      .pipe(catchError(this.handleError));
  }

  createProduct(data: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: string, data: UpdateProduct): Observable<Product> {
    return this.http.patch<Product>(\`\${this.baseUrl}/\${id}\`, data)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(\`\${this.baseUrl}/\${id}\`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}`,
    notes: [
      'Use environment for base URL',
      'Use proper TypeScript generics',
      'Handle errors consistently',
      'Use HttpParams for query strings',
    ],
    relatedPatterns: ['Angular Signal-based Component'],
  },
  {
    name: 'AegisX UI Integration',
    category: 'frontend',
    description: 'Integrating AegisX UI components in Angular',
    language: 'typescript',
    code: `import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// AegisX UI Components
import {
  AxCardComponent,
  AxBadgeComponent,
  AxAvatarComponent,
  AxAlertComponent,
  AxSkeletonComponent,
  AxInnerLoadingComponent,
} from '@aegisx/ui';

// AegisX UI Services
import { AxDialogService, AxToastService } from '@aegisx/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    // AegisX UI
    AxCardComponent,
    AxBadgeComponent,
    AxAvatarComponent,
    AxAlertComponent,
    AxSkeletonComponent,
    AxInnerLoadingComponent,
  ],
  template: \`
    <div class="p-6">
      <ax-alert type="info" title="Welcome!" dismissible>
        Welcome to your dashboard
      </ax-alert>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <ax-card title="Users" subtitle="Total registered">
          <ax-kpi-card
            title="Total Users"
            [value]="1234"
            trend="up"
            trendValue="+12.5%">
          </ax-kpi-card>
        </ax-card>

        <ax-card title="Recent Activity">
          @for (user of recentUsers(); track user.id) {
            <div class="flex items-center gap-2 py-2">
              <ax-avatar [name]="user.name" size="sm"></ax-avatar>
              <span>{{ user.name }}</span>
              <ax-badge [color]="user.status === 'active' ? 'success' : 'warn'">
                {{ user.status }}
              </ax-badge>
            </div>
          }
        </ax-card>
      </div>
    </div>
  \`,
})

export class DashboardComponent {
  private dialog = inject(AxDialogService);
  private toast = inject(AxToastService);

  recentUsers = signal([
    { id: 1, name: 'John Doe', status: 'active' },
    { id: 2, name: 'Jane Smith', status: 'inactive' },
  ]);

  showConfirmDialog() {
    this.dialog.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
    }).subscribe(result => {
      if (result) {
        this.toast.success('Action confirmed!');
      }
    });
  }
}`,
    notes: [
      'Import components from @aegisx/ui',
      'Use services via inject()',
      'Combine with Material components',
      'Use TailwindCSS for layout',
    ],
    relatedPatterns: ['Angular Signal-based Component'],
  },
  {
    name: 'Knex Migration',
    category: 'database',
    description: 'Database migration with proper types and constraints',
    language: 'typescript',
    code: `import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Required fields
    table.string('name', 255).notNullable();
    table.decimal('price', 10, 2).notNullable();

    // Optional fields
    table.text('description');
    table.boolean('is_active').defaultTo(true);

    // Foreign keys
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');

    // Audit fields
    table.uuid('created_by').references('id').inTable('users');
    table.uuid('updated_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at'); // Soft delete

    // Indexes
    table.index(['name']);
    table.index(['category_id']);
    table.index(['is_active']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
}`,
    notes: [
      'Use UUID for primary keys',
      'Include audit fields (created_by, updated_by)',
      'Use soft delete (deleted_at)',
      'Add indexes for query performance',
      'Use gen_random_uuid() for PostgreSQL',
    ],
    relatedPatterns: ['Repository with UUID Validation'],
  },
  {
    name: 'Knex Query Optimization',
    category: 'database',
    description: 'Optimized Knex queries with pagination and filtering',
    language: 'typescript',
    code: `import { Knex } from 'knex';
import { PaginationQuery, PaginatedResponse } from '@aegisx/core';

async function findAllWithFilters<T>(
  db: Knex,
  tableName: string,
  query: PaginationQuery & { categoryId?: string; isActive?: boolean },
): Promise<PaginatedResponse<T>> {
  const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc' } = query;
  const offset = (page - 1) * limit;

  // Build base query
  let baseQuery = db(tableName)
    .whereNull('deleted_at'); // Exclude soft-deleted

  // Apply filters
  if (query.categoryId) {
    baseQuery = baseQuery.where('category_id', query.categoryId);
  }

  if (query.isActive !== undefined) {
    baseQuery = baseQuery.where('is_active', query.isActive);
  }

  // Apply search
  if (search) {
    baseQuery = baseQuery.where(function() {
      this.whereILike('name', \`%\${search}%\`)
          .orWhereILike('description', \`%\${search}%\`);
    });
  }

  // Get total count (before pagination)
  const [{ count }] = await baseQuery.clone().count('* as count');
  const total = parseInt(count as string, 10);

  // Get paginated data
  const data = await baseQuery
    .orderBy(sortBy, sortOrder)
    .limit(limit)
    .offset(offset);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}`,
    notes: [
      'Use whereNull for soft delete filter',
      'Use whereILike for case-insensitive search',
      'Clone query before count to avoid mutation',
      'Calculate pagination metadata',
    ],
    relatedPatterns: ['Service Layer Pattern'],
  },
  {
    name: 'API Integration Test',
    category: 'testing',
    description: 'Integration test for Fastify routes',
    language: 'typescript',
    code: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildTestApp } from '@test/helpers';

describe('Products API', () => {
  let app: FastifyInstance;
  let authToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    app = await buildTestApp();

    // Get auth token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@test.com',
        password: 'testpassword',
      },
    });
    authToken = loginResponse.json().accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/products', () => {
    it('should create a product', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          authorization: \`Bearer \${authToken}\`,
        },
        payload: {
          name: 'Test Product',
          price: 99.99,
          description: 'A test product',
          categoryId: 'valid-uuid-here',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.name).toBe('Test Product');
      expect(body.price).toBe(99.99);
      expect(body.id).toBeDefined();

      createdProductId = body.id;
    });

    it('should return 400 for invalid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          authorization: \`Bearer \${authToken}\`,
        },
        payload: {
          name: '', // Invalid: empty name
          price: -10, // Invalid: negative price
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test',
          price: 10,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return the created product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: \`/api/products/\${createdProductId}\`,
        headers: {
          authorization: \`Bearer \${authToken}\`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().id).toBe(createdProductId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/00000000-0000-0000-0000-000000000000',
        headers: {
          authorization: \`Bearer \${authToken}\`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});`,
    notes: [
      'Use app.inject() for HTTP testing',
      'Setup auth before tests',
      'Test success, validation errors, and auth',
      'Clean up after tests',
    ],
    relatedPatterns: ['TypeBox Schema Definition'],
  },
];

/**
 * Get all patterns
 */

export function getAllPatterns(): CodePattern[] {
  return patterns;
}

/**
 * Get patterns by category
 */

export function getPatternsByCategory(category: string): CodePattern[] {
  return patterns.filter((p) => p.category === category);
}

/**
 * Get pattern by name
 */

export function getPatternByName(name: string): CodePattern | undefined {
  return patterns.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Search patterns
 */

export function searchPatterns(query: string): CodePattern[] {
  const q = query.toLowerCase();
  return patterns.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.includes(q),
  );
}
