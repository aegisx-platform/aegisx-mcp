# Fastify Error Debug Checklist

Use this systematic checklist when debugging Fastify errors.

## Step 1: Error Information Gathering

### User-Provided Information

- [ ] Error message/type: ******\_\_\_******
- [ ] Endpoint (method + path): ******\_\_\_******
- [ ] HTTP status code (if any): ******\_\_\_******
- [ ] Error code (if any): ******\_\_\_******
- [ ] Request payload (if applicable): ******\_\_\_******

### Log Information

- [ ] Read API server logs
- [ ] Identify exact error message
- [ ] Note timestamp of error
- [ ] Check if error is consistent or intermittent

### Error Classification

- [ ] `FST_ERR_FAILED_ERROR_SERIALIZATION` - Schema mismatch
- [ ] `FST_ERR_VALIDATION` - Input validation failure
- [ ] Request timeout - No response sent
- [ ] Wrong status code returned
- [ ] Missing fields in response
- [ ] Other: ******\_\_\_******

## Step 2: Determine Complexity (Model Selection)

### Use Haiku if ANY of these are true:

- [ ] Error message clearly shows status code mismatch (e.g., 400 with custom error code)
- [ ] Known pattern from REFERENCE.md (400 vs 422, null handling, etc.)
- [ ] Simple schema fix (Union type, Optional, etc.)
- [ ] Template-based solution obvious

### Use Sonnet if ANY of these are true:

- [ ] Error source is unknown or deeply nested
- [ ] Multiple files involved in error propagation
- [ ] Custom error handlers or middleware involved
- [ ] Complex schema inheritance/composition
- [ ] Need to understand architectural decisions
- [ ] Unknown error pattern requiring investigation

**Selected Model:** ******\_\_\_****** (Haiku / Sonnet)

## Step 3: Quick Analysis (Haiku Path)

### Route Analysis

- [ ] Located route file: ******\_\_\_******
- [ ] Read route definition
- [ ] Identified response schemas:
  - [ ] 200: ******\_\_\_******
  - [ ] 400: ******\_\_\_******
  - [ ] 422: ******\_\_\_******
  - [ ] Other: ******\_\_\_******

### Error Property Check

- [ ] Error statusCode: ******\_\_\_******
- [ ] Error code: ******\_\_\_******
- [ ] Error message: ******\_\_\_******
- [ ] Error details: ******\_\_\_******

### Schema Comparison

- [ ] Route schema for statusCode **\_ expects code: ******\_********
- [ ] Actual error code is: ******\_\_\_******
- [ ] **Mismatch identified:** Yes / No
- [ ] **Mismatch type:**
  - [ ] Status code wrong (400 vs 422)
  - [ ] Error code doesn't match literal
  - [ ] Missing required field
  - [ ] Other: ******\_\_\_******

### Quick Fix Identification

- [ ] **Fix type:**
  - [ ] Change statusCode (from **_ to _**)
  - [ ] Change error code (from **_ to _**)
  - [ ] Update schema (add Union/Optional/etc.)
  - [ ] Use reply.error() helper
  - [ ] Other: ******\_\_\_******

- [ ] **File to modify:** ******\_\_\_******
- [ ] **Line number:** ******\_\_\_******
- [ ] **Before:** ******\_\_\_******
- [ ] **After:** ******\_\_\_******

**If fix is clear, STOP HERE and provide Quick Fix output.**

## Step 4: Deep Investigation (Sonnet Path)

### Error Source Tracing

- [ ] Used grep to find error throw location: ******\_\_\_******
- [ ] Read service/controller code
- [ ] Traced error propagation:
  1. Error thrown at: ******\_\_\_******
  2. Caught/handled at: ******\_\_\_******
  3. Serialized by: ******\_\_\_******
  4. Failed at: ******\_\_\_******

### File Reading

- [ ] Read error-handler.plugin.ts
- [ ] Read base.schemas.ts
- [ ] Read domain service file
- [ ] Read domain route file
- [ ] Read domain schema file
- [ ] Other files: ******\_\_\_******

### Schema Hierarchy Analysis

- [ ] Base schema: ******\_\_\_******
- [ ] Domain schema extends: ******\_\_\_******
- [ ] Response schema composition: ******\_\_\_******
- [ ] Schema constraints identified:
  - Type.Literal restrictions: ******\_\_\_******
  - Required fields: ******\_\_\_******
  - Optional fields: ******\_\_\_******
  - Union types: ******\_\_\_******

### Root Cause Identification

- [ ] **Root cause:** ******\_\_\_******
- [ ] **Why it happens:** ******\_\_\_******
- [ ] **Files involved:**
  1. ***
  2. ***
  3. ***

### Comprehensive Fix Design

- [ ] **Primary fix:**
  - File: ******\_\_\_******
  - Line: ******\_\_\_******
  - Change: ******\_\_\_******

- [ ] **Alternative approaches:**
  1. ***
  2. ***

- [ ] **Recommended approach:** ******\_\_\_******
- [ ] **Reasoning:** ******\_\_\_******

## Step 5: Fix Application

### Code Changes

- [ ] Identified all files to modify:
  1. ***
  2. ***
  3. ***

- [ ] Applied fix with before/after snippets
- [ ] Explained reasoning for each change
- [ ] Referenced project standards

### Testing Plan

- [ ] Provided curl command for testing
- [ ] Defined expected response format
- [ ] Suggested verification steps

## Step 6: Output Generation

### Quick Fix Output (Haiku)

- [ ] Error pattern identified
- [ ] Location provided (file:line)
- [ ] Problem described (1 sentence)
- [ ] Fix shown with before/after
- [ ] Reasoning explained (3-5 bullets)
- [ ] Expected result shown

### Deep Analysis Output (Sonnet)

- [ ] Error trace provided (step by step)
- [ ] Schema analysis included
- [ ] Root cause explained comprehensively
- [ ] Recommended fix with file:line
- [ ] Alternative approaches listed
- [ ] HTTP semantics explained
- [ ] Project standards referenced
- [ ] Testing section included
- [ ] Prevention tips added

## Step 7: Quality Verification

### Accuracy Check

- [ ] Fix addresses root cause (not just symptoms)
- [ ] Follows project standards and conventions
- [ ] HTTP status code semantics correct
- [ ] Schema changes maintain type safety
- [ ] No breaking changes introduced

### Completeness Check

- [ ] File paths include line numbers
- [ ] Before/after code snippets clear
- [ ] Reasoning explains "why" not just "what"
- [ ] Testing steps provided
- [ ] Prevention tips included (for Sonnet)

### Output Quality

- [ ] Clear and concise (Haiku) or comprehensive (Sonnet)
- [ ] Proper markdown formatting
- [ ] Code snippets properly formatted
- [ ] Links to related docs included
- [ ] User can apply fix immediately

## Common Issues Checklist

### Issue: Can't Find Error Source

- [ ] Tried grep with error code: `grep -rn "ERROR_CODE" apps/api/src`
- [ ] Tried grep with error message: `grep -rn "error message" apps/api/src`
- [ ] Searched for statusCode assignment: `grep -rn "statusCode.*400" apps/api/src`
- [ ] Checked service layer files manually

### Issue: Schema Not Clear

- [ ] Read base.schemas.ts for standard schemas
- [ ] Checked route definition for response schemas
- [ ] Looked for schema imports
- [ ] Traced schema inheritance

### Issue: Multiple Possible Fixes

- [ ] Evaluated each option against project standards
- [ ] Checked HTTP semantics for correct status codes
- [ ] Considered backward compatibility
- [ ] Recommended simplest correct solution

### Issue: Can't Reproduce

- [ ] Asked user for complete request details
- [ ] Checked if error is intermittent
- [ ] Verified environment (dev/staging/prod)
- [ ] Requested fresh logs

## Prevention Checklist

After fixing, ensure user knows:

- [ ] **Status code conventions:**
  - 400 for input validation only (code must be 'VALIDATION_ERROR')
  - 422 for business logic errors (any error code)

- [ ] **TypeBox patterns:**
  - Use Type.Union for null acceptance
  - Use Type.Optional for optional fields

- [ ] **Error handling:**
  - Use reply.error() helper
  - Never throw in preValidation hooks

- [ ] **Debugging process:**
  - Read logs first, don't guess
  - Compare error vs schema
  - Trace error source before fixing

## Notes

Record any insights for future improvements:

```
[Add notes here]
```

## Summary

**Error Type:** ******\_\_\_******
**Model Used:** ******\_\_\_****** (Haiku/Sonnet)
**Time Spent:** ******\_\_\_****** seconds
**Fix Applied:** ******\_\_\_******
**Outcome:** Success / Need More Info / Escalated
