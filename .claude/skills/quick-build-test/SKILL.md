---
name: quick-build-test
description: Build และทดสอบโปรเจคแบบรวดเร็ว ตรวจสอบ TypeScript errors และรัน tests พื้นฐาน
invocable: true
---

# Quick Build & Test Skill

Build โปรเจคและรัน tests พื้นฐานอย่างรวดเร็วเพื่อตรวจสอบว่าโค้ดทำงานถูกต้อง

## When to Use

ใช้ skill นี้เมื่อ:

- ก่อน commit โค้ด (MANDATORY!)
- หลังสร้าง/แก้ไขโค้ด
- หลัง generate CRUD module ใหม่
- ต้องการตรวจสอบ TypeScript errors
- ต้องการทดสอบว่า API ทำงานได้

## What It Does

1. ✅ Clean build artifacts
2. ✅ Run TypeScript compilation
3. ✅ Check for type errors
4. ✅ Verify imports are correct
5. ✅ (Optional) Run unit tests
6. ✅ (Optional) Test API endpoints
7. ✅ Generate build report

## Instructions

### Basic Build & Test Workflow

1. **Clean previous build**

   ```bash
   rm -rf dist/ apps/*/dist/ libs/*/dist/
   ```

2. **Install dependencies (if needed)**

   ```bash
   pnpm install
   ```

3. **Run build**

   ```bash
   pnpm run build
   ```

4. **Check build status**
   - If successful → Continue
   - If failed → Show errors and stop

5. **Optional: Run tests**

   ```bash
   pnpm test
   ```

6. **Generate report**

## Build Report Format

```markdown
# Build & Test Report

## 🏗️ Build Status

**Status:** [✅ SUCCESS | ❌ FAILED]
**Duration:** [X] seconds
**Timestamp:** [datetime]

## 📦 Build Output

### API (apps/api)

- [x] TypeScript compilation: ✅ Success
- [x] No type errors
- [x] All imports resolved
- [x] Build size: [XX] MB

### Web (apps/web)

- [x] TypeScript compilation: ✅ Success
- [x] Angular build: ✅ Success
- [x] No template errors
- [x] Build size: [XX] MB

### Libraries

- [x] @aegisx/ui: ✅ Built
- [x] Other libs: ✅ Built

## 🧪 Test Results

[If tests were run]

### Unit Tests

- Total: [X] tests
- Passed: [X]
- Failed: [X]
- Skipped: [X]

### Coverage

- Statements: [X]%
- Branches: [X]%
- Functions: [X]%
- Lines: [X]%

## ⚠️ Issues Found

[If any issues]

### TypeScript Errors
```

[error details]

```

### Build Warnings
```

[warning details]

```

## ✅ Summary

**Ready to commit?** [YES | NO]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
```

## Example Output: Success

```markdown
# Build & Test Report

## 🏗️ Build Status

**Status:** ✅ SUCCESS
**Duration:** 45.2 seconds
**Timestamp:** 2024-12-20 15:30:45

## 📦 Build Output

### API (apps/api)

- [x] TypeScript compilation: ✅ Success (0 errors)
- [x] No type errors
- [x] All imports resolved
- [x] Build size: 12.3 MB
- [x] Output: `dist/apps/api`

### Web (apps/web)

- [x] TypeScript compilation: ✅ Success
- [x] Angular build: ✅ Success
- [x] No template errors
- [x] Build size: 8.7 MB
- [x] Output: `dist/apps/web`

### Libraries

- [x] @aegisx/ui: ✅ Built (2.1 MB)
- [x] @aegisx/shared: ✅ Built (0.5 MB)

## 🧪 Test Results

### API Tests

- Total: 156 tests
- Passed: 156 ✅
- Failed: 0
- Duration: 8.2s

### Web Tests

- Total: 89 tests
- Passed: 89 ✅
- Failed: 0
- Duration: 5.1s

### Coverage

- Statements: 87.5%
- Branches: 82.3%
- Functions: 89.1%
- Lines: 87.8%

## ✅ Summary

**Ready to commit?** ✅ YES

**All checks passed!** You can safely commit your changes.

**Next steps:**

1. Review git status
2. Add specific files to git
3. Commit with proper message
4. Push to remote
```

## Example Output: Failed

```markdown
# Build & Test Report

## 🏗️ Build Status

**Status:** ❌ FAILED
**Duration:** 12.3 seconds
**Timestamp:** 2024-12-20 15:35:12

## ⚠️ TypeScript Errors Found

### apps/api/src/modules/inventory/drug-catalog.service.ts
```

Line 45: Type 'string' is not assignable to type 'UUID'.
const id: UUID = 'invalid-uuid';
^^^^^^^^^^^^^^^

Line 67: Property 'findByCode' does not exist on type 'DrugCatalogRepository'.
await this.repo.findByCode(code);
^^^^^^^^^^

Line 89: Argument of type 'number' is not assignable to parameter of type 'string'.
await this.updateQuantity(123);
^^^

```

### apps/web/src/app/modules/inventory/drug-catalog-list.component.ts

```

Line 23: Cannot find name 'Item'. Did you mean 'items'?
const item: Item = { id: '123' };
^^^^

Line 34: Property 'loadData' is private and only accessible within class 'DrugCatalogListComponent'.
this.loadData();
^^^^^^^^

````

## 📦 Partial Build Output

### API (apps/api)
- [ ] TypeScript compilation: ❌ FAILED (4 errors)
- Build stopped due to errors

### Web (apps/web)
- [ ] TypeScript compilation: ❌ FAILED (2 errors)
- Build stopped due to errors

## ❌ Cannot Proceed

**Ready to commit?** ❌ NO

**Required fixes:**

1. **Fix UUID type error (drug-catalog.service.ts:45)**
   ```typescript
   // Wrong
   const id: UUID = 'invalid-uuid';

   // Correct
   const id: string = 'valid-uuid-format';
   // or use proper UUID validation
````

2. **Add missing method (drug-catalog.service.ts:67)**

   ```typescript
   // Add to DrugCatalogRepository
   async findByCode(code: string): Promise<DrugCatalog | undefined> {
     return this.db('inventory.drug_catalogs').where({ code }).first();
   }
   ```

3. **Fix type mismatch (drug-catalog.service.ts:89)**

   ```typescript
   // Wrong
   await this.updateQuantity(123);

   // Correct
   await this.updateQuantity('123');
   ```

4. **Import missing type (drug-catalog-list.component.ts:23)**

   ```typescript
   import { Item } from '@/types/item';
   ```

5. **Fix access modifier (drug-catalog-list.component.ts:34)**
   ```typescript
   // Change private to public or protected
   public async loadData() { ... }
   ```

**Next steps:**

1. Fix all TypeScript errors listed above
2. Run build again: `pnpm run build`
3. Verify all errors are resolved
4. Then commit

````

## Quick Commands Reference

```bash
# Full build
pnpm run build

# Build specific app
pnpm run build:api
pnpm run build:web

# Clean and build
rm -rf dist/ && pnpm run build

# Build with watch mode (development)
pnpm run dev:api    # API with hot reload
pnpm run dev:admin  # Admin frontend

# Run tests
pnpm test           # All tests
pnpm test:api       # API tests only
pnpm test:web       # Frontend tests only

# Run tests with coverage
pnpm test:coverage

# Check TypeScript without building
pnpm run type-check

# Lint code
pnpm run lint
pnpm run lint:fix   # Auto-fix issues
````

## Integration with Git Workflow

This skill should ALWAYS run before commit:

```bash
# 1. Make changes
# ... edit files ...

# 2. Build & test (THIS STEP!)
/quick-build-test

# 3. If build succeeds:
git add specific-files.ts
git commit -m "feat(inventory): add drug catalog CRUD"
git push

# 4. If build fails:
# Fix errors, then repeat from step 2
```

## Common Build Issues

### Issue 1: Missing Dependencies

```bash
# Error: Cannot find module 'xxx'
# Fix: Install dependencies
pnpm install
```

### Issue 2: Port Already in Use

```bash
# Error: Port 3000 is already in use
# Fix: Kill process
lsof -ti:3000 | xargs kill -9
```

### Issue 3: Out of Memory

```bash
# Error: JavaScript heap out of memory
# Fix: Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm run build
```

### Issue 4: Cache Issues

```bash
# Error: Stale build cache
# Fix: Clean and rebuild
rm -rf dist/ node_modules/.cache/
pnpm run build
```

## Advanced Options

### Build with Verbose Output

```bash
pnpm run build --verbose
```

### Build Specific Workspace

```bash
pnpm --filter @aegisx/api run build
pnpm --filter @aegisx/web run build
```

### Parallel Build (faster)

```bash
pnpm run build --parallel
```

### Production Build

```bash
NODE_ENV=production pnpm run build
```

## Performance Tips

1. **Use build cache**: Don't clean unless necessary
2. **Parallel builds**: Build multiple packages simultaneously
3. **Incremental builds**: Only rebuild changed files
4. **Watch mode**: For development, use watch mode instead of full rebuilds

```bash
# Development workflow (faster)
pnpm run dev:api    # Watch mode for API
pnpm run dev:admin  # Watch mode for frontend

# Production workflow (thorough)
pnpm run build      # Full build with optimizations
```

## Pre-Commit Checklist

Before every commit, verify:

- ✅ `pnpm run build` succeeds with 0 errors
- ✅ No TypeScript errors
- ✅ No ESLint errors (if enabled)
- ✅ Tests pass (optional but recommended)
- ✅ No `console.log` in production code
- ✅ Imports are organized
- ✅ No unused variables/imports

Only commit if ALL checks pass!
