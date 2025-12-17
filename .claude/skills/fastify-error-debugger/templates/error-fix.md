# Error Fix Template

Use this template when providing error fixes.

## Quick Fix (Haiku Model)

```markdown
## Fastify Error Debug - Quick Fix

**Error Pattern:** [Pattern name - e.g., Status code mismatch, Null handling, etc.]
**Location:** [File path:line number]
**Problem:** [One-sentence problem description]

### Fix

\`\`\`typescript
// [File:line] - [What to change]
[Before code] // ❌ Problem

[After code] // ✅ Fix
\`\`\`

### Reasoning

- [Why this error occurred]
- [Why this fix works]
- [HTTP semantics or project standard reference]

### Expected Result

\`\`\`json
{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Error message",
"statusCode": 422
}
}
\`\`\`
```

## Deep Analysis (Sonnet Model)

```markdown
## Fastify Error Debug - Comprehensive Analysis

**Error:** [Error type - e.g., FST_ERR_FAILED_ERROR_SERIALIZATION]
**Endpoint:** [HTTP method + path]
**Status Code:** [Expected status code]

### Error Trace

1. Request received at route: `[file:line]`
2. [Step 2 description]: `[file:line]`
3. Error thrown at: `[file:line]`
   \`\`\`typescript
   [Code snippet showing where error is thrown]
   \`\`\`
4. Error handler processes: `[file:line]`
5. Serialization attempted with schema: `[schema name]`
6. **Failure point**: [What specifically failed]

### Schema Analysis

**[Schema Name]** ([file:line])
\`\`\`typescript
[Schema definition showing the constraint]
\`\`\`

**Why it fails:**
[Explanation of schema constraint vs actual error properties]

### Root Cause

[Comprehensive explanation of why the error occurred]

### Recommended Fix

**File:** `[file path]`
**Line:** [line number]

\`\`\`typescript
// Before:
[Original code]

// After:
[Fixed code]
\`\`\`

**Alternative approaches:**

1. [Option 1 description]
2. [Option 2 description]

**Recommended:** [Which option and why]

### HTTP Status Code Semantics

- **[Status code]**: [When to use this code]
  - Example: [Example scenario]
  - Error code format: [Schema constraint]

### Project Standard

[Reference to project conventions or standards]

- Defined in: `[file path]`
- Related patterns: [List related error patterns]

### Testing

Test the fix:
\`\`\`bash
curl -X [METHOD] http://localhost:[PORT][PATH] \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer [TOKEN]" \\
-d '[JSON PAYLOAD]'
\`\`\`

Expected response:
\`\`\`json
{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Error message",
"statusCode": [code]
}
}
\`\`\`

### Prevention

[Tips to avoid this error in future]
```

## Examples

### Example 1: Status Code Mismatch

```markdown
## Fastify Error Debug - Quick Fix

**Error Pattern:** Status code mismatch
**Location:** apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.service.ts:118
**Problem:** Business logic error using 400 (validation) status code

### Fix

\`\`\`typescript
// Line 118 - Change statusCode
error.statusCode = 400; // ❌ Wrong for business logic

error.statusCode = 422; // ✅ Correct for business logic
\`\`\`

### Reasoning

- 400 = Input validation errors, schema expects code: 'VALIDATION_ERROR'
- 422 = Business logic errors, schema accepts any error code
- USER_NO_DEPARTMENT is business logic (user exists but has no department)

### Expected Result

\`\`\`json
{
"success": false,
"error": {
"code": "USER_NO_DEPARTMENT",
"message": "You are not assigned to a department. Please contact your administrator.",
"statusCode": 422
}
}
\`\`\`
```

### Example 2: Null Handling

```markdown
## Fastify Error Debug - Quick Fix

**Error Pattern:** Null value not accepted by schema
**Location:** apps/api/src/layers/domains/inventory/budget/budgetRequests/budget-requests.schemas.ts:40
**Problem:** Type.Optional() doesn't accept null values

### Fix

\`\`\`typescript
// Line 40 - Accept null explicitly
department_id: Type.Optional(Type.Integer()) // ❌ Only accepts integer or undefined

department_id: Type.Optional(Type.Union([Type.Integer(), Type.Null()])) // ✅ Accepts integer, null, or undefined
\`\`\`

### Reasoning

- Type.Optional() makes field optional (can be undefined)
- But doesn't accept null values
- Frontend might send null explicitly
- Type.Union([Type.Integer(), Type.Null()]) accepts both value and null

### Expected Result

Request with `{"department_id": null}` now validates successfully.
```

### Example 3: preValidation Hook Error

```markdown
## Fastify Error Debug - Comprehensive Analysis

**Error:** Request timeout (no response)
**Endpoint:** POST /api/inventory/items
**Status Code:** (none - request hangs)

### Error Trace

1. Request received at route: `apps/api/src/layers/domains/inventory/items/items.routes.ts:67`
2. preValidation hook executes: `apps/api/src/layers/domains/inventory/items/auth-check.ts:45`
3. Error thrown:
   \`\`\`typescript
   if (!user.department_id) {
   throw new Error('No department access'); // ← Request hangs here!
   }
   \`\`\`
4. **Failure point**: Throwing in preValidation bypasses Fastify error handling

### Root Cause

Fastify preValidation hooks must return a reply object for errors. Throwing errors directly causes the request to hang without sending any response to the client.

### Recommended Fix

**File:** `apps/api/src/layers/domains/inventory/items/auth-check.ts`
**Line:** 45

\`\`\`typescript
// Before:
if (!user.department_id) {
throw new Error('No department access'); // ❌ Causes timeout
}

// After:
if (!user.department_id) {
return reply.forbidden('Department access required'); // ✅ Returns response
}
\`\`\`

### Project Standard

**Never throw in preValidation hooks**

- Reference: `apps/api/src/core/auth/strategies/auth.strategies.ts`
- Always use reply methods: `reply.unauthorized()`, `reply.forbidden()`, etc.

### Testing

Test the fix:
\`\`\`bash
curl -X POST http://localhost:3383/api/inventory/items \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer TOKEN_WITHOUT_DEPARTMENT" \\
-d '{"name": "Test Item"}'
\`\`\`

Expected response (now returns immediately):
\`\`\`json
{
"success": false,
"error": {
"code": "FORBIDDEN",
"message": "Department access required",
"statusCode": 403
}
}
\`\`\`

### Prevention

- Never use `throw` in preValidation, preHandler, or preSerialization hooks
- Always return `reply.[method]()` for error cases
- Test with user tokens missing required permissions
```
