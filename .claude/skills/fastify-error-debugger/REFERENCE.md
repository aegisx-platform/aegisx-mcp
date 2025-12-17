# Fastify Error Debugger Reference

Quick reference for common Fastify error serialization patterns and fixes.

## Status Code Decision Matrix

| Error Type       | Status Code | Schema                              | Error Code Format                  | Example                                      |
| ---------------- | ----------- | ----------------------------------- | ---------------------------------- | -------------------------------------------- |
| Input validation | 400         | `ValidationErrorResponseSchema`     | `Type.Literal('VALIDATION_ERROR')` | Missing required field, wrong type           |
| Business logic   | 422         | `UnprocessableEntityResponseSchema` | `Type.String()` (any code)         | User has no department, insufficient balance |
| Authentication   | 401         | `UnauthorizedResponseSchema`        | `Type.Literal('UNAUTHORIZED')`     | Missing token, invalid token                 |
| Authorization    | 403         | `ForbiddenResponseSchema`           | `Type.Literal('FORBIDDEN')`        | No permission, wrong role                    |
| Not found        | 404         | `NotFoundResponseSchema`            | `Type.String()`                    | Resource doesn't exist                       |
| Server error     | 500         | `InternalServerErrorResponseSchema` | `Type.String()`                    | Unexpected errors                            |

## Error Code Patterns

### Pattern: VALIDATION_ERROR (400)

**When to use:**

- Request body fails TypeBox schema validation
- Query parameters wrong type/format
- Path parameters invalid
- Missing required fields

**Schema:**

```typescript
export const ValidationErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('VALIDATION_ERROR'),
    message: Type.String(),
    details: Type.Optional(
      Type.Array(
        Type.Object({
          field: Type.String(),
          message: Type.String(),
          value: Type.Optional(Type.Any()),
        }),
      ),
    ),
    statusCode: Type.Literal(400),
  }),
  meta: MetaResponseSchema,
});
```

**Example errors:**

```typescript
// ✅ Correct - 400 for validation
{
  statusCode: 400,
  code: 'VALIDATION_ERROR',
  message: 'Validation failed',
  details: [
    { field: 'fiscal_year', message: 'must be integer', value: 'abc' }
  ]
}
```

### Pattern: Business Logic Errors (422)

**When to use:**

- Valid input but business rules fail
- State transition not allowed
- Insufficient balance/quota
- Dependency constraints
- User not assigned to department

**Schema:**

```typescript
export const UnprocessableEntityResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(), // ← Any string allowed
    message: Type.String(),
    details: Type.Optional(Type.Any()),
    statusCode: Type.Literal(422),
  }),
  meta: MetaResponseSchema,
});
```

**Example errors:**

```typescript
// ✅ Correct - 422 for business logic
{
  statusCode: 422,
  code: 'USER_NO_DEPARTMENT',
  message: 'You are not assigned to a department'
}

{
  statusCode: 422,
  code: 'INSUFFICIENT_BALANCE',
  message: 'Account balance is insufficient'
}

{
  statusCode: 422,
  code: 'INVALID_STATE_TRANSITION',
  message: 'Cannot transition from APPROVED to DRAFT'
}
```

## Common Mismatches & Fixes

### Mismatch 1: Business Logic Using 400

**Problem:**

```typescript
// Service layer
const error = new Error('USER_NO_DEPARTMENT: ...') as any;
error.statusCode = 400; // ❌ Wrong - business logic should use 422
error.code = 'USER_NO_DEPARTMENT';
throw error;
```

**Symptom:**

```
FST_ERR_FAILED_ERROR_SERIALIZATION
```

**Fix:**

```typescript
// Change statusCode only
error.statusCode = 422; // ✅ Correct
error.code = 'USER_NO_DEPARTMENT';
throw error;
```

### Mismatch 2: Custom Code on 400

**Problem:**

```typescript
{
  statusCode: 400,
  code: 'CUSTOM_ERROR',  // ❌ 400 only accepts 'VALIDATION_ERROR'
  message: '...'
}
```

**Fix Option A (Recommended):**

```typescript
// Use 422 for custom error codes
{
  statusCode: 422,  // ✅ Accepts any code
  code: 'CUSTOM_ERROR',
  message: '...'
}
```

**Fix Option B:**

```typescript
// If truly a validation error, use standard code
{
  statusCode: 400,
  code: 'VALIDATION_ERROR',  // ✅ Standard code
  message: 'Custom validation message',
  details: [{ field: 'name', message: 'custom rule failed' }]
}
```

### Mismatch 3: Null Values Not Accepted

**Problem:**

```typescript
// Request: { department_id: null }
// Schema:
department_id: Type.Optional(Type.Integer()); // ❌ Only accepts integer or undefined
```

**Symptom:**
TypeBox validation fails before reaching service layer.

**Fix:**

```typescript
// Accept null explicitly
department_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()]));
```

### Mismatch 4: Missing Required Fields

**Problem:**

```typescript
// Error object missing 'success' field
{
  error: {
    code: 'ERROR',
    message: 'Failed'
  }
  // Missing: success: false
}
```

**Fix:**

```typescript
// Always use reply.error() helper
return reply.error('ERROR_CODE', 'Error message', 422);

// Or ensure error structure is complete
throw error; // error-handler.plugin.ts adds all required fields
```

## preValidation Hook Errors (CRITICAL)

### Problem: Throwing Errors Causes Timeout

**Never do this:**

```typescript
async preValidation(request, reply) {
  const user = request.user;

  if (!user) {
    throw new Error('Unauthorized');  // ❌ REQUEST HANGS!
  }

  if (!user.department_id) {
    throw new Error('No department');  // ❌ REQUEST HANGS!
  }
}
```

**Why:** Throwing in preValidation hooks bypasses Fastify's error handling, causing request to hang without response.

**Correct approach:**

```typescript
async preValidation(request, reply) {
  const user = request.user;

  if (!user) {
    return reply.unauthorized('Authentication required');  // ✅ Proper response
  }

  if (!user.department_id) {
    return reply.forbidden('Department access required');  // ✅ Proper response
  }
}
```

**Reference:** `apps/api/src/core/auth/strategies/auth.strategies.ts`

## Schema Type Patterns

### Type.Literal() - Exact Match Only

```typescript
code: Type.Literal('VALIDATION_ERROR');
// ✅ Accepts: 'VALIDATION_ERROR'
// ❌ Rejects: 'USER_NO_DEPARTMENT', 'ANY_OTHER_STRING'
```

### Type.String() - Any String

```typescript
code: Type.String();
// ✅ Accepts: 'VALIDATION_ERROR', 'USER_NO_DEPARTMENT', 'ANY_STRING'
```

### Type.Union() - Multiple Options

```typescript
// Option 1: Multiple literals
code: Type.Union([Type.Literal('VALIDATION_ERROR'), Type.Literal('USER_NO_DEPARTMENT')]);
// ✅ Accepts: 'VALIDATION_ERROR' or 'USER_NO_DEPARTMENT'
// ❌ Rejects: anything else

// Option 2: Type or null
department_id: Type.Union([Type.Integer(), Type.Null()]);
// ✅ Accepts: 123 or null
// ❌ Rejects: undefined, string, etc.

// Option 3: Type or null or undefined (with Optional)
department_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()]));
// ✅ Accepts: 123 or null or undefined
```

### Type.Optional() - Field May Be Missing

```typescript
justification: Type.Optional(Type.String());
// ✅ Accepts: "text" or undefined (field missing)
// ❌ Rejects: null (use Union if null needed)
```

## Error Response Format (Project Standard)

### Success Response

```typescript
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1",
    "requestId": "abc-123",
    "environment": "development"
  }
}
```

### Error Response (400 - Validation)

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "fiscal_year",
        "message": "must be integer",
        "value": "abc"
      }
    ],
    "statusCode": 400
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1",
    "requestId": "abc-123",
    "environment": "development"
  }
}
```

### Error Response (422 - Business Logic)

```typescript
{
  "success": false,
  "error": {
    "code": "USER_NO_DEPARTMENT",
    "message": "You are not assigned to a department. Please contact your administrator.",
    "statusCode": 422
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1",
    "requestId": "abc-123",
    "environment": "development"
  }
}
```

### Error Response (500 - Server Error)

```typescript
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "details": {
      "stack": "Error: ...\n  at ..."  // Only in development
    },
    "statusCode": 500
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1",
    "requestId": "abc-123",
    "environment": "development"
  }
}
```

## Quick Fix Cheat Sheet

| Symptom                              | Quick Check                                      | Quick Fix                                              |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `FST_ERR_FAILED_ERROR_SERIALIZATION` | Check error.statusCode vs route response schemas | Change statusCode to match schema                      |
| `success is required!`               | Check error response structure                   | Use `reply.error()` or let error-handler format        |
| Request timeout (no response)        | Check preValidation hooks                        | Use `return reply.unauthorized()` instead of `throw`   |
| `Body does not match schema`         | Check request payload vs body schema             | Fix request or update schema to accept null with Union |
| Custom error code rejected           | Check schema code field type                     | Use 422 for custom codes, or add to Union literals     |
| TypeBox validation fails on null     | Check Type.Optional() usage                      | Use `Type.Union([Type.Integer(), Type.Null()])`        |

## Diagnostic Commands

### Find Error Source

```bash
# Search for error code
grep -rn "ERROR_CODE_NAME" apps/api/src

# Search for statusCode assignment
grep -rn "statusCode.*400" apps/api/src

# Find where error is thrown
grep -rn "throw.*error" apps/api/src/layers/domains/*/services
```

### Find Route Definition

```bash
# Find route registration
grep -rn "fastify.post.*endpoint-path" apps/api/src

# Find route with response schema
grep -rn "response:.*400" apps/api/src
```

### Check Schema Definitions

```bash
# Find response schema
grep -rn "ValidationErrorResponseSchema" apps/api/src

# Find request schema
grep -rn "CreateSchema" apps/api/src/layers/domains/*/schemas
```

## File Location Quick Reference

### Core Error Handling

- **Base schemas**: `apps/api/src/schemas/base.schemas.ts`
- **Error handler**: `apps/api/src/plugins/error-handler.plugin.ts`
- **Response helpers**: `apps/api/src/plugins/response-handler.plugin.ts`

### Domain Files

- **Routes**: `apps/api/src/layers/domains/[domain]/[feature]/[feature].routes.ts`
- **Service**: `apps/api/src/layers/domains/[domain]/[feature]/[feature].service.ts`
- **Schemas**: `apps/api/src/layers/domains/[domain]/[feature]/[feature].schemas.ts`

### Auth Files

- **Auth strategies**: `apps/api/src/core/auth/strategies/auth.strategies.ts`
- **Auth middleware**: `apps/api/src/core/auth/middleware/`

## Testing Error Responses

### Test with curl

```bash
# Test validation error (400)
curl -X POST http://localhost:3383/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "invalid_type"}'

# Test business logic error (422)
curl -X POST http://localhost:3383/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"valid": "data"}'
```

### Check API logs

```bash
# Watch API logs in real-time
tail -f /tmp/api-*.log

# Or watch process output
pnpm run dev:api
```

### Verify response format

```typescript
// Expected error response
{
  success: false,
  error: {
    code: string,
    message: string,
    statusCode: number,
    details?: any
  },
  meta: {
    timestamp: string,
    version: string,
    requestId: string,
    environment: string
  }
}
```

## Prevention Best Practices

### 1. Use Correct Status Codes

```typescript
// Input validation
error.statusCode = 400;
error.code = 'VALIDATION_ERROR';

// Business logic
error.statusCode = 422;
error.code = 'DESCRIPTIVE_ERROR_CODE';

// Server errors
error.statusCode = 500;
error.code = 'INTERNAL_SERVER_ERROR';
```

### 2. Use Reply Helpers

```typescript
// ✅ Automatic formatting
return reply.error('ERROR_CODE', 'Message', 422);

// Instead of manual throw
throw new Error('...');
```

### 3. Define Complete Schemas

```typescript
// Accept null explicitly when needed
field: Type.Optional(Type.Union([Type.Integer(), Type.Null()]));

// Not just Optional
field: Type.Optional(Type.Integer()); // Doesn't accept null
```

### 4. Never Throw in preValidation

```typescript
// ✅ Return reply
return reply.unauthorized('...');
return reply.forbidden('...');

// ❌ Never throw
throw new Error('...');
```

### 5. Read Logs First

```
When error occurs:
1. ✅ Read API logs
2. ✅ Check error object structure
3. ✅ Compare with route schemas
4. ✅ Trace error source
5. ❌ Don't guess and try random fixes
```
