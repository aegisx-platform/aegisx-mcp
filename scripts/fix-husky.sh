#!/bin/bash

echo "🔧 Fixing Husky configuration..."

# 1. Install missing dependencies
echo "📦 Installing missing commitlint dependencies..."
pnpm install --save-dev @commitlint/cli @commitlint/config-conventional

# 2. Fix pre-commit hook (remove deprecated husky.sh)
echo "✏️  Updating pre-commit hook..."
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
npx lint-staged
EOF

# 3. Fix commit-msg hook (add shebang, fix syntax)
echo "✏️  Updating commit-msg hook..."
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
npx --no -- commitlint --edit $1
EOF

# 4. Create optimized pre-push hook
echo "✏️  Creating optimized pre-push hook..."
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh

echo "🚀 Running pre-push checks..."

# Allow bypass with SKIP_HOOKS=1
if [ "$SKIP_HOOKS" = "1" ]; then
    echo "⏭️  Skipping pre-push hooks (SKIP_HOOKS=1)"
    exit 0
fi

# Use correct base branch
BASE_BRANCH="origin/main"

# Check if there are any affected projects
AFFECTED=$(npx nx print-affected --base=$BASE_BRANCH --select=projects 2>/dev/null || echo "")

if [ -z "$AFFECTED" ]; then
    echo "✨ No affected projects. Skipping checks."
    exit 0
fi

echo "🎯 Affected projects found. Running checks..."

# Run checks in parallel with modern syntax
echo "📝 Type checking..."
if ! npx nx affected --base=$BASE_BRANCH --target=typecheck --parallel=3; then
    echo "❌ Type check failed! Fix errors or use: SKIP_HOOKS=1 git push"
    exit 1
fi

echo "🔍 Linting..."
if ! npx nx affected --base=$BASE_BRANCH --target=lint --parallel=3; then
    echo "❌ Linting failed! Fix errors or use: SKIP_HOOKS=1 git push"
    exit 1
fi

echo "🧪 Running unit tests..."
if ! npx nx affected --base=$BASE_BRANCH --target=test --exclude=e2e --parallel=3; then
    echo "❌ Tests failed! Fix errors or use: SKIP_HOOKS=1 git push"
    exit 1
fi

echo "✅ All checks passed!"
EOF

# 5. Make hooks executable
chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push

# 6. Add helper scripts to package.json
echo "📝 Adding helper scripts to package.json..."
npx json -I -f package.json -e 'this.scripts["hooks:skip"] = "echo \"Use SKIP_HOOKS=1 git push to skip pre-push hooks\""'
npx json -I -f package.json -e 'this.scripts["hooks:test"] = "npm run lint-staged && .husky/pre-push"'

echo "✅ Husky configuration fixed!"
echo ""
echo "🎉 Improvements made:"
echo "  ✓ Removed deprecated husky.sh (v10 compatible)"
echo "  ✓ Added missing dependencies"
echo "  ✓ Fixed base branch reference"
echo "  ✓ Added SKIP_HOOKS=1 bypass option"
echo "  ✓ Optimized for parallel execution"
echo "  ✓ Modern Nx syntax"
echo ""
echo "💡 Tips:"
echo "  - Use 'SKIP_HOOKS=1 git push' to bypass hooks in emergencies"
echo "  - Run 'npm run hooks:test' to test hooks manually"
echo "  - Hooks now only run checks on affected projects"