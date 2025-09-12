#!/bin/bash

# Fix Dependencies Script
# Repairs common dependency issues in multi-clone development

echo "🔧 Fixing project dependencies..."
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Backup current state
echo -n "Creating backup... "
cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ Done${NC}"

# 2. Clean current state
echo -n "Cleaning node_modules and cache... "
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf libs/*/node_modules
nx reset > /dev/null 2>&1
echo -e "${GREEN}✅ Done${NC}"

# 3. Add missing production dependencies
echo "Adding missing dependencies..."

# Core dependencies that are often missing
DEPS=(
  "winston@3.14.2"
  "winston-daily-rotate-file@5.0.0"
  "prom-client@15.1.3"
  "ioredis@5.4.2"
)

for dep in "${DEPS[@]}"; do
  echo -n "  - Installing $dep... "
  if pnpm install "$dep" --save --save-exact > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
  else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
  fi
done

# 4. Add missing dev dependencies
echo "Adding missing dev dependencies..."

DEV_DEPS=(
  "@types/node@22.10.2"
  "@types/jest@29.5.17"
  "@types/winston@2.4.4"
)

for dep in "${DEV_DEPS[@]}"; do
  echo -n "  - Installing $dep... "
  if pnpm install "$dep" --save-dev --save-exact > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
  else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
  fi
done

# 5. Fix peer dependencies
echo -n "Resolving peer dependencies... "
pnpm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${GREEN}✅ Done${NC}"

# 6. Verify installation
echo "Verifying installation..."
echo -n "  - Checking winston... "
if npm ls winston > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️${NC}"
fi

echo -n "  - Checking prom-client... "
if npm ls prom-client > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️${NC}"
fi

# 7. Test build
echo -n "Testing API build... "
if nx build api > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Success${NC}"
else
  echo -e "${YELLOW}⚠️  Failed - manual intervention needed${NC}"
fi

echo "================================"
echo -e "${GREEN}✅ Dependency fix complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test your build: nx build api"
echo "2. If successful: git add package.json package-lock.json"
echo "3. Commit: git commit -m 'fix: update dependencies for multi-clone compatibility'"
echo ""
echo "If build still fails, check:"
echo "- apps/api/src/main.ts for duplicate imports"
echo "- Type definitions in tsconfig.json"
echo "- Jest configuration in jest.config.ts"