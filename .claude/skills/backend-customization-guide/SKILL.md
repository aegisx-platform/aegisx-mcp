---
name: backend-customization-guide
description: Guide for customizing generated backend code beyond basic CRUD. Use when adding business logic, custom endpoints, complex validations, or extending repositories. Follows established patterns from the AegisX platform architecture.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# Backend Customization Guide

Comprehensive guide for customizing generated backend code to add business logic, custom endpoints, and advanced features.

## When Claude Should Use This Skill

- User asks to "add business logic", "create custom endpoint", or "add validation"
- After CRUD generation when customization is needed
- User mentions specific business rules to implement
- User needs endpoints beyond standard CRUD (approve, bulk operations, statistics)
- User wants to add complex queries, joins, or aggregations
- User needs to implement soft delete, audit logging, or custom permissions

## Backend Layer Architecture

Generated backend code follows a layered architecture:

```
apps/api/src/layers/[layer]/[feature]/
├── [feature].controller.ts    # Request/response handling
├── [feature].service.ts        # Business logic layer
├── [feature].repository.ts     # Data access layer
├── [feature].routes.ts         # Route definitions
├── [feature].schemas.ts        # TypeBox validation schemas
└── [feature].types.ts          # Type definitions & error codes
```

### Customization Decision Tree

```
What do you need to customize?
│
├─ Add business validation?
│  └─> Customize: Service Layer (validateCreate/validateUpdate hooks)
│
├─ Create custom endpoint?
│  ├─> Define: TypeBox schema in schemas.ts
│  ├─> Add: Route in routes.ts
│  ├─> Implement: Handler in controller.ts
│  └─> Business logic: Method in service.ts
│
├─ Complex database query?
│  └─> Customize: Repository Layer (add custom methods)
│
├─ Transform data before response?
│  └─> Customize: Controller Layer (response formatting)
│
└─ Add hooks (before/after operations)?
   └─> Customize: Service Layer (beforeCreate, afterCreate hooks)
```

## Customization Patterns

### Pattern 1: Service Layer Customization

The service layer inherits from `BaseService` and provides validation hooks:

**Location:** `apps/api/src/layers/[layer]/[feature]/[feature].service.ts`

#### Hook Methods (Override These)

```typescript
/**
 * Service validation and business logic hooks
 */
export class DepartmentsService extends BaseService<Departments, CreateDepartments, UpdateDepartments> {
  constructor(private departmentsRepository: DepartmentsRepository) {
    super(departmentsRepository);
  }

  // ===== VALIDATION HOOKS =====

  /**
   * Validate data before creating
   * Throw AppError for validation failures
   */
  protected async validateCreate(data: CreateDepartments): Promise<void> {
    // Example: Check unique constraint
    if (data.dept_code) {
      const existing = await this.departmentsRepository.findByCode(data.dept_code);
      if (existing) {
        throw new AppError(
          'Department code already exists',
          409, // HTTP status code
          'DEPT_CODE_EXISTS',
          { code: data.dept_code },
        );
      }
    }

    // Example: Validate foreign key exists
    if (data.parent_id) {
      const isValid = await this.departmentsRepository.validateParent(data.parent_id);
      if (!isValid) {
        throw new AppError('Invalid parent department', 400, 'INVALID_PARENT', { parentId: data.parent_id });
      }
    }
  }

  /**
   * Validate data before updating
   * Has access to existing entity for comparison
   */
  protected async validateUpdate(id: string | number, data: UpdateDepartments, existing: Departments): Promise<void> {
    // Example: Check unique constraint if field changed
    if (data.dept_code && data.dept_code !== existing.dept_code) {
      const existingCode = await this.departmentsRepository.findByCode(data.dept_code);
      if (existingCode && existingCode.id !== existing.id) {
        throw new AppError('Department code already exists', 409, 'DEPT_CODE_EXISTS', { code: data.dept_code });
      }
    }

    // Example: Prevent circular references
    if (data.parent_id !== undefined && data.parent_id !== null) {
      const hasCircular = await this.departmentsRepository.hasCircularHierarchy(Number(id), data.parent_id);
      if (hasCircular) {
        throw new AppError('Cannot create circular hierarchy', 400, 'CIRCULAR_HIERARCHY', { departmentId: id, parentId: data.parent_id });
      }
    }
  }

  /**
   * Validate before deletion
   * Check for foreign key references
   */
  protected async validateDelete(id: string | number, existing: Departments): Promise<void> {
    // Example: Check for child records
    const deleteCheck = await this.departmentsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const refDetails = deleteCheck.blockedBy.map((ref) => `${ref.count} ${ref.reason}`).join(', ');

      throw new AppError(
        `Cannot delete department - ${refDetails}`,
        422, // Unprocessable Entity
        'CANNOT_DELETE_HAS_REFERENCES',
        { references: deleteCheck.blockedBy },
      );
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====

  /**
   * Process data before creation
   * Transform or enrich data
   */
  protected async beforeCreate(data: CreateDepartments): Promise<CreateDepartments> {
    return {
      ...data,
      // Set defaults
      is_active: data.is_active !== undefined ? data.is_active : true,
      // Transform data
      dept_code: data.dept_code?.toUpperCase(),
    };
  }

  /**
   * Execute logic after creation
   * Trigger side effects, logging, notifications
   */
  protected async afterCreate(created: Departments, originalData: CreateDepartments): Promise<void> {
    console.log('Department created:', {
      id: created.id,
      code: created.dept_code,
      name: created.dept_name,
    });

    // Example: Trigger notification
    // await this.notificationService.sendCreatedNotification(created);
  }

  /**
   * Execute logic after update
   */
  protected async afterUpdate(updated: Departments, updateData: UpdateDepartments, original: Departments): Promise<void> {
    console.log('Department updated:', {
      id: updated.id,
      changes: Object.keys(updateData),
    });
  }

  /**
   * Execute logic after deletion
   */
  protected async afterDelete(id: string | number, deleted: Departments): Promise<void> {
    console.log('Department deleted:', {
      id: deleted.id,
      code: deleted.dept_code,
    });
  }
}
```

#### Adding Custom Service Methods

```typescript
export class DepartmentsService extends BaseService<...> {
  // ... validation hooks ...

  /**
   * Custom business method: Get department hierarchy
   */
  async getHierarchy(parentId?: number | null): Promise<DepartmentHierarchyNode[]> {
    return this.departmentsRepository.getHierarchy(parentId);
  }

  /**
   * Custom business method: Get dropdown list
   */
  async getDropdown(): Promise<DepartmentDropdownItem[]> {
    return this.departmentsRepository.getDropdown();
  }

  /**
   * Custom business method: Check if can delete
   */
  async canDelete(id: string | number): Promise<DeleteValidationResult> {
    return this.departmentsRepository.canBeDeleted(id);
  }

  /**
   * Custom business method: Get statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    return this.departmentsRepository.getStats();
  }

  /**
   * Complex business logic example: Approve department
   */
  async approve(id: string | number, userId: string): Promise<Departments> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new AppError('Department not found', 404, 'NOT_FOUND');
    }

    if (existing.is_active) {
      throw new AppError('Department already approved', 400, 'ALREADY_APPROVED');
    }

    // Update with approval
    return this.update(id, { is_active: true }, userId);
  }
}
```

### Pattern 2: Repository Layer Customization

The repository extends `BaseRepository` for data access:

**Location:** `apps/api/src/layers/[layer]/[feature]/[feature].repository.ts`

#### Add Custom Query Methods

```typescript
export class DepartmentsRepository extends BaseRepository<Departments, CreateDepartments, UpdateDepartments> {
  constructor(knex: Knex) {
    super(
      knex,
      'departments', // table name
      ['departments.dept_name', 'departments.dept_code'], // searchable fields
      [], // UUID fields (if any)
      {
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // ===== CUSTOM QUERY METHODS =====

  /**
   * Find by unique field
   */
  async findByCode(code: string): Promise<Departments | null> {
    const query = this.getJoinQuery();
    const row = await query.where('departments.dept_code', code).first();
    return row ? this.transformToEntity(row) : null;
  }

  /**
   * Complex query with joins
   */
  async findWithRelations(id: number | string): Promise<any> {
    const department = await this.knex('departments').select('departments.*', this.knex.raw('COUNT(DISTINCT users.id) as user_count'), this.knex.raw('COUNT(DISTINCT child_depts.id) as child_count')).leftJoin('user_departments', 'departments.id', 'user_departments.department_id').leftJoin('users', 'user_departments.user_id', 'users.id').leftJoin('departments as child_depts', 'departments.id', 'child_depts.parent_id').where('departments.id', id).groupBy('departments.id').first();

    return department ? this.transformToEntity(department) : null;
  }

  /**
   * Get hierarchical tree structure
   */
  async getHierarchy(parentId?: number | null): Promise<DepartmentHierarchyNode[]> {
    // Get all departments
    const allDepartments = await this.knex('departments').select('id', 'dept_code', 'dept_name', 'parent_id', 'is_active').where('is_active', true).orderBy('dept_name', 'asc');

    // Build hierarchy recursively
    const buildTree = (parent: number | null): DepartmentHierarchyNode[] => {
      return allDepartments
        .filter((dept) => {
          if (parent === null) {
            return dept.parent_id === null || dept.parent_id === 0;
          }
          return dept.parent_id === parent;
        })
        .map((dept) => ({
          id: dept.id,
          dept_code: dept.dept_code,
          dept_name: dept.dept_name,
          parent_id: dept.parent_id,
          is_active: dept.is_active,
          children: buildTree(dept.id),
        }));
    };

    return buildTree(parentId ?? null);
  }

  /**
   * Get statistics with aggregation
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const stats: any = await this.knex('departments')
      .select([this.knex.raw('COUNT(*) as total'), this.knex.raw('SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active'), this.knex.raw('SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
      active: parseInt(stats?.active || '0'),
      inactive: parseInt(stats?.inactive || '0'),
    };
  }

  /**
   * Check if record can be deleted (has foreign key references)
   */
  async canBeDeleted(id: string | number): Promise<DeleteValidationResult> {
    const blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      reason: string;
    }> = [];

    // Check for child departments
    const childrenCount = await this.knex('departments').where('parent_id', id).count('* as count').first();

    if (parseInt((childrenCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'departments',
        field: 'parent_id',
        count: parseInt((childrenCount?.count as string) || '0'),
        reason: 'Department has child departments',
      });
    }

    // Check for user assignments
    const userCount = await this.knex('user_departments').where('department_id', id).count('* as count').first();

    if (parseInt((userCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'user_departments',
        field: 'department_id',
        count: parseInt((userCount?.count as string) || '0'),
        reason: 'Department has assigned users',
      });
    }

    return {
      canDelete: blockedBy.length === 0,
      blockedBy,
    };
  }

  /**
   * Validate foreign key reference
   */
  async validateParent(parentId: number | null): Promise<boolean> {
    if (parentId === null || parentId === undefined) {
      return true; // No parent is valid
    }

    const parent = await this.knex('departments').where('id', parentId).where('is_active', true).first();

    return !!parent;
  }

  /**
   * Check for circular hierarchy
   */
  async hasCircularHierarchy(departmentId: number, newParentId: number | null): Promise<boolean> {
    if (!newParentId) return false;

    // Check if newParentId is a descendant of departmentId
    let currentId: number | null = newParentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === departmentId) {
        return true; // Circular reference detected
      }

      if (visited.has(currentId)) {
        break; // Already visited, prevent infinite loop
      }
      visited.add(currentId);

      const parent = await this.knex('departments').select('parent_id').where('id', currentId).first();

      currentId = parent?.parent_id ?? null;
    }

    return false;
  }

  /**
   * Bulk operations: Create many
   */
  async createMany(data: CreateDepartments[]): Promise<Departments[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('departments').insert(transformedData).returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  /**
   * Transaction support for complex operations
   */
  async createWithTransaction(data: CreateDepartments): Promise<Departments> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('departments').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}
```

### Pattern 3: Controller Layer Customization

The controller handles HTTP request/response:

**Location:** `apps/api/src/layers/[layer]/[feature]/[feature].controller.ts`

#### Add Custom Endpoint Handlers

```typescript
export class DepartmentsController {
  private departmentEvents: CrudEventHelper;

  constructor(
    private departmentsService: DepartmentsService,
    private eventService: EventService,
  ) {
    this.departmentEvents = this.eventService.for('departments', 'department');
  }

  // ===== STANDARD CRUD HANDLERS =====
  // (Generated handlers: list, getById, create, update, delete)

  // ===== CUSTOM ENDPOINT HANDLERS =====

  /**
   * Get dropdown list for UI components
   * GET /departments/dropdown
   */
  async dropdown(
    request: FastifyRequest<{
      Querystring: DropdownQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ query: request.query }, 'Fetching departments dropdown');

      const dropdownItems = await this.departmentsService.getDropdown();

      return reply.success({
        options: dropdownItems,
        total: dropdownItems.length,
      });
    } catch (error) {
      request.log.error({ error }, 'Error fetching departments dropdown');
      throw error;
    }
  }

  /**
   * Get hierarchical tree structure
   * GET /departments/hierarchy?parentId=1
   */
  async hierarchy(
    request: FastifyRequest<{
      Querystring: { parentId?: string | number };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const parentId = request.query.parentId ? Number(request.query.parentId) : undefined;

      request.log.info({ parentId }, 'Fetching departments hierarchy');

      const hierarchy = await this.departmentsService.getHierarchy(parentId);

      return reply.success({
        hierarchy,
        total: hierarchy.length,
      });
    } catch (error) {
      request.log.error({ error }, 'Error fetching departments hierarchy');
      throw error;
    }
  }

  /**
   * Get statistics
   * GET /departments/stats
   */
  async stats(request: FastifyRequest, reply: FastifyReply) {
    try {
      request.log.info({}, 'Fetching departments statistics');
      const stats = await this.departmentsService.getStats();

      return reply.success(stats);
    } catch (error) {
      request.log.error({ error }, 'Error fetching departments statistics');
      throw error;
    }
  }

  /**
   * Approve department (custom business operation)
   * POST /departments/:id/approve
   */
  async approve(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userId = request.user?.id;

      request.log.info({ departmentId: id }, 'Approving department');

      const department = await this.departmentsService.approve(id, userId);

      // Emit WebSocket event
      this.departmentEvents.emitUpdated(department);

      return reply.success(department, 'Department approved successfully');
    } catch (error) {
      request.log.error({ error }, 'Error approving department');
      throw error;
    }
  }

  /**
   * Bulk update (custom bulk operation)
   * PATCH /departments/bulk
   */
  async bulkUpdate(
    request: FastifyRequest<{
      Body: { ids: number[]; data: UpdateDepartments };
    }>,
    reply: FastifyReply,
  ) {
    try {
      request.log.info({ ids: request.body.ids }, 'Bulk updating departments');

      const results = await Promise.all(request.body.ids.map((id) => this.departmentsService.update(id, request.body.data, request.user?.id)));

      return reply.success({
        updated: results.length,
        items: results,
      });
    } catch (error) {
      request.log.error({ error }, 'Error bulk updating departments');
      throw error;
    }
  }
}
```

### Pattern 4: Routes Customization

Add custom routes beyond CRUD:

**Location:** `apps/api/src/layers/[layer]/[feature]/[feature].routes.ts`

```typescript
export async function departmentsRoutes(fastify: FastifyInstance, options: DepartmentsRoutesOptions) {
  const { controller } = options;

  // ===== STANDARD CRUD ROUTES =====
  // GET /, GET /:id, POST /, PUT /:id, DELETE /:id

  // ===== CUSTOM ROUTES =====

  /**
   * IMPORTANT: Place custom routes BEFORE parameterized routes
   * to avoid path conflicts (e.g., /dropdown before /:id)
   */

  // GET /dropdown - Must come before /:id
  fastify.get('/dropdown', {
    schema: {
      tags: ['Core: Departments'],
      summary: 'Get departments dropdown list',
      description: 'Retrieve simplified list of active departments for UI dropdowns',
      querystring: DropdownQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      dept_code: { type: 'string' },
                      dept_name: { type: 'string' },
                      is_active: { type: 'boolean' },
                    },
                  },
                },
                total: { type: 'number' },
              },
            },
          },
        },
        401: SchemaRefs.Unauthorized,
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('departments', 'read')],
    handler: controller.dropdown.bind(controller),
  });

  // GET /hierarchy - Must come before /:id
  fastify.get('/hierarchy', {
    schema: {
      tags: ['Core: Departments'],
      summary: 'Get department hierarchy tree',
      querystring: {
        type: 'object',
        properties: {
          parentId: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                hierarchy: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preValidation: [fastify.authenticate],
    handler: controller.hierarchy.bind(controller),
  });

  // GET /stats - Must come before /:id
  fastify.get('/stats', {
    schema: {
      tags: ['Core: Departments'],
      summary: 'Get department statistics',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                inactive: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('departments', 'read')],
    handler: controller.stats.bind(controller),
  });

  // POST /:id/approve - Action endpoint
  fastify.post('/:id/approve', {
    schema: {
      tags: ['Core: Departments'],
      summary: 'Approve department',
      params: DepartmentsIdParamSchema,
      response: {
        200: DepartmentsResponseSchema,
        404: SchemaRefs.NotFound,
        400: SchemaRefs.ValidationError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('departments', 'update')],
    handler: controller.approve.bind(controller),
  });

  // PATCH /bulk - Bulk operation
  fastify.patch('/bulk', {
    schema: {
      tags: ['Core: Departments'],
      summary: 'Bulk update departments',
      body: Type.Object({
        ids: Type.Array(Type.Integer()),
        data: UpdateDepartmentsSchema,
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                updated: { type: 'number' },
                items: { type: 'array' },
              },
            },
          },
        },
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('departments', 'update')],
    handler: controller.bulkUpdate.bind(controller),
  });
}
```

### Pattern 5: Schema Customization

Add schemas for custom endpoints:

**Location:** `apps/api/src/layers/[layer]/[feature]/[feature].schemas.ts`

```typescript
import { Type, Static } from '@sinclair/typebox';

// ===== CUSTOM ENDPOINT SCHEMAS =====

/**
 * Schema for approve endpoint
 */
export const ApproveDepartmentSchema = Type.Object({
  approver_notes: Type.Optional(Type.String({ maxLength: 500 })),
});

export type ApproveDepartment = Static<typeof ApproveDepartmentSchema>;

/**
 * Schema for bulk update
 */
export const BulkUpdateDepartmentsSchema = Type.Object({
  ids: Type.Array(Type.Integer({ minimum: 1 }), {
    minItems: 1,
    maxItems: 100,
    description: 'Department IDs to update (max 100)',
  }),
  data: UpdateDepartmentsSchema,
});

export type BulkUpdateDepartments = Static<typeof BulkUpdateDepartmentsSchema>;

/**
 * Schema for statistics response
 */
export const DepartmentStatsSchema = Type.Object({
  total: Type.Integer(),
  active: Type.Integer(),
  inactive: Type.Integer(),
  by_parent: Type.Optional(
    Type.Array(
      Type.Object({
        parent_id: Type.Union([Type.Integer(), Type.Null()]),
        parent_name: Type.String(),
        count: Type.Integer(),
      }),
    ),
  ),
});

export type DepartmentStats = Static<typeof DepartmentStatsSchema>;
```

## Common Customization Scenarios

### Scenario 1: Add Business Validation

**Use Case:** Ensure business rules beyond TypeBox schema validation

**Implementation:**

1. Override `validateCreate` or `validateUpdate` in service
2. Throw `AppError` with appropriate status code and error code
3. Include helpful error details for debugging

### Scenario 2: Create Custom Endpoint

**Use Case:** Add `/approve`, `/publish`, `/calculate` endpoints

**Implementation:**

1. Create TypeBox schema for request/response in `schemas.ts`
2. Add method to service layer for business logic
3. Add handler to controller
4. Register route in `routes.ts` (before parameterized routes)

### Scenario 3: Add Complex Query

**Use Case:** Get data with joins, aggregations, or complex filters

**Implementation:**

1. Add custom query method to repository
2. Use Knex query builder for complex SQL
3. Transform results using `transformToEntity`
4. Call from service layer

### Scenario 4: Implement Soft Delete

**Use Case:** Mark records as deleted instead of removing

**Implementation:**

1. Add `deleted_at` column to migration
2. Override `delete` in repository to UPDATE instead of DELETE
3. Add filter in `applyCustomFilters` to exclude deleted records
4. Add `restore` method if needed

### Scenario 5: Add Audit Logging

**Use Case:** Track who created/updated/deleted records

**Implementation:**

1. Add `created_by`, `updated_by` columns to migration
2. Set `hasCreatedBy: true, hasUpdatedBy: true` in repository constructor
3. BaseRepository automatically handles these fields
4. Access from `request.user?.id` in controller

### Scenario 6: Custom Permissions

**Use Case:** Resource-level permissions (can only edit own records)

**Implementation:**

1. Add check in service layer `validateUpdate` or `validateDelete`
2. Compare `existing.created_by` with `userId`
3. Throw `ForbiddenError` if not authorized

## Anti-Patterns to Avoid

### WRONG: Modifying Generated Code Structure

```typescript
// ❌ DON'T change base class
export class DepartmentsService {
  // Removed extends BaseService
}

// ✅ DO extend and customize
export class DepartmentsService extends BaseService<...> {
  // Add custom methods
}
```

### WRONG: Skipping TypeBox Schemas

```typescript
// ❌ DON'T skip schema validation
fastify.post('/departments', {
  // No schema
  handler: controller.create.bind(controller),
});

// ✅ DO always define schemas
fastify.post('/departments', {
  schema: {
    body: CreateDepartmentsSchema,
    response: { 201: DepartmentsResponseSchema },
  },
  handler: controller.create.bind(controller),
});
```

### WRONG: Business Logic in Routes

```typescript
// ❌ DON'T put business logic in routes
fastify.post('/:id/approve', {
  handler: async (request, reply) => {
    const dept = await repository.findById(id);
    if (!dept.is_active) {
      // Business logic in route!
      await repository.update(id, { is_active: true });
    }
  },
});

// ✅ DO put business logic in service
fastify.post('/:id/approve', {
  handler: controller.approve.bind(controller),
});
// Controller calls service.approve(id, userId)
```

### WRONG: Direct Database Access in Controller

```typescript
// ❌ DON'T access database directly in controller
async create(request, reply) {
  const result = await this.knex('departments').insert(request.body);
  return reply.success(result);
}

// ✅ DO use service layer
async create(request, reply) {
  const result = await this.departmentsService.create(request.body, userId);
  return reply.success(result);
}
```

### WRONG: Ignoring Error Handling

```typescript
// ❌ DON'T ignore errors
async getById(request, reply) {
  const dept = await this.service.findById(id);
  return reply.success(dept); // What if null?
}

// ✅ DO handle not found
async getById(request, reply) {
  const dept = await this.service.findById(id);
  if (!dept) {
    return reply.code(404).error('NOT_FOUND', 'Department not found');
  }
  return reply.success(dept);
}
```

## Best Practices

### 1. Use AppError for Business Errors

```typescript
import { AppError } from '../../../core/errors/app-error';

throw new AppError(
  'Human-readable message',
  409, // HTTP status code
  'ERROR_CODE', // Machine-readable code
  { additional: 'context' }, // Debug details
);
```

### 2. Define Error Codes in Types File

```typescript
// [feature].types.ts
export enum DepartmentsErrorCode {
  CODE_EXISTS = 'DEPT_CODE_EXISTS',
  INVALID_PARENT = 'DEPT_INVALID_PARENT',
  CIRCULAR_HIERARCHY = 'DEPT_CIRCULAR_HIERARCHY',
  CANNOT_DELETE_HAS_REFERENCES = 'DEPT_CANNOT_DELETE_HAS_REFERENCES',
}

export const DepartmentsErrorMessages: Record<DepartmentsErrorCode, string> = {
  [DepartmentsErrorCode.CODE_EXISTS]: 'Department code already exists',
  [DepartmentsErrorCode.INVALID_PARENT]: 'Invalid parent department',
  [DepartmentsErrorCode.CIRCULAR_HIERARCHY]: 'Cannot create circular hierarchy',
  [DepartmentsErrorCode.CANNOT_DELETE_HAS_REFERENCES]: 'Cannot delete department with existing references',
};
```

### 3. Use Proper Logging

```typescript
// Log important operations
request.log.info({ departmentId: id }, 'Creating department');

// Log errors with context
request.log.error(
  {
    error,
    errorMessage: error.message,
    departmentId: id,
    body: request.body,
  },
  'Error creating department',
);
```

### 4. Always Bind Controller Methods

```typescript
// Routes must bind controller methods to preserve `this` context
handler: controller.create.bind(controller),
```

### 5. Use Transactions for Multi-Step Operations

```typescript
async complexOperation(data: any): Promise<Result> {
  return this.repository.withTransaction(async (trx) => {
    const step1 = await trx('table1').insert(data.step1);
    const step2 = await trx('table2').insert(data.step2);
    return { step1, step2 };
  });
}
```

## Output Format

After customizing backend code, provide a summary:

```markdown
## Backend Customization Complete

**Feature:** [feature-name]
**Layer:** [layer-name]

**Customizations Applied:**

### Service Layer

- ✅ Added validateCreate: Check unique dept_code
- ✅ Added validateUpdate: Prevent circular hierarchy
- ✅ Added validateDelete: Check foreign key references
- ✅ Added custom method: getHierarchy()
- ✅ Added custom method: getStats()

### Repository Layer

- ✅ Added findByCode(): Find department by code
- ✅ Added canBeDeleted(): Check foreign key references
- ✅ Added hasCircularHierarchy(): Prevent circular parents
- ✅ Added getHierarchy(): Build hierarchical tree

### Controller Layer

- ✅ Added dropdown(): Get dropdown list
- ✅ Added hierarchy(): Get hierarchical tree
- ✅ Added stats(): Get statistics

### Routes

- ✅ Added GET /dropdown
- ✅ Added GET /hierarchy
- ✅ Added GET /stats
- ✅ Added POST /:id/approve

### Schemas

- ✅ Added ApproveDepartmentSchema
- ✅ Added BulkUpdateDepartmentsSchema
- ✅ Added DepartmentStatsSchema

**Testing:**

- Run: pnpm run build (must pass)
- Test endpoints: Use api-endpoint-tester skill
- Verify API contract: Use api-contract-validator skill

**Next Steps:**

1. Test all new endpoints
2. Update API contract documentation
3. Implement frontend integration
```

## Related Skills

- Use `api-contract-generator` to document custom endpoints
- Use `api-endpoint-tester` to test customizations
- Use `typebox-schema-generator` for custom schemas
- Use `crud-generator-guide` for initial backend generation

## Related Documentation

- [Backend Architecture](../../../docs/architecture/backend-architecture.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
