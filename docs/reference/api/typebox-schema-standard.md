# TypeBox Schema Standard

> **🚨 MANDATORY**: All API routes MUST use TypeBox schemas for type safety and validation

## Overview

This project uses **TypeBox** for schema definition, providing both runtime validation and compile-time type safety. All routes must follow this standard without exception.

## Core Requirements

### 1. **Use TypeBox for All Schemas** ✅

```typescript
// ✅ CORRECT - Using TypeBox
import { Type, Static } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
});

// ❌ WRONG - Plain JSON Schema
export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
```

### 2. **Use Base Response Schemas** ✅

```typescript
import { ApiSuccessResponseSchema, ApiErrorResponseSchema } from '../../schemas/base.schemas';

// ✅ CORRECT - Reusing base schemas
export const UserResponseSchema = ApiSuccessResponseSchema(UserSchema);

// ❌ WRONG - Defining custom response structure
export const userResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: userSchema,
  },
};
```

### 3. **Register Schemas via Registry** ✅

```typescript
// In module plugin
export default fp(async function userPlugin(fastify: FastifyInstance) {
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // ✅ CORRECT - Using schema registry
  typedFastify.schemaRegistry.registerModuleSchemas('user', userSchemas);

  // ❌ WRONG - Direct registration
  Object.values(userSchemas).forEach((schema) => fastify.addSchema(schema));
});
```

### 4. **Use Type Provider in Routes** ✅

```typescript
export async function userRoutes(fastify: FastifyInstance) {
  // ✅ CORRECT - Using type provider
  const typedFastify = fastify.withTypeProvider<TypeBoxTypeProvider>();

  typedFastify.route({
    method: 'GET',
    url: '/users/:id',
    schema: {
      params: UuidParamSchema,
      response: {
        200: SchemaRefs.module('user', 'user-response'),
        404: SchemaRefs.NotFound,
        500: SchemaRefs.ServerError,
      },
    },
    handler: async (request, reply) => {
      // request.params is fully typed!
      const { id } = request.params;
    },
  });
}
```

## Schema Organization

### File Structure

```
src/
├── schemas/
│   ├── base.schemas.ts      # Core schemas (DO NOT MODIFY)
│   └── registry.ts          # Schema registry (DO NOT MODIFY)
└── modules/
    └── [module]/
        ├── [module].schemas.ts  # Module schemas (TypeBox)
        ├── [module].types.ts    # Exported types
        └── [module].routes.ts   # Routes using schemas
```

### Module Schema File Template

```typescript
// user.schemas.ts
import { Type, Static } from '@sinclair/typebox';
import { ApiSuccessResponseSchema } from '../../schemas/base.schemas';

// Data schemas
export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
});

// Request schemas
export const CreateUserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  password: Type.String({ minLength: 8 }),
});

// Response schemas
export const UserResponseSchema = ApiSuccessResponseSchema(UserSchema);
export const UserListResponseSchema = ApiSuccessResponseSchema(
  Type.Object({
    items: Type.Array(UserSchema),
    pagination: Type.Object({
      page: Type.Number(),
      limit: Type.Number(),
      total: Type.Number(),
    }),
  }),
);

// TypeScript types
export type User = Static<typeof UserSchema>;
export type CreateUser = Static<typeof CreateUserSchema>;
export type UserResponse = Static<typeof UserResponseSchema>;

// Schema export for registration
export const userSchemas = {
  user: UserSchema,
  'create-user': CreateUserSchema,
  'user-response': UserResponseSchema,
  'user-list-response': UserListResponseSchema,
};
```

## Common Patterns

### 1. Query Parameters

```typescript
import { PaginationQuerySchema, SearchQuerySchema } from '../../schemas/base.schemas';

// Extend base query schemas
const UserQuerySchema = Type.Intersect([
  PaginationQuerySchema,
  SearchQuerySchema,
  Type.Object({
    role: Type.Optional(Type.String()),
    status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
  }),
]);
```

### 2. Error Responses

```typescript
// Use predefined error responses
response: {
  200: SchemaRefs.module('user', 'user-response'),
  400: SchemaRefs.ValidationError,  // Validation errors
  401: SchemaRefs.Unauthorized,     // Auth required
  403: SchemaRefs.Forbidden,        // No permission
  404: SchemaRefs.NotFound,         // Resource not found
  409: SchemaRefs.Conflict,         // Duplicate/conflict
  500: SchemaRefs.ServerError       // Server errors
}
```

### 3. Nested Objects

```typescript
const AddressSchema = Type.Object({
  street: Type.String(),
  city: Type.String(),
  postalCode: Type.String({ pattern: '^\\d{5}$' }),
});

const UserWithAddressSchema = Type.Object({
  ...UserSchema.properties,
  address: Type.Optional(AddressSchema),
});
```

### 4. Arrays and Enums

```typescript
const RoleSchema = Type.Union([Type.Literal('admin'), Type.Literal('user'), Type.Literal('guest')]);

const PermissionsSchema = Type.Array(Type.String(), { minItems: 0, maxItems: 50 });
```

## Validation Rules

### 1. String Validation

```typescript
Type.String({
  minLength: 1,
  maxLength: 255,
  pattern: '^[a-zA-Z0-9]+$',
  format: 'email', // or 'date-time', 'uuid', 'uri'
});
```

### 2. Number Validation

```typescript
Type.Number({
  minimum: 0,
  maximum: 100,
  multipleOf: 0.01, // For decimals
});
```

### 3. Required vs Optional

```typescript
Type.Object({
  required: Type.String(), // Required field
  optional: Type.Optional(Type.String()), // Optional field
});
```

## Migration Checklist

When migrating a module to TypeBox:

- [ ] Convert all JSON schemas to TypeBox
- [ ] Use base response schemas
- [ ] Export TypeScript types
- [ ] Update plugin to use schema registry
- [ ] Add type provider to routes
- [ ] Update route schema references
- [ ] Test all endpoints
- [ ] Remove old schema files

## Benefits

1. **Type Safety**: Full TypeScript type inference
2. **Performance**: Faster validation than JSON Schema
3. **Developer Experience**: Better IDE support
4. **Consistency**: Standardized response formats
5. **Maintainability**: Single source of truth

## References

- [TypeBox Documentation](https://github.com/sinclairzx81/typebox)
- [Fastify Type Providers](https://fastify.dev/docs/latest/Reference/Type-Providers/)
- Base schemas: `/src/schemas/base.schemas.ts`
- Schema registry: `/src/schemas/registry.ts`
