# Schema Migration Guide: JSON Schema to TypeBox

This guide explains how to migrate from JSON Schema to TypeBox for better type safety and developer experience in our Fastify application.

## Overview

We've implemented a centralized schema system using TypeBox that provides:

- **Compile-time type inference**: TypeScript types are automatically generated from schemas
- **Better IDE support**: Full autocomplete and type checking
- **Improved performance**: More efficient schema compilation
- **Reduced duplication**: Centralized base schemas prevent repetition
- **Backward compatibility**: Legacy schema references continue to work

## New Architecture

```
schemas/
├── base.schemas.ts        # Core schemas used across all modules
├── registry.ts           # Centralized schema registry system
└── modules/
    ├── auth/             # Module-specific schemas
    ├── navigation/
    └── user-profile/
```

## Migration Steps

### 1. Base Schema Usage

**Old approach:**

```typescript
// Each module defined its own response schemas
const apiErrorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', const: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};
```

**New approach:**

```typescript
import { Type } from '@sinclair/typebox';
import { ApiSuccessResponseSchema, StandardRouteResponses } from '../../schemas/base.schemas';

// Use centralized schemas
const UserResponseSchema = ApiSuccessResponseSchema(UserSchema);

// Route definitions use standardized patterns
export const UserRouteSchemas = {
  getUser: {
    params: UuidParamSchema,
    response: {
      200: UserResponseSchema,
      ...StandardRouteResponses[404],
      ...StandardRouteResponses[500],
    },
  },
};
```

### 2. TypeBox Schema Definition

**Old JSON Schema:**

```typescript
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    isActive: { type: 'boolean' },
  },
  required: ['id', 'email', 'name'],
};
```

**New TypeBox Schema:**

```typescript
import { Type, Static } from '@sinclair/typebox';

const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  isActive: Type.Boolean({ default: true }),
});

// Automatic TypeScript type generation
type User = Static<typeof UserSchema>;
```

### 3. Module Schema Registration

**Old approach:**

```typescript
// In module plugin
Object.values(moduleSchemas).forEach((schema) => fastify.addSchema(schema));
```

**New approach:**

```typescript
// In module plugin
server.schemaRegistry.registerModuleSchemas('moduleName', ModuleSchemas);
```

### 4. Route Schema References

**Old approach:**

```typescript
response: {
  200: { $ref: 'userResponse#' },
  404: { $ref: 'notFoundResponse#' },
  500: { $ref: 'serverErrorResponse#' }
}
```

**New approach:**

```typescript
import { SchemaRefs, StandardRouteResponses } from '../../schemas/registry';

response: {
  200: SchemaRefs.module('user', 'response'),
  ...StandardRouteResponses[404],
  ...StandardRouteResponses[500]
}
```

## Best Practices

### 1. Schema Organization

- **Base schemas**: Common patterns (responses, pagination, etc.)
- **Module schemas**: Feature-specific entities and operations
- **Validation schemas**: Request body and query parameter validation

### 2. Naming Conventions

- Use kebab-case for schema IDs: `user-profile`, `navigation-item`
- Prefix module schemas: `auth-user`, `navigation-badge`
- Use descriptive names: `create-user-request`, `user-list-response`

### 3. Type Safety

```typescript
// Import types from schema definitions
import { User, CreateUserRequest, UserListResponse } from './user.schemas';

// Use in controller methods
async createUser(request: FastifyRequest<{ Body: CreateUserRequest }>): Promise<User> {
  // TypeScript will enforce type safety
  const userData = request.body; // Typed as CreateUserRequest
  return this.userService.create(userData);
}
```

### 4. Schema Composition

```typescript
// Base user schema
const BaseUserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
});

// Extended schemas
const PublicUserSchema = Type.Omit(BaseUserSchema, ['email']);
const CreateUserSchema = Type.Omit(BaseUserSchema, ['id']);
const UpdateUserSchema = Type.Partial(CreateUserSchema);
```

### 5. Validation Helpers

```typescript
// Create validation functions from schemas
export const validateUser = (data: unknown): data is User => {
  return Value.Check(UserSchema, data);
};

// Use in services
if (!validateUser(userData)) {
  throw new Error('Invalid user data');
}
```

## Performance Benefits

1. **Faster Compilation**: TypeBox generates more efficient validation code
2. **Better Serialization**: Optimized JSON serialization based on schema
3. **Reduced Memory Usage**: Shared schema references reduce duplication
4. **JIT Optimization**: V8 can better optimize the validation functions

## Backward Compatibility

The migration maintains compatibility with existing code:

- Legacy schema IDs still work: `serverErrorResponse#`, `validationErrorResponse#`
- Existing route definitions continue to function
- Gradual migration is supported - modules can be updated one at a time

## Migration Checklist

For each module:

- [ ] Convert JSON Schemas to TypeBox schemas
- [ ] Extract TypeScript types using `Static<typeof Schema>`
- [ ] Update plugin to use schema registry
- [ ] Replace direct `addSchema` calls with `registerModuleSchemas`
- [ ] Update route definitions to use new schema references
- [ ] Update controller methods to use inferred types
- [ ] Add unit tests for schema validation
- [ ] Update documentation

## Common Pitfalls

1. **Schema ID Conflicts**: Ensure unique IDs across modules
2. **Circular References**: Use `Type.Recursive()` for self-referencing schemas
3. **Type Imports**: Import types from schema files, not from external sources
4. **Validation Errors**: Handle TypeBox validation errors appropriately

## Example: Complete Module Migration

See `navigation.schemas.new.ts` and `navigation.plugin.new.ts` for complete examples of the new pattern.

## Next Steps

1. Migrate high-priority modules first (auth, navigation)
2. Update integration tests to use new type definitions
3. Remove deprecated schema files after successful migration
4. Consider adding schema validation middleware for additional safety
