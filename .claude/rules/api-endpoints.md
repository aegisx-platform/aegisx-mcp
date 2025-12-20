---
paths: apps/api/src/**/*.route.ts
---

# API Endpoint Development Rules

**NOTE**: For complete route examples and plugin patterns, see `inventory-domain.md`

## CRITICAL: Fastify Error Handling

### ❌ NEVER throw in preValidation hooks

```typescript
// ❌ WRONG: Causes FST_ERR_FAILED_ERROR_SERIALIZATION and timeout
fastify.addHook('preValidation', async (request, reply) => {
  if (!request.headers.authorization) {
    throw new Error('Unauthorized'); // THIS WILL HANG THE REQUEST!
  }
});
```

### ✅ ALWAYS return reply methods

```typescript
// ✅ CORRECT: Use reply methods
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
reply.internalServerError('Server error'); // 500

reply.code(200).send(data); // 200 OK
reply.code(201).send(data); // 201 Created
reply.code(204).send(); // 204 No Content
```

## Authentication & Authorization

### CRITICAL: Use Fastify Decorators (NOT function calls)

```typescript
// ✅ CORRECT: Use fastify decorators
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

## Schema Registry Pattern

### Use SchemaRefs for Error Responses

```typescript
import { SchemaRefs } from '../../../../../schemas/registry';

// ✅ CORRECT: Use centralized schemas
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

// ❌ WRONG: Define schemas inline
response: {
  400: Type.Object({
    statusCode: Type.Number(),
    error: Type.String(),
    message: Type.String()
  })
}
```

## TypeBox Schema Validation

### Required Validation Patterns

```typescript
import { Type } from '@sinclair/typebox';

// ✅ CORRECT: Comprehensive schema
const CreateItemSchema = Type.Object({
  // UUID fields MUST have format validation
  id: Type.String({ format: 'uuid' }),
  category_id: Type.String({ format: 'uuid' }),

  // String fields with length limits
  name: Type.String({ minLength: 1, maxLength: 255 }),
  code: Type.String({ pattern: '^[A-Z0-9-]+$' }),

  // Number validation
  quantity: Type.Number({ minimum: 0 }),
  price: Type.Number({ minimum: 0, maximum: 999999999.99 }),

  // Date validation
  manufacture_date: Type.String({ format: 'date' }),

  // Enum validation
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),

  // Optional fields
  description: Type.Optional(Type.String()),
});

// ❌ WRONG: Missing validation
const CreateItemSchema = Type.Object({
  id: Type.String(), // Missing UUID format!
  name: Type.String(), // No length limits!
  quantity: Type.Number(), // Can be negative!
  status: Type.String(), // No enum validation!
});
```

## Route Definition Pattern

```typescript
// apps/api/src/layers/domains/inventory/master-data/drugs/drugs.route.ts
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DrugsController } from './drugs.controller';
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
        500: SchemaRefs.ServerError,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'create')],
    handler: controller.create.bind(controller),
  });

  // Get by ID
  fastify.get('/:id', {
    schema: {
      params: DrugsIdParamSchema,
      response: {
        200: DrugsResponseSchema,
        404: SchemaRefs.NotFound,
      },
    },
    preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'read')],
    handler: controller.findOne.bind(controller),
  });
}
```

## Standard CRUD Endpoints

```typescript
// Resource URLs
GET    /api/inventory/master-data/drugs           # List all
POST   /api/inventory/master-data/drugs           # Create new
GET    /api/inventory/master-data/drugs/:id       # Get one
PUT    /api/inventory/master-data/drugs/:id       # Update
DELETE /api/inventory/master-data/drugs/:id       # Delete
```

## Common Mistakes

### ❌ WRONG: Throwing in hooks

```typescript
fastify.addHook('preValidation', async (request, reply) => {
  throw new Error('Unauthorized'); // DON'T!
});
```

### ✅ CORRECT: Return reply

```typescript
fastify.addHook('preValidation', async (request, reply) => {
  return reply.unauthorized('Authentication required');
});
```

### ❌ WRONG: Calling decorators as functions

```typescript
preValidation: [authenticate(), authorize('drugs')];
```

### ✅ CORRECT: Use decorators directly

```typescript
preValidation: [fastify.authenticate, fastify.verifyPermission('drugs', 'create')];
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

## Quick Reference Checklist

- ✅ Use `SchemaRefs` for error responses
- ✅ Use `fastify.authenticate` decorator (not `authenticate()`)
- ✅ UUID fields have `format: 'uuid'`
- ✅ Return `reply` methods in hooks (never throw)
- ✅ Response schemas match actual data
- ✅ Pagination for list endpoints
- ✅ Input validation for all fields

**For complete examples, see `inventory-domain.md`**
