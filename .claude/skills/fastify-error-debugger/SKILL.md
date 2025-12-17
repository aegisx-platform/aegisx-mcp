---
name: fastify-error-debugger
description: Debug Fastify error serialization failures (FST_ERR_FAILED_ERROR_SERIALIZATION). Automatically detects schema mismatches between thrown errors and response schemas, suggests appropriate fixes. Use when encountering serialization errors, timeout issues, or schema validation failures.
allowed-tools: Read, Grep, Glob, Bash
model: auto
---

# Fastify Error Debugger

Diagnoses and fixes Fastify error serialization failures by analyzing error properties vs response schema expectations.

## Model Selection Strategy

**Auto-detect complexity and choose model:**

### Use Haiku (Fast & Cost-effective) for:

- Simple pattern matching (error code vs schema literal)
- Known error patterns (400 vs 422 mismatch)
- Template-based fixes
- Quick status code adjustments

### Use Sonnet (Deep Analysis) for:

- Complex code tracing across multiple files
- Unknown error patterns requiring investigation
- Multi-layer error propagation
- Custom error handler analysis
- Schema architecture decisions

## When Claude Should Use This Skill

**Trigger Patterns:**

- User reports `FST_ERR_FAILED_ERROR_SERIALIZATION` error
- API request hangs/times out without response
- User says "มันไม่มี success key" or "response ไม่ตรงกับ schema"
- Error response doesn't match documented schema
- `reply.send()` validation fails

**Specific Error Messages:**

```
FST_ERR_FAILED_ERROR_SERIALIZATION: Failed to serialize error response
FST_ERR_VALIDATION: Body/Response doesn't match schema
Request timeout (no response after 30s+)
```

## Diagnostic Workflow

### Phase 1: Quick Analysis (Use Haiku)

**Step 1: Identify Error Pattern**

Check user's error message for:

```
statusCode: 400
code: 'CUSTOM_ERROR_CODE'  // Not 'VALIDATION_ERROR'
```

**Step 2: Check Route Response Schemas**

Read the route file and find response schema for that status code:

```typescript
schema: {
  response: {
    400: ValidationErrorResponseSchema,  // Only accepts code: 'VALIDATION_ERROR'
    422: UnprocessableEntityResponseSchema,  // Accepts any error code
  }
}
```

**Step 3: Identify Mismatch**

Compare:

- **Error thrown**: `statusCode: 400`, `code: 'USER_NO_DEPARTMENT'`
- **Schema expects**: `statusCode: 400`, `code: Type.Literal('VALIDATION_ERROR')`
- **Mismatch**: ❌ 400 schema expects literal 'VALIDATION_ERROR', got 'USER_NO_DEPARTMENT'

**Step 4: Suggest Quick Fix**

```typescript
// Fix: Change status code to match error type
error.statusCode = 422; // Business logic error
```

**If fix is obvious, stop here and use Haiku.**

### Phase 2: Deep Analysis (Use Sonnet)

**Trigger conditions for Sonnet:**

- Multiple potential error sources
- Error thrown from deeply nested service layer
- Custom error handlers involved
- Schema inheritance/composition
- Unknown error pattern

**Step 1: Trace Error Source**

Use Grep to find where error is thrown:

```bash
grep -rn "USER_NO_DEPARTMENT" apps/api/src
grep -rn "statusCode.*400" apps/api/src/layers/domains/*/services
```

**Step 2: Read Error Handler Plugin**

```typescript
// Check apps/api/src/plugins/error-handler.plugin.ts
// Understand how errors are serialized
```

**Step 3: Analyze Schema Hierarchy**

Read base schemas:

```typescript
// apps/api/src/schemas/base.schemas.ts
ValidationErrorResponseSchema; // 400 - Type.Literal('VALIDATION_ERROR')
UnprocessableEntityResponseSchema; // 422 - Type.String() (any code)
InternalServerErrorResponseSchema; // 500 - Type.String()
```

**Step 4: Check Route Configuration**

```typescript
// Find route registration
fastify.post('/budget-requests', {
  schema: {
    body: CreateBudgetRequestsSchema,
    response: {
      201: BudgetRequestsResponseSchema,
      400: ValidationErrorResponseSchema,  // ← Check this
      422: UnprocessableEntityResponseSchema,
    }
  },
  preValidation: [authenticate]
}, async (request, reply) => { ... });
```

**Step 5: Comprehensive Fix Recommendation**

Provide:

1. **Root cause explanation** with file paths and line numbers
2. **Schema architecture context** (why 400 vs 422 matters)
3. **Specific code changes** with before/after snippets
4. **Testing verification** steps

## Common Error Patterns & Fixes

### Pattern 1: Status Code Mismatch (Haiku)

**Symptom:**

```
Error: USER_NO_DEPARTMENT
statusCode: 400
code: 'USER_NO_DEPARTMENT'
```

**Diagnosis:**

```typescript
// Route schema:
response: {
  400: ValidationErrorResponseSchema  // Expects code: 'VALIDATION_ERROR' only
}
```

**Fix:**

```typescript
// Service layer - Change statusCode
error.statusCode = 422; // Not 400
error.code = 'USER_NO_DEPARTMENT'; // OK for 422
throw error;
```

**Reasoning:**

- 400 = Input validation errors (wrong format, missing required fields)
- 422 = Business logic errors (valid input, but business rules failed)

### Pattern 2: Missing Required Fields (Haiku)

**Symptom:**

```
FST_ERR_FAILED_ERROR_SERIALIZATION: success is required!
```

**Diagnosis:**
Error object missing required schema fields.

**Fix:**

```typescript
// Use reply.error() helper (includes all required fields)
return reply.error('ERROR_CODE', 'Error message', 422);

// Or throw proper error structure
const error = new Error('Message') as any;
error.statusCode = 422;
error.code = 'ERROR_CODE';
throw error; // error-handler.plugin.ts will format correctly
```

### Pattern 3: Null Handling (Haiku)

**Symptom:**
TypeBox validation fails on `null` value in request body.

**Diagnosis:**

```typescript
// Schema:
department_id: Type.Optional(Type.Integer()); // Only accepts integer or undefined, NOT null
```

**Fix:**

```typescript
// Accept null explicitly
department_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()]));
```

### Pattern 4: preValidation Hook Errors (Sonnet)

**Symptom:**
Request hangs/times out without response.

**Diagnosis:**
Throwing error in preValidation hook causes timeout.

**CRITICAL FIX:**

```typescript
// ❌ WRONG: Never throw in preValidation
async preValidation(request, reply) {
  if (!user.department_id) {
    throw new Error('No department');  // ← Request hangs!
  }
}

// ✅ CORRECT: Return reply
async preValidation(request, reply) {
  if (!user.department_id) {
    return reply.forbidden('No department access');  // ← Properly returns
  }
}
```

**Reference:**
See `apps/api/src/core/auth/strategies/auth.strategies.ts` for correct patterns.

### Pattern 5: Schema Literal vs String (Haiku)

**Symptom:**
Custom error code rejected by schema.

**Diagnosis:**

```typescript
// Schema uses Type.Literal()
error: {
  code: Type.Literal('VALIDATION_ERROR'); // Only accepts this exact string
}

// Error thrown with different code
error.code = 'USER_NO_DEPARTMENT'; // ❌ Rejected
```

**Fix Options:**

**Option A**: Change error status code to use flexible schema

```typescript
error.statusCode = 422; // UnprocessableEntityResponseSchema accepts Type.String()
```

**Option B**: Update schema to accept multiple literals

```typescript
code: Type.Union([Type.Literal('VALIDATION_ERROR'), Type.Literal('USER_NO_DEPARTMENT'), Type.Literal('MISSING_FIELD')]);
```

**Recommendation**: Use Option A (change status code) to maintain standard error patterns across project.

## Debug Checklist

Use this systematic approach:

```markdown
### 1. Error Information Gathering

- [ ] Copy full error message from logs
- [ ] Note the endpoint (method + path)
- [ ] Note the status code mentioned
- [ ] Note the error code (if any)

### 2. Identify Complexity (Model Selection)

- [ ] Is it a known pattern (400 vs 422)? → Haiku
- [ ] Does error code not match schema literal? → Haiku
- [ ] Is error source unknown/nested? → Sonnet
- [ ] Does it involve custom error handlers? → Sonnet

### 3. Quick Checks (Haiku - 30 seconds)

- [ ] Read route file response schemas
- [ ] Check error thrown statusCode vs schema statusCode
- [ ] Compare error.code vs schema code definition
- [ ] Is fix obvious (status code change)? → Apply fix

### 4. Deep Investigation (Sonnet - if needed)

- [ ] Grep for error source location
- [ ] Read error-handler.plugin.ts
- [ ] Read base.schemas.ts
- [ ] Trace error propagation path
- [ ] Analyze schema inheritance
- [ ] Provide comprehensive fix with reasoning

### 5. Apply Fix

- [ ] Modify service/route/schema as needed
- [ ] Explain why fix works
- [ ] Reference project standards

### 6. Verify

- [ ] Confirm error matches response schema
- [ ] Check HTTP status code semantics
- [ ] Ensure consistency with project patterns
```

## File Locations Reference

### Core Files

```
apps/api/src/schemas/base.schemas.ts          # Base response schemas
apps/api/src/plugins/error-handler.plugin.ts  # Global error serialization
apps/api/src/plugins/response-handler.plugin.ts  # reply.error() helper
```

### Domain Routes

```
apps/api/src/layers/domains/[domain]/[feature]/[feature].routes.ts
apps/api/src/layers/domains/[domain]/[feature]/[feature].service.ts
apps/api/src/layers/domains/[domain]/[feature]/[feature].schemas.ts
```

### Search Commands

```bash
# Find error source
grep -rn "ERROR_CODE_NAME" apps/api/src

# Find route definition
grep -rn "fastify.post.*budget-requests" apps/api/src

# Find schema definition
grep -rn "ValidationErrorResponseSchema" apps/api/src
```

## Output Format

### Quick Fix (Haiku)

````markdown
## Fastify Error Debug - Quick Fix

**Error Pattern:** Status code mismatch
**Location:** apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts:118
**Problem:** Business logic error using 400 (validation) status code

**Fix:**

```typescript
// Line 118 - Change statusCode
error.statusCode = 422; // Change from 400 to 422
```
````

**Reasoning:**

- 400 = Input validation errors, schema expects code: 'VALIDATION_ERROR'
- 422 = Business logic errors, schema accepts any error code
- USER_NO_DEPARTMENT is business logic (user exists but has no department)

````

### Deep Analysis (Sonnet)
```markdown
## Fastify Error Debug - Comprehensive Analysis

**Error:** FST_ERR_FAILED_ERROR_SERIALIZATION
**Endpoint:** POST /api/inventory/budget/budget-requests
**Status Code:** 400

### Error Trace
1. Request received at route: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.routes.ts:45`
2. Calls service method: `budgetRequestsService.create()`
3. Service throws error: `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts:113`
   ```typescript
   const error = new Error('USER_NO_DEPARTMENT: ...') as any;
   error.statusCode = 400;  // ← Problem here
   error.code = 'USER_NO_DEPARTMENT';
   throw error;
````

4. Error handler plugin catches: `apps/api/src/plugins/error-handler.plugin.ts:211`
5. Attempts to serialize with route schema:
   ```typescript
   response: {
     400: ValidationErrorResponseSchema  // Expects code: 'VALIDATION_ERROR'
   }
   ```
6. Serialization fails: error.code='USER_NO_DEPARTMENT' doesn't match Type.Literal('VALIDATION_ERROR')

### Schema Analysis

**ValidationErrorResponseSchema** (apps/api/src/schemas/base.schemas.ts:123)

```typescript
error: {
  code: Type.Literal('VALIDATION_ERROR'),  // ← Only accepts this exact string
  statusCode: Type.Literal(400),
}
```

**UnprocessableEntityResponseSchema** (apps/api/src/schemas/base.schemas.ts:145)

```typescript
error: {
  code: Type.String(),  // ← Accepts any string
  statusCode: Type.Literal(422),
}
```

### Root Cause

Business logic error (user has no department) incorrectly uses statusCode 400, which is reserved for input validation errors only.

### Recommended Fix

**File:** `apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts`
**Line:** 118

```typescript
// Before:
error.statusCode = 400;

// After:
error.statusCode = 422;
```

### HTTP Status Code Semantics

- **400 Bad Request**: Client sent invalid input (wrong format, type, missing required fields)
  - Example: `{"fiscal_year": "invalid"}` (string instead of integer)
  - Error code must be 'VALIDATION_ERROR'

- **422 Unprocessable Entity**: Client sent valid input, but business logic rejects it
  - Example: User exists but has no department assigned
  - Can use any descriptive error code

### Project Standard

This project uses strict error code conventions:

- 400 responses MUST have code='VALIDATION_ERROR'
- 422 responses can have any descriptive error code
- Defined in `apps/api/src/schemas/base.schemas.ts`

### Testing

After fix, test with:

```bash
curl -X POST http://localhost:3383/api/inventory/budget/budget-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fiscal_year": 2568, "department_id": null}'
```

Expected response:

```json
{
  "success": false,
  "error": {
    "code": "USER_NO_DEPARTMENT",
    "message": "You are not assigned to a department...",
    "statusCode": 422
  }
}
```

````

## Related Documentation

- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
- [Error Handling Guide](../../../docs/guides/development/error-handling.md)

## Error Prevention Tips

### For Developers

1. **Use correct status codes:**
   - 400: Input validation (format, type, required fields)
   - 422: Business logic (valid input, business rules failed)
   - 500: Unexpected errors

2. **Use reply helpers:**
   ```typescript
   return reply.error('ERROR_CODE', 'Message', 422);
   // Automatically formats correctly
````

3. **Never throw in preValidation:**

   ```typescript
   // ❌ Wrong
   throw new Error('...');

   // ✅ Correct
   return reply.forbidden('...');
   ```

4. **Accept null explicitly if needed:**

   ```typescript
   Type.Optional(Type.Union([Type.Integer(), Type.Null()]));
   ```

5. **Read API logs first, don't guess:**
   - Check actual error object structure
   - Compare with route response schema
   - Trace error source before fixing
