# Knex CRUD with Pagination & Filters

> **⚠️ RECOMMENDED APPROACH** - For new CRUD modules, use the automated CRUD generator instead of manual implementation.
>
> **For automated CRUD generation, see:**
>
> - **[CRUD Generator Documentation](../../crud-generator/)** - Automatic CRUD generation with error handling
> - **[Error Handling Guide](../../crud-generator/ERROR_HANDLING_GUIDE.md)** - Automatic error detection
> - **[Validation Reference](../../crud-generator/VALIDATION_REFERENCE.md)** - Auto-detected validations
> - **[Testing Guide](../../crud-generator/TESTING_GUIDE.md)** - Testing strategies
>
> This document describes the manual Knex CRUD pattern and is kept for reference when you need custom implementations beyond what the generator provides.

---

## Standard CRUD API Pattern

```
GET    /api/[resource]              # List with pagination, filters, sorting
GET    /api/[resource]/:id          # Get single item
POST   /api/[resource]              # Create new item
PUT    /api/[resource]/:id          # Update item
DELETE /api/[resource]/:id          # Delete item
```

## Query Parameters Standard

```typescript
// Standard query interface for all list endpoints
interface ListQuery {
  // Pagination (required)
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 10, max: 100)

  // Search (optional)
  search?: string; // Global search across main fields

  // Sorting (optional)
  sortBy?: string; // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sort direction (default: desc)

  // Filters (resource-specific)
  status?: string; // Common: active/inactive
  [key: string]: any; // Additional filters per resource
}
```

## Complete Knex CRUD Repository Pattern

### Knex Plugin Setup

```typescript
// apps/api/src/plugins/knex.plugin.ts
import fp from 'fastify-plugin';
import knex from 'knex';

export default fp(
  async function knexPlugin(fastify: FastifyInstance) {
    const db = knex({
      client: 'postgresql',
      connection: process.env.DATABASE_URL,
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10'),
      },
      migrations: {
        directory: './database/migrations',
        tableName: 'knex_migrations',
      },
      seeds: {
        directory: './database/seeds',
      },
    });

    // Decorate fastify with knex instance
    fastify.decorate('knex', db);
    fastify.decorate('db', db); // Alias for convenience

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      await db.destroy();
    });
  },
  {
    name: 'knex-plugin',
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
    db: Knex;
  }
}
```

### Base Repository Class (Reusable CRUD)

```typescript
// apps/api/src/repositories/base.repository.ts
import { Knex } from 'knex';

interface BaseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

interface ListResult<T> {
  data: T[];
  total: number;
}

abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected knex: Knex,
    protected tableName: string,
    protected searchFields: string[] = [],
  ) {}

  // Abstract methods to implement
  abstract transformToEntity(dbRow: any): T;
  abstract transformToDb(dto: CreateDto | UpdateDto): any;
  abstract getJoinQuery?(): Knex.QueryBuilder;

  // Common CRUD operations
  async findById(id: string): Promise<T | null> {
    const query = this.getJoinQuery?.() || this.knex(this.tableName);
    const row = await query.where(`${this.tableName}.id`, id).first();
    return row ? this.transformToEntity(row) : null;
  }

  async create(data: CreateDto): Promise<T> {
    const dbData = this.transformToDb(data);
    const [row] = await this.knex(this.tableName).insert(dbData).returning('*');
    return this.transformToEntity(row);
  }

  async update(id: string, data: UpdateDto): Promise<T | null> {
    const dbData = this.transformToDb(data);
    const [row] = await this.knex(this.tableName)
      .where({ id })
      .update({ ...dbData, updated_at: new Date() })
      .returning('*');
    return row ? this.transformToEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex(this.tableName).where({ id }).del();
    return deletedRows > 0;
  }

  async list(query: BaseListQuery): Promise<ListResult<T>> {
    const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc', ...filters } = query;

    // Base query
    const baseQuery = this.getJoinQuery?.() || this.knex(this.tableName);

    // Apply search
    if (search && this.searchFields.length > 0) {
      baseQuery.where(function () {
        this.searchFields.forEach((field, index) => {
          if (index === 0) {
            this.whereILike(field, `%${search}%`);
          } else {
            this.orWhereILike(field, `%${search}%`);
          }
        });
      });
    }

    // Apply custom filters
    this.applyCustomFilters(baseQuery, filters);

    // Get total count
    const countQuery = baseQuery.clone().clearSelect().count(`${this.tableName}.id as total`);
    const [{ total }] = await countQuery;

    // Apply sorting and pagination
    const data = await baseQuery
      .orderBy(this.getSortField(sortBy), sortOrder)
      .offset((page - 1) * limit)
      .limit(limit);

    return {
      data: data.map((row) => this.transformToEntity(row)),
      total: parseInt(total as string),
    };
  }

  // Override in child classes for custom filtering
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any) {
    // Default implementation - override in child classes
  }

  // Override in child classes for custom sorting
  protected getSortField(sortBy: string): string {
    return `${this.tableName}.${sortBy}`;
  }
}
```

### User Repository Implementation

```typescript
// apps/api/src/modules/user/user.repository.ts
import { BaseRepository } from '../../repositories/base.repository';
import { User, CreateUserRequest, UpdateUserRequest } from '@org/api-client';

interface GetUsersFilters extends BaseListQuery {
  role?: string;
  roles?: string[];
  status?: 'active' | 'inactive';
  createdAfter?: string;
  createdBefore?: string;
}

class UserRepository extends BaseRepository<User, CreateUserRequest, UpdateUserRequest> {
  constructor(fastify: FastifyInstance) {
    super(
      fastify.knex,
      'users',
      ['users.email', 'users.first_name', 'users.last_name', 'users.username'], // searchFields
    );
  }

  // Join with roles table
  getJoinQuery() {
    return this.knex('users').leftJoin('roles', 'users.role_id', 'roles.id').select('users.id', 'users.email', 'users.username', 'users.first_name', 'users.last_name', 'users.is_active', 'users.created_at', 'users.updated_at', this.knex.raw("json_build_object('id', roles.id, 'name', roles.name, 'description', roles.description) as role"));
  }

  // Custom filters for users
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any) {
    const { role, roles, status, createdAfter, createdBefore } = filters;

    // Single role filter
    if (role) {
      query.where('roles.name', role);
    }

    // Multiple roles filter
    if (roles && roles.length > 0) {
      query.whereIn('roles.name', roles);
    }

    // Status filter
    if (status) {
      query.where('users.is_active', status === 'active');
    }

    // Date range filters
    if (createdAfter) {
      query.where('users.created_at', '>=', createdAfter);
    }

    if (createdBefore) {
      query.where('users.created_at', '<=', createdBefore);
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields = {
      created_at: 'users.created_at',
      updated_at: 'users.updated_at',
      email: 'users.email',
      first_name: 'users.first_name',
      last_name: 'users.last_name',
      username: 'users.username',
      role: 'roles.name',
      status: 'users.is_active',
    };

    return sortFields[sortBy] || 'users.created_at';
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): User {
    return {
      id: dbRow.id,
      email: dbRow.email,
      username: dbRow.username,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      isActive: dbRow.is_active,
      role: dbRow.role,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateUserRequest | UpdateUserRequest): any {
    const transformed: any = {};

    if ('email' in dto) transformed.email = dto.email;
    if ('username' in dto) transformed.username = dto.username;
    if ('firstName' in dto) transformed.first_name = dto.firstName;
    if ('lastName' in dto) transformed.last_name = dto.lastName;
    if ('password' in dto) transformed.password = dto.password;
    if ('roleId' in dto) transformed.role_id = dto.roleId;
    if ('isActive' in dto) transformed.is_active = dto.isActive;

    return transformed;
  }

  // Additional user-specific methods
  async findByEmail(email: string): Promise<User | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.email', email).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.username', username).first();
    return row ? this.transformToEntity(row) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.knex('users').where({ id }).update({
      password: hashedPassword,
      updated_at: new Date(),
    });
  }

  async getUserStats(): Promise<{ total: number; active: number; inactive: number }> {
    const stats = await this.knex('users').select(this.knex.raw('COUNT(*) as total'), this.knex.raw('COUNT(CASE WHEN is_active = true THEN 1 END) as active'), this.knex.raw('COUNT(CASE WHEN is_active = false THEN 1 END) as inactive')).first();

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
    };
  }
}
```

## Generic CRUD Service Pattern

```typescript
// apps/api/src/services/base.service.ts
import { BaseRepository } from '../repositories/base.repository';

abstract class BaseService<T, CreateDto, UpdateDto> {
  constructor(protected repository: BaseRepository<T, CreateDto, UpdateDto>) {}

  async getList(query: any) {
    // Set defaults
    const filters = {
      page: Math.max(1, parseInt(query.page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
      ...query,
    };

    return this.repository.list(filters);
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: CreateDto): Promise<T> {
    await this.validateCreate(data);
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateDto): Promise<T | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    await this.validateUpdate(id, data);
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) return false;

    await this.validateDelete(id);
    return this.repository.delete(id);
  }

  // Override in child classes for validation
  protected async validateCreate(data: CreateDto): Promise<void> {}
  protected async validateUpdate(id: string, data: UpdateDto): Promise<void> {}
  protected async validateDelete(id: string): Promise<void> {}
}

// User service implementation
export class UserService extends BaseService<User, CreateUserRequest, UpdateUserRequest> {
  constructor(fastify: FastifyInstance) {
    const userRepository = new UserRepository(fastify);
    super(userRepository);
  }

  // User-specific validation
  protected async validateCreate(data: CreateUserRequest): Promise<void> {
    // Check email uniqueness
    const existingEmail = await (this.repository as UserRepository).findByEmail(data.email);
    if (existingEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Check username uniqueness
    const existingUsername = await (this.repository as UserRepository).findByUsername(data.username);
    if (existingUsername) {
      throw new Error('USERNAME_ALREADY_EXISTS');
    }
  }

  protected async validateUpdate(id: string, data: UpdateUserRequest): Promise<void> {
    // Additional business logic validation
  }

  // User-specific methods
  async changePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await (this.repository as UserRepository).updatePassword(id, hashedPassword);
  }

  async getUserStats() {
    return (this.repository as UserRepository).getUserStats();
  }
}
```

## Complete Route Handler Example

```typescript
// apps/api/src/modules/user/user.routes.ts
async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users - Advanced list with all features
  fastify.route<{
    Querystring: GetUsersQuery;
    Reply: ApiResponse<User[]>;
  }>({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get paginated, filtered, and sorted list of users',
      tags: ['Users'],
      querystring: {
        type: 'object',
        properties: {
          // Pagination
          page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Items per page' },

          // Search
          search: { type: 'string', minLength: 1, description: 'Search across email, name, username' },

          // Filters
          role: { type: 'string', description: 'Filter by role name' },
          roles: { type: 'array', items: { type: 'string' }, description: 'Filter by multiple roles' },
          status: { type: 'string', enum: ['active', 'inactive'], description: 'Filter by status' },
          createdAfter: { type: 'string', format: 'date-time', description: 'Created after date' },
          createdBefore: { type: 'string', format: 'date-time', description: 'Created before date' },

          // Sorting
          sortBy: {
            type: 'string',
            enum: ['created_at', 'updated_at', 'email', 'first_name', 'last_name', 'username', 'role', 'status'],
            default: 'created_at',
          },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        },
      },
      response: {
        200: { $ref: 'paginatedUsersResponse#' },
        401: { $ref: 'unauthorizedResponse#' },
        500: { $ref: 'serverErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { data, total } = await fastify.userService.getList(request.query);
      const { page = 1, limit = 10 } = request.query;

      return reply.paginated(data, page, limit, total, 'Users retrieved successfully');
    },
  });

  // POST /api/users - Create with business validation
  fastify.route<{
    Body: CreateUserRequest;
    Reply: ApiResponse<User>;
  }>({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create new user',
      tags: ['Users'],
      body: { $ref: 'createUserRequest#' },
      response: {
        201: { $ref: 'userResponse#' },
        400: { $ref: 'validationErrorResponse#' },
        401: { $ref: 'unauthorizedResponse#' },
        409: { $ref: 'conflictResponse#' },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const user = await fastify.userService.create(request.body);
      return reply.created(user, 'User created successfully');
    },
  });

  // PUT /api/users/:id - Update with optimistic locking
  fastify.route<{
    Params: { id: string };
    Body: UpdateUserRequest;
    Reply: ApiResponse<User>;
  }>({
    method: 'PUT',
    url: '/:id',
    schema: {
      description: 'Update user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: { $ref: 'updateUserRequest#' },
      response: {
        200: { $ref: 'userResponse#' },
        400: { $ref: 'validationErrorResponse#' },
        404: { $ref: 'notFoundResponse#' },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin', 'manager'])],
    handler: async (request, reply) => {
      const { id } = request.params;
      const user = await fastify.userService.update(id, request.body);

      if (!user) {
        return reply.notFound('User not found');
      }

      return reply.success(user, 'User updated successfully');
    },
  });

  // DELETE /api/users/:id - Soft delete option
  fastify.route<{
    Params: { id: string };
    Reply: ApiResponse<{ id: string }>;
  }>({
    method: 'DELETE',
    url: '/:id',
    schema: {
      description: 'Delete user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: { $ref: 'deleteResponse#' },
        404: { $ref: 'notFoundResponse#' },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const { id } = request.params;
      const deleted = await fastify.userService.delete(id);

      if (!deleted) {
        return reply.notFound('User not found');
      }

      return reply.success({ id }, 'User deleted successfully');
    },
  });

  // GET /api/users/stats - Statistics endpoint
  fastify.route({
    method: 'GET',
    url: '/stats',
    schema: {
      description: 'Get user statistics',
      tags: ['Users'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean', const: true },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                active: { type: 'integer' },
                inactive: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.authorize(['admin'])],
    handler: async (request, reply) => {
      const stats = await fastify.userService.getUserStats();
      return reply.success(stats, 'User statistics retrieved');
    },
  });
}
```

## Example Usage URLs

```bash
# Basic pagination
GET /api/users?page=1&limit=20

# Search with pagination
GET /api/users?search=john&page=1&limit=10

# Multiple filters
GET /api/users?role=admin&status=active&page=1

# Date range filter
GET /api/users?createdAfter=2024-01-01&createdBefore=2024-12-31

# Multiple roles filter
GET /api/users?roles[]=admin&roles[]=manager

# Sorting
GET /api/users?sortBy=email&sortOrder=asc

# Complex query
GET /api/users?search=john&roles[]=admin&roles[]=manager&status=active&sortBy=created_at&sortOrder=desc&page=2&limit=25
```

## Knex Features

- **Migration System** - Database schema versioning
- **Query Builder** - Type-safe SQL generation
- **Connection Pooling** - Better performance
- **Transaction Support** - ACID compliance
- **Multiple DB Support** - PostgreSQL, MySQL, SQLite
- **Seed System** - Test data management
- **Advanced Filtering** - Complex WHERE conditions
- **Join Support** - Easy table relationships
