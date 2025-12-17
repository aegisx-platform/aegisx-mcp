# Backend Customization Quick Reference

> Quick copy-paste code patterns for common backend customizations

## Table of Contents

- [Service Layer Patterns](#service-layer-patterns)
- [Repository Patterns](#repository-patterns)
- [Controller Patterns](#controller-patterns)
- [Route Patterns](#route-patterns)
- [Schema Patterns](#schema-patterns)
- [Error Handling Patterns](#error-handling-patterns)

---

## Service Layer Patterns

### Validation Hook: Check Unique Constraint

```typescript
protected async validateCreate(data: CreateEntity): Promise<void> {
  const existing = await this.repository.findByField(data.fieldName);
  if (existing) {
    throw new AppError(
      'Field value already exists',
      409,
      'FIELD_EXISTS',
      { field: data.fieldName }
    );
  }
}
```

### Validation Hook: Check Foreign Key

```typescript
protected async validateCreate(data: CreateEntity): Promise<void> {
  if (data.foreign_id) {
    const exists = await this.repository.validateForeignKey(data.foreign_id);
    if (!exists) {
      throw new AppError(
        'Referenced record does not exist',
        400,
        'INVALID_REFERENCE',
        { foreignId: data.foreign_id }
      );
    }
  }
}
```

### Validation Hook: Prevent Deletion with References

```typescript
protected async validateDelete(
  id: string | number,
  existing: Entity
): Promise<void> {
  const hasReferences = await this.repository.hasReferences(id);
  if (hasReferences) {
    throw new AppError(
      'Cannot delete record with existing references',
      422,
      'HAS_REFERENCES'
    );
  }
}
```

### Business Logic Hook: Set Defaults

```typescript
protected async beforeCreate(data: CreateEntity): Promise<CreateEntity> {
  return {
    ...data,
    status: data.status || 'pending',
    is_active: data.is_active !== undefined ? data.is_active : true,
    created_at: new Date(),
  };
}
```

### Business Logic Hook: Transform Data

```typescript
protected async beforeCreate(data: CreateEntity): Promise<CreateEntity> {
  return {
    ...data,
    code: data.code?.toUpperCase(),
    email: data.email?.toLowerCase(),
    slug: this.generateSlug(data.name),
  };
}
```

### Business Logic Hook: After Create (Notifications)

```typescript
protected async afterCreate(
  created: Entity,
  originalData: CreateEntity
): Promise<void> {
  console.log('Entity created:', { id: created.id });

  // Send notification
  await this.notificationService.sendCreated(created);

  // Emit WebSocket event
  this.eventService.emit('entity.created', created);

  // Create audit log
  await this.auditService.log('create', 'entity', created.id);
}
```

### Custom Business Method: Approve/Publish

```typescript
async approve(id: string | number, userId: string): Promise<Entity> {
  const existing = await this.getById(id);
  if (!existing) {
    throw new AppError('Record not found', 404, 'NOT_FOUND');
  }

  if (existing.status === 'approved') {
    throw new AppError('Already approved', 400, 'ALREADY_APPROVED');
  }

  return this.update(id, {
    status: 'approved',
    approved_by: userId,
    approved_at: new Date(),
  });
}
```

### Custom Business Method: Bulk Operation

```typescript
async bulkUpdate(
  ids: number[],
  data: UpdateEntity,
  userId: string
): Promise<Entity[]> {
  return this.repository.withTransaction(async (trx) => {
    const results = [];
    for (const id of ids) {
      const updated = await this.update(id, data, userId);
      if (updated) results.push(updated);
    }
    return results;
  });
}
```

### Custom Business Method: Calculate/Compute

```typescript
async calculateTotal(id: string | number): Promise<{
  subtotal: number;
  tax: number;
  total: number;
}> {
  const items = await this.repository.getItems(id);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
```

---

## Repository Patterns

### Custom Query: Find by Unique Field

```typescript
async findByCode(code: string): Promise<Entity | null> {
  const row = await this.knex(this.tableName)
    .where('code', code)
    .first();
  return row ? this.transformToEntity(row) : null;
}
```

### Custom Query: Find with Relations (Join)

```typescript
async findWithRelations(id: string | number): Promise<any> {
  const result = await this.knex(this.tableName)
    .select(
      `${this.tableName}.*`,
      'related_table.name as related_name',
      'another_table.title as another_title'
    )
    .leftJoin('related_table', `${this.tableName}.related_id`, 'related_table.id')
    .leftJoin('another_table', `${this.tableName}.another_id`, 'another_table.id')
    .where(`${this.tableName}.id`, id)
    .first();

  return result;
}
```

### Custom Query: Get Statistics (Aggregation)

```typescript
async getStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  const stats: any = await this.knex(this.tableName)
    .select([
      this.knex.raw('COUNT(*) as total'),
      this.knex.raw('COUNT(*) FILTER (WHERE is_active = true) as active'),
      this.knex.raw('COUNT(*) FILTER (WHERE is_active = false) as inactive'),
    ])
    .first();

  return {
    total: parseInt(stats?.total || '0'),
    active: parseInt(stats?.active || '0'),
    inactive: parseInt(stats?.inactive || '0'),
  };
}
```

### Custom Query: Search with Complex Conditions

```typescript
async searchAdvanced(params: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}): Promise<Entity[]> {
  let query = this.knex(this.tableName).select('*');

  if (params.keyword) {
    query = query.where((builder) => {
      builder
        .where('name', 'ilike', `%${params.keyword}%`)
        .orWhere('description', 'ilike', `%${params.keyword}%`);
    });
  }

  if (params.category) {
    query = query.where('category', params.category);
  }

  if (params.minPrice !== undefined) {
    query = query.where('price', '>=', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.where('price', '<=', params.maxPrice);
  }

  if (params.status) {
    query = query.where('status', params.status);
  }

  const rows = await query;
  return rows.map((row) => this.transformToEntity(row));
}
```

### Custom Query: Hierarchical Tree

```typescript
async getHierarchy(parentId?: number | null): Promise<HierarchyNode[]> {
  const allItems = await this.knex(this.tableName)
    .select('id', 'name', 'parent_id')
    .where('is_active', true)
    .orderBy('name', 'asc');

  const buildTree = (parent: number | null): HierarchyNode[] => {
    return allItems
      .filter((item) => item.parent_id === parent)
      .map((item) => ({
        id: item.id,
        name: item.name,
        parent_id: item.parent_id,
        children: buildTree(item.id),
      }));
  };

  return buildTree(parentId ?? null);
}
```

### Validation: Check Foreign Key Exists

```typescript
async validateForeignKey(foreignId: number): Promise<boolean> {
  const exists = await this.knex('foreign_table')
    .where('id', foreignId)
    .where('is_active', true)
    .first();

  return !!exists;
}
```

### Validation: Check for References (Before Delete)

```typescript
async hasReferences(id: string | number): Promise<boolean> {
  const count = await this.knex('related_table')
    .where('foreign_id', id)
    .count('* as count')
    .first();

  return parseInt((count?.count as string) || '0') > 0;
}
```

### Validation: Check Circular Reference

```typescript
async hasCircularReference(
  itemId: number,
  newParentId: number | null
): Promise<boolean> {
  if (!newParentId) return false;

  let currentId: number | null = newParentId;
  const visited = new Set<number>();

  while (currentId !== null) {
    if (currentId === itemId) {
      return true; // Circular reference detected
    }

    if (visited.has(currentId)) {
      break; // Prevent infinite loop
    }
    visited.add(currentId);

    const parent = await this.knex(this.tableName)
      .select('parent_id')
      .where('id', currentId)
      .first();

    currentId = parent?.parent_id ?? null;
  }

  return false;
}
```

### Bulk Operations: Create Many

```typescript
async createMany(data: CreateEntity[]): Promise<Entity[]> {
  const transformedData = data.map((item) => this.transformToDb(item));
  const rows = await this.knex(this.tableName)
    .insert(transformedData)
    .returning('*');
  return rows.map((row) => this.transformToEntity(row));
}
```

### Bulk Operations: Update Many

```typescript
async updateMany(ids: number[], data: Partial<Entity>): Promise<number> {
  return this.knex(this.tableName)
    .whereIn('id', ids)
    .update(this.transformToDb(data));
}
```

### Transaction: Complex Multi-Step Operation

```typescript
async complexOperation(data: ComplexData): Promise<Result> {
  return this.withTransaction(async (trx) => {
    // Step 1: Create main record
    const [mainRecord] = await trx(this.tableName)
      .insert(data.main)
      .returning('*');

    // Step 2: Create related records
    const relatedData = data.related.map((item) => ({
      ...item,
      main_id: mainRecord.id,
    }));
    await trx('related_table').insert(relatedData);

    // Step 3: Update aggregates
    await trx('summary_table')
      .where('id', data.summaryId)
      .increment('count', 1);

    return this.transformToEntity(mainRecord);
  });
}
```

### Soft Delete Implementation

```typescript
async delete(id: string | number): Promise<boolean> {
  const updated = await this.knex(this.tableName)
    .where('id', id)
    .update({
      deleted_at: new Date(),
      is_active: false,
    });

  return updated > 0;
}

async restore(id: string | number): Promise<boolean> {
  const updated = await this.knex(this.tableName)
    .where('id', id)
    .update({
      deleted_at: null,
      is_active: true,
    });

  return updated > 0;
}

// Override to exclude soft-deleted records
protected applyCustomFilters(
  query: Knex.QueryBuilder,
  filters: any
): void {
  super.applyCustomFilters(query, filters);

  if (!filters.includeDeleted) {
    query.whereNull(`${this.tableName}.deleted_at`);
  }
}
```

---

## Controller Patterns

### Standard CRUD Handler with Error Handling

```typescript
async create(
  request: FastifyRequest<{ Body: CreateEntity }>,
  reply: FastifyReply
) {
  try {
    request.log.info({ body: request.body }, 'Creating entity');
    const userId = request.user?.id;

    const entity = await this.service.create(request.body, userId);

    request.log.info({ entityId: entity.id }, 'Entity created');

    // Emit WebSocket event
    this.events.emitCreated(entity);

    return reply.code(201).success(entity, 'Entity created successfully');
  } catch (error: any) {
    request.log.error(
      {
        error,
        errorMessage: error.message,
        body: request.body,
      },
      'Error creating entity'
    );
    throw error;
  }
}
```

### Custom Endpoint Handler: Approve/Publish

```typescript
async approve(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { notes?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const userId = request.user?.id;

    request.log.info({ entityId: id }, 'Approving entity');

    const entity = await this.service.approve(id, userId);

    this.events.emitUpdated(entity);

    return reply.success(entity, 'Entity approved successfully');
  } catch (error) {
    request.log.error({ error, entityId: request.params.id }, 'Error approving');
    throw error;
  }
}
```

### Custom Endpoint Handler: Bulk Operation

```typescript
async bulkUpdate(
  request: FastifyRequest<{
    Body: { ids: number[]; data: UpdateEntity };
  }>,
  reply: FastifyReply
) {
  try {
    request.log.info({ ids: request.body.ids }, 'Bulk updating entities');

    const results = await this.service.bulkUpdate(
      request.body.ids,
      request.body.data,
      request.user?.id
    );

    return reply.success({
      updated: results.length,
      items: results,
    });
  } catch (error) {
    request.log.error({ error }, 'Error bulk updating');
    throw error;
  }
}
```

### Custom Endpoint Handler: Statistics

```typescript
async stats(request: FastifyRequest, reply: FastifyReply) {
  try {
    request.log.info({}, 'Fetching statistics');

    const stats = await this.service.getStats();

    return reply.success(stats);
  } catch (error) {
    request.log.error({ error }, 'Error fetching statistics');
    throw error;
  }
}
```

### Custom Endpoint Handler: Dropdown List

```typescript
async dropdown(
  request: FastifyRequest<{ Querystring: { search?: string } }>,
  reply: FastifyReply
) {
  try {
    const dropdownItems = await this.service.getDropdown(request.query.search);

    return reply.success({
      options: dropdownItems,
      total: dropdownItems.length,
    });
  } catch (error) {
    request.log.error({ error }, 'Error fetching dropdown');
    throw error;
  }
}
```

### Custom Endpoint Handler: Download/Export

```typescript
async export(
  request: FastifyRequest<{ Querystring: { format: 'csv' | 'excel' } }>,
  reply: FastifyReply
) {
  try {
    const { format } = request.query;

    const data = await this.service.exportData(format);

    reply.header('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel');
    reply.header('Content-Disposition', `attachment; filename=export.${format}`);

    return reply.send(data);
  } catch (error) {
    request.log.error({ error }, 'Error exporting data');
    throw error;
  }
}
```

---

## Route Patterns

### Custom Route: Action Endpoint (POST /:id/action)

```typescript
// IMPORTANT: Add BEFORE /:id route
fastify.post('/:id/approve', {
  schema: {
    tags: ['Entities'],
    summary: 'Approve entity',
    params: EntityIdParamSchema,
    body: ApproveEntitySchema,
    response: {
      200: EntityResponseSchema,
      404: SchemaRefs.NotFound,
      400: SchemaRefs.ValidationError,
    },
  },
  preValidation: [fastify.authenticate, fastify.verifyPermission('entities', 'update')],
  handler: controller.approve.bind(controller),
});
```

### Custom Route: Bulk Operation

```typescript
fastify.patch('/bulk', {
  schema: {
    tags: ['Entities'],
    summary: 'Bulk update entities',
    body: Type.Object({
      ids: Type.Array(Type.Integer(), { minItems: 1, maxItems: 100 }),
      data: UpdateEntitySchema,
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
  preValidation: [fastify.authenticate],
  handler: controller.bulkUpdate.bind(controller),
});
```

### Custom Route: Statistics Endpoint

```typescript
// IMPORTANT: Add BEFORE /:id route
fastify.get('/stats', {
  schema: {
    tags: ['Entities'],
    summary: 'Get entity statistics',
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: StatsSchema,
        },
      },
    },
  },
  preValidation: [fastify.authenticate, fastify.verifyPermission('entities', 'read')],
  handler: controller.stats.bind(controller),
});
```

### Custom Route: Dropdown List

```typescript
// IMPORTANT: Add BEFORE /:id route
fastify.get('/dropdown', {
  schema: {
    tags: ['Entities'],
    summary: 'Get dropdown list',
    querystring: Type.Object({
      search: Type.Optional(Type.String()),
    }),
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              options: { type: 'array' },
              total: { type: 'number' },
            },
          },
        },
      },
    },
  },
  preValidation: [fastify.authenticate],
  handler: controller.dropdown.bind(controller),
});
```

### Custom Route: Export/Download

```typescript
fastify.get('/export', {
  schema: {
    tags: ['Entities'],
    summary: 'Export entities',
    querystring: Type.Object({
      format: Type.Union([Type.Literal('csv'), Type.Literal('excel')]),
    }),
  },
  preValidation: [fastify.authenticate, fastify.verifyPermission('entities', 'read')],
  handler: controller.export.bind(controller),
});
```

---

## Schema Patterns

### Custom Request Schema

```typescript
export const ApproveEntitySchema = Type.Object({
  notes: Type.Optional(Type.String({ maxLength: 500 })),
  approved_by: Type.Optional(Type.String({ format: 'uuid' })),
});

export type ApproveEntity = Static<typeof ApproveEntitySchema>;
```

### Bulk Operation Schema

```typescript
export const BulkUpdateEntitySchema = Type.Object({
  ids: Type.Array(Type.Integer({ minimum: 1 }), {
    minItems: 1,
    maxItems: 100,
    description: 'Entity IDs to update (max 100)',
  }),
  data: UpdateEntitySchema,
});

export type BulkUpdateEntity = Static<typeof BulkUpdateEntitySchema>;
```

### Statistics Response Schema

```typescript
export const EntityStatsSchema = Type.Object({
  total: Type.Integer(),
  active: Type.Integer(),
  inactive: Type.Integer(),
  by_category: Type.Optional(
    Type.Array(
      Type.Object({
        category: Type.String(),
        count: Type.Integer(),
      }),
    ),
  ),
});

export type EntityStats = Static<typeof EntityStatsSchema>;
```

### Dropdown Item Schema

```typescript
export const DropdownItemSchema = Type.Object({
  value: Type.Union([Type.Integer(), Type.String()]),
  label: Type.String(),
  description: Type.Optional(Type.String()),
  disabled: Type.Optional(Type.Boolean()),
});

export type DropdownItem = Static<typeof DropdownItemSchema>;
```

### Advanced Query Schema

```typescript
export const AdvancedSearchSchema = Type.Object({
  keyword: Type.Optional(Type.String()),
  category: Type.Optional(Type.String()),
  status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('pending')])),
  minPrice: Type.Optional(Type.Number({ minimum: 0 })),
  maxPrice: Type.Optional(Type.Number({ minimum: 0 })),
  dateFrom: Type.Optional(Type.String({ format: 'date' })),
  dateTo: Type.Optional(Type.String({ format: 'date' })),
});

export type AdvancedSearch = Static<typeof AdvancedSearchSchema>;
```

---

## Error Handling Patterns

### AppError: Basic Usage

```typescript
import { AppError } from '../../../core/errors/app-error';

throw new AppError(
  'Human-readable error message',
  400, // HTTP status code
  'ERROR_CODE', // Machine-readable code
  { field: 'value' }, // Additional context
);
```

### AppError: Common Status Codes

```typescript
// 400 Bad Request - Invalid input
throw new AppError('Invalid price', 400, 'INVALID_PRICE', { price: -100 });

// 401 Unauthorized - Not authenticated
throw new AppError('Authentication required', 401, 'UNAUTHORIZED');

// 403 Forbidden - No permission
throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');

// 404 Not Found - Resource doesn't exist
throw new AppError('Entity not found', 404, 'NOT_FOUND', { id: 123 });

// 409 Conflict - Duplicate/conflict
throw new AppError('Code already exists', 409, 'CODE_EXISTS', { code: 'ABC' });

// 422 Unprocessable Entity - Business rule violation
throw new AppError('Cannot delete with references', 422, 'HAS_REFERENCES');

// 500 Internal Server Error - Unexpected error
throw new AppError('Database connection failed', 500, 'DB_ERROR');
```

### Error Code Enum

```typescript
// In [feature].types.ts
export enum EntityErrorCode {
  CODE_EXISTS = 'ENTITY_CODE_EXISTS',
  INVALID_PARENT = 'ENTITY_INVALID_PARENT',
  CIRCULAR_REFERENCE = 'ENTITY_CIRCULAR_REFERENCE',
  HAS_REFERENCES = 'ENTITY_HAS_REFERENCES',
  ALREADY_APPROVED = 'ENTITY_ALREADY_APPROVED',
}

export const EntityErrorMessages: Record<EntityErrorCode, string> = {
  [EntityErrorCode.CODE_EXISTS]: 'Entity code already exists',
  [EntityErrorCode.INVALID_PARENT]: 'Invalid parent entity',
  [EntityErrorCode.CIRCULAR_REFERENCE]: 'Cannot create circular reference',
  [EntityErrorCode.HAS_REFERENCES]: 'Cannot delete entity with references',
  [EntityErrorCode.ALREADY_APPROVED]: 'Entity already approved',
};
```

### Try-Catch with Logging

```typescript
async create(request, reply) {
  try {
    request.log.info({ body: request.body }, 'Creating entity');

    const entity = await this.service.create(request.body, userId);

    request.log.info({ entityId: entity.id }, 'Entity created');
    return reply.code(201).success(entity);

  } catch (error: any) {
    request.log.error(
      {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        body: request.body,
        userId,
      },
      'Error creating entity'
    );
    throw error; // Re-throw to let Fastify handle it
  }
}
```

---

## Usage Tips

### Copy-Paste Workflow

1. **Identify the pattern** you need from the table of contents
2. **Copy the code** to your file
3. **Replace placeholders**:
   - `Entity` → Your entity name (e.g., `Product`, `Department`)
   - `entity` → Lowercase entity name
   - `entities` → Plural entity name
   - Field names to match your schema
4. **Test the code** with `pnpm run build`

### Customization Checklist

When adding a new custom feature:

- [ ] Add TypeBox schema in `schemas.ts`
- [ ] Add business logic method in `service.ts`
- [ ] Add database query method in `repository.ts` (if needed)
- [ ] Add handler in `controller.ts`
- [ ] Register route in `routes.ts` (BEFORE /:id)
- [ ] Add error codes in `types.ts`
- [ ] Test with curl or api-endpoint-tester
- [ ] Update API contract documentation

---

**Remember:** Most customizations start in the Service Layer! Put business logic in services, data access in repositories, and keep controllers thin.
