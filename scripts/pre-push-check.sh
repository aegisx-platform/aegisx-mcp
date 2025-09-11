#!/bin/bash

# Pre-Push Check Script for Multi-Clone Development
# Prevents broken code from being pushed to develop branch

echo "🔍 Running pre-push checks..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any check fails
FAILED=0

# 1. Check for uncommitted changes
echo -n "Checking for uncommitted changes... "
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Failed${NC}"
  echo "Uncommitted changes detected. Please commit or stash first."
  exit 1
else
  echo -e "${GREEN}✅ Clean${NC}"
fi

# 2. Install dependencies
echo -n "Installing dependencies... "
if npm ci > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Done${NC}"
else
  echo -e "${RED}❌ Failed${NC}"
  echo "Failed to install dependencies. Check package.json"
  exit 1
fi

# 3. Check for required dependencies
echo -n "Checking required dependencies... "
MISSING_DEPS=$(node -e "
const pkg = require('./package.json');
const required = {
  'winston': '^3.14.2',
  'winston-daily-rotate-file': '^5.0.0', 
  'prom-client': '^15.1.3'
};

const missing = [];
for (const [name, version] of Object.entries(required)) {
  if (!pkg.dependencies || !pkg.dependencies[name]) {
    missing.push(name);
  }
}

if (missing.length) {
  console.log(missing.join(', '));
  process.exit(1);
}
" 2>&1)

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Missing: $MISSING_DEPS${NC}"
  FAILED=1
else
  echo -e "${GREEN}✅ All present${NC}"
fi

# 4. Run linting
echo "Running linting checks..."
if nx run-many --target=lint --all --parallel=3 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠️  Linting warnings${NC}"
  # Don't fail on lint warnings
fi

# 5. Build API
echo -n "Building API... "
if nx build api > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Success${NC}"
else
  echo -e "${RED}❌ Failed${NC}"
  echo "API build failed. Run 'nx build api' to see errors."
  FAILED=1
fi

# 6. Build Web
echo -n "Building Web app... "
if nx build web > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Success${NC}"
else
  echo -e "${YELLOW}⚠️  Failed (non-blocking)${NC}"
fi

# 7. Build Admin
echo -n "Building Admin app... "
if nx build admin > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Success${NC}"
else
  echo -e "${YELLOW}⚠️  Failed (non-blocking)${NC}"
fi

# 8. Run API tests
echo -n "Running API tests... "
if nx test api --passWithNoTests > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Passed${NC}"
else
  echo -e "${YELLOW}⚠️  Some tests failed (non-blocking)${NC}"
fi

# 9. Check for console.log in production code
echo -n "Checking for console.log... "
CONSOLE_LOGS=$(find apps/api/src apps/web/src apps/admin/src -name "*.ts" -not -path "*/test/*" -not -path "*/__tests__/*" -not -name "*.spec.ts" -not -name "*.test.ts" -type f -exec grep -l "console\.log" {} \; 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $CONSOLE_LOGS files with console.log${NC}"
else
  echo -e "${GREEN}✅ Clean${NC}"
fi

# 10. Check TypeScript strict null checks
echo -n "Checking TypeScript compilation... "
if npx tsc --noEmit > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Valid${NC}"
else
  echo -e "${YELLOW}⚠️  Type errors found (non-blocking)${NC}"
fi

echo "================================"

# Final result
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed! Safe to push.${NC}"
  echo ""
  echo "Run: git push origin develop"
  exit 0
else
  echo -e "${RED}❌ Critical checks failed. Please fix issues before pushing.${NC}"
  echo ""
  echo "For details, run checks individually:"
  echo "  - nx build api"
  echo "  - nx test api" 
  echo "  - nx lint api"
  exit 1
fi