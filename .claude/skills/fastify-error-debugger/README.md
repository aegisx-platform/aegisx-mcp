# Fastify Error Debugger Skill

> **Auto-debug Fastify serialization errors and schema mismatches**

This Claude skill automatically diagnoses and fixes Fastify `FST_ERR_FAILED_ERROR_SERIALIZATION` errors by analyzing error properties vs response schema expectations.

## When This Skill Activates

Claude will automatically use this skill when you:

1. Report `FST_ERR_FAILED_ERROR_SERIALIZATION` error
2. Say API request hangs/times out without response
3. Mention "response ไม่ตรงกับ schema" or "มันไม่มี success key"
4. Show error response that doesn't match documented format

## What This Skill Does

### Quick Diagnosis (Haiku Model)

- ✅ Pattern matching for known errors (400 vs 422 mismatches)
- ✅ Status code suggestions
- ✅ Simple schema fixes
- ⚡ Fast response (seconds)
- 💰 Cost-effective

### Deep Analysis (Sonnet Model)

- 🔍 Traces error source across multiple files
- 🔍 Analyzes complex schema hierarchies
- 🔍 Investigates custom error handlers
- 🔍 Provides comprehensive fix with reasoning
- 📚 Includes project context and best practices

## Example Usage

### Example 1: Simple Status Code Fix (Haiku)

**You say:**

```
Getting FST_ERR_FAILED_ERROR_SERIALIZATION on POST /api/budget-requests
Error: USER_NO_DEPARTMENT
statusCode: 400
```

**Claude diagnoses:**

```
## Quick Fix

**Problem:** Business logic error using 400 status code
**Location:** budget-requests.service.ts:118

**Fix:**
error.statusCode = 422;  // Change from 400 to 422

**Reason:**
- 400 = validation errors (wrong input format)
- 422 = business logic errors (valid input, business rules failed)
- USER_NO_DEPARTMENT is business logic issue
```

### Example 2: Complex Error Tracing (Sonnet)

**You say:**

```
API hangs on POST request, no response after 30 seconds
Endpoint: /api/inventory/items
Getting timeout in browser
```

**Claude investigates:**

```
## Deep Analysis

**Root Cause:** Throwing error in preValidation hook

**Error Trace:**
1. Request hits route: items.routes.ts:67
2. preValidation hook: auth-check.ts:45
3. Throws error instead of returning reply
4. Request hangs - no response sent

**Critical Fix:**
Never throw in preValidation hooks.

Before:
  if (!user.permission) {
    throw new Error('No permission');  // ❌ Causes timeout
  }

After:
  if (!user.permission) {
    return reply.forbidden('No permission');  // ✅ Returns response
  }

**Reference:** apps/api/src/core/auth/strategies/auth.strategies.ts
```

## Common Errors This Skill Fixes

| Error Type           | Symptom                              | Fix                                |
| -------------------- | ------------------------------------ | ---------------------------------- |
| Status code mismatch | `FST_ERR_FAILED_ERROR_SERIALIZATION` | Change 400→422 for business errors |
| Missing fields       | `success is required!`               | Use `reply.error()` helper         |
| Null handling        | TypeBox validation fails             | Use `Type.Union([T, Type.Null()])` |
| Hook errors          | Request timeout                      | Return reply instead of throw      |
| Custom error codes   | Code not accepted                    | Use 422 for custom codes           |

## How to Trigger Manually

If Claude doesn't auto-detect the error:

```
@fastify-error-debugger

I'm getting FST_ERR_FAILED_ERROR_SERIALIZATION on [endpoint]
[paste error details]
```

## Model Selection

The skill automatically chooses the appropriate model:

### Haiku (Fast) - Used For:

- ✓ Known error patterns
- ✓ Status code mismatches
- ✓ Simple schema fixes
- ✓ Template-based solutions

### Sonnet (Deep) - Used For:

- ✓ Unknown/complex errors
- ✓ Multi-file code tracing
- ✓ Custom error handler issues
- ✓ Schema architecture analysis

You don't need to choose - Claude selects automatically based on complexity.

## What Information To Provide

### Minimum Information

1. **Error message**: Copy the exact error from console/logs
2. **Endpoint**: HTTP method + path (e.g., `POST /api/budget-requests`)
3. **Request payload**: What you sent (if applicable)

### Helpful Additional Info

- API log output (if available)
- Browser network tab screenshot
- Expected vs actual response

### Example Good Report

```
Error: FST_ERR_FAILED_ERROR_SERIALIZATION
Endpoint: POST /api/inventory/budget/budget-requests
Payload: {"fiscal_year": 2568, "department_id": null}

Error from logs:
{
  statusCode: 400,
  code: 'USER_NO_DEPARTMENT',
  message: 'You are not assigned to a department'
}
```

## Quick Reference

### Status Codes

- **400**: Input validation errors only, code must be `'VALIDATION_ERROR'`
- **422**: Business logic errors, any error code accepted
- **401**: Authentication errors
- **403**: Authorization errors
- **404**: Not found errors
- **500**: Server errors

### TypeBox Patterns

```typescript
// Optional field (accepts undefined)
field: Type.Optional(Type.Integer());

// Optional + null (accepts undefined or null)
field: Type.Optional(Type.Union([Type.Integer(), Type.Null()]));

// Literal (exact match only)
code: Type.Literal('VALIDATION_ERROR');

// String (any string)
code: Type.String();
```

### Error Handling

```typescript
// ✅ Use reply helper
return reply.error('ERROR_CODE', 'Message', 422);

// ✅ Throw in route handler (auto-formatted)
throw new Error('Business error');

// ❌ Never throw in preValidation
async preValidation() {
  throw new Error('...');  // Causes timeout!
}

// ✅ Return reply in preValidation
async preValidation() {
  return reply.forbidden('...');
}
```

## Related Documentation

- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
- [Error Handling Best Practices](../../../docs/guides/development/error-handling.md)

## Files This Skill Analyzes

### Core Files

- `apps/api/src/schemas/base.schemas.ts` - Response schema definitions
- `apps/api/src/plugins/error-handler.plugin.ts` - Global error handling
- `apps/api/src/plugins/response-handler.plugin.ts` - Reply helpers

### Domain Files

- `apps/api/src/layers/domains/[domain]/[feature]/*.routes.ts`
- `apps/api/src/layers/domains/[domain]/[feature]/*.service.ts`
- `apps/api/src/layers/domains/[domain]/[feature]/*.schemas.ts`

## Debugging Checklist

When you encounter an error:

1. ✅ Copy the EXACT error message
2. ✅ Note the endpoint (method + path)
3. ✅ Check API logs if accessible
4. ✅ Provide request payload
5. ✅ Tell Claude about the error
6. ✅ Let Claude diagnose (don't guess!)

## Tips

### ✅ Do This

- Report errors immediately with details
- Copy error messages exactly
- Let Claude read logs and code
- Trust Claude's analysis
- Apply suggested fixes

### ❌ Don't Do This

- Guess at solutions before diagnosis
- Make random changes hoping it works
- Skip providing error details
- Ignore Claude's reasoning
- Apply partial fixes

## Success Metrics

This skill helps you:

- 🎯 Fix errors 3x faster (auto-diagnosis vs manual debugging)
- 🎯 Understand root causes (not just symptoms)
- 🎯 Learn error patterns (prevent future issues)
- 🎯 Apply project standards correctly

## Feedback

If this skill doesn't work as expected:

1. Check that you provided complete error information
2. Confirm error is Fastify-related (not database, network, etc.)
3. Try triggering manually with `@fastify-error-debugger`
4. Report issues to improve the skill

---

**Last Updated:** 2024-12-17
**Version:** 1.0.0
**Maintained By:** AegisX Platform Team
