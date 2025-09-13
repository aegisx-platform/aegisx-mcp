# Development Quality Assurance Checklist

> **📋 บังคับใช้**: ต้องทำทุกครั้งหลังเขียนโค้ดเสร็จ ก่อนจะ commit

## 🎯 Purpose

เอกสารนี้กำหนดมาตรฐาน Quality Assurance ที่ต้องปฏิบัติทุกครั้งหลังการพัฒนา feature หรือแก้ไขโค้ด เพื่อให้มั่นใจว่าโค้ดมีคุณภาพและไม่ทำลายระบบที่มีอยู่

## 🔄 Standard QA Process

### 🔧 Phase 1: Build & Compilation (บังคับ)

```bash
# 1. Build ทุก project - ต้องผ่าน 100%
nx run-many --target=build --all

# 2. Type checking - ต้องไม่มี type errors
nx run-many --target=typecheck --all
```

**Gate Condition**:

- ❌ **STOP** หาก: มี compilation errors หรือ type errors
- ✅ **GO** หาก: Build successful ทุก project

### 🧹 Phase 2: Code Quality (บังคับ)

```bash
# 3. Lint check - ต้องผ่าน (warnings ได้, errors ไม่ได้)
nx run-many --target=lint --all

# 4. Auto-fix lint issues (ถ้ามี)
nx run-many --target=lint --all --fix
```

**Gate Condition**:

- ❌ **STOP** หาก: มี linting errors
- ✅ **GO** หาก: Linting clean หรือมี warnings เท่านั้น

### 🧪 Phase 3: Automated Testing (บังคับ)

```bash
# 5. Unit tests - ต้องผ่านทุกตัว
nx run-many --target=test --all

# 6. Integration tests (ถ้ามี) - ต้องยังผ่านเหมือนเดิม
npm run test:integration
```

**Gate Condition**:

- ❌ **STOP** หาก: มี test failures
- ✅ **GO** หาก: ทุก test ผ่าน

### 🖱️ Phase 4: Manual Verification (บังคับ)

```bash
# 7. Start development environment
pnpm run docker:up  # Auto-detects instance file
pnpm dev            # Start API + Web
# OR manual:
# pnpm run dev:api    # API only
# pnpm run dev:web    # Web only
# pnpm run dev:admin  # Admin only

# 8. Manual smoke testing
# - ทดสอบ feature ที่เพิ่ง implement
# - ทดสอบ basic user flow ที่เกี่ยวข้อง
# - ตรวจสอบไม่มี console errors
# - ตรวจสอบ API responses ถูกต้อง
```

**Manual Testing Guidelines**:

#### For New Features:

- ✅ Feature ทำงานตาม requirements
- ✅ UI/UX responsive และสวยงาม
- ✅ Form validation ทำงานถูกต้อง
- ✅ Error handling แสดงผลเหมาสม
- ✅ Loading states แสดงผลถูกต้อง

#### For Bug Fixes:

- ✅ Bug ที่แก้หายไปแล้ว
- ✅ ไม่สร้าง regression bugs ใหม่
- ✅ Related features ยังทำงานปกติ

#### Browser Console Check:

- ✅ ไม่มี console errors
- ✅ ไม่มี 404 network errors
- ✅ ไม่มี unhandled promise rejections

**Gate Condition**:

- ❌ **STOP** หาก: Feature ไม่ทำงาน หรือ break existing functionality
- ✅ **GO** หาก: Manual testing ผ่านทั้งหมด

### 🎭 Phase 5: E2E Testing (สำหรับ Critical Features)

```bash
# 9. Run relevant E2E tests
npm run test:e2e:auth        # สำหรับ authentication features
npm run test:e2e:navigation  # สำหรับ navigation features
npm run test:e2e             # Full suite (สำหรับ major changes)

# 10. Visual regression tests (ถ้าเปลี่ยน UI)
npm run test:e2e:visual
```

**E2E Testing Guidelines**:

#### When to Run E2E Tests:

- 🔴 **Critical Features**: Authentication, Payment, Data Loss
- 🟡 **Major Changes**: New modules, API changes, Routing changes
- 🟢 **Minor Changes**: Small UI tweaks, text changes

#### Expected Results:

- 🎯 **Authentication**: 10/10 tests ผ่าน
- 🎯 **Navigation**: 8/8 tests ผ่าน
- 🎯 **Core Features**: 90%+ pass rate

**Gate Condition**:

- ❌ **STOP** หาก: Critical E2E tests fail
- ✅ **GO** หาก: E2E tests ผ่านตามเป้าหมาย

### 📝 Phase 6: Git Workflow (บังคับ)

```bash
# 11. Stage และ commit (หลังผ่าน Phase 1-5)
git add -A
git status  # Review changes
git commit -m "feat: descriptive commit message"

# 12. Push (หลัง pre-push hooks ผ่าน)
git push
```

**Commit Message Standards**:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Build process or auxiliary tool changes

**Gate Condition**:

- ❌ **STOP** หาก: Pre-push hooks fail
- ✅ **GO** หาก: Successfully pushed to remote

## 🚨 Gate Conditions Summary

### ✅ สามารถ Commit ได้เมื่อ:

- ✅ **Build**: All projects build successfully
- ✅ **Types**: No TypeScript errors
- ✅ **Lint**: No linting errors (warnings OK)
- ✅ **Tests**: All unit tests pass
- ✅ **Manual**: Feature works as expected
- ✅ **E2E**: Critical tests pass (if applicable)
- ✅ **No Regressions**: Existing functionality intact

### ❌ ห้าม Commit ถ้ามี:

- ❌ Compilation/build errors
- ❌ TypeScript errors
- ❌ Linting errors
- ❌ Unit test failures
- ❌ Feature ไม่ทำงานตาม requirement
- ❌ Breaking changes to existing features
- ❌ Console errors ที่ไม่คาดหวัง

## 🛠️ Troubleshooting Common Issues

### Build Errors:

```bash
# Clear cache and reinstall
nx reset
yarn install

# Check for missing dependencies
nx list
```

### Type Errors:

```bash
# Check TypeScript configuration
nx run-many --target=typecheck --all --verbose
```

### Lint Errors:

```bash
# Auto-fix most issues
nx run-many --target=lint --all --fix

# Manual review remaining issues
nx run-many --target=lint --all --verbose
```

### Test Failures:

```bash
# Run tests in watch mode for debugging
nx test <project-name> --watch

# Run specific test file
nx test <project-name> --testNamePattern="test name"
```

## 📊 Quality Metrics

### Build Performance Targets:

- **Build Time**: < 5 minutes for all projects
- **Type Check**: < 2 minutes
- **Lint Check**: < 1 minute
- **Unit Tests**: < 3 minutes

### Code Quality Targets:

- **Lint Errors**: 0
- **Type Errors**: 0
- **Unit Test Coverage**: > 80%
- **E2E Pass Rate**: > 90%

## 🔄 Process Enforcement

### Pre-commit Hooks:

- Lint staged files
- Type check changed files
- Run affected unit tests

### Pre-push Hooks:

- Build affected projects
- Run affected tests
- Lint affected projects

### CI/CD Pipeline:

- Build all projects
- Run all tests
- E2E test execution
- Security scanning
- Performance monitoring

---

## 📚 Related Documentation

- [Development Workflow](./development-workflow.md)
- [Testing Strategy](../testing/testing-strategy.md)
- [API-First Workflow](./api-first-workflow.md)
- [Quick Commands](./quick-commands.md)

---

**⚠️ Important**: ไม่มีข้อยกเว้นสำหรับ QA Checklist นี้ - ต้องปฏิบัติทุกครั้งก่อน commit
